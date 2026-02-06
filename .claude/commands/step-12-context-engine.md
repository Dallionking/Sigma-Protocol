---
version: "7.0.0"
last_updated: "2026-02-06"
changelog:
  - "7.0.0: v2.1.33 optimization - slim CLAUDE.md (~95 lines), .claude/rules/ modular extraction, TeammateIdle/TaskCompleted hooks, SLASH_COMMAND_TOOL_CHAR_BUDGET, delegate mode, agent color field, skill categorization flags"
  - "6.1.0: Added security team agents (security-lead, security-web-api, security-ai-safety, security-infra, security-mobile, security-compliance) with conditional generation based on project stack detection"
  - "6.0.0: Full Claude Code feature integration - path-scoped rules, agent frontmatter (tools/model/skills), settings.json generation, delegation-first CLAUDE.md, hook generation, session continuity hooks"
  - "5.0.0: Claude Code-first refactor - .claude/rules/ and CLAUDE.md are now primary outputs; Cursor generation is optional"
  - "4.4.0: Added Claude Code agent generation (.claude/agents/) and CLAUDE.md swarm-first injection"
  - "4.3.0: Added Codex integration outputs (.codex/config.toml + .agents/skills) and detection rules"
  - "4.2.0: Added Full-Stack Enforcement Rules (Section 2.5) - generates backend-completeness.mdc, agentic-readiness.mdc, full-stack-prd-enforcement.mdc to enforce Step 11 v3.0.0 requirements"
  - "4.1.0: Added OpenCode dual-generation (opencode.jsonc + .opencode/{agent,command,skill})"
  - "4.0.0: Added Agentic Layer Tools - generates .sigma/tools/ with typecheck, lint, test, build, format scripts for Grade 4 closed loops"
  - "3.0.0: Added Epistemic Reasoning Rules - generates reasoning.mdc with anti-sycophancy and epistemic caution rules"
  - "2.1.0: Added Boilerplate Pattern Rules section - generates boilerplate-patterns.mdc for extension enforcement"
  - "2.0.0: Renumbered from Step 10 to Step 12 in 13-step workflow"
  - "1.0.0: Initial release as Step 10"
description: "Step 12: Context Engineering & Rule Synthesis - Generates the Master Context Router and Domain-Specific Rules"
allowed-tools:
  # PRIMARY TOOLS
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
  - grep
parameters:
  - --force
---

# /step-12-context-engine — Context Engine & Rule Synthesizer

**Mission**
Generate a sophisticated **Context Router** (CLAUDE.md injection + `.claude/rules/*.md`) and a suite of **Domain-Specific Rules**.
**Context:** You are the **Chief Context Engineer**. You don't just dump text; you architect *how* the AI behaves by creating a modular, intelligent rule system.

**Primary outputs:** `.claude/rules/*.md`, `.claude/agents/*.md`, CLAUDE.md agent registry injection.
**Secondary outputs (conditional):** `.cursor/rules/*.mdc` and `.cursorrules` (if Cursor detected), OpenCode/Codex artifacts (if detected).

**Single-Agent Rule (No Subagents)**  
This step must run entirely in the **primary session**. Do **not** spawn subagents or delegate via Task. If multiple roles are needed, simulate them using labeled sections within the same response.

---

## Claude Code Generation (PRIMARY — Always First)

Claude Code is the **primary platform**. Generate `.claude/rules/*.md`, `.claude/agents/*.md`, and CLAUDE.md injection as the first outputs.

### Detection

Treat Claude Code as "in use" if **any** of these are true:

- `.claude/` directory exists
- `CLAUDE.md` exists in project root
- User explicitly asks for "Claude Code support"

### Outputs (always generated first)

#### 1) `.claude/rules/*.md` (primary rule output)

Generate modular rule files in `.claude/rules/`. Each file uses YAML frontmatter with optional path-specific targeting.

**Rule file format:**
```markdown
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.ts"
---

# Rule Title

- Rule content here
```

All domain rules detected in Phase 1 are written here first. See Phase 2 for the full list.

#### 2) `.claude/settings.json` (Agent Teams + Hooks)

Generate or update `.claude/settings.json` to enable agent teams and configure project-level settings:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "SLASH_COMMAND_TOOL_CHAR_BUDGET": "500000"
  },
  "teammateMode": "auto"
}
```

**Merge rules:** If `.claude/settings.json` already exists, merge new keys without overwriting existing permissions or hooks. Use `env` for feature flags and `teammateMode` for team pane behavior.

**Required hooks (v2.1.33+):** In addition to standard hooks, generate these team-aware hooks:

```json
{
  "hooks": {
    "TeammateIdle": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/teammate-idle-handler.sh\""
      }]
    }],
    "TaskCompleted": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/task-completed-handler.sh\""
      }]
    }]
  }
}
```

- **`teammate-idle-handler.sh`**: Check for pending unblocked tasks and surface reminders to the lead
- **`task-completed-handler.sh`**: Check if completed task unblocks Devil's Advocate or Gap Analyst gates

#### 3) `.claude/agents/` (custom agent definitions with skill binding)

Create `.claude/agents/` and generate agent markdown files. Each file uses **YAML frontmatter** with tool restrictions, model selection, permission mode, and skill binding.

**Agent file format with frontmatter:**

```yaml
---
name: sigma-frontend
description: Implements UI components, pages, and frontend logic
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - LSP
model: sonnet
permissionMode: acceptEdits
skills:
  - frontend-design
  - react-performance
---

# Role: Frontend Developer

You are the frontend development agent for {{PROJECT_NAME}}.

## Domain
UI components, pages, layouts, hooks, styling, accessibility.

## Stack Context
{{FRONTEND_STACK_DETAILS}}

## Behavioral Rules
1. Follow the project design system (see .claude/rules/design-system.md)
2. Use the frontend-design skill for component standards
3. Use the react-performance skill for optimization patterns
4. Always verify your work before reporting completion
```

**Standard agents to generate (with skill binding):**

| Agent File | Tools | Model | Skills | When Generated |
|------------|-------|-------|--------|----------------|
| `sigma-planner.md` | Read, Grep, Glob, LSP | inherit | deep-research, brainstorming | Always |
| `sigma-executor.md` | Read, Write, Edit, Bash, Glob, Grep, LSP | sonnet | executing-plans | Always |
| `sigma-reviewer.md` | Read, Grep, Glob, LSP | sonnet | verification-before-completion, quality-gates | Always |
| `sigma-sisyphus.md` | Read, Grep, Bash | inherit | verification-before-completion | Always |
| `sigma-frontend.md` | Read, Write, Edit, Bash, Glob, Grep, LSP | sonnet | frontend-design, react-performance | Frontend detected |
| `sigma-backend.md` | Read, Write, Edit, Bash, Glob, Grep, LSP | sonnet | api-design-principles, database-modeling | Backend detected |
| `sigma-qa.md` | Read, Write, Edit, Bash | sonnet | senior-qa, tdd-skill-creation | Testing framework detected |
| `sigma-debugger.md` | Read, Grep, Bash, LSP | inherit | systematic-debugging | Always |
| `sigma-docs.md` | Read, Write, Grep | haiku | writing-clearly | Always |
| `sigma-security.md` | Read, Grep, Glob, Bash | sonnet | api-security | Backend detected |
| `sigma-security-lead.md` | Read, Grep, Glob, Bash | sonnet | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review | Always |
| `sigma-security-web-api.md` | Read, Grep, Glob, Bash | sonnet | owasp-web-security, owasp-api-security, defense-in-depth, better-auth-best-practices | Web/SaaS detected |
| `sigma-security-ai-safety.md` | Read, Grep, Glob, Bash | sonnet | owasp-llm-security, dependency-security | AI/LLM features detected |
| `sigma-security-infra.md` | Read, Grep, Glob, Bash | sonnet | dependency-security, secrets-detection | Infrastructure/Docker detected |
| `sigma-security-mobile.md` | Read, Grep, Glob, Bash | sonnet | mobile-app-security, owasp-web-security | Mobile detected |
| `sigma-security-compliance.md` | Read, Grep, Glob, Bash | sonnet | saas-security-patterns, security-code-review | Compliance requirements detected |
| `sigma-devils-advocate.md` | Read, Grep, Glob, Bash | sonnet | verification-before-completion, quality-gates | Always |
| `sigma-gap-analyst.md` | Read, Write, Edit, Grep, Glob, Bash | sonnet | gap-analysis, verification-before-completion, quality-gates | Always |

**Stack-adaptive generation rules:**
- If React/Next.js detected → include `sigma-frontend.md` with React-specific instructions
- If no frontend framework → skip `sigma-frontend.md`
- If Supabase detected → include RLS patterns in `sigma-backend.md` and `sigma-security.md`
- If no test framework → make `sigma-qa.md` focus on test setup + writing
- Always include: `sigma-planner`, `sigma-executor`, `sigma-reviewer`, `sigma-sisyphus`, `sigma-debugger`, `sigma-docs`, `sigma-devils-advocate`, `sigma-gap-analyst`

**Security agent generation rules:**
- Always generate: `sigma-security-lead` (every project needs a security coordinator)
- If Web/SaaS detected (Next.js, Express, API routes, `app/api/`) → include `sigma-security-web-api`
- If AI/LLM features detected (`openai`, `anthropic`, `langchain`, `llm`, `ai` in package.json/code) → include `sigma-security-ai-safety`
- If Infrastructure detected (Dockerfile, docker-compose, `.github/workflows/`, Terraform, Kubernetes) → include `sigma-security-infra`
- If Mobile detected (React Native, Expo, `ios/`, `android/`, `mobile/` directories) → include `sigma-security-mobile`
- If Compliance requirements detected (GDPR, HIPAA, SOC2, PCI-DSS mentions in docs/code, `.env` with compliance vars) → include `sigma-security-compliance`

#### 4) Skill-Agent Category Registry

Generate a skill-to-agent mapping as part of the CLAUDE.md injection (see below). This registry tells the lead agent which teammate to spawn for each domain:

```markdown
## Skill-Agent Registry

