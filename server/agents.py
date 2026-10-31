
from langchain.agents import create_agent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from server.tools import search_web, scrape_webpage
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)


# Search Agent
def build_search_agent():
    """Search the web for relevant research sources."""
    return create_agent(model=llm, tools=[search_web])


# Reader Agent
def build_reader_agent():
    """Extract detailed content from webpages."""
    return create_agent(model=llm, tools=[scrape_webpage])


# Writer Chain
writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, factual, and well-structured reports using only the provided research."),
    ("human", """Write a detailed research report.

Topic: {topic}

Research:
{research}

Structure:
- Introduction
- Key Findings (at least 3)
- Conclusion
- Sources (relevant URLs)

Be accurate and professional.""")
])

writer_chain = writer_prompt | llm | StrOutputParser()


# Critic Chain
critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a strict research critic. Evaluate reports based on accuracy, source credibility, completeness, and clarity."),
    ("human", """Review and evaluate the research report carefully.

Topic: {topic}

Report:
{report}

Format:

Score: X/10

Strengths:
- ...

Areas to Improve:
- ...

Verdict:
...

Be specific and objective.""")
])

critic_chain = critic_prompt | llm | StrOutputParser()
