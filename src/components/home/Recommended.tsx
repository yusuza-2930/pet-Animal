"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { recommend } from "@/lib/catalog";
import { ProductGrid, type Rating } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

/**
 * Rule-based recommendations (not AI): recently viewed products, saved pet
 * profiles (animal type), category affinity, popularity and stock.
 */
export function Recommended({ title = "Recommended for Your Pet", exclude = [], contextIds = [], ratings, sub }: { title?: string; exclude?: string[]; contextIds?: string[]; ratings?: Record<string, Rating>; sub?: string }) {
  const { recent, wishlist, cart, hydrated, user } = useStore();
  const [animals, setAnimals] = useState<string[]>([]);
  const [list, setList] = useState<Product[]>(() => recommend({ contextIds, exclude, limit: 4 }));
  const [basis, setBasis] = useState("Popular, in-stock picks from across the store.");

  useEffect(() => {
    if (!user) { setAnimals([]); return; }
    fetch("/api/pets").then((r) => r.json()).then((d) => setAnimals((d.pets ?? []).map((p: { animal: string }) => p.animal))).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    const ctx = [...contextIds, ...recent.slice(0, 4), ...wishlist.slice(0, 2)];
    const ex = [...exclude, ...cart.map((l) => l.productId)];
    setList(recommend({ contextIds: ctx, animals, exclude: ex, limit: 4 }));
    setBasis(
      animals.length ? "Based on your pet profiles and recently viewed items." : recent.length || wishlist.length ? "Based on items you've viewed or saved." : "Popular, in-stock picks from across the store.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, recent, wishlist, animals, cart.length]);

  if (!list.length) return null;
  return (
    <section aria-labelledby="rec-title">
      <div className="mb-8 sm:mb-10">
        <h2 id="rec-title" className="section-title text-slate">{title}</h2>
        <p className="section-sub">{sub ?? basis}</p>
      </div>
      <ProductGrid products={list} ratings={ratings} />
    </section>
  );
}
