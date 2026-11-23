"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/components/providers/StoreProvider";
import { getProductById } from "@/lib/catalog";
import { AddToCartPanel } from "./AddToCartPanel";
import { ProductGrid, type Rating } from "./ProductCard";
import { Stars } from "@/components/ui/misc";

export function ProductGallery({ product, mainRef }: { product: Product; mainRef: React.RefObject<HTMLDivElement | null> }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const img = product.images[i];
  const n = product.images.length;
  return (
    <div className="lg:sticky lg:top-28">
      <div
        ref={mainRef}
        className="relative aspect-square overflow-hidden rounded-[var(--radius-promo)] bg-[#F3F5F6]"
        onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onPointerLeave={() => setZoom((z) => ({ ...z, on: false }))}
      >
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`animate-[fade-up_.4s_ease] transition-transform duration-300 ease-out ${img.fit === "cover" ? "object-cover" : "object-contain p-6"}`}
          style={{ transform: zoom.on ? "scale(1.6)" : "scale(1)", transformOrigin: `${zoom.x}% ${zoom.y}%` }}
        />
      </div>
      {n > 1 && (
        <div className="mt-3 flex gap-3" role="group" aria-label="Product images" onKeyDown={(e) => { if (e.key === "ArrowRight") setI((x) => (x + 1) % n); if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n); }}>
          {product.images.map((im, k) => (
            <button key={im.src + k} type="button" onClick={() => setI(k)} aria-label={`Show image ${k + 1} of ${n}: ${im.alt}`} aria-pressed={k === i}
              className={`relative size-20 overflow-hidden rounded-2xl bg-[#F3F5F6] ring-2 transition-all sm:size-24 ${k === i ? "ring-slate" : "ring-transparent opacity-70 hover:opacity-100"}`}>
              <Image src={im.src} alt="" fill sizes="96px" className={im.fit === "cover" ? "object-cover" : "object-contain p-1.5"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Accordion({ title, children, open: initial = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="border-b border-line">
      <h3>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-14 w-full items-center justify-between text-left text-[15px] font-bold">
          {title}<ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h3>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden"><div className="pb-5 text-[14px] leading-relaxed text-muted">{children}</div></div>
      </div>
    </div>
  );
}

export function ProductMain({ product, rating }: { product: Product; rating?: Rating }) {
  const mainRef = useRef<HTMLDivElement>(null);
  const { addRecent } = useStore();
  useEffect(() => { addRecent(product.id); }, [product.id, addRecent]);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <ProductGallery product={product} mainRef={mainRef} />
      <div>
        <p className="text-[12px] font-bold tracking-[0.14em] text-muted uppercase">{product.brand}</p>
        <h1 className="mt-2 font-display text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)] leading-tight font-extrabold text-slate">{product.name}</h1>
        {rating && rating.count > 0 ? (
          <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink"><Stars value={rating.avg} /> {rating.avg.toFixed(1)} · {rating.count} review{rating.count > 1 ? "s" : ""}</a>
        ) : (
          <a href="#reviews" className="mt-2 inline-block text-[13px] text-muted underline-offset-2 hover:underline">No reviews yet — be the first</a>
        )}
        <p className="mt-4 text-[16px] leading-relaxed text-muted">{product.shortDescription}</p>
        <div className="mt-6"><AddToCartPanel product={product} imageRef={mainRef} /></div>

        <div className="mt-8 border-t border-line">
          <Accordion title="Description & benefits" open>
            <p>{product.description}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">{product.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
          </Accordion>
          <Accordion title="Specifications">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              {Object.entries(product.specs).map(([k, v]) => <div key={k} className="contents"><dt className="font-semibold text-ink">{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </Accordion>
          {(product.care || product.safety) && (
            <Accordion title="Care & safety">
              {product.care && <p><strong className="text-ink">Care: </strong>{product.care}</p>}
              {product.safety && <p className="mt-2"><strong className="text-ink">Safety: </strong>{product.safety}</p>}
              <p className="mt-2 text-[12px]">Product information is provided for general guidance and is not veterinary advice.</p>
            </Accordion>
          )}
          <Accordion title="Shipping & returns">
            <p>Standard delivery usually takes 4–7 business days; express 1–3 business days where available. Free standard shipping on orders over ₹1,499. Final delivery estimates are shown at checkout.</p>
            <p className="mt-2">Unused items in original packaging can be returned within 14 days of delivery. Opened food and consumables are non-returnable for hygiene reasons. <a className="underline" href="/returns">Read the returns policy</a>.</p>
          </Accordion>
          {product.faqs && product.faqs.length > 0 && (
            <Accordion title="Frequently asked questions">
              <dl className="space-y-3">{product.faqs.map((f) => <div key={f.q}><dt className="font-semibold text-ink">{f.q}</dt><dd className="mt-0.5">{f.a}</dd></div>)}</dl>
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentlyViewed({ excludeId, ratings }: { excludeId?: string; ratings?: Record<string, Rating> }) {
  const { recent, hydrated } = useStore();
  if (!hydrated) return null;
  const list = recent.filter((id) => id !== excludeId).map(getProductById).filter(Boolean).slice(0, 4) as Product[];
  if (!list.length) return null;
  return (
    <section aria-labelledby="recent-title" className="mt-16">
      <h2 id="recent-title" className="section-title mb-8 text-slate">Recently Viewed</h2>
      <ProductGrid products={list} ratings={ratings} />
    </section>
  );
}
