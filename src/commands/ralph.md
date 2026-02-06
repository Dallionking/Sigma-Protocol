---
name: ralph
description: "Run Ralph Loop - autonomous story implementation from prd.json backlogs"
triggers:
  - /ralph
  - ralph loop
  - run ralph
  - implement stories
  - autonomous implementation
args:
  - name: backlog
    description: "Path to specific prd.json (optional - auto-detects if omitted)"
    required: false
  - name: engine
    description: "AI engine: claude or opencode (default: claude)"
    required: false
---

# Ralph Loop - Autonomous Implementation

Execute the Ralph Loop to implement stories from your `prd.json` backlog files.

## What is Ralph?

Ralph is an autonomous implementation system that:
1. Reads your `prd.json` backlog (created by Step 5b or Step 11a)
2. Spawns a **fresh Claude Code session** for each story
3. Implements the story following the PRD specification
4. Commits changes after verification
5. Moves to the next story until complete

## Quick Start

```bash
# Auto-detect and run (from project root)
sigma ralph

# Run specific backlog
sigma ralph -b docs/ralph/ios/prd.json

# Run in background
sigma ralph --background

# Run all backlogs
sigma ralph --all
```

## Usage Patterns

### Single Backlog (Interactive)
```bash
cd /path/to/your/project
sigma ralph -b docs/ralph/prototype/prd.json
```

### Multiple Backlogs (Parallel in tmux)
```bash
# Pane 1: iOS
sigma ralph -b docs/ralph/ios/prd.json

# Pane 2: Web
sigma ralph -b docs/ralph/web/prd.json
```

### Background Execution
```bash
sigma ralph -b docs/ralph/ios/prd.json --background
# Monitor with: tail -f docs/ralph/ios/ralph-output.log
```

## Prerequisites

Before running Ralph:

1. **PRDs Created** - Run Step 5 (prototype) or Step 11 (implementation)
2. **JSON Backlog** - Run Step 5b or Step 11a to convert PRDs to `prd.json`
3. **AGENTS.md** - Project has AGENTS.md with coding conventions
4. **Skills Installed** - Project has required skills in `.claude/skills/`

## Backlog Structure

Ralph expects `prd.json` files in `docs/ralph/`:

```
docs/ralph/
├── ios/
│   ├── prd.json      # iOS stories (from Step 5b)
│   └── progress.txt  # Implementation log
├── web/
│   ├── prd.json      # Web stories (from Step 5b)
│   └── progress.txt
└── prototype/
    └── prd.json      # General prototype stories
```

## Options

| Option | Description |
|--------|-------------|
| `-b, --backlog <path>` | Specific prd.json to run |
| `-e, --engine <engine>` | `claude` or `opencode` (default: claude) |
| `--all` | Run all detected backlogs sequentially |
| `--background` | Run detached, log to file |
| `--dry-run` | Preview without executing |
| `-v, --verbose` | Show detailed output |

## How Stories Are Processed

Each story in `prd.json` follows this cycle:

```
┌─────────────────────────────────────────┐
│ 1. Read story from prd.json             │
│ 2. Generate implementation prompt       │
│ 3. Spawn fresh Claude session           │
│ 4. Claude reads AGENTS.md + PRD         │
│ 5. Claude implements the story          │
│ 6. Claude runs acceptance criteria      │
│ 7. If PASS → commit + mark passed       │
│ 8. If FAIL → log + move to next         │
│ 9. Repeat for next story                │
└─────────────────────────────────────────┘
```

## Monitoring Progress

```bash
# Check backlog status
jq '.meta' docs/ralph/ios/prd.json

# Watch live output (background mode)
tail -f docs/ralph/ios/ralph-output.log

# See which stories passed
jq '.stories[] | select(.passes) | .title' docs/ralph/ios/prd.json

# See remaining stories
jq '.stories[] | select(.passes == false) | .title' docs/ralph/ios/prd.json
```

## Troubleshooting

### "No ralph backlogs found"
Run Step 5b or Step 11a to create `prd.json` files:
```bash
# In Claude Code
@step-5b-prd-to-json
```

### "Engine not found: claude"
Install Claude Code CLI:
```bash
claude install  # Recommended (native installer)
# Or legacy: npm install -g @anthropic-ai/claude-code
```

### Story keeps failing
Check the story's acceptance criteria:
```bash
jq '.stories[0].acceptanceCriteria' docs/ralph/ios/prd.json
```

### Want to restart from a specific story
Edit `prd.json` and set `passes: false` on stories to re-run:
```bash
jq '(.stories[] | select(.id == "story-id")) .passes = false' prd.json > tmp.json && mv tmp.json prd.json
```

## Integration with Skills

Ralph workers automatically use skills defined in AGENTS.md:

- `@ball-ai-build` - Build iOS app
- `@ball-ai-simulator` - Launch and validate in simulator
- `@agent-browser` - Web UI validation
- `@gap-analysis` - Verify PRD compliance
- `@systematic-debugging` - Debug errors

## See Also

- `sigma help ralph` - CLI help topic
- Step 5b - Create prototype prd.json
- Step 11a - Create implementation prd.json
- `docs/RALPH-MODE.md` - Full documentation
