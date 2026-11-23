export type AnimalType = "dog" | "cat" | "small-pet" | "bird";

export type CategorySlug = "dog-essentials" | "cat-essentials" | "grooming" | "food-nutrition" | "toys" | "accessories";

export interface ProductOption {
  name: string; // e.g. "Size", "Color", "Weight"
  values: string[];
}

export interface ProductVariant {
  sku: string;
  options: Record<string, string>; // { Size: "M", Color: "Oat" }
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: CategorySlug;
  animals: AnimalType[];
  productType: string;
  brand: string;
  images: { src: string; alt: string; fit?: "contain" | "cover" }[];
  options: ProductOption[];
  variants: ProductVariant[];
  benefits: string[];
  specs: Record<string, string>;
  care?: string;
  safety?: string;
  faqs?: { q: string; a: string }[];
  tags: string[];
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  popularity: number;
  createdAt: string;
  relatedIds: string[];
}

export interface CartLine {
  productId: string;
  sku: string;
  quantity: number;
}

export interface ShopFilters {
  q: string;
  category: string[];
  animal: string[];
  type: string[];
  brand: string[];
  min: number | null;
  max: number | null;
  inStock: boolean;
  offers: boolean;
  sort: "featured" | "popularity" | "newest" | "price-asc" | "price-desc";
}

export type OrderStatus = "placed" | "processing" | "dispatched" | "in_transit" | "delivered" | "cancelled";
