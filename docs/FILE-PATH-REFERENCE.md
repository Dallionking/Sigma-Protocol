# Sigma File Path Reference

**Version:** 1.0.0-alpha.1
**Last Updated:** 2026-02-04
**Purpose:** Canonical list of all file paths used across the Sigma workflow

**Changelog:**
- 3.0: Added tracking, QA, and review system paths
- 2.0: Added Step 4 flow tree paths

---

## Overview

This document defines the **official file paths** for all outputs created by the Sigma workflow (Steps 0-12). All commands MUST reference these exact paths to ensure consistency and prevent broken references.

**Rule:** If a command references a file path not listed here, it's an error that needs to be fixed.

---

## Step Outputs (Canonical Paths)

### Step 0: Environment Setup
**Command:** `@step-0-environment-setup`
**Outputs:** No persistent files (validation only)

### Step 1: Ideation
**Command:** `@step-1-ideation`
**Outputs:**
- `/docs/stack-profile.json` ⭐ CRITICAL
- `/docs/specs/MASTER_PRD.md`
- `/docs/specs/FEATURES.md`
- `/docs/specs/USP.md`
- `/docs/specs/NFRS.md`
- `/docs/specs/DEV-READINESS.md`
- `/docs/ops/SUCCESS-METRICS.md`

### Step 2: Architecture
**Command:** `@step-2-architecture`
**Outputs:**
- `/docs/architecture/ARCHITECTURE.md`
- `/docs/database/SCHEMA.md`
- `/docs/api/API-SPEC.md`
- `/docs/security/SECURITY.md`

### Step 3: UX Design
**Command:** `@step-3-ux-design`
**Outputs:**
- `/docs/ux/UX-DESIGN.md` ⭐ PRIMARY
- `/docs/design/INSPIRATION.md`
- `/docs/design/EXTRACTED-PATTERNS.md`
- `/docs/journeys/USER-JOURNEYS.md`
- `/docs/journeys/STATE-COVERAGE.md`
- `/docs/ux/WIREFRAMES.md`

### Step 4: Flow Tree & Screen Architecture ✨ NEW
**Command:** `@step-4-flow-tree`
**Outputs:**
- `/docs/flows/FLOW-TREE.md` ⭐ PRIMARY
- `/docs/flows/SCREEN-INVENTORY.md`
- `/docs/flows/FLOW-DIAGRAMS.md`

### Step 5: Wireframe Prototypes
**Command:** `@step-5-wireframe-prototypes`
**Outputs:**
- `/docs/wireframes/WIREFRAME-SPEC.md` ⭐ PRIMARY
- `/docs/wireframes/LANDING-PAGE-WIREFRAME.md`
- `/docs/wireframes/screenshots/[screen-name].png`
- `/docs/prds/flows/FLOW-[ID]-[NAME].md`

### Step 6: Design System
**Command:** `@step-6-design-system`
**Outputs:**
- `/docs/design/DESIGN-SYSTEM.md` ⭐ PRIMARY
- `/docs/tokens/DESIGN-TOKENS.md`

### Step 7: Interface States
**Command:** `@step-7-interface-states`
**Outputs:**
- `/docs/states/STATE-SPEC.md` ⭐ PRIMARY
- `/docs/states/MICRO-INTERACTIONS.md`

### Step 8: Technical Specification
**Command:** `@step-8-technical-spec`
**Outputs:**
- `/docs/technical/TECHNICAL-SPEC.md` ⭐ PRIMARY

### Step 9: Landing Page (Optional)
**Command:** `@step-9-landing-page`
**Outputs:**
- `/docs/landing-page/LANDING-PAGE-COPY.md` ⭐ PRIMARY
- `/docs/avatars/PROBLEM-AWARE-AVATAR.md`
- `/docs/avatars/DIARY-ENTRIES.md`

### Step 10: Feature Breakdown
**Command:** `@step-10-feature-breakdown`
**Outputs:**
- `/docs/implementation/FEATURE-BREAKDOWN.md` ⭐ PRIMARY

### Step 11: PRD Generation
**Command:** `@step-11-prd-generation`
**Outputs:**
- `/docs/prds/F[N]-[FEATURE-NAME].md`

### Step 12: Context Engine
**Command:** `@step-12-context-engine`
**Outputs:**
- `.cursorrules`
- `.cursor/rules/*.mdc`

