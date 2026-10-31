import { useState } from "react";
import { logout, runStep } from "../api";
import StepTracker from "../components/StepTracker";
import Results from "../components/Results";

const STEPS = ["Search", "Read", "Write", "Review"];
export default function ResearchPage({ session, onSignOut }) {
  const [topic, setTopic] = useState("");
  const [statuses, setStatuses] = useState(STEPS.map(() => "waiting"));
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const setStatus = (i, status) => setStatuses((prev) => prev.map((s, idx) => idx === i ? status : s));
  async function step(i, name, body) {
    setStatus(i, "running");
    try { const data = await runStep(name, session.token, body); setStatus(i, "done"); return data; }
    catch (err) { setStatus(i, "error"); throw err; }
  }
  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setResults(null); setStatuses(STEPS.map(() => "waiting")); setRunning(true);
    const startedAt = Date.now();
    try {
      const search = await step(0, "search", { topic });
      const read = await step(1, "read", { topic, search_results: search.search_results });
      const write = await step(2, "write", { topic, search_results: search.search_results, scraped_content: read.scraped_content });
      const review = await step(3, "review", { topic, report: write.report });
      setResults({ topic, report: write.report, feedback: review.feedback, searchResults: search.search_results, pageContent: read.scraped_content, seconds: Math.round((Date.now() - startedAt) / 1000) });
    } catch (err) { if (err.status === 401) return onSignOut(); setError(err.message); }
    finally { setRunning(false); }
  }
  async function handleSignOut() { await logout(session.token).catch(() => {}); onSignOut(); }
  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#080d17]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3"><span className="brand-mark small"><span>✳</span></span><span className="text-base font-semibold tracking-tight">deepscope<span className="text-cyan-300">.ai</span></span><span className="ml-2 hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-widest text-slate-500 sm:inline">STUDIO</span></div>
          <div className="flex items-center gap-4"><span className="hidden text-xs text-slate-400 sm:inline">Model <span className="ml-1 text-cyan-200">{session.model}</span></span><button onClick={handleSignOut} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-300/30 hover:text-rose-200">Disconnect ↗</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="animate-rise">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium tracking-[.2em] text-cyan-300"><span className="h-px w-7 bg-cyan-300/60" /> YOUR RESEARCH WORKSPACE</div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">What should we <span className="gradient-text">explore today?</span></h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">Give your agent team a question. DeepScope will investigate the web and turn its findings into a reviewed research report.</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card mt-9 rounded-2xl p-3 sm:p-4">
          <label htmlFor="research-topic" className="sr-only">Research topic</label>
          <textarea id="research-topic" rows="3" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How will solid-state batteries change the EV industry by 2030?" required disabled={running} className="w-full resize-y bg-transparent px-3 py-2 text-base leading-7 text-white outline-none placeholder:text-slate-600 disabled:opacity-60" />
          <div className="flex flex-col justify-between gap-3 border-t border-white/[0.07] px-2 pt-3 sm:flex-row sm:items-center"><span className="text-[11px] text-slate-500">Be specific for deeper, more useful findings.</span><button disabled={running || !topic.trim()} className="primary-button rounded-xl px-6 py-3 text-sm font-semibold text-[#061019] disabled:cursor-not-allowed disabled:opacity-50">{running ? <span className="inline-flex items-center gap-2"><span className="spinner" /> Research in progress</span> : <>Run research <span className="ml-2">↗</span></>}</button></div>
        </form>
        {error && <div role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-200">Research pipeline</h2><span className="text-[10px] tracking-widest text-slate-600">4 AGENT STAGES</span></div><StepTracker steps={STEPS} statuses={statuses} /></section>
        {results && <div className="mt-10 animate-rise"><Results results={results} /></div>}
        <footer className="mt-16 border-t border-white/[0.06] pt-5 text-center text-[11px] text-slate-600">DeepScope AI · Search deeply. Think clearly. Report confidently.</footer>
      </main>
    </div>
  );
}
