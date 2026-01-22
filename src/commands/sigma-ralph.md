---
name: sigma-ralph
description: "Orchestrated Ralph Loop with multi-stream support, parallel terminals, and observability"
triggers:
  - /sigma-ralph
  - sigma ralph orchestrate
args:
  - name: stream
    description: "Specific stream/backlog to run (e.g., ios, web, A, B)"
    required: false
  - name: all
    description: "Run all discovered backlogs"
    required: false
    type: boolean
  - name: parallel
    description: "Run backlogs in parallel (iTerm/tmux tabs)"
    required: false
    type: boolean
  - name: observe
    description: "Open observer tab for real-time log monitoring"
    required: false
    type: boolean
  - name: backend
    description: "Force terminal backend: iterm, tmux, or task"
    required: false
  - name: engine
    description: "AI engine: claude or opencode (default: claude)"
    required: false
  - name: dry-run
    description: "Preview execution without running"
    required: false
    type: boolean
---

# sigma-ralph - Orchestrated Ralph Loop

Advanced Ralph Loop execution with multi-stream orchestration, parallel terminal spawning, and real-time observability.

## Synopsis

```bash
# Via slash command (in Claude Code)
/sigma-ralph [--stream=X] [--all] [--parallel] [--observe] [--backend=TYPE] [--dry-run]

# Via sigma CLI
sigma ralph [OPTIONS]
```

## Description

`sigma-ralph` extends the basic Ralph Loop with orchestration capabilities:

- **Multi-stream support**: Run multiple backlogs (ios, web, streams A/B/C/E)
- **Parallel execution**: Spawn iTerm tabs or tmux panes for concurrent workers
- **Observability**: Dedicated observer tab tailing all progress logs
- **Skill delegation**: Workers use specialized skills, not direct implementation
- **Auto-detection**: Detects project type and available backlogs

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--stream=X` | `-s` | Run specific stream (ios, web, A, B, prototype) |
| `--all` | `-a` | Run all discovered streams |
| `--parallel` | `-p` | Run in parallel (requires iTerm or tmux) |
| `--observe` | `-o` | Open observer tab with log tailing |
| `--backend=TYPE` | `-b` | Force backend: `iterm`, `tmux`, `task` |
| `--engine=ENGINE` | `-e` | AI engine: `claude` (default), `opencode` |
| `--dry-run` | `-n` | Preview without executing |
| `--help` | `-h` | Show help |

## Examples

### Interactive Discovery

```bash
# Auto-detect project and show options
/sigma-ralph
```

Output:
```
=== SIGMA-RALPH DISCOVERY ===
Workspace: /Users/dev/Ball-Ai

Found backlogs:
  - ios: 12/22 stories complete
  - web: 8/19 stories complete

How would you like to proceed?
1. Run ios only
2. Run web only
3. Run all sequentially
4. Run all in parallel (opens iTerm tabs)
```

### Single Stream

```bash
# Run iOS backlog only
/sigma-ralph --stream=ios

# Run web backlog
/sigma-ralph --stream=web

# Run stream A (SigmaView style)
/sigma-ralph --stream=A
```

### Parallel Execution

```bash
# All backlogs in parallel iTerm tabs
/sigma-ralph --all --parallel --observe

# This opens:
# - Tab 1: Observer (tailing all logs)
# - Tab 2: iOS worker
# - Tab 3: Web worker
```

### Backend Selection

```bash
# Force tmux (cross-platform)
/sigma-ralph --all --parallel --backend=tmux

# Force in-process Task subagent (no terminals)
/sigma-ralph --stream=ios --backend=task
```

### Dry Run Preview

```bash
# See what would happen without executing
/sigma-ralph --all --parallel --dry-run
```

## Backend Detection

sigma-ralph automatically detects the best available backend:

| Priority | Backend | Platform | Features |
|----------|---------|----------|----------|
| 1 | iTerm2 | macOS only | Best UX, native tabs, AppleScript |
| 2 | tmux | Unix/Linux/macOS | Universal, panes, detachable |
| 3 | Task | Any | In-process, sequential only |

### iTerm Requirements

```bash
# Check iTerm is installed
ls /Applications/iTerm.app

