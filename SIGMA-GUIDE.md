---
name: sigma-protocol-guide
description: "Complete guide to the Sigma Protocol 13-step methodology"
triggers:
  - sigma
  - protocol
  - step
  - ideation
  - architecture
  - wireframe
  - prd
  - design system
  - feature breakdown
  - technical spec
---

# Sigma Protocol -- AI Guide

You are guiding a user through the Sigma Protocol, a 13-step product development methodology that takes a product idea from initial concept to implementation-ready specifications. Your job is to execute each step faithfully, stop at checkpoints for user approval, and produce all required output files.

## Quick Context

**What Sigma produces:** A complete specification package -- Master PRD, architecture docs, UX specs, screen inventory, wireframes, design system, interface states, technical blueprint, feature breakdown, implementation-ready PRDs, and AI context rules -- all generated sequentially with human-in-the-loop approval at every stage.

**Three phases:**

| Phase | Steps | Purpose |
|-------|-------|---------|
| PLAN | 0-1 (1.5) | Environment setup, ideation, offer architecture |
| DESIGN | 2-9 | Architecture, UX, flows, wireframes, design system, states, tech spec, landing page |
| BUILD | 10-13 | Feature breakdown, PRD generation, context engine, skillpack generator |

**Checkpoint philosophy:** Every step contains `>>> CHECKPOINT` markers. When you reach one, STOP and present your work to the user. Do not proceed until the user explicitly approves. This is non-negotiable.

**Sequential execution:** Steps must be completed in order. Each step consumes outputs from previous steps. Never skip a step unless explicitly instructed.

---

## The 13 Steps

### Step 0: Environment Setup
Validates the workspace, folder structure, and tooling. Confirms AI tools (MCP servers, search, documentation lookup) are available. Creates the project directory scaffold.

- **Outputs:** Project folder structure, `docs/ops/ENVIRONMENT-SETUP.md`
- **Frameworks:** MCP validation, tool availability checks
- **Dependencies:** None (first step)

### Step 1: Ideation
Interactive product discovery session. Captures the user's vision, conducts market research, defines personas, and produces the Master PRD with features, NFRs, success metrics, and a stack profile. Uses the Hormozi Value Equation to evaluate every feature.

- **Outputs:** `docs/specs/MASTER_PRD.md`, `docs/stack-profile.json`, `docs/specs/FEATURES.md`, `docs/specs/USP.md`, `docs/specs/NFRS.md`, `docs/specs/DEV-READINESS.md`, `docs/ops/SUCCESS-METRICS.md`
- **Frameworks:** Hormozi Value Equation, Venture Studio Partner persona, market research via web search
- **Dependencies:** Step 0

### Step 1.5: Offer Architecture (Conditional)
Required only for monetized projects. Designs pricing tiers, packaging, and offers using Hormozi's Grand Slam Offer framework. Syncs pricing decisions across all project docs.

- **Outputs:** `docs/specs/OFFER_ARCHITECTURE.md`, `docs/specs/pricing-config.json`
- **Frameworks:** Hormozi $100M Offers, Grand Slam Offer Design
- **Dependencies:** Step 1
- **Trigger conditions:** MASTER_PRD mentions payment/billing/subscription, or stack-profile.json includes a billing provider

### Step 2: Architecture
System design and technical blueprint. Defines tech stack, database schema, API specifications, security model, and infrastructure. Designs for scale from day one.

- **Outputs:** `docs/architecture/ARCHITECTURE.md`, `docs/database/SCHEMA.md`, `docs/api/API-SPEC.md`, `docs/security/SECURITY.md`
- **Frameworks:** Principal Fellow persona, Zero Trust security, ADR (Architecture Decision Records)
- **Dependencies:** Step 1 (MASTER_PRD.md, stack-profile.json)

### Step 3: UX Design
User experience specifications including journey mapping, emotional design, interaction patterns, and wireframe foundations. Produces comprehensive UX documentation.

