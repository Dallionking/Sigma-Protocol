---
description: "Attach to running orchestration session"
allowed-tools:
  - Bash
---

# /orchestrate-attach

Attach to the running multi-agent orchestration tmux session.

## Usage

```
/orchestrate-attach
```

## What This Does

Attaches your terminal to the `sigma-orchestration` tmux session, allowing you to:

- View all stream panes simultaneously
- Monitor real-time progress
- Interact with individual streams
- Navigate between panes

## tmux Navigation

Once attached, use these keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` then `D` | Detach from session |
| `Ctrl+B` then `[` | Enter scroll mode |
| `Ctrl+B` then `0-9` | Switch to pane by number |
| `Ctrl+B` then `Arrow` | Navigate between panes |
| `Ctrl+B` then `Z` | Zoom current pane (toggle) |
| `Ctrl+B` then `Q` | Show pane numbers |

## Execution

```bash
#!/bin/bash

# Check if session exists
if ! tmux has-session -t sigma-orchestration 2>/dev/null; then
    echo "No orchestration session running."
    echo ""
    echo "Start one with: /orchestrate-start"
    exit 1
fi

# Attach to session
echo "Attaching to sigma-orchestration session..."
echo "Use Ctrl+B then D to detach"
echo ""

tmux attach -t sigma-orchestration
```

## Pane Layout

When attached, you'll see:

```
┌─────────────────┬─────────────────┐
│   ORCHESTRATOR  │    STREAM A     │
│   (monitors)    │   (worker)      │
├─────────────────┼─────────────────┤
│    STREAM B     │    STREAM C     │
│   (worker)      │   (worker)      │
└─────────────────┴─────────────────┘
```

- **Pane 0:** Orchestrator - manages workflow
- **Pane 1+:** Stream workers - execute PRDs

## Tips

- **Zoom a pane:** `Ctrl+B` then `Z` to focus on one stream
- **Scroll history:** `Ctrl+B` then `[`, use arrows, `Q` to exit
- **Quick switch:** `Ctrl+B` then number (0, 1, 2, etc.)

## Related Commands

- `/orchestrate-start` - Start orchestration
- `/orchestrate-status` - Check status without attaching
- `/orchestrate-stop` - Stop orchestration


