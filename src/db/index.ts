import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// -------------------------------------------------------------------
// PostgreSQL connection pool – uses the Neon pooler URL from .env
// -------------------------------------------------------------------
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Abort any query that runs longer than 5 seconds – prevents hanging connections
  statement_timeout: 5_000,
  // Keep a modest pool size; Neon manages connections efficiently
  max: process.env.NODE_ENV === "development" ? 2 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";

// -------------------------------------------------------------------
// Simple retry wrapper – limited to 2 attempts with a steady 1‑second back‑off
// -------------------------------------------------------------------
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Wait a solid second before retrying – avoids flood‑load on Neon
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }
  console.error("DB operation failed after retries", lastError);
  throw lastError;
}
