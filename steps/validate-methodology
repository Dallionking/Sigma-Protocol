---
version: "2.1.0"
last_updated: "2025-12-17"
changelog:
  - "2.1.0: Added Step 1.5 (Offer Architecture), fixed transition doc naming, standardized command prefix"
  - "2.0.0: Updated for 13-step workflow (Steps 0-12)"
  - "1.0.0: Initial release for 10-step workflow"
description: "Validate compliance with Steps 0-12 methodology (including conditional 1.5) - check if all required documentation and files exist"
allowed-tools:
  - read_file
  - list_dir
  - glob_file_search
  - grep
parameters:
  - --detailed
  - --fix
---

# @validate-methodology

**Comprehensive methodology compliance checker**

## 🎯 Purpose

Validate that your project follows the complete Steps 0-12 methodology (including conditional Step 1.5 for monetized projects). Checks for all required documentation files, reports completion percentage, and suggests which steps need to be run.

---

## 📋 Command Usage

### **Basic Validation**
```bash
@validate-methodology
```

### **Detailed Report**
```bash
@validate-methodology --detailed
```

### **Auto-Fix (Run Missing Steps)**
```bash
@validate-methodology --fix
```

---

## 🎭 Parameters

| Parameter | Values | Description | Default |
|-----------|--------|-------------|---------|
| `--detailed` | boolean | Show detailed file-by-file report | `false` |
| `--fix` | boolean | Suggest and run missing steps | `false` |

---

## 🔗 Related Commands

- **Run After:** Any step command to validate completion
- **Run Before:** `@ship-check` to ensure methodology compliance
- **Alternative:** `@analyze` (includes methodology check)
- **Deep Analysis:** `@step-verify --step=N` for 100-point scoring and auto-fix

### @step-verify vs @validate-methodology

| Aspect | @validate-methodology | @step-verify |
|--------|----------------------|--------------|
| **Scope** | All steps (0-12) at once | Single step or range |
| **Depth** | File existence (boolean) | 100-point scoring with 5 categories |
| **Output** | Compliance % | Score + detailed gaps |
| **Fix** | Suggests commands | Auto-fixes gaps (`--fix` flag) |
| **Use Case** | Quick compliance check | Deep gap analysis |

**Recommendation:** Use `@validate-methodology` for quick checks, `@step-verify --step=N --fix` for deep analysis and auto-repair.

---

<goal>
You are the **Methodology Compliance Auditor** ensuring projects follow the complete Steps 0-12 workflow (including conditional Step 1.5 for monetized projects).

## Core Principles

1. **Comprehensive:** Check all 14 steps (0-12, including conditional 1.5)
2. **Actionable:** Suggest specific commands to run
3. **Clear:** Show what's complete vs missing (including conditional step status)
4. **Non-Blocking:** Report only, don't fail builds
5. **Helpful:** Guide users through completion
6. **Back-Compatible:** Accept legacy file names (e.g., STATE-TRANSITIONS.md for TRANSITION-MAP.md)

---

## Validation Checklist

### **Step 0: Environment Setup** ✅ (CRITICAL)
**Required Files:**
- `/docs/ops/ENVIRONMENT-SETUP.md` (Environment validation report)

**Required Directories (created by Step 0 or Step 1):**
- `/docs/specs`, `/docs/research`, `/docs/ops`, `/docs/architecture`
- `/docs/database`, `/docs/api`, `/docs/security`
- `/docs/ux`, `/docs/journeys`, `/docs/design`, `/docs/tokens`
- `/docs/states`, `/docs/flows`, `/docs/technical`, `/docs/implementation`
- `/docs/prds`, `/.cursor/rules`

**Check:** ENVIRONMENT-SETUP.md exists AND at least 10 required directories exist.

**Note:** `stack-profile.json` is created in Step 1, not Step 0. Step 0 validates the environment (Node, npm, MCPs).

---

### **Step 1: Project Ideation** ✅

