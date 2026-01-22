---
name: senior-qa
description: "Comprehensive QA and testing skill for quality assurance, test automation, and testing strategies. Includes test suite generation, coverage analysis, E2E testing setup, and quality metrics."
version: "1.0.0"
source: "community"
triggers:
  - qa-plan
  - qa-run
  - verify-prd
  - test-gen
  - implement-prd
---

# Senior QA Skill

Comprehensive QA and testing skill for quality assurance, test automation, and testing strategies. Use when designing test strategies, writing test cases, implementing test automation, performing manual testing, or analyzing test coverage.

## When to Invoke

Invoke this skill when:

- Planning test strategies (@qa-plan)
- Running QA test suites (@qa-run)
- Verifying PRD implementation (@verify-prd)
- Generating tests (@test-gen)
- Implementing features that need tests

---

## Testing Philosophy

### The Testing Pyramid

```
        /\
       /  \    E2E Tests (10%)
      /────\   - Critical user journeys
     /      \  - Slow, expensive
    /────────\ Integration Tests (20%)
   /          \  - Component interactions
  /────────────\ - API contracts
 /              \ Unit Tests (70%)
/────────────────\  - Fast, isolated
                   - Business logic
```

### Test Categories

| Type            | Scope                 | Speed   | When to Use               |
| --------------- | --------------------- | ------- | ------------------------- |
| **Unit**        | Single function/class | < 10ms  | Business logic, utilities |
| **Integration** | Multiple components   | < 1s    | API endpoints, DB queries |
| **E2E**         | Full user flow        | > 5s    | Critical paths only       |
| **Snapshot**    | UI output             | < 100ms | Component rendering       |
| **Visual**      | Screenshots           | > 1s    | Design regression         |

---

## Test Strategy Template

```markdown
## Test Strategy: [Feature Name]

### Scope

- **In Scope:** [What will be tested]
- **Out of Scope:** [What won't be tested and why]

### Test Types

- Unit Tests: [Yes/No] - [Scope]
- Integration Tests: [Yes/No] - [Scope]
- E2E Tests: [Yes/No] - [Critical paths]

### Test Cases

#### Unit Tests

| ID  | Component | Test Case  | Expected Result |
| --- | --------- | ---------- | --------------- |
| U1  | [Module]  | [Scenario] | [Expected]      |
| U2  | [Module]  | [Scenario] | [Expected]      |

#### Integration Tests

| ID  | Components | Test Case  | Expected Result |
| --- | ---------- | ---------- | --------------- |
| I1  | [A + B]    | [Scenario] | [Expected]      |

#### E2E Tests

| ID  | User Flow | Test Case  | Expected Result |
| --- | --------- | ---------- | --------------- |
| E1  | [Flow]    | [Scenario] | [Expected]      |

### Edge Cases

- [Edge case 1]
- [Edge case 2]

### Performance Requirements

- [Metric]: [Target]

### Acceptance Criteria

- [ ] All tests pass
- [ ] Coverage > [X]%
- [ ] No critical bugs
- [ ] Performance targets met
```

---

## Test Patterns

### Unit Test Structure (AAA)

```typescript
describe("calculateDiscount", () => {
  it("should apply 10% discount for orders over $100", () => {
    // Arrange
    const order = { total: 150 };
    const discountRules = { threshold: 100, percentage: 10 };

    // Act
    const result = calculateDiscount(order, discountRules);

    // Assert
    expect(result).toBe(15);
  });

  it("should return 0 for orders under threshold", () => {
    // Arrange
    const order = { total: 50 };
    const discountRules = { threshold: 100, percentage: 10 };

    // Act
    const result = calculateDiscount(order, discountRules);

    // Assert
    expect(result).toBe(0);
  });
});
```

### Integration Test Pattern

```typescript
describe("POST /api/orders", () => {
  beforeEach(async () => {
    await db.reset();
    await db.seed();
  });

  it("should create order and update inventory", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        userId: "user-1",
        items: [{ productId: "prod-1", quantity: 2 }],
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: "created",
    });

    // Verify side effects
    const inventory = await db.getInventory("prod-1");
    expect(inventory.quantity).toBe(8); // Was 10, bought 2
  });
});
```

