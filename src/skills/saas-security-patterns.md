---
name: saas-security-patterns
description: "SaaS security patterns skill. Covers multi-tenancy security with RLS, tenant isolation, OAuth2/OIDC with PKCE, JWT best practices, session management, RBAC/ABAC, webhook security, and payment handling security."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - implement-prd
  - step-2-architecture
  - step-8-technical-spec
  - saas-feature
---

# SaaS Security Patterns Skill

Comprehensive SaaS security patterns covering **multi-tenancy**, **authentication**, **authorization**, **session management**, and **payment security**. Use this skill when building or auditing SaaS applications with multi-tenant data isolation requirements.

## When to Invoke

Invoke this skill when:

- Designing multi-tenant SaaS architectures (Step 2)
- Implementing tenant isolation with Row-Level Security
- Setting up OAuth2/OIDC authentication flows
- Implementing RBAC or ABAC authorization
- Handling payments, webhooks, or subscription management
- Running security audits on SaaS platforms

---

## Multi-Tenancy with Row-Level Security (RLS)

### Bad Pattern

```typescript
// VULNERABLE: No tenant isolation - relies on application code only
app.get('/api/projects', authenticate, async (req, res) => {
  // Forgetting the tenant filter exposes ALL tenant data
  const projects = await db.project.findMany({
    where: { /* oops, forgot tenantId filter */ },
  });
  res.json(projects);
});
```

### Good Pattern - Supabase/Postgres RLS

```sql
-- SECURE: Database-level tenant isolation with RLS
-- Step 1: Enable RLS on all tenant tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Step 2: Create RLS policies
CREATE POLICY "tenant_isolation" ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "tenant_isolation" ON tasks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Step 3: Set tenant context per request
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```typescript
// SECURE: Set tenant context on every request
import { createClient } from '@supabase/supabase-js';

function tenantMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ error: 'Tenant context required' });
    }

    // Set RLS context for this request
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            'x-tenant-id': tenantId,
          },
        },
      }
    );

    // Attach tenant-scoped client to request
    req.supabase = supabase;
    req.tenantId = tenantId;
    next();
  };
}

// Even if application code forgets the filter, RLS enforces isolation
app.get('/api/projects', authenticate, tenantMiddleware(), async (req, res) => {
  const { data: projects } = await req.supabase
    .from('projects')
    .select('*');
  // RLS automatically filters to current tenant
  res.json(projects);
});
```

### Tenant Isolation Strategies

| Strategy | Isolation Level | Cost | Best For |
|----------|----------------|------|----------|
| **Database per tenant** | Highest | Highest | Enterprise, compliance-heavy |
| **Schema per tenant** | High | Medium | Mid-market SaaS |
| **RLS (shared tables)** | Medium | Lowest | Startups, SMB SaaS |
| **Hybrid** | Variable | Variable | Mixed tenant sizes |

### Remediation Checklist

- [ ] Enable RLS on ALL tenant-scoped tables
- [ ] Set tenant context at the middleware level (not per query)
- [ ] Test RLS policies: verify tenant A cannot see tenant B's data
- [ ] Audit for queries that bypass RLS (`SECURITY DEFINER` functions)
- [ ] Use `current_setting()` for tenant context, not raw SQL interpolation
- [ ] Implement tenant-aware database migrations

---

## OAuth2/OIDC with PKCE

### Bad Pattern

```typescript
// VULNERABLE: Implicit flow (deprecated), no PKCE
const authUrl = `https://auth.provider.com/authorize?` +
  `response_type=token&` + // Implicit flow - token in URL fragment
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}`;
// Token exposed in URL, browser history, referrer headers
```

### Good Pattern

```typescript
// SECURE: Authorization Code Flow with PKCE
import crypto from 'crypto';

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

// Step 1: Initiate auth with PKCE challenge
app.get('/auth/login', (req, res) => {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  // Store verifier and state in secure session
  req.session.pkceVerifier = verifier;
  req.session.oauthState = state;

  const authUrl = new URL('https://auth.provider.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.OAUTH_REDIRECT_URI!);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// Step 2: Exchange code for tokens with PKCE verifier
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state to prevent CSRF
  if (state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }

  const tokenResponse = await fetch('https://auth.provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.OAUTH_REDIRECT_URI!,
      client_id: process.env.OAUTH_CLIENT_ID!,
      code_verifier: req.session.pkceVerifier!, // PKCE verifier
    }),
  });

  const tokens = await tokenResponse.json();

  // Verify ID token
  const idToken = await verifyJWT(tokens.id_token, {
    issuer: 'https://auth.provider.com',
    audience: process.env.OAUTH_CLIENT_ID!,
  });

  // Create session
  req.session.userId = idToken.sub;
  req.session.accessToken = tokens.access_token;

  // Clear PKCE state
  delete req.session.pkceVerifier;
  delete req.session.oauthState;

  res.redirect('/dashboard');
});
```