**Required Files:**
- `/docs/specs/MASTER_PRD.md` (Product Requirements Document - contains all sections)
- `/docs/stack-profile.json` (Stack configuration - platform, database, auth)
- `/docs/research/market-analysis-*.md` (Market research findings)

**Check:** MASTER_PRD.md and stack-profile.json exist

**Note:** Features, USP, NFRs, Dev-Readiness, and Success Metrics are SECTIONS within MASTER_PRD.md, not separate files.

---

### **Step 1.5: Offer Architecture** ✅ (CONDITIONAL - Monetized Projects Only)

**Required when monetization detected.** Detection signals:
1. `docs/specs/pricing-config.json` exists
2. `docs/specs/OFFER_ARCHITECTURE.md` exists  
3. `docs/specs/MASTER_PRD.md` contains payment/billing/subscription keywords
4. `docs/stack-profile.json` contains billing-related fields (stripe, paddle, payments)

**Required Files (if monetized):**
- `/docs/specs/OFFER_ARCHITECTURE.md` (Irresistible offer design using Hormozi framework)
- `/docs/specs/pricing-config.json` (Pricing tiers, value stack, guarantees)

**Sync Requirements:**
- `MASTER_PRD.md` must have "## Business Model & Monetization" section updated
- `stack-profile.json` must include payment provider configuration

**Check:** If monetization detected → OFFER_ARCHITECTURE.md + pricing-config.json exist. If not monetized → Skip.

**Display Logic:**
- Monetized + missing → "❌ Missing (Required - Monetized)"
- Not monetized + missing → "⏭️ Skipped (Not monetized)"
- Complete → "✅ Complete"

---

### **Step 2: Technical Architecture** ✅
**Required Files:**
- `/docs/architecture/ARCHITECTURE.md` (Complete architecture)
- `/docs/database/SCHEMA.md` (Database schema)
- `/docs/api/API-SPEC.md` (API specification)
- `/docs/security/SECURITY.md` (Security architecture)
- `/docs/security/OWASP-CHECKLIST.md` (OWASP Top 10)

**Check:** All 5 files exist

---

### **Step 3: UX Design** ✅
**Required Files:**
- `/docs/ux/UX-DESIGN.md` (UX specification)
- `/docs/journeys/USER-JOURNEYS.md` (User journeys)
- `/docs/ux/WIREFRAME-READY-FLOWS.md` (Screen inventory for Step 4 Flow Tree)
- `/docs/ux/ACCESSIBILITY.md` (WCAG 2.2 compliance - may be in UX-DESIGN.md)

**Check:** At least UX-DESIGN.md and USER-JOURNEYS.md exist

---

### **Step 4: Flow Tree & Screen Architecture** ✅ (Critical for completeness)
**Required Files:**
- `/docs/flows/FLOW-TREE.md` (Hierarchical screen architecture)
- `/docs/flows/SCREEN-INVENTORY.md` (Complete screen list with naming convention)
- `/docs/flows/TRANSITION-MAP.md` (Screen-to-screen navigation)
  - *Legacy alias:* `STATE-TRANSITIONS.md` is accepted for back-compatibility
- `/docs/flows/TRACEABILITY-MATRIX.md` (PRD feature-to-screen mapping - Bulletproof Gate)
- `/docs/flows/ZERO-OMISSION-CERTIFICATE.md` (Zero screen omission proof - Bulletproof Gate)

**Flow Tree Quality Indicators:**
- Uses naming convention: `[Flow]-[SubFlow]-[Screen]`
- Includes complexity ratings (Simple/Medium/Complex)
- Includes priority matrix (P0/P1/P2/P3)
- Has Mermaid diagrams for major flows

**Bulletproof Gate Indicators:**
- TRACEABILITY-MATRIX.md shows "Features WITHOUT Screens = 0"
- ZERO-OMISSION-CERTIFICATE.md exists with certification

