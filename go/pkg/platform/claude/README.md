# Claude Code Platform Builder

Generates `.claude/` directory structure for Claude Code v2.1.x+ with settings.json, commands, agents, skills, rules, and hooks.

## Overview

Claude Code is the canonical source platform with the richest feature set:
- Recursive skill reading from `.claude/skills/`
- Agent teams with tool restrictions and memory scopes
- Path-scoped rules
- Hook system integration
- MCP support

## Usage

```go
import (
	"context"
	"github.com/dallionking/sigma-protocol/pkg/platform"
	_ "github.com/dallionking/sigma-protocol/pkg/platform/claude"
)

func main() {
	// Get the builder from the registry
	builder := platform.DefaultRegistry.Get("claude")

	// Build the platform (typically src == dest for in-place builds)
	err := builder.Build(context.Background(), "/path/to/project", "/path/to/project")
	if err != nil {
		// Handle error
	}

	// Validate the generated structure
	result, err := builder.Validate("/path/to/project")
	if err != nil {
		// Handle error
	}

	if !result.Valid {
		// Handle validation errors
		for _, err := range result.Errors {
			fmt.Printf("Error: %s\n", err.Message)
		}
	}

	// Get metrics
	metrics := builder.GetMetrics()
	fmt.Printf("Platform: %s\n", metrics.Platform)
	fmt.Printf("Skills: %d\n", metrics.Skills)
	fmt.Printf("Commands: %d\n", metrics.Commands)
	fmt.Printf("Agents: %d\n", metrics.Agents)
}
```

## Generated Structure

```
.claude/
├── settings.json           # Platform configuration with env vars, permissions, hooks
├── commands/               # Slash commands (copied from source)
│   ├── step-1-ideation.md
│   └── ...
├── agents/                 # Agent definitions (copied from source)
│   ├── sigma-orchestrator.md
│   └── ...
├── skills/                 # Canonical skills source (verified, not copied)
│   ├── frontend-design.md
│   └── ...
└── rules/                  # Path-scoped rules (copied from source)
    ├── mcp-tools.md
    └── ...
```

## settings.json Structure

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "ENABLE_TOOL_SEARCH": "auto:5",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "64000",
    "CLAUDE_CODE_AUTOCOMPACT_PCT_OVERRIDE": "85",
    "CLAUDE_CODE_EFFORT_LEVEL": "high",
    "SLASH_COMMAND_TOOL_CHAR_BUDGET": "500000"
  },
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Read(src/**)",
      "Bash(xcrun mcpbridge*)"
    ],
    "mcpAutoEnable": "auto:3"
  },
  "hooks": {
    "SessionStart": [...],
    "PostToolUse": [...]
  }
}
```

## Command Frontmatter

```yaml
---
description: "What this command does"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
category: "dev|ops|audit|deploy|generators|marketing"
hidden: false
---
```

## Agent Frontmatter

```yaml
---
name: agent-name
description: "Agent description"
tools:
  - Read
  - Write
  - Edit
  - Bash
model: sonnet|opus|haiku|gpt-4o|gpt-5.3|gpt-5.3-codex|inherit
permissionMode: acceptEdits|prompt|auto|default
skills:
  - skill-name-1
  - skill-name-2
memory: project|local|user
---
```

### Valid Models
- `sonnet` - Claude Sonnet
- `opus` - Claude Opus
- `haiku` - Claude Haiku
- `gpt-4o` - GPT-4o
- `gpt-5.3` - GPT-5.3
- `gpt-5.3-codex` - GPT-5.3 Codex
- `inherit` - Inherit from parent

### Valid Tools
**Core tools:** Read, Write, Edit, Bash, Glob, Grep, LSP

**Web tools:** WebFetch, WebSearch

**Collaboration tools:** Task, TaskCreate, TaskUpdate, TaskList, TaskGet, TeammateTool, SendMessage

**MCP tools:** Format `mcp__<server>__<tool>` (e.g., `mcp__firecrawl__scrape`)

### Memory Scopes
- `project` - Stored in `.claude/agent-memory/`, committed to git, shared across team
- `local` - Stored in `.claude/agent-memory-local/`, gitignored (sensitive data)
- `user` - Stored in `~/.claude/agent-memory/`, spans all repositories

## Rule Frontmatter (Optional)

```yaml
---
paths:
  - "src/**/*.ts"
  - "app/**/*.tsx"
---
```

Rules without paths apply globally. Rules with paths only activate when matching files are open.

## Hook Integration

The builder integrates with the hook management system (`pkg/hooks`) to automatically register hooks in settings.json.

Supported hook events:
- `SessionStart` - Runs when session starts
- `SessionEnd` - Runs when session ends
- `PreToolUse` - Runs before tool execution
- `PostToolUse` - Runs after tool execution
- `Stop` - Runs when agent stops
- `SubagentStart` - Runs when subagent starts
- `TaskCompleted` - Runs when task completes
- `TeammateIdle` - Runs when teammate goes idle

## Validation

The builder validates:
- settings.json JSON syntax and schema
- Command frontmatter YAML syntax and required fields
- Agent frontmatter YAML syntax, required fields, valid models/tools/scopes
- Skills directory exists and contains .md files
- Rule frontmatter YAML syntax (if present)

## Testing

Run tests with:
```bash
go test ./pkg/platform/claude/...
```

Test coverage:
```bash
go test -cover ./pkg/platform/claude/...
```

## Implementation Notes

- Skills are NOT copied during build - Claude Code reads them directly from `.claude/skills/`
- When building in-place (src == dest), files are not copied, only validated
- The builder is registered automatically via `init()` function
- All YAML parsing uses `gopkg.in/yaml.v3`
- File permissions are preserved during copying (0644 for files, 0755 for directories)
