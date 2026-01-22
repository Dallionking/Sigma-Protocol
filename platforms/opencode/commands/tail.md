# /tail - Ralph Log Observability

## Command Metadata
```yaml
name: tail
aliases: [ralph-tail, logs]
description: Spawn terminal windows to monitor Ralph loop logs
category: ops
```

## Usage

```
/tail [target] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `target` | Which logs: `ios`, `web`, or `all` | `all` |
| `--list` | Just show paths, don't open terminals | false |
| `--terminal` | Force Terminal.app over iTerm | false |

### Examples

```bash
/tail           # Open all active Ralph logs
/tail ios       # Open only iOS log
/tail web       # Open only Web log
/tail --list    # Show log paths without opening terminals
```

## Implementation

Execute the tail-logs script:

```bash
bash "/Users/dallionking/SSS Projects/SSS-Protocol/scripts/ralph/tail-logs.sh" $ARGS
```

## What It Does

1. **Finds** the most recent Ralph log files in `/tmp/`
2. **Spawns** new terminal windows (iTerm2 preferred, Terminal.app fallback)
3. **Runs** `tail -f` on each log for live streaming
4. **Reports** which logs were opened

## Log File Patterns

| Platform | Pattern |
|----------|---------|
| iOS | `/tmp/ralph-ios-YYYYMMDD-HHMMSS.log` |
| Web | `/tmp/ralph-web-YYYYMMDD-HHMMSS.log` |

## Cross-Platform Support

| OS | Terminal Used |
|----|---------------|
| macOS | iTerm2 (preferred) or Terminal.app |
| Linux | gnome-terminal, konsole, or xterm |
| Windows/WSL | Windows Terminal or cmd.exe |

## Error Messages

| Error | Meaning |
|-------|---------|
| "No Ralph logs found" | No active Ralph loops. Start one first. |
| "No iOS log found" | iOS Ralph loop not running |
| "No Web log found" | Web Ralph loop not running |
