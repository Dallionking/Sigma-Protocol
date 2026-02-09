import { TRADELOCKER_API } from '@/lib/constants/brokers';
import { useBrokerStore } from '@/lib/stores/broker-store';

export interface TradeLockAccountResponse {
  id: number;
  accNum: number;
  name: string;
  balance: number;
  currency: string;
  isDemo: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

class TradeLockClient {
  private baseURL: string;

  constructor(demo = true) {
    this.baseURL = demo ? TRADELOCKER_API.demo : TRADELOCKER_API.live;
  }

  /**
   * Get access token with auto-refresh logic
   */
  private async getValidAccessToken(): Promise<string | null> {
    const store = useBrokerStore.getState();
    const isExpired = await store.isTokenExpired();

    if (isExpired) {
      // Try to refresh the token
      const refreshToken = await store.getRefreshToken();
      if (refreshToken) {
        try {
          await this.refreshAccessToken(refreshToken);
        } catch (error) {
          console.error('Failed to refresh token:', error);
          return null;
        }
      } else {
        return null;
      }
    }

    return await store.getAccessToken();
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string, server: string = 'demo'): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}${TRADELOCKER_API.auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        server,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Save tokens to secure storage
    const store = useBrokerStore.getState();
    await store.saveTokens(data.accessToken, data.refreshToken, data.expiresIn);

    return data;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}${TRADELOCKER_API.refresh}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Save new tokens
    const store = useBrokerStore.getState();
    await store.saveTokens(data.accessToken, data.refreshToken, data.expiresIn);

    return data;
  }

  /**
   * Get all trading accounts
   */
  async getAllAccounts(): Promise<TradeLockAccountResponse[]> {
    const accessToken = await this.getValidAccessToken();
    
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    const response = await fetch(`${this.baseURL}${TRADELOCKER_API.accounts}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token is invalid, user needs to reconnect
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }

    const data = await response.json();
    return data.accounts || [];
  }

  /**
   * Logout and revoke tokens
   */
  async logout(): Promise<void> {
    const accessToken = await useBrokerStore.getState().getAccessToken();
    
    if (accessToken) {
      try {
        await fetch(`${this.baseURL}/auth/jwt/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue to clear local tokens even if API call fails
      }
    }

    // Clear tokens from secure storage
    await useBrokerStore.getState().clearTokens();
  }
}

// Export singleton instances
export const tradeLockDemo = new TradeLockClient(true);
export const tradeLockLive = new TradeLockClient(false);

// Default export for demo
export default tradeLockDemo;

