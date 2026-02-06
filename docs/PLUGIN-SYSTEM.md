# Sigma Protocol Plugin System

The plugin system packages the Sigma Protocol's `.claude/` contents into a distributable format. It is an **alternative distribution channel**, not a replacement for the CLI workflow.

## Overview

The plugin builder collects skills, agents, commands, hooks, and rules from the `.claude/` directory and packages them into `dist/plugin/` with a manifest file (`plugin.json`).

## Building

```bash
# Build with auto-dated version
./scripts/plugin/build-plugin.sh

# Build with specific version
./scripts/plugin/build-plugin.sh 1.0.0

# Dry run (no files written)
DRY_RUN=true ./scripts/plugin/build-plugin.sh
```

## Output Structure

```
dist/plugin/
├── plugin.json          # Manifest with component counts and metadata
├── skills/              # All .claude/skills/*.md files
├── agents/              # All .claude/agents/sigma-*.md files
├── commands/            # All .claude/commands/**/*.md files
├── hooks/               # All .claude/hooks/**/* files
└── rules/               # All .claude/rules/*.md files
```

## Installing in a Project

Copy the plugin contents to your project's `.claude/` directory:

```bash
cp -r dist/plugin/skills/ /path/to/project/.claude/skills/
cp -r dist/plugin/agents/ /path/to/project/.claude/agents/
cp -r dist/plugin/commands/ /path/to/project/.claude/commands/
cp -r dist/plugin/rules/ /path/to/project/.claude/rules/
cp -r dist/plugin/hooks/ /path/to/project/.claude/hooks/
```

## Skill Categories

The manifest tracks three skill categories:

| Category | Flag | Behavior |
|----------|------|----------|
| **A: Manual-Only** | `disable-model-invocation: true` | Must type `/skill-name` explicitly |
| **B: Claude-Invocable** | _(default, no flag)_ | Auto-invokes on context match, shows in `/` menu |
| **C: Background** | `user-invocable: false` | Auto-invokes when relevant, hidden from `/` menu |

## Manifest Schema

See `src/plugin/plugin-schema.json` for the full JSON Schema definition.

## Relationship to CLI Workflow

- The CLI workflow (`claude "Run step 1"`) works unchanged regardless of whether the plugin is installed
- The plugin is a packaging convenience for distributing Sigma Protocol to new projects
- All `.claude/` files remain the source of truth
