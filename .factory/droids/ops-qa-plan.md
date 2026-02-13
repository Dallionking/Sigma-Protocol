---
name: qa-plan
description: "Sigma ops command: qa-plan"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# qa-plan

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - QA test plan generation with Cursor browser support"
description: "Generate comprehensive QA test plans from PRDs with visual regression, E2E scenarios, and manual checklists"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
parameters:
  - --prd-id
  - --mode
---

# /qa-plan

**Generate comprehensive, executable QA test plans from PRD requirements**

## Policy Override (2026-02)

- Default frontend validation planning is for Russell Agent Browser CLI (`agent-browser`), typically executed via Vercel Agent CLI workflow.
- Do not plan Playwright as the default validation path.
- Playwright/Cypress paths are exception-only and require explicit user opt-in.

## 🎯 Purpose

**Role Context:** You are a **Senior QA Engineer** who writes thorough test plans. You understand that good QA catches bugs before production and validates that implementation matches requirements exactly.

This command:
- Reads PRD acceptance criteria
- Reads Step 4 flows (user journeys)
- Reads Step 5 wireframes (visual specs)
- Reads Step 7 states (UI states)
- Generates E2E test scenarios (Agent Browser CLI by default; Playwright/Cypress exception-only)
- Creates visual regression tests (wireframe comparison)
- Generates manual test checklists
- Creates device/browser matrix
- Outputs executable test files

**Business Impact:**
- **Catch bugs early** through systematic testing
- **Ensure PRD compliance** with acceptance criteria validation
- **Reduce manual QA time** with automated tests
- **Visual quality** through wireframe comparison
- **Cursor-native** execution with browser tools

---

## 📋 Command Usage

```bash
# Generate full test plan for PRD
/qa-plan --prd-id=F1

# Generate E2E tests only
/qa-plan --prd-id=F1 --mode=e2e

# Generate visual regression only
/qa-plan --prd-id=F1 --mode=visual

# Generate manual checklist only
/qa-plan --prd-id=F1 --mode=manual
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required |
| `--mode` | Test type: `all`, `e2e`, `visual`, `manual` | `all` |

---

## 🔄 Execution Flow

### Phase 1: Context Loading (Auto)

**Task:** Load all relevant test context

1. **Read PRD file**
   ```bash
   # Read: /docs/prds/F1-auth.md or /docs/prds/flows/01-auth/*.md
   ```
   Extract:
   - Acceptance criteria
   - Screens listed
   - User flows
   - Expected behaviors
   - Error scenarios

2. **Read Step 4 Flow Tree** (if exists)
   ```bash
   # Read: /docs/flows/FLOW-TREE.md
   # Find flows that include this PRD's screens
   ```

3. **Read Step 5 Wireframes** (if exists)
   ```bash
   # Read: /docs/wireframes/WIREFRAME-SPEC.md
   # Find: /docs/wireframes/screenshots/[screen-name].png
   ```

4. **Read Step 7 Interface States** (if exists)
   ```bash
   # Read: /docs/states/STATE-SPEC.md
   # Extract: loading, error, empty, success states for this PRD
   ```

5. **Load tracking data**
   ```bash
   # Read: .tracking-db/prds/F1-auth.json
   # Get implementation details (files, tests, coverage)
   ```

**Output:**
```
📊 Test Context Loaded:
   PRD: F1 (Authentication System)
   Acceptance Criteria: 12 found
   Screens: 3 (Login, Register, Forgot Password)
   Wireframes: 3 screenshots found
   States: 8 defined (loading, error, success, etc.)
   User Flows: 2 (Login flow, Registration flow)
