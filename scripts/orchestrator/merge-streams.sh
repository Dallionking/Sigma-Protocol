#!/bin/bash
# ============================================================================
# merge-streams.sh - Sigma Protocol Stream Merge Script
# ============================================================================
# Sequentially merges completed stream worktrees back into main branch
# following the dependency order specified in streams.json.
#
# Usage:
#   ./merge-streams.sh [project_root]
#   ./merge-streams.sh --dry-run
#   ./merge-streams.sh --continue
#   ./merge-streams.sh --abort
#
# Requirements:
#   - git
#   - All streams completed (check via orchestrator)
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="${1:-.}"
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"
CONFIG_DIR="$PROJECT_ROOT/.sigma/orchestration"
STREAMS_FILE="$CONFIG_DIR/streams.json"
MERGE_STATE_FILE="$CONFIG_DIR/merge-state.json"
NOTIFY_SCRIPT="$PROJECT_ROOT/scripts/notify/voice.py"

# Logging
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Voice notification
notify() {
    local message="$1"
    
    if [ -f "$NOTIFY_SCRIPT" ]; then
        python3 "$NOTIFY_SCRIPT" "$message" &
    elif command -v say &> /dev/null; then
        say "$message" &
    fi
}

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          🔀 SIGMA PROTOCOL - STREAM MERGE                     ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    # Check we're in a git repo
    if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &> /dev/null; then
        log_error "Not a git repository: $PROJECT_ROOT"
        exit 1
    fi
    
    # Check streams config exists
    if [ ! -f "$STREAMS_FILE" ]; then
        log_error "Streams config not found: $STREAMS_FILE"
        exit 1
    fi
    
    log_success "Prerequisites checked"
}

# Get merge order from config
get_merge_order() {
    if command -v jq &> /dev/null; then
        jq -r '.merge_order[]' "$STREAMS_FILE" 2>/dev/null
    else
        # Fallback: use Python
        python3 << EOF
import json
with open("$STREAMS_FILE") as f:
    config = json.load(f)
for stream in config.get("merge_order", []):
    print(stream)
EOF
    fi
}

# Check if branch exists
branch_exists() {
    local branch="$1"
    git -C "$PROJECT_ROOT" show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null
}

# Check for uncommitted changes
check_clean_working_tree() {
    if ! git -C "$PROJECT_ROOT" diff-index --quiet HEAD -- 2>/dev/null; then
        log_error "Working tree has uncommitted changes"
        log_error "Commit or stash changes before merging"
        exit 1
    fi
}

