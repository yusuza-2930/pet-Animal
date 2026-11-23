import { pgTable, serial, text, integer, timestamp, jsonb, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  cart: jsonb("cart").$type<{ productId: string; sku: string; quantity: number }[]>().notNull().default([]),
  wishlist: jsonb("wishlist").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 of the cookie token
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(), // sha256 of token
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export type OrderItem = { productId: string; sku: string; name: string; options: Record<string, string>; image: string; price: number; quantity: number };
export type ShippingAddress = { fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; postalCode: string };
export type OrderEvent = { status: string; at: string; note?: string };

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>().notNull(),
    shippingMethod: text("shipping_method").notNull(),
    paymentMethod: text("payment_method").notNull(),
    paymentStatus: text("payment_status").notNull(),
    couponCode: text("coupon_code"),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    shipping: integer("shipping").notNull(),
    tax: integer("tax").notNull().default(0),
    total: integer("total").notNull(),
    status: text("status").notNull().default("placed"),
    events: jsonb("events").$type<OrderEvent[]>().notNull().default([]),
    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    verifiedPurchase: boolean("verified_purchase").notNull().default(false),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("reviews_user_product_idx").on(t.userId, t.productId), index("reviews_product_idx").on(t.productId)],
);

export const petProfiles = pgTable("pet_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  animal: text("animal").notNull(),
  breed: text("breed"),
  ageRange: text("age_range"),
  dietary: text("dietary"),
  sensitivities: text("sensitivities"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
