import os
import sys
import uuid
import re
import logging
from pathlib import Path
from typing import Dict

# Ensure project root is importable
PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DeepScope AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://deepscopeai.onrender.com"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory sessions
sessions: Dict[str, dict] = {}


class LoginRequest(BaseModel):
    # Kept for frontend compatibility.
    # This field contains the Groq API key.
    xai_api_key: str
    model: str
    tavily_api_key: str


class StepRequest(BaseModel):
    token: str
    topic: str = ""
    search_results: str = ""
    scraped_content: str = ""
    report: str = ""


def get_session(token: str) -> dict:
    session = sessions.get(token)

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Session expired. Please connect again.",
        )

    return session


def load_backend(session: dict):
    """
    Set credentials before importing modules that initialize
    Groq and Tavily clients at module level.
    """

    os.environ["GROQ_API_KEY"] = session["groq_api_key"]
    os.environ["TAVILY_API_KEY"] = session["tavily_api_key"]

    from tavily import TavilyClient
    from langchain_groq import ChatGroq
    from server import tools, agents

    tavily_client = TavilyClient(api_key=session["tavily_api_key"])

    llm = ChatGroq(
        model=session["model"],
        api_key=session["groq_api_key"],
        temperature=0,
    )

    return tools, agents, llm, tavily_client


def run_step(fn):
    try:
        return fn()

    except HTTPException:
        raise

    except Exception:
        logger.exception("DeepScope workflow failed")

        raise HTTPException(
            status_code=500,
            detail="An internal research workflow error occurred.",
        )


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "service": "DeepScope AI",
    }


@app.post("/api/login")
def login(req: LoginRequest):
    groq_key = req.xai_api_key.strip()
    tavily_key = req.tavily_api_key.strip()
    model = req.model.strip()

    if not groq_key or not tavily_key or not model:
        raise HTTPException(
            status_code=400,
            detail="Enter your Groq API key, model name, and Tavily API key.",
        )

    # Validate Groq credentials and model
    try:
        from langchain_groq import ChatGroq

        ChatGroq(
            model=model,
            api_key=groq_key,
            temperature=0,
            max_tokens=16,
        ).invoke("Reply with OK")

    except Exception as e:
        logger.exception("Groq validation failed")

        raise HTTPException(
            status_code=400,
            detail=f"Groq authentication/model validation failed: {e}",
        )

    # Validate Tavily credentials
    try:
        from tavily import TavilyClient

        TavilyClient(api_key=tavily_key).search(
            query="test",
            max_results=1,
        )

    except Exception as e:
        logger.exception("Tavily validation failed")

        raise HTTPException(
            status_code=400,
            detail=f"Tavily authentication failed: {e}",
        )

    token = uuid.uuid4().hex

    sessions[token] = {
        "groq_api_key": groq_key,
        "tavily_api_key": tavily_key,
        "model": model,
    }

    return {
        "token": token,
        "model": model,
    }


@app.post("/api/logout")
def logout(req: StepRequest):
    sessions.pop(req.token, None)
    return {"ok": True}


# ==========================================
# STEP 1: SEARCH
# ==========================================


@app.post("/api/search")
def step_search(req: StepRequest):

    def work():
        if not req.topic.strip():
            raise HTTPException(
                status_code=400,
                detail="Research topic is required.",
            )

        _, _, _, tavily_client = load_backend(get_session(req.token))

        search_results = tavily_client.search(
            query=req.topic,
            max_results=5,
        )

        formatted_results = []

        for result in search_results.get("results", []):
            formatted_results.append(
                f"Title: {result.get('title', 'Untitled')}\n"
                f"Source URL: {result.get('url', '')}\n"
                f"Content Snippet: {result.get('content', '')[:500]}"
            )

        if not formatted_results:
            raise HTTPException(
                status_code=404,
                detail="No research sources found.",
            )

        return {"search_results": "\n\n----------\n\n".join(formatted_results)}

    return run_step(work)


# ==========================================
# STEP 2: READ
# ==========================================


@app.post("/api/read")
def step_read(req: StepRequest):

    def work():
        if not req.search_results.strip():
            raise HTTPException(
                status_code=400,
                detail="Search results are required.",
            )

        tools, _, _, _ = load_backend(get_session(req.token))

        urls = re.findall(
            r"Source URL:\s*(https?://[^\s]+)",
            req.search_results,
        )

        urls = list(dict.fromkeys(urls))

        if not urls:
            raise HTTPException(
                status_code=404,
                detail="No valid source URLs found.",
            )

        scraped_contents = []

        for url in urls[:5]:
            try:
                content = tools.scrape_webpage.invoke({"url": url})

                if content and not content.startswith(
                    "Unable to extract webpage content:"
                ):
                    scraped_contents.append(
                        f"Source URL: {url}\n\n" f"Extracted Content:\n{content}"
                    )

            except Exception:
                logger.exception(
                    "Failed to scrape source: %s",
                    url,
                )

        if not scraped_contents:
            raise HTTPException(
                status_code=502,
                detail="Unable to extract content from research sources.",
            )

        return {
            "scraped_content": (
                "\n\n"
                + "\n\n========== SOURCE BREAK ==========\n\n".join(scraped_contents)
            )
        }

    return run_step(work)


# ==========================================
# STEP 3: WRITE
# ==========================================


@app.post("/api/write")
def step_write(req: StepRequest):

    def work():
        if not req.search_results.strip() and not req.scraped_content.strip():
            raise HTTPException(
                status_code=400,
                detail="Research material is required.",
            )

        _, agents, llm, _ = load_backend(get_session(req.token))

        from langchain_core.output_parsers import StrOutputParser

        chain = agents.writer_prompt | llm | StrOutputParser()

        research = (
            f"Search Results:\n{req.search_results}\n\n"
            f"Scraped Content:\n{req.scraped_content}"
        )

        report = chain.invoke(
            {
                "topic": req.topic,
                "research": research,
            }
        )

        return {"report": report}

    return run_step(work)


# ==========================================
# STEP 4: REVIEW
# ==========================================


@app.post("/api/review")
def step_review(req: StepRequest):

    def work():
        if not req.report.strip():
            raise HTTPException(
                status_code=400,
                detail="Research report is required.",
            )

        _, agents, llm, _ = load_backend(get_session(req.token))

        from langchain_core.output_parsers import StrOutputParser

        chain = agents.critic_prompt | llm | StrOutputParser()

        feedback = chain.invoke(
            {
                "topic": req.topic,
                "report": req.report,
            }
        )

        return {"feedback": feedback}

    return run_step(work)
