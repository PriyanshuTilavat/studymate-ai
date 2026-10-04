import { BarChart3, Bell, BookOpen, Brain, GraduationCap, Home, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { cn } from "../../utils/cn";
import { currentUser } from "../../services/mockData";

const primary = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/materials", label: "Materials", icon: BookOpen },
  { to: "/app/learn", label: "Learn", icon: Sparkles },
  { to: "/app/teacher", label: "Teacher", icon: GraduationCap },
  { to: "/app/quiz", label: "Quiz", icon: Brain },
  { to: "/app/progress", label: "Progress", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] px-4 py-6 lg:flex">
      <div className="px-2"><Logo /></div>
      <nav className="mt-10 space-y-1">
        {primary.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-[var(--muted)] transition-all hover:translate-x-0.5 hover:bg-[var(--surface-2)] hover:text-[var(--ink)]", isActive && "bg-[#6558d9]/10 text-[#6558d9] dark:bg-[#8d82ef]/15 dark:text-[#a89ff5]")}>
            <Icon className="size-[18px]" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-[var(--border)] pt-5">
        <NavLink to="/app/notifications" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"><Bell className="size-[18px]" />Notifications</NavLink>
        <NavLink to="/app/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]"><Settings className="size-[18px]" />Settings</NavLink>
      </div>
      <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#ddd8ff] to-[#b9d8ff] text-sm font-bold text-[#5146af]">P</div>
          <div><p className="text-sm font-semibold text-[var(--ink)]">{currentUser.name}</p><p className="text-xs text-[var(--muted)]">Student</p></div>
        </div>
        <NavLink to="/app/settings" className="mt-3 block text-xs font-semibold text-[#6558d9]">View profile</NavLink>
      </div>
    </aside>
  );
}
