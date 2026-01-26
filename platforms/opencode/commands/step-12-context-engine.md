---
description: "Run Sigma steps/step-12-context-engine"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /step-12-context-engine

Invoke the **step-12-context-engine** agent from Sigma Protocol.

This command runs the full step-12-context-engine workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/step-12-context-engine [your input here]`

---

# step-12-context-engine

**Source:** Sigma Protocol steps module
**Version:** 4.2.0

---


# /step-12-context-engine — Context Engine & Rule Synthesizer

**Mission**
Generate a sophisticated **Context Router** (`.cursorrules`) and a suite of **Domain-Specific Rules** (`.mdc` files).

**Context:** You are the **Chief Context Engineer**. You don't just dump text; you architect *how* the AI behaves by creating a modular, intelligent rule system.

---

## OpenCode Dual-Generation (If OpenCode detected)

If OpenCode is detected, **also** generate OpenCode-native artifacts in addition to Cursor outputs.

### Detection

Treat OpenCode as "in use" if **any** of these are true:
- `opencode.json` or `opencode.jsonc` exists in repo root
- `.opencode/` directory exists
- User explicitly asks for "OpenCode support"

### Outputs (when detected)

#### 1) `opencode.jsonc` (project root)

Generate (or update) with:
- `$schema`: `https://opencode.ai/config.json`
- `default_agent`: `sigma`
- `model`: `anthropic/claude-opus-4-5`
- `small_model`: `anthropic/claude-haiku-4-5`
- `plugin`: include pinned `@sss/opencode@<version>`
- `instructions`: include `AGENTS.md` and `.cursorrules`
- `mcp`: mirror MCP servers for Cursor

#### 2) `.opencode/agent/` (project-specific agents)

Generate these agent files (minimum):
- `sigma.md` (mode: `primary`) — orchestrator
- `sigma-executor.md` (mode: `subagent`) — implementation
- `sigma-planner.md` (mode: `subagent`) — planning
- `sigma-explorer.md` (mode: `subagent`) — exploration
- `sigma-sisyphus.md` (mode: `subagent`) — verification loops
- `sigma-copywriter.md` (mode: `subagent`) — marketing copy

**Important:** Agent name comes from filename. Do not include `name:` in frontmatter.

#### 3) `.opencode/command/` (Sigma command coverage)

Generate one OpenCode command per Sigma command.

**Model routing (deterministic table):**
- `marketing/*` -> `opencode/kimi-k2`
- `audit/*` -> `anthropic/claude-opus-4-5`
- `dev/plan` + `ops/sprint-plan` + `ops/backlog-groom` + `ops/qa-plan` -> `openai/gpt-5.2-xhigh`
- `dev/implement-prd` + `generators/*` + `deploy/*` -> `anthropic/claude-opus-4-5`
- `ops/status` + `ops/daily-standup` + `ops/lint-commands` -> `opencode/minimax-m2.1-free`
- `ops/docs-update` + `generators/api-docs-gen` -> `google/gemini-3-flash-preview`

**Tool name translation (Cursor -> OpenCode):**
- `read_file` -> `read`
- `list_dir` -> `list`
- `glob_file_search` -> `glob`
- `grep` -> `grep`
- `run_terminal_cmd` -> `bash`
- `todo_write` -> `todowrite`
- `apply_patch` -> `patch`

#### 4) `.opencode/skill/` (Sigma skills)

Mirror each Claude skill into `.opencode/skill/<skill-name>/SKILL.md`

**OpenCode skill rules:**
- `SKILL.md` must be uppercase
- Frontmatter must include `name` + `description`
- Skill name must match directory name

---

## Boilerplate Pattern Rules (If Using Sigma Boilerplate)

If project uses a Sigma boilerplate, generate `boilerplate-patterns.mdc`.

### Detection

Check for `.sigma/boilerplate.json`

### Generate boilerplate-patterns.mdc

Enforces:
- Ownership boundaries (boilerplate vs project)
- Extension patterns (wrapper components, hook composition)
- API references (useAuth, useCredits, useSubscription)
- Quality gates (no modifications to boilerplate files)

**HITL checkpoint:** Confirm boilerplate rule generation.

---

## Agentic Layer Tools (Always Generated)

Generate `.sigma/tools/` directory with project-local verification scripts.

These enable Grade 4 "Closed Loop" agentic behavior (Build -> Test -> Fix -> Repeat).

### Detection (Phase 1)

```bash
# 1. Package manager detection (pnpm/yarn/bun/npm)
# 2. Check for TypeScript (tsconfig.json)
# 3. Check for linting (eslint.config.*)
# 4. Check for testing (vitest.config.*, jest.config.*, playwright.config.*)
# 5. Check for formatting (prettier in package.json)
```

