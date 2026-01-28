---
name: defense-in-depth
description: "Apply multi-layer validation and security. Input validation at edge/API/service/database. Error boundaries, graceful degradation, security layering."
version: "1.0.0"
tags: [security, validation, architecture, error-handling, resilience]
triggers:
  - security
  - validation
  - input validation
  - error boundary
  - graceful degradation
  - defense in depth
  - sanitization
---

# Defense in Depth

This skill applies **multi-layer validation and security** principles to application architecture. No single layer should be trusted completely. Every boundary is an opportunity for validation.

## Overview

Defense in depth is a security strategy where multiple independent layers of protection ensure that failure of one layer doesn't compromise the system. In software:

```
Request → Edge → API → Service → Database
           ↓      ↓       ↓          ↓
        Validate Validate Validate Validate
```

Each layer validates independently. Each layer assumes previous layers might have failed.

---

## When to Use This Skill

Invoke this skill when:

- Designing input handling for any feature
- Building APIs that accept user data
- Implementing authentication/authorization
- Handling sensitive operations (payments, data modification)
- Designing error handling strategies
- Reviewing code for security vulnerabilities
- Building public-facing applications

---

## Input Validation Layers

### Layer 1: Edge (Client/Gateway)

**Purpose**: Fail fast, reduce server load, improve UX

```typescript
// Browser/Mobile Client
function validateLoginForm(data: FormData): ValidationResult {
  const errors: string[] = [];

  // Format validation only - no business logic
  if (!data.email.includes('@')) {
    errors.push('Invalid email format');
  }
  if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return { valid: errors.length === 0, errors };
}

// API Gateway / Edge Function
function validateRequest(req: Request): void {
  // Size limits
  if (req.body.length > MAX_BODY_SIZE) {
    throw new PayloadTooLarge();
  }

  // Rate limiting
  if (isRateLimited(req.ip)) {
    throw new TooManyRequests();
  }

  // Basic format checks
  if (!req.headers['content-type']?.includes('application/json')) {
    throw new UnsupportedMediaType();
  }
}
```

**Edge Layer Validates:**
- Format (email format, date format)
- Size limits (file size, field length)
- Rate limits
- Content type
- Required fields present

**Edge Layer Does NOT Validate:**
- Business rules
- Authorization
- Data consistency
- Uniqueness constraints

### Layer 2: API (Controller/Handler)

**Purpose**: Validate request structure, authenticate, authorize

```typescript
// API Controller
async function createUser(req: Request, res: Response) {
  // 1. Schema validation
  const parseResult = CreateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.issues
    });
  }

  // 2. Authentication check
  const caller = await authenticateRequest(req);
  if (!caller) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Authorization check
  if (!caller.permissions.includes('user:create')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 4. Sanitization
  const sanitizedData = {
    email: sanitizeEmail(parseResult.data.email),
    name: sanitizeString(parseResult.data.name),
    role: parseResult.data.role // Enum, no sanitization needed
  };

  // Pass to service layer
  const user = await userService.create(sanitizedData, caller);
  return res.status(201).json(user);
}

// Zod schema for validation
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin', 'viewer'])
});
```

**API Layer Validates:**
- Request schema (structure, types)
- Authentication (who is calling)
- Authorization (are they allowed)
- Input sanitization

### Layer 3: Service (Business Logic)

**Purpose**: Enforce business rules, validate state

```typescript
// Service Layer
class UserService {
  async create(data: CreateUserInput, caller: User): Promise<User> {
    // 1. Business rule validation
    if (data.role === 'admin' && !caller.isSuperAdmin) {
      throw new BusinessRuleError('Only super admins can create admins');
    }

    // 2. State validation
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 3. Domain validation
    if (data.role === 'admin') {
      const adminCount = await this.userRepo.countAdmins();
      if (adminCount >= MAX_ADMINS) {
        throw new BusinessRuleError('Maximum admin count reached');
      }
    }

    // 4. Create with validated data
    const user = new User({
      ...data,
      password: await hashPassword(data.password),
      createdBy: caller.id,
      createdAt: new Date()
    });

    return this.userRepo.save(user);
  }
}
```

**Service Layer Validates:**
- Business rules (domain logic)
- State consistency (duplicates, limits)
- Cross-entity constraints
- Workflow state transitions

### Layer 4: Database (Persistence)

**Purpose**: Last line of defense, enforce data integrity

```sql
-- Database constraints
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin', 'viewer')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Additional constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for uniqueness enforcement
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
```

