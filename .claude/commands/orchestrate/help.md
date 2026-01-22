---
description: "Multi-agent orchestration help and overview"
allowed-tools:
  - Read
---

# /orchestrate

Multi-agent orchestration for parallel development with Sigma Protocol.

## Overview

Orchestration allows multiple AI agents to work on different PRDs simultaneously, dramatically speeding up development for larger projects.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                           │
│  • Manages PRD assignments                                  │
│  • Monitors stream progress                                 │
│  • Handles approvals and merges                             │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ STREAM A  │  │ STREAM B  │  │ STREAM C  │  │ STREAM D  │
│ PRD-001   │  │ PRD-002   │  │ PRD-003   │  │ PRD-004   │
│ (branch)  │  │ (branch)  │  │ (branch)  │  │ (branch)  │
└───────────┘  └───────────┘  └───────────┘  └───────────┘
```

## Commands

| Command | Description |
|---------|-------------|
| `/orchestrate-start` | Launch orchestration session |
| `/orchestrate-status` | Check current status |
| `/orchestrate-attach` | Attach to tmux session |
| `/orchestrate-stop` | Stop orchestration |

## Quick Start

### 1. Configure PRD Assignments

```
@step-11b-prd-swarm --orchestrate
```

This generates `.sigma/orchestration/streams.json` with PRD-to-stream mappings.

### 2. Start Orchestration

```
/orchestrate-start --streams=4
```

### 3. Monitor Progress

```
/orchestrate-status
```

### 4. Approve Completions

```bash
sigma approve --stream=A
```

### 5. Merge Work

```bash
./scripts/orchestrator/merge-streams.sh
```

## Prerequisites

- **tmux** - Terminal multiplexer (`brew install tmux`)
- **Git** - For worktrees and branches
- **PRDs** - Generated via Step 11

## Modes

### Semi-Auto (Default)

- Streams work autonomously on stories
- Pauses for approval when PRD completes
- You review and approve before merge

### Full-Auto

- Streams work continuously
- Auto-approves completed PRDs
- Merges automatically (with conflict detection)

### Manual

- You assign each story manually
- Full control over workflow
- Best for complex dependencies

## Voice Notifications

Enable spoken alerts for completions and crashes:

```bash
# In .env
ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=your_voice
```

## Troubleshooting

### Session won't start

```bash
# Check tmux
tmux -V

# Kill stale sessions
tmux kill-server
```

### Stream crashed

The health monitor auto-restarts crashed streams. Check:

```
/orchestrate-status --verbose
```

### Merge conflicts

```bash
# Run merge with conflict handling
./scripts/orchestrator/merge-streams.sh --continue
```

## Files

| File | Purpose |
|------|---------|
| `.sigma/orchestration/streams.json` | Stream configuration |
| `.sigma/orchestration/state.json` | Current state |
| `.sigma/orchestration/progress.json` | PRD progress |
| `.sigma/orchestration/inbox/` | Message queue |

## Related

- [ORCHESTRATION.md](docs/ORCHESTRATION.md) - Full documentation
- [TMUX-GUIDE.md](docs/TMUX-GUIDE.md) - tmux tutorial
- [ELEVENLABS-SETUP.md](docs/ELEVENLABS-SETUP.md) - Voice setup


