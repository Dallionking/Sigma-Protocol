---
name: qa-report
description: "Sigma ops command: qa-report"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# qa-report

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - comprehensive QA reporting with visual diffs"
description: "Generate comprehensive QA reports with test results, visual regressions, and actionable recommendations"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
parameters:
  - --prd-id
  - --format
---

# /qa-report

**Generate comprehensive, stakeholder-ready QA reports from test execution results**

## 🎯 Purpose

**Role Context:** You are a **QA Lead** creating reports for engineering teams and stakeholders. Your reports are clear, actionable, and include visual evidence.

This command:
- Aggregates E2E, visual, and manual test results
- Calculates coverage metrics
- Identifies blockers and risks
- Generates visual diff galleries
- Creates actionable fix recommendations
- Provides pass/fail decision
- Updates sprint tracking with QA status

**Business Impact:**
- **Clear go/no-go decisions** for deployment
- **Visual evidence** of issues for designers/developers
- **Actionable recommendations** with specific fixes
- **Stakeholder-friendly** format for non-technical reviews
- **Historical tracking** of QA trends

---

## 📋 Command Usage

```bash
# Generate QA report for PRD
/qa-report --prd-id=F1

# Generate HTML report
/qa-report --prd-id=F1 --format=html

# Generate JSON (for automation)
/qa-report --prd-id=F1 --format=json

# Markdown report (default)
/qa-report --prd-id=F1 --format=md
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required |
| `--format` | Output format: `md`, `html`, `json` | `md` |

---

## 🔄 Execution Flow

### Phase 1: Results Collection (Auto)

**Task:** Load all test execution results

1. **Load E2E results**
   ```bash
   # Read: /tests/results/F1-auth-e2e-results.json
   ```

2. **Load visual regression results**
   ```bash
   # Read: /tests/results/F1-auth-visual-results.json
   # Load diff screenshots
   ```

3. **Load manual test results**
   ```bash
   # Read: /tests/results/F1-auth-manual-results.md
   # Or load from tracking JSON
   ```

4. **Load PRD tracking**
   ```bash
   # Read: .tracking-db/prds/F1-auth.json
   ```

**Output:**
```
📊 Results Loaded:
   E2E Tests: 10 tests (8 passed, 2 failed)
   Visual Tests: 3 screens (1 passed, 2 issues)
   Manual Tests: 12 tests (10 passed, 1 failed, 1 skipped)
   Total Tests: 25
```

---

### Phase 2: Analysis & Scoring

**Task:** Calculate comprehensive QA metrics

#### 2A: Test Coverage Analysis

```typescript
const coverage = {
  acceptanceCriteria: {
    total: 12,
    covered: 11,
    percentage: 91.7,
    missing: ["AC-12: Session persistence across browser restart"]
  },
  screens: {
    total: 3,
    tested: 3,
    percentage: 100
  },
  states: {
    total: 8,
    tested: 7,
    percentage: 87.5,
    missing: ["Empty state when no users"]
  },
  userJourneys: {
    total: 2,
    tested: 2,
    percentage: 100
  }
};
```

#### 2B: Quality Score Calculation

```typescript
const qualityScore = {
  e2e: {
    passRate: 80,  // 8/10
    weight: 40,
    score: 32      // 80 * 0.4
  },
  visual: {
    passRate: 33,  // 1/3 passing
    weight: 30,
    score: 10      // 33 * 0.3
  },
  manual: {
    passRate: 91,  // 10/11 (excluding skip)
    weight: 30,
    score: 27      // 91 * 0.3
  },
  totalScore: 69  // Sum of weighted scores
};

// Grade
const grade = 
  qualityScore.totalScore >= 90 ? 'A (Excellent)' :
  qualityScore.totalScore >= 80 ? 'B (Good)' :
  qualityScore.totalScore >= 70 ? 'C (Acceptable)' :
  qualityScore.totalScore >= 60 ? 'D (Needs Work)' :
  'F (Fail)';