---

## JWT Best Practices

### Bad Pattern

```typescript
// VULNERABLE: HS256, long expiry, sensitive data in payload
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    creditCard: user.cc, // Sensitive data in JWT
    role: user.role,
    permissions: user.permissions,
  },
  'shared-secret-key', // Symmetric, shared across services
  { algorithm: 'HS256', expiresIn: '30d' }
);
```

### Good Pattern

```typescript
// SECURE: RS256, short expiry, minimal payload, refresh rotation
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function generateTokenPair(user: User) {
  // Access token: RS256, short-lived, minimal claims
  const accessToken = jwt.sign(
    {
      sub: user.id,
      tid: user.tenantId, // Tenant ID for multi-tenancy
      role: user.role,
      // NO email, NO PII, NO permissions list
    },
    process.env.JWT_PRIVATE_KEY!,
    {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'https://api.example.com',
      audience: 'https://app.example.com',
    }
  );

  // Refresh token: opaque, stored hashed in DB
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const hashedRefresh = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await db.refreshToken.create({
    data: {
      tokenHash: hashedRefresh,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      family: crypto.randomUUID(), // Token family for rotation detection
    },
  });

  return { accessToken, refreshToken };
}

// SECURE: Refresh token rotation with family tracking
async function refreshAccessToken(refreshToken: string) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const stored = await db.refreshToken.findFirst({
    where: { tokenHash: hashedToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    // If token is reused after rotation, invalidate entire family
    if (stored) {
      await db.refreshToken.deleteMany({
        where: { family: stored.family },
      });
      logger.warn({ userId: stored.userId }, 'Refresh token reuse detected - family revoked');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Rotate: delete old, create new
  await db.refreshToken.delete({ where: { id: stored.id } });

  return generateTokenPair(stored.user);
}
```

---

## Session Management

### Secure Session Configuration

```typescript
// SECURE: Complete session security configuration
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 900, // 15 minutes
  }),
  name: '__Host-sid', // Host-prefixed cookie
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on activity
  cookie: {
    httpOnly: true,       // No JavaScript access
    secure: true,         // HTTPS only
    sameSite: 'lax',      // CSRF protection (use 'strict' for sensitive apps)
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  },
}));

// SECURE: Session regeneration on privilege change
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const user = await authenticateUser(req.body);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });

    req.session.userId = user.id;
    req.session.tenantId = user.tenantId;
    req.session.createdAt = Date.now();

    req.session.save(() => {
      res.json({ success: true });
    });
  });
});

// SECURE: Absolute session timeout
function absoluteTimeoutMiddleware(maxAge: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session.createdAt && Date.now() - req.session.createdAt > maxAge) {
      req.session.destroy(() => {
        res.status(401).json({ error: 'Session expired' });
      });
      return;
    }
    next();
  };
}

app.use(absoluteTimeoutMiddleware(4 * 60 * 60 * 1000)); // 4 hours absolute max
```

---

## RBAC/ABAC Implementation

### RBAC (Role-Based Access Control)

```typescript
// SECURE: RBAC with hierarchical roles
type Role = 'viewer' | 'editor' | 'admin' | 'owner';

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

const PERMISSIONS: Record<string, Role> = {
  'projects:read': 'viewer',
  'projects:write': 'editor',
  'projects:delete': 'admin',
  'members:invite': 'admin',
  'billing:manage': 'owner',
  'tenant:delete': 'owner',
};

function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requiredRole = PERMISSIONS[permission];
    if (!requiredRole) {
      return res.status(500).json({ error: 'Unknown permission' });
    }

    const membership = await db.tenantMember.findFirst({
      where: { userId: req.user.id, tenantId: req.tenantId },
    });

    if (!membership || ROLE_HIERARCHY[membership.role as Role] < ROLE_HIERARCHY[requiredRole]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
app.delete('/api/projects/:id',
  authenticate,
  tenantMiddleware(),
  requirePermission('projects:delete'),
  async (req, res) => {
    await db.project.delete({ where: { id: req.params.id, tenantId: req.tenantId } });
    res.json({ success: true });
  }
);
```

### ABAC (Attribute-Based Access Control)

```typescript
// SECURE: ABAC for fine-grained access control
interface AccessPolicy {
  resource: string;
  action: string;
  condition: (ctx: AccessContext) => boolean;
}

interface AccessContext {
  user: { id: string; role: string; department: string };
  resource: { ownerId: string; tenantId: string; status: string };
  environment: { time: Date; ipAddress: string };
}

const policies: AccessPolicy[] = [
  {
    resource: 'document',
    action: 'edit',
    condition: (ctx) =>
      ctx.resource.ownerId === ctx.user.id ||
      ctx.user.role === 'admin',
  },
  {
    resource: 'document',
    action: 'delete',
    condition: (ctx) =>
      ctx.user.role === 'admin' &&
      ctx.resource.status !== 'published',
  },
  {
    resource: 'report',
    action: 'view',
    condition: (ctx) =>
      ctx.user.department === 'finance' ||
      ctx.user.role === 'admin',
  },
];

function checkAccess(resource: string, action: string, ctx: AccessContext): boolean {
  const matchingPolicies = policies.filter(
    p => p.resource === resource && p.action === action
  );
  return matchingPolicies.some(p => p.condition(ctx));
}
```

