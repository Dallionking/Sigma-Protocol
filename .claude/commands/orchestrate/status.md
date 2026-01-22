---
description: "Check multi-agent orchestration status"
allowed-tools:
  - Bash
  - Read
---

# /orchestrate-status

Check the status of the multi-agent orchestration session.

## Usage

```
/orchestrate-status [--verbose]
```

## Parameters

- `--verbose` - Show detailed information including recent logs

## What This Shows

1. **Session Status** - Whether orchestration is running
2. **Stream Status** - Current state of each stream worker
3. **PRD Progress** - Which PRDs are assigned, in-progress, completed
4. **Health Status** - Any crashed or stuck streams

## Example Output

```
╔════════════════════════════════════════════════════════════╗
║  Sigma Orchestration Status                                ║
╠════════════════════════════════════════════════════════════╣
║  Session: sigma-orchestration (running)                    ║
║  Streams: 4 active                                         ║
║  Mode: semi-auto                                           ║
╠════════════════════════════════════════════════════════════╣
║  Stream A: ✓ PRD-001 complete, waiting for approval        ║
║  Stream B: ⚙ PRD-002 in progress (story 3/5)              ║
║  Stream C: ⚙ PRD-003 in progress (story 1/4)              ║
║  Stream D: ○ Waiting for assignment                        ║
╠════════════════════════════════════════════════════════════╣
║  PRDs: 1/4 complete | Stories: 4/14 complete               ║
╚════════════════════════════════════════════════════════════╝
```

## Execution

```bash
#!/bin/bash
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
VERBOSE="${1:-false}"

# Check if session exists
if ! tmux has-session -t sigma-orchestration 2>/dev/null; then
    echo "No orchestration session running."
    echo "Start one with: /orchestrate-start"
    exit 0
fi

# Get pane info
echo "Orchestration Status"
echo "===================="
echo ""

# List panes
tmux list-panes -t sigma-orchestration -F '#{pane_index}: #{pane_title} (#{pane_current_command})' 2>/dev/null

echo ""

# Check state file
STATE_FILE="$PROJECT_ROOT/.sigma/orchestration/state.json"
if [ -f "$STATE_FILE" ]; then
    echo "Progress:"
    cat "$STATE_FILE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
streams = data.get('streams', {})
for name, info in streams.items():
    status = info.get('status', 'unknown')
    prd = info.get('current_prd', 'none')
    print(f'  Stream {name}: {status} - {prd}')
"
fi

# Check progress file
PROGRESS_FILE="$PROJECT_ROOT/.sigma/orchestration/progress.json"
if [ -f "$PROGRESS_FILE" ]; then
    echo ""
    echo "PRD Progress:"
    cat "$PROGRESS_FILE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
total = len(data.get('prds', []))
done = len([p for p in data.get('prds', []) if p.get('status') == 'done'])
print(f'  {done}/{total} PRDs complete')
"
fi

echo ""
echo "Commands:"
echo "  /orchestrate-attach  - View session"
echo "  sigma approve --stream=X  - Approve completed stream"
echo "  /orchestrate-stop    - Stop orchestration"
```

## Related Commands

- `/orchestrate-start` - Start orchestration
- `/orchestrate-attach` - Attach to session
- `/orchestrate-stop` - Stop orchestration


