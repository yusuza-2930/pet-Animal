"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { isEmail } from "@/lib/validation";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [demo, setDemo] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!isEmail(email)) errs.email = "Enter a valid email address.";
    if (!consent) errs.consent = "Please confirm you'd like to receive emails.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const r = await fetch("/api/forms/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent }) });
      const d = await r.json();
      if (!r.ok) { setErrors(d.errors ?? {}); setState("error"); return; }
      setDemo(!!d.demo);
      setState("done");
    } catch {
      setState("error");
      setErrors({ form: "We couldn't reach the server. Please check your connection and try again." });
    }
  };

  if (state === "done")
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-5" role="status">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-semibold">You&apos;re on the list — thank you!</p>
          <p className="mt-1 text-[13px] text-muted">
            {demo ? "Demo mode: your email was saved to our database, but no email provider is configured yet, so no emails will be sent." : "Check your inbox for a welcome note."}
          </p>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input id="nl-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "nl-email-err" : undefined} className="field h-13 rounded-full border-white bg-white px-5" />
        </div>
        <button type="submit" disabled={state === "loading"} className="btn-coral h-13 px-7">
          {state === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}Subscribe
        </button>
      </div>
      {errors.email && <p id="nl-email-err" className="error-text pl-4">{errors.email}</p>}
      <label className={`mt-3 flex items-start gap-2.5 text-[13px] text-muted ${errors.consent ? "animate-shake" : ""}`}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-slate" aria-invalid={!!errors.consent} />
        <span>I agree to receive marketing emails and accept the <a href="/privacy" className="underline">Privacy Policy</a>. Unsubscribe anytime.</span>
      </label>
      {errors.consent && <p className="error-text">{errors.consent}</p>}
      {errors.form && <p className="error-text" role="alert">{errors.form}</p>}
    </form>
  );
}
