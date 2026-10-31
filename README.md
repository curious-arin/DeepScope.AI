# DeepScope AI 🔍

## 🙂 Overview

DeepScope AI is an AI-powered **multi-agent web research system** that transforms a research topic into a detailed, structured, and reviewed report. Built with React, FastAPI, LangChain, Groq, and Tavily, the application uses a four-stage AI research workflow to search the web, extract relevant webpage content, generate research reports, and evaluate their quality.

Users can provide their own Groq API key, Tavily API key, and preferred Groq model name to interact with the research system through a simple web interface.

*The goal is to make online research faster and easier by automating information discovery, content extraction, report writing, and quality review.*

---

## 💡 Problem Statement & Business Impact

- Researching a topic manually often involves searching multiple websites, opening webpages, and collecting relevant information.
- Important insights can be scattered across different sources, making research time-consuming.
- Writing a structured report from collected information requires additional effort.
- **Goal:** Build an AI-powered multi-agent research assistant that searches the web, extracts useful information, generates a detailed report, and reviews the final output.
- **Potential value:** Saves research time, organizes information, simplifies report creation, and provides a structured starting point for further investigation.

---

## 🛠️ Tech Stack

- Python
- React
- Vite
- Tailwind CSS
- FastAPI
- LangChain
- Groq API
- Tavily Search API
- BeautifulSoup
- Requests

---

## 🚀 How to run locally

**1. Clone the repository**

```bash
git clone https://github.com/curious-arin/DeepScope.AI
```

**2. Navigate to the project directory**

```bash
cd DeepScope.AI
```

**3. Create and activate a virtual environment (recommended)**

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

**4. Install backend dependencies**

```bash
pip install -r server/requirements.txt
```

**5. Install frontend dependencies**

```bash
cd client
npm install
```

**6. Run the backend**

Open a terminal in the project root directory:

```bash
uvicorn server.main:app --reload --port 8000
```

**7. Run the frontend**

Open another terminal:

```bash
cd client
npm run dev
```

**8. Open the application**

Visit the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

---

## ▶️ Usage

1. Launch the DeepScope AI application.
2. Generate and enter your [Groq API key](https://console.groq.com/keys).
3. Generate and enter your [Tavily API key](https://app.tavily.com/home).
4. Enter the exact Groq model name you want to use.
5. Authenticate to access the research studio.
6. Enter a research topic and start the workflow.
7. Follow the four research stages as they execute:
   - **Search:** Find relevant web sources using Tavily.
   - **Read:** Extract readable content from the discovered webpages.
   - **Write:** Generate a structured research report using the collected information and Groq.
   - **Review:** Evaluate the report for accuracy, source credibility, completeness, and clarity.
8. Explore the research report, review feedback, search results, and extracted webpage content.
9. Download the generated research report as a PDF.

---

## 🔄 Workflow

```text
Research Topic
      ↓
1. Search — Tavily finds relevant web sources
      ↓
2. Read — Extracts content from webpages
      ↓
3. Write — Groq generates a structured report
      ↓
4. Review — AI evaluates the generated report
      ↓
Final Research Report + Review Feedback
      ↓
Download Report as PDF
```

---

## 📁 Project Structure

```text
DeepScope.AI/
│
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Results.jsx
│   │   │   └── StepTracker.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── ResearchPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                       # FastAPI backend
│   ├── agents.py                  # Research agents and LLM chains
│   ├── main.py                    # API endpoints and workflow stages
│   ├── pipeline.py                # Command-line research pipeline
│   ├── tools.py                   # Web search and webpage extraction
│   └── requirements.txt
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🎯 Use Cases

- Academic and technical research
- Industry and market research
- Technology and trend analysis
- Business research and reports
- Competitive research
- General knowledge discovery

---

## 🔮 Future Improvements

- Add support for multiple AI providers such as OpenAI, Google Gemini, and Mistral AI.
- Add conversational memory and research history management.
- Improve source verification, citation handling, and report accuracy.
- Add advanced multi-agent collaboration and deeper research capabilities.
- Add voice interaction so users can ask research questions and navigate the research workflow using voice commands.