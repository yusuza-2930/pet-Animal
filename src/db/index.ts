import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzleDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

export function getDb() {
  if (!globalForDb.__arenaNextJsDrizzleDb) {
    const activePool = getPool();
    globalForDb.__arenaNextJsDrizzleDb = drizzle(activePool, { schema });
  }
  return globalForDb.__arenaNextJsDrizzleDb;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, realDb);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
  has(_target, prop) {
    return Reflect.has(getDb(), prop);
  },
  ownKeys(_target) {
    return Reflect.ownKeys(getDb());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getDb(), prop);
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const realPool = getPool();
    const value = Reflect.get(realPool, prop, realPool);
    if (typeof value === "function") {
      return value.bind(realPool);
    }
    return value;
  },
  has(_target, prop) {
    return Reflect.has(getPool(), prop);
  },
  ownKeys(_target) {
    return Reflect.ownKeys(getPool());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getPool(), prop);
  },
});
