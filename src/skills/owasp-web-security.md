---
name: owasp-web-security
description: "OWASP Top 10 2021 and CWE Top 25 security skill. Covers all 10 categories with TypeScript/React code examples showing vulnerable patterns, secure implementations, detection methods, and remediation steps."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - implement-prd
  - pr-review
  - step-8-technical-spec
  - code-review
---

# OWASP Web Security Skill

Comprehensive coverage of the **OWASP Top 10 2021** and **CWE Top 25** vulnerabilities with actionable TypeScript/React code examples. Use this skill during security audits, code reviews, and implementation work to prevent common web application vulnerabilities.

## When to Invoke

Invoke this skill when:

- Running security audits (`/security-audit`)
- Reviewing pull requests (`/pr-review`)
- Implementing features with authentication, authorization, or data handling
- Writing technical specifications (Step 8)
- Any code that handles user input, authentication, or sensitive data

---

## A01:2021 - Broken Access Control

Access control enforces policy so users cannot act outside their intended permissions. Failures lead to unauthorized information disclosure, modification, or destruction of data.

### Bad Pattern

```typescript
// VULNERABLE: No authorization check on resource access
app.get('/api/users/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  // Anyone can access any user's profile by changing the userId
  const profile = await db.user.findUnique({ where: { id: userId } });
  res.json(profile);
});
```

### Good Pattern

```typescript
// SECURE: Verify the requesting user owns the resource
app.get('/api/users/:userId/profile', authenticate, async (req, res) => {
  const { userId } = req.params;

  // Verify the authenticated user matches the requested resource
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const profile = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }, // Explicit field selection
  });
  res.json(profile);
});
```

### Detection

- Search for API routes missing `authenticate` or `authorize` middleware
- Look for direct object references without ownership checks (`req.params.id` used directly)
- Check for missing role-based access control on admin endpoints
- Scan for `res.json(entireObject)` without field selection

### Remediation Checklist

- [ ] Deny access by default; require explicit grants
- [ ] Implement server-side access control on every endpoint
- [ ] Use ownership checks: user can only access their own resources
- [ ] Disable directory listing and remove metadata files from webroot
- [ ] Log access control failures and alert on repeated violations
- [ ] Rate-limit API access to minimize automated attack impact
- [ ] Invalidate JWT tokens on server after logout (use a blocklist)

---

## A02:2021 - Cryptographic Failures

Previously "Sensitive Data Exposure." Focuses on failures related to cryptography that lead to exposure of sensitive data.

### Bad Pattern

```typescript
// VULNERABLE: Storing passwords with weak hashing (MD5)
import crypto from 'crypto';

async function createUser(email: string, password: string) {
  // MD5 is broken for password hashing
  const hash = crypto.createHash('md5').update(password).digest('hex');
  await db.user.create({ data: { email, password: hash } });
}

// VULNERABLE: Sensitive data in JWT payload
const token = jwt.sign(
  { userId: user.id, ssn: user.ssn, creditCard: user.cc },
  'hardcoded-secret', // Hardcoded secret
  { expiresIn: '30d' } // Overly long expiration
);
```

### Good Pattern

```typescript
// SECURE: Use bcrypt with appropriate cost factor
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function createUser(email: string, password: string) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await db.user.create({ data: { email, passwordHash: hash } });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// SECURE: Minimal JWT payload, RS256, short expiry
const token = jwt.sign(
  { sub: user.id, role: user.role }, // Minimal claims, no sensitive data
  process.env.JWT_PRIVATE_KEY!,      // From environment variable
  { algorithm: 'RS256', expiresIn: '15m' } // Short-lived
);
```

### Detection

- Search for `createHash('md5')` or `createHash('sha1')` in password contexts
- Look for sensitive data fields in JWT payloads (SSN, credit card, etc.)
- Check for hardcoded secrets: `jwt.sign(payload, 'string-literal')`
- Scan for `http://` URLs where `https://` should be used
- Look for missing `Strict-Transport-Security` headers

### Remediation Checklist

