"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, MapPin, Truck, Package } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";
import { useStore } from "@/components/providers/StoreProvider";
import { Logo } from "@/components/ui/Logo";
import { Drawer } from "@/components/ui/Drawer";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { CartDrawer } from "./CartDrawer";

export function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const a = siteConfig.announcement;
  return (
    <div className="bg-slate text-white">
      <div className="container-site flex h-9 items-center justify-between gap-4 text-[12px]">
        <p className="truncate font-medium"><span aria-hidden>🐾 </span>{a.message}</p>
        <div className="hidden shrink-0 items-center gap-5 text-white/85 md:flex">
          <span className="inline-flex items-center gap-1.5"><Truck className="size-3.5" aria-hidden />{a.shipping}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{a.location}</span>
          <Link href="/track-order" className="inline-flex items-center gap-1.5 hover:text-white"><Package className="size-3.5" aria-hidden />Track order</Link>
        </div>
      </div>
    </div>
  );
}

function IconLink({ href, label, count, icon, onClick, cartTarget }: { href?: string; label: string; count?: number; icon: React.ReactNode; onClick?: () => void; cartTarget?: boolean }) {
  const inner = (
    <>
      <span className="relative" data-cart-target={cartTarget ? "" : undefined}>
        {icon}
        {!!count && (
          <span key={count} className="absolute -top-2 -right-2.5 grid h-[18px] min-w-[18px] animate-badge-pop place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="sr-only">{label}{count ? ` (${count})` : ""}</span>
    </>
  );
  const cls = "relative grid size-11 place-items-center rounded-full text-slate transition-all duration-200 hover:bg-pale active:scale-90";
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

function NavLinks({ onNavigate, mobile }: { onNavigate?: () => void; mobile?: boolean }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = pathname + (sp.toString() ? `?${sp.toString()}` : "");
  return (
    <>
      {mainNav.map((n) => {
        const active = n.href === "/" ? pathname === "/" : n.href.includes("?") ? current === n.href : pathname === n.href && !sp.toString();
        return (
          <li key={n.href}>
            <Link
              href={n.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                mobile
                  ? `flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold transition-colors duration-200 ${active ? "bg-pale text-slate" : "text-ink hover:bg-pale"}`
                  : `relative inline-flex h-11 items-center px-1 text-[13.5px] font-semibold transition-colors duration-200 after:absolute after:inset-x-1 after:bottom-2 after:h-0.5 after:origin-left after:rounded-full after:bg-coral after:transition-transform after:duration-300 after:ease-out ${active ? "text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"} ${n.label === "Offers" ? "!text-coral-dark" : ""}`
              }
            >
              {n.label}
            </Link>
          </li>
        );
      })}
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { totals, wishlist, hydrated, user, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const cartCount = hydrated ? totals.itemCount : 0;
  const wishCount = hydrated ? wishlist.length : 0;

  return (
    <>
      <header
        className={
          isHome
            ? "fixed top-0 inset-x-0 z-40 px-3 pt-3 transition-all duration-300 sm:px-6 sm:pt-4 lg:px-8"
            : `sticky top-0 z-40 transition-all duration-300 ${
                scrolled
                  ? "border-b border-slate-900/10 bg-white/92 shadow-soft backdrop-blur-xl"
                  : "border-b border-line/60 bg-white"
              }`
        }
      >
        <div
          className={
            isHome
              ? `mx-auto flex h-14 sm:h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-8 rounded-2xl transition-all duration-300 ${
                  scrolled
                    ? "border border-slate-900/10 bg-white/90 shadow-soft backdrop-blur-xl"
                    : "border border-white/35 bg-white/25 shadow-sm backdrop-blur-xl"
                }`
              : "container-site flex h-[68px] items-center gap-3 lg:h-[76px] lg:gap-8"
          }
        >
          <button
            type="button"
            onClick={() => setMenu(true)}
            className="-ml-2 grid size-11 place-items-center rounded-full text-slate hover:bg-white/20 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-[22px]" />
          </button>
          <Logo />
          <div className="mx-auto hidden w-full max-w-xl lg:block">
            <SearchAutocomplete variant="header" />
          </div>
          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <IconLink label="Search" icon={<Search className="size-[21px]" />} onClick={() => setSearch(true)} />
            <span className="hidden sm:contents">
              <IconLink href={user ? "/account" : "/login"} label={user ? `Account for ${user.name}` : "Sign in"} icon={<User className="size-[21px]" />} />
            </span>
            <IconLink href="/wishlist" label="Wishlist" count={wishCount} icon={<Heart className="size-[21px]" />} />
            <IconLink label="Open cart" count={cartCount} cartTarget icon={<ShoppingBag className="size-[21px]" />} onClick={() => setCartOpen(true)} />
          </div>
        </div>
        {!isHome && (
          <nav aria-label="Primary" className={`hidden border-t border-line/70 lg:block ${scrolled ? "lg:hidden" : ""}`}>
            <ul className="container-site flex items-center justify-center gap-7">
              <Suspense fallback={null}><NavLinks /></Suspense>
            </ul>
          </nav>
        )}
      </header>

      <Drawer open={menu} onClose={() => setMenu(false)} title="Menu" side="left">
        <nav aria-label="Mobile" className="p-4">
          <ul className="space-y-1"><Suspense fallback={null}><NavLinks mobile onNavigate={() => setMenu(false)} /></Suspense></ul>
          <div className="mt-6 grid gap-2 border-t border-line pt-6">
            <Link href={user ? "/account" : "/login"} onClick={() => setMenu(false)} className="btn-ghost justify-start"><User className="size-4" />{user ? "My account" : "Sign in / Register"}</Link>
            <Link href="/track-order" onClick={() => setMenu(false)} className="btn-ghost justify-start"><Package className="size-4" />Track an order</Link>
          </div>
        </nav>
      </Drawer>

      <Drawer open={search} onClose={() => setSearch(false)} title="Search" side="right">
        <div className="p-5">
          <SearchAutocomplete variant="sheet" autoFocus onNavigate={() => setSearch(false)} />
        </div>
      </Drawer>

      <CartDrawer />
    </>
  );
}
