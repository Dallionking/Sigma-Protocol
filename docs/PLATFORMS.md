# Platform Reference Guide

**Version:** 5.1
**Last Updated:** 2026-01-28
**Maintainer:** Sigma Protocol Team

---

## Overview

Sigma Protocol supports multiple AI coding platforms with platform-specific configurations. Each platform has its own directory structure, file formats, and integration patterns.

| Platform | Status | Skills | Commands | Primary Use |
|----------|--------|--------|----------|-------------|
| **Claude Code** | Production | 148 | 122 | Anthropic CLI (Canonical Source) |
| **OpenCode** | Production | 149 | 122 | Open-source alternative |
| **Cursor** | Production | 149 rules | 26 | IDE integration |
| **Factory Droid** | Production | 150+ | 120+ | Enterprise automation |
| **Antigravity** | New | 16+ | 10+ | Universal agent protocol |

---

## Canonical Source

**All skills originate from `.claude/skills/` (flat .md format).**

```
.claude/skills/
├── frontend-design.md       # Canonical skill definition
├── react-performance.md
├── verification-before-completion.md
└── ... (148 skills)
```

Use `./scripts/sync-skills-to-platforms.sh` to sync to all platforms.

---

## Claude Code

**Anthropic's official CLI for Claude.**

### Claude Code v2.1.x Updates

#### Task Management System
- TaskCreate, TaskUpdate, TaskList, TaskGet tools
- Dependency tracking with `blockedBy` and `blocks`
- Status workflow: pending -> in_progress -> completed

#### New Hooks
- `PreToolUse.additionalContext` - Inject context before tools
- `SubagentStart` - Intercept agent launches
- `PreCompact` - Process before context compaction

#### Permission Patterns
- Wildcards: `Bash(git *)`, `Read(src/**)`
- MCP auto-enable: `auto:3` threshold syntax
- Tool prefixes for MCP: `mcp__server__tool`

#### Plugin System
- Location: `.claude/plugins/`
- Format: JavaScript/TypeScript modules
- Events: onStart, onToolUse, onComplete

### Directory Structure

```
platforms/claude-code/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── commands/
│   └── <command-name>.md
└── agents/
    └── <agent-name>.md

# Project integration
.claude/
├── skills/
│   └── <skill-name>.md      # Flat file format (CANONICAL)
├── commands/
│   └── <command-name>.md
├── agents/
│   └── <agent-name>.md
└── settings.json
```

### Skill Format

```yaml
---
name: skill-name
description: "What this skill does"
version: "1.0.0"
source: "@organization"
triggers:
  - keyword1
  - keyword2
---

# Skill Name

Skill content in markdown...
```

### Command Format

```yaml
---
name: command-name
description: "What this command does"
category: "dev|ops|audit|deploy|generators|marketing"
---

# Command Name

Command instructions...
```

### Key Features

- **Tools**: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, Task
- **MCP Support**: Full MCP server integration
- **Subagents**: Spawn specialized agents with Task tool
- **Skills**: Auto-loaded from .claude/skills/

### Configuration

```json
// .claude/settings.json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit", "Bash(npm:*)"]
  },
  "hooks": {
    "preToolCall": "./scripts/pre-tool-hook.sh"
  }
}
```

---

## OpenCode

**Open-source Claude Code alternative.**

### OpenCode v1.1.x Updates

#### Plugin System
- Plugin location: `.opencode/plugins/`
- JavaScript/TypeScript module support
- Event hooks: onStart, onToolUse, onComplete

#### Compaction Hooks
- `PreCompact` - Process before context compaction
- Custom context preservation strategies
- Critical state maintenance during long sessions

#### Enhanced Model Configuration
- Multi-model routing support
- Provider-agnostic configuration
- Custom model endpoints

### Directory Structure

```
platforms/opencode/
├── skill/                   # Note: singular "skill"
│   └── <skill-name>/
│       └── SKILL.md
├── commands/
│   └── <command-name>.md
└── agent/
    └── <agent-name>.md
```

### Differences from Claude Code

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| Skills directory | `skills/` (plural) | `skill/` (singular) |
| Agents directory | `agents/` (plural) | `agent/` (singular) |
| Settings file | `.claude/settings.json` | `.opencode/config.yaml` |
| Default model | Claude | Configurable |

### Skill Format

Same YAML frontmatter as Claude Code:

```yaml
---
name: skill-name
description: "What this skill does"
version: "1.0.0"
source: "@organization"
triggers:
  - keyword1
---
```

### Configuration

```yaml
# .opencode/config.yaml
model: claude-sonnet-4-20250514
skills:
  enabled: true
  path: .opencode/skill/
```

---

## Cursor

**AI-first IDE with rule-based system.**

### Directory Structure

```
platforms/cursor/
└── rules/
    ├── agent-patterns/
    │   └── sigma-<skill-name>.mdc
    ├── architecture/
    ├── auth/
    ├── design/
    ├── development/
    ├── documents/
    ├── marketing/
    ├── mobile/
    ├── payments/
    ├── productivity/
    ├── quality/
    ├── security/
    ├── threejs/
    └── video/
```

### Rule Format (.mdc)

