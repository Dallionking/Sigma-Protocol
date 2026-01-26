---
name: pr-review
description: "Sigma ops command: pr-review"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# pr-review

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - Staff/Principal engineer-level PR review"
description: "Comprehensive PR review simulating Staff/Principal engineer with architecture, security, performance, and maintainability checks"
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
  - --focus
---

# /pr-review

**Staff/Principal Engineer-level PR review with comprehensive quality checks**

## 🎯 Purpose

**Role Context:** You are a **Staff/Principal Engineer** with 15+ years of experience. You've seen production incidents caused by subtle bugs. You review PRs with the mindset: "Will this code cause a 3am incident?" You check architecture, security, performance, and maintainability ruthlessly.

This command:
- Reviews code changes for PRD implementation
- Checks architecture alignment (Step 2 + Step 8)
- Validates design system compliance (Step 6)
- Verifies state coverage (Step 7)
- Scans for security vulnerabilities
- Identifies performance pitfalls
- Assesses maintainability and code quality
- Provides actionable improvement suggestions
- Assigns review score (0-100)

**Business Impact:**
- **Prevent production incidents** through systematic review
- **Maintain code quality** over time
- **Knowledge transfer** (review comments teach best practices)
- **Reduce technical debt** by catching issues early
- **Faster reviews** (automated + consistent)

---

## 📋 Command Usage

```bash
# Review PRD implementation
/pr-review --prd-id=F1

# Strict mode (fail on any issues)
/pr-review --prd-id=F1 --strict

# Focus on specific area
/pr-review --prd-id=F1 --focus=security
/pr-review --prd-id=F1 --focus=performance
/pr-review --prd-id=F1 --focus=architecture
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required |
| `--strict` | Fail on any warnings (not just errors) | false |
| `--focus` | Focus area: `all`, `architecture`, `security`, `performance`, `quality` | `all` |

---

## 🔄 Execution Flow

### Phase 1: Context Loading (Auto)

**Task:** Load all relevant context for review

1. **Read PRD**
   ```bash
   # Read: /docs/prds/F1-auth.md
   ```
   Extract:
   - Requirements
   - Acceptance criteria
   - Expected behavior

2. **Load architecture specs**
   ```bash
   # Read: /docs/architecture/ARCHITECTURE.md (Step 2)
   # Read: /docs/technical/TECHNICAL-SPEC.md (Step 8)
   ```
   Extract:
   - System design patterns
   - Technical constraints
   - Integration points

3. **Load design system**
   ```bash
   # Read: /docs/design/DESIGN-SYSTEM.md (Step 6)
   ```
   Extract:
   - Component standards
   - Styling conventions
   - Token usage

4. **Load state specs**
   ```bash
   # Read: /docs/states/STATE-SPEC.md (Step 7)
   ```
   Extract:
   - Required states (loading, error, success, empty)

5. **Get changed files**
   ```bash
   # Find files modified for this PRD
   git diff --name-only $(git merge-base HEAD main)
   
   # Or read from tracking
   # .tracking-db/prds/F1-auth.json → implementation.files_changed
   ```

**Output:**
```
📊 PR Review Context:
   PRD: F1 (Authentication System)
   Files Changed: 15
   Lines Added: +890
   Lines Removed: -45
   Architecture Spec: Loaded ✅
   Design System: Loaded ✅
   State Specs: Loaded ✅
```

---

### Phase 2: Architecture Review

**Task:** Check alignment with architecture decisions

#### 2A: Pattern Compliance

```typescript
// Check against Step 2 architecture patterns

const architectureChecks = {
  layering: {
    pass: true,
    issues: [],
    check: "Does code follow defined layers? (UI → Logic → Data)"
  },
  
  dependencies: {
    pass: false,
    issues: [
      "auth/login.tsx imports from database layer directly (should go through API)"
    ],
    check: "Are dependencies flowing in the correct direction?"
  },
  
  integrationPoints: {
    pass: true,
    issues: [],
    check: "Are API contracts followed?"
  }
};
```

**Issues Detected:**
```
🏗️ ARCHITECTURE ISSUES:

