import { Outlet } from "react-router-dom";
import { Sidebar } from "../navigation/Sidebar";
import { MobileNav } from "../navigation/MobileNav";
import { RightPanel } from "./RightPanel";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Logo } from "../ui/Logo";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-h-screen lg:pl-[244px]">
        <div className="min-w-0 flex-1">
          <header className="flex h-17 items-center justify-between border-b border-[var(--border)] px-5 lg:justify-end lg:px-8">
            <div className="lg:hidden"><Logo /></div><ThemeToggle />
          </header>
          <main className="mx-auto max-w-[1100px] px-5 py-7 pb-28 sm:px-8 sm:py-10 lg:pb-10"><Outlet /></main>
        </div>
        <RightPanel />
      </div>
      <MobileNav />
    </div>
  );
}