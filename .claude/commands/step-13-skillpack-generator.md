---
version: "4.1.0"
last_updated: "2026-02-06"
changelog:
  - "4.1.0: Verified sigma-mobile agent generation with 6 mobile skills (react-native-patterns, swiftui-patterns, swift-concurrency, rn-component-library, mobile-ui-testing, platform-design-guidelines), stack-adaptive skill binding, conditional mobile domain detection"
  - "4.0.0: v2.1.33 optimization - skill categorization flags (disable-model-invocation, user-invocable: false), agent color field from matte palette, Claude Code native frontmatter format, SLASH_COMMAND_TOOL_CHAR_BUDGET awareness"
  - "3.1.0: Added agent generation from domain scan - generates .claude/agents/ with project-appropriate agents, binds skills via frontmatter, generates skill-agent registry in CLAUDE.md, security team agent generation"
  - "3.0.0: Enhanced skill frontmatter (context: fork, agent:, allowed-tools:, dynamic context, $ARGUMENTS), skill-agent category mapping"
  - "2.0.0: Claude Code-first refactor - .claude/skills/ is primary output; Cursor .mdc generation is conditional on detection"
  - "1.6.0: Added Codex skill generation (.agents/skills/*) and platform selection support"
  - "1.5.0: Added Full-Stack Enforcement skills (full-stack-enforcement, api-security, server-actions-patterns, agentic-prd-compliance) to align with Step 11 v3.0.0 requirements"
  - "1.4.0: Clarified relationship with Foundation Skills (Step 0) — Step 13 creates project overlays, not foundation skills"
  - "1.3.0: Added interactive platform selection (HITL) with .sigma/config.json persistence"
  - "1.2.0: Added OpenCode skill generation (.opencode/skill/*) + optional OpenCode agents"
  - "1.1.0: Added multi-root workspace mode — centralize skills/rules in docs/.cursor/ with fan-out pattern"
  - "1.0.0: Initial release — Step 13 Skillpack Generator (Cursor + Claude Code)"
description: "Step 13: Project Skillpack Generator — Generates project-specific overlay skills that build on Foundation Skills (installed in Step 0)"
allowed-tools:
  # PRIMARY TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
parameters:
  - --force
---

# /step-13-skillpack-generator — Project Skillpack Generator (Overlay Pattern)

**Mission**
Generate a **project-tailored Skillpack** and **agent team** that makes the right "expert mode" auto-trigger.

**Primary outputs:**
- **Claude Code** (skills): `.claude/skills/*/SKILL.md` + a reusable plugin scaffold
- **Claude Code** (agents): `.claude/agents/*.md` with project-appropriate agents and skill binding
- **Skill-Agent Registry**: Injected into CLAUDE.md for delegation routing

**Secondary outputs (conditional on detection):**
- **Cursor IDE** (rule modules): `.cursor/rules/*.mdc` + router updates in `.cursorrules` (if Cursor detected)
- **OpenCode** (skills): `.opencode/skill/*/SKILL.md` + optional agents (if OpenCode detected)
- **Codex** (skills): `.agents/skills/*/SKILL.md` + optional `.codex/config.toml` (if Codex detected)

**Context:** You are the **Skillpack Architect**. You do not write generic prompts; you produce *auto-triggering, project-constrained* skill modules and purpose-built agents that build on the Foundation Skills installed in Step 0.

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
┌─────────────────────────────────────────────────────────────┐
│                  PROJECT-SPECIFIC OVERLAYS                   │
│  (Created by Step 13 — Your project's PRD, design tokens,   │
│   stack choices, component patterns, API conventions)        │
├─────────────────────────────────────────────────────────────┤
│                    FOUNDATION SKILLS                         │
│  (Installed by Step 0 — Universal best practices,           │
│   design principles, quality patterns, frameworks)           │
└─────────────────────────────────────────────────────────────┘
```

**Why this matters:**
- Foundation Skills don't know about YOUR project's design system
- Project Overlays inject YOUR docs, YOUR stack, YOUR patterns
- Combined, they create expert-mode AI that knows YOUR codebase

---

## Core principle: Overlay > rewrite

Preserve proven popular skill prompting styles (ex: `frontend-design`) and add a **project overlay** above it.

**Overlay structure (always prepend):**
1. **Project Anchors**: what to read first (PRD, design system, stack)
2. **Non‑negotiables / Overrides**: project-specific constraints that overrule generic advice
3. **Precedence Rules**:
   - Project design system + PRDs + stack decisions **override** generic style heuristics

---

## Preflight

### 0) Check Foundation Skills (NEW)

**Before generating project overlays, ensure Foundation Skills are installed:**

```bash
# Check if foundation skills exist
# Cursor
ls .cursor/rules/*.mdc 2>/dev/null | wc -l

# Claude Code
ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l

# OpenCode
ls .opencode/skill/*/SKILL.md 2>/dev/null | wc -l

