# SSS Development Workflow: Complete Guide (Steps 0-12 + Conditional 1.5)

**Last Updated:** 2025-12-29  
**Version:** 4.0 (with Agentic Layer, Self-Correcting Dev Loop, Grade 4 Tooling)

---

## 🎯 Overview

The SSS (Sigma Software Solutions) workflow is a **comprehensive, 14-step process (Steps 0-12 plus conditional Step 1.5)** that takes you from initial idea to production-ready code with complete documentation. Think of it as building a house - you don't start with the roof, you follow a specific order.

**Workflow Order:** `0 → 1 → 1.5 (conditional) → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 11b (optional) → 12`

**Key Principles:**

- **Sequential:** Steps must be done in order (no skipping)
- **Cumulative:** Each step builds on previous steps
- **Conditional Steps:** Step 1.5 is required only for monetized projects
- **Comprehensive:** 100-1000+ lines of documentation per step
- **Human-in-the-Loop (HITL):** AI stops at checkpoints for your approval
- **MCP-Driven:** Uses external tools for research and validation
- **Bulletproof Gates:** Steps 4 and 5 produce traceability artifacts ensuring 100% screen coverage
- **Self-Contained:** Works for new projects without legacy dependencies
- **Agentic Layer:** Grade 4 self-correcting loops with project-local tools

See `docs/mcp/SSS-VERSIONING.md` for the canonical step registry.

---

## 🎯 Foundation Skills System (v4.1)

SSS includes a **two-tier skill system** that provides AI capabilities at different levels:

### Tier 1: Foundation Skills (Step 0)

**24 universal skills** installed at Step 0 that provide domain-agnostic capabilities:

| Category               | Skills                                                                                        | Purpose                      |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| **SSS Core** (6)       | research, verification, bdd-scenarios, hormozi-frameworks, output-generation, frontend-design | Power the 13-step workflow   |
| **Design & Dev** (4)   | ux-designer, architecture-patterns, api-design-principles, web-artifacts-builder              | Architecture and UI patterns |
| **Quality** (5)        | brainstorming, systematic-debugging, quality-gates, senior-qa, senior-architect               | Testing and code quality     |
| **Productivity** (5)   | prompt-engineering-patterns, xlsx, pptx, applying-brand-guidelines, remembering-conversations | Documents and productivity   |
| **Platform Tools** (4) | skill-creator, agent-development, opencode-agent-generator, creating-opencode-plugins         | Create custom skills/agents  |

### Tier 2: Project Overlays (Step 13)

**Project-specific skills** generated at Step 13 that inject your project context:

- `frontend-aesthetics` — Your design tokens, component patterns, Tailwind config
- `backend-engineering` — Your API conventions, auth patterns, error shapes
- `database-modeling` — Your schema patterns, RLS policies, migrations

### Platform Installation

| Platform        | Foundation Skills            | Project Overlays                               |
| --------------- | ---------------------------- | ---------------------------------------------- |
| **Cursor**      | `.cursor/rules/sss-*.mdc`    | `.cursor/rules/frontend-aesthetics.mdc`        |
| **Claude Code** | `.claude/skills/*/SKILL.md`  | `.claude/skills/frontend-aesthetics/SKILL.md`  |
| **OpenCode**    | `.opencode/skill/*/SKILL.md` | `.opencode/skill/frontend-aesthetics/SKILL.md` |

### How They Work Together

```
┌─────────────────────────────────────────────────────────┐
│           PROJECT-SPECIFIC OVERLAYS (Step 13)          │
│  Injects: Your PRD, design system, stack, conventions  │
├─────────────────────────────────────────────────────────┤
│           FOUNDATION SKILLS (Step 0)                   │
│  Provides: Universal best practices, patterns, tools   │
└─────────────────────────────────────────────────────────┘
```

Foundation skills provide the **base capabilities**. Project overlays add **your specific context**. Combined, the AI gets expert-level knowledge of YOUR codebase.

See [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) for the complete skill reference.

---

## 🤖 Agentic Layer (v4.0)

SSS now includes a **Grade 4 Agentic Layer** that enables AI agents to operate, maintain, and self-correct implementations autonomously.

### The Agentic Layer Framework

Based on the "Building Agentic Layers" methodology, SSS separates:

| Layer                 | Location                      | Purpose                           |
| --------------------- | ----------------------------- | --------------------------------- |
| **Application Layer** | `app/`, `components/`, `lib/` | The actual product code           |
| **Agentic Layer**     | `.sigma/`                       | AI agent tools, memory, and state |

### Agentic Layer Structure

```
.sigma/
├── tools/                    # Grade 3: Project-local scripts
│   ├── typecheck.sh         # Run TypeScript compiler
│   ├── lint.sh              # Run linter
│   ├── test.sh              # Run test suite
│   ├── build.sh             # Production build
│   └── format-check.sh      # Check formatting
│
└── memory/                   # Grade 4: Session state
    └── active_task.md       # Current task for resume support
```

