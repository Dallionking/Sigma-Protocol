# Ralph + Native Task Integration Spec

**Version:** 1.0.0-alpha.1
**Status:** Implemented (v3.0.0)
**Date:** 2026-01-24

## Overview

This spec describes how Ralph can leverage Claude Code's native task system for sub-task tracking while maintaining the JSON backlog for story-level orchestration.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     RALPH ORCHESTRATOR                          │
│                    (sigma-ralph.sh v3.0)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   JSON Backlog      │    │   Native Task Layer             │ │
│  │   (prd.json)        │    │   (CLAUDE_CODE_TASK_LIST_ID)    │ │
│  ├─────────────────────┤    ├─────────────────────────────────┤ │
│  │ • Story definitions │    │ • Story parent tasks            │ │
│  │ • Acceptance criteria│   │ • Sub-task tracking             │ │
│  │ • Attempt history   │    │ • blockedBy dependencies        │ │
│  │ • Stream groupings  │    │ • Real-time /tasks visibility   │ │
│  │ • Design constraints│    │ • Session persistence           │ │
│  │ • Learnings log     │    │                                 │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## What Changes

### 1. Task List Persistence

**Before (v2.x):**
```bash
# Each Claude session starts fresh
claude --dangerously-skip-permissions -p "$PROMPT"
```

**After (v3.0):**
```bash
# Set task list ID for persistence across sessions
export CLAUDE_CODE_TASK_LIST_ID="ralph-$(date +%s)"

# All sessions share the same task list
claude --dangerously-skip-permissions -p "$PROMPT"
```

### 2. Story → Parent Task Mapping

When Ralph picks up a story from JSON, it creates a parent task:

```bash
# In story processing loop
story_task_id=$(create_native_task "$story_id" "$story_title")

# Inject into prompt
PROMPT="
You are working on task $story_task_id: $story_title

Use TaskUpdate to mark progress:
- Set status 'in_progress' when starting
- Set status 'completed' when done
- Use blockedBy if you need to wait on something
"
```

### 3. Sub-Task Creation by Agents

Agents can create sub-tasks that reference the parent:

```typescript
// Agent creates sub-task
await TaskCreate({
  subject: "Implement login form validation",
  description: "Add client-side validation for email/password fields",
  activeForm: "Implementing form validation"
});

// Link to parent via blockedBy (for sequential work)
await TaskUpdate({
  taskId: "subtask-1",
  addBlockedBy: ["parent-story-task"]
});
```

### 4. Progress Monitoring

**Before:** Parse Claude output for "[STORY_COMPLETE]" markers
**After:** Poll native task status

```bash
# Check task completion
task_status=$(claude -p "Use TaskGet for task $task_id and return only the status field")

if [[ "$task_status" == "completed" ]]; then
  mark_story_complete "$story_id"
fi
```

## What Stays the Same

The JSON backlog (`prd.json`) remains the source of truth for:

| Feature | Why JSON Required |
|---------|-------------------|
| Story definitions | Rich metadata (source PRD, line ranges, step) |
| Acceptance criteria | Verification commands, expected behaviors |
| Attempt history | Track what worked/failed across sessions |
| Stream groupings | Parallel execution batches |
| Design system | Typography, colors, component rules |
| Learnings | Accumulated knowledge for future attempts |

## Implementation Plan

### Phase 1: Environment Setup
```bash
# Add to sigma-ralph.sh initialization
export CLAUDE_CODE_TASK_LIST_ID="ralph-${PROJECT_NAME}-$(date +%s)"
echo "Task List ID: $CLAUDE_CODE_TASK_LIST_ID" >> "$LOG_FILE"
```

### Phase 2: Parent Task Creation
```bash
# Add function to create native task for story
create_story_task() {
  local story_id="$1"
  local story_title="$2"

  # Generate TaskCreate instruction for Claude
  cat << EOF
Use TaskCreate with:
- subject: "[$story_id] $story_title"
- description: "Story from Ralph backlog"
- activeForm: "Implementing $story_id"
EOF
}
```

### Phase 3: Progress Tracking
```bash
# Add function to check task status
check_story_task_status() {
  local task_id="$1"

  claude --print -p "Use TaskGet for task $task_id. Return JSON: {status, owner}"
}
```

