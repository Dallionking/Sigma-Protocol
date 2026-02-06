#!/usr/bin/env bash
# team-iterm-launcher.sh — Standalone iTerm2 pane launcher for Agent Teams
#
# Usage:
#   scripts/team-iterm-launcher.sh --team-name=my-team --panes=3
#   scripts/team-iterm-launcher.sh --team-name=my-team --watch
#   scripts/team-iterm-launcher.sh --list
#   scripts/team-iterm-launcher.sh --dry-run --panes=4
#
# ┌──────────────────────────────────────────────────────────────────────────┐
# │ GUARD: This script manages PANE LAYOUT only.                           │
# │                                                                        │
# │ DO NOT add logic to launch Claude sessions or pass prompts here.       │
# │ Claude Code's runtime handles teammate spawning, prompt delivery,      │
# │ and inter-agent communication via its native mailbox system.           │
# │ Manually launching `claude` with multiline prompts as CLI arguments    │
# │ will break — prompts get mangled through shell escaping layers.        │
# │                                                                        │
# │ Correct pattern for Agent Teams:                                       │
# │   1. Start Claude normally (no prompt)                                 │
# │   2. Wait for full initialization (CLAUDE.md, MCPs, hooks)             │
# │   3. Send ONE clean natural-language prompt via tmux send-keys         │
# │   4. Let Claude's runtime handle teammate orchestration                │
# │                                                                        │
# │ See: https://code.claude.com/docs/en/agent-teams                      │
# └──────────────────────────────────────────────────────────────────────────┘

set -euo pipefail

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_LIB="$PROJECT_DIR/.claude/hooks/lib/iterm-applescript-helpers.sh"

# Source shared helpers
if [[ -f "$HOOKS_LIB" ]]; then
    source "$HOOKS_LIB"
else
    echo "Error: Missing $HOOKS_LIB" >&2
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
TEAM_NAME=""
PANE_COUNT=0
WATCH_MODE=false
LIST_MODE=false
DRY_RUN=false
TEMP_PREFIX="/tmp/sigma-team"

show_help() {
    cat << EOF
iTerm2 Team Launcher v${VERSION}

Creates labeled iTerm2 split panes for Claude Code Agent Teams.

USAGE:
    $(basename "$0") [OPTIONS]

OPTIONS:
    --team-name=NAME    Team name (required for --panes and --watch)
    --panes=N           Create N panes immediately (including leader)
    --watch             Start watcher mode (polls config.json for new members)
    --list              Show active team watchers
    --dry-run           Show AppleScript without executing
    --help              Show this help message

EXAMPLES:
    # Create 4-pane grid for team "feature-x"
    $(basename "$0") --team-name=feature-x --panes=4

    # Start watching for new members
    $(basename "$0") --team-name=feature-x --watch

    # Preview the AppleScript for a 4-pane layout
    $(basename "$0") --dry-run --panes=4

    # List active team watchers
    $(basename "$0") --list
EOF
}

# ─────────────────────────────────────────────────
# Argument parsing
# ─────────────────────────────────────────────────
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --team-name=*)
                TEAM_NAME="${1#*=}"
                shift
                ;;
            --panes=*)
                PANE_COUNT="${1#*=}"
                shift
                ;;
            --watch)
                WATCH_MODE=true
                shift
                ;;
            --list)
                LIST_MODE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}" >&2
                show_help
                exit 1
                ;;
        esac
    done
}

# ─────────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────────
validate() {
    if [[ "$LIST_MODE" == true ]]; then
        return 0
    fi

    if [[ -z "$TEAM_NAME" ]]; then
        echo -e "${RED}Error: --team-name is required${NC}" >&2
        exit 1
    fi

    if [[ "$WATCH_MODE" == false && "$PANE_COUNT" -lt 1 && "$DRY_RUN" == false ]]; then
        echo -e "${RED}Error: Either --panes=N or --watch is required${NC}" >&2
        exit 1
    fi

    if [[ "$DRY_RUN" == false ]]; then
        if [[ "$OSTYPE" != "darwin"* ]]; then
            echo -e "${RED}Error: iTerm2 panes only work on macOS${NC}" >&2
            exit 1
        fi

        if ! iterm_is_running; then
            echo -e "${RED}Error: iTerm2 is not running${NC}" >&2
            exit 1
        fi
    fi
}

# ─────────────────────────────────────────────────
# Dry-run: generate and print AppleScript
# ─────────────────────────────────────────────────
dry_run_panes() {
    local count="${PANE_COUNT:-4}"
    local team="${TEAM_NAME:-demo-team}"

    echo -e "${BLUE}═══ Dry Run: AppleScript for $count panes ═══${NC}"
    echo ""

    # Window creation
    local title
    title=$(escape_for_applescript "Team: $team")
    echo "-- Step 1: Create window"
    echo "tell application \"iTerm2\""
    echo "  set newWindow to (create window with default profile)"
    echo "  tell newWindow"
    echo "    set name to \"$title\""
    echo "    tell current session of current tab"
    echo "      set name to \"Leader\""
    echo "    end tell"
    echo "  end tell"
    echo "  return name of newWindow"
    echo "end tell"
    echo ""

    # Pane splits
    for (( i=1; i<count; i++ )); do
        local layout
        layout=$(iterm_layout_next_split "$i")
        local target_session direction
        target_session=$(echo "$layout" | cut -d' ' -f1)
        direction=$(echo "$layout" | cut -d' ' -f2)
        local pane_name="Teammate-$i"

        echo "-- Step $((i+1)): Create pane for $pane_name"
        echo "tell application \"iTerm2\""
        echo "  tell first window whose name is \"Team: $team\""
        echo "    tell current tab"
        echo "      tell session $target_session"
        echo "        set newSession to (split $direction with default profile)"
        echo "      end tell"
        echo "      tell newSession"
        echo "        set name to \"$pane_name\""
        echo "      end tell"
        echo "    end tell"
        echo "  end tell"
        echo "end tell"
        echo ""
    done

    echo -e "${GREEN}Layout summary:${NC}"
    echo "  Panes: $count (1 leader + $((count - 1)) teammates)"
    for (( i=1; i<count; i++ )); do
        local layout
        layout=$(iterm_layout_next_split "$i")
        echo "  Pane $((i+1)): split session $(echo "$layout" | cut -d' ' -f1) $(echo "$layout" | cut -d' ' -f2)"
    done
}

