"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { discountPercent, formatPrice } from "@/lib/catalog";
import type { ProductVariant } from "@/lib/types";

export function ProductPrice({ variant, from, size = "md" }: { variant: ProductVariant; from?: boolean; size?: "md" | "lg" }) {
  const off = discountPercent(variant);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {from && <span className="text-[12px] text-muted">From</span>}
      <span className={`font-display font-extrabold text-ink ${size === "lg" ? "text-3xl" : "text-[17px]"}`}>{formatPrice(variant.price)}</span>
      {off > 0 && (
        <>
          <span className={`text-muted line-through ${size === "lg" ? "text-lg" : "text-[13px]"}`}>
            <span className="sr-only">Original price </span>{formatPrice(variant.compareAtPrice!)}
          </span>
          {size === "lg" && <span className="rounded-full bg-coral/12 px-2.5 py-0.5 text-[13px] font-bold text-coral-dark">Save {off}%</span>}
        </>
      )}
    </div>
  );
}

export function WishlistButton({ productId, name, className = "" }: { productId: string; name: string; className?: string }) {
  const { inWishlist, toggleWishlist, hydrated } = useStore();
  const [pop, setPop] = useState(0);
  const active = hydrated && inWishlist(productId);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); setPop((p) => p + 1); }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`grid size-10 place-items-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${active ? "bg-coral/10 text-coral" : "bg-white text-slate hover:text-coral"} ${className}`}
    >
      <Heart key={pop} className={`size-[18px] ${pop ? "animate-pop" : ""} ${active ? "fill-coral" : ""}`} aria-hidden />
    </button>
  );
}

export function QuantitySelector({ value, onChange, max, min = 1, label = "Quantity", compact }: { value: number; onChange: (n: number) => void; max: number; min?: number; label?: string; compact?: boolean }) {
  const btn = `grid ${compact ? "size-8" : "size-11"} place-items-center rounded-full text-slate transition-colors hover:bg-pale disabled:opacity-35 disabled:hover:bg-transparent`;
  return (
    <div className={`inline-flex items-center rounded-full border border-line bg-white ${compact ? "p-0.5" : "p-1"}`} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n))); }}
        className={`${compact ? "w-8 text-sm" : "w-10"} [appearance:textfield] bg-transparent text-center font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function Badge({ children, tone }: { children: React.ReactNode; tone: "coral" | "slate" | "mint" | "muted" }) {
  const tones = { coral: "bg-coral text-white", slate: "bg-slate text-white", mint: "bg-mint text-success", muted: "bg-white/90 text-muted" };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${tones[tone]}`}>{children}</span>;
}
