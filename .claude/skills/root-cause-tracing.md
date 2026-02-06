---
name: root-cause-tracing
description: "Trace bugs to true root cause using 5 Whys methodology. Separate symptoms from causes, avoid symptom-fixing anti-patterns."
version: "1.0.0"
tags: [debugging, root-cause, 5-whys, investigation, quality]
triggers:
  - root-cause
  - 5-whys
  - why analysis
  - symptom vs cause
  - recurring bug
  - bug keeps coming back
  - deep debugging
user-invocable: false
---

# Root Cause Tracing

This skill applies the **5 Whys methodology** to trace problems back to their true root cause. Symptoms are what you see; causes are what you fix. Fix symptoms and bugs return. Fix causes and bugs stay dead.

## Overview

Root cause tracing is a disciplined investigation technique from Toyota's manufacturing system, adapted for software debugging. It prevents the costly cycle of:

```
Bug appears → Fix symptom → Bug returns → Fix symptom → Bug returns...
```

This skill teaches you to break that cycle.

---

## When to Use This Skill

Invoke this skill when:

- A bug has been "fixed" multiple times
- You're unsure why a fix works
- The error message doesn't explain the problem
- Multiple symptoms appear related
- A fix in one place breaks something else
- Stakeholders ask "but WHY did this happen?"

---

## The 5 Whys Methodology

### Core Concept

Ask "Why?" repeatedly until you reach a root cause that, if fixed, prevents recurrence.

```markdown
## Template

**Problem:** [Observable symptom]

**Why #1:** Why is [symptom] happening?
→ Because [immediate cause]

**Why #2:** Why is [immediate cause] happening?
→ Because [deeper cause]

**Why #3:** Why is [deeper cause] happening?
→ Because [even deeper cause]

**Why #4:** Why is [even deeper cause] happening?
→ Because [systemic cause]

**Why #5:** Why is [systemic cause] happening?
→ Because [root cause]

**Root Cause:** [The fixable origin]
```

### Practical Example: API Timeout

```markdown
**Problem:** Users see "Request Timeout" errors on dashboard

**Why #1:** Why are requests timing out?
→ Because the API takes >30 seconds to respond

**Why #2:** Why does the API take 30+ seconds?
→ Because the database query is slow

**Why #3:** Why is the database query slow?
→ Because it's scanning millions of rows without an index

**Why #4:** Why is there no index?
→ Because the table grew unexpectedly and no one noticed

**Why #5:** Why did no one notice?
→ Because we have no monitoring for table size or query performance

**Root Cause:** Missing database monitoring and indexing review process

**Fix:** Add index + Add monitoring + Add quarterly index review
```

---

## Symptom vs Cause Separation

### Recognizing Symptoms

Symptoms are **observable effects**, not origins:

| Type | Symptoms (Don't fix these alone) |
|------|----------------------------------|
| Error messages | "Cannot read property of undefined" |
| User reports | "The button doesn't work" |
| Metrics | "Response time increased 400%" |
| Exceptions | "OutOfMemoryError" |
| Behaviors | "Data is missing from the report" |

### Recognizing Causes

Causes are **origin points** that, when fixed, eliminate symptoms:

| Type | Causes (Fix these) |
|------|-------------------|
| Logic errors | Missing null check before access |
| Design flaws | Wrong data structure for use case |
| Missing validation | Accepting invalid input |
| Race conditions | Concurrent access without locks |
| Configuration | Wrong timeout values |

### The Distinction Test

Ask yourself:

> "If I fix this, will the problem come back under different circumstances?"

- **Yes** → You're fixing a symptom
- **No** → You're fixing the root cause

---

## Trace-Back Workflow

### Step 1: Document the Observable

```markdown
## Initial Observation

**What happened:** [Exact symptom observed]
**When:** [Timestamp, conditions]
**Where:** [File, line, component]
**Who reported:** [User, test, monitoring]
**Frequency:** [Always, sometimes, once]
```

### Step 2: Gather the Evidence Chain

Collect artifacts that form a path from symptom to cause:

```markdown
## Evidence Chain

1. **Error message:** "Cannot read property 'name' of undefined"
2. **Stack trace:**
   - UserProfile.tsx:42
   - Dashboard.tsx:108
   - App.tsx:25
3. **Related logs:**
   - API returned 200 but empty body
   - Auth token was expired
4. **Recent changes:**
   - Commit abc123: Changed auth flow
5. **Reproduction:**
   - Login with expired token
   - Navigate to dashboard
   - Component crashes
```

### Step 3: Apply the 5 Whys

Start from the symptom and work backward:

```markdown
## 5 Whys Analysis

**Problem:** UserProfile component crashes

**Why #1:** Why does it crash?
→ user.name is accessed but user is undefined

**Why #2:** Why is user undefined?
→ The API returned empty body, parsed as undefined

**Why #3:** Why did API return empty body?
→ Auth token was expired, server returned 401

**Why #4:** Why wasn't 401 handled?
→ Error handler only checks for 500s

**Why #5:** Why does error handler miss 401s?
→ Auth flow was refactored without updating error handling

**Root Cause:** Auth refactor didn't update downstream error handling
```

### Step 4: Validate the Root Cause

Confirm you've found the root cause:

```markdown
## Root Cause Validation

**Proposed root cause:** Auth refactor missed error handling update

**Validation questions:**
1. Does fixing this prevent the original symptom? ✅
2. Does it prevent similar symptoms elsewhere? ✅
3. Is there a deeper "why" to ask? ❌ (This is the origin point)
4. Would this have been caught by a reasonable process? ✅ (Better test coverage)

**Confidence:** High - This is the root cause
```

### Step 5: Design the Fix

Fix at the right level:

```markdown
## Fix Design

**Root cause fix:**
- Update error handler to catch 4xx errors
- Add auth refresh flow on 401
- Add test coverage for auth error scenarios

**Symptom mitigation (temporary):**
- Add null check to prevent crash while fix deploys

**Prevention (process):**
- Add "error handling review" to PR checklist
- Add integration tests for auth failure scenarios
```

### Step 6: Verify the Fix

```markdown
## Verification

- [ ] Original symptom no longer reproducible
- [ ] Similar scenarios handled correctly
- [ ] No regression in related functionality
- [ ] Tests added to prevent recurrence
- [ ] Documentation updated if needed
```

---

## Examples

### Example 1: Memory Leak

```markdown
**Problem:** Application memory grows until OOM crash

**Why #1:** Why does memory grow?
→ Objects aren't being garbage collected

**Why #2:** Why aren't they collected?
→ Event listeners hold references to component instances

**Why #3:** Why do listeners hold references?
→ Listeners aren't removed on component unmount

**Why #4:** Why aren't they removed?
→ useEffect cleanup function is missing

**Why #5:** Why is cleanup missing?
→ Developer wasn't aware useEffect needs cleanup for subscriptions

**Root Cause:** Knowledge gap about useEffect cleanup patterns

**Fix:**
1. Add cleanup to this useEffect
2. Add ESLint rule to catch missing cleanup
3. Add useEffect cleanup to team training materials
```

### Example 2: Data Corruption

```markdown
**Problem:** User addresses sometimes have wrong ZIP codes

**Why #1:** Why are ZIP codes wrong?
→ ZIP for User A appears on User B's address

**Why #2:** Why does data cross users?
→ Database update affects wrong row

**Why #3:** Why does it update wrong row?
→ WHERE clause uses stale ID from previous operation

**Why #4:** Why is the ID stale?
→ ID variable is reused across async operations without reset

**Why #5:** Why is it reused?
→ Function scope isn't isolated; closure captures mutable variable

**Root Cause:** Mutable variable in closure causes race condition

**Fix:**
1. Use const with unique IDs per operation
2. Add database transaction isolation
3. Add unit test for concurrent operations
```

### Example 3: Flaky Test

```markdown
**Problem:** Test passes locally, fails in CI (intermittently)

**Why #1:** Why does it fail in CI?
→ Assertion fires before data loads

**Why #2:** Why is data not loaded?
→ Mock server responds slower in CI

**Why #3:** Why does speed matter?
→ Test uses setTimeout instead of waiting for condition

**Why #4:** Why setTimeout?
→ Developer didn't know about waitFor/polling patterns

**Why #5:** Why didn't they know?
→ No testing guidelines in project docs

**Root Cause:** Missing testing patterns documentation

**Fix:**
1. Replace setTimeout with waitFor polling
2. Add "Testing Patterns" guide to project docs
3. Add ESLint rule to discourage setTimeout in tests
```

---

## Anti-Patterns: Fixing Symptoms

### Anti-Pattern 1: The Band-Aid

```javascript
// ❌ SYMPTOM FIX: Just prevents the crash
function getUser(id) {
  const user = users.find(u => u.id === id);
  return user || { name: 'Unknown' }; // Hides the real problem!
}

// ✅ ROOT CAUSE FIX: Understand why user is missing
function getUser(id) {
  const user = users.find(u => u.id === id);
  if (!user) {
    logger.error(`User ${id} not found - possible data sync issue`);
    throw new UserNotFoundError(id);
  }
  return user;
}
```

### Anti-Pattern 2: The Retry Loop

```javascript
// ❌ SYMPTOM FIX: Just retries until it works
async function fetchData() {
  for (let i = 0; i < 10; i++) {
    try {
      return await api.getData();
    } catch {
      await sleep(1000); // Hope it works next time!
    }
  }
}

// ✅ ROOT CAUSE FIX: Understand why it fails
async function fetchData() {
  try {
    return await api.getData();
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      // Handle rate limiting properly
      await sleep(error.retryAfter);
      return await api.getData();
    }
    throw error; // Don't hide unknown errors
  }
}
```

### Anti-Pattern 3: The Silence

```javascript
// ❌ SYMPTOM FIX: Just swallows the error
try {
  await riskyOperation();
} catch {
  // Ignore - probably fine
}

// ✅ ROOT CAUSE FIX: Handle or propagate meaningfully
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ExpectedError) {
    return handleExpected(error);
  }
  throw error; // Unknown errors must surface
}
```

### Anti-Pattern 4: The Timeout Bump

```javascript
// ❌ SYMPTOM FIX: Just make timeout longer
const config = {
  timeout: 60000, // Was 10000, then 30000, now 60000...
};

// ✅ ROOT CAUSE FIX: Find why it's slow
// After investigation: Query was doing full table scan
// Added index, now responds in <100ms
```

---

## Checklist: Root Cause Verification

Before declaring a root cause found:

- [ ] Asked at least 5 "Why?" questions
- [ ] Reached an actionable origin point
- [ ] Validated fix prevents recurrence, not just this instance
- [ ] Considered systemic/process causes, not just code causes
- [ ] No more meaningful "Why?" questions to ask
- [ ] Fix doesn't just mask the symptom
- [ ] Added tests to prevent regression
- [ ] Documented the finding for team learning

---

## Integration with Sigma Protocol

### With systematic-debugging

Use systematic-debugging to gather evidence, then this skill to trace to root cause:

```
systematic-debugging (observe, hypothesize)
    ↓
root-cause-tracing (5 Whys analysis)
    ↓
verification-before-completion (confirm fix)
```

### With verification-before-completion

After tracing root cause, use verification to confirm:

1. Root cause fix eliminates symptom
2. No regression introduced
3. Similar scenarios now handled

### With condition-based-waiting

Many root causes involve timing issues. Use condition-based-waiting patterns in your fix.

---

*Remember: Every symptom you fix is a bug that will return. Every root cause you fix is a bug that stays dead. Invest the time to trace to the true origin.*