```typescript
// Repository with final validation
class UserRepository {
  async save(user: User): Promise<User> {
    try {
      return await this.db.insert('users', user);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError('Email already exists');
      }
      if (isCheckConstraintError(error)) {
        throw new ValidationError('Invalid data format');
      }
      throw error;
    }
  }
}
```

**Database Layer Validates:**
- Data types (cannot store string in integer)
- Constraints (unique, foreign key, check)
- Referential integrity
- Size limits

---

## Error Boundary Placement

### React Error Boundaries

```tsx
// Granular error boundaries for graceful degradation
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Critical - if this fails, show error */}
      <ErrorBoundary fallback={<DashboardError />}>
        <DashboardHeader />
      </ErrorBoundary>

      <div className="dashboard-grid">
        {/* Non-critical - if this fails, show placeholder */}
        <ErrorBoundary fallback={<WidgetPlaceholder />}>
          <RevenueWidget />
        </ErrorBoundary>

        <ErrorBoundary fallback={<WidgetPlaceholder />}>
          <UsersWidget />
        </ErrorBoundary>

        {/* Analytics can fail silently */}
        <ErrorBoundary fallback={null}>
          <AnalyticsWidget />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logger.error('Component error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

### API Error Handling Layers

```typescript
// Layer 1: Route-level error handler
app.use('/api/users', userRouter);

// Layer 2: Controller-level try/catch
async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);  // Pass to error middleware
  }
}

// Layer 3: Global error middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log all errors
  logger.error('Request error', {
    error,
    path: req.path,
    method: req.method
  });

  // Map known errors to responses
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Unknown errors - don't leak details
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## Graceful Degradation Patterns

### Pattern 1: Feature Flags

```typescript
async function getRecommendations(userId: string): Promise<Recommendation[]> {
  // Primary: ML recommendations
  if (featureFlags.isEnabled('ml-recommendations')) {
    try {
      return await mlService.getRecommendations(userId);
    } catch (error) {
      logger.warn('ML recommendations failed, falling back', { error });
    }
  }

  // Fallback: Rule-based recommendations
  if (featureFlags.isEnabled('rule-recommendations')) {
    try {
      return await ruleService.getRecommendations(userId);
    } catch (error) {
      logger.warn('Rule recommendations failed, falling back', { error });
    }
  }

  // Final fallback: Popular items
  return await popularItemsService.getPopular();
}
```

### Pattern 2: Circuit Breaker

```typescript
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(externalService.call, {
  timeout: 3000,           // Call timeout
  errorThresholdPercentage: 50,  // Open circuit at 50% failures
  resetTimeout: 30000,     // Try again after 30s
});

breaker.fallback(() => {
  // Return cached data or default when circuit is open
  return cachedData || DEFAULT_RESPONSE;
});

breaker.on('open', () => logger.warn('Circuit opened'));
breaker.on('halfOpen', () => logger.info('Circuit half-open'));
breaker.on('close', () => logger.info('Circuit closed'));

// Usage
const result = await breaker.fire(params);
```

### Pattern 3: Stale-While-Revalidate

```typescript
async function getData(key: string): Promise<Data> {
  const cached = await cache.get(key);

  if (cached && !isStale(cached)) {
    return cached.data;
  }

  // Return stale data immediately, refresh in background
  if (cached) {
    refreshInBackground(key);  // Don't await
    return cached.data;
  }

  // No cache, must fetch
  const fresh = await fetchFresh(key);
  await cache.set(key, { data: fresh, timestamp: Date.now() });
  return fresh;
}

function isStale(cached: CacheEntry): boolean {
  return Date.now() - cached.timestamp > STALE_THRESHOLD;
}

async function refreshInBackground(key: string): Promise<void> {
  try {
    const fresh = await fetchFresh(key);
    await cache.set(key, { data: fresh, timestamp: Date.now() });
  } catch (error) {
    logger.warn('Background refresh failed', { key, error });
    // Keep serving stale data
  }
}
```

---

## Security Layers

### Layer 1: Authentication

Verify identity: "Who are you?"

