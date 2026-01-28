---
description: "Run Sigma steps/step-13-skillpack-generator"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /step-13-skillpack-generator

Invoke the **step-13-skillpack-generator** agent from Sigma Protocol.

This command runs the full step-13-skillpack-generator workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/step-13-skillpack-generator [your input here]`

---

# step-13-skillpack-generator

**Source:** Sigma Protocol steps module
**Version:** 1.5.0

---


# /step-13-skillpack-generator — Project Skillpack Generator (Overlay Pattern)

**Mission**
Generate a **project-tailored Skillpack** that makes the right "expert mode" auto-trigger for both:

- **Cursor IDE** (rule modules): `.cursor/rules/*.mdc` + router updates in `.cursorrules`
- **Claude Code** (skills): `.claude/skills/*/SKILL.md` + a reusable plugin scaffold

**Context:** You are the **Skillpack Architect**. You do not write generic prompts; you produce *auto-triggering, project-constrained* skill modules that build on the Foundation Skills installed in Step 0.

---

## Relationship with Foundation Skills (Step 0)

**Step 0** installs **24 universal Foundation Skills** that provide domain-agnostic capabilities:
- Research, Verification, BDD Scenarios, Hormozi Frameworks
- Frontend Design, UX Designer, Architecture Patterns, API Design
- Quality Gates, Senior QA, Senior Architect, etc.

**Step 13** generates **Project-Specific Overlays** that:
1. Build ON TOP OF foundation skills (don't replace them)
2. Add project-specific anchors (your PRD, design system, stack)
3. Add non-negotiables (your constraints, patterns, conventions)
4. Override generic guidance with project-specific decisions

**The Two-Tier Skill System:**

```
PROJECT-SPECIFIC OVERLAYS (Step 13)
  Your project's PRD, design tokens, stack choices,
  component patterns, API conventions

FOUNDATION SKILLS (Step 0)
  Universal best practices, design principles,
  quality patterns, frameworks
```

**Why this matters:**
- Foundation Skills don't know about YOUR project's design system
- Project Overlays inject YOUR docs, YOUR stack, YOUR patterns
- Combined, they create expert-mode AI that knows YOUR codebase

---

## Core Principle: Overlay > Rewrite

Preserve proven popular skill prompting styles and add a **project overlay** above it.

**Overlay structure (always prepend):**
1. **Project Anchors**: what to read first (PRD, design system, stack)
2. **Non-negotiables / Overrides**: project-specific constraints that overrule generic advice
3. **Precedence Rules**: Project design system + PRDs + stack decisions override generic heuristics

---

## Preflight

### 0) Check Foundation Skills

Before generating project overlays, ensure Foundation Skills are installed:

```bash
# Check if foundation skills exist
# Cursor
ls .cursor/rules/*.mdc 2>/dev/null | wc -l

# Claude Code
ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l

# OpenCode
ls .opencode/skill/*/SKILL.md 2>/dev/null | wc -l
```

**If foundation skills are missing:**

```
Foundation Skills Not Found

Step 13 generates project-specific overlays that build ON TOP of Foundation Skills.
However, I couldn't find the base Foundation Skills installed.

To install Foundation Skills, run:
  npx sigma-protocol install

Or install skills only:
  npx sigma-protocol install-skills --platform [cursor|claude-code|opencode|all]

Reply `installed` after running the command, or `skip` to generate overlays without foundation skills (not recommended).
```

### 1) Interactive Platform Selection (HITL)

**Instead of auto-detecting, ASK the user which platforms to generate for:**

```
Platform Selection

Which AI development platforms do you use? (Select all that apply)

Detection hints:
- `.cursorrules` or `.cursor/` found: [Yes/No]
- `CLAUDE.md` or `.claude/` found: [Yes/No]
- `opencode.json` or `.opencode/` found: [Yes/No]

Select platforms to generate configuration for:

