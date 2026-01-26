# Platform Reference Guide

**Version:** 5.0
**Last Updated:** 2026-01-23
**Maintainer:** Sigma Protocol Team

---

## Overview

Sigma Protocol supports multiple AI coding platforms with platform-specific configurations. Each platform has its own directory structure, file formats, and integration patterns.

| Platform | Status | Skills | Commands | Primary Use |
|----------|--------|--------|----------|-------------|
| **Claude Code** | Production | 148 | 122 | Anthropic CLI |
| **OpenCode** | Production | 149 | 122 | Open-source alternative |
| **Cursor** | Production | 149 rules | 26 | IDE integration |
| **Factory Droid** | New | 50+ | 20+ | Enterprise automation |

---

## Claude Code

**Anthropic's official CLI for Claude.**

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
│   └── <skill-name>.md      # Flat file format
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
npm run build:cursor

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

## Platform Parity Matrix

### Skills

| Skill | Claude Code | OpenCode | Cursor | Factory |
|-------|-------------|----------|--------|---------|
| frontend-design | SKILL.md | SKILL.md | .mdc | SKILL.md |
| api-design-principles | SKILL.md | SKILL.md | .mdc | SKILL.md |
| senior-qa | SKILL.md | SKILL.md | .mdc | SKILL.md |
| ... (162 total) | 148 | 149 | 149 | 50+ |

### Commands

| Command | Claude Code | OpenCode | Cursor | Factory |
|---------|-------------|----------|--------|---------|
| step-1-ideation | .md | .md | - | .md |
| implement-prd | .md | .md | - | .md |
| gap-analysis | .md | .md | - | .md |
| ... (122 total) | 122 | 122 | 26 | 20+ |

---

## Conversion Scripts

### Build All Platforms

```bash
# Rebuild all platform distributions
npm run build:all

# Or individually
npm run build:claude-code
npm run build:opencode
npm run build:cursor
npm run build:factory-droid
```

### Sync Skills to Master

```bash
# Pull skills from platforms to .claude/skills/
./scripts/sync-skills-to-master.sh
```

### Convert to Factory Droid

```bash
# Export Claude Code config to Factory format
./scripts/convert-to-factory.sh
```

---

## Migration Guides

### Claude Code → Factory Droid

1. Skills: Direct copy (same YAML format)
2. Agents: Convert to droids (add `tools` field)
3. Commands: Direct copy (supports `$ARGUMENTS`)
4. CLAUDE.md → AGENTS.md (rename, content compatible)

### Cursor → Claude Code

1. Rules (.mdc): Expand to full SKILL.md
2. Add proper frontmatter (name, version, triggers)
3. Move from category dirs to flat structure

---

## Related Documentation

- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) - Core skills reference
- [EXTERNAL-SKILLS.md](./EXTERNAL-SKILLS.md) - External skill sources
- [FACTORY-DROID-INTEGRATION.md](./FACTORY-DROID-INTEGRATION.md) - Factory Droid guide
- [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md) - Full methodology
