import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/data/products";
import { PageHeader } from "@/components/ui/misc";
import { ShopView } from "@/components/shop/ShopView";
import { parseFilters } from "@/lib/filters";
import { getRatings } from "@/lib/server/ratings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = categories.find((x) => x.slug === slug);
  if (!c) return { title: "Category not found" };
  return { title: c.title, description: `${c.title}: ${c.description}.`, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = categories.find((x) => x.slug === slug);
  if (!c) notFound();
  const f = parseFilters(await searchParams);
  const ratings = await getRatings();
  return (
    <>
      <PageHeader title={c.title} sub={c.description + "."} crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: c.title }]} />
      <ShopView initial={f} locked={{ category: [c.slug] }} ratings={ratings} heading={c.title} />
    </>
  );
}