❌ Dependency Violation (HIGH)
   File: src/auth/login.tsx:23
   Issue: Direct database import from UI component
   
   Current:
   ```typescript
   import { db } from '@/database/client';
   
   async function handleLogin() {
     const user = await db.users.findUnique(...);
   }
   ```
   
   Should Be:
   ```typescript
   import { api } from '@/lib/api';
   
   async function handleLogin() {
     const user = await api.auth.login(...);
   }
   ```
   
   Why: UI should never touch database directly. Use API layer.
   Violates: Architecture.md section "Layered Architecture"
   Risk: Breaks separation of concerns, hard to test, security risk
   Priority: MUST FIX
```

#### 2B: Technical Spec Compliance

```typescript
// Check against Step 8 technical spec

const technicalChecks = {
  errorHandling: {
    pass: false,
    issues: [
      "Missing try-catch in async function login.tsx:45"
    ]
  },
  
  logging: {
    pass: false,
    issues: [
      "No structured logging in auth flow"
    ]
  },
  
  monitoring: {
    pass: true,
    issues: []
  }
};
```

---

### Phase 3: Design System Review

**Task:** Check design system compliance

#### 3A: Component Usage

```typescript
// Check against Step 6 design system

const designChecks = {
  components: {
    pass: false,
    issues: [
      "Using <button> instead of <Button> component (login.tsx:78)"
    ]
  },
  
  tokens: {
    pass: false,
    issues: [
      "Hardcoded color #3B82F6 instead of token (login.tsx:12)",
      "Magic number spacing 16px instead of space-4 token"
    ]
  },
  
  typography: {
    pass: true,
    issues: []
  }
};
```

**Issues Detected:**
```
🎨 DESIGN SYSTEM VIOLATIONS:

⚠️ Component Standard (MEDIUM)
   File: src/auth/login.tsx:78
   Issue: Using native <button> instead of design system <Button>
   
   Current:
   ```tsx
   <button className="bg-blue-500 px-4 py-2" onClick={handleLogin}>
     Login
   </button>
   ```
   
   Should Be:
   ```tsx
   <Button variant="primary" onClick={handleLogin}>
     Login
   </Button>
   ```
   
   Why: Design system ensures consistency and accessibility
   Violates: DESIGN-SYSTEM.md "Component Standards"
   Priority: SHOULD FIX

❌ Token Violation (HIGH)
   File: src/auth/login.tsx:12
   Issue: Hardcoded color value
   
   Current:
   ```css
   .login-form {
     background: #3B82F6;  /* Hardcoded! */
     padding: 16px;
   }
   ```
   
   Should Be:
   ```css
   .login-form {
     background: var(--color-primary);
     padding: var(--space-4);
   }
   ```
   
   Why: Design tokens enable theming and consistency
   Violates: DESIGN-SYSTEM.md "Design Tokens"
   Priority: MUST FIX
```

---

### Phase 4: State Coverage Review

**Task:** Verify all required states implemented

```typescript
// Check against Step 7 state specs

const stateCoverageChecks = {
  loading: {
    implemented: true,
    location: "login.tsx:89"
  },
  
  success: {
    implemented: true,
    location: "login.tsx:102"
  },
  
  error: {
    implemented: false,
    missing: "Network error state not handled"
  },
  
  empty: {
    implemented: "N/A",
    reason: "Not applicable for login form"
  }
};
```

**Issues Detected:**
```
🔄 STATE COVERAGE ISSUES:

❌ Missing Error State (HIGH)
   Component: LoginForm
   State: Network Error
   Issue: No UI feedback when API call fails
   
   Expected (from STATE-SPEC.md):
   - Show error message
   - Provide retry button
   - Maintain form data
   
   Current Implementation:
   ```tsx
   async function handleLogin() {
     const res = await api.auth.login(email, password);
     // What if network fails? No error state! ❌
     router.push('/dashboard');
   }
   ```
   
   Should Add:
   ```tsx
   async function handleLogin() {
     try {
       setLoading(true);
       const res = await api.auth.login(email, password);
       router.push('/dashboard');
     } catch (error) {
       setError(error.message);      // Show error ✅
       setShowRetry(true);            // Enable retry ✅
     } finally {
       setLoading(false);
     }
   }
   ```
   
   Priority: MUST FIX
   Violates: STATE-SPEC.md "Error State Requirements"
