import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { WeakTopic } from "../../types";

export function WeakTopics({ topics }: { topics: WeakTopic[] }) {
  return <section><div><p className="section-label">Needs revision</p><h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">Build confidence here</h2></div><div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">{topics.map(topic=><div key={topic.name} className="py-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[var(--ink)]">{topic.name}</span><span className="text-xs text-[var(--muted)]">{topic.confidence}%</span></div><div className="mt-3 flex items-center gap-4"><div className="h-1.5 flex-1 rounded bg-[var(--surface-2)]"><div className={`h-full rounded ${topic.confidence<55?"bg-amber-500":"bg-[#6558d9]"}`} style={{width:`${topic.confidence}%`}}/></div><Link to={`/app/learn?topic=${topic.name}`} className="text-[#6558d9]"><ArrowRight className="size-4"/></Link></div></div>)}</div></section>;
}
