import * as SecureStore from 'expo-secure-store';

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'tradelocker_access_token',
  REFRESH_TOKEN: 'tradelocker_refresh_token',
  TOKEN_EXPIRY: 'tradelocker_token_expiry',
  USER_EMAIL: 'tradelocker_user_email',
} as const;

/**
 * Token Manager - Utility functions for secure token storage
 */
export class TokenManager {
  /**
   * Save authentication tokens securely
   */
  static async saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    try {
      const expiryTime = Date.now() + expiresIn * 1000;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Get access token from secure storage
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from secure storage
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   * Returns true if expired or within 5 minutes of expiry
   */
  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) return true;

      const expiry = parseInt(expiryStr, 10);
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      return Date.now() >= expiry - bufferTime;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  static async getTimeUntilExpiry(): Promise<number> {
    try {
      const expiryStr = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) return 0;

      const expiry = parseInt(expiryStr, 10);
      const remaining = Math.max(0, expiry - Date.now());
      return Math.floor(remaining / 1000);
    } catch (error) {
      console.error('Failed to get time until expiry:', error);
      return 0;
    }
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_EXPIRY),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      // Don't throw - clearing tokens should always succeed
    }
  }

  /**
   * Check if user has valid tokens (not expired)
   */
  static async hasValidTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    const expired = await this.isTokenExpired();
    return !expired;
  }

  /**
   * Save user email for reconnection
   */
  static async saveUserEmail(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.USER_EMAIL, email);
    } catch (error) {
      console.error('Failed to save user email:', error);
    }
  }

  /**
   * Get saved user email
   */
  static async getUserEmail(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Failed to get user email:', error);
      return null;
    }
  }
}