```

#### 2C: Risk Assessment

```typescript
const risks = {
  p0Blockers: [
    {
      test: "E2E: Registration confirmation timeout",
      severity: "critical",
      impact: "Users cannot complete registration"
    },
    {
      test: "Visual: Forgot Password layout broken",
      severity: "high",
      impact: "Users cannot reset passwords"
    }
  ],
  p1Issues: [
    {
      test: "Visual: Login button position off by 10px",
      severity: "low",
      impact: "Minor visual inconsistency"
    }
  ],
  warnings: [
    {
      test: "Manual: Session timeout not tested",
      severity: "medium",
      impact: "Unknown behavior after 30min inactivity"
    }
  ]
};
```

---

### Phase 3: Report Generation

**Task:** Create comprehensive report

#### Markdown Report Output

**File:** `/docs/qa/reports/F1-QA-REPORT-2025-12-28.md`

```markdown
# QA Report: F1 - Authentication System

**Date:** 2025-12-28 16:45  
**Tester:** Cursor QA Agent  
**Build:** `git:abc123f`  
**PRD:** F1-auth  
**Status:** ⚠️ NEEDS FIXES (Score: 69/100 - Grade C)

---

## 📊 Executive Summary

### Overall Status
**🚨 NOT READY FOR PRODUCTION**

**Why:** 2 critical blockers prevent users from completing core flows (registration, password reset). Visual regression detected on Forgot Password screen.

**Recommendation:** Fix 2 P0 blockers, then re-test. Visual issues can be addressed in parallel.

**ETA to Ready:** 4-6 hours (2h per blocker)

---

## 📈 Quality Score: 69/100 (Grade C)

```
Quality Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
E2E Tests          [████████░░] 80% × 40% = 32pts
Visual Regression  [███░░░░░░░] 33% × 30% = 10pts
Manual Testing     [█████████░] 91% × 30% = 27pts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE:                             69pts
```

**Pass Threshold:** 80/100  
**Current Score:** 69/100  
**Gap:** 11 points

---

## 🎯 Test Results Summary

| Category | Total | Passed | Failed | Skipped | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| **E2E Tests** | 10 | 8 | 2 | 0 | 80% |
| **Visual Tests** | 3 | 1 | 2 | 0 | 33% |
| **Manual Tests** | 12 | 10 | 1 | 1 | 91%* |
| **TOTAL** | 25 | 19 | 5 | 1 | **76%** |

\* Excluding skipped test

---

## 🚨 Critical Blockers (Must Fix Before Ship)

### Blocker 1: Registration Confirmation Timeout ❌

**Test:** E2E-004: User registration end-to-end  
**Category:** E2E  
**Severity:** P0 (Critical)  
**Status:** FAILED

**Issue:**
```
Error: Timeout waiting for confirmation message
Expected: Message "Check your email" to appear
Actual: Timeout after 30 seconds
File: tests/e2e/F1-auth.spec.ts:78
```

**Impact:** Users cannot complete registration flow. This blocks **100% of new signups**.

**Root Cause Analysis:**
- API call to `/api/auth/register` returns 200
- Email service may be slow or failing
- Frontend may not be listening for success response

**Recommended Fix:**
1. Check email service logs (`/api/auth/register` handler)
2. Add loading state so users know email is being sent
3. Add timeout handling with retry option
4. Test email service in staging

**Priority:** 🔥 FIX IMMEDIATELY

**Assigned:** [Engineering Team]  
**ETA:** 2 hours

**Screenshot:**
![Registration timeout](../screenshots/blocker-1-registration-timeout.png)

---

### Blocker 2: Forgot Password Layout Broken ❌

**Test:** Visual-003: Forgot Password screen  
**Category:** Visual Regression  
**Severity:** P0 (Critical)  
**Status:** FAILED (23% visual difference)

**Issue:**
Layout completely different from wireframe. Form elements overlapping, text unreadable.

**Visual Comparison:**

| Expected (Wireframe) | Actual | Diff |
|---------------------|--------|------|
| ![Wireframe](../../wireframes/screenshots/01-auth/03-forgot-password.png) | ![Actual](../screenshots/F1-forgot-password-actual.png) | ![Diff](../screenshots/F1-forgot-password-diff.png) |

