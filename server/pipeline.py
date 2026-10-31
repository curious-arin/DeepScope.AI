from server.agents import build_search_agent, build_reader_agent, writer_chain, critic_chain


def run_research_pipeline(topic: str) -> dict:
    state = {}

    # Step 1: Web Research
    print("\n" + "=" * 50)
    print("Step 1: Searching the web...")
    print("=" * 50)

    search_agent = build_search_agent()

    search_result = search_agent.invoke(
        {"messages": [("user", f"Find recent and reliable information about: {topic}")]}
    )

    state["search_results"] = search_result["messages"][-1].content
    print("\nSearch Results:\n", state["search_results"])

    # Step 2: Extract Webpage Content
    print("\n" + "=" * 50)
    print("Step 2: Extracting webpage content...")
    print("=" * 50)

    reader_agent = build_reader_agent()

    reader_result = reader_agent.invoke(
        {
            "messages": [
                (
                    "user",
                    f"Select the most relevant URL from these search results "
                    f"about '{topic}' and extract its detailed content:\n\n"
                    f"{state['search_results'][:800]}",
                )
            ]
        }
    )

    state["scraped_content"] = reader_result["messages"][-1].content
    print("\nScraped Content:\n", state["scraped_content"])

    # Step 3: Generate Research Report
    print("\n" + "=" * 50)
    print("Step 3: Writing research report...")
    print("=" * 50)

    research_data = (
        f"Search Results:\n{state['search_results']}\n\n"
        f"Scraped Content:\n{state['scraped_content']}"
    )

    state["report"] = writer_chain.invoke({"topic": topic, "research": research_data})

    print("\nFinal Research Report:\n", state["report"])

    # Step 4: Evaluate Research Report
    print("\n" + "=" * 50)
    print("Step 4: Reviewing research report...")
    print("=" * 50)

    state["feedback"] = critic_chain.invoke({"topic": topic, "report": state["report"]})

    print("\nCritic Feedback:\n", state["feedback"])

    return state


if __name__ == "__main__":
    research_topic = input("\nEnter a research topic: ")
    run_research_pipeline(research_topic)
