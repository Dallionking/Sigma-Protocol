#!/usr/bin/env bash
# iterm-applescript-helpers.sh — Shared helper functions for iTerm2 automation
# Used by: team-iterm-launcher.sh, team-pane-watcher.sh, scripts/team-iterm-launcher.sh
#
# Source this file: source "$(dirname "$0")/lib/iterm-applescript-helpers.sh"
#
# Window addressing: All functions use window NAME (not id) for reliable
# cross-process addressing. The name is set at creation time ("Team: {name}").
#
# Backend selection: Prefers the iTerm2 Python API when available (modern,
# supported). Falls back to AppleScript (deprecated but functional).
# Detection runs once at source time. Consumer scripts are unaffected.
#
# IMPORTANT: These helpers manage iTerm2 PANE LAYOUT only (create windows,
# split panes, label sessions). They do NOT launch Claude Code instances or
# send prompts. Claude Code's runtime handles teammate lifecycle natively.
# See: https://code.claude.com/docs/en/agent-teams

# --- Python API detection (runs once at source time) ---
ITERM_PYTHON_BRIDGE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/iterm-python-bridge.py"
USE_PYTHON_API=false

if [[ -f "$ITERM_PYTHON_BRIDGE" ]] && python3 -c "import iterm2" 2>/dev/null; then
    USE_PYTHON_API=true
fi

# Escape strings for safe use in AppleScript double-quoted strings.
# Must escape backslashes first, then double quotes.
escape_for_applescript() {
    local str="$1"
    str="${str//\\/\\\\}"
    str="${str//\"/\\\"}"
    echo "$str"
}

# Check if iTerm2 is currently running (without launching it).
# Returns 0 if running, 1 if not.
iterm_is_running() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" is-running 2>/dev/null
    else
        osascript -e 'tell application "System Events" to (name of processes) contains "iTerm2"' 2>/dev/null | grep -q "true"
    fi
}

# Create a new iTerm2 window with a given title.
# Usage: iterm_create_window "My Window Title"
# Outputs the window name on stdout (same as input — used as handle).
iterm_create_window() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" create-window "$1"
    else
        local title
        title=$(escape_for_applescript "$1")

        # Create window, set its name, label the first session as "Leader"
        local result
        result=$(osascript \
            -e 'tell application "iTerm2"' \
            -e '  set newWindow to (create window with default profile)' \
            -e '  tell newWindow' \
            -e "    set name to \"$title\"" \
            -e '    tell current session of current tab' \
            -e "      set name to \"Leader\"" \
            -e '    end tell' \
            -e '  end tell' \
            -e "  return name of newWindow" \
            -e 'end tell' 2>/dev/null)

        if [[ -n "$result" ]]; then
            # Return the title as the handle (used by callers to re-address the window)
            echo "$1"
        fi
    fi
}

# Internal helper: build the window addressing AppleScript fragment.
# Uses "first window whose name is X" for reliable cross-process addressing.
_window_ref() {
    local window_name
    window_name=$(escape_for_applescript "$1")
    echo "first window whose name is \"$window_name\""
}

# Split a pane in the current tab of a named window.
# Usage: iterm_split_pane <window_name> <direction> <pane_name>
#   direction: "vertically" or "horizontally"
#   pane_name: label for the new session
# The split targets the current session.
iterm_split_pane() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" split-pane "$1" "$2" "$3"
    else
        local window_name="$1"
        local direction="$2"
        local pane_name
        pane_name=$(escape_for_applescript "$3")
        local wref
        wref=$(_window_ref "$window_name")

        osascript \
            -e 'tell application "iTerm2"' \
            -e "  tell $wref" \
            -e '    tell current tab' \
            -e '      tell current session' \
            -e "        set newSession to (split $direction with default profile)" \
            -e '      end tell' \
            -e '      tell newSession' \
            -e "        set name to \"$pane_name\"" \
            -e '      end tell' \
            -e '    end tell' \
            -e '  end tell' \
            -e 'end tell' 2>/dev/null
    fi
}

# Split a specific session (by 1-based index) in the current tab.
# Used by the layout algorithm to target specific panes for balanced splitting.
# Usage: iterm_split_session <window_name> <session_index> <direction> <pane_name>
#
# Note: Both APIs accept 1-based session indices from bash. The Python bridge
# converts to 0-based internally. AppleScript uses native 1-based references.
iterm_split_session() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" split-session "$1" "$2" "$3" "$4"
    else
        local window_name="$1"
        local session_idx="$2"
        local direction="$3"
        local pane_name
        pane_name=$(escape_for_applescript "$4")
        local wref
        wref=$(_window_ref "$window_name")

        osascript \
            -e 'tell application "iTerm2"' \
            -e "  tell $wref" \
            -e '    tell current tab' \
            -e "      tell session $session_idx" \
            -e "        set newSession to (split $direction with default profile)" \
            -e '      end tell' \
            -e '      tell newSession' \
            -e "        set name to \"$pane_name\"" \
            -e '      end tell' \
            -e '    end tell' \
            -e '  end tell' \
            -e 'end tell' 2>/dev/null
    fi
}

