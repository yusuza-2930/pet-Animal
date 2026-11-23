import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { ShopView } from "@/components/shop/ShopView";
import { parseFilters } from "@/lib/filters";
import { getRatings } from "@/lib/server/ratings";
import { animalLabels } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const title = f.q ? `Search: ${f.q}` : f.animal.length === 1 ? `Shop for ${animalLabels[f.animal[0]]}` : f.offers ? "Offers" : "Shop all pet essentials";
  return { title, description: "Browse food, toys, grooming and accessories for dogs, cats, birds and small pets.", alternates: { canonical: "/shop" } };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const f = parseFilters(await searchParams);
  const ratings = await getRatings();
  const title = f.q ? `Results for “${f.q}”` : f.offers ? "Offers & Savings" : f.animal.length === 1 ? `For ${animalLabels[f.animal[0]]}` : "Shop All";
  return (
    <>
      <PageHeader title={title} sub="Thoughtfully selected essentials — filter by pet, category, price and more." crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <ShopView initial={f} ratings={ratings} />
    </>
  );
}