# Codex
ls .agents/skills/*/SKILL.md 2>/dev/null | wc -l
```

**If foundation skills are missing:**

```markdown
## ⚠️ Foundation Skills Not Found

Step 13 generates project-specific overlays that build ON TOP of Foundation Skills.
However, I couldn't find the base Foundation Skills installed.

**To install Foundation Skills, run:**
```bash
npx sigma-protocol install
```

Or install skills only:
```bash
npx sigma-protocol install-skills --platform [cursor|claude-code|opencode|codex|all]
```

> ⏸️ Reply `installed` after running the command, or `skip` to generate overlays without foundation skills (not recommended).
```

**If skills are found:** Proceed to Platform Selection.

### 1) Interactive Platform Selection (HITL)

**Instead of auto-detecting, ASK the user which platforms to generate for:**

```markdown
## 🎯 Platform Selection

Which AI development platforms do you use? (Select all that apply)

Detection hints:
- `.cursorrules` or `.cursor/` found: [Yes/No]
- `CLAUDE.md` or `.claude/` found: [Yes/No]  
- `opencode.json` or `.opencode/` found: [Yes/No]
- `.codex/` or `.agents/skills/` found: [Yes/No]

**Select platforms to generate configuration for:**

- [ ] **Claude Code** (recommended) — `.claude/skills/*` + plugin scaffold
- [ ] **Cursor** — `.cursor/rules/*.mdc` + `.cursorrules` router
- [ ] **OpenCode** — `.opencode/skill/*` + optional agents
- [ ] **Codex** — `.agents/skills/*` + optional `.codex/config.toml`

**Your selection:** (e.g., "Cursor and Claude Code" or "all")

> ⏸️ Awaiting your response before continuing...
```

**After selection, persist to `.sigma/config.json`:**

```json
{
  "$schema": "./schemas/sigma-config.schema.json",
  "version": "1.0.0",
  "platforms": {
    "cursor": true,
    "claude_code": true,
    "opencode": false,
    "codex": false
  },
  "last_updated": "2026-01-04T12:00:00Z"
}
```

**On subsequent runs:**
- If `.sigma/config.json` exists, load saved preferences
- Show: "Using saved platform selection. Override? [y/N]"
- If user types "y", re-prompt; otherwise use saved config

**Fallback (if no response after 30s):**
- Auto-detect from existing files
- If `.cursorrules` or `.cursor/` exists → generate Cursor modules
- If `CLAUDE.md` or `.claude/` exists → generate Claude Code skills + plugin scaffold
- If `opencode.json` / `opencode.jsonc` exists OR `.opencode/` exists → generate OpenCode skills
- If `.codex/` exists OR `.agents/skills/` exists → generate Codex skills

### 2) Load project context

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
- `.codex/config.toml`
- `.agents/skills/*/SKILL.md`

### 3) Detect workspace architecture

**Check for multi-root workspace:**

```bash
# Check for workspace config files
if [[ -f "sigmavue.config.json" ]] || [[ -f ".code-workspace" ]] || [[ -d "docs/.cursor" ]]; then
  MULTI_ROOT=true
else
  MULTI_ROOT=false
fi

# Check for multiple repos
if [[ -d "backend" && -d "frontend" && -d "docs" ]]; then
  MULTI_ROOT=true
