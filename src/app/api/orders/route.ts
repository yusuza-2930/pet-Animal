import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { isEmail, json, str, validateAddress } from "@/lib/validation";
import { priceCart } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import type { CartLine } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  return json({ orders: rows });
}

/**
 * Creates an order. Prices, stock and coupons are re-validated against the
 * canonical catalog — client-sent totals are ignored.
 * Payment: only Cash on Delivery is available until a provider is configured.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const b = await req.json().catch(() => ({}));
  const errors: Record<string, string> = {};
  const email = str(b.email, 200).toLowerCase();
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  Object.assign(errors, validateAddress(b.address ?? {}));
  if (!siteConfig.commerce.shippingMethods.some((m) => m.id === b.shippingMethod)) errors.shippingMethod = "Choose a delivery method.";
  if (b.paymentMethod !== "cod") errors.paymentMethod = "Online payments are not configured. Please choose Cash on Delivery.";
  if (Object.keys(errors).length) return json({ errors }, 422);

  const lines: CartLine[] = Array.isArray(b.lines) ? b.lines : [];
  const priced = priceCart(lines, b.coupon, b.shippingMethod);
  if (!priced.lines.length) return json({ error: "Your cart is empty." }, 400);
  if (priced.couponError) return json({ error: `Coupon: ${priced.couponError}` }, 400);
  const unavailable = priced.lines.filter((l) => l.variant.stock < l.quantity);
  if (unavailable.length)
    return json({ error: `Not enough stock for: ${unavailable.map((l) => l.product.name).join(", ")}. Please update your cart.` }, 409);

  const reference = `SCP-${new Date().getFullYear().toString().slice(2)}${randomBytes(3).toString("hex").toUpperCase()}`;
  const a = b.address;
  const [order] = await db
    .insert(orders)
    .values({
      reference,
      userId: user?.id ?? null,
      email,
      items: priced.lines.map((l) => ({
        productId: l.product.id, sku: l.sku, name: l.product.name, options: l.variant.options, image: l.product.images[0].src, price: l.variant.price, quantity: l.quantity,
      })),
      shippingAddress: {
        fullName: str(a.fullName, 100), phone: str(a.phone, 20), line1: str(a.line1, 200), line2: str(a.line2, 200) || undefined,
        city: str(a.city, 80), state: str(a.state, 80), postalCode: str(a.postalCode, 6),
      },
      shippingMethod: priced.shippingMethod.label,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
      couponCode: priced.coupon?.code ?? null,
      subtotal: priced.subtotal,
      discount: priced.discount,
      shipping: priced.shipping,
      tax: priced.tax,
      total: priced.total,
      status: "placed",
      events: [{ status: "placed", at: new Date().toISOString(), note: "Order received" }],
    })
    .returning({ reference: orders.reference, email: orders.email });

  if (user) await db.update(users).set({ cart: [] }).where(eq(users.id, user.id));
  return json({ reference: order.reference, email: order.email });
}
