#!/bin/bash
# teammate-idle-handler.sh
# TeammateIdle hook: When a teammate goes idle, check for unblocked pending tasks
# and surface a reminder to the team lead.

set -euo pipefail

TASKS_DIR="$HOME/.claude/tasks"

# Find the active team's task directory
TEAM_DIR=""
for dir in "$TASKS_DIR"/*/; do
  [ -d "$dir" ] && TEAM_DIR="$dir" && break
done

[ -z "$TEAM_DIR" ] && exit 0

# Count pending unblocked tasks
PENDING=0
if command -v jq &>/dev/null; then
  for task_file in "$TEAM_DIR"/*.json 2>/dev/null; do
    [ -f "$task_file" ] || continue
    status=$(jq -r '.status // empty' "$task_file" 2>/dev/null)
    blocked=$(jq -r '.blockedBy // [] | length' "$task_file" 2>/dev/null)
    owner=$(jq -r '.owner // empty' "$task_file" 2>/dev/null)
    if [ "$status" = "pending" ] && [ "$blocked" = "0" ] && [ -z "$owner" ]; then
      PENDING=$((PENDING + 1))
    fi
  done
fi

if [ "$PENDING" -gt 0 ]; then
  echo "$PENDING unblocked task(s) available for assignment. Run TaskList to see them."
fi

exit 0
