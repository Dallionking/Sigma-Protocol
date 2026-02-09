# Learning Platform — Security Architecture

**Version:** 1.0 | **Date:** 2025-12-17  
**Security Model:** Zero Trust with Defense in Depth

---

## Security Overview

### Principles

1. **Zero Trust** — Never trust, always verify
2. **Defense in Depth** — Multiple layers of security
3. **Least Privilege** — Minimum permissions required
4. **Secure by Default** — Security built-in, not bolted-on

---

## Authentication

### Provider: Supabase Auth

**Supported Methods:**
| Method | Priority | Notes |
|--------|----------|-------|
| Email + Password | Primary | With email verification |
| Apple Sign-In | Required | iOS App Store requirement |
| Google Sign-In | Recommended | Popular choice |
| Phone/SMS | Future | Optional for 2FA |

### Session Management

```typescript
// Session configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile-specific
    storage: AsyncStorage,
    flowType: 'pkce', // Proof Key for Code Exchange
  },
};
```

**Token Configuration:**
| Token Type | Expiry | Storage |
|------------|--------|---------|
| Access Token (JWT) | 1 hour | Memory + AsyncStorage |
| Refresh Token | 7 days | AsyncStorage (encrypted) |

### Password Requirements

```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false, // Balance security with UX
  maxRepeating: 3, // No more than 3 same characters
};
```

### Multi-Factor Authentication (Future)

- TOTP (Google Authenticator, Authy)
- SMS fallback
- Email code fallback

---

## Authorization

### Row Level Security (RLS)

All authorization enforced at database level via PostgreSQL RLS.

**Policy Categories:**

1. **Own Data Only**
```sql
-- Users can only access their own data
CREATE POLICY "own_data_only"
ON profiles FOR ALL
USING (auth.uid() = user_id);
```

2. **Tier-Based Access**
```sql
-- Content access by subscription tier
CREATE POLICY "tier_access"
ON lessons FOR SELECT
USING (
  tier_required = 'free'
  OR tier_required = (
    SELECT tier FROM subscriptions
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR (
    SELECT tier FROM subscriptions
    WHERE user_id = auth.uid() AND status = 'active'
  ) IN ('pro', 'vip')
);
```

3. **Public Read**
```sql
-- Public content (categories, posts)
CREATE POLICY "public_read"
ON lesson_categories FOR SELECT
USING (true);
```

### Edge Function Authorization

```typescript
// Verify JWT in Edge Functions
import { createClient } from '@supabase/supabase-js';

export async function authorizeRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new AuthError('Invalid token');
  }
  
  return user;
}
```

### Tier Verification

```typescript
async function requireTier(userId: string, requiredTier: string[]) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  if (!subscription || !requiredTier.includes(subscription.tier)) {
    throw new ForbiddenError(`Requires ${requiredTier.join(' or ')} subscription`);
  }
  
  return subscription;
}
```

---

## Data Security

### Encryption at Rest

| Data Type | Encryption | Notes |
|-----------|------------|-------|
| Database | AES-256 | Supabase default |
| File Storage | AES-256 | Supabase Storage |
| Backups | AES-256 | Automated daily |

### Encryption in Transit

| Connection | Protocol | Notes |
|------------|----------|-------|
| API Calls | TLS 1.3 | HTTPS only |
| Realtime | WSS | Secure WebSocket |
| Video Calls | DTLS + SRTP | WebRTC encryption |

### Sensitive Data Handling

**PII Collected:**
| Data | Purpose | Retention | Encryption |
|------|---------|-----------|------------|
| Email | Auth, communication | Account lifetime | At rest |
| Display Name | Profile | Account lifetime | At rest |
| Avatar | Profile | Account lifetime | At rest |
| Learning Progress | Core feature | Account lifetime | At rest |
| Payment Info | N/A | RevenueCat handles | N/A |

**PII NOT Collected:**
- Location (beyond timezone)
- Device identifiers (beyond anonymous analytics)
- Contacts or address book

### Audio Recording Privacy

```typescript
// Speaking exercise recordings
const audioPolicy = {
  purpose: 'Pronunciation feedback only',
  storage: 'Temporary (30 days) or user can delete',
  access: 'Only the user and AI processing',
  encryption: 'AES-256 at rest, TLS in transit',
};
```

---

## API Security

### Input Validation

All inputs validated before processing:

```typescript
import { z } from 'zod';

const aiChatSchema = z.object({
  mode: z.enum(['conversation', 'grammar', 'drill', 'story']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(4000), // Prevent abuse
  })).max(50), // Limit conversation length
  context: z.object({
    lesson_id: z.string().uuid().optional(),
    user_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }).optional(),
});
```

### Rate Limiting

Implemented at Edge Function level:

```typescript
import { RateLimiter } from './rate-limiter.ts';

const limiter = new RateLimiter({
  free: { points: 10, duration: 86400 }, // 10/day
  essential: { points: 1000, duration: 60 }, // 1000/min
  pro: { points: 3000, duration: 60 },
  vip: { points: 5000, duration: 60 },
});

export async function rateLimit(userId: string, tier: string) {
  const result = await limiter.consume(userId, tier);
  if (!result.allowed) {
    throw new RateLimitError('Rate limit exceeded', result.retryAfter);
  }
}
```

### Webhook Security

RevenueCat webhook verification:

