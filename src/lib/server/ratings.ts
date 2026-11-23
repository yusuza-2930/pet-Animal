import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";

/** Aggregated ratings from real, published reviews only. */
export async function getRatings(): Promise<Record<string, { avg: number; count: number }>> {
  try {
    const rows = await db
      .select({ productId: reviews.productId, avg: sql<number>`avg(${reviews.rating})::float`, count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.status, "published"))
      .groupBy(reviews.productId);
    return Object.fromEntries(rows.map((r) => [r.productId, { avg: Number(r.avg), count: Number(r.count) }]));
  } catch {
    return {};
  }
}