### Codex Integration (Optional)
**Command:** `@step-12-context-engine` (plus `sigma install --platform codex`)
**Outputs:**
- `.codex/config.toml` (project config; optional)
- `.codex/rules/*.rules` (Codex execution policy rules; Starlark format)
- `.codex/skills/<skill>/SKILL.md` (Sigma steps and foundation skills)
- `.agents/skills/<skill>/SKILL.md` (Legacy Codex skills fallback)

---

## Audit Command Outputs

### @step-verify
**Command:** `@step-verify --step=N`
**Inputs:** Reads `<verification>` blocks from step command files at:
- `/.cursor/commands/steps/step-[N]-*`

**Outputs:** 
- Console output with 100-point scoring
- Gap analysis with fix recommendations

**Related Paths:**
- Verification schemas embedded in each step command file

### @verify-prd
**Command:** `@verify-prd F[N]`
**Inputs:** PRD files at `/docs/prds/F[N]-*.md`
**Outputs:** Verification score (8+/10 required)

### @analyze
**Command:** `@analyze`
**Outputs:**
- `/docs/reports/ANALYSIS-[DATE].md`

---

## Tracking System Outputs ✨ NEW

> **Note:** The tracking database is stored at the **repository root** (`.tracking-db/`), not under `docs/`. This is machine-generated state that should be in `.gitignore` for most projects.

### /backlog-groom
**Command:** `/backlog-groom`
**Inputs:**
- `/docs/implementation/FEATURE-BREAKDOWN.md` (Step 10)
- `/docs/prds/**/*.md` (Step 11 PRDs)

**Outputs:**
- `/.tracking-db/prds/[ID].json` - One tracking file per PRD
- `/.tracking-db/config.json` - Backlog configuration
- `/.tracking-db/metrics.json` - Backlog metrics
- `/docs/tracking/BACKLOG.md` - Human-readable backlog board

### /sprint-plan
**Command:** `/sprint-plan`
**Inputs:**
- `/docs/tracking/BACKLOG.md`
- `/.tracking-db/prds/*.json`

**Outputs:**
- `/.tracking-db/sprints/sprint-[ID].json` - Sprint tracking
- `/docs/tracking/SPRINT-CURRENT.md` - Sprint board

### /daily-standup
**Command:** `/daily-standup`
**Inputs:**
- `/.tracking-db/sprints/[active-sprint].json`
- `/.tracking-db/prds/*.json`
- Git commit history

**Outputs:**
- `/docs/tracking/history/standups/YYYY-MM-DD.md` - Daily standup report
- Updated `/.tracking-db/sprints/*.json`
- Updated `/.tracking-db/prds/*.json`

### /job-status
**Command:** `/job-status`
**Inputs:** `/.tracking-db/prds/*.json`, `/.tracking-db/sprints/*.json`
**Outputs:** Console output only (read-only query)

---

## QA System Outputs ✨ NEW

### /qa-plan
**Command:** `/qa-plan --prd-id=[ID]`
**Inputs:**
- `/docs/prds/[ID].md` - PRD file
- `/docs/flows/FLOW-TREE.md` (Step 4)
- `/docs/wireframes/screenshots/**/*.png` (Step 5)
- `/docs/states/STATE-SPEC.md` (Step 7)

**Outputs:**
- `/tests/e2e/[PRD-ID].spec.ts` - Playwright E2E tests
- `/tests/visual/[PRD-ID]-visual.spec.ts` - Visual regression tests
- `/docs/qa/checklists/[PRD-ID]-MANUAL-CHECKLIST.md` - Manual test checklist
- `/docs/qa/plans/[PRD-ID]-QA-PLAN.md` - Master QA plan
- `/tests/helpers/*.ts` - Test helper utilities
- `/tests/playwright.config.ts` - Playwright config (if not exists)

### /qa-run
**Command:** `/qa-run --prd-id=[ID]`
**Inputs:**
- `/tests/e2e/[PRD-ID].spec.ts`
- `/tests/visual/[PRD-ID]-visual.spec.ts`
- `/docs/qa/checklists/[PRD-ID]-MANUAL-CHECKLIST.md`

**Outputs:**
- `/tests/results/[PRD-ID]-e2e-results.json` - E2E test results
- `/tests/results/[PRD-ID]-visual-results.json` - Visual regression results
- `/tests/results/[PRD-ID]-manual-results.md` - Manual test log
- `/tests/visual/screenshots/[PRD-ID]-[screen]-actual.png`
- `/tests/visual/screenshots/[PRD-ID]-[screen]-diff.png`
- `/tests/logs/[PRD-ID]-qa-run.log` - Execution log
- Updated `/.tracking-db/prds/[ID].json` (QA status)

