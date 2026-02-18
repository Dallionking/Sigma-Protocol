#!/usr/bin/env bash
# =============================================================================
# iTerm Spawn Helper for Sigma-Ralph
# =============================================================================
# Creates iTerm2 window with tabs for Ralph workers and optional observer
#
# Usage:
#   iterm-spawn.sh --project=/path --backlogs=ios,web --observe --engine=claude
#
# Requirements:
#   - macOS with iTerm2 installed
#   - AppleScript support (grant Terminal automation permissions)
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
OBSERVE=false
ENGINE="claude"
DRY_RUN=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Temp file for cleanup
TEMP_SCRIPT=""

# Cleanup trap
cleanup() {
    if [[ -n "$TEMP_SCRIPT" ]] && [[ -f "$TEMP_SCRIPT" ]]; then
        rm -f "$TEMP_SCRIPT" 2>/dev/null
    fi
}
trap cleanup EXIT INT TERM

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[iTerm]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[iTerm]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[iTerm]${NC} $1"
}

log_error() {
    echo -e "${RED}[iTerm]${NC} $1" >&2
}

# Escape strings for use in AppleScript
# Handles quotes and backslashes properly
escape_for_applescript() {
    local str="$1"
    # Escape backslashes first, then escape double quotes
    str="${str//\\/\\\\}"
    str="${str//\"/\\\"}"
    echo "$str"
}

show_help() {
    cat << EOF
iTerm Spawn Helper for Sigma-Ralph v${VERSION}

Creates iTerm2 window with tabs for Ralph workers.

USAGE:
    iterm-spawn.sh [OPTIONS]

OPTIONS:
    --project=PATH       Path to project workspace (required)
    --backlogs=LIST      Comma-separated backlog paths relative to project
                         (e.g., docs/ralph/ios/prd.json,docs/ralph/web/prd.json)
    --observe            Create observer tab that tails all progress files
    --engine=ENGINE      AI engine: claude or opencode (default: claude)
    --dry-run            Show AppleScript without executing
    --help               Show this help message

EXAMPLES:
    # Single backlog with observer
    iterm-spawn.sh --project=/path/to/project --backlogs=docs/ralph/ios/prd.json --observe

    # Multiple backlogs in parallel
    iterm-spawn.sh --project=/path/to/project --backlogs=ios,web --observe

    # Dry run to see AppleScript
    iterm-spawn.sh --project=/path/to/project --backlogs=ios --dry-run

REQUIREMENTS:
    - macOS with iTerm2 installed at /Applications/iTerm.app
    - AppleScript automation permissions granted to Terminal/iTerm
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
            --observe)
                OBSERVE=true
                shift
                ;;
            --engine=*)
                ENGINE="${1#*=}"
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
    # Check for macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "iTerm spawn only works on macOS"
        exit 1
    fi

    # Check for iTerm
    if [[ ! -d "/Applications/iTerm.app" ]]; then
        log_error "iTerm2 not found at /Applications/iTerm.app"
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
}

# =============================================================================
# AppleScript Generation
# =============================================================================

generate_applescript() {
    local script=""

    # Escape project directory for AppleScript
    local escaped_project_dir
    escaped_project_dir=$(escape_for_applescript "$PROJECT_DIR")

    # Start AppleScript
    script+='tell application "iTerm"
    activate

    -- Create new window
    create window with default profile
    tell current window'

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

    # Observer tab first (if requested)
    if [[ "$OBSERVE" == true ]]; then
        script+='

        -- Observer tab
        tell current session
            set name to "Observer"
            write text "cd \"'"$escaped_project_dir"'\" && echo \"=== RALPH OBSERVER ===\"'

        # Build tail command for all progress files
        local tail_files=""
        for ppath in "${progress_paths[@]}"; do
            local escaped_ppath
            escaped_ppath=$(escape_for_applescript "$ppath")
            if [[ -n "$tail_files" ]]; then
                tail_files+=" "
            fi
            tail_files+="\"$escaped_ppath\""
        done

        script+=' && touch '"${progress_paths[*]}"' 2>/dev/null; tail -f '"$tail_files"'"
        end tell'
    fi

    # Worker tabs
    local first_tab=true
    for i in "${!backlog_paths[@]}"; do
        local backlog="${backlog_paths[$i]}"
        local escaped_backlog
        escaped_backlog=$(escape_for_applescript "$backlog")
        local platform=$(basename "$(dirname "$backlog")")

        if [[ "$first_tab" == true ]] && [[ "$OBSERVE" != true ]]; then
            # Use current tab for first worker if no observer
            script+='

        -- Worker tab: '"$platform"'
        tell current session
            set name to "'"$platform"'"
            write text "cd \"'"$escaped_project_dir"'\" && ./scripts/ralph/sigma-ralph.sh --workspace=\"'"$escaped_project_dir"'\" --backlog=\"'"$escaped_backlog"'\" --engine='"$ENGINE"'"
        end tell'
            first_tab=false
        else
            # Create new tab for subsequent workers
            script+='

        -- Worker tab: '"$platform"'
        create tab with default profile
        tell current session
            set name to "'"$platform"'"
            write text "cd \"'"$escaped_project_dir"'\" && ./scripts/ralph/sigma-ralph.sh --workspace=\"'"$escaped_project_dir"'\" --backlog=\"'"$escaped_backlog"'\" --engine='"$ENGINE"'"
        end tell'
        fi
    done

    # Select first tab (observer or first worker)
    if [[ "$OBSERVE" == true ]]; then
        script+='

        -- Select observer tab
        select first tab'
    fi

    # Close AppleScript
    script+='
    end tell
end tell'

    echo "$script"
}

# =============================================================================
# Execution
# =============================================================================

main() {
    parse_args "$@"
    validate_requirements

    log_info "Generating iTerm AppleScript..."

    local applescript=$(generate_applescript)

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] AppleScript that would be executed:"
        echo ""
        echo "$applescript"
        echo ""
        return 0
    fi

    # Execute AppleScript
    log_info "Spawning iTerm tabs..."

    # Write to temp file for execution (uses global TEMP_SCRIPT for cleanup trap)
    TEMP_SCRIPT=$(mktemp)
    echo "$applescript" > "$TEMP_SCRIPT"

    if osascript "$TEMP_SCRIPT"; then
        log_success "iTerm tabs created successfully"

        IFS=',' read -ra BACKLOG_ARRAY <<< "$BACKLOGS"
        local count=${#BACKLOG_ARRAY[@]}

        echo ""
        log_info "Created tabs:"
        if [[ "$OBSERVE" == true ]]; then
            log_info "  - Observer (tailing progress files)"
        fi
        for backlog in "${BACKLOG_ARRAY[@]}"; do
            if [[ ! "$backlog" == *"/"* ]]; then
                backlog="docs/ralph/$backlog/prd.json"
            fi
            local platform=$(basename "$(dirname "$backlog")")
            log_info "  - $platform worker"
        done
    else
        log_error "Failed to execute AppleScript"
        log_warn "Make sure iTerm2 has automation permissions:"
        log_warn "  System Preferences > Security & Privacy > Privacy > Automation"
        exit 1
    fi
    # Cleanup happens via trap, no need for explicit rm
}

# =============================================================================
# Entry Point
# =============================================================================

main "$@"
