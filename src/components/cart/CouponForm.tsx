"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { priceCart } from "@/lib/catalog";

export function CouponForm() {
  const { coupon, setCoupon, cart, toast } = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setErr("Enter a code."); return; }
    const res = priceCart(cart, code);
    if (res.couponError) { setErr(res.couponError); return; }
    setErr(null); setCoupon(code); setCode("");
    toast(`Coupon applied: ${res.coupon?.label}`);
  };
  if (coupon)
    return (
      <div className="flex items-center justify-between rounded-xl bg-mint/60 px-3 py-2.5 text-[14px]">
        <span className="inline-flex items-center gap-2 font-semibold text-success"><Tag className="size-4" aria-hidden />{coupon} applied</span>
        <button onClick={() => setCoupon(null)} className="text-[13px] font-semibold text-muted hover:text-error">Remove</button>
      </div>
    );
  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor="coupon" className="label">Coupon code</label>
      <div className="flex gap-2">
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="field h-11 py-0 uppercase" placeholder="e.g. WELCOME10" aria-invalid={!!err} aria-describedby={err ? "coupon-err" : "coupon-hint"} />
        <button className="btn-ghost h-11 shrink-0">Apply</button>
      </div>
      {err ? <p id="coupon-err" className="error-text">{err}</p> : <p id="coupon-hint" className="mt-1.5 text-[12px] text-muted">Demo codes: WELCOME10, PETLOVE200</p>}
    </form>
  );
}