**Differences Detected:**
- Form container: 200px too narrow (causing overflow)
- Email input: Positioned 50px too low
- Submit button: Off-screen (not visible)
- Typography: Font size 12px instead of 16px

**Impact:** Users cannot use password reset feature. This blocks **password recovery**.

**Recommended Fix:**
```css
/* Current (broken) */
.forgot-password-container {
  width: 200px;     /* Too narrow */
  padding: 10px;
}

/* Should be */
.forgot-password-container {
  width: 400px;     /* Match login/register */
  padding: 24px;
  max-width: 100%;
}

.email-input {
  margin-top: 20px; /* Not 70px */
}

.submit-button {
  margin-top: 24px; /* Ensure visible */
}

label {
  font-size: 16px;  /* Not 12px */
}
```

**Priority:** 🔥 FIX IMMEDIATELY

**Assigned:** [Frontend Team]  
**ETA:** 2 hours

---

## ⚠️ Non-Blocking Issues (Can Ship With These)

### Issue 1: Login Button Position (Minor Visual) ⚠️

**Test:** Visual-001: Login screen  
**Severity:** P1 (Low)  
**Status:** Minor mismatch (8.2% different)

**Issue:**
Login button is 10px too far right. This is a minor visual inconsistency, not blocking functionality.

**Recommended Fix:**
```css
.login-button {
  margin-right: 10px; /* was 20px */
}
```

**Can Ship:** ✅ Yes (cosmetic only)  
**Priority:** Low  
**ETA:** 30 minutes

---

### Issue 2: Session Timeout Not Tested ⚠️

**Test:** Manual-TC-13: Session persistence  
**Severity:** P2 (Medium)  
**Status:** SKIPPED

**Issue:**
Test for session timeout (30min inactivity) was skipped due to time constraints. Unknown behavior when session expires.

**Recommended Action:**
1. Add automated test for session expiry
2. Manual test in staging before production
3. Monitor session timeout in production logs

**Can Ship:** ✅ Yes (with monitoring)  
**Priority:** Medium  
**ETA:** 1 hour (for automated test)

---

## ✅ What's Working Well

### Strengths

1. **Core Login Flow:** Rock solid
   - 100% pass rate on happy path
   - Error handling working correctly
   - Loading states implemented

2. **Manual Test Coverage:** Excellent
   - 91% pass rate (10/11 tests)
   - All critical user journeys tested
   - Edge cases covered

3. **Registration UI:** Visually perfect
   - 100% match to wireframe
   - All states implemented
   - Responsive on mobile

---

## 📊 Detailed Test Breakdown

### E2E Tests (80% passing)

| Test | Status | Duration | Notes |
|------|--------|----------|-------|
| AC-1: Successful login | ✅ PASS | 2.1s | Perfect |
| AC-2: Invalid credentials error | ✅ PASS | 1.8s | Perfect |
| AC-3: Empty field validation | ✅ PASS | 1.2s | Perfect |
| AC-4: Registration flow | ❌ FAIL | 30s | **BLOCKER** Timeout |
| AC-5: Forgot password link | ✅ PASS | 1.5s | Perfect |
| AC-6: Email validation | ✅ PASS | 1.3s | Perfect |
| AC-7: Password strength | ✅ PASS | 1.6s | Perfect |
| AC-8: Loading states | ✅ PASS | 2.3s | Perfect |
| AC-9: Error states | ✅ PASS | 1.9s | Perfect |
| AC-10: Network failure | ❌ FAIL | 5.2s | Retry button not working |

**Failures:**
1. AC-4: Registration timeout (see Blocker 1)
2. AC-10: Network error retry not implemented

---

### Visual Regression (33% passing)

| Screen | Status | Diff % | Issues |
|--------|--------|--------|--------|
| Login | ⚠️ MINOR | 8.2% | Button position off |
| Register | ✅ PASS | 2.1% | Perfect (minor font rendering) |
| Forgot Password | ❌ FAIL | 23% | **BLOCKER** Layout broken |

**Visual Gallery:**

#### Login Screen (Minor Issues)
<details>
<summary>Click to expand comparison</summary>

