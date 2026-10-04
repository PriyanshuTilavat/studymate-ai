import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("studymate-theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("studymate-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button onClick={() => setDark(!dark)} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--ink)]" aria-label="Toggle dark mode">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
