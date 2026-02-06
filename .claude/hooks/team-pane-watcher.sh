#!/usr/bin/env bash
# team-pane-watcher.sh — Background process that watches for new team members
#
# Polls ~/.claude/teams/{team-name}/config.json every 2 seconds.
# When a new member appears, creates a labeled iTerm2 pane.
# Exits when config.json disappears (team cleaned up) or after 4-hour safety timeout.
#
# Usage (launched by team-iterm-launcher.sh):
#   team-pane-watcher.sh <team_name> <window_handle> <config_file>
#
# The window_handle is the window name (e.g., "Team: my-team") used by
# the helpers' "first window whose name is X" addressing pattern.
#
# ┌──────────────────────────────────────────────────────────────────────────┐
# │ GUARD: This script manages PANE LAYOUT only.                           │
# │                                                                        │
# │ DO NOT add logic to launch Claude sessions or pass prompts here.       │
# │ Claude Code's runtime handles teammate spawning, prompt delivery,      │
# │ and inter-agent communication via its native mailbox system.           │
# │ This watcher ONLY creates visual panes — Claude manages the agents.   │
# │                                                                        │
# │ See: https://code.claude.com/docs/en/agent-teams                      │
# └──────────────────────────────────────────────────────────────────────────┘

set -uo pipefail
# Note: -e (errexit) intentionally omitted — the watcher loop must survive
# individual command failures (e.g., transient jq parse errors, osascript timeouts).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/iterm-applescript-helpers.sh"

TEAM_NAME="${1:?Usage: team-pane-watcher.sh <team_name> <window_handle> <config_file>}"
WINDOW_HANDLE="${2:?Missing window_handle}"
CONFIG_FILE="${3:?Missing config_file}"

TEMP_PREFIX="/tmp/sigma-team"
MEMBERS_FILE="${TEMP_PREFIX}-${TEAM_NAME}-members"
POLL_INTERVAL=2
SAFETY_TIMEOUT=$((4 * 60 * 60))  # 4 hours in seconds

# Track pane count (starts at 1 for the leader pane)
PANE_COUNT=1

# Ensure members file exists
touch "$MEMBERS_FILE"

start_time=$(date +%s)

while true; do
    # Safety timeout check
    elapsed=$(( $(date +%s) - start_time ))
    if (( elapsed > SAFETY_TIMEOUT )); then
        echo "[watcher] Safety timeout reached (4h). Exiting." >&2
        break
    fi

    # Exit if config.json was removed (team cleaned up)
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo "[watcher] Config file gone — team cleaned up. Exiting." >&2
        break
    fi

    # Read current members from config.json
    current_members=$(jq -r '.members[]?.name // empty' "$CONFIG_FILE" 2>/dev/null)

    if [[ -z "$current_members" ]]; then
        sleep "$POLL_INTERVAL"
        continue
    fi

    # Compare against known members
    while IFS= read -r member_name; do
        [[ -z "$member_name" ]] && continue

        # Skip if already known
        if grep -qxF "$member_name" "$MEMBERS_FILE" 2>/dev/null; then
            continue
        fi

        # New member detected — create a pane
        layout=$(iterm_layout_next_split "$PANE_COUNT")
        target_session=$(echo "$layout" | cut -d' ' -f1)
        direction=$(echo "$layout" | cut -d' ' -f2)

        iterm_split_session "$WINDOW_HANDLE" "$target_session" "$direction" "$member_name"

        # Record this member
        echo "$member_name" >> "$MEMBERS_FILE"
        PANE_COUNT=$((PANE_COUNT + 1))

        echo "[watcher] Created pane for: $member_name (pane #$PANE_COUNT, split session $target_session $direction)" >&2

        # Small delay between pane creations to let iTerm2 settle
        sleep 0.5
    done <<< "$current_members"

    sleep "$POLL_INTERVAL"
done

# Cleanup own PID file on exit
rm -f "${TEMP_PREFIX}-${TEAM_NAME}-watcher.pid" 2>/dev/null || true