| Expected | Actual | Diff |
|----------|--------|------|
| ![](../../wireframes/screenshots/01-auth/01-login.png) | ![](../screenshots/F1-login-actual.png) | ![](../screenshots/F1-login-diff.png) |

**Issues:**
- Button: 10px right offset
- Font: 14px instead of 16px in labels

</details>

#### Registration Screen (Perfect ✅)
<details>
<summary>Click to expand comparison</summary>

| Expected | Actual | Diff |
|----------|--------|------|
| ![](../../wireframes/screenshots/01-auth/02-register.png) | ![](../screenshots/F1-register-actual.png) | ![](../screenshots/F1-register-diff.png) |

**Issues:** None (2.1% diff is font anti-aliasing only)

</details>

#### Forgot Password (Critical Issues ❌)
<details>
<summary>Click to expand comparison</summary>

| Expected | Actual | Diff |
|----------|--------|------|
| ![](../../wireframes/screenshots/01-auth/03-forgot-password.png) | ![](../screenshots/F1-forgot-password-actual.png) | ![](../screenshots/F1-forgot-password-diff.png) |

**Issues:**
- Layout completely broken
- Button off-screen
- Form too narrow

</details>

---

### Manual Testing (91% passing)

| Test Case | Status | Time | Notes |
|-----------|--------|------|-------|
| TC-1: Login happy path | ✅ PASS | 2min | Perfect |
| TC-2: Invalid credentials | ✅ PASS | 2min | Perfect |
| TC-3: Loading state | ✅ PASS | 3min | Perfect |
| TC-4: Registration happy path | ✅ PASS | 4min | Perfect |
| TC-5: Forgot password flow | ✅ PASS | 3min | Perfect |
| TC-6: Keyboard navigation | ✅ PASS | 5min | Perfect |
| TC-7: Screen reader | ✅ PASS | 8min | Perfect |
| TC-8: Mobile responsiveness | ✅ PASS | 6min | Perfect |
| TC-9: Browser compat (Chrome) | ✅ PASS | 3min | Perfect |
| TC-10: Browser compat (Firefox) | ✅ PASS | 3min | Perfect |
| TC-11: Session persistence | ⏭️ SKIP | - | Time constraint |
| TC-12: Network error handling | ❌ FAIL | 4min | Retry not working |

