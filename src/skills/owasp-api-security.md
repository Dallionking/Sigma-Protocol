---
name: owasp-api-security
description: "OWASP API Security Top 10 2023 skill. Covers all 10 API-specific vulnerabilities with REST and GraphQL patterns, TypeScript code examples showing vulnerable and secure implementations."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - implement-prd
  - step-8-technical-spec
  - api-design
  - pr-review
---

# OWASP API Security Skill

Comprehensive coverage of the **OWASP API Security Top 10 2023** with actionable TypeScript code examples for both REST and GraphQL APIs. Use this skill when designing, implementing, or reviewing API endpoints.

## When to Invoke

Invoke this skill when:

- Designing or implementing API endpoints
- Running security audits on APIs
- Reviewing API-related pull requests
- Writing technical specifications for backend services
- Building GraphQL schemas or resolvers

---

## API1:2023 - Broken Object Level Authorization (BOLA)

APIs expose endpoints that handle object identifiers, creating a wide attack surface. An attacker can manipulate IDs to access other users' resources.

### Bad Pattern

```typescript
// VULNERABLE: Direct object reference without ownership check
// GET /api/invoices/12345
app.get('/api/invoices/:invoiceId', authenticate, async (req, res) => {
  const invoice = await db.invoice.findUnique({
    where: { id: req.params.invoiceId },
  });
  // Any authenticated user can access any invoice
  res.json(invoice);
});

// VULNERABLE: GraphQL BOLA
const resolvers = {
  Query: {
    invoice: async (_: unknown, { id }: { id: string }) => {
      // No authorization check
      return db.invoice.findUnique({ where: { id } });
    },
  },
};
```

### Good Pattern

```typescript
// SECURE: Ownership verification on every resource access
app.get('/api/invoices/:invoiceId', authenticate, async (req, res) => {
  const invoice = await db.invoice.findFirst({
    where: {
      id: req.params.invoiceId,
      userId: req.user.id, // Enforce ownership at the query level
    },
  });

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  res.json(invoice);
});

// SECURE: GraphQL with authorization context
const resolvers = {
  Query: {
    invoice: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      if (!ctx.user) throw new AuthenticationError('Not authenticated');

      const invoice = await db.invoice.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!invoice) throw new ForbiddenError('Access denied');
      return invoice;
    },
  },
};
```

### Detection

- Search for `findUnique` or `findById` without user/tenant filtering
- Look for API routes that accept IDs without ownership verification
- Test with different user tokens accessing the same resource IDs
- Review GraphQL resolvers for missing context authorization checks

### Remediation Checklist

- [ ] Add ownership checks to every data-access query
- [ ] Use `findFirst` with user/tenant filter instead of `findUnique` with bare ID
- [ ] Return 404 (not 403) to avoid confirming resource existence
- [ ] Use UUIDs instead of sequential IDs to prevent enumeration
- [ ] Implement authorization middleware that runs on every resolver (GraphQL)

---

## API2:2023 - Broken Authentication

Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise tokens or exploit implementation flaws.

### Bad Pattern

```typescript
// VULNERABLE: Weak token generation and no rotation
app.post('/api/auth/token', async (req, res) => {
  const { apiKey } = req.body;
  const client = await db.apiClient.findUnique({ where: { apiKey } });

  if (client) {
    const token = jwt.sign(
      { clientId: client.id, permissions: client.permissions },
      'shared-secret',        // Symmetric, hardcoded
      { expiresIn: '365d' }   // Way too long
    );
    res.json({ token });
  }
});

// VULNERABLE: No rate limiting on password reset
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits - brute-forceable
  await sendResetEmail(email, code);
  res.json({ message: 'Reset code sent' });
});
```

### Good Pattern