### Agentic Maturity Grades

| Grade       | Feature               | SSS Implementation                               |
| ----------- | --------------------- | ------------------------------------------------ |
| **Grade 1** | Prime Prompt + Memory | `.cursorrules` + `.sss-manifest.json`            |
| **Grade 2** | Specialized Agents    | `@implement-prd`, `@verify-prd`, `@gap-analysis` |
| **Grade 3** | Custom Tools          | `.sigma/tools/` scripts (generated by Step 12)     |
| **Grade 4** | Closed Loops          | `@dev-loop` with auto-fix via `@gap-analysis`    |

### Self-Correcting Implementation Loop

The `@dev-loop` command now operates in Grade 4 mode:

```
┌─────────────────────────────────────────┐
│  @implement-prd                         │
│  Build the feature from PRD             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  @verify-prd                            │
│  11-phase validation                    │
│  + .sigma/tools/ verification             │
└─────────────┬───────────────────────────┘
              │
        ┌─────┴─────┐
       PASS       FAIL
        │          │
        │          ▼
        │  ┌────────────────────────┐
        │  │  🔧 AUTO-FIX           │
        │  │  @gap-analysis --fix   │
        │  │  (up to 3 iterations)  │
        │  └────────────┬───────────┘
        │               │
        │               ▼
        │         Re-verify
        │               │
        ▼               │
┌─────────────────────────────────────────┐
│  ✅ Commit and proceed to next PRD      │
│  (Only after all checks pass)           │
└─────────────────────────────────────────┘
```

### Active Task Memory

For multi-session continuity, SSS maintains `.sigma/memory/active_task.md`:

```markdown
# Active Task

## PRD

F03-dashboard

## Phase

implementing

## Completed Steps

- [x] Database schema
- [x] Server actions
- [ ] UI components
- [ ] Tests

## Last Updated

2025-12-29T10:30:00Z
```

This enables the AI to resume work after context window resets.

### Using the Agentic Layer

1. **Generate tools**: Run `@step-12-context-engine` to create `.sigma/tools/`
2. **Implement with memory**: `@implement-prd` writes to `active_task.md`
3. **Self-correct**: `@dev-loop` uses `@gap-analysis` when verification fails
4. **Resume**: Use `--resume` flag to continue from active task state

### Commands with Agentic Integration

| Command                   | Agentic Feature                        |
| ------------------------- | -------------------------------------- |
| `@step-12-context-engine` | Generates `.sigma/tools/` scripts        |
| `@implement-prd`          | Writes to `.sigma/memory/active_task.md` |
| `@verify-prd`             | Uses `.sigma/tools/` for verification    |
| `@dev-loop`               | Auto-fix loop + active task memory     |
| `@gap-analysis`           | Called by dev-loop for self-correction |

---

## 🧵 Thread-Based Engineering

SSS integrates **Thread-Based Engineering** - a framework for measuring and scaling your agentic engineering capabilities.

### What is a Thread?

A **Thread** is a unit of engineering work bookended by human actions:

```
┌─────────┐     ┌──────────────┐     ┌─────────┐
│ PROMPT  │ ──► │  AGENT WORK  │ ──► │ REVIEW  │
│ or PLAN │     │ (Tool Calls) │     │ VALIDATE│
└─────────┘     └──────────────┘     └─────────┘
     ▲                                    ▲
    YOU                                  YOU
```

### Thread Types in SSS

| Type | Symbol | SSS Implementation |
|------|--------|-------------------|
| **Base Thread** | B | Any `@step-X` command |
| **P-Thread** | P | `sigma orchestrate` - multi-agent streams |
| **C-Thread** | C | The 13-step workflow (phases with HITL) |
| **F-Thread** | F | `sigma f-thread` - same prompt, multiple agents |
| **B-Thread** | B+ | Ralph Loop - agents prompting agents |
| **L-Thread** | L | Long-running `@dev-loop` sessions |

### How SSS Uses Threads

1. **Base Threads**: Every individual command (`@implement-prd F03`)
2. **C-Threads**: The 13-step workflow is one long chained thread
3. **P-Threads**: `sigma orchestrate --tui mprocs` for parallel PRD work
4. **B-Threads**: Ralph Loop orchestrates multiple sub-agents
5. **L-Threads**: Extended `@dev-loop` sessions with stop hooks

### Commands

| Command | Description |
|---------|-------------|
| `sigma thread` | Thread type wizard |
| `sigma thread status` | View active threads |
| `sigma thread metrics` | Track your improvement |
| `sigma f-thread` | Fusion thread (multi-agent) |
| `sigma orchestrate` | P-Thread orchestration |

### 4 Dimensions of Improvement

