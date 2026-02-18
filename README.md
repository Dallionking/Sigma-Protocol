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

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0--alpha.2-purple.svg)](CHANGELOG.md)
[![Claude Code](https://img.shields.io/badge/Primary-Claude%20Code-orange.svg)](#supported-platforms)

---

Sigma Protocol is a 13-step methodology that turns a product idea into implementation-ready specs using AI. You describe what you want to build, walk through structured steps with your AI assistant, and get a complete set of documents -- architecture, design system, PRDs, and a task backlog -- ready for development.

---

## Who Is This For?

**Non-technical founders** -- Get complete product specifications without writing a line of code. Describe your idea in plain English and walk through each step with AI guidance.

**Technical founders** -- A structured methodology that prevents the planning gaps you discover mid-sprint. Every step builds on the last, so nothing falls through the cracks.

**Developers** -- Implementation-ready PRDs with acceptance criteria, technical specs, and a machine-readable task backlog you can feed directly into your AI coding tool.

---

## How It Works

Sigma Protocol organizes product development into 3 phases and 13 steps. Each step produces a specific output document. You run each step as a command (e.g., `/step-1-ideation`) and your AI assistant guides you through it.

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

### PLAN (Steps 0-4): What are we building?

| Step | What It Does | Output |
|------|-------------|--------|
| **Step 0** | Sets up your project environment and installs dependencies | Project scaffold |
| **Step 1** | Explores your idea using the Hormozi Value Equation to validate demand | `MASTER_PRD.md` |
| **Step 1.5** | Designs your pricing, packaging, and offer structure (if monetized) | Offer architecture |
| **Step 2** | Designs system architecture, tech stack, and data models | `ARCHITECTURE.md` |
| **Step 3** | Maps user journeys, interaction patterns, and UI/UX decisions | `UX-DESIGN.md` |
| **Step 4** | Creates a complete screen inventory with navigation flows | Screen inventory |

### DESIGN (Steps 5-8): How does it look and work?

| Step | What It Does | Output |
|------|-------------|--------|
| **Step 5** | Generates wireframe prototypes for every screen | `docs/prds/flows/` |
| **Step 6** | Defines your design tokens, component library, and visual language | `DESIGN-SYSTEM.md` |
| **Step 7** | Specifies every interface state (loading, empty, error, success) | `STATE-SPEC.md` |
| **Step 8** | Writes the full technical specification with API contracts | `TECHNICAL-SPEC.md` |

### BUILD (Steps 9-13): Break it down and implement

| Step | What It Does | Output |
|------|-------------|--------|
| **Step 9** | Designs your landing/marketing page (optional) | Landing page spec |
| **Step 10** | Breaks features into atomic, implementable units | `FEATURE-BREAKDOWN.md` |
| **Step 11** | Generates detailed PRDs with acceptance criteria for each feature | `docs/prds/*.md` |
| **Step 12** | Builds a context engine so AI tools understand your project | `.cursorrules` |
| **Step 13** | Generates a project-specific skillpack for your AI assistant | Project skills |

---

## See It In Action

The [examples/](examples/) directory contains a sample project showing the output of each step. Browse it to see what Sigma Protocol produces before you run it yourself.

---

## Quick Start

### Path A: I have Claude Code

The fastest path. Copy the guide into your skills directory and start building.

```bash
# 1. Add the Sigma guide skill to your project
mkdir -p .claude/skills
curl -sSL https://raw.githubusercontent.com/dallionking/sigma-protocol/main/SIGMA-GUIDE.md \
  -o .claude/skills/sigma-protocol-guide.md

# 2. Tell Claude Code:
#    "Run step 1 ideation for [your product idea]"
```

Claude Code will walk you through each step interactively.

### Path B: I have Codex or Cursor

Same idea, different config directory.

**Codex:**
```bash
mkdir -p .codex/skills
curl -sSL https://raw.githubusercontent.com/dallionking/sigma-protocol/main/SIGMA-GUIDE.md \
  -o .codex/skills/sigma-protocol-guide.md
# Tell Codex: "Run step 1 ideation for [your product idea]"
```

**Cursor:**
```bash
mkdir -p .cursor/rules
curl -sSL https://raw.githubusercontent.com/dallionking/sigma-protocol/main/SIGMA-GUIDE.md \
  -o .cursor/rules/sigma-protocol-guide.mdc
# Tell Cursor: "Run step 1 ideation for [your product idea]"
```

### Path C: Manual Setup (No CLI)

You don't need a CLI to use Sigma Protocol. Just read the step files directly.

```bash
# 1. Clone the repo for reference
git clone https://github.com/dallionking/sigma-protocol.git

# 2. Copy SIGMA-GUIDE.md into your project
cp sigma-protocol/SIGMA-GUIDE.md your-project/.claude/skills/

# 3. Read the step files in steps/ for the full methodology
#    Then tell your AI: "Run step 1 ideation for [your product idea]"
```

---

## Supported Platforms

| Platform | Status | Configuration | Notes |
|----------|--------|---------------|-------|
| **Claude Code** | **Primary** | `.claude/` + `CLAUDE.md` | All features developed and tested here first |
| **Codex** | Production | `.codex/` + `AGENTS.md` | GPT-5.3-Codex support |
| **OpenCode** | Production | `.opencode/` + `AGENTS.md` | Full skill support |
| **Factory Droid** | Production | `.factory/` + `AGENTS.md` | Full skill support |
| **Cursor** | Secondary | `.cursor/rules/` | Rule-based integration |

---

## Core Commands

### Step Commands

| Command | Description |
|---------|-------------|
| `/step-1-ideation` | Product ideation with Hormozi Value Equation |
| `/step-2-architecture` | System architecture design |
| `/step-3-ux-design` | UX/UI design and user flows |
| `/step-4-flow-tree` | Navigation flow and screen inventory |
| `/step-5-wireframe-prototypes` | Wireframe prototypes |
| `/step-6-design-system` | Design system and tokens |
| `/step-7-interface-states` | Interface state specifications |
| `/step-8-technical-spec` | Technical specifications |
| `/step-9-landing-page` | Landing page design |
| `/step-10-feature-breakdown` | Feature breakdown |
| `/step-11-prd-generation` | PRD generation |
| `/step-12-context-engine` | Context engine setup |
| `/step-13-skillpack-generator` | Generate project skillpack |

### Quality and Audit

| Command | Description |
|---------|-------------|
| `/step-verify` | Deep verification with 100-point scoring |
| `/security-audit` | Security vulnerability assessment |
| `/accessibility-audit` | WCAG compliance check |
| `/performance-check` | Performance analysis |
| `/gap-analysis` | PRD coverage analysis |

### Development

| Command | Description |
|---------|-------------|
| `/implement-prd` | Implement a PRD feature |
| `/plan` | Create implementation plan |
| `/scaffold` | Generate project scaffolding |

### Operations

| Command | Description |
|---------|-------------|
| `/status` | Project health overview |
| `/continue` | Resume unfinished work |
| `/doctor` | System health check |
| `/ship-check` | Pre-deployment validation |

---

## Ralph Loop (Autonomous Implementation)

Ralph Loop converts your PRDs into a machine-readable JSON backlog and spawns fresh AI sessions to implement each user story autonomously. It works in two modes:

- **Prototype mode** (after Step 5): Quick prototype from wireframe PRDs
- **Implementation mode** (after Step 11): Full implementation from detailed PRDs

```bash
# 1. Convert PRDs to JSON backlog
/prd-json --mode=prototype    # or --mode=implementation

# 2. Run Ralph loop (Claude Code)
./ralph/sigma-ralph.sh --workspace=. --mode=prototype

# 2b. Run Ralph loop (Codex)
./ralph/sigma-ralph.sh --workspace=. --mode=prototype --platform=codex
```

How it works:
1. Converts PRDs to atomic JSON user stories
2. Spawns a fresh AI session per story
3. Tracks progress in `progress.txt`
4. Auto-commits after each completed story

See [ralph/README.md](ralph/README.md) for full setup and configuration.

---

## Example Output

After running all 13 steps, your project will contain:

- `MASTER_PRD.md` -- Your validated product vision with value proposition
- `ARCHITECTURE.md` -- System architecture, tech stack, and data models
- `UX-DESIGN.md` -- User journeys and interaction patterns
- `DESIGN-SYSTEM.md` -- Design tokens, components, and visual language
- `STATE-SPEC.md` -- Every interface state mapped out
- `TECHNICAL-SPEC.md` -- API contracts, data flows, and integration specs
- `FEATURE-BREAKDOWN.md` -- Atomic feature list ready for sprint planning
- `docs/prds/*.md` -- Individual PRDs with acceptance criteria per feature

Browse the [examples/](examples/) directory for a complete sample.

---

## Key Principles

### Hormozi Value Equation

Every feature is evaluated using:
```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)
```

Features that increase the numerator or decrease the denominator ship first. Everything else goes to the backlog.

### Quality Gates

Each step has verification criteria scored out of 100. Target **80+** to proceed to the next step. Run `/step-verify` at any point to check your score and get specific feedback on what to improve.

### HITL Checkpoints

Commands pause for human approval at critical decision points -- architecture choices, scope changes, and deployment. These checkpoints exist to keep you in control. Never skip them.

---

## Documentation

| Document | Description |
|----------|-------------|
| [SIGMA-GUIDE.md](SIGMA-GUIDE.md) | All-in-one prompt file for AI assistants |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Step-by-step setup guide |
| [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md) | Deep dive into the methodology |
| [docs/WORKFLOW-OVERVIEW.md](docs/WORKFLOW-OVERVIEW.md) | Complete workflow reference |
| [docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md) | Command cheat sheet |
| [ralph/README.md](ralph/README.md) | Ralph Loop autonomous implementation |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

## License

MIT License -- see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built for AI-Native Development</b><br>
  <a href="https://github.com/dallionking/sigma-protocol">GitHub</a> &bull;
  <a href="docs/GETTING-STARTED.md">Get Started</a> &bull;
  <a href="docs/HOW-IT-WORKS.md">How It Works</a>
</p>
