# Sigma Protocol - Claude Code Configuration

**Version:** 5.1.0
**Last Updated:** 2026-01-28

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This CLAUDE.md orchestrates the Sigma workflow in Claude Code, providing access to all step commands, agents, and skills.

### Supported Platforms

| Platform | Configuration | Skills | Status |
|----------|---------------|--------|--------|
| **Claude Code** | `.claude/` | 177 | Production |
| **OpenCode** | `.opencode/` | 149 | Production |
| **Cursor** | `.cursor/rules/` | 149 | Production |
| **Factory Droid** | `.factory/` | 158 | Production |
| **Antigravity** | `.agent/` | 16 | New |

See [PLATFORMS.md](docs/PLATFORMS.md) for detailed platform configuration.

## Quick Start

```bash
# Start with product ideation
claude "Run step 1 ideation for [your product idea]"

# Continue through the workflow
claude "Continue to step 2"

# Verify any step
claude "Verify step 1"

# Check status
claude "What step am I on?"
```

## Available Commands

### Core Steps
| Command | Description |
|---------|-------------|
| `/step-1-ideation` | Product Ideation with Hormozi Value Equation |
| `/step-2-architecture` | System Architecture Design |
| `/step-3-ux-design` | UX/UI Design & User Flows |
| `/step-4-flow-tree` | Navigation Flow & Screen Inventory |
| `/step-5-wireframe-prototypes` | Wireframe Prototypes |
| `/step-5b-prd-to-json` | **Ralph-Mode:** Convert prototype PRDs to JSON |
| `/step-6-design-system` | Design System & Tokens |
| `/step-7-interface-states` | Interface State Specifications |
| `/step-8-technical-spec` | Technical Specifications |
| `/step-9-landing-page` | Landing Page Design |
| `/step-10-feature-breakdown` | Feature Breakdown |
| `/step-11-prd-generation` | PRD Generation |
| `/step-11a-prd-to-json` | **Ralph-Mode:** Convert implementation PRDs to JSON |
| `/step-11b-prd-swarm` | PRD Swarm Orchestration (supports Ralph-mode) |
| `/step-12-context-engine` | Context Engine Setup |
| `/step-13-skillpack-generator` | Generate project skillpack |

### Ralph Loop (Autonomous Implementation)
| Command | Description |
|---------|-------------|
| `./scripts/ralph/sigma-ralph.sh` | Run Ralph loop on prd.json backlog |

**Ralph Mode Usage:**
```bash
# 1. Convert PRDs to JSON
claude "Run step-5b-prd-to-json --all-prds"

# 2. Run Ralph loop (in terminal)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```


### Audit Commands
| Command | Description |
|---------|-------------|
| `/security-audit` | Security vulnerability assessment |
| `/accessibility-audit` | WCAG compliance check |
| `/performance-check` | Performance analysis |
| `/gap-analysis` | PRD coverage analysis |



### Dev Commands
| Command | Description |
|---------|-------------|
| `/implement-prd` | Implement a PRD feature |
| `/plan` | Create implementation plan |



### Ops Commands
| Command | Description |
|---------|-------------|
| `/pr-review` | Pull request review |
| `/sprint-plan` | Sprint planning |
| `/status` | Project status check |
| `/daily-standup` | Daily standup report |
| `/backlog-groom` | Backlog grooming |
| `/platform-sync` | **NEW:** Sync with platform changelogs (run weekly) |

### Deploy Commands
| Command | Description |
|---------|-------------|
| `/ship-stage` | Deploy to staging |
| `/ship-prod` | Deploy to production |
| `/ship-check` | Pre-deployment validation |
| `/client-handoff` | Generate client handoff docs |

### Generator Commands
| Command | Description |
|---------|-------------|
| `/new-feature` | Create new feature PRD |
| `/new-project` | Scaffold new project |
| `/scaffold` | Scaffold feature code |
| `/proposal` | Generate client proposal |
| `/contract` | Generate contract |

### Marketing Commands
| Command | Description |
|---------|-------------|
| `/01-market-research` | Market research & competitive analysis |
| `/02-customer-avatar` | Customer avatar development |
| `/04-offer-architect` | Hormozi offer architecture |
| `/07-landing-page-copy` | Landing page copywriting |
| `/08-ads-strategy` | Multi-platform ad strategy |

> **Note:** 185 total commands available. Run `/help` to see all commands.


## Workflow

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
Step 5: Wireframes → docs/prds/flows/*.md
    ↓
Step 5.5: PRD to JSON (Ralph-mode) → docs/ralph/prototype/prd.json
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
Step 11.25: PRD to JSON (Ralph-mode) → docs/ralph/implementation/prd.json
    ↓
Step 11b: PRD Swarm (optional) → swarm-*/
    ↓
Step 12: Context Engine → .cursorrules
    ↓
Step 13: Skillpack Generator → project skills
    ↓
