import { Brain, CheckCircle2, Clock3, Flame } from "lucide-react";

const stats = [
  ["Study time", "2h 24m", Clock3, "+18%"], ["Questions solved", "34", CheckCircle2, "+8 today"], ["Accuracy", "82%", Brain, "+4%"], ["Study streak", "7 days", Flame, "Best: 12"],
] as const;

export function StatRow() {
  return <div className="grid grid-cols-2 border-y border-[var(--border)] py-5 sm:grid-cols-4">
    {stats.map(([label, value, Icon, change], index) => <div key={label} className={`px-3 sm:px-5 ${index > 0 ? "border-l border-[var(--border)]" : ""} ${index > 1 ? "mt-5 border-t pt-5 sm:mt-0 sm:border-t-0 sm:pt-0" : ""}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.1em] text-[var(--muted)]"><Icon className="size-3.5" />{label}</div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)]">{value}</p><p className="mt-1 text-[11px] text-[#6c60d7]">{change}</p>
    </div>)}
  </div>;
}