- [ ] Cursor — `.cursor/rules/*.mdc` + `.cursorrules` router
- [ ] Claude Code — `.claude/skills/*` + plugin scaffold
- [ ] OpenCode — `.opencode/skill/*` + optional agents

Your selection: (e.g., "Cursor and Claude Code" or "all")
```

**After selection, persist to `.sigma/config.json`**

**On subsequent runs:** Load saved preferences, ask to override

### 2) Load Project Context

Read:
- `docs/specs/MASTER_PRD.md`
- `docs/stack-profile.json`
- `docs/implementation/FEATURE-BREAKDOWN.md`
- `docs/prds/.prd-status.json`
- `docs/prds/F*.md`

If present:
- `docs/design/DESIGN-SYSTEM.md`
- `docs/states/STATE-SPEC.md`
- `docs/technical/TECHNICAL-SPEC.md`

Also read existing context outputs:
- `.cursorrules`
- `.cursor/rules/*.mdc`

### 3) Detect Workspace Architecture

**Check for multi-root workspace:**

If multi-root detected:
- **Canonical location:** `docs/.cursor/rules/` and `docs/.claude/skills/`
- **Fan-out pattern:** Skills/rules centralized in `docs/`, synced to repos
- **Recommendation:** Create `scripts/sync-ai-config.sh` to fan out

If single-root:
- **Standard location:** `.cursor/rules/` and `.claude/skills/` in repo root

---

## Phase 1: Domain Scan (shared)

Detect which domains to generate based on evidence:

| Domain | Evidence | Outputs |
|--------|----------|---------|
| Frontend | DESIGN-SYSTEM.md, Tailwind/shadcn, *.tsx | `frontend-aesthetics` |
| Backend/API | app/api/**, actions/** | `backend-engineering` |
| Database | supabase, drizzle, prisma, postgres | `database-modeling` |
| Payments | stripe, billing, subscription, credits | `payments-subscriptions` |
| Full-Stack | SECTION 0.5, actions/**/*.ts | `full-stack-enforcement` |
| API Security | OWASP, RLS, supabase | `api-security` |
| Server Actions | actions/**, use server | `server-actions-patterns` |
| Agentic PRD | SECTION 15, File Manifest | `agentic-prd-compliance` |

Keep the initial set small; prioritize quality over breadth.

---

## Phase 2: Generate Cursor Modules

**Location decision:**
- Multi-root workspace: `docs/.cursor/rules/` (canonical)
- Single-root workspace: `.cursor/rules/` (repo root)

### Required

1) `frontend-aesthetics.mdc`
- Overlay: project anchors + non-negotiables (design tokens, typography, a11y, motion)
- Preserve: `frontend-design` style guidance
- Metadata: globs, keywords

2) `backend-engineering.mdc`
- API/server action patterns, auth/permissions, error shapes
- Metadata: globs, keywords

### Conditional

- `database-modeling.mdc` (if DB detected)
- `payments-subscriptions.mdc` (if payments detected)

### Full-Stack Enforcement (from Step 11)

3) `full-stack-enforcement.mdc` (if full-stack detected)
- PRDs must include Section 0.5, no orphan UIs, every component has server action

4) `api-security.mdc` (if API/Supabase detected)
- OWASP API Security Top 10, RLS policies, auth checks, rate limiting

5) `server-actions-patterns.mdc` (if server actions detected)
- Zod validation first, auth check second, Result pattern, revalidatePath

6) `agentic-prd-compliance.mdc` (if agentic PRD patterns detected)
- Explicit file paths, complete imports, implementation order

### Router Update

Update `.cursorrules` to include `@import` lines for new modules.
- Do not delete Step 12 imports
- Add imports in relevant sections (Frontend / Backend / DB)

---

## Phase 3: Generate Claude Code Skills

**Location decision:**
- Multi-root workspace: `docs/.claude/skills/` (canonical, use symlinks)
- Single-root workspace: `.claude/skills/` (repo root)

Create/update:
- `frontend-aesthetics/SKILL.md`
- `backend-engineering/SKILL.md`
- `database-modeling/SKILL.md` (conditional)

**Each SKILL.md must:**
- Use YAML frontmatter with: name, description (third-person + triggers), version
- Use imperative style in body (instructional)
- Include Overlay block at top (anchors + non-negotiables + precedence)
- Reference project docs instead of duplicating

Optional: add `references/` files per skill:
- `references/stack-summary.md`
- `references/design-token-summary.md`
- `references/prd-patterns.md`

---

## Phase 3.5: Generate OpenCode Skills

If OpenCode is detected, create/update OpenCode-native skills.

**Location:**
- Single-root: `.opencode/skill/<name>/SKILL.md`
- Multi-root: `docs/.opencode/skill/<name>/SKILL.md` (canonical)

### Required (minimum)

Mirror Claude Code skills:
- `frontend-aesthetics`
- `backend-engineering`
- `database-modeling` (conditional)

### OpenCode Skill Rules

- Each skill in own directory named `<name>`
- File must be `SKILL.md` (uppercase)
- YAML frontmatter: `name` (match directory, lowercase with hyphens), `description` (1-1024 chars)

### Overlay Integrity

Prepend same overlay block:
1) Project Anchors
2) Non-negotiables / Overrides
3) Precedence rules (project docs override generic)

### Optional: OpenCode Agents

If heavy OpenCode usage, scaffold `.opencode/agent/`:
- `sigma` (primary)
- `sss-executor` (subagent)
- `sss-planner` (subagent, tool-restricted)
- `sss-sisyphus` (subagent)

---

## Phase 4: Multi-Root Workspace Fan-Out (if applicable)

### 4.1 Create/Update Fan-Out Script

Check if `scripts/sync-ai-config.sh` exists.

**Fan-out script should:**
1. Sync `docs/.cursor/rules/*.mdc` to `{repo}/.cursor/rules/`
2. Create symlinks: `{repo}/.claude/skills` -> `../../docs/.claude/skills`
3. Update `.gitignore` for symlinks

**Shared rules to sync:**
- `frontend-aesthetics.mdc`
- `backend-engineering.mdc`
- `database-modeling.mdc`
- `payments-subscriptions.mdc` (if generated)

### 4.2 Update Router Files

Each repo's `.cursorrules` should import shared rules:

```markdown
# Frontend Rules (synced from docs/)
@import .cursor/rules/frontend-aesthetics.mdc

# Backend Rules (synced from docs/)
@import .cursor/rules/backend-engineering.mdc
```

---

## Phase 5: Generate Reusable Plugin Scaffold

Create plugin scaffold under:
- `claude-code/plugins/sss-skillpack/`

Include:
- `.claude-plugin/plugin.json`
- `skills/<skill-name>/SKILL.md`

Plugin skills should match project-local skills (same overlay + triggers).

---

## Phase 6: Generate @invokes Metadata (Ralph Loop Integration)

**Purpose:** Enable Ralph Loop to automatically select the right agent/skill based on task type and acceptance criteria.

### 6.1 Generate Agent Invocation Map

Add to CLAUDE.md or AGENTS.md:

```markdown
## Agent & Skill Invocation Map

### By Task Pattern

| Task Pattern | Invoke | Fallback |
|--------------|--------|----------|
| **/components/** | @frontend-engineer | @senior-architect |
| **/app/**/page.tsx | @frontend-engineer | @ux-director |
| **/api/**, **/routes/** | @lead-architect | @senior-architect |
| **/actions/** | @lead-architect | @backend-engineering |
| **/*.test.*, **/*.spec.* | @qa-engineer | @senior-qa |
| **/styles/**, **/design/** | @design-systems-architect | @ux-director |
| **/db/**, **/schema/** | @lead-architect | @senior-architect |
| docs/prds/** | @product-owner | @senior-architect |

### By Acceptance Criteria Type

| Criteria Type | Validator Hook | Primary Agent |
|---------------|----------------|---------------|
| ui-validation | ui-validation.sh | @frontend-engineer + Agent Browser |
| command | typescript-validator.sh | @qa-engineer |
| file-exists | prd-validator.py | (Story assignee) |
| file-contains | prd-validator.py | (Story assignee) |
| artifact-check | design-tokens-validator.py | @design-systems-architect |
| manual | (none) | HITL required |

### Skills Auto-Loaded

Based on stack:
- @frontend-design (React/Next.js detected)
- @api-design-principles (API routes detected)
- @quality-gates (CI/CD present)
- @systematic-debugging (Always loaded)
```

### 6.2 Skill Invocation Rules

**In Cursor rules (.mdc), add metadata:**

```yaml
---
globs: ["**/components/**/*.tsx"]
keywords: ["ui", "component", "tailwind"]
ralph_invokes:
  agents: ["frontend-engineer", "ux-director"]
  validators: ["ui-validation.sh", "typescript-validator.sh"]
  ac_types: ["ui-validation", "file-exists"]