# Save merge state
save_merge_state() {
    local current_stream="$1"
    local status="$2"
    
    cat > "$MERGE_STATE_FILE" << EOF
{
  "current_stream": "$current_stream",
  "status": "$status",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Load merge state
load_merge_state() {
    if [ -f "$MERGE_STATE_FILE" ]; then
        if command -v jq &> /dev/null; then
            jq -r ".$1" "$MERGE_STATE_FILE" 2>/dev/null
        else
            python3 << EOF
import json
with open("$MERGE_STATE_FILE") as f:
    data = json.load(f)
print(data.get("$1", ""))
EOF
        fi
    fi
}

# Clear merge state
clear_merge_state() {
    rm -f "$MERGE_STATE_FILE"
}

# Merge a single stream
merge_stream() {
    local stream_name="$1"
    local branch_name="stream-${stream_name,,}"
    local dry_run="${2:-false}"
    
    log_info "Merging Stream ${stream_name}..."
    
    # Check branch exists
    if ! branch_exists "$branch_name"; then
        log_warn "Branch $branch_name does not exist, skipping"
        return 0
    fi
    
    if [ "$dry_run" = true ]; then
        log_info "[DRY RUN] Would merge: $branch_name into main"
        return 0
    fi
    
    # Perform merge
    if git -C "$PROJECT_ROOT" merge "$branch_name" -m "Merge $branch_name (Stream $stream_name) into main" --no-edit; then
        log_success "Merged $branch_name successfully"
        return 0
    else
        # Merge conflict
        log_error "Merge conflict in $branch_name"
        notify "Merge conflict detected in stream $stream_name"
        save_merge_state "$stream_name" "conflict"
        
        echo ""
        echo -e "${YELLOW}Merge conflict detected!${NC}"
        echo ""
        echo "Options:"
        echo "  1. Resolve conflicts manually, then run:"
        echo "     git add . && git commit"
        echo "     $0 --continue"
        echo ""
        echo "  2. Abort the merge:"
        echo "     $0 --abort"
        echo ""
        
        return 1
    fi
}

# Continue after conflict resolution
continue_merge() {
    local current_stream
    current_stream=$(load_merge_state "current_stream")
    
    if [ -z "$current_stream" ]; then
        log_error "No merge in progress"
        exit 1
    fi
    
    log_info "Continuing merge after conflict resolution..."
    
    # Check if merge is resolved
    if git -C "$PROJECT_ROOT" diff --name-only --diff-filter=U | head -n1 | grep -q .; then
        log_error "There are still unresolved conflicts"
        git -C "$PROJECT_ROOT" diff --name-only --diff-filter=U
        exit 1
    fi
    
    # Complete the merge commit if needed
    if git -C "$PROJECT_ROOT" status | grep -q "All conflicts fixed but you are still merging"; then
        git -C "$PROJECT_ROOT" commit --no-edit
    fi
    
    log_success "Merge resolved for Stream $current_stream"
    
    # Continue with remaining streams
    clear_merge_state
    run_merge_sequence
}

# Abort merge
abort_merge() {
    log_warn "Aborting merge..."
    
    git -C "$PROJECT_ROOT" merge --abort 2>/dev/null || true
    clear_merge_state
    
    log_success "Merge aborted"
}

# Run the full merge sequence
run_merge_sequence() {
    local dry_run="${1:-false}"
    
    log_info "Starting merge sequence..."
    
    # Get current branch
    local original_branch
    original_branch=$(git -C "$PROJECT_ROOT" branch --show-current)
    
    # Switch to main
    if [ "$original_branch" != "main" ]; then
        log_info "Switching to main branch..."
        git -C "$PROJECT_ROOT" checkout main
    fi
    
    # Check clean working tree
    check_clean_working_tree
    
    # Get merge order
    local merge_order
    merge_order=$(get_merge_order)
    
    if [ -z "$merge_order" ]; then
        log_warn "No merge order specified, using default (A, B, C, D)"
        merge_order="A B C D"
    fi
    
    echo ""
    echo -e "${CYAN}Merge Order:${NC} $merge_order"
    echo ""
    
    # Merge each stream in order
    local merged_count=0
    local total_count=0
    
    for stream in $merge_order; do
        total_count=$((total_count + 1))
        save_merge_state "$stream" "merging"
        
        if merge_stream "$stream" "$dry_run"; then
            merged_count=$((merged_count + 1))
        else
            # Conflict - stop here
            return 1
        fi
    done
    
    clear_merge_state
    
    # Success!
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ MERGE SEQUENCE COMPLETE                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Streams merged: $merged_count/$total_count"
    echo ""
    
    if [ "$dry_run" != true ]; then
        notify "All streams merged successfully. Ready for final testing."
        
        echo "Next steps:"
        echo "  1. Run tests: npm test"
        echo "  2. Check build: npm run build"
        echo "  3. Deploy: @ship-check && @ship-prod"
        echo ""
    fi
}

# Show status
show_status() {
    print_banner
    
    log_info "Merge Status"
    echo ""
    
    # Check current state
    local merge_status
    merge_status=$(load_merge_state "status")
    
    if [ -n "$merge_status" ]; then
        local current_stream
        current_stream=$(load_merge_state "current_stream")
        echo -e "Current State: ${YELLOW}$merge_status${NC}"
        echo -e "Current Stream: ${YELLOW}$current_stream${NC}"
        echo ""
    else
        echo "No merge in progress"
        echo ""
    fi
    
    # Show stream branches
    echo "Stream Branches:"
    for letter in A B C D E F G H; do
        local branch="stream-${letter,,}"
        if branch_exists "$branch"; then
            local commits
            commits=$(git -C "$PROJECT_ROOT" rev-list --count main.."$branch" 2>/dev/null || echo "?")
            echo -e "  ${GREEN}✓${NC} $branch ($commits commits ahead)"
        fi
    done
    echo ""
    
    # Show merge order
    local merge_order
    merge_order=$(get_merge_order | tr '\n' ' ')
    echo -e "Merge Order: $merge_order"
}

# Main
main() {
    local action="merge"
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run|-n)
                dry_run=true
                shift
                ;;
            --continue|-c)
                action="continue"
                shift
                ;;
            --abort|-a)
                action="abort"
                shift
                ;;
            --status|-s)
                action="status"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [project_root] [options]"
                echo ""
                echo "Options:"
                echo "  --dry-run, -n   Preview merge without making changes"
                echo "  --continue, -c  Continue after resolving conflicts"
                echo "  --abort, -a     Abort current merge"
                echo "  --status, -s    Show merge status"
                echo "  --help, -h      Show this help"
                exit 0
                ;;
            *)
                # Assume it's the project root
                if [ -d "$1" ]; then
                    PROJECT_ROOT="$(cd "$1" && pwd)"
                    CONFIG_DIR="$PROJECT_ROOT/.sigma/orchestration"
                    STREAMS_FILE="$CONFIG_DIR/streams.json"
                    MERGE_STATE_FILE="$CONFIG_DIR/merge-state.json"
                fi
                shift
                ;;
        esac
    done
    
    print_banner
    check_prerequisites
    
    case $action in
        merge)
            run_merge_sequence "$dry_run"
            ;;
        continue)
            continue_merge
            ;;
        abort)
            abort_merge
            ;;
        status)
            show_status
            ;;
    esac
}

main "$@"


