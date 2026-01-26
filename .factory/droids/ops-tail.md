---
name: tail
description: "Spawn terminal windows to monitor Ralph loop logs"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# tail

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---


# /tail - Ralph Log Observability

Open terminal windows showing live Ralph loop output.

## Your Task

1. **Find active Ralph logs** in `/tmp/ralph-*.log`
2. **Spawn terminal windows** with `tail -f` for each log
3. **Report status** to the user

## Execution

Run the tail-logs script:

```bash
/Users/dallionking/SSS\ Projects/Sigma-Protocol/scripts/ralph/tail-logs.sh {{target}}
```

### Arguments

| Arg | Effect |
|-----|--------|
| (none) | Open all active Ralph logs |
| `ios` | Open only iOS Ralph log |
| `web` | Open only Web Ralph log |
| `--list` | List log paths without spawning terminals |
| `--terminal` | Force Terminal.app instead of iTerm |

## Examples

```bash
# User: /tail
# Action: Open both iOS and Web log windows

# User: /tail ios
# Action: Open only iOS log window

# User: /tail --list
# Action: Just show the log file paths
```

## Output Format

After execution, report:
- ✓ Number of windows opened
- Log file paths for each platform
- Any warnings (stale logs, missing logs)

## Error Handling

- **No logs found**: Tell user to start a Ralph loop first
- **Spawn fails**: Provide manual `tail -f` commands to copy
