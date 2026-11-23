"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { DemoNotice } from "@/components/ui/misc";
import { PawIcon } from "@/components/ui/Logo";

type Mode = "login" | "register" | "forgot" | "reset";
const copy: Record<Mode, { title: string; sub: string; cta: string }> = {
  login: { title: "Welcome back", sub: "Sign in to see your orders, wishlist and saved addresses.", cta: "Sign in" },
  register: { title: "Create your account", sub: "Save your cart and wishlist across devices and track orders easily.", cta: "Create account" },
  forgot: { title: "Reset your password", sub: "Enter your account email and we'll create a secure reset link.", cta: "Send reset link" },
  reset: { title: "Choose a new password", sub: "Use at least 8 characters with a letter and a number.", cta: "Update password" },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { refreshUser, toast } = useStore();
  const [v, setV] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ demoLink?: string } | null>(null);
  const next = sp.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: Record<string, string> = {};
    if (mode === "register" && v.name.trim().length < 2) errs.name = "Enter your name.";
    if (mode !== "reset" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errs.email = "Enter a valid email address.";
    if (mode !== "forgot" && !v.password) errs.password = "Enter your password.";
    if ((mode === "register" || mode === "reset") && v.password && (v.password.length < 8 || !/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))) errs.password = "Use at least 8 characters with a letter and a number.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const body = mode === "reset" ? { token: sp.get("token"), password: v.password } : v;
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) { setErrors(d.errors ?? {}); setFormError(d.error ?? null); setLoading(false); return; }
      if (mode === "forgot") { setDone({ demoLink: d.demoLink }); setLoading(false); return; }
      if (mode === "reset") { toast("Password updated — please sign in."); router.push("/login"); return; }
      await refreshUser();
      toast(mode === "register" ? `Welcome, ${v.name.split(" ")[0]}!` : "Signed in successfully");
      router.push(safeNext);
      router.refresh();
    } catch {
      setFormError("Network error — please try again.");
      setLoading(false);
    }
  };

  const c = copy[mode];
  return (
    <div className="container-site grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hero text-coral"><PawIcon className="size-8" /></span>
          <h1 className="mt-5 font-display text-3xl font-extrabold text-slate">{c.title}</h1>
          <p className="mt-2 text-muted">{c.sub}</p>
        </div>
        {done ? (
          <div className="card space-y-4 p-6" role="status">
            <p className="font-semibold">If an account exists for {v.email}, a reset link has been created.</p>
            {done.demoLink ? (
              <DemoNotice>No email provider is configured, so the link is shown here instead of being emailed: <Link href={done.demoLink} className="font-semibold underline">Open reset link</Link> (expires in 1 hour).</DemoNotice>
            ) : (
              <p className="text-[14px] text-muted">Check your inbox for next steps.</p>
            )}
            <Link href="/login" className="btn-ghost w-full">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-7">
            {mode === "register" && (
              <div><label htmlFor="name" className="label">Full name</label><input id="name" autoComplete="name" className="field" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="error-text">{errors.name}</p>}</div>
            )}
            {mode !== "reset" && (
              <div><label htmlFor="email" className="label">Email</label><input id="email" type="email" autoComplete="email" className="field" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email} />{errors.email && <p className="error-text">{errors.email}</p>}</div>
            )}
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between"><label htmlFor="password" className="label">{mode === "reset" ? "New password" : "Password"}</label>{mode === "login" && <Link href="/forgot-password" className="mb-1.5 text-[13px] font-semibold text-slate hover:underline">Forgot password?</Link>}</div>
                <div className="relative">
                  <input id="password" type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field pr-12" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={!!errors.password} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-pale" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>
            )}
            {formError && <p className="rounded-xl bg-error/10 p-3 text-[13px] font-medium text-error" role="alert">{formError}</p>}
            <button className="btn-primary min-h-12 w-full" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}{c.cta}</button>
            <p className="text-center text-[14px] text-muted">
              {mode === "login" ? <>New here? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-slate underline">Create an account</Link></> : <>Already have an account? <Link href="/login" className="font-semibold text-slate underline">Sign in</Link></>}
            </p>
          </form>
        )}
        <p className="mt-6 text-center text-[12px] text-muted">Passwords are hashed with scrypt on our server and never stored in your browser.</p>
      </div>
    </div>
  );
}
