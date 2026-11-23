import { products, categories } from "@/data/products";
import { siteConfig } from "@/config/site";
import type { CartLine, Product, ProductVariant, ShopFilters } from "@/lib/types";

const fmt = new Intl.NumberFormat(siteConfig.commerce.locale, {
  style: "currency",
  currency: siteConfig.commerce.currency,
  maximumFractionDigits: 0,
});
export const formatPrice = (n: number) => fmt.format(n);

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getVariant = (p: Product, sku: string) => p.variants.find((v) => v.sku === sku);

export function priceRange(p: Product) {
  const prices = p.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
/** "From" variant: cheapest variant, preferring in-stock. */
export function displayVariant(p: Product): ProductVariant {
  const sorted = [...p.variants].sort((a, b) => a.price - b.price);
  return sorted.find((v) => v.stock > 0) ?? sorted[0];
}
export const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
export const isOnSale = (p: Product) => p.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price);
export const discountPercent = (v: ProductVariant) =>
  v.compareAtPrice && v.compareAtPrice > v.price ? Math.round((1 - v.price / v.compareAtPrice) * 100) : 0;

export function stockLabel(stock: number) {
  if (stock <= 0) return { label: "Out of stock", tone: "error" as const };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "warn" as const };
  return { label: "In stock", tone: "success" as const };
}

export const categoryTitle = (slug: string) => categories.find((c) => c.slug === slug)?.title ?? slug;
export const animalLabels: Record<string, string> = { dog: "Dogs", cat: "Cats", "small-pet": "Small Pets", bird: "Birds" };

export function searchProducts(q: string, list: Product[] = products) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list
    .map((p) => {
      const hay = [
        p.name,
        p.brand,
        p.productType,
        categoryTitle(p.category),
        p.animals.map((a) => animalLabels[a]).join(" "),
        p.tags.join(" "),
        p.options.flatMap((o) => o.values).join(" "),
        p.shortDescription,
      ]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return { p, score: -1 };
        score += p.name.toLowerCase().includes(t) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity)
    .map((r) => r.p);
}

export const defaultFilters: ShopFilters = {
  q: "", category: [], animal: [], type: [], brand: [], min: null, max: null, inStock: false, offers: false, sort: "featured",
};

export function filterProducts(f: ShopFilters, list: Product[] = products) {
  let out = f.q ? searchProducts(f.q, list) : [...list];
  if (f.category.length) out = out.filter((p) => f.category.includes(p.category));
  if (f.animal.length) out = out.filter((p) => p.animals.some((a) => f.animal.includes(a)));
  if (f.type.length) out = out.filter((p) => f.type.includes(p.productType));
  if (f.brand.length) out = out.filter((p) => f.brand.includes(p.brand));
  if (f.min != null) out = out.filter((p) => priceRange(p).max >= f.min!);
  if (f.max != null) out = out.filter((p) => priceRange(p).min <= f.max!);
  if (f.inStock) out = out.filter((p) => totalStock(p) > 0);
  if (f.offers) out = out.filter(isOnSale);
  const sorters: Record<ShopFilters["sort"], (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.popularity - a.popularity,
    popularity: (a, b) => b.popularity - a.popularity,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => priceRange(a).min - priceRange(b).min,
    "price-desc": (a, b) => priceRange(b).min - priceRange(a).min,
  };
  if (!(f.q && f.sort === "featured")) out.sort(sorters[f.sort]);
  return out;
}

export const facetValues = {
  categories: categories.map((c) => ({ value: c.slug, label: c.title })),
  animals: Object.entries(animalLabels).map(([value, label]) => ({ value, label })),
  types: [...new Set(products.map((p) => p.productType))].sort().map((t) => ({ value: t, label: t })),
  brands: [...new Set(products.map((p) => p.brand))].sort().map((b) => ({ value: b, label: b })),
};

/** Recommendations: same category/animal, in stock, by popularity, excluding given ids. */
export function recommend(opts: { contextIds?: string[]; animals?: string[]; exclude?: string[]; limit?: number }) {
  const { contextIds = [], animals = [], exclude = [], limit = 4 } = opts;
  const ctx = contextIds.map(getProductById).filter(Boolean) as Product[];
  const ctxCats = new Set(ctx.map((p) => p.category));
  const ctxAnimals = new Set([...ctx.flatMap((p) => p.animals), ...animals]);
  const related = new Set(ctx.flatMap((p) => p.relatedIds));
  return products
    .filter((p) => !exclude.includes(p.id) && !contextIds.includes(p.id) && totalStock(p) > 0)
    .map((p) => ({
      p,
      score:
        p.popularity / 100 +
        (related.has(p.id) ? 3 : 0) +
        (ctxCats.has(p.category) ? 1.5 : 0) +
        (p.animals.some((a) => ctxAnimals.has(a)) ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.p);
}

// ---------- Pricing (shared client + server) ----------
export interface PricedLine extends CartLine {
  product: Product;
  variant: ProductVariant;
  lineTotal: number;
}

export function priceCart(lines: CartLine[], couponCode?: string | null, shippingMethodId = "standard") {
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const product = getProductById(l.productId);
    const variant = product && getVariant(product, l.sku);
    if (!product || !variant) continue;
    const quantity = Math.max(1, Math.min(siteConfig.commerce.maxQuantityPerLine, Math.floor(l.quantity)));
    priced.push({ ...l, quantity, product, variant, lineTotal: variant.price * quantity });
  }
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const code = couponCode?.trim().toUpperCase() || null;
  const coupon = code ? siteConfig.commerce.coupons[code] : undefined;
  let discount = 0;
  let couponError: string | null = null;
  if (code && !coupon) couponError = "This code isn't valid.";
  else if (coupon && subtotal < coupon.minSubtotal) couponError = `Requires a subtotal of ${formatPrice(coupon.minSubtotal)}.`;
  else if (coupon) discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
  const method = siteConfig.commerce.shippingMethods.find((m) => m.id === shippingMethodId) ?? siteConfig.commerce.shippingMethods[0];
  const afterDiscount = subtotal - discount;
  const shipping = priced.length === 0 ? 0 : method.id === "standard" && afterDiscount >= siteConfig.commerce.freeShippingThreshold ? 0 : method.price;
  const tax = siteConfig.commerce.taxInclusive ? 0 : Math.round(afterDiscount * siteConfig.commerce.taxRateEstimate);
  return {
    lines: priced,
    subtotal,
    discount,
    coupon: coupon && !couponError ? { code: code!, ...coupon } : null,
    couponError,
    shipping,
    shippingMethod: method,
    tax,
    total: afterDiscount + shipping + tax,
    itemCount: priced.reduce((s, l) => s + l.quantity, 0),
  };
}
