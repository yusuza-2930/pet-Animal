import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { json, str } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const reference = str(b.reference, 40).toUpperCase();
  const email = str(b.email, 200).toLowerCase();
  if (!reference || !email) return json({ error: "Enter your order reference and email." }, 422);
  const [o] = await db.select().from(orders).where(and(eq(orders.reference, reference), eq(orders.email, email))).limit(1);
  if (!o) return json({ error: "We couldn't find an order matching those details." }, 404);
  return json({ order: o });
}
