import { BookOpen, Brain, GraduationCap, Home, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const items = [
  ["/app", "Home", Home], ["/app/materials", "Materials", BookOpen], ["/app/teacher", "Teacher", GraduationCap], ["/app/quiz", "Quiz", Brain], ["/app/settings", "Profile", UserRound],
] as const;

export function MobileNav() {
  return <nav className="fixed inset-x-3 bottom-3 z-50 flex h-16 items-center justify-around rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 px-2 shadow-xl backdrop-blur-xl lg:hidden">
    {items.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => cn("flex min-w-12 flex-col items-center gap-1 text-[10px] text-[var(--muted)]", isActive && "text-[#6558d9]")}><Icon className="size-5" />{label}</NavLink>)}
  </nav>;
}