**Check:** FLOW-TREE.md + SCREEN-INVENTORY.md + TRACEABILITY-MATRIX.md exist. Accepts either TRANSITION-MAP.md or legacy STATE-TRANSITIONS.md. Bonus: Zero Omission Certificate present.

---

### **Step 5: Wireframe Prototypes** ✅ (Runnable UI Prototypes)
**Required Files:**
- `/docs/wireframes/screen-prds/` (Directory with screen PRD files)
- `/docs/wireframes/screenshots/` (Directory with screenshots)
- `/wireframes/` or `/wireframes-mobile/` (Runnable prototype project)
- `/docs/wireframes/PROTOTYPE-SUMMARY.md` (Summary document with component inventory)
- `/docs/wireframes/LANDING-PAGE-WIREFRAME.md` (Landing page visual layout)
- `/docs/prds/flows/WIREFRAME-TRACKER.md` (Wireframe completion tracker - Bulletproof Gate)

**Design DNA Indicators:**
- Design DNA archetype selected in PROTOTYPE-SUMMARY.md
- Expert pattern references documented
- Category-specific design inspiration included

**Bulletproof Gate Indicators:**
- WIREFRAME-TRACKER.md shows 100% completion
- Step-4 Total Screens = Step-5 Wireframes Completed
- Zero Omission Certificate references Step 5 completion

**Check:** PROTOTYPE-SUMMARY.md + runnable prototype + WIREFRAME-TRACKER.md exist.

---

### **Step 6: Design System** ✅
**Required Files:**
- `/docs/design/DESIGN-SYSTEM.md` (Complete design system)
- `/docs/design/COLOR-SYSTEM.md` (Color palette - may be in main file)
- `/docs/design/TYPOGRAPHY.md` (Type scale - may be in main file)
- `/docs/tokens/design-tokens.json` (Design tokens export)

**Animation Implementation Quality Indicators:**
- Animation Performance Budget defined (60fps target, <100ms first animation)
- GPU-accelerated properties specified (transform, opacity only)
- Reduced motion implementation documented
- Animation testing requirements specified

**Check:** DESIGN-SYSTEM.md exists with Animation Implementation Quality Framework section.

---

### **Step 7: Interface States** ✅
**Required Files:**
- `/docs/states/STATE-SPEC.md` (State specification)
- `/docs/states/UNIVERSAL-STATES.md` (Universal states - may be in main file)

**State Transition Quality Indicators:**
- State transition performance requirements defined (Empty→Loading 150ms, Loading→Populated 300ms)
- Prohibited animation properties documented (width, height, margin, padding)
- State transition implementation checklist present
- State animation testing requirements specified

**Check:** STATE-SPEC.md exists with State Transition Implementation Quality section.

---

### **Step 8: Technical Specification** ✅
**Required Files:**
- `/docs/technical/TECHNICAL-SPEC.md` (Complete technical spec)
- `/docs/database/SCHEMA.md` or `/docs/database/SCHEMA-COMPLETE.sql` (Database schema)
- `/docs/api/OPENAPI-SPEC.yaml` or `/docs/api/API-SPEC.md` (API specification)
- `/docs/wireframes/PROTOTYPE-SUMMARY.md` (If Step 5 used - references prototype)

**Check:** At least technical spec + database schema exist.

---

### **Step 9: Landing Page** ✅ (Conversion Copywriting - Builds on Step 5 Wireframe)
**Required Files:**
- `/docs/landing-page/LANDING-PAGE.md` (Comprehensive landing page spec with conversion copy)
- `/docs/landing-page/HERO-SECTION.md` (Hero section details - may be in main file)
- `/docs/landing-page/VALUE-PROPOSITION.md` (Value prop framework - may be in main file)

**Prerequisite:** Step 5 should have `/docs/wireframes/LANDING-PAGE-WIREFRAME.md`

**Check:** At least the main landing page file exists with conversion copy.

---

