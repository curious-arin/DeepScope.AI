
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";

export default function Results({ results }) {
  const [activeTab, setActiveTab] = useState("report");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  if (!results) return null;

  const cleanMarkdown = (content = "") =>
    content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\\\|/g, "|");

  const tabs = [
    { id: "report", label: "Research Report" },
    { id: "feedback", label: "Review & Feedback" },
    { id: "search", label: "Search Results" },
    { id: "content", label: "Scraped Content" },
  ];

  async function downloadReport() {
    if (!reportRef.current) return;

    setDownloading(true);

    const exportNode = reportRef.current.cloneNode(true);

    exportNode.removeAttribute("class");
    exportNode.removeAttribute("style");

    exportNode.querySelectorAll("*").forEach((el) => {
      el.removeAttribute("class");
      el.removeAttribute("style");
    });

    const wrapper = document.createElement("div");

    wrapper.style.cssText = `
      width: 750px;
      padding: 36px;
      background: #ffffff;
      color: #222222;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.7;
    `;

    const style = document.createElement("style");

    style.textContent = `
      h1 {
        font-size: 26px;
        color: #111827;
        margin: 0 0 18px;
      }

      h2 {
        font-size: 20px;
        color: #111827;
        margin: 26px 0 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #dddddd;
      }

      h3 {
        font-size: 16px;
        color: #222222;
        margin: 20px 0 8px;
      }

      p {
        margin: 8px 0;
      }

      ul, ol {
        padding-left: 24px;
        margin: 10px 0;
      }

      li {
        margin: 5px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }

      th, td {
        border: 1px solid #cccccc;
        padding: 8px;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: #eeeeee;
        font-weight: bold;
      }

      blockquote {
        border-left: 3px solid #999999;
        padding-left: 12px;
        color: #555555;
        margin: 12px 0;
      }

      code {
        background: #eeeeee;
        padding: 2px 4px;
        border-radius: 3px;
      }

      pre {
        white-space: pre-wrap;
        overflow-wrap: break-word;
        background: #f5f5f5;
        padding: 12px;
      }

      a {
        color: #155eef;
        overflow-wrap: break-word;
      }

      strong {
        color: #111827;
      }
    `;

    wrapper.appendChild(style);
    wrapper.appendChild(exportNode);
    document.body.appendChild(wrapper);

    try {
      await html2pdf()
        .set({
          margin: 10,
          filename: "DeepScope-Research-Report.pdf",
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["css", "legacy"],
          },
        })
        .from(wrapper)
        .save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      wrapper.remove();
      setDownloading(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Research Results
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Topic: {results.topic}
          </p>
        </div>

        <button
          onClick={downloadReport}
          disabled={downloading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {downloading ? "Generating PDF..." : "↓ Download Report (PDF)"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Research Report */}
      {activeTab === "report" && (
        <div
          ref={reportRef}
          className="rounded-xl bg-white p-8 text-gray-800 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            DeepScope AI — Research Report
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Research Topic: {results.topic}
          </p>

          <article className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanMarkdown(results.report)}
            </ReactMarkdown>
          </article>
        </div>
      )}

      {/* Review and Feedback */}
      {activeTab === "feedback" && (
        <div className="rounded-xl bg-gray-900 p-6 text-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            Review & Feedback
          </h3>

          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {cleanMarkdown(results.feedback)}
          </ReactMarkdown>
        </div>
      )}

      {/* Search Results */}
      {activeTab === "search" && (
        <div className="rounded-xl bg-gray-900 p-6 text-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            Search Results
          </h3>

          <pre className="whitespace-pre-wrap break-words text-sm">
            {typeof results.searchResults === "string"
              ? results.searchResults
              : JSON.stringify(results.searchResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Scraped Content */}
      {activeTab === "content" && (
        <div className="rounded-xl bg-gray-900 p-6 text-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            Scraped Web Content
          </h3>

          <pre className="whitespace-pre-wrap break-words text-sm">
            {typeof results.pageContent === "string"
              ? results.pageContent
              : JSON.stringify(results.pageContent, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
