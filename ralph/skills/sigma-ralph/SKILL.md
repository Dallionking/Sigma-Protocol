---
name: sigma-ralph
description: "Orchestrate Ralph Loop autonomous implementation with streams, parallel terminals, and observability"
version: "1.0.0"
triggers:
  - /sigma-ralph
  - sigma ralph orchestrate
  - ralph orchestrate
  - orchestrate ralph
  - spawn ralph terminals
  - parallel ralph
  - ralph with streams
disable-model-invocation: true
---

# Sigma-Ralph: Orchestrated Ralph Loop

Orchestrate Ralph Loop autonomous implementation with multi-stream support, parallel terminal spawning, and real-time observability.

## Quick Usage

```bash
# Interactive - auto-detect and prompt
/sigma-ralph

# Single stream
/sigma-ralph --stream=ios

# All streams in parallel (RECOMMENDED)
/sigma-ralph --all --parallel

# Dry run preview
/sigma-ralph --dry-run
```

## Understanding Terminal Output

When you run `/sigma-ralph`, each **worker tab** shows the live **Claude Code Streaming Output**:

| What You See | Description |
|--------------|-------------|
| `Glob: src/**/*.tsx` | Claude searching for files |
| `Read: src/components/Button.tsx` | Claude reading file contents |
| `Edit: Updated Button component` | Claude making code changes |
| `Bash: npm run build` | Claude running commands |
| `Todo: [✓] Implement login screen` | Progress tracking |

**This is real-time observability.** You see every tool invocation, file read, code edit, and command execution as it happens.

> **Note:** The `--observe` flag creates an extra tab that just runs `tail -f progress.txt` - a simple log of story completion status. This is rarely needed since the worker tabs already show full live execution.

---

## Execution Flow

When invoked, this skill executes the following phases:

### Phase 1: Discovery

Detect all available backlogs and streams in the project:

```bash
#!/bin/bash
# Discovery Phase - Run this first

WORKSPACE="${PWD}"
echo "=== SIGMA-RALPH DISCOVERY ==="
echo "Workspace: $WORKSPACE"
echo ""

# Detect ralph backlogs
echo "📂 Checking for Ralph backlogs..."
BACKLOGS=()

# Pattern 1: docs/ralph/*/prd.json (Ball.AI style)
for backlog in "$WORKSPACE"/docs/ralph/*/prd.json; do
  if [[ -f "$backlog" ]]; then
    PLATFORM=$(basename "$(dirname "$backlog")")
    STORIES=$(jq '.stories | length' "$backlog" 2>/dev/null || echo "?")
    PASSED=$(jq '[.stories[] | select(.passes)] | length' "$backlog" 2>/dev/null || echo "0")
    echo "  - $PLATFORM: $PASSED/$STORIES stories complete"
    BACKLOGS+=("$backlog")
  fi
done

# Pattern 2: .sigma/orchestration/streams.json (SigmaView style)
if [[ -f "$WORKSPACE/.sigma/orchestration/streams.json" ]]; then
  echo ""
  echo "📊 Found Sigma Orchestration streams:"
  jq -r '.streams[] | "  - Stream \(.id): \(.name) (\(.worktree // "main"))"' \
    "$WORKSPACE/.sigma/orchestration/streams.json" 2>/dev/null
fi

# Pattern 3: sigma-manifest.json
if [[ -f "$WORKSPACE/.sigma-manifest.json" ]]; then
  echo ""
  echo "📋 Found Sigma Manifest"
fi

echo ""
if [[ ${#BACKLOGS[@]} -eq 0 ]]; then
  echo "⚠️  No Ralph backlogs found."
  echo "   Run @step-5b-prd-to-json or @step-11a-prd-to-json first."
else
  echo "✅ Found ${#BACKLOGS[@]} backlog(s)"
fi
```

### Phase 2: Selection

Based on user input or interactive prompts:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `--stream=X` | Run specific stream | `--stream=ios`, `--stream=A` |
| `--all` | Run all discovered streams | `--all` |
| `--parallel` | Parallel iTerm/tmux tabs (recommended) | `--all --parallel` |
| `--backend` | Force backend | `--backend=tmux` |
| `--engine` | AI engine | `--engine=claude` |
| `--dry-run` | Preview only | `--dry-run` |
| `--observe` | *(Optional)* Add tail log tab | `--observe` |

If no parameters provided, prompt user:

```
Found backlogs: ios (22 stories), web (19 stories)

How would you like to proceed?
1. Run ios only
2. Run web only
3. Run all sequentially
4. Run all in parallel (opens iTerm tabs)

Enter choice [1-4]:
```

### Phase 3: Backend Detection

Detect available terminal backends in order of preference:

```bash
#!/bin/bash
# Backend Detection

detect_backend() {
  # 1. iTerm2 (macOS only, best experience)
  if [[ "$OSTYPE" == "darwin"* ]] && [[ -d "/Applications/iTerm.app" ]]; then
    echo "iterm"
    return 0
  fi

  # 2. tmux (universal, good experience)
  if command -v tmux &>/dev/null; then
    echo "tmux"
    return 0
  fi

  # 3. Task subagent (in-process fallback)
  echo "task"
  return 0
}

BACKEND=$(detect_backend)
echo "Detected backend: $BACKEND"
```

### Phase 4: Spawn Workers

Based on detected backend, spawn worker sessions. Each worker tab shows:
- **Live Claude Code execution** with tool invocations
- **Real-time file operations** (reads, edits, writes)
- **Bash command output** (builds, tests, installs)
- **Progress updates** as stories complete

#### iTerm2 (macOS)

```bash
#!/bin/bash
# Use ralph/iterm-spawn.sh
"$WORKSPACE/ralph/iterm-spawn.sh" \
  --project="$WORKSPACE" \
  --backlogs="$SELECTED_BACKLOGS" \
  --observe
```

#### tmux (Universal)

```bash
#!/bin/bash
# Use ralph/tmux-spawn.sh
"$WORKSPACE/ralph/tmux-spawn.sh" \
  --project="$WORKSPACE" \
  --backlogs="$SELECTED_BACKLOGS"
```

#### Task Subagent (In-Process Fallback)

When no terminal multiplexer is available, use Claude Code's Task tool:

```markdown
For each backlog, spawn a Task subagent:

Task tool call:
- subagent_type: Bash
- description: "Ralph worker for ios backlog"
- prompt: "Execute ralph/sigma-ralph.sh --workspace=. --backlog=docs/ralph/ios/prd.json"
- run_in_background: true
```

### Phase 5: Real-Time Monitoring

**Worker tabs = True Observability**

Each worker tab runs Claude Code with full streaming output. You see:
- Every `Glob`, `Read`, `Grep` tool invocation
- Every `Edit`, `Write` file modification
- Every `Bash` command execution
- Every `Todo` status update
- Error messages and debugging steps

This is the "execution log" or "real-time transcript" - no extra setup needed.

**Optional: `--observe` flag**

The `--observe` flag adds an extra tab that runs `tail -f progress.txt` for a simple summary log:
```
[2025-01-21 10:32:15] ✅ web-01-onboarding-screen PASSED
[2025-01-21 10:35:42] ✅ web-02-navigation PASSED
[2025-01-21 10:38:19] ❌ web-03-form-validation FAILED (retrying)
```

This is rarely needed since worker tabs already show full context.

---

## CRITICAL: Skill Delegation

Workers spawned by sigma-ralph MUST use specialized skills. Direct implementation is NOT allowed.

### Skill Matrix

| Task Type | Required Skill | When to Use |
|-----------|----------------|-------------|
| Architecture | `@senior-architect` | BEFORE any coding |
| UI Components | `@frontend-design` | ALL UI work (React, SwiftUI) |
| File Scaffolding | `@scaffold` | New features requiring multiple files |
| Error Diagnosis | `@systematic-debugging` | When errors occur |
| PRD Compliance | `@gap-analysis` | AFTER implementing each story |
| Test Validation | `@qa-engineer` | Verify acceptance criteria |
| Web UI Testing | `agent-browser CLI` | Web projects UI validation |

### Prompt Injection (Auto-Detected Skills)

The skill automatically detects and injects skill directories:

```bash
#!/bin/bash
# Detect available skill directories

detect_skills() {
  local workdir="$1"
  local found=""

  for dir in ".claude/skills" ".opencode/skills" ".skills"; do
    if [[ -d "$workdir/$dir" ]]; then
      found+="- $dir\n"
    fi
  done

  echo -e "$found"
}

SKILLS=$(detect_skills "$WORKSPACE")
```

This injects into worker prompts:

```markdown
## Agent Skills (Auto-Detected)

This repo includes skill docs:
${SKILLS}

### CRITICAL: Use These Skills, Don't Implement Directly

Before implementing, load and use the appropriate skill:

| Task Type | Skill to Use |
|-----------|--------------|
| Architecture decisions | @senior-architect |
| UI components | @frontend-design |
| Error diagnosis | @systematic-debugging |
| PRD compliance | @gap-analysis |
| Test validation | @qa-engineer |

DO NOT implement everything yourself. Delegate to specialized skills.
```

---

## Agent-Browser Validation

For web projects, validate UI with agent-browser CLI:

```bash
#!/bin/bash
# Web UI Validation Pattern

validate_web_ui() {
  local route="$1"
  local story_id="$2"

  # Start dev server if not running
  if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
    npm run dev &
    sleep 5
  fi

  # Open and snapshot
  agent-browser open "http://localhost:3000${route}"
  SNAPSHOT=$(agent-browser snapshot -i 2>&1)

  # Check for errors
  if echo "$SNAPSHOT" | grep -qi "error\|exception\|500\|404"; then
    echo "RALPH_UI_VALIDATION_FAILED: Error detected"
    return 1
  fi

  # Screenshot as evidence
  agent-browser screenshot "validation-${story_id}.png"

  echo "RALPH_UI_VALIDATION_PASSED"
  return 0
}
```

---

## QA Engineer Integration

Use `@qa-engineer` agent for test validation:

```markdown
After implementing a story, invoke QA validation:

"@qa-engineer: Validate the implementation against these acceptance criteria:
- AC-1: User can see onboarding screen
- AC-2: Button triggers navigation
- AC-3: Form validates email format

Run the test suite and report any failures."
```

---

## Full Execution Script

Run this complete script to execute sigma-ralph:

