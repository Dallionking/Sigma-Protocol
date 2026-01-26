# Sigma Protocol

A platform-agnostic 13-step product development methodology for AI-assisted development.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Claude%20Code%20%7C%20Cursor%20%7C%20OpenCode%20%7C%20Factory%20Droid-green.svg)](#supported-platforms)

---

## What is Sigma Protocol?

Sigma Protocol guides AI assistants through a complete product development workflow - from ideation to deployment. It provides:

- **13 structured steps** from idea to shipping
- **Quality gates** with verification scoring (target: 80+)
- **Human-in-the-loop checkpoints** for critical decisions
- **Ralph Loop** for autonomous task execution
- **Multi-agent orchestration** for parallel development

---

## Quick Start

### Install

```bash
npm install -g sigma-protocol
```

### Launch

```bash
sigma
```

### Direct Commands

```bash
sigma new          # Create new project wizard
sigma retrofit     # Add to existing project
sigma doctor       # System health check
sigma tutorial     # Interactive tutorial
```

### Start the Workflow

```bash
# In your AI assistant (Claude Code, Cursor, or OpenCode)
@step-1-ideation   # Start with product ideation
@step-2-architecture   # Continue to architecture
# ... follow the 13-step workflow
```

---

## Supported Platforms

| Platform | Command Style | Configuration | Skills |
|----------|---------------|---------------|--------|
| **Claude Code** | `/command-name` | `.claude/` + `CLAUDE.md` | 162 |
| **Cursor** | `@command-name` | `.cursor/commands/` | 149 |
| **OpenCode** | `/command-name` | `.opencode/` + `AGENTS.md` | 149 |
| **Factory Droid** | `/command-name` | `.factory/` + `AGENTS.md` | 158 |

---

## The 13-Step Workflow

```
Step 0: Environment Setup
    |
Step 1: Ideation --> MASTER_PRD.md
    |
Step 1.5: Offer Architecture (if monetized)
    |
Step 2: Architecture --> ARCHITECTURE.md
    |
Step 3: UX Design --> UX-DESIGN.md
    |
Step 4: Flow Tree --> Navigation & Screen Inventory
    |
Step 5: Wireframes --> docs/prds/flows/
    |
Step 6: Design System --> DESIGN-SYSTEM.md
    |
Step 7: Interface States --> STATE-SPEC.md
    |
Step 8: Technical Spec --> TECHNICAL-SPEC.md
    |
Step 9: Landing Page (optional)
    |
Step 10: Feature Breakdown --> FEATURE-BREAKDOWN.md
    |
Step 11: PRD Generation --> docs/prds/*.md
    |
Step 12: Context Engine --> .cursorrules
    |
Step 13: Skillpack Generator --> Project-specific skills
    |
[Ralph Loop] --> Autonomous implementation
```

---

## Core Commands

### Step Commands

| Command | Description |
|---------|-------------|
| `@step-1-ideation` | Product ideation with Hormozi Value Equation |
| `@step-2-architecture` | System architecture design |
| `@step-3-ux-design` | UX/UI design & user flows |
| `@step-4-flow-tree` | Navigation flow & screen inventory |
| `@step-5-wireframe-prototypes` | Wireframe prototypes |
| `@step-6-design-system` | Design system & tokens |
| `@step-7-interface-states` | Interface state specifications |
| `@step-8-technical-spec` | Technical specifications |
| `@step-9-landing-page` | Landing page design |
| `@step-10-feature-breakdown` | Feature breakdown |
| `@step-11-prd-generation` | PRD generation |
| `@step-12-context-engine` | Context engine setup |
| `@step-13-skillpack-generator` | Generate project skillpack |

### Audit Commands

| Command | Description |
|---------|-------------|
| `@security-audit` | Security vulnerability assessment |
| `@accessibility-audit` | WCAG compliance check |
| `@performance-check` | Performance analysis |
| `@gap-analysis` | PRD coverage analysis |
| `@verify-prd` | PRD implementation scoring |

### Dev Commands

| Command | Description |
|---------|-------------|
| `@implement-prd` | Implement a PRD feature |
| `@plan` | Create implementation plan |
| `@simplify` | Code simplification |

### Ops Commands

| Command | Description |
|---------|-------------|
| `@status` | Project health overview |
| `@continue` | Resume unfinished work |
| `@pr-review` | Pull request review |
| `@sprint-plan` | Sprint planning |
| `@daily-standup` | Daily standup report |

### Deploy Commands

| Command | Description |
|---------|-------------|
| `@ship-check` | Pre-deployment validation |
| `@ship-stage` | Deploy to staging |
| `@ship-prod` | Deploy to production |
| `@client-handoff` | Client delivery documentation |

### Generator Commands

| Command | Description |
|---------|-------------|
| `@scaffold` | Generate project scaffolding |
| `@new-feature` | Create new feature PRD |
| `@test-gen` | Generate tests from PRD |
| `@proposal` | Generate project proposal |

---

## Ralph Loop (Autonomous Implementation)

Ralph Loop enables autonomous task execution:

```bash
# Convert PRDs to JSON backlog
@step-5b-prd-to-json --all-prds

# Run Ralph loop
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

How it works:
1. Converts PRDs to atomic JSON user stories
2. Spawns fresh AI sessions per story
3. Tracks progress in `progress.txt`
4. Auto-commits after each completed story

See [RALPH-MODE.md](docs/RALPH-MODE.md) for details.

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `sigma` | Interactive installation menu |
| `sigma new` | Create new project wizard |
| `sigma retrofit` | Add Sigma to existing project |
| `sigma doctor` | Installation health check |
| `sigma doctor --fix` | Auto-fix common issues |
| `sigma install-skills` | Install all skills (160+) |
| `sigma orchestrate` | Multi-agent orchestration |

---

## Key Principles

### Hormozi Value Equation

Every feature is evaluated using:

```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)
```

### Quality Gates

Each step has verification criteria. Target: **80+/100** score to proceed.

### HITL Checkpoints

Commands pause for human approval at critical decision points. Never skip these.

---

## Documentation

| Document | Description |
|----------|-------------|
| [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) | Complete workflow guide |
| [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) | 39 core skills reference |
| [EXTERNAL-SKILLS.md](docs/EXTERNAL-SKILLS.md) | 120+ external skills |
| [PLATFORMS.md](docs/PLATFORMS.md) | Platform configuration |
| [RALPH-MODE.md](docs/RALPH-MODE.md) | Autonomous implementation |
| [COMMANDS.md](docs/COMMANDS.md) | Full command catalog (122 commands) |
| [GETTING-STARTED.md](docs/GETTING-STARTED.md) | Quick start guide |
| [RETROFIT-GUIDE.md](docs/RETROFIT-GUIDE.md) | Add Sigma to existing projects |
| [ORCHESTRATION.md](docs/ORCHESTRATION.md) | Multi-agent parallel development |

---

## Project Structure

```
sigma-protocol/
├── steps/              # Core 13-step methodology
├── audit/              # Quality assurance commands
├── dev/                # Development workflow
├── ops/                # Operations commands
├── deploy/             # Deployment commands
├── generators/         # Code generators
├── marketing/          # GTM workflow (25 commands)
├── platforms/          # Platform-specific configs
│   ├── claude-code/
│   ├── cursor/
│   ├── opencode/
│   └── factory-droid/
├── scripts/ralph/      # Ralph loop scripts
├── cli/                # CLI entry point
└── docs/               # Documentation
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
