"use client";

import Link from "next/link";
import { ShoppingBag, Lock } from "lucide-react";
import { CouponForm } from "@/components/cart/CouponForm";
import { useStore } from "@/components/providers/StoreProvider";
import { CartLineRow, FreeShippingMeter } from "@/components/layout/CartDrawer";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { formatPrice, priceCart } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import { Recommended } from "@/components/home/Recommended";

export default function CartPage() {
  const { totals, hydrated, coupon } = useStore();
  const t = priceCart(totals.lines, coupon);
  return (
    <>
      <PageHeader title="Your Cart" crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <div className="container-site py-10">
        {!hydrated ? (
          <div className="h-64 animate-pulse rounded-3xl bg-pale" aria-busy="true" />
        ) : totals.lines.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="size-7" />} title="Your cart is empty" text="Looks like you haven't added anything yet. Explore our bestsellers to get started." action={<Link href="/shop" className="btn-primary">Continue shopping</Link>} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <FreeShippingMeter />
              <ul className="mt-2 divide-y divide-line">{totals.lines.map((l) => <CartLineRow key={l.sku} line={l} />)}</ul>
              <Link href="/shop" className="mt-4 inline-block text-[14px] font-semibold text-slate hover:underline">← Continue shopping</Link>
            </div>
            <aside className="h-fit space-y-5 rounded-[var(--radius-card)] bg-pale p-6 lg:sticky lg:top-28" aria-label="Order summary">
              <h2 className="text-lg font-bold">Order summary</h2>
              <CouponForm />
              <dl className="space-y-2 border-t border-white pt-4 text-[14px]">
                <div className="flex justify-between"><dt className="text-muted">Subtotal ({t.itemCount} items)</dt><dd className="font-semibold">{formatPrice(t.subtotal)}</dd></div>
                {t.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{formatPrice(t.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted">Estimated shipping</dt><dd>{t.shipping ? formatPrice(t.shipping) : "Free"}</dd></div>
                <div className="flex justify-between border-t border-white pt-3 text-base font-bold"><dt>Estimated total</dt><dd>{formatPrice(t.total)}</dd></div>
              </dl>
              <p className="text-[12px] text-muted">Prices include applicable taxes. Shipping is an estimate for {siteConfig.commerce.shippingMethods[0].label.toLowerCase()} and is confirmed at checkout.</p>
              <Link href="/checkout" className="btn-primary w-full min-h-12"><Lock className="size-4" aria-hidden />Proceed to checkout</Link>
            </aside>
          </div>
        )}
        <div className="mt-20"><Recommended title="You Might Also Like" /></div>
      </div>
    </>
  );
}
