import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/server/auth";
import { formatPrice } from "@/lib/catalog";
import { EmptyState } from "@/components/ui/misc";
import { BuyAgainButton } from "@/components/account/AccountPanels";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();
  const list = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate">Order history</h1>
      {list.length === 0 ? (
        <EmptyState icon={<Package className="size-7" />} title="No orders yet" text="When you place an order while signed in, it will appear here." action={<Link href="/shop" className="btn-primary">Start shopping</Link>} />
      ) : (
        <ul className="space-y-4">
          {list.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-bold">{o.reference}</p><p className="text-[13px] text-muted">{o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {o.items.reduce((s, i) => s + i.quantity, 0)} items · {formatPrice(o.total)}</p></div>
                <span className="rounded-full bg-pale px-3 py-1 text-[12px] font-semibold capitalize">{o.status.replace("_", " ")}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {o.items.slice(0, 5).map((it) => <span key={it.sku} className="relative size-12 overflow-hidden rounded-lg bg-[#F3F5F6]"><Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" /></span>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><Link href={`/account/orders/${o.reference}`} className="btn-primary btn-sm">View details</Link><BuyAgainButton items={o.items} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