```

---

### Phase 5: Security Review

**Task:** Scan for security vulnerabilities

#### 5A: Common Vulnerabilities

```typescript
const securityChecks = {
  xss: {
    scan: "Cross-Site Scripting",
    issues: []
  },
  
  sqlInjection: {
    scan: "SQL Injection",
    issues: []
  },
  
  authBypass: {
    scan: "Authentication Bypass",
    issues: [
      "Potential auth bypass in dashboard route"
    ]
  },
  
  dataExposure: {
    scan: "Sensitive Data Exposure",
    issues: [
      "Password logged in plaintext"
    ]
  }
};
```

**Issues Detected:**
```
🔒 SECURITY ISSUES:

🚨 CRITICAL: Password Logged (CRITICAL)
   File: src/auth/login.tsx:56
   Issue: Password logged to console in production
   
   Current:
   ```typescript
   console.log('Logging in with:', { email, password }); // ❌ DANGER!
   ```
   
   Should Be:
   ```typescript
   // Remove entirely, or:
   if (process.env.NODE_ENV === 'development') {
     console.log('Logging in with:', { email, password: '***' });
   }
   ```
   
   Risk: Passwords exposed in production logs
   Severity: CRITICAL
   Priority: FIX IMMEDIATELY

❌ Auth Bypass Risk (HIGH)
   File: src/pages/dashboard.tsx:12
   Issue: No authentication check on protected route
   
   Current:
   ```typescript
   export default function Dashboard() {
     // No auth check! ❌
     return <DashboardContent />;
   }
   ```
   
   Should Be:
   ```typescript
   export default function Dashboard() {
     const { user, loading } = useAuth();
     
     if (loading) return <LoadingState />;
     if (!user) return <Redirect to="/login" />;
     
     return <DashboardContent />;
   }
   ```
   
   Risk: Unauthorized access to protected data
   Severity: HIGH
   Priority: MUST FIX
```

#### 5B: Best Practices

```
🔐 SECURITY BEST PRACTICES:

✅ GOOD: Using bcrypt for password hashing
✅ GOOD: CSRF tokens present
✅ GOOD: Rate limiting on login endpoint
⚠️ CONSIDER: Add MFA support for sensitive accounts
⚠️ CONSIDER: Implement session timeout (30min)
```

---

### Phase 6: Performance Review

**Task:** Identify performance issues

```typescript
const performanceChecks = {
  bundleSize: {
    added: "+45KB",
    threshold: "50KB",
    pass: true
  },
  
  rendering: {
    issues: [
      "Unnecessary re-renders in LoginForm",
      "Missing React.memo on EmailInput"
    ]
  },
  
  dataFetching: {
    issues: [
      "N+1 query problem in user lookup"
    ]
  },
  
  caching: {
    issues: []
  }
};
```

**Issues Detected:**
```
⚡ PERFORMANCE ISSUES:

⚠️ Unnecessary Re-renders (MEDIUM)
   File: src/auth/LoginForm.tsx:23
   Issue: Form re-renders on every keystroke
   
   Current:
   ```tsx
   function LoginForm({ onSubmit }) {  // New function every render!
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     
     return (
       <form onSubmit={() => onSubmit(email, password)}>
   ```
   
   Should Be:
   ```tsx
   const LoginForm = React.memo(({ onSubmit }) => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     
     const handleSubmit = useCallback(() => {
       onSubmit(email, password);
     }, [email, password, onSubmit]);
     
     return (
       <form onSubmit={handleSubmit}>
   ```
   
   Impact: 60fps → 45fps during typing
   Priority: SHOULD FIX

❌ N+1 Query (HIGH)
   File: src/auth/session.ts:89
   Issue: Loading user data + permissions in separate queries
   
   Current:
   ```typescript
   const user = await db.users.findUnique({ where: { id } });
   const permissions = await db.permissions.findMany({ where: { userId: id } });
   // 2 queries! ❌
   ```
   
   Should Be:
   ```typescript
   const user = await db.users.findUnique({
     where: { id },
     include: { permissions: true }  // 1 query! ✅
   });
   ```
   
   Impact: 200ms → 50ms login time
   Priority: MUST FIX
```

---

### Phase 7: Code Quality Review

**Task:** Assess maintainability and best practices

```typescript
const qualityChecks = {
  complexity: {
    high: [
      "handleLogin() has cyclomatic complexity 15 (threshold: 10)"
    ]
  },
  
  duplication: {
    issues: [
      "Email validation logic duplicated 3 times"
    ]
  },
  
  naming: {
    issues: [
      "Variable 'x' is not descriptive (login.tsx:67)"
    ]
  },
  
  testing: {
    coverage: 78,  // Below 80% threshold
    issues: [
      "No tests for error scenarios"
    ]
  },
  
  documentation: {
    issues: [
      "Missing JSDoc for public API login()"
    ]
  }
};
```

**Issues Detected:**
```
📊 CODE QUALITY ISSUES:

