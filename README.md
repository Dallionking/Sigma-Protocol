# SSS Protocol

**Sigma Startup Stack** — A platform-agnostic 13-step product development methodology for AI-assisted development.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Cursor%20%7C%20Claude%20Code%20%7C%20OpenCode-green.svg)](#supported-platforms)

---

## What is SSS Protocol?

SSS Protocol is a **complete product development workflow** that guides AI assistants through ideation, architecture, design, and implementation. It provides:

- **13 structured steps** from idea to deployment
- **Specialist personas** (Venture Studio Partner, Lead Architect, UX Director, etc.)
- **Quality gates** with verification scoring
- **MCP tool integration** for research and validation
- **Human-in-the-loop checkpoints** for critical decisions

## Quick Start

```bash
# Interactive installation
npx sss-protocol install

# Build for specific platform
npx sss-protocol build --platform cursor --target ./my-project

# Check installation status
npx sss-protocol status
```

## Supported Platforms

| Platform | Command Style | Configuration |
|----------|---------------|---------------|
| **Cursor** | `@command-name` | `.cursor/commands/` |
| **Claude Code** | `/command-name` | `.claude/` + `CLAUDE.md` |
| **OpenCode** | `/command-name` | `.opencode/` + `AGENTS.md` |

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
Step 5: Wireframes (optional)
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
Step 12: Context Engine → .cursorrules
    ↓
Step 13: Skillpack Generator (platform-specific)
```

---

## Command Categories

### Core Steps (`steps/`)
The 13-step methodology commands that guide product development.

| Command | Description |
|---------|-------------|
| `@step-1-ideation` | Product Ideation with Hormozi Value Equation |
| `@step-2-architecture` | System Architecture Design |
| `@step-3-ux-design` | UX/UI Design & User Flows |
| `@step-4-flow-tree` | Navigation Flow & Screen Inventory |
| `@step-5-wireframes` | Wireframe Prototypes |
| `@step-6-design-system` | Design System & Tokens |
| `@step-7-interface-states` | Interface State Specifications |
| `@step-8-technical-spec` | Technical Specifications |
| `@step-9-landing-page` | Landing Page Design |
| `@step-10-feature-breakdown` | Feature Breakdown |
| `@step-11-prd-generation` | PRD Generation |
| `@step-12-cursor-rules` | Context Engine Setup |
| `@step-13-skillpack-generator` | Platform-specific Configuration |

### Audit Commands (`audit/`)
Quality assurance and verification.

| Command | Description |
|---------|-------------|
| `@holes` | Pre-implementation gap analysis |
| `@gap-analysis` | Post-implementation verification |
| `@verify-prd` | PRD quality scoring |
| `@ui-healer` | Browser-based UI testing and fixing |
| `@security-audit` | Security vulnerability assessment |
| `@accessibility-audit` | WCAG compliance check |
| `@performance-check` | Performance analysis |

### Dev Commands (`dev/`)
Development workflow.

| Command | Description |
|---------|-------------|
| `@implement-prd` | Implement a PRD feature |
| `@plan` | Create implementation plan |
| `@db-migrate` | Database migration assistance |

### Ops Commands (`ops/`)
Operations and project management.

| Command | Description |
|---------|-------------|
| `@status` | Project status check |
| `@sprint-plan` | Sprint planning |
| `@backlog-groom` | Backlog grooming |
| `@qa-plan` | QA test plan generation |
| `@qa-run` | Execute QA tests |
| `@pr-review` | Pull request review |

### Deploy Commands (`deploy/`)
Deployment and shipping.

| Command | Description |
|---------|-------------|
| `@ship-check` | Pre-deployment validation |
| `@ship-stage` | Deploy to staging |
| `@ship-prod` | Deploy to production |
| `@client-handoff` | Client delivery documentation |

### Generator Commands (`generators/`)
Code and document generators.

| Command | Description |
|---------|-------------|
| `@scaffold` | Generate project scaffolding |
| `@new-feature` | Create new feature structure |
| `@test-gen` | Generate tests |
| `@api-docs-gen` | Generate API documentation |

### Marketing Commands (`marketing/`)
Go-to-market workflow.

| Command | Description |
|---------|-------------|
| `@market-research` | Market research analysis |
| `@customer-avatar` | Customer persona creation |
| `@launch-playbook` | Launch planning |
| `@landing-page-copy` | Landing page copywriting |

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

### MCP Tool Integration

Commands use MCP (Model Context Protocol) tools for:
- **Exa**: Code context and web search
- **Ref**: Documentation lookup
- **Perplexity**: Research queries
- **Browser**: UI testing and validation

---

## Installation

### NPX (Recommended)

```bash
# Interactive installation
npx sss-protocol install
```

### Manual Installation

1. Clone this repository
2. Copy desired command folders to your project's `.cursor/commands/`
3. For Claude Code: Use the CLI to generate `.claude/` configuration
4. For OpenCode: Use the CLI to generate `.opencode/` configuration

---

## Documentation

| Document | Description |
|----------|-------------|
| [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) | Complete workflow documentation |
| [FILE-PATH-REFERENCE.md](docs/FILE-PATH-REFERENCE.md) | Output file locations |
| [QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | Command quick reference |
| [SCORING-SYSTEM.md](docs/SCORING-SYSTEM.md) | Quality scoring details |

---

## Project Structure

```
commands/
├── steps/              # Core 13-step methodology
├── audit/              # Quality assurance commands
├── dev/                # Development workflow
├── ops/                # Operations commands
├── deploy/             # Deployment commands
├── generators/         # Code generators
├── marketing/          # GTM workflow
├── schemas/            # JSON schemas for outputs
├── src/                # Platform-agnostic source
│   ├── agents/         # Agent persona definitions
│   ├── skills/         # Reusable skills
│   └── tools/          # OpenCode custom tools
├── tools/              # CLI and utilities
│   └── sss-cli.js      # NPX entry point
└── boilerplates/       # Starter templates
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with 💜 by the SSS Team**
