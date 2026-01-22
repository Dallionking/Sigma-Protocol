# SSS Protocol - OpenCode Integration Guide

> **Install all SSS commands, skills, and agents globally into OpenCode**

---

## Quick Start

### macOS / Linux

```bash
# Navigate to SSS-Protocol
cd /path/to/SSS-Protocol

# Run installation
./scripts/install-opencode-config.sh
```

### Windows (PowerShell)

```powershell
# Navigate to SSS-Protocol
cd C:\path\to\SSS-Protocol

# Run installation
.\scripts\install-opencode-config.ps1
```

---

## What Gets Installed

### 📍 Installation Location

All files are installed to `~/.config/opencode/` for global availability:

```
~/.config/opencode/
├── agent/              # 8 SSS Agents
│   ├── sigma.md        # Primary orchestrator
│   ├── sss-planner.md
│   ├── sss-implementer.md
│   ├── sss-researcher.md
│   ├── sss-auditor.md
│   ├── sss-marketer.md
│   ├── sss-sisyphus.md
│   └── sss-deployer.md
├── skill/              # 24 Foundation Skills
│   ├── frontend-design/
│   ├── architecture-patterns/
│   ├── hormozi-frameworks/
│   └── ... (21 more)
├── command/            # ~99 Commands
│   ├── steps/          # 17 methodology steps
│   ├── audit/          # 16 audit commands
│   ├── generators/     # 16 generator commands
│   ├── marketing/      # 19 marketing commands
│   ├── ops/            # 22 ops commands
│   ├── deploy/         # 5 deploy commands
│   └── dev/            # 4 dev commands
└── plugin/             # (Reserved for future)
```

---

## Installation Options

### Basic Installation

```bash
./scripts/install-opencode-config.sh
```

### Force Override All

```bash
./scripts/install-opencode-config.sh --force
```

### Preview Without Changes

```bash
./scripts/install-opencode-config.sh --dry-run
```

### Backup Before Override

```bash
./scripts/install-opencode-config.sh --force --backup
```

### Install Specific Components

```bash
# Only skills
./scripts/install-opencode-config.sh --skills-only

# Only agents
./scripts/install-opencode-config.sh --agents-only

# Only commands
./scripts/install-opencode-config.sh --commands-only
```

---

## Using SSS in OpenCode

### Start OpenCode

```bash
cd your-project
opencode
```

### Use Commands

Commands are available with the `/` prefix:

```
# Methodology Steps
/step-1-ideation
/step-2-architecture
/step-9-landing-page

# Audit Commands
/audit/gap-analysis
/audit/security-audit
/audit/tech-debt-audit

# Generators
/generators/scaffold
/generators/new-project
/generators/wireframe

# Marketing
/marketing/offer-architect
/marketing/landing-page-copy
/marketing/email-sequences

# Ops
/ops/sprint-plan
/ops/pr-review
/ops/daily-standup

# Deploy
/deploy/ship-prod
/deploy/ship-stage
```

### Use Agents

Agents are available with the `@` prefix:

| Agent | Purpose | How to Use |
|-------|---------|------------|
| `@sigma` | Primary orchestrator | Full-featured development partner |
| `@sss-planner` | Planning & architecture | Design decisions, roadmaps |
| `@sss-implementer` | Code implementation | Feature development |
| `@sss-researcher` | Research & documentation | Find patterns, APIs, docs |
| `@sss-auditor` | Quality assurance | Code review, security |
| `@sss-marketer` | Marketing content | Landing pages, copy, offers |
| `@sss-sisyphus` | Persistent debugging | Stubborn bug fixes |
| `@sss-deployer` | DevOps | Deployments, CI/CD |

### Example Session

```
> @sigma I want to build a SaaS for project management

Sigma: Great! Let me help you through the SSS methodology.

First, run /step-1-ideation to define your problem and solution space.

> /step-1-ideation

[Ideation process begins...]

> @sss-planner Design the architecture for this project

Planner: Based on the ideation output, here's my recommended architecture...
```

---

## SSS Agents Reference

### Sigma (Primary Agent)

The main orchestrator that coordinates all development workflows.

**Capabilities:**
- Full tool access (read, write, edit, bash, etc.)
- Delegates to specialist subagents
- Follows SSS methodology
- Maintains project context

**When to use:** Always start with `@sigma` for general development tasks.

### SSS Planner (Subagent)

Strategic planning specialist focused on architecture and design.

**Capabilities:**
- Read-only access (analysis, not implementation)
- Creates architecture decision records
- Designs systems and data models
- Builds implementation roadmaps

**When to use:** Complex planning, architecture decisions, trade-off analysis.

### SSS Implementer (Subagent)