```bash
#!/bin/bash
set -euo pipefail

# =================================================================
# SIGMA-RALPH ORCHESTRATOR
# =================================================================

WORKSPACE="${PWD}"
STREAM=""
ALL=false
PARALLEL=false
OBSERVE=false
BACKEND="auto"
ENGINE="claude"
DRY_RUN=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --stream=*) STREAM="${1#*=}"; shift ;;
    --all) ALL=true; shift ;;
    --parallel) PARALLEL=true; shift ;;
    --observe) OBSERVE=true; shift ;;
    --backend=*) BACKEND="${1#*=}"; shift ;;
    --engine=*) ENGINE="${1#*=}"; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) shift ;;
  esac
done

# Phase 1: Discovery
log_info "=== PHASE 1: DISCOVERY ==="
BACKLOGS=()

for backlog in "$WORKSPACE"/docs/ralph/*/prd.json; do
  if [[ -f "$backlog" ]]; then
    BACKLOGS+=("$backlog")
  fi
done

if [[ ${#BACKLOGS[@]} -eq 0 ]]; then
  log_error "No Ralph backlogs found. Run @step-5b-prd-to-json first."
  exit 1
fi

log_success "Found ${#BACKLOGS[@]} backlog(s)"
for b in "${BACKLOGS[@]}"; do
  PLATFORM=$(basename "$(dirname "$b")")
  STORIES=$(jq '.stories | length' "$b" 2>/dev/null || echo "?")
  log_info "  - $PLATFORM: $STORIES stories"
done

# Phase 2: Selection
log_info "=== PHASE 2: SELECTION ==="
SELECTED=()

if [[ -n "$STREAM" ]]; then
  # Find matching backlog
  for b in "${BACKLOGS[@]}"; do
    PLATFORM=$(basename "$(dirname "$b")")
    if [[ "$PLATFORM" == "$STREAM" ]] || [[ "$PLATFORM" == "$STREAM"* ]]; then
      SELECTED+=("$b")
    fi
  done
elif [[ "$ALL" == true ]]; then
  SELECTED=("${BACKLOGS[@]}")
else
  log_warn "No stream specified. Use --stream=X or --all"
  exit 1
fi

log_success "Selected ${#SELECTED[@]} backlog(s) for execution"

# Phase 3: Backend Detection
log_info "=== PHASE 3: BACKEND DETECTION ==="

if [[ "$BACKEND" == "auto" ]]; then
  if [[ "$OSTYPE" == "darwin"* ]] && [[ -d "/Applications/iTerm.app" ]]; then
    BACKEND="iterm"
  elif command -v tmux &>/dev/null; then
    BACKEND="tmux"
  else
    BACKEND="task"
  fi
fi

log_success "Using backend: $BACKEND"

# Phase 4: Spawn
log_info "=== PHASE 4: SPAWNING WORKERS ==="

if [[ "$DRY_RUN" == true ]]; then
  log_warn "[DRY RUN] Would spawn workers for:"
  for b in "${SELECTED[@]}"; do
    PLATFORM=$(basename "$(dirname "$b")")
    echo "  - $PLATFORM: $b"
  done
  exit 0
fi

SCRIPT_DIR="$WORKSPACE/ralph"

case "$BACKEND" in
  iterm)
    if [[ -f "$SCRIPT_DIR/iterm-spawn.sh" ]]; then
      BACKLOG_LIST=$(IFS=,; echo "${SELECTED[*]}" | sed 's|'"$WORKSPACE/"'||g')
      "$SCRIPT_DIR/iterm-spawn.sh" \
        --project="$WORKSPACE" \
        --backlogs="$BACKLOG_LIST" \
        ${OBSERVE:+--observe} \
        --engine="$ENGINE"
    else
      log_error "iterm-spawn.sh not found"
      exit 1
    fi
    ;;

  tmux)
    if [[ -f "$SCRIPT_DIR/tmux-spawn.sh" ]]; then
      BACKLOG_LIST=$(IFS=,; echo "${SELECTED[*]}" | sed 's|'"$WORKSPACE/"'||g')
      "$SCRIPT_DIR/tmux-spawn.sh" \
        --project="$WORKSPACE" \
        --backlogs="$BACKLOG_LIST" \
        --engine="$ENGINE"
    else
      log_error "tmux-spawn.sh not found"
      exit 1
    fi
    ;;

  task)
    log_info "Using Task subagent (in-process execution)"
    for b in "${SELECTED[@]}"; do
      PLATFORM=$(basename "$(dirname "$b")")
      log_info "Launching Task subagent for: $PLATFORM"
      # Note: This would be executed via Claude Code's Task tool
      echo "Task: sigma-ralph.sh --workspace=$WORKSPACE --backlog=$b --engine=$ENGINE"
    done
    ;;
esac

# Phase 5: Observability
if [[ "$OBSERVE" == true ]] && [[ "$BACKEND" != "iterm" ]]; then
  log_info "=== PHASE 5: OBSERVABILITY ==="

  LOGS=()
  for b in "${SELECTED[@]}"; do
    DIR=$(dirname "$b")
    [[ -f "$DIR/progress.txt" ]] && LOGS+=("$DIR/progress.txt")
    [[ -f "$DIR/ralph-output.log" ]] && LOGS+=("$DIR/ralph-output.log")
  done

  if [[ ${#LOGS[@]} -gt 0 ]]; then
    log_info "Tailing logs: ${LOGS[*]}"
    tail -f "${LOGS[@]}" &
  fi
fi

log_success "Workers spawned successfully"
```

---

## Project Detection Matrix

| Project Type | Detection | Backlogs |
|--------------|-----------|----------|
| Ball.AI | `docs/ralph/ios/` + `docs/ralph/web/` | ios, web |
| SigmaView | `.sigma/orchestration/streams.json` | Streams A, B, C, E |
| Sigma-Protocol | `docs/ralph/prototype/` | prototype |
| Generic | `docs/ralph/*/prd.json` | All discovered |

---

## Troubleshooting

### Where do I see live execution?
The **worker tabs** (not observer tab) show full Claude Code streaming output - every tool call, file edit, and command execution in real-time.

### No backlogs found
```bash
# Create backlogs first
@step-5b-prd-to-json
# or
@step-11a-prd-to-json
```

### iTerm not opening
```bash
# Check iTerm is installed
ls -la /Applications/iTerm.app

# Fall back to tmux
/sigma-ralph --stream=ios --backend=tmux
```

### tmux session exists
```bash
# Kill existing session
tmux kill-session -t sigma-ralph

# Re-run
/sigma-ralph --all --backend=tmux
```

### Engine not found
```bash
# Install Claude Code
claude install  # Recommended (native installer)
# Or legacy: npm install -g @anthropic-ai/claude-code

# Or use OpenCode
/sigma-ralph --stream=ios --engine=opencode
```

---

## See Also

- `@ralph-loop` - Basic Ralph execution without orchestration
- `@ralph-tail` - Tail Ralph logs
- `@gap-analysis` - PRD compliance verification
- `@qa-engineer` - Test validation
- `docs/RALPH-MODE.md` - Full documentation
