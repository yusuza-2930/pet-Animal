import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { json } from "@/lib/validation";
import { getProductById, getVariant } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import type { CartLine } from "@/lib/types";

export const dynamic = "force-dynamic";

function sanitizeCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const map = new Map<string, CartLine>();
  for (const raw of input as CartLine[]) {
    const p = raw && getProductById(String(raw.productId));
    if (!p || !getVariant(p, String(raw.sku))) continue;
    const q = Math.max(1, Math.min(siteConfig.commerce.maxQuantityPerLine, Math.floor(Number(raw.quantity) || 1)));
    const prev = map.get(raw.sku);
    map.set(raw.sku, { productId: p.id, sku: raw.sku, quantity: Math.min(siteConfig.commerce.maxQuantityPerLine, (prev?.quantity ?? 0) + q) });
  }
  return [...map.values()];
}
const sanitizeWishlist = (input: unknown) =>
  Array.isArray(input) ? [...new Set(input.map(String).filter((id) => getProductById(id)))] : [];

/** POST = merge local state into account (on sign-in). PUT = replace account state (on change). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const body = await req.json().catch(() => ({}));
  const [row] = await db.select({ cart: users.cart, wishlist: users.wishlist }).from(users).where(eq(users.id, user.id));
  const localCart = sanitizeCart(body.cart);
  const serverCart = sanitizeCart(row?.cart);
  const merged = new Map(serverCart.map((l) => [l.sku, l]));
  for (const l of localCart) if (!merged.has(l.sku)) merged.set(l.sku, l); else merged.set(l.sku, { ...l, quantity: Math.max(l.quantity, merged.get(l.sku)!.quantity) });
  const cart = [...merged.values()];
  const wishlist = sanitizeWishlist([...(row?.wishlist ?? []), ...sanitizeWishlist(body.wishlist)]);
  await db.update(users).set({ cart, wishlist }).where(eq(users.id, user.id));
  return json({ cart, wishlist });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const body = await req.json().catch(() => ({}));
  const patch: { cart?: CartLine[]; wishlist?: string[] } = {};
  if ("cart" in body) patch.cart = sanitizeCart(body.cart);
  if ("wishlist" in body) patch.wishlist = sanitizeWishlist(body.wishlist);
  if (Object.keys(patch).length) await db.update(users).set(patch).where(eq(users.id, user.id));
  return json({ ok: true });
}
