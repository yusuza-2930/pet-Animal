"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Check, Eye, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { displayVariant, discountPercent, isOnSale, stockLabel, totalStock } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { Modal } from "@/components/ui/Drawer";
import { Stars } from "@/components/ui/misc";
import { TiltCard } from "@/components/motion/Motion";
import { Badge, ProductPrice, WishlistButton } from "./parts";
import { AddToCartPanel } from "./AddToCartPanel";

export type Rating = { avg: number; count: number };

export function ProductCard({ product, rating, priority }: { product: Product; rating?: Rating; priority?: boolean }) {
  const { addToCart } = useStore();
  const [quick, setQuick] = useState(false);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const v = displayVariant(product);
  const stock = totalStock(product);
  const hasChoices = product.variants.length > 1;
  const img = product.images[0];
  const off = Math.max(...product.variants.map(discountPercent));
  const status = stockLabel(hasChoices ? stock : v.stock);
  const priceVaries = new Set(product.variants.map((x) => x.price)).size > 1;

  const handleAddToCart = () => {
    if (hasChoices) {
      setQuick(true);
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1000);
      addToCart(product.id, v.sku, 1, imgRef.current);
    }
  };

  return (
    <TiltCard className="h-full">
      <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-2.5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-lift sm:p-3">
        <div ref={imgRef} className="relative aspect-square overflow-hidden rounded-[14px] bg-[#F3F5F6]">
          <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden>
            <Image
              src={img.src}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className={`transition-transform duration-500 ease-out group-hover:scale-[1.06] ${img.fit === "cover" ? "object-cover" : "object-contain p-2"}`}
            />
          </Link>
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {isOnSale(product) && <Badge tone="coral">−{off}%</Badge>}
            {product.isNew && <Badge tone="slate">New</Badge>}
            {product.bestseller && !product.isNew && <Badge tone="muted">Bestseller</Badge>}
          </div>
          <WishlistButton productId={product.id} name={product.name} className="absolute top-2 right-2 z-10 shadow-soft" />
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="glass absolute inset-x-2 bottom-2 z-10 hidden min-h-10 translate-y-2 items-center justify-center gap-2 rounded-full text-[13px] font-semibold text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="size-4" aria-hidden /> Quick view
          </button>
        </div>

        <div className="flex flex-1 flex-col px-1 pt-3 pb-1">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{product.brand}</p>
          <h3 className="mt-1 text-[15px] leading-snug font-bold sm:text-base">
            <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 hidden text-[13px] leading-snug text-muted sm:block">{product.shortDescription}</p>
          {rating && rating.count > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
              <Stars value={rating.avg} size={13} /> <span>({rating.count})</span>
            </div>
          )}
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div>
              <ProductPrice variant={v} from={priceVaries} />
              <p className={`mt-0.5 text-[11px] font-semibold ${status.tone === "error" ? "text-error" : status.tone === "warn" ? "text-warn" : "text-success"}`}>{status.label}</p>
            </div>
            <button
              type="button"
              disabled={stock <= 0}
              onClick={handleAddToCart}
              aria-label={stock <= 0 ? `${product.name} is out of stock` : hasChoices ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-white transition-all duration-200 active:scale-90 disabled:bg-line disabled:text-muted sm:size-11 ${
                added ? "bg-success scale-105" : "bg-slate hover:bg-coral"
              }`}
            >
              {added ? (
                <Check className="size-[18px] animate-pop text-white" aria-hidden />
              ) : hasChoices ? (
                <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              ) : (
                <ShoppingBag className="size-[18px] transition-transform duration-200 group-hover:scale-110" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <Modal open={quick} onClose={() => setQuick(false)} title={`Quick view: ${product.name}`}>
          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F3F5F6]">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 100vw, 360px" className={img.fit === "cover" ? "object-cover" : "object-contain p-3"} />
            </div>
            <div>
              <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">{product.brand}</p>
              <h2 className="mt-1 text-2xl font-extrabold">{product.name}</h2>
              <p className="mt-2 text-[14px] text-muted">{product.shortDescription}</p>
              <div className="mt-5">
                <AddToCartPanel product={product} imageRef={imgRef} onAdded={() => setQuick(false)} compact />
              </div>
              <Link href={`/products/${product.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate hover:underline">
                View full details <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Modal>
      </article>
    </TiltCard>
  );
}

export function ProductGrid({ products, ratings, priorityCount = 0 }: { products: Product[]; ratings?: Record<string, Rating>; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} data-reveal-item>
          <ProductCard product={p} rating={ratings?.[p.id]} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