[Ralph Loop] → Autonomous implementation via sigma-ralph.sh
```

## Key Principles

### Value Equation (Hormozi)
Every feature must maximize:
```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
```

### HITL Checkpoints
Commands pause for human approval at critical points. Never skip these.

### Quality Gates
Each step has verification criteria. Target: 80+/100 score.

---

## Execution Philosophy: Swarm-First

**Never work solo. Always use agent swarms for PRD execution.**

### Swarm Sizing
| PRD Complexity | Agent Count | Parallel Streams |
|----------------|-------------|------------------|
| Simple (1-3 features) | 5 agents | 2-3 |
| Medium (4-7 features) | 10 agents | 4-5 |
| Complex (8+ features) | 15-20 agents | 6-8 |

### Research-First Planning

**CRITICAL: Before ANY planning session:**
1. Invoke `deep-research` skill automatically
2. Use Firecrawl for competitor/market research
3. Use EXA for technical patterns and code examples
4. Synthesize findings BEFORE brainstorming

### Automatic Skill Invocation

Before executing ANY task, match keywords and auto-invoke:

| Task Contains | Auto-Invoke Skill |
|---------------|-------------------|
| plan, design, ideate | `brainstorming` + `deep-research` |
| architecture, technical | `deep-research` first |
| component, UI, *.tsx | `frontend-design` |
| test, verify, done | `verification-before-completion` |
| docs, README, commit | `writing-clearly` |
| marketing, launch, SEO | `marketing-*` skills |
| 3+ independent tasks | `dispatching-parallel-agents` |

### Agent Skill Assignment

When distributing to swarm, assign skills by role:

| Agent Role | Skills |
|------------|--------|
| **Planning Agents** | deep-research, brainstorming, executing-plans |
| **Frontend Agents** | frontend-design, react-performance |
| **Backend Agents** | verification-before-completion |
| **QA Agents** | verification-before-completion, tdd-skill-creation |
| **Documentation Agents** | writing-clearly |
| **Marketing Agents** | marketing-copywriting, marketing-psychology, seo-audit |

---

## Skills by Category

### Research & Planning
| Skill | Auto-Trigger | Description |
|-------|--------------|-------------|
| `deep-research` | plan, architecture | Firecrawl + EXA + Ref MCP orchestration |
| `brainstorming` | plan, design, ideate | One-question-at-a-time exploration |
| `executing-plans` | implement-prd, plan | Batch execution with checkpoints |

### Frontend & UI
| Skill | Auto-Trigger | Description |
|-------|--------------|-------------|
| `frontend-design` | *.tsx, component, UI | CVA patterns, style vocabulary |
| `react-performance` | performance, slow, audit | Vercel's 57 optimization rules |

### Quality & Verification
| Skill | Auto-Trigger | Description |
|-------|--------------|-------------|
| `verification-before-completion` | done, complete, ship | Evidence before claims |
| `writing-clearly` | docs, README, commit | Strunk's rules, no AI-isms |

### Orchestration
| Skill | Auto-Trigger | Description |
|-------|--------------|-------------|
| `subagent-driven-development` | orchestrate, stream | Fresh subagent per task |
| `dispatching-parallel-agents` | swarm, parallel | One agent per problem domain |

### Marketing
| Skill | Auto-Trigger | Description |
|-------|--------------|-------------|
| `marketing-copywriting` | 07-landing-page-copy | Headlines, CTAs, page structure |
| `marketing-psychology` | 04-offer-architect | Buyer psychology, pricing |
| `seo-audit` | 16-seo-content | Technical + on-page SEO |
| `launch-strategy` | 10-launch-playbook | 5-phase launch, ORB framework |

---

## MCP Tools Available

### Research Tools
- **Firecrawl**: Web scraping, site crawling, content extraction
- **EXA**: Semantic search, code context, deep research
- **Ref**: Documentation search, URL reading
- **Context7**: Library-specific documentation

### Task Management
- **Task Master AI**: PRD parsing, task management, research integration

### Claude Code v2.1.x Task Management

Claude Code v2.1.x includes a native task management system:

| Tool | Description |
|------|-------------|
| `TaskCreate` | Create tasks with dependencies |
| `TaskUpdate` | Update task status/content |
| `TaskList` | List all tasks with filters |
| `TaskGet` | Get task details by ID |

**Dependency Tracking:**
- `blockedBy`: Tasks that must complete first
- `blocks`: Tasks waiting on this task

**Status Workflow:** `pending` → `in_progress` → `completed`

## Documentation

- [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) - Complete workflow guide
- [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) - 39 Foundation skills (163 total with external)
- [EXTERNAL-SKILLS.md](docs/EXTERNAL-SKILLS.md) - 120+ external skills
- [PLATFORMS.md](docs/PLATFORMS.md) - Platform configurations
- [FACTORY-DROID-INTEGRATION.md](docs/FACTORY-DROID-INTEGRATION.md) - Factory Droid setup
- [RALPH-MODE.md](docs/RALPH-MODE.md) - Autonomous implementation
- [RALPH-SKILL-REGISTRY.md](docs/RALPH-SKILL-REGISTRY.md) - Dynamic skill matching

See https://github.com/dallionking/sigma-protocol for full documentation.