| Category | Skills | Assigned Agent |
|----------|--------|---------------|
| Frontend | frontend-design, react-performance | sigma-frontend |
| Backend | api-design-principles, database-modeling, api-security | sigma-backend |
| Testing | senior-qa, tdd-skill-creation | sigma-qa |
| Quality | verification-before-completion, quality-gates | sigma-reviewer |
| Debug | systematic-debugging | sigma-debugger |
| Docs | writing-clearly | sigma-docs |
| Planning | deep-research, brainstorming | sigma-planner |
| Security | api-security | sigma-security |
| Security Lead | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review | sigma-security-lead |
| Web/API Security | owasp-web-security, owasp-api-security, better-auth-best-practices, create-auth-skill | sigma-security-web-api |
| AI Safety | owasp-llm-security, dependency-security | sigma-security-ai-safety |
| Infra Security | dependency-security, secrets-detection | sigma-security-infra |
| Mobile Security | mobile-app-security, owasp-web-security | sigma-security-mobile |
| Compliance | saas-security-patterns, security-code-review | sigma-security-compliance |
| Adversarial Review | verification-before-completion, quality-gates | sigma-devils-advocate |
| Gap Analysis | gap-analysis, verification-before-completion, quality-gates | sigma-gap-analyst |
```

#### 5) CLAUDE.md Injection (Context Router + Agent Registry + Delegation Philosophy)

If CLAUDE.md exists in the target project, inject the context router, delegation-first philosophy, skill-agent registry, and agent registry. **This replaces the `.cursorrules` router as the primary context mechanism.**

**Processing steps:**
1. Read existing CLAUDE.md
2. If `## Execution Philosophy` section exists → replace it
3. If `## Agent Registry` section exists → replace it
4. If neither exists → append after the last `---` separator

**Inject these sections:**

**a) Delegation-First Execution Philosophy:**

```markdown
## Execution Philosophy: Delegation-First

**Always delegate to agent teams. Never work solo on multi-step tasks.**

### When to Delegate
- PRD implementation → spawn team with domain-specific agents
- Feature development → assign to relevant agents with their skills
- Bug investigation → spawn sigma-debugger agent
- Code review → spawn sigma-reviewer agent
- Documentation → spawn sigma-docs agent

### Agent-Skill Binding
Each agent comes pre-loaded with domain skills via frontmatter. When spawning teammates:
- Use `subagent_type` matching the agent definition in `.claude/agents/`
- The agent's `skills:` field auto-loads relevant skills
- Skills provide domain-specific patterns, checklists, and standards

### Default Team Structure
| Agent | Role | Skills |
|-------|------|--------|
| `sigma-planner` | Architecture & planning | deep-research, brainstorming |
| `sigma-executor` | Implementation | executing-plans |
| `sigma-frontend` | UI implementation | frontend-design, react-performance |
| `sigma-backend` | API/data layer | api-design-principles, database-modeling |
| `sigma-qa` | Test coverage | senior-qa, tdd-skill-creation |
| `sigma-reviewer` | Quality gate | verification-before-completion, quality-gates |
| `sigma-debugger` | Issue investigation | systematic-debugging |
| `sigma-docs` | Documentation | writing-clearly |
| `sigma-devils-advocate` | Adversarial review | verification-before-completion, quality-gates |
| `sigma-gap-analyst` | Final quality gate | gap-analysis, verification-before-completion, quality-gates |

### Security Team (Conditional on Stack)
| Agent | Role | Skills | When Generated |
|-------|------|--------|----------------|
| `sigma-security-lead` | Security coordination & threat modeling | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review | Always |
| `sigma-security-web-api` | Web & API vulnerability auditing | owasp-web-security, owasp-api-security, better-auth-best-practices | Web/SaaS |
| `sigma-security-ai-safety` | LLM safety & prompt injection prevention | owasp-llm-security, dependency-security | AI/LLM features |
| `sigma-security-infra` | Container, CI/CD, supply chain security | dependency-security, secrets-detection | Infrastructure/Docker |
| `sigma-security-mobile` | Mobile app security (MASVS) | mobile-app-security, owasp-web-security | Mobile |
| `sigma-security-compliance` | SOC 2, GDPR, HIPAA, PCI-DSS compliance | saas-security-patterns, security-code-review | Compliance reqs |
```

**b) Skill-Agent Registry** (from the mapping generated in step 4 above)

**c) Agent Registry** (from the generated agents)
- Update the agent table to match the actually-generated agents
- Include the Task Type Routing table for file-pattern → agent mapping
- Include domain routing rules (equivalent to `.cursorrules` @import directives)

**HITL checkpoint →** Confirm CLAUDE.md injection before writing.

---

## Cursor Generation (OPTIONAL — If Cursor detected)

If Cursor is detected in the project, **also** generate Cursor-native artifacts (`.cursor/rules/*.mdc` and `.cursorrules`) in addition to the primary Claude Code outputs.

### Detection

Treat Cursor as "in use" if **any** of these are true:

- `.cursor/` directory exists
- `.cursorrules` file exists in project root
- User explicitly asks for "Cursor support"

### Outputs (when detected)

#### 1) `.cursor/rules/*.mdc` (Cursor rule files)

For each rule generated in `.claude/rules/*.md`, also generate a corresponding `.cursor/rules/*.mdc` file with Cursor-specific frontmatter (`description`, `globs`, `alwaysApply`).

#### 2) `.cursorrules` (Cursor Context Router)

Generate the root `.cursorrules` file that acts as a router, importing `.mdc` files. See Phase 3 for the template.

---

## OpenCode Dual-Generation (If OpenCode detected)

If OpenCode is detected, **also** generate OpenCode-native artifacts in addition to the primary Claude Code outputs.

### Detection

Treat OpenCode as “in use” if **any** of these are true:

- `opencode.json` or `opencode.jsonc` exists in repo root
- `.opencode/` directory exists
- User explicitly asks for “OpenCode support”

### Outputs (when detected)

#### 1) `opencode.jsonc` (project root)

Generate (or update) `opencode.jsonc` with:

