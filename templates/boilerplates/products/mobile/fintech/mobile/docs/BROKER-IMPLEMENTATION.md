# Broker Connection Implementation

This document describes the implementation of the Broker Connection feature, which allows users to connect, manage, and disconnect their TradeLocker trading accounts.

## 📁 Architecture Overview

```
mobile/
├── app/(tabs)/account/brokers/        # Screens
│   ├── index.tsx                      # List connected brokers
│   ├── add.tsx                        # Add new broker
│   ├── reconnect.tsx                  # Reconnect expired session
│   └── remove.tsx                     # Disconnect broker
├── lib/
│   ├── api/
│   │   ├── tradelocker.ts            # TradeLocker API client
│   │   └── index.ts                   # API exports
│   ├── stores/
│   │   ├── broker-store.ts           # Zustand broker state
│   │   └── index.ts                   # Store exports
│   ├── hooks/
│   │   ├── use-brokers.ts            # React Query hooks
│   │   └── index.ts                   # Hook exports
│   ├── types/
│   │   └── broker.ts                  # TypeScript types
│   ├── utils/
│   │   ├── token-manager.ts          # Secure token utilities
│   │   └── mock-broker-data.ts       # Mock data for dev
│   └── providers/
│       └── query-provider.tsx         # React Query setup
```

## 🎯 Key Features

### 1. **Connected Brokers List**
- View all connected trading accounts
- Real-time status (Active/Reconnect Required)
- Account balance display
- Pull-to-refresh functionality
- Long-press to disconnect

### 2. **Add Broker Account**
- Seamless OAuth flow through TradeLocker
- Support for multiple accounts
- Secure credential storage

### 3. **Reconnect Flow**
- Automatic detection of expired sessions
- Clear impact messaging
- Reuse of existing broker connection flow

### 4. **Disconnect Broker**
- Clear impact warnings (stops AI trading, removes credentials)
- Confirmation modal
- Secure token cleanup

## 🛠 Technical Implementation

### State Management

**Zustand Store** (`broker-store.ts`)
```typescript
interface BrokerStore {
  accounts: BrokerAccount[];
  isLoading: boolean;
  error: string | null;
  
  // Token management
  saveTokens: (accessToken, refreshToken, expiresIn) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  clearTokens: () => Promise<void>;
  isTokenExpired: () => Promise<boolean>;
}
```

### API Integration

**TradeLocker Client** (`tradelocker.ts`)
- JWT token management with auto-refresh
- Secure token storage via `expo-secure-store`
- Token expiration detection (5-minute buffer)
- API endpoints:
  - `POST /auth/jwt/token` - Login/reconnect
  - `GET /auth/jwt/all-accounts` - List accounts
  - `POST /auth/jwt/refresh` - Refresh tokens
  - `POST /auth/jwt/logout` - Revoke tokens

### React Query Hooks

**Available Hooks** (`use-brokers.ts`)
```typescript
// Fetch connected accounts
const { data: accounts, isLoading, refetch } = useAccounts();

// Add new broker
const { mutate: addBroker } = useAddBrokerAccount();

// Reconnect expired session
const { mutate: reconnect } = useReconnectAccount();

// Disconnect broker
const { mutate: disconnect } = useDisconnectAccount();

// Check token status
const { data: tokenStatus } = useTokenStatus();
```

### Security

**Token Storage** (`token-manager.ts`)
- All tokens stored in `expo-secure-store` (encrypted)
- Keys:
  - `tradelocker_access_token`
  - `tradelocker_refresh_token`
  - `tradelocker_token_expiry`
- Auto-refresh 5 minutes before expiration
- Secure deletion on disconnect

### Development Mode

**Mock Mode** (`mock-broker-data.ts`)
- Toggle via `MOCK_MODE` constant
- Simulates API responses for development
- No real API calls needed
- Realistic delays for testing UI

```typescript
export const MOCK_MODE = __DEV__ && true; // Set to false for real API
```

## 🚀 Usage Examples

### Display Connected Brokers
```tsx
import { useAccounts } from '@/lib/hooks';

function BrokersList() {
  const { data: accounts, isLoading } = useAccounts();
  
  return (
    <View>
      {accounts?.map(account => (
        <BrokerRow key={account.id} account={account} />
      ))}
    </View>
  );
}
```

### Disconnect a Broker
```tsx
import { useDisconnectAccount } from '@/lib/hooks';

function DisconnectButton({ brokerId }) {
  const { mutate: disconnect, isPending } = useDisconnectAccount();
  
  const handleDisconnect = () => {
    disconnect(brokerId, {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert('Error', error.message),
    });
  };
  
  return (
    <NeonButton onPress={handleDisconnect} loading={isPending}>
      Disconnect
    </NeonButton>
  );
}
```