```typescript
import { createHmac } from 'node:crypto';

function verifyWebhook(payload: string, signature: string): boolean {
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}
```

---

## Secret Management

### Environment Variables

| Secret | Location | Access |
|--------|----------|--------|
| `SUPABASE_URL` | Expo env vars | App (public) |
| `SUPABASE_ANON_KEY` | Expo env vars | App (public) |
| `SUPABASE_SERVICE_ROLE` | Edge Function secrets | Server only |
| `OPENAI_API_KEY` | Supabase Vault | Edge Functions |
| `ELEVENLABS_API_KEY` | Supabase Vault | Edge Functions |
| `LIVEKIT_API_KEY` | Supabase Vault | Edge Functions |
| `LIVEKIT_API_SECRET` | Supabase Vault | Edge Functions |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase Vault | Edge Functions |

### Supabase Vault Usage

```typescript
// Retrieve secret from Vault
const { data, error } = await supabase.rpc('get_secret', {
  secret_name: 'OPENAI_API_KEY',
});
```

### Key Rotation

| Secret | Rotation Schedule | Process |
|--------|------------------|---------|
| API Keys | Annually or on compromise | Generate new, update Vault, deprecate old |
| JWT Secret | Managed by Supabase | Automatic |
| Database Password | On-demand | Supabase dashboard |

---

## OWASP Top 10 Mitigations

### A01: Broken Access Control
- ✅ RLS policies enforce authorization at database level
- ✅ Tier verification in Edge Functions
- ✅ No direct object references exposed

### A02: Cryptographic Failures
- ✅ TLS 1.3 for all connections
- ✅ AES-256 encryption at rest
- ✅ No sensitive data in URLs or logs

### A03: Injection
- ✅ Parameterized queries via Supabase SDK
- ✅ Input validation with Zod schemas
- ✅ No dynamic SQL construction

### A04: Insecure Design
- ✅ Security requirements documented
- ✅ Threat modeling performed
- ✅ Defense in depth architecture

### A05: Security Misconfiguration
- ✅ Supabase managed infrastructure
- ✅ RLS enabled on all tables
- ✅ No default credentials
- ✅ Security headers configured

### A06: Vulnerable Components
- ✅ Dependabot alerts enabled
- ✅ `npm audit` in CI pipeline
- ✅ Regular dependency updates

### A07: Authentication Failures
- ✅ Supabase Auth handles complexity
- ✅ Password strength validation
- ✅ Account lockout after failed attempts
- ✅ Secure session management

### A08: Software/Data Integrity
- ✅ Webhook signature verification
- ✅ CI/CD pipeline integrity
- ✅ Code signing for app builds

### A09: Security Logging & Monitoring
- ✅ Supabase logs all database queries
- ✅ Edge Function logs for API access
- ✅ Sentry for error tracking
- ✅ Alerts for suspicious activity

### A10: Server-Side Request Forgery
- ✅ No user-controlled URLs in server requests
- ✅ Allow-list for external API calls
- ✅ Edge Functions isolated environment

---

## Compliance

### GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| Consent | Terms acceptance during signup |
| Data Access | Profile export via settings |
| Data Deletion | Account deletion with data purge |
| Data Portability | JSON export of user data |
| Breach Notification | Incident response plan in place |

### Data Retention

| Data Type | Retention | Deletion |
|-----------|-----------|----------|
| User Profile | Account lifetime | On account deletion |
| Progress Data | Account lifetime | On account deletion |
| AI Conversations | 90 days | Auto-purge or on request |
| Audio Recordings | 30 days | Auto-purge or on request |
| Analytics | 2 years | Anonymized after |

### Account Deletion

```typescript
// Edge Function: delete-account
export async function deleteAccount(userId: string) {
  // 1. Cancel subscription (RevenueCat)
  await revokeSubscription(userId);
  
  // 2. Delete storage files
  await supabase.storage.from('user-uploads').remove([`${userId}/*`]);
  
  // 3. Delete database records (cascades via FK)
  await supabase.from('profiles').delete().eq('id', userId);
  
  // 4. Delete auth user (triggers cascade)
  await supabase.auth.admin.deleteUser(userId);
  
  return { success: true };
}
```

---

## Incident Response

### Response Plan

1. **Detection** — Sentry alerts, Supabase monitoring, user reports
2. **Containment** — Disable affected feature, rotate credentials
3. **Eradication** — Patch vulnerability, deploy fix
4. **Recovery** — Restore service, verify security
5. **Post-Incident** — Document lessons learned, update procedures

### Contact Points

| Role | Responsibility |
|------|----------------|
| Development Lead | Technical response |
| Product Owner | User communication |
| Supabase Support | Infrastructure issues |

---

## Security Checklist

### Pre-Launch

- [ ] All RLS policies tested
- [ ] Edge Function authorization verified
- [ ] Rate limiting configured
- [ ] Secrets in Vault, not code
- [ ] Dependabot enabled
- [ ] HTTPS-only enforced
- [ ] App Store security requirements met

### Ongoing

- [ ] Weekly: Review Dependabot alerts
- [ ] Monthly: Check Supabase security logs
- [ ] Quarterly: Update dependencies
- [ ] Annually: Security audit, penetration testing

---

*Security Document Version: 1.0*  
*Last Updated: 2025-12-17*