Track your growth by measuring:

1. **More Threads** - How many agents in parallel?
2. **Longer Threads** - How long do sessions run?
3. **Thicker Threads** - Do agents prompt other agents?
4. **Fewer Checkpoints** - How often do you review?

See [THREAD-BASED-ENGINEERING.md](THREAD-BASED-ENGINEERING.md) for the full framework.

---

## 🔍 Step Verification System

### Why Step Verification?

Before proceeding to the next step (or starting `@dev-loop`), you should verify that the current step is **100% complete**. The `@step-verify` command performs deep gap analysis with a 100-point scoring system.

### Using @step-verify

```bash
# Verify a single step
@step-verify --step=1

# Verify a range of steps
@step-verify --step=1-11

# Verify and auto-fix gaps (up to 5 iterations)
@step-verify --step=1 --fix

# Verbose output with detailed checks
@step-verify --step=1 --verbose
```

### 100-Point Scoring System

Each step is scored across 5 dimensions:

| Category                 | Points | What It Checks                                           |
| ------------------------ | ------ | -------------------------------------------------------- |
| **File Existence**       | 20     | Required output files exist and meet minimum size        |
| **Section Completeness** | 30     | Required sections present in documents                   |
| **Content Quality**      | 30     | Content meets quality standards (tables, diagrams, code) |
| **Checkpoints**          | 10     | HITL checkpoints were completed                          |
| **Success Criteria**     | 10     | Step-specific success criteria met                       |

### Score Thresholds

| Score   | Grade | Status        | Action                       |
| ------- | ----- | ------------- | ---------------------------- |
| 100/100 | A+    | ✅ COMPLETE   | Ready for next step          |
| 90-99   | A     | ✅ PASSING    | Minor improvements optional  |
| 80-89   | B+    | ⚠️ ACCEPTABLE | Should fix before proceeding |
| 70-79   | B     | ⚠️ NEEDS WORK | Fix gaps before proceeding   |
| <70     | C/F   | ❌ INCOMPLETE | Re-run the step or use --fix |

### Iterative Fix Loop (--fix mode)

When you run `@step-verify --step=1 --fix`:

1. **Verify** → Calculate current score (e.g., 72/100)
2. **List gaps** → Show what's missing
3. **Auto-fix** → Create missing files, add missing sections
4. **Re-verify** → Check new score (e.g., 88/100)
5. **Repeat** → Continue until 100/100 or max 5 iterations

### Verification Schema

Each step command file contains a `<verification>` block that defines:

- Required files with paths and minimum sizes
- Required sections in documents
- Content quality checks (patterns, tables, diagrams)
- Checkpoint evidence requirements
- Success criteria

### When to Use @step-verify

| Situation                  | Command                           |
| -------------------------- | --------------------------------- |
| Before starting next step  | `@step-verify --step=N`           |
| Before running @dev-loop   | `@step-verify --step=1-11 --fix`  |
| After completing a step    | `@step-verify --step=N --verbose` |
| Diagnosing missing outputs | `@step-verify --step=N`           |
| Quick health check         | `@step-verify --step=0-12`        |

### Integration with @validate-methodology

- `@validate-methodology` → High-level check (files exist? yes/no)
- `@step-verify` → Deep analysis (100-point scoring, quality checks, auto-fix)

Use `@step-verify` for detailed gap analysis and `@validate-methodology` for quick compliance checks.

---

## 📋 Step Overview (0-12 + Conditional 1.5)

| Step     | Name                            | Purpose                                                        | Key Output                                                                                    |
| -------- | ------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **0**    | Environment Setup               | Prepare workspace, tools, MCP config                           | `docs/ops/ENVIRONMENT-SETUP.md`, folder structure                                             |
| **1**    | Ideation                        | Capture vision, market research, Master PRD                    | `docs/specs/MASTER_PRD.md`, `docs/stack-profile.json`                                         |
| **1.5**  | Offer Architecture              | _(Conditional - monetized projects)_ Hormozi framework pricing | `docs/specs/OFFER_ARCHITECTURE.md`, `docs/specs/pricing-config.json`                          |
| **2**    | Architecture                    | System design, tech stack, ADRs                                | `docs/architecture/ARCHITECTURE.md`                                                           |
| **3**    | UX Design                       | User journeys, flows, emotional design                         | `docs/ux/UX-DESIGN.md`                                                                        |
| **4**    | Flow Tree & Screen Architecture | **Mobbin-style comprehensive screen mapping**                  | `docs/flows/FLOW-TREE.md`, `SCREEN-INVENTORY.md`, `TRANSITION-MAP.md` + **Bulletproof Gates** |
| **5**    | Wireframe Prototypes            | _(Optional)_ Runnable in-cursor prototypes                     | `/wireframes/`, `docs/wireframes/PROTOTYPE-SUMMARY.md` + **WIREFRAME-TRACKER.md**             |
| **6**    | Design System                   | Design tokens, component specs                                 | `docs/design/DESIGN-SYSTEM.md`                                                                |
| **7**    | Interface States                | All states (empty/loading/error/success)                       | `docs/states/STATE-SPEC.md`                                                                   |
| **8**    | Technical Specification         | Complete dev blueprint, API, DB schema                         | `docs/technical/TECHNICAL-SPEC.md`                                                            |
| **9**    | Landing Page                    | _(Optional)_ Marketing/sales page                              | `docs/landing-page/LANDING-PAGE.md`                                                           |
| **10**   | Feature Breakdown               | Shape Up shaping, story mapping, betting                       | `docs/implementation/FEATURE-BREAKDOWN.md`                                                    |
| **11**   | PRD Generation                  | Feature PRDs with BDD scenarios                                | `docs/prds/F*.md`                                                                             |
| **11b** | PRD Swarm                       | _(Optional)_ Parallel implementation orchestration             | `docs/prds/swarm-*/`, `SWARM-PLAN.md`                                                         |
| **12**   | Cursor Rules                    | Context engineering, .cursorrules                              | `.cursorrules`, `.cursor/rules/*.mdc`                                                         |

### Bulletproof Gate Files (Steps 4 & 5)

These artifacts ensure 100% screen coverage:

| File                                      | Step | Purpose                              |
| ----------------------------------------- | ---- | ------------------------------------ |
| `docs/flows/TRACEABILITY-MATRIX.md`       | 4    | PRD feature-to-screen mapping        |
| `docs/flows/ZERO-OMISSION-CERTIFICATE.md` | 4/5  | Mathematical proof no screens missed |
| `docs/prds/flows/WIREFRAME-TRACKER.md`    | 5    | Wireframe completion tracker         |

### Step 1.5 Conditional Rules

Step 1.5 is **required when monetization is detected**:

- `docs/specs/pricing-config.json` exists
- `docs/specs/OFFER_ARCHITECTURE.md` exists
- `MASTER_PRD.md` mentions payment/billing/subscription
- `stack-profile.json` has billing provider config (stripe, paddle, etc.)

### Step 11b Optional Rules

Step 11b (PRD Swarm Orchestration) is **suggested when**:

- `docs/prds/` contains 5+ PRD files
- User has access to multiple terminal instances (Cursor, Claude Code, OpenCode)
- Project complexity warrants parallel development

**What Step 11b Does:**

1. Scans all PRDs and extracts dependency information
2. Builds a dependency graph (DAG)
3. Detects circular dependencies (fails if found)
4. Groups PRDs into independent "swarms"
5. Creates `docs/prds/swarm-N/` folders
6. Generates execution order per swarm
7. Creates `SWARM-PLAN.md` for multi-terminal coordination

**Swarm Workflow:**

```
Terminal 1: @implement-prd --swarm=1  (works on swarm-1 PRDs)
Terminal 2: @implement-prd --swarm=2  (works on swarm-2 PRDs)
Terminal 3: @implement-prd --swarm=3  (works on swarm-3 PRDs)
Terminal 4: @implement-prd --swarm=4  (works on swarm-4 PRDs)
```

**Skip Step 11b If:**

- Fewer than 5 PRDs (sequential is fine)
- All PRDs have linear dependencies (can't parallelize)
- Single developer working sequentially

### New in Step 4: Flow Tree & Screen Architecture

**Step 4** is a new dedicated step for creating a **Mobbin-style Flow Tree** that comprehensively maps every screen in your application. This ensures:

- ✅ **No lazy screens** - Every flow (login, onboarding, settings) is mapped
- ✅ **90% app visibility** - You know what your app looks like before building
- ✅ **Screen inventory** - Complete list with names, complexity, priorities
- ✅ **Transition map** - How screens connect and flow to each other

**Example Output:**

```
📱 App Flow Tree
├── 🔐 Authentication (8 screens)
│   ├── Login (3 screens)
│   ├── Registration (3 screens)
│   └── Password Recovery (2 screens)
├── 🏠 Main Navigation (4 screens)
│   ├── Home (1 screen)
│   ├── Search (1 screen)
│   └── Profile (2 screens)
├── ⚙️ Settings (12 screens)
│   ├── Account (4 screens)
│   ├── Preferences (3 screens)
│   └── Support (5 screens)
└── Total: 24 screens mapped
```

[Additional workflow details, troubleshooting, and best practices available in individual step files]

---

**Last Updated:** 2025-12-29  
**Version:** 4.0 (with Agentic Layer, Grade 4 Self-Correcting Loops, .sigma/tools/ Integration)  
**Status:** ✅ Production Ready

See `docs/mcp/SSS-VERSIONING.md` for the canonical step registry and cascade rules.
