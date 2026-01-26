---
name: release-review
description: "Sigma ops command: release-review"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# release-review

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - comprehensive pre-release validation checklist"
description: "Final release captain review before production deployment with all quality gates"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
parameters:
  - --sprint-id
  - --environment
---

# /release-review

**Release Captain final checklist before production deployment**

## 🎯 Purpose

**Role Context:** You are the **Release Captain** responsible for production stability. You've been paged at 3am for production incidents. You know that "works on my machine" isn't good enough. You validate everything before deployment.

This command:
- Validates all PRDs in release scope
- Checks all reviews passed (PR, test, QA)
- Verifies database migrations safe
- Confirms monitoring/alerts ready
- Validates performance budgets met
- Assesses deployment risk
- Creates go/no-go decision
- Generates release notes

**Business Impact:**
- **Prevent production incidents** through comprehensive validation
- **Reduce deployment risk** with systematic checks
- **Faster rollback** with prepared plans
- **Clear communication** with stakeholders
- **Confidence in releases** (no surprises)

---

## 📋 Command Usage

```bash
# Review current sprint for release
/release-review

# Review specific sprint
/release-review --sprint-id=2025-01

# Review for specific environment
/release-review --environment=staging
/release-review --environment=production
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--sprint-id` | Sprint ID to release | Active sprint |
| `--environment` | Target environment: `staging`, `production` | `production` |

---

## 🔄 Execution Flow

### Phase 1: Scope Definition

**Task:** Identify what's being released

1. **Load sprint**
   ```bash
   # Read: .tracking-db/sprints/sprint-2025-01.json
   ```

2. **Get PRDs in scope**
   ```bash
   # All PRDs with status="done" in this sprint
   ```

3. **Check git changes**
   ```bash
   git diff --name-status main...release/2025-01
   ```

**Output:**
```
📦 Release Scope:
   Sprint: 2025-01
   Environment: Production
   PRDs in Release: 4
   - F1: Authentication System
   - F5: Error Handling
   - F6: Design System
   - F9: Landing Page
   
   Files Changed: 127
   Lines Added: +3,245
   Lines Removed: -567
   Commits: 45
```

---

### Phase 2: Review Status Validation

**Task:** Ensure all reviews passed

#### 2A: PR Reviews

```typescript
const prReviewStatus = {
  "F1-auth": {
    status: "approved",
    score: 92,
    reviewer: "cursor-staff-engineer",
    date: "2025-12-27"
  },
  "F5-error": {
    status: "approved",
    score: 88,
    reviewer: "cursor-staff-engineer",
    date: "2025-12-27"
  },
  "F6-design": {
    status: "changes_requested",  // ❌ BLOCKER
    score: 72,
    reviewer: "cursor-staff-engineer",
    date: "2025-12-27"
  }
};
```

**Issues:**
```
🔍 PR REVIEW STATUS:

✅ Approved: 2/4 PRDs
   - F1: Authentication (92/100)
   - F5: Error Handling (88/100)

⚠️ Needs Approval: 1/4 PRDs
   - F9: Landing Page (not reviewed)

❌ BLOCKER: 1/4 PRDs
   - F6: Design System (changes requested, score: 72/100)
     Issues: 3 critical security issues not fixed
     Action: Fix issues, re-request review
```

#### 2B: Test Reviews

```typescript
const testReviewStatus = {
  "F1-auth": {
    status: "passed",
    ac_coverage: 100,
    code_coverage: 89,
    score: 94
  },
  "F5-error": {
    status: "passed",
    ac_coverage: 100,
    code_coverage: 92,
    score: 96
  },
  "F6-design": {
    status: "needs_improvement",
    ac_coverage: 75,  // ❌ Below 100%
    code_coverage: 68,  // ❌ Below 80%
    score: 72
  }
};
```

**Issues:**
```
🧪 TEST REVIEW STATUS:

✅ Passed: 2/4 PRDs
   - F1: 94/100 (coverage: 89%)
   - F5: 96/100 (coverage: 92%)

❌ BLOCKER: 1/4 PRDs
   - F6: 72/100 (coverage: 68%)
     Missing: 3 acceptance criteria not tested
     Action: Add missing tests

⚠️ Not Reviewed: 1/4 PRDs
   - F9: Landing Page
```

