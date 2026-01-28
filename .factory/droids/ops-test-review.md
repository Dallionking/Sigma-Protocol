---
name: test-review
description: "Sigma ops command: test-review"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# test-review

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - comprehensive test coverage and quality review"
description: "Validate test coverage against PRD acceptance criteria with quality scoring"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
parameters:
  - --prd-id
  - --strict
---

# /test-review

**Comprehensive test review ensuring PRD requirements are covered with quality tests**

## 🎯 Purpose

**Role Context:** You are a **QA Architect + Test Engineer** who believes: "If it's not tested, it's broken." You ensure every acceptance criterion has tests, every edge case is covered, and test quality is high.

This command:
- Maps tests to PRD acceptance criteria (1:1 validation)
- Checks test coverage (unit, integration, E2E)
- Validates test quality (assertions, edge cases, clarity)
- Identifies missing test scenarios
- Reviews test maintainability
- Assigns test quality score (0-100)

**Business Impact:**
- **Prevent regressions** through comprehensive coverage
- **Faster debugging** with clear test failures
- **Confidence in refactoring** (tests catch breaks)
- **Living documentation** (tests show how code works)
- **Reduced QA time** (automated tests catch bugs early)

---

## 📋 Command Usage

```bash
# Review tests for PRD
/test-review --prd-id=F1

# Strict mode (fail if coverage <100%)
/test-review --prd-id=F1 --strict
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required |
| `--strict` | Fail if any AC missing tests | false |

---

## 🔄 Execution Flow

### Phase 1: Context Loading

**Task:** Load PRD and test files

1. **Read PRD acceptance criteria**
   ```bash
   # Read: /docs/prds/F1-auth.md
   # Extract all acceptance criteria (AC-1, AC-2, etc.)
   ```

2. **Find test files**
   ```bash
   # Scan for tests related to this PRD
   tests/unit/**/*F1*.test.ts
   tests/integration/**/*auth*.test.ts
   tests/e2e/**/*F1*.spec.ts
   ```

3. **Run test coverage**
   ```bash
   npm test -- --coverage --json --outputFile=coverage.json
   ```

**Output:**
```
📊 Test Review Context:
   PRD: F1 (Authentication System)
   Acceptance Criteria: 12
   Test Files Found: 5
   - Unit tests: 3 files (45 tests)
   - Integration tests: 1 file (8 tests)
   - E2E tests: 1 file (10 tests)
   Total Tests: 63
   Code Coverage: 87%
```

---

### Phase 2: AC-to-Test Mapping

**Task:** Map every AC to tests (1:1 validation)

```typescript
const acMapping = {
  "AC-1: User can log in with valid credentials": {
    tests: [
      "tests/e2e/F1-auth.spec.ts: 'AC-1: Successful login'",
      "tests/unit/auth.test.ts: 'login() returns user on valid creds'"
    ],
    coverage: "full",
    status: "✅ COVERED"
  },
  
  "AC-2: Invalid credentials show error": {
    tests: [
      "tests/e2e/F1-auth.spec.ts: 'AC-2: Login fails with invalid credentials'",
      "tests/unit/auth.test.ts: 'login() throws on invalid creds'"
    ],
    coverage: "full",
    status: "✅ COVERED"
  },
  
  "AC-3: Form validates empty fields": {
    tests: [
      "tests/unit/LoginForm.test.ts: 'validates required fields'"
    ],
    coverage: "partial",
    status: "⚠️ PARTIAL (no E2E test)"
  },
  
  "AC-12: Session persists across browser restart": {
    tests: [],
    coverage: "none",
    status: "❌ NOT COVERED"
  }
};
```

**Output:**
```
📋 AC Coverage Analysis:

✅ Fully Covered: 9/12 ACs (75%)
   AC-1: Login with valid credentials
   AC-2: Invalid credentials error
   AC-4: User registration
   ...

⚠️ Partially Covered: 2/12 ACs (17%)
   AC-3: Form validation (unit only, no E2E)
   AC-7: Password strength (no error case tests)

