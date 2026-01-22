# Multi-Agent Orchestration Guide

Comprehensive guide to running multiple AI coding agents in parallel for accelerated PRD implementation using Sigma Protocol.

> **Thread-Based Engineering**: This is a **P-Thread (Parallel Thread)** implementation. See [THREAD-BASED-ENGINEERING.md](THREAD-BASED-ENGINEERING.md) for the full framework.

## Overview

The Multi-Agent Orchestration system allows you to:

- **Run 4-8 AI agents simultaneously** (Claude Code, OpenCode, or manual)
- **Choose your TUI**: mprocs (recommended), Overmind, or tmux
- **Execute PRDs in parallel** without dependency conflicts
- **Receive voice notifications** when PRDs complete
- **Auto-restart crashed instances** with the health monitor
- **Merge all work** back to main with guided conflict resolution

```
┌─────────────────────────────────────────────────────────┐
│                    Ghostty / Terminal                   │
├─────────────────┬─────────────────┬─────────────────────┤
│  ORCHESTRATOR   │    STREAM A     │     STREAM B        │
│    (claude)     │    (claude)     │     (claude)        │
│                 │   worktree-a    │    worktree-b       │
│  Monitors all   │   PRD: F001     │    PRD: F002        │
│  streams        │                 │                     │
├─────────────────┼─────────────────┼─────────────────────┤
│    STREAM C     │    STREAM D     │                     │
│    (claude)     │    (claude)     │     [Status]        │
│   worktree-c    │   worktree-d    │                     │
│   PRD: F003     │   PRD: F004     │                     │
└─────────────────┴─────────────────┴─────────────────────┘
```

## Quick Start

### Recommended: mprocs TUI

```bash
# Best experience - sidebar navigation, keyboard shortcuts
sigma orchestrate --tui mprocs --agent=claude

# Or with OpenCode
sigma orchestrate --tui mprocs --agent=opencode
```

### Alternative TUIs

```bash
# Overmind - Procfile-based, sidebar switching
sigma orchestrate --tui overmind

# tmux - Classic multiplexer (default)
sigma orchestrate --tui tmux
```

### CLI Options

```bash
sigma orchestrate                      # Interactive setup
sigma orchestrate --streams=6          # Specify stream count
sigma orchestrate --agent=claude       # Use Claude Code
sigma orchestrate --agent=opencode     # Use OpenCode
sigma orchestrate --agent=manual       # Launch agents yourself
sigma orchestrate --attach             # Attach to existing session
sigma orchestrate --status             # Check status
sigma orchestrate --kill               # Stop session
```

This single command:
1. Creates a session with your chosen TUI
2. Creates Git worktrees for each stream
3. Launches your AI agent in each pane
4. Sets up inter-agent communication
5. Attaches you to the session

### Manual Launch

```bash
# 1. Generate orchestration config (after Step 11)
@step-11b-prd-swarm --orchestrate

# 2. Spawn the workspace (choose one):
./scripts/orchestrator/spawn-mprocs.sh . 4 --agent=claude    # mprocs
./scripts/orchestrator/spawn-overmind.sh . 4 --agent=claude  # Overmind
./scripts/orchestrator/spawn-streams.sh . 4 --agent=claude   # tmux

# 3. In ORCHESTRATOR pane, run:
@orchestrate

# 4. In each STREAM pane, run:
@stream --name=A  # Stream A
@stream --name=B  # Stream B
@stream --name=C  # Stream C
@stream --name=D  # Stream D
```

---

## Prerequisites

### TUI Options (Choose One)

| TUI | Install | Features |
|-----|---------|----------|
| **mprocs** (recommended) | `brew install mprocs` | Sidebar navigation, keyboard shortcuts, copy mode |
| **Overmind** | `brew install overmind` | Procfile-based, sidebar switching |
| **tmux** (default) | `brew install tmux` | Classic multiplexer, panes |

### Required

- **One of the TUI options above** (mprocs recommended)
  ```bash
  # macOS - Install mprocs (recommended)
  brew install mprocs
  
  # Or tmux (fallback)
  brew install tmux
  
  # Ubuntu/Debian
  sudo apt install tmux  # mprocs via cargo: cargo install mprocs
  ```

- **Git** - For worktrees
- **Claude Code** - `claude` command available in PATH
- **Node.js 18+** - For CLI tools

### Optional

- **ElevenLabs API Key** - For high-quality voice notifications
- **mcp_agent_mail** - For advanced inter-agent communication

---

