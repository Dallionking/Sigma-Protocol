---
name: quality-gates
description: "Apply quality gate standards for git hooks, testing, CI/CD, and automation using Lefthook, Vitest, GitHub Actions, and quality enforcement. Use when setting up quality infrastructure, configuring hooks, discussing automation, or reviewing quality practices."
version: "1.0.0"
source: "community"
triggers:
  - step-0-environment-setup
  - implement-prd
  - ship-check
  - ship-stage
  - ship-prod
  - new-project
---

# Quality Gates Skill

Standards and patterns for maintaining code quality through automated gates, hooks, testing, and continuous integration.

## When to Invoke

Invoke this skill when:

- Setting up new projects (Step 0)
- Configuring git hooks
- Setting up CI/CD pipelines
- Implementing testing infrastructure
- Preparing for deployment (ship-\*)
- Discussing quality automation

---

## Philosophy

**Quality gates prevent problems before they reach production.** Automated checks provide immediate feedback, enforce standards consistently, and free developers to focus on building features.

**Progressive Enforcement:**

- **Pre-commit:** Fast checks (lint, format, typecheck) on staged files only
- **Pre-push:** Comprehensive checks (full test suite, coverage)
- **CI/CD:** Production-ready validation (build, E2E tests, security scans)

---

## Git Hooks: Lefthook (Recommended)

### Why Lefthook over Husky

| Feature     | Lefthook              | Husky             |
| ----------- | --------------------- | ----------------- |
| Language    | Go binary             | Node.js           |
| Speed       | Faster (Go, parallel) | Slower            |
| Config      | YAML (simple)         | Scripts (complex) |
| lint-staged | Built-in              | Separate package  |
| Footprint   | Single binary         | Node dependency   |

### Installation

```bash
# Install
pnpm add -D lefthook

# Initialize
pnpm lefthook install
```

### Configuration: lefthook.yml

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,jsx,tsx}"
      run: pnpm eslint --fix {staged_files}
      stage_fixed: true

    format:
      glob: "*.{js,ts,jsx,tsx,json,md,css}"
      run: pnpm prettier --write {staged_files}
      stage_fixed: true

    typecheck:
      glob: "*.{ts,tsx}"
      run: pnpm tsc --noEmit

pre-push:
  commands:
    test:
      run: pnpm test:ci

    build:
      run: pnpm build

commit-msg:
  commands:
    commitlint:
      run: pnpm commitlint --edit {1}
```

---

## Testing: Vitest

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "**/node_modules/**",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "**/test/**",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
```

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## CI/CD: GitHub Actions

### Basic Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

      - name: Test
        run: pnpm test:ci

      - name: Build
        run: pnpm build

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

### Advanced: E2E + Security

```yaml
# .github/workflows/comprehensive.yml
name: Comprehensive CI

on:
  pull_request:
    branches: [main]

jobs:
  test-matrix:
    name: Test (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps chromium
      - run: pnpm build
      - run: pnpm test:e2e

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=moderate
```

---

## Branch Protection

Configure in GitHub Settings → Branches → Branch protection rules for `main`:

### Required Settings

- [x] Require pull request before merging
- [x] Require approvals: 1
- [x] Require status checks to pass before merging
  - Select: `Quality Checks`, `Test`, `Build`
- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging

### Recommended

- [x] Require signed commits
- [x] Require linear history

---

## Coverage Strategy

### Coverage as Diagnostic, Not Target

**WRONG:** "We need 90% coverage!"
**RIGHT:** "What's not tested? Should it be?"

### Recommended Thresholds

| Code Type                       | Target | Rationale                         |
| ------------------------------- | ------ | --------------------------------- |
| Critical paths (auth, payments) | 90%+   | High risk, must be tested         |
| Business logic                  | 70%+   | Core functionality                |
| UI components                   | 50%+   | Hard to test, diminishing returns |
| Utilities                       | 80%+   | Easy to test, reusable            |
| Config/setup                    | 0%     | Exclude from coverage             |

### codecov.yml

```yaml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 5%
    patch:
      default:
        target: 70%

comment:
  layout: "reach, diff, flags, files"
  behavior: default

ignore:
  - "**/*.test.ts"
  - "**/*.config.ts"
  - "**/test/**"
```

---

## Quality Checklist

### Essential (Must Have)

- [ ] Lefthook configured with pre-commit (lint, format, typecheck)
- [ ] Lefthook configured with pre-push (test, build)
- [ ] GitHub Actions CI with lint, typecheck, test, build
- [ ] Branch protection enabled on main
- [ ] Test framework set up (Vitest)
- [ ] Coverage reporting (Codecov)

### Recommended

- [ ] E2E testing with Playwright
- [ ] Dependency audit in CI
- [ ] Conventional commits (commitlint)
- [ ] Security scanning
- [ ] Preview deployments for PRs

### Nice to Have

- [ ] Matrix testing across Node versions
- [ ] Performance budgets
- [ ] Bundle size tracking
- [ ] Accessibility testing
- [ ] Visual regression testing

---

## Anti-Patterns

| Anti-Pattern               | Why It's Bad             | Better Approach          |
| -------------------------- | ------------------------ | ------------------------ |
| Husky                      | Slower, more complex     | Use Lefthook             |
| Arbitrary coverage targets | Gaming the metric        | Test what matters        |
| Skip hooks routinely       | Defeats the purpose      | Fix the underlying issue |
| CI only on main            | Bugs merge before caught | Test on every PR         |
| No branch protection       | Bypassing quality gates  | Enforce rules            |

---

## Integration with SSS Protocol

### Step 0 (Environment Setup)

Set up quality infrastructure at project start.

### @implement-prd

Ensure quality gates pass before considering implementation complete.

### @ship-check, @ship-stage, @ship-prod

Run quality gates before any deployment.

### @new-project

Include quality gate configuration in project scaffolding.

---

_Remember: Quality gates are not bureaucracy—they're automation that protects you. Fast feedback loops catch issues early when they're cheap to fix._
