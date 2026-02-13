---
name: qa-run
description: "Sigma ops command: qa-run"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# qa-run

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - Execute QA tests with Cursor browser integration"
description: "Execute QA tests including E2E, visual regression, and manual testing with Cursor browser agent"
allowed-tools:
  # CURSOR BROWSER TOOLS
  - mcp_cursor-ide-browser_browser_navigate
  - mcp_cursor-ide-browser_browser_snapshot
  - mcp_cursor-ide-browser_browser_click
  - mcp_cursor-ide-browser_browser_type
  - mcp_cursor-ide-browser_browser_wait_for
  - mcp_cursor-ide-browser_browser_press_key
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
  - grep
parameters:
  - --prd-id
  - --mode
  - --url
---

# /qa-run

**Execute QA tests with Cursor browser agent for visual + functional validation**

## Policy Override (2026-02)

- Default frontend validation tool is Russell Agent Browser CLI (`agent-browser`), typically via Vercel Agent CLI workflow.
- Do not use Playwright unless the user explicitly requests an exception.
- If any legacy example below conflicts with this policy, this policy takes precedence.

## 🎯 Purpose

**Role Context:** You are a **QA Automation Engineer + Manual Tester**. You execute comprehensive test suites, capture visual regressions, and validate that implementation matches requirements.

This command:
- Runs E2E UI validation (Agent Browser CLI by default)
- Executes visual regression tests **using Cursor browser**
- Guides manual testing interactively
- Captures screenshots and compares to wireframes
- Detects visual regressions automatically
- Updates tracking JSON with QA results
- Generates test execution report
- Supports multiple test modes

**Business Impact:**
- **Catch bugs before production** through systematic testing
- **Visual quality assurance** via wireframe comparison
- **Automated + manual** testing in one workflow
- **Real-time feedback** with Cursor browser
- **Zero external dependencies** (no Selenium Grid, no BrowserStack)

---

## 📋 Command Usage

```bash
# Run all tests (E2E + Visual + prompts for Manual)
/qa-run --prd-id=F1

# Run E2E tests only (Agent Browser CLI default)
/qa-run --prd-id=F1 --mode=e2e

# Run visual regression only (Cursor browser)
/qa-run --prd-id=F1 --mode=visual

# Run manual testing guide (interactive)
/qa-run --prd-id=F1 --mode=manual

# Full test suite
/qa-run --prd-id=F1 --mode=full

# Custom URL
/qa-run --prd-id=F1 --url=http://localhost:4000
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required |
| `--mode` | Test mode: `all`, `e2e`, `visual`, `manual`, `full` | `all` |
| `--url` | Base URL of app | `http://localhost:3000` |

### Modes Explained

| Mode | What It Does | Duration |
|------|--------------|----------|
| `e2e` | Run Agent Browser E2E validation | 2-5 min |
| `visual` | Visual regression with Cursor browser | 3-10 min |
| `manual` | Interactive manual test guide | 15-30 min |
| `all` | E2E + Visual (no manual prompts) | 5-15 min |
| `full` | E2E + Visual + Manual | 20-45 min |

---

## 🔄 Execution Flow

### Mode 1: E2E Tests (`--mode=e2e`)

**Task:** Run Playwright E2E test suite

#### Phase 1: Pre-flight Checks

1. **Verify app is running**
   ```bash
   curl --silent --fail http://localhost:3000 || exit 1
   ```

2. **Check test file exists**
   ```bash
   test -f tests/e2e/F1-auth.spec.ts || /qa-plan --prd-id=F1
   ```

3. **Install dependencies if needed**
   ```bash
   npm list @playwright/test || npm install -D @playwright/test
   ```

**Output:**
```
🔍 Pre-flight Checks:
   ✅ App running on http://localhost:3000
   ✅ Test file found: tests/e2e/F1-auth.spec.ts
   ✅ Playwright installed
```

#### Phase 2: Execute E2E Tests

```bash
# Run Playwright tests
npx playwright test tests/e2e/F1-auth.spec.ts --reporter=json --output=test-results.json
```

**Parse Results:**
```json
{
  "passed": 8,
  "failed": 2,
  "skipped": 0,
  "total": 10,
  "failures": [
    {
      "test": "AC-2: Login fails with invalid credentials",
      "error": "Expected error message not found",
      "file": "tests/e2e/F1-auth.spec.ts:45",
      "screenshot": "test-results/screenshots/failure-1.png"
    }
  ]
}
```