fi
```

**If multi-root detected:**
- **Canonical location:** `docs/.cursor/rules/` and `docs/.claude/skills/`
- **Fan-out pattern:** Skills/rules should be centralized in `docs/` and synced to individual repos
- **Recommendation:** Create or use existing `scripts/sync-ai-config.sh` to fan out to repos

**If single-root:**
- **Standard location:** `.cursor/rules/` and `.claude/skills/` in repo root

---

## Phase 1: Domain scan (shared)

Detect which domains to generate based on evidence:

| Domain | Evidence | Outputs |
|---|---|---|
| Frontend | `docs/design/DESIGN-SYSTEM.md` exists OR stack includes Tailwind/shadcn/Radix OR repo has `**/*.tsx` | Cursor + Claude: `frontend-aesthetics` |
| Backend/API | repo has `app/api/**` or `actions/**` OR PRDs mention endpoints/actions | `backend-engineering` |
| Database | stack mentions `supabase|drizzle|prisma|postgres` OR migrations/schema folders exist | `database-modeling` |
| Payments (conditional) | PRDs/code mention `stripe|billing|subscription|credits` | `payments-subscriptions` |
| **Full-Stack (NEW)** | PRDs contain `SECTION 0.5` or `FULL STACK OVERVIEW` OR `actions/**/*.ts` exist | `full-stack-enforcement` |
| **API Security (NEW)** | PRDs mention `OWASP` or `RLS` OR `supabase` in stack | `api-security` |
| **Server Actions (NEW)** | repo has `actions/**` OR PRDs contain `use server` patterns | `server-actions-patterns` |
| **Agentic PRD (NEW)** | PRDs contain `SECTION 15` or `File Manifest` or `Implementation Order` | `agentic-prd-compliance` |
| **Mobile Development** | `react-native`, `expo` in package.json OR `ios/`, `android/`, `mobile/` directories | Agent: `sigma-mobile` + `sigma-security-mobile` |
| **AI/LLM** | `openai`, `anthropic`, `langchain`, `llm`, `ai-sdk` in package.json/code | Agent: `sigma-security-ai-safety` |
| **Infrastructure** | `Dockerfile`, `docker-compose.*`, `.github/workflows/`, `terraform/` | Agent: `sigma-security-infra` |
| **Compliance** | GDPR/HIPAA/SOC2/PCI mentions in docs, privacy policy files | Agent: `sigma-security-compliance` |

Keep the initial set small; prioritize quality over breadth.

---

## Phase 2: Generate Claude Code skills (PRIMARY)

**Location decision:**
- **Multi-root workspace:** Create in `docs/.claude/skills/` (canonical, use symlinks in repos)
- **Single-root workspace:** Create in `.claude/skills/` (repo root)

Create/update:
- `frontend-aesthetics/SKILL.md`
- `backend-engineering/SKILL.md`
- `database-modeling/SKILL.md` (conditional)

### Full-Stack Enforcement Skills (from Step 11 v3.0.0)
- `full-stack-enforcement/SKILL.md` (if full-stack detected)
- `api-security/SKILL.md` (if API/Supabase detected)
- `server-actions-patterns/SKILL.md` (if server actions detected)
- `agentic-prd-compliance/SKILL.md` (if agentic PRD patterns detected)

**Each SKILL.md must use enhanced YAML frontmatter:**

```yaml
---
name: frontend-aesthetics
description: "This skill should be used when building UI components, pages, or layouts. It provides project-specific design system enforcement and component patterns."
version: "1.0.0"
# Claude Code v2.1.33 enhanced frontmatter:
user-invocable: true
argument-hint: "[component-name or file:line]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - LSP
model: inherit
context: fork          # Runs in subagent to protect main context
agent: sigma-frontend  # Routes to the frontend agent from .claude/agents/
---
```

**Frontmatter field reference:**

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Skill identifier (kebab-case) |
| `description` | Yes | Third-person trigger description |
| `version` | Yes | Semver version |
| `user-invocable` | No | If `false`, hidden from `/` menu but Claude can still auto-invoke |
| `disable-model-invocation` | No | If `true`, Claude will NEVER auto-invoke — must use `/skill-name` explicitly |
| `argument-hint` | No | Placeholder shown in command palette |
| `allowed-tools` | No | Restricts which tools this skill can use |
| `model` | No | Model override (`sonnet`, `haiku`, `opus`, `inherit`) |
| `context` | No | `fork` runs in subagent (heavy skills), omit for inline |
| `agent` | No | Routes to a specific custom agent from `.claude/agents/` |

### Skill Categorization (v2.1.33+)

Every generated skill should be categorized into one of three buckets by adding the appropriate frontmatter flag:

**Category A — Manual-Only** (`disable-model-invocation: true`):
Claude will NEVER auto-invoke. User must type `/skill-name` explicitly.
Use for: step commands, deployment, session management, generators — things with side effects.

**Category B — Claude-Invocable** (default, no flag needed):
Claude auto-invokes when context matches. Shows in `/` menu.
Use for: core workflow skills like research, security review, frontend design, verification.

**Category C — Background Knowledge** (`user-invocable: false`):
Claude CAN auto-invoke when relevant, but NOT shown in `/` menu.
Use for: specialized domain knowledge, tooling-specific skills, niche domains.

**Auto-categorization heuristics:**
| Detected Pattern | Category | Flag |
|-----------------|----------|------|
| Step commands, deploy, scaffold, generator | A (Manual) | `disable-model-invocation: true` |
| Research, review, design, security, testing | B (Default) | _(none)_ |
| Framework-specific tooling, scanner configs, niche CRO | C (Background) | `user-invocable: false` |

**Why this matters:** With `SLASH_COMMAND_TOOL_CHAR_BUDGET: "500000"` enabled, all skills get indexed. Categorization controls the `/` menu size and auto-invocation behavior to prevent context flooding.

**When to use `context: fork`:**
- Skills that scan many files (frontend-aesthetics, backend-engineering)
- Skills with heavy research (deep-research, api-security)
- Skills that generate large outputs

**When to omit `context:`:**
- Lightweight checklist skills
- Skills that need to modify the current conversation context

**Dynamic context with `!` backtick:**

Skills can include runtime data injection using the `!` backtick syntax:

```markdown
# Frontend Aesthetics

## Current Git State
!`git log --oneline -3`

## Project Dependencies
!`cat package.json | jq '.dependencies | keys[]' 2>/dev/null | head -20`

## Design Tokens
!`cat docs/design/DESIGN-SYSTEM.md 2>/dev/null | head -50`
```

**`$ARGUMENTS` substitution:**

For parameterized skills, use `$ARGUMENTS` to accept user input:

```markdown
# Debug: $ARGUMENTS[0]

Investigate the issue described: $ARGUMENTS[0]

!`git log --oneline -5`
!`git diff --stat HEAD`
```

**Skill body requirements:**
- Use imperative style (instructional)
- Include the Overlay block (anchors + non-negotiables + precedence) at the top
- Reference project docs instead of duplicating them
- Use dynamic context (`!` backtick) for runtime data when useful

### Skill-Agent Category Mapping

Each generated skill MUST be mapped to an agent from `.claude/agents/`. Include this mapping in the CLAUDE.md injection:

| Skill Category | Skills | Assigned Agent |
|----------------|--------|---------------|
| Frontend | frontend-aesthetics | sigma-frontend |
| Backend | backend-engineering, api-security, server-actions-patterns | sigma-backend |
| Database | database-modeling | sigma-backend |
| Full-Stack | full-stack-enforcement | sigma-executor |
| QA/Testing | agentic-prd-compliance | sigma-qa |
| Security Lead | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review | sigma-security-lead |
| Web/API Security | owasp-web-security, owasp-api-security, better-auth-best-practices, create-auth-skill | sigma-security-web-api |
| AI Safety | owasp-llm-security, dependency-security | sigma-security-ai-safety |
| Infra Security | dependency-security, secrets-detection | sigma-security-infra |
| Mobile Development | react-native-patterns, swiftui-patterns, swift-concurrency, rn-component-library, mobile-ui-testing, platform-design-guidelines | sigma-mobile |
| Mobile Security | mobile-app-security, owasp-web-security | sigma-security-mobile |
| Compliance | saas-security-patterns, security-code-review | sigma-security-compliance |

Optional (recommended): add `references/` files per skill:
- `references/stack-summary.md`
- `references/design-token-summary.md` (if design system exists)
- `references/prd-patterns.md`

---

## Phase 2.25: Generate Project Agents (.claude/agents/)

**Read domain scan results from Step 12** and generate project-appropriate agents in `.claude/agents/`. Each agent file binds skills via `skills:` frontmatter.

### Agent Generation Logic

1. **Read Step 12 outputs**: Check `.claude/agents/` for existing agents from Step 12
2. **Match domains to agent templates**: Use the source agent definitions in `src/agents/` as templates
3. **Bind skills**: Each generated agent includes `skills:` frontmatter referencing the project's generated skills
4. **Generate skill-agent registry**: Create the mapping table for CLAUDE.md injection

### Mandatory Agents (Never Skip)

The following agents are ALWAYS generated regardless of stack detection:
- `sigma-planner`, `sigma-executor`, `sigma-reviewer`, `sigma-sisyphus`, `sigma-debugger`, `sigma-docs`
- `sigma-security-lead`
- **`sigma-devils-advocate`** (adversarial post-implementation review)
- **`sigma-gap-analyst`** (requirements traceability + auto-fix gate)

### Standard Agent Generation (from domain scan)

| Detected Domain | Agent to Generate | Source Template | Skills to Bind |
|----------------|-------------------|-----------------|----------------|
| Frontend (React/Next.js) | `sigma-frontend.md` | `src/agents/frontend-engineer.md` | frontend-aesthetics, frontend-design, react-performance |
| Backend (API/Actions) | `sigma-backend.md` | `src/agents/lead-architect.md` | backend-engineering, api-security, server-actions-patterns |
| Testing (any framework) | `sigma-qa.md` | `src/agents/qa-engineer.md` | agentic-prd-compliance, senior-qa, tdd-skill-creation |
| Mobile (RN/Expo/SwiftUI) | `sigma-mobile.md` | `src/agents/frontend-engineer.md` | react-native-patterns OR swiftui-patterns + swift-concurrency, mobile-ui-testing, platform-design-guidelines, rn-component-library |
| Always | `sigma-planner.md` | — | deep-research, brainstorming |
| Always | `sigma-executor.md` | — | executing-plans |
| Always | `sigma-reviewer.md` | — | verification-before-completion, quality-gates |
| Always | `sigma-devils-advocate.md` | `src/agents/devils-advocate.md` | verification-before-completion, quality-gates |
| Always | `sigma-gap-analyst.md` | `src/agents/gap-analyst.md` | gap-analysis, verification-before-completion, quality-gates |

### Security Agent Generation (from domain scan)

Generate security agents based on project characteristics. The security lead is always generated; specialists are conditional.

| Detected Feature | Agent to Generate | Source Template | Skills to Bind |
|-----------------|-------------------|-----------------|----------------|
| Always | `sigma-security-lead.md` | `src/agents/security-lead.md` | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review |
| Web/SaaS (Next.js, Express, API routes) | `sigma-security-web-api.md` | `src/agents/security-web-api.md` | owasp-web-security, owasp-api-security, better-auth-best-practices |
| AI/LLM (`openai`, `anthropic`, `langchain`) | `sigma-security-ai-safety.md` | `src/agents/security-ai-safety.md` | owasp-llm-security, dependency-security |
| Infrastructure (Docker, CI/CD, Terraform) | `sigma-security-infra.md` | `src/agents/security-infra.md` | dependency-security, secrets-detection |
| Mobile (React Native, Expo, ios/, android/) | `sigma-security-mobile.md` | `src/agents/security-mobile.md` | mobile-app-security, owasp-web-security |
| Compliance (GDPR/HIPAA/SOC2/PCI mentions) | `sigma-security-compliance.md` | `src/agents/security-compliance.md` | saas-security-patterns, security-code-review |

### Generated Agent Format (v2.1.33+)

Each `.claude/agents/` file should follow this format with the `color` field from the matte palette:

```yaml
---
name: sigma-security-lead
description: Security coordinator and threat modeler for this project
color: "#6B4F4F"
tools:
  - Read
  - Grep
  - Glob
  - Bash
model: sonnet
permissionMode: acceptEdits
skills:
  - owasp-web-security
  - owasp-api-security
  - defense-in-depth
  - security-code-review
---

# Role: Security Lead

You are the security coordination agent for {{PROJECT_NAME}}.

## Domain
Threat modeling, security audit coordination, vulnerability prioritization, pen testing methodology.

## Stack Context
{{SECURITY_RELEVANT_STACK_DETAILS}}

## Behavioral Rules
1. Always conduct STRIDE analysis before approving new features
2. Delegate specialized audits to domain-specific security agents
3. Use CVSS scoring for vulnerability prioritization
4. Generate actionable remediation roadmaps
```

### Matte Color Palette (v2.1.33+)

Assign colors from this palette. All colors: 25-40% saturation, 35-55% brightness.

| Agent Role | Color Name | Hex |
|-----------|------------|-----|
| Orchestrator/Lead | Slate | `#4A5568` |
| Lead Architect | Charcoal | `#2D3748` |
| Frontend | Sage | `#5B8A72` |
| QA/Testing | Umber | `#7C6F5B` |
| UX Director | Tan | `#8B7355` |
| Design Systems | Teal Matte | `#6B8E8B` |
| Product Owner | Plum | `#7B6B8A` |
| Executor/Worker | Forest | `#5C7A6B` |
| Content/Docs | Khaki | `#8A7D6B` |
| Venture Studio | Indigo Matte | `#6B6B8A` |
| Devil's Advocate | Brick | `#8B5C5C` |
| Gap Analyst | Steel | `#5C6B7A` |
| Security Lead | Maroon Matte | `#6B4F4F` |
| Security Specialist | Rust | `#7A5C5C` |
| Security AI | Slate Blue | `#5C5C6B` |
| Security Infra | Olive | `#6B6B5C` |
| Security Mobile | Moss | `#5C6B5C` |
| Security Compliance | Sienna | `#7A6B5C` |
| Data Engineering | Teal Dark | `#5C7A7A` |
| Strategy/Quant | Grape | `#6B5C7A` |

Security agents share the red-brown family. Frontend/design share the green family. Use the closest match for custom agents.

### Skill-Agent Registry Generation

After generating agents, create the skill-agent registry mapping for CLAUDE.md:

```markdown
## Skill-Agent Registry

| Category | Skills | Assigned Agent |
|----------|--------|---------------|
| Frontend | frontend-aesthetics, frontend-design | sigma-frontend |
| Backend | backend-engineering, api-security | sigma-backend |
| Mobile Development | react-native-patterns, swiftui-patterns, swift-concurrency, rn-component-library, mobile-ui-testing, platform-design-guidelines | sigma-mobile |
| Security Lead | owasp-web-security, defense-in-depth, security-code-review | sigma-security-lead |
| Web/API Security | owasp-api-security, better-auth-best-practices | sigma-security-web-api |
{additional mappings based on detected domains}
```

**HITL checkpoint** → Confirm agent generation before writing.
**Prompt:** "Will generate [N] agents in `.claude/agents/` (including [M] security agents). Reply `confirm` to continue."

---

## Phase 2.5: Generate Cursor modules (If Cursor detected)

**Skip this phase entirely if Cursor is not detected in the project.**

**Location decision:**
- **Multi-root workspace:** Create in `docs/.cursor/rules/` (canonical)
- **Single-root workspace:** Create in `.cursor/rules/` (repo root)

Create/update rule modules with strong metadata (`globs`, `keywords`). Mirror the same skills generated for Claude Code.

### Required (if Cursor detected)

1) `.cursor/rules/frontend-aesthetics.mdc`
- Overlay: project anchors + non-negotiables (design tokens, typography, a11y, motion budgets)
- Preserve: `frontend-design` style guidance (tone selection, typography, color, motion, composition, anti-slop constraints)
- Metadata:
  - `globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "tailwind.config.*"]`
  - `keywords: ["ui","component","tailwind","shadcn","layout","typography","motion"]`

2) `.cursor/rules/backend-engineering.mdc`
- API/server action patterns, auth/permissions, error shapes, PRD-first implementation rules
- Metadata:
  - `globs: ["app/api/**/*","actions/**/*","server/**/*"]`
  - `keywords: ["api","endpoint","auth","validation","server actions","database"]`

