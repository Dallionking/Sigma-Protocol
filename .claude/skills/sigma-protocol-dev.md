---
name: sigma-protocol-dev
description: "Expert skill for developing and iterating on the Sigma Protocol CLI, orchestration, and AI-native workflows"
version: 1.0.0
triggers:
  - sss protocol
  - sigma cli
  - orchestration development
  - cli development
  - protocol iteration
---

# @sigma-protocol-dev

Expert knowledge for developing, iterating, and extending the Sigma (SSS) Protocol - the AI-native development workflow.

---

## Architecture Overview

```
Sigma-Protocol/
├── cli/
│   ├── sigma-cli.js           # Main CLI entry point
│   ├── lib/
│   │   ├── orchestration/     # Multi-agent orchestration
│   │   │   ├── index.js       # Main orchestration flow
│   │   │   ├── iterm-launcher.js    # iTerm2 native tabs/panes
│   │   │   ├── tmux-launcher.js     # tmux fallback
│   │   │   ├── fork-manager.js      # Fork lifecycle
│   │   │   └── post-message.js      # Inter-agent messaging
│   │   ├── maid.js            # Cleanup utilities
│   │   ├── doctor.js          # Health checks
│   │   └── sandbox/           # E2B/Docker sandboxing
│   └── mcp/                   # MCP server tools
├── platforms/
│   ├── claude-code/
│   │   ├── skills/            # Claude Code skills
│   │   ├── agents/            # Subagent definitions
│   │   └── commands/          # Slash commands
│   ├── cursor/                # Cursor rules (.mdc)
│   └── opencode/              # OpenCode agents
├── src/
│   ├── skills/                # Core skills
│   └── agents/                # Core agent definitions
├── ops/                       # Operational commands
├── dev/                       # Development commands
├── audit/                     # Audit/analysis commands
├── generators/                # Code generation
├── marketing/                 # Marketing content commands
├── steps/                     # 13-step Sigma methodology
└── docs/                      # Documentation
```

---

## Key Development Patterns

### 1. Adding CLI Commands

```javascript
// In sigma-cli.js
program
  .command("new-command")
  .description("Description of the command")
  .option("-o, --option <value>", "Option description")
  .action(async (options) => {
    // Implementation
  });
```

### 2. Orchestration Flow

```javascript
// cli/lib/orchestration/index.js
export async function runOrchestration(options) {
  // 1. Detect PRDs
  const prds = await detectPRDs(targetDir);
  
  // 2. Select agent (claude/opencode)
  const agent = await selectAgent();
  
  // 3. Create worktrees for streams
  const worktrees = await createWorktrees(targetDir, numStreams);
  
  // 4. Generate config
  const config = await generateStreamsConfig(targetDir, prds, worktrees);
  
  // 5. Launch terminals (iTerm2 → tmux → task)
  if (backend === 'iterm') {
    await launchItermTabs({ targetDir, agent, config, forksPerStream, autoStart });
  } else if (backend === 'tmux') {
    await launchPureTmux({ ... });
  }
}
```

### 3. Creating Skills

```markdown
---
name: skill-name
description: "What the skill does"
version: 1.0.0
triggers:
  - keyword1
  - keyword2
---

# @skill-name

Description and knowledge...
```

**Location:** `platforms/claude-code/skills/<skill-name>/SKILL.md`

### 4. Creating Subagents

```markdown
---
name: agent-name
description: "Agent persona and role"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Agent Name

Role description...
```

**Location:** `src/agents/<agent-name>.md`

### 5. Claude Code Hooks

```bash
# Hook location
.claude/hooks/<event>/<hook-name>.sh

# Events: PreToolUse, PostToolUse, Stop, SessionStart, SessionEnd

# Example: Stop hook for auto-reporting
#!/bin/bash
if echo "$CLAUDE_OUTPUT" | grep -qE "(complete|done|finished)"; then
  node /path/to/post-message.js "$FORK_ID" "COMPLETE" "$CLAUDE_OUTPUT"
fi
```

---

## Testing Patterns

### Quick Launch Testing

```bash
# Test iTerm2 tabs (no PRD needed)
sigma orchestrate --quick-iterm=3

# Test full orchestration with auto-start
sigma orchestrate --iterm --streams 2 --forks 2 --auto-start
```

### Development Iteration

```bash
# 1. Make changes to iterm-launcher.js
# 2. Test with quick launch
sigma orchestrate --quick-iterm=2

# 3. Test full flow
sigma orchestrate --iterm --auto-start
```

---

## Inter-Agent Communication

### File-Based Inbox

```
.sigma/orchestration/inbox/
├── orchestrator.json    # Orchestrator inbox
└── (fork messages go to orchestrator inbox)
```

### Message Format

```json
{
  "messages": [
    {
      "from": "stream-a-fork-1",
      "type": "COMPLETE",
      "timestamp": "2024-01-01T12:00:00Z",
      "content": "PRD test-auth implemented"
    }
  ]
}
```

### Claude Code Hooks for Auto-Communication

1. **Fork Stop Hook**: Sends heartbeat + completion reports
2. **Orchestrator Stop Hook**: Polls inbox, triggers gap-analysis

---

## Environment Variables

```bash
# .env for CLI
ANTHROPIC_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
E2B_API_KEY=e2b-...

# .cursor/mcp.json for MCP
{
  "env": {
    "ANTHROPIC_API_KEY": "..."
  }
}
```

---

## Common Development Tasks

### Adding a New Orchestration Backend

1. Create `cli/lib/orchestration/<backend>-launcher.js`
2. Export `launch<Backend>()` function
3. Add to `detectBackend()` in `iterm-launcher.js`
4. Add CLI option in `sigma-cli.js`

### Adding a New Skill

1. Create `platforms/claude-code/skills/<name>/SKILL.md`
2. Add frontmatter with triggers
3. Document the knowledge
4. Test with `@<skill-name>` in Claude Code

### Adding a New Hook Type

1. Define hook in `installHooksInWorktree()`
2. Create generator function `generate<Role>Hook()`
3. Configure in `.claude/hooks/<event>/`

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `cli/sigma-cli.js` | All CLI commands |
| `cli/lib/orchestration/iterm-launcher.js` | iTerm2 native launcher |
| `cli/lib/orchestration/index.js` | Main orchestration flow |
| `platforms/claude-code/skills/*/SKILL.md` | Skill definitions |
| `src/agents/*.md` | Subagent definitions |
| `ops/orchestrate` | `/orchestrate` slash command |

---

## Debugging

### iTerm2 AppleScript Issues

```bash
# Test AppleScript directly
osascript -e 'tell application "iTerm2" to activate'

# Check iTerm2 is running
osascript -e 'tell application "System Events" to (name of processes) contains "iTerm2"'
```

### Orchestration Issues

```bash
# Check worktrees
ls worktrees/

# Check inbox
cat .sigma/orchestration/inbox/orchestrator.json

# Check hooks installed
ls worktrees/stream-a/forks/fork-1/.claude/hooks/
```

---

## Related Skills

- `@terminal-automation` - iTerm2/tmux expertise
- `@taskmaster-integration` - Task Master AI integration
- `@orchestrator-admin` - Orchestrator agent workflow
- `@fork-worker` - Fork agent workflow
