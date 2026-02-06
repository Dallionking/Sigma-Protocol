#!/bin/bash
# task-completed-handler.sh
# TaskCompleted hook: When a task completes, check if it unblocks
# Devil's Advocate or Gap Analyst tasks and notify.

set -euo pipefail

TASKS_DIR="$HOME/.claude/tasks"

# Find the active team's task directory
TEAM_DIR=""
for dir in "$TASKS_DIR"/*/; do
  [ -d "$dir" ] && TEAM_DIR="$dir" && break
done

[ -z "$TEAM_DIR" ] && exit 0

# Check for Devil's Advocate or Gap Analyst tasks that might be unblocked
if command -v jq &>/dev/null; then
  for task_file in "$TEAM_DIR"/*.json 2>/dev/null; do
    [ -f "$task_file" ] || continue
    subject=$(jq -r '.subject // empty' "$task_file" 2>/dev/null)
    status=$(jq -r '.status // empty' "$task_file" 2>/dev/null)

    # Check if this is a review gate task that's still pending
    if [ "$status" = "pending" ]; then
      case "$subject" in
        *"Devil's Advocate"*|*"devils-advocate"*|*"Gap Analyst"*|*"gap-analyst"*)
          # Check if all blockers are resolved
          blocked=$(jq -r '[.blockedBy[]? as $id | input | select(.id == $id and .status != "completed")] | length' "$task_file" 2>/dev/null || echo "unknown")
          if [ "$blocked" = "0" ]; then
            echo "Review gate unblocked: $subject is ready to start."
          fi
          ;;
      esac
    fi
  done
fi

exit 0