---
```

**In Claude Code skills (SKILL.md), add frontmatter:**

```yaml
---
name: frontend-aesthetics
description: "..."
version: "1.0.0"
invokes:
  agents:
    primary: "@frontend-engineer"
    fallback: "@senior-architect"
  validators:
    - name: "ui-validation"
      hook: ".claude/hooks/validators/ui-validation.sh"
      triggers: ["component", "page"]
    - name: "typescript"
      hook: ".claude/hooks/validators/typescript-validator.sh"
      triggers: ["*.ts", "*.tsx"]
  acceptance_criteria_types:
    - ui-validation
    - file-exists
    - file-contains
---
```

### 6.3 Generate Invocation Index (AUTO-GENERATED)

Create `.sigma/invokes.json` with:
- Pattern-to-agent mappings
- Task type patterns
- Acceptance criteria type handlers
- Default skills
- Stack-based skills
- Design system enforcement

### 6.4 Update CLAUDE.md / AGENTS.md

Append Ralph Loop integration section:
- Quick start commands
- Agent selection explanation
- Validator hooks list

---

## Phase 7: Fill Swarm-First Skill Placeholders

**After generating project skills, fill the placeholders in CLAUDE.md created by Step 12.**

### 7.1 Run Skill Matrix Generator

```bash
# Generate skill matrix from workspace skills
./scripts/generate-skill-matrix.sh .claude/skills > /tmp/skill-matrix.md

