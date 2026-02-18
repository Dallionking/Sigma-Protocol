---
version: "4.3.0"
last_updated: "2026-02-04"
changelog:
  - "4.3.0: Added Codex integration outputs (.codex/config.toml + .codex/skills; legacy: .agents/skills) and detection rules"
  - "4.2.0: Added Full-Stack Enforcement Rules (Section 2.5) - generates backend-completeness.mdc, agentic-readiness.mdc, full-stack-prd-enforcement.mdc to enforce Step 11 v3.0.0 requirements"
  - "4.1.0: Added OpenCode dual-generation (opencode.jsonc + .opencode/{agent,command,skill})"
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
Generate a sophisticated **Context Router** (`.cursorrules`) and a suite of **Domain-Specific Rules** (`.mdc` files).
**Context:** You are the **Chief Context Engineer**. You don't just dump text; you architect *how* the AI behaves by creating a modular, intelligent rule system.

**Single-Agent Rule (No Subagents)**
This step must run entirely in the **primary session**. Do **not** spawn subagents or delegate via Task. If multiple roles are needed, simulate them using labeled sections within the same response.

<goal>
You are the **Chief Context Engineer**. Execute ALL phases (Preflight through Phase 4) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| Pre | OpenCode Dual-Generation | `opencode.jsonc`, `.opencode/agent/`, `.opencode/command/`, `.opencode/skill/` (if detected) |
| Pre | Codex Integration | `.codex/config.toml`, `.codex/skills/`, `AGENTS.md` (if detected) |
| Pre | Boilerplate Pattern Rules | `boilerplate-patterns.mdc` (if boilerplate detected) |
| Pre | Agentic Layer Tools | `.sigma/tools/` directory with verification scripts |
| Pre | Epistemic Reasoning Rules | `reasoning.mdc` |
| Pre | Modular Rules Structure | `.sigma/rules/`, `.claude/rules/` |
| Preflight | Analyze Project & Scan Domains | Project context loaded, domains identified |
| 1 | Domain Scanning | Detected expert personas and trigger evidence |
| 2 | Modular Rule Generation | `.cursor/rules/*.mdc` domain-specific rule files |
| 3 | Master Context Router | `.cursorrules` root router file |
| 4 | Execution Logic | Scan, generate, verify all file paths |

Final Outputs: `.cursorrules`, `.cursor/rules/*.mdc`, `.sigma/tools/`, `.sigma/rules/`, `.claude/rules/`, `reasoning.mdc`, conditional platform outputs
Quality gate: 80+/100 verification score
</goal>

---

## OpenCode Dual-Generation (NEW — If OpenCode detected)

If OpenCode is detected, **also** generate OpenCode-native artifacts in addition to Cursor outputs.

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
- `.codex/skills/` directory exists
- `.agents/skills/` directory exists (legacy)
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

#### 2) `.codex/skills/` (skills directory)

Ensure `.codex/skills/` exists. Codex loads skills from:

```
.codex/skills/<skill-name>/SKILL.md
```

Legacy fallback (if present):

```
.agents/skills/<skill-name>/SKILL.md
```

Do **not** split steps into subagents. Each skill must contain the **full prompt**.

#### 3) `AGENTS.md` (repo root)

Ensure `AGENTS.md` exists and lists Sigma steps + usage guidance.

#### 4) `.codex/rules/*.rules` (optional)

Codex execution policy rules use **Starlark** format (`.rules` extension). Each rule uses `prefix_rule()` with a `trigger`, regex `pattern`, and `action` (deny/warn/allow). See `platforms/codex/rules/sigma-safety.rules` for examples. Three rule files ship with Sigma: `sigma-safety.rules`, `sigma-workflow.rules`, `sigma-quality.rules`.

---

## BOILERPLATE PATTERN RULES (NEW - If Using Sigma Boilerplate)