- [ ] Use bcrypt/scrypt/argon2 for password hashing (never MD5/SHA1)
- [ ] Classify data and apply controls per classification
- [ ] Encrypt sensitive data at rest (AES-256-GCM)
- [ ] Enforce TLS for all data in transit (HSTS headers)
- [ ] Use strong, randomly generated keys from environment variables
- [ ] Disable caching for responses containing sensitive data
- [ ] Store secrets in a secrets manager, never in code

---

## A03:2021 - Injection

Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. Includes SQL injection, NoSQL injection, OS command injection, and XSS.

### Bad Pattern - SQL Injection

```typescript
// VULNERABLE: SQL Injection via string concatenation
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  // Direct string interpolation in SQL
  const results = await db.$queryRawUnsafe(
    `SELECT * FROM products WHERE name LIKE '%${query}%'`
  );
  res.json(results);
});
```

### Bad Pattern - XSS

```typescript
// VULNERABLE: XSS via dangerouslySetInnerHTML
function Comment({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### Bad Pattern - Command Injection

```typescript
// VULNERABLE: Command injection via child_process
// NOTE: Never use child_process.exec() with user input
import { execFile } from 'child_process';
// Even execFile is dangerous without input validation
```

### Good Pattern

```typescript
// SECURE: Parameterized queries (Prisma handles this by default)
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  const results = await db.product.findMany({
    where: { name: { contains: String(query), mode: 'insensitive' } },
  });
  res.json(results);
});

// SECURE: Sanitize HTML output or use text content
import DOMPurify from 'dompurify';

function Comment({ content }: { content: string }) {
  // Option 1: Sanitize if HTML is needed
  const clean = DOMPurify.sanitize(content, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;

  // Option 2 (preferred): Use text content - React escapes by default
  // return <div>{content}</div>;
}

// SECURE: Use execFile with argument array, validate input
import { execFile } from 'child_process';
import path from 'path';

app.post('/api/convert', (req, res) => {
  const { filename } = req.body;
  // Validate filename: only alphanumeric, hyphens, dots
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const safePath = path.join('/uploads', path.basename(filename));
  execFile('convert', [safePath, 'output.pdf'], (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Conversion failed' });
    res.send(stdout);
  });
});
```

### Detection

- Search for `$queryRawUnsafe`, `$executeRawUnsafe`, string concatenation in SQL
- Look for `dangerouslySetInnerHTML` without DOMPurify
- Search for `child_process` usage with string concatenation
- Check for `eval()`, `new Function()`, `setTimeout(string)`
- Look for unparameterized MongoDB queries: `{ $where: userInput }`

### Remediation Checklist

- [ ] Use parameterized queries / ORM methods for all database access
- [ ] Sanitize HTML output with DOMPurify when rendering user content
- [ ] Use `execFile()` with validated arguments (never shell-interpolated strings)
- [ ] Validate and sanitize all user input on the server side
- [ ] Apply Content Security Policy (CSP) headers
- [ ] Never use `eval()` or `new Function()` with user input

---

## A04:2021 - Insecure Design

Focuses on risks related to design and architectural flaws. Calls for more use of threat modeling, secure design patterns, and reference architectures.

### Bad Pattern

```typescript
// VULNERABLE: No rate limiting on authentication
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Reveals whether the email exists
    return res.status(401).json({ error: `No account found for ${email}` });
  }

  const token = generateToken(user);
  res.json({ token });
});

// VULNERABLE: No purchase limits, no fraud detection
app.post('/api/purchase', authenticate, async (req, res) => {
  const { itemId, quantity } = req.body;
  // No validation on quantity, no daily limits
  const order = await processOrder(req.user.id, itemId, quantity);
  res.json(order);
});
```

### Good Pattern

```typescript
// SECURE: Rate limiting, generic error messages, account lockout
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Generic message - does not reveal whether email exists
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check for account lockout
  if (user.failedAttempts >= 5) {
    return res.status(423).json({ error: 'Account locked. Contact support.' });
  }

  await db.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lastLogin: new Date() },
  });

  const token = generateToken(user);
  res.json({ token });
});

