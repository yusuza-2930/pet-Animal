"use client";

import { useRef, useState } from "react";
import { Check, ShoppingBag, Truck, RotateCcw } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { displayVariant, stockLabel } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import type { Product } from "@/lib/types";
import { ProductPrice, QuantitySelector, WishlistButton } from "./parts";
import { VariantPicker, useVariantSelection } from "./VariantPicker";

/** Variant selection + quantity + add-to-cart. Used by PDP and Quick View. */
export function AddToCartPanel({ product, imageRef, onAdded, compact }: { product: Product; imageRef?: React.RefObject<HTMLElement | null>; onAdded?: () => void; compact?: boolean }) {
  const { addToCart } = useStore();
  const sel = useVariantSelection(product);
  const [qty, setQty] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const v = sel.variant;
  const priceVariant = v ?? displayVariant(product);
  const stock = v ? stockLabel(v.stock) : null;
  const maxQty = Math.max(1, Math.min(siteConfig.commerce.maxQuantityPerLine, v?.stock ?? siteConfig.commerce.maxQuantityPerLine));

  const submit = () => {
    if (!v) { setShowErrors(true); return; }
    if (v.stock <= 0) return;
    if (addToCart(product.id, v.sku, Math.min(qty, maxQty), imageRef?.current)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1000);
      onAdded?.();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <ProductPrice variant={priceVariant} from={!v && product.variants.length > 1 && new Set(product.variants.map((x) => x.price)).size > 1} size="lg" />
        <p className="mt-1 text-[12px] text-muted">Inclusive of all taxes</p>
      </div>
      <VariantPicker product={product} sel={sel} showErrors={showErrors} />
      <div className="flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1 text-[13px]" aria-live="polite">
        {stock ? (
          <span className={`inline-flex items-center gap-1.5 font-semibold ${stock.tone === "error" ? "text-error" : stock.tone === "warn" ? "text-warn" : "text-success"}`}>
            <span className="size-2 rounded-full bg-current" aria-hidden />{stock.label}
          </span>
        ) : (
          <span className="text-muted">Select {sel.missing.join(" & ").toLowerCase()} to see availability</span>
        )}
        {v && <span className="text-muted">SKU: {v.sku}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector value={Math.min(qty, maxQty)} onChange={setQty} max={maxQty} />
        <button
          ref={btnRef}
          type="button"
          onClick={submit}
          disabled={!!v && v.stock <= 0}
          className={`min-h-12 flex-1 basis-48 rounded-full text-[15px] font-semibold text-white shadow-soft transition-all duration-200 active:scale-95 disabled:bg-line disabled:text-muted inline-flex items-center justify-center gap-2 ${
            added ? "bg-success scale-[1.02]" : "bg-slate hover:bg-ink"
          }`}
        >
          {added ? (
            <Check className="size-[18px] animate-pop text-white" aria-hidden />
          ) : (
            <ShoppingBag className="size-[18px]" aria-hidden />
          )}
          {added ? "Added to cart!" : v && v.stock <= 0 ? "Out of stock" : "Add to cart"}
        </button>
        <WishlistButton productId={product.id} name={product.name} className="size-12 border border-line" />
      </div>
      {!compact && (
        <ul className="grid gap-3 rounded-2xl bg-pale p-4 text-[13px] sm:grid-cols-2">
          <li className="flex gap-2.5"><Truck className="size-5 shrink-0 text-slate" aria-hidden /><span><strong className="block text-ink">Free standard shipping</strong><span className="text-muted">On orders over ₹{siteConfig.commerce.freeShippingThreshold.toLocaleString("en-IN")}</span></span></li>
          <li className="flex gap-2.5"><RotateCcw className="size-5 shrink-0 text-slate" aria-hidden /><span><strong className="block text-ink">14-day returns</strong><span className="text-muted">On unused, unopened items</span></span></li>
        </ul>
      )}
    </div>
  );
}