### Directory Structure

```
.sigma/
  tools/
    typecheck.sh      # TypeScript compilation
    lint.sh           # Linting
    test.sh           # Test suite
    build.sh          # Production build
    format-check.sh   # Format verification
  memory/
    active_task.md    # Current task state (runtime)
```

### Generated Scripts

Each script:
- Auto-detects package manager
- Runs the appropriate command
- Outputs machine-readable results (`---SIGMA-RESULT---`)
- Returns structured JSON with tool, status, exit_code

**HITL checkpoint:** Confirm agentic tools generation.

---

## Epistemic Reasoning Rules (Always Generated)

Generate `reasoning.mdc` to enforce epistemic caution and anti-sycophancy rules.

### Core Principle

**Default to uncertainty over false confidence.**

### Evidence Requirements

| Claim Type | Required Action |
|------------|-----------------|
| API behavior | Use `mcp_Ref_ref_search_documentation` |
| Library features | Use `mcp_Ref_ref_search_documentation` |
| Code patterns | Use `mcp_exa_get_code_context_exa` |
| Best practices | Use `mcp_exa_web_search_exa` |

### Anti-Sycophancy Rules

- Push back on flawed assumptions
- Don't over-confirm understanding
- Be direct instead of enthusiastic

### Red-Team Thinking

Consider failure modes:
1. Security: How could this be exploited?
2. Performance: What could cause slowdowns?
3. Data integrity: What could corrupt data?
4. Edge cases: What inputs could break this?

### Confidence Levels

| Marker | Meaning |
|--------|---------|
| VERIFIED | Confirmed via documentation or code |
| UNCERTAIN | Reasonable assumption, not verified |
| UNKNOWN | Need to research or ask user |
| UNVERIFIED | MCP unavailable, manual check needed |

**HITL checkpoint:** Confirm reasoning rule generation.

---

## Modular Rules Structure (Claude Code Alignment)

Generate `.sigma/rules/` and `.claude/rules/` directories with modular, topic-specific rules.

### Why Modular Rules?

Claude Code supports path-specific rules using YAML frontmatter with the `paths` field.

### Directory Structure

```
.sigma/
  rules/
    code-style.md           # Coding standards (always active)
    testing.md              # Testing conventions
    frontend.md             # Frontend-specific rules
    backend.md              # Backend-specific rules
    security.md             # Security requirements

.claude/
  rules/
    code-style.md           # Mirrors .sigma for Claude Code
    testing.md              # Claude Code native format
    ...
```

### Rule File Format

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

### Generated Rules

- `code-style.md` — TypeScript conventions, naming, import organization
- `testing.md` — Test file naming, AAA pattern, coverage requirements
- `frontend.md` — Component patterns, state management, performance
- `backend.md` — Server actions, API routes, database
- `security.md` — Authentication, validation, secrets

**HITL checkpoint:** Confirm modular rules generation.

---

## Preflight

1. **Analyze Project:**
   - Read `docs/stack-profile.json` (tech stack)
   - Read `docs/implementation/FEATURE-BREAKDOWN.md` (Step 10 outputs)
   - Read `docs/specs/MASTER_PRD.md` (vision & value prop)

2. **Scan Step 11 PRD Outputs:**
   - Read `docs/prds/.prd-status.json` (PRD registry)
   - Scan `docs/prds/F[N]-*.md` for domain-specific patterns
   - Extract: Appetites, BDD Scenarios, Rabbit Holes, Quality Gates

3. **Scan for Domains:** Check for specific patterns (Payment code? AI code? Mobile code? Wireframe prototypes?)

4. **Create Rules Dir:** `mkdir -p .cursor/rules`

---

## Phase 1: Domain Scanning (The "Context Sensors")

Detect which "Expert Personas" this project needs based on evidence.

**Scan Locations:**
- Code files: `app/**/*.ts`, `app/**/*.tsx`, `components/**/*.tsx`, `actions/**/*.ts`, `lib/**/*.ts`
- Config files: `package.json`, `drizzle.config.ts`, `tailwind.config.ts`
- Docs: `docs/specs/MASTER_PRD.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/prds/*.md`

**Domain Detection Table:**