Expert code implementation specialist.

**Capabilities:**
- Full write access to files
- Follows project patterns
- Writes tests alongside code
- Uses conventional commits

**When to use:** Feature implementation, refactoring, code modifications.

### SSS Researcher (Subagent)

Research and documentation specialist.

**Capabilities:**
- Read-only access
- Web fetching for documentation
- Codebase exploration
- Pattern discovery

**When to use:** Documentation lookup, API research, codebase exploration.

### SSS Auditor (Subagent)

Code review and quality assurance specialist.

**Capabilities:**
- Read access + test execution
- Security vulnerability scanning
- Code quality analysis
- PRD verification

**When to use:** Code reviews, security audits, quality checks.

### SSS Marketer (Subagent)

Marketing and copywriting specialist using Hormozi frameworks.

**Capabilities:**
- Write access for content files
- Hormozi Value Equation expertise
- Landing page copy
- Email sequences

**When to use:** Landing pages, marketing copy, offer design.

### SSS Sisyphus (Subagent)

Persistent problem-solving specialist.

**Capabilities:**
- Full access with 50 iteration limit
- Never gives up
- Documents all attempts
- Creative problem-solving

**When to use:** Stubborn bugs, complex debugging, when others get stuck.

### SSS Deployer (Subagent)

DevOps and deployment specialist.

**Capabilities:**
- Deployment command access
- CI/CD configuration
- Infrastructure management
- Rollback procedures

**When to use:** Shipping to staging/production, CI/CD setup.

---

## Foundation Skills

The installation includes 24 foundation skills:

| Skill | Purpose |
|-------|---------|
| `frontend-design` | UI/UX implementation |
| `architecture-patterns` | System design |
| `hormozi-frameworks` | Offer design |
| `research` | Information gathering |
| `verification` | Quality assurance |
| `bdd-scenarios` | Behavior-driven development |
| `api-design-principles` | API architecture |
| `quality-gates` | CI/CD quality checks |
| `senior-architect` | High-level design |
| `senior-qa` | Testing strategy |
| `systematic-debugging` | Bug investigation |
| `ux-designer` | User experience |
| `brainstorming` | Idea generation |
| `output-generation` | Content creation |
| `prompt-engineering-patterns` | AI prompting |
| `skill-creator` | Creating new skills |
| `web-artifacts-builder` | Web development |
| `agent-development` | Creating agents |
| `creating-opencode-plugins` | Plugin development |
| `opencode-agent-generator` | Agent scaffolding |
| `remembering-conversations` | Context management |
| `applying-brand-guidelines` | Brand consistency |
| `pptx` | Presentation creation |
| `xlsx` | Spreadsheet generation |

---

## Project-Specific Configuration

After installing the global SSS configuration, you can create project-specific overlays:

### Using Step 13

```
> /step-13-skillpack-generator
```

This creates project-specific skills in `.opencode/skill/` that:
- Build on top of foundation skills
- Include your project's PRD, design system, stack
- Override generic guidance with project-specific decisions

### Manual Project Config

Create `.opencode/` in your project root:

```
your-project/
└── .opencode/
    ├── agent/          # Project-specific agents
    ├── skill/          # Project-specific skills
    └── command/        # Project-specific commands
```

Project-level configurations take precedence over global ones.

---

## Updating

To update to the latest SSS commands and agents:

```bash
# Pull latest SSS-Protocol
cd /path/to/SSS-Protocol
git pull

# Re-run installation (smart update - only changed files)
./scripts/install-opencode-config.sh

# Or force update all files
./scripts/install-opencode-config.sh --force
```

---

## Troubleshooting

### Commands Not Showing Up

1. Verify installation completed:
   ```bash
   ls ~/.config/opencode/command/
   ```

2. Restart OpenCode:
   ```bash
   # Exit current session and restart
   opencode
   ```

### Agents Not Available

1. Check agent files exist:
   ```bash
   ls ~/.config/opencode/agent/
   ```

2. Verify frontmatter is valid YAML

### Permission Errors

```bash
# Make script executable
chmod +x scripts/install-opencode-config.sh

# Run with explicit bash
bash scripts/install-opencode-config.sh
```

### OpenCode Not Installed

```bash
# Install OpenCode first
curl -fsSL https://opencode.ai/install | bash
# or
npm install -g opencode
```

---

## Related Documentation

- [OpenCode Documentation](https://opencode.ai/docs)
- [SSS Methodology Overview](./docs/WORKFLOW-OVERVIEW.md)
- [Foundation Skills Reference](./src/foundation-skills/)
- [Command Reference](./docs/COMMANDS.md)

---

*Last Updated: January 2026*





