import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { petProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { json, str } from "@/lib/validation";

const ANIMALS = ["dog", "cat", "small-pet", "bird"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ pets: [] });
  const rows = await db.select().from(petProfiles).where(eq(petProfiles.userId, user.id)).orderBy(desc(petProfiles.id));
  return json({ pets: rows });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const b = await req.json().catch(() => ({}));
  const errors: Record<string, string> = {};
  if (str(b.name, 50).length < 1) errors.name = "Enter your pet's name.";
  if (!ANIMALS.includes(b.animal)) errors.animal = "Choose an animal type.";
  if (Object.keys(errors).length) return json({ errors }, 422);
  const [row] = await db
    .insert(petProfiles)
    .values({
      userId: user.id, name: str(b.name, 50), animal: b.animal, breed: str(b.breed, 80) || null, ageRange: str(b.ageRange, 30) || null,
      dietary: str(b.dietary, 200) || null, sensitivities: str(b.sensitivities, 200) || null,
    })
    .returning();
  return json({ pet: row });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in required." }, 401);
  const id = Number(req.nextUrl.searchParams.get("id"));
  await db.delete(petProfiles).where(and(eq(petProfiles.id, id), eq(petProfiles.userId, user.id)));
  return json({ ok: true });
}