# ─────────────────────────────────────────────────
# Create panes immediately
# ─────────────────────────────────────────────────
create_panes() {
    echo -e "${BLUE}Creating iTerm2 window for team: $TEAM_NAME${NC}"

    local window_handle
    window_handle=$(iterm_create_window "Team: $TEAM_NAME")

    if [[ -z "$window_handle" ]]; then
        echo -e "${RED}Failed to create iTerm2 window${NC}" >&2
        exit 1
    fi

    echo -e "${GREEN}Window created: $window_handle${NC}"

    # Save window ID
    echo "$window_handle" > "${TEMP_PREFIX}-${TEAM_NAME}-window-id"

    for (( i=1; i<PANE_COUNT; i++ )); do
        local layout
        layout=$(iterm_layout_next_split "$i")
        local target_session direction
        target_session=$(echo "$layout" | cut -d' ' -f1)
        direction=$(echo "$layout" | cut -d' ' -f2)
        local pane_name="Teammate-$i"

        iterm_split_session "$window_handle" "$target_session" "$direction" "$pane_name"
        echo -e "  ${GREEN}✓${NC} Pane $((i+1)): $pane_name (split session $target_session $direction)"

        sleep 0.3
    done

    echo -e "${GREEN}Done! $PANE_COUNT panes created.${NC}"
}

# ─────────────────────────────────────────────────
# Start watcher mode
# ─────────────────────────────────────────────────
start_watcher() {
    local config_file="$HOME/.claude/teams/$TEAM_NAME/config.json"
    local pid_file="${TEMP_PREFIX}-${TEAM_NAME}-watcher.pid"

    # Check if watcher already running
    if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo -e "${YELLOW}Watcher already running for team: $TEAM_NAME (PID: $(cat "$pid_file"))${NC}"
        exit 0
    fi

    # Need a window — create one if not exists
    local window_handle_file="${TEMP_PREFIX}-${TEAM_NAME}-window-id"
    local window_handle

    if [[ -f "$window_handle_file" ]]; then
        window_handle=$(cat "$window_handle_file")
    else
        echo -e "${BLUE}Creating iTerm2 window for team: $TEAM_NAME${NC}"
        window_handle=$(iterm_create_window "Team: $TEAM_NAME")
        if [[ -z "$window_handle" ]]; then
            echo -e "${RED}Failed to create iTerm2 window${NC}" >&2
            exit 1
        fi
        echo "$window_handle" > "$window_handle_file"
    fi

    echo -e "${BLUE}Starting watcher for team: $TEAM_NAME (window: $window_handle)${NC}"
    echo -e "  Config: $config_file"
    echo -e "  Polling every 2s. Press Ctrl+C to stop."
    echo ""

    # Run the watcher inline (not backgrounded — this is manual mode)
    exec bash "$PROJECT_DIR/.claude/hooks/team-pane-watcher.sh" \
        "$TEAM_NAME" \
        "$window_handle" \
        "$config_file"
}

# ─────────────────────────────────────────────────
# List active team watchers
# ─────────────────────────────────────────────────
list_watchers() {
    echo -e "${BLUE}Active Team Watchers${NC}"
    echo "────────────────────────────────────"

    local found=false
    for pid_file in ${TEMP_PREFIX}-*-watcher.pid; do
        [[ -f "$pid_file" ]] || continue

        local team
        team=$(basename "$pid_file" | sed 's/^sigma-team-//;s/-watcher\.pid$//')
        local pid
        pid=$(cat "$pid_file" 2>/dev/null)
        local status

        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            status="${GREEN}running${NC} (PID: $pid)"
        else
            status="${RED}dead${NC}"
        fi

        local members_file="${TEMP_PREFIX}-${team}-members"
        local member_count=0
        if [[ -f "$members_file" ]]; then
            member_count=$(grep -c . "$members_file" 2>/dev/null || echo 0)
        fi

        echo -e "  Team: ${YELLOW}$team${NC}"
        echo -e "    Status: $status"
        echo -e "    Members: $member_count"
        echo ""
        found=true
    done

    if [[ "$found" == false ]]; then
        echo "  No active team watchers found."
    fi
}

# ─────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────
parse_args "$@"
validate

if [[ "$LIST_MODE" == true ]]; then
    list_watchers
elif [[ "$DRY_RUN" == true ]]; then
    dry_run_panes
elif [[ "$WATCH_MODE" == true ]]; then
    start_watcher
elif [[ "$PANE_COUNT" -gt 0 ]]; then
    create_panes
fi