⚠️ High Complexity (MEDIUM)
   Function: handleLogin()
   File: src/auth/login.tsx:45
   Complexity: 15 (threshold: 10)
   Issue: Too many nested conditionals
   
   Suggestion: Extract helper functions:
   - validateCredentials()
   - checkRateLimit()
   - performLogin()
   - handleSuccess()
   - handleError()
   
   Priority: SHOULD FIX

⚠️ Code Duplication (MEDIUM)
   Pattern: Email validation
   Locations:
   - login.tsx:23
   - register.tsx:45
   - forgot-password.tsx:12
   
   Should Be:
   ```typescript
   // utils/validation.ts
   export function validateEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   }
   ```
   
   Priority: SHOULD FIX

❌ Test Coverage Below Threshold (HIGH)
   Coverage: 78% (target: 80%)
   Missing Tests:
   - Error scenarios (network failure)
   - Edge cases (empty email)
   - State transitions
   
   Priority: MUST FIX before merge
```

---

### Phase 8: Review Report Generation

**Task:** Create comprehensive review report

**File:** `/docs/reviews/F1-PR-REVIEW-2025-12-28.md`

```markdown
# PR Review: F1 - Authentication System

**Reviewer:** Cursor (Staff Engineer Level)  
**Date:** 2025-12-28 17:30  
**PRD:** F1-auth  
**Status:** ⚠️ CHANGES REQUESTED (Score: 72/100 - Grade C)

---

## 📊 Review Summary

### Overall Assessment
**❌ NOT APPROVED - Changes Required**

**Why:** 2 critical security issues and 3 must-fix architecture violations prevent approval. Code quality is generally good, but critical issues must be resolved.

**Estimated Fix Time:** 3-4 hours

---

## 📈 Review Score: 72/100 (Grade C)

```
Review Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Architecture       [███████░░░] 70% × 20% = 14pts
Design System      [██████░░░░] 60% × 15% = 9pts
State Coverage     [███████░░░] 70% × 15% = 10.5pts
Security           [█████░░░░░] 50% × 25% = 12.5pts ❌
Performance        [████████░░] 80% × 15% = 12pts
Code Quality       [████████░░] 80% × 10% = 8pts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE:                              72pts
```

**Approval Threshold:** 80/100  
**Current Score:** 72/100  
**Gap:** 8 points

---

## 🚨 Critical Issues (Must Fix Before Merge)

### 1. Password Logged in Production (SECURITY - CRITICAL)
**File:** `src/auth/login.tsx:56`  
**Severity:** 🔴 CRITICAL

**Issue:**
```typescript
console.log('Logging in with:', { email, password }); // ❌
```

**Fix:**
```typescript
// Remove entirely
```

**Why Critical:** Exposes user passwords in production logs. This is a data breach waiting to happen.

---

### 2. Auth Bypass Risk (SECURITY - HIGH)
**File:** `src/pages/dashboard.tsx:12`  
**Severity:** 🔴 HIGH

**Issue:** No authentication check on protected route

**Fix:**
```typescript
export default function Dashboard() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingState />;
  if (!user) return <Redirect to="/login" />;
  
  return <DashboardContent />;
}
```

---

### 3. N+1 Query Problem (PERFORMANCE - HIGH)
**File:** `src/auth/session.ts:89`  
**Severity:** 🟠 HIGH

**Impact:** 200ms → 50ms with fix (75% improvement)

**Fix:** Use `include` in Prisma query (see details above)

---

## ⚠️ Non-Blocking Issues (Should Fix)

[Lists 8 medium-priority issues]

---

## ✅ What's Good

- Clean code structure overall
- Good naming conventions
- Proper TypeScript usage
- Loading states implemented
- CSRF protection in place

---

## 📊 Detailed Checklist

### Architecture ✅❌
- [x] Follows layered architecture (mostly)
- [ ] Dependencies flow correctly (1 violation)
- [x] API contracts followed
- [x] No circular dependencies

