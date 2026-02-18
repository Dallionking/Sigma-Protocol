#!/usr/bin/env bash
# =============================================================================
# tmux Spawn Helper for Sigma-Ralph
# =============================================================================
# Creates tmux session with panes for Ralph workers
#
# Usage:
#   tmux-spawn.sh --project=/path --backlogs=ios,web --engine=claude
#
# Requirements:
#   - tmux installed (brew install tmux / apt install tmux)
#
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default values
PROJECT_DIR=""
BACKLOGS=""
ENGINE="claude"
SESSION_NAME="sigma-ralph"
DRY_RUN=false
ATTACH=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[tmux]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[tmux]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[tmux]${NC} $1"
}

log_error() {
    echo -e "${RED}[tmux]${NC} $1" >&2
}

show_help() {
    cat << EOF
tmux Spawn Helper for Sigma-Ralph v${VERSION}

Creates tmux session with panes for Ralph workers.

USAGE:
    tmux-spawn.sh [OPTIONS]

OPTIONS:
    --project=PATH       Path to project workspace (required)
    --backlogs=LIST      Comma-separated backlog paths relative to project
                         (e.g., docs/ralph/ios/prd.json,docs/ralph/web/prd.json)
    --engine=ENGINE      AI engine: claude or opencode (default: claude)
    --session=NAME       tmux session name (default: sigma-ralph)
    --no-attach          Don't attach to session after creation
    --dry-run            Show commands without executing
    --help               Show this help message

EXAMPLES:
    # Single backlog
    tmux-spawn.sh --project=/path/to/project --backlogs=docs/ralph/ios/prd.json

    # Multiple backlogs (creates split panes)
    tmux-spawn.sh --project=/path/to/project --backlogs=ios,web

    # Custom session name
    tmux-spawn.sh --project=/path/to/project --backlogs=ios --session=my-ralph

LAYOUT:
    Creates a tmux session with:
    - Window 1: Observer (status + log tailing)
    - Window 2+: One window per worker

    Or with 2-4 backlogs, uses split panes in single window.

REQUIREMENTS:
    - tmux installed
EOF
}

# =============================================================================
# Argument Parsing
# =============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --project=*)
                PROJECT_DIR="${1#*=}"
                shift
                ;;
            --backlogs=*)
                BACKLOGS="${1#*=}"
                shift
                ;;
            --engine=*)
                ENGINE="${1#*=}"
                shift
                ;;
            --session=*)
                SESSION_NAME="${1#*=}"
                shift
                ;;
            --no-attach)
                ATTACH=false
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
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# =============================================================================
# Validation
# =============================================================================

validate_requirements() {
    # Check for tmux
    if ! command -v tmux &>/dev/null; then
        log_error "tmux not found. Install with: brew install tmux (macOS) or apt install tmux (Linux)"
        exit 1
    fi

    # Check project directory
    if [[ -z "$PROJECT_DIR" ]]; then
        log_error "--project is required"
        exit 1
    fi

    if [[ ! -d "$PROJECT_DIR" ]]; then
        log_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi

    # Check backlogs
    if [[ -z "$BACKLOGS" ]]; then
        log_error "--backlogs is required"
        exit 1
    fi

    # Validate each backlog exists
    IFS=',' read -ra BACKLOG_ARRAY <<< "$BACKLOGS"
    for backlog in "${BACKLOG_ARRAY[@]}"; do
        # Handle short names (ios -> docs/ralph/ios/prd.json)
        if [[ ! "$backlog" == *"/"* ]]; then
            backlog="docs/ralph/$backlog/prd.json"
        fi

        if [[ ! -f "$PROJECT_DIR/$backlog" ]]; then
            log_error "Backlog not found: $PROJECT_DIR/$backlog"
            exit 1
        fi
    done

    # Check if session already exists
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        log_warn "Session '$SESSION_NAME' already exists"
        log_info "Options:"
        log_info "  1. Attach: tmux attach -t $SESSION_NAME"
        log_info "  2. Kill:   tmux kill-session -t $SESSION_NAME"
        log_info "  3. Use different name: --session=my-ralph"
        exit 1
    fi
}

# =============================================================================
# Session Creation
# =============================================================================

run_cmd() {
    local cmd="$1"
    if [[ "$DRY_RUN" == true ]]; then
        echo "$cmd"
    else
        eval "$cmd"
    fi
}

