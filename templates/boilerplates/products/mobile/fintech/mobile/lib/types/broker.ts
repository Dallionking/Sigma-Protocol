/**
 * Broker-related TypeScript types
 */

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

export interface TradeLockerCredentials {
  email: string;
  password: string;
  server?: 'demo' | 'live';
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface TradeLockAccountResponse {
  id: number;
  accNum: number;
  name: string;
  balance: number;
  currency: string;
  isDemo: boolean;
}

export type BrokerStatus = 'active' | 'reconnect_required' | 'disconnected';

export interface BrokerConnectionState {
  accounts: BrokerAccount[];
  isLoading: boolean;
  error: string | null;
}

