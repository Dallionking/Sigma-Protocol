# Cursor Platform Configuration

**Platform:** Cursor
**Version:** 2.4+
**Status:** Production
**Last Updated:** 2026-01-28

## Overview

Cursor is an AI-powered code editor built on VS Code. Sigma Protocol provides 149+ rules and skills optimized for the Cursor environment, with full MCP tool integration.

## Directory Structure

```
platforms/cursor/
├── README.md           # This file
└── rules/              # Cursor rules (organized by category)
    ├── architecture/
    ├── design/
    ├── development/
    ├── documents/
    ├── marketing/
    ├── productivity/
    └── quality/
```

## Cursor 2.4 Updates

### Subagents
Cursor 2.4 introduces specialized subagents for different tasks:

| Subagent | Purpose | Use Case |
|----------|---------|----------|
| **Explore** | Code exploration and understanding | Reading files, searching codebase |
| **Bash** | Terminal command execution | Running scripts, git operations |
| **Browser** | Web interaction and research | Documentation lookup, API testing |

Subagents can be invoked automatically or explicitly:
```
@explore Find all usages of the UserService class
@bash Run the test suite for the auth module
@browser Check the Stripe API documentation for webhooks
```

### Agent Skills (Open Standard)
Cursor now supports an open standard for agent skills:

- **Skills Directory:** `.cursor/skills/`
- **Format:** Markdown with YAML frontmatter
- **Compatibility:** Cross-platform with Claude Code and OpenCode

```markdown
---
name: my-skill
description: "Skill description"
trigger: "keyword"
---

Skill instructions here...
```

### Rules to Skills Migration

Cursor is transitioning from Rules to Skills:

| Feature | Rules (Legacy) | Skills (New) |
|---------|----------------|--------------|
| Location | `.cursor/rules/` | `.cursor/skills/` |
| Format | MDC/Markdown | Markdown + YAML |
| Triggering | Pattern-based | Explicit/Auto |
| Cross-platform | Cursor-only | Universal |

**Migration Path:**
1. Keep existing rules in `.cursor/rules/`
2. Create new skills in `.cursor/skills/`
3. Cursor automatically loads both
4. Gradually migrate rules to skills

### MCP JSON Configuration

MCP (Model Context Protocol) servers are configured via `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@anthropic/exa-mcp"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    }
  }
}
```

## Configuration

### Settings File (`.cursor/settings.json`)

```json
{
  "agent": {
    "skillsEnabled": true,
    "skillsPath": ".cursor/skills"
  },
  "rules": {
    "enabled": true,
    "path": ".cursor/rules"
  },
  "mcp": {
    "enabled": true,
    "configPath": ".cursor/mcp.json"
  }
}
```

### Project Rules (`.cursorrules`)

Legacy project-wide rules can be placed in `.cursorrules` at the project root. These are loaded automatically.

## Integration with Sigma Protocol

Cursor rules are auto-generated from Sigma Protocol skills:

```bash
# Sync skills to Cursor format
./scripts/sync-platforms.sh cursor

# Or use the ops command
@sync-workspace-commands --platform=cursor
```

## Skill Categories

| Category | Count | Description |
|----------|-------|-------------|
| `architecture/` | 15+ | System design, patterns |
| `design/` | 20+ | UI/UX, design systems |
| `development/` | 40+ | Coding, debugging |
| `documents/` | 15+ | Documentation, specs |
| `marketing/` | 25+ | Marketing, content |
| `productivity/` | 15+ | Workflow, automation |
| `quality/` | 19+ | Testing, audits |

## Best Practices

1. **Use Skills over Rules** - Skills are the future, rules are legacy
2. **Configure MCP servers** - Leverage external tools via MCP
3. **Organize by category** - Keep rules/skills organized in subdirectories
4. **Use explicit triggers** - Define clear trigger keywords for skills
5. **Test cross-platform** - Ensure skills work in Claude Code too

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [MCP Specification](https://modelcontextprotocol.io)
- [Sigma Protocol PLATFORMS.md](../../docs/PLATFORMS.md)
- [Agent Skills Standard](https://cursor.sh/docs/agent-skills)
