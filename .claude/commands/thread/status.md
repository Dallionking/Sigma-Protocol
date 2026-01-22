---
description: "View active thread status and orchestration sessions"
allowed-tools:
  - Read
  - Bash
---

# /thread-status

View the status of active threads and orchestration sessions.

## Usage

```
/thread-status
```

## What It Shows

1. **Active Orchestration** - Current tmux/mprocs/overmind session
2. **Stream Status** - Each stream's current state
3. **Agent Type** - Which AI agent is in use
4. **Thread Metrics** - Tool calls, duration, checkpoints

## Example Output

```
╔═══════════════════════════════════════════════════════════╗
║               Thread Status                               ║
╚═══════════════════════════════════════════════════════════╝

Active Orchestration:
  Mode: mprocs
  Agent: claude
  Streams: 4
  Created: 2026-01-12T10:30:00Z

Stream Status:
  A: working (PRD: user-auth)
  B: ready (PRD: database-schema)
  C: done (PRD: api-endpoints)
  D: working (PRD: frontend-components)

Thread Type Guide:
  B   Base Thread
  P   P-Thread (Parallel)
  C   C-Thread (Chained)
  F   F-Thread (Fusion)
  B+  B-Thread (Big/Meta)
  L   L-Thread (Long)
```

## Execution

```bash
#!/bin/bash
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
STREAMS_FILE="$PROJECT_ROOT/.sigma/orchestration/streams.json"

if [ -f "$STREAMS_FILE" ]; then
    echo "Active Orchestration:"
    jq -r '.mode // "tmux"' "$STREAMS_FILE" | xargs printf "  Mode: %s\n"
    jq -r '.agent // "claude"' "$STREAMS_FILE" | xargs printf "  Agent: %s\n"
    jq -r '.streams | length' "$STREAMS_FILE" | xargs printf "  Streams: %s\n"
    jq -r '.created' "$STREAMS_FILE" | xargs printf "  Created: %s\n"
    
    echo ""
    echo "Stream Status:"
    jq -r '.streams[] | "  \(.name): \(.status // "unknown")"' "$STREAMS_FILE"
else
    echo "No active orchestration session."
    echo "Start one with: sigma orchestrate"
fi
```

## Related Commands

- `/thread` - Thread type wizard
- `/orchestrate-status` - Detailed orchestration status
- `/f-thread` - Start a fusion thread