---

## Webhook Security

### Good Pattern

```typescript
// SECURE: Webhook verification with HMAC
import crypto from 'crypto';

// Sending webhooks with HMAC signature
async function sendWebhook(url: string, payload: object, secret: string) {
  const body = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
      'X-Webhook-Id': crypto.randomUUID(),
    },
    body,
    signal: AbortSignal.timeout(10000),
  });
}

// Receiving webhooks with HMAC verification
function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('='))
  );

  const timestamp = parseInt(parts.t);
  const signature = parts.v1;

  // Check timestamp tolerance (prevent replay attacks)
  const age = Math.abs(Date.now() - timestamp);
  if (age > toleranceSeconds * 1000) {
    return false;
  }

  // Verify HMAC
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

// Webhook endpoint with verification
app.post('/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      // Process verified event
      handleStripeEvent(event);
      res.json({ received: true });
    } catch (err) {
      logger.warn({ error: err }, 'Webhook signature verification failed');
      res.status(400).json({ error: 'Invalid signature' });
    }
  }
);
```

---

## Payment Security (Stripe)

### Good Pattern

```typescript
// SECURE: Server-side payment intent creation
app.post('/api/payments/create-intent', authenticate, async (req, res) => {
  const { priceId } = req.body;

  // Validate price against server-side catalog (never trust client price)
  const price = await stripe.prices.retrieve(priceId);
  if (!price || !price.active) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  // Create payment intent server-side
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price.unit_amount!,
    currency: price.currency,
    customer: req.user.stripeCustomerId,
    metadata: {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      priceId,
    },
    automatic_payment_methods: { enabled: true },
  });

  // Only send client secret to frontend (not the full intent)
  res.json({ clientSecret: paymentIntent.client_secret });
});

// SECURE: Idempotent subscription creation
app.post('/api/subscriptions/create', authenticate, async (req, res) => {
  const { priceId } = req.body;
  const idempotencyKey = `sub_${req.user.id}_${priceId}_${Date.now()}`;

  // Check for existing active subscription
  const existing = await db.subscription.findFirst({
    where: {
      userId: req.user.id,
      status: { in: ['active', 'trialing'] },
    },
  });

  if (existing) {
    return res.status(409).json({ error: 'Active subscription exists' });
  }

  const subscription = await stripe.subscriptions.create(
    {
      customer: req.user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    },
    { idempotencyKey }
  );

  res.json({
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
  });
});
```

---

## Security Checklist for SaaS

### Multi-Tenancy
- [ ] RLS enabled on ALL tenant tables
- [ ] Tenant context set at middleware level
- [ ] Cross-tenant access tested and verified impossible
- [ ] Admin/superadmin queries explicitly bypass RLS when needed
- [ ] Tenant deletion cascades properly (data, files, subscriptions)

### Authentication
- [ ] OAuth2 with PKCE (no implicit flow)
- [ ] RS256 JWT signatures (not HS256 with shared secret)
- [ ] Short-lived access tokens (15 min) with refresh rotation
- [ ] Refresh token family tracking for reuse detection
- [ ] MFA support (TOTP, WebAuthn)

### Session Management
- [ ] HttpOnly, Secure, SameSite cookies
- [ ] Session regeneration on login
- [ ] Idle timeout (15 min) and absolute timeout (4 hours)
- [ ] Redis-backed session store

### Authorization
- [ ] RBAC with role hierarchy
- [ ] Permission checks on every endpoint
- [ ] Resource ownership verification
- [ ] Admin actions logged and auditable

### Webhooks
- [ ] HMAC signature verification
- [ ] Timestamp tolerance check (prevent replay)
- [ ] Idempotency handling
- [ ] Webhook secret rotation support

### Payments
- [ ] Server-side price validation (never trust client)
- [ ] Stripe webhook signature verification
- [ ] Idempotent subscription creation
- [ ] PCI compliance: never handle raw card data

---

## Integration with Sigma Protocol

### Step 2 (Architecture)
Use this skill when designing multi-tenant SaaS architectures.

### Step 8 (Technical Spec)
Reference tenant isolation, auth, and payment patterns in technical specs.

### /security-audit
Use the checklist sections for comprehensive SaaS security audits.

---

_In multi-tenant SaaS, a single missing tenant filter can expose every customer's data. Defense in depth means enforcing isolation at the database level, not just the application level._