```typescript
// SECURE: Short-lived tokens with refresh rotation
import crypto from 'crypto';

app.post('/api/auth/token', authLimiter, async (req, res) => {
  const { clientId, clientSecret } = req.body;

  const client = await db.apiClient.findUnique({ where: { id: clientId } });
  if (!client || !(await bcrypt.compare(clientSecret, client.secretHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = jwt.sign(
    { sub: client.id, scope: client.scope },
    process.env.JWT_PRIVATE_KEY!,
    { algorithm: 'RS256', expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  await db.refreshToken.create({
    data: {
      token: await bcrypt.hash(refreshToken, 10),
      clientId: client.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 900,
  });
});

// SECURE: Cryptographically strong reset tokens
app.post('/api/auth/reset-password', resetLimiter, async (req, res) => {
  const { email } = req.body;
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await db.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    await sendResetEmail(email, resetToken);
  }

  // Same response regardless of whether email exists
  res.json({ message: 'If an account exists, a reset link has been sent' });
});
```

### Remediation Checklist

- [ ] Use short-lived access tokens (15 min) with refresh token rotation
- [ ] Sign tokens with RS256 (asymmetric) instead of HS256 (symmetric)
- [ ] Hash API keys and client secrets in the database
- [ ] Use cryptographically strong reset tokens (32+ bytes)
- [ ] Rate-limit all authentication endpoints
- [ ] Never reveal whether an email/username exists in responses

---

## API3:2023 - Broken Object Property Level Authorization (BOPLA)

Combines mass assignment and excessive data exposure. APIs expose object properties without proper filtering, or accept properties they should not.

### Bad Pattern

```typescript
// VULNERABLE: Mass assignment - accepting all fields
app.put('/api/users/:id', authenticate, async (req, res) => {
  // User can set role, isAdmin, or any other field
  const updated = await db.user.update({
    where: { id: req.params.id },
    data: req.body, // Entire body passed to database
  });
  res.json(updated); // Returns all fields including sensitive ones
});
```

### Good Pattern

```typescript
// SECURE: Explicit field allowlist for updates and responses
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  // role, isAdmin, passwordHash are NOT in schema
});

app.put('/api/users/:id', authenticate, authorize('self'), async (req, res) => {
  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  const updated = await db.user.update({
    where: { id: req.params.id },
    data: result.data, // Only validated fields
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });

  res.json(updated);
});

// SECURE: GraphQL field-level authorization
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    # Internal fields require admin role
    role: String @auth(requires: ADMIN)
    internalNotes: String @auth(requires: ADMIN)
  }
`;
```

### Remediation Checklist

- [ ] Use Zod/Joi schemas to whitelist accepted input fields
- [ ] Never pass `req.body` directly to database operations
- [ ] Use `select` in queries to return only necessary fields
- [ ] Create serializer functions for API responses
- [ ] In GraphQL, use field-level authorization directives

---

## API4:2023 - Unrestricted Resource Consumption

APIs do not restrict the size or number of resources that can be requested, leading to DoS and cost escalation.

### Bad Pattern

```typescript
// VULNERABLE: No pagination limits
app.get('/api/products', async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  // Attacker sends limit=1000000
  const products = await db.product.findMany({ take: limit });
  res.json(products);
});

// VULNERABLE: GraphQL depth/complexity not limited
// users { friends { friends { friends { ... } } } }
```

### Good Pattern

```typescript
// SECURE: Enforced pagination with max limits
app.get('/api/products', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 20), 100);
  const offset = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({ skip: offset, take: limit }),
    db.product.count(),
  ]);

  res.json({
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// SECURE: GraphQL query depth and complexity limiting
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(5),
    createComplexityLimitRule(1000, {
      scalarCost: 1,
      objectCost: 5,
      listFactor: 10,
    }),
  ],
});

// SECURE: File upload with strict limits
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// SECURE: Tiered rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    if (req.user?.tier === 'enterprise') return 1000;
    if (req.user?.tier === 'pro') return 100;
    return 20;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

### Remediation Checklist

- [ ] Enforce maximum page size (e.g., 100 items) on all list endpoints
- [ ] Implement GraphQL depth limiting and query complexity analysis
- [ ] Set file upload size limits and validate MIME types
- [ ] Apply tiered rate limiting based on user plan/role
- [ ] Set request body size limits (`express.json({ limit: '1mb' })`)
- [ ] Monitor and alert on unusual consumption patterns

