# Xcode 26.3 Claude Agent Integration Setup

Set up the Xcode 26.3 Claude Agent integration for Ball-AI so that:
- **Claude Code** can invoke Xcode's MCP tools (build, test, preview, doc search)
- **Xcode's embedded Claude Agent** inherits Ball-AI's full skill and command library

## Prerequisites

| Requirement | How to Check |
|-------------|--------------|
| macOS 15+ | `sw_vers` |
| Xcode 26.3+ | `xcodebuild -version` |
| `xcrun mcpbridge` | `xcrun --find mcpbridge` |
| Claude Code CLI | `claude --version` |
| Node.js 18+ (for XcodeBuildMCP) | `node --version` |

## Automatic Setup (Recommended)

Run the setup script:

```bash
./scripts/setup-xcode-claude.sh
```

Or from Claude Code:

```
/setup-xcode-integration
```

The script is idempotent — safe to run multiple times. Existing Xcode config is backed up before any changes.

## Manual Setup

### 1. Verify Xcode Version

```bash
xcodebuild -version
# Should output: Xcode 26.3 (or higher)

xcrun --find mcpbridge
# Should output: /Applications/Xcode.app/.../mcpbridge
```

If `xcrun mcpbridge` is not found:
```bash
sudo xcode-select --switch /Applications/Xcode.app
```

### 2. Create Xcode ClaudeAgentConfig Directory

```bash
mkdir -p ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig
```

### 3. Symlink Skills and Commands

```bash
# From the project root
ln -sf "$(pwd)/.claude/skills" ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/skills
ln -sf "$(pwd)/.claude/commands" ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/commands
```

### 4. Register MCP Bridge with Claude Code

```bash
claude mcp add --transport stdio xcode -- xcrun mcpbridge
```

### 5. Verify MCP Servers in `.mcp.json`

The project `.mcp.json` should already contain:

```json
{
  "mcpServers": {
    "xcode": {
      "type": "stdio",
      "command": "xcrun",
      "args": ["mcpbridge"]
    },
    "XcodeBuildMCP": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "xcodebuildmcp@beta", "mcp"]
    }
  }
}
```

## Verification

### In Xcode

1. Open Xcode 26.3 and open the Ball-AI project
2. Open Claude Agent panel: **Editor > Claude Agent** (or `Cmd+Shift+A`)
3. Ask: "What skills are available?"
4. Verify it lists Ball-AI skills (e.g., `ball-ai-build`, `xcode-intelligence`)

### In Claude Code

1. Start a Claude Code session in the project
2. Ask: "Build the Ball-AI project using MCP tools"
3. Verify it uses `BuildProject` instead of raw `xcodebuild`

### MCP Tools

Test individual tools:
```
# In Claude Code
"Use DocumentationSearch to look up NavigationStack"
"Use RenderPreview on Views/GameView.swift"
"Use GetSchemes to list available build schemes"
```

## MCP Server Reference

| Server | Command | When Available | Tools |
|--------|---------|----------------|-------|
| `xcode` | `xcrun mcpbridge` | Xcode 26.3 running | 20 native tools (BuildProject, RenderPreview, etc.) |
| `XcodeBuildMCP` | `npx xcodebuildmcp@beta mcp` | Always (headless) | 7 build tools (xcodebuild_build, etc.) |

## Switching Projects

The symlinks point to a specific project. To switch:

```bash
cd /path/to/other-project
./scripts/setup-xcode-claude.sh
```

This updates the symlinks to point to the new project's `.claude/` directory.

## Troubleshooting

### "xcrun mcpbridge not found"

```bash
# Check Xcode version
xcodebuild -version

# Ensure correct Xcode is selected
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

# If wrong, switch:
sudo xcode-select --switch /Applications/Xcode.app
```

### "MCP tools not responding"

```bash
# Ensure Xcode is running (not just installed)
open -a Xcode

# Check for zombie processes
ps aux | grep mcpbridge

# Kill and restart
killall mcpbridge 2>/dev/null
```

### "XcodeBuildMCP fails to start"

```bash
# Check Node.js version
node --version  # Need 18+

# Clear npx cache
npx clear-npx-cache

# Install globally as fallback
npm install -g xcodebuildmcp@beta
```

### "Skills not showing in Xcode Agent"

```bash
# Verify symlinks
ls -la ~/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig/skills
# Should show: skills -> /path/to/project/.claude/skills

# If broken, re-run setup
./scripts/setup-xcode-claude.sh
```

### "Build errors not appearing via MCP"

Use `GetBuildErrors(includeWarnings: true)` after `BuildProject`. If still missing, fall back to verbose shell output:
```bash
xcodebuild -scheme BallAI -sdk iphonesimulator build 2>&1 | xcpretty
```

## Architecture

See `docs/architecture/XCODE-MCP-INTEGRATION.md` for the full ADR documenting:
- Why dual MCP servers (native bridge + headless)
- Why symlink strategy over duplication
- Why shared CLAUDE.md over separate configs
- Risks and trade-offs