### Conditional

- `.cursor/rules/database-modeling.mdc` (if DB detected)
- `.cursor/rules/payments-subscriptions.mdc` (if payments detected)

### Full-Stack Enforcement (NEW — from Step 11 v3.0.0)

3) `.cursor/rules/full-stack-enforcement.mdc` (if full-stack detected)
- Enforces: PRDs must include Section 0.5 (Full Stack Overview), no orphan UIs, every data-fetching component has server action
- Metadata:
  - `globs: ["docs/prds/**/*.md", "actions/**/*", "components/**/*"]`
  - `keywords: ["prd", "full-stack", "backend", "server action", "vertical slice"]`

4) `.cursor/rules/api-security.mdc` (if API/Supabase detected)
- Enforces: OWASP API Security Top 10, RLS policies, auth checks, rate limiting, Result pattern
- Metadata:
  - `globs: ["actions/**/*", "app/api/**/*", "db/**/*", "supabase/**/*"]`
  - `keywords: ["security", "auth", "rls", "owasp", "validation", "rate limit"]`

5) `.cursor/rules/server-actions-patterns.mdc` (if server actions detected)
- Enforces: Zod validation first, auth check second, Result pattern return, revalidatePath after mutations
- Metadata:
  - `globs: ["actions/**/*", "app/**/*.ts", "app/**/*.tsx"]`
  - `keywords: ["server action", "use server", "zod", "validation", "mutation"]`

