import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Token storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tradelocker_access_token',
  REFRESH_TOKEN: 'tradelocker_refresh_token',
  TOKEN_EXPIRY: 'tradelocker_token_expiry',
} as const;

export interface BrokerAccount {
  id: string;
  name: string;
  accountNumber: string;
  status: 'active' | 'reconnect_required';
  lastSync: string;
  balance?: number;
  currency?: string;
  icon?: string;
}

interface BrokerStore {
  // State
  accounts: BrokerAccount[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAccounts: (accounts: BrokerAccount[]) => void;
  addAccount: (account: BrokerAccount) => void;
  updateAccount: (id: string, updates: Partial<BrokerAccount>) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Token management
  saveTokens: (accessToken: string, refreshToken: string, expiresIn: number) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  clearTokens: () => Promise<void>;
  isTokenExpired: () => Promise<boolean>;
}

export const useBrokerStore = create<BrokerStore>((set, get) => ({
  // Initial state
  accounts: [],
  isLoading: false,
  error: null,

  // State setters
  setAccounts: (accounts) => set({ accounts }),
  
  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, account],
  })),
  
  updateAccount: (id, updates) => set((state) => ({
    accounts: state.accounts.map((account) =>
      account.id === id ? { ...account, ...updates } : account
    ),
  })),
  
  removeAccount: (id) => set((state) => ({
    accounts: state.accounts.filter((account) => account.id !== id),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  // Token management methods
  saveTokens: async (accessToken, refreshToken, expiresIn) => {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000);
      
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  },

  getAccessToken: async () => {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  isTokenExpired: async () => {
    try {
      const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) return true;
      
      const expiry = parseInt(expiryStr, 10);
      // Consider token expired if it expires within 5 minutes
      const bufferTime = 5 * 60 * 1000;
      return Date.now() >= (expiry - bufferTime);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  },
}));