❌ Not Covered: 1/12 ACs (8%)
   AC-12: Session persistence
```

---

### Phase 3: Coverage Analysis

**Task:** Analyze code coverage comprehensively

#### 3A: Line Coverage

```typescript
const lineCoverage = {
  statements: 87.2,  // 234/268
  branches: 78.5,    // 89/113
  functions: 92.1,   // 35/38
  lines: 86.8        // 226/260
};
```

#### 3B: Uncovered Code

```
🔍 Uncovered Code:

❌ auth/login.ts:67-72 (6 lines)
   Function: handleNetworkError()
   Issue: Network error path never tested
   
   Missing Test:
   ```typescript
   it('handles network timeout', async () => {
     // Mock network timeout
     server.use(
       rest.post('/api/auth/login', (req, res, ctx) => {
         return res(ctx.delay('infinite'));
       })
     );
     
     await expect(login(email, password))
       .rejects.toThrow('Network timeout');
   });
   ```

❌ auth/session.ts:45-48 (4 lines)
   Function: refreshToken()
   Issue: Token refresh logic untested
   
   Missing Test:
   ```typescript
   it('refreshes expired token', async () => {
     const expiredToken = createExpiredToken();
     const newToken = await refreshToken(expiredToken);
     expect(newToken).toBeDefined();
     expect(isExpired(newToken)).toBe(false);
   });
   ```
```

#### 3C: Edge Cases

```
⚠️ Missing Edge Case Tests:

1. Empty Email (AC-3)
   - Have: Validation for invalid format
   - Missing: Validation for empty string ""
   - Add: Test with ""

2. Very Long Password (AC-7)
   - Have: Min length validation
   - Missing: Max length validation (>1000 chars)
   - Add: Test with 10,000 char string

3. Concurrent Logins (AC-11)
   - Have: Single login test
   - Missing: Multiple simultaneous logins
   - Add: Race condition test

4. Special Characters (AC-6)
   - Have: Basic email validation
   - Missing: Unicode, emoji in email
   - Add: Test with "user+test@example.com", "用户@example.com"
```

---

### Phase 4: Test Quality Review

**Task:** Assess test quality and maintainability

#### 4A: Test Structure

```typescript
const testQualityChecks = {
  naming: {
    pass: true,
    issues: [],
    check: "Tests have descriptive names"
  },
  
  arrange_act_assert: {
    pass: false,
    issues: [
      "auth.test.ts:45 - Arrange/Act/Assert pattern not clear"
    ],
    check: "Tests follow AAA pattern"
  },
  
  assertions: {
    pass: false,
    issues: [
      "LoginForm.test.ts:23 - No assertion (expect statement missing)"
    ],
    check: "All tests have assertions"
  }
};
```

**Issues Detected:**
```
🧪 TEST QUALITY ISSUES:

❌ Missing Assertion (HIGH)
   File: tests/unit/LoginForm.test.ts:23
   Test: "handles submit"
   Issue: Test has no expect() statement
   
   Current:
   ```typescript
   it('handles submit', async () => {
     render(<LoginForm onSubmit={mockSubmit} />);
     await userEvent.click(screen.getByText('Login'));
     // No assertion! What are we testing? ❌
   });
   ```
   
   Should Be:
   ```typescript
   it('calls onSubmit with credentials when submitted', async () => {
     render(<LoginForm onSubmit={mockSubmit} />);
     
     await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
     await userEvent.type(screen.getByLabelText('Password'), 'password123');
     await userEvent.click(screen.getByText('Login'));
     
     expect(mockSubmit).toHaveBeenCalledWith({
       email: 'test@example.com',
       password: 'password123'
     });
   });
   ```