#### 2C: QA Status

```typescript
const qaStatus = {
  "F1-auth": {
    status: "passed",
    score: 94,
    tests_passed: 24,
    tests_total: 25,
    blockers: 0
  },
  "F5-error": {
    status: "passed",
    score: 98,
    tests_passed: 12,
    tests_total: 12,
    blockers: 0
  },
  "F6-design": {
    status: "needs_fixes",
    score: 76,
    tests_passed: 15,
    tests_total: 20,
    blockers: 2  // ❌ BLOCKER
  }
};
```

**Issues:**
```
✅ QA PASSED: 2/4 PRDs
   - F1: 94/100 (24/25 tests passing)
   - F5: 98/100 (12/12 tests passing)

❌ BLOCKER: 1/4 PRDs
   - F6: 76/100 (2 blockers)
     1. Visual regression: Component colors off
     2. E2E failure: Token generation flaky
     Action: Fix 2 blockers, re-run QA
```

---

### Phase 3: Migration Safety Check

**Task:** Verify database migrations are safe

```typescript
const migrationChecks = {
  hasMigrations: true,
  migrations: [
    {
      file: "20251227_add_sessions_table.sql",
      type: "DDL",
      risk: "low",
      reversible: true,
      estimated_time: "2 seconds"
    },
    {
      file: "20251228_add_email_unique_index.sql",
      type: "DDL",
      risk: "medium",
      reversible: true,
      estimated_time: "45 seconds",
      warnings: [
        "Will lock users table briefly (<1min)"
      ]
    }
  ],
  rollbackPlan: true
};
```

**Analysis:**
```
🗄️ DATABASE MIGRATIONS:

Migrations to Apply: 2

Migration 1: add_sessions_table.sql
   Type: CREATE TABLE
   Risk: ✅ LOW
   Reversible: ✅ Yes
   Time: ~2 seconds
   Impact: No table locking

Migration 2: add_email_unique_index.sql
   Type: CREATE UNIQUE INDEX
   Risk: ⚠️ MEDIUM
   Reversible: ✅ Yes
   Time: ~45 seconds
   Impact: Users table locked during index creation
   
   ⚠️ RECOMMENDATION:
   - Run during low-traffic window
   - Monitor table lock duration
   - Have DBA on standby

Rollback Plan: ✅ Documented
   File: /docs/migrations/ROLLBACK-PLAN-2025-01.md
```

---

### Phase 4: Monitoring Readiness

**Task:** Ensure observability in place

```typescript
const monitoringChecks = {
  logging: {
    structured: true,
    levels: ["error", "warn", "info"],
    issues: []
  },
  
  errorTracking: {
    sentry: true,
    sourcemaps: true,
    issues: []
  },
  
  metrics: {
    implemented: true,
    dashboards: ["performance", "errors", "business"],
    issues: []
  },
  
  alerts: {
    configured: false,  // ❌ BLOCKER
    issues: [
      "No alert for authentication failures"
    ]
  }
};
```

**Issues:**
```
📊 MONITORING READINESS:

✅ Logging: Ready
   - Structured logging implemented
   - Error/Warn/Info levels set
   - Log retention: 30 days

✅ Error Tracking: Ready
   - Sentry configured
   - Sourcemaps uploaded
   - Error grouping enabled

✅ Metrics: Ready
   - Performance dashboard created
   - Business metrics tracked
   - Grafana alerts set

❌ BLOCKER: Alerts Not Configured
   Missing Alerts:
   1. Authentication failure rate >5%
   2. API response time >500ms
   3. Error rate >1%
   
   Action: Configure alerts before deploying
   
   Suggested Alerts:
   ```yaml
   # alerts.yml
   - name: Auth Failure Rate
     condition: auth_failures / auth_attempts > 0.05
     severity: high
     notify: on-call
   
   - name: API Slow Response
     condition: api_response_time_p95 > 500ms
     severity: medium
     notify: engineering
   ```
```

