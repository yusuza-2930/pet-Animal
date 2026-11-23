import Link from "next/link";
import { Mail, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/motion/Motion";

const cols = [
  { title: "Shop", links: [["All Products", "/shop"], ["Dog Essentials", "/category/dog-essentials"], ["Cat Essentials", "/category/cat-essentials"], ["Food & Nutrition", "/category/food-nutrition"], ["Toys & Accessories", "/category/toys"], ["Offers", "/shop?offers=1"]] },
  { title: "Company", links: [["About", "/about"], ["Our Story", "/about#story"], ["Contact", "/contact"], ["Pet Care Guide", "/care-guide"]] },
  { title: "Customer Care", links: [["FAQs", "/faq"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["Size & Product Guide", "/care-guide#sizing"], ["Order Tracking", "/track-order"]] },
];

export function Footer() {
  const c = siteConfig.contact;
  return (
    <footer className="bg-slate text-white/80">
      <Reveal className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-16">
        <div data-reveal-item>
          <div className="inline-block rounded-2xl bg-white px-3 py-2"><Logo /></div>
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed">{siteConfig.description}</p>
          <ul className="mt-5 flex gap-2">
            {siteConfig.social.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full border border-white/20 px-3.5 text-[12px] font-semibold hover:bg-white/10">{s.label}</a></li>
            ))}
          </ul>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title} data-reveal-item>
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-white uppercase">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {col.links.map(([l, h]) => <li key={h}><Link href={h} className="transition-colors hover:text-white">{l}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div data-reveal-item>
          <h2 className="text-[13px] font-bold tracking-[0.14em] text-white uppercase">Support</h2>
          <ul className="mt-4 space-y-3 text-[14px]">
            <li className="flex gap-2.5"><Mail className="size-4 shrink-0 translate-y-0.5" aria-hidden /><a href={`mailto:${c.email}`} className="break-all hover:text-white">{c.email}</a></li>
            <li className="flex gap-2.5"><Phone className="size-4 shrink-0 translate-y-0.5" aria-hidden /><span>{c.phone}</span></li>
            <li className="flex gap-2.5"><Clock className="size-4 shrink-0 translate-y-0.5" aria-hidden /><span>{c.hours}</span></li>
          </ul>
          <p className="mt-5 text-[12px] font-semibold tracking-wide text-white/60 uppercase">Payment</p>
          <p className="mt-2 inline-flex rounded-lg border border-white/20 px-2.5 py-1 text-[12px]">Cash on Delivery</p>
          <p className="mt-1.5 text-[11px] text-white/50">Online payments coming soon.</p>
        </div>
      </Reveal>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <ul className="flex gap-5">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
