import Link from "next/link";
import { desc, eq, count } from "drizzle-orm";
import { db } from "@/db";
import { orders, petProfiles, users } from "@/db/schema";
import { requireUser } from "@/lib/server/auth";
import { ProfileForm } from "@/components/account/AccountPanels";
import { formatPrice } from "@/lib/catalog";
import { Package, PawPrint, MapPin } from "lucide-react";

export default async function AccountPage() {
  const user = await requireUser();
  const [recent, [{ n: petCount }], [u]] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(3),
    db.select({ n: count() }).from(petProfiles).where(eq(petProfiles.userId, user.id)),
    db.select({ phone: users.phone }).from(users).where(eq(users.id, user.id)),
  ]);
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-promo)] bg-hero p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-slate/70">Welcome back</p>
        <h1 className="font-display text-3xl font-extrabold text-slate">Hello, {user.name.split(" ")[0]} 🐾</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link href="/account/orders" className="glass flex items-center gap-3 rounded-2xl p-4"><Package className="size-5 text-slate" aria-hidden /><span className="text-[14px] font-semibold">Orders</span></Link>
          <Link href="/account/pets" className="glass flex items-center gap-3 rounded-2xl p-4"><PawPrint className="size-5 text-slate" aria-hidden /><span className="text-[14px] font-semibold">{petCount ? `${petCount} pet profile${petCount > 1 ? "s" : ""}` : "Add a pet"}</span></Link>
          <Link href="/account/addresses" className="glass flex items-center gap-3 rounded-2xl p-4"><MapPin className="size-5 text-slate" aria-hidden /><span className="text-[14px] font-semibold">Addresses</span></Link>
        </div>
      </div>
      <section className="card p-5 sm:p-6" aria-labelledby="recent-orders">
        <div className="mb-3 flex items-center justify-between"><h2 id="recent-orders" className="text-lg font-bold">Recent orders</h2><Link href="/account/orders" className="text-[13px] font-semibold text-slate hover:underline">View all</Link></div>
        {recent.length === 0 ? <p className="text-[14px] text-muted">No orders yet. <Link href="/shop" className="font-semibold text-slate underline">Start shopping</Link></p> : (
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li key={o.id}><Link href={`/account/orders/${o.reference}`} className="flex items-center justify-between py-3 text-[14px] hover:text-slate"><span><strong>{o.reference}</strong><span className="ml-2 text-muted">{o.createdAt.toLocaleDateString("en-IN")}</span></span><span className="flex items-center gap-3"><span className="rounded-full bg-pale px-2.5 py-0.5 text-[12px] font-semibold capitalize">{o.status.replace("_", " ")}</span><strong>{formatPrice(o.total)}</strong></span></Link></li>
            ))}
          </ul>
        )}
      </section>
      <ProfileForm name={user.name} phone={u?.phone ?? null} email={user.email} />
    </div>
  );
}
