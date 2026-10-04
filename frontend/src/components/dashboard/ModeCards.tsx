import { ArrowUpRight, Brain, Check, GraduationCap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const modes = [
  { title: "Learn", description: "Turn your notes into clear, structured study material.", features: ["Smart summaries", "Key concepts", "Quick revision"], to: "/app/learn", action: "Start learning", icon: Sparkles, tone: "purple" },
  { title: "Teacher", description: "Ask anything and learn with your personal AI tutor.", features: ["Explain concepts", "Solve questions", "Step-by-step answers"], to: "/app/teacher", action: "Ask StudyMate", icon: GraduationCap, tone: "blue" },
  { title: "Quiz", description: "Test yourself and discover what you need to revise.", features: ["Mixed question types", "Adaptive difficulty", "Instant feedback"], to: "/app/quiz", action: "Start quiz", icon: Brain, tone: "amber" },
] as const;

const tones = {
  purple: "from-[#f0edff] to-[#e8e4ff] text-[#6255d6] dark:from-[#2b2745] dark:to-[#24213a]",
  blue: "from-[#e9f4ff] to-[#dcecff] text-[#3a74bd] dark:from-[#1c3146] dark:to-[#1b2b3e]",
  amber: "from-[#fff4df] to-[#ffead0] text-[#b66a27] dark:from-[#3d3020] dark:to-[#33291e]",
};

export function ModeCards() {
  return <div className="grid gap-4 xl:grid-cols-3">
    {modes.map((mode, index) => <motion.article key={mode.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 * index }} whileHover={{ y: -5 }} className="group flex min-h-[330px] flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_35px_rgba(30,27,60,.04)] transition-shadow hover:shadow-[0_18px_45px_rgba(68,57,145,.12)]">
      <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[mode.tone]}`}><mode.icon className="size-5" /></div>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">{mode.title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--muted)]">{mode.description}</p>
      <ul className="mt-5 space-y-2.5">{mode.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-xs text-[var(--muted)]"><Check className="size-3.5 text-[#7165dc]" />{feature}</li>)}</ul>
      <Link to={mode.to} className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5 text-sm font-semibold text-[var(--ink)]">{mode.action}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
    </motion.article>)}
  </div>;
}