---

### Phase 5: Performance Budget Validation

**Task:** Ensure performance targets met

```typescript
const performanceBudgets = {
  pageLoad: {
    budget: 2000,  // ms
    actual: 1850,
    pass: true
  },
  
  firstContentfulPaint: {
    budget: 1000,  // ms
    actual: 1200,  // ❌ Over budget
    pass: false
  },
  
  bundleSize: {
    budget: 200,  // KB
    actual: 245,  // ❌ Over budget
    pass: false
  },
  
  apiResponseTime: {
    budget: 300,  // ms
    actual: 280,
    pass: true
  }
};
```

**Issues:**
```
⚡ PERFORMANCE BUDGETS:

✅ Passed: 2/4 metrics
   - Page Load: 1,850ms (budget: 2,000ms)
   - API Response: 280ms (budget: 300ms)

❌ Failed: 2/4 metrics
   
   1. First Contentful Paint: 1,200ms
      Budget: 1,000ms
      Over by: 200ms (20%)
      Impact: Users wait 200ms longer for content
      
      Recommendations:
      - Optimize critical CSS (inline critical path)
      - Defer non-critical JavaScript
      - Add resource hints (preconnect, prefetch)
      
      Can Ship: ⚠️ YES (acceptable degradation)
   
   2. Bundle Size: 245KB
      Budget: 200KB
      Over by: 45KB (22.5%)
      Impact: Slower load on slow connections
      
      Top Contributors:
      - date-fns: 30KB (use date-fns-light)
      - lodash: 15KB (import individual functions)
      
      Can Ship: ⚠️ YES (but create follow-up task)
```

---

### Phase 6: Security Validation

**Task:** Final security checks

```typescript
const securityChecks = {
  secretsInCode: {
    pass: true,
    scanned: true
  },
  
  dependencies: {
    vulnerabilities: 2,  // ⚠️ WARNING
    critical: 0,
    high: 2,
    pass: false
  },
  
  authChecks: {
    pass: true,
    protected_routes: 12,
    all_secured: true
  },
  
  https: {
    pass: true,
    enforced: true
  }
};
```

**Issues:**
```
🔒 SECURITY VALIDATION:

✅ Passed: 3/4 checks
   - No secrets in code
   - All routes protected
   - HTTPS enforced

⚠️ WARNING: Dependency Vulnerabilities
   High Severity: 2
   
   1. axios@0.21.1 (HIGH)
      CVE-2021-3749: SSRF vulnerability
      Fix: Update to axios@0.27.2
      
   2. lodash@4.17.20 (HIGH)
      CVE-2021-23337: Command injection
      Fix: Update to lodash@4.17.21
   
   Action: Update dependencies before deploy
   
   Quick Fix:
   ```bash
   npm update axios lodash
   npm audit fix
   ```
   
   Can Ship: ⚠️ YES (vulnerabilities not in critical path)
   But MUST fix within 7 days
```

---

### Phase 7: Risk Assessment

**Task:** Calculate overall deployment risk

```typescript
const riskAssessment = {
  technicalRisk: "medium",
  businessRisk: "low",
  rollbackRisk: "low",
  
  riskFactors: [
    {
      factor: "Database migration locks table",
      severity: "medium",
      mitigation: "Run during low-traffic window"
    },
    {
      factor: "2 dependency vulnerabilities",
      severity: "medium",
      mitigation: "Not in critical path, fix post-deploy"
    },
    {
      factor: "Performance budget exceeded",
      severity: "low",
      mitigation: "Still within acceptable range"
    }
  ],
  
  overallRisk: "MEDIUM-LOW"
};
```

