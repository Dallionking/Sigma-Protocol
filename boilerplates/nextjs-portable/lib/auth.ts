import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

/**
 * Better Auth Configuration
 * 
 * Flexible auth that works with any database.
 * 
 * @stable since 1.0.0
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },
});

export type Session = typeof auth.$Infer.Session;

