import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import tradeLockClient, { TradeLockAccountResponse } from '@/lib/api/tradelocker';
import { useBrokerStore, BrokerAccount } from '@/lib/stores/broker-store';
import { MOCK_MODE, MOCK_BROKER_ACCOUNTS, mockDelay, mockAddBrokerAccount } from '@/lib/utils/mock-broker-data';

const QUERY_KEYS = {
  accounts: ['broker-accounts'] as const,
  account: (id: string) => ['broker-account', id] as const,
};

/**
 * Transform TradeLocker account to BrokerAccount
 */
function transformAccount(account: TradeLockAccountResponse): BrokerAccount {
  return {
    id: account.id.toString(),
    name: account.name || (account.isDemo ? 'Demo Account' : 'Live Account'),
    accountNumber: `#${account.accNum}`,
    status: 'active',
    lastSync: new Date().toISOString(),
    balance: account.balance,
    currency: account.currency,
    icon: account.isDemo ? '🎮' : '📊',
  };
}

/**
 * Fetch all connected broker accounts
 */
export function useAccounts() {
  const setAccounts = useBrokerStore((state) => state.setAccounts);
  const setLoading = useBrokerStore((state) => state.setLoading);
  const setError = useBrokerStore((state) => state.setError);
  const router = useRouter();

  return useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      try {
        setLoading(true);
        setError(null);
        
        let transformed: BrokerAccount[];

        if (MOCK_MODE) {
          // Mock mode: return fake data
          await mockDelay(800);
          transformed = MOCK_BROKER_ACCOUNTS;
        } else {
          // Real API mode
          const accounts = await tradeLockClient.getAllAccounts();
          transformed = accounts.map(transformAccount);
        }
        
        setAccounts(transformed);
        return transformed;
      } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
          // Token expired, need reconnection
          setError('Session expired');
          // Automatically route to reconnect screen
          router.push('/(tabs)/account/brokers/reconnect');
          throw error;
        }
        
        const errorMessage = error.message || 'Failed to fetch accounts';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Reconnect to broker account (re-authenticate)
 */
export function useReconnectAccount() {
  const queryClient = useQueryClient();
  const saveTokens = useBrokerStore((state) => state.saveTokens);
  const updateAccount = useBrokerStore((state) => state.updateAccount);

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      server = 'demo',
      accountId,
    }: { 
      email: string; 
      password: string; 
      server?: string;
      accountId?: string;
    }) => {
      if (MOCK_MODE) {
        // Mock mode: simulate reconnection
        await mockDelay(1500);
        return { accessToken: 'mock_token', refreshToken: 'mock_refresh', expiresIn: 3600 };
      }

      const response = await tradeLockClient.login(email, password, server);
      return response;
    },
    onSuccess: async (data, variables) => {
      if (variables.accountId) {
        // Update the account status to active
        updateAccount(variables.accountId, { 
          status: 'active',
          lastSync: new Date().toISOString(),
        });
      }

      // Invalidate accounts query to refetch
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Reconnect failed:', error);
    },
  });
}

/**
 * Disconnect broker account
 */
export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  const removeAccount = useBrokerStore((state) => state.removeAccount);
  const clearTokens = useBrokerStore((state) => state.clearTokens);

  return useMutation({
    mutationFn: async (accountId: string) => {
      if (MOCK_MODE) {
        // Mock mode: simulate disconnection
        await mockDelay(1000);
        return accountId;
      }

      // Call logout API
      await tradeLockClient.logout();
      
      // Clear tokens from secure storage
      await clearTokens();
      
      return accountId;
    },
    onSuccess: (accountId) => {
      // Remove from local state
      removeAccount(accountId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Disconnect failed:', error);
    },
  });
}

/**
 * Add a new broker account
 */
export function useAddBrokerAccount() {
  const queryClient = useQueryClient();
  const addAccount = useBrokerStore((state) => state.addAccount);

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      server = 'demo' 
    }: { 
      email: string; 
      password: string; 
      server?: string;
    }) => {
      if (MOCK_MODE) {
        // Mock mode: create a fake account
        await mockDelay(1200);
        const newAccount = mockAddBrokerAccount();
        return [newAccount];
      }

      // Login and get tokens
      await tradeLockClient.login(email, password, server);
      
      // Fetch accounts to get the new one
      const accounts = await tradeLockClient.getAllAccounts();
      return accounts.map(transformAccount);
    },
    onSuccess: (accounts) => {
      // Update local state with all accounts
      accounts.forEach(account => addAccount(account));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Add broker failed:', error);
    },
  });
}

/**
 * Check if tokens are valid
 */
export function useTokenStatus() {
  const isTokenExpired = useBrokerStore((state) => state.isTokenExpired);

  return useQuery({
    queryKey: ['token-status'],
    queryFn: async () => {
      const expired = await isTokenExpired();
      return { expired };
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Check every minute
  });
}

