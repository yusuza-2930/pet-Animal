import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { categories, collections } from "@/data/products";
import { Reveal, ScrollParallax } from "@/components/motion/Motion";
import { PawIcon } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function SectionHeading({ id, title, sub, action, center }: { id: string; title: string; sub?: string; action?: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-8 flex flex-col gap-4 sm:mb-10 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div>
        {center && <PawIcon className="mx-auto mb-3 size-7 text-coral" />}
        <h2 id={id} className="section-title text-slate">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function CategoryGrid() {
  const four = categories.filter((c) => ["dog-essentials", "cat-essentials", "grooming", "food-nutrition"].includes(c.slug));
  const blobs = ["58% 42% 55% 45% / 50% 55% 45% 50%", "45% 55% 40% 60% / 55% 45% 55% 45%", "52% 48% 60% 40% / 45% 55% 45% 55%", "60% 40% 48% 52% / 52% 48% 52% 48%"];
  return (
    <Reveal as="section" aria-labelledby="cat-title" className="container-site py-16 sm:py-20">
      <SectionHeading id="cat-title" title="Shop by Categories" sub="Find the right essentials for every kind of companion." center />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {four.map((c, i) => (
          <li key={c.slug} data-reveal-item>
            <Link href={`/category/${c.slug}`} className="group flex flex-col items-center text-center">
              <span className="relative block aspect-square w-full max-w-[250px]">
                <span className="absolute inset-[6%] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6" style={{ background: c.tint, borderRadius: blobs[i] }} aria-hidden />
                <span className="absolute inset-[14%] overflow-hidden rounded-full shadow-lift ring-4 ring-white transition-transform duration-500 group-hover:-translate-y-1.5">
                  <Image src={c.image} alt="" fill sizes="(max-width: 1024px) 40vw, 220px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </span>
              </span>
              <span className="mt-4 font-display text-[17px] font-extrabold text-slate sm:text-lg">{c.title}</span>
              <span className="mt-1 text-[13px] text-muted">{c.description}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-coral-dark">Shop now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function PromoCard({ href, badge, title, text, cta, image, bg, className = "", imgClass = "", dark, overlay = "" }: { href: string; badge: string; title: string; text: string; cta: string; image: string; bg: string; className?: string; imgClass?: string; dark?: boolean; overlay?: string }) {
  return (
    <Link href={href} data-reveal-item className={`group relative isolate flex overflow-hidden rounded-[var(--radius-promo)] p-6 sm:p-7 ${bg} ${className}`}>
      <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className={`-z-20 object-cover transition-transform duration-700 group-hover:scale-105 ${imgClass}`} />
      <span className={`absolute inset-0 -z-10 ${overlay}`} aria-hidden />
      <div className={`relative flex max-w-[78%] flex-col ${dark ? "text-white" : "text-slate"}`}>
        <span className={`self-start rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.12em] uppercase ${dark ? "bg-white/20 text-white backdrop-blur" : "bg-white/85 text-slate"}`}>{badge}</span>
        <h3 className={`mt-3 font-display text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] leading-[1.12] font-extrabold ${dark ? "text-white" : "text-slate"}`}>{title}</h3>
        <p className={`mt-2 text-[14px] leading-snug ${dark ? "text-white/90" : "text-slate/80"}`}>{text}</p>
        <span className={`mt-4 inline-flex min-h-10 items-center gap-1.5 self-start rounded-full px-4 text-[13px] font-semibold transition-transform group-hover:translate-x-0.5 ${dark ? "bg-white text-slate" : "bg-slate text-white"}`}>{cta}<ArrowUpRight className="size-4" aria-hidden /></span>
      </div>
    </Link>
  );
}

export function PromoGrid() {
  return (
    <Reveal as="section" aria-label="Current campaigns" className="container-site">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr] lg:grid-rows-2 lg:gap-5">
        <PromoCard
          href="/category/food-nutrition" badge="Nature's best" title="Natural Nutrition, Happier Pets" text="Complete meals with real chicken and simple ingredients." cta="Shop nutrition"
          image="/images/stock/food.jpg" bg="bg-[#BFE0EC]" dark className="min-h-[300px] md:col-span-2 lg:col-span-1 lg:row-span-2 lg:min-h-[460px]" overlay="bg-gradient-to-br from-[#2B5468]/90 via-[#2B5468]/45 to-transparent"
        />
        <PromoCard href="/category/grooming" badge="Coat care" title="Everyday Grooming Essentials" text="Gentle brushes and soap-free shampoo." cta="Shop grooming" image="/images/stock/grooming.jpg" bg="bg-coral" dark className="min-h-[220px]" overlay="bg-gradient-to-br from-coral via-coral/70 to-coral/10" />
        <PromoCard
          href="/shop?q=treats" badge="Reward time" title="Healthy Treats, Happy Moments" text="Simple biscuits and soft bites." cta="Shop treats"
          image="/images/stock/treats.jpg" bg="bg-lavender" dark className="min-h-[220px] lg:col-start-2 lg:row-start-2" overlay="bg-gradient-to-br from-[#5E63A6] via-[#5E63A6]/70 to-[#5E63A6]/10"
        />
        <PromoCard
          href="/shop?offers=1" badge="Limited offer" title="Up to 25% Off Pet Favorites" text="Selected beds, carriers, treats and grooming." cta="Shop offers"
          image="/images/stock/puppy-kitten.jpg" bg="bg-coral" dark className="min-h-[340px] md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:min-h-0" imgClass="object-[center_60%]" overlay="bg-gradient-to-b from-coral via-coral/60 to-transparent"
        />
      </div>
    </Reveal>
  );
}

export function BrandStory() {
  const points = ["Carefully selected products", "Everyday nutrition", "Reliable delivery", "Helpful customer support", "Easy returns"];
  return (
    <section aria-labelledby="story-title" className="mt-20 bg-cream sm:mt-24">
      <Reveal className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div data-reveal-item className="mx-auto w-full max-w-[560px]">
          <ScrollParallax speed={6} className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-promo)] shadow-soft">
            <Image src="/images/story.jpg" alt="A happy beagle sitting beside a kraft pet food bag and a bowl of kibble" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
            <div className="glass animate-float absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
              <PawIcon className="size-7 text-coral" />
              <span className="text-[13px] leading-tight font-semibold text-ink">Chosen by pet parents,<br />for pet parents</span>
            </div>
          </ScrollParallax>
        </div>
        <div data-reveal-item>
          <p className="eyebrow">Thoughtful Care, Every Day</p>
          <h2 id="story-title" className="mt-4 font-display text-[clamp(1.9rem,1.3rem+2vw,3rem)] leading-[1.08] font-extrabold text-slate">Helping Your Pet Live a Happier, Healthier Life.</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            We review every product we stock for materials, safety information and everyday usefulness — so you spend less time comparing and more time with your companion. No gimmicks, just essentials we&apos;d use at home.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] font-semibold text-ink">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-coral/15 text-coral-dark"><Check className="size-4" aria-hidden /></span>{p}
              </li>
            ))}
          </ul>
          <Link href="/about#story" className="btn-coral mt-9 min-h-12 px-7">Discover Our Story <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </Reveal>
    </section>
  );
}

