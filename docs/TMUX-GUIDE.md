# tmux Guide for Multi-Agent Orchestration

A beginner-friendly guide to using tmux with Sigma Protocol's multi-agent orchestration system.

## What is tmux?

tmux (terminal multiplexer) lets you:
- **Split your terminal** into multiple panes
- **Keep sessions running** even when you disconnect
- **Run multiple Claude instances** in parallel, visible at once

For Sigma orchestration, tmux enables you to see all your Claude Code streams working simultaneously in a single window.

---

## Installation

### macOS
```bash
# Using Homebrew (recommended)
brew install tmux

# Verify installation
tmux -V
# Expected output: tmux 3.x
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install tmux -y
```

### Linux (Fedora/RHEL)
```bash
sudo dnf install tmux -y
```

### Windows
Use WSL2 (Windows Subsystem for Linux), then follow Linux instructions.

---

## Essential Commands

### Quick Reference Card

| Action | Command / Keys |
|--------|---------------|
| **Start new session** | `tmux new -s sigma` |
| **Detach (leave running)** | `Ctrl+B` then `D` |
| **Re-attach to session** | `tmux attach -t sigma` |
| **List sessions** | `tmux ls` |
| **Kill session** | `tmux kill-session -t sigma` |
| **Split horizontally** | `Ctrl+B` then `%` |
| **Split vertically** | `Ctrl+B` then `"` |
| **Switch panes** | `Ctrl+B` then arrow keys |
| **Zoom pane (fullscreen)** | `Ctrl+B` then `Z` |
| **Close current pane** | `exit` or `Ctrl+D` |
| **Scroll mode** | `Ctrl+B` then `[` (q to exit) |

> **Note:** All tmux commands start with `Ctrl+B` (the prefix), then release both keys, then press the command key.

---

## Step-by-Step Tutorial

### 1. Create Your First Session

```bash
# Create a new session named "sigma"
tmux new -s sigma
```

You're now inside tmux! Notice the green bar at the bottom.

### 2. Split Into Panes

Create a 2x2 grid layout:

```bash
# Press: Ctrl+B then %
# This splits the window vertically (left/right)

# Move to right pane: Ctrl+B then →

# Press: Ctrl+B then "
# This splits the current pane horizontally (top/bottom)

# Move to left pane: Ctrl+B then ←

# Press: Ctrl+B then "
# Now you have 4 panes!
```

### 3. Navigate Between Panes

```bash
# Use arrow keys after pressing the prefix
Ctrl+B then ↑  # Move up
Ctrl+B then ↓  # Move down
Ctrl+B then ←  # Move left
Ctrl+B then →  # Move right
```

### 4. Run Commands in Each Pane

Navigate to each pane and start Claude:

```bash
# In each pane:
cd /path/to/your/project
claude
```

### 5. Detach and Re-attach

```bash
# Detach (leave everything running)
Ctrl+B then D

# Later, re-attach
tmux attach -t sigma
# Or shorthand:
tmux a -t sigma
```

---

## Layout Presets

### Tiled Layout (Equal Panes)

After creating panes, balance them:
```bash
Ctrl+B then Esc then 1  # Even horizontal
Ctrl+B then Esc then 2  # Even vertical
Ctrl+B then Esc then 3  # Main horizontal
Ctrl+B then Esc then 4  # Main vertical
Ctrl+B then Esc then 5  # Tiled (equal size)
```

Or from command mode:
```bash
Ctrl+B then :
# Type: select-layout tiled
```

---

## Sigma Orchestration Layout

The recommended layout for multi-agent orchestration:

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

### Create This Layout Manually

```bash
# Start session
tmux new -s sigma-orchestration

# Create 5 panes (1 orchestrator + 4 streams)
tmux split-window -h
tmux split-window -h
tmux select-pane -t 0
tmux split-window -v
tmux select-pane -t 2
tmux split-window -v

# Balance
tmux select-layout tiled
```

### Create This Layout Automatically

Use our spawn script:
```bash
./scripts/orchestrator/spawn-streams.sh . 4
```

---

## Advanced tmux Features

### Mouse Support

Add to `~/.tmux.conf`:
```bash
set -g mouse on
```

Now you can:
- Click to select panes
- Scroll with mouse wheel
- Resize panes by dragging borders

