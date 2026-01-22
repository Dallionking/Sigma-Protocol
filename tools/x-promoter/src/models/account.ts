import { z } from 'zod';

// Schema for product information
export const ProductSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string().optional(),
  githubUrl: z.string().url(),
  creator: z.string(),
  features: z.array(z.string()).optional(),
});

// Schema for tone weights (must sum to 1.0)
export const ToneWeightsSchema = z.object({
  educational: z.number().min(0).max(1),
  relatable: z.number().min(0).max(1),
  valueFirst: z.number().min(0).max(1),
  direct: z.number().min(0).max(1),
});

// Schema for account settings
export const AccountSettingsSchema = z.object({
  maxRepliesPerDay: z.number().int().positive().default(100),
  minIntervalMinutes: z.number().int().positive().default(5),
  toneWeights: ToneWeightsSchema.optional(),
});

// Schema for X API credentials
export const CredentialsSchema = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
  accessToken: z.string(),
  accessTokenSecret: z.string(),
  bearerToken: z.string().optional(),
});

// Schema for a single account
export const AccountSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Account ID must be lowercase alphanumeric with hyphens'),
  name: z.string(),
  enabled: z.boolean().default(true),
  product: ProductSchema,
  settings: AccountSettingsSchema,
  keywords: z.array(z.string()),
  excludeKeywords: z.array(z.string()).optional(),
  targetAccounts: z.array(z.string()).optional(),
  credentials: CredentialsSchema.optional(), // Loaded from env at runtime
});

// Schema for global settings
export const GlobalSettingsSchema = z.object({
  schedulerIntervalMinutes: z.number().int().positive().default(5),
  globalDailyLimit: z.number().int().positive().default(300),
  avoidReplyingToSameUserWithinHours: z.number().int().positive().default(24),
  prioritizeRecentTweets: z.boolean().default(true),
  maxTweetAgeHours: z.number().int().positive().default(6),
});

// Schema for the full accounts config file
export const AccountsConfigSchema = z.object({
  accounts: z.array(AccountSchema),
  globalSettings: GlobalSettingsSchema,
});

// Type exports
export type Product = z.infer<typeof ProductSchema>;
export type ToneWeights = z.infer<typeof ToneWeightsSchema>;
export type AccountSettings = z.infer<typeof AccountSettingsSchema>;
export type Credentials = z.infer<typeof CredentialsSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;
export type AccountsConfig = z.infer<typeof AccountsConfigSchema>;

// Tone types
export type ToneType = 'educational' | 'relatable' | 'valueFirst' | 'direct';

// Account with loaded credentials (runtime type)
export interface LoadedAccount extends Account {
  credentials: Credentials;
}


