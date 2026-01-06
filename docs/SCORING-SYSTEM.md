# SSS Protocol Scoring System

**Version:** 1.0.0  
**Last Updated:** 2026-01-05

Quality scoring methodology used across SSS Protocol commands.

---

## Overview

SSS Protocol uses a consistent 0-100 scoring system to measure quality and completion across all verification commands.

## Score Ranges

| Range | Status | Action |
|-------|--------|--------|
| **90-100** | ✅ Excellent | Ship-ready |
| **80-89** | ✅ Good | Minor improvements recommended |
| **70-79** | ⚠️ Acceptable | Address issues before shipping |
| **60-69** | ⚠️ Needs Work | Significant gaps to address |
| **0-59** | ❌ Failing | Major rework required |

**Threshold:** Commands target **80+** score before proceeding.

---

## Scoring Categories

### 1. Implementation Completeness (40 points)

| Criteria | Points |
|----------|--------|
| All acceptance criteria met | 15 |
| All required files exist | 10 |
| All routes/endpoints implemented | 10 |
| No placeholder code | 5 |

### 2. Code Quality (25 points)

| Criteria | Points |
|----------|--------|
| Type safety (no `any`, no `@ts-ignore`) | 8 |
| Error handling (try/catch, error boundaries) | 7 |
| No console.log in production | 5 |
| No TODO/FIXME in production | 5 |

### 3. Test Coverage (15 points)

| Criteria | Points |
|----------|--------|
| Unit tests exist | 5 |
| Integration tests exist | 5 |
| Tests pass | 5 |

### 4. Security (10 points)

| Criteria | Points |
|----------|--------|
| No hardcoded secrets | 4 |
| Auth checks on protected routes | 3 |
| Input validation present | 3 |

### 5. Documentation (10 points)

| Criteria | Points |
|----------|--------|
| README exists and is current | 4 |
| API documentation exists | 3 |
| Inline comments for complex logic | 3 |

---

## Commands Using This System

| Command | Scoring Focus |
|---------|---------------|
| `@verify-prd` | PRD implementation completeness |
| `@gap-analysis` | Post-implementation gaps |
| `@holes` | Pre-implementation gaps |
| `@step-verify` | Step completion status |
| `@security-audit` | Security posture |
| `@accessibility-audit` | WCAG compliance |
| `@performance-check` | Performance metrics |
| `@code-quality-report` | Code quality metrics |

---

## Gap Score (Post-Implementation)

Used by `@gap-analysis`:

```
Gap Score = 100 - (Critical × 50) - (High × 10) - (Medium × 2)
```

| Gap Severity | Point Deduction |
|--------------|-----------------|
| Critical | -50 per gap |
| High | -10 per gap |
| Medium | -2 per gap |
| Low | 0 |

---

## Epistemic Confidence

Tier 2 commands also emit an **Epistemic Confidence** score:

```
Confidence = (Verified Claims / Total Claims) × 100
```

This tracks how many external claims (APIs, patterns, behaviors) were verified using MCP tools like Exa and Ref.

---

## Related

- [WORKFLOW-OVERVIEW.md](WORKFLOW-OVERVIEW.md) - Complete workflow
- [COMMANDS.md](COMMANDS.md) - Command catalog
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Quick reference