- **Outputs:** `docs/ux/UX-DESIGN.md`, `docs/design/INSPIRATION.md`, `docs/design/EXTRACTED-PATTERNS.md`, `docs/journeys/USER-JOURNEYS.md`, `docs/journeys/STATE-COVERAGE.md`, `docs/ux/WIREFRAMES.md`
- **Frameworks:** Chief Design Officer persona, user journey mapping, emotional design
- **Dependencies:** Step 2 (ARCHITECTURE.md)

### Step 4: Flow Tree and Screen Architecture
Creates a comprehensive Mobbin-style flow tree mapping every screen in the application. Produces a screen inventory, flow diagrams, and traceability matrix ensuring zero screens are missed.

- **Outputs:** `docs/flows/FLOW-TREE.md`, `docs/flows/SCREEN-INVENTORY.md`, `docs/flows/FLOW-DIAGRAMS.md`, `docs/flows/TRACEABILITY-MATRIX.md`, `docs/flows/ZERO-OMISSION-CERTIFICATE.md`
- **Frameworks:** Bulletproof Gates (mathematical screen coverage proof), Mobbin-style mapping
- **Dependencies:** Step 3 (UX-DESIGN.md, USER-JOURNEYS.md)

### Step 5: Wireframe Prototypes
Generates detailed wireframe PRDs with ASCII wireframes, component specs, and interaction descriptions for each screen flow. Optionally produces a runnable prototype.

- **Outputs:** `docs/wireframes/WIREFRAME-SPEC.md`, `docs/wireframes/LANDING-PAGE-WIREFRAME.md`, `docs/prds/flows/FLOW-[ID]-[NAME].md`
- **Frameworks:** Component-level wireframing, wireframe tracker for coverage
- **Dependencies:** Step 4 (FLOW-TREE.md, SCREEN-INVENTORY.md)

### Step 6: Design System
Visual specifications with design tokens (colors, typography, spacing, shadows, motion), component patterns, and accessibility standards.

- **Outputs:** `docs/design/DESIGN-SYSTEM.md`, `docs/tokens/DESIGN-TOKENS.md`
- **Frameworks:** Design Systems Architect persona, token-based design, WCAG accessibility
- **Dependencies:** Step 5 (wireframes define component needs)

### Step 7: Interface States
Comprehensive state specifications covering every component state: empty, loading, error, success, partial, disabled, hover, focus. Includes micro-interactions and transition definitions.

- **Outputs:** `docs/states/STATE-SPEC.md`, `docs/states/MICRO-INTERACTIONS.md`
- **Frameworks:** Staff UX Lead persona, complete state coverage methodology
- **Dependencies:** Step 6 (DESIGN-SYSTEM.md defines visual language for states)

### Step 8: Technical Specification
The most comprehensive spec. Combines all previous steps into a single development-ready technical blueprint covering API design, database schema, auth flows, error handling, and deployment architecture.

- **Outputs:** `docs/technical/TECHNICAL-SPEC.md`
- **Frameworks:** Distinguished Engineer persona, full-stack blueprint methodology
- **Dependencies:** Steps 1-7 (all prior documentation)

### Step 9: Landing Page (Optional)
High-converting landing page copy with customer avatars, emotional diary entries, CRO tactics, and Cialdini persuasion principles.

- **Outputs:** `docs/landing-page/LANDING-PAGE-COPY.md`, `docs/avatars/PROBLEM-AWARE-AVATAR.md`, `docs/avatars/DIARY-ENTRIES.md`
- **Frameworks:** Conversion copywriting, Cialdini principles, customer avatar methodology
- **Dependencies:** Step 1 (MASTER_PRD.md for positioning)

### Step 10: Feature Breakdown
Shapes features using Shape Up methodology, story mapping, and INVEST criteria. Produces a prioritized betting table with complexity estimates and dependency analysis.

