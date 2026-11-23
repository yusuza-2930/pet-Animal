"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { isEmail } from "@/lib/validation";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.name.trim().length < 2) errs.name = "Enter your name.";
    if (!isEmail(v.email)) errs.email = "Enter a valid email address.";
    if (v.subject.trim().length < 3) errs.subject = "Add a subject.";
    if (v.message.trim().length < 10) errs.message = "Your message should be at least 10 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const r = await fetch("/api/forms/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      const d = await r.json();
      if (!r.ok) { setErrors(d.errors ?? { form: "Something went wrong." }); setState("idle"); return; }
      setState("done");
    } catch { setErrors({ form: "Network error — your message was not sent. Please try again." }); setState("idle"); }
  };
  if (state === "done")
    return <div className="card flex items-start gap-3 p-6" role="status"><CheckCircle2 className="size-6 text-success" aria-hidden /><div><p className="font-semibold">Message received — thank you!</p><p className="mt-1 text-[14px] text-muted">Your message has been saved and our team will reply by email.</p></div></div>;
  const f = (k: keyof typeof v, label: string, type = "text") => (
    <div><label htmlFor={`c-${k}`} className="label">{label}</label><input id={`c-${k}`} type={type} className="field" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!errors[k]} />{errors[k] && <p className="error-text">{errors[k]}</p>}</div>
  );
  return (
    <form onSubmit={submit} noValidate className="card grid gap-4 p-6 sm:grid-cols-2">
      {f("name", "Name")}{f("email", "Email", "email")}
      <div className="sm:col-span-2">{f("subject", "Subject")}</div>
      <div className="sm:col-span-2"><label htmlFor="c-message" className="label">Message</label><textarea id="c-message" rows={5} className="field" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!errors.message} />{errors.message && <p className="error-text">{errors.message}</p>}</div>
      {errors.form && <p className="error-text sm:col-span-2" role="alert">{errors.form}</p>}
      <div className="sm:col-span-2"><button className="btn-primary" disabled={state === "loading"}>{state === "loading" && <Loader2 className="size-4 animate-spin" />}Send message</button></div>
    </form>
  );
}
