# OpenCode Platform Configuration

**Version:** 1.1.x
**Last Updated:** 2026-01-28

## Overview

OpenCode is an open-source alternative to Claude Code, providing similar functionality with configurable model support.

## Directory Structure

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

## Configuration

```yaml
# .opencode/config.yaml
model: claude-sonnet-4-20250514
skills:
  enabled: true
  path: .opencode/skill/
```

## Differences from Claude Code

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| Skills directory | `skills/` (plural) | `skill/` (singular) |
| Agents directory | `agents/` (plural) | `agent/` (singular) |
| Settings file | `.claude/settings.json` | `.opencode/config.yaml` |
| Default model | Claude | Configurable |

## OpenCode v1.1.x Updates

### Plugin System
- Plugin location: `.opencode/plugins/`
- JavaScript/TypeScript module support
- Event hooks for custom behavior

### Event Hooks
- `onStart` - Triggered when OpenCode starts
- `onToolUse` - Intercept tool calls
- `onComplete` - Post-completion processing

### Compaction Hooks
- `PreCompact` - Process before context compaction
- Enables custom context preservation strategies
- Useful for maintaining critical state during long sessions

### Enhanced Model Configuration
- Multi-model routing support
- Provider-agnostic configuration
- Custom model endpoints

## Skill Format

Same YAML frontmatter as Claude Code:

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

## Related Documentation

- [PLATFORMS.md](../../docs/PLATFORMS.md) - Full platform comparison
- [FOUNDATION-SKILLS.md](../../docs/FOUNDATION-SKILLS.md) - Available skills
- [WORKFLOW-OVERVIEW.md](../../docs/WORKFLOW-OVERVIEW.md) - Sigma methodology
