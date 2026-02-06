#!/usr/bin/env bash
# team-iterm-launcher.sh — PostToolUse hook for Teammate tool
#
# Triggers on Teammate tool calls:
#   - spawnTeam: Creates iTerm2 window + starts background watcher
#   - cleanup: Kills watcher + cleans temp files
#
# Hook receives JSON on stdin with tool_name, tool_input, tool_result fields.
# Outputs JSON with hookSpecificOutput.additionalContext to feed back to the model.
#
# ┌──────────────────────────────────────────────────────────────────────────┐
# │ GUARD: This script manages PANE LAYOUT only.                           │
# │                                                                        │
# │ DO NOT add logic to launch Claude sessions or pass prompts here.       │
# │ Claude Code's runtime handles teammate spawning, prompt delivery,      │
# │ and inter-agent communication via its native mailbox system.           │
# │ Manually launching `claude` or sending prompts through shell escaping  │
# │ will break — prompts get mangled through multiple escaping layers.     │
# │                                                                        │
# │ See: https://code.claude.com/docs/en/agent-teams                      │
# └──────────────────────────────────────────────────────────────────────────┘

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/iterm-applescript-helpers.sh"

TEMP_PREFIX="/tmp/sigma-team"

# Read hook input from stdin
INPUT=$(cat)

# Extract operation from tool_input
OPERATION=$(echo "$INPUT" | jq -r '.tool_input.operation // empty' 2>/dev/null)

if [[ -z "$OPERATION" ]]; then
    exit 0
fi

# ─────────────────────────────────────────────────
# Handle: spawnTeam
# ─────────────────────────────────────────────────
handle_spawn_team() {
    local team_name
    team_name=$(echo "$INPUT" | jq -r '.tool_input.team_name // empty' 2>/dev/null)

    if [[ -z "$team_name" ]]; then
        exit 0
    fi

    # Check all prerequisites — exit silently if any fail
    if ! iterm_check_prerequisites --silent; then
        exit 0
    fi

    # Check jq is available (needed by watcher)
    if ! command -v jq &>/dev/null; then
        exit 0
    fi

    local config_file="$HOME/.claude/teams/$team_name/config.json"
    local pid_file="${TEMP_PREFIX}-${team_name}-watcher.pid"
    local window_handle_file="${TEMP_PREFIX}-${team_name}-window-handle"

    # Don't create duplicate windows if watcher already running
    if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        exit 0
    fi

    # Create iTerm2 window for the team (returns the window name as handle)
    local window_handle
    window_handle=$(iterm_create_window "Team: $team_name")

    if [[ -z "$window_handle" ]]; then
        # iTerm2 creation failed — exit silently
        exit 0
    fi

    # Store window handle for the watcher
    echo "$window_handle" > "$window_handle_file"

    # Initialize known members file (empty, no trailing newline)
    : > "${TEMP_PREFIX}-${team_name}-members"

    # Launch background watcher
    nohup bash "$SCRIPT_DIR/team-pane-watcher.sh" \
        "$team_name" \
        "$window_handle" \
        "$config_file" \
        > "${TEMP_PREFIX}-${team_name}-watcher.log" 2>&1 &

    local watcher_pid=$!
    echo "$watcher_pid" > "$pid_file"

    # Disown so the watcher survives this script exiting
    disown "$watcher_pid" 2>/dev/null || true

    # Return additionalContext so Claude knows panes are auto-managed
    cat <<'HOOKJSON'
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"iTerm2 team window created. Panes will appear automatically as teammates join."}}
HOOKJSON
}

# ─────────────────────────────────────────────────
# Handle: cleanup
# ─────────────────────────────────────────────────
handle_cleanup() {
    # Kill all team watchers. Claude Code supports one team per session,
    # and cleanup tears down the entire team, so we clean all watchers.
    for pid_file in ${TEMP_PREFIX}-*-watcher.pid; do
        [[ -f "$pid_file" ]] || continue
        local pid
        pid=$(cat "$pid_file" 2>/dev/null)
        if [[ -n "$pid" ]]; then
            kill "$pid" 2>/dev/null || true
        fi
    done

    # Clean up all temp files
    rm -f ${TEMP_PREFIX}-*-watcher.pid \
          ${TEMP_PREFIX}-*-watcher.log \
          ${TEMP_PREFIX}-*-members \
          ${TEMP_PREFIX}-*-window-handle 2>/dev/null || true

    exit 0
}

# ─────────────────────────────────────────────────
# Route by operation
# ─────────────────────────────────────────────────
case "$OPERATION" in
    spawnTeam)
        handle_spawn_team
        ;;
    cleanup)
        handle_cleanup
        ;;
    *)
        # Unknown operation — exit silently
        exit 0
        ;;
esac
