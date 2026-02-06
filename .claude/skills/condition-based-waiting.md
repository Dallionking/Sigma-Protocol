---
name: condition-based-waiting
description: "Replace arbitrary delays with condition-based polling. Use exponential backoff, proper timeouts, and framework-specific waiters for reliable async code."
version: "1.0.0"
tags: [async, testing, reliability, polling, timeout, wait]
triggers:
  - flaky test
  - race condition
  - timeout
  - sleep
  - delay
  - wait for
  - polling
  - async timing
user-invocable: false
---

# Condition-Based Waiting

This skill replaces arbitrary delays (`sleep(5)`, `setTimeout(1000)`) with **condition-based polling** that waits for actual state changes. Arbitrary delays are the #1 cause of flaky tests and unreliable async code.

## Overview

The core principle: **Never wait for TIME. Wait for CONDITIONS.**

```javascript
// ❌ Arbitrary delay - flaky
await sleep(5000);
expect(element).toBeVisible();

// ✅ Condition-based - reliable
await waitFor(() => expect(element).toBeVisible());
```

---

## When to Use This Skill

Invoke this skill when:

- Tests fail intermittently in CI but pass locally
- Code uses `setTimeout` or `sleep` for synchronization
- Operations depend on external services responding
- UI needs to wait for animations or transitions
- Data needs to propagate through a system
- API calls have variable response times

---

## The Anti-Pattern: Arbitrary Delays

### Why Arbitrary Delays Fail

```javascript
// ❌ ANTI-PATTERN: sleep(5000)
async function waitForDeployment() {
  await triggerDeployment();
  await sleep(5000);           // Why 5 seconds?
  return await getDeploymentStatus();
}
```

**Problems:**

1. **Too short**: Fast locally, slow in CI → flaky failures
2. **Too long**: Wastes time when operation completes quickly
3. **Unpredictable**: Network latency, load variance, resource contention
4. **No feedback**: Silent waiting with no visibility into progress
5. **Compounds**: Multiple delays multiply the unreliability

### Common Offenders

```javascript
// ❌ All of these are anti-patterns:
await sleep(1000);
await new Promise(r => setTimeout(r, 5000));
await delay(3000);
jest.advanceTimersByTime(1000);  // When used as a substitute for proper waiting
```

---

## The Pattern: Poll with Timeout and Backoff

### Basic Polling Pattern

```typescript
interface PollOptions {
  timeout: number;        // Maximum time to wait (ms)
  interval: number;       // Time between attempts (ms)
  description?: string;   // For error messages
}

async function pollUntil<T>(
  condition: () => T | Promise<T>,
  options: PollOptions
): Promise<T> {
  const { timeout, interval, description = 'condition' } = options;
  const start = Date.now();

  while (true) {
    try {
      const result = await condition();
      if (result) return result;
    } catch (error) {
      // Condition threw - might be expected (element not found yet)
    }

    if (Date.now() - start >= timeout) {
      throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
    }

    await sleep(interval);
  }
}

// Usage
const result = await pollUntil(
  () => api.getStatus() === 'ready',
  { timeout: 30000, interval: 500, description: 'deployment ready' }
);
```

### Exponential Backoff Pattern

For operations where rapid polling is expensive:

```typescript
interface BackoffOptions {
  timeout: number;
  initialInterval: number;
  maxInterval: number;
  backoffFactor: number;  // Multiply interval by this each attempt
  description?: string;
}

async function pollWithBackoff<T>(
  condition: () => T | Promise<T>,
  options: BackoffOptions
): Promise<T> {
  const {
    timeout,
    initialInterval,
    maxInterval,
    backoffFactor,
    description = 'condition'
  } = options;

  const start = Date.now();
  let interval = initialInterval;

  while (true) {
    try {
      const result = await condition();
      if (result) return result;
    } catch (error) {
      // Condition not met yet
    }

    if (Date.now() - start >= timeout) {
      throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
    }

    await sleep(interval);
    interval = Math.min(interval * backoffFactor, maxInterval);
  }
}

// Usage - starts at 100ms, doubles each time, caps at 5s
const result = await pollWithBackoff(
  () => externalService.isReady(),
  {
    timeout: 60000,
    initialInterval: 100,
    maxInterval: 5000,
    backoffFactor: 2,
    description: 'external service ready'
  }
);
```

---

## Framework Integration

### Jest / Vitest

```typescript
import { waitFor } from '@testing-library/react';

// ❌ ANTI-PATTERN
test('shows success message', async () => {
  await submitForm();
  await sleep(1000);  // Flaky!
  expect(screen.getByText('Success')).toBeVisible();
});

// ✅ CORRECT
test('shows success message', async () => {
  await submitForm();
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeVisible();
  });
});

// With custom timeout
test('shows success after processing', async () => {
  await submitForm();
  await waitFor(
    () => expect(screen.getByText('Success')).toBeVisible(),
    { timeout: 5000, interval: 100 }
  );
});
```

