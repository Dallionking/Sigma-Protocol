# Sigma Prompting & Context Engineering Methodology

**Version:** 1.0.0
**Date:** 2026-02-09
**Status:** Active
**Scope:** Cross-platform prompt enhancement for Claude Code, Codex, Factory Droid, OpenCode

---

## Table of Contents

1. [Introduction & Philosophy](#1-introduction--philosophy)
2. [Foundation Model Best Practices](#2-foundation-model-best-practices)
3. [Universal Patterns (Cross-LLM)](#3-universal-patterns-cross-llm)
4. [Sigma Prompt-Enhanced PRD Format](#4-sigma-prompt-enhanced-prd-format)
5. [Document Sharding Strategy](#5-document-sharding-strategy)
6. [Integration with Steps 0-13](#6-integration-with-steps-0-13)
7. [Unified Prompt Format](#7-unified-prompt-format)
8. [Command & Skill Reformatting Guidelines](#8-command--skill-reformatting-guidelines)

---

## 1. Introduction & Philosophy

### The Prompt Enhancement Problem

Three approaches to instructing an AI agent:

**Vague** — "Create the authentication module."
The agent has no direction, wastes tokens exploring blindly, may produce something architecturally inconsistent with the rest of the codebase.

**Over-specified** — "Create `src/auth/service.ts` with exactly these methods: `login(email, password)`, `signup(email, password, name)`, `logout(sessionId)`. Import `bcrypt` from `bcrypt`. Use `prisma` for database access."
Brittle. Breaks when paths change, kills agent creativity, produces code that may not match the project's actual patterns. The agent copies instead of understanding.

**Sigma sweet spot — Enhanced prompt** — "Create an authentication service. The project follows a service-pattern architecture (explore `src/` for examples). Must handle login, signup, logout with proper error handling. Follow the existing error pattern. Tests required."

This third approach works because:
- The agent knows the WHAT (auth service) and the WHY (login/signup/logout)
- The agent knows WHERE TO LOOK (explore src/ for patterns) without hard-coded paths
- The agent knows the QUALITY BAR (error handling, tests required)
- The agent retains FREEDOM to discover file structure, naming conventions, and adapt

### The Prompt Enhancement Spectrum

```
VAGUE ←————————————————————————————→ HARD-CODED
"do auth"     SIGMA SWEET SPOT     "create src/auth/service.ts line by line"
              ↑
              Directional, discovery-first,
              intent-driven, pattern-referencing
```

### Core Principles

1. **Discovery-first** — Agents enter plan mode, explore the codebase, THEN execute. Tasks point toward patterns and domains, not exact file paths.

2. **Directional, not dictatorial** — "Create an auth service following the existing service pattern" NOT "Create `src/auth/service.ts`." Paths change mid-development, users rename things, and agents work better with creative freedom.

3. **Intent over implementation** — Tell the agent WHAT we're trying to achieve and WHY, give it direction on HOW, but let it figure out the specifics by gathering its own context.

4. **Steps 0-13 aware** — The methodology integrates with all steps, especially Step 12 (Context Engine) and Step 13 (Skillpack Generator) which already handle context engineering.

5. **Both LLMs, both well** — Tasks formatted so Claude AND GPT understand them without platform-specific adaptation at the task level. Platform-specific formatting lives in the config layer (Steps 12-13).

### What This Document Is NOT

This document does NOT replace or duplicate existing skills:
- `.claude/skills/agentic-coding.md` — Context engineering hierarchy (referenced, not duplicated)
- `.claude/skills/prompt-engineering-patterns.md` — 13 LLM techniques (referenced, not duplicated)

This document IS the **unifying framework** that ties those skills together with a concrete methodology for how PRDs, commands, skills, and agent definitions should be structured.

### Relationship to Existing Artifacts

| Artifact | Role | This Document's Relationship |
|----------|------|------------------------------|
| `agentic-coding.md` | Context engineering best practices | References its hierarchy; adds PRD-specific application |
| `prompt-engineering-patterns.md` | 13 LLM techniques | References its patterns; maps them to Sigma steps |
| `schemas/ralph-backlog.schema.json` | Machine-readable task format | Documents `agentInstructions` field enhancement |
| Step 11 PRD generation | Creates implementation PRDs | Provides the enhanced prompt format for task lists |
| Step 12 Context Engine | Generates `.cursorrules` and domain rules | Ensures rules are prompt-enhancing context |
| Step 13 Skillpack Generator | Generates project-specific overlays | Ensures overlays follow the enhancement pattern |
| `prompt-enhancer.mdc.md` | Context Engineering → Execute workflow | Shares philosophy; this doc is the formal methodology |

---

## 2. Foundation Model Best Practices

These best practices inform the **platform config layer** (Step 12 context rules, Step 13 skill overlays, agent definitions) — NOT the task prompts themselves. Task prompts use the unified markdown format (Section 7) for portability.

### 2.1 Anthropic / Claude Best Practices

Source: Anthropic official documentation, Claude Code docs, production observations.

| Technique | Pattern | When to Use |
|-----------|---------|-------------|
| **XML Tags** | `<context>`, `<instructions>`, `<task>`, `<example>` | Agent definitions, skill system prompts — Claude measurably outperforms with XML structural markers |
| **System Prompt Design** | Detailed (16K+ words OK), explicit behavioral instructions | Agent definitions, skill system prompts — Claude uses the full context |
| **Role Prompting** | Specific > generic ("senior auth engineer" > "developer") | Agent frontmatter `description:` field |
| **Long-Context Ordering** | Critical data at top, queries at end (+30% quality) | PRDs: context first, tasks last |
| **Structured CoT** | `<thinking>` tags to separate reasoning from output | Complex analysis, plan mode decisions |
| **Prefilling** | Start assistant response with partial content | Enforce output format in tool definitions |
| **Parallel Tool Calls** | Independent tool calls in single response | All agent definitions should encourage this |
| **Explain the Why** | Include motivation alongside rules | Task prompts, skill descriptions — Claude generalizes from intent |
| **Positive Framing** | "Do X" instead of "Don't do Y" | All instructions — Claude follows positive directives more reliably |

**Claude anti-patterns to avoid in config layer:**
- Mixing XML and markdown structural markers in the same section
- Negative-only instructions without positive alternatives
- Relying on information buried in the middle of long contexts ("lost in the middle" effect)
- Vague role descriptions ("You are an AI assistant" adds nothing)

### 2.2 OpenAI / GPT Best Practices

Source: OpenAI official documentation, Codex docs, production observations.

| Technique | Pattern | When to Use |
|-----------|---------|-------------|
| **Markdown Headers** | `#`, `##`, `**bold**`, fenced code blocks | Always — GPT trained on markdown |
| **System Prompt Design** | Brief (~2.2K words), rely on base model intelligence | Codex config, AGENTS.md — GPT performs better with concise instructions |
| **Starlark Rules** | `prefix_rule()` with pattern matching | Codex execution policies |
| **Function Calling** | JSON schema with flat parameters (78-82% success) | Tool definitions — avoid deep nesting |
| **Explicit Handoffs** | `transfer_to_[agent_name]` keywords | Multi-agent coordination in Codex collab mode |
| **Planning-First** | TODO list tools, rubric-based checklists, reflect after each tool call | Complex multi-step tasks |
| **Preamble Strategy** | "Before you call a tool, explain why" | Debugging and auditability |

**GPT anti-patterns to avoid in config layer:**
- Using XML tags (measurably worse than markdown for GPT)
- Adding few-shot examples to reasoning models (o1, o3, o5)
- Using 100% of the context window (performance degrades near limits)
- Deeply nested JSON schemas in tool definitions

### 2.3 Why the Config Layer Handles Platform Differences

The distinction is critical:

```
┌──────────────────────────────────────────────────┐
│  TASK PROMPTS (this doc)                         │
│  → Universal markdown format                     │
│  → Same content regardless of platform           │
│  → Portable: same task works in Claude or Codex  │
└──────────────┬───────────────────────────────────┘
               │ consumed by
┌──────────────▼───────────────────────────────────┐
│  CONFIG LAYER (Steps 12-13, agent definitions)   │
│  → Platform-specific formatting                  │
│  → Claude: XML structure, detailed system prompt │
│  → Codex: Markdown structure, brief prompt       │
│  → Droid: YAML frontmatter, tier-based autonomy  │
└──────────────────────────────────────────────────┘
```

Task authors write once. The config layer adapts.

---

## 3. Universal Patterns (Cross-LLM)

Patterns that work equally well across Claude and GPT, validated in production.

### 3.1 Effectiveness Rankings

| Pattern | Accuracy Improvement | Best For |
|---------|---------------------|----------|
| Chain-of-Thought | 290-340% on complex reasoning | Architecture decisions, debugging, plan mode |
| ReAct (Reason → Act → Observe) | High | Agent loops, tool-calling workflows |
| Zero-Shot activation | High for simple routing | Skill matching, command dispatch |
| Structured outputs (JSON/YAML) | High reliability | Tool calls, data extraction, backlog generation |
| Few-shot (2-5 examples) | Medium-High | Pattern learning, format conformance |
| Role prompting | Style influence only | Tone and perspective — NOT accuracy improvement |

### 3.2 Key Cross-LLM Principles

**Context ordering matters for both models.**
Place critical information at the START and END of the prompt. Both Claude and GPT show reduced attention to content in the middle of long contexts. For PRDs: put the business context at the top and the task list at the bottom.

**Discovery encouragement works for both models.**
When an agent explores and finds patterns itself, it understands them more deeply than when told exactly what to do. Both Claude and GPT produce higher-quality implementations when allowed a discovery phase before coding.

**Behavioral assertions over structural checks.**
"The auth system handles login correctly" is universally understood. "src/auth/service.ts exports a login function" is brittle and doesn't verify behavior. Both models reason better about behavior than file structure.

**Motivation improves generalization.**
"Hash passwords because plain-text storage is a security vulnerability" produces better code than "Hash passwords." Both models generalize from understanding WHY a rule exists.

### 3.3 Divergences (Handled at Config Layer)

| Aspect | Claude | GPT | Sigma Resolution |
|--------|--------|-----|------------------|
| Structural format | XML tags preferred | Markdown preferred | Task prompts use markdown (universal). Agent/skill definitions use platform-native format. |
| System prompt length | Detailed (16K+ OK) | Brief (~2K words) | Handled by Steps 12-13 per platform |
| Context window usage | Can use 80%+ effectively | Degrades above 60-70% | Sharding strategy (Section 5) manages this |
| Few-shot in reasoning | Helpful always | Harmful for o-series models | Config layer conditionally includes/excludes |

---

## 4. Sigma Prompt-Enhanced PRD Format

The core innovation. Not "prompt-native" (too rigid), but **"prompt-enhanced"** (directional + discovery).

### 4.1 The Three Task Prompt Levels

Every task in a Sigma PRD contains three levels of information:

#### Level 1: Intent (the "what" and "why")

What the agent needs to accomplish and why it matters. This is the business-level description.

```
Build an authentication system that handles user login, signup, and logout.
Users must be able to create accounts with email/password and maintain sessions.
This is a core security feature — quality and security patterns matter more than speed.
```

#### Level 2: Direction (the "where to look" and "how it should feel")

Pointers that help the agent orient itself without dictating exact paths. These are discovery hints, not instructions.

```
The project uses a service-pattern architecture. Explore the existing services
to understand the pattern (look for service classes, route handlers, middleware).
Follow the established error handling approach. Session management should use
the existing database layer. All new features require tests.
```

#### Level 3: Quality Bar (the "what good looks like")

Observable, testable criteria for when the work is done. Behavioral, not structural.

```
Acceptance:
- Auth endpoints respond correctly (test with the project's existing test framework)
- Password hashing uses bcrypt (or project's existing crypto utility)
- Error responses follow the project's error format
- No raw SQL — use the project's ORM/query builder
- TypeScript strict mode passes (if TypeScript project)
```

### 4.2 Enhanced Task Prompt Structure

The three levels combine into a structured task prompt. This format is used in PRD task lists (Step 11) and the Ralph backlog (`agentInstructions` field enhancement):

```yaml
tasks:
  - id: AUTH-001
    intent: |
      Build an authentication service that handles user login, signup,
      and session management. This is a core security feature — quality
      and security patterns matter more than speed.

    direction: |
      Explore the project's service layer to understand existing patterns.
      Look for: service classes, route handlers, middleware, error handling,
      and database access patterns. Follow what you find — don't invent
      new patterns. The auth service should feel native to this codebase.

      Key areas to discover:
      - How existing services are structured (class vs function, exports)
      - Where routes are registered (router setup)
      - How errors are handled (error classes, HTTP status mapping)
      - How the database layer works (ORM, query builder, raw SQL?)
      - How tests are organized (test directory, naming, assertions)

    quality_bar: |
      - Login, signup, logout all work end-to-end
      - Passwords are hashed (never stored in plain text)
      - Sessions are managed securely
      - Error handling follows existing patterns
      - Tests cover happy path and error cases
      - TypeScript/lint checks pass
      - No TODOs or placeholder code

    dependencies: []
    tags: [AUTH, API, SECURITY]
    skills: [better-auth-best-practices, defense-in-depth]
    discovery_hints:
      patterns: ["service", "route", "middleware", "error"]
      explore_dirs: ["src/", "lib/", "app/"]
```

The schema for this format is defined in `schemas/sigma-task-prompt.schema.json`.

### 4.3 Why Discovery-First Works

1. **Paths change.** Mid-development, users rename directories, refactor structures. Hard-coded paths break. Discovery adapts.

2. **New projects have nothing yet.** For the first PRDs, directories don't exist. Discovery hints say "look for patterns" not "go to this exact file."

3. **Agents gather better context.** When an agent explores and finds patterns itself, it understands them more deeply than when told "follow `src/users/service.ts`."

4. **Naming conventions emerge.** Instead of dictating `auth-service.ts`, the agent discovers the project uses `kebab-case.service.ts` or `PascalCase.ts` and follows suit.

5. **Cross-project portability.** Same enhanced prompt works on a Next.js project, an Express project, or a Go project. The agent discovers the stack.

6. **Resilience to partial completion.** If a previous agent partially scaffolded something, the discovery phase surfaces that work instead of blindly overwriting it.

### 4.4 When TO Be Specific

Not everything should be discovery-based. Be specific about things that agents cannot discover:

**Be specific about:**
- **Business logic** — "The offer architecture uses Hormozi's Value Equation: `(Dream Outcome x Perceived Likelihood) / (Time Delay x Effort)`"
- **External integrations** — "Use Stripe for payments, Resend for email"
- **Architectural decisions** — "This is a modular monolith, not microservices"
- **Security requirements** — "All endpoints require auth. Use RLS on database."
- **Design system tokens** — "Primary color: Gotham Purple `#9D4EDD`"
- **Behavioral requirements** — "Login form must show inline validation errors, not alerts"
- **Compliance constraints** — "Must be SOC 2 compliant. No PII in logs."

**Be directional about:**
- **File paths** — "Explore the service layer" not "create `src/auth/service.ts`"
- **Code structure** — "Follow the existing pattern" not "export class AuthService"
- **Test organization** — "Tests should follow project conventions" not "create `__tests__/auth.test.ts`"
- **Imports/dependencies** — "Use the project's existing crypto/db utilities" not "import bcrypt from 'bcrypt'"
- **Naming** — "Follow the project's naming convention" not "name it `AuthService`"

### 4.5 Example: Full Enhanced PRD Task List

A realistic multi-task PRD for an e-commerce checkout feature:

```yaml
tasks:
  - id: CART-001
    intent: |
      Build a shopping cart service that manages cart state, item
      quantities, and price calculations. The cart is the foundation
      for the entire checkout flow.

    direction: |
      Explore the existing data models and services to understand
      how entities are structured. Look for existing services that
      manage state (like user profiles or wishlists) for patterns.
      Cart state should persist across sessions.

      Key areas to discover:
      - Data model patterns (schema definitions, relationships)
      - Service patterns (CRUD, validation, error handling)
      - State persistence approach (database, cache, or both)

    quality_bar: |
      - Cart persists across browser sessions for logged-in users
      - Adding, removing, updating quantities all work correctly
      - Price calculations handle edge cases (zero quantity, max limits)
      - Concurrent cart modifications don't corrupt state
      - Tests cover CRUD operations and edge cases

    dependencies: []
    tags: [CART, API, STATE]
    skills: []
    discovery_hints:
      patterns: ["model", "service", "schema", "repository"]
      explore_dirs: ["src/", "prisma/", "drizzle/"]

  - id: CHECKOUT-001
    intent: |
      Build the checkout flow that takes a cart through payment.
      Must handle address collection, payment processing via Stripe,
      and order creation. This is the revenue-critical path.

    direction: |
      The cart service (CART-001) provides the data. Explore how
      existing multi-step flows are implemented (onboarding, signup)
      for the UI pattern. Payment processing uses Stripe — follow
      Stripe's recommended integration pattern.

      Key areas to discover:
      - Multi-step form patterns in the UI layer
      - API route organization for multi-step processes
      - How the project handles external service calls (Stripe)
      - Error recovery patterns (what happens when payment fails?)

    quality_bar: |
      - Complete checkout flow from cart to confirmation
      - Stripe integration handles success, failure, and edge cases
      - Order is created only after successful payment
      - User receives confirmation (email or in-app)
      - Mobile-responsive checkout UI
      - Tests cover the happy path and payment failure scenarios

    dependencies: [CART-001]
    tags: [CHECKOUT, API, UI, PAYMENT]
    skills: []
    discovery_hints:
      patterns: ["checkout", "payment", "order", "form", "step"]
      explore_dirs: ["src/", "app/", "pages/"]
```

---

## 5. Document Sharding Strategy

Token-efficient context management inspired by BMAD's document sharding, adapted for Sigma's discovery-first approach.

### 5.1 Two-Phase Context Loading

#### Phase 1: Planning (Full Context — Orchestrator Only)

The orchestrator loads full context to plan the work:
- Full PRD + architecture + design system documents
- Builds the dependency DAG for task ordering
- Generates prompt-enhanced task list (directional, not hard-coded)
- Estimated cost: 50,000-150,000 tokens (orchestrator only pays this)

Only the orchestrator needs this full picture. Individual agents do not.

#### Phase 2: Development (Sharded Context — Per Agent)

Each agent receives a minimal starting context:
- Their task's enhanced prompt (intent + direction + quality bar): ~1,500-2,500 tokens
- Injected skills (top 8 via Ralph scoring): ~4,000 tokens
- Project conventions summary from Step 12 context engine: ~500 tokens
- **Total starting context: ~6,000-7,000 tokens**

The agent then discovers additional context through plan mode and file exploration. This self-directed discovery is cheap (glob + grep + read operations) compared to loading full architecture docs upfront.

### 5.2 Token Savings Analysis

| Approach | Tokens per Agent | Agents (Medium PRD) | Total |
|----------|-----------------|---------------------|-------|
| Full context per agent | 50,000-150,000 | 10 | 500K-1.5M |
| Sharded + hard-coded tasks | 5,000-8,000 | 10 | 50K-80K |
| **Sigma sharded + discovery** | **6,000-7,000 + discovery** | **10** | **80K-120K** |

**Savings: 85-90% vs full context per agent.**

Discovery adds 5-15K tokens per agent (file reads, grep results), but this context is higher-quality because the agent selected it based on the actual codebase state, not assumptions made at planning time.

### 5.3 Why Sharding + Discovery > Sharding + Hard-Coding

| Approach | Pros | Cons |
|----------|------|------|
| BMAD-style shard + hard-code | Predictable token cost, exact instructions | Brittle paths, no adaptation to mid-project changes, agent copies instead of understanding |
| **Sigma shard + discovery** | **Adapts to changes, agent builds deep understanding, cross-project portable** | **Slightly more tokens (discovery phase), less predictable** |

The unpredictability is a feature: the agent's discovery phase surfaces the actual state of the codebase, not the state it was in when the PRD was written.

### 5.4 Sharding Boundaries

What goes into each shard:

| Shard | Contents | Loaded By | Size |
|-------|----------|-----------|------|
| **Full PRD** | Complete PRD with all sections | Orchestrator only | 10-30K tokens |
| **Task prompt** | intent + direction + quality_bar + discovery_hints | Individual agent | 1.5-2.5K tokens |
| **Project conventions** | Step 12 context rules summary | Individual agent | 0.5K tokens |
| **Skill injection** | Top 8 matched skills (Ralph scoring) | Individual agent | 4K tokens |
| **Agent memory** | MEMORY.md (first 200 lines) | Agent with memory scope | 1-2K tokens |
| **Discovered context** | Files the agent reads during plan mode | Self-directed | 5-15K tokens |

---

## 6. Integration with Steps 0-13

This section maps how the prompt enhancement methodology applies to each step of the Sigma workflow.

### 6.1 Steps 0-5: Foundation (Context Producers)

These steps produce artifacts that become the context for later steps.

| Step | Output | Role in Prompt Enhancement |
|------|--------|---------------------------|
| **0: Environment Setup** | Validated environment | Ensures agents can execute (MCP, tools, dependencies). No prompt impact. |
| **1: Ideation** | `MASTER_PRD.md` | Defines the business intent. The "why" that flows into every task's intent field. |
| **1.5: Offer Architecture** | Pricing, value stacks | Specific business logic that should be stated explicitly in task prompts (not discovered). |
| **2: Architecture** | `ARCHITECTURE.md` | Defines architectural decisions. These are explicit constraints in task prompts: "This is a modular monolith" not "discover the architecture." |
| **3: UX Design** | `UX-DESIGN.md` | Defines user flows. UI tasks reference these flows as behavioral requirements. |
| **4: Flow Tree** | Screen inventory | Maps screens to modules. Provides the `tags.screenId` and `tags.moduleId` for task prompts. |
| **5: Wireframes** | Wireframe PRDs | Become the discovery reference for UI tasks. Agents explore these to understand expected layouts. |

**Key principle:** Steps 0-5 produce artifacts that the orchestrator reads in Phase 1 (full context) and distills into enhanced task prompts for Phase 2 (sharded context). Individual agents do NOT need to read MASTER_PRD.md or ARCHITECTURE.md — the task prompt already contains the relevant parts.

### 6.2 Steps 6-10: Design & Technical Specs (Constraint Producers)

These steps produce constraints that feed into the quality bar and explicit requirements.

| Step | Output | Role in Prompt Enhancement |
|------|--------|---------------------------|
| **6: Design System** | `DESIGN-SYSTEM.md` | Tokens and components are explicit constraints: "Use `--color-primary` for accent colors." Not discoverable — must be stated. |
| **7: Interface States** | `STATE-SPEC.md` | State specifications (empty, loading, error, success) are explicit behavioral requirements in UI task quality bars. |
| **8: Technical Spec** | `TECHNICAL-SPEC.md` | API contracts, database schemas, integration specs. Becomes the discovery reference for backend tasks. |
| **9: Landing Page** | Landing page | Optional. If present, the landing page's patterns inform the discovery hints for other pages. |
| **10: Feature Breakdown** | `FEATURE-BREAKDOWN.md` | Defines the feature-to-PRD mapping. Each feature becomes a PRD in Step 11 with enhanced task prompts. |

**Key principle:** Design tokens and state specs are EXPLICIT in task prompts (quality bar). Technical specs are DISCOVERY references — agents explore them to understand API contracts rather than having contracts pasted into the task prompt.

### 6.3 Step 11: PRD Generation — Task Lists as Enhanced Prompts

Step 11 is where the methodology has the most direct impact.

**Current state:** Step 11 says "Agentic-Ready: Explicit file paths, complete imports, typed return values."

**Enhanced state:** "Agentic-Ready" means enhanced prompts with intent, direction, discovery hints, and quality bars — NOT hard-coded paths.

Specifically:
- BDD scenarios (Given/When/Then) remain — they express BEHAVIOR, which is intent-based
- Task lists at the bottom of PRDs use the Level 1 + 2 + 3 format from Section 4
- Each task carries `discovery_hints` pointing toward relevant areas, not exact files
- The `agentInstructions` field in `ralph-backlog.schema.json` should use the enhanced format
- Acceptance criteria verify BEHAVIOR (tests pass, endpoints respond) not STRUCTURE (file exists at path)

**Example: Before (hard-coded)**
```
Task: Create auth service at src/services/auth.service.ts
- Import bcrypt from 'bcrypt'
- Export class AuthService
- Method: login(email: string, password: string): Promise<Session>
- Method: signup(email: string, password: string, name: string): Promise<User>
```

**Example: After (enhanced)**
```yaml
- id: AUTH-001
  intent: Build an auth service handling login, signup, and sessions.
  direction: |
    Explore the service layer for existing patterns. Follow the
    established service structure, error handling, and DB access.
  quality_bar: |
    - Login and signup work end-to-end
    - Passwords hashed, sessions secure
    - Tests cover happy path and errors
  discovery_hints:
    patterns: ["service", "auth", "session"]
```

### 6.4 Step 12: Context Engine — Rules as Prompt-Enhancing Context

Step 12 generates `.cursorrules`, domain-specific `.mdc` files, and platform-specific context rules.

These rules ARE the project context that agents discover during their exploration phase. The methodology ensures Step 12 rules are written as prompt-enhancing context:

**Good Step 12 rule (prompt-enhancing):**
```
This project uses a service-pattern architecture with error classes
inheriting from AppError. All services follow the pattern in
src/services/. Database access goes through Drizzle ORM. API responses
use the ResponseFactory utility for consistent formatting.
```

**Bad Step 12 rule (configuration-only):**
```
framework: next.js
orm: drizzle
test-runner: vitest
```

The good rule gives agents enough context to make architectural decisions. The bad rule tells agents facts but not patterns.

### 6.5 Step 13: Skillpack Generator — Project-Specific Overlays

Step 13 generates overlay skills that build on foundation skills with project-specific knowledge.

These overlays should follow the enhancement pattern:
- **Intent:** "This project uses X stack with Y patterns"
- **Direction:** "When building components, explore the existing component library for patterns"
- **Quality bar:** "All components must use design tokens from DESIGN-SYSTEM.md"

Ralph's dynamic skill injection (top 8 skills per task via scoring) already handles the "right context at the right time" problem. The methodology ensures the injected skills provide directional context, not step-by-step instructions.

### 6.6 Ralph Loop — Already Discovery-Compatible

Ralph reads `ralph-backlog.schema.json` tasks and executes them in an autonomous loop.

The methodology integration:
- Extend the `agentInstructions` field to use the enhanced prompt format (intent + direction + quality bar)
- Add `discovery_hints` to the schema (directories/patterns the agent should explore first)
- Keep `acceptanceCriteria` as behavioral assertions (not file-existence checks)
- Ralph's dynamic skill matching already injects relevant skills per task — this is the sharding in action

### 6.7 Gap Analysis — Behavioral Verification

Gap analysis (`@gap-analysis`) should verify BEHAVIOR not file existence:

**Good:** "Does the auth system handle login? Run the test suite and check."
**Bad:** "Does `src/auth/service.ts` exist?"

Machine-verifiable checks remain (test commands, lint, typecheck) — these verify behavior. The agent runs the project's actual test suite, not invented file-existence checks.

---

## 7. Unified Prompt Format

### 7.1 Design Decision: One Format for All Platforms

**Why NOT platform-adaptive task prompts:**
- Users switch platforms mid-project (start with Claude Code, use Codex for a specific PRD, try Factory Droid later)
- PRD task lists should be portable — the same task file works regardless of which agent executes it
- Maintaining multiple format versions creates drift and maintenance burden
- The performance gap between "optimal per-platform" and "universal" is small (~5-10%) vs the portability gain

### 7.2 The Sigma Unified Format

| Element | Format | Rationale |
|---------|--------|-----------|
| Human-readable sections | Markdown (headers, lists, emphasis) | Universally understood by all LLMs |
| Machine-readable task metadata | YAML (structured fields, arrays, nesting) | Reliably parsed by all LLMs |
| Section headers | `##` and `###` | Both Claude and GPT use these as attention anchors |
| Code examples | Fenced code blocks with language tags | Universally rendered |
| Behavioral assertions | Plain language | No platform-specific check syntax |
| Structural markup | **No XML tags in task prompts** | Trades ~5% Claude optimization for 100% portability |

### 7.3 What the Go Binary Does NOT Do

The Go binary routes tasks to the active platform CLI (`claude`, `codex`, `droid`) without reformatting the task content. The format is universal. No conversion step needed.

### 7.4 Where Platform-Specific Formatting IS Appropriate

Platform-specific formatting is handled at the config layer, which is already generated per-platform:

| Layer | Platform Adaptation | Generated By |
|-------|-------------------|--------------|
| Context rules | `.cursorrules` vs `.codex/rules/` vs `.factory/config/` | Step 12 |
| Skill overlays | `.claude/skills/` vs `.codex/skills/` vs `.factory/skills/` | Step 13 |
| Agent definitions | `.claude/agents/` vs AGENTS.md vs `.factory/droids/` | `sigma install` |
| System prompts | XML (Claude) vs Markdown (GPT) vs YAML (Droid) | Agent definition files |

**The task content itself stays universal.** This is the key architectural decision.

### 7.5 Format Example: Complete Task File

A complete task file following the unified format:

```markdown
# Feature: User Authentication

## Context

The application needs user authentication with email/password login,
account creation, and session management. This is the security foundation
for all protected routes.

## Architecture Constraints

- Modular monolith (not microservices)
- All endpoints must be authenticated except /login, /signup, /health
- Row Level Security (RLS) enforced at database layer
- Sessions use HTTP-only secure cookies

## Design System Constraints

- Auth forms use the existing form component pattern
- Error states follow STATE-SPEC.md error patterns
- Loading states use skeleton components, not spinners

## Tasks

<!-- Tasks use YAML for machine-readability -->
```

```yaml
tasks:
  - id: AUTH-001
    intent: |
      Create the authentication service layer. This handles all auth
      business logic: credential validation, session creation, password
      hashing. Security-critical — no shortcuts.
    direction: |
      Explore existing services for the project's service pattern.
      Look for how other services handle validation, errors, and
      database access. The auth service should be indistinguishable
      from other services in structure.
    quality_bar: |
      - Login returns a session token on valid credentials
      - Signup creates user with hashed password
      - Logout invalidates the session
      - Invalid credentials return 401 with consistent error format
      - All paths have tests
    discovery_hints:
      patterns: ["service", "validate", "hash", "session"]
      explore_dirs: ["src/", "lib/"]
    tags: [AUTH, API, SECURITY]
    skills: [better-auth-best-practices]
    dependencies: []

  - id: AUTH-002
    intent: |
      Build the auth API routes that expose the auth service to the
      frontend. These are the public-facing endpoints for login,
      signup, and logout.
    direction: |
      Explore existing API routes for the project's route pattern.
      Look for how routes handle request validation, auth middleware,
      and response formatting. Follow the same structure.
    quality_bar: |
      - POST /api/auth/login accepts email + password
      - POST /api/auth/signup accepts email + password + name
      - POST /api/auth/logout requires valid session
      - Input validation with proper error messages
      - Rate limiting on login endpoint
    discovery_hints:
      patterns: ["route", "api", "handler", "middleware"]
      explore_dirs: ["src/", "app/api/", "pages/api/"]
    tags: [AUTH, API]
    skills: []
    dependencies: [AUTH-001]

  - id: AUTH-003
    intent: |
      Build the login and signup UI forms. These are the first
      screens users see — they must be polished, accessible, and
      follow the design system.
    direction: |
      Explore the existing form patterns in the UI layer. Look for
      how other forms handle validation, error display, loading
      states, and submission. The auth forms should use the same
      component library and patterns.
    quality_bar: |
      - Login form with email/password fields
      - Signup form with email/password/name fields
      - Inline validation errors (not alerts)
      - Loading state during submission
      - Redirect to dashboard on success
      - Mobile-responsive
      - Keyboard accessible (tab order, enter to submit)
    discovery_hints:
      patterns: ["form", "input", "validation", "submit"]
      explore_dirs: ["src/components/", "app/", "pages/"]
    tags: [AUTH, UI, FORM]
    skills: [frontend-design]
    dependencies: [AUTH-002]
```

---

## 8. Command & Skill Reformatting Guidelines

Guidelines for writing Sigma commands, skills, and agent definitions that align with the prompt enhancement methodology.

### 8.1 Command Writing Principles

Commands define the steps and operations in the Sigma workflow. They should follow these principles:

**Explain intent before instructions.**
Start every command with WHY this step exists and WHAT it achieves, before HOW to execute it.

```markdown
# Good
## Purpose
This step breaks features into implementable PRDs so that each can
be assigned to an agent with clear scope and acceptance criteria.

# Bad
## Steps
1. Read FEATURE-BREAKDOWN.md
2. For each feature, create a PRD file...
```

**Use discovery directives over hard-coded paths.**
Commands should guide the agent to explore rather than dictate exact locations.

```markdown
# Good
Explore the project's existing PRDs for format reference.

# Bad
Read docs/prds/example-prd.md for the template.
```

**Include "why" alongside "what".**
Both Claude and GPT benefit from understanding motivation. This produces better generalization.

```markdown
# Good
Generate BDD scenarios (Given/When/Then) for each feature because
behavioral tests are more resilient to implementation changes than
structural tests.

# Bad
Generate BDD scenarios for each feature.
```

**Machine-verifiable checks should test BEHAVIOR not STRUCTURE.**

```markdown
# Good
Verification: Run the project's test suite. All tests pass.

# Bad
Verification: File src/auth/service.ts exists and contains a login method.
```

**Add `token_budget:` to frontmatter for orchestrator planning.**
This helps the orchestrator estimate context costs when planning swarm composition.

### 8.2 Skill Writing Principles

Skills provide EXPERTISE not INSTRUCTIONS. They inject domain knowledge, not step-by-step procedures.

**Skills are expert knowledge injection.**
A skill should read like hiring a domain expert: "Here's what I know about this domain and the patterns that work."

```markdown
# Good (expertise)
## Authentication Patterns
When building auth systems, consider:
- Session vs JWT trade-offs (sessions for web, JWT for API)
- Password hashing: bcrypt with cost factor 12+ or argon2id
- CSRF protection: double-submit cookie pattern
- Rate limiting: 5 attempts per 15 minutes per IP

# Bad (instructions)
## Steps to Build Auth
1. Create a service file
2. Import bcrypt
3. Write a login function
4. Write a signup function
```

**`<context>` explains when and why this skill activates.**
The skill trigger description helps Ralph's dynamic matching and helps agents understand when the expertise applies.

**Examples show patterns, not exact code to copy.**
Examples demonstrate the SHAPE of a solution, not the exact implementation. Agents adapt examples to the codebase they're working in.

**Skills trust the agent.**
A skill provides the knowledge; the agent applies it to the specific codebase. Don't micro-manage implementation through skills.

**Step 13 overlays add project-specifics.**
Foundation skills are generic. Step 13 overlays add project-specific conventions on top:
- Foundation: "Use bcrypt or argon2id for password hashing"
- Overlay: "This project uses argon2id via the `@node-rs/argon2` package. The hash utility is in the crypto module."

### 8.3 Agent Definition Principles

Agent system prompts set ROLE and EXPERTISE, not step-by-step procedures.

**Role descriptions should be specific and domain-grounded.**

```markdown
# Good
You are a senior frontend engineer specializing in React performance
optimization, component architecture, and design system implementation.
You have deep experience with server components, streaming, and
progressive enhancement.

# Bad
You are a helpful AI assistant that writes frontend code.
```

**System prompt length varies by platform.**
- Claude agents: Detailed (16K+ words OK). Claude uses the full context.
- GPT agents (AGENTS.md): Brief (~2K words). GPT performs better concise.
- Factory Droid agents: Medium, YAML frontmatter-driven.

**Include handoff patterns.**
Agents should know how to report completion and hand off to the next step:
```
When your task is complete, report results to the orchestrator with:
- Summary of what was built
- Files created or modified
- Any concerns or trade-offs made
- Test results
```

**Memory injection provides accumulated knowledge.**
Agents with `memory:` scope get MEMORY.md injection (first 200 lines). This gives them accumulated project knowledge — discovery results from past sessions, decisions made, patterns learned. Write memory entries as directional context, not logs.

### 8.4 Summary: The Enhancement Checklist

When writing any Sigma artifact (command, skill, agent, PRD task), verify:

- [ ] **Intent is clear** — The reader knows WHAT and WHY
- [ ] **Direction is given** — The reader knows WHERE TO LOOK and HOW IT SHOULD FEEL
- [ ] **Quality bar is set** — Observable, testable criteria for "done"
- [ ] **No hard-coded paths** — Discovery hints instead of exact file references
- [ ] **Behavior over structure** — Assertions test what the code DOES, not where it LIVES
- [ ] **Motivation included** — WHY rules exist, not just WHAT they are
- [ ] **Platform-agnostic** — Task content in universal markdown/YAML format
- [ ] **Discovery-friendly** — Agent can enter plan mode, explore, then execute

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Enhanced prompt** | A task prompt that includes intent, direction, and quality bar — the Sigma sweet spot between vague and hard-coded |
| **Discovery hint** | A pointer to patterns or directories an agent should explore, not an exact file path |
| **Discovery phase** | The period where an agent explores the codebase (plan mode) before implementing |
| **Intent** | The WHAT and WHY of a task — business-level description |
| **Direction** | The WHERE TO LOOK and HOW IT SHOULD FEEL — pointers for the agent's discovery phase |
| **Quality bar** | Observable, testable criteria for when the work is done |
| **Sharding** | Splitting full PRD context into minimal per-agent context + discovery |
| **Config layer** | Platform-specific formatting (Steps 12-13, agent definitions) — NOT task prompts |
| **Behavioral assertion** | A verification that tests what code DOES, not where it LIVES |
| **Prompt enhancement spectrum** | The continuum from vague ("do auth") to hard-coded ("create src/auth/service.ts") with Sigma's sweet spot in the middle |

## Appendix B: Cross-References

| Document | Relationship |
|----------|-------------|
| `.claude/skills/agentic-coding.md` | Context engineering hierarchy — referenced in Section 1 |
| `.claude/skills/prompt-engineering-patterns.md` | 13 LLM techniques — referenced in Section 2 |
| `schemas/ralph-backlog.schema.json` | Machine-readable task format — extended in Section 4 |
| `schemas/sigma-task-prompt.schema.json` | JSON schema for enhanced task prompts (Section 4.2) |
| `docs/SWARM-FIRST-ARCHITECTURE.md` | Section 21 references this methodology |
| `.claude/rules/swarm-orchestration.md` | Swarm sizing, agent skills — complementary |
| `.claude/rules/workflow.md` | Steps 0-13 flow diagram — referenced in Section 6 |

## Appendix C: Migration Guide

For existing PRDs with hard-coded task lists, convert to enhanced format:

1. **Extract intent** — What is the task trying to achieve? Why does it matter?
2. **Replace paths with hints** — Change "create `src/auth/service.ts`" to "explore the service layer for patterns"
3. **Convert structural checks to behavioral checks** — Change "file exists" to "feature works correctly"
4. **Add discovery hints** — What patterns and directories should the agent explore?
5. **Keep business logic explicit** — Specific requirements (API provider, security rules, design tokens) stay explicit
6. **Validate against schema** — Check the task against `schemas/sigma-task-prompt.schema.json`