- `$schema`: `https://opencode.ai/config.json`
- `default_agent`: `sigma`
- `model`: `anthropic/claude-opus-4-5`
- `small_model`: `anthropic/claude-haiku-4-5`
- `plugin`: include **pinned** `@sss/opencode@<version>`
- `instructions`: include `AGENTS.md` and `.cursorrules` (if present)
- `mcp`: mirror the MCP servers you already emit for Cursor (when applicable)

#### 2) `.opencode/agent/` (project-specific agents)

Create `.opencode/agent/` and generate these agent files (minimum):

- `sigma.md` (mode: `primary`) — orchestrator
- `sigma-executor.md` (mode: `primary`) — implementation
- `sigma-planner.md` (mode: `primary`) — planning (ideally tool-restricted)
- `sigma-explorer.md` (mode: `primary`) — exploration
- `sigma-sisyphus.md` (mode: `primary`) — verification loops
- `sigma-copywriter.md` (mode: `primary`) — marketing copy

**Important (OpenCode rule):** The agent **name** is derived from the filename. Do **not** include `name:` in frontmatter.

Frontmatter keys that OpenCode recognizes (see OpenCode docs):
- `description` (required)
- `mode` (optional: `primary` / `all`) — avoid `subagent` for Sigma steps
- `model` (optional)
- `tools` / `permission` (optional)

#### 3) `.opencode/command/` (complete Sigma command coverage)

Generate one OpenCode command per Sigma command.

**Source discovery order (best-first):**
1. `.cursor/commands/**` (if Sigma commands are installed in the project)
2. This repo’s local command library (if present)

**Command file format (OpenCode):**
- Path: `.opencode/command/<command>.md`
- Frontmatter keys: `description` (required), optional `model`, `subtask`
- Body: the full prompt template (no `agent` indirection for Sigma steps)

**Model routing (deterministic table — do not ad‑hoc):**
- `marketing/*` → `opencode/kimi-k2`
- `audit/*` → `anthropic/claude-opus-4-5`
- `dev/plan` + `ops/sprint-plan` + `ops/backlog-groom` + `ops/qa-plan` → `openai/gpt-5.2-xhigh`
- `dev/implement-prd` + `generators/*` + `deploy/*` → `anthropic/claude-opus-4-5`
- `ops/status` + `ops/daily-standup` + `ops/lint-commands` → `opencode/minimax-m2.1-free`
- `ops/docs-update` + `generators/api-docs-gen` → `google/gemini-3-flash-preview`

**Tool name translation note (Cursor → OpenCode):**
- `read_file` → `read`
- `list_dir` → `list`
- `glob_file_search` → `glob`
- `grep` → `grep`
- `run_terminal_cmd` → `bash`
- `todo_write` → `todowrite`
- `apply_patch` → `patch`

If a command references tools that OpenCode doesn’t have (e.g. `codebase_search`), approximate using `grep`/`glob`/`bash` or LSP (if enabled).

#### 4) `.opencode/skill/` (Sigma skills)

If you generate Claude skills in `.claude/skills/`, also mirror each skill into:

```
.opencode/skill/<skill-name>/SKILL.md
```

**OpenCode skill rules:**
- `SKILL.md` must be uppercase
- Frontmatter must include `name` + `description`
- Skill name must match directory name and satisfy: `^[a-z0-9]+(-[a-z0-9]+)*$`

---

## Codex Integration (If Codex detected)

If Codex is detected, generate Codex-native config + skill scaffolding in addition to Cursor outputs.

### Detection

Treat Codex as “in use” if **any** of these are true:

- `.codex/` directory exists
- `.agents/skills/` directory exists
- User explicitly asks for “Codex support”

### Outputs (when detected)

#### 1) `.codex/config.toml` (project root)

Create or update **minimal** config:

- `model = "gpt-5.2-codex"`
- `model_provider = "openai"`
- `approval_policy = "on-request"`
- `sandbox_mode = "read-only"`
- `project_doc_max_bytes = 32768`
- Optional: `web_search = "cached"` (if using web search)

Keep only keys you set; do **not** paste the full sample config.

#### 2) `.agents/skills/` (skills directory)

Ensure `.agents/skills/` exists. Codex loads skills from:

```
.agents/skills/<skill-name>/SKILL.md
```

Do **not** split steps into subagents. Each skill must contain the **full prompt**.

#### 3) `AGENTS.md` (repo root)

Ensure `AGENTS.md` exists and lists Sigma steps + usage guidance.

#### 4) `.codex/rules/*.rules` (optional)

Only create `.codex/rules/*.rules` if you can author **Starlark** rules.  
Do **not** attempt to auto-convert `.mdc` rules. If unsure, skip this.

---

## BOILERPLATE PATTERN RULES (NEW - If Using Sigma Boilerplate)

**If your project uses a Sigma boilerplate, generate `boilerplate-patterns.md` in `.claude/rules/` to enforce extension rules.** If Cursor detected, also generate `boilerplate-patterns.mdc` in `.cursor/rules/`.

### Detection

```bash
# Check for boilerplate
cat .sigma/boilerplate.json 2>/dev/null
```

### If Boilerplate Detected

**Generate this additional rule file:**

#### `boilerplate-patterns.mdc`