**Output:**
```
🎲 RISK ASSESSMENT:

Overall Risk: 🟡 MEDIUM-LOW

Risk Breakdown:
├─ Technical Risk: 🟡 MEDIUM
│  └─ Database migration requires table lock
│  └─ 2 dependency vulnerabilities (not critical path)
│
├─ Business Risk: 🟢 LOW
│  └─ Changes isolated to auth system
│  └─ Feature flags in place
│
└─ Rollback Risk: 🟢 LOW
   └─ All migrations reversible
   └─ Feature flags allow instant disable

Risk Factors:
1. 🟡 Database Lock (MEDIUM)
   - Users table locked ~45sec during index creation
   - Mitigation: Deploy during 2-4am window
   
2. 🟡 Dependency Vulns (MEDIUM)
   - 2 high severity (not exploitable in our usage)
   - Mitigation: Update within 7 days post-deploy

3. 🟢 Performance Budget (LOW)
   - 20% over FCP budget (still acceptable)
   - Mitigation: Follow-up optimization task created

Recommendation: ✅ PROCEED WITH CAUTION
- Deploy during off-peak hours (2-4am)
- Monitor closely for first 2 hours
- Have rollback plan ready
```

---

### Phase 8: Release Decision

**Task:** Make go/no-go decision

```typescript
const releaseChecklist = {
  prReviewsPassed: false,      // F6 needs approval
  testReviewsPassed: false,    // F6 below threshold
  qaPassed: false,             // F6 has 2 blockers
  migrationsValidated: true,
  monitoringReady: false,      // Alerts not configured
  performanceBudgetsMet: false, // 2 metrics over budget
  securityValidated: true,     // Warnings acceptable
  riskAssessed: true,
  
  blockingIssues: 4,
  warningIssues: 3,
  
  decision: "NO-GO"
};
```

**Output:**
```
🚦 RELEASE DECISION: ❌ NO-GO

Reason: 4 blocking issues prevent deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 BLOCKING ISSUES (Must Fix):

1. ❌ F6: PR Review Not Approved
   Score: 72/100 (threshold: 80/100)
   Issues: 3 critical security issues
   ETA: 2 hours
   
2. ❌ F6: Test Coverage Below Threshold
   Coverage: 68% (threshold: 80%)
   Missing: 3 acceptance criteria tests
   ETA: 1 hour
   
3. ❌ F6: QA Blockers
   Blockers: 2 (visual regression, E2E flaky)
   ETA: 3 hours
   
4. ❌ Monitoring: Alerts Not Configured
   Missing: Auth failure, API slow, Error rate alerts
   ETA: 30 minutes

Total ETA to Ready: 4-6 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ WARNING ISSUES (Can Ship With):

1. ⚠️ Performance: Bundle size over budget (+45KB)
   Impact: Slower load on slow connections
   Mitigation: Create follow-up task
   
2. ⚠️ Security: 2 dependency vulnerabilities
   Impact: Low (not in critical path)
   Mitigation: Fix within 7 days
   
3. ⚠️ Database: Table lock during migration
   Impact: Brief user impact during deploy
   Mitigation: Deploy 2-4am window

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 NEXT STEPS:

Priority 1 (Blocking):
1. Fix F6 security issues → Re-run /pr-review
2. Add F6 missing tests → Re-run /test-review
3. Fix F6 QA blockers → Re-run /qa-run
4. Configure monitoring alerts

After All Fixed:
5. Re-run /release-review
6. Expect GO decision if all pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Phase 9: Release Notes Generation

**Task:** Create release notes (if GO)

**File:** `/docs/releases/RELEASE-NOTES-2025-01.md`

```markdown
# Release Notes: Sprint 2025-01

**Release Date:** 2025-12-28  
**Environment:** Production  
**Status:** ✅ APPROVED

---

## 📦 What's Included

### Features (4)

#### F1: Authentication System ✨
**User Impact:** Users can now register and log in securely

**What's New:**
- Email/password authentication
- Session management
- Password reset flow
- Secure token handling

**Technical Details:**
- JWT-based authentication
- bcrypt password hashing
- Rate limiting on auth endpoints
- CSRF protection

---

#### F5: Error Handling 🛡️
**User Impact:** Better error messages and recovery options

**What's New:**
- Global error boundary
- User-friendly error messages
- Retry buttons on network errors
- Error logging to Sentry

