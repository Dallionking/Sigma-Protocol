import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Subscriptions Table
 * 
 * Stripe subscription management.
 * 
 * @stable since 1.0.0
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  status: text("status").notNull().default("inactive"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: timestamp("cancel_at_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Credits Table
 * 
 * Usage-based credit system.
 * 
 * @stable since 1.0.0
 */
export const credits = pgTable("credits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  lifetimeTotal: integer("lifetime_total").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Credit Transactions Table
 * 
 * Audit log for credit changes.
 */
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'purchase', 'consume', 'refund', 'grant'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

