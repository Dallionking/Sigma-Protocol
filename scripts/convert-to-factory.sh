#!/bin/bash
# convert-to-factory.sh
# Converts Claude Code configuration to Factory Droid format
# Creates .factory/ directory structure and AGENTS.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source and target directories
CLAUDE_SKILLS="$PROJECT_ROOT/.claude/skills"
CLAUDE_COMMANDS="$PROJECT_ROOT/.claude/commands"
CLAUDE_AGENTS="$PROJECT_ROOT/.claude/agents"
CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"

FACTORY_DIR="$PROJECT_ROOT/.factory"
FACTORY_SKILLS="$FACTORY_DIR/skills"
FACTORY_DROIDS="$FACTORY_DIR/droids"
FACTORY_COMMANDS="$FACTORY_DIR/commands"
AGENTS_MD="$PROJECT_ROOT/AGENTS.md"

# Also copy to platforms directory
PLATFORM_FACTORY="$PROJECT_ROOT/platforms/factory-droid"

echo "=== Sigma Protocol → Factory Droid Converter ==="
echo ""

# Create Factory Droid directories
mkdir -p "$FACTORY_SKILLS"
mkdir -p "$FACTORY_DROIDS"
mkdir -p "$FACTORY_COMMANDS"
mkdir -p "$PLATFORM_FACTORY/skills"
mkdir -p "$PLATFORM_FACTORY/droids"
mkdir -p "$PLATFORM_FACTORY/commands"

# =============================================================================
# Convert Skills
# =============================================================================
# Skills use the same format, just different directory structure
# Factory uses: .factory/skills/<name>/SKILL.md
# Claude uses: .claude/skills/<name>.md

echo "Converting skills..."
skill_count=0

