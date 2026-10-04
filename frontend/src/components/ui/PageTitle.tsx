import type { ReactNode } from "react";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-[34px]">{title}</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