**If your project uses a Sigma boilerplate, generate `boilerplate-patterns.mdc` to enforce extension rules.**

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
| Domain | Trigger | Rule to Generate |
| **Boilerplate** | `.sigma/boilerplate.json` exists | `boilerplate-patterns.mdc` |
```

### Add to Phase 2 Rule Generation

Add to section 2.2 Domain Rules:

```markdown
*   **`boilerplate-patterns.mdc`**: (If boilerplate detected) Enforces extension rules, ownership boundaries, and stable API usage.
```

### Add to Phase 3 Context Router

Include in `.cursorrules`:

```markdown
# 🏗️ Boilerplate Patterns (If Using Sigma Boilerplate)
# Activates for all code files in boilerplate projects.
# @import .cursor/rules/boilerplate-patterns.mdc
```

---
**>>> CHECKPOINT: BOILERPLATE PATTERN RULES APPROVAL <<<**

Present the generated `boilerplate-patterns.mdc` content and ownership boundaries to the user.
**Do NOT continue to Agentic Layer Tools until the user explicitly approves.**

Reply `approve boilerplate` or `revise: [feedback]`.
---

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

Include in `.cursorrules`:

```markdown
# 🛠️ Agentic Tools (Grade 3/4 Skills)
# Project-local verification scripts for self-correcting loops.
# Run these to verify your work: .sigma/tools/typecheck.sh, .sigma/tools/lint.sh, etc.
# See .sigma/tools/ for available scripts.
```

---
**>>> CHECKPOINT: AGENTIC LAYER TOOLS APPROVAL <<<**

Present the `.sigma/tools/` directory structure and generated verification scripts to the user.
**Do NOT continue to Epistemic Reasoning Rules until the user explicitly approves.**

Reply `approve agentic-tools` or `revise: [feedback]`.
---

---

## EPISTEMIC REASONING RULES (NEW - Always Generated)

**Generate `reasoning.mdc` to enforce epistemic caution and anti-sycophancy rules.**

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
| API behavior | Use `mcp_ref_ref_search_documentation` |
| Library features | Use `mcp_ref_ref_search_documentation` |
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
*   **`reasoning.mdc`**: (Always generated) Enforces epistemic caution, evidence requirements, and anti-sycophancy.
```

### Add to Phase 3 Context Router

Include in `.cursorrules`:

```markdown
# 🧠 Epistemic Reasoning (Anti-Hallucination)
# Always active - ensures evidence-based responses.
# @import .cursor/rules/reasoning.mdc
```

---
**>>> CHECKPOINT: EPISTEMIC REASONING RULES APPROVAL <<<**

Present the generated `reasoning.mdc` content including anti-sycophancy and evidence requirements to the user.
**Do NOT continue to Modular Rules Structure until the user explicitly approves.**

Reply `approve reasoning` or `revise: [feedback]`.
---

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
# Create rules directories
mkdir -p .sigma/rules
mkdir -p .claude/rules