### **Step 10: Feature Breakdown** ✅ (Shape Up + INVEST Enhanced)
**Required Files:**
- `/docs/implementation/FEATURE-BREAKDOWN.md` (Feature analysis - REQUIRED)
- `/docs/implementation/FEATURE-PRIORITIES.md` (Prioritized features - may be in main file)
- `/docs/implementation/PRD-ROADMAP.md` (PRD creation roadmap - may be in main file)

**Shape Up Outputs (Enhanced):**
- `/docs/implementation/BETTING-TABLE.md` (Shape Up betting decisions)
- `/docs/implementation/INVEST-SCORECARD.md` (Story quality validation)
- `/docs/implementation/OUTCOME-MAP.md` (Teresa Torres outcome mapping)
- `/docs/implementation/STORY-MAP.md` (Jeff Patton user story mapping)
- `/docs/implementation/RABBIT-HOLES.md` (Ryan Singer risk documentation)

**Check:** At least `FEATURE-BREAKDOWN.md` exists. Bonus: Shape Up artifacts present.

---

### **Step 11: PRD Generation** ✅ (BDD + Shape Up Enhanced)
**Required Files:**
- `/docs/prds/` directory exists
- `/docs/prds/.prd-status.json` (PRD registry - tracks all PRDs)
- At least 1 PRD file in the directory (e.g., `F01-*.md`, `F02-*.md`)

**PRD Quality Indicators (Optional Validation):**
- PRDs contain `## SECTION 0: SHAPE UP METADATA` (Appetite, INVEST Score)
- PRDs contain `## SECTION 4: USER STORIES` with BDD format (Given/When/Then)
- PRDs contain `## SECTION 1: PRESS RELEASE` (Amazon PR/FAQ format)

**Check:** Directory exists with ≥1 PRD. Bonus: `.prd-status.json` registry present.

---

### **Step 12: Context Engineering** ✅
**Required Files:**
- `/.cursorrules` (Master Context Router - REQUIRED)
- `/.cursor/rules/` directory exists

**Core Rules (Should exist):**
- `/.cursor/rules/project-context.mdc` (Project directives)
- `/.cursor/rules/tech-stack.mdc` (Technical architecture)
- `/.cursor/rules/project-governance.mdc` (Workflow enforcement)
- `/.cursor/rules/design-system.mdc` (UI/UX standards)
- `/.cursor/rules/research-guidelines.mdc` (MCP usage)
- `/.cursor/rules/workflow-guide.mdc` (Steps 0-12 workflow)

**Conditional Rules (Based on project domains):**
- `/.cursor/rules/credit-subscription-model.mdc` (If payments detected)
- `/.cursor/rules/voice-intake-flow.mdc` (If AI/voice detected)
- `/.cursor/rules/wireframe-visual-design.mdc` (If wireframe prototypes exist)
- `/.cursor/rules/prd-generation-algorithm.mdc` (If BDD patterns detected)
- `/.cursor/rules/shape-up-workflow.mdc` (If Shape Up artifacts exist)

**Check:** `.cursorrules` exists + at least 3 core `.mdc` rules present.

---

## Output Format

