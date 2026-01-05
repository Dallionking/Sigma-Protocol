import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Convex Database Schema
 * 
 * Extends auth tables with custom application tables.
 * 
 * @stable since 1.0.0
 */
export default defineSchema({
  // Auth tables (users, sessions, accounts, etc.)
  ...authTables,

  // User profiles (extends auth users)
  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Conversations (for AI chat)
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Messages (within conversations)
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});

