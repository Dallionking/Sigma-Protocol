# Sigma Protocol - Claude Code Configuration

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This CLAUDE.md orchestrates the Sigma workflow in Claude Code, providing access to all step commands, agents, and skills.

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

See https://github.com/dallionking/sigma-protocol for full documentation.