// SECURE: Business logic validation and abuse prevention
app.post('/api/purchase', authenticate, async (req, res) => {
  const { itemId, quantity } = req.body;

  // Validate quantity bounds
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
  }

  // Check daily purchase limit
  const todayOrders = await db.order.count({
    where: {
      userId: req.user.id,
      createdAt: { gte: startOfDay(new Date()) },
    },
  });

  if (todayOrders >= 50) {
    return res.status(429).json({ error: 'Daily purchase limit reached' });
  }

  const order = await processOrder(req.user.id, itemId, quantity);
  res.json(order);
});
```

### Remediation Checklist

- [ ] Use threat modeling for critical authentication and business flows
- [ ] Implement rate limiting on all authentication endpoints
- [ ] Use generic error messages that do not reveal system internals
- [ ] Define and enforce business logic limits (purchase quantities, transfer amounts)
- [ ] Write abuse case stories alongside user stories
- [ ] Implement account lockout after repeated failures

---

## A05:2021 - Security Misconfiguration

Includes missing security hardening, default credentials, unnecessary features enabled, overly permissive CORS, and missing security headers.

### Bad Pattern

```typescript
// VULNERABLE: Overly permissive CORS
import cors from 'cors';
app.use(cors({ origin: '*', credentials: true }));

// VULNERABLE: Verbose error messages in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // Exposes internal details
    query: req.query, // Exposes request details
  });
});

// VULNERABLE: Default/missing security headers
// No helmet, no CSP, no X-Frame-Options
```

### Good Pattern

```typescript
// SECURE: Restrictive CORS with explicit origins
import cors from 'cors';
import helmet from 'helmet';

const ALLOWED_ORIGINS = [
  'https://app.example.com',
  'https://admin.example.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// SECURE: Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// SECURE: Production-safe error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: 'An internal error occurred',
    requestId: req.id, // Return a correlation ID, not the error details
  });
});
```

### Detection

- Search for `cors({ origin: '*' })` or `cors()` with no origin restriction
- Look for `err.stack` or `err.message` in response bodies
- Check for missing `helmet()` middleware
- Verify CSP headers are present and restrictive
- Look for `X-Powered-By` header still enabled

### Remediation Checklist

- [ ] Use `helmet` for security headers (CSP, HSTS, X-Frame-Options)
- [ ] Configure CORS with explicit allowed origins (never `*` with credentials)
- [ ] Strip `X-Powered-By` header
- [ ] Return generic error messages in production
- [ ] Disable unnecessary HTTP methods
- [ ] Remove default accounts and credentials
- [ ] Disable directory browsing and debug endpoints in production

---

## A06:2021 - Vulnerable and Outdated Components

Using components with known vulnerabilities. Applies to OS, web/application server, DBMS, applications, APIs, and all components, libraries, and frameworks.

### Bad Pattern

```json
// VULNERABLE: package.json with outdated, vulnerable dependencies
{
  "dependencies": {
    "lodash": "4.17.15",
    "axios": "0.21.0",
    "jsonwebtoken": "8.5.0",
    "minimist": "1.2.5",
    "node-fetch": "2.6.0"
  }
}
```

### Good Pattern

```json
// SECURE: Keep dependencies current, use lockfile
{
  "dependencies": {
    "lodash": "^4.17.21",
    "axios": "^1.7.0",
    "jsonwebtoken": "^9.0.2",
    "node-fetch": "^3.3.2"
  },
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "deps:check": "npx npm-check-updates",
    "deps:update": "npx npm-check-updates -u && npm install"
  }
}
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

### Remediation Checklist

- [ ] Run `npm audit` in CI pipeline; fail builds on high/critical vulnerabilities
- [ ] Configure Dependabot or Renovate for automated dependency updates
- [ ] Remove unused dependencies (`npx depcheck`)
- [ ] Subscribe to security advisories for critical dependencies
- [ ] Pin exact versions in production (`package-lock.json` committed)
- [ ] Audit transitive dependencies, not just direct ones

---

## A07:2021 - Identification and Authentication Failures

Confirmation of the user's identity, authentication, and session management is critical. Failures include weak passwords, credential stuffing, and session fixation.

### Bad Pattern

```typescript
// VULNERABLE: Weak session management
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticate(email, password);

  if (user) {
    // Session ID in URL, no rotation, no expiry
    req.session.userId = user.id;
    // Missing: HttpOnly, Secure, SameSite cookie flags
    res.cookie('session', req.sessionID);
    res.json({ success: true });
  }
});
```