# Copy rules to both locations for cross-platform support
for rule in .sigma/rules/*.md; do
  cp "$rule" ".claude/rules/$(basename $rule)"
done
```

### Add to Phase 3 Context Router

Include in `.cursorrules`:

```markdown
# 📋 Modular Rules (Cross-Platform)
# Path-specific rules for different code areas.
# See .sigma/rules/ for full list.
# @import .cursor/rules/code-style.mdc
```

---
**>>> CHECKPOINT: MODULAR RULES STRUCTURE APPROVAL <<<**

Present the `.sigma/rules/` and `.claude/rules/` directory structure and generated rule files to the user.
**Do NOT continue to Preflight until the user explicitly approves.**

Reply `approve modular-rules` or `revise: [feedback]`.
---

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
4) **Create Rules Dir**: `mkdir -p .cursor/rules`.

---

## Phase 1: Domain Scanning (The "Context Sensors")

Detect which "Expert Personas" this project needs based on evidence.

**Scan Locations:**
- **Code files:** `app/**/*.ts`, `app/**/*.tsx`, `components/**/*.tsx`, `actions/**/*.ts`, `lib/**/*.ts`
- **Config files:** `package.json`, `drizzle.config.ts`, `tailwind.config.ts`
- **Docs:** `docs/specs/MASTER_PRD.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/prds/*.md`
- **PRD artifacts:** `docs/prds/F*.md` (scan for BDD/Shape Up patterns)
- **Step 10 outputs:** `docs/implementation/BETTING-TABLE.md`, `docs/implementation/RABBIT-HOLES.md`

| Domain | Trigger (If code/docs contains...) | Rule to Generate |
| :--- | :--- | :--- |
| **Subscription** | `stripe`, `lemon`, `whop`, `credits` in code/package.json | `credit-subscription-model.mdc` |
| **AI/Voice** | `openai`, `livekit`, `assemblyai` in code/package.json | `voice-intake-flow.mdc` |
| **Database** | `supabase`, `drizzle`, `convex` in code/config | `data-models-relationships.mdc` |
| **Marketing** | `app/(marketing)`, `landing-page` directories exist | `marketing-personas.mdc` |
| **Design** | `tailwind`, `shadcn`, `framer` in package.json | `design-system.mdc` |
| **Wireframes** | `/wireframes/` or `/wireframes-mobile/` directory exists | `wireframe-visual-design.mdc` |
| **PRD/BDD** | `Given/When/Then`, `Appetite:`, `INVEST Score` in `docs/prds/*.md` | `prd-generation-algorithm.mdc` |
| **Shape Up** | `Betting Table`, `Rabbit Holes` in `docs/implementation/*.md` | `shape-up-workflow.mdc` |
| **Animation Quality** | `Animation Performance Budget`, `60fps` in `docs/design/DESIGN-SYSTEM.md` | `animation-quality.mdc` |
| **State Transitions** | `State Transition Performance`, `State Transition Quality` in `docs/states/*.md` | `state-transition-quality.mdc` |
| **Bulletproof Gates** | `TRACEABILITY-MATRIX.md`, `ZERO-OMISSION-CERTIFICATE.md` in `docs/flows/` | `prd-traceability.mdc` |
| **Backend Completeness** | `actions/**/*.ts`, `server action`, `use server` in code OR `SECTION 0.5` in PRDs | `backend-completeness.mdc` |
| **Agentic Readiness** | `File Manifest`, `Implementation Order`, `SECTION 15` in PRDs | `agentic-readiness.mdc` |
| **Full Stack** | `FULL STACK OVERVIEW`, `Backend Scope` in PRDs or Step 10 outputs | `full-stack-prd-enforcement.mdc` |

---

## Phase 2: Modular Rule Generation (The "Expert Modules")

For each detected domain, generate the `.mdc` file using the **Golden Templates** (if they don't exist).

### 2.1 Core Rules (Always Generated)
*   **`project-context.mdc`**: Extracts Project Name, Vision, and Value Prop from `MASTER_PRD.md`.
*   **`tech-stack.mdc`**: Hardcodes the specific versions from `stack-profile.json`.
*   **`coding-standards.mdc`**: Enforces TS Strict, Naming Conventions, Testing.
*   **`project-governance.mdc`**: Enforces the Step 1-12 Workflow (no skipping steps).

### 2.2 Domain Rules (Conditional)
*   **`design-system.mdc`**: Reads `docs/design/DESIGN-SYSTEM.md` to enforce colors/tokens.
*   **`credit-subscription-model.mdc`**: (If detected) Enforces credit logic and locking.
*   **`marketing-personas.mdc`**: (If detected) Enforces Hormozi copy principles.
*   **`wireframe-visual-design.mdc`**: (If wireframe prototypes exist) Enforces component refinement from wireframe foundation code.

### 2.3 Animation & State Quality Rules (From Step 6/7 Outputs)
*   **`animation-quality.mdc`**: (If animation framework detected) Enforces 60fps target, GPU-accelerated properties only (`transform`, `opacity`), `prefers-reduced-motion` support, animation performance budgets (<100ms first animation, <300ms complex).
*   **`state-transition-quality.mdc`**: (If state framework detected) Enforces state transition performance (Empty→Loading 150ms, Loading→Populated 300ms), prohibited properties during transitions (`width`, `height`, `margin`), accessibility requirements.
*   **`prd-traceability.mdc`**: (If bulletproof artifacts exist) Enforces PRD feature-to-screen verification, zero omission validation, screen count matching between Step 4 and Step 5.

### 2.4 PRD-Derived Rules (From Step 11 Outputs)
*   **`prd-generation-algorithm.mdc`**: (If BDD patterns detected) Enforces Given/When/Then acceptance criteria format.
*   **`shape-up-workflow.mdc`**: (If Shape Up artifacts exist) Enforces Appetite limits, Betting Table structure, Rabbit Hole documentation.

### 2.5 Full-Stack Enforcement Rules (From Step 11 v3.0.0)
*   **`backend-completeness.mdc`**: (If server actions or PRDs exist) Enforces:
    - Every UI component that fetches/mutates data has corresponding server action
    - All server actions include Zod validation schemas
    - Result pattern return types (`{ success: true, data }` or `{ success: false, error }`)
    - OWASP API Security Top 10 considerations per endpoint
    - RLS policies for all new database tables
*   **`agentic-readiness.mdc`**: (If PRDs exist) Enforces:
    - All file paths explicit (not "create a component")
    - Code examples include imports
    - Implementation order specified
    - Dependencies listed with versions
    - Test file paths included
*   **`full-stack-prd-enforcement.mdc`**: (If PRDs exist) Enforces:
    - Section 0.5 (Full Stack Overview) present and non-empty
    - Section 15 (Agentic Implementation Guide) present
    - Backend Scope in feature shaping is never "TBD"
    - Gate 7 (Backend Completeness) and Gate 8 (Agentic Readiness) must pass

---

## Phase 3: The Master Context Router (.cursorrules)

Generate the root `.cursorrules` file. This file acts as a **Router**, dynamically importing the specific `.mdc` files based on what the user is working on.

**Template for .cursorrules:**

```markdown
# === Sigma Context Router ===
# The "Context Engineering Dream" System
# Auto-loads modular rules based on user intent to reduce context noise.

