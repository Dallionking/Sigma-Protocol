---
name: ralph-loop
description: "Execute Ralph Loop autonomous implementation. Spawns fresh AI sessions to implement stories from prd.json backlogs sequentially."
version: "1.0.0"
triggers:
  - ralph
  - ralph loop
  - run ralph
  - implement stories
  - autonomous implementation
  - start ralph
  - /ralph
---

# Ralph Loop - Autonomous Story Implementation

Spawn fresh AI sessions to implement stories from your `prd.json` backlog, one story at a time with clean context.

## Quick Usage

### Via Sigma CLI (Recommended)

```bash
# Auto-detect backlogs in current project
sigma ralph

# Run specific backlog
sigma ralph -b docs/ralph/ios/prd.json

# Run in background (for long-running loops)
sigma ralph -b docs/ralph/ios/prd.json --background

# Run all detected backlogs
sigma ralph --all
```

### Via Shell Script (Direct)

```bash
# From Sigma-Protocol directory
./scripts/ralph/sigma-ralph.sh \
  --workspace=/path/to/project \
  --backlog=docs/ralph/ios/prd.json \
  --engine=claude
```

---

## What Ralph Does

```
For each story in prd.json:
  1. Generate implementation prompt
  2. Spawn FRESH Claude/OpenCode session (clean context)
  3. AI reads AGENTS.md (long-term memory)
  4. AI reads progress.txt (short-term memory)
  5. AI reads source PRD
  6. AI implements the story
  7. AI runs acceptance criteria
  8. If all pass → commit + mark story passed
  9. If blocked → log reason + continue
  10. Repeat until all stories complete
```

**Key insight:** Each story gets a **completely fresh AI session** - no context pollution between stories.

---

## Before Running Ralph

### 1. Create PRDs (Step 5 or Step 11)

```bash
# Prototype PRDs
@step-5-wireframe-prototypes

# Implementation PRDs
@step-11-prd-generation
```

### 2. Convert to JSON Backlog (Step 5b or Step 11a)

```bash
# Converts PRDs → docs/ralph/{platform}/prd.json
@step-5b-prd-to-json

# Or for implementation
@step-11a-prd-to-json
```

### 3. Verify Backlog Exists

```bash
ls docs/ralph/*/prd.json
```

---

## Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-t, --target` | Project directory | `-t /path/to/project` |
| `-b, --backlog` | Specific prd.json | `-b docs/ralph/ios/prd.json` |
| `-e, --engine` | AI engine | `-e claude` or `-e opencode` |
| `--all` | Run all backlogs | `sigma ralph --all` |
| `--background` | Detached mode | Logs to `ralph-output.log` |
| `--dry-run` | Preview only | Shows prompts without executing |
| `-v, --verbose` | Detailed output | Debug mode |

---

## Parallel Execution (Tmux)

Run multiple backlogs simultaneously:

```bash
# Create tmux session with 2 panes
tmux new-session -d -s ralph
tmux split-window -h

# iOS in left pane
tmux send-keys -t ralph:0.0 'sigma ralph -b docs/ralph/ios/prd.json' Enter

# Web in right pane
tmux send-keys -t ralph:0.1 'sigma ralph -b docs/ralph/web/prd.json' Enter

# Attach
tmux attach -t ralph
```

---

## Monitoring Progress

### Check Backlog Status

```bash
# Summary
jq '.meta' docs/ralph/ios/prd.json

# Passed stories
jq '[.stories[] | select(.passes)] | length' docs/ralph/ios/prd.json

# Remaining stories
jq '.stories[] | select(.passes == false) | .title' docs/ralph/ios/prd.json
```

### Watch Live Output

```bash
# Background mode
tail -f docs/ralph/ios/ralph-output.log

# Or check progress.txt
cat docs/ralph/ios/progress.txt
```

---

## Story Lifecycle

Each story in `prd.json`:

```json
{
  "id": "ios-01-onboarding",
  "title": "Implement onboarding flow",
  "priority": 1,
  "passes": false,
  "source": {
    "prdPath": "docs/prds/flows/ios/01-onboarding/FLOW-ONBOARDING.md"
  },
  "acceptanceCriteria": [
    {"id": "ac-1", "type": "command", "command": "xcodegen generate"},
    {"id": "ac-2", "type": "command", "command": "@ball-ai-build"},
    {"id": "ac-3", "type": "file-exists", "filePath": "..."},
    {"id": "ac-ui", "type": "ui-validation", "skill": "@ball-ai-simulator"}
  ]
}
```

When story completes: `passes` → `true`, commit created, next story starts.

---

## Skills Used by Ralph Workers

Configure in your project's `AGENTS.md`:

| Skill | Purpose |
|-------|---------|
| `@senior-architect` | Architecture decisions |
| `@frontend-design` | UI implementation |
| `@systematic-debugging` | Error diagnosis |
| `@gap-analysis` | PRD compliance |
| `@ball-ai-build` | iOS build (project-specific) |
| `@ball-ai-simulator` | iOS testing (project-specific) |
| `@agent-browser` | Web UI validation |

---

## Troubleshooting

### No backlogs found
```bash
# Create them first
@step-5b-prd-to-json
```

### Engine not found
```bash
# Install Claude Code
claude install  # Recommended (native installer)
# Or legacy: npm install -g @anthropic-ai/claude-code

# Or OpenCode
npm install -g opencode
```

### Story keeps failing
```bash
# Check acceptance criteria
jq '.stories[0].acceptanceCriteria' docs/ralph/ios/prd.json

# Check last attempt
jq '.stories[0].lastAttempt' docs/ralph/ios/prd.json
```

### Reset a story
```bash
jq '(.stories[] | select(.id == "story-id")).passes = false' prd.json > tmp && mv tmp prd.json
```

---

## Example: Ball.ai

```bash
# Navigate to project
cd "/Users/dallionking/Sigma Projects/Client Projects/Ball-Ai"

# Check available backlogs
sigma ralph
# Output: Found ios (22 stories), web (19 stories)

# Run iOS prototype implementation
sigma ralph -b docs/ralph/ios/prd.json

# Or run both in background
sigma ralph --all --background
```