### Good Pattern

```typescript
// SECURE: Strong session management
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  name: '__Host-sid', // Cookie prefix for added security
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,       // Prevent JS access
    secure: true,         // HTTPS only
    sameSite: 'strict',   // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    domain: 'example.com',
    path: '/',
  },
}));

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password, totpCode } = req.body;
  const user = await authenticate(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify TOTP if MFA is enabled
  if (user.mfaEnabled) {
    const isValidTotp = verifyTOTP(user.mfaSecret, totpCode);
    if (!isValidTotp) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }
  }

  // Regenerate session ID to prevent session fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.userId = user.id;
    req.session.save(() => res.json({ success: true }));
  });
});

// SECURE: Password strength validation
import { z } from 'zod';

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');
```

### Remediation Checklist

- [ ] Implement multi-factor authentication
- [ ] Enforce strong password policies (min 12 chars, complexity, breach check)
- [ ] Use secure session configuration (HttpOnly, Secure, SameSite cookies)
- [ ] Regenerate session IDs after login
- [ ] Implement account lockout after failed attempts
- [ ] Use rate limiting on authentication endpoints
- [ ] Never expose session IDs in URLs

---

## A08:2021 - Software and Data Integrity Failures

Relates to code and infrastructure that does not protect against integrity violations. Includes insecure CI/CD pipelines, auto-update without verification, and deserialization issues.

### Bad Pattern

```typescript
// VULNERABLE: Deserialization of untrusted data
app.post('/api/import', (req, res) => {
  const data = JSON.parse(req.body.payload);
  // Prototype pollution risk
  Object.assign(config, data); // Allows __proto__ pollution
});
```

### Good Pattern

```typescript
// SECURE: Validate deserialized data with a schema
import { z } from 'zod';

const importSchema = z.object({
  name: z.string().max(255),
  items: z.array(z.object({
    id: z.string().uuid(),
    value: z.number().min(0).max(10000),
  })).max(100),
});

app.post('/api/import', (req, res) => {
  const result = importSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }

  // Use validated and typed data only
  processImport(result.data);
  res.json({ success: true });
});
```

```yaml
# SECURE: CI/CD pipeline with integrity checks
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Verify lockfile integrity
        run: npm ci --ignore-scripts
      - name: Run security audit
        run: npm audit --production --audit-level=high
      - name: Build with integrity
        run: npm run build
```

### Remediation Checklist

- [ ] Use Subresource Integrity (SRI) for all third-party scripts
- [ ] Validate deserialized data against strict schemas (Zod, Joi)
- [ ] Use `npm ci` instead of `npm install` in CI (respects lockfile exactly)
- [ ] Verify digital signatures on software updates
- [ ] Use code review for CI/CD pipeline changes
- [ ] Prevent `__proto__` pollution: use `Object.create(null)` for dictionaries

---

## A09:2021 - Security Logging and Monitoring Failures

Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response allows attackers to persist.

### Bad Pattern

```typescript
// VULNERABLE: No security logging
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) {
    // No logging of failed attempts
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: generateToken(user) });
});
```

### Good Pattern

```typescript
// SECURE: Structured security event logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'creditCard', 'ssn', 'authorization'],
});

function logSecurityEvent(req: Request, event: {
  event: string;
  userId?: string;
  success: boolean;
  reason?: string;
}) {
  logger.info({
    ...event,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  }, `security.${event.event}`);
}

app.post('/api/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);

  if (!user) {
    logSecurityEvent(req, {
      event: 'login_failed',
      success: false,
      reason: 'invalid_credentials',
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  logSecurityEvent(req, {
    event: 'login_success',
    userId: user.id,
    success: true,
  });

  res.json({ token: generateToken(user) });
});
```

### Remediation Checklist

- [ ] Log all authentication events (success and failure)
- [ ] Log access control failures
- [ ] Log input validation failures (potential attack probing)
- [ ] Use structured logging (JSON format with pino or winston)
- [ ] Redact sensitive data from logs (passwords, tokens, PII)
- [ ] Set up alerts for suspicious patterns (brute force, privilege escalation)
- [ ] Retain logs for at least 90 days for forensic analysis
- [ ] Forward logs to a centralized SIEM system

---