6) `.cursor/rules/agentic-prd-compliance.mdc` (if agentic PRD patterns detected)
- Enforces: Explicit file paths, complete imports, implementation order, test paths, no ambiguity
- Metadata:
  - `globs: ["docs/prds/**/*.md"]`
  - `keywords: ["prd", "file manifest", "implementation order", "agentic", "cursor", "claude"]`

### Router update

Update `.cursorrules` to include `@import` lines for newly created modules.
- Do **not** delete Step 12 imports.
- Add imports in the relevant section (Frontend / Backend / DB).

---

## Phase 3: Generate OpenCode skills (If OpenCode detected)

If OpenCode is detected, also create/update OpenCode-native skills at:

- **Single-root:** `.opencode/skill/<name>/SKILL.md`
- **Multi-root:** `docs/.opencode/skill/<name>/SKILL.md` (canonical), then fan-out to each repo

### Required (minimum)

Mirror the same skills you generated for Claude Code:

- `frontend-aesthetics`
- `backend-engineering`
- `database-modeling` (conditional)

### OpenCode skill rules

- Each skill must be in its own directory named exactly `<name>`
- The file must be named `SKILL.md` (uppercase)
- YAML frontmatter must include:
  - `name` (must match directory name; lowercase with hyphens)
  - `description` (1–1024 chars)
- Unknown frontmatter keys are ignored by OpenCode, but keep the header minimal.

### Overlay integrity

Prepend the same overlay block used for Claude skills:
1) Project Anchors
2) Non‑negotiables / Overrides
3) Precedence rules (project docs override generic guidance)

### Optional: OpenCode agents

If the project uses OpenCode heavily, also scaffold `.opencode/agent/` with:
- `sigma` (primary)
- `sss-executor` (primary)
- `sss-planner` (primary; tool-restricted where appropriate)
- `sss-sisyphus` (primary)

**Important:** OpenCode agent names come from filenames; do not include `name:` in frontmatter.

---

## Phase 3.5: Generate Codex skills (If Codex detected)

If Codex is detected, also create/update Codex-native skills at:

- **Single-root:** `.agents/skills/<name>/SKILL.md`
- **Multi-root:** `docs/.agents/skills/<name>/SKILL.md` (canonical), then symlink or fan-out to each repo root

### Required (minimum)

Mirror the same skills you generated for Claude Code:

- `frontend-aesthetics`
- `backend-engineering`
- `database-modeling` (conditional)

### Codex skill rules

- Each skill must be in its own directory named exactly `<name>`
- The file must be named `SKILL.md` (uppercase)
- YAML frontmatter must include:
  - `name` (must match directory name; lowercase with hyphens)
  - `description` (1–1024 chars)
  - `version` (optional but recommended)

### Overlay integrity

Prepend the same overlay block used for Claude skills:
1) Project Anchors
2) Non‑negotiables / Overrides
3) Precedence rules (project docs override generic guidance)

**No subagents:** Each Codex skill must contain the **full prompt** (no delegation).

---

## Phase 4: Multi-root workspace fan-out (if applicable)

**If multi-root workspace detected:**

### 4.1 Create/Update Fan-Out Script

**Check if `scripts/sync-ai-config.sh` exists:**

```bash
if [[ -f "scripts/sync-ai-config.sh" ]]; then
  echo "Fan-out script exists. Update SHARED_RULES array if needed."
else
  echo "Creating fan-out script..."
  # Create sync-ai-config.sh (see docs/integration/MULTI-ROOT-WORKSPACE.md for template)
fi
```

**Fan-out script should:**
1. Sync `docs/.cursor/rules/*.mdc` → `{repo}/.cursor/rules/` (for shared rules)
2. Create symlinks: `{repo}/.claude/skills` → `../../docs/.claude/skills`
3. Create symlinks: `{repo}/.agents/skills` → `../../docs/.agents/skills` (for Codex)
4. Update `.gitignore` entries for symlinks

**Shared rules to sync (add to SHARED_RULES array):**
- `frontend-aesthetics.mdc`
- `backend-engineering.mdc`
- `database-modeling.mdc`
- `payments-subscriptions.mdc` (if generated)

### 4.2 Update Router Files

**For each repo, ensure `.cursorrules` imports shared rules:**

```markdown
# Frontend Rules (synced from docs/)
@import .cursor/rules/frontend-aesthetics.mdc

# Backend Rules (synced from docs/)
@import .cursor/rules/backend-engineering.mdc
```