```yaml
---
description: Brief skill description (for Cursor context)
globs:
  - "*.tsx"
  - "*.jsx"
keywords:
  - react
  - component
---

# Condensed Skill Content

Cursor rules are condensed versions of full skills.
Keep under 2000 tokens for optimal context usage.
```

### Key Differences

| Aspect | Claude Code Skills | Cursor Rules |
|--------|-------------------|--------------|
| Format | SKILL.md | .mdc |
| Content | Full detail | Condensed |
| Naming | `skill-name` | `sigma-skill-name.mdc` |
| Location | Flat or nested | Category directories |
| Triggers | YAML frontmatter | `globs` + `keywords` |

### Integration

```bash
# Sync skills to Cursor format
./scripts/sync-skills-to-platforms.sh --platform cursor

# Cursor loads rules from:
.cursor/rules/
project-root/.cursorrules
```

---

## Factory Droid

**Enterprise-grade AI coding agent by Factory AI.**

### Directory Structure

```
platforms/factory-droid/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── droids/                  # Custom subagents
│   └── <droid-name>.md
└── commands/
    └── <command-name>.md

# Project integration
.factory/
├── skills/
├── droids/
├── commands/
└── .droid.yaml
```

### Skill Format

Same YAML frontmatter (fully compatible):

```yaml
---
name: skill-name
description: "What this skill does"
version: "1.0.0"
source: "@organization"
---

# Skill Name

Skill content...
```

### Droid Format (Custom Subagents)

```yaml
---
name: code-reviewer
description: "Reviews diffs for correctness and tests"
model: inherit
tools: ["Read", "LS", "Grep", "Glob"]
---

You are the team's principal reviewer. Given the diff:
- Summarize the intent of change
- Flag correctness risks
- Call out migrations needing coordination

Reply with:
Summary: <one-line>
Findings:
- <issue or No blockers>
```

### Command Format

```yaml
---
description: Send a code review checklist
argument-hint: <branch-name>
---

Please review $ARGUMENTS and summarize:
- Merge blockers
- Test gaps
- Risky areas
```

### AGENTS.md (Ecosystem Standard)

Factory Droid uses AGENTS.md as a cross-platform configuration standard:

```markdown
# AGENTS.md

## Build & Test
npm run build
npm test

## Architecture Overview
Next.js 14+ with App Router...

## Security
Never commit .env files...

## Git Workflows
Always create feature branches...
```

**Works across:** Claude Code, Cursor, Aider, Gemini CLI, Jules, Codex, Zed, Phoenix

### Key Features

| Feature | Description |
|---------|-------------|
| **7M token sessions** | Intelligent context compression |
| **Multi-model support** | Route tasks to optimal models |
| **Droid Army** | Parallel specialized subagents |
| **Enterprise** | SOC-2, air-gapped, on-premise |
| **CI/CD native** | Self-healing builds, auto-review |

### Configuration

```yaml
# .droid.yaml
review:
  auto_review:
    enabled: true
    draft: false
  pr_summary: true
  file_summaries: true
  github_action_repair: true
```

---

## Antigravity

**Universal agent protocol for AI coding assistants.**

Antigravity is a universal skill format designed to work across any AI coding assistant. It uses a standardized SKILL.md format with rich metadata for discoverability and invocation.

### Directory Structure

```
platforms/antigravity/
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── commands/
│   └── README.md
├── examples/
│   └── basic-skill/
│       └── SKILL.md
├── antigravity.yaml
└── README.md
```

### SKILL.md Format

```yaml
---
name: skill-name
description: What this skill does in detail
version: 1.0.0
author: sigma-protocol
tags: [category1, category2, domain]
triggers: [keyword1, action phrase, another trigger]
---

# Skill Name

Full skill content in markdown format.
No condensation - Antigravity uses full skill definitions.

## When to Invoke

- Trigger condition 1
- Trigger condition 2

## Core Workflow

1. Step one
2. Step two
3. Step three

## Examples

Code examples and usage patterns...
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Universal Format** | Works with any AI agent |
| **Rich Metadata** | Tags and triggers for discovery |
| **Full Content** | No condensation required |
| **Folder Structure** | One SKILL.md per folder |
| **Cross-Platform** | Designed for portability |

### Tags vs Triggers

| Metadata | Purpose | Examples |
|----------|---------|----------|
| **tags** | Categorization and search | `frontend`, `testing`, `security` |
| **triggers** | Invocation phrases | `build ui`, `write tests`, `security audit` |

### Differences from Other Platforms

| Aspect | Claude Code | Antigravity |
|--------|-------------|-------------|
| Skill location | `.claude/skills/skill.md` | `skills/skill-name/SKILL.md` |
| Metadata | `triggers` only | `tags` + `triggers` |
| Author field | Optional | Required |
| Content | Full | Full |

### Integration

```bash
# Sync skills to Antigravity format
./scripts/sync-skills-to-platforms.sh --platform antigravity

# Or use the Python transformer directly
python3 scripts/transform-for-antigravity.py \
  --all \
  --input-dir .claude/skills \
  --output-dir platforms/antigravity/skills