## Architecture

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| spawn-streams.sh | scripts/orchestrator/ | Creates tmux session and worktrees |
| health-monitor.sh | scripts/orchestrator/ | Detects crashes, auto-respawns |
| orchestrator.py | scripts/orchestrator/ | Core orchestration logic |
| stream-worker.py | scripts/orchestrator/ | Stream execution logic |
| voice.py | scripts/notify/ | ElevenLabs + fallback TTS |
| merge-streams.sh | scripts/orchestrator/ | Sequential Git merge |
| @orchestrate | ops/ | Orchestrator command spec |
| @stream | ops/ | Stream worker command spec |
| streams.schema.json | schemas/ | Configuration schema |

### Communication Flow

```
                    ┌─────────────────┐
                    │   ORCHESTRATOR  │
                    │                 │
                    │ @orchestrate│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ STREAM A │        │ STREAM B │        │ STREAM C │
   │          │        │          │        │          │
   │@sigma-   │        │@sigma-   │        │@sigma-   │
   │stream    │        │stream    │        │stream    │
   └──────────┘        └──────────┘        └──────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Message Queue  │
                    │ .sigma/inbox/   │
                    └─────────────────┘
```

### Message Types

| Type | From | To | Description |
|------|------|-----|-------------|
| `register` | Stream | Orchestrator | Stream announces readiness |
| `prd_assignment` | Orchestrator | Stream | Assign PRD to stream |
| `story_complete` | Stream | Orchestrator | Story implementation done |
| `prd_complete` | Stream | Orchestrator | All stories in PRD done |
| `continue` | Orchestrator | Stream | Proceed to next item |
| `blocked` | Stream | Orchestrator | Waiting on dependency |
| `error` | Stream | Orchestrator | Error occurred |

---

## Orchestration Modes

### Semi-Auto (Recommended)

```bash
npx sigma-protocol orchestrate --mode=semi-auto
```

- Stories auto-continue after verification
- **PRDs pause for human approval** before continuing
- Voice notification: "Stream A completed User Auth. Ready for testing."
- Say "Approved, continue" to proceed

### Full-Auto

```bash
npx sigma-protocol orchestrate --mode=full-auto
```

- Both stories and PRDs auto-continue
- Voice notifications only, no pauses
- Best for well-tested PRD sets

### Manual

```bash
npx sigma-protocol orchestrate --mode=manual
```

- Every story and PRD requires approval
- Maximum control, slowest throughput
- Good for complex/risky implementations

---

## Configuration

### streams.json

Located at `.sigma/orchestration/streams.json`:

```json
{
  "version": "1.0.0",
  "session": "sigma-orchestration",
  "projectRoot": "/path/to/project",
  "streams": [
    {
      "name": "A",
      "prds": ["F001", "F005"],
      "worktree": "stream-a",
      "description": "Core Auth & User"
    },
    {
      "name": "B",
      "prds": ["F002", "F006"],
      "worktree": "stream-b",
      "description": "Dashboard & Charts"
    }
  ],
  "dependencies": {
    "F005": ["F002"],
    "F006": ["F003", "F004"]
  },
  "merge_order": ["A", "B", "C", "D"],
  "settings": {
    "mode": "semi-auto",
    "notify_on": ["prd_complete", "blocked", "crash"],
    "auto_merge": false
  }
}
```

### Environment Variables

```bash
# Voice Notifications
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (default)

# Orchestration Mode
SIGMA_ORCHESTRATOR_MODE=semi-auto

# Notification Events
SIGMA_NOTIFY_ON=prd_complete,blocked,all_complete,crash

# Stream Identity (set by spawn-streams.sh)
SIGMA_STREAM_NAME=A
SIGMA_PROJECT_ROOT=/path/to/project
SIGMA_ROLE=stream  # or "orchestrator"
```

---

## Workflow

### Phase 1: Setup

```bash
# Generate PRDs (Step 11)
@step-11-prd-generation

# Generate orchestration config
@step-11b-prd-swarm --orchestrate --terminals=4

# Launch workspace
npx sigma-protocol orchestrate --streams=4
```

### Phase 2: Execution

1. **Orchestrator** assigns initial PRDs to streams
2. **Streams** execute PRDs using Ralph loop methodology
3. **Streams** report story completion after each story
4. **Orchestrator** runs verification, tells stream to continue
5. **Streams** report PRD completion when all stories done
6. **Voice notification** alerts you: "Stream A completed F001"

### Phase 3: Approval

In semi-auto mode, PRD completions pause for approval:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏸️  PRD COMPLETE — AWAITING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stream: A
PRD: F001

Gap Analysis Score: 94%

To approve and continue, say:
  "Approved, continue"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 4: Merge

When all streams complete:

