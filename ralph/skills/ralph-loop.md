---
name: ralph-loop
description: "Execute Ralph Loop autonomous implementation. Spawns fresh AI sessions to implement stories from prd.json backlogs sequentially or in parallel with dynamic skill matching."
version: "2.1.0"
triggers:
  - ralph
  - ralph loop
  - run ralph
  - implement stories
  - autonomous implementation
  - start ralph
  - /ralph
disable-model-invocation: true
---

# Ralph Loop - Autonomous Story Implementation

Spawn fresh AI sessions to implement stories from your `prd.json` backlog, one story at a time with clean context.

## What's New in v2.1.0

### Dynamic Skill Registry
- **40+ Skills**: Workers now leverage ALL installed skills, not just 7 hardcoded ones
- **Content Matching**: Skills matched to stories based on triggers, task IDs, file paths, and keywords
- **Relevance Scoring**: Top 8 skills injected with scores so workers know which are most relevant
- **Story-Specific**: Each story gets customized skill recommendations

### Skill Matching Examples
- Story with `UI-001` tasks → `@frontend-design`, `@react-performance`
- Story mentioning "API endpoint" → `@api-design-principles`
- Story with "bug fix" in title → `@systematic-debugging`
- Complex story (iterations > 2) → `@senior-architect`, `@brainstorming`

---

## v2.0.0 Features (Claude Code v2.1.17+)

### Native Task Management
- **TaskCreate/TaskUpdate**: Workers use native Claude Code tasks for sub-task tracking
- **Task Spinner**: Shows current sub-task via `activeForm` (visible in status line)
- **Progress via /tasks**: Use the `/tasks` command to see worker progress
- **blockedBy Dependencies**: Native task dependencies enforce story ordering

### Parallel Execution Mode
- **--parallel flag**: Run all streams concurrently
- **Stream Isolation**: Each stream runs in its own background process
- **Automatic Monitoring**: Progress tracked across all parallel workers

### Plan Mode for Complex Stories
- Stories with `estimatedIterations > 2` automatically trigger EnterPlanMode
- Workers design approach before implementation
- Reduces rework on complex features

### Skill Enforcement Hooks
- PreToolUse hook injects `@frontend-design` reminders for UI files
- Ensures skill delegation matrix is followed at the tool level

### Deprecation: progress.txt
- Progress now tracked in `prd.json` attempts array
- Generate on-demand reports: `./ralph/generate-progress-report.sh`

---

## Quick Usage

### Via Shell Script

```bash
# Sequential execution (default)
./ralph/sigma-ralph.sh \
  --workspace=/path/to/project \
  --mode=prototype

# Parallel execution (v2.0.0+)
./ralph/sigma-ralph.sh \
  --workspace=/path/to/project \
  --mode=implementation \
  --parallel
```

### Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `--workspace=PATH` | Project directory (required) | `--workspace=/path/to/app` |
| `--mode=MODE` | Backlog mode | `--mode=prototype` or `--mode=implementation` |
| `--backlog=PATH` | Custom prd.json path | `--backlog=docs/ralph/custom/prd.json` |
| `--stream=ID` | Filter to specific stream | `--stream=swarm-1` |
| `--engine=ENGINE` | AI engine | `--engine=claude` or `--engine=opencode` |
| `--parallel, -P` | Run streams in parallel (v2.0.0+) | `--parallel` |
| `--dry-run` | Preview without executing | `--dry-run` |
| `--quiet, -q` | Disable activity output | `--quiet` |
| `--timeout=SEC` | Timeout per story | `--timeout=900` |
| `--failure-mode=MODE` | Handle failures: prompt/skip/abort | `--failure-mode=skip` |
| `--auto-restart` | Auto-restart on session timeout | `--auto-restart` |

---

## How Ralph Works

