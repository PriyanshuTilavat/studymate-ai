import { Check, FileUp, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { materialService } from "../../services/materialService";
import { Button } from "../ui/Button";

type Stage = "idle" | "reading" | "staged" | "error";

export function UploadZone({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);

  const select = async (file?: File) => {
    if (!file) return;
    setName(file.name); setProgress(0); setStage("reading");
    try { await materialService.stageFile(file, setProgress); setStage("staged"); }
    catch { setStage("error"); }
  };

  if (stage !== "idle") return <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
    <div className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[#6558d9]/10 text-[#6558d9]"><FileUp className="size-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--ink)]">{name}</p><p className="mt-1 text-xs text-[var(--muted)]">{stage === "reading" ? "Reading this file locally..." : stage === "staged" ? "Ready to upload when the API is connected" : "Could not read file"}</p></div>{stage === "reading" ? <LoaderCircle className="size-5 animate-spin text-[#6558d9]" /> : stage === "staged" ? <Check className="size-5 text-emerald-500" /> : <X className="size-5 text-red-500"/>}</div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-gradient-to-r from-[#6558d9] to-[#9489f4] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
    <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]"><span>{progress}%</span><button onClick={() => setStage("idle")} className="font-semibold text-[var(--ink)]">Choose another</button></div>
  </div>;

  return <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files[0]); }} className={`relative flex flex-col items-center justify-center rounded-[26px] border border-dashed p-8 text-center transition ${dragging ? "border-[#6558d9] bg-[#6558d9]/5" : "border-[var(--border-strong)] bg-[var(--surface)]"} ${compact ? "min-h-[250px]" : "min-h-[360px]"}`}>
    <div className="absolute inset-5 rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(108,92,231,.07),transparent_62%)]" />
    <div className="relative z-10 grid size-14 place-items-center rounded-2xl bg-[#6558d9] text-white shadow-[0_12px_32px_rgba(101,88,217,.25)]"><UploadCloud className="size-6" /></div>
    <h3 className="relative z-10 mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">Upload your study material</h3>
    <p className="relative z-10 mt-2 text-sm text-[var(--muted)]">Drop your files here or browse</p>
    <p className="relative z-10 mt-3 text-[11px] font-medium uppercase tracking-[.12em] text-[var(--muted)]">PDF · PPT · DOC · TXT · JPG · PNG</p>
    <input ref={inputRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png" onChange={(event) => select(event.target.files?.[0])} />
    <Button className="relative z-10 mt-6" onClick={() => inputRef.current?.click()}>Browse files</Button>
    <p className="relative z-10 mt-3 text-xs text-[var(--muted)]">or drag and drop</p>
  </div>;
}