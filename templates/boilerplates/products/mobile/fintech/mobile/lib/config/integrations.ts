/**
 * Integration Configuration
 *
 * Configurable broker provider and third-party service endpoints.
 * Update environment variables and endpoints for your setup.
 */

export const integrations = {
  /** Broker provider configuration */
  broker: {
    provider: 'tradelocker' as 'tradelocker' | 'alpaca' | 'interactive_brokers' | 'custom',
    tradelocker: {
      demoApi: 'https://demo.tradelocker.com/backend-api',
      liveApi: 'https://live.tradelocker.com/backend-api',
      authEndpoint: '/auth/jwt/token',
      accountsEndpoint: '/auth/jwt/all-accounts',
      refreshEndpoint: '/auth/jwt/refresh',
      /** Set via TRADELOCKER_CLIENT_ID env var */
      clientId: process.env.EXPO_PUBLIC_TRADELOCKER_CLIENT_ID || '',
      /** Set via TRADELOCKER_REDIRECT_URI env var */
      redirectUri: process.env.EXPO_PUBLIC_TRADELOCKER_REDIRECT_URI || 'trading-platform://broker/callback',
    },
  },

  /** Supabase configuration */
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  /** RevenueCat subscription management */
  revenuecat: {
    apiKey: process.env.REVENUECAT_API_KEY || '',
    /** Entitlement identifiers mapped to plan tiers */
    entitlements: {
      basic: 'basic_access',
      pro: 'pro_access',
      elite: 'elite_access',
    },
  },

  /** Push notification configuration */
  notifications: {
    /** Set to your Expo push notification experience ID */
    experienceId: process.env.EXPO_PUBLIC_EXPERIENCE_ID || '',
  },
} as const;

export type IntegrationConfig = typeof integrations;
