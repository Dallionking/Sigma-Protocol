# Sigma Protocol - Claude Code Configuration

**Version:** 5.0
**Last Updated:** 2026-01-23

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This CLAUDE.md orchestrates the Sigma workflow in Claude Code, providing access to all step commands, agents, and skills.

### Supported Platforms

| Platform | Configuration | Skills | Status |
|----------|---------------|--------|--------|
| **Claude Code** | `.claude/` | 162 | Production |
| **OpenCode** | `.opencode/` | 149 | Production |
| **Cursor** | `.cursor/rules/` | 149 | Production |
| **Factory Droid** | `.factory/` | 158 | New |

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

## Documentation

- [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) - Complete workflow guide
- [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) - 39 Foundation skills (163 total with external)
- [EXTERNAL-SKILLS.md](docs/EXTERNAL-SKILLS.md) - 120+ external skills
- [PLATFORMS.md](docs/PLATFORMS.md) - Platform configurations
- [FACTORY-DROID-INTEGRATION.md](docs/FACTORY-DROID-INTEGRATION.md) - Factory Droid setup
- [RALPH-MODE.md](docs/RALPH-MODE.md) - Autonomous implementation
- [RALPH-SKILL-REGISTRY.md](docs/RALPH-SKILL-REGISTRY.md) - Dynamic skill matching

See https://github.com/dallionking/sigma-protocol for full documentation.