### E2E Test Pattern (Playwright)

```typescript
test.describe("Checkout Flow", () => {
  test("should complete purchase successfully", async ({ page }) => {
    // Navigate to product
    await page.goto("/products/widget-x");

    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");

    // Go to checkout
    await page.click('[data-testid="checkout-button"]');

    // Fill payment details
    await page.fill('[data-testid="card-number"]', "4242424242424242");
    await page.fill('[data-testid="card-expiry"]', "12/25");
    await page.fill('[data-testid="card-cvc"]', "123");

    // Submit order
    await page.click('[data-testid="place-order"]');

    // Verify success
    await expect(
      page.locator('[data-testid="order-confirmation"]'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/orders\/[a-z0-9]+/);
  });
});
```

---

## Coverage Analysis

### What to Measure

| Metric                     | Target | Why                         |
| -------------------------- | ------ | --------------------------- |
| **Line Coverage**          | 60%+   | Basic coverage indicator    |
| **Branch Coverage**        | 70%+   | Ensures conditionals tested |
| **Function Coverage**      | 80%+   | All functions exercised     |
| **Critical Path Coverage** | 95%+   | High-risk code fully tested |

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.config.*", "**/*.d.ts", "**/test/**", "**/mocks/**"],
      thresholds: {
        lines: 60,
        branches: 70,
        functions: 80,
        statements: 60,
      },
    },
  },
});
```

### Coverage Report Analysis

```
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered
------------------------|---------|----------|---------|---------|----------
src/                    |   85.23 |    78.45 |   90.12 |   84.56 |
 services/              |   92.34 |    88.12 |   95.00 |   91.78 |
  orderService.ts       |   95.00 |    90.00 |  100.00 |   94.50 | 45-48
  userService.ts        |   89.67 |    86.24 |   90.00 |   89.05 | 23,67-70
 utils/                 |   78.12 |    68.90 |   85.23 |   77.45 |
  validation.ts         |   65.00 |    55.00 |   70.00 |   64.00 | 12-20,45-60 ⚠️
```

**Action:** Focus on `validation.ts` - low coverage on critical utility.

---

## Test Data Management

### Fixtures Pattern

```typescript
// fixtures/users.ts
export const testUsers = {
  admin: {
    id: "user-admin",
    email: "admin@test.com",
    role: "admin",
  },
  customer: {
    id: "user-customer",
    email: "customer@test.com",
    role: "customer",
  },
};

// fixtures/orders.ts
export const testOrders = {
  pending: {
    id: "order-pending",
    status: "pending",
    userId: testUsers.customer.id,
  },
};
```

### Factory Pattern

```typescript
// factories/userFactory.ts
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@test.com`,
    name: "Test User",
    role: "customer",
    createdAt: new Date(),
    ...overrides,
  };
}
```

---

## Bug Report Template

```markdown
## Bug Report: [Title]

### Environment

- **Browser/Runtime:** [Chrome 120 / Node 20]
- **OS:** [macOS 14.1]
- **Version:** [1.2.3]

### Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens]

### Screenshots/Logs

[Attach evidence]

### Severity

- [ ] Critical - System down
- [ ] High - Major feature broken
- [ ] Medium - Feature impaired
- [ ] Low - Minor issue

### Additional Context

[Any other relevant information]
```

---

## QA Checklist

### Pre-Release

- [ ] All automated tests pass
- [ ] Manual smoke test complete
- [ ] Cross-browser testing done
- [ ] Mobile responsive verified
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Documentation updated

### Per Feature

- [ ] Acceptance criteria met
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Loading states verified
- [ ] Empty states verified

---

## Integration with SSS Protocol

### @qa-plan

Create comprehensive test strategy for features.

### @qa-run

Execute test suites and report results.

### @verify-prd

Verify PRD implementation meets acceptance criteria.

### @test-gen

Generate test files for existing code.

### @implement-prd

Ensure tests are written as part of implementation.

---

_Remember: Quality is everyone's responsibility, but QA provides the safety net. Test early, test often, and automate everything you can._
