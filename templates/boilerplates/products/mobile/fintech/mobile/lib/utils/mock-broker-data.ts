import { BrokerAccount } from '@/lib/stores/broker-store';

/**
 * Mock broker accounts for development/testing
 * These simulate connected TradeLocker accounts
 */
export const MOCK_BROKER_ACCOUNTS: BrokerAccount[] = [
  {
    id: '1',
    name: 'IC Markets',
    accountNumber: '#123456',
    status: 'active',
    lastSync: new Date().toISOString(),
    balance: 12847.31,
    currency: '$',
    icon: '📊',
  },
  {
    id: '2',
    name: 'Demo Account',
    accountNumber: '#789012',
    status: 'reconnect_required',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    balance: 50000.0,
    currency: '$',
    icon: '🎮',
  },
  {
    id: '3',
    name: 'Pepperstone',
    accountNumber: '#456789',
    status: 'active',
    lastSync: new Date().toISOString(),
    balance: 8234.56,
    currency: '$',
    icon: '🌶️',
  },
];

/**
 * Simulate adding a new broker account
 */
export function mockAddBrokerAccount(): BrokerAccount {
  return {
    id: Date.now().toString(),
    name: 'New Account',
    accountNumber: `#${Math.floor(Math.random() * 1000000)}`,
    status: 'active',
    lastSync: new Date().toISOString(),
    balance: Math.random() * 50000,
    currency: '$',
    icon: '🚀',
  };
}

/**
 * Environment flag to enable mock mode
 * Set to true for development without real API
 */
export const MOCK_MODE = __DEV__ && true; // Change to false when testing real API

/**
 * Simulate API delay for realistic mock behavior
 */
export const mockDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

