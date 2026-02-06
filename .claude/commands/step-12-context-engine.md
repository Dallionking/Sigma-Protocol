---
version: "5.0.0"
last_updated: "2026-02-05"
changelog:
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

#### 2) `.claude/agents/` (custom agent definitions)

Create `.claude/agents/` and generate agent markdown files. Each file defines a specialized role for the Task tool.

**Agent file format:**
- Path: `.claude/agents/{name}.md`
- Content: Markdown with role description, domain expertise, and behavioral instructions
- The filename (minus `.md`) becomes the `subagent_type` value

**Generate these agents (minimum — adapt to detected stack):**

| Agent File | Role | Domain |
|------------|------|--------|
| `sigma-planner.md` | Architecture & planning | System design, PRD review, tech decisions |
| `sigma-executor.md` | Implementation | Writing production code |
| `sigma-reviewer.md` | Quality assurance | Code review, bug investigation |
| `sigma-researcher.md` | Investigation | Research, docs lookup, context gathering |
| `sigma-sisyphus.md` | Verification loops | Acceptance testing, gap analysis |
| `sigma-frontend.md` | UI/UX implementation | React components, styling, accessibility |
| `sigma-backend.md` | API/Data layer | APIs, server actions, database |
| `sigma-qa.md` | Testing | Test writing, coverage, regression |
| `sigma-docs.md` | Documentation | README, API docs, comments |
| `sigma-security.md` | Security | Auth, RLS, vulnerability checks |

**Stack-adaptive generation rules:**
- If React/Next.js detected → include `sigma-frontend.md` with React-specific instructions
- If no frontend framework → skip `sigma-frontend.md`
- If Supabase detected → include RLS patterns in `sigma-backend.md` and `sigma-security.md`
- If no test framework → make `sigma-qa.md` focus on test setup + writing
- Always include: `sigma-planner`, `sigma-executor`, `sigma-reviewer`, `sigma-sisyphus`

**Each agent file should contain:**

```markdown
# Role: {Agent Name}

You are {role description tailored to the project}.

## Domain
{What this agent specializes in}

## Stack Context
{Project-specific stack details — framework, database, auth, etc.}

## Behavioral Rules
1. {Domain-specific rules}
2. {Quality expectations}
3. Always verify your work before reporting completion

## Available Skills
{List skills relevant to this agent's domain from .claude/skills/ if they exist}
```

#### 3) CLAUDE.md Injection (Context Router + Agent Registry)

If CLAUDE.md exists in the target project, inject the context router, swarm-first philosophy, and agent registry. **This replaces the `.cursorrules` router as the primary context mechanism.**

**Template source:** `templates/claude-md/swarm-first-section.md`

**Processing steps:**
1. Read the template
2. Replace `{{SKILLS_BY_CATEGORY}}` with actual skills found in `.claude/skills/`
3. Replace `{{SKILL_COUNT}}` with the count
4. If CLAUDE.md already has `## Agent Registry` → replace that section
5. If not → append after the last `---` separator

**Also inject from:** `templates/claude-md/agent-registry.md`
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

---

## Phase 2: Modular Rule Generation (The "Expert Modules")

For each detected domain, generate the rule file in `.claude/rules/*.md` (primary). If Cursor is detected, also generate the corresponding `.cursor/rules/*.mdc` file.

### 2.1 Core Rules (Always Generated)
*   **`project-context.md`** → `.claude/rules/project-context.md`: Extracts Project Name, Vision, and Value Prop from `MASTER_PRD.md`.
*   **`tech-stack.md`** → `.claude/rules/tech-stack.md`: Hardcodes the specific versions from `stack-profile.json`.
*   **`coding-standards.md`** → `.claude/rules/coding-standards.md`: Enforces TS Strict, Naming Conventions, Testing.
*   **`project-governance.md`** → `.claude/rules/project-governance.md`: Enforces the Step 1-12 Workflow (no skipping steps).

> **Cursor conditional:** If Cursor detected, also generate `.cursor/rules/project-context.mdc`, `.cursor/rules/tech-stack.mdc`, `.cursor/rules/coding-standards.mdc`, `.cursor/rules/project-governance.mdc` with Cursor-specific frontmatter.

### 2.2 Domain Rules (Conditional)
*   **`design-system.md`**: Reads `docs/design/DESIGN-SYSTEM.md` to enforce colors/tokens.
*   **`credit-subscription-model.md`**: (If detected) Enforces credit logic and locking.
*   **`marketing-personas.md`**: (If detected) Enforces Hormozi copy principles.
*   **`wireframe-visual-design.md`**: (If wireframe prototypes exist) Enforces component refinement from wireframe foundation code.

