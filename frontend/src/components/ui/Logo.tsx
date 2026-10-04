import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="StudyMate home">
      <span className="relative grid size-10 place-items-center rounded-[14px] bg-[#6c5ce7] text-white shadow-[0_8px_24px_rgba(108,92,231,.25)] transition-transform group-hover:rotate-3">
        <span className="absolute left-2 top-2 h-5 w-4 rounded-sm border-2 border-white/90 border-r-0" />
        <Sparkles className="absolute bottom-1.5 right-1.5 size-3.5" strokeWidth={2.4} />
      </span>
      {!compact && <span className={`text-[20px] font-bold tracking-[-0.04em] ${light ? "text-white" : "text-[var(--ink)]"}`}>StudyMate</span>}
    </Link>
  );
}
