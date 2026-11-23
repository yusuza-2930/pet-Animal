import { NextRequest } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { json, str } from "@/lib/validation";
import { getProductById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  const rows = await db
    .select({ id: reviews.id, authorName: reviews.authorName, rating: reviews.rating, title: reviews.title, body: reviews.body, verifiedPurchase: reviews.verifiedPurchase, createdAt: reviews.createdAt })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt));
  const user = await getCurrentUser();
  return json({ reviews: rows, signedIn: !!user });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Please sign in to write a review." }, 401);
  const b = await req.json().catch(() => ({}));
  const productId = str(b.productId, 20);
  if (!getProductById(productId)) return json({ error: "Unknown product." }, 404);
  const errors: Record<string, string> = {};
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Choose a rating from 1 to 5 stars.";
  if (str(b.title, 100).length < 3) errors.title = "Add a short title (at least 3 characters).";
  if (str(b.body, 2000).length < 20) errors.body = "Tell us a little more (at least 20 characters).";
  if (Object.keys(errors).length) return json({ errors }, 422);

  // Verified purchase only if this account has an order containing the product.
  const purchased = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.userId, user.id), sql`${orders.items} @> ${JSON.stringify([{ productId }])}::jsonb`))
    .limit(1);
  try {
    await db.insert(reviews).values({
      productId, userId: user.id, authorName: user.name.split(" ")[0] + (user.name.split(" ")[1] ? ` ${user.name.split(" ")[1][0]}.` : ""),
      rating, title: str(b.title, 100), body: str(b.body, 2000), verifiedPurchase: purchased.length > 0,
    });
  } catch {
    return json({ error: "You've already reviewed this product." }, 409);
  }
  return json({ ok: true });
}
