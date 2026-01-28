# Factory Droid Platform Configuration

**Platform:** Factory Droid
**Version:** 2.0
**Status:** Production
**Last Updated:** 2026-01-28

## Overview

Factory Droid is an AI-powered code review and automation platform that integrates with GitHub workflows. Sigma Protocol provides 158+ droids (skills) optimized for the Factory Droid runtime.

## Directory Structure

```
platforms/factory-droid/
├── README.md           # This file
├── commands/           # Factory Droid command definitions
├── droids/             # Droid templates (skill files)
└── skills/             # Additional skill configurations
```

## Configuration

The main configuration file is `/.factory/.droid.yaml`:

```yaml
review:
  auto_review:
    enabled: true
    draft: false
    bot: false
  pr_summary: true
  file_summaries: true
  tips: true
  github_action_repair: true
```

## Factory Droid Updates

### Session & Context Management
- **7M token session support** - Extended context window for complex projects
- **Anchor-point compression** - Intelligent context compression at semantic boundaries
- **Session persistence** - Maintain context across multiple interactions

### Planning & Execution Modes
- **Specification mode for planning** - Structured spec generation before implementation
- **Review mode** - Automated PR review with guidelines
- **Repair mode** - GitHub Action failure diagnosis and repair

### Model Routing
- **`reasoningEffort` field** - Control reasoning depth per task
  - `low` - Quick responses, simple tasks
  - `medium` - Balanced reasoning (default)
  - `high` - Deep analysis, complex architecture

```yaml
# Example droid frontmatter with reasoningEffort
---
name: architecture-review
description: "Deep architecture analysis"
model: claude-opus-4-5-20251101
reasoningEffort: high
tools:
  - Read
  - Grep
  - Glob
---
```

## Droid Template Format

Droids use Markdown files with YAML frontmatter:

```yaml
---
name: droid-name
description: "Droid description"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium  # low | medium | high
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# Droid Name

Content and instructions here...
```

## Available Models

| Model | Use Case | reasoningEffort |
|-------|----------|-----------------|
| `claude-opus-4-5-20251101` | Complex analysis, architecture | `high` |
| `claude-sonnet-4-5-20241022` | General development | `medium` |
| `claude-haiku-3-5-20250114` | Quick tasks, formatting | `low` |
| `inherit` | Use parent config | - |

## Integration with Sigma Protocol

Factory Droid droids are auto-generated from Sigma Protocol skills:

```bash
# Sync skills to Factory Droid format
./scripts/sync-platforms.sh factory-droid

# Or use the ops command
@sync-workspace-commands --platform=factory-droid
```

## Best Practices

1. **Use appropriate reasoningEffort** - Match effort to task complexity
2. **Specify tools explicitly** - Only include tools the droid needs
3. **Use model inheritance** - Set `model: inherit` for default behavior
4. **Keep descriptions concise** - Under 100 characters for UI display

## Resources

- [Factory Droid Documentation](https://docs.factory.ai)
- [Sigma Protocol PLATFORMS.md](../../docs/PLATFORMS.md)
- [Droid Development Guide](https://docs.factory.ai/droids)
