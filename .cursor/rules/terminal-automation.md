---
name: terminal-automation
description: "Expert skill for iTerm2 AppleScript, tmux automation, and multi-terminal orchestration"
version: 1.0.0
triggers:
  - iterm2
  - tmux
  - applescript
  - terminal automation
  - panes
  - tabs
  - osascript
  - multi-agent terminal
---

# @terminal-automation

Expert knowledge for terminal multiplexing, iTerm2 AppleScript automation, and multi-agent terminal orchestration.

---

## Expertise Areas

### 1. iTerm2 AppleScript

Core patterns for programmatic iTerm2 control:

```applescript
-- Create new tab
tell application "iTerm2"
  tell current window
    create tab with default profile
    tell current session
      set name to "TabName"
      write text "your-command"
    end tell
  end tell
end tell

-- Split pane (vertical)
tell application "iTerm2"
  tell current window
    tell current tab
      tell current session
        set newSession to (split vertically with default profile)
      end tell
      tell newSession
        set name to "PaneName"
        write text "command"
      end tell
    end tell
  end tell
end tell

-- Send to specific session
tell application "iTerm2"
  tell current window
    tell tab N
      tell session M
        write text "command"
      end tell
    end tell
  end tell
end tell
```

### 2. tmux Automation

```bash
# Create session
tmux new-session -d -s session-name

# Create window/tab
tmux new-window -t session-name -n window-name

# Split pane
tmux split-window -h  # horizontal
tmux split-window -v  # vertical

# Send keys to session
tmux send-keys -t session-name -l 'command text'
tmux send-keys -t session-name Enter

# Wait for initialization (Claude Code ~5s)
sleep 5

# Target specific pane
tmux send-keys -t session:window.pane 'command' Enter
```

### 3. Multi-Agent Orchestration Patterns

**Tab-per-stream, Pane-per-fork:**
```javascript
// Tab 1: Orchestrator (single pane)
// Tab 2: Stream-A [Fork-1 | Fork-2 | Fork-3]
// Tab 3: Stream-B [Fork-1 | Fork-2 | Fork-3]
```

**Auto-start pattern (wait for CLI to initialize):**
```javascript
// 1. Create tab/pane and launch agent
createItermTab(name, workdir, 'claude --dangerously-skip-permissions');

// 2. Wait for initialization
await sleep(5500);  // Claude Code takes ~5 seconds

// 3. Send initial prompt
sendToSession(tabIndex, sessionIndex, initialPrompt);
```

### 4. osascript from Node.js

```javascript
import { execSync } from 'child_process';

function osascript(lines) {
  const args = lines
    .filter(line => line.trim())
    .map(line => `-e '${line.replace(/'/g, "'\\''")}'`)
    .join(' ');
  
  return execSync(`osascript ${args}`, { 
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
}
```

### 5. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Can't set name of tab` | iTerm2 tabs don't have name property | Set session name instead (auto-reflects in tab) |
| `Expected end of line` | String escaping in AppleScript | Escape quotes: `\\"` inside template literals |
| `Split targets wrong pane` | Default targets current session | Capture `newSession` from split command |
| `Command not sent` | Agent not initialized | Wait 5+ seconds before `write text` |

---

## Key Files in Sigma Protocol

- `cli/lib/orchestration/iterm-launcher.js` - iTerm2 native launcher
- `cli/lib/orchestration/tmux-launcher.js` - tmux fallback launcher
- `cli/lib/maid.js` - tmux spawn pattern reference
- `cli/lib/doctor.js` - Auto-fix spawn pattern reference

---

## Testing Commands

```bash
# Quick iTerm2 test (N tabs)
sigma orchestrate --quick-iterm=3

# Full orchestration with auto-start
sigma orchestrate --iterm --streams 2 --forks 2 --auto-start

# tmux fallback
sigma orchestrate --backend tmux
```

---

## Resources

- [iTerm2 AppleScript Docs](https://iterm2.com/documentation-scripting.html)
- [tmux Man Page](https://man7.org/linux/man-pages/man1/tmux.1.html)
- Stack Overflow: iTerm2 AppleScript session targeting