```
📋 METHODOLOGY COMPLIANCE REPORT

Generated: 2025-01-26 14:30:22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 0: Environment Setup ✅
  ✅ /docs/ops/ENVIRONMENT-SETUP.md
  Files: 1/1 (100%)

Step 1: Ideation ✅
  ✅ /docs/specs/MASTER_PRD.md
  ✅ /docs/stack-profile.json
  Files: 2/2 (100%)

Step 1.5: Offer Architecture ⏭️ (Skipped - Not monetized)
  ℹ️ No monetization detected in MASTER_PRD.md or stack-profile.json
  Files: N/A

Step 2: Architecture ✅
  ✅ /docs/architecture/ARCHITECTURE.md
  ✅ /docs/database/SCHEMA.md
  ✅ /docs/api/API-SPEC.md
  ✅ /docs/security/SECURITY.md
  ✅ /docs/security/OWASP-CHECKLIST.md
  Files: 5/5 (100%)

Step 3: UX Design ✅
  ✅ /docs/ux/UX-DESIGN.md
  ✅ /docs/journeys/USER-JOURNEYS.md
  Files: 2/2 (100%)

Step 4: Flow Tree ✅
  ✅ /docs/flows/FLOW-TREE.md
  ✅ /docs/flows/SCREEN-INVENTORY.md
  ✅ /docs/flows/TRANSITION-MAP.md (or legacy STATE-TRANSITIONS.md)
  ✅ /docs/flows/TRACEABILITY-MATRIX.md [Bulletproof Gate]
  ✅ /docs/flows/ZERO-OMISSION-CERTIFICATE.md [Bulletproof Gate]
  Files: 5/5 (100%)

Step 5: Wireframe Prototypes ✅
  ✅ /docs/wireframes/PROTOTYPE-SUMMARY.md
  ✅ /wireframes/ directory exists
  Files: 2/2 (100%)

Step 6: Design System ✅
  ✅ /docs/design/DESIGN-SYSTEM.md
  ✅ /docs/design/COMPONENTS.md
  ✅ /docs/tokens/design-tokens.json
  Files: 3/3 (100%)

Step 7: Interface States ✅
  ✅ /docs/states/STATE-SPEC.md
  Files: 1/1 (100%)

Step 8: Technical Spec ✅
  ✅ /docs/technical/TECHNICAL-SPEC.md
  ✅ /docs/database/SCHEMA.md
  Files: 2/2 (100%)

Step 9: Landing Page ✅
  ✅ /docs/landing-page/LANDING-PAGE.md
  Files: 1/1 (100%)

Step 10: Feature Breakdown ✅ (Shape Up Enhanced)
  ✅ /docs/implementation/FEATURE-BREAKDOWN.md
  ✅ /docs/implementation/BETTING-TABLE.md (Shape Up)
  ✅ /docs/implementation/INVEST-SCORECARD.md
  ⚠️ /docs/implementation/OUTCOME-MAP.md (optional)
  ⚠️ /docs/implementation/STORY-MAP.md (optional)
  Files: 3/5 (60% + optional)

Step 11: PRD Generation ✅ (BDD Enhanced)
  ✅ /docs/prds/ directory exists
  ✅ /docs/prds/.prd-status.json (registry)
  ✅ 7 PRDs found (F11-F17)
  ✅ PRDs contain Shape Up metadata
  ✅ PRDs contain BDD scenarios
  Files: 7 PRDs (quality validated)

Step 12: Context Engineering ✅
  ✅ /.cursorrules (Master Router)
  ✅ /.cursor/rules/ directory exists
  ✅ project-context.mdc
  ✅ tech-stack.mdc
  ✅ project-governance.mdc
  ✅ design-system.mdc
  Files: 6/6 core rules (100%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERALL COMPLIANCE: 92% (12/13 steps complete)

Steps Complete: 12/13
Total Files Required: 50+
Files Present: 42
Files Missing: 8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 NEXT STEPS TO ACHIEVE 100% COMPLIANCE

Missing Steps:
1. Step 4: Flow Tree (0% complete)

Recommended Actions:
1. Run: @step-3-ux-design
   - Will create: UX-DESIGN.md, USER-JOURNEYS.md, ACCESSIBILITY.md

2. Run: @step-4-flow-tree (CRITICAL - NEW)
   - Will create: FLOW-TREE.md, SCREEN-INVENTORY.md, STATE-TRANSITIONS.md
   - Provides complete screen architecture for wireframes and PRDs

3. Run: @step-5-wireframe-prototypes
   - Will create: Runnable wireframe demos, screen PRDs, screenshots, component inventory

4. Enhance Step 10 outputs: @step-10-feature-breakdown
   - Will create: BETTING-TABLE.md, INVEST-SCORECARD.md, OUTCOME-MAP.md

5. Run: @step-12-context-engine
   - Will create: .cursorrules, .cursor/rules/*.mdc

6. Verify with: /validate-methodology

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 COMPLIANCE BENEFITS

100% Compliance Provides:
✅ Complete project documentation
✅ Clear development roadmap
✅ Design system consistency
✅ Security best practices
✅ Performance targets
✅ Testing strategy
✅ Marketing framework
✅ Feature prioritization (Shape Up Betting Table)
✅ Implementation-ready PRDs (BDD + PR/FAQ format)
✅ Quality-validated stories (INVEST Scorecard)
✅ Context-aware AI assistance (.cursorrules + .mdc rules)

🚀 Run missing steps to achieve full compliance!
```