⚠️ Unclear AAA Pattern (MEDIUM)
   File: tests/unit/auth.test.ts:45
   Test: "login function"
   Issue: Arrange/Act/Assert not clearly separated
   
   Current:
   ```typescript
   it('login function', async () => {
     const result = await login('test@example.com', 'pass');
     const user = { id: 1 };
     expect(result).toEqual(user);
   });
   ```
   
   Should Be:
   ```typescript
   it('returns user object when credentials are valid', async () => {
     // Arrange
     const email = 'test@example.com';
     const password = 'validPassword123';
     const expectedUser = { id: 1, email };
     
     // Act
     const result = await login(email, password);
     
     // Assert
     expect(result).toEqual(expectedUser);
   });
   ```
```

#### 4B: Test Independence

```
⚠️ TEST INDEPENDENCE ISSUES:

❌ Tests Share State (HIGH)
   File: tests/unit/auth.test.ts
   Issue: Tests modify shared `currentUser` variable
   
   Problem:
   ```typescript
   let currentUser = null;  // Shared state! ❌
   
   it('test 1', () => {
     currentUser = { id: 1 };
     // ...
   });
   
   it('test 2', () => {
     // Depends on test 1 running first! ❌
     expect(currentUser.id).toBe(1);
   });
   ```
   
   Fix:
   ```typescript
   beforeEach(() => {
     currentUser = null;  // Reset before each test ✅
   });
   
   // Or better: No shared state
   ```

⚠️ Database Not Reset (HIGH)
   File: tests/integration/auth.integration.test.ts
   Issue: Tests don't clean up database
   
   Add:
   ```typescript
   beforeEach(async () => {
     await db.users.deleteMany();  // Clean slate ✅
   });
   ```
```

#### 4C: Test Maintainability

```
💡 MAINTAINABILITY SUGGESTIONS:

⚡ Extract Test Helpers (MEDIUM)
   Issue: Test data creation duplicated 15 times
   
   Current:
   ```typescript
   // Duplicated in every test! ❌
   const user = {
     id: 1,
     email: 'test@example.com',
     password: 'hashedPassword',
     createdAt: new Date()
   };
   ```
   
   Should Create:
   ```typescript
   // tests/helpers/factories.ts
   export function createTestUser(overrides = {}) {
     return {
       id: 1,
       email: 'test@example.com',
       password: 'hashedPassword',
       createdAt: new Date(),
       ...overrides
     };
   }
   
   // Usage:
   const user = createTestUser({ email: 'custom@example.com' });
   ```

⚡ Setup/Teardown Helpers (MEDIUM)
   Issue: Auth setup duplicated in every test file
   
   Should Create:
   ```typescript
   // tests/helpers/auth.ts
   export function setupAuthMocks() {
     // Mock auth API
     // Mock session storage
     return { cleanup: () => {...} };
   }
   
   // Usage:
   beforeEach(() => {
     authMocks = setupAuthMocks();
   });
   ```
```

---

### Phase 5: Test Pyramid Validation

**Task:** Ensure healthy test distribution

```typescript
const testPyramid = {
  unit: {
    count: 45,
    percentage: 71,
    target: "70-80%",
    status: "✅ GOOD"
  },
  
  integration: {
    count: 8,
    percentage: 13,
    target: "15-20%",
    status: "⚠️ SLIGHTLY LOW"
  },
  
  e2e: {
    count: 10,
    percentage: 16,
    target: "5-15%",
    status: "⚠️ SLIGHTLY HIGH"
  }
};
```

**Analysis:**
```
🏔️ TEST PYRAMID ANALYSIS:

         E2E
        /   \
       /  10 \ ⚠️ 16% (target: 5-15%)
      /       \
     Integration
    /     8     \ ⚠️ 13% (target: 15-20%)
   /             \
  Unit Tests (45) ✅ 71% (target: 70-80%)

Recommendation:
- Add 3-5 integration tests (test API contracts)
- Consider converting 2-3 E2E tests to integration
- E2E should test critical user journeys only
```

---

### Phase 6: Test Report Generation

**File:** `/docs/reviews/F1-TEST-REVIEW-2025-12-28.md`

```markdown
# Test Review: F1 - Authentication System

