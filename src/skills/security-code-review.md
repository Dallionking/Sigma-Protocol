---
name: security-code-review
description: "Security-focused code review skill. Covers STRIDE threat modeling, input validation patterns, output encoding, parameterized queries, auth middleware verification, CORS/CSP configuration, error handling, cryptography validation, secure file upload, and path traversal prevention."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - pr-review
  - implement-prd
  - code-review
  - verify-prd
---

# Security Code Review Skill

Comprehensive security-focused code review checklist covering **STRIDE threat modeling**, **input validation**, **authentication/authorization**, **cryptography**, **file upload security**, and **path traversal prevention**. Use this skill during code reviews, PR reviews, and security audits.

## When to Invoke

Invoke this skill when:

- Reviewing pull requests (`/pr-review`)
- Running security audits (`/security-audit`)
- Verifying PRD implementations (`/verify-prd`)
- Conducting code reviews on security-sensitive code
- Reviewing authentication, authorization, or data handling changes

---

## STRIDE Threat Modeling Per Component

Apply STRIDE analysis to every new component or significant change:

| Threat | Question | Example |
|--------|----------|---------|
| **S**poofing | Can an attacker pretend to be someone else? | Missing auth, weak session |
| **T**ampering | Can an attacker modify data they should not? | Missing integrity checks |
| **R**epudiation | Can an attacker deny their actions? | Missing audit logging |
| **I**nformation Disclosure | Can an attacker access restricted data? | Verbose errors, data leaks |
| **D**enial of Service | Can an attacker disrupt the service? | Missing rate limits |
| **E**levation of Privilege | Can an attacker gain unauthorized access? | Missing authorization |

### STRIDE Review Template

```markdown
## STRIDE Analysis: [Component Name]

### Spoofing
- [ ] Authentication required for all endpoints
- [ ] Session tokens are cryptographically strong
- [ ] No bearer token in URL parameters

### Tampering
- [ ] Input validation on all user-supplied data
- [ ] Integrity checks on critical data (checksums, HMAC)
- [ ] Database transactions for multi-step operations

### Repudiation
- [ ] Security events logged (login, access, changes)
- [ ] Logs include user ID, timestamp, action, result
- [ ] Logs are tamper-resistant (append-only, centralized)

### Information Disclosure
- [ ] Error messages do not reveal internals
- [ ] API responses include only necessary fields
- [ ] Sensitive data encrypted at rest and in transit

### Denial of Service
- [ ] Rate limiting on public and authenticated endpoints
- [ ] Input size limits (body, file upload, query params)
- [ ] Pagination enforced on list endpoints

### Elevation of Privilege
- [ ] Authorization checks on every endpoint
- [ ] Role-based access control enforced server-side
- [ ] No client-side-only authorization
```

---

## Input Validation Patterns

### Validation Strategy

```typescript
// SECURE: Validate all inputs at the boundary
import { z } from 'zod';

// Define schemas once, reuse everywhere
const schemas = {
  userId: z.string().uuid(),
  email: z.string().email().max(254),
  password: z.string().min(12).max(128),
  displayName: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s._-]+$/),
  pageNumber: z.number().int().min(1).max(10000),
  pageSize: z.number().int().min(1).max(100),
  sortField: z.enum(['createdAt', 'name', 'updatedAt']),
  sortOrder: z.enum(['asc', 'desc']),
  url: z.string().url().startsWith('https://'),
  monetaryAmount: z.number().min(0).max(1_000_000).multipleOf(0.01),
};

// Compose schemas for specific endpoints
const createUserSchema = z.object({
  email: schemas.email,
  password: schemas.password,
  displayName: schemas.displayName,
});

// Middleware for automatic validation
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      ...req.body,
      ...req.query,
      ...req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
    }

    req.validated = result.data;
    next();
  };
}

// Usage
app.post('/api/users', validate(createUserSchema), async (req, res) => {
  const { email, password, displayName } = req.validated;
  // All values are validated and typed
});
```

### Input Source Validation Guide

| Input Source | What to Check |
|-------------|---------------|
| URL params | UUID format, enum values, numeric ranges |
| Query strings | Pagination limits, sort fields (allowlist), search terms |
| Request body | Schema validation, field types, string lengths |
| Headers | Content-Type, Authorization format |
| File uploads | MIME type, file size, filename characters |
| Cookies | Format, signature validity |

