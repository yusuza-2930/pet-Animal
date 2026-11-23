import type { Metadata } from "next";
import { Mail, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/misc";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Contact us", description: "Get in touch with our friendly customer support team." };

export default function ContactPage() {
  const c = siteConfig.contact;
  return (
    <>
      <PageHeader title="We're Here to Help" sub="Questions about a product, an order or your pet's essentials? Send us a message." crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-4">
          <li className="card flex gap-4 p-5"><Mail className="size-5 text-slate" aria-hidden /><div><p className="font-semibold">Email</p><a href={`mailto:${c.email}`} className="text-muted hover:underline">{c.email}</a></div></li>
          <li className="card flex gap-4 p-5"><Phone className="size-5 text-slate" aria-hidden /><div><p className="font-semibold">Phone</p><p className="text-muted">{c.phone}</p></div></li>
          <li className="card flex gap-4 p-5"><Clock className="size-5 text-slate" aria-hidden /><div><p className="font-semibold">Hours</p><p className="text-muted">{c.hours}</p></div></li>
        </ul>
        <ContactForm />
      </div>
    </>
  );
}
