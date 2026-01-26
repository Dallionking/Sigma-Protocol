# Sigma Protocol

```
  ███████╗██╗ ██████╗ ███╗   ███╗ █████╗
  ██╔════╝██║██╔════╝ ████╗ ████║██╔══██╗
  ███████╗██║██║  ███╗██╔████╔██║███████║
  ╚════██║██║██║   ██║██║╚██╔╝██║██╔══██║
  ███████║██║╚██████╔╝██║ ╚═╝ ██║██║  ██║
  ╚══════╝╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝ PROTOCOL
```

**The AI-Native Development Workflow**

A platform-agnostic 13-step product development methodology for AI-assisted development.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Claude%20Code%20%7C%20Cursor%20%7C%20OpenCode%20%7C%20Factory%20Droid-green.svg)](#supported-platforms)
[![Version](https://img.shields.io/badge/Version-5.0-purple.svg)](#)

---

## What is Sigma Protocol?

Sigma Protocol guides AI assistants through a complete product development workflow - from ideation to deployment. It provides:

- **13 structured steps** from idea to shipping
- **185 commands** across 7 categories
- **163 skills** for specialized tasks
- **Quality gates** with verification scoring (target: 80+)
- **Human-in-the-loop checkpoints** for critical decisions
- **Ralph Loop** for autonomous task execution
- **Multi-agent orchestration** for parallel development

---

## How to Use

### For New Projects

**Step 1: Install Sigma Protocol**
```bash
# Clone the repo
git clone https://github.com/Dallionking/Sigma-Protocol.git
cd Sigma-Protocol

# Install dependencies
npm install

# Run the CLI
node cli/sigma-cli.js
```

**Step 2: Create a New Project**
```bash
# Interactive project wizard
node cli/sigma-cli.js new

# Or manually create project structure
mkdir my-project && cd my-project
node ../Sigma-Protocol/cli/sigma-cli.js retrofit
```

**Step 3: Start the Workflow in Your AI Assistant**

Open your project in Claude Code, Cursor, or OpenCode and run:
```bash
/step-1-ideation "Your product idea here"
```

The AI will guide you through:
1. Market research and validation
2. Creating MASTER_PRD.md
3. Checkpoints for your approval
4. Next step recommendations

**Step 4: Continue Through the Steps**
```bash
/step-2-architecture    # Design system architecture
/step-3-ux-design       # Plan user experience
/step-4-flow-tree       # Map all screens and flows
/step-5-wireframe-prototypes  # Create wireframes
# ... continue through step 13
```

### For Existing Projects

**Option 1: Full Retrofit**
```bash
cd your-existing-project
node /path/to/Sigma-Protocol/cli/sigma-cli.js retrofit
```

This will:
- Analyze your codebase structure
- Create `.claude/` configuration directory
- Generate `CLAUDE.md` with project context
- Install relevant skills

**Option 2: Manual Setup**

Copy these to your project:
```bash
# Required
cp -r Sigma-Protocol/.claude your-project/
cp Sigma-Protocol/CLAUDE.md your-project/

# Optional (for Cursor)
cp -r Sigma-Protocol/.cursor your-project/
```

**Option 3: Start from Any Step**
```bash
# Already have a PRD? Start at architecture
/step-2-architecture

# Have wireframes? Start at design system
/step-6-design-system

# Ready to implement? Generate PRDs
/step-11-prd-generation
```

### Daily Workflow

```bash
# Check project health
/status

# Continue unfinished work
/continue

# Implement a specific feature
/implement-prd PRD-001

# Run quality checks before shipping
/ship-check
```

---

## Supported Platforms

| Platform | Command Style | Configuration | Skills |
|----------|---------------|---------------|--------|
| **Claude Code** | `/command` | `.claude/` + `CLAUDE.md` | 162 |
| **Cursor** | `@command` | `.cursor/rules/` | 149 |
| **OpenCode** | `/command` | `.opencode/` + `AGENTS.md` | 149 |
| **Factory Droid** | `/command` | `.factory/` + `AGENTS.md` | 158 |

---

## The 13-Step Workflow

```
Step 0: Environment Setup ─────────────────────────────────────┐
    │                                                          │
Step 1: Ideation ──────────────────────> MASTER_PRD.md         │
    │                                                          │
Step 1.5: Offer Architecture (if monetized)                    │ PLANNING
    │                                                          │
Step 2: Architecture ──────────────────> ARCHITECTURE.md       │
    │                                                          │
Step 3: UX Design ─────────────────────> UX-DESIGN.md          │
    │                                                          │
Step 4: Flow Tree ─────────────────────> Screen Inventory ─────┘
    │
Step 5: Wireframes ────────────────────> docs/prds/flows/ ─────┐
    │                                                          │
Step 6: Design System ─────────────────> DESIGN-SYSTEM.md      │ DESIGN
    │                                                          │
Step 7: Interface States ──────────────> STATE-SPEC.md         │
    │                                                          │
Step 8: Technical Spec ────────────────> TECHNICAL-SPEC.md ────┘
    │
Step 9: Landing Page (optional) ───────────────────────────────┐
    │                                                          │
Step 10: Feature Breakdown ────────────> FEATURE-BREAKDOWN.md  │ BUILD
    │                                                          │
Step 11: PRD Generation ───────────────> docs/prds/*.md        │
    │                                                          │
Step 12: Context Engine ───────────────> .cursorrules          │
    │                                                          │
Step 13: Skillpack Generator ──────────> Project skills ───────┘
    │
[Ralph Loop] ──────────────────────────> Autonomous Implementation
```

---

## Core Commands

### Step Commands (13)
| Command | Description |
|---------|-------------|
| `/step-1-ideation` | Product ideation with Hormozi Value Equation |
| `/step-2-architecture` | System architecture design |
| `/step-3-ux-design` | UX/UI design & user flows |
| `/step-4-flow-tree` | Navigation flow & screen inventory |
| `/step-5-wireframe-prototypes` | Wireframe prototypes |
| `/step-6-design-system` | Design system & tokens |
| `/step-7-interface-states` | Interface state specifications |
| `/step-8-technical-spec` | Technical specifications |
| `/step-9-landing-page` | Landing page design |
| `/step-10-feature-breakdown` | Feature breakdown |
| `/step-11-prd-generation` | PRD generation |
| `/step-12-context-engine` | Context engine setup |
| `/step-13-skillpack-generator` | Generate project skillpack |

### Quality & Audit Commands
| Command | Description |
|---------|-------------|
| `/step-verify` | Deep verification with 100-point scoring |
| `/security-audit` | Security vulnerability assessment |
| `/accessibility-audit` | WCAG compliance check |
| `/performance-check` | Performance analysis |
| `/gap-analysis` | PRD coverage analysis |

### Development Commands
| Command | Description |
|---------|-------------|
| `/implement-prd` | Implement a PRD feature |
| `/plan` | Create implementation plan |
| `/scaffold` | Generate project scaffolding |
| `/test-gen` | Generate tests from PRD |

### Operations Commands
| Command | Description |
|---------|-------------|
| `/status` | Project health overview |
| `/continue` | Resume unfinished work |
| `/doctor` | System health check |

### Deployment Commands
| Command | Description |
|---------|-------------|
| `/ship-check` | Pre-deployment validation |
| `/ship-stage` | Deploy to staging |
| `/ship-prod` | Deploy to production |

---

## Ralph Loop (Autonomous Implementation)

Ralph Loop enables autonomous task execution:

```bash
# 1. Convert PRDs to JSON backlog
/step-5b-prd-to-json --all-prds

# 2. Run Ralph loop
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

How it works:
1. Converts PRDs to atomic JSON user stories
2. Spawns fresh AI sessions per story
3. Tracks progress in `progress.txt`
4. Auto-commits after each completed story

See [RALPH-MODE.md](docs/RALPH-MODE.md) for details.

---

## CLI Reference

```bash
node cli/sigma-cli.js [command]

Commands:
  (none)              Interactive installation menu
  new                 Create new project wizard
  retrofit            Add Sigma to existing project
  doctor              Installation health check
  doctor --fix        Auto-fix common issues
  install-skills      Install all skills (163)
  status              Show workflow status
  search <query>      Search commands and skills
  help                Show all commands
```

---

## Key Principles

### Hormozi Value Equation
Every feature is evaluated using:
```
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
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
| [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) | 39 Foundation skills |
| [EXTERNAL-SKILLS.md](docs/EXTERNAL-SKILLS.md) | 124 external skills |
| [PLATFORMS.md](docs/PLATFORMS.md) | Platform configuration |
| [RALPH-MODE.md](docs/RALPH-MODE.md) | Autonomous implementation |
| [COMMANDS.md](docs/COMMANDS.md) | Full command catalog (185 commands) |

---

## Project Structure

```
sigma-protocol/
├── .claude/            # Claude Code configuration
│   ├── commands/       # All command definitions
│   ├── skills/         # Skill files
│   └── agents-legacy/  # Deprecated agent files
├── .cursor/            # Cursor configuration
│   └── rules/          # Cursor rule files (.mdc)
├── .factory/           # Factory Droid configuration
├── platforms/          # Platform-specific configs
│   ├── claude-code/
│   ├── cursor/
│   ├── opencode/
│   └── factory-droid/
├── templates/
│   ├── steps/          # Canonical step definitions
│   └── boilerplates/   # Project starter templates
├── scripts/ralph/      # Ralph loop scripts
├── cli/                # CLI entry point
└── docs/               # Documentation
```

---

## Boilerplate Templates

Start new projects with pre-configured templates:

| Template | Description |
|----------|-------------|
| `nextjs-saas` | Full SaaS starter with auth, payments |
| `nextjs-ai` | AI-powered app with Convex |
| `expo-mobile` | React Native mobile app |
| `tanstack-saas` | TanStack Start SaaS |
| `nextjs-portable` | Portable Next.js template |

```bash
# Use a boilerplate
cp -r templates/boilerplates/nextjs-saas my-new-project
cd my-new-project
npm install
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built for AI-Native Development</b><br>
  <a href="https://github.com/Dallionking/Sigma-Protocol">GitHub</a> •
  <a href="docs/WORKFLOW-OVERVIEW.md">Documentation</a> •
  <a href="docs/COMMANDS.md">Commands</a>
</p>