**Date:** 2025-12-28 18:00  
**PRD:** F1-auth  
**Status:** ⚠️ IMPROVEMENTS NEEDED (Score: 76/100 - Grade C+)

---

## 📊 Test Quality Score: 76/100 (Grade C+)

```
Test Review Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AC Coverage        [████████░░] 83% × 30% = 25pts
Code Coverage      [████████░░] 87% × 25% = 22pts
Test Quality       [███████░░░] 70% × 20% = 14pts
Edge Cases         [██████░░░░] 60% × 15% = 9pts
Maintainability    [██████░░░░] 60% × 10% = 6pts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE:                            76pts
```

**Pass Threshold:** 80/100  
**Current Score:** 76/100  
**Gap:** 4 points

---

## 📋 AC Coverage: 83% (10/12)

### ✅ Fully Covered (9 ACs)
- AC-1: Login with valid credentials
- AC-2: Invalid credentials error
- AC-4: User registration
- AC-5: Forgot password link
- AC-6: Email validation
- AC-7: Password strength
- AC-8: Loading states
- AC-9: Error messages
- AC-10: Network errors

### ⚠️ Partially Covered (2 ACs)
- AC-3: Form validation (unit only, missing E2E)
- AC-11: Successful redirect (no assertion on URL)

### ❌ Not Covered (1 AC)
- AC-12: Session persistence across restart

---

## 📊 Code Coverage: 87%

| Metric | Coverage | Target | Status |
|--------|----------|--------|--------|
| Statements | 87.2% | 80% | ✅ |
| Branches | 78.5% | 80% | ⚠️ |
| Functions | 92.1% | 80% | ✅ |
| Lines | 86.8% | 80% | ✅ |

### Uncovered Code (13%)
- `auth/login.ts:67-72` - Network error handler
- `auth/session.ts:45-48` - Token refresh
- `auth/validate.ts:89-92` - Edge case validation

---

## 🚨 Critical Issues

### 1. AC-12 Not Tested (HIGH)
**Missing:** Session persistence tests

**Add Test:**
```typescript
describe('Session Persistence', () => {
  it('persists session across browser restart', async () => {
    // Login
    await login('test@example.com', 'password');
    
    // Simulate browser restart
    window.location.reload();
    
    // Should still be logged in
    expect(await isAuthenticated()).toBe(true);
  });
});
```

### 2. Missing Assertions (HIGH)
**Files:** 3 tests have no assertions

**Fix:** Add expect() statements to all tests

---

## 💡 Recommendations

### Quick Wins (30 minutes)
1. Add AC-12 test
2. Add assertions to 3 tests
3. Test network error path

### Medium Priority (2 hours)
4. Add integration tests (3-5 more)
5. Extract test factories
6. Add edge case tests

### Nice to Have
7. Improve test naming
8. Add setup/teardown helpers

---

*Generated by /test-review on 2025-12-28 18:00*
```

---

## 📤 Outputs

### Files Created

- `/docs/reviews/[PRD-ID]-TEST-REVIEW-YYYY-MM-DD.md`

### Files Updated

- `.tracking-db/prds/[PRD-ID].json` - Test review status

---

## 🎯 Success Criteria

- ✅ 100% AC coverage (every AC has tests)
- ✅ ≥80% code coverage
- ✅ All tests have assertions
- ✅ Tests are independent
- ✅ Healthy test pyramid (70% unit, 20% integration, 10% E2E)
- ✅ Edge cases covered

---

## 💡 Tips

### Run After Implementation

```bash
/implement-prd --prd-id=F1
/test-review --prd-id=F1

# Fix missing tests
/test-review --prd-id=F1  # Re-check
```

### Use with QA

```bash
/test-review --prd-id=F1  # Check test coverage
/qa-run --prd-id=F1       # Run the tests
/qa-report --prd-id=F1    # Get results
```

---

*Part of Sigma Review Workflows - Phase 3*

