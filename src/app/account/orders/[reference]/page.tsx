import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/server/auth";
import { OrderDetails } from "@/components/order/OrderDetails";
import { BuyAgainButton } from "@/components/account/AccountPanels";

export default async function OrderDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const user = await requireUser();
  const [o] = await db.select().from(orders).where(and(eq(orders.reference, reference), eq(orders.userId, user.id))).limit(1);
  if (!o) notFound();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/account/orders" className="text-[14px] font-semibold text-slate hover:underline">← All orders</Link><BuyAgainButton items={o.items} /></div>
      <OrderDetails order={o} />
    </div>
  );
}