```
For each story in prd.json:
  1. Generate implementation prompt with:
     - Native TaskCreate instructions for sub-tasks
     - Plan mode instruction (if estimatedIterations > 2)
     - Dependency enforcement (if dependsOn exists)
  2. Spawn FRESH Claude/OpenCode session (clean context)
  3. AI reads AGENTS.md (long-term memory)
  4. AI creates native tasks for sub-task tracking
  5. AI reads source PRD and implements story
  6. AI runs acceptance criteria verification
  7. If all pass → commit + mark story passed
  8. If blocked → log reason + continue
  9. Repeat until all stories complete
```

**Key insight:** Each story gets a **completely fresh AI session** - no context pollution between stories.

---

## Native Task Tracking (v2.0.0+)

Workers now use Claude Code's native task management for granular tracking:

### How It Works

1. **At story start**: Worker creates tasks for each sub-task
   ```
   TaskCreate: subject="UI-001: Create header component"
               activeForm="Implementing UI-001..."
   ```

2. **During implementation**: Worker updates task status
   ```
   TaskUpdate: taskId="UI-001" status="in_progress"
   ```

3. **On completion**: Worker marks task completed
   ```
   TaskUpdate: taskId="UI-001" status="completed"
   ```

### Benefits

- **Native spinner** shows current task (visible in CLI)
- **`/tasks` command** shows all task progress
- **Dependencies enforced** via `blockedBy` relationships
- **Better observability** than text-based progress.txt

---

## Parallel Execution Mode

When your backlog has `streams[]` defined (from Step 11b), run them concurrently:

```bash
./ralph/sigma-ralph.sh --workspace=/path --parallel
```

### How It Works

1. Parses `streams[]` array from prd.json
2. Spawns independent Claude session per stream
3. Each stream runs sequentially within itself
4. Monitors all workers with periodic status checks
5. Reports final progress when all complete

### Stream Logs

Each stream writes to its own log file:
```
docs/ralph/prototype/stream-swarm-1.log
docs/ralph/prototype/stream-swarm-2.log
```

### When to Use Parallel Mode

- Backlog has independent streams (no cross-stream dependencies)
- Machine has sufficient resources for multiple Claude sessions
- Faster completion on large backlogs

---

## Progress Reports

Progress tracking has moved from append-only text to structured data.

### Generate Report On-Demand

```bash
./ralph/generate-progress-report.sh docs/ralph/prototype/prd.json
```

### Check Backlog Directly

```bash
# Summary
jq '.meta' docs/ralph/prototype/prd.json

# Passed stories
jq '[.stories[] | select(.passes)] | length' docs/ralph/prototype/prd.json

# Recent attempts
jq '.stories[].lastAttempt | select(. != null)' docs/ralph/prototype/prd.json
```

---

## Structured Planning for Complex Stories

Stories with `estimatedIterations > 2` automatically receive a structured planning instruction.

**Note:** We use inline structured planning instead of `EnterPlanMode` because Ralph runs in autonomous mode where user approval isn't available.

### Planning Checklist (Injected for Complex Stories)

1. **Explore codebase first** - Use Glob/Grep to understand patterns
2. **Design approach** - List files to modify, identify blockers
3. **Use @senior-architect** - Validate approach before coding
4. **Document plan** - Write implementation plan as context

### Why Structured Planning?

Complex stories have higher failure rates when implementations start without exploration. The planning checklist ensures workers:
- Understand existing code patterns
- Identify all affected files
- Consider edge cases
- Get architectural validation

This prevents rework and wasted iterations.

---

## Skill Enforcement

A PreToolUse hook injects skill reminders when editing UI files:

**Triggered for:** `*.tsx`, `*.jsx`, `*.swift`, `*.vue`, `*.svelte`

**Additional Context Injected:**
```
This is a UI file. Before making significant UI changes:
1. Consider using @frontend-design skill
2. Check docs/design/ui-profile.json for design system
3. Use @ui-healer for visual testing after changes
```

This enforces the skill delegation matrix at the tool level, not just in prompts.

---

## Before Running Ralph

