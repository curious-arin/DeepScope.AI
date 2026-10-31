from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print

load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


# Fetch realtime data
@tool
def web_search(query: str) -> str:
    """
    Search the web for recent and reliable information
    on a topic. Returns titles, URLs, and snippets.
    """

    results = tavily.search(query=query, max_results=5)

    out = []

    for result in results["results"]:
        out.append(
            f" Title: {result['title']} \n URL: {result['url']} \n Snippet: {result['content'][:300]}"
        )

    return "\n----------\n".join(out)


@tool
def scrape_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading."""
    try:
        resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        return soup.get_text(separator=" ", strip=True)[:3000]
    except Exception as e:
        return f"Could not scrape URL: {str(e)}"


from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print

load_dotenv()

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


# Search the web for relevant research information
@tool
def search_web(query: str) -> str:
    """
    Search the web for recent, relevant, and reliable information
    related to a given research query.
    Returns the top five search results, including their titles,
    source URLs, and brief content snippets.
    """

    search_results = tavily_client.search(query=query, max_results=5)

    formatted_results = []

    for result in search_results["results"]:
        formatted_results.append(
            f"Title: {result['title']} \n Source URL: {result['url']} \n Content Snippet: {result['content'][:300]}"
        )

    return "\n----------\n".join(formatted_results)


# Extract readable content from a webpage
@tool
def scrape_webpage(url: str) -> str:
    """
    Extract clean, readable text content from a given webpage URL.

    Sends an HTTP request to the specified webpage, parses its HTML
    using BeautifulSoup, and removes unnecessary elements such as
    scripts, styles, navigation bars, and footers.

    Returns up to 3,000 characters of extracted text, making it
    useful for retrieving detailed information from webpages
    identified during the web research process.
    """

    try:
        response = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})

        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()

        return soup.get_text(separator=" ", strip=True)[:3000]

    except Exception as error:
        return f"Unable to extract webpage content: {str(error)}"