create_session() {
    log_info "Creating tmux session: $SESSION_NAME"

    # Build array of backlogs with full paths
    IFS=',' read -ra BACKLOG_ARRAY <<< "$BACKLOGS"
    local backlog_paths=()
    local progress_paths=()

    for backlog in "${BACKLOG_ARRAY[@]}"; do
        # Handle short names
        if [[ ! "$backlog" == *"/"* ]]; then
            backlog="docs/ralph/$backlog/prd.json"
        fi
        backlog_paths+=("$backlog")
        progress_paths+=("$(dirname "$backlog")/progress.txt")
    done

    local count=${#backlog_paths[@]}

    # Create session with first window (observer)
    run_cmd "tmux new-session -d -s '$SESSION_NAME' -n 'observer' -c '$PROJECT_DIR'"

    # Observer window - show status and tail logs
    local tail_files=""
    for ppath in "${progress_paths[@]}"; do
        tail_files+=" \"$ppath\""
    done

    run_cmd "tmux send-keys -t '$SESSION_NAME:observer' 'echo \"=== SIGMA-RALPH OBSERVER ===\"' Enter"
    run_cmd "tmux send-keys -t '$SESSION_NAME:observer' 'echo \"Session: $SESSION_NAME\"' Enter"
    run_cmd "tmux send-keys -t '$SESSION_NAME:observer' 'echo \"Workers: $count\"' Enter"
    run_cmd "tmux send-keys -t '$SESSION_NAME:observer' 'echo \"\"' Enter"

    # Touch progress files and tail
    run_cmd "tmux send-keys -t '$SESSION_NAME:observer' 'touch $tail_files 2>/dev/null; tail -f $tail_files' Enter"

    # Strategy: use split panes for 2-4 workers, separate windows for more
    if [[ $count -le 4 ]]; then
        # Create worker window with panes
        run_cmd "tmux new-window -t '$SESSION_NAME' -n 'workers'"

        for i in "${!backlog_paths[@]}"; do
            local backlog="${backlog_paths[$i]}"
            local platform=$(basename "$(dirname "$backlog")")

            if [[ $i -eq 0 ]]; then
                # First pane (already exists)
                run_cmd "tmux send-keys -t '$SESSION_NAME:workers' 'echo \"=== Worker: $platform ===\"' Enter"
                run_cmd "tmux send-keys -t '$SESSION_NAME:workers' './scripts/ralph/sigma-ralph.sh --workspace=\"$PROJECT_DIR\" --backlog=\"$backlog\" --engine=$ENGINE' Enter"
            else
                # Split for additional panes
                if [[ $count -eq 2 ]]; then
                    # 2 workers: horizontal split
                    run_cmd "tmux split-window -t '$SESSION_NAME:workers' -h"
                elif [[ $count -eq 3 ]]; then
                    # 3 workers: 2 on top, 1 on bottom
                    if [[ $i -eq 1 ]]; then
                        run_cmd "tmux split-window -t '$SESSION_NAME:workers' -h"
                    else
                        run_cmd "tmux split-window -t '$SESSION_NAME:workers.0' -v"
                    fi
                else
                    # 4 workers: 2x2 grid
                    if [[ $i -eq 1 ]]; then
                        run_cmd "tmux split-window -t '$SESSION_NAME:workers' -h"
                    elif [[ $i -eq 2 ]]; then
                        run_cmd "tmux split-window -t '$SESSION_NAME:workers.0' -v"
                    else
                        run_cmd "tmux split-window -t '$SESSION_NAME:workers.1' -v"
                    fi
                fi

                run_cmd "tmux send-keys -t '$SESSION_NAME:workers' 'cd \"$PROJECT_DIR\"' Enter"
                run_cmd "tmux send-keys -t '$SESSION_NAME:workers' 'echo \"=== Worker: $platform ===\"' Enter"
                run_cmd "tmux send-keys -t '$SESSION_NAME:workers' './scripts/ralph/sigma-ralph.sh --workspace=\"$PROJECT_DIR\" --backlog=\"$backlog\" --engine=$ENGINE' Enter"
            fi
        done

        # Balance panes
        run_cmd "tmux select-layout -t '$SESSION_NAME:workers' tiled"
    else
        # 5+ workers: separate windows
        for i in "${!backlog_paths[@]}"; do
            local backlog="${backlog_paths[$i]}"
            local platform=$(basename "$(dirname "$backlog")")

            run_cmd "tmux new-window -t '$SESSION_NAME' -n '$platform'"
            run_cmd "tmux send-keys -t '$SESSION_NAME:$platform' 'echo \"=== Worker: $platform ===\"' Enter"
            run_cmd "tmux send-keys -t '$SESSION_NAME:$platform' './scripts/ralph/sigma-ralph.sh --workspace=\"$PROJECT_DIR\" --backlog=\"$backlog\" --engine=$ENGINE' Enter"
        done
    fi

    # Select observer window
    run_cmd "tmux select-window -t '$SESSION_NAME:observer'"
}

# =============================================================================
# Execution
# =============================================================================

main() {
    parse_args "$@"
    validate_requirements

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Commands that would be executed:"
        echo ""
    fi

    create_session

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        return 0
    fi

    log_success "tmux session created: $SESSION_NAME"

    IFS=',' read -ra BACKLOG_ARRAY <<< "$BACKLOGS"
    local count=${#BACKLOG_ARRAY[@]}

    echo ""
    log_info "Windows created:"
    log_info "  - observer (tailing progress files)"
    for backlog in "${BACKLOG_ARRAY[@]}"; do
        if [[ ! "$backlog" == *"/"* ]]; then
            backlog="docs/ralph/$backlog/prd.json"
        fi
        local platform=$(basename "$(dirname "$backlog")")
        log_info "  - $platform worker"
    done

    echo ""
    log_info "Commands:"
    log_info "  Attach: tmux attach -t $SESSION_NAME"
    log_info "  Detach: Ctrl+B, then D"
    log_info "  Kill:   tmux kill-session -t $SESSION_NAME"
    log_info "  Windows: Ctrl+B, then number (0-$count)"

    if [[ "$ATTACH" == true ]]; then
        echo ""
        log_info "Attaching to session..."
        tmux attach -t "$SESSION_NAME"
    fi
}

# =============================================================================
# Entry Point
# =============================================================================

main "$@"
