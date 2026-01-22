#!/usr/bin/env bash
# =============================================================================
# Ralph iTerm Launcher with Session Auto-Restart
# =============================================================================
# Spawns a new iTerm window to run sigma-ralph.sh with auto-restart
# at 2 hours 5 minutes (Claude Code Max session limit)
#
# Usage:
#   ralph-iterm.sh --workspace=/path/to/project --backlog=docs/ralph/prd.json
#   ralph-iterm.sh --workspace=/path/to/project --mode=prototype
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RALPH_SCRIPT="$SCRIPT_DIR/sigma-ralph.sh"

# Session timeout: 2 hours 5 minutes = 7500 seconds
# This restarts before Claude Code Max session expires
SESSION_TIMEOUT_SECONDS=7500
SESSION_TIMEOUT_HUMAN="2h5m"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

show_help() {
    cat << EOF
Ralph iTerm Launcher with Auto-Restart

Spawns sigma-ralph.sh in a new iTerm window with automatic restart
every $SESSION_TIMEOUT_HUMAN to handle Claude Code session limits.

USAGE:
    ralph-iterm.sh [OPTIONS]

OPTIONS:
    --workspace=PATH       Path to target project workspace (required)
    --mode=MODE            Backlog mode: prototype or implementation
    --backlog=PATH         Custom backlog path
    --stream=ID            Only process stories in this stream
    --engine=ENGINE        AI engine: auto, claude, opencode (default: auto)
    --no-restart           Disable auto-restart (run once only)
    --help                 Show this help message

    All other options are passed through to sigma-ralph.sh

EXAMPLES:
    # Run AgentFloor project with auto-restart
    ralph-iterm.sh --workspace="/Users/me/agent-floor" --backlog="docs/ralph/prd.json"

    # Run without auto-restart
    ralph-iterm.sh --workspace="/Users/me/project" --no-restart

SESSION RESTART:
    - Auto-restarts every $SESSION_TIMEOUT_HUMAN to prevent session expiry
    - Progress is preserved in prd.json (stories marked passes:true)
    - Each restart spawns a fresh Claude Code session
EOF
}

# Parse args to extract workspace (needed for iTerm title)
WORKSPACE=""
NO_RESTART=false
PASS_THROUGH_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --workspace=*)
            WORKSPACE="${1#*=}"
            PASS_THROUGH_ARGS+=("$1")
            shift
            ;;
        --no-restart)
            NO_RESTART=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            PASS_THROUGH_ARGS+=("$1")
            shift
            ;;
    esac
done

if [[ -z "$WORKSPACE" ]]; then
    log_error "--workspace is required"
    show_help
    exit 1
fi

# Get project name for iTerm tab title
PROJECT_NAME=$(basename "$WORKSPACE")

# Build the ralph command
RALPH_CMD="$RALPH_SCRIPT ${PASS_THROUGH_ARGS[*]}"

# =============================================================================
# Mode: Direct execution (when called from iTerm)
# =============================================================================
if [[ "${RALPH_DIRECT_EXEC:-}" == "1" ]]; then
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 RALPH LOOP WITH AUTO-RESTART"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Project:     $PROJECT_NAME"
    log_info "Workspace:   $WORKSPACE"
    log_info "Session:     $SESSION_TIMEOUT_HUMAN per cycle"
    log_info "Auto-restart: $(if [[ "$NO_RESTART" == true ]]; then echo "DISABLED"; else echo "ENABLED"; fi)"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [[ "$NO_RESTART" == true ]]; then
        # Single run without restart
        exec $RALPH_CMD
    fi

    # Auto-restart loop
    CYCLE=1
    while true; do
        START_TIME=$(date +%s)
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "🔄 CYCLE $CYCLE - Starting at $(date '+%H:%M:%S')"
        log_info "   Will auto-restart in $SESSION_TIMEOUT_HUMAN"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""

        # Run ralph with timeout
        timeout $SESSION_TIMEOUT_SECONDS $RALPH_CMD || {
            EXIT_CODE=$?
            if [[ $EXIT_CODE -eq 124 ]]; then
                # Timeout reached - this is expected for auto-restart
                echo ""
                log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_warn "⏰ SESSION TIMEOUT - Auto-restarting in 5s..."
                log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                sleep 5
            elif [[ $EXIT_CODE -eq 0 ]]; then
                # All stories complete
                log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_success "🎉 ALL STORIES COMPLETE!"
                log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                exit 0
            else
                # Other error
                log_error "Ralph exited with code $EXIT_CODE"
                log_info "Restarting in 10s... (Ctrl+C to abort)"
                sleep 10
            fi
        }

        CYCLE=$((CYCLE + 1))

        # Safety check - don't restart too fast
        ELAPSED=$(($(date +%s) - START_TIME))
        if [[ $ELAPSED -lt 60 ]]; then
            log_warn "Cycle completed too quickly ($ELAPSED seconds)"
            log_warn "Waiting 30s before restart to prevent rapid loops..."
            sleep 30
        fi
    done

    exit 0
fi

# =============================================================================
# Mode: Spawn iTerm window
# =============================================================================

log_info "Spawning iTerm window for: $PROJECT_NAME"

# Check if iTerm is available
if ! osascript -e 'tell application "iTerm" to version' &>/dev/null; then
    log_error "iTerm2 is not installed or not accessible"
    log_info "Falling back to direct execution..."
    RALPH_DIRECT_EXEC=1 exec "$0" "${PASS_THROUGH_ARGS[@]}"
fi

# Build the command to run in iTerm
ITERM_CMD="RALPH_DIRECT_EXEC=1 '$0' ${PASS_THROUGH_ARGS[*]}"

# Spawn new iTerm window using AppleScript
osascript << EOF
tell application "iTerm"
    activate

    -- Create new window
    set newWindow to (create window with default profile)

    tell current session of newWindow
        -- Set tab title
        set name to "🤖 Ralph: $PROJECT_NAME"

        -- Run the command
        write text "$ITERM_CMD"
    end tell
end tell
EOF

log_success "iTerm window spawned for: $PROJECT_NAME"
log_info "The Ralph loop is now running in the new window"
log_info "It will auto-restart every $SESSION_TIMEOUT_HUMAN"