---

## Output Encoding

### Context-Specific Encoding

```typescript
// SECURE: HTML context - React auto-escapes by default
function UserProfile({ name }: { name: string }) {
  return <h1>{name}</h1>; // React escapes: <script> becomes &lt;script&gt;
}

// SECURE: URL context - encode components
function buildSearchUrl(query: string): string {
  return `https://api.example.com/search?q=${encodeURIComponent(query)}`;
}

// SECURE: JSON context - use JSON.stringify
function buildJsonPayload(userData: unknown): string {
  return JSON.stringify(userData); // Properly escapes special chars
}

// SECURE: HTTP header context
function setContentDisposition(filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}"`);
}

// SECURE: Database context - always use parameterized queries
const results = await db.product.findMany({
  where: { name: { contains: userInput } }, // ORM handles escaping
});
```

---

## Auth Middleware Verification

### Red Flags During Review

```typescript
// RED FLAG 1: Routes without authentication middleware
app.get('/api/users', async (req, res) => { /* no authenticate */ });

// RED FLAG 2: authorize() without authenticate() before it
app.delete('/api/posts/:id', authorize('admin'), handler);
// Should be: authenticate, THEN authorize

// RED FLAG 3: findUnique() without userId/tenantId filter
const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });
// Should include: userId: req.user.id

// RED FLAG 4: Admin routes without role check
app.post('/api/admin/promote', authenticate, handler);
// Missing: requireRole('admin')

// RED FLAG 5: DELETE/PUT without ownership verification
app.delete('/api/posts/:id', authenticate, async (req, res) => {
  await db.post.delete({ where: { id: req.params.id } });
  // Missing: verify req.user.id owns this post
});
```

### Correct Pattern

```typescript
// SECURE: Every route has auth + authz + ownership
app.delete('/api/posts/:id',
  authenticate,                    // Step 1: Who are you?
  requireRole('user', 'admin'),    // Step 2: Are you allowed?
  async (req, res) => {
    const post = await db.post.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,       // Step 3: Do you own this?
      },
    });

    if (!post) return res.status(404).json({ error: 'Not found' });

    await db.post.delete({ where: { id: post.id } });
    res.json({ success: true });
  }
);
```

---

## CORS/CSP Configuration Review

### CORS Red Flags

```typescript
// RED FLAG: Wildcard origin with credentials
cors({ origin: '*', credentials: true });

// RED FLAG: Reflecting any origin
cors({ origin: (origin, cb) => cb(null, true) });

// RED FLAG: No CORS configuration at all (defaults to permissive)
```

### CORS Secure Pattern

```typescript
const ALLOWED_ORIGINS = ['https://app.example.com'];

cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});
```

### CSP Red Flags

| Directive | Red Flag | Why |
|-----------|----------|-----|
| `script-src` | `'unsafe-inline'` | Allows inline script injection (XSS) |
| `script-src` | `'unsafe-eval'` | Allows dynamic code execution |
| `default-src` | `*` | Allows loading from any source |
| `connect-src` | `*` | Allows requests to any server |
| Missing CSP | No header at all | No protection against XSS |

### CSP Secure Pattern

```typescript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Often needed for CSS-in-JS
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.example.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
}));
```

---

## Error Handling (No Info Leakage)

### Bad Pattern

```typescript
// VULNERABLE: Leaks internal details
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: err.message,        // Internal error message
    stack: err.stack,          // Full stack trace
    sql: (err as any).sql,     // Leaked SQL query
    query: req.body,           // User input echoed
  });
});
```

### Good Pattern

```typescript
// SECURE: Correlation ID for debugging, no internals exposed
import crypto from 'crypto';

