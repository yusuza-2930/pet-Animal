"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";

const COLOR_SWATCH: Record<string, string> = {
  Oat: "#E8DCC8", "Stone Blue": "#A9BCC6", Coral: "#F17D83", Navy: "#2E3E5C", Sage: "#AFC3AE",
};

/** Resolves the selected SKU from option choices; only single-value options are preselected. */
export function useVariantSelection(product: Product) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]])),
  );
  const missing = product.options.filter((o) => !selected[o.name]).map((o) => o.name);
  const variant = useMemo(
    () => (missing.length ? undefined : product.variants.find((v) => product.options.every((o) => v.options[o.name] === selected[o.name]))),
    [product, selected, missing.length],
  );
  const isValueAvailable = (optName: string, value: string) =>
    product.variants.some(
      (v) => v.options[optName] === value && v.stock > 0 && product.options.every((o) => o.name === optName || !selected[o.name] || v.options[o.name] === selected[o.name]),
    );
  return { selected, setSelected, variant, missing, isValueAvailable };
}

export function VariantPicker({ product, sel, showErrors }: { product: Product; sel: ReturnType<typeof useVariantSelection>; showErrors: boolean }) {
  if (!product.options.length) return null;
  return (
    <div className="space-y-5">
      {product.options.map((opt) => {
        const err = showErrors && !sel.selected[opt.name];
        const isColor = opt.name === "Color";
        return (
          <fieldset key={opt.name} className={err ? "animate-shake" : ""} aria-describedby={err ? `err-${product.id}-${opt.name}` : undefined}>
            <legend className="mb-2 text-[13px] font-semibold text-ink">
              {opt.name}
              {sel.selected[opt.name] && <span className="ml-1.5 font-normal text-muted">— {sel.selected[opt.name]}</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const active = sel.selected[opt.name] === val;
                const available = sel.isValueAvailable(opt.name, val);
                return (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${opt.name}: ${val}${available ? "" : " (out of stock)"}`}
                    onClick={() => sel.setSelected((s) => ({ ...s, [opt.name]: val }))}
                    className={`relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all ${
                      active ? "border-slate bg-slate text-white shadow-soft" : err ? "border-error/60 bg-white" : "border-line bg-white hover:border-slate/50"
                    } ${available ? "" : "text-muted line-through decoration-1 opacity-70"}`}
                  >
                    {isColor && <span className="size-4 rounded-full border border-black/10" style={{ background: COLOR_SWATCH[val] ?? "#ccc" }} aria-hidden />}
                    {val}
                  </button>
                );
              })}
            </div>
            {err && <p id={`err-${product.id}-${opt.name}`} className="error-text">Please choose a {opt.name.toLowerCase()}.</p>}
          </fieldset>
        );
      })}
    </div>
  );
}