**Manual Test Notes:**
- Accessibility: Excellent (keyboard nav + screen reader)
- Mobile: Perfect responsive design
- Browser compat: Tested Chrome + Firefox, both perfect
- Network handling: Needs improvement (retry button doesn't work)

---

## 📊 Coverage Analysis

### Acceptance Criteria Coverage: 91.7% (11/12)

**Covered:**
✅ AC-1: User can log in with email and password  
✅ AC-2: Invalid credentials show error message  
✅ AC-3: Form validation prevents empty submissions  
✅ AC-4: User can register new account  
✅ AC-5: Forgot password link navigates correctly  
✅ AC-6: Email validation enforced  
✅ AC-7: Password strength requirements enforced  
✅ AC-8: Loading states shown during API calls  
✅ AC-9: Error states display user-friendly messages  
✅ AC-10: Network errors handled gracefully  
✅ AC-11: Successful auth redirects to dashboard  

**Not Covered:**
❌ AC-12: Session persists across browser restart

### Screen Coverage: 100% (3/3)
✅ Login screen  
✅ Registration screen  
✅ Forgot password screen

### State Coverage: 87.5% (7/8)
✅ Initial/idle state  
✅ Loading state  
✅ Success state  
✅ Error state (network)  
✅ Error state (validation)  
✅ Error state (invalid credentials)  
✅ Empty field state  
❌ Empty state (no users) - Not applicable

### User Journey Coverage: 100% (2/2)
✅ Login flow (start to dashboard)  
✅ Registration flow (start to email confirmation)

---

## 🎯 Recommendations

### Immediate Actions (Before Next Test Run)

1. **Fix Blocker 1:** Registration timeout
   - Investigate email service
   - Add proper loading/timeout UX
   - **Owner:** Backend + Frontend
   - **ETA:** 2 hours

2. **Fix Blocker 2:** Forgot Password layout
   - Fix CSS container width
   - Ensure button visible
   - Match wireframe spacing
   - **Owner:** Frontend
   - **ETA:** 2 hours

3. **Retest After Fixes:**
   ```bash
   /qa-run --prd-id=F1 --mode=all
   ```

### Nice-to-Have (Can Ship Without)

4. **Fix login button position**
   - Quick CSS fix
   - **ETA:** 30 minutes

5. **Add session timeout test**
   - Automated E2E test
   - **ETA:** 1 hour

6. **Implement network retry**
   - Retry button on error state
   - **ETA:** 2 hours

---

## 📅 Next Steps

### Path to Production

```
Current Status:   ⚠️ NEEDS FIXES (69/100)
                  │
                  ├─ Fix Blocker 1 (Registration)
                  │  └─ ETA: 2 hours
                  │
                  ├─ Fix Blocker 2 (Forgot Password)
                  │  └─ ETA: 2 hours
                  │
                  ├─ Re-run QA
                  │  └─ /qa-run --prd-id=F1
                  │
                  ├─ Verify Score ≥80
                  │  └─ /qa-report --prd-id=F1
                  │
                  └─> ✅ READY FOR PRODUCTION
```

**Total Time to Production Ready:** 4-6 hours

---

## 📎 Attachments

### Test Artifacts
- E2E Results: `/tests/results/F1-auth-e2e-results.json`
- Visual Screenshots: `/tests/visual/screenshots/`
- Manual Test Log: `/tests/results/F1-auth-manual-results.md`
- Full Test Logs: `/tests/logs/F1-auth-qa-run.log`

### Visual Evidence
- All screenshots: `/docs/qa/screenshots/F1-auth/`
- Diff images: `/tests/visual/screenshots/*-diff.png`
- Video recordings: `/tests/videos/` (if available)

---

## ✍️ Sign-off

**QA Engineer:** Cursor QA Agent  
**Date:** 2025-12-28 16:45  
**Recommendation:** ⚠️ DO NOT SHIP - Fix 2 blockers first

**Next Review:** After fixes implemented  
**Expected Ready Date:** 2025-12-28 (evening)

---

*Generated by /qa-report on 2025-12-28 16:45*  
*PRD: F1-auth*  
*Build: git:abc123f*  
*Test Duration: 47 minutes*
```

---

## 📤 Outputs

### Files Created

1. **Main Report**
   - `/docs/qa/reports/[PRD-ID]-QA-REPORT-YYYY-MM-DD.md` (Markdown)
   - `/docs/qa/reports/[PRD-ID]-QA-REPORT-YYYY-MM-DD.html` (HTML, if requested)
   - `/docs/qa/reports/[PRD-ID]-QA-REPORT-YYYY-MM-DD.json` (JSON, if requested)

2. **Screenshots Gallery**
   - `/docs/qa/screenshots/[PRD-ID]/` - All organized screenshots

### Files Updated

- `.tracking-db/prds/[PRD-ID].json` - QA report path + status
- `/docs/tracking/SPRINT-CURRENT.md` - QA status indicator

---

## 🎯 Success Criteria

- ✅ Report generated with all test results
- ✅ Visual diff gallery included
- ✅ Blockers clearly identified
- ✅ Actionable recommendations provided
- ✅ Coverage metrics calculated
- ✅ Quality score assigned
- ✅ Ready/not-ready decision clear

---

## 💡 Tips

### Generate After QA Run

```bash
# Always run qa-run first
/qa-run --prd-id=F1 --mode=all

# Then generate report
/qa-report --prd-id=F1
```

### Share with Stakeholders

```bash
# Generate HTML for sharing
/qa-report --prd-id=F1 --format=html

# Open in browser
open docs/qa/reports/F1-QA-REPORT-2025-12-28.html
```

### Track QA Progress

```bash
# After each fix
/qa-run --prd-id=F1
/qa-report --prd-id=F1

# Compare scores over time
```

---

*Part of Sigma QA System*