class AppError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage?: string
  ) {
    super(userMessage);
  }
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();

  // Log full details internally (never to client)
  logger.error({
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.userMessage,
      requestId,
    });
  }

  res.status(500).json({
    error: 'An internal error occurred',
    requestId, // User can reference this for support
  });
});
```

---

## Cryptography Validation

### What to Check During Review

| Check | Insecure | Secure |
|-------|----------|--------|
| Password hashing | MD5, SHA1, SHA256 | bcrypt, scrypt, argon2 |
| Token signing | HS256 with weak secret | RS256 with key pair |
| Encryption | DES, 3DES, RC4 | AES-256-GCM |
| Random generation | `Math.random()` | `crypto.randomBytes()` |
| Key storage | Hardcoded in source | Environment variable / Vault |
| Hash comparison | `===` (timing attack) | `crypto.timingSafeEqual()` |

### Timing-Safe Comparison

```typescript
// VULNERABLE: Regular comparison is vulnerable to timing attacks
if (providedToken === storedToken) { /* ... */ }

// SECURE: Constant-time comparison
import crypto from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

---

## Secure File Upload

```typescript
// SECURE: Comprehensive file upload validation
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
]);

const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => {
    // Random filename prevents path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }

    // Verify extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    };

    if (!validExtensions[file.mimetype]?.includes(ext)) {
      cb(new Error('Extension does not match content type'));
      return;
    }

    cb(null, true);
  },
});

app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Validate file content (magic bytes) after upload
  const isValid = await validateFileContent(req.file.path, req.file.mimetype);
  if (!isValid) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid file content' });
  }

  const url = await uploadToStorage(req.file.path, req.file.filename);
  res.json({ url });
});
```

---

## Path Traversal Prevention

### Bad Pattern

```typescript
// VULNERABLE: User controls file path
app.get('/api/files/:filename', (req, res) => {
  const filePath = `/uploads/${req.params.filename}`;
  // Attacker sends: ../../../etc/passwd
  res.sendFile(filePath);
});
```

### Good Pattern

```typescript
// SECURE: Path traversal prevention
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve('/app/uploads');

app.get('/api/files/:filename', authenticate, (req, res) => {
  const { filename } = req.params;

  // Step 1: Validate filename characters
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Step 2: Resolve and verify path stays within upload directory
  const requestedPath = path.resolve(UPLOAD_DIR, filename);
  if (!requestedPath.startsWith(UPLOAD_DIR)) {
    logger.warn({ filename, requestedPath }, 'Path traversal attempt');
    return res.status(403).json({ error: 'Access denied' });
  }

  // Step 3: Verify file exists and is a regular file (not symlink)
  try {
    const stats = fs.lstatSync(requestedPath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'File not found' });
    }
  } catch {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(requestedPath);
});
```

---

## Security Code Review Master Checklist

### Before Approving Any PR

**Authentication and Authorization**
- [ ] All new endpoints have authentication middleware
- [ ] Authorization checks present (role/ownership)
- [ ] No admin endpoints without admin role check
- [ ] Tokens validated server-side

**Input Validation**
- [ ] All user inputs validated with Zod/Joi schemas
- [ ] File uploads validated (MIME type, size, extension)
- [ ] URL parameters validated (UUIDs, enums, ranges)
- [ ] Pagination has maximum limits

**Output Security**
- [ ] No sensitive data in API responses (use `select`)
- [ ] Error messages do not reveal internals
- [ ] User-generated HTML sanitized with DOMPurify

**Data Access**
- [ ] Parameterized queries used (no string concatenation in SQL)
- [ ] Tenant isolation enforced (RLS or query filters)
- [ ] Resource ownership verified before modification

**Cryptography**
- [ ] No hardcoded secrets or keys
- [ ] Strong hashing for passwords (bcrypt/argon2)
- [ ] Timing-safe comparison for tokens
- [ ] Secure random generation (crypto.randomBytes)

**Configuration**
- [ ] CORS configured with explicit origins
- [ ] Security headers present (CSP, HSTS)
- [ ] Debug logging disabled in production
- [ ] No `.env` files committed

**Logging**
- [ ] Security events logged (auth, access control)
- [ ] Sensitive data redacted from logs
- [ ] No raw user input in log format strings

---

## Integration with Sigma Protocol

### /pr-review
Use this skill as the primary security review checklist.

### /security-audit
Apply STRIDE analysis to each component.

### /verify-prd
Verify security requirements are implemented correctly.

### /implement-prd
Reference this skill during implementation to build securely from the start.

---

_Security code review is not about finding every bug - it is about establishing a security baseline that prevents entire classes of vulnerabilities from shipping to production._