# Uses AppleScript for tab creation
osascript -e 'tell application "iTerm"...'
```

### tmux Requirements

```bash
# Install tmux
brew install tmux  # macOS
apt install tmux   # Ubuntu/Debian

# Creates session: sigma-ralph
tmux new-session -d -s sigma-ralph
```

## Project Detection

sigma-ralph auto-detects project type:

| Project | Detection | Backlogs |
|---------|-----------|----------|
| Ball.AI | `docs/ralph/ios/` + `docs/ralph/web/` | ios, web |
| SigmaView | `.sigma/orchestration/streams.json` | Streams from config |
| SSS-Protocol | `docs/ralph/prototype/` | prototype |
| Generic | `docs/ralph/*/prd.json` | All discovered |

## Skill Delegation

Workers spawned by sigma-ralph MUST use specialized skills:

| Task | Required Skill |
|------|----------------|
| Architecture | `@senior-architect` |
| UI Components | `@frontend-design` |
| Scaffolding | `@scaffold` |
| Debugging | `@systematic-debugging` |
| PRD Compliance | `@gap-analysis` |
| Testing | `@qa-engineer` |
| Web UI Validation | `agent-browser` CLI |

## Observability

With `--observe`, an observer tab shows:

```
=== RALPH OBSERVER ===
Tailing: docs/ralph/ios/progress.txt
         docs/ralph/web/progress.txt

[2024-01-21 10:30:15] ios-01-onboarding: COMPLETED
[2024-01-21 10:32:45] ios-02-auth: IN_PROGRESS
[2024-01-21 10:30:18] web-01-landing: COMPLETED
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RALPH_ENGINE` | AI engine | `claude` |
| `RALPH_WORKSPACE` | Project directory | `$PWD` |
| `RALPH_BACKEND` | Terminal backend | auto-detect |
| `RALPH_VERBOSE` | Verbose output | `false` |

## Files Created/Used

| File | Purpose |
|------|---------|
| `docs/ralph/*/prd.json` | Story backlog |
| `docs/ralph/*/progress.txt` | Implementation log |
| `docs/ralph/*/ralph-output.log` | Raw output (background mode) |
| `scripts/ralph/iterm-spawn.sh` | iTerm tab spawner |
| `scripts/ralph/tmux-spawn.sh` | tmux pane spawner |
| `scripts/ralph/sigma-ralph.sh` | Worker script |

## Integration with Sigma CLI

sigma-ralph integrates with the Sigma Protocol CLI:

```bash
# Install includes sigma-ralph skill
sigma install

# Retrofit adds sigma-ralph to existing project
sigma retrofit
```

After installation, projects have:
- `.claude/skills/sigma-ralph.md` - Slash command skill
- `scripts/ralph/iterm-spawn.sh` - iTerm helper
- `scripts/ralph/tmux-spawn.sh` - tmux helper

## Troubleshooting

### No backlogs found

```bash
# Create prd.json backlogs first
@step-5b-prd-to-json
# or
@step-11a-prd-to-json
```

### iTerm tabs not opening

```bash
# Grant Terminal/iTerm automation permissions in:
# System Preferences > Security & Privacy > Privacy > Automation

# Or use tmux fallback
/sigma-ralph --backend=tmux
```

### tmux session already exists

```bash
# Kill existing session
tmux kill-session -t sigma-ralph

# Or attach to existing
tmux attach -t sigma-ralph
```

### Workers not using skills

Check AGENTS.md includes skill instructions. If missing, sigma-ralph auto-injects them.

## See Also

- `@ralph-loop` - Basic Ralph Loop (single backlog)
- `@ralph-tail` - Tail Ralph logs
- `@step-5b-prd-to-json` - Create prd.json from PRDs
- `@gap-analysis` - PRD compliance verification
- `docs/RALPH-MODE.md` - Full Ralph documentation