# 🎯 Global Context (Always Active)
# Loads critical project directives, philosophy, and core implementation rules.
# @import .cursor/rules/project-context.mdc

# 🏗️ Technical Stack & Security (Code/Arch)
# Activates when discussing code, architecture, database, API, or security.
# @import .cursor/rules/tech-stack.mdc

# 🎨 Design System & UI (Frontend)
# Activates when discussing UI, components, styling, Tailwind, or UX.
# @import .cursor/rules/design-system.mdc

# 🚨 Governance & Workflow (Process)
# Activates when discussing files, organization, testing, or process.
# @import .cursor/rules/project-governance.mdc

# 🧠 Research & MCPs (Intelligence)
# Activates when needing external knowledge, docs, or best practices.
# @import .cursor/rules/research-guidelines.mdc

# 🔗 Workflow Guide (Steps 1-12)
# Activates when referencing steps, PRDs, Shape Up, BDD, or the development loop.
# @import .cursor/rules/workflow-guide.mdc

---

## 🔧 Quick Reference: MCP Priority
**Strategy:** Ref (docs) → Exa (code) | Context7 → Perplexity (backup)

1.  **Ref (`mcp_ref`):** Official docs/API refs.
2.  **Exa (`exa`):** Code examples/real-world usage.
3.  **Firecrawl (`firecrawl`):** Backup research.
5.  **Supabase (`mcp_supabase-mcp-server`):** DB/Auth specifics.
6.  **21st.dev (`mcp_21st-devmagic`):** UI components.

**See `.cursor/rules/research-guidelines.mdc` for details.**

---

## 🚀 "Unicorn" Valuation Context ($1B Standard)
You are a **Founding Technical Partner** at a **$1B Unicorn Scale-Up**.
- **Code:** Must be rigorous, scalable, typed, and tested.
- **UX:** Must be "pixel-perfect", <120s time-to-value, and delightful.
- **Ops:** "Zero drift" documentation, "surgical" repo hygiene.
- **Mindset:** Hormozi Value Equation (Max Value = [Dream Outcome x Likelihood] / [Time x Effort]).

