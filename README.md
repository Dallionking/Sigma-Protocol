# Sigma Protocol

A platform-agnostic 13-step product development methodology for AI-assisted development.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Cursor%20%7C%20Claude%20Code%20%7C%20OpenCode-green.svg)](#supported-platforms)

---

## What is Sigma Protocol?

Sigma Protocol is a **complete product development workflow** that guides AI assistants through ideation, architecture, design, and implementation. It provides:

- **13 structured steps** from idea to deployment
- **Specialist personas** (Venture Studio Partner, Lead Architect, UX Director, etc.)
- **Quality gates** with verification scoring
- **MCP tool integration** for research and validation
- **Human-in-the-loop checkpoints** for critical decisions
- **Ralph Loop** for autonomous task execution
- **Multi-agent orchestration** for parallel development

## Understanding Sigma: The Honest Version

Sigma Protocol is essentially a **structured operating system for AI-assisted development**. It's not just a collection of commands—it's a philosophy encoded into tooling.

**The core insight**: AI coding assistants are incredibly powerful but also chaotic without structure. Sigma provides the rails.

### Who Is This For?

| User Type | Benefit | Why |
|-----------|---------|-----|
| **Solo founders building real products** | ★★★★★ | Structure prevents scope creep, parallel streams = shipping faster |
| **Agencies/consultants** | ★★★★★ | Repeatable process, client handoffs built-in, quality gates |
| **Teams adopting AI** | ★★★★☆ | Standardized workflow, everyone speaks the same language |
| **Senior engineers** | ★★★★☆ | Already think this way; tooling accelerates their process |
| **Junior devs** | ★★★☆☆ | Teaches good habits, but steep learning curve |
| **Weekend hackers** | ★★☆☆☆ | Too heavy for quick experiments—just vibe code instead |

### The Mental Model

1. **Documentation precedes code** — PRDs aren't bureaucracy, they're executable specifications
2. **Verification is non-negotiable** — "It works on my machine" isn't a deliverable
3. **Parallelism is the multiplier** — One engineer running 5 agents beats 5 engineers running 1 each
4. **Structure enables speed** — Counterintuitively, the constraints make you faster

> **Read the full assessment**: [WHAT-IS-SIGMA.md](docs/WHAT-IS-SIGMA.md) — includes honest limitations, when NOT to use Sigma, and detailed comparisons.

---

## How Sigma Compares

| Framework | Type | Sigma's Edge |
|-----------|------|--------------|
| **GitHub Spec Kit** | Document toolkit | Sigma executes specs, not just generates them |
| **AWS Kiro** | Proprietary IDE | Sigma is open-source and platform-agnostic |
| **BMAD Method** | Agent framework | Sigma adds 13-step methodology + Ralph Loop |
| **Aider** | CLI pair programmer | Sigma is strategic (build products), Aider is tactical (write code) |

**For content creators**: See [FRAMEWORK-COMPARISON.md](docs/FRAMEWORK-COMPARISON.md) for detailed breakdowns, one-liner comparisons, and video talking points.

---

## Quick Start

### Install Globally

```bash
npm install -g sigma-protocol
```

### Launch Interactive Menu

```bash
sigma
```

This opens the interactive CLI:

```
╔═══════════════════════════════════════════════════════════════╗
║   ███████╗██╗ ██████╗ ███╗   ███╗ █████╗                      ║
║   ██╔════╝██║██╔════╝ ████╗ ████║██╔══██╗                     ║
║   ███████╗██║██║  ███╗██╔████╔██║███████║                     ║
║   ╚════██║██║██║   ██║██║╚██╔╝██║██╔══██║                     ║
║   ███████║██║╚██████╔╝██║ ╚═╝ ██║██║  ██║                     ║
║   ╚══════╝╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝  PROTOCOL          ║
║                                                               ║
║   [1] Start a new project          (guided walkthrough)       ║
║   [2] Add to existing project      (retrofit)                 ║
║   [3] Set up orchestration         (multi-agent streams)      ║
║   [4] Quick commands               (reference cheatsheet)     ║
║   [5] System health check          (verify setup)             ║
║   [6] Interactive tutorial         (learn Sigma)              ║
╚═══════════════════════════════════════════════════════════════╝
```

### Direct Commands

```bash
sigma new                # Create new project wizard
sigma retrofit           # Add to existing project
sigma install            # Install commands to current project
sigma doctor             # System health check
sigma tutorial           # Interactive tutorial
sigma orchestrate        # Multi-agent orchestration
```

### Daily Workflow Example

```bash
# 1. Start your day - check what needs attention
npx sigma-protocol doctor              # Verify installation is healthy
@continue                        # Find where you left off

# 2. Continue implementation (choose one)
@continue --mode=auto            # Auto-pick most recent task
@continue --ralph                # Let Ralph loop handle it

# 3. After coding - clean up
@simplify                        # Simplify recent changes
@gap-analysis                          # Verify implementation

# 4. Before PR - final checks
@simplify --scope=file --file=src/feature.ts
```

## CLI Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `npx sigma-protocol` | Interactive installation (default) |
| `npx sigma-protocol status` | Check installation status |
| `npx sigma-protocol build --platform <name>` | Build for specific platform |

### Retrofit & Update Commands

| Command | Description |
|---------|-------------|
| `npx sigma-protocol retrofit` | Analyze project, update/generate docs |
| `npx sigma-protocol retrofit --mode=update` | Update existing docs with new frameworks |
| `npx sigma-protocol retrofit --steps=3,5,6` | Update specific steps only |
| `npx sigma-protocol retrofit --dry-run` | Preview changes without applying |
| `npx sigma-protocol update` | Pull latest methodology + prompt retrofit |
| `npx sigma-protocol update --check` | Check for updates without applying |
| `npx sigma-protocol update --skip-retrofit` | Update commands only, skip retrofit |

### Skills & Extensions

| Command | Description |
|---------|-------------|
| `npx sigma-protocol install-skills` | Install foundation skills (39) |
| `npx sigma-protocol install-harness` | Install OpenCode agent harness |
| `npx sigma-protocol install-validators` | Install self-validating hooks |

### Orchestration

| Command | Description |
|---------|-------------|
| `npx sigma-protocol orchestrate` | Multi-agent orchestration |
| `npx sigma-protocol orchestrate --streams=N` | Start N parallel workers |
| `npx sigma-protocol orchestrate --attach` | Attach to running session |

### Health & Diagnostics

| Command | Description |
|---------|-------------|
| `npx sigma-protocol doctor` | Run health checks on installation |
| `npx sigma-protocol doctor --verbose` | Detailed health check output |
| `npx sigma-protocol doctor --fix` | Auto-fix common issues |

---

## Keeping Your Project Updated

Sigma Protocol evolves with new frameworks, phases, and best practices. Here's how to stay current:

### Scenario 1: New Project
```bash
npx sigma-protocol              # Interactive install
# Then in your AI assistant:
@step-1-ideation               # Start the 13-step workflow
```

### Scenario 2: Existing Codebase (never used Sigma)
```bash
npx sigma-protocol retrofit     # Analyze what exists
# Then in your AI assistant:
@retrofit-analyze              # Deep analysis
@retrofit-generate --priority=high  # Generate missing docs
```

### Scenario 3: Old Sigma Installation (want latest frameworks)
```bash
npx sigma-protocol update       # Pull latest commands
# Then in your AI assistant:
@retrofit-enhance --mode=update # Add new frameworks to existing docs
```

### What Gets Updated?

When you run `update` or `retrofit --mode=update`, the system:

1. **Scans your existing docs** for section headers
2. **Compares against latest templates** (knows what was added in v2.0, v2.1, v3.0)
3. **Shows you exactly what's missing** per step
4. **Adds new sections IN-PLACE** without overwriting your customizations
5. **Creates backups** (`.bak` files) before any edits

Example output:
```
Step 3: UX Design (docs/ux/UX-DESIGN.md)
   ✅ User Personas
   ✅ User Journeys
   ❌ IA Frameworks (added v2.0)
   ❌ Animation Philosophy (added v2.1)
   → UPDATE will add 2 sections preserving your customizations
```

### Version Tracking

The CLI creates `.sigma-manifest.json` in your project to track:
- Which steps you've run
- What version of commands were used
- What sections exist in each doc
- When updates were last applied

## Supported Platforms

| Platform        | Command Style   | Configuration              |
| --------------- | --------------- | -------------------------- |
| **Cursor**      | `@command-name` | `.cursor/commands/`        |
| **Claude Code** | `/command-name` | `.claude/` + `CLAUDE.md`   |
| **OpenCode**    | `/command-name` | `.opencode/` + `AGENTS.md` |

---

## The 13-Step Workflow

```
Step 0: Environment Setup
    ↓
Step 1: Ideation → MASTER_PRD.md
    ↓
Step 1.5: Offer Architecture (if monetized)
    ↓
Step 2: Architecture → ARCHITECTURE.md
    ↓
Step 3: UX Design → UX-DESIGN.md
    ↓
Step 4: Flow Tree → Bulletproof Gates
    ↓
Step 5: Wireframes → docs/prds/flows/
    ↓
Step 5b: PRD to JSON → docs/ralph/prototype/prd.json (Ralph-mode)
    ↓
Step 6: Design System → DESIGN-SYSTEM.md
    ↓
Step 7: Interface States → STATE-SPEC.md
    ↓
Step 8: Technical Spec → TECHNICAL-SPEC.md
    ↓
Step 9: Landing Page (optional)
    ↓
Step 10: Feature Breakdown → FEATURE-BREAKDOWN.md
    ↓
Step 11: PRD Generation → /docs/prds/*.md
    ↓
Step 11a: PRD to JSON → docs/ralph/implementation/prd.json (Ralph-mode)
    ↓
Step 11b: PRD Swarm (optional) → /docs/prds/swarm-*/
    ↓
Step 12: Context Engine → .cursorrules
    ↓
Step 13: Skillpack Generator (platform-specific)
    ↓
[Ralph Loop] → Autonomous implementation
```

---

## Command Categories

### Core Steps (`steps/`)

The 13-step methodology commands that guide product development.

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `@step-1-ideation`             | Product Ideation with Hormozi Value Equation |
| `@step-2-architecture`         | System Architecture Design                   |
| `@step-3-ux-design`            | UX/UI Design & User Flows                    |
| `@step-4-flow-tree`            | Navigation Flow & Screen Inventory           |
| `@step-5-wireframe-prototypes` | Wireframe Prototypes                         |
| `@step-5b-prd-to-json`        | Convert prototype PRDs to Ralph backlog      |
| `@step-6-design-system`        | Design System & Tokens                       |
| `@step-7-interface-states`     | Interface State Specifications               |
| `@step-8-technical-spec`       | Technical Specifications                     |
| `@step-9-landing-page`         | Landing Page Design                          |
| `@step-10-feature-breakdown`   | Feature Breakdown                            |
| `@step-11-prd-generation`      | PRD Generation                               |
| `@step-11a-prd-to-json`      | Convert implementation PRDs to Ralph backlog |
| `@step-11b-prd-swarm`         | PRD Swarm Orchestration (supports Ralph-mode)|
| `@step-12-context-engine`      | Context Engine Setup                         |
| `@step-13-skillpack-generator` | Platform-specific Configuration              |

### Ralph Loop (`scripts/ralph/`)

Autonomous task execution using the Ralph loop pattern.

```bash
# Run Ralph loop on PRD backlog
./scripts/ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

### Audit Commands (`audit/`) — 16 Commands

Quality assurance and verification.

| Command | Description |
|---------|-------------|
| `@holes` | Pre-implementation gap analysis |
| `@gap-analysis` | Post-implementation verification |
| `@verify-prd` | PRD implementation scoring |
| `@step-verify` | Step completion verification |
| `@ui-healer` | Browser-based UI testing and fixing |
| `@security-audit` | Security vulnerability assessment |
| `@accessibility-audit` | WCAG compliance check |
| `@performance-check` | Performance analysis |
| `@code-quality-report` | Code quality metrics |
| `@tech-debt-audit` | Technical debt analysis |
| `@analyze` | General code analysis |
| `@license-check` | Dependency license audit |
| `@load-test` | Load testing |
| `@seo-audit` | SEO analysis |
| `@simplify` | Code simplification (inspired by code-simplifier) |
| `@sigma-simplify` | Sigma-specific simplification |

### Dev Commands (`dev/`) — 5 Commands

Development workflow.

| Command | Description |
|---------|-------------|
| `@implement-prd` | Implement a PRD feature |
| `@plan` | Create implementation plan |
| `@db-migrate` | Database migration assistance |
| `@compound-engineering` | Plan → Work → Review → Compound workflow |
| `@prompt-enhancer` | Enhance prompts for better AI responses |

### Ops Commands (`ops/`) — 33 Commands

Operations, project management, and orchestration.

#### Tracking & Planning

| Command | Description |
|---------|-------------|
| `@status` | Project health overview |
| `@continue` | Find and resume unfinished work |
| `@sigma-continue` | Sigma-specific work continuation |
| `@prd-orchestrate` | PRD swarm orchestration for parallel dev |
| `@sprint-plan` | Sprint planning |
| `@backlog-groom` | Backlog grooming |
| `@daily-standup` | Daily standup with git awareness |
| `@job-status` | Query PRD/sprint status |

#### Orchestration

| Command | Description |
|---------|-------------|
| `@orchestrate` | Multi-agent orchestration setup |
| `@sigma-orchestrate` | Sigma-specific orchestration |
| `@stream` | Stream worker management |
| `@sigma-stream` | Sigma stream operations |

#### Quality Assurance

| Command | Description |
|---------|-------------|
| `@qa-plan` | Generate QA test plan |
| `@qa-run` | Execute QA tests |
| `@qa-report` | Generate QA report |
| `@pr-review` | Code review with scoring |
| `@test-review` | Test quality review |
| `@release-review` | Final go/no-go decision |

#### Maintenance

| Command | Description |
|---------|-------------|
| `@dependency-update` | Update dependencies safely |
| `@maintenance-plan` | Create maintenance schedule |
| `@maid` | Repository maintenance wizard |
| `@cleanup-repo` | Clean up repository files |
| `@doctor-fix` | Auto-fix common issues |
| `@lint-commands` | Lint Sigma command files |
| `@docs-update` | Update documentation |
| `@onboard` | Onboard new team member |
| `@prompt-handoff` | Handoff context to another session |
| `@repair-manifest` | Repair module manifests |
| `@sync-workspace-commands` | Sync commands in workspace |
| `@system-health` | System health check |

#### Retrofit

| Command | Description |
|---------|-------------|
| `@retrofit-analyze` | Analyze project for compliance |
| `@retrofit-generate` | Generate missing documentation |
| `@retrofit-enhance` | Enhance existing documentation |

### Deploy Commands (`deploy/`)

Deployment and shipping.

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `@ship-check`     | Pre-deployment validation     |
| `@ship-stage`     | Deploy to staging             |
| `@ship-prod`      | Deploy to production          |
| `@client-handoff` | Client delivery documentation |

### Generator Commands (`generators/`) — 15 Commands

Code, document, and business generators.

| Command | Description |
|---------|-------------|
| `@scaffold` | Generate project scaffolding |
| `@new-feature` | Create new feature structure |
| `@new-project` | Initialize new Sigma project |
| `@new-command` | Create new Sigma command |
| `@test-gen` | Generate tests from PRD |
| `@api-docs-gen` | Generate API documentation |
| `@wireframe` | Generate wireframe spec |
| `@changelog` | Generate changelog |
| `@proposal` | Generate project proposal |
| `@prototype-proposal` | Generate prototype proposal |
| `@contract` | Generate contract template |
| `@nda` | Generate NDA template |
| `@estimation-engine` | Estimate project scope |
| `@cost-optimizer` | Optimize project costs |
| `@notebooklm-format` | Format for NotebookLM |

### Marketing Commands (`marketing/`) — 25 Commands

Go-to-market workflow and content creation.

#### Research & Strategy

| Command | Description |
|---------|-------------|
| `@01-market-research` | Market research analysis |
| `@02-customer-avatar` | Customer persona creation |
| `@03-brand-voice` | Brand voice guidelines |
| `@04-offer-architect` | Offer design |
| `@05-sales-strategy` | Sales strategy |

#### Content & Copy

| Command | Description |
|---------|-------------|
| `@06-email-sequences` | Email sequence creation |
| `@07-landing-page-copy` | Landing page copywriting |
| `@08-ads-strategy` | Advertising strategy |
| `@09-retargeting-strategy` | Retargeting strategy |
| `@10-launch-playbook` | Launch planning |

#### Partnerships & Content

| Command | Description |
|---------|-------------|
| `@11-partnership-outreach` | Partnership outreach |
| `@12-content-ideation` | Content ideation |
| `@13-content-matrix` | Content matrix |
| `@14-video-script` | Video script writing |
| `@15-thumbnail-prompts` | Thumbnail prompt generation |
| `@16-seo-content` | SEO content creation |
| `@17-community-update` | Community update posts |

#### Content Creation Studio (NEW)

| Command | Description |
|---------|-------------|
| `@18-youtube-script-writer` | Long-form YouTube scripts |
| `@19-short-form-scripts` | TikTok/Reels/Shorts scripts |
| `@20-linkedin-writer` | LinkedIn post writer |
| `@21-twitter-threads` | Twitter thread generator |
| `@22-video-research` | Video topic research |
| `@23-story-posts` | Instagram/Facebook story posts |

#### AI Asset Prompts

| Command | Description |
|---------|-------------|
| `@ai-video-prompt` | AI video generation prompts |
| `@ai-image-prompt` | AI image generation prompts |

---

## Foundation Skills (39 Bundled)

Sigma Protocol includes **39 pre-bundled Foundation Skills** installed by the CLI. These provide universal AI capabilities that enhance every step of the workflow.

### Skill Categories

| Category | Skills | Count |
|----------|--------|-------|
| **Sigma Core** | research, verification, bdd-scenarios, hormozi-frameworks, output-generation, frontend-design | 6 |
| **Design & Dev** | ux-designer, architecture-patterns, api-design-principles, web-artifacts-builder, react-performance, monorepo-architecture, superdesign-integration | 7 |
| **Quality** | brainstorming, systematic-debugging, quality-gates, senior-qa, senior-architect, specialized-validation | 6 |
| **Productivity** | prompt-engineering-patterns, xlsx, pptx, applying-brand-guidelines, remembering-conversations, memory-systems | 6 |
| **Platform Tools** | skill-creator, agent-development, opencode-agent-generator, creating-opencode-plugins, agentic-coding | 5 |
| **Content & Marketing** | brand-voice, content-atomizer, direct-response-copy, video-hooks | 4 |
| **Document Generation** | docx-generation, pdf-manipulation | 2 |
| **Browser & Verification** | browser-verification | 1 |
| **Multi-Agent** | fork-worker, orchestrator-admin | 2 |

### Platform Installation

| Platform        | Install Location             | Format                  |
| --------------- | ---------------------------- | ----------------------- |
| **Cursor**      | `.cursor/rules/*.mdc`        | MDC with globs/keywords |
| **Claude Code** | `.claude/skills/*/SKILL.md`  | SKILL.md directories    |
| **OpenCode**    | `.opencode/skill/*/SKILL.md` | SKILL.md directories    |

### Two-Tier Skill System

```
┌─────────────────────────────────────────────────────────┐
│           PROJECT-SPECIFIC OVERLAYS (Step 13)          │
│  Your PRD, design system, stack choices, conventions   │
├─────────────────────────────────────────────────────────┤
│           FOUNDATION SKILLS (CLI install)              │
│  Universal best practices, design patterns, frameworks │
└─────────────────────────────────────────────────────────┘
```

- **CLI** installs foundation skills (universal capabilities)
- **Step 13** generates project overlays (your specific project context)

See [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) for the complete skill reference.

---

## Agent Personas (12 Bundled)

Sigma Protocol includes **12 specialist agent personas** that provide expert-level guidance for specific domains.

### Orchestration Layer

| Agent | Purpose |
|-------|---------|
| **orchestrator** | Multi-agent coordinator - assigns PRDs to forks, reviews completions, merges results |
| **fork-worker** | PRD implementation specialist - executes assigned tasks with focused context |

### Core Development

| Agent | Purpose |
|-------|---------|
| **lead-architect** | System architecture, tech stack decisions, scalability planning |
| **frontend-engineer** | Production-grade UI development with high design quality |
| **qa-engineer** | Test strategies, automation, coverage analysis |

### Design & Product

| Agent | Purpose |
|-------|---------|
| **ux-director** | User experience design, accessibility, interaction patterns |
| **design-systems-architect** | Design tokens, component libraries, brand consistency |
| **product-owner** | PRD generation, feature prioritization, backlog management |
| **venture-studio-partner** | Product vision, market fit, value proposition |

### Specialized

| Agent | Purpose |
|-------|---------|
| **content-director** | Video/social content strategy and production |
| **sigmavue-quant-strategist** | Trading strategies and quantitative analysis |
| **sigmavue-market-data-engineer** | Market data integration and pipelines |

### Using Agents

Agents are invoked via the `@agent-name` syntax in Cursor or `/agent-name` in Claude Code:

```bash
# In Cursor
@lead-architect    # Get architecture guidance
@qa-engineer       # Test strategy recommendations

# In Claude Code
/frontend-engineer  # UI implementation help
/orchestrator       # Multi-agent coordination
```

---

## Key Concepts

### Hormozi Value Equation

Every feature is evaluated using Alex Hormozi's Value Equation:

```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
```

### HITL Checkpoints

Commands pause for human approval at critical decision points. Never skip these—they ensure quality.

### Quality Gates

Each step has verification criteria. Target: **80+/100** score to proceed.

### Ralph Loop

The Ralph Loop enables autonomous task execution by:
1. Converting PRDs to atomic JSON user stories
2. Spawning fresh AI sessions per story
3. Tracking progress in `progress.txt` and `AGENTS.md`
4. Auto-committing after each completed story

#### Taskmaster MCP Integration (Recommended)

For AI-powered PRD parsing, integrate [Taskmaster MCP](https://github.com/eyaltoledano/claude-task-master):

```bash
# Claude Code
claude mcp add taskmaster-ai -- npx -y task-master-ai

# Use Taskmaster for PRD → JSON conversion
@step-5b-prd-to-json --use-taskmaster=true
@step-11a-prd-to-json --use-taskmaster=true
```

Taskmaster provides intelligent task decomposition, dependency detection, and complexity analysis—making Ralph Loop more effective.

See [RALPH-MODE.md](docs/RALPH-MODE.md) for details.

### MCP Tool Integration

Commands use MCP (Model Context Protocol) tools for:

- **Exa**: Code context and web search
- **Ref**: Documentation lookup
- **Perplexity**: Research queries
- **Browser**: UI testing and validation

### Self-Validating Hooks

Sigma Protocol includes **PostToolUse hooks** that automatically validate outputs:

| Validator | Triggers On | Validates |
|-----------|-------------|-----------|
| `prd-validator.py` | PRD file edits | PRD structure and completeness |
| `typescript-validator.sh` | `.ts`/`.tsx` edits | TypeScript compilation |
| `design-tokens-validator.py` | Design system edits | Token consistency |
| `bdd-validator.py` | Test scenario edits | Gherkin syntax |
| `csv-validator.py` | CSV file edits | Data integrity |

**How It Works:**

```
Edit file → PostToolUse Hook → Validator → Pass/Fail
                                            ↓
                                   AI auto-corrects on fail
```

This creates a "Closed Loop Prompt" pattern where the AI continuously refines until validation passes.

**Install validators:**
```bash
npx sigma-protocol install-validators
```

---

## Installation

### NPX (Recommended)

```bash
# Interactive installation
npx sigma-protocol install
```

### Manual Installation

1. Clone this repository
2. Copy desired command folders to your project's `.cursor/commands/`
3. For Claude Code: Use the CLI to generate `.claude/` configuration
4. For OpenCode: Use the CLI to generate `.opencode/` configuration

---

## Claude Code Integration

Sigma Protocol is designed to work natively with Claude Code's architecture:

### Memory Alignment

| Claude Code | Sigma Protocol |
|-------------|----------------|
| `CLAUDE.md` | Generated by Step 12 |
| `.claude/rules/` | Mirrors `.sigma/rules/` |
| `.claude/commands/` | Sigma commands installed here |
| `.claude/agents/` | Sub-agents for specialized tasks |

### Key Features

- **Boris Cherny's code-simplifier pattern** - `@simplify` command
- **Modular rules with path-specific activation** - `.sigma/rules/*.md`
- **Ralph loop integration** - Autonomous task execution
- **Cross-platform manifest** - `.sigma-manifest.json` for version tracking

See [CLAUDE-CODE-INTEGRATION.md](docs/CLAUDE-CODE-INTEGRATION.md) for the complete integration guide.

---

## New Utility Commands (v3.0)

### `npx sigma-protocol doctor` — Installation Health Check

Diagnose issues with your Sigma Protocol installation.

```bash
# Basic health check
npx sigma-protocol doctor

# Verbose output (shows files with stale references)
npx sigma-protocol doctor --verbose

# Check a specific project
npx sigma-protocol doctor --target /path/to/project
```

**What it checks:**
- ✅ Sigma manifest exists and is valid
- ✅ All installed commands are present  
- ✅ No stale "SSS" references remain
- ✅ Platform-specific files in sync (Cursor/Claude/OpenCode)
- ✅ CLAUDE.md/AGENTS.md orchestrator present
- ✅ Ralph loop scripts installed
- ✅ JSON schemas available

**Example output:**
```
📊 Results

✓ Passed:
  ✓ Installed for: Cursor, Claude Code
  ✓ Manifest valid (version 3.0.0)
  ✓ No stale SSS references found
  ✓ Cursor has 94 items
  ✓ CLAUDE.md orchestrator present

⚠ Warnings:
  ⚠ OpenCode not installed

Health Score: 95%
```

---

### `@simplify` — Code Simplification

Simplify code for clarity and maintainability without changing functionality. Inspired by Boris Cherny's `code-simplifier` plugin.

```bash
# Simplify recently modified code (default)
@simplify

# Simplify a specific file
@simplify --scope=file --file=src/utils/helpers.ts

# Simplify an entire directory
@simplify --scope=directory --file=src/components/

# Preview changes without applying
@simplify --dry-run

# Deep analysis (more thorough)
@simplify --depth=deep
```

**Core Principles:**
1. **Never change functionality** — only implementation
2. **Follow project standards** — uses CLAUDE.md/SIGMA.md conventions
3. **Reduce complexity** — flatten nested conditionals
4. **Clarity over brevity** — avoid nested ternaries
5. **Focus on recent code** — what you just wrote

**Example transformations:**

```typescript
// ❌ Before: Nested ternary
const status = user.active
  ? user.verified ? 'verified' : 'unverified'
  : 'inactive';

// ✅ After: Clear function
function getUserStatus(user: User): string {
  if (!user.active) return 'inactive';
  return user.verified ? 'verified' : 'unverified';
}
```

**When to use:**
- After completing a feature (clean up while context is fresh)
- Before PR review (easier reviews with cleaner code)
- When you notice code complexity creeping up

---

### `@continue` — Resume Unfinished Work

Find and continue your most recent unfinished task. Perfect for picking up where you left off.

```bash
# Interactive mode - shows options
@continue

# Auto-continue most recent task
@continue --mode=auto

# Check specific source
@continue --source=prd-map    # Ralph PRD map
@continue --source=manifest   # Sigma manifest
@continue --source=git        # Git branches

# Continue and invoke Ralph loop
@continue --ralph

# Limit results shown
@continue --limit=5
```

**What it finds:**
1. **In-progress stories** in Ralph prd.json files
2. **Active work** tracked in `.sigma-manifest.json`
3. **WIP branches** in git (feat/*, wip/*)
4. **Partially completed PRDs**

**Example output:**
```markdown
## 🔄 Unfinished Work Found

### Currently In Progress (Resume First)

| # | Task | Progress | Last Activity |
|---|------|----------|---------------|
| 1 | User Authentication Flow | 3/10 stories | 2 hours ago |
| 2 | Dashboard Components | 1/5 stories | Yesterday |

### Pending (Ready to Start)

| # | Task | Stories | PRD Location |
|---|------|---------|--------------|
| 3 | Payment Integration | 8 stories | docs/ralph/payment/prd.json |

Enter number to continue, or:
- `r` - Run Ralph loop on selection
- `a` - Show all (including completed)
```

**Workflow:**
```bash
# Start your day
@continue                    # See what's pending

# Auto-continue with Ralph loop
@continue --mode=auto --ralph  # Let Ralph handle it
```

---

## Foundation Skills

Sigma Protocol includes specialized skills that enhance AI capabilities. Install via `npx sigma-protocol install-skills`.

### Development Skills

| Skill | Description |
|-------|-------------|
| `frontend-design` | Create distinctive UIs that escape "AI slop" aesthetics |
| `browser-verification` | Platform-adaptive browser testing (Cursor/Playwright/Claude) |
| `bdd-scenarios` | Generate behavior-driven development test scenarios |
| `verification` | Step completion and quality verification |

### Workflow Skills

| Skill | Description |
|-------|-------------|
| `compound-engineering` | Plan → Work → Review → Compound workflow |
| `research` | Systematic research with MCP tools |
| `output-generation` | Consistent document formatting |

### Document Generation

| Skill | Description |
|-------|-------------|
| `docx-generation` | Create Word documents programmatically |
| `pdf-manipulation` | Generate, merge, split, extract PDFs |

### Marketing & Content

| Skill | Description |
|-------|-------------|
| `brand-voice` | Define, extract, apply consistent brand voice |
| `direct-response-copy` | Conversion-focused copywriting frameworks |
| `content-atomizer` | Transform pillar content into platform-specific formats |

### Using Skills

Skills are automatically loaded based on context, but you can explicitly invoke them:

```bash
# In Cursor
@frontend-design       # Get design guidance
@brand-voice extract   # Extract voice from content

# In Claude Code
/frontend-design       # Apply design principles
/content-atomizer      # Repurpose content
```

### Compound Engineering Workflow

The `compound-engineering` skill provides a structured development cycle:

```
PLAN → WORK → REVIEW → COMPOUND
  │      │       │         │
  │      │       │         └─ Extract learnings → AGENTS.md
  │      │       └─ Self-review checklist
  │      └─ Implement in focused sprints
  └─ Design approach, identify risks
```

```bash
@compound-engineering --task="Add user authentication"
@compound-engineering --mode=work      # Continue existing plan
@compound-engineering --mode=review    # Review current work
@compound-engineering --mode=compound  # Extract learnings
```

---

## Context Tracking (`.sigma/` Directory)

After installation, Sigma creates a `.sigma/` directory for persistent context:

```
.sigma/
├── manifest.json           # Version tracking (auto-created)
├── progress.txt            # Ralph loop short-term memory
├── context/
│   ├── project.json        # Auto-generated project summary
│   ├── history.json        # Command execution history
│   └── decisions.json      # HITL checkpoint decisions
└── rules/
    ├── code-style.md       # Project coding standards
    ├── testing.md          # Testing conventions
    ├── frontend.md         # Frontend-specific rules
    ├── backend.md          # Backend rules
    └── security.md         # Security requirements
```

### Using Modular Rules

Rules in `.sigma/rules/` (and `.claude/rules/` for Claude Code) support **path-specific activation**:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "lib/server/**/*.ts"
---

# API Development Rules

- All endpoints must include input validation
- Use standard error response format
- Include rate limiting for public endpoints
```

Rules only activate when working on matching files!

### Manifest Tracking

The `.sigma-manifest.json` tracks everything:

```json
{
  "sigma_version": "3.0.0",
  "initialized": "2026-01-11T10:00:00Z",
  "installed_platforms": ["cursor", "claude-code"],
  "installed_modules": ["steps", "audit", "dev", "ops"],
  "active_work": {
    "current_prd": "docs/ralph/auth/prd.json",
    "current_story_id": "story-003",
    "last_activity": "2026-01-11T14:30:00Z",
    "progress": { "completed": 2, "total": 10 }
  },
  "health_check": {
    "last_run": "2026-01-11T09:00:00Z",
    "score": 95
  }
}
```

This enables:
- **`@continue`** to find your place
- **`sigma doctor`** to track health
- **Retrofit** to know what needs updating

---

## Documentation

| Document                                              | Description                     |
| ----------------------------------------------------- | ------------------------------- |
| [FRAMEWORK-COMPARISON.md](docs/FRAMEWORK-COMPARISON.md) | **NEW** Compare Sigma vs Kiro, Spec Kit, BMAD, Aider |
| [THREAD-BASED-ENGINEERING.md](docs/THREAD-BASED-ENGINEERING.md) | Framework for scaling agent work |
| [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md)     | Complete workflow documentation |
| [FILE-PATH-REFERENCE.md](docs/FILE-PATH-REFERENCE.md) | Output file locations           |
| [QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md)         | Command quick reference         |
| [SCORING-SYSTEM.md](docs/SCORING-SYSTEM.md)           | Quality scoring details         |
| [RALPH-MODE.md](docs/RALPH-MODE.md)                   | Ralph Loop documentation        |
| [COMMANDS.md](docs/COMMANDS.md)                       | Full command catalog            |
| [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md)     | Foundation skills reference     |
| [CLAUDE-CODE-INTEGRATION.md](docs/CLAUDE-CODE-INTEGRATION.md) | Claude Code integration guide |

### Getting Started Guides

| Document | Description |
| -------- | ----------- |
| [GETTING-STARTED.md](docs/GETTING-STARTED.md) | Quick start guide |
| [NEW-PROJECT-QUICKSTART.md](docs/NEW-PROJECT-QUICKSTART.md) | New project walkthrough |
| [RETROFIT-GUIDE.md](docs/RETROFIT-GUIDE.md) | Add Sigma to existing projects |
| [ORCHESTRATION.md](docs/ORCHESTRATION.md) | Multi-agent parallel development |
| [TMUX-GUIDE.md](docs/TMUX-GUIDE.md) | tmux tutorial for orchestration |

### Retrofit & Update Documentation

| Document | Description |
| -------- | ----------- |
| `ops/retrofit-analyze` | Section-level analysis command |
| `ops/retrofit-generate` | Missing doc generation command |
| `ops/retrofit-enhance` | Update/enhance/sync command (v3.0) |
| `schemas/sigma-manifest.schema.json` | Version tracking schema |

---

## Project Structure

```
sigma-protocol/
├── steps/              # Core 13-step methodology (20 commands)
├── audit/              # Quality assurance commands (16 commands)
├── dev/                # Development workflow (5 commands)
├── ops/                # Operations commands (33 commands)
├── deploy/             # Deployment commands (4 commands)
├── generators/         # Code generators (15 commands)
├── marketing/          # GTM workflow (25 commands)
├── schemas/            # JSON schemas for outputs
├── src/
│   ├── agents/         # Agent persona definitions (12)
│   ├── skills/         # Foundation skills (39)
│   └── tools/          # OpenCode custom tools
├── .claude/
│   └── hooks/
│       └── validators/ # Self-validating agent hooks (5)
├── cli/
│   ├── sigma-cli.js    # Main CLI entry point
│   └── lib/            # CLI modules (interactive, tutorial, doctor)
├── scripts/
│   ├── ralph/          # Ralph loop scripts
│   ├── orchestrator/   # Multi-agent orchestration scripts
│   ├── hooks/          # Event hooks (session-start, post-edit)
│   └── notify/         # Voice notifications (ElevenLabs)
├── templates/          # Project templates
└── docs/               # Documentation
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with care by the Sigma Protocol Team**