**Note:** In multi-root workspaces, each repo's `.cursorrules` should be minimal and reference synced rules.

---

## Phase 5: Generate reusable plugin scaffold

Create a reusable plugin scaffold under:
- `claude-code/plugins/sss-skillpack/`

Include:
- `.claude-plugin/plugin.json`
- `skills/<skill-name>/SKILL.md`

The plugin skills should match the project-local skills (same overlay + same triggers).

---

## Phase 6: Generate @invokes Metadata (Ralph Loop Integration)

**Purpose:** Enable Ralph Loop to automatically select the right agent/skill based on task type and acceptance criteria.

**Location:** Add to CLAUDE.md or AGENTS.md (depending on platform)

### 6.1 Generate Agent Invocation Map

Create a machine-readable section that maps file patterns to agents:

```markdown
## Agent & Skill Invocation Map

<!-- Machine-readable section for Ralph Loop agent selection -->

### By Task Pattern

| Task Pattern | Invoke | Fallback |
|--------------|--------|----------|
| `**/components/**` | `@frontend-engineer` | `@senior-architect` |
| `**/app/**/page.tsx` | `@frontend-engineer` | `@ux-director` |
| `**/api/**`, `**/routes/**` | `@lead-architect` | `@senior-architect` |
| `**/actions/**` | `@lead-architect` | `@backend-engineering` |
| `**/*.test.*`, `**/*.spec.*` | `@qa-engineer` | `@senior-qa` |
| `**/styles/**`, `**/design/**` | `@design-systems-architect` | `@ux-director` |
| `**/db/**`, `**/schema/**` | `@lead-architect` | `@senior-architect` |
| `**/hooks/**` | `@frontend-engineer` | `@senior-architect` |
| `docs/prds/**` | `@product-owner` | `@senior-architect` |
| `**/auth/**`, `**/middleware.*` | `@security-web-api` | `@security-lead` |
| `**/ai/**`, `**/llm/**`, `**/prompts/**` | `@security-ai-safety` | `@security-lead` |
| `Dockerfile`, `.github/**`, `**/ci/**` | `@security-infra` | `@security-lead` |
| `ios/**`, `android/**`, `**/mobile/**` | `@security-mobile` | `@security-lead` |
| `**/privacy/**`, `**/consent/**` | `@security-compliance` | `@security-lead` |

### By Acceptance Criteria Type

| Criteria Type | Validator Hook | Primary Agent |
|---------------|----------------|---------------|
| `ui-validation` | `ui-validation.sh` | `@frontend-engineer` + Agent Browser |
| `command` | `typescript-validator.sh` | `@qa-engineer` |
| `file-exists` | `prd-validator.py` | (Story assignee) |
| `file-contains` | `prd-validator.py` | (Story assignee) |
| `artifact-check` | `design-tokens-validator.py` | `@design-systems-architect` |
| `manual` | (none) | HITL required |

### Skills Auto-Loaded

Based on this project's stack, these skills are pre-loaded for all Ralph Loop sessions:

<!-- Auto-generated from stack-profile.json -->
- `@frontend-design` (React/Next.js detected)
- `@api-design-principles` (API routes detected)
- `@quality-gates` (CI/CD present)
- `@systematic-debugging` (Always loaded for error recovery)
```

### 6.2 Skill Invocation Rules

Add to each generated skill/rule:

**In Cursor rules (`.mdc` files), add metadata block:**

```yaml
---
globs: ["**/components/**/*.tsx"]
keywords: ["ui", "component", "tailwind"]
# Ralph Loop Integration
ralph_invokes:
  agents: ["frontend-engineer", "ux-director"]
  validators: ["ui-validation.sh", "typescript-validator.sh"]
  ac_types: ["ui-validation", "file-exists"]
---
```

**In Claude Code skills (`SKILL.md`), add frontmatter:**

```yaml
---
name: frontend-aesthetics
description: "..."
version: "1.0.0"
# Ralph Loop Integration
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

**IMPORTANT:** This file MUST be auto-generated during Step 13 execution.

