import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

/**
 * Initialize RevenueCat
 * 
 * Call this once at app startup (in _layout.tsx).
 * 
 * @param userId - Optional user ID for cross-platform identification
 * 
 * @stable since 1.0.0
 */
export async function initRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === "ios" 
    ? REVENUECAT_API_KEY_IOS 
    : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn("RevenueCat API key not configured");
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({
    apiKey,
    appUserID: userId,
  });
}

/**
 * Identify user in RevenueCat
 * 
 * Call after successful authentication to link purchases to user.
 * 
 * @param userId - User ID from your auth system (e.g., Supabase user.id)
 * 
 * @stable since 1.0.0
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("Failed to identify user in RevenueCat:", error);
  }
}

/**
 * Log out user from RevenueCat
 * 
 * Call after user signs out to reset to anonymous user.
 * 
 * @stable since 1.0.0
 */
export async function logOutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error("Failed to log out from RevenueCat:", error);
  }
}

/**
 * Entitlement identifiers
 * 
 * Define your entitlement names here for type safety.
 */
export const ENTITLEMENTS = {
  PREMIUM: "premium",
  PRO: "pro",
  STARTER: "starter",
} as const;

export type EntitlementId = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

