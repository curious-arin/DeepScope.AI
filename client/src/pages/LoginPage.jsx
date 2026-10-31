import { useState } from "react";
import { login } from "../api";

const field = "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10";
export default function LoginPage({ onSignIn }) {
  const [form, setForm] = useState({ xai_api_key: "", tavily_api_key: "", model: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key) => (e) => setForm((old) => ({ ...old, [key]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await login(form);
      onSignIn({ token: data.token, model: data.model });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
        <a className="flex items-center gap-3" href="#">
          <span className="brand-mark"><span>✳</span></span>
          <span className="text-lg font-semibold tracking-tight">deepscope<span className="text-cyan-300">.ai</span></span>
        </a>
        <span className="hidden rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400 sm:block">MULTI-AGENT RESEARCH STUDIO</span>
      </nav>
      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-14 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-medium text-cyan-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" /> RESEARCH, REIMAGINED
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl xl:text-7xl">
            From curious questions to <span className="gradient-text">clear answers.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            A team of AI agents that searches the web, reads deeply, writes thoughtfully, and reviews every report.
          </p>
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[["01","Search","Discover sources"],["02","Read","Extract insights"],["03","Write","Build the report"],["04","Review","Check the quality"]].map(([n,t,d]) =>
              <div key={n} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:-translate-y-1 hover:border-cyan-300/30">
                <span className="text-xs text-cyan-300">{n}</span><p className="mt-3 text-sm font-semibold">{t}</p><p className="mt-1 text-[11px] text-slate-500">{d}</p>
              </div>)}
          </div>
          <p className="mt-10 text-xs text-slate-600">Your research. Your keys. Your model.</p>
        </section>
        <section className="animate-rise animation-delay-150 mx-auto w-full max-w-md">
          <div className="glass-card rounded-3xl p-7 sm:p-9">
            <div className="mb-7">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-xl text-cyan-200">⌘</div>
              <h2 className="text-2xl font-semibold tracking-tight">Connect your workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Authenticate your providers to unlock the research studio.</p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-200">Groq API Key authentication
                <input className={`${field} mt-2`} type="password" autoComplete="off" placeholder="Enter your groq API key" value={form.xai_api_key} onChange={update("xai_api_key")} required />
                <span className="mt-1.5 block text-[11px] text-slate-500">Used to power your selected Grok model.</span>
              </label>
              <label className="block text-sm font-medium text-slate-200">Tavily API Key authentication
                <input className={`${field} mt-2`} type="password" autoComplete="off" placeholder="Enter your Tavily API key" value={form.tavily_api_key} onChange={update("tavily_api_key")} required />
              </label>
              <label className="block text-sm font-medium text-slate-200">Model name
                <input className={`${field} mt-2`} type="text" autoComplete="off" placeholder="Enter your model name" value={form.model} onChange={update("model")} required />
                <span className="mt-1.5 block text-[11px] text-slate-500">Type the exact model identifier supported by your xAI account.</span>
              </label>
              {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
              <button disabled={loading} className="primary-button w-full rounded-xl px-5 py-4 text-sm font-semibold text-[#061019] disabled:cursor-wait disabled:opacity-60">
                {loading ? <span className="inline-flex items-center gap-2"><span className="spinner" /> Verifying credentials…</span> : <>Authenticate & enter studio <span className="ml-2">↗</span></>}
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500"><span>◈</span> Keys are used by your session to access provider APIs.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
