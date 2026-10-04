import { Grid2X2, List, Search, SlidersHorizontal, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MaterialCard } from "../components/materials/MaterialCard";
import { UploadZone } from "../components/upload/UploadZone";
import { Button } from "../components/ui/Button";
import { PageTitle } from "../components/ui/PageTitle";
import { materials } from "../services/mockData";

export default function Materials() {
  const [params] = useSearchParams(); const [uploading,setUploading] = useState(params.get("upload") === "true"); const [query,setQuery] = useState(""); const [subject,setSubject] = useState("All subjects");
  const visible = useMemo(()=>materials.filter(m=>(subject==="All subjects"||m.subject===subject)&&m.title.toLowerCase().includes(query.toLowerCase())),[query,subject]);
  return <div><PageTitle title="Your materials" subtitle="Everything you've uploaded, organized in one place." action={<Button onClick={()=>setUploading(!uploading)}><Upload className="size-4"/>{uploading?"Close upload":"Upload material"}</Button>}/>{uploading&&<div className="mb-8"><UploadZone/></div>}
    <div className="mb-7 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-3.5 size-4 text-[var(--muted)]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search materials" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[#6558d9]"/></label><select value={subject} onChange={e=>setSubject(e.target.value)} className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)]"><option>All subjects</option>{materials.map(m=><option key={m.id}>{m.subject}</option>)}</select><button className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)]"><SlidersHorizontal className="size-4"/>Recently studied</button><div className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 sm:flex"><button className="rounded-lg bg-[var(--surface-2)] p-2 text-[var(--ink)]"><Grid2X2 className="size-4"/></button><button className="p-2 text-[var(--muted)]"><List className="size-4"/></button></div></div>
    {visible.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(m=><MaterialCard key={m.id} material={m}/>)}</div>:<div className="py-24 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#6558d9]/10 text-[#6558d9]"><Search className="size-6"/></div><h3 className="mt-5 text-lg font-semibold text-[var(--ink)]">No materials found</h3><p className="mt-2 text-sm text-[var(--muted)]">Try a different search or upload your first material.</p></div>}
  </div>;
}