### 2.3 Animation & State Quality Rules (From Step 6/7 Outputs)
*   **`animation-quality.md`**: (If animation framework detected) Enforces 60fps target, GPU-accelerated properties only (`transform`, `opacity`), `prefers-reduced-motion` support, animation performance budgets (<100ms first animation, <300ms complex).
*   **`state-transition-quality.md`**: (If state framework detected) Enforces state transition performance (Empty→Loading 150ms, Loading→Populated 300ms), prohibited properties during transitions (`width`, `height`, `margin`), accessibility requirements.
*   **`prd-traceability.md`**: (If bulletproof artifacts exist) Enforces PRD feature-to-screen verification, zero omission validation, screen count matching between Step 4 and Step 5.

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

**CLAUDE.md injection template:**

```markdown
## Context Engine (Auto-Generated by Step 12)

### Domain Rules
Path-specific rules are loaded automatically from `.claude/rules/`:
- `project-context.md` — Project name, vision, value prop (always active)
- `tech-stack.md` — Framework versions, language standards (code files)
- `design-system.md` — Colors, tokens, component patterns (frontend files)
- `coding-standards.md` — TS strict, naming, testing conventions (all code)
- `project-governance.md` — Step 1-12 workflow enforcement (process)
{additional domain rules as detected}

### Agent Registry
See `.claude/agents/` for specialized agent definitions.

| Agent | Domain | Use With |
|-------|--------|----------|
| sigma-planner | Architecture & planning | Task tool subagent_type |
| sigma-executor | Implementation | Task tool subagent_type |
| sigma-reviewer | Quality assurance | Task tool subagent_type |
| sigma-sisyphus | Verification loops | Task tool subagent_type |
{additional agents as generated}

### MCP Priority
**Strategy:** Ref (docs) → Exa (code) | Context7 → Perplexity (backup)

1. **Ref**: Official docs/API refs
2. **Exa**: Code examples/real-world usage
3. **Context7**: Backup docs
4. **Perplexity**: Backup research
5. **Supabase MCP**: DB/Auth specifics

### Development Mode (Agentic Layer)

When running /dev-loop or /implement-prd, operate in **Grade 4 Agentic Mode**:

1. **Read State** — Check `.sigma/memory/active_task.md` for current progress
2. **Use Tools** — Run `.sigma/tools/` scripts (typecheck, lint, test, build)
3. **Self-Correct** — If verification fails, run /gap-analysis before asking for help
4. **Update State** — Write to `.sigma/memory/active_task.md` after each phase

### Valuation Context ($1B Standard)
You are a **Founding Technical Partner** at a **$1B Unicorn Scale-Up**.
- **Code:** Rigorous, scalable, typed, tested
- **UX:** Pixel-perfect, <120s time-to-value, delightful
- **Ops:** Zero-drift documentation, surgical repo hygiene
- **Mindset:** Hormozi Value Equation
```

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

## Phase 4: Execution Logic

1.  **Scan**: Identify active domains.
2.  **Generate Claude Code Rules**: Write `.claude/rules/*.md` files (primary output).
3.  **Generate Claude Code Agents**: Write `.claude/agents/*.md` agent definitions.
4.  **Inject CLAUDE.md**: Add context router, agent registry, and domain routing to CLAUDE.md.
5.  **Generate Cursor Rules** (if Cursor detected): Write `.cursor/rules/*.mdc` and `.cursorrules`.
6.  **Generate OpenCode Artifacts** (if OpenCode detected): Write `.opencode/` configs.
7.  **Generate Codex Artifacts** (if Codex detected): Write `.codex/` configs.
8.  **Verify**: Check that all rule file paths and cross-references resolve correctly.

---

## Final Review

**Prompt**:
> "Context Engine initialized.
> ✅ Generated [X] Domain Rules in `.claude/rules/`.
> ✅ Generated [N] Claude Code custom agents in `.claude/agents/`.
> ✅ Injected context router and agent registry into CLAUDE.md.
> ✅ Generated Cursor rules (if detected): [Y] `.mdc` files + `.cursorrules`.
> ✅ Generated OpenCode/Codex artifacts (if detected).
>
> Your AI is now context-aware and swarm-enabled.
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

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| CLAUDE.md Injected | CLAUDE.md has Context Engine section | 5 |
| Rules Generated | At least 3 .claude/rules/*.md files exist | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Context Aware | CLAUDE.md references relevant rules | 4 |
| Domain Detection | Conditional rules based on detected domains | 3 |
| PRD Integration | Rules reference Step 11 PRD patterns | 3 |

</verification>
