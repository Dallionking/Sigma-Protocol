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
[![Version](https://img.shields.io/badge/Version-1.0.0--alpha.2-purple.svg)](CHANGELOG.md)
[![Claude Code](https://img.shields.io/badge/Primary-Claude%20Code-orange.svg)](#supported-platforms)

---

## What's New in 1.0.0-alpha.2

- **Claude Code-first**: Claude Code is the primary platform. All features, skills, and commands are developed and tested here first.
- **Open-source ready**: Cleaned up repo structure, added `CLAUDE.md.example` template, improved documentation.
- **Agent Teams**: Native multi-agent collaboration via Claude Code v2.1.32 `TeammateTool`.
- **189+ commands** and **185+ skills** across the full 13-step workflow.
- **Ralph Loop**: Autonomous PRD-to-implementation pipeline.
- **Platform sync**: Weekly `/platform-sync` keeps secondary platforms up to date.

See [CHANGELOG.md](CHANGELOG.md) for full release history.

---

## What is Sigma Protocol?

Sigma Protocol guides AI assistants through a complete product development workflow - from ideation to deployment. It provides:

- **13 structured steps** from idea to shipping
- **189+ commands** across 7 categories
- **185+ skills** for specialized tasks
- **Quality gates** with verification scoring (target: 80+)
- **Human-in-the-loop checkpoints** for critical decisions
- **Ralph Loop** for autonomous task execution
- **Multi-agent orchestration** for parallel development
- **Platform sync** to stay current with AI coding tools

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dallionking/sigma-protocol.git
cd sigma-protocol
npm install
```

> **Note:** The package is not yet published to npm. Install from source using `git clone`.

### 2. Run the CLI

```bash
# Link the CLI locally
npm link

# Interactive menu
sigma

# Or go directly to project setup
sigma new
```

### 3. Start the Workflow

Open your project in Claude Code and run:

```bash
/step-1-ideation "Your product idea here"
```

The AI will guide you through:
1. Market research and validation
2. Creating MASTER_PRD.md
3. Checkpoints for your approval
4. Next step recommendations

### 4. Continue Through the Steps

```bash
/step-2-architecture    # Design system architecture
/step-3-ux-design       # Plan user experience
/step-4-flow-tree       # Map all screens and flows
/step-5-wireframe-prototypes  # Create wireframes
# ... continue through step 13
```

### Platform-Specific Setup

**Claude Code** (primary):
```bash
sigma install --platform claude-code
# Then open in Claude Code
/step-1-ideation "Your idea"
```

**Codex CLI**:
```bash
sigma install --platform codex
# Then open in Codex
codex --profile sigma-dev
> Run step 1 ideation for "Your idea"
```

See [CODEX-GUIDE.md](docs/CODEX-GUIDE.md) for the full Codex workflow.

### Adding to an Existing Project

**Option 1: Full Retrofit**
```bash
cd your-existing-project
sigma retrofit
```

This will analyze your codebase, create `.claude/` configuration, generate a `CLAUDE.md` from the provided template, and install relevant skills.

**Option 2: Manual Setup**

Copy the configuration to your project:
```bash
# Required: copy .claude/ directory and the CLAUDE.md template
cp -r sigma-protocol/.claude your-project/
cp sigma-protocol/CLAUDE.md.example your-project/CLAUDE.md

# Optional: for Cursor support
cp -r sigma-protocol/.cursor your-project/
```

> **Important:** `CLAUDE.md` is gitignored because it contains project-specific configuration. Copy `CLAUDE.md.example` and customize it for your project.

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

| Platform | Status | Configuration | Skills |
|----------|--------|---------------|--------|
| **Claude Code** | **Primary** | `.claude/` + `CLAUDE.md` | 185 |
| **Codex** | Production | `.codex/` + `AGENTS.md` (GPT-5.3-Codex) | 182 |
| **OpenCode** | Production | `.opencode/` + `AGENTS.md` | 167 |
| **Factory Droid** | Production | `.factory/` + `AGENTS.md` | 163 |
| **Cursor** | Secondary | `.cursor/rules/` | 27 rules |
| **Antigravity** | Experimental | `.agent/` + `SKILL.md` | -- |

Claude Code is the canonical source for all skills and commands. Other platforms receive synced copies via `/platform-sync`.

> **Tip:** Run `/platform-sync` weekly to keep secondary platform skills current.

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

# 2. Run Ralph loop (Claude Code)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code

# 2b. Run Ralph loop (Codex)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json codex
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
sigma [command]

Commands:
  sigma                 Interactive installation menu
  sigma new             Create new project wizard
  sigma retrofit        Add Sigma to existing project
  sigma doctor          Installation health check
  sigma doctor --fix    Auto-fix common issues
  sigma install-skills  Install all skills (varies by platform)
  sigma status          Show workflow status
  sigma search <query>  Search commands and skills
  sigma help            Show all commands

Platform install:
  sigma install --platform claude-code   # Install Claude Code config + skills
  sigma install --platform codex         # Install Codex config + skills
  sigma install --platform opencode      # Install OpenCode config + skills
  sigma doctor                           # Check all platforms
```

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

## Project Structure

```
sigma-protocol/
├── .claude/            # Claude Code configuration (primary)
│   ├── commands/       # All command definitions
│   ├── skills/         # Skill files (canonical source)
│   └── settings.json   # Permissions and hooks
├── .codex/             # Codex configuration
│   ├── config.toml     # Model, profiles, MCP servers
│   ├── rules/          # Execution policy rules (Starlark)
│   └── skills/         # Sigma skills (SKILL.md format)
├── .cursor/            # Cursor configuration (secondary)
│   └── rules/          # Cursor rule files (.mdc)
├── .factory/           # Factory Droid configuration
├── platforms/          # Platform-specific configs
│   ├── claude-code/
│   ├── cursor/
│   ├── opencode/
│   ├── codex/
│   └── factory-droid/
├── templates/
│   ├── steps/          # Canonical step definitions
│   └── boilerplates/   # Project starter templates
├── scripts/ralph/      # Ralph loop scripts
├── cli/                # CLI entry point
├── docs/               # Documentation
├── CLAUDE.md.example   # Template for project CLAUDE.md
└── CONTRIBUTING.md     # Contribution guidelines
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) | Complete workflow guide |
| [FOUNDATION-SKILLS.md](docs/FOUNDATION-SKILLS.md) | 39 Foundation skills |
| [EXTERNAL-SKILLS.md](docs/EXTERNAL-SKILLS.md) | 124 external skills |
| [PLATFORMS.md](docs/PLATFORMS.md) | Platform configuration |
| [CODEX-GUIDE.md](docs/CODEX-GUIDE.md) | Codex CLI setup and workflow |
| [RALPH-MODE.md](docs/RALPH-MODE.md) | Autonomous implementation |
| [COMMANDS.md](docs/COMMANDS.md) | Full command catalog (189 commands) |

---

## Troubleshooting

### MCP Tools Not Available

Some skills reference MCP tools (Firecrawl, EXA, Ref) that require separate setup. If a command fails with "tool not found":

1. Check which MCP servers are configured: look at `.claude/settings.json` under `mcpServers`
2. Install the missing MCP server following its documentation
3. Most commands work without MCP tools -- they provide enhanced research but are not required

### Step Verification Failures

If `/step-verify` scores below 80:

1. Review the specific criteria that failed
2. Re-run the step with the feedback: `/step-N-name --fix`
3. Focus on the lowest-scoring areas first
4. Run `/step-verify` again after fixes

### CLI Not Found After Install

```bash
# Make sure npm link was run
cd sigma-protocol
npm link

# Verify it's available
which sigma
```

### CLAUDE.md Not Found

`CLAUDE.md` is gitignored because it contains project-specific settings. For new projects:

```bash
cp CLAUDE.md.example CLAUDE.md
# Then customize for your project
```

### Platform Skills Out of Sync

```bash
# Re-sync skills to all platforms
./scripts/sync-skills-to-platforms.sh

# Or sync a specific platform
./scripts/sync-skills-to-platforms.sh --platform cursor
```

### Codex Config Not Loading

If Codex ignores your config:

1. Verify config location: `.codex/config.toml`
2. Check for schema errors: `codex --config .codex/config.toml`
3. Ensure `model_reasoning_effort` (not `reasoning_effort`) is used in config

### Codex Rules Not Triggering

1. Rules must use `.rules` extension (Starlark format, not TOML)
2. Check rules location: `.codex/rules/*.rules`
3. Verify with: `codex execpolicy check`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built for AI-Native Development</b><br>
  <a href="https://github.com/dallionking/sigma-protocol">GitHub</a> &bull;
  <a href="docs/WORKFLOW-OVERVIEW.md">Documentation</a> &bull;
  <a href="docs/COMMANDS.md">Commands</a>
</p>