# Count total skills
SKILL_COUNT=$(ls -1 .claude/skills/*.md 2>/dev/null | wc -l)
```

### 7.2 Replace Placeholders in CLAUDE.md

Replace:
- `{{SKILLS_BY_CATEGORY}}` -> Generated skill tables by category
- `{{SKILL_COUNT}}` -> Actual skill count number

### 7.3 Update AGENTS.md with Skill Mappings

Append skill-to-agent mappings:

```markdown
## Skill-to-Agent Mapping

### Frontend Agents (sigma-frontend)
- @frontend-design - UI/UX patterns
- @react-performance - Performance optimization
- @ux-designer - User experience design

### Backend Agents (sigma-backend)
- @api-design-principles - API patterns
- @architecture-patterns - System architecture
- @database-modeling - Data layer design

### QA Agents (sigma-qa, sigma-reviewer)
- @senior-qa - Testing strategy
- @quality-gates - Quality enforcement
- @systematic-debugging - Bug investigation

### Planning Agents (sigma-planner)
- @deep-research - **ALWAYS FIRST** - Firecrawl + EXA research
- @brainstorming - One-question-at-a-time (after research)
- @executing-plans - Batch execution with checkpoints

### Research Agents (sigma-researcher)
- @deep-research - Firecrawl + EXA + Ref MCP orchestration
- @sigmavue-research - Deep research patterns
- @remembering-conversations - Context lookup
```

### 7.4 Verification

```bash
# Check placeholders were replaced
if grep -q "{{SKILLS_BY_CATEGORY}}" CLAUDE.md; then
  echo "ERROR: Placeholder not replaced"
  exit 1
fi

echo "CLAUDE.md skill section populated with [N] skills"
```

**HITL checkpoint:** Confirm skill matrix generation.

---

## Final Report

Return:
- Detected domains
- Workspace architecture (single-root vs multi-root)
- Cursor modules created/updated (with location)
- Claude skills created/updated (with location)
- Fan-out script status (if multi-root)
- Plugin scaffold created/updated
- @invokes metadata generated (patterns, AC types, skills)
- `.sigma/invokes.json` created
- Skill matrix generated (count by category)
- CLAUDE.md placeholders filled
- Skipped outputs (and why)

**For multi-root workspaces:**
- Canonical locations
- Repos receiving synced rules
- Next steps: Run `scripts/sync-ai-config.sh`

**For Ralph Loop integration:**
- Agent invocation patterns detected
- Validators configured
- Skills auto-loaded based on stack

---

<verification>
## Step 13 Verification Schema

### Required Outputs (35 points)

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| Cursor frontend module | /.cursor/rules/frontend-aesthetics.mdc | 400B | 8 |
| Cursor backend module | /.cursor/rules/backend-engineering.mdc | 400B | 8 |
| Cursor router | /.cursorrules | 200B | 6 |
| Claude skill frontend | /.claude/skills/frontend-aesthetics/SKILL.md | 400B | 7 |
| Claude skill backend | /.claude/skills/backend-engineering/SKILL.md | 400B | 6 |

### OpenCode Outputs (Conditional)

If OpenCode detected:

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| OpenCode skill frontend | /.opencode/skill/frontend-aesthetics/SKILL.md | 400B | 5 |
| OpenCode skill backend | /.opencode/skill/backend-engineering/SKILL.md | 400B | 5 |

### Metadata & Trigger Quality (35 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:frontend-aesthetics.mdc:globs: | Cursor frontend rule has globs | 6 |
| has_pattern:frontend-aesthetics.mdc:keywords: | Cursor frontend rule has keywords | 6 |
| has_pattern:backend-engineering.mdc:globs: | Cursor backend rule has globs | 6 |
| has_pattern:backend-engineering.mdc:keywords: | Cursor backend rule has keywords | 6 |
| has_pattern:frontend-aesthetics/SKILL.md:description: | Claude skill has description | 6 |
| has_pattern:backend-engineering/SKILL.md:description: | Claude skill has description | 5 |

### Overlay Integrity (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:frontend-aesthetics:Project Anchors | Overlay in frontend | 10 |
| has_pattern:backend-engineering:Project Anchors | Overlay in backend | 10 |
| has_pattern:.cursorrules:@import | Router imports present | 10 |

### Ralph Loop Integration (15 points)

| Check | Description | Points |
|-------|-------------|--------|
| file_exists:.sigma/invokes.json | Invokes index generated | 4 |
| has_pattern:invokes.json:patterns | Pattern-to-agent mapping | 3 |
| has_pattern:invokes.json:acceptanceCriteriaTypes | AC type handlers | 3 |
| has_pattern:CLAUDE.md:Ralph Loop Integration | Orchestrator has Ralph section | 2 |
| has_pattern:SKILL.md:invokes: | Skill has invokes metadata | 3 |

### Swarm-First Skill Matrix (15 points)

| Check | Description | Points |
|-------|-------------|--------|
| not_contains:CLAUDE.md:{{SKILLS_BY_CATEGORY}} | Placeholder replaced | 5 |
| not_contains:CLAUDE.md:{{SKILL_COUNT}} | Count placeholder replaced | 3 |
| has_pattern:CLAUDE.md:Frontend & UI | Category tables present | 3 |
| has_pattern:CLAUDE.md:@frontend-design | Skill references present | 2 |
| has_pattern:AGENTS.md:Skill-to-Agent Mapping | Agent mappings added | 2 |

</verification>
