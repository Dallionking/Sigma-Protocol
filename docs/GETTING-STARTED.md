# Getting Started with Sigma Protocol

Welcome to Sigma Protocol - the AI-native development workflow that transforms how you build software.

## What is Sigma Protocol?

Sigma Protocol is a **13-step product development methodology** designed specifically for AI-assisted development. It provides:

- **Structured Workflow** - Clear path from idea to production
- **AI-Native Design** - Built for Cursor, Claude Code, and OpenCode
- **Quality Gates** - Human-in-the-loop checkpoints at every step
- **Living Documentation** - Specs that evolve with your code

Think of it as a conversation framework between you and AI, where each step produces artifacts that inform the next.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org)
- **Git** - [Download from git-scm.com](https://git-scm.com)
- **AI Coding Assistant** - One of:
  - [Cursor](https://cursor.sh) (recommended for beginners)
  - [Claude Code](https://claude.ai/code)
  - [OpenCode](https://opencode.ai)

## Installation

### Global Installation (Recommended)

Install Sigma Protocol globally to use the `sigma` command from anywhere:

```bash
npm install -g sigma-protocol
```

After installation, simply type:

```bash
sigma
```

This launches the interactive menu:

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

### Quick Commands

```bash
sigma                    # Interactive menu
sigma new                # Create new project wizard
sigma retrofit           # Add to existing project
sigma install            # Install commands to current project
sigma doctor             # System health check
sigma tutorial           # Interactive tutorial
sigma orchestrate        # Multi-agent orchestration
```

## Your First Project in 5 Minutes

### 1. Create a New Project

```bash
sigma new
```

Follow the wizard to:
- Name your project
- Choose a boilerplate (Next.js SaaS, Expo Mobile, etc.)
- Select your AI platform (Cursor, Claude Code, OpenCode)
- Optionally describe your product idea

### 2. Open in Your AI IDE

```bash
cd my-project
cursor .  # or: code . / opencode .
```

### 3. Run Step 1: Ideation

In your AI assistant, type:

```
@step-1-ideation Create a task management app that uses AI to prioritize tasks
```

The AI will:
1. Ask clarifying questions about your idea
2. Generate a comprehensive MASTER_PRD.md
3. Use the Hormozi Value Equation for prioritization
4. Create HITL checkpoints for your review

### 4. Continue the Workflow

Each step builds on the previous:

```
@step-2-architecture      # Design system structure
@step-3-ux-design         # Create user experience
@step-4-flow-tree         # Map navigation flows
...
```

Use `@continue` to find your next unfinished task.

## Core Concepts

### The 13 Steps

| Phase | Steps | Purpose |
|-------|-------|---------|
| **Planning** | 1-5 | Define product, architecture, UX, flows, wireframes |
| **Design** | 6-9 | Design system, states, technical spec, landing page |
| **Implementation** | 10-13 | Feature breakdown, PRDs, context engine, skills |

### HITL Checkpoints

Every step includes Human-in-the-Loop checkpoints where the AI pauses for your input:

```
┌─────────────────────────────────────────────┐
│  HITL Checkpoint: Architecture Review       │
├─────────────────────────────────────────────┤
│  Proposed database: PostgreSQL with Prisma  │
│  Reason: Type safety, good DX, scalable     │
│                                             │
│  [1] Approve and continue                   │
│  [2] Modify selection                       │
│  [3] Request alternative analysis           │
└─────────────────────────────────────────────┘
```

**Never skip checkpoints** - they ensure quality and keep you in control.

### Quality Gates

Each step has verification criteria. Target: **80+/100 score**.

Use `@gap-analysis` to verify your implementation against requirements.

## Next Steps

- **[NEW-PROJECT-QUICKSTART.md](NEW-PROJECT-QUICKSTART.md)** - Detailed new project guide
- **[RETROFIT-GUIDE.md](RETROFIT-GUIDE.md)** - Add Sigma to existing projects
- **[ORCHESTRATION.md](ORCHESTRATION.md)** - Multi-agent parallel development
- **[COMMANDS.md](COMMANDS.md)** - Full command reference

## Getting Help

### Interactive Tutorial

```bash
sigma tutorial
```

Learn Sigma concepts step-by-step with the built-in tutorial.

### System Health Check

```bash
sigma doctor
```

Verify your installation and get fix suggestions.

### Documentation

- **GitHub**: [github.com/dallionking/sigma-protocol](https://github.com/dallionking/sigma-protocol)
- **Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `@step-1-ideation` | Start product ideation |
| `@step-2-architecture` | Design architecture |
| `@continue` | Find next task |
| `@gap-analysis` | Verify implementation |
| `@retrofit-analyze` | Analyze existing code |

### CLI Commands

| Command | Description |
|---------|-------------|
| `sigma` | Interactive menu |
| `sigma new` | New project wizard |
| `sigma retrofit` | Add to existing project |
| `sigma doctor` | Health check |
| `sigma orchestrate` | Multi-agent streams |

---

Ready to build something amazing? Start with `sigma new` and let's go! 🚀

