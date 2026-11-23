"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { Drawer } from "@/components/ui/Drawer";
import { QuantitySelector } from "@/components/product/parts";
import { formatPrice } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import type { PricedLine } from "@/lib/catalog";

export function CartLineRow({ line, compact }: { line: PricedLine; compact?: boolean }) {
  const { setQuantity, removeLine, changeVariant } = useStore();
  const pickVariant = (name: string, value: string) => {
    const want = { ...line.variant.options, [name]: value };
    const next = line.product.variants.find((v) => Object.entries(want).every(([k, val]) => v.options[k] === val));
    if (next && next.sku !== line.sku) changeVariant(line.sku, next.sku);
  };
  const img = line.product.images[0];
  const opts = Object.entries(line.variant.options);
  const max = Math.max(1, Math.min(siteConfig.commerce.maxQuantityPerLine, line.variant.stock));
  return (
    <li className="flex gap-3.5 py-4">
      <Link href={`/products/${line.product.slug}`} className={`group relative shrink-0 overflow-hidden rounded-xl bg-[#F3F5F6] ${compact ? "size-20" : "size-24"}`}>
        <Image src={img.src} alt={img.alt} fill sizes="96px" className={`transition-transform duration-300 group-hover:scale-105 ${img.fit === "cover" ? "object-cover" : "object-contain p-1"}`} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${line.product.slug}`} className="block truncate text-[15px] font-semibold hover:underline">{line.product.name}</Link>
            {opts.length > 0 && compact && <p className="text-[12px] text-muted">{opts.map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
            {opts.length > 0 && !compact && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {line.product.options.map((o) => (
                  <label key={o.name} className="text-[12px] text-muted">
                    <span className="sr-only">{o.name} for {line.product.name}</span>
                    <select value={line.variant.options[o.name]} onChange={(e) => pickVariant(o.name, e.target.value)} className="h-8 rounded-full border border-line bg-white px-2.5 text-[12px] font-medium text-ink">
                      {o.values.map((val) => {
                        const v = line.product.variants.find((x) => Object.entries({ ...line.variant.options, [o.name]: val }).every(([k, vv]) => x.options[k] === vv));
                        return <option key={val} value={val} disabled={!v || v.stock <= 0}>{o.name}: {val}{!v || v.stock <= 0 ? " (out of stock)" : ""}</option>;
                      })}
                    </select>
                  </label>
                ))}
              </div>
            )}
            {line.variant.stock < line.quantity && <p className="text-[12px] font-semibold text-error">Only {line.variant.stock} available</p>}
          </div>
          <p className="shrink-0 text-[15px] font-bold">{formatPrice(line.lineTotal)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantitySelector compact value={line.quantity} max={max} onChange={(n) => setQuantity(line.sku, n)} label={`Quantity for ${line.product.name}`} />
          <button type="button" onClick={() => removeLine(line.sku)} className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[12px] font-medium text-muted hover:text-error" aria-label={`Remove ${line.product.name}`}>
            <Trash2 className="size-4" aria-hidden /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function FreeShippingMeter() {
  const { totals } = useStore();
  const t = siteConfig.commerce.freeShippingThreshold;
  const left = Math.max(0, t - (totals.subtotal - totals.discount));
  const pct = Math.min(100, ((totals.subtotal - totals.discount) / t) * 100);
  return (
    <div className="rounded-2xl bg-pale p-3.5">
      <p className="text-[13px] font-medium">{left > 0 ? <>Add <strong>{formatPrice(left)}</strong> more for free standard shipping</> : <>🎉 You&apos;ve unlocked <strong>free standard shipping</strong></>}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <div className="h-full rounded-full bg-coral transition-[width] duration-500 shadow-[0_0_8px_rgba(241,125,131,0.6)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, totals, hydrated } = useStore();
  const close = () => setCartOpen(false);
  const empty = hydrated && totals.lines.length === 0;
  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      title={`Your cart${totals.itemCount ? ` (${totals.itemCount})` : ""}`}
      footer={
        !empty && (
          <div className="space-y-3">
            <div className="flex justify-between text-[15px]"><span className="text-muted">Subtotal</span><span className="font-bold">{formatPrice(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-[14px] text-success"><span>Discount ({totals.coupon?.code})</span><span>−{formatPrice(totals.discount)}</span></div>}
            <p className="text-[12px] text-muted">Shipping and any applicable charges are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={close} className="btn-ghost">View cart</Link>
              <Link href="/checkout" onClick={close} className="btn-primary">Checkout</Link>
            </div>
          </div>
        )
      }
    >
      {empty ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-pale text-slate animate-[float-gentle_4s_ease-in-out_infinite]"><ShoppingBag className="size-7" /></div>
          <h3 className="mt-4 text-lg font-bold">Your cart is empty</h3>
          <p className="mt-1 text-sm text-muted">Discover thoughtful essentials for your companion.</p>
          <Link href="/shop" onClick={close} className="btn-primary mt-6">Continue shopping</Link>
        </div>
      ) : (
        <div className="px-5 pt-4">
          <FreeShippingMeter />
          <ul className="divide-y divide-line">{totals.lines.map((l) => <CartLineRow key={l.sku} line={l} compact />)}</ul>
        </div>
      )}
    </Drawer>
  );
}