```typescript
async function generateInvokesJson(
  targetDir: string,
  stackProfile: object,
  generatedSkills: string[]
): Promise<void> {
  const timestamp = new Date().toISOString();

  // Detect stack from stack-profile.json
  const hasReact = stackProfile?.frontend?.includes('react') || stackProfile?.framework?.includes('next');
  const hasSupabase = stackProfile?.database?.includes('supabase') || stackProfile?.backend?.includes('supabase');
  const hasStripe = stackProfile?.payments?.includes('stripe') || stackProfile?.integrations?.includes('stripe');
  const hasServerActions = await glob('**/actions/**/*.ts').length > 0;

  // Build task type patterns from detected evidence
  const taskTypePatterns: Record<string, string> = {};
  if (hasReact) {
    taskTypePatterns['UI-*'] = '@frontend-engineer';
  }
  if (hasServerActions || hasSupabase) {
    taskTypePatterns['API-*'] = '@senior-architect';
    taskTypePatterns['DB-*'] = '@senior-architect';
  }
  taskTypePatterns['TEST-*'] = '@qa-engineer';
  taskTypePatterns['VERIFY-*'] = '@qa-engineer';

  // Build stack-based skills
  const stackBasedSkills: string[] = [];
  if (hasReact) stackBasedSkills.push('frontend-design', 'react-performance');
  if (hasSupabase) stackBasedSkills.push('api-security', 'database-modeling');
  if (hasStripe) stackBasedSkills.push('payments-subscriptions');

  const invokesJson = {
    "$schema": "../schemas/invokes.schema.json",
    "version": "1.0.0",
    "generatedAt": timestamp,
    "generatedBy": "step-13-skillpack-generator",
    "patterns": {
      "**/components/**": {
        "primary": "@frontend-engineer",
        "fallback": "@senior-architect",
        "validators": ["ui-validation.sh", "typescript-validator.sh"],
        "skills": generatedSkills.filter(s => s.includes('frontend') || s.includes('design'))
      },
      "**/app/**/page.tsx": {
        "primary": "@frontend-engineer",
        "fallback": "@ux-director",
        "validators": ["ui-validation.sh"],
        "skills": ["frontend-aesthetics"]
      },
      "**/api/**": {
        "primary": "@lead-architect",
        "fallback": "@senior-architect",
        "validators": ["typescript-validator.sh"],
        "skills": ["backend-engineering", "api-security"]
      },
      "**/actions/**": {
        "primary": "@lead-architect",
        "fallback": "@backend-engineering",
        "validators": ["typescript-validator.sh"],
        "skills": ["server-actions-patterns", "backend-engineering"]
      },
      "**/db/**": {
        "primary": "@senior-architect",
        "fallback": "@lead-architect",
        "validators": ["typescript-validator.sh"],
        "skills": ["database-modeling"]
      },
      "**/*.test.*": {
        "primary": "@qa-engineer",
        "fallback": "@senior-qa",
        "validators": ["typescript-validator.sh"],
        "skills": ["quality-gates", "senior-qa"]
      },
      "**/styles/**": {
        "primary": "@design-systems-architect",
        "fallback": "@frontend-engineer",
        "validators": ["design-tokens-validator.py"],
        "skills": ["frontend-aesthetics"]
      }
    },
    "taskTypes": taskTypePatterns,
    "acceptanceCriteriaTypes": {
      "ui-validation": {
        "validator": "ui-validation.sh",
        "agent": "@frontend-engineer",
        "requiresBrowser": true,
        "browserTool": "agent-browser"
      },
      "command": {
        "validator": null,
        "agent": "@qa-engineer",
        "requiresBrowser": false
      },
      "file-exists": {
        "validator": "prd-validator.py",
        "agent": null,
        "requiresBrowser": false
      },
      "file-contains": {
        "validator": "prd-validator.py",
        "agent": null,
        "requiresBrowser": false
      },
      "artifact-check": {
        "validator": "design-tokens-validator.py",
        "agent": "@design-systems-architect",
        "requiresBrowser": false
      },
      "manual": {
        "validator": null,
        "agent": null,
        "requiresBrowser": false,
        "requiresHITL": true
      }
    },
    "defaultSkills": [
      "systematic-debugging",
      "quality-gates"
    ],
    "stackBasedSkills": {
      "detected": stackBasedSkills,
      "all": {
        "react": ["frontend-design", "react-performance"],
        "next": ["frontend-design", "api-design-principles"],
        "supabase": ["api-security", "database-modeling"],
        "stripe": ["payments-subscriptions"]
      }
    },
    "designSystemEnforcement": {
      "uiProfilePath": "docs/design/ui-profile.json",
      "enforcedForTasks": ["UI-*"],
      "validators": ["design-tokens-validator.py", "ui-healer"]
    }
  };

  // Ensure .sss directory exists
  await fs.ensureDir(path.join(targetDir, '.sss'));

  // Write invokes.json
  await fs.writeFile(
    path.join(targetDir, '.sss', 'invokes.json'),
    JSON.stringify(invokesJson, null, 2)
  );

  console.log(`✅ Generated .sss/invokes.json (skill routing for Ralph loop)`);
}
```

**Example output `.sss/invokes.json`:**

```json
{
  "$schema": "../schemas/invokes.schema.json",
  "version": "1.0.0",
  "generatedAt": "2026-01-21T00:00:00Z",
  "generatedBy": "step-13-skillpack-generator",
  "patterns": {
    "**/components/**": {
      "primary": "@frontend-engineer",
      "fallback": "@senior-architect",
      "validators": ["ui-validation.sh", "typescript-validator.sh"],
      "skills": ["frontend-aesthetics"]
    },
    "**/api/**": {
      "primary": "@lead-architect",
      "fallback": "@senior-architect",
      "validators": ["typescript-validator.sh"],
      "skills": ["backend-engineering", "api-security"]
    },
    "**/actions/**": {
      "primary": "@lead-architect",
      "fallback": "@backend-engineering",
      "validators": ["typescript-validator.sh"],
      "skills": ["server-actions-patterns", "backend-engineering"]
    },
    "**/*.test.*": {
      "primary": "@qa-engineer",
      "fallback": "@senior-qa",
      "validators": ["typescript-validator.sh"],
      "skills": ["quality-gates"]
    }
  },
  "taskTypes": {
    "UI-*": "@frontend-engineer",
    "API-*": "@senior-architect",
    "DB-*": "@senior-architect",
    "TEST-*": "@qa-engineer"
  },
  "acceptanceCriteriaTypes": {
    "ui-validation": {
      "validator": "ui-validation.sh",
      "agent": "@frontend-engineer",
      "requiresBrowser": true,
      "browserTool": "agent-browser"
    },
    "command": {
      "validator": null,
      "agent": "@qa-engineer",
      "requiresBrowser": false
    },
    "file-exists": {
      "validator": "prd-validator.py",
      "agent": null,
      "requiresBrowser": false
    },
    "file-contains": {
      "validator": "prd-validator.py",
      "agent": null,
      "requiresBrowser": false
    },
    "artifact-check": {
      "validator": "design-tokens-validator.py",
      "agent": "@design-systems-architect",
      "requiresBrowser": false
    },
    "manual": {
      "validator": null,
      "agent": null,
      "requiresBrowser": false,
      "requiresHITL": true
    }
  },
  "defaultSkills": [
    "systematic-debugging",
    "quality-gates"
  ],
  "stackBasedSkills": {
    "react": ["frontend-design", "react-performance"],
    "next": ["frontend-design", "api-design-principles"],
    "supabase": ["api-security", "database-modeling"],
    "stripe": ["payments-subscriptions"]
  },
  "designSystemEnforcement": {
    "uiProfilePath": "docs/design/ui-profile.json",
    "enforcedForTasks": ["UI-*"],
    "validators": ["design-tokens-validator.py", "ui-healer"]
  }
}
```

### 6.4 Update CLAUDE.md / AGENTS.md

After generating skills, append the invocation map to the orchestrator file:

**For Claude Code (CLAUDE.md):**