### Phase 4: Completion Sync
```bash
# Sync native task completion back to JSON backlog
sync_task_to_backlog() {
  local story_id="$1"
  local task_status="$2"

  if [[ "$task_status" == "completed" ]]; then
    jq ".stories |= map(if .id == \"$story_id\" then .status = \"done\" else . end)" \
      "$BACKLOG_FILE" > tmp.json && mv tmp.json "$BACKLOG_FILE"
  fi
}
```

## Benefits

| Benefit | Description |
|---------|-------------|
| **Persistence** | Tasks survive context resets via `CLAUDE_CODE_TASK_LIST_ID` |
| **Visibility** | User can run `/tasks` to see real-time progress |
| **Dependencies** | Native `blockedBy` for task ordering |
| **Sub-agent coordination** | Tasks shared across spawned agents |
| **Reduced parsing** | No more parsing Claude output for markers |

## Migration Path

1. **v2.x → v3.0**: Add native task layer alongside existing JSON backlog
2. **Backwards compatible**: If no `CLAUDE_CODE_TASK_LIST_ID`, falls back to v2.x behavior
3. **Gradual adoption**: Projects can opt-in to native task tracking

## Example Session

```bash
# 1. Start Ralph with task persistence
export CLAUDE_CODE_TASK_LIST_ID="ralph-myapp-1706140800"
./ralph/sigma-ralph.sh . docs/ralph/prd.json claude-code

# 2. Ralph creates parent task for first story
# → TaskCreate: "[F01-001] User Registration Form"

# 3. Agent works on story, creates sub-tasks
# → TaskCreate: "Add email validation"
# → TaskCreate: "Add password strength meter"
# → TaskUpdate: blockedBy on parent

# 4. User checks progress anytime
claude "/tasks"
# Shows:
# ├── [F01-001] User Registration Form (in_progress)
# │   ├── Add email validation (completed)
# │   └── Add password strength meter (in_progress)

# 5. Story completes, Ralph syncs to JSON backlog
# → JSON updated: F01-001.status = "done"
# → Picks up next story: F01-002
```

## Conclusion

Native tasks enhance Ralph without replacing it. The JSON backlog remains essential for:
- Story-level orchestration
- Rich acceptance criteria
- Attempt history and learnings
- Design system enforcement

Native tasks add:
- Session persistence
- Real-time visibility
- Sub-agent coordination
- Dependency management

**Recommendation:** Implement Phase 1-2 first (environment + parent tasks), then iterate based on real-world usage.

---

## Implementation Details (v3.0.0)

This spec has been implemented in `sigma-ralph.sh` v3.0.0.

### CLI Flags

```bash
--native-tasks         Enable Claude Code native task tracking
--task-list-id=ID      Use specific task list ID (for resume across sessions)
--no-native-tasks      Force disable native tasks (override env var)
```

### Key Functions Added

| Function | Purpose |
|----------|---------|
| `init_native_tasks()` | Initialize task list ID, export env var, store in prd.json |
| `create_story_parent_task()` | Generate parent task instructions for worker prompt |
| `update_backlog_atomic()` | Thread-safe backlog updates with file locking |

### Atomic Backlog Updates

Both `mark_story_passed()` and `record_attempt()` now use `flock` for thread safety:

```bash
update_backlog_atomic() {
    local jq_filter="$1"
    local lock_file="${BACKLOG}.lock"
    (
        flock -x -w 30 200 || { log_error "Lock timeout"; return 1; }
        jq "$jq_filter" "$BACKLOG" > "${BACKLOG}.tmp"
        mv "${BACKLOG}.tmp" "$BACKLOG"
    ) 200>"$lock_file"
}
```

### Backward Compatibility

- All changes gated behind `NATIVE_TASKS_ENABLED=true`
- Default behavior (no flags) = v2.2.0 behavior
- MARKER output (`RALPH_STORY_COMPLETE`) always included (native tasks are additive)
- Existing prd.json files work without modification

### Resume Capability

The task list ID is stored in `prd.json`:

```json
{
  "meta": {
    "taskListId": "ralph-myproject-1706140800"
  }
}
```

To resume:

```bash
TASK_ID=$(jq -r '.meta.taskListId' prd.json)
./ralph/sigma-ralph.sh . prd.json claude-code --task-list-id="$TASK_ID"
```