| Domain | Trigger | Rule to Generate |
|--------|---------|------------------|
| Subscription | stripe, lemon, whop, credits | `credit-subscription-model.mdc` |
| AI/Voice | openai, livekit, assemblyai | `voice-intake-flow.mdc` |
| Database | supabase, drizzle, convex | `data-models-relationships.mdc` |
| Marketing | app/(marketing), landing-page | `marketing-personas.mdc` |
| Design | tailwind, shadcn, framer | `design-system.mdc` |
| Wireframes | /wireframes/ directory | `wireframe-visual-design.mdc` |
| PRD/BDD | Given/When/Then, Appetite: | `prd-generation-algorithm.mdc` |
| Shape Up | Betting Table, Rabbit Holes | `shape-up-workflow.mdc` |
| Animation Quality | 60fps, Animation Budget | `animation-quality.mdc` |
| State Transitions | State Transition Performance | `state-transition-quality.mdc` |
| Bulletproof Gates | TRACEABILITY-MATRIX.md | `prd-traceability.mdc` |
| Backend Completeness | actions/**/*.ts, use server | `backend-completeness.mdc` |
| Agentic Readiness | File Manifest, SECTION 15 | `agentic-readiness.mdc` |
| Full Stack | FULL STACK OVERVIEW | `full-stack-prd-enforcement.mdc` |
| Boilerplate | .sigma/boilerplate.json | `boilerplate-patterns.mdc` |
| Agentic Tools | Any project (always) | `.sigma/tools/` directory |

---

## Phase 2: Modular Rule Generation (The "Expert Modules")

For each detected domain, generate the `.mdc` file using the **Golden Templates**.

### 2.1 Core Rules (Always Generated)
- `project-context.mdc` — Project Name, Vision, Value Prop from MASTER_PRD.md
- `tech-stack.mdc` — Specific versions from stack-profile.json
- `coding-standards.mdc` — TS Strict, Naming Conventions, Testing
- `project-governance.mdc` — Step 1-12 Workflow enforcement

### 2.2 Domain Rules (Conditional)
- `design-system.mdc` — Colors/tokens from DESIGN-SYSTEM.md
- `credit-subscription-model.mdc` — Credit logic and locking
- `marketing-personas.mdc` — Hormozi copy principles
- `wireframe-visual-design.mdc` — Component refinement from wireframes

### 2.3 Animation & State Quality Rules
- `animation-quality.mdc` — 60fps target, GPU properties only, reduced motion
- `state-transition-quality.mdc` — Transition performance, prohibited properties
- `prd-traceability.mdc` — PRD feature-to-screen verification

### 2.4 PRD-Derived Rules
- `prd-generation-algorithm.mdc` — Given/When/Then format
- `shape-up-workflow.mdc` — Appetite limits, Betting Table, Rabbit Holes

### 2.5 Full-Stack Enforcement Rules
- `backend-completeness.mdc` — Server actions, Zod validation, Result pattern, OWASP, RLS
- `agentic-readiness.mdc` — Explicit paths, imports, implementation order
- `full-stack-prd-enforcement.mdc` — Section 0.5, Section 15, Backend Scope

---

## Phase 3: The Master Context Router (.cursorrules)

Generate the root `.cursorrules` file as a **Router** that dynamically imports `.mdc` files.

### Template Structure

```markdown
# === Sigma Context Router ===
# The "Context Engineering Dream" System
# Auto-loads modular rules based on user intent.

# Global Context (Always Active)
# @import .cursor/rules/project-context.mdc

# Technical Stack & Security (Code/Arch)
# @import .cursor/rules/tech-stack.mdc

# Design System & UI (Frontend)
# @import .cursor/rules/design-system.mdc

# Governance & Workflow (Process)
# @import .cursor/rules/project-governance.mdc

# Research & MCPs (Intelligence)
# @import .cursor/rules/research-guidelines.mdc

# Workflow Guide (Steps 1-12)
# @import .cursor/rules/workflow-guide.mdc

---

## MCP Priority
Strategy: Ref (docs) -> Exa (code) | Context7 -> Perplexity (backup)

1. Ref (mcp_Ref): Official docs/API refs
2. Exa (exa): Code examples/real-world usage
3. Context7 (mcp_context7): Backup docs
4. Perplexity (mcp_perplexity-ask): Backup research
5. Supabase (mcp_supabase-mcp-server): DB/Auth specifics
6. 21st.dev (mcp_21st-devmagic): UI components

---

## "Unicorn" Valuation Context ($1B Standard)
- Code: Rigorous, scalable, typed, and tested
- UX: Pixel-perfect, <120s time-to-value, delightful
- Ops: Zero drift documentation, surgical repo hygiene
- Mindset: Hormozi Value Equation

---

## Swarm-First Philosophy

CRITICAL RULE: Never work solo. Always delegate to sub-agents.

### Mandatory Delegation Rules
1. Always spawn sub-agents using Task tool
2. Match agents to domains
3. Invoke skills explicitly (@skill-name)
4. Parallelize when possible

### Agent Registry
| Task Type | Primary Agent | Supporting Agents |
|-----------|---------------|-------------------|
| Planning | sigma-planner | sigma-researcher |
| Code Implementation | sigma-executor | sigma-backend, sigma-frontend |
| Bug Fixes | sigma-executor | sigma-reviewer |
| Research | sigma-researcher | — |
| Verification | sigma-sisyphus | — |
| Testing | sigma-qa | sigma-reviewer |
| Documentation | sigma-docs | sigma-researcher |

### Skills Registry
{{SKILLS_BY_CATEGORY}}

---

## Development Mode (Agentic Layer)

When running @dev-loop or @implement-prd:

1. Read State: Check .sigma/memory/active_task.md
2. Use Tools: Run scripts in .sigma/tools/
3. Self-Correct: If verification fails, run @gap-analysis
4. Update State: Write to .sigma/memory/active_task.md

Loop: Build -> Test -> Fix -> Repeat until green.
```