### /qa-report
**Command:** `/qa-report --prd-id=[ID]`
**Inputs:**
- `/tests/results/[PRD-ID]-*.json`
- `/.tracking-db/prds/[ID].json`

**Outputs:**
- `/docs/qa/reports/[PRD-ID]-QA-REPORT-YYYY-MM-DD.md`
- `/docs/qa/screenshots/[PRD-ID]/` - Screenshot gallery

---

## Review System Outputs ✨ NEW

### /pr-review
**Command:** `/pr-review --prd-id=[ID]`
**Inputs:**
- `/docs/prds/[ID].md` - PRD file
- `/docs/architecture/ARCHITECTURE.md` (Step 2)
- `/docs/design/DESIGN-SYSTEM.md` (Step 6)
- `/docs/states/STATE-SPEC.md` (Step 7)
- `/docs/technical/TECHNICAL-SPEC.md` (Step 8)
- Git diff for changed files

**Outputs:**
- `/docs/reviews/[PRD-ID]-PR-REVIEW-YYYY-MM-DD.md`
- Updated `/.tracking-db/prds/[ID].json` (review status)

### /test-review
**Command:** `/test-review --prd-id=[ID]`
**Inputs:**
- `/docs/prds/[ID].md` - PRD acceptance criteria
- `/tests/**/*[PRD-ID]*.test.ts` - Test files
- Coverage reports

**Outputs:**
- `/docs/reviews/[PRD-ID]-TEST-REVIEW-YYYY-MM-DD.md`
- Updated `/.tracking-db/prds/[ID].json` (test review status)

### /release-review
**Command:** `/release-review`
**Inputs:**
- `/.tracking-db/sprints/[active-sprint].json`
- `/.tracking-db/prds/*.json`
- All PR reviews, test reviews, QA reports

**Outputs:**
- `/docs/reviews/RELEASE-REVIEW-[sprint-id]-YYYY-MM-DD.md`
- `/docs/releases/RELEASE-NOTES-[sprint-id].md` (if approved)
- `/docs/migrations/ROLLBACK-PLAN-[sprint-id].md` (if migrations)

---

## Tracking DB Structure

```
.tracking-db/                     # Root-level tracking (machine state)
├── prds/                         # PRD tracking JSONs
│   ├── F1-auth.json
│   ├── F2-dashboard.json
│   └── ...
├── sprints/                      # Sprint tracking JSONs
│   ├── sprint-2025-01.json
│   └── ...
├── config.json                   # Backlog configuration
└── metrics.json                  # Overall metrics

docs/tracking/                    # Human-readable tracking outputs
├── BACKLOG.md
├── SPRINT-CURRENT.md
└── history/
    └── standups/
        ├── 2025-12-27.md
        └── 2025-12-28.md

docs/qa/                          # QA outputs
├── plans/
│   └── F1-QA-PLAN.md
├── checklists/
│   └── F1-MANUAL-CHECKLIST.md
├── reports/
│   └── F1-QA-REPORT-2025-12-28.md
└── screenshots/
    └── F1-auth/

docs/reviews/                     # Review outputs
├── F1-PR-REVIEW-2025-12-28.md
├── F1-TEST-REVIEW-2025-12-28.md
└── RELEASE-REVIEW-2025-01-2025-12-28.md

docs/releases/                    # Release outputs
└── RELEASE-NOTES-2025-01.md

docs/migrations/                  # Migration rollback plans
└── ROLLBACK-PLAN-2025-01.md
```

---

## Deprecated Paths (DO NOT USE)

❌ `/docs/specs/PRD.md` → Use `/docs/specs/MASTER_PRD.md`  
❌ `/docs/ux/UX-SPEC.md` → Use `/docs/ux/UX-DESIGN.md`  
❌ `/docs/design-system/DESIGN-SYSTEM.md` → Use `/docs/design/DESIGN-SYSTEM.md`  
❌ `/docs/interface-states/INTERFACE-STATES.md` → Use `/docs/states/STATE-SPEC.md`  
❌ `/docs/technical-spec/TECHNICAL-SPEC.md` → Use `/docs/technical/TECHNICAL-SPEC.md`  
❌ `/docs/feature-breakdown/FEATURE-BREAKDOWN.md` → Use `/docs/implementation/FEATURE-BREAKDOWN.md`
❌ `/PRD/` → Use `/docs/prds/`
