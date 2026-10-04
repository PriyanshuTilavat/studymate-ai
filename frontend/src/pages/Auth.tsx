import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { authService } from "../services/authService";

export function AuthPage({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    const values = new FormData(event.currentTarget);
    try {
      if (isSignup && values.get("password") !== values.get("confirm")) throw new Error("Passwords do not match.");
      if (isSignup) await authService.signUp(String(values.get("name")), String(values.get("email")), String(values.get("password")));
      else if (isLogin) await authService.signIn(String(values.get("email")), String(values.get("password")));
      navigate(isLogin || isSignup ? "/app" : "/login");
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
  };
  return <div className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-2">
    <div className="flex min-h-screen flex-col px-6 py-6 sm:px-12"><Logo/><div className="m-auto w-full max-w-[420px] py-12"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft className="size-4"/>Back to home</Link><h1 className="text-4xl font-semibold tracking-[-.05em] text-[var(--ink)]">{isLogin ? "Welcome back" : isSignup ? "Create your account" : "Reset your password"}</h1><p className="mt-3 text-sm text-[var(--muted)]">{isLogin ? "Continue your learning journey." : isSignup ? "Your personal study companion is one step away." : "We'll send a secure reset link to your inbox."}</p>
      <form onSubmit={submit} className="mt-9 space-y-5">{isSignup&&<Field name="name" label="Name" placeholder="Your full name"/>}<Field name="email" label="Email" placeholder="you@example.com" type="email"/>{mode!=="forgot"&&<Field name="password" label="Password" placeholder="At least 6 characters" type="password"/>}{isSignup&&<Field name="confirm" label="Confirm password" placeholder="Repeat your password" type="password"/>}{error&&<p className="text-xs text-red-500">{error}</p>}<button className="h-12 w-full rounded-xl bg-[#6558d9] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(101,88,217,.22)]">{isLogin?"Sign in":isSignup?"Create account":"Send reset link"}</button></form>
      {isLogin&&<><div className="my-6 flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]"/>or<span className="h-px flex-1 bg-[var(--border)]"/></div><button className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--ink)]">Continue with Google</button><Link to="/forgot-password" className="mt-5 block text-center text-xs font-semibold text-[#6558d9]">Forgot password?</Link></>}
      <p className="mt-8 text-center text-xs text-[var(--muted)]">{isLogin?"New to StudyMate? ":"Already have an account? "}<Link className="font-semibold text-[var(--ink)]" to={isLogin?"/signup":"/login"}>{isLogin?"Create an account":"Sign in"}</Link></p>
    </div></div>
    <div className="relative hidden overflow-hidden bg-[#24222d] lg:block"><div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(115,99,237,.32),transparent_35%)]"/><div className="relative flex h-full flex-col justify-end p-16 text-white"><Sparkles className="size-8 text-[#afa6ff]"/><blockquote className="mt-8 max-w-xl text-4xl font-medium leading-tight tracking-[-.04em]">“StudyMate helps me stop rereading and start understanding.”</blockquote><p className="mt-5 text-sm text-white/55">Built for focused, curious students.</p></div></div>
  </div>;
}

function Field({ label, name, type="text", placeholder }: { label:string;name:string;type?:string;placeholder:string }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-[var(--ink)]">{label}</span><div className="relative"><input required name={name} type={type} placeholder={placeholder} className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[#6558d9] focus:ring-4 focus:ring-[#6558d9]/10"/>{type==="password"&&<Eye className="absolute right-4 top-4 size-4 text-[var(--muted)]"/>}</div></label> }