---

## Phase 3.5: Generate CLAUDE.md with Swarm-First Section

**Always generate or update `CLAUDE.md` with the swarm-first philosophy section.**

### CLAUDE.md Template Structure

```markdown
# [Project Name] - Claude Code Configuration

## Overview
[Extract from MASTER_PRD.md]

## Quick Start
[Project-specific commands]

## Swarm-First Philosophy

CRITICAL RULE: Never work solo. Always delegate to sub-agents.

[Include full swarm-first section]

## Agent Registry
[Include agent registry]

## Skills Registry ({{SKILL_COUNT}} Skills by Category)
{{SKILLS_BY_CATEGORY}}

[Note: Step 13 will replace these placeholders]

## Available Commands
[List project-specific commands]

## Workflow
[Project workflow steps]

## Documentation
[Links to project docs]
```

### Generation Steps

1. Read `templates/claude-md/swarm-first-section.md`
2. Read `templates/claude-md/agent-registry.md`
3. Extract project info from `MASTER_PRD.md`
4. Merge into CLAUDE.md
5. Leave placeholders for Step 13

**HITL checkpoint:** Confirm CLAUDE.md generation.

---

## Phase 4: Execution Logic

1. **Scan:** Identify active domains
2. **Generate Modules:** Write `.mdc` files to `.cursor/rules/`
3. **Generate Router:** Write `.cursorrules` to root
4. **Generate CLAUDE.md:** Write with swarm-first section and placeholders
5. **Verify:** Check that `@import` paths match actual files

---

## Final Review

```
Context Engine initialized.
- Generated [X] Domain Rules.
- Generated Master Context Router.

Your AI is now context-aware. It will auto-load Design rules when doing CSS, and Auth rules when doing Backend.

Reply `approve step 12` to confirm.
```

---

<verification>
## Step 12 Verification Schema

### Required Files (25 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Context Router | /.cursorrules | 200B | 5 |
| Rules Directory | /.cursor/rules/ | exists | 3 |
| Project Context | /.cursor/rules/project-context.mdc | 200B | 4 |
| Tech Stack | /.cursor/rules/tech-stack.mdc | 200B | 3 |
| Design System Rules | /.cursor/rules/design-system.mdc | 200B | 3 |
| CLAUDE.md | /CLAUDE.md | 500B | 7 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| .cursorrules | Global Context | 4 |
| .cursorrules | Technical Stack | 4 |
| .cursorrules | Design System | 4 |
| .cursorrules | Swarm-First Philosophy | 5 |
| CLAUDE.md | Swarm-First Philosophy | 5 |
| CLAUDE.md | Agent Registry | 4 |
| CLAUDE.md | Skills Registry placeholder | 4 |

### Content Quality (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:.cursorrules:@import | Context routing configured | 5 |
| file_count:/.cursor/rules/:3 | At least 3 rule files generated | 5 |
| has_pattern:CLAUDE.md:Never work solo | Swarm mandate present | 5 |
| has_pattern:CLAUDE.md:sigma-planner | Agent registry present | 5 |
| has_pattern:CLAUDE.md:SKILLS_BY_CATEGORY | Skills placeholder for Step 13 | 5 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Router Generated | .cursorrules file exists | 3 |
| Rules Generated | At least 3 .mdc files exist | 3 |
| CLAUDE.md Generated | CLAUDE.md with swarm section exists | 4 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Context Aware | Router references relevant rules | 3 |
| Domain Detection | Conditional rules based on detected domains | 2 |
| Swarm-First | CLAUDE.md has delegation rules | 3 |
| Skills Placeholder | Ready for Step 13 skill injection | 2 |

</verification>