- **Outputs:** `docs/implementation/FEATURE-BREAKDOWN.md`
- **Frameworks:** Shape Up (Basecamp), Story Mapping, INVEST criteria, betting table
- **Dependencies:** Steps 1-8 (full specification context)

### Step 11: PRD Generation
Creates implementation-ready PRDs (600-1000 lines each) for every shaped feature. Each PRD is a vertical slice containing database schema, server actions, UI components, tests, and BDD scenarios. Full-stack, security-first, agentic-ready.

- **Outputs:** `docs/prds/F[N]-[FEATURE-NAME].md` (one per feature)
- **Frameworks:** PR/FAQ, BDD (Behavior-Driven Development), OWASP security, vertical slice architecture
- **Dependencies:** Step 10 (FEATURE-BREAKDOWN.md)

### Step 12: Context Engine
Generates AI context rules that encode all project decisions into platform-specific configuration files. Creates the master context router and domain-specific rules.

- **Outputs:** `.cursorrules`, `.cursor/rules/*.mdc`, `.codex/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`
- **Frameworks:** Context engineering, modular rule synthesis
- **Dependencies:** Steps 1-11 (all project documentation)

### Step 13: Skillpack Generator
Generates project-specific overlay skills that build on foundation skills. Creates auto-triggering, project-constrained skill modules for frontend aesthetics, backend engineering, and database modeling.

- **Outputs:** Platform-specific skills (`.cursor/rules/`, `.claude/skills/`, `.codex/skills/`)
- **Frameworks:** Three-tier skill system (Foundation + External + Project Overlays)
- **Dependencies:** Step 12 (context engine outputs)

---

## How to Run a Step

### Pre-flight checks
1. Verify previous steps are complete. Load their primary output files and confirm they exist and contain substantive content.
2. If a required input file is missing, inform the user and offer to run the prerequisite step first.

### Execution
1. Announce the step number, name, and what it will produce.
2. Execute the step's phases in sequential order.
3. At each `>>> CHECKPOINT`, STOP. Present your work to the user. Wait for explicit approval before continuing.
4. Produce all listed output files in the canonical paths specified below.
5. After completing all phases, summarize what was produced and confirm readiness for the next step.

### Running WITHOUT the CLI
If the user does not have the Sigma CLI installed, you can still run the full workflow:
1. Read the step file from GitHub: `https://raw.githubusercontent.com/dallionking/sigma-protocol/main/steps/step-N-name` (where `step-N-name` matches the filename, e.g., `step-1-ideation`, `step-4-flow-tree`).
2. Follow the phases described in the step file manually.
3. Create all output files at the canonical paths listed in this guide.
4. Respect all checkpoint markers -- stop and wait for user approval.

### Running WITH the CLI
```bash
# Initialize Sigma in a project
sigma init

# Install all skills and commands
sigma install --all

# Then invoke steps as commands
/step-1-ideation
/step-2-architecture
# ... and so on
```

### GitHub Raw URL Pattern
```
https://raw.githubusercontent.com/dallionking/sigma-protocol/main/steps/<step-filename>
```

Step filenames:
- `step-0-environment-setup`
- `step-1-ideation`
- `step-1.5-offer-architecture`
- `step-2-architecture`
- `step-3-ux-design`
- `step-4-flow-tree`
- `step-5-wireframe-prototypes`
- `step-6-design-system`
- `step-7-interface-states`
- `step-8-technical-spec`
- `step-9-landing-page`
- `step-10-feature-breakdown`
- `step-11-prd-generation`
- `step-12-context-engine`
- `step-13-skillpack-generator`

---

## Canonical File Paths

All step outputs MUST be written to these exact paths relative to the project root.

### Step 0: Environment Setup
- No persistent files (validation only)

### Step 1: Ideation
- `/docs/stack-profile.json` -- CRITICAL: stack decisions consumed by all later steps
- `/docs/specs/MASTER_PRD.md`
- `/docs/specs/FEATURES.md`
- `/docs/specs/USP.md`
- `/docs/specs/NFRS.md`
- `/docs/specs/DEV-READINESS.md`
- `/docs/ops/SUCCESS-METRICS.md`

### Step 1.5: Offer Architecture (Conditional)
- `/docs/specs/OFFER_ARCHITECTURE.md`
- `/docs/specs/pricing-config.json`

### Step 2: Architecture
- `/docs/architecture/ARCHITECTURE.md`
- `/docs/database/SCHEMA.md`
- `/docs/api/API-SPEC.md`
- `/docs/security/SECURITY.md`

### Step 3: UX Design
- `/docs/ux/UX-DESIGN.md` -- PRIMARY
- `/docs/design/INSPIRATION.md`
- `/docs/design/EXTRACTED-PATTERNS.md`
- `/docs/journeys/USER-JOURNEYS.md`
- `/docs/journeys/STATE-COVERAGE.md`
- `/docs/ux/WIREFRAMES.md`

### Step 4: Flow Tree
- `/docs/flows/FLOW-TREE.md` -- PRIMARY
- `/docs/flows/SCREEN-INVENTORY.md`
- `/docs/flows/FLOW-DIAGRAMS.md`

### Step 5: Wireframe Prototypes
- `/docs/wireframes/WIREFRAME-SPEC.md` -- PRIMARY
- `/docs/wireframes/LANDING-PAGE-WIREFRAME.md`
- `/docs/wireframes/screenshots/[screen-name].png`
- `/docs/prds/flows/FLOW-[ID]-[NAME].md`

### Step 6: Design System
- `/docs/design/DESIGN-SYSTEM.md` -- PRIMARY
- `/docs/tokens/DESIGN-TOKENS.md`

### Step 7: Interface States
- `/docs/states/STATE-SPEC.md` -- PRIMARY
- `/docs/states/MICRO-INTERACTIONS.md`

### Step 8: Technical Specification
- `/docs/technical/TECHNICAL-SPEC.md` -- PRIMARY

### Step 9: Landing Page (Optional)
- `/docs/landing-page/LANDING-PAGE-COPY.md` -- PRIMARY
- `/docs/avatars/PROBLEM-AWARE-AVATAR.md`
- `/docs/avatars/DIARY-ENTRIES.md`

### Step 10: Feature Breakdown
- `/docs/implementation/FEATURE-BREAKDOWN.md` -- PRIMARY

### Step 11: PRD Generation
- `/docs/prds/F[N]-[FEATURE-NAME].md` -- one file per feature

### Step 12: Context Engine
- `.cursorrules`
- `.cursor/rules/*.mdc`
- `.codex/skills/*/SKILL.md` (if Codex detected)
- `.claude/skills/*/SKILL.md` (if Claude Code detected)

### Step 13: Skillpack Generator
- Platform-specific skill files in `.cursor/rules/`, `.claude/skills/`, `.codex/skills/`, or `.opencode/skill/`

---

## Quality Gates

### 100-Point Verification System
Each step is scored across 5 dimensions:

| Category | Points | What It Checks |
|----------|--------|----------------|
| File Existence | 20 | Required output files exist and meet minimum size |
| Section Completeness | 30 | Required sections present in documents |
| Content Quality | 30 | Tables, diagrams, code blocks, specificity |
| Checkpoints | 10 | HITL checkpoints were completed |
| Success Criteria | 10 | Step-specific success criteria met |

### Score Thresholds
| Score | Grade | Action |
|-------|-------|--------|
| 90-100 | A/A+ | Ready for next step |
| 80-89 | B+ | Acceptable, fix before proceeding recommended |
| 70-79 | B | Needs work, fix gaps before proceeding |
| Below 70 | C/F | Incomplete, re-run the step |

**Target: 80+ on every step before proceeding.**

### Running Verification
To verify a step, check that all required output files exist, contain substantive content (not stubs), include all required sections, and meet the step's success criteria. If running with the CLI, use `@step-verify --step=N`.

---

## Ralph Loop -- Autonomous Implementation

After completing the planning and design phases, Ralph (Rapid Autonomous Loop for Product Handling) can implement features autonomously from your PRD backlog.

### Entry Points

| Entry Point | After Step | What It Implements |
|-------------|------------|-------------------|
| Prototype | Step 5 | Wireframe PRDs from `docs/prds/flows/` |
| Full Implementation | Step 11 | Feature PRDs from `docs/prds/` |

### Usage

**1. Convert PRDs to JSON backlog:**
```bash
# Prototype mode (after Step 5)
/prd-json --input docs/prds/flows/ --output docs/ralph/prototype/prd.json

# Implementation mode (after Step 11)
/prd-json --input docs/prds/ --output docs/ralph/implementation/prd.json
```

**2. Run the Ralph loop:**
```bash
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

**3. Optional -- parallel swarms for large projects (10+ PRDs):**
```bash
# Split into independent swarms
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-1/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-2/prd.json claude-code &
```

### How Ralph Works
1. Reads the JSON backlog and identifies the next highest-priority PRD
2. Checks dependencies (blocks until dependent PRDs complete)
3. Spawns an AI coding session with the PRD context
4. Monitors task completion and runs quality gates
5. Marks the PRD as complete and moves to the next one
6. Repeats until the backlog is empty

---

## For Non-Technical Users

You do not need to understand code to use Sigma Protocol. Here is what to expect:

- **You will be asked business questions**, not technical ones. What does your product do? Who is it for? What problem does it solve? How will you charge for it?
- **Approve or request changes at each checkpoint.** The AI will stop and show you its work at every major decision point. Say "approved" to continue or describe what you want changed.
- **The AI handles all technical specification.** Architecture, database design, API specs, component definitions -- all generated from your business answers.
- **You can pause and resume between steps.** Each step produces files that serve as the starting point for the next step. Come back tomorrow and pick up where you left off.
- **Steps 9 (Landing Page) and 1.5 (Offer Architecture) are optional/conditional.** Skip them if they do not apply to your project.

---

## For Developers

- **Each step produces markdown specs any developer can implement from.** The output is not locked into any specific framework or tool.
- **PRDs in Step 11 are implementation-ready** with TypeScript interfaces, SQL DDL, Zod schemas, BDD scenarios, component signatures, and acceptance criteria. Each PRD is a vertical slice (database through UI through tests).
- **Use Ralph Loop for autonomous implementation.** After Step 5 (prototype) or Step 11 (full), convert PRDs to JSON and run `./ralph/sigma-ralph.sh` to implement features in a continuous loop.
- **Context Engine (Step 12) generates project-specific AI rules.** These encode all your architectural decisions into `.cursorrules`, `.mdc` files, or platform-specific skills so every future AI session follows your conventions.
- **Skillpack Generator (Step 13) creates overlay skills** for frontend aesthetics, backend engineering, and database modeling that auto-trigger based on file patterns and keywords.
- **Verification is built in.** Run `@step-verify --step=N` to get a 100-point quality score on any step's outputs. Use `--fix` for automatic gap remediation.

---

## Important Notes

- Steps are numbered 0 through 13, with a conditional Step 1.5 between Steps 1 and 2.
- Step 9 (Landing Page) is optional. Step 1.5 (Offer Architecture) is conditional on monetization.
- There is no step-5b, step-11a, or step-11b in the core workflow. PRD-to-JSON conversion uses the `/prd-json` command.
- Ralph script path: `./ralph/sigma-ralph.sh` (at repository root, not under `./scripts/`).
- GitHub repository: `dallionking/sigma-protocol`
- All file paths in this guide are relative to the project root unless otherwise noted.
