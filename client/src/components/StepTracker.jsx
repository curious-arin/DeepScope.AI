const STYLES = {
  waiting: { box: "border-white/[0.08] bg-white/[0.02]", dot: "bg-slate-600", label: "Waiting", text: "text-slate-500" },
  running: { box: "border-cyan-300/40 bg-cyan-300/[0.06]", dot: "bg-cyan-300 animate-pulse", label: "In progress", text: "text-cyan-200" },
  done: { box: "border-emerald-300/25 bg-emerald-300/[0.045]", dot: "bg-emerald-300", label: "Complete", text: "text-emerald-200" },
  error: { box: "border-rose-300/30 bg-rose-300/[0.05]", dot: "bg-rose-300", label: "Failed", text: "text-rose-200" },
};
export default function StepTracker({ steps, statuses }) {
  return <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">{steps.map((name, i) => {
    const style = STYLES[statuses[i]];
    return <li key={name} className={`rounded-2xl border p-4 transition-all duration-300 ${style.box}`}>
      <div className="flex items-center justify-between"><span className="text-[10px] tracking-widest text-slate-600">0{i+1}</span><span className={`h-2 w-2 rounded-full ${style.dot}`} /></div>
      <strong className="mt-4 block text-sm font-semibold text-slate-200">{name}</strong><span className={`mt-1 block text-xs ${style.text}`}>{style.label}</span>
    </li>;
  })}</ol>;
}
