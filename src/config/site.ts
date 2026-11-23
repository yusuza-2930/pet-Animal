/**
 * Central brand + commerce settings.
 * Change the brand name, announcement, currency, shipping rules and contact
 * placeholders here — every component reads from this file.
 */
export const siteConfig = {
  name: "Vibology",
  shortName: "Vibology",
  tagline: "Premium pet care, thoughtfully selected",
  description:
    "Thoughtfully selected food, toys, accessories and everyday essentials for happier, healthier pets.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  announcement: {
    message: "Use code WELCOME10 for 10% off your first order",
    shipping: "Free shipping on orders over ₹1,499",
    location: "Delivering across India",
  },

  marquee: ["Thoughtful Care", "Happy Pets", "Everyday Essentials", "Safe Materials", "Friendly Support"],

  commerce: {
    currency: "INR",
    locale: "en-IN",
    freeShippingThreshold: 1499,
    /**
     * Shipping methods are configurable placeholders. Final rates must be
     * confirmed with a real logistics partner before launch.
     */
    shippingMethods: [
      { id: "standard", label: "Standard delivery", eta: "4–7 business days", price: 99 },
      { id: "express", label: "Express delivery", eta: "1–3 business days", price: 199 },
    ],
    /** Tax is shown as an estimate only. Set to 0 to hide. Prices are treated as tax-inclusive. */
    taxRateEstimate: 0,
    taxInclusive: true,
    maxQuantityPerLine: 10,
    /** Demo coupons — validated server-side at checkout. */
    coupons: {
      WELCOME10: { type: "percent", value: 10, label: "10% off your first order", minSubtotal: 0 },
      PETLOVE200: { type: "fixed", value: 200, label: "₹200 off orders over ₹1,999", minSubtotal: 1999 },
    } as Record<string, { type: "percent" | "fixed"; value: number; label: string; minSubtotal: number }>,
  },

  /** Clearly-marked placeholders — replace before launch. */
  contact: {
    email: "support@your-domain.example",
    phone: "[Configure phone number]",
    hours: "[Configure business hours]",
    address: "[Configure registered business address]",
  },

  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],

  /** Integration status — used to label demo behaviour honestly in the UI. */
  integrations: {
    payments: false, // No payment provider configured → Cash on Delivery / test mode only
    email: false, // No email provider configured → newsletter + password reset are local demo flows
    booking: false, // This store does not offer bookable services
  },
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Dogs", href: "/shop?animal=dog" },
  { label: "Cats", href: "/shop?animal=cat" },
  { label: "Small Pets", href: "/shop?animal=small-pet" },
  { label: "Birds", href: "/shop?animal=bird" },
  { label: "Food & Nutrition", href: "/category/food-nutrition" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Offers", href: "/shop?offers=1" },
];