```markdown
---
description: Enforces Sigma boilerplate extension rules and ownership boundaries
globs:
  - src/**/*.ts
  - src/**/*.tsx
  - app/**/*.ts
  - app/**/*.tsx
alwaysApply: true
---

# Boilerplate Extension Rules

## Foundation

This project extends the `{{template}}` boilerplate (v{{version}}).

## Ownership Boundaries

### Boilerplate Owns (DO NOT MODIFY)

| Area | Files | Notes |
|------|-------|-------|
| Auth Infrastructure | `lib/supabase/*`, `components/auth/*` | Use hooks, don't modify |
| Payment Infrastructure | `lib/stripe/*`, `components/payments/*` | Use hooks, don't modify |
| Base UI Components | `components/ui/*` | shadcn managed |
| Sigma Commands | `.cursor/commands/*` | Methodology source |
| Credits System | `hooks/use-credits.ts`, `components/credits/*` | Use hooks, don't modify |

### Project Owns (EXTEND HERE)

| Area | Location | Pattern |
|------|----------|---------|
| Custom Components | `components/[project]/*` | Create new components here |
| Custom Routes | `app/(routes)/*` or `app/[project]/*` | Add routes here |
| Custom API | `app/api/[project]/*` | Add endpoints here |
| Custom Hooks | `hooks/use-[feature].ts` | Compose boilerplate hooks |
| Database Extensions | New tables with FK to users | Don't modify core tables |

## Extension Patterns

### Correct: Wrapper Component

```tsx
// components/project/branded-button.tsx
import { Button } from "@/components/ui/button";

export function BrandedButton({ children, ...props }) {
  return <Button className="bg-brand-primary" {...props}>{children}</Button>;
}
```

### Correct: Hook Composition

```tsx
// hooks/use-feature-credits.ts
import { useCredits } from "@/hooks/use-credits";

export function useFeatureCredits() {
  const credits = useCredits();
  return {
    ...credits,
    hasEnoughForFeature: credits.hasEnough(10),
  };
}
```

### Incorrect: Modifying Boilerplate

```tsx
// ❌ DON'T DO THIS
// Directly editing components/ui/button.tsx
// Modifying lib/supabase/client.ts
// Changing hooks/use-auth.ts
```

## API References

When implementing features, use these stable APIs:

- `useAuth()` - Authentication state and methods
- `useCredits()` - Credit balance and consumption
- `useSubscription()` - Subscription state
- `<CreditsGate required={n}>` - Credit-protected content

## Quality Gates

Before committing code, verify:

- [ ] No modifications to `components/ui/*`
- [ ] No modifications to `lib/supabase/*`
- [ ] No modifications to `hooks/use-auth.ts`
- [ ] New components in `components/[project]/`
- [ ] New routes in appropriate location
```

### Add to Phase 1 Domain Scanning

Add this detection rule:

```markdown
| Domain | Trigger | Rule to Generate (`.claude/rules/`) |
| **Boilerplate** | `.sigma/boilerplate.json` exists | `boilerplate-patterns.md` |
```

### Add to Phase 2 Rule Generation

Add to section 2.2 Domain Rules:

```markdown
*   **`boilerplate-patterns.md`**: (If boilerplate detected) Enforces extension rules, ownership boundaries, and stable API usage.
```

### Add to Phase 3 Context Router

Include in CLAUDE.md Context Engine section:
- `boilerplate-patterns.md` — Boilerplate extension rules, ownership boundaries (boilerplate projects)

If Cursor detected, also include in `.cursorrules`:
```markdown
# @import .cursor/rules/boilerplate-patterns.mdc
```

**HITL checkpoint →** Confirm boilerplate rule generation.
**Prompt:** "Will generate `boilerplate-patterns.md` in `.claude/rules/`. Reply `confirm` to continue."

---

## AGENTIC LAYER TOOLS (NEW - Always Generated)

**Generate `.sigma/tools/` directory with project-local verification scripts for the AI to use during implementation.**

These scripts allow the AI agent to verify its own work autonomously, enabling Grade 4 "Closed Loop" agentic behavior (Build → Test → Fix → Repeat).

### Detection (Add to Phase 1)

Scan the project to determine:

```bash
# 1. Package manager detection
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

# 2. Check for TypeScript
[ -f "tsconfig.json" ] && HAS_TS=true

# 3. Check for linting
ls eslint.config.* .eslintrc.* 2>/dev/null && HAS_LINT=true

# 4. Check for testing
ls vitest.config.* jest.config.* playwright.config.* 2>/dev/null && HAS_TEST=true

# 5. Check for formatting
grep -q "prettier" package.json && HAS_FORMAT=true
```

### Directory Structure

```
.sigma/
├── tools/
│   ├── typecheck.sh      # TypeScript compilation
│   ├── lint.sh           # Linting
│   ├── test.sh           # Test suite
│   ├── build.sh          # Production build
│   └── format-check.sh   # Format verification
└── memory/
    └── active_task.md    # Current task state (generated at runtime)
```

### Generate These Scripts

#### `.sigma/tools/typecheck.sh` (If TypeScript Detected)

```bash
#!/bin/bash
# Auto-generated by @step-12-context-engine
# Purpose: Run TypeScript type checking and output machine-readable results
# Usage: .sigma/tools/typecheck.sh

set -e

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

echo "🔍 Running TypeScript type check..."

# Run type check
if $PM run typecheck 2>&1; then
  echo "---SIGMA-RESULT---"
  echo '{"tool":"typecheck","status":"pass","exit_code":0}'
  exit 0
else
  EXIT_CODE=$?
  echo "---SIGMA-RESULT---"
  echo "{\"tool\":\"typecheck\",\"status\":\"fail\",\"exit_code\":$EXIT_CODE}"
  exit $EXIT_CODE
fi
```

#### `.sigma/tools/lint.sh` (If ESLint Detected)

```bash
#!/bin/bash
# Auto-generated by @step-12-context-engine
# Purpose: Run linting and output machine-readable results
# Usage: .sigma/tools/lint.sh [--fix]

set -e

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

FIX_FLAG=""
if [ "$1" = "--fix" ]; then
  FIX_FLAG="-- --fix"
fi

echo "🔍 Running linter..."

# Run lint
if $PM run lint $FIX_FLAG 2>&1; then
  echo "---SIGMA-RESULT---"
  echo '{"tool":"lint","status":"pass","exit_code":0}'
  exit 0
else
  EXIT_CODE=$?
  echo "---SIGMA-RESULT---"
  echo "{\"tool\":\"lint\",\"status\":\"fail\",\"exit_code\":$EXIT_CODE}"
  exit $EXIT_CODE
fi
```

#### `.sigma/tools/test.sh` (If Test Framework Detected)

```bash
#!/bin/bash
# Auto-generated by @step-12-context-engine
# Purpose: Run test suite and output machine-readable results
# Usage: .sigma/tools/test.sh [filter]

set -e

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

FILTER=""
if [ -n "$1" ]; then
  FILTER="-- $1"
fi

echo "🧪 Running tests..."

# Run tests
if $PM run test $FILTER 2>&1; then
  echo "---SIGMA-RESULT---"
  echo '{"tool":"test","status":"pass","exit_code":0}'
  exit 0
else
  EXIT_CODE=$?
  echo "---SIGMA-RESULT---"
  echo "{\"tool\":\"test\",\"status\":\"fail\",\"exit_code\":$EXIT_CODE}"
  exit $EXIT_CODE
fi
```

#### `.sigma/tools/build.sh` (Always Generated)

```bash
#!/bin/bash
# Auto-generated by @step-12-context-engine
# Purpose: Run production build and output machine-readable results
# Usage: .sigma/tools/build.sh

set -e

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

echo "🏗️ Running production build..."

# Run build
if $PM run build 2>&1; then
  echo "---SIGMA-RESULT---"
  echo '{"tool":"build","status":"pass","exit_code":0}'
  exit 0
else
  EXIT_CODE=$?
  echo "---SIGMA-RESULT---"
  echo "{\"tool\":\"build\",\"status\":\"fail\",\"exit_code\":$EXIT_CODE}"
  exit $EXIT_CODE
fi
```

#### `.sigma/tools/format-check.sh` (If Prettier Detected)

```bash
#!/bin/bash
# Auto-generated by @step-12-context-engine
# Purpose: Check formatting and output machine-readable results
# Usage: .sigma/tools/format-check.sh [--fix]

set -e

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"; fi

if [ "$1" = "--fix" ]; then
  echo "✨ Fixing formatting..."
  CMD="format"
else
  echo "🔍 Checking formatting..."
  CMD="format:check"
fi

# Run format check
if $PM run $CMD 2>&1; then
  echo "---SIGMA-RESULT---"
  echo '{"tool":"format","status":"pass","exit_code":0}'
  exit 0
else
  EXIT_CODE=$?
  echo "---SIGMA-RESULT---"
  echo "{\"tool\":\"format\",\"status\":\"fail\",\"exit_code\":$EXIT_CODE}"
  exit $EXIT_CODE
fi
```

### Add to Phase 1 Domain Scanning

Add this detection rule:

```markdown
| Domain | Trigger | Rule/Action |
| **Agentic Tools** | Any project (always) | Generate `.sigma/tools/` directory |
```

### Add to Phase 2 Rule Generation

After generating rules, also generate the agentic tools:

```bash
# Create .sss directories
mkdir -p .sigma/tools
mkdir -p .sigma/memory

# Generate tools based on detection
if [ -f "tsconfig.json" ]; then
  # Write typecheck.sh (template above)
  chmod +x .sigma/tools/typecheck.sh
fi

if ls eslint.config.* .eslintrc.* 2>/dev/null; then
  # Write lint.sh (template above)
  chmod +x .sigma/tools/lint.sh
fi

if ls vitest.config.* jest.config.* playwright.config.* 2>/dev/null; then
  # Write test.sh (template above)
  chmod +x .sigma/tools/test.sh
fi

# Always generate build.sh
# Write build.sh (template above)
chmod +x .sigma/tools/build.sh

if grep -q "prettier" package.json 2>/dev/null; then
  # Write format-check.sh (template above)
  chmod +x .sigma/tools/format-check.sh
fi
```

### Add to Phase 3 Context Router

Include in CLAUDE.md Context Engine section under Development Mode:
- Reference `.sigma/tools/` scripts for self-correcting loops
- List available verification scripts (typecheck, lint, test, build, format-check)

If Cursor detected, also include in `.cursorrules`:
```markdown
# Agentic Tools (Grade 3/4 Skills)
# Run .sigma/tools/ scripts to verify your work.
```

**HITL checkpoint →** Confirm agentic tools generation.
**Prompt:** "Will generate `.sigma/tools/` directory with verification scripts. Reply `confirm` to continue."

---

## EPISTEMIC REASONING RULES (NEW - Always Generated)

**Generate `reasoning.md` in `.claude/rules/` to enforce epistemic caution and anti-sycophancy rules.** If Cursor detected, also generate `reasoning.mdc` in `.cursor/rules/`.

This rule file ensures the AI:
- Requires evidence for external claims (uses Ref/Exa MCPs)
- Admits uncertainty rather than hallucinating
- Pushes back on flawed assumptions
- Considers failure modes before proceeding

### Detection

Always generate for all projects (no detection needed).

### Generate this rule file:

#### `reasoning.mdc`

```markdown
---
description: Enforces epistemic caution, evidence requirements, and anti-sycophancy
globs:
  - "**/*"