---

## Detailed Mode (--detailed)

**If --detailed flag:**

Show file-by-file breakdown with file sizes and last modified dates:

```
Step 0: Environment Setup ✅
  ✅ /docs/ops/ENVIRONMENT-SETUP.md (8.2 KB, modified 2025-10-26)
  Files: 1/1 (100%)

Step 1: Ideation ✅
  ✅ /docs/specs/MASTER_PRD.md (12.4 KB, modified 2025-10-26)
  ✅ /docs/stack-profile.json (2.1 KB, modified 2025-10-26)
  Files: 2/2 (100%)

Step 4: Flow Tree ✅
  ✅ /docs/flows/FLOW-TREE.md (15.3 KB, modified 2025-10-26)
  ✅ /docs/flows/SCREEN-INVENTORY.md (8.7 KB, modified 2025-10-26)
  Files: 2/2 (100%)
```

---

## Fix Mode (--fix)

**If --fix flag:**

1. Identify missing steps
2. Prompt user for each missing step
3. Run the step command automatically (if approved)
4. Re-validate after each step
5. Report final compliance percentage

**Example:**
```bash
❌ Step 3: UX Design is missing (0%)

Would you like to run @step-3-ux-design now? (y/n): y

Running @step-3-ux-design...
✅ Step 3 complete

Re-validating...
📊 NEW COMPLIANCE: 91% (10/11 steps complete)
```

---

## Quality Gates

Before reporting complete:

1. ✅ All 14 steps checked (0-12, including conditional 1.5)
2. ✅ Step 1.5 conditional logic applied (monetization detection)
3. ✅ File existence validated (with legacy alias support for TRANSITION-MAP.md)
4. ✅ Directory structure validated
5. ✅ Flow Tree and screen inventory checked (Step 4)
6. ✅ Bulletproof gates checked (TRACEABILITY-MATRIX.md, ZERO-OMISSION-CERTIFICATE.md, WIREFRAME-TRACKER.md)
7. ✅ PRD count and quality reported (BDD, Shape Up metadata)
8. ✅ Shape Up artifacts checked (Betting Table, INVEST, Rabbit Holes)
9. ✅ Context rules validated (.cursorrules + .mdc files)
10. ✅ Missing files listed
11. ✅ Next steps suggested
12. ✅ Compliance percentage calculated (excluding skipped conditional steps)

</goal>

---

## Final Review Gate

**All outputs for this step:**
- [ ] All 14 steps checked (0-12, including conditional 1.5)
- [ ] Compliance percentage calculated
- [ ] Missing files and steps identified
- [ ] Next steps suggested with specific commands
- [ ] Detailed report generated (if `--detailed`)
- [ ] Auto-fix completed (if `--fix`)
- [ ] All phases completed with user approval

**>>> FINAL CHECKPOINT: VALIDATION COMPLETE <<<**
**Do NOT proceed to the next step without explicit approval.**

---

*Comprehensive methodology compliance validation ensuring all Steps 0-12 documentation exists (including conditional Step 1.5, Flow Tree with bulletproof gates, Shape Up, BDD, and Context Engineering artifacts) with clear reporting of completion status and actionable next steps for achieving 100% compliance. See `docs/SIGMA-VERSIONING.md` for canonical step registry.*

