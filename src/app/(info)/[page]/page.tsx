import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/misc";

export const dynamicParams = false;

type Page = { title: string; sub: string; body: React.ReactNode };
const c = siteConfig.contact;

const pages: Record<string, Page> = {
  about: {
    title: `About ${siteConfig.name}`,
    sub: "A small team of pet parents building a calmer, more thoughtful way to shop for companions.",
    body: (
      <>
        <div className="relative mb-10 aspect-[16/8] overflow-hidden rounded-[var(--radius-promo)]"><Image src="/images/hero.jpg" alt="A pug and a grey cat sitting together at home" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" /></div>
        <h2 id="story">Our story</h2>
        <p>We started {siteConfig.name} because shopping for our own pets felt overwhelming — endless options, unclear materials and little guidance. So we decided to stock fewer, better things: products we have reviewed for materials, safety information and everyday usefulness.</p>
        <h2>What we believe</h2>
        <ul>
          <li><strong>Thoughtful selection</strong> — a focused range rather than an endless catalogue.</li>
          <li><strong>Honest information</strong> — clear specifications, care and safety notes on every product.</li>
          <li><strong>Real reviews only</strong> — we never publish invented or paid reviews.</li>
          <li><strong>Friendly support</strong> — real people who care about your companion.</li>
        </ul>
        <h2>Not veterinary advice</h2>
        <p>We&apos;re pet lovers, not veterinarians. Product suggestions on this site are for general guidance only. For health, dietary or behavioural concerns, please consult a qualified vet.</p>
      </>
    ),
  },
  faq: {
    title: "Frequently Asked Questions",
    sub: "Quick answers about orders, delivery, returns and your account.",
    body: (
      <>
        {[
          ["How do I pay?", "We currently accept Cash on Delivery. Online card and UPI payments will be enabled once our payment provider is configured — we never collect card details on this site."],
          ["How long does delivery take?", "Standard delivery usually takes 4–7 business days and express 1–3 business days, depending on your PIN code. Exact estimates are shown at checkout."],
          ["Do you offer free shipping?", `Yes — standard shipping is free on orders over ₹${siteConfig.commerce.freeShippingThreshold.toLocaleString("en-IN")} (after discounts).`],
          ["How do I track my order?", "Use the Track Order page with your order reference and the email used at checkout. Signed-in customers can also see orders in their account."],
          ["Can I return an item?", "Unused items in original packaging can be returned within 14 days of delivery. Opened food and consumables can't be returned for hygiene reasons."],
          ["Are items in my wishlist reserved?", "No. Wishlists help you remember products, but stock and prices may change."],
          ["Do you offer grooming appointments?", "Not at the moment — we focus on products. If we add services in future, booking will appear here."],
        ].map(([q, a]) => <div key={q}><h2>{q}</h2><p>{a}</p></div>)}
      </>
    ),
  },
  shipping: {
    title: "Shipping Information",
    sub: "Where we deliver, how long it takes and what it costs.",
    body: (
      <>
        <h2>Delivery options</h2>
        <ul>{siteConfig.commerce.shippingMethods.map((m) => <li key={m.id}><strong>{m.label}</strong> — estimated {m.eta}, ₹{m.price}{m.id === "standard" && ` (free over ₹${siteConfig.commerce.freeShippingThreshold.toLocaleString("en-IN")})`}</li>)}</ul>
        <p className="mt-3">These rates are configurable store settings and will be confirmed with our logistics partner before launch. Delivery estimates are not guarantees.</p>
        <h2>Dispatch</h2><p>Orders are usually prepared within 1–2 business days. You can follow progress from the Track Order page.</p>
        <h2>Coverage</h2><p>We deliver to serviceable PIN codes across India. If your PIN code isn&apos;t serviceable, we&apos;ll contact you before dispatch.</p>
      </>
    ),
  },
  returns: {
    title: "Returns & Refunds",
    sub: "Simple, fair returns for unused items.",
    body: (
      <>
        <h2>Return window</h2><p>You can request a return within 14 days of delivery for unused items in their original packaging.</p>
        <h2>Non-returnable items</h2><ul><li>Opened food, treats and consumables</li><li>Used grooming products</li><li>Items damaged through misuse</li></ul>
        <h2>How to request a return</h2><p>Email <a href={`mailto:${c.email}`} className="underline">{c.email}</a> with your order reference. We&apos;ll reply with next steps.</p>
        <h2>Refunds</h2><p>For Cash on Delivery orders, refunds are issued to a bank account or UPI ID you provide once the return has been inspected.</p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    sub: "How we collect, use and protect your information.",
    body: (
      <>
        <p><em>This is a template policy and must be reviewed by a legal professional before launch.</em></p>
        <h2>What we collect</h2><ul><li>Account details: name, email, optional phone number</li><li>Order details: delivery addresses and purchased items</li><li>Optional pet profiles you choose to create</li><li>Newsletter email address, only with your consent</li></ul>
        <h2>How we use it</h2><p>To process orders, provide customer support, keep your cart and wishlist in sync, and — if you choose — tailor product suggestions. We do not sell your personal data.</p>
        <h2>Security</h2><p>Passwords are hashed with scrypt; sessions use secure, HTTP-only cookies. We do not collect or store card details.</p>
        <h2>Local storage</h2><p>Your cart, wishlist and recently viewed items are stored in your browser so they persist between visits.</p>
        <h2>Contact</h2><p>Questions? Email <a href={`mailto:${c.email}`} className="underline">{c.email}</a>.</p>
      </>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    sub: "The terms that apply when you use this store.",
    body: (
      <>
        <p><em>This is a template and must be reviewed by a legal professional before launch.</em></p>
        <h2>Orders</h2><p>An order is confirmed once you receive an order reference. We may cancel orders affected by stock or pricing errors and will notify you if this happens.</p>
        <h2>Pricing</h2><p>Prices are shown in INR and include applicable taxes. Shipping charges are shown at checkout before you place your order.</p>
        <h2>Product information</h2><p>We aim for accurate descriptions. Product information is general guidance and not veterinary advice.</p>
        <h2>Business details</h2><p>{c.address}</p>
      </>
    ),
  },
  "care-guide": {
    title: "Pet Care & Product Guide",
    sub: "Practical, general guidance for choosing everyday essentials.",
    body: (
      <>
        <h2 id="sizing">Choosing the right size</h2>
        <ul><li><strong>Beds:</strong> measure your pet curled up, nose to tail, and add around 10 cm.</li><li><strong>Collars:</strong> measure the neck and add two fingers&apos; width.</li><li><strong>Toys:</strong> choose a toy larger than your pet&apos;s mouth to reduce choking risk.</li></ul>
        <h2>Changing food</h2><p>Transition gradually over about 7 days, mixing increasing amounts of the new food with the old. Always provide fresh water.</p>
        <h2>Grooming basics</h2><p>Brush regularly to reduce shedding and tangles. Use pet-specific shampoo and patch test first.</p>
        <h2>Safety first</h2><p>Supervise play, replace damaged toys and store treats securely. For any health concerns, consult your veterinarian — this guide is not veterinary advice.</p>
        <p className="mt-6"><Link href="/shop" className="font-semibold text-slate underline">Browse essentials →</Link></p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const p = pages[(await params).page];
  return p ? { title: p.title, description: p.sub } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const p = pages[page];
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.title} sub={p.sub} crumbs={[{ label: "Home", href: "/" }, { label: p.title }]} />
      <div className="container-site py-12"><article className="prose-info max-w-3xl">{p.body}</article></div>
    </>
  );
}