**Output:**
```
🧪 E2E Test Results:
   ✅ Passed:  8/10 (80%)
   ❌ Failed:  2/10
   ⏭️  Skipped: 0/10
   
   Failures:
   1. AC-2: Login fails with invalid credentials
      Error: Expected error message not found
      File: tests/e2e/F1-auth.spec.ts:45
      Screenshot: test-results/screenshots/failure-1.png
   
   2. Flow: User registration end-to-end
      Error: Timeout waiting for confirmation message
      File: tests/e2e/F1-auth.spec.ts:78
```

---

### Mode 2: Visual Regression (`--mode=visual`) 🔥

**Task:** Use Cursor browser to test visual quality

#### Phase 1: Load Test Context

1. **Read test plan**
   ```bash
   # Read: /docs/qa/plans/F1-QA-PLAN.md
   # Extract screens to test
   ```

2. **Load wireframes**
   ```bash
   # Read: /docs/wireframes/screenshots/01-auth/*.png
   # Get list of expected screens
   ```

**Output:**
```
📊 Visual Test Context:
   Screens to test: 3
   - 01-login.png (Login screen)
   - 02-register.png (Registration screen)
   - 03-forgot-password.png (Password reset)
   
   Wireframes found: ✅ All 3 available
```

#### Phase 2: Execute Visual Tests with Cursor Browser

**For each screen:**

1. **Navigate to screen**
   ```javascript
   // Use Cursor browser tools
   await browser_navigate({ url: 'http://localhost:3000/login' });
   await browser_wait_for({ time: 2 }); // Wait for page load
   ```

2. **Take screenshot**
   ```javascript
   const snapshot = await browser_snapshot();
   // Save snapshot to file
   ```

3. **Compare against wireframe**
   ```typescript
   const comparison = compareScreenshots({
     actual: 'tests/visual/screenshots/F1-login-actual.png',
     expected: 'docs/wireframes/screenshots/01-auth/01-login.png',
     diffPath: 'tests/visual/screenshots/F1-login-diff.png',
     threshold: 0.05  // 5% tolerance
   });
   ```

4. **Report visual differences**
   ```
   📸 Screen: Login (01-login.png)
      Status: ⚠️ VISUAL MISMATCH (8.2% different)
      
      Differences detected:
      - Button position: 10px too far right
      - Font size: 14px (expected 16px)
      - Spacing: 8px between inputs (expected 12px)
      
      Diff image: tests/visual/screenshots/F1-login-diff.png
      
      Severity: Medium (layout issue, not broken)
   ```

**Interactive Visual Testing:**

For each visual mismatch, Cursor can:

```
🤖 Cursor Browser Visual Test:

Testing: Login Screen
URL: http://localhost:3000/login

📸 Taking screenshot...
✅ Screenshot captured

🔍 Comparing to wireframe: 01-login.png
⚠️ Visual mismatch detected (8.2% different)

Would you like me to:
1. Show diff image side-by-side
2. Navigate and inspect the element
3. Generate fix suggestions
4. Accept current implementation (update wireframe)
5. Mark as blocker and continue

[User choice]
```

If user selects **"3. Generate fix suggestions":**

```
💡 Fix Suggestions for Visual Mismatch:

Issue 1: Button Position (10px off)
Location: [data-testid="login-button"]
Current CSS: margin-right: 20px
Expected: margin-right: 10px

Suggested Fix:
```css
.login-button {
  margin-right: 10px; /* was 20px */
}
```

Issue 2: Font Size
Location: .email-input label
Current: font-size: 14px
Expected: font-size: 16px

Suggested Fix:
```css
.input-label {
  font-size: 16px; /* was 14px */
}
```

Apply fixes? [Yes] [No] [Later]
```

**Example Cursor Browser Session:**

```typescript
// Cursor executes this behind the scenes:

// 1. Navigate to login
await browser_navigate({ 
  url: 'http://localhost:3000/login' 
});

// 2. Wait for page ready
await browser_wait_for({ time: 2 });

// 3. Take accessibility snapshot (gets full page structure)
const snapshot = await browser_snapshot();

// 4. Extract visual elements
const elements = parseSnapshot(snapshot);
// Returns: { loginForm, emailInput, passwordInput, submitButton, ... }

// 5. Measure elements
const buttonPosition = elements.submitButton.boundingBox;
// { x: 320, y: 450, width: 120, height: 40 }

// 6. Compare against wireframe spec
const expected = loadWireframeSpec('01-login.png');
// { button: { x: 310, y: 450, width: 120, height: 40 } }

// 7. Calculate differences
const diffs = {
  button: { x: +10px, y: 0, reason: 'margin-right too large' }
};

// 8. Report to user with visual diff
```