---

## API5:2023 - Broken Function Level Authorization (BFLA)

Complex access control policies with different hierarchies, groups, and roles. Flaws lead to regular users accessing administrative endpoints.

### Bad Pattern

```typescript
// VULNERABLE: Admin endpoints discoverable and unprotected
app.delete('/api/users/:id', authenticate, async (req, res) => {
  // No role check - any authenticated user can delete users
  await db.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
```

### Good Pattern

```typescript
// SECURE: Role-based middleware with grouped admin routes
type Role = 'user' | 'moderator' | 'admin' | 'superadmin';

function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role as Role)) {
      logger.warn({
        event: 'unauthorized_access',
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Group admin routes under a protected router
const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.use(requireRole('admin', 'superadmin'));

adminRouter.delete('/users/:id', async (req, res) => {
  // Additional safeguards
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  const target = await db.user.findUnique({ where: { id: req.params.id } });
  if (target?.role === 'superadmin') {
    return res.status(403).json({ error: 'Cannot delete superadmin' });
  }
  await db.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.use('/api/admin', adminRouter);
```

### Remediation Checklist

- [ ] Implement role-based access control (RBAC) middleware
- [ ] Group admin endpoints under a common prefix with shared authorization
- [ ] Deny by default: require explicit role grants for every endpoint
- [ ] Log all unauthorized access attempts
- [ ] Separate user, moderator, and admin routes at the router level

---

## API6:2023 - Unrestricted Access to Sensitive Business Flows

APIs exposing business-critical flows without abuse prevention allow automated exploitation.

### Bad Pattern

```typescript
// VULNERABLE: No bot/abuse prevention on ticket purchase
app.post('/api/tickets/purchase', authenticate, async (req, res) => {
  const { eventId, quantity } = req.body;
  // Scalper bots can buy all tickets instantly
  const tickets = await purchaseTickets(req.user.id, eventId, quantity);
  res.json(tickets);
});
```

### Good Pattern

```typescript
// SECURE: Multi-layer abuse prevention
import { verifyCaptcha } from './lib/captcha';

app.post('/api/tickets/purchase',
  authenticate,
  purchaseLimiter,
  async (req, res) => {
    const { eventId, quantity, captchaToken } = req.body;

    // CAPTCHA verification
    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }

    // Per-user limits
    const existingPurchases = await db.ticket.count({
      where: { userId: req.user.id, eventId },
    });
    if (existingPurchases + quantity > 4) {
      return res.status(400).json({ error: 'Maximum 4 tickets per person' });
    }

    // Device fingerprinting check
    const fingerprint = req.headers['x-device-fingerprint'];
    const fpPurchases = await redis.get(`ticket_fp:${fingerprint}:${eventId}`);
    if (parseInt(fpPurchases || '0') > 4) {
      return res.status(429).json({ error: 'Purchase limit reached for this device' });
    }

    const tickets = await purchaseTickets(req.user.id, eventId, quantity);
    await redis.incr(`ticket_fp:${fingerprint}:${eventId}`);
    res.json(tickets);
  }
);
```

### Remediation Checklist

- [ ] Implement CAPTCHA for high-value business flows
- [ ] Enforce per-user and per-device action limits
- [ ] Use device fingerprinting for bot detection
- [ ] Block disposable email providers for registration
- [ ] Rate-limit sensitive business flows
- [ ] Monitor for automated patterns (rapid successive requests)

---

## API7:2023 - Server Side Request Forgery (SSRF)

See the A10 section in `owasp-web-security.md` for comprehensive SSRF coverage. Key API-specific pattern:

### Secure Webhook Pattern