### Playwright

```typescript
// ❌ ANTI-PATTERN
test('button becomes enabled', async ({ page }) => {
  await page.click('#submit');
  await page.waitForTimeout(2000);  // Flaky!
  await expect(page.locator('#next')).toBeEnabled();
});

// ✅ CORRECT - Auto-waiting
test('button becomes enabled', async ({ page }) => {
  await page.click('#submit');
  // Playwright auto-waits for actionability
  await expect(page.locator('#next')).toBeEnabled();
});

// For custom conditions
test('data loads', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForFunction(
    () => document.querySelectorAll('.data-row').length > 0
  );
});

// Wait for network idle
test('page fully loads', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
});

// Wait for specific response
test('API call completes', async ({ page }) => {
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/data')
  );
  await page.click('#load-data');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});
```

### Cypress

```typescript
// ❌ ANTI-PATTERN
it('shows results', () => {
  cy.get('#search').type('query');
  cy.wait(2000);  // Flaky!
  cy.get('.results').should('have.length.gt', 0);
});

// ✅ CORRECT - Built-in retry
it('shows results', () => {
  cy.get('#search').type('query');
  // Cypress automatically retries assertions
  cy.get('.results').should('have.length.gt', 0);
});

// With custom timeout
it('shows results after slow search', () => {
  cy.get('#search').type('query');
  cy.get('.results', { timeout: 10000 }).should('have.length.gt', 0);
});

// Wait for specific request
it('loads data', () => {
  cy.intercept('GET', '/api/data').as('getData');
  cy.visit('/dashboard');
  cy.wait('@getData');
  cy.get('.data-loaded').should('be.visible');
});
```

### Node.js / Backend

```typescript
// ❌ ANTI-PATTERN
async function waitForDatabaseReady() {
  await sleep(5000);  // Hope it's ready!
  return db.query('SELECT 1');
}

// ✅ CORRECT
async function waitForDatabaseReady() {
  return pollUntil(
    async () => {
      try {
        await db.query('SELECT 1');
        return true;
      } catch {
        return false;
      }
    },
    { timeout: 30000, interval: 500, description: 'database ready' }
  );
}

// With connection retry library (e.g., p-retry)
import pRetry from 'p-retry';

async function connectWithRetry() {
  return pRetry(
    async () => {
      const connection = await db.connect();
      return connection;
    },
    {
      retries: 5,
      minTimeout: 1000,
      maxTimeout: 10000,
      factor: 2,
      onFailedAttempt: error => {
        console.log(`Attempt ${error.attemptNumber} failed. Retrying...`);
      }
    }
  );
}
```

---

## Timeout Configuration Best Practices

### Timeout Hierarchy

```typescript
// Define timeouts based on operation type
const TIMEOUTS = {
  // UI interactions - should be fast
  UI_FEEDBACK: 1000,        // Button state change, loading indicator
  UI_TRANSITION: 2000,      // Animations, page transitions

  // Network operations - variable
  API_CALL: 5000,           // Single API request
  API_AGGREGATE: 15000,     // Multiple dependent requests

  // External services - potentially slow
  DATABASE: 10000,          // DB connection/query
  EXTERNAL_API: 30000,      // Third-party services
  DEPLOYMENT: 300000,       // Infrastructure changes

  // Tests - should be bounded
  TEST_ASSERTION: 5000,     // Single test assertion
  TEST_SETUP: 30000,        // Test environment setup
} as const;
```

### Environment-Aware Timeouts

```typescript
const getTimeout = (base: number): number => {
  const multiplier = process.env.CI ? 2 : 1;  // CI is slower
  return base * multiplier;
};

// Usage
await waitFor(
  () => expect(element).toBeVisible(),
  { timeout: getTimeout(TIMEOUTS.UI_FEEDBACK) }
);
```

### Fail-Fast Configuration

```typescript
// For critical operations, fail fast rather than hanging
const criticalPoll = async <T>(
  condition: () => T | Promise<T>,
  description: string
): Promise<T> => {
  return pollUntil(condition, {
    timeout: 5000,      // Short timeout
    interval: 100,      // Frequent checks
    description
  });
};

// For non-critical operations, be more patient
const backgroundPoll = async <T>(
  condition: () => T | Promise<T>,
  description: string
): Promise<T> => {
  return pollWithBackoff(condition, {
    timeout: 60000,
    initialInterval: 500,
    maxInterval: 5000,
    backoffFactor: 1.5,
    description
  });
};
```

---

## Examples

### Example 1: Replacing sleep in Tests

```typescript
// ❌ BEFORE: Flaky test with arbitrary delay
test('user can submit form', async () => {
  render(<ContactForm />);

  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

  await sleep(2000);  // Wait for submission... maybe?

  expect(screen.getByText('Thank you!')).toBeInTheDocument();
});

// ✅ AFTER: Reliable test with condition-based waiting
test('user can submit form', async () => {
  render(<ContactForm />);

  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

  await waitFor(() => {
    expect(screen.getByText('Thank you!')).toBeInTheDocument();
  });
});
```