```bash
# Voice: "All streams complete. Ready for final merge."

# Run merge sequence
./scripts/orchestrator/merge-streams.sh

# Or manually:
git checkout main
git merge stream-a
git merge stream-b
git merge stream-c
git merge stream-d
```

---

## tmux Commands

| Action | Keys |
|--------|------|
| Detach (leave running) | `Ctrl+B` then `D` |
| Re-attach | `tmux attach -t sigma-orchestration` |
| Switch panes | `Ctrl+B` then arrow keys |
| Zoom pane (fullscreen) | `Ctrl+B` then `Z` |
| Kill session | `tmux kill-session -t sigma-orchestration` |
| Scroll mode | `Ctrl+B` then `[` |

See [TMUX-GUIDE.md](./TMUX-GUIDE.md) for comprehensive tmux tutorial.

---

## Voice Notifications

### Events

| Event | Message Example |
|-------|-----------------|
| PRD Complete | "Sigma! Stream A completed User Authentication. Ready for testing." |
| Blocked | "Stream B is blocked, waiting for Stream A." |
| Crash | "Stream C crashed and was restarted." |
| All Complete | "All streams complete. Ready for final merge." |
| Merge Conflict | "Merge conflict detected in stream D." |

### Configuration

See [ELEVENLABS-SETUP.md](./ELEVENLABS-SETUP.md) for voice notification setup.

---

## Troubleshooting

### Stream Not Starting

```bash
# Check environment
echo $SIGMA_STREAM_NAME
echo $SIGMA_PROJECT_ROOT

# Verify worktree exists
ls -la ../worktrees/stream-a/
```

### Messages Not Delivering

```bash
# Check inbox directory
ls -la .sigma/orchestration/inbox/

# Check for message files
cat .sigma/orchestration/inbox/orchestrator.json
```

### tmux Session Lost

```bash
# List all sessions
tmux ls

# Attach to sigma session
tmux attach -t sigma-orchestration

# If session died, restart
./scripts/orchestrator/spawn-streams.sh . 4
```

### Merge Conflicts

```bash
# Check conflict status
git status

# Resolve conflicts, then continue
git add .
git commit
./scripts/orchestrator/merge-streams.sh --continue

# Or abort
./scripts/orchestrator/merge-streams.sh --abort
```

---

## Best Practices

### PRD Distribution

- **Balance complexity** across streams
- **Respect dependencies** - don't assign F005 to Stream B if it depends on F001 in Stream A
- **Group related PRDs** - auth + user profile in same stream

### Monitoring

- **Watch the orchestrator** for blocked streams
- **Check progress** periodically: `orchestrator.py --status`
- **Test incrementally** - verify each PRD before approving

### Merge Strategy

1. Merge streams **in dependency order**
2. Test after **each merge**
3. Create **save points** (tags) before risky merges

---

## CLI Commands

```bash
# Full CLI reference
npx sigma-protocol orchestrate --help

# Launch workspace
npx sigma-protocol orchestrate --streams=4

# Attach to existing
npx sigma-protocol orchestrate --attach

# Kill workspace
npx sigma-protocol orchestrate --kill

# Approve PRD completion
npx sigma-protocol approve --stream=A

# Check status
npx sigma-protocol orchestrate --status
```

---

## Related Documentation

- [TMUX-GUIDE.md](./TMUX-GUIDE.md) - tmux tutorial
- [ELEVENLABS-SETUP.md](./ELEVENLABS-SETUP.md) - Voice notification setup
- [step-11b-prd-swarm](../steps/step-11b-prd-swarm) - PRD swarm orchestration
- [streams.schema.json](../schemas/streams.schema.json) - Configuration schema

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/orchestrator/spawn-streams.sh` | Auto-spawn tmux panes with Claude Code |
| `scripts/orchestrator/health-monitor.sh` | Crash detection and auto-respawn |
| `scripts/orchestrator/orchestrator.py` | Core orchestrator logic |
| `scripts/orchestrator/stream-worker.py` | Stream worker logic |
| `scripts/orchestrator/install-agent-mail.sh` | mcp_agent_mail installer |
| `scripts/orchestrator/merge-streams.sh` | Sequential Git merge |
| `scripts/notify/voice.py` | ElevenLabs + fallback TTS |
| `scripts/hooks/post-edit.sh` | Claude Code hook for file changes |
| `scripts/hooks/session-start.sh` | Claude Code hook for session start |
| `ops/sigma-orchestrate` | Orchestrator command spec |
| `ops/sigma-stream` | Stream worker command spec |
| `schemas/streams.schema.json` | Orchestration config schema |

---

*Part of the Sigma Protocol Multi-Agent Orchestration System*

