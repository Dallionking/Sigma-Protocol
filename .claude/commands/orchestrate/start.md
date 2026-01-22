---
description: "Launch multi-agent orchestration (P-Thread) with TUI options"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /orchestrate-start

Launch a multi-agent orchestration session (P-Thread pattern).

## Usage

```
/orchestrate-start [--streams=N] [--tui=TYPE] [--agent=AGENT] [--mode=MODE]
```

## Parameters

| Parameter | Options | Default | Description |
|-----------|---------|---------|-------------|
| `--streams=N` | 1-8 | auto-detect | Number of parallel streams |
| `--tui=TYPE` | mprocs, overmind, tmux | tmux | Terminal UI mode |
| `--agent=AGENT` | claude, opencode, manual | auto | AI coding agent |
| `--mode=MODE` | full-auto, semi-auto, manual | semi-auto | Orchestration mode |

### TUI Options (Recommended: mprocs)

| TUI | Install | Features |
|-----|---------|----------|
| **mprocs** | `brew install mprocs` | Sidebar, keyboard nav, copy mode |
| **overmind** | `brew install overmind` | Procfile-based, sidebar |
| **tmux** | `brew install tmux` | Classic multiplexer |

### Agent Options

- `claude` - Claude Code (requires `claude` in PATH)
- `opencode` - OpenCode (requires `opencode` in PATH)
- `manual` - Launch your own agent in each pane

## What This Does

1. **Creates session** with your chosen TUI
2. **Spawns panes/processes:**
   - 1 orchestrator (monitors all streams)
   - N stream workers (execute PRDs)
3. **Creates git worktrees** for each stream (isolated branches)
4. **Initializes message bus** for inter-agent communication
5. **Starts health monitor** for crash detection/recovery

## Prerequisites

- Your chosen TUI installed (mprocs recommended)
- Your AI agent installed (claude or opencode)
- PRD swarm configured (run `@step-11b-prd-swarm --orchestrate` first)
- Git repository initialized

## Examples

```bash
# Recommended: mprocs TUI with Claude
/orchestrate-start --tui=mprocs --agent=claude

# OpenCode with 6 streams
/orchestrate-start --streams=6 --agent=opencode

# Classic tmux with auto-detected streams
/orchestrate-start --tui=tmux

# Full-auto mode with Overmind
/orchestrate-start --tui=overmind --mode=full-auto
```

## Execution

```bash
#!/bin/bash
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
STREAMS="${1:-4}"
MODE="${2:-semi-auto}"

# Check for tmux
if ! command -v tmux &> /dev/null; then
    echo "Error: tmux is not installed"
    echo "Install with: brew install tmux (macOS) or apt install tmux (Linux)"
    exit 1
fi

# Check for spawn script
SPAWN_SCRIPT="$PROJECT_ROOT/scripts/orchestrator/spawn-streams.sh"
if [ ! -f "$SPAWN_SCRIPT" ]; then
    echo "Error: spawn-streams.sh not found"
    echo "Run @step-11b-prd-swarm --orchestrate first"
    exit 1
fi

# Launch orchestration
echo "Starting orchestration with $STREAMS streams in $MODE mode..."
bash "$SPAWN_SCRIPT" "$PROJECT_ROOT" "$STREAMS" --attach

echo "Orchestration session started!"
echo "Use /orchestrate-status to check progress"
echo "Use /orchestrate-attach to reattach if detached"
```

## After Starting

- **Monitor:** Use `/orchestrate-status` to check stream progress
- **Attach:** Use `/orchestrate-attach` to view the tmux session
- **Approve:** Use `sigma approve --stream=A` when streams complete
- **Stop:** Use `/orchestrate-stop` to gracefully end the session

## Related Commands

- `/orchestrate-status` - Check orchestration status
- `/orchestrate-attach` - Attach to running session
- `/orchestrate-stop` - Stop orchestration
- `@step-11b-prd-swarm` - Configure PRD assignments

