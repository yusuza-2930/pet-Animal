import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { siteConfig } from "@/config/site";
import { categoryTitle, getProductById, getProductBySlug, totalStock } from "@/lib/catalog";
import { getRatings } from "@/lib/server/ratings";
import { Breadcrumbs } from "@/components/ui/misc";
import { ProductMain, RecentlyViewed } from "@/components/product/ProductDetail";
import { Reviews } from "@/components/product/Reviews";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: `${p.shortDescription} ${p.description}`.slice(0, 160),
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: [p.images[0].src] },
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const ratings = await getRatings();
  const rating = ratings[product.id];
  const related = product.relatedIds.map(getProductById).filter(Boolean) as Product[];

  const prices = product.variants.map((v) => v.price);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => `${siteConfig.url}${i.src}`),
    sku: product.variants[0].sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: siteConfig.commerce.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
  if (rating?.count) jsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: rating.avg.toFixed(1), reviewCount: rating.count };

  return (
    <div className="container-site py-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: categoryTitle(product.category), href: `/category/${product.category}` }, { label: product.name }]} />
      <div className="mt-6"><ProductMain product={product} rating={rating} /></div>
      <Reviews productId={product.id} productSlug={product.slug} />
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="section-title text-slate">Pairs Well With</h2>
          <p className="section-sub mb-8">Hand-picked companions to {product.name}.</p>
          <ProductGrid products={related} ratings={ratings} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} ratings={ratings} />
    </div>
  );
}
