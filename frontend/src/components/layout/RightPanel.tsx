import { ArrowRight, Brain, Clock3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { recentSessions } from "../../services/mockData";

export function RightPanel() {
  return (
    <aside className="hidden w-[292px] shrink-0 border-l border-[var(--border)] bg-[var(--panel)] px-6 py-7 2xl:block">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">Study activity</h2>
      <div className="mt-7 space-y-7">
        <section>
          <p className="section-label">Recent study</p>
          <div className="mt-4 space-y-4">
            {recentSessions.map((session) => <div key={session.id} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#6558d9]/10 text-[#6558d9]"><Clock3 className="size-4" /></span><div><p className="text-sm font-semibold text-[var(--ink)]">{session.materialTitle}</p><p className="text-xs text-[var(--muted)]">{session.mode} mode · {session.occurredAt}</p></div></div>)}
          </div>
        </section>
        <section className="border-t border-[var(--border)] pt-6">
          <p className="section-label">AI memory</p>
          <div className="mt-3 flex gap-3"><Brain className="mt-0.5 size-4 shrink-0 text-[#6558d9]"/><p className="text-sm leading-6 text-[var(--muted)]">You are currently working on <b className="font-semibold text-[var(--ink)]">polymorphism</b>.</p></div>
        </section>
        <section className="rounded-2xl bg-[#262338] p-5 text-white dark:bg-[#171624]">
          <FileText className="size-5 text-[#bcb4ff]" />
          <p className="mt-4 text-xs text-white/55">Continue learning</p>
          <h3 className="mt-1 font-semibold">Java OOP</h3>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[68%] rounded-full bg-[#9c91ff]"/></div>
          <div className="mt-2 flex justify-between text-[11px] text-white/55"><span>68% complete</span><span>28 min left</span></div>
          <Link to="/app/learn" className="mt-5 flex items-center gap-2 text-xs font-semibold text-white">Continue <ArrowRight className="size-3.5"/></Link>
        </section>
      </div>
    </aside>
  );
}