```

### Configuration

```yaml
# antigravity.yaml
name: sigma-protocol
version: 5.0.0
description: Sigma Protocol skills for Antigravity
author: sigma-protocol

skills:
  path: ./skills
  format: SKILL.md

triggers:
  auto_invoke: true
  match_threshold: 0.7
```

---

## Platform Parity Matrix

### Skills

| Skill | Claude Code | OpenCode | Cursor | Factory | Antigravity |
|-------|-------------|----------|--------|---------|-------------|
| frontend-design | .md | SKILL.md | .mdc | SKILL.md | SKILL.md |
| react-performance | .md | SKILL.md | .mdc | SKILL.md | SKILL.md |
| verification | .md | SKILL.md | .mdc | SKILL.md | SKILL.md |
| ... (162+ total) | 148 | 149 | 149 | 150+ | 16+ |

### Commands

| Command | Claude Code | OpenCode | Cursor | Factory | Antigravity |
|---------|-------------|----------|--------|---------|-------------|
| step-1-ideation | .md | .md | .mdc | .md | - |
| implement-prd | .md | .md | - | .md | - |
| gap-analysis | .md | .md | - | .md | - |
| ... (122 total) | 122 | 122 | 26 | 120+ | 10+ |

---

## Cross-Platform Sync

### Canonical Source

All skills are authored and maintained in `.claude/skills/` (flat .md format).

### Sync Script

```bash
# Sync all platforms
./scripts/sync-skills-to-platforms.sh

# Preview changes without modifying
./scripts/sync-skills-to-platforms.sh --dry-run

# Sync specific platform
./scripts/sync-skills-to-platforms.sh --platform cursor

# Force overwrite existing
./scripts/sync-skills-to-platforms.sh --force --verbose
```

### Platform-Specific Transformations

| Platform | Transformation | Script |
|----------|----------------|--------|
| OpenCode | Direct copy to folder/SKILL.md | Built-in |
| Cursor | Condense to .mdc (~600 lines) | `condense-for-cursor.py` |
| Factory | Direct copy to folder/SKILL.md | Built-in |
| Antigravity | Add tags/triggers metadata | `transform-for-antigravity.py` |

### Transformation Details

**Cursor Condensation:**
- Removes verbose examples (keeps 1-2)
- Extracts core workflow and checklists
- Adds `globs` and `keywords` frontmatter
- Targets 500-800 lines

**Antigravity Transformation:**
- Extracts/infers tags from content
- Generates trigger keywords from "When to Invoke" sections
- Creates folder structure with SKILL.md
- Preserves full content

### Sync Workflow

```
.claude/skills/*.md (CANONICAL)
         │
         ├──► platforms/opencode/skill/*/SKILL.md (direct)
         │
         ├──► .cursor/rules/sigma-*.mdc (condensed)
         │
         ├──► platforms/factory-droid/skills/*/SKILL.md (direct)
         │
         └──► platforms/antigravity/skills/*/SKILL.md (with tags)
```

---

## Conversion Scripts

### Sync to All Platforms

```bash
# Master sync script
./scripts/sync-skills-to-platforms.sh

# Options:
#   --dry-run         Preview without changes
#   --platform NAME   Sync to single platform
#   --force           Overwrite existing files
#   --verbose         Detailed output
```

### Python Transformers

```bash
# Condense for Cursor
python3 scripts/condense-for-cursor.py \
  --input .claude/skills/frontend-design.md \
  --output .cursor/rules/sigma-frontend-design.mdc

# Or batch process
python3 scripts/condense-for-cursor.py \
  --all \
  --input-dir .claude/skills \
  --output-dir .cursor/rules

# Transform for Antigravity
python3 scripts/transform-for-antigravity.py \
  --input .claude/skills/frontend-design.md \
  --output platforms/antigravity/skills/frontend-design/SKILL.md

# Or batch process
python3 scripts/transform-for-antigravity.py \
  --all \
  --input-dir .claude/skills \
  --output-dir platforms/antigravity/skills
```

### Legacy Scripts

```bash
# Pull skills from platforms to .claude/skills/
./scripts/sync-skills-to-master.sh

# Export Claude Code config to Factory format
./scripts/convert-to-factory.sh
```

---

## Migration Guides

### Claude Code -> Factory Droid

1. Skills: Direct copy (same YAML format)
2. Agents: Convert to droids (add `tools` field)
3. Commands: Direct copy (supports `$ARGUMENTS`)
4. CLAUDE.md -> AGENTS.md (rename, content compatible)

### Cursor -> Claude Code

1. Rules (.mdc): Expand to full SKILL.md
2. Add proper frontmatter (name, version, triggers)
3. Move from category dirs to flat structure

### Any Platform -> Antigravity

1. Run `transform-for-antigravity.py`
2. Review generated tags and triggers
3. Adjust metadata as needed

---

## Related Documentation

- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) - Core skills reference
- [EXTERNAL-SKILLS.md](./EXTERNAL-SKILLS.md) - External skill sources
- [FACTORY-DROID-INTEGRATION.md](./FACTORY-DROID-INTEGRATION.md) - Factory Droid guide
- [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md) - Full methodology