alwaysApply: true
---

# Epistemic Reasoning Rules

## Core Principle

**Default to uncertainty over false confidence.**

When you don't know something:
- Say "I don't know" or "I'm not certain"
- Never fabricate facts, APIs, or behaviors
- Cite sources for external claims

## Evidence Requirements

### External Claims Need Citations

Any claim about external libraries, APIs, or services MUST be verified:

| Claim Type | Required Action |
|------------|-----------------|
| API behavior | Use `mcp_Ref_ref_search_documentation` |
| Library features | Use `mcp_Ref_ref_search_documentation` |
| Code patterns | Use `mcp_exa_get_code_context_exa` |
| Best practices | Use `mcp_exa_web_search_exa` |

**Example - WRONG:**
```
"Supabase RLS automatically denies access by default."
```

**Example - CORRECT:**
```
"According to Supabase documentation [ref], RLS policies 
default to denying access when no policies are defined."
```

### When MCPs Are Unavailable

If MCP tools fail or are not configured:
1. State that verification was not possible
2. Mark claims as "UNVERIFIED"
3. Recommend manual verification

## Anti-Sycophancy Rules

### Push Back on Flawed Assumptions

If the user's request contains:
- Incorrect technical assumptions
- Anti-patterns or bad practices
- Security vulnerabilities
- Performance issues

**DO NOT** just agree and implement.

**INSTEAD:**
1. Politely point out the issue
2. Explain why it's problematic
3. Suggest a better approach
4. Ask for confirmation before proceeding

**Example:**
```
User: "Store the API key in localStorage"

Bad Response: "Sure! Here's how to store in localStorage..."

Good Response: "I'd recommend against storing API keys in 
localStorage as they're accessible to any JavaScript on 
the page. Instead, consider:
1. Environment variables (server-side)
2. Secure HTTP-only cookies
3. Backend proxy for API calls

Would you like me to implement one of these alternatives?"
```

### Don't Over-Confirm Understanding

Avoid phrases like:
- "Great question!"
- "Excellent idea!"
- "That's a perfect approach!"

Instead, be direct:
- "Here's how to implement that..."
- "I'll help you with that. First..."
- "That approach has trade-offs. Consider..."

## Red-Team Thinking

### Consider Failure Modes

Before implementing significant features, briefly consider:

1. **Security**: How could this be exploited?
2. **Performance**: What could cause slowdowns?
3. **Data integrity**: What could corrupt data?
4. **Edge cases**: What inputs could break this?

Document concerns in comments or raise them before coding.

### Question Requirements

If requirements seem incomplete:
- Ask clarifying questions
- Point out undefined edge cases
- Request explicit handling for error states

## Confidence Levels

Use these markers when appropriate:

| Marker | Meaning |
|--------|---------|
| ✅ VERIFIED | Confirmed via documentation or code |
| ⚠️ UNCERTAIN | Reasonable assumption, not verified |
| ❓ UNKNOWN | Need to research or ask user |
| 🚫 UNVERIFIED | MCP unavailable, manual check needed |

## Quality Gates

Before submitting significant code:

- [ ] All external API claims have citations
- [ ] Potential security issues are flagged
- [ ] Edge cases are documented or handled
- [ ] Assumptions are stated explicitly
```

### Add to Phase 2 Rule Generation

Add to section 2.1 Core Rules:

```markdown
*   **`reasoning.md`**: (Always generated) Enforces epistemic caution, evidence requirements, and anti-sycophancy.
```

### Add to Phase 3 Context Router

Include in CLAUDE.md Context Engine section:
- `reasoning.md` — Epistemic caution, evidence requirements, anti-sycophancy (always active)

If Cursor detected, also include in `.cursorrules`:
```markdown
# @import .cursor/rules/reasoning.mdc
```

**HITL checkpoint →** Confirm reasoning rule generation.
**Prompt:** "Will generate `reasoning.md` in `.claude/rules/`. Reply `confirm` to continue."

---

## MODULAR RULES STRUCTURE (NEW - Claude Code Alignment)

**Generate `.sigma/rules/` and `.claude/rules/` directories with modular, topic-specific rules.**

This aligns with Claude Code's native memory system (`.claude/rules/*.md`) while providing cross-platform consistency.

### Why Modular Rules?

Claude Code supports path-specific rules using YAML frontmatter with the `paths` field. This allows rules to conditionally apply based on which files Claude is working with.

### Directory Structure

```
.sigma/
├── rules/
│   ├── code-style.md           # Coding standards (always active)
│   ├── testing.md              # Testing conventions
│   ├── frontend.md             # Frontend-specific rules
│   ├── backend.md              # Backend-specific rules
│   └── security.md             # Security requirements

.claude/
├── rules/
│   ├── code-style.md           # Mirrors .sigma for Claude Code
│   ├── testing.md              # Claude Code native format
│   └── ...
```

### Rule File Format

Each rule file uses YAML frontmatter with optional path-specific targeting:

```markdown
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

### Generate These Rules

#### `.sigma/rules/code-style.md` (Always Generated)

```markdown
---
description: Project-wide coding standards and conventions
---

# Code Style Rules

## TypeScript Conventions

- Use `function` keyword for top-level functions
- Arrow functions for callbacks and inline functions
- Explicit return types for exported functions
- No `any` unless explicitly justified

## Naming Conventions

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase with descriptive names

## Import Organization

1. External packages (react, next, etc.)
2. Internal aliases (@/components, @/lib)
3. Relative imports (../, ./)
4. Type imports last
```

#### `.sigma/rules/testing.md` (If Tests Detected)

```markdown
---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/tests/**"
  - "**/__tests__/**"
---

# Testing Conventions

## Test File Naming

- Unit tests: `[component].test.ts`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[flow].e2e.test.ts`

## Test Structure

Use AAA pattern:
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code under test
- **Assert**: Verify expected outcomes

## Coverage Requirements

- Minimum 80% coverage for utilities
- All user flows must have E2E tests
- Critical paths require integration tests
```

#### `.sigma/rules/frontend.md` (If Frontend Detected)

```markdown
---
paths:
  - "src/components/**"
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---

# Frontend Development Rules

## Component Patterns

- Prefer composition over prop drilling
- Extract reusable logic into custom hooks
- Co-locate styles with components

## State Management

- Local state for UI concerns
- Server state via React Query/SWR
- Global state sparingly (auth, theme)

## Performance

- Memoize expensive computations
- Lazy load non-critical components
- Optimize images and assets
```

#### `.sigma/rules/backend.md` (If Server Actions/API Detected)

```markdown
---
paths:
  - "actions/**/*.ts"
  - "app/api/**/*.ts"
  - "lib/server/**/*.ts"
---

# Backend Development Rules

## Server Actions

- Always validate input with Zod
- Use Result pattern for returns
- Handle errors gracefully

## API Routes

- RESTful naming conventions
- Consistent error responses
- Rate limiting for public endpoints

## Database

- Use transactions for multi-step operations
- Index frequently queried columns
- RLS for all user data
```

#### `.sigma/rules/security.md` (Always Generated)

```markdown
---
description: Security requirements for all code
---

# Security Rules

## Authentication

- Never store sensitive data in localStorage
- Use HTTP-only cookies for sessions
- Implement proper CSRF protection

## Data Validation

- Validate ALL user input server-side
- Sanitize output to prevent XSS
- Use parameterized queries only

## Secrets

- Never commit API keys or secrets
- Use environment variables
- Rotate credentials regularly
```

### Generation Logic

Add to Phase 1 detection:

```bash
# Create primary rules directory (Claude Code)
mkdir -p .claude/rules
mkdir -p .claude/agents
mkdir -p .sigma/rules

