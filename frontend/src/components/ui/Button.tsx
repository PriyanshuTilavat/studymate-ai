import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

type Props = HTMLMotionProps<"button"> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string };

export function Button({ children, variant = "primary", className, ...props }: Props) {
  const variants = {
    primary: "bg-[#6558d9] text-white shadow-[0_8px_20px_rgba(101,88,217,.22)] hover:bg-[#594dc8]",
    secondary: "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
    ghost: "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
  };
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props}>
      {children}
    </motion.button>
  );
}
