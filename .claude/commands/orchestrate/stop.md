---
description: "Stop multi-agent orchestration session"
allowed-tools:
  - Bash
  - Write
---

# /orchestrate-stop

Gracefully stop the multi-agent orchestration session.

## Usage

```
/orchestrate-stop [--force]
```

## Parameters

- `--force` - Kill immediately without graceful shutdown

## What This Does

1. **Saves current state** to `.sigma/orchestration/state.json`
2. **Notifies streams** to finish current story (unless --force)
3. **Waits for graceful completion** (up to 30 seconds)
4. **Kills tmux session** `sigma-orchestration`
5. **Cleans up worktrees** (optional, prompts)

## Execution

```bash
#!/bin/bash
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
FORCE="${1:-false}"

# Check if session exists
if ! tmux has-session -t sigma-orchestration 2>/dev/null; then
    echo "No orchestration session running."
    exit 0
fi

echo "Stopping orchestration session..."

if [ "$FORCE" != "--force" ]; then
    # Save state
    STATE_FILE="$PROJECT_ROOT/.sigma/orchestration/state.json"
    if [ -f "$STATE_FILE" ]; then
        cp "$STATE_FILE" "$STATE_FILE.backup"
        echo "State backed up to state.json.backup"
    fi
    
    # Send graceful shutdown signal
    echo "Sending shutdown signal to streams..."
    INBOX_DIR="$PROJECT_ROOT/.sigma/orchestration/inbox"
    if [ -d "$INBOX_DIR" ]; then
        echo '{"type": "shutdown", "graceful": true}' > "$INBOX_DIR/shutdown.json"
    fi
    
    # Wait briefly for graceful shutdown
    echo "Waiting for streams to finish current work..."
    sleep 5
fi

# Kill the session
tmux kill-session -t sigma-orchestration 2>/dev/null

# Clean up lock file
LOCK_FILE="$PROJECT_ROOT/.sigma/orchestration/active.lock"
if [ -f "$LOCK_FILE" ]; then
    rm "$LOCK_FILE"
fi

echo ""
echo "✓ Orchestration session stopped"
echo ""
echo "Your work is saved. To resume:"
echo "  /orchestrate-start"
echo ""
echo "To clean up worktrees:"
echo "  git worktree list"
echo "  git worktree remove <path>"
```

## After Stopping

### Resume Later

```
/orchestrate-start
```

The orchestrator will pick up where it left off using saved state.

### Clean Up Worktrees

```bash
# List worktrees
git worktree list

# Remove specific worktree
git worktree remove ../worktrees/stream-a

# Remove all stream worktrees
git worktree list | grep stream- | awk '{print $1}' | xargs -I {} git worktree remove {}
```

### Merge Completed Work

```bash
# Run merge script
./scripts/orchestrator/merge-streams.sh
```

## Related Commands

- `/orchestrate-start` - Start orchestration
- `/orchestrate-status` - Check status
- `/orchestrate-attach` - Attach to session


