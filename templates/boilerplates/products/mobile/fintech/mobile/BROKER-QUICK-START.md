# Broker Connection - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd mobile
npm start
```

### 2. Navigate to Brokers
In the app:
1. Go to **Account** tab (bottom navigation)
2. Tap **Connected Brokers**

### 3. See Mock Data (Default Mode)
By default, the app runs in mock mode, showing 3 sample broker accounts:
- IC Markets #123456 (Active)
- Demo Account #789012 (Reconnect Required)
- Pepperstone #456789 (Active)

## 🧪 Testing Features

### List Connected Brokers
- **Pull down** to refresh the list
- **Tap** an account with "RECONNECT" status to reconnect
- **Long press** any account to disconnect

### Add New Broker
1. Tap **"Add Broker Account"** button
2. In mock mode: simulates adding a new account
3. In real mode: routes to TradeLocker OAuth

### Reconnect Expired Session
1. Tap an account with "RECONNECT" badge
2. See impact messaging (AI trading paused, etc.)
3. Tap **"Reconnect Now"**
4. Routes to TradeLocker OAuth flow

### Disconnect Broker
1. **Long press** any broker account in the list
2. Review impact (stops AI, removes credentials)
3. Tap **"Disconnect"** to confirm
4. Account is removed from list

## ⚙️ Configuration

### Switch to Real API Mode

**File**: `mobile/lib/utils/mock-broker-data.ts`
```typescript
// Change this line
export const MOCK_MODE = __DEV__ && false; // Set to false for real API
```

### Configure TradeLocker API

**File**: `mobile/lib/constants/brokers.ts`
```typescript
export const TRADELOCKER_API = {
  demo: 'https://demo.tradelocker.com/backend-api',
  live: 'https://live.tradelocker.com/backend-api',
  // ... endpoints
};
```

## 🔍 Key Files

| File | Purpose |
|------|---------|
| `app/(tabs)/account/brokers/index.tsx` | Brokers list screen |
| `lib/hooks/use-brokers.ts` | React Query hooks |
| `lib/stores/broker-store.ts` | Zustand state management |
| `lib/api/tradelocker.ts` | API client |
| `lib/utils/token-manager.ts` | Secure token storage |
| `lib/utils/mock-broker-data.ts` | Mock data & mode toggle |

## 📊 State Flow

```
App Launch
    ↓
QueryProvider wraps app
    ↓
Navigate to Brokers screen
    ↓
useAccounts() hook called
    ↓
[MOCK_MODE = true] → Returns mock data
[MOCK_MODE = false] → Calls TradeLocker API
    ↓
Data stored in Zustand + React Query cache
    ↓
UI renders with data
```

## 🔐 Security Features

### Token Storage
- All tokens encrypted in `expo-secure-store`
- No plain text storage
- Automatic cleanup on disconnect

### Auto-Refresh
- Tokens refresh 5 minutes before expiration
- Seamless to user
- No interruption to trading

### Session Detection
- 401 responses auto-detected
- User prompted to reconnect
- Clear messaging about impact

## 🐛 Troubleshooting

### "No accounts" showing in mock mode
- Check `MOCK_MODE = true` in `mock-broker-data.ts`
- Restart Metro bundler: `npm start -- --reset-cache`

### Pull-to-refresh not working
- Ensure `RefreshControl` is imported
- Check `useAccounts()` returns `refetch` function

### Disconnect not working
- Check console for errors
- Verify `useDisconnectAccount()` mutation is called
- Check token storage permissions

### TypeScript errors
- Run full build: `npm run ios` or `npm run android`
- Individual file compilation may show false errors

## 📚 API Reference

### Hooks

```typescript
// Fetch accounts
const { data, isLoading, error, refetch } = useAccounts();

// Add broker
const { mutate: addBroker, isPending } = useAddBrokerAccount();
addBroker({ email, password, server: 'demo' });

// Reconnect
const { mutate: reconnect } = useReconnectAccount();
reconnect({ email, password, accountId });

// Disconnect
const { mutate: disconnect } = useDisconnectAccount();
disconnect(accountId);

// Check token status
const { data: status } = useTokenStatus();
// Returns: { expired: boolean }
```

### Store

```typescript
import { useBrokerStore } from '@/lib/stores/broker-store';

// Get state
const accounts = useBrokerStore(state => state.accounts);
const isLoading = useBrokerStore(state => state.isLoading);

// Call actions
useBrokerStore.getState().saveTokens(access, refresh, expiresIn);
useBrokerStore.getState().clearTokens();
```

## 🎨 UI Components

All screens use the Neon design system:
- `Screen` - SafeArea wrapper
- `NeonText` - Typography
- `NeonButton` - Buttons with haptics
- `NeonLoader` - Loading spinner
- `Card` - Container
- `Badge` - Status indicators

## ✅ Features Checklist

- ✅ List connected accounts
- ✅ Pull-to-refresh
- ✅ Add broker flow
- ✅ Reconnect flow
- ✅ Disconnect flow
- ✅ Status badges (Active/Reconnect)
- ✅ Account balances
- ✅ Long-press to disconnect
- ✅ Haptic feedback
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Mock mode for development
- ✅ Secure token storage
- ✅ Auto token refresh

## 🔮 Next Steps

1. Test in mock mode ✅
2. Configure real TradeLocker credentials
3. Switch `MOCK_MODE = false`
4. Test OAuth flow
5. Test token refresh
6. Test on physical device
7. Deploy to TestFlight/Play Store

## 📖 Full Documentation

See `mobile/docs/BROKER-IMPLEMENTATION.md` for complete technical documentation.

## 🆘 Need Help?

- Check console logs for errors
- Review `BROKER-IMPLEMENTATION.md`
- Check PRD: `docs/prds/flows/12-account-banks/FLOW-ACCOUNT-BROKERS.md`
- Test in mock mode first before real API

---

**Version**: 1.0.0  
**Last Updated**: Dec 2025  
**Status**: ✅ Production Ready (Mock Mode)