```markdown
## Ralph Loop Integration

This project is configured for autonomous Ralph Loop execution.

### Quick Start
\`\`\`bash
# Run Ralph Loop on all pending stories
npx sigma ralph

# Run specific PRD
npx sigma ralph --prd feature-auth

# Dry run (preview only)
npx sigma ralph --dry-run
\`\`\`

### Agent Selection

Ralph Loop automatically selects agents based on:
1. File patterns in the story tasks
2. Acceptance criteria types
3. Stack-specific skills

See `.sss/invokes.json` for the full mapping.

### Validator Hooks

Active PostToolUse validators:
- `ui-validation.sh` - Agent Browser UI checks
- `typescript-validator.sh` - Type/lint checks
- `prd-validator.py` - PRD structure validation
- `design-tokens-validator.py` - Design token checks

These validators enable "Closed Loop Prompt" pattern where agents auto-fix failures.
```

---

## Final report

Return:
- Detected domains
- Workspace architecture (single-root vs multi-root)
- **Agents generated** (list of `.claude/agents/*.md` files with skill bindings)
- **Security agents generated** (which security agents and why)
- **Skill-agent registry** (the mapping table injected into CLAUDE.md)
- Cursor modules created/updated (with location)
- Claude skills created/updated (with location)
- Codex skills created/updated (with location, if generated)
- Fan-out script status (if multi-root)
- Plugin scaffold created/updated
- **@invokes metadata generated** (patterns, AC types, skills)
- **`.sss/invokes.json` created**
- Skipped outputs (and why)

**For multi-root workspaces, also report:**
- Canonical locations (`docs/.cursor/rules/`, `docs/.claude/skills/`, `docs/.agents/skills/`)
- Repos that will receive synced rules
- Next steps: Run `scripts/sync-ai-config.sh` to fan out

**For Ralph Loop integration, also report:**
- Agent invocation patterns detected
- Validators configured
- Skills auto-loaded based on stack

---

<verification>
## Step 13 Verification Schema

### Required Outputs (35 points)

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| Claude skill frontend | /.claude/skills/frontend-aesthetics/SKILL.md | 400B | 10 |
| Claude skill backend | /.claude/skills/backend-engineering/SKILL.md | 400B | 10 |
| Claude skills directory | /.claude/skills/ | exists | 5 |

### Cursor Outputs (Conditional — only if Cursor detected, bonus 10 points)

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| Cursor frontend module | /.cursor/rules/frontend-aesthetics.mdc | 400B | 4 |
| Cursor backend module | /.cursor/rules/backend-engineering.mdc | 400B | 3 |
| Cursor router | /.cursorrules | 200B | 3 |

### OpenCode Outputs (Conditional — only if OpenCode detected, bonus 5 points)

If OpenCode is detected, also require:

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| OpenCode skill frontend | /.opencode/skill/frontend-aesthetics/SKILL.md | 400B | 3 |
| OpenCode skill backend | /.opencode/skill/backend-engineering/SKILL.md | 400B | 2 |

### Codex Outputs (Conditional — only if Codex detected, bonus 5 points)

If Codex is detected, also require:

| Item | Path | Min Size | Points |
|------|------|----------|--------|
| Codex skill frontend | /.agents/skills/frontend-aesthetics/SKILL.md | 400B | 3 |
| Codex skill backend | /.agents/skills/backend-engineering/SKILL.md | 400B | 2 |

### Metadata & Trigger Quality (35 points)

| Check | Description | Points |
|------|-------------|--------|
| has_pattern:frontend-aesthetics/SKILL.md:^description: This skill should be used when | Claude skill has third-person triggers | 5 |
| has_pattern:backend-engineering/SKILL.md:^description: This skill should be used when | Claude skill has third-person triggers | 5 |
| has_pattern:frontend-aesthetics/SKILL.md:name:\|version: | Claude skill has proper frontmatter | 3 |
| has_pattern:backend-engineering/SKILL.md:name:\|version: | Claude skill has proper frontmatter | 3 |
| has_pattern:frontend-aesthetics/SKILL.md:context:\|agent:\|allowed-tools: | Claude skill uses enhanced frontmatter | 5 |
| has_pattern:backend-engineering/SKILL.md:context:\|agent:\|allowed-tools: | Claude skill uses enhanced frontmatter | 4 |
| has_pattern:frontend-aesthetics/SKILL.md:agent: sigma- | Skill maps to a custom agent | 5 |
| has_pattern:frontend-aesthetics.mdc:globs: | Cursor frontend rule has globs (if Cursor detected) | 5 |

### Agent Generation (20 points)

| Check | Description | Points |
|------|-------------|--------|
| file_exists:.claude/agents/sigma-security-lead.md | Security lead agent always generated | 5 |
| has_pattern:sigma-security-lead.md:skills: | Security lead has skill binding | 3 |
| has_pattern:CLAUDE.md:Skill-Agent Registry | CLAUDE.md has skill-agent registry | 5 |
| has_pattern:CLAUDE.md:Security Agents\|security-lead | CLAUDE.md references security team | 4 |
| file_count:.claude/agents/:3 | At least 3 agent files generated | 3 |

### Overlay Integrity (30 points)

| Check | Description | Points |
|------|-------------|--------|
| has_pattern:frontend-aesthetics/SKILL.md:(Project Anchors\|Non-negotiables\|Precedence) | Overlay present in Claude frontend skill | 10 |
| has_pattern:backend-engineering/SKILL.md:(Project Anchors\|Non-negotiables\|Precedence) | Overlay present in Claude backend skill | 10 |
| has_pattern:CLAUDE.md:Ralph Loop Integration | CLAUDE.md has Ralph Loop section | 10 |

### Ralph Loop Integration (Bonus — 20 points)

| Check | Description | Points |
|------|-------------|--------|
| file_exists:.sss/invokes.json | Invokes index generated | 6 |
| has_pattern:invokes.json:patterns | Pattern-to-agent mapping present | 4 |
| has_pattern:invokes.json:acceptanceCriteriaTypes | AC type handlers defined | 4 |
| has_pattern:CLAUDE.md\|AGENTS.md:Ralph Loop Integration | Orchestrator has Ralph section | 3 |
| has_pattern:SKILL.md:invokes: | At least one skill has invokes metadata | 3 |

</verification>
