# ADR-004: Use RevenueCat for Subscription Management

## Status
**Accepted** — 2025-12-17

## Context

We need to implement subscription-based monetization with:
- 4 tiers: Free, Essential ($29/mo), Pro ($79/mo), VIP ($199/mo)
- iOS App Store and Google Play in-app purchases
- Annual discount options
- Subscription analytics and management

**Options Considered:**
1. **RevenueCat** — Cross-platform subscription infrastructure
2. **Native StoreKit + Google Play Billing** — Direct implementation
3. **Adapty** — Subscription analytics platform
4. **Qonversion** — Mobile subscription tools
5. **Stripe + IAP Hybrid** — Stripe for web, IAP for mobile

## Decision

**Use RevenueCat** as the subscription management layer for mobile platforms.

## Rationale

### Why RevenueCat:

1. **Handles IAP Complexity**
   - Abstracts StoreKit (iOS) and Play Billing (Android)
   - Single API for both platforms
   - Handles receipt validation server-side

2. **Expo Integration**
   - Official documentation for Expo
   - `react-native-purchases` works with EAS builds
   - Tested in managed workflow

3. **Subscription Features**
   - Entitlement management (which features are unlocked)
   - Grace periods and billing retry
   - Cross-platform purchase restoration
   - Promo codes and offers

4. **Analytics Dashboard**
   - MRR, churn, LTV tracking
   - Cohort analysis
   - Trial conversion rates
   - No additional analytics setup needed

5. **Webhook Integration**
   - Sync subscription status to Supabase
   - Real-time subscription events
   - Integrations with analytics tools

6. **MCP Compatibility**
   - Official MCP server available
   - Can query/manage subscriptions via AI

7. **Pricing**
   - Free up to $2,500/mo MTR
   - 1% above that — aligned with success
   - No upfront costs

### Why Not Alternatives:

| Option | Rejection Reason |
|--------|------------------|
| Native IAP | Significant complexity, receipt validation, sync issues |
| Adapty | Less mature, smaller community |
| Qonversion | Similar features but less adoption |
| Stripe Hybrid | Different flows for web/mobile, complexity |

## Consequences

### Benefits
- ✅ Single SDK handles iOS + Android purchases
- ✅ Server-side receipt validation included
- ✅ Built-in analytics for subscription metrics
- ✅ Webhooks keep Supabase subscription table in sync
- ✅ Paywall templates available

### Trade-offs
- ⚠️ 1% revenue share above $2,500 MTR
- ⚠️ Dependency on RevenueCat service availability
- ⚠️ Must use development builds for testing (not Expo Go)

### Risks
- ❌ RevenueCat pricing changes (mitigated: grandfathering, alternatives exist)
- ❌ Store policy changes (mitigated: RevenueCat adapts to changes)

## Implementation Notes

### App Configuration

```typescript
// lib/revenuecat.ts
import Purchases from 'react-native-purchases';

export const initRevenueCat = async () => {
  await Purchases.configure({
    apiKey: Platform.OS === 'ios' 
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  });
};
```

### Product IDs

| Tier | iOS Product ID | Android Product ID |
|------|----------------|-------------------|
| Essential Monthly | `essential_monthly` | `essential_monthly` |
| Essential Annual | `essential_annual` | `essential_annual` |
| Pro Monthly | `pro_monthly` | `pro_monthly` |
| Pro Annual | `pro_annual` | `pro_annual` |
| VIP Monthly | `vip_monthly` | `vip_monthly` |
| VIP Annual | `vip_annual` | `vip_annual` |

### Webhook to Supabase

```typescript
// Edge Function: /functions/v1/sync-subscription
export async function handleWebhook(request: Request) {
  const event = await request.json();
  
  const { app_user_id, type, subscriber } = event;
  
  // Get entitlements
  const tier = subscriber.entitlements?.premium?.product_identifier || 'free';
  const status = subscriber.entitlements?.premium?.is_active ? 'active' : 'expired';
  
  // Upsert subscription
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: app_user_id,
      tier: getTierFromProduct(tier),
      status,
      revenuecat_subscriber_id: app_user_id,
      revenuecat_entitlements: subscriber.entitlements,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  
  return new Response('OK', { status: 200 });
}
```

## References
- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat + Expo Guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [RevenueCat Webhooks](https://www.revenuecat.com/docs/integrations/webhooks)

