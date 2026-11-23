"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { OrderDetails, type OrderView } from "./OrderDetails";

async function lookup(reference: string, email: string) {
  const r = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, email }) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? "Lookup failed");
  return d.order as OrderView;
}

export function TrackOrderForm() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) { setError("Enter both your order reference and the email used at checkout."); return; }
    setLoading(true); setError(null);
    try { setOrder(await lookup(reference, email)); } catch (err) { setOrder(null); setError((err as Error).message); }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={submit} noValidate className="card grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
        <div><label htmlFor="ref" className="label">Order reference</label><input id="ref" className="field uppercase" placeholder="SCP-26XXXXXX" value={reference} onChange={(e) => setReference(e.target.value)} aria-invalid={!!error && !reference} /></div>
        <div><label htmlFor="tr-email" className="label">Email used at checkout</label><input id="tr-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error && !email} /></div>
        <button className="btn-primary min-h-12" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Track order</button>
        {error && <p className="error-text sm:col-span-3" role="alert">{error}</p>}
      </form>
      {order && <OrderDetails order={order} />}
    </div>
  );
}

export function OrderConfirmation({ reference }: { reference: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      const last = JSON.parse(sessionStorage.getItem("scp.lastOrder") ?? "null") as { reference: string; email: string } | null;
      if (!last || last.reference !== reference) { setError(true); return; }
      lookup(last.reference, last.email).then(setOrder).catch(() => setError(true));
    } catch { setError(true); }
  }, [reference]);

  if (error)
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold">Order {reference}</p>
        <p className="mt-2 text-muted">For your privacy, order details are only shown in the browser that placed the order. You can look it up with your email on the tracking page.</p>
        <Link href="/track-order" className="btn-primary mt-5">Track an order</Link>
      </div>
    );
  if (!order) return <div className="h-80 animate-pulse rounded-3xl bg-pale" aria-busy="true" />;
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center rounded-[var(--radius-promo)] bg-mint/60 p-8 text-center">
        <CheckCircle2 className="size-14 text-success" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate">Thank you — your order is placed!</h1>
        <p className="mt-2 max-w-lg text-muted">Order <strong className="text-ink">{order.reference}</strong> has been received. Payment of the total is due in cash on delivery. Keep your order reference to track progress.</p>
        <p className="mt-2 text-[13px] text-muted">No confirmation email is sent because an email provider isn&apos;t configured yet.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/shop" className="btn-primary">Continue shopping</Link><Link href="/track-order" className="btn-ghost">Track order</Link></div>
      </div>
      <OrderDetails order={order} />
    </div>
  );
}