# Primary output is .claude/rules/ — copy to .sigma/rules/ for cross-platform reference
for rule in .claude/rules/*.md; do
  cp "$rule" ".sigma/rules/$(basename $rule)"
done

# If Cursor detected, also generate .cursor/rules/*.mdc
if [ -d ".cursor" ] || [ -f ".cursorrules" ]; then
  mkdir -p .cursor/rules
  # Convert .claude/rules/*.md → .cursor/rules/*.mdc (add Cursor frontmatter)
fi
```

### Add to Phase 3 Context Router

Include in CLAUDE.md Context Engine section:
- `code-style.md` — Coding standards and conventions (always active)
- `testing.md` — Testing conventions (test files)
- `frontend.md` — Frontend development rules (component files)
- `backend.md` — Backend development rules (API/action files)
- `security.md` — Security requirements (always active)

If Cursor detected, also include in `.cursorrules`:
```markdown
# @import .cursor/rules/code-style.mdc
```

**HITL checkpoint →** Confirm modular rules generation.
**Prompt:** "Will generate `.claude/rules/` with modular rules. Reply `confirm` to continue."

---

## Preflight
1) **Analyze Project**: 
   - Read `docs/stack-profile.json` (tech stack)
   - Read `docs/implementation/FEATURE-BREAKDOWN.md` (Step 10 outputs)
   - Read `docs/specs/MASTER_PRD.md` (vision & value prop)
2) **Scan Step 11 PRD Outputs**:
   - Read `docs/prds/.prd-status.json` (PRD registry)
   - Scan `docs/prds/F[N]-*.md` for domain-specific patterns
   - Extract: Appetites, BDD Scenarios, Rabbit Holes, Quality Gates
3) **Scan for Domains**: Check for specific patterns (Payment code? AI code? Mobile code? Wireframe prototypes?).
4) **Create Rules Dirs**: `mkdir -p .claude/rules .claude/agents`. If Cursor detected: `mkdir -p .cursor/rules`.

---

## Phase 1: Domain Scanning (The "Context Sensors")

Detect which "Expert Personas" this project needs based on evidence.

**Scan Locations:**
- **Code files:** `app/**/*.ts`, `app/**/*.tsx`, `components/**/*.tsx`, `actions/**/*.ts`, `lib/**/*.ts`
- **Config files:** `package.json`, `drizzle.config.ts`, `tailwind.config.ts`
- **Docs:** `docs/specs/MASTER_PRD.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/prds/*.md`
- **PRD artifacts:** `docs/prds/F*.md` (scan for BDD/Shape Up patterns)
- **Step 10 outputs:** `docs/implementation/BETTING-TABLE.md`, `docs/implementation/RABBIT-HOLES.md`

| Domain | Trigger (If code/docs contains...) | Rule to Generate (`.claude/rules/`) |
| :--- | :--- | :--- |
| **Subscription** | `stripe`, `lemon`, `whop`, `credits` in code/package.json | `credit-subscription-model.md` |
| **AI/Voice** | `openai`, `livekit`, `assemblyai` in code/package.json | `voice-intake-flow.md` |
| **Database** | `supabase`, `drizzle`, `convex` in code/config | `data-models-relationships.md` |
| **Marketing** | `app/(marketing)`, `landing-page` directories exist | `marketing-personas.md` |
| **Design** | `tailwind`, `shadcn`, `framer` in package.json | `design-system.md` |
| **Wireframes** | `/wireframes/` or `/wireframes-mobile/` directory exists | `wireframe-visual-design.md` |
| **PRD/BDD** | `Given/When/Then`, `Appetite:`, `INVEST Score` in `docs/prds/*.md` | `prd-generation-algorithm.md` |
| **Shape Up** | `Betting Table`, `Rabbit Holes` in `docs/implementation/*.md` | `shape-up-workflow.md` |
| **Animation Quality** | `Animation Performance Budget`, `60fps` in `docs/design/DESIGN-SYSTEM.md` | `animation-quality.md` |
| **State Transitions** | `State Transition Performance`, `State Transition Quality` in `docs/states/*.md` | `state-transition-quality.md` |
| **Bulletproof Gates** | `TRACEABILITY-MATRIX.md`, `ZERO-OMISSION-CERTIFICATE.md` in `docs/flows/` | `prd-traceability.md` |
| **Backend Completeness** | `actions/**/*.ts`, `server action`, `use server` in code OR `SECTION 0.5` in PRDs | `backend-completeness.md` |
| **Agentic Readiness** | `File Manifest`, `Implementation Order`, `SECTION 15` in PRDs | `agentic-readiness.md` |
| **Full Stack** | `FULL STACK OVERVIEW`, `Backend Scope` in PRDs or Step 10 outputs | `full-stack-prd-enforcement.md` |
| **AI/LLM** | `openai`, `anthropic`, `langchain`, `llm`, `ai-sdk` in code/package.json | Security: `sigma-security-ai-safety` agent |
| **Mobile** | `react-native`, `expo` in package.json OR `ios/`, `android/` dirs exist | Security: `sigma-security-mobile` agent |
| **Infrastructure** | `Dockerfile`, `docker-compose.*`, `.github/workflows/`, `terraform/` | Security: `sigma-security-infra` agent |
| **Compliance** | `gdpr`, `hipaa`, `soc2`, `pci` in docs/code, privacy policy files | Security: `sigma-security-compliance` agent |

### Domain-to-Path Mapping (for `paths:` frontmatter)

When generating rules, apply `paths:` frontmatter so rules activate only when Claude works on relevant files. Map each detected domain to file patterns:

| Detected Domain | Generated `paths:` patterns |
|----------------|---------------------------|
| Frontend / React / Next.js | `src/components/**/*.tsx`, `src/hooks/**/*.ts`, `app/**/*.tsx`, `components/**/*.tsx` |
| API / Backend | `src/api/**/*.ts`, `app/api/**/*.ts`, `src/routes/**/*.ts`, `server/**/*.ts`, `actions/**/*.ts` |
| Database | `src/db/**/*.ts`, `prisma/**`, `drizzle/**`, `supabase/migrations/**` |
| Testing | `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `tests/**`, `__tests__/**` |
| Styling / Design | `**/*.css`, `**/*.scss`, `tailwind.config.*`, `src/styles/**` |
| DevOps / CI | `.github/**`, `Dockerfile`, `docker-compose.*`, `.gitlab-ci.yml` |
| Subscription / Payments | `**/payments/**`, `**/billing/**`, `**/stripe/**`, `**/credits/**` |
| Marketing | `app/(marketing)/**`, `src/marketing/**`, `landing/**` |
| Security | `**/auth/**`, `**/middleware.*`, `**/rls/**`, `supabase/**`, `**/security/**` |
| AI/LLM Safety | `**/ai/**`, `**/llm/**`, `**/agents/**`, `**/prompts/**` |
| Mobile | `ios/**`, `android/**`, `**/mobile/**`, `*.swift`, `*.kt` |
| Infrastructure | `Dockerfile`, `docker-compose.*`, `.github/**`, `terraform/**`, `k8s/**` |
| Compliance | `**/privacy/**`, `**/consent/**`, `**/audit/**`, `docs/compliance/**` |

**Rules without `paths:`** apply globally (e.g., `project-context.md`, `security.md`, `reasoning.md`).

### Generated Directory Structure

Step 12 Phase 2 output should organize rules into subdirectories for large projects:

```
.claude/rules/
├── code-style.md              # Global (no paths:)
├── project-context.md         # Global
├── security.md                # Global
├── reasoning.md               # Global
├── frontend/
│   ├── react.md               # paths: ["src/components/**/*.tsx", "app/**/*.tsx"]
│   └── design-system.md       # paths: ["**/*.css", "tailwind.config.*"]
├── backend/
│   ├── api.md                 # paths: ["app/api/**", "actions/**"]
│   └── database.md            # paths: ["prisma/**", "src/db/**", "drizzle/**"]
├── testing/
│   └── conventions.md         # paths: ["**/*.test.*", "**/*.spec.*"]
└── workflow/
    ├── project-governance.md  # Global
    └── shape-up.md            # paths: ["docs/prds/**"]