### Design System ✅⚠️
- [ ] Uses design system components (2 violations)
- [ ] Uses design tokens (3 violations)
- [x] Typography standards met
- [x] Responsive design implemented

### State Coverage ✅❌
- [x] Loading state
- [x] Success state
- [ ] Error state (missing network error)
- [x] Empty state (N/A)

### Security ❌❌
- [ ] No secrets in code (password logging!)
- [ ] Auth checks on protected routes (missing!)
- [x] Input validation
- [x] CSRF protection
- [x] SQL injection prevention

### Performance ✅⚠️
- [x] Bundle size acceptable
- [ ] No N+1 queries (1 found)
- [ ] Optimized renders (2 issues)
- [x] Caching implemented

### Code Quality ✅⚠️
- [ ] Test coverage ≥80% (currently 78%)
- [ ] No high complexity (1 function)
- [ ] No code duplication (3 instances)
- [x] Descriptive naming (mostly)
- [ ] JSDoc for public APIs (1 missing)

---

## 🎯 Action Items

### Priority 1: Fix Before Merge (BLOCKING)
1. ❌ Remove password logging (1 min)
2. ❌ Add auth check to dashboard (5 min)
3. ❌ Fix N+1 query (10 min)

### Priority 2: Should Fix (RECOMMENDED)
4. ⚠️ Add network error state (30 min)
5. ⚠️ Use design system Button (15 min)
6. ⚠️ Replace hardcoded colors with tokens (20 min)
7. ⚠️ Add missing tests for 80% coverage (1 hour)

### Priority 3: Nice to Have (OPTIONAL)
8. ⚡ Optimize LoginForm renders (30 min)
9. ⚡ Extract validation helpers (15 min)
10. ⚡ Reduce handleLogin() complexity (45 min)

---

## 🚦 Approval Status

**Status:** ❌ CHANGES REQUESTED

**Next Steps:**
1. Fix 3 critical issues (Priority 1)
2. Re-request review
3. After approval → Merge

**Estimated Time to Approval:** 3-4 hours

---

*Generated by /pr-review on 2025-12-28 17:30*  
*Reviewer: Cursor (Staff Engineer)*  
*Review Standards: Sigma Architecture + Security + Performance*
```

---

### Phase 9: Tracking Update

```json
// Update: .tracking-db/prds/F1-auth.json
{
  "reviews": {
    "pr_review": {
      "status": "changes_requested",
      "score": 72,
      "grade": "C",
      "reviewer": "cursor-staff-engineer",
      "date": "2025-12-28T17:30:00Z",
      "report_path": "/docs/reviews/F1-PR-REVIEW-2025-12-28.md",
      "critical_issues": 3,
      "blocking_issues": 3,
      "approved": false,
      "categories": {
        "architecture": 70,
        "design_system": 60,
        "state_coverage": 70,
        "security": 50,
        "performance": 80,
        "code_quality": 80
      }
    }
  }
}
```

---

## 📤 Outputs

### Files Created

1. **Review Report**
   - `/docs/reviews/[PRD-ID]-PR-REVIEW-YYYY-MM-DD.md`

2. **Issue Annotations**
   - Inline code comments (if supported)

### Files Updated

- `.tracking-db/prds/[PRD-ID].json` - Review status

---

## 🎯 Success Criteria

- ✅ All files reviewed
- ✅ Architecture compliance checked
- ✅ Design system violations identified
- ✅ State coverage verified
- ✅ Security scan complete
- ✅ Performance issues found
- ✅ Code quality assessed
- ✅ Review score calculated (0-100)
- ✅ Approval decision made

**Approval Threshold:** 80/100 (configurable with --strict)

---

## 💡 Tips

### Run Before Requesting Review

```bash
# Self-review before asking team
/pr-review --prd-id=F1

# Fix issues
# Re-review
/pr-review --prd-id=F1

# When score ≥80 → Ready for team review
```

### Focus on Specific Areas

```bash
# Quick security check
/pr-review --prd-id=F1 --focus=security

# Performance only
/pr-review --prd-id=F1 --focus=performance
```

### Use in CI/CD

```yaml
# .github/workflows/pr-review.yml
- name: Automated PR Review
  run: |
    cursor /pr-review --prd-id=${{ matrix.prd }} --strict
```

---

*Part of Sigma Review Workflows - Phase 3*

