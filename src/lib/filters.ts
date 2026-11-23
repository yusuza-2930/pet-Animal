import type { ShopFilters } from "@/lib/types";

const SORT_VALUES: ShopFilters["sort"][] = ["featured", "popularity", "newest", "price-asc", "price-desc"];

export function parseFilters(sp: Record<string, string | string[] | undefined>): ShopFilters {
  const g = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined)) ?? "";
  const list = (k: string) => g(k).split(",").map((s) => s.trim()).filter(Boolean);
  const num = (k: string) => (g(k) && !Number.isNaN(Number(g(k))) ? Number(g(k)) : null);
  const sort = g("sort") as ShopFilters["sort"];
  return {
    q: g("q"), category: list("category"), animal: list("animal"), type: list("type"), brand: list("brand"),
    min: num("min"), max: num("max"), inStock: g("stock") === "1", offers: g("offers") === "1",
    sort: SORT_VALUES.includes(sort) ? sort : "featured",
  };
}

