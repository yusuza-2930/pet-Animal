"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { products } from "@/data/products";
import { categoryTitle, displayVariant, formatPrice, searchProducts } from "@/lib/catalog";

interface Props { variant?: "header" | "hero" | "sheet"; autoFocus?: boolean; onNavigate?: () => void; label?: string }

export function SearchAutocomplete({ variant = "header", autoFocus, onNavigate, label = "Search products" }: Props) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (q.trim().length ? searchProducts(q, products).slice(0, 6) : []), [q]);
  const suggestions = ["Dog food", "Cat toys", "Grooming", "Collar", "Bed"];

  useEffect(() => {
    const close = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => setActive(-1), [q]);

  const go = (href: string) => { setOpen(false); setQ(""); onNavigate?.(); router.push(href); };
  const submit = () => {
    if (active >= 0 && results[active]) return go(`/products/${results[active].slug}`);
    if (!q.trim()) { input.current?.focus(); return; }
    go(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Escape") { if (open) { e.stopPropagation(); setOpen(false); } }
  };

  const styles = {
    header: "h-11 bg-pale border-transparent focus-within:bg-white focus-within:border-slate/30",
    hero: "h-14 bg-white border-white shadow-soft focus-within:border-slate/30",
    sheet: "h-12 bg-pale border-transparent focus-within:bg-white focus-within:border-slate/30",
  }[variant];
  const showList = open && q.trim().length > 0;

  return (
    <div ref={wrap} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }} className={`flex items-center gap-2 rounded-full border pr-1.5 pl-4 transition-colors ${styles}`}>
        <label htmlFor={`${id}-input`} className="sr-only">{label}</label>
        <Search className="size-[18px] shrink-0 text-muted" aria-hidden />
        <input
          ref={input}
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search food, toys, accessories, and more..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted/80 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/5" aria-label="Clear search">
            <X className="size-4" />
          </button>
        )}
        {variant === "hero" && <button type="submit" className="btn-coral btn-sm min-h-11 px-5">Search</button>}
      </form>

      {open && !q.trim() && variant !== "hero" && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 animate-[modal-zoom_.2s_ease-out] rounded-2xl border border-line bg-white p-4 shadow-lift">
          <p className="mb-2 text-[12px] font-semibold tracking-wide text-muted uppercase">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" className="chip active:scale-95 transition-transform" onClick={() => { setQ(s); input.current?.focus(); }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {showList && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[min(70vh,460px)] animate-[modal-zoom_.2s_ease-out] overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-lift">
          {results.length ? (
            <ul id={`${id}-list`} role="listbox" aria-label="Search suggestions">
              {results.map((p, i) => (
                <li
                  key={p.id}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={active === i}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => go(`/products/${p.slug}`)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 ${active === i ? "bg-pale" : ""}`}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#F3F5F6]">
                    <Image src={p.images[0].src} alt="" fill sizes="48px" className={p.images[0].fit === "cover" ? "object-cover" : "object-contain"} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-[12px] text-muted">{categoryTitle(p.category)}</span>
                  </span>
                  <span className="text-sm font-bold">{formatPrice(displayVariant(p).price)}</span>
                </li>
              ))}
              <li role="option" aria-selected={false} onPointerDown={(e) => e.preventDefault()} onClick={submit} className="mt-1 cursor-pointer rounded-xl p-2.5 text-center text-sm font-semibold text-slate hover:bg-pale">
                See all results for “{q.trim()}”
              </li>
            </ul>
          ) : (
            <div id={`${id}-list`} role="listbox" aria-label="Search suggestions" className="p-4 text-center text-sm text-muted">
              No products match “{q.trim()}”. Try “food”, “toy” or “brush”.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