**Output:**
```
📸 Visual Regression Test Results:

Screen 1: Login
   Status: ⚠️ MISMATCH (8.2% diff)
   Issues: Button position, font size
   Diff: tests/visual/screenshots/F1-login-diff.png

Screen 2: Register
   Status: ✅ MATCH (2.1% diff - acceptable)
   Note: Minor font rendering differences

Screen 3: Forgot Password
   Status: ❌ MAJOR MISMATCH (23% diff)
   Issues: Layout completely different
   Blocker: YES
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
   ✅ Passed: 1/3 screens
   ⚠️ Minor Issues: 1/3 screens
   ❌ Failed: 1/3 screens
   
   Blockers: 1 (Forgot Password layout)
```

---

### Mode 3: Manual Testing (`--mode=manual`) 🎮

**Task:** Interactive manual test guide with Cursor browser assistance

#### Phase 1: Load Manual Checklist

```bash
# Read: /docs/qa/checklists/F1-MANUAL-CHECKLIST.md
```

#### Phase 2: Interactive Test Execution

For each test case in checklist:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Manual Test Session: F1 - Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Case 1/12: Login - Happy Path
Priority: P0

📋 Steps:
1. Navigate to http://localhost:3000/login
2. Enter email: test@example.com
3. Enter password: ValidPass123!
4. Click "Login" button

🎯 Expected Result:
- Redirect to /dashboard
- User menu shows logged-in state
- No error messages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Cursor can help:
   [A] Auto-execute with browser agent
   [G] Guide me step-by-step
   [S] Skip this test
   [Q] Quit manual testing

Your choice: _

```

**If user selects "A" (Auto-execute):**

```
🤖 Executing test automatically...

Step 1: Navigate to /login
   ✅ Navigated to http://localhost:3000/login

Step 2: Enter email
   🔍 Found email input: [data-testid="email-input"]
   ✅ Typed: test@example.com

Step 3: Enter password
   🔍 Found password input: [data-testid="password-input"]
   ✅ Typed: ********* (hidden)

Step 4: Click "Login" button
   🔍 Found button: [data-testid="login-button"]
   ✅ Clicked

⏳ Waiting for result...

✅ TEST PASSED
   - Redirected to: http://localhost:3000/dashboard
   - User menu visible: ✅
   - No errors: ✅

📸 Screenshot saved: tests/manual/screenshots/TC-1-pass.png

Result: [✅ Pass] [❌ Fail] [⏭️ Skip] [📝 Notes]
```

**If user selects "G" (Guide me):**

```
🧭 Step-by-Step Guide:

Current Step: 1/4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Navigate to login page
URL: http://localhost:3000/login

🤖 I'll open it for you...
✅ Browser opened at http://localhost:3000/login

📸 Current screen:
[Shows browser snapshot]

👉 YOUR ACTION: Verify the login form is visible

Did you see the login form? [Yes] [No] [Issue]
```

**If user reports "Issue":**

```
🐛 Issue Detected:

What's wrong?
1. Login form not visible
2. Page not loading
3. Error message shown
4. Layout broken
5. Other

[User selects: 1]

Capturing details...
📸 Screenshot: tests/manual/issues/TC-1-issue-1.png
📝 Browser console:
   Error: Failed to load auth module
   at line 45 in auth.js

🚨 Test marked as FAILED
Issue logged: Login form not rendering

