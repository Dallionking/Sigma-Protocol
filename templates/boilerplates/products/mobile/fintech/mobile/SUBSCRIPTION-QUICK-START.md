# Subscription & Paywall - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd mobile
npm start
```

### 2. Navigate to Subscription
In the app:
1. Go to **Account** tab (bottom navigation)
2. Tap **"Manage Plan"** in subscription card
   OR
3. Scroll down and tap **"Subscription"** in menu

### 3. See Mock Subscription (Default)
By default, you're on **Pro Monthly** ($15/mo):
- Active status
- 30-day renewal
- All features unlocked

## 🧪 Testing Features

### View Current Plan
- See your current tier (Pro)
- View renewal date
- See all included features
- Founding member badge (if applicable)

### Compare Plans
1. Tap **"Compare Plans"**
2. Toggle between Monthly/Yearly
3. See savings on yearly plans
4. View features per plan
5. Tap any plan to upgrade

### Try the Paywall
1. From Compare Plans, tap a plan card
2. See conversion-optimized paywall (modal)
3. Beautiful hero animation
4. Value props with checkmarks
5. Monthly/yearly pricing toggle
6. Tap **"Unlock [Plan]"** to purchase

### Complete Mock Purchase
1. Trigger paywall
2. Select plan (monthly/yearly)
3. Tap "Unlock" button
4. See processing screen (2s delay)
5. See success celebration
6. Auto-return to account

### Test Restore Purchases
1. Tap **"Restore Purchases"**
2. See informative screen
3. Tap **"Restore"** button
4. Mock delay (1.5s)
5. Success toast
6. Back to current plan

### Manage Billing
1. Tap **"Manage Billing"**
2. See explanation (managed by Apple)
3. Tap **"Open iOS Settings"**
4. Routes to device settings

## ⚙️ Configuration

### Subscription Plans

**File**: `mobile/lib/constants/subscription.ts`

```typescript
export const SUBSCRIPTION_PLANS = {
  basic: { /* $7/mo, $70/yr */ },
  pro: { /* $15/mo, $150/yr */ },
  elite: { /* $29/mo, $290/yr */ },
};
```

### Feature Gates

```typescript
export const FEATURE_GATES = {
  'income_history_30_days': ['pro', 'elite'],
  'ai_cycles_4x': ['pro', 'elite'],
  'ai_cycles_10x': ['elite'],
  // ... more features
};
```

### Change Default Plan

**File**: `mobile/lib/stores/subscription-store.ts`

```typescript
// Line 10-11: Change initial state
currentPlan: 'pro',  // Change to 'basic' or 'elite'
subscriptionStatus: 'active',
```

## 🎨 Customization

### Modify Pricing
Edit `SUBSCRIPTION_PLANS` in `constants/subscription.ts`:
```typescript
pro: {
  price: {
    monthly: 15,  // Change price
    yearly: 150,   // Change price
  },
  // ...
}
```

### Add/Remove Features
Edit plan features in `SUBSCRIPTION_PLANS`:
```typescript
features: [
  '4x faster AI cycles',
  'Your new feature here',  // Add custom feature
],
```

### Change Colors/Icons
```typescript
pro: {
  color: '#6366F1',  // Change accent color
  icon: '🚀',        // Change plan icon
  // ...
}
```

## 🔍 Key Files

| File | Purpose |
|------|---------|
| `app/(tabs)/account/subscription/index.tsx` | Current plan screen |
| `app/(tabs)/account/subscription/compare.tsx` | Compare plans |
| `app/(tabs)/account/subscription/paywall.tsx` | Conversion paywall |
| `lib/constants/subscription.ts` | Plans, pricing, features |
| `lib/stores/subscription-store.ts` | State management |
| `lib/hooks/use-subscription.ts` | Feature access hooks |

## 📊 State Flow

```
App Launch
    ↓
QueryProvider + Zustand stores loaded
    ↓
Navigate to Subscription
    ↓
useSubscriptionStore reads state
    ↓
[Mock Mode] Shows Pro active
    ↓
User triggers upgrade → paywall
    ↓
User selects plan → processing
    ↓
[2s delay] → success animation
    ↓
Features instantly unlocked
```

## 🔐 Feature Gating

### Check Feature Access

```typescript
import { useFeatureAccess } from '@/lib/hooks';