---

#### F6: Design System 🎨
**User Impact:** Consistent, polished UI across the app

**What's New:**
- Design tokens (colors, spacing, typography)
- Reusable UI components
- Responsive layouts
- Dark mode support

---

#### F9: Landing Page 🚀
**User Impact:** New users see beautiful landing page

**What's New:**
- Hero section with CTA
- Feature highlights
- Testimonials
- Optimized for conversion

---

## 🗄️ Database Changes

### Migrations
1. `add_sessions_table.sql`
   - Creates sessions table for auth
   - No data migration needed
   - Estimated time: 2 seconds

2. `add_email_unique_index.sql`
   - Adds unique constraint on emails
   - **Note:** Brief table lock (~45sec)
   - Runs during deploy window

### Rollback Plan
- All migrations reversible
- Rollback scripts in `/migrations/rollback/`
- Automated rollback on failure

---

## ⚡ Performance

- Page load: 1,850ms (target: <2,000ms) ✅
- API response: 280ms (target: <300ms) ✅
- Bundle size: 245KB (⚠️ 45KB over budget)
- First paint: 1,200ms (⚠️ 200ms over budget)

**Note:** Performance budgets slightly exceeded but within acceptable range. Follow-up optimization scheduled.

---

## 🔒 Security

- All routes protected with auth checks ✅
- HTTPS enforced ✅
- CSRF tokens implemented ✅
- ⚠️ 2 dependency vulnerabilities (low risk, fix scheduled)

---

## 📊 Quality Metrics

- Code coverage: 89% average
- QA pass rate: 100% (all blockers fixed)
- PR review scores: 90/100 average
- Test review scores: 95/100 average

---

## 🚨 Known Issues

None for this release.

---

## 🎯 Deployment Plan

### Pre-Deployment
1. ✅ All reviews passed
2. ✅ QA completed
3. ✅ Monitoring configured
4. ✅ Alerts set up
5. ✅ Rollback plan ready

### Deployment Window
- **Date:** 2025-12-28
- **Time:** 2:00am - 4:00am PST
- **Duration:** ~15 minutes (including migration)
- **On-call:** Engineering team

### Post-Deployment
1. Monitor error rates (first 2 hours)
2. Verify auth flow working
3. Check migration completed successfully
4. Validate performance metrics

### Rollback Criteria
- Error rate >5%
- Auth failures >10%
- Database migration fails
- Critical bugs discovered

---

## 📞 Support

- **On-call:** Engineering team
- **Slack:** #production-deployments
- **Runbook:** `/docs/ops/DEPLOYMENT-RUNBOOK.md`

---

*Generated by /release-review on 2025-12-28*
```

---

## 📤 Outputs

### Files Created

1. **Release Review Report**
   - `/docs/reviews/RELEASE-REVIEW-[sprint-id]-YYYY-MM-DD.md`

2. **Release Notes** (if approved)
   - `/docs/releases/RELEASE-NOTES-[sprint-id].md`

3. **Rollback Plan** (if migrations)
   - `/docs/migrations/ROLLBACK-PLAN-[sprint-id].md`

### Files Updated

- `.tracking-db/sprints/[sprint-id].json` - Release status

---

## 🎯 Success Criteria

**For GO Decision:**
- ✅ All PRDs have approved PR reviews (≥80/100)
- ✅ All PRDs have passing test reviews (≥80/100)
- ✅ All PRDs have passing QA (≥80/100)
- ✅ All migrations validated and reversible
- ✅ Monitoring and alerts configured
- ✅ Performance budgets met (or acceptable degradation)
- ✅ No critical security issues
- ✅ Risk assessed and mitigated

---

## 💡 Tips

### Run Before Deploy

```bash
# Final check before production
/release-review --environment=production

# If NO-GO → fix issues → re-run
/release-review
```

### Staging First

```bash
# Always validate on staging
/release-review --environment=staging
/ship-stage

# Then production
/release-review --environment=production
/ship-prod
```

---

*Part of Sigma Review Workflows - Phase 3*