```

**Flat vs. nested decision:**
- If ≤8 rules detected → flat structure (all in `.claude/rules/`)
- If >8 rules detected → nested structure with subdirectories

---

## Phase 2: Modular Rule Generation (The "Expert Modules")

For each detected domain, generate the rule file in `.claude/rules/*.md` (primary). If Cursor is detected, also generate the corresponding `.cursor/rules/*.mdc` file.

### 2.1 Core Rules (Always Generated — no `paths:`, always active)
*   **`project-context.md`** → `.claude/rules/project-context.md`: Extracts Project Name, Vision, and Value Prop from `MASTER_PRD.md`.
*   **`tech-stack.md`** → `.claude/rules/tech-stack.md`: Hardcodes the specific versions from `stack-profile.json`.
*   **`coding-standards.md`** → `.claude/rules/coding-standards.md`: Enforces TS Strict, Naming Conventions, Testing.
*   **`project-governance.md`** → `.claude/rules/project-governance.md`: Enforces the Step 1-12 Workflow (no skipping steps).
*   **`reasoning.md`** → `.claude/rules/reasoning.md`: Epistemic caution, evidence requirements, anti-sycophancy.
*   **`security.md`** → `.claude/rules/security.md`: OWASP, auth patterns, secrets management.

> **Cursor conditional:** If Cursor detected, also generate `.cursor/rules/project-context.mdc`, `.cursor/rules/tech-stack.mdc`, `.cursor/rules/coding-standards.mdc`, `.cursor/rules/project-governance.mdc` with Cursor-specific frontmatter.

### 2.2 Domain Rules (Conditional — use `paths:` from Domain-to-Path Mapping)

Each domain rule MUST include a `paths:` frontmatter block using the patterns from the Domain-to-Path Mapping table. Example:

```yaml
---
paths:
  - "src/components/**/*.tsx"
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---
# Design System Rules
...
```

*   **`design-system.md`**: `paths: frontend patterns`. Reads `docs/design/DESIGN-SYSTEM.md` to enforce colors/tokens.
*   **`credit-subscription-model.md`**: `paths: payments patterns`. (If detected) Enforces credit logic and locking.
*   **`marketing-personas.md`**: `paths: marketing patterns`. (If detected) Enforces Hormozi copy principles.
*   **`wireframe-visual-design.md`**: `paths: frontend patterns`. (If wireframe prototypes exist) Enforces component refinement from wireframe foundation code.

### 2.3 Animation & State Quality Rules (From Step 6/7 Outputs — use `paths:` from mapping)
*   **`animation-quality.md`**: `paths: styling/frontend patterns`. (If animation framework detected) Enforces 60fps target, GPU-accelerated properties only (`transform`, `opacity`), `prefers-reduced-motion` support, animation performance budgets (<100ms first animation, <300ms complex).
*   **`state-transition-quality.md`**: `paths: frontend patterns`. (If state framework detected) Enforces state transition performance (Empty→Loading 150ms, Loading→Populated 300ms), prohibited properties during transitions (`width`, `height`, `margin`), accessibility requirements.
*   **`prd-traceability.md`**: `paths: ["docs/prds/**", "docs/flows/**"]`. (If bulletproof artifacts exist) Enforces PRD feature-to-screen verification, zero omission validation, screen count matching between Step 4 and Step 5.

### 2.4 PRD-Derived Rules (From Step 11 Outputs)
*   **`prd-generation-algorithm.md`**: (If BDD patterns detected) Enforces Given/When/Then acceptance criteria format.
*   **`shape-up-workflow.md`**: (If Shape Up artifacts exist) Enforces Appetite limits, Betting Table structure, Rabbit Hole documentation.

### 2.5 Full-Stack Enforcement Rules (From Step 11 v3.0.0)
*   **`backend-completeness.md`**: (If server actions or PRDs exist) Enforces:
    - Every UI component that fetches/mutates data has corresponding server action
    - All server actions include Zod validation schemas
    - Result pattern return types (`{ success: true, data }` or `{ success: false, error }`)
    - OWASP API Security Top 10 considerations per endpoint
    - RLS policies for all new database tables
*   **`agentic-readiness.md`**: (If PRDs exist) Enforces:
    - All file paths explicit (not "create a component")
    - Code examples include imports
    - Implementation order specified
    - Dependencies listed with versions
    - Test file paths included
*   **`full-stack-prd-enforcement.md`**: (If PRDs exist) Enforces:
    - Section 0.5 (Full Stack Overview) present and non-empty
    - Section 15 (Agentic Implementation Guide) present
    - Backend Scope in feature shaping is never "TBD"
    - Gate 7 (Backend Completeness) and Gate 8 (Agentic Readiness) must pass

> **Cursor conditional:** For each domain rule generated above, if Cursor detected, also generate the `.mdc` equivalent in `.cursor/rules/`.

---

## Phase 3: The Master Context Router

### Primary: CLAUDE.md Injection

Inject the context routing section into the target project's `CLAUDE.md`. This replaces the `.cursorrules` file as the primary context mechanism for Claude Code.

**CLAUDE.md injection template (~95 lines):**

The injected CLAUDE.md should be slim. Detailed references go in `.claude/rules/`. Target ~95 lines.

```markdown
# {{PROJECT_NAME}} - Claude Code Configuration

**Version:** 1.0.0 | **Generated:** {{DATE}} by Step 12

## Overview

{{PROJECT_DESCRIPTION}}

| Platform | Configuration | Status |
|----------|---------------|--------|
| **Claude Code** | `.claude/` | Production |
{additional platforms as detected}

## Quick Start

```bash
claude "Run step 1 ideation for {{PROJECT_NAME}}"
claude "Continue to step 2"
claude "Verify step 1"
```

## Key Principles

### Value Equation (Hormozi)
```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
```

### HITL Checkpoints
Commands pause for human approval at critical points. Never skip these.

### Quality Gates
Each step has verification criteria. Target: 80+/100 score.

### TODO Policy
- TODOs in production code must include an issue reference: `TODO(#issue-id): ...`

## Execution Philosophy: Delegate-First

**For all multi-agent work, use `Shift+Tab` to enter delegate mode.** The orchestrator delegates to specialized agents — never implements directly.

- Never work solo on complex tasks. Use agent swarms for PRD execution.
- Match agent team size to PRD complexity (5-20 agents).
- Every team MUST include Devil's Advocate + Gap Analyst gates.
- Before ANY planning, auto-invoke `deep-research` skill.

## Self-Learning Preferences (Auto-Generated)

> Last updated: {{DATE}} | Sessions analyzed: 0 | Confidence: 0%

### Key Behaviors
- Autonomy: low - Confirm before significant changes
- Verbosity: standard - Provide appropriate detail

_Generated by SLAS. Run `/session-distill` to update._

## Rules & References

Detailed command reference, workflow, skills catalog, MCP tools, swarm orchestration, and SLAS documentation are in `.claude/rules/`:

- `commands-reference.md` — All available commands
- `workflow.md` — Step 0-13 flow diagram
- `swarm-orchestration.md` — Swarm sizing, mandatory agents, auto-skill invocation
- `skills-reference.md` — Skills by category
- `mcp-tools.md` — MCP tools + Task management
- `slas-system.md` — Self-Learning Agent System
- `documentation-links.md` — Documentation links

## Agent Registry

See `.claude/agents/` for specialized agent definitions.

| Agent | Domain |
|-------|--------|
| sigma-planner | Architecture & planning |
| sigma-executor | Implementation |
| sigma-reviewer | Quality assurance |
| sigma-devils-advocate | Adversarial review gate |
| sigma-gap-analyst | Requirements traceability gate |
| sigma-security-lead | Security coordination |
{additional agents as generated by stack detection}

## Documentation

