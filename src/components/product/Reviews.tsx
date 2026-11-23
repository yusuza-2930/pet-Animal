"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Loader2, Star, MessageSquare } from "lucide-react";
import { Stars } from "@/components/ui/misc";
import { useStore } from "@/components/providers/StoreProvider";

type Review = { id: number; authorName: string; rating: number; title: string; body: string; verifiedPurchase: boolean; createdAt: string };

export function Reviews({ productId, productSlug }: { productId: string; productSlug: string }) {
  const { user, toast } = useStore();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const load = useCallback(() => {
    setLoadError(false);
    fetch(`/api/reviews?productId=${productId}`).then((r) => r.json()).then((d) => setReviews(d.reviews)).catch(() => setLoadError(true));
  }, [productId]);
  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.rating) errs.rating = "Choose a rating from 1 to 5 stars.";
    if (form.title.trim().length < 3) errs.title = "Add a short title (at least 3 characters).";
    if (form.body.trim().length < 20) errs.body = "Tell us a little more (at least 20 characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, ...form }) });
      const d = await r.json();
      if (!r.ok) { setErrors(d.errors ?? { form: d.error }); setState("idle"); return; }
      setState("done");
      toast("Thanks! Your review has been published.");
      load();
    } catch {
      setState("idle");
      setErrors({ form: "Network error — please try again." });
    }
  };

  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mt-16 scroll-mt-28 rounded-[var(--radius-promo)] bg-pale p-5 sm:p-8 lg:p-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 id="reviews-title" className="section-title text-slate">Customer Reviews</h2>
          {reviews && reviews.length > 0 ? (
            <div className="mt-4 flex items-center gap-3"><span className="font-display text-4xl font-extrabold">{avg.toFixed(1)}</span><div><Stars value={avg} size={18} /><p className="text-[13px] text-muted">Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}</p></div></div>
          ) : (
            <p className="mt-3 text-[15px] text-muted">Reviews come only from signed-in customers. We never publish invented or paid reviews.</p>
          )}

          <div className="mt-8 rounded-2xl bg-white p-5">
            {!user ? (
              <div>
                <p className="font-semibold">Share your experience</p>
                <p className="mt-1 text-[14px] text-muted">Sign in to write a review. Reviews from accounts that purchased this item are marked “Verified purchase”.</p>
                <Link href={`/login?next=/products/${productSlug}%23reviews`} className="btn-primary mt-4">Sign in to review</Link>
              </div>
            ) : state === "done" ? (
              <p className="font-semibold text-success" role="status">Your review is live. Thank you for helping other pet parents!</p>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <fieldset className={errors.rating ? "animate-shake" : ""}>
                  <legend className="label">Your rating</legend>
                  <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
                        <input type="radio" name="rating" value={n} className="peer sr-only" checked={form.rating === n} onChange={() => setForm({ ...form, rating: n })} />
                        <Star className={`size-8 rounded transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-slate ${(hover || form.rating) >= n ? "fill-[#F5B544] text-[#F5B544]" : "text-line"}`} aria-hidden />
                        <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
                      </label>
                    ))}
                  </div>
                  {errors.rating && <p className="error-text">{errors.rating}</p>}
                </fieldset>
                <div>
                  <label htmlFor="rv-title" className="label">Title</label>
                  <input id="rv-title" className="field" value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} aria-invalid={!!errors.title} />
                  {errors.title && <p className="error-text">{errors.title}</p>}
                </div>
                <div>
                  <label htmlFor="rv-body" className="label">Your review</label>
                  <textarea id="rv-body" rows={4} className="field" value={form.body} maxLength={2000} onChange={(e) => setForm({ ...form, body: e.target.value })} aria-invalid={!!errors.body} />
                  {errors.body && <p className="error-text">{errors.body}</p>}
                </div>
                {errors.form && <p className="error-text" role="alert">{errors.form}</p>}
                <button type="submit" disabled={state === "loading"} className="btn-primary">{state === "loading" && <Loader2 className="size-4 animate-spin" />}Submit review</button>
              </form>
            )}
          </div>
        </div>

        <div>
          {loadError ? (
            <div className="rounded-2xl bg-white p-6 text-center"><p className="text-muted">We couldn&apos;t load reviews.</p><button onClick={load} className="btn-ghost btn-sm mt-3">Try again</button></div>
          ) : reviews === null ? (
            <div className="space-y-3" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 p-6 text-center">
              <MessageSquare className="size-8 text-muted" aria-hidden />
              <p className="mt-3 font-semibold">No reviews yet</p>
              <p className="text-[14px] text-muted">Be the first to share your experience.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Stars value={r.rating} /><time className="text-[12px] text-muted" dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></div>
                  <p className="mt-2 font-bold">{r.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{r.body}</p>
                  <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-ink">{r.authorName}{r.verifiedPurchase && <span className="inline-flex items-center gap-1 text-success"><BadgeCheck className="size-3.5" aria-hidden />Verified purchase</span>}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