### Copy Mode (Scrolling)

```bash
Ctrl+B then [    # Enter copy mode
# Use arrow keys or Page Up/Down to scroll
q                # Exit copy mode
```

### Synchronize Panes (Type in All)

```bash
Ctrl+B then :
# Type: setw synchronize-panes on
# Now typing appears in ALL panes!

# To turn off:
Ctrl+B then :
# Type: setw synchronize-panes off
```

### Rename Window/Session

```bash
Ctrl+B then ,    # Rename current window
Ctrl+B then $    # Rename current session
```

---

## Troubleshooting

### "tmux: command not found"

Install tmux (see Installation section above).

### Session Won't Detach

Make sure you're pressing the keys correctly:
1. Press and hold `Ctrl+B`
2. Release both keys
3. Press `D`

### Pane Navigation Not Working

Check you're using arrow keys, not WASD. The default prefix is `Ctrl+B`.

### "Sessions should be nested with care"

You're trying to run tmux inside tmux. Either:
- Detach from current session first
- Or use `tmux attach` instead of `tmux new`

### Can't See Full Output / Scroll

Enter copy mode: `Ctrl+B` then `[`
Use Page Up/Down to scroll. Press `q` to exit.

---

## Recommended Configuration

Create `~/.tmux.conf`:

```bash
# Better colors
set -g default-terminal "screen-256color"

# Mouse support
set -g mouse on

# Start windows and panes at 1, not 0
set -g base-index 1
setw -g pane-base-index 1

# Better split shortcuts
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Easy reload
bind r source-file ~/.tmux.conf \; display "Reloaded!"

# Status bar
set -g status-style bg=black,fg=white
set -g status-left '#[fg=green]#S '
set -g status-right '#[fg=yellow]%H:%M'

# Pane borders
set -g pane-border-style fg=colour238
set -g pane-active-border-style fg=colour39
```

Reload configuration:
```bash
tmux source-file ~/.tmux.conf
```

---

## Integration with Sigma Orchestration

### Quick Start

```bash
# One command to start everything
npx sigma-protocol orchestrate --streams=4
```

This automatically:
1. Creates a tmux session named `sigma-orchestration`
2. Creates 5 panes (orchestrator + 4 streams)
3. Creates Git worktrees for each stream
4. Launches Claude Code in each pane
5. Attaches you to the session

### Manual Start

If you prefer manual control:

```bash
# 1. Create session
tmux new -s sigma-orchestration

# 2. Run spawn script
./scripts/orchestrator/spawn-streams.sh . 4

# 3. (In orchestrator pane) Start orchestrator
@orchestrate

# 4. (In each stream pane) Start stream worker
# Stream A:
@stream --name=A

# 5. Detach and let it run
Ctrl+B then D
```

### Monitoring

```bash
# Check if running
tmux ls

# Re-attach
tmux attach -t sigma-orchestration

# Kill when done
tmux kill-session -t sigma-orchestration
```

---

## Quick Commands Cheat Sheet

```bash
# ┌──────────────────────────────────────────┐
# │          TMUX CHEAT SHEET                │
# ├──────────────────────────────────────────┤
# │ tmux new -s NAME      Start new session  │
# │ tmux attach -t NAME   Re-attach          │
# │ tmux ls               List sessions      │
# │ tmux kill-session -t  Kill session       │
# ├──────────────────────────────────────────┤
# │ Ctrl+B then D         Detach             │
# │ Ctrl+B then %         Split vertical     │
# │ Ctrl+B then "         Split horizontal   │
# │ Ctrl+B then arrows    Navigate panes     │
# │ Ctrl+B then Z         Zoom pane          │
# │ Ctrl+B then [         Scroll mode        │
# │ Ctrl+B then :         Command mode       │
# └──────────────────────────────────────────┘
```

---

## Related Documentation

- [ORCHESTRATION.md](./ORCHESTRATION.md) - Full orchestration guide
- [ELEVENLABS-SETUP.md](./ELEVENLABS-SETUP.md) - Voice notification setup
- [spawn-streams.sh](../scripts/orchestrator/spawn-streams.sh) - Auto-spawn script

---

*Part of the Sigma Protocol Multi-Agent Orchestration System*

