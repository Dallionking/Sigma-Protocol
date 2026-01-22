# Ralph Tail - Log Observability

## Metadata
- **Trigger**: `/tail`, `@ralph-tail`
- **Platforms**: Claude Code, Cursor, OpenCode
- **Purpose**: Spawn terminal windows to monitor Ralph loop logs

---

## Skill Instructions

When the user runs `/tail`, automatically find and display Ralph loop logs in new terminal windows.

### Step 1: Find Active Ralph Logs

```bash
# Find the most recent Ralph logs (iOS and Web)
ls -t /tmp/ralph-ios-*.log 2>/dev/null | head -1
ls -t /tmp/ralph-web-*.log 2>/dev/null | head -1
```

### Step 2: Spawn Terminal Windows

**For macOS (iTerm2 preferred, fallback to Terminal.app):**

```bash
# Check if iTerm exists
if [ -d "/Applications/iTerm.app" ]; then
  # Use iTerm
  osascript -e "tell application \"iTerm\"
    activate
    create window with default profile
    tell current session of current window
      write text \"tail -f $(ls -t /tmp/ralph-ios-*.log 2>/dev/null | head -1)\"
    end tell
    create tab with default profile
    tell current session of current window
      write text \"tail -f $(ls -t /tmp/ralph-web-*.log 2>/dev/null | head -1)\"
    end tell
  end tell"
else
  # Fallback to Terminal.app
  osascript -e "tell application \"Terminal\"
    activate
    do script \"tail -f $(ls -t /tmp/ralph-ios-*.log 2>/dev/null | head -1)\"
    do script \"tail -f $(ls -t /tmp/ralph-web-*.log 2>/dev/null | head -1)\"
  end tell"
fi
```

### Step 3: Report Status

After spawning, report:
- Which logs were found
- Which terminal app was used
- The full log paths for reference

---

## Usage Examples

```
/tail           # Open both iOS and Web logs
/tail ios       # Open only iOS log
/tail web       # Open only Web log
/tail --list    # Just show log paths without opening terminals
```

---

## Arguments

| Arg | Description |
|-----|-------------|
| (none) | Open all active Ralph logs |
| `ios` | Open only iOS Ralph log |
| `web` | Open only Web Ralph log |
| `--list` | List log paths without spawning terminals |
| `--terminal` | Force use of Terminal.app instead of iTerm |

---

## Error Handling

- If no Ralph logs found: Report "No active Ralph logs found in /tmp/"
- If logs are stale (>1 hour old): Warn user logs may be from old session
- If terminal spawn fails: Provide manual command for user to copy

---

## Cross-Platform Notes

### macOS
- Prefers iTerm2 if installed
- Falls back to Terminal.app
- Uses AppleScript for window management

### Linux
- Uses `gnome-terminal`, `konsole`, or `xterm`
- Falls back to running in current terminal with `&` backgrounding

### Windows (WSL)
- Opens Windows Terminal if available
- Falls back to cmd.exe