# Write text to a specific session (by 1-based index) in a window.
# Usage: iterm_write_to_session <window_name> <session_index> <text>
iterm_write_to_session() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" write-to-session "$1" "$2" "$3"
    else
        local window_name="$1"
        local session_idx="$2"
        local text
        text=$(escape_for_applescript "$3")
        local wref
        wref=$(_window_ref "$window_name")

        osascript \
            -e 'tell application "iTerm2"' \
            -e "  tell $wref" \
            -e '    tell current tab' \
            -e "      tell session $session_idx" \
            -e "        write text \"$text\"" \
            -e '      end tell' \
            -e '    end tell' \
            -e '  end tell' \
            -e 'end tell' 2>/dev/null
    fi
}

# Get the count of sessions in the current tab of a window.
# Usage: iterm_get_session_count <window_name>
# Outputs integer count on stdout.
iterm_get_session_count() {
    if [[ "$USE_PYTHON_API" == true ]]; then
        python3 "$ITERM_PYTHON_BRIDGE" session-count "$1"
    else
        local window_name="$1"
        local wref
        wref=$(_window_ref "$window_name")

        osascript \
            -e 'tell application "iTerm2"' \
            -e "  tell $wref" \
            -e '    tell current tab' \
            -e '      return count of sessions' \
            -e '    end tell' \
            -e '  end tell' \
            -e 'end tell' 2>/dev/null
    fi
}

# Determine which session to split and in which direction for balanced grid layout.
# Implements the layout algorithm from the plan:
#   Pane 2: split session 1 vertically (side-by-side)
#   Pane 3: split session 2 horizontally (stack right)
#   Pane 4: split session 1 horizontally (2x2 grid)
#   Pane 5+: split largest pane, alternating direction
#
# Usage: iterm_layout_next_split <current_pane_count>
# Outputs: "<session_index> <direction>" on stdout
iterm_layout_next_split() {
    local count="$1"

    case "$count" in
        1) echo "1 vertically" ;;     # Split leader → side-by-side
        2) echo "2 horizontally" ;;   # Split right → stacked right
        3) echo "1 horizontally" ;;   # Split leader → 2x2 grid
        *)
            # For 5+ panes, alternate: split oldest unsplit, alternating direction
            local target_session=$(( (count % 2 == 0) ? (count / 2) : ((count + 1) / 2) ))
            local dir
            if (( count % 2 == 0 )); then
                dir="horizontally"
            else
                dir="vertically"
            fi
            echo "$target_session $dir"
            ;;
    esac
}

# Check if we're running inside VS Code's integrated terminal.
# Returns 0 if inside VS Code, 1 otherwise.
is_vscode_terminal() {
    [[ -n "${TERM_PROGRAM:-}" && "$TERM_PROGRAM" == "vscode" ]] || \
    [[ -n "${VSCODE_INJECTION:-}" ]]
}

# Check if teammateMode is set to "tmux" in user settings.
# Returns 0 if tmux mode, 1 otherwise.
is_tmux_teammate_mode() {
    local settings_file="$HOME/.claude/settings.json"
    if [[ -f "$settings_file" ]] && command -v jq &>/dev/null; then
        local mode
        mode=$(jq -r '.teammateMode // empty' "$settings_file" 2>/dev/null)
        [[ "$mode" == "tmux" ]]
    else
        return 1
    fi
}

# All prerequisite checks for iTerm2 pane creation.
# Returns 0 if all checks pass, 1 otherwise.
# Usage: iterm_check_prerequisites [--silent]
iterm_check_prerequisites() {
    local silent="${1:-}"

    # Must be macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        [[ "$silent" != "--silent" ]] && echo "Not macOS — skipping iTerm2 panes" >&2
        return 1
    fi

    # Must not be VS Code terminal
    if is_vscode_terminal; then
        [[ "$silent" != "--silent" ]] && echo "VS Code terminal — using in-process mode" >&2
        return 1
    fi

    # Must not be tmux teammate mode (Claude Code handles it natively)
    if is_tmux_teammate_mode; then
        [[ "$silent" != "--silent" ]] && echo "teammateMode=tmux — Claude Code handles panes natively" >&2
        return 1
    fi

    # iTerm2 must be running
    if ! iterm_is_running; then
        [[ "$silent" != "--silent" ]] && echo "iTerm2 not running — skipping pane creation" >&2
        return 1
    fi

    return 0
}
