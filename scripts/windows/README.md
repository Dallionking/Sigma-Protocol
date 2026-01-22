# Windows Script Wrappers

These `.cmd` files provide Windows compatibility for Sigma Protocol's bash scripts.

## How They Work

Each wrapper script attempts to run the original bash script using:

1. **WSL (Windows Subsystem for Linux)** - Preferred, full functionality
2. **Git Bash** - Good compatibility for most features
3. **Node.js CLI fallback** - When bash is unavailable

## Available Scripts

| Script | Purpose | Fallback |
|--------|---------|----------|
| `sigma-ralph.cmd` | Run Ralph autonomous loop | Node.js `sigma orchestrate --mode ralph` |
| `spawn-streams.cmd` | Spawn parallel agent streams | Windows Terminal tabs |
| `health-monitor.cmd` | Monitor stream health | Node.js `sigma health` |
| `merge-streams.cmd` | Merge completed streams | Node.js `sigma merge` |

## Setup Options

### Option 1: WSL (Recommended)

Full compatibility with all features:

```cmd
REM Install WSL
wsl --install

REM After restart, install dependencies
wsl -d Ubuntu -e sudo apt update
wsl -d Ubuntu -e sudo apt install tmux jq

REM Install Claude Code or OpenCode in WSL
wsl -d Ubuntu -e npm install -g @anthropic/claude-code
```

### Option 2: Git Bash

Good for most scripts:

1. Download from https://git-scm.com/download/win
2. Ensure `bash` is in your PATH
3. Install `jq`: `choco install jq` (with Chocolatey)

### Option 3: Node.js Only

No bash required, some features limited:

```cmd
npm install -g sigma-protocol
sigma orchestrate --streams=4
sigma health --watch
sigma merge --status
```

## Path Conversion

Windows paths are automatically converted for WSL:

- `C:\Users\...` → `/mnt/c/Users/...`
- `D:\Projects\...` → `/mnt/d/Projects/...`

## Usage Examples

```cmd
REM Run Ralph loop
sigma-ralph.cmd --workspace=C:\Projects\myapp --mode=prototype

REM Spawn 4 parallel streams
spawn-streams.cmd --streams=4 --workspace=C:\Projects\myapp

REM Monitor health continuously
health-monitor.cmd --watch --workspace=C:\Projects\myapp

REM Merge completed streams (dry run)
merge-streams.cmd --dry-run --workspace=C:\Projects\myapp
```

## Troubleshooting

### "bash not found"

Install Git Bash or WSL:
- Git Bash: https://git-scm.com/download/win
- WSL: Run `wsl --install` in admin PowerShell

### "tmux not found" (in WSL)

```bash
wsl -d Ubuntu -e sudo apt install tmux
```

### "jq not found"

With Chocolatey:
```cmd
choco install jq
```

Or download from https://stedolan.github.io/jq/download/

### Path conversion issues

If paths aren't converting correctly, use forward slashes:
```cmd
sigma-ralph.cmd --workspace=/c/Projects/myapp
```