### Reconnect Expired Session
```tsx
import { useReconnectAccount } from '@/lib/hooks';

function ReconnectButton({ accountId }) {
  const { mutate: reconnect, isPending } = useReconnectAccount();
  
  const handleReconnect = () => {
    reconnect(
      { email, password, accountId },
      { onSuccess: () => router.back() }
    );
  };
  
  return <NeonButton onPress={handleReconnect}>Reconnect</NeonButton>;
}
```

## 🔧 Configuration

### Enable Real API Mode
1. Set `MOCK_MODE = false` in `mock-broker-data.ts`
2. Configure TradeLocker API endpoints in `constants/brokers.ts`
3. Test with valid TradeLocker credentials

### Environment Variables
No environment variables needed - all configuration is in code constants.

## 📊 Token Lifecycle

```
User Login
    ↓
Save Tokens (expo-secure-store)
    ↓
Use Access Token (API calls)
    ↓
[Token expires in 5 min] → Auto-refresh
    ↓
[Refresh fails] → Prompt reconnection
    ↓
User Disconnects → Clear all tokens
```

## ✅ Implementation Checklist

### Phase 1: Core List & Navigation ✅
- ✅ Create `brokers-list` screen with scrollable list
- ✅ Implement `ListRow` component with status badge
- ✅ Add "ACTIVE" (green) and "RECONNECT" (amber) status badges
- ✅ Show account name and number for each broker
- ✅ Add "Add Broker Account" button at bottom
- ✅ Wire up navigation to all sub-screens

### Phase 2: Add Broker Flow ✅
- ✅ Create `brokers-add-start` screen
- ✅ Add "Continue to TradeLocker" button
- ✅ Route to existing TradeLocker auth flow (reuse from onboarding)
- ✅ Handle successful connection callback
- ✅ Refresh accounts list on return

### Phase 3: Reconnect Flow ✅
- ✅ Create `brokers-reconnect-required` screen
- ✅ Detect expired tokens (401 responses)
- ✅ Auto-route to reconnect when session expires
- ✅ Implement "Reconnect Now" button
- ✅ Reuse TradeLocker OAuth flow
- ✅ Update token in `expo-secure-store` on success
- ✅ Show success toast and return to list

### Phase 4: Remove/Disconnect Flow ✅
- ✅ Create `brokers-remove-confirm` modal/screen
- ✅ Show clear impact messaging (stops AI, removes creds, keeps broker intact)
- ✅ Implement destructive "Disconnect" button with confirmation
- ✅ Clear JWT tokens from `expo-secure-store`
- ✅ Call TradeLocker logout API endpoint
- ✅ Stop any active AI trading sessions
- ✅ Show success feedback and refresh list

### Phase 5: Token Management ✅
- ✅ Store JWT tokens in `expo-secure-store` securely
- ✅ Implement auto-refresh logic (5 min before expiry)
- ✅ Add token expiry checker interceptor to API client
- ✅ Handle 401 responses globally → route to reconnect
- ✅ Clear tokens on logout/disconnect

### Phase 6: State & API Integration ✅
- ✅ Set up `useBrokerStore` with Zustand
- ✅ Create `useAccounts()` React Query hook
- ✅ Create `useDisconnectAccount()` mutation
- ✅ Create `useReconnectAccount()` mutation
- ✅ Add optimistic updates for better UX
- ✅ Add loading states with `NeonLoader`

### Phase 7: Polish & Testing ✅
- ✅ Add haptic feedback on all button presses
- ✅ Implement smooth animations with `moti`
- ✅ Add pull-to-refresh on accounts list
- ✅ Handle empty state (no accounts yet)
- ✅ Handle error states (API failures)
- ✅ Mock mode for testing without API
- ⏳ Test reconnect flow thoroughly (needs real API)
- ⏳ Test disconnect flow thoroughly (needs real API)
- ✅ Verify tokens are cleared on disconnect

## 🐛 Troubleshooting

### "Session Expired" keeps appearing
- Check token expiry buffer (currently 5 minutes)
- Verify refresh token is being saved correctly
- Ensure auto-refresh is working

### Disconnect not clearing tokens
- Check SecureStore permissions
- Verify `clearTokens()` is being called
- Check for errors in console

### Mock mode not working
- Verify `MOCK_MODE = true` in `mock-broker-data.ts`
- Check that `__DEV__` is true
- Clear cache and restart Metro bundler

## 📚 Related Documentation

- [Flow PRD](../../docs/prds/flows/12-account-banks/FLOW-ACCOUNT-BROKERS.md)
- [TradeLocker API Docs](https://tradelocker.com/docs/api)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

## 🎨 UI/UX Notes

- All screens follow the Neon design system
- Haptic feedback on every interaction
- Smooth Moti animations throughout
- Clear status indicators (green = active, amber = reconnect)
- Pull-to-refresh for better UX
- Loading states with NeonLoader
- Error handling with user-friendly messages

## 🔮 Future Enhancements

- [ ] Multiple broker support (not just TradeLocker)
- [ ] Biometric authentication for reconnection
- [ ] Account switching UI
- [ ] Balance sync notifications
- [ ] Connection health monitoring
- [ ] Automatic reconnection attempts