## A10:2021 - Server-Side Request Forgery (SSRF)

SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. Allows attackers to reach internal services.

### Bad Pattern

```typescript
// VULNERABLE: Fetching arbitrary user-supplied URLs
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  // No validation - attacker can hit internal services
  // e.g., url = "http://169.254.169.254/latest/meta-data/" (AWS metadata)
  const response = await fetch(url);
  const data = await response.text();
  res.json({ data });
});
```

### Good Pattern

```typescript
// SECURE: URL validation with allowlist and network restriction
import { URL } from 'url';
import dns from 'dns/promises';

const ALLOWED_DOMAINS = ['api.github.com', 'cdn.example.com'];

async function isInternalIP(hostname: string): Promise<boolean> {
  const addresses = await dns.resolve4(hostname);
  return addresses.some(ip => {
    return ip.startsWith('10.') ||
           ip.startsWith('172.16.') || ip.startsWith('172.17.') ||
           ip.startsWith('192.168.') ||
           ip.startsWith('169.254.') ||
           ip === '127.0.0.1' ||
           ip === '0.0.0.0';
  });
}

async function validateUrl(urlString: string): Promise<URL> {
  const url = new URL(urlString);

  // Only allow HTTPS
  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }

  // Domain allowlist
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    throw new Error('Domain not in allowlist');
  }

  // Prevent internal network access
  if (await isInternalIP(url.hostname)) {
    throw new Error('Internal network access not allowed');
  }

  return url;
}

app.post('/api/fetch-url', async (req, res) => {
  try {
    const validatedUrl = await validateUrl(req.body.url);
    const response = await fetch(validatedUrl.toString(), {
      redirect: 'error',    // Prevent redirect-based SSRF
      signal: AbortSignal.timeout(5000), // Timeout
    });
    const data = await response.text();
    res.json({ data: data.substring(0, 10000) }); // Limit response size
  } catch (error) {
    res.status(400).json({ error: 'Invalid or disallowed URL' });
  }
});
```

### Remediation Checklist

- [ ] Validate and sanitize all user-supplied URLs
- [ ] Use an allowlist of permitted domains/protocols
- [ ] Block requests to internal/private IP ranges (RFC 1918)
- [ ] Block requests to cloud metadata endpoints (169.254.169.254)
- [ ] Disable HTTP redirects or validate redirect destinations
- [ ] Apply network segmentation at the firewall level
- [ ] Set timeouts and response size limits on outbound requests

---

## CWE Top 25 Quick Reference

Beyond the OWASP Top 10, these CWE entries are the most dangerous software weaknesses:

| CWE | Name | OWASP Mapping |
|-----|------|---------------|
| CWE-79 | Cross-site Scripting (XSS) | A03 Injection |
| CWE-89 | SQL Injection | A03 Injection |
| CWE-20 | Improper Input Validation | A03 Injection |
| CWE-78 | OS Command Injection | A03 Injection |
| CWE-862 | Missing Authorization | A01 Broken Access Control |
| CWE-863 | Incorrect Authorization | A01 Broken Access Control |
| CWE-287 | Improper Authentication | A07 Auth Failures |
| CWE-522 | Insufficiently Protected Credentials | A02 Crypto Failures |
| CWE-611 | XXE | A05 Misconfiguration |
| CWE-918 | SSRF | A10 SSRF |
| CWE-502 | Deserialization of Untrusted Data | A08 Integrity Failures |
| CWE-276 | Incorrect Default Permissions | A01 Broken Access Control |

---

## Security Headers Quick Reference

```typescript
// Complete security headers configuration
import helmet from 'helmet';
app.use(helmet());

// Or manually:
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // Deprecated, CSP is better
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
  res.removeHeader('X-Powered-By');
  next();
});
```

---

## Integration with Sigma Protocol

### /security-audit
Use this skill as the primary checklist when running security audits.

### /pr-review
Reference OWASP categories when reviewing code changes.

### Step 8 (Technical Spec)
Include OWASP threat analysis in technical specifications.

### /implement-prd
Check each implementation against relevant OWASP categories before marking complete.

---

_Security is not a feature; it is a property of the system. Every line of code is an opportunity to either strengthen or weaken your application's security posture._
