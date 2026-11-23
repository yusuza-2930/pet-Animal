import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { siteConfig } from "@/config/site";
import { getRatings } from "@/lib/server/ratings";
import { Hero } from "@/components/home/Hero";
import { BrandStory, CategoryGrid, Collections, NewsletterBanner, PromoGrid, SectionHeading } from "@/components/home/Sections";
import { Recommended } from "@/components/home/Recommended";
import { ProductGrid } from "@/components/product/ProductCard";
import { Marquee, Reveal } from "@/components/motion/Motion";

export const dynamic = "force-dynamic";

const POPULAR = ["cloud-soft-pet-bed", "knot-play-rope-toy", "ceramic-paw-bowl", "comfort-walk-collar", "gentle-grooming-brush", "natural-daily-pet-food", "interactive-treat-toy", "cozy-travel-carrier"];

export default async function Home() {
  const ratings = await getRatings();
  const popular = POPULAR.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/hero.jpg`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <CategoryGrid />
      <PromoGrid />
      <BrandStory />
      <Marquee items={siteConfig.marquee} />
      <Reveal as="section" aria-labelledby="pop-title" className="container-site py-16 sm:py-20">
        <SectionHeading
          id="pop-title"
          title="Popular Products"
          sub="Customer favorites for happier everyday moments."
          action={<Link href="/shop" className="btn-ghost self-start sm:self-auto">View All Products <ArrowRight className="size-4" aria-hidden /></Link>}
        />
        <ProductGrid products={popular} ratings={ratings} />
      </Reveal>
      <div className="bg-pale">
        <Reveal className="container-site py-16 sm:py-20">
          <Recommended ratings={ratings} exclude={popular.map((p) => p.id)} />
        </Reveal>
      </div>
      <Collections />
      <NewsletterBanner />
    </>
  );
}
