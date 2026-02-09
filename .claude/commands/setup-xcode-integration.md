# Setup Xcode 26.3 Claude Agent Integration

Set up the Xcode 26.3 Claude Agent integration for this project. This symlinks Ball-AI skills and commands to Xcode's ClaudeAgentConfig directory and registers the MCP bridge.

## Prerequisites

- Xcode 26.3+ installed
- `xcrun mcpbridge` available
- Claude Code CLI installed

## Steps

Run the setup script:

```bash
bash scripts/setup-xcode-claude.sh --project-dir="$CLAUDE_PROJECT_DIR"
```

## What This Does

1. **Verifies** Xcode 26.3+ is installed with `xcrun mcpbridge`
2. **Symlinks** `.claude/skills/` to `~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/skills/`
3. **Symlinks** `.claude/commands/` to `~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/commands/`
4. **Registers** the MCP bridge: `claude mcp add --transport stdio xcode -- xcrun mcpbridge`

## After Setup

- Xcode's embedded Claude Agent will have access to all Ball-AI skills and commands
- Claude Code will have access to Xcode's 20 MCP tools (build, test, preview, doc search)
- Both agents share the same `CLAUDE.md` for project conventions

## Troubleshooting

See `docs/setup/XCODE-CLAUDE-SETUP.md` for detailed troubleshooting.
