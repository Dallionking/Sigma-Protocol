# Ralph - Autonomous Implementation Loop

Ralph is the autonomous implementation mode of Sigma Protocol. After completing the planning and PRD generation phases (Steps 1-11), Ralph takes your PRD backlog and implements features autonomously in a continuous loop.

## What is Ralph?

Ralph (Rapid Autonomous Loop for Product Handling) is a bash orchestration system that:
- **Reads a PRD backlog** (JSON format) with prioritized features
- **Spawns AI coding sessions** (Claude Code, Cursor, OpenCode, etc.) to implement each feature
- **Monitors progress** via task completion and quality gates
- **Loops continuously** until all PRDs are implemented

Think of Ralph as your autonomous implementation assistant that works 24/7, respecting dependencies and running parallel streams when possible.

## Quick Start

### Prerequisites

- **Claude Code** (or compatible AI coding tool: Cursor, OpenCode, Codex, Factory Droid)
- **Completed Sigma Protocol Steps 1-11** (or at minimum Step 5 for prototyping)
- **PRD backlog in JSON format** (see schemas/ for structure)

### Usage

**Mode 1: Prototype Implementation (After Step 5)**

```bash
# 1. Convert prototype PRDs to JSON
claude "Run /prd-json --input docs/prds/flows/ --output docs/ralph/prototype/prd.json"

# 2. Run Ralph loop
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

**Mode 2: Full Implementation (After Step 11)**

```bash
# 1. Convert implementation PRDs to JSON
claude "Run /prd-json --input docs/prds/ --output docs/ralph/implementation/prd.json"

# 2. (Optional) Organize into swarms for parallel execution
claude "Run /prd-swarm --terminals 4 --visualize"

# 3. Run Ralph loop (single stream)
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code

# OR run in parallel (one terminal per swarm)
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-1/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-2/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-3/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-4/prd.json claude-code &
```

## Directory Structure

```
ralph/
├── README.md                       # This file
├── sigma-ralph.sh                  # Main Ralph loop orchestrator
├── skill-registry.sh               # Dynamic skill matching system
├── iterm-spawn.sh                  # iTerm2 terminal spawner
├── tmux-spawn.sh                   # tmux terminal spawner
├── ralph-iterm.sh                  # iTerm2 integration wrapper
├── generate-progress-report.sh     # Progress reporting
├── tail-logs.sh                    # Log monitoring utility
├── schemas/                        # JSON schemas
│   ├── ralph-backlog.schema.json   # PRD backlog structure
│   └── ralph-prd-map.schema.json   # PRD dependency mapping
├── docs/                           # Documentation
│   ├── RALPH-MODE.md               # Detailed Ralph guide
│   ├── RALPH-SKILL-REGISTRY.md     # Skill matching system docs
│   └── NATIVE-TASK-INTEGRATION.md  # Task management integration
├── commands/                       # Sigma Protocol commands
│   ├── prd-json.md                 # /prd-json command (PRD → JSON conversion)
│   ├── prototype-prep.md           # Step 5a: Prototype preparation
│   └── prd-swarm.md                # Step 11b: Swarm orchestration
├── skills/                         # Ralph-specific skills
│   ├── ralph-loop.md               # Ralph loop skill
│   └── sigma-ralph/                # Sigma Ralph skill package
│       └── SKILL.md
└── hooks/                          # Git hooks
    └── ralph-skill-enforcement.sh  # Skill enforcement hook
```

## How It Works

### 1. PRD Conversion

The `/prd-json` command converts your markdown PRDs into a structured JSON backlog that Ralph can consume. The JSON includes:
- Feature metadata (priority, complexity, dependencies)
- Implementation tasks
- Quality gates and acceptance criteria
- Skill requirements

### 2. Ralph Loop Execution

Once you have a `prd.json` backlog, Ralph:
1. **Reads the backlog** and identifies the next highest-priority PRD
2. **Checks dependencies** (blocks until dependent PRDs complete)
3. **Spawns a coding session** (new terminal/tmux pane)
4. **Injects the PRD context** into the AI agent
5. **Monitors task completion** via Claude Code native task system
6. **Runs quality gates** (tests, linting, security checks)
7. **Marks PRD as complete** and moves to the next one
8. **Repeats** until backlog is empty

### 3. Parallel Swarms (Optional)

For large projects (10+ PRDs), you can use `/prd-swarm` to analyze the dependency graph and split the backlog into independent "swarms" that can run in parallel terminals:

```bash
# Analyze and create 4 swarms
claude "Run /prd-swarm --terminals 4 --visualize"

# Output: swarm-1/, swarm-2/, swarm-3/, swarm-4/ directories
# Each contains an independent subset of the backlog
```

Then run Ralph on each swarm simultaneously for 4x speedup.

## Configuration

### Supported AI Coding Tools

- **Claude Code** (default) - `claude-code`
- **Cursor** - `cursor`
- **OpenCode** - `opencode`
- **Codex** - `codex`
- **Factory Droid** - `factory-droid`

### Terminal Managers

- **iTerm2** (macOS) - Recommended for visual tab management
- **tmux** - Recommended for SSH/headless environments
- **Native terminal** - Fallback (single stream only)

### Environment Variables

```bash
# Override default coding tool
export RALPH_TOOL="cursor"

# Override terminal manager
export RALPH_TERMINAL="tmux"

# Enable debug logging
export RALPH_DEBUG=1

# Set max parallel streams
export RALPH_MAX_STREAMS=4
```

## Monitoring Progress

### Real-Time Logs

```bash
# Tail logs for all active Ralph sessions
./ralph/tail-logs.sh

# Tail logs for specific swarm
./ralph/tail-logs.sh swarm-1
```

### Progress Report

```bash
# Generate progress report
./ralph/generate-progress-report.sh docs/ralph/implementation/prd.json
```

Output includes:
- PRDs completed / total
- Current PRD in progress
- Blocked PRDs (dependency issues)
- Estimated time remaining
- Quality gate pass/fail rates

## Documentation

For detailed information, see:

- **[docs/RALPH-MODE.md](docs/RALPH-MODE.md)** - Complete Ralph guide with examples
- **[docs/RALPH-SKILL-REGISTRY.md](docs/RALPH-SKILL-REGISTRY.md)** - How skill matching works
- **[docs/NATIVE-TASK-INTEGRATION.md](docs/NATIVE-TASK-INTEGRATION.md)** - Task management integration
- **[commands/prd-json.md](commands/prd-json.md)** - PRD → JSON conversion reference
- **[commands/prd-swarm.md](commands/prd-swarm.md)** - Swarm orchestration reference

## Troubleshooting

### Ralph won't start

- Verify `prd.json` is valid: `jq . docs/ralph/implementation/prd.json`
- Check Claude Code is installed: `claude --version`
- Ensure project root is a git repository

### PRDs stuck in "blocked" state

- Review dependency graph: `claude "Run /prd-swarm --visualize"`
- Check for circular dependencies
- Manually complete blocking PRD

### Quality gates failing

- Review test output in session logs
- Check `.ralph/logs/` for detailed error messages
- Adjust quality gate thresholds in `prd.json`

### Session crashes

- Check terminal manager is running (iTerm2 or tmux)
- Verify sufficient system resources (CPU, memory)
- Review crash logs in `.ralph/logs/crashes/`

## Contributing

Ralph is part of the Sigma Protocol. To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a PR with test coverage
4. Follow the contribution guidelines in the main README

## License

Same as Sigma Protocol (MIT)