- [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md)
- [PLATFORMS.md](docs/PLATFORMS.md)
```

**Key changes from previous template:**
- Reduced from ~70 lines of injection to ~95 lines total CLAUDE.md
- Moved command tables, workflow diagrams, skill catalogs, MCP details, SLAS docs to `.claude/rules/`
- Added delegate mode instruction
- Added `.claude/rules/` reference pointer
- Removed inline security agent table (lives in `swarm-orchestration.md` rule)
- Removed MCP priority section (lives in `mcp-tools.md` rule)
- Removed Development Mode section (lives in `workflow.md` rule)

### Secondary: .cursorrules (If Cursor detected)

If Cursor is detected, **also** generate the `.cursorrules` router file that imports `.cursor/rules/*.mdc` files.

**Template for .cursorrules:**

```markdown
# === Sigma Context Router ===
# Auto-loads modular rules based on user intent to reduce context noise.

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
```

---

## Phase 3.5: Hook Generation

Generate a baseline hooks configuration for the target project. Hooks are configured in `.claude/settings.json` under the `hooks` key.

### Standard Hooks (Always Generated)

| Hook | Event | Purpose | Implementation |
|------|-------|---------|----------------|
| Session context | `SessionStart` | Inject project state (git branch, last commit, in-progress work) | Shell script reading git state |
| Security check | `PreToolUse:Bash` | Block dangerous commands (`rm -rf /`, `DROP TABLE`, `--no-verify`) | Pattern matching in shell |
| Test reminder | `Stop` | If code was edited but no tests run, remind | Check git diff + test log |

### Conditional Hooks

| Hook | Event | Condition | Purpose |
|------|-------|-----------|---------|
| Pre-commit lint | `PreToolUse:Bash` | ESLint detected | Match `git commit` → run lint first |
| Post-edit format | `PostToolUse:Edit\|Write` | Prettier detected | Auto-format changed files |
| TypeScript check | `PostToolUse:Edit\|Write` | TypeScript detected | Run tsc on changed files |

### Session Continuity Hooks (Optional — lighter SLAS)

If the user opts in during HITL, generate a session continuity package:

**`SessionStart` hook — inject last session context:**
```bash
#!/bin/bash
# .claude/hooks/session-start-context.sh
# Reads last session summary and injects as context

SESSION_DIR="docs/sessions"
LATEST="$SESSION_DIR/latest.md"

if [ -f "$LATEST" ]; then
  echo "## Previous Session Context"
  echo ""
  cat "$LATEST"
fi

# Always inject git state
echo "## Current Git State"
echo "- Branch: $(git branch --show-current)"
echo "- Last commit: $(git log --oneline -1)"
echo "- Uncommitted files: $(git status --short | wc -l | tr -d ' ')"
```

**`Stop` hook — capture session summary:**
```bash
#!/bin/bash
# .claude/hooks/session-end-summary.sh
# Captures minimal session metadata for next session

SESSION_DIR="docs/sessions"
mkdir -p "$SESSION_DIR"

cat > "$SESSION_DIR/latest.md" << EOF
**Last Session:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Branch:** $(git branch --show-current)
**Last Commit:** $(git log --oneline -1)
**Modified Files:**
$(git diff --name-only HEAD 2>/dev/null | head -20)
EOF
```

### Hook Configuration Output

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": ".claude/hooks/session-start-context.sh"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "type": "command",
        "command": ".claude/hooks/security-check.sh"
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": ".claude/hooks/session-end-summary.sh"
      }
    ]
  }
}
```

**HITL checkpoint →** Confirm hook generation.
**Prompt:** "Will generate hooks in `.claude/hooks/` and update `.claude/settings.json`. Include session continuity hooks? [yes/no]"

---

## Phase 4: Execution Logic

1.  **Scan**: Identify active domains.
2.  **Generate Claude Code Rules**: Write `.claude/rules/*.md` files with `paths:` frontmatter (primary output).
3.  **Generate Claude Code Agents**: Write `.claude/agents/*.md` with YAML frontmatter (tools, model, skills).
4.  **Generate `.claude/settings.json`**: Enable agent teams, configure hooks.
5.  **Generate Hooks**: Write `.claude/hooks/` scripts based on detected tooling.
6.  **Inject CLAUDE.md**: Add context router, delegation philosophy, skill-agent registry, agent registry.
7.  **Generate Cursor Rules** (if Cursor detected): Write `.cursor/rules/*.mdc` and `.cursorrules`.
8.  **Generate OpenCode Artifacts** (if OpenCode detected): Write `.opencode/` configs.
9.  **Generate Codex Artifacts** (if Codex detected): Write `.codex/` configs.
10. **Verify**: Check that all rule file paths, agent references, and hook paths resolve correctly.

---

## Final Review

**Prompt**:
> "Context Engine initialized.
> ✅ Generated [X] Domain Rules in `.claude/rules/` (with path scoping).
> ✅ Generated [N] Claude Code custom agents in `.claude/agents/` (with skill binding).
> ✅ Updated `.claude/settings.json` (agent teams enabled, hooks configured).
> ✅ Generated [H] hooks in `.claude/hooks/`.
> ✅ Injected delegation-first philosophy, skill-agent registry, and context router into CLAUDE.md.
> ✅ Generated Cursor rules (if detected): [Y] `.mdc` files + `.cursorrules`.
> ✅ Generated OpenCode/Codex artifacts (if detected).
>
> Your AI is now context-aware, delegation-enabled, and hook-wired.
> Reply `approve step 12` to confirm."

---

<verification>
## Step 12 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Rules Directory | /.claude/rules/ | exists | 4 |
| Project Context Rule | /.claude/rules/project-context.md | 200B | 4 |
| Tech Stack Rule | /.claude/rules/tech-stack.md | 200B | 3 |
| Design System Rule | /.claude/rules/design-system.md | 200B | 3 |
| Agents Directory | /.claude/agents/ | exists | 2 |
| `.claude/agents/sigma-planner.md` | `.claude/agents/` | 200B | 2 |
| `.claude/agents/sigma-executor.md` | `.claude/agents/` | 200B | 2 |

### Optional Files (Cursor — bonus 5 points)

| File | Path | Condition | Points |
|------|------|-----------|--------|
| Context Router | /.cursorrules | If Cursor detected | 2 |
| Cursor Rules Directory | /.cursor/rules/ | If Cursor detected | 1 |
| Cursor Rules Count | /.cursor/rules/*.mdc | At least 3 if Cursor detected | 2 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| CLAUDE.md | Context Engine | 5 |
| CLAUDE.md | Agent Registry | 5 |
| CLAUDE.md | Domain Rules | 5 |
| project-context.md | Project Name | 5 |
| project-context.md | Core Philosophy | 5 |
| tech-stack.md | Framework | 5 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:CLAUDE.md:Context Engine\|Domain Rules | Context routing in CLAUDE.md | 8 |
| file_count:/.claude/rules/:3 | At least 3 rule files generated | 8 |
| has_pattern:project-context.md:valuation\|unicorn\|billion | Valuation context present | 5 |
| has_pattern:tech-stack.md:Next\|React\|Supabase | Tech stack referenced | 5 |
| has_pattern:design-system.md:color\|token\|component | Design tokens referenced | 4 |

### Hooks & Settings (10 points)

| Check | Description | Points |
|-------|-------------|--------|
| file_exists:.claude/settings.json | Settings file generated | 2 |
| has_pattern:settings.json:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS | Agent teams enabled | 3 |
| has_pattern:settings.json:hooks | Hooks configured | 3 |
| file_exists:.claude/hooks/ | Hooks directory exists | 2 |

### Agent Frontmatter Quality (10 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:sigma-executor.md:tools:\|model:\|skills: | Agent has rich frontmatter | 3 |
| has_pattern:sigma-frontend.md:skills: | Frontend agent has skill binding | 3 |
| has_pattern:CLAUDE.md:Delegation-First\|delegation-first | Delegation philosophy injected | 4 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| CLAUDE.md Injected | CLAUDE.md has Context Engine + Delegation section | 5 |
| Rules Generated | At least 3 .claude/rules/*.md files with paths: frontmatter | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Context Aware | CLAUDE.md references relevant rules | 2 |
| Domain Detection | Conditional rules based on detected domains with path scoping | 2 |
| PRD Integration | Rules reference Step 11 PRD patterns | 2 |
| Skill-Agent Binding | Agents reference skills in frontmatter | 2 |
| Hook Wiring | At least 2 hooks configured in settings.json | 2 |

</verification>