```typescript
// SECURE: Validate webhook URLs before storing and calling
app.post('/api/webhooks', authenticate, async (req, res) => {
  const { url, events } = req.body;

  const validatedUrl = await validateExternalUrl(url);
  if (!validatedUrl) {
    return res.status(400).json({ error: 'Invalid webhook URL' });
  }

  const webhook = await db.webhook.create({
    data: {
      url: validatedUrl.toString(),
      events,
      userId: req.user.id,
      secret: crypto.randomBytes(32).toString('hex'),
    },
  });

  // Use a background job worker for delivery (not inline)
  await webhookQueue.add('test-ping', { webhookId: webhook.id });
  res.status(201).json({ id: webhook.id, secret: webhook.secret });
});
```

---

## API8:2023 - Security Misconfiguration

API-specific misconfiguration patterns beyond general web security:

### Secure Configuration

```typescript
// SECURE: Disable GraphQL introspection in production
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault(),
  ],
});

// SECURE: API error handling with correlation IDs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  logger.error({ requestId, error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Internal server error', requestId });
});
```

### Remediation Checklist

- [ ] Disable GraphQL introspection in production
- [ ] Remove GraphQL Playground/Explorer in production
- [ ] Return generic error messages with correlation IDs
- [ ] Disable unnecessary HTTP methods
- [ ] Validate Content-Type headers on all endpoints
- [ ] Set appropriate CORS for API endpoints (not `*`)

---

## API9:2023 - Improper Inventory Management

Old versions, debug endpoints, and shadow APIs remain exposed. Documentation is incomplete or outdated.

### Good Pattern

```typescript
// SECURE: API versioning with sunset headers
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Sunset', 'Sat, 01 Mar 2025 00:00:00 GMT');
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '</api/v2>; rel="successor-version"');
  next();
}, v1Router);

app.use('/api/v2', v2Router);

// SECURE: Remove debug endpoints in production
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/env', requireRole('superadmin'), (req, res) => {
    res.json({ NODE_ENV: process.env.NODE_ENV });
  });
}
```

### Remediation Checklist

- [ ] Maintain a complete API inventory (all versions, all endpoints)
- [ ] Set sunset dates and deprecation headers for old API versions
- [ ] Remove debug/test endpoints from production builds
- [ ] Generate OpenAPI specs and detect undocumented endpoints
- [ ] Monitor for shadow API endpoints

---

## API10:2023 - Unsafe Consumption of APIs

APIs consuming data from third-party services without proper validation.

### Good Pattern

```typescript
// SECURE: Validate and sanitize third-party API responses
import { z } from 'zod';

const enrichmentResponseSchema = z.object({
  company: z.string().max(200).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

app.post('/api/enrich-user', authenticate, async (req, res) => {
  const { userId } = req.body;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const enrichment = await fetch(
      `https://api.enrichment.io/v1/lookup?email=${encodeURIComponent(user.email)}`,
      {
        headers: { 'Authorization': `Bearer ${process.env.ENRICHMENT_API_KEY}` },
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
      }
    );

    if (!enrichment.ok) {
      return res.status(502).json({ error: 'Enrichment service unavailable' });
    }

    const rawData = await enrichment.json();
    const result = enrichmentResponseSchema.safeParse(rawData);

    if (!result.success) {
      logger.warn({ errors: result.error }, 'Invalid enrichment API response');
      return res.status(502).json({ error: 'Invalid response from enrichment service' });
    }

    await db.user.update({ where: { id: userId }, data: result.data });
    res.json({ success: true });
  } catch (error) {
    res.status(502).json({ error: 'Enrichment service unavailable' });
  }
});
```

### Remediation Checklist

- [ ] Validate all third-party API responses against schemas
- [ ] Sanitize third-party data before storing or rendering
- [ ] Set timeouts on all external API calls
- [ ] Disable redirect following when calling external APIs
- [ ] Use circuit breakers for unreliable third-party services

---

## Integration with Sigma Protocol

### /security-audit
Use this skill for API-specific security audit checks.

### Step 8 (Technical Spec)
Reference API security requirements when specifying backend architecture.

### /implement-prd
Check every API endpoint against BOLA, BFLA, and BOPLA before marking complete.

### /pr-review
Flag any new API endpoint missing authorization middleware.

---

_Every API endpoint is a contract. Verify that the contract enforces who can do what, with what data, how often, and how much._