### 1. Create PRDs (Step 5 or Step 11)

```bash
# Prototype PRDs
@step-5-wireframe-prototypes

# Implementation PRDs
@step-11-prd-generation
```

### 2. Convert to JSON Backlog

```bash
# For prototypes
@step-5b-prd-to-json

# For implementation
@step-11a-prd-to-json
```

### 3. (Optional) Create Streams for Parallel Execution

```bash
@step-11b-prd-swarm
```

### 4. Verify Backlog

```bash
ls docs/ralph/*/prd.json
jq '.meta.totalStories' docs/ralph/prototype/prd.json
```

---

## Troubleshooting

### No backlogs found
```bash
# Create them first
@step-5b-prd-to-json
```

### Story keeps failing
```bash
# Check acceptance criteria
jq '.stories[0].acceptanceCriteria' docs/ralph/prototype/prd.json

# Check last attempt
jq '.stories[0].lastAttempt' docs/ralph/prototype/prd.json
```

### Reset a story
```bash
jq '(.stories[] | select(.id == "story-id")).passes = false' prd.json > tmp && mv tmp prd.json
```

### No streams for parallel mode
```bash
# Run Step 11b to generate streams
@step-11b-prd-swarm

# Or use sequential mode (default)
./ralph/sigma-ralph.sh --workspace=/path --mode=implementation
```

---

## Dynamic Skill Matching (v2.1.0+)

Ralph now dynamically matches **40+ skills** to each story based on content analysis.

### How It Works

1. **At startup**: Ralph builds a skill registry from `.claude/skills/` and `src/skills/`
2. **For each story**: Analyzes title, description, task IDs, and file paths
3. **Scoring**: Skills are scored based on trigger matches, task prefixes, and keywords
4. **Injection**: Top 8 matching skills are injected into the worker prompt with relevance scores

### Matching Criteria

| Criteria | Points | Example |
|----------|--------|---------|
| Trigger match | +10 | Story mentions "react" → @react-performance |
| Task ID prefix | +8 | UI-001 tasks → @frontend-design |
| File path pattern | +6 | `.tsx` files → @react-performance |
| Keyword match | +4 | "bug fix" → @systematic-debugging |
| Complexity | +3 | Complex stories → @senior-architect |

### Core Workflow Skills (Always Included)

| Skill | Purpose |
|-------|---------|
| `@senior-architect` | Architecture decisions (before coding) |
| `@frontend-design` | UI implementation (enforced by hook) |
| `@systematic-debugging` | Error diagnosis |
| `@gap-analysis` | PRD compliance verification |
| `@senior-qa` | Test validation |
| `@agent-browser-validation` | Web UI testing |

### Example: Story-Specific Skills

A story with title "Create user registration API with validation" might receive:
- `@api-design-principles` (14 pts - trigger: "api", keyword: "validation")
- `@architecture-patterns` (8 pts - task: API-001)
- `@bdd-scenarios` (6 pts - keyword: "validation")
- `@quality-gates` (4 pts - keyword: implied testing)

---

## Architecture

```
prd.json (backlog)
    ↓
sigma-ralph.sh (orchestrator)
    ↓
┌─────────────────────────────────────────────┐
│  Sequential Mode         Parallel Mode       │
│  ─────────────────       ──────────────      │
│  Story 1 → Story 2      Stream 1 ┐          │
│  → Story 3 → ...        Stream 2 ├─ Parallel │
│                         Stream 3 ┘          │
└─────────────────────────────────────────────┘
    ↓
Claude Code Workers (fresh session per story)
    ↓
Native TaskCreate/TaskUpdate (sub-task tracking)
    ↓
prd.json (updated with attempts, passes)
```

---

## Version History

| Version | Changes |
|---------|---------|
| 2.1.0 | Dynamic skill registry matching 40+ skills to stories |
| 2.0.0 | Native task management, parallel mode, plan mode, skill hooks |
| 1.0.0 | Initial release with sequential execution |
