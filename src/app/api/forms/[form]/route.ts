import { NextRequest } from "next/server";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers } from "@/db/schema";
import { isEmail, json, str } from "@/lib/validation";
import { siteConfig } from "@/config/site";

export async function POST(req: NextRequest, ctx: { params: Promise<{ form: string }> }) {
  const { form } = await ctx.params;
  const b = await req.json().catch(() => ({}));

  if (form === "newsletter") {
    const email = str(b.email, 200).toLowerCase();
    if (!isEmail(email)) return json({ errors: { email: "Enter a valid email address." } }, 422);
    if (!b.consent) return json({ errors: { consent: "Please confirm you'd like to receive emails." } }, 422);
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();
    return json({ ok: true, demo: !siteConfig.integrations.email });
  }

  if (form === "contact") {
    const errors: Record<string, string> = {};
    if (str(b.name).length < 2) errors.name = "Enter your name.";
    if (!isEmail(b.email)) errors.email = "Enter a valid email address.";
    if (str(b.subject).length < 3) errors.subject = "Add a subject.";
    if (str(b.message, 3000).length < 10) errors.message = "Your message should be at least 10 characters.";
    if (Object.keys(errors).length) return json({ errors }, 422);
    await db.insert(contactMessages).values({ name: str(b.name, 100), email: str(b.email, 200), subject: str(b.subject, 150), message: str(b.message, 3000) });
    return json({ ok: true });
  }
  return json({ error: "Not found" }, 404);
}