---

## 🔧 Development Mode (Agentic Layer)

When running @dev-loop or @implement-prd, operate in **Grade 4 Agentic Mode**:

### 1. Read State
Check `.sigma/memory/active_task.md` for current progress before starting.

### 2. Use Tools
Run scripts in `.sigma/tools/` to verify your work:
- `typecheck.sh` - TypeScript compilation
- `lint.sh` - Linting
- `test.sh` - Test suite
- `build.sh` - Production build

### 3. Self-Correct
If verification fails, run `@gap-analysis` before asking for human help.
The loop is: **Build → Test → Fix → Repeat** until green.

### 4. Update State
Write to `.sigma/memory/active_task.md` after each phase to enable resume support.

### Available Agentic Tools
See `.sigma/tools/` for project-specific verification scripts.
See `.sigma/memory/` for session state and continuity.

---

**Note:** This file is a *Router*. Refer to the specific `.mdc` files for detailed rules.
```

---

## Phase 4: Execution Logic

1.  **Scan**: Identify active domains.
2.  **Generate Modules**: Write the `.mdc` files to `.cursor/rules/`.
3.  **Generate Router**: Write the `.cursorrules` to root.
4.  **Verify**: Check that file paths in `@import` match actual files.

---

## Final Review

**Prompt**:
> "Context Engine initialized.
> ✅ Generated [X] Domain Rules.
> ✅ Generated Master Context Router.
>
> Your AI is now context-aware. It will auto-load Design rules when doing CSS, and Auth rules when doing Backend.
> Reply `approve step 12` to confirm."

---

## Final Review Gate

**All outputs for this step:**
- [ ] `.cursorrules` (Master Context Router) created/updated
- [ ] `.cursor/rules/` directory with domain-specific `.mdc` files created
- [ ] `.sigma/tools/` directory with verification scripts created
- [ ] `.sigma/rules/` and `.claude/rules/` modular rules created
- [ ] `reasoning.mdc` epistemic reasoning rules created
- [ ] `boilerplate-patterns.mdc` created (if boilerplate detected)
- [ ] OpenCode artifacts created (if OpenCode detected)
- [ ] Codex artifacts created (if Codex detected)
- [ ] All phases completed with user approval

**>>> FINAL CHECKPOINT: STEP 12 COMPLETE <<<**
**Do NOT proceed to Step 13 without explicit approval.**

---

<verification>
## Step 12 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Context Router | /.cursorrules | 200B | 6 |
| Rules Directory | /.cursor/rules/ | exists | 4 |
| Project Context | /.cursor/rules/project-context.mdc | 200B | 4 |
| Tech Stack | /.cursor/rules/tech-stack.mdc | 200B | 3 |
| Design System Rules | /.cursor/rules/design-system.mdc | 200B | 3 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| .cursorrules | Global Context | 5 |
| .cursorrules | Technical Stack | 5 |
| .cursorrules | Design System | 5 |
| project-context.mdc | Project Name | 5 |
| project-context.mdc | Core Philosophy | 5 |
| tech-stack.mdc | Framework | 5 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:.cursorrules:@import\|import | Context routing configured | 8 |
| file_count:/.cursor/rules/:3 | At least 3 rule files generated | 8 |
| has_pattern:project-context.mdc:valuation\|unicorn\|billion | Valuation context present | 5 |
| has_pattern:tech-stack.mdc:Next\|React\|Supabase | Tech stack referenced | 5 |
| has_pattern:design-system.mdc:color\|token\|component | Design tokens referenced | 4 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Router Generated | .cursorrules file exists | 5 |
| Rules Generated | At least 3 .mdc files exist | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Context Aware | Router references relevant rules | 4 |
| Domain Detection | Conditional rules based on detected domains | 3 |
| PRD Integration | Rules reference Step 11 PRD patterns | 3 |

</verification>
