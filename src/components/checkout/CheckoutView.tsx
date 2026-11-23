"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, Lock, ShoppingBag, Banknote } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { formatPrice, priceCart } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import { EMAIL_RE, validateAddress, type FieldErrors } from "@/lib/validation";
import { CouponForm } from "@/components/cart/CouponForm";
import { DemoNotice, EmptyState } from "@/components/ui/misc";

type Addr = { fullName: string; phone: string; line1: string; line2: string; city: string; state: string; postalCode: string };
const emptyAddr: Addr = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" };
type Saved = Addr & { id: number; label: string; isDefault: boolean };

function Field({ id, label, value, onChange, error, autoComplete, type = "text", optional, inputMode, className = "" }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete?: string; type?: string; optional?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}{optional && <span className="font-normal text-muted"> (optional)</span>}</label>
      <input id={id} type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="field" />
      {error && <p id={`${id}-err`} className="error-text">{error}</p>}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="card p-5 sm:p-7">
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-lg font-bold"><span className="grid size-8 place-items-center rounded-full bg-slate text-[14px] text-white">{n}</span>{title}</h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { cart, coupon, hydrated, user, clearCart, toast } = useStore();
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState<Addr>(emptyAddr);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [saveAddr, setSaveAddr] = useState(true);
  const [method, setMethod] = useState("standard");
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { if (user) setEmail((e) => e || user.email); }, [user]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/addresses").then((r) => r.json()).then((d) => {
      const list: Saved[] = (d.addresses ?? []).map((a: Saved) => ({ ...a, line2: a.line2 ?? "" }));
      setSaved(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      if (def) setAddr({ fullName: def.fullName, phone: def.phone, line1: def.line1, line2: def.line2, city: def.city, state: def.state, postalCode: def.postalCode });
    }).catch(() => {});
  }, [user]);

  const t = priceCart(cart, coupon, method);
  const set = (k: keyof Addr) => (v: string) => setAddr((a) => ({ ...a, [k]: v }));

  if (!hydrated) return <div className="container-site py-16"><div className="h-96 animate-pulse rounded-3xl bg-pale" /></div>;
  if (!t.lines.length && submitting) return <div className="container-site py-16"><div className="h-96 animate-pulse rounded-3xl bg-pale" aria-busy="true" /></div>;
  if (!t.lines.length)
    return <div className="container-site py-16"><EmptyState icon={<ShoppingBag className="size-7" />} title="Your cart is empty" text="Add a few essentials before checking out." action={<Link href="/shop" className="btn-primary">Continue shopping</Link>} /></div>;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: FieldErrors = { ...validateAddress(addr) };
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    if (payment !== "cod") errs.payment = "Online card payments aren't available yet. Please choose Cash on Delivery.";
    const stockIssue = t.lines.find((l) => l.variant.stock < l.quantity);
    if (stockIssue) errs.form = `Only ${stockIssue.variant.stock} of ${stockIssue.product.name} available. Please update your cart.`;
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please check the highlighted fields.", "error");
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, address: addr, shippingMethod: method, paymentMethod: payment, coupon, lines: cart }),
      });
      const d = await r.json();
      if (!r.ok) { setErrors(d.errors ?? {}); setFormError(d.error ?? "Please check the highlighted fields."); setSubmitting(false); return; }
      if (user && saveAddr && !saved.some((s) => s.line1 === addr.line1 && s.postalCode === addr.postalCode)) {
        await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...addr, isDefault: saved.length === 0 }) }).catch(() => {});
      }
      sessionStorage.setItem("scp.lastOrder", JSON.stringify({ reference: d.reference, email: d.email }));
      clearCart();
      router.push(`/order-confirmation?ref=${encodeURIComponent(d.reference)}`);
    } catch {
      setFormError("We couldn't reach the server. Your order has not been placed — please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={placeOrder} noValidate className="container-site grid gap-8 py-8 lg:grid-cols-[1fr_400px] lg:py-12">
      <div className="space-y-5">
        <h1 className="font-display text-3xl font-extrabold text-slate">Checkout</h1>
        <DemoNotice>No payment provider is configured, so this store accepts <strong>Cash on Delivery</strong> only. No card details are collected and no online payment is taken. Your order is saved to the database for real.</DemoNotice>

        <Step n={1} title="Contact information">
          <Field id="email" label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} error={errors.email} />
          {!user && <p className="mt-3 text-[13px] text-muted">Have an account? <Link href="/login?next=/checkout" className="font-semibold text-slate underline">Sign in</Link> for saved addresses and order history.</p>}
        </Step>

        <Step n={2} title="Shipping address">
          {saved.length > 0 && (
            <div className="mb-5">
              <label htmlFor="saved" className="label">Saved addresses</label>
              <select id="saved" className="field" onChange={(e) => { const a = saved.find((s) => s.id === Number(e.target.value)); if (a) setAddr({ fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, postalCode: a.postalCode }); }}>
                {saved.map((s) => <option key={s.id} value={s.id}>{s.label} — {s.line1}, {s.city}</option>)}
              </select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" autoComplete="name" value={addr.fullName} onChange={set("fullName")} error={errors.fullName} />
            <Field id="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={addr.phone} onChange={set("phone")} error={errors.phone} />
            <Field id="line1" label="Address line 1" autoComplete="address-line1" value={addr.line1} onChange={set("line1")} error={errors.line1} className="sm:col-span-2" />
            <Field id="line2" label="Address line 2" optional autoComplete="address-line2" value={addr.line2} onChange={set("line2")} className="sm:col-span-2" />
            <Field id="city" label="City" autoComplete="address-level2" value={addr.city} onChange={set("city")} error={errors.city} />
            <Field id="state" label="State" autoComplete="address-level1" value={addr.state} onChange={set("state")} error={errors.state} />
            <Field id="postalCode" label="PIN code" inputMode="numeric" autoComplete="postal-code" value={addr.postalCode} onChange={(v) => set("postalCode")(v.replace(/\D/g, "").slice(0, 6))} error={errors.postalCode} />
          </div>
          {user && <label className="mt-4 flex items-center gap-2 text-[14px]"><input type="checkbox" className="size-4 accent-slate" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />Save this address to my account</label>}
        </Step>

        <Step n={3} title="Delivery method">
          <div className="grid gap-3">
            {siteConfig.commerce.shippingMethods.map((m) => {
              const price = priceCart(cart, coupon, m.id).shipping;
              return (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${method === m.id ? "border-slate bg-pale" : "border-line hover:border-slate/40"}`}>
                  <input type="radio" name="method" className="size-4 accent-slate" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span className="flex-1"><span className="block font-semibold">{m.label}</span><span className="text-[13px] text-muted">Estimated {m.eta}</span></span>
                  <span className="font-semibold">{price ? formatPrice(price) : "Free"}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-muted">Delivery times are estimates and may vary by PIN code.</p>
        </Step>

        <Step n={4} title="Payment method">
          <div className="grid gap-3">
            <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${payment === "cod" ? "border-slate bg-pale" : "border-line"}`}>
              <input type="radio" name="payment" className="size-4 accent-slate" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              <Banknote className="size-5 text-slate" aria-hidden />
              <span className="flex-1"><span className="block font-semibold">Cash on Delivery</span><span className="text-[13px] text-muted">Pay when your order arrives</span></span>
            </label>
            <label className={`flex cursor-not-allowed items-center gap-3 rounded-2xl border border-dashed border-line p-4 opacity-60 ${errors.payment ? "animate-shake" : ""}`}>
              <input type="radio" name="payment" className="size-4" disabled checked={payment === "card"} onChange={() => setPayment("card")} />
              <CreditCard className="size-5" aria-hidden />
              <span className="flex-1"><span className="block font-semibold">Card / UPI</span><span className="text-[13px]">Not available — payment provider not yet configured</span></span>
            </label>
          </div>
          {errors.payment && <p className="error-text">{errors.payment}</p>}
        </Step>
      </div>

      <aside className="h-fit lg:sticky lg:top-28" aria-label="Order summary">
        <div className="space-y-5 rounded-[var(--radius-card)] bg-pale p-6">
          <h2 className="text-lg font-bold">5 · Review your order</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {t.lines.map((l) => (
              <li key={l.sku} className="flex items-center gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image src={l.product.images[0].src} alt="" fill sizes="56px" className={l.product.images[0].fit === "cover" ? "object-cover" : "object-contain p-1"} />
                  <span className="absolute -top-0 -right-0 grid size-5 place-items-center rounded-full bg-slate text-[10px] font-bold text-white">{l.quantity}</span>
                </span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{l.product.name}</span><span className="block text-[12px] text-muted">{Object.values(l.variant.options).join(" · ") || "Standard"}</span></span>
                <span className="text-[14px] font-semibold">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <CouponForm />
          <dl className="space-y-2 border-t border-white pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({t.coupon?.code})</dt><dd>−{formatPrice(t.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Shipping ({t.shippingMethod.label})</dt><dd>{t.shipping ? formatPrice(t.shipping) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-white pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatPrice(t.total)}</dd></div>
          </dl>
          <p className="text-[12px] text-muted">Prices include applicable taxes. Totals are re-verified on our server when you place the order.</p>
          {(formError || errors.form) && <p className="rounded-xl bg-error/10 p-3 text-[13px] font-medium text-error" role="alert">{formError ?? errors.form}</p>}
          <button type="submit" disabled={submitting} className="btn-primary min-h-13 w-full text-[15px]">
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            {submitting ? "Placing order…" : `Place order · ${formatPrice(t.total)}`}
          </button>
          <p className="text-center text-[12px] text-muted">By placing your order you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </aside>
    </form>
  );
}