Continue to next test? [Yes] [No]
```

---

### Mode 4: Full Suite (`--mode=full`)

**Task:** Run everything in sequence

```
🚀 Full QA Suite: F1 - Authentication

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: E2E Tests (Automated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running Playwright tests...
✅ 8/10 passed (2 failures)
Duration: 3m 24s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 2: Visual Regression (Cursor Browser)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing 3 screens...
⚠️ 1/3 screens have visual mismatches
Duration: 5m 12s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 3: Manual Testing (Interactive)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12 manual test cases to execute...

[Proceeds to interactive manual testing]
```

---

### Phase 3: Results Aggregation

**Task:** Collect and analyze all test results

```typescript
const qaResults = {
  e2e: {
    total: 10,
    passed: 8,
    failed: 2,
    skipped: 0,
    duration: 204, // seconds
    failures: [...]
  },
  visual: {
    total: 3,
    passed: 1,
    minorIssues: 1,
    blockers: 1,
    screenshots: [...]
  },
  manual: {
    total: 12,
    passed: 10,
    failed: 1,
    skipped: 1,
    notes: [...]
  }
};

// Calculate overall status
const overallStatus = calculateQAStatus(qaResults);
// Returns: 'passed' | 'needs_fixes' | 'blocked'
```

---

### Phase 4: Tracking Update

**Task:** Update PRD tracking JSON with QA results

```json
// Update: .tracking-db/prds/F1-auth.json
{
  "qa": {
    "status": "needs_fixes",
    "last_run": "2025-12-28T16:45:00Z",
    "total_tests": 25,
    "passed": 19,
    "failed": 3,
    "skipped": 1,
    "visual_regression": {
      "status": "failed",
      "differences": 2,
      "threshold_exceeded": ["login-screen"]
    },
    "coverage": {
      "acceptance_criteria": 92,  // 11/12 ACs covered
      "screens": 100,              // 3/3 screens tested
      "states": 87,                // 7/8 states tested
      "journeys": 100              // 2/2 journeys tested
    },
    "report_path": "/docs/qa/reports/F1-QA-REPORT-2025-12-28.md",
    "ready_to_ship": false,
    "blockers": [
      "Visual regression: Forgot Password layout completely different",
      "E2E failure: Registration confirmation timeout",
      "Manual test: Network error handling not working"
    ]
  }
}
```

---

## 📤 Outputs

### Files Created

1. **Test Results**
   - `/tests/results/[PRD-ID]-e2e-results.json` - E2E results
   - `/tests/results/[PRD-ID]-visual-results.json` - Visual results
   - `/tests/results/[PRD-ID]-manual-results.md` - Manual test log

2. **Screenshots**
   - `/tests/visual/screenshots/[PRD-ID]-[screen]-actual.png`
   - `/tests/visual/screenshots/[PRD-ID]-[screen]-diff.png`
   - `/tests/manual/screenshots/[TC-ID]-*.png`

3. **Logs**
   - `/tests/logs/[PRD-ID]-qa-run.log` - Full execution log

### Files Updated

- `.tracking-db/prds/[PRD-ID].json` - QA status and metrics

---

## 🎯 Success Criteria

**Minimum to Pass:**
- ✅ ≥80% E2E tests passing
- ✅ ≥80% acceptance criteria covered
- ✅ ≥90% screens tested visually
- ✅ Zero P0 blocker tests failing
- ✅ All user flows working end-to-end

**Ready to Ship:**
- ✅ 100% E2E tests passing
- ✅ 100% visual regression passing (or minor issues accepted)
- ✅ 100% manual critical paths tested
- ✅ Zero blockers

---

## 🔄 Integration Points

### Inputs

- `/tests/e2e/[PRD-ID].spec.ts` - E2E test file
- `/tests/visual/[PRD-ID]-visual.spec.ts` - Visual tests
- `/docs/qa/checklists/[PRD-ID]-MANUAL-CHECKLIST.md` - Manual tests
- `/docs/wireframes/screenshots/**/*.png` - Wireframes
- `.tracking-db/prds/[PRD-ID].json` - PRD tracking

### Outputs

- Test results (JSON + screenshots)
- Updated tracking JSON
- Test execution logs

### Downstream Commands

- `/qa-report --prd-id=[ID]` - Generate comprehensive report
- `/ship-check` - Pre-deployment validation (reads QA status)

---

## 💡 Tips

### Best Practices

**1. Run after implementation:**
```bash
/implement-prd --prd-id=F1
/qa-run --prd-id=F1 --mode=all
```

**2. Quick visual check:**
```bash
# Just check visual regression
/qa-run --prd-id=F1 --mode=visual
```

**3. CI/CD integration:**
```bash
# In CI pipeline
/qa-run --prd-id=F1 --mode=e2e  # Skip interactive manual tests
```

**4. Local development:**
```bash
# Run full suite before committing
/qa-run --prd-id=F1 --mode=full
```

### Troubleshooting

**App not running:**
```bash
npm run dev  # Start app first
/qa-run --prd-id=F1
```

**Cursor browser issues:**
- Cursor browser tools work best on localhost
- Ensure proper data-testid attributes
- Check console for JavaScript errors

---

## 🚨 Common Issues

### "Tests not found"
Run `/qa-plan` first to generate tests

### "App not responding"
Check app is running on specified URL

### "Visual mismatch too high"
Wireframes may need updating if implementation intentionally different

### "Cursor browser can't find elements"
Add proper `[data-testid]` attributes or update selectors

---

*Part of Sigma QA System - Next: /qa-report for comprehensive reporting*