```typescript
// JWT verification middleware
async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = await verifyJWT(token);
    req.user = await userService.findById(payload.sub);

    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Layer 2: Authorization

Verify permissions: "What can you do?"

```typescript
// RBAC middleware
function authorize(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasPermission = requiredPermissions.every(
      permission => user.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('Authorization denied', {
        userId: user.id,
        required: requiredPermissions,
        actual: user.permissions
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
router.delete(
  '/users/:id',
  authenticate,
  authorize('user:delete'),
  deleteUserHandler
);
```

### Layer 3: Validation

Verify data correctness: "Is this valid?"

```typescript
// Input validation middleware
function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    req.validated = result.data;
    next();
  };
}
```

### Layer 4: Sanitization

Clean data: "Is this safe?"

```typescript
import DOMPurify from 'isomorphic-dompurify';
import sqlstring from 'sqlstring';

// HTML sanitization (for rich text)
function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

// SQL parameterization (should use ORM, but if raw SQL needed)
function sanitizeSql(value: string): string {
  return sqlstring.escape(value);
}

// Path sanitization (prevent directory traversal)
function sanitizePath(userPath: string): string {
  const normalized = path.normalize(userPath);
  if (normalized.includes('..')) {
    throw new SecurityError('Directory traversal attempt');
  }
  return path.join(ALLOWED_BASE_PATH, normalized);
}

// General string sanitization
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove potential HTML
    .slice(0, MAX_STRING_LENGTH);
}
```

---

## Web Application Example

Complete defense-in-depth for a user registration endpoint:

```typescript
// === EDGE LAYER (API Gateway) ===
// Rate limiting, size limits, format checks
gateway.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
gateway.use(express.json({ limit: '10kb' }));

// === API LAYER ===
const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(100)
  })
});

router.post('/register',
  // Validation middleware
  validate(RegisterSchema),

  // CAPTCHA verification
  verifyCaptcha,

  // Handler
  async (req: Request, res: Response) => {
    const { email, password, name } = req.validated.body;

    // Sanitization
    const sanitized = {
      email: email.toLowerCase().trim(),
      password,  // Will be hashed, no sanitization needed
      name: sanitizeString(name)
    };

    try {
      const user = await userService.register(sanitized);
      res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).json({ error: 'Email already registered' });
      } else {
        throw error;
      }
    }
  }
);

// === SERVICE LAYER ===
class UserService {
  async register(data: RegisterInput): Promise<User> {
    // Business rule: Check password strength
    if (!this.isPasswordStrong(data.password)) {
      throw new ValidationError('Password does not meet requirements');
    }

    // State validation: Check email uniqueness
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Domain rule: Rate limit registrations from same IP
    if (await this.isRegistrationRateLimited(data.ip)) {
      throw new RateLimitError('Too many registration attempts');
    }

    // Create user
    const user = new User({
      ...data,
      password: await bcrypt.hash(data.password, 12),
      status: 'pending_verification',
      createdAt: new Date()
    });

    return this.userRepo.save(user);
  }
}

// === DATABASE LAYER ===
// Constraints in schema
// email UNIQUE, status CHECK, password_hash NOT NULL
```

---

## Checklist: Defense in Depth

Before shipping any feature:

**Validation Layers:**
- [ ] Edge validation (format, size, rate limits)
- [ ] API validation (schema, authentication, authorization)
- [ ] Service validation (business rules, state)
- [ ] Database constraints (unique, foreign key, check)

**Error Handling:**
- [ ] Error boundaries at appropriate granularity
- [ ] Graceful degradation for non-critical features
- [ ] Circuit breakers for external dependencies
- [ ] No sensitive data in error messages

**Security:**
- [ ] Authentication required for protected routes
- [ ] Authorization checked for sensitive operations
- [ ] Input validated before processing
- [ ] Output sanitized before rendering
- [ ] No SQL/NoSQL injection vectors
- [ ] No XSS vectors

---

## Anti-Patterns

### 1. Trust the Client

```typescript
// ❌ Trusting client-validated data
app.post('/transfer', (req, res) => {
  // Client "validated" this, so it must be fine!
  await transfer(req.body.amount, req.body.toAccount);
});

// ✅ Validate server-side regardless
app.post('/transfer', validate(TransferSchema), async (req, res) => {
  const { amount, toAccount } = req.validated.body;
  // Additional server validation...
});
```

### 2. Single Layer Validation

```typescript
// ❌ Only validating at API level
// If API validation has bug, data goes straight to DB

// ✅ Validate at every layer
// API validates → Service validates → DB constraints catch remainder
```

### 3. Trusting Internal Services

```typescript
// ❌ Internal service, so skip validation
async function processInternalMessage(data: unknown) {
  await db.insert(data);  // What if internal service is compromised?
}

// ✅ Validate internal messages too
async function processInternalMessage(data: unknown) {
  const validated = InternalMessageSchema.parse(data);
  await db.insert(validated);
}
```

---

*Remember: Every layer can fail. Every layer can be bypassed. Design each layer as if it's the only layer. Together, they create security no single layer could achieve.*
