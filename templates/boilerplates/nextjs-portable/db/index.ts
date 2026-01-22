import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as users from "./schema/users";
import * as subscriptions from "./schema/subscriptions";

/**
 * Database Connection Pool
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle Database Client
 * 
 * Type-safe database client with all schemas.
 * 
 * @example
 * ```ts
 * import { db } from "@/db";
 * import { users } from "@/db/schema/users";
 * import { eq } from "drizzle-orm";
 * 
 * const user = await db.query.users.findFirst({
 *   where: eq(users.email, "user@example.com"),
 * });
 * ```
 * 
 * @stable since 1.0.0
 */
export const db = drizzle(pool, {
  schema: {
    ...users,
    ...subscriptions,
  },
});

// Re-export schemas for convenience
export * from "./schema/users";
export * from "./schema/subscriptions";