export function Collections() {
  return (
    <Reveal as="section" id="collections" aria-labelledby="col-title" className="container-site scroll-mt-28 py-16 sm:py-20">
      <SectionHeading id="col-title" title="Curated Collections" sub="Edited selections for every routine — from morning walks to evening play." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {collections.map((c, i) => (
          <li key={c.title} data-reveal-item className={i === 0 ? "lg:row-span-2" : ""}>
            <Link href={c.href} className={`group relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-promo)] p-6 text-white ${i === 0 ? "min-h-[260px] lg:min-h-[540px]" : "min-h-[260px]"}`}>
              <Image src={c.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" aria-hidden />
              <span className="text-[11px] font-bold tracking-[0.16em] text-white/80 uppercase">Collection {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-white">{c.title}</h3>
              <p className="mt-1 max-w-xs text-[14px] text-white/85">{c.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold">Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function NewsletterBanner() {
  return (
    <Reveal as="section" aria-labelledby="nl-title" className="container-site pb-20">
      <div className="relative overflow-hidden rounded-[var(--radius-hero)] bg-hero px-6 py-12 sm:px-12 lg:py-16">
        <ScrollParallax speed={-8} className="pointer-events-none absolute -top-6 right-10 size-40 rotate-12 text-white/50">
          <PawIcon className="size-full" />
        </ScrollParallax>
        <ScrollParallax speed={8} className="pointer-events-none absolute -bottom-10 left-1/3 size-32 -rotate-12 text-white/40">
          <PawIcon className="size-full" />
        </ScrollParallax>
        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div data-reveal-item>
            <h2 id="nl-title" className="font-display text-[clamp(1.9rem,1.3rem+2vw,3rem)] leading-[1.05] font-extrabold text-slate">Good Things for Good Pets.</h2>
            <p className="mt-3 max-w-md text-slate/75">Get new arrivals, practical pet-care tips, and occasional offers delivered to your inbox.</p>
          </div>
          <div data-reveal-item><NewsletterForm /></div>
        </div>
      </div>
    </Reveal>
  );
}