if [[ -d "$CLAUDE_SKILLS" ]]; then
    for skill_file in "$CLAUDE_SKILLS"/*.md; do
        [[ ! -f "$skill_file" ]] && continue

        skill_name=$(basename "$skill_file" .md)

        # Skip internal skills
        case "$skill_name" in
            ralph-loop|ralph-tail|fork-worker|orchestrator-admin)
                continue
                ;;
        esac

        # Create skill directory
        skill_dir="$FACTORY_SKILLS/$skill_name"
        mkdir -p "$skill_dir"

        # Copy skill file
        cp "$skill_file" "$skill_dir/SKILL.md"

        # Also copy to platform directory
        platform_skill_dir="$PLATFORM_FACTORY/skills/$skill_name"
        mkdir -p "$platform_skill_dir"
        cp "$skill_file" "$platform_skill_dir/SKILL.md"

        ((skill_count++))
    done
fi

echo "  Converted: $skill_count skills"

# =============================================================================
# Convert Agents to Droids
# =============================================================================
# Droids need additional fields: model, tools
# Default: model: inherit, tools: ["Read", "LS", "Grep", "Glob"]

echo ""
echo "Converting agents to droids..."
droid_count=0

if [[ -d "$CLAUDE_AGENTS" ]]; then
    for agent_file in "$CLAUDE_AGENTS"/*.md; do
        [[ ! -f "$agent_file" ]] && continue

        agent_name=$(basename "$agent_file" .md)

        # Skip internal agents
        case "$agent_name" in
            ralph-*|fork-*|orchestrator-*)
                continue
                ;;
        esac

        # Read the agent file
        content=$(cat "$agent_file")

        # Check if it already has model/tools fields
        if ! echo "$content" | grep -q "^model:"; then
            # Add model and tools fields after the description line
            # Use Factory Droid official tool names
            content=$(echo "$content" | sed '/^description:/a\
model: inherit\
tools: read-only')
        fi

        # Write to droid file
        echo "$content" > "$FACTORY_DROIDS/$agent_name.md"
        echo "$content" > "$PLATFORM_FACTORY/droids/$agent_name.md"

        ((droid_count++))
    done
fi

echo "  Converted: $droid_count droids"

# =============================================================================
# Convert Commands
# =============================================================================
# Commands use the same format, direct copy

echo ""
echo "Converting commands..."
command_count=0

if [[ -d "$CLAUDE_COMMANDS" ]]; then
    for cmd_file in "$CLAUDE_COMMANDS"/*.md; do
        [[ ! -f "$cmd_file" ]] && continue

        cmd_name=$(basename "$cmd_file")

        cp "$cmd_file" "$FACTORY_COMMANDS/$cmd_name"
        cp "$cmd_file" "$PLATFORM_FACTORY/commands/$cmd_name"

        ((command_count++))
    done
fi

echo "  Converted: $command_count commands"

# =============================================================================
# Create AGENTS.md from CLAUDE.md
# =============================================================================
echo ""
echo "Creating AGENTS.md..."

if [[ -f "$CLAUDE_MD" ]]; then
    # Extract relevant content from CLAUDE.md
    cat > "$AGENTS_MD" << 'AGENTSMD'
# Sigma Protocol - AGENTS.md

> This file follows the ecosystem-wide AGENTS.md standard, compatible with:
> Claude Code, Factory Droid, Cursor, Aider, Gemini CLI, Jules, Codex, Zed, Phoenix

---

## Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Run development server
npm run dev
```

---

## Architecture Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

### Core Workflow
```
Step 0: Environment Setup
Step 1: Ideation → MASTER_PRD.md
Step 1.5: Offer Architecture (if monetized)
Step 2-13: Full development lifecycle
```

### Key Technologies
- TypeScript / JavaScript
- Markdown-based configuration
- Multi-platform support (Claude Code, OpenCode, Cursor, Factory Droid)

---

## Available Commands

### Core Steps
| Command | Description |
|---------|-------------|
| `step-1-ideation` | Product Ideation with Hormozi Value Equation |
| `step-2-architecture` | System Architecture Design |
| `step-5-wireframe-prototypes` | Wireframe Prototypes |
| `step-11-prd-generation` | PRD Generation |
| `implement-prd` | Implement a PRD feature |

### Audit Commands
| Command | Description |
|---------|-------------|
| `security-audit` | Security vulnerability assessment |
| `gap-analysis` | PRD coverage analysis |
| `performance-check` | Performance analysis |

### Ops Commands
| Command | Description |
|---------|-------------|
| `pr-review` | Pull request review |
| `sprint-plan` | Sprint planning |

---

## Conventions & Patterns

### File Organization
```
.factory/
├── skills/           # Reusable capabilities
├── droids/           # Custom subagents
├── commands/         # Slash commands
└── .droid.yaml       # Configuration
```

### Skill Format
```yaml
---
name: skill-name
description: "What this skill does"
version: "1.0.0"
triggers:
  - keyword1
  - keyword2
---

# Skill Content
```

---

## Security

- Never commit `.env` files or secrets
- Use environment variables for sensitive data
- Follow OWASP top 10 guidelines
- Run `security-audit` before deployments

---

## Git Workflows

- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `docs:`
- Squash merge to main
- Run tests before pushing

---

## Gotchas

1. **Skill triggers are case-insensitive** - Keywords match regardless of case
2. **Commands support $ARGUMENTS** - Use for dynamic input
3. **Droids need tools field** - Specify allowed tools explicitly
4. **AGENTS.md overrides CLAUDE.md** - Factory Droid prioritizes AGENTS.md

---

## Related Documentation

- [Sigma Protocol Docs](./docs/)
- [Factory Droid Integration](./docs/FACTORY-DROID-INTEGRATION.md)
- [Platform Reference](./docs/PLATFORMS.md)
AGENTSMD

    echo "  Created: AGENTS.md"
else
    echo "  Skipped: CLAUDE.md not found"
fi

# =============================================================================
# Create .droid.yaml
# =============================================================================
echo ""
echo "Creating .droid.yaml..."

cat > "$FACTORY_DIR/.droid.yaml" << 'DROIDYAML'
# Sigma Protocol - Factory Droid Configuration
# See: https://docs.factory.ai/configuration

review:
  # Auto-review settings for PRs
  auto_review:
    enabled: true
    draft: false
    bot: false
    ignore_title_keywords:
      - "WIP"
      - "DO NOT MERGE"
      - "[skip review]"
    ignore_labels:
      - "droid-skip"
      - "no-review"

  # Review output options
  pr_summary: true
  file_summaries: true
  tips: true

  # CI/CD integration
  github_action_repair: true

  # Custom guidelines (merged with AGENTS.md)
  guidelines:
    - path: "**/*.tsx"
      guideline: "Follow React best practices and use Server Components where possible"
    - path: "**/*.test.*"
      guideline: "Ensure tests are deterministic and isolated"
    - path: "docs/**"
      guideline: "Keep documentation up to date with code changes"

# Model routing (optional)
# models:
#   default: claude-sonnet-4-20250514
#   complex: claude-opus-4-5-20251101
#   quick: claude-haiku-3-5-20250114
DROIDYAML

echo "  Created: .droid.yaml"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=== Conversion Complete ==="
echo ""
echo "Created:"
echo "  .factory/"
echo "    ├── skills/       ($skill_count skills)"
echo "    ├── droids/       ($droid_count droids)"
echo "    ├── commands/     ($command_count commands)"
echo "    └── .droid.yaml"
echo "  AGENTS.md"
echo ""
echo "Platform directory:"
echo "  platforms/factory-droid/"
echo "    ├── skills/       ($skill_count skills)"
echo "    ├── droids/       ($droid_count droids)"
echo "    └── commands/     ($command_count commands)"
echo ""
echo "Next steps:"
echo "  1. Install Factory Droid: npm install -g @anthropic-ai/droid"
echo "  2. Authenticate: droid auth login"
echo "  3. Test: droid chat"