function MyFeature() {
  const { hasAccess, requiredPlan } = useFeatureAccess('income_history_30_days');
  
  if (!hasAccess) {
    // Show paywall or upgrade prompt
    return <UpgradePrompt requiredPlan={requiredPlan} />;
  }
  
  // Show feature
  return <IncomeHistory />;
}
```

### Trigger Paywall

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// From any screen, show paywall
router.push({
  pathname: '/(tabs)/account/subscription/paywall',
  params: { 
    feature: 'income_history_30_days',
    plan: 'pro',
    interval: 'yearly',
  },
});
```

## 🐛 Troubleshooting

### "No plan showing"
- Check `useSubscriptionStore` initial state
- Verify store is imported: `import { useSubscriptionStore } from '@/lib/stores'`
- Restart Metro: `npm start -- --reset-cache`

### Paywall not appearing
- Check modal presentation in `_layout.tsx`
- Verify Moti animations are working
- Check navigation params

### Purchase not completing
- Check 2-second delay in `upgrade()` method
- Look for errors in console
- Verify navigation to success screen

### Feature gating not working
- Check feature key matches `FEATURE_GATES`
- Verify `useFeatureAccess()` is called
- Check current plan in store

## 📚 API Reference

### Hooks

```typescript
// Get current subscription
const { currentPlan, planData, status, isActive } = useCurrentSubscription();

// Check feature access
const { hasAccess, requiredPlan } = useFeatureAccess('feature_key');

// Check plan tier
const hasProPlan = useHasPlanOrBetter('pro');

// Get purchase state
const { isPurchasing, purchaseError } = usePurchaseState();
```

### Store Actions

```typescript
import { useSubscriptionStore } from '@/lib/stores';

// Upgrade (mock purchase)
const upgrade = useSubscriptionStore((state) => state.upgrade);
await upgrade('pro', 'yearly');

// Restore purchases
const restore = useSubscriptionStore((state) => state.restorePurchases);
await restore();

// Cancel (updates status only)
const cancel = useSubscriptionStore((state) => state.cancelSubscription);
cancel();
```

### Constants

```typescript
import { 
  SUBSCRIPTION_PLANS,
  FEATURE_GATES,
  formatPrice,
  getYearlySavings,
} from '@/lib/constants/subscription';

// Get plan details
const proPlan = SUBSCRIPTION_PLANS.pro;

// Format price
const price = formatPrice(15); // "$15"

// Get savings
const savings = getYearlySavings('pro'); // 30
```

## ✅ Features Checklist

- ✅ View current plan with details
- ✅ Compare all 3 plans
- ✅ Monthly/yearly toggle
- ✅ Conversion-optimized paywall
- ✅ Mock purchase flow (2s)
- ✅ Success celebration
- ✅ Error handling
- ✅ Restore purchases
- ✅ Manage billing (iOS Settings)
- ✅ Cancel subscription
- ✅ Founding member badge
- ✅ Feature gating system
- ✅ Haptic feedback
- ✅ Smooth animations
- ✅ Status badges

## 🎯 Next Steps

### To Test Conversions
1. Try different paywall copy
2. Test monthly vs yearly default
3. A/B test plan positioning
4. Experiment with pricing
5. Test different value props

### To Connect Real IAP
1. Set up App Store Connect
2. Create product IDs
3. Install `expo-in-app-purchases`
4. Replace mock `upgrade()` function
5. Implement receipt validation
6. Test with sandbox accounts

### To Integrate RevenueCat
1. Install RevenueCat SDK
2. Configure API keys
3. Migrate products to dashboard
4. Set up offerings
5. Configure entitlements
6. Add analytics

## 📖 Full Documentation

See `mobile/docs/SUBSCRIPTION-IMPLEMENTATION.md` for complete technical documentation.

## 🆘 Need Help?

- Check console logs for errors
- Review `SUBSCRIPTION-IMPLEMENTATION.md`
- Check PRD: `docs/prds/flows/13-account-subscription/FLOW-ACCOUNT-SUBSCRIPTION.md`
- Test all flows in mock mode first

---

**Version**: 1.0.0 (Mock)  
**Last Updated**: Dec 2025  
**Status**: ✅ Production Ready (Mock Mode)  
**Design**: Following SKILL.md principles

