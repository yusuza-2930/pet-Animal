import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { json, str, validateAddress } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const rows = await db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault), desc(addresses.id));
  return json({ addresses: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const b = await req.json().catch(() => ({}));
  const errors = validateAddress(b);
  if (Object.keys(errors).length) return json({ errors }, 422);
  const isDefault = !!b.isDefault;
  if (isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  const [row] = await db
    .insert(addresses)
    .values({
      userId: user.id, label: str(b.label, 30) || "Home", fullName: str(b.fullName, 100), phone: str(b.phone, 20), line1: str(b.line1, 200),
      line2: str(b.line2, 200) || null, city: str(b.city, 80), state: str(b.state, 80), postalCode: str(b.postalCode, 6), isDefault,
    })
    .returning();
  return json({ address: row });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const id = Number(req.nextUrl.searchParams.get("id"));
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  return json({ ok: true });
}
