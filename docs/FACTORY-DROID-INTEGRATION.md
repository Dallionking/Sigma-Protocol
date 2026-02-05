# Factory Droid Integration Guide

**Version:** 1.0.0-alpha.1
**Last Updated:** 2026-01-23
**Status:** New Platform Support

---

## Overview

[Factory Droid](https://factory.ai) is an enterprise-grade AI coding agent that integrates seamlessly with Sigma Protocol. This guide covers setup, configuration mapping, and migration from Claude Code.

### Why Factory Droid?

| Feature | Benefit |
|---------|---------|
| **7M token sessions** | Handle massive codebases with intelligent compression |
| **Multi-model routing** | Use optimal models for different tasks |
| **Droid Army** | Parallel specialized agents for complex work |
| **Enterprise security** | SOC-2 compliant, air-gapped deployment |
| **CI/CD native** | Self-healing builds, automated code review |

---

## Quick Start

### 1. Install Factory Droid CLI

```bash
# Install via npm
npm install -g @anthropic-ai/droid

# Or via Homebrew
brew install factory-ai/tap/droid

# Verify installation
droid --version
```

### 2. Initialize Project

```bash
# In your Sigma Protocol project
droid init

# This creates:
# .factory/
# ├── skills/
# ├── droids/
# ├── commands/
# └── .droid.yaml
```

### 3. Convert from Claude Code

```bash
# Run the Sigma converter script
./scripts/convert-to-factory.sh

# Or manually:
cp -r .claude/skills/* .factory/skills/
# Agents need minor conversion (see below)
```

### 4. Create AGENTS.md

```bash
# AGENTS.md is the ecosystem-wide config standard
cat > AGENTS.md << 'EOF'
# Project Configuration

## Build & Test
npm run build
npm test

## Architecture
Next.js 14+ with App Router, TypeScript, Tailwind CSS

## Conventions
- Use Server Actions for mutations
- Prefer Server Components
- Follow existing patterns in codebase

## Security
- Never commit .env files
- Use environment variables for secrets
EOF
```

---

## Configuration Mapping

### Skills

**Claude Code** and **Factory Droid** use identical skill formats:

```yaml
# .claude/skills/frontend-design.md
# .factory/skills/frontend-design/SKILL.md
---
name: frontend-design
description: "Create distinctive, production-grade UI"
version: "1.0.0"
source: "@sigma-protocol"
triggers:
  - implement-prd
  - ui-component
---

# Frontend Design

Skill content...
```

**Migration:** Direct copy or symlink.

### Agents → Droids

Claude Code agents need minor conversion to Factory droids:

**Claude Code Agent:**
```yaml
---
name: code-reviewer
description: "Reviews code changes"
---

You are a code reviewer...
```

**Factory Droid:**
```yaml
---
name: code-reviewer
description: "Reviews code changes"
model: inherit           # Added: model selection
tools: ["Read", "Grep"]  # Added: tool access control
---

You are a code reviewer...
```

### Commands

**Claude Code** and **Factory Droid** commands are compatible:

```yaml
# .claude/commands/gap-analysis.md
# .factory/commands/gap-analysis.md
---
description: Analyze implementation gaps
argument-hint: <prd-file>
---

Analyze $ARGUMENTS for gaps against requirements...
```

**Note:** Factory uses `$ARGUMENTS` for command arguments (same as Claude Code).

### Settings

**Claude Code (.claude/settings.json):**
```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"]
  }
}
```

**Factory Droid (.droid.yaml):**
```yaml
review:
  auto_review:
    enabled: true
  pr_summary: true
  github_action_repair: true
```

---

## Sigma Protocol Integration

### Workflow Steps with Factory

| Step | Claude Code | Factory Droid |
|------|-------------|---------------|
| Step 1: Ideation | `@step-1-ideation` | `droid run step-1-ideation` |
| Step 5: Wireframes | `@step-5-wireframe-prototypes` | `droid run step-5-wireframe-prototypes` |
| Step 11: PRDs | `@step-11-prd-generation` | `droid run step-11-prd-generation` |
| Implementation | Ralph Loop | Droid Exec |

### Ralph Loop Equivalent

Factory Droid has **Droid Exec** for headless automation (non-interactive one-shot execution):

```bash
# Claude Code Ralph Loop
./scripts/ralph/sigma-ralph.sh . docs/ralph/prd.json claude-code

# Factory Droid equivalent (process PRDs in sequence)
for prd in docs/prds/*.md; do
  droid exec -f "$prd" --auto medium
done

# Or process in parallel with GNU parallel/xargs
find docs/prds -name "*.md" | xargs -P 4 -I {} droid exec -f {} --auto low
```

### Autonomy Levels

| Level | Permissions | Use Case |
|-------|-------------|----------|
| Default (no flag) | Read-only | Safe analysis, planning |
| `--auto low` | File creation/editing | Documentation, code formatting |
| `--auto medium` | Package installs, git commit | Development tasks |
| `--auto high` | Git push, deployments | CI/CD pipelines |

### Multi-Agent Orchestration

**Claude Code:**
```bash
@orchestrate --streams 4 --tui mprocs
```

**Factory Droid (parallel PRD processing):**
```bash
# Process multiple PRDs in parallel using shell job control
for prd in docs/prds/swarm-1/*.md; do
  droid exec -f "$prd" --auto medium &
done
wait  # Wait for all background jobs
```

---

## Creating Custom Droids

### Basic Droid

```yaml
# .factory/droids/security-sweeper.md
---
name: security-sweeper
description: "Scans code for security vulnerabilities"
model: inherit
tools: read-only
---

You are a security analyst. For each file:

1. Check for hardcoded secrets
2. Identify SQL injection risks
3. Flag XSS vulnerabilities
4. Review authentication flows

Report findings in SARIF format.
```

### Specialized Model with Reasoning

```yaml
# .factory/droids/architect.md
---
name: architect
description: "Designs system architecture"
model: claude-opus-4-5-20251101  # Specific model
reasoningEffort: high             # For reasoning models
tools: ["Read", "Grep", "Glob", "WebSearch"]
---

You are a principal architect...
```

### Tool Categories (Official)

Use category strings for convenience, or explicit tool arrays for fine-grained control:

| Category | Tool IDs | Purpose |
|----------|----------|---------|
| `read-only` | Read, LS, Grep, Glob | Safe analysis and file exploration |
| `edit` | Create, Edit, ApplyPatch | Code generation and modifications |
| `execute` | Execute | Shell command execution |
| `web` | WebSearch, FetchUrl | Internet research and content |
| `mcp` | (dynamic) | Model Context Protocol tools |

```yaml
# Use category string
tools: read-only

# Or explicit array
tools: ["Read", "Grep", "Glob", "WebSearch"]
```

**Note:** `TodoWrite` is automatically included for all droids.

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/droid-review.yml
name: Droid Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: factory-ai/droid-action@v1
        with:
          command: review
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Auto-Review Configuration

```yaml
# .droid.yaml
review:
  auto_review:
    enabled: true
    draft: false
    bot: false
    ignore_title_keywords:
      - "WIP"
      - "DO NOT MERGE"
    ignore_labels:
      - "droid-skip"
  pr_summary: true
  file_summaries: true
  tips: true
  github_action_repair: true  # Auto-fix failing CI
```

---

## AGENTS.md Standard

AGENTS.md is the ecosystem-wide configuration standard that works across:

- Claude Code
- Factory Droid
- Cursor
- Aider
- Gemini CLI
- Jules (Google)
- Codex (OpenAI)
- Zed
- Phoenix

### Recommended Sections

```markdown
# AGENTS.md

## Build & Test
Commands to build and test the project.

## Architecture Overview
High-level system architecture.

## Security
Security requirements and constraints.

## Git Workflows
Branch naming, commit conventions.

## Conventions & Patterns
Code style, file organization.

## External Services
APIs, databases, third-party services.

## Gotchas
Known issues, workarounds.
```

### Discovery Order

1. `./AGENTS.md` (current directory)
2. Parent directories up to repo root
3. Subfolders being edited
4. Personal: `~/.factory/AGENTS.md`

---

## Migration Checklist

### From Claude Code to Factory Droid

- [ ] Install Factory Droid CLI (`npm install -g @anthropic-ai/droid`)
- [ ] Initialize project (`droid init`)
- [ ] Copy skills: `.claude/skills/*` → `.factory/skills/`
- [ ] Convert agents to droids (add `model` and `tools` fields)
- [ ] Copy commands: `.claude/commands/*` → `.factory/commands/`
- [ ] Create AGENTS.md from CLAUDE.md content
- [ ] Configure .droid.yaml for CI/CD
- [ ] Test: `droid chat` to verify setup

### Verification

```bash
# List available skills
droid skills list

# List custom droids
droid droids list

# Test a command
droid run gap-analysis docs/prds/feature-x.md

# Run code review
droid review --pr 123
```

---

## Troubleshooting

### Skills Not Loading

```bash
# Check skill directory
ls -la .factory/skills/

# Verify frontmatter
head -20 .factory/skills/frontend-design/SKILL.md

# Rebuild skill index
droid skills refresh
```

### Droid Not Found

```bash
# Check droid directory
ls -la .factory/droids/

# Verify droid frontmatter
head -20 .factory/droids/my-droid.md

# List available droids
droid droids list
```

### Model Access Issues

```bash
# Check authentication
droid auth status

# Re-authenticate
droid auth login
```

---

## Ralph Loop on Factory Droid

The Sigma Protocol Ralph Loop can be adapted for Factory Droid using Droid Exec:

### Option 1: Sequential PRD Processing

```bash
#!/bin/bash
# ralph-droid.sh - Process PRDs sequentially with Droid Exec

PRD_JSON="docs/ralph/prd.json"

# Read PRD IDs from JSON backlog
for prd_id in $(jq -r '.prds[].id' "$PRD_JSON"); do
  prd_file="docs/prds/${prd_id}.md"

  echo "Processing: $prd_id"
  droid exec -f "$prd_file" --auto medium --cwd .

  # Check exit code
  if [ $? -ne 0 ]; then
    echo "Failed: $prd_id"
    exit 1
  fi
done
```

### Option 2: Parallel Processing (GNU xargs)

```bash
#!/bin/bash
# ralph-droid-parallel.sh - Process PRDs in parallel

find docs/prds -name "*.md" -print0 | \
  xargs -0 -P 4 -I {} droid exec -f {} --auto medium
```

### Option 3: CI/CD Integration

```yaml
# .github/workflows/ralph-droid.yml
name: Ralph Loop (Factory Droid)

on:
  workflow_dispatch:
    inputs:
      swarm_id:
        description: 'Swarm number to process'
        required: true
        default: '1'

jobs:
  implement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Factory Droid
        run: curl -fsSL https://app.factory.ai/cli | sh

      - name: Process Swarm PRDs
        env:
          FACTORY_API_KEY: ${{ secrets.FACTORY_API_KEY }}
        run: |
          for prd in docs/prds/swarm-${{ inputs.swarm_id }}/*.md; do
            droid exec -f "$prd" --auto medium
          done
```

### Key Differences from Claude Code Ralph

| Feature | Claude Code Ralph | Factory Droid |
|---------|-------------------|---------------|
| Execution | Shell script + JSON backlog | `droid exec` command |
| Parallelism | tmux/iTerm panes | GNU xargs or shell jobs |
| Autonomy | Permission prompts | `--auto` levels |
| Output | Stream logs | `--output-format json/stream-json` |
| Resume | Checkpoint files | Session continuation |

---

## Related Documentation

- [PLATFORMS.md](./PLATFORMS.md) - All platform configurations
- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) - Core skills reference
- [RALPH-MODE.md](./RALPH-MODE.md) - Autonomous implementation
- [Factory Droid Docs](https://docs.factory.ai) - Official documentation
