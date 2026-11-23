"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { categoryTitle, animalLabels, defaultFilters, facetValues, filterProducts } from "@/lib/catalog";
import type { ShopFilters } from "@/lib/types";
import { ProductGrid, type Rating } from "@/components/product/ProductCard";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/misc";

const PAGE = 12;
const SORTS: { value: ShopFilters["sort"]; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];
const PRICE_BANDS = [
  { label: "Under ₹500", min: null, max: 500 },
  { label: "₹500 – ₹1,500", min: 500, max: 1500 },
  { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { label: "Over ₹3,000", min: 3000, max: null },
];

function toQuery(f: ShopFilters, locked: Partial<ShopFilters>) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  const lockedCat = locked.category ?? [];
  const cats = f.category.filter((c) => !lockedCat.includes(c));
  if (cats.length) p.set("category", cats.join(","));
  if (f.animal.length) p.set("animal", f.animal.join(","));
  if (f.type.length) p.set("type", f.type.join(","));
  if (f.brand.length) p.set("brand", f.brand.join(","));
  if (f.min != null) p.set("min", String(f.min));
  if (f.max != null) p.set("max", String(f.max));
  if (f.inStock) p.set("stock", "1");
  if (f.offers) p.set("offers", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p.toString();
}

function CheckGroup({ legend, options, values, onToggle, disabled = [] }: { legend: string; options: { value: string; label: string }[]; values: string[]; onToggle: (v: string) => void; disabled?: string[] }) {
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="mb-3 text-[13px] font-bold tracking-wide text-ink uppercase">{legend}</legend>
      <div className="space-y-1">
        {options.map((o) => (
          <label key={o.value} className={`flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-1 text-[14px] hover:bg-pale ${disabled.includes(o.value) ? "pointer-events-none opacity-50" : ""}`}>
            <input type="checkbox" className="size-4 accent-slate" checked={values.includes(o.value)} onChange={() => onToggle(o.value)} disabled={disabled.includes(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ShopView({ initial, locked = {}, ratings, heading }: { initial: ShopFilters; locked?: Partial<ShopFilters>; ratings: Record<string, Rating>; heading?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();
  const [f, setF] = useState<ShopFilters>({ ...initial, category: [...new Set([...(locked.category ?? []), ...initial.category])] });
  const [shown, setShown] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => { setF({ ...initial, category: [...new Set([...(locked.category ?? []), ...initial.category])] }); setShown(PAGE); }, [initial, locked.category]);

  const update = (patch: Partial<ShopFilters>) => {
    const next = { ...f, ...patch };
    setF(next);
    setShown(PAGE);
    const qs = toQuery(next, locked);
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const toggle = (key: "category" | "animal" | "type" | "brand", v: string) => update({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });

  const results = useMemo(() => filterProducts(f), [f]);
  const visible = results.slice(0, shown);

  const chips: { label: string; clear: () => void }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: () => update({ q: "" }) });
  f.category.filter((c) => !(locked.category ?? []).includes(c)).forEach((c) => chips.push({ label: categoryTitle(c), clear: () => toggle("category", c) }));
  f.animal.forEach((a) => chips.push({ label: animalLabels[a] ?? a, clear: () => toggle("animal", a) }));
  f.type.forEach((t) => chips.push({ label: t, clear: () => toggle("type", t) }));
  f.brand.forEach((b) => chips.push({ label: b, clear: () => toggle("brand", b) }));
  if (f.min != null || f.max != null) chips.push({ label: PRICE_BANDS.find((b) => b.min === f.min && b.max === f.max)?.label ?? "Price", clear: () => update({ min: null, max: null }) });
  if (f.inStock) chips.push({ label: "In stock", clear: () => update({ inStock: false }) });
  if (f.offers) chips.push({ label: "On offer", clear: () => update({ offers: false }) });
  const clearAll = () => update({ ...defaultFilters, sort: f.sort, category: locked.category ?? [] });

  const filters = (
    <div>
      <CheckGroup legend="Category" options={facetValues.categories} values={f.category} onToggle={(v) => toggle("category", v)} disabled={locked.category} />
      <CheckGroup legend="Animal" options={facetValues.animals} values={f.animal} onToggle={(v) => toggle("animal", v)} />
      <CheckGroup legend="Product type" options={facetValues.types} values={f.type} onToggle={(v) => toggle("type", v)} />
      <fieldset className="border-b border-line py-5">
        <legend className="mb-3 text-[13px] font-bold tracking-wide text-ink uppercase">Price</legend>
        <div className="space-y-1">
          {PRICE_BANDS.map((b) => {
            const on = f.min === b.min && f.max === b.max;
            return (
              <label key={b.label} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-1 text-[14px] hover:bg-pale">
                <input type="radio" name="price" className="size-4 accent-slate" checked={on} onChange={() => update({ min: b.min, max: b.max })} onClick={() => on && update({ min: null, max: null })} />
                {b.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <CheckGroup legend="Brand" options={facetValues.brands} values={f.brand} onToggle={(v) => toggle("brand", v)} />
      <fieldset className="py-5">
        <legend className="mb-3 text-[13px] font-bold tracking-wide text-ink uppercase">Availability & offers</legend>
        <label className="flex min-h-9 cursor-pointer items-center gap-3 px-1 text-[14px]"><input type="checkbox" className="size-4 accent-slate" checked={f.inStock} onChange={(e) => update({ inStock: e.target.checked })} />In stock only</label>
        <label className="flex min-h-9 cursor-pointer items-center gap-3 px-1 text-[14px]"><input type="checkbox" className="size-4 accent-slate" checked={f.offers} onChange={(e) => update({ offers: e.target.checked })} />Special offers</label>
      </fieldset>
    </div>
  );

  return (
    <div className="container-site py-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[250px_1fr] xl:gap-12">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Filters</h2>{chips.length > 0 && <button onClick={clearAll} className="text-[13px] font-semibold text-coral-dark hover:underline">Clear all</button>}</div>
            {filters}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-muted" aria-live="polite"><strong className="text-ink">{results.length}</strong> {results.length === 1 ? "product" : "products"}{heading ? ` in ${heading}` : ""}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setDrawer(true)} className="btn-ghost btn-sm lg:hidden"><SlidersHorizontal className="size-4" aria-hidden />Filters{chips.length ? ` (${chips.length})` : ""}</button>
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <select id="sort" value={f.sort} onChange={(e) => update({ sort: e.target.value as ShopFilters["sort"] })} className="field h-9 w-auto rounded-full py-0 pr-8 pl-4 text-[13px] font-semibold">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.label}><button onClick={c.clear} className="chip bg-pale" aria-label={`Remove filter ${c.label}`}>{c.label}<X className="size-3.5" aria-hidden /></button></li>
              ))}
              <li><button onClick={clearAll} className="chip border-transparent text-coral-dark">Clear all</button></li>
            </ul>
          )}

          <div className="mt-6">
            {results.length ? (
              <>
                <ProductGrid products={visible} ratings={ratings} priorityCount={4} />
                {shown < results.length && (
                  <div className="mt-10 flex flex-col items-center gap-2">
                    <p className="text-[13px] text-muted">Showing {visible.length} of {results.length}</p>
                    <button onClick={() => setShown((s) => s + PAGE)} className="btn-ghost">Load more</button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon={<SearchX className="size-7" />} title="No products match" text={f.q ? `We couldn't find anything for “${f.q}” with these filters. Try a broader search or clear some filters.` : "Try removing a filter or two to see more products."} action={<button onClick={clearAll} className="btn-primary">Clear all filters</button>} />
            )}
          </div>
        </div>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filters" side="left" footer={<div className="grid grid-cols-2 gap-2"><button onClick={clearAll} className="btn-ghost">Clear all</button><button onClick={() => setDrawer(false)} className="btn-primary">Show {results.length}</button></div>}>
        <div className="px-5">{filters}</div>
      </Drawer>
    </div>
  );
}
