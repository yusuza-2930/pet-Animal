import { NextRequest } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import { createSession, destroySession, getCurrentUser, hashPassword, newToken, sha256, verifyPassword } from "@/lib/server/auth";
import { isEmail, json, str, validatePassword } from "@/lib/validation";
import { siteConfig } from "@/config/site";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action !== "me") return json({ error: "Not found" }, 404);
  const user = await getCurrentUser();
  return json({ user });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  switch (action) {
    case "register": {
      const email = str(body.email, 200).toLowerCase();
      const name = str(body.name, 100);
      const errors: Record<string, string> = {};
      if (name.length < 2) errors.name = "Enter your name.";
      if (!isEmail(email)) errors.email = "Enter a valid email address.";
      const pwErr = validatePassword(body.password);
      if (pwErr) errors.password = pwErr;
      if (Object.keys(errors).length) return json({ errors }, 422);
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing.length) return json({ errors: { email: "An account with this email already exists." } }, 409);
      const [u] = await db.insert(users).values({ email, name, passwordHash: await hashPassword(body.password as string) }).returning({ id: users.id });
      await createSession(u.id);
      return json({ user: { id: u.id, email, name } });
    }
    case "login": {
      const email = str(body.email, 200).toLowerCase();
      const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const ok = u && typeof body.password === "string" && (await verifyPassword(body.password, u.passwordHash));
      if (!ok) return json({ error: "Email or password is incorrect." }, 401);
      await createSession(u.id);
      return json({ user: { id: u.id, email: u.email, name: u.name } });
    }
    case "logout": {
      await destroySession();
      return json({ ok: true });
    }
    case "forgot": {
      const email = str(body.email, 200).toLowerCase();
      if (!isEmail(email)) return json({ errors: { email: "Enter a valid email address." } }, 422);
      const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      let demoLink: string | undefined;
      if (u) {
        const token = newToken();
        await db.insert(passwordResets).values({ id: sha256(token), userId: u.id, expiresAt: new Date(Date.now() + 3600e3) });
        // No email provider configured: expose the link ONLY in this clearly-labelled demo mode.
        if (!siteConfig.integrations.email) demoLink = `/reset-password?token=${token}`;
      }
      return json({ ok: true, demoLink, emailConfigured: siteConfig.integrations.email });
    }
    case "reset": {
      const token = str(body.token, 200);
      const pwErr = validatePassword(body.password);
      if (pwErr) return json({ errors: { password: pwErr } }, 422);
      const [r] = await db
        .select()
        .from(passwordResets)
        .where(and(eq(passwordResets.id, sha256(token)), eq(passwordResets.used, false), gt(passwordResets.expiresAt, new Date())))
        .limit(1);
      if (!r) return json({ error: "This reset link is invalid or has expired." }, 400);
      await db.update(users).set({ passwordHash: await hashPassword(body.password as string) }).where(eq(users.id, r.userId));
      await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, r.id));
      await db.delete(sessions).where(eq(sessions.userId, r.userId));
      return json({ ok: true });
    }
    case "profile": {
      const user = await getCurrentUser();
      if (!user) return json({ error: "Sign in required." }, 401);
      const name = str(body.name, 100);
      const phone = str(body.phone, 20) || null;
      if (name.length < 2) return json({ errors: { name: "Enter your name." } }, 422);
      await db.update(users).set({ name, phone }).where(eq(users.id, user.id));
      return json({ ok: true });
    }
  }
  return json({ error: "Not found" }, 404);
}