### Example 2: Deployment Readiness Check

```typescript
// ❌ BEFORE: Fixed delay, ignores actual state
async function deployAndVerify() {
  await triggerDeployment();
  await sleep(60000);  // Hope 60s is enough...
  return await getStatus();
}

// ✅ AFTER: Poll for actual deployment state
async function deployAndVerify() {
  await triggerDeployment();

  const result = await pollWithBackoff(
    async () => {
      const status = await getDeploymentStatus();
      if (status === 'failed') {
        throw new Error('Deployment failed');
      }
      return status === 'ready' ? status : null;
    },
    {
      timeout: 300000,       // 5 minute maximum
      initialInterval: 1000, // Start checking every 1s
      maxInterval: 10000,    // Cap at 10s between checks
      backoffFactor: 1.5,
      description: 'deployment ready'
    }
  );

  return result;
}
```

### Example 3: WebSocket Connection

```typescript
// ❌ BEFORE: Hope connection is ready
class ChatClient {
  async connect() {
    this.socket = new WebSocket(url);
    await sleep(1000);  // Maybe connected now?
    this.send('hello');
  }
}

// ✅ AFTER: Wait for actual connection state
class ChatClient {
  async connect() {
    this.socket = new WebSocket(url);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.socket.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });

    this.send('hello');
  }
}
```

### Example 4: Database Migration

```typescript
// ❌ BEFORE: Fixed delay between migrations
async function runMigrations() {
  for (const migration of migrations) {
    await migration.run();
    await sleep(5000);  // Wait between migrations
  }
}

// ✅ AFTER: Verify each migration completes
async function runMigrations() {
  for (const migration of migrations) {
    await migration.run();

    await pollUntil(
      async () => {
        const status = await getMigrationStatus(migration.id);
        return status === 'completed';
      },
      {
        timeout: 60000,
        interval: 1000,
        description: `migration ${migration.id}`
      }
    );
  }
}
```

---

## Anti-Patterns to Avoid

### 1. Sleep as Synchronization

```typescript
// ❌ Never synchronize with sleep
await Promise.all([
  taskA(),
  sleep(1000),  // "Give taskA time to finish"
]);
await taskB();  // taskB depends on taskA

// ✅ Use proper synchronization
await taskA();
await taskB();
```

### 2. Sleep in Retry Loops

```typescript
// ❌ Fixed delay retries
for (let i = 0; i < 3; i++) {
  try {
    return await riskyOperation();
  } catch {
    await sleep(1000);  // Same delay every time
  }
}

// ✅ Exponential backoff
let delay = 100;
for (let i = 0; i < 3; i++) {
  try {
    return await riskyOperation();
  } catch {
    await sleep(delay);
    delay *= 2;  // Exponential backoff
  }
}
```

### 3. Sleep to "Fix" Race Conditions

```typescript
// ❌ Sleep hides race conditions
async function processData() {
  startBackgroundJob();
  await sleep(100);  // "Make sure job starts first"
  return await getResults();
}

// ✅ Proper synchronization with events/promises
async function processData() {
  const job = startBackgroundJob();
  await job.started;  // Wait for actual event
  return await getResults();
}
```

### 4. Sleep in Production Code

```typescript
// ❌ Never sleep in production (except for intentional rate limiting)
async function sendNotifications(users: User[]) {
  for (const user of users) {
    await sendEmail(user);
    await sleep(100);  // "Rate limiting" - wrong approach
  }
}

// ✅ Use proper rate limiting
const rateLimiter = new RateLimiter({ maxPerSecond: 10 });

async function sendNotifications(users: User[]) {
  for (const user of users) {
    await rateLimiter.acquire();
    await sendEmail(user);
  }
}
```

---

## Checklist: Condition-Based Waiting

Before committing async code:

- [ ] No arbitrary `sleep()` or `setTimeout()` for synchronization
- [ ] All waits have explicit timeout limits
- [ ] Timeouts are appropriate for the operation type
- [ ] Polling uses exponential backoff for expensive operations
- [ ] Error conditions are handled (not just timeout)
- [ ] Descriptive error messages on timeout
- [ ] CI environment has appropriate timeout multipliers
- [ ] Tests use framework-provided wait utilities
- [ ] Production code uses event-based or promise-based synchronization

---

## Integration with Sigma Protocol

### With systematic-debugging

When debugging flaky tests or race conditions, apply this skill to eliminate timing-based issues.

### With root-cause-tracing

If tests fail intermittently, the root cause is often arbitrary delays. Use 5 Whys to trace to timing issues.

### With verification-before-completion

Before marking async code complete, verify no arbitrary delays remain.

---

*Remember: Time is not a condition. "Wait 5 seconds" is a guess. "Wait until ready" is a guarantee.*