```

---

### Phase 2: Test Plan Generation

**Task:** Generate comprehensive test plan

#### 2A: E2E Test Scenarios

Generate Playwright tests from:
- Acceptance criteria → Test cases
- User flows → E2E scenarios
- Error scenarios → Negative tests

**Example Output:** `/tests/e2e/F1-auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('F1: Authentication System', () => {
  
  // From Acceptance Criteria #1: "User can log in with email and password"
  test('AC-1: Successful login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPass123!');
    await page.click('[data-testid="login-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify user is authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
  
  // From Acceptance Criteria #2: "Invalid credentials show error message"
  test('AC-2: Login fails with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-button"]');
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
    
    // Error message should appear
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
  
  // From User Flow: "Complete registration flow"
  test('Flow: User registration end-to-end', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // Step 1: Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@example.com`);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="password-confirm-input"]', 'SecurePass123!');
    
    // Step 2: Submit form
    await page.click('[data-testid="register-button"]');
    
    // Step 3: Verify email confirmation message
    await expect(page.locator('[data-testid="confirmation-message"]'))
      .toContainText('Check your email');
    
    // Step 4: Verify redirect or state change
    await expect(page).toHaveURL(/.*confirm-email/);
  });
  
  // From Step 7 States: Loading state
  test('State: Login shows loading state during authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPass123!');
    
    // Click and immediately check for loading state
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
  
  // From Step 7 States: Error state
  test('State: Network error shows error state', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/auth/login', route => route.abort());
    
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPass123!');
    await page.click('[data-testid="login-button"]');
    
    // Error state should appear
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
```

#### 2B: Visual Regression Tests

Generate visual comparison tests against Step 5 wireframes:

**Example Output:** `/tests/visual/F1-auth-visual.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { compareScreenshots } from './helpers/visual-comparison';

test.describe('F1: Visual Regression - Authentication', () => {
  
  test('Visual: Login screen matches wireframe', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    const screenshot = await page.screenshot({
      path: 'tests/visual/screenshots/F1-login-actual.png',
      fullPage: true
    });
    
    // Compare against wireframe
    const wireframePath = 'docs/wireframes/screenshots/01-auth/01-login.png';
    const comparison = await compareScreenshots({
      actual: 'tests/visual/screenshots/F1-login-actual.png',
      expected: wireframePath,
      diffPath: 'tests/visual/screenshots/F1-login-diff.png',
      threshold: 0.05  // 5% difference allowed for fonts/rendering
    });
    
    // Report results
    expect(comparison.matches, 
      `Visual mismatch: ${comparison.diffPercentage}% different. ` +
      `See diff: tests/visual/screenshots/F1-login-diff.png`
    ).toBe(true);
  });
  
  test('Visual: Registration screen matches wireframe', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({
      path: 'tests/visual/screenshots/F1-register-actual.png',
      fullPage: true
    });
    
    const comparison = await compareScreenshots({
      actual: 'tests/visual/screenshots/F1-register-actual.png',
      expected: 'docs/wireframes/screenshots/01-auth/02-register.png',
      diffPath: 'tests/visual/screenshots/F1-register-diff.png',
      threshold: 0.05
    });
    
    expect(comparison.matches).toBe(true);
  });
  
  test('Visual: Login loading state matches spec', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'ValidPass123!');
    
    // Slow down network to capture loading state
    await page.route('**/api/auth/login', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.click('[data-testid="login-button"]');
    
    // Capture loading state
    await page.screenshot({
      path: 'tests/visual/screenshots/F1-login-loading.png'
    });
    
    // Verify loading indicator visible
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});
```

#### 2C: Manual Test Checklist

Generate human-executable test checklist:

**Example Output:** `/docs/qa/checklists/F1-MANUAL-CHECKLIST.md`

```markdown
# Manual QA Checklist: F1 - Authentication System

**PRD:** F1-auth  
**Tester:** _____________  
**Date:** _____________  
**Build:** _____________  
**Status:** ⬜ Not Started / 🟡 In Progress / ✅ Complete

---

## Pre-Test Setup

- [ ] App is running on `http://localhost:3000`
- [ ] Database is seeded with test data
- [ ] Test email account available: `qa-test@example.com`
- [ ] Browser dev tools open (for network/console checks)

---

## Test Cases

### TC-1: Login - Happy Path ✅
**Priority:** P0  
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter email: `test@example.com`
3. Enter password: `ValidPass123!`
4. Click "Login" button

**Expected Result:**
- Redirect to `/dashboard`
- User menu shows logged-in state
- No error messages displayed

**Actual Result:**
_____________________________________

**Screenshot:** _____________________________________

**Notes:** _____________________________________

---

### TC-2: Login - Invalid Credentials ❌
**Priority:** P0  
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to `/login`
2. Enter email: `test@example.com`
3. Enter password: `WrongPassword123`
4. Click "Login" button

**Expected Result:**
- Stay on `/login` page
- Error message: "Invalid email or password"
- Form fields should remain filled
- Password field should be cleared (optional)

**Actual Result:**
_____________________________________

**Screenshot:** _____________________________________

---

### TC-3: Login - Loading State 🔄
**Priority:** P1  
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to `/login`
2. Fill in valid credentials
3. Click "Login" button
4. **Immediately observe UI**

**Expected Result:**
- Loading spinner appears
- Login button disabled or shows "Logging in..."
- Form is disabled during login

**Actual Result:**
_____________________________________

**Screenshot:** _____________________________________

---

### TC-4: Registration - Happy Path ✅
**Priority:** P0  
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to `/register`
2. Enter name: "Test User"
3. Enter email: `test-${random}@example.com`
4. Enter password: `SecurePass123!`
5. Confirm password: `SecurePass123!`
6. Click "Register" button

**Expected Result:**
- Redirect to email confirmation page
- Success message appears
- Confirmation email sent (check mailbox)

**Actual Result:**
_____________________________________

---

### TC-5: Forgot Password Flow 🔑
**Priority:** P1  
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to `/login`
2. Click "Forgot Password?" link
3. Enter email: `test@example.com`
4. Click "Reset Password" button

**Expected Result:**
- Success message: "Reset link sent to email"
- Email received with reset link
- Link expires after 1 hour

**Actual Result:**
_____________________________________

---

## Visual Validation

### V-1: Login Screen Layout
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Wireframe:** `docs/wireframes/screenshots/01-auth/01-login.png`

**Check:**
- [ ] Logo positioned correctly
- [ ] Form centered on page
- [ ] Button styling matches design
- [ ] Font sizes match wireframe
- [ ] Spacing consistent with design
- [ ] Responsive on mobile (< 768px)

**Issues Found:**
_____________________________________

---

### V-2: Error State Styling
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Check:**
- [ ] Error message in red
- [ ] Icon appears next to message
- [ ] Input border changes to red
- [ ] Error doesn't break layout

---

## Accessibility Checks

### A-1: Keyboard Navigation
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Steps:**
1. Navigate to login with keyboard only (Tab key)
2. Fill form using keyboard
3. Submit with Enter key

**Expected:**
- All interactive elements reachable via Tab
- Focus indicators visible
- Form submittable with Enter
- Logical tab order

---

### A-2: Screen Reader
**Status:** ⬜ Pass / ❌ Fail / ⏭️ Skip

**Tools:** NVDA / JAWS / VoiceOver

**Check:**
- [ ] Form labels announced correctly
- [ ] Error messages announced
- [ ] Button states announced
- [ ] Page title descriptive

---

## Browser Compatibility

### Browser Matrix

| Browser | Version | Login | Register | Forgot PW | Notes |
|---------|---------|-------|----------|-----------|-------|
| Chrome  | Latest  | ⬜    | ⬜       | ⬜        |       |
| Firefox | Latest  | ⬜    | ⬜       | ⬜        |       |
| Safari  | Latest  | ⬜    | ⬜       | ⬜        |       |
| Edge    | Latest  | ⬜    | ⬜       | ⬜        |       |

### Device Matrix

| Device | OS | Login | Register | Notes |
|--------|----|-------|----------|-------|
| iPhone 13 | iOS 16 | ⬜ | ⬜ | |
| Pixel 6 | Android 13 | ⬜ | ⬜ | |
| iPad Pro | iPadOS 16 | ⬜ | ⬜ | |

---

## Security Checks

### S-1: Password Visibility Toggle
- [ ] Eye icon toggles password visibility
- [ ] Password hidden by default
- [ ] Toggle works on all password fields

### S-2: HTTPS Only
- [ ] All auth requests over HTTPS
- [ ] No mixed content warnings
- [ ] Cookies marked Secure

### S-3: Session Handling
- [ ] Session persists on refresh
- [ ] Session expires after inactivity
- [ ] Logout clears session properly

---

## Performance Checks

### P-1: Load Times
- Login page load: ______ ms (target: <1000ms)
- Authentication API: ______ ms (target: <500ms)
- Redirect after login: ______ ms (target: <200ms)

---

## Summary

**Total Test Cases:** 25  
**Passed:** ___  
**Failed:** ___  
**Skipped:** ___  
**Pass Rate:** ___%

**Blockers:**
_____________________________________

**Ready for Production:** ⬜ Yes / ❌ No

**Sign-off:** _______________ Date: _______________

---

*Generated by /qa-plan for F1-auth*  
*Next: Run /qa-run --prd-id=F1 to execute automated tests*
```

---

### Phase 3: Test Helper Generation

**Task:** Create reusable test helpers

**Output:** `/tests/helpers/visual-comparison.ts`

```typescript
/**
 * Visual regression testing helper
 * Compares screenshots against wireframes with tolerance
 */

import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';

export interface VisualComparisonOptions {
  actual: string;           // Path to actual screenshot
  expected: string;         // Path to expected wireframe
  diffPath: string;         // Path to save diff image
  threshold: number;        // 0-1, percentage difference allowed
}

export interface VisualComparisonResult {
  matches: boolean;
  diffPercentage: number;
  pixelsDifferent: number;
  totalPixels: number;
  diffImagePath: string;
  differences: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export async function compareScreenshots(
  options: VisualComparisonOptions
): Promise<VisualComparisonResult> {
  
  // Load images
  const actualImg = PNG.sync.read(fs.readFileSync(options.actual));
  const expectedImg = PNG.sync.read(fs.readFileSync(options.expected));
  
  // Create diff image
  const { width, height } = actualImg;
  const diff = new PNG({ width, height });
  
  // Compare pixels
  const pixelsDifferent = pixelmatch(
    actualImg.data,
    expectedImg.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }  // Pixel-level threshold
  );
  
  // Save diff image
  fs.writeFileSync(options.diffPath, PNG.sync.write(diff));
  
  // Calculate percentage
  const totalPixels = width * height;
  const diffPercentage = (pixelsDifferent / totalPixels) * 100;
  
  // Analyze differences
  const differences = analyzeDifferences(actualImg, expectedImg, pixelsDifferent);
  
  return {
    matches: diffPercentage <= options.threshold * 100,
    diffPercentage,
    pixelsDifferent,
    totalPixels,
    diffImagePath: options.diffPath,
    differences
  };
}

function analyzeDifferences(
  actual: PNG,
  expected: PNG,
  pixelsDiff: number
): Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> {
  
  const diffs = [];
  
  // Size mismatch
  if (actual.width !== expected.width || actual.height !== expected.height) {
    diffs.push({
      type: 'size',
      description: `Image size mismatch: ${actual.width}x${actual.height} vs ${expected.width}x${expected.height}`,
      severity: 'high' as const
    });
  }
  
  // Significant pixel difference
  const diffRatio = pixelsDiff / (actual.width * actual.height);
  if (diffRatio > 0.1) {
    diffs.push({
      type: 'layout',
      description: `Major layout differences detected (${(diffRatio * 100).toFixed(1)}% pixels different)`,
      severity: 'high' as const
    });
  } else if (diffRatio > 0.05) {
    diffs.push({
      type: 'styling',
      description: `Moderate styling differences (${(diffRatio * 100).toFixed(1)}% pixels different)`,
      severity: 'medium' as const
    });
  } else if (diffRatio > 0.01) {
    diffs.push({
      type: 'minor',
      description: `Minor differences, likely fonts or anti-aliasing (${(diffRatio * 100).toFixed(1)}% pixels different)`,
      severity: 'low' as const
    });
  }
  
  return diffs;
}
```

---

### Phase 4: Configuration Generation

**Task:** Create test configuration files

**Output:** `/tests/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Test timeout
  timeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 5000
  },
  
  // Fail fast in CI
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  // Shared settings
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Projects (browser matrix)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  
  // Dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📤 Outputs

### Files Created

1. **E2E Tests**
   - `/tests/e2e/[PRD-ID].spec.ts` - Playwright test file
   
2. **Visual Tests**
   - `/tests/visual/[PRD-ID]-visual.spec.ts` - Visual regression tests
   
3. **Manual Checklist**
   - `/docs/qa/checklists/[PRD-ID]-MANUAL-CHECKLIST.md`
   
4. **Test Helpers**
   - `/tests/helpers/visual-comparison.ts` - Screenshot comparison
   - `/tests/helpers/test-data.ts` - Test data factories
   - `/tests/helpers/auth-helpers.ts` - Auth utilities
   
5. **Configuration**
   - `/tests/playwright.config.ts` - Playwright config (if not exists)
   - `/tests/visual/screenshots/.gitkeep` - Screenshot directory
   
6. **QA Plan Document**
   - `/docs/qa/plans/[PRD-ID]-QA-PLAN.md` - Master QA plan

### Files Updated

- `.tracking-db/prds/[PRD-ID].json` - Add QA test paths

---

## 🎯 Success Criteria

- ✅ E2E test file generated with coverage of all acceptance criteria
- ✅ Visual regression tests for all screens in PRD
- ✅ Manual checklist covers all test scenarios
- ✅ Test helpers created for reusability
- ✅ Playwright config exists
- ✅ Screenshots directory structured
- ✅ All tests runnable (`npm test`)

---

## 🔄 Integration Points

### Inputs (Files Read)

- `/docs/prds/[PRD-ID].md` - PRD with acceptance criteria
- `/docs/flows/FLOW-TREE.md` - User flows (Step 4)
- `/docs/wireframes/**/*.png` - Wireframe screenshots (Step 5)
- `/docs/states/STATE-SPEC.md` - Interface states (Step 7)
- `.tracking-db/prds/[PRD-ID].json` - Implementation details

### Outputs (Files Written)

- `/tests/e2e/[PRD-ID].spec.ts`
- `/tests/visual/[PRD-ID]-visual.spec.ts`
- `/docs/qa/checklists/[PRD-ID]-MANUAL-CHECKLIST.md`
- `/tests/helpers/*.ts`
- `/docs/qa/plans/[PRD-ID]-QA-PLAN.md`

### Downstream Commands

- `/qa-run --prd-id=[ID]` - Execute generated tests
- `/qa-report --prd-id=[ID]` - Generate QA report

---

## 💡 Tips

### Best Practices

1. **Run after implementation complete:**
   ```bash
   /implement-prd --prd-id=F1
   /qa-plan --prd-id=F1
   ```

2. **Generate early for TDD:**
   ```bash
   # Generate tests from PRD before coding
   /qa-plan --prd-id=F1
   # Then implement to make tests pass
   ```

3. **Update when PRD changes:**
   ```bash
   # PRD updated with new acceptance criteria
   /qa-plan --prd-id=F1  # Regenerate tests
   ```

### Test Data Management

Tests use factories for consistent data:
```typescript
// tests/helpers/test-data.ts
export const testUsers = {
  valid: { email: 'test@example.com', password: 'Valid123!' },
  invalid: { email: 'test@example.com', password: 'Wrong' }
};
```

---

## 🚨 Common Issues

### "No wireframes found"
**Issue:** Visual tests can't find wireframes

**Fix:** Ensure Step 5 completed with screenshots in `/docs/wireframes/screenshots/`

### "Playwright not installed"
**Issue:** Generated tests need Playwright

**Fix:**
```bash
npm install -D @playwright/test
npx playwright install
```

### "Test selectors don't match"
**Issue:** Generated `[data-testid]` selectors don't exist

**Fix:** Add test IDs to components or update test plan with actual selectors

---

*Part of Sigma QA System - see /qa-run to execute tests*
