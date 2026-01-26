---
name: systematic-debugging
description: "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Provides structured approach to identify root causes systematically."
version: "1.0.0"
source: "@obra/superpowers"
triggers:
  - bug-fix
  - test-failure
  - error-investigation
  - ui-healer
  - implement-prd
---

# Systematic Debugging Skill

Use this skill when encountering any bug, test failure, or unexpected behavior, **before proposing fixes**. This prevents shotgun debugging and ensures you find the actual root cause.

## When to Invoke

Invoke this skill when:

- A test fails unexpectedly
- User reports a bug
- Code doesn't behave as expected
- Error messages appear
- Performance degrades
- After 2+ failed fix attempts

---

## The Debugging Framework

### Step 1: Reproduce and Observe

Before analyzing, confirm you can reproduce the issue:

```markdown
## Reproduction

**Steps to reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior:** [What should happen]
**Actual behavior:** [What actually happens]

**Reproducibility:** [Always / Sometimes / Rare]
**Environment:** [Browser, Node version, OS, etc.]
```

**Critical Questions:**

- Can you reproduce it consistently?
- Does it happen in all environments?
- When did it start happening?
- What changed recently?

### Step 2: Gather Evidence

Collect all relevant information before hypothesizing:

```markdown
## Evidence

**Error messages:**
```

[Exact error text]

```

**Stack trace:**
```

[Full stack trace]

```

**Relevant logs:**
```

[Log output around the time of issue]

```

**Related code:**
- File: [path]
- Lines: [range]
- Recent changes: [git blame / history]
```

### Step 3: Form Hypotheses

Generate multiple possible causes (don't stop at the first one):

```markdown
## Hypotheses

| #   | Hypothesis | Evidence For          | Evidence Against         | Likelihood   |
| --- | ---------- | --------------------- | ------------------------ | ------------ |
| 1   | [Cause A]  | [Supporting evidence] | [Contradicting evidence] | High/Med/Low |
| 2   | [Cause B]  | [Supporting evidence] | [Contradicting evidence] | High/Med/Low |
| 3   | [Cause C]  | [Supporting evidence] | [Contradicting evidence] | High/Med/Low |
```

**Hypothesis Generation Techniques:**

- **What changed?** Recent commits, dependencies, config
- **What's different?** Environments, data, timing
- **What assumptions might be wrong?** Types, state, order of operations
- **What boundaries are being crossed?** Null, undefined, empty, overflow

### Step 4: Test Hypotheses

Test each hypothesis systematically, starting with highest likelihood:

```markdown
## Investigation

### Testing Hypothesis 1: [Name]

**Test method:** [How you'll verify or disprove]

**Test result:** [What you found]

**Conclusion:** [Confirmed / Disproved / Inconclusive]

---

### Testing Hypothesis 2: [Name]

**Test method:** [How you'll verify or disprove]

**Test result:** [What you found]

**Conclusion:** [Confirmed / Disproved / Inconclusive]
```

**Testing Techniques:**

- Add logging at key points
- Use debugger breakpoints
- Simplify/isolate the problem
- Binary search (comment out half the code)
- Check with minimal reproduction case

### Step 5: Root Cause Analysis

Once you find the issue, understand WHY it happened:

```markdown
## Root Cause

**What:** [Technical description of the bug]

**Why:** [Why the code behaves this way]

**How it got there:** [How this bug was introduced]

**Why it wasn't caught:** [Gap in testing/review]
```

### Step 6: Fix and Verify

Only now do you propose a fix:

````markdown
## Fix

**Proposed change:**

```diff
- [old code]
+ [new code]
```
````

**Why this fixes it:** [Explanation]

**Potential side effects:** [What else might be affected]

**Verification:**

- [ ] Original issue no longer reproduces
- [ ] Related tests pass
- [ ] No new warnings/errors
- [ ] Edge cases handled

````

### Step 7: Prevent Recurrence

Add safeguards to prevent similar issues:

```markdown
## Prevention

**Tests added:**
- [ ] Unit test for this specific case
- [ ] Integration test if needed

**Documentation:**
- [ ] Code comments explaining the fix
- [ ] Update relevant docs if needed

**Process improvements:**
- [ ] Consider adding type guards
- [ ] Consider validation at boundaries
- [ ] Consider error handling improvements
````

---

## Quick Debug Template

For simpler issues, use this condensed format:

```markdown
## Quick Debug: [Issue]

**Symptom:** [What's happening]
**Repro:** [Minimal steps]
**Evidence:** [Error/logs]

**Hypotheses:**

1. [Most likely cause]
2. [Alternative cause]

**Investigation:**

- Checked [X] -> Found [Y]
- Tested [A] -> Result [B]

**Root cause:** [What's actually wrong]
**Fix:** [Code change]
**Test:** [How to verify]
```

---

## Common Bug Patterns

### Type-Related

- Null/undefined access
- Type coercion surprises
- Missing type guards at boundaries

### State-Related

- Race conditions
- Stale closures
- Mutation side effects
- Missing state updates

### Async-Related

- Missing await
- Unhandled promise rejections
- Order of operations
- Timeout issues

### Data-Related

- Empty arrays/objects
- Missing properties
- Unexpected data shapes
- Encoding issues

### Environment-Related

- Missing environment variables
- Different Node/browser versions
- Caching issues
- Build vs development differences

---

## Debugging Commands Cheat Sheet

```bash
# Git: What changed recently?
git log --oneline -20
git diff HEAD~5 -- path/to/file
git blame path/to/file

# Node: Debug mode
NODE_OPTIONS='--inspect' npm run dev
node --inspect-brk script.js

# Network: Check requests
# Browser DevTools > Network tab
# Look for failed requests, unexpected payloads

# React: Component debugging
# React DevTools > Components tab
# Check props, state, hooks values

# Database: Check data
# Query the database directly
# Compare expected vs actual data
```

---

## Anti-Patterns

**DON'T:**

- Make random changes hoping something works (shotgun debugging)
- Assume you know the cause without evidence
- Skip reproduction steps
- Fix symptoms without finding root cause
- Forget to add tests after fixing

**DO:**

- Reproduce first, always
- Gather evidence before hypothesizing
- Test hypotheses systematically
- Understand the root cause
- Verify the fix and add tests

---

## Integration with Sigma Protocol

### @ui-healer

Use this skill to diagnose UI issues before applying fixes.

### @implement-prd

When bugs appear during implementation, stop and debug systematically.

### dev-loop

Integrate debugging as a standard step when issues arise.

---

_Remember: A bug you understand is a bug you can fix correctly. A bug you guess at is a bug that will return._
