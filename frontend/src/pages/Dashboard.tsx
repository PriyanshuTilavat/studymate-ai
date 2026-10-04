import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeCards } from "../components/dashboard/ModeCards";
import { StatRow } from "../components/dashboard/StatRow";
import { UploadZone } from "../components/upload/UploadZone";
import { materials } from "../services/mockData";

export default function Dashboard() {
  return <div>
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm text-[var(--muted)]">Good evening, Priyanshu</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[var(--ink)] sm:text-[38px]">Ready to continue learning?</h1></div><Link to="/app/materials?upload=true" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6558d9] px-5 text-sm font-semibold text-white"><Plus className="size-4"/>Upload material</Link></header>
    <div className="mt-9"><StatRow /></div>
    <section className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="section-label">Learning studio</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)]">Choose how you want to study</h2></div></div><ModeCards/></section>
    <section className="mt-12 grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div><div className="mb-5 flex items-center justify-between"><div><p className="section-label">Your materials</p><h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">Pick up where you left off</h2></div><Link to="/app/materials" className="flex items-center gap-1 text-xs font-semibold text-[#6558d9]">View all <ArrowRight className="size-3.5"/></Link></div><div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">{materials.slice(0,2).map(material=><Link to={`/app/materials/${material.id}`} key={material.id} className="flex items-center gap-4 py-4"><span className="grid size-11 place-items-center rounded-xl bg-[#6558d9]/10 text-xs font-bold text-[#6558d9]">{material.type.toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--ink)]">{material.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{material.pages} pages · {material.topics.length} topics</p></div><span className="text-xs font-semibold text-[var(--ink)]">{material.progress}%</span></Link>)}</div></div><div><p className="section-label mb-5">Add new material</p><UploadZone compact/></div></section>
  </div>;
}
