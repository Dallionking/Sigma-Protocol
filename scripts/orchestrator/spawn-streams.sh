#!/bin/bash
# ============================================================================
# spawn-streams.sh - Sigma Protocol Multi-Agent Stream Spawner
# ============================================================================
# Spawns a tmux session with orchestrator + N stream panes, each running
# your chosen AI coding agent in its own Git worktree for parallel PRD implementation.
#
# Usage:
#   ./spawn-streams.sh <project_root> [num_streams] [--agent=claude|opencode|manual] [--attach]
#   ./spawn-streams.sh . 4
#   ./spawn-streams.sh /path/to/project 6 --agent=opencode --attach
#
# Requirements:
#   - tmux installed
#   - git repository initialized
#   - Your chosen AI agent installed (claude, opencode, or manual mode)
#
# Environment Variables:
#   SIGMA_ORCHESTRATOR_MODE: full-auto | semi-auto | manual (default: semi-auto)
#   SIGMA_NOTIFY_ON: Comma-separated events to notify on
#   SIGMA_AGENT: claude | opencode | manual (default: auto-detect)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SESSION_NAME="sigma-orchestration"
DEFAULT_STREAMS=4
MAX_STREAMS=8
AGENT_TYPE="${SIGMA_AGENT:-auto}"

# Parse arguments
PROJECT_ROOT="${1:-.}"
NUM_STREAMS_ARG="${2:-}"
AUTO_ATTACH=""
AGENT_ARG=""

# Parse remaining arguments
shift 2 2>/dev/null || true
for arg in "$@"; do
    case $arg in
        --attach|-a)
            AUTO_ATTACH="--attach"
            ;;
        --agent=*)
            AGENT_ARG="${arg#*=}"
            ;;
    esac
done

# Function to detect stream count dynamically
detect_stream_count() {
    local project="$1"
    local count=0
    
    # First, check if streams.json exists and has streams defined
    local streams_json="$project/.sigma/orchestration/streams.json"
    if [ -f "$streams_json" ]; then
        # Count streams from existing config (using grep to avoid jq dependency)
        count=$(grep -o '"name"' "$streams_json" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "$count"
            return
        fi
    fi
    
    # Second, count PRD files in orchestration directory
    local prd_dir="$project/.sigma/orchestration/prds"
    if [ -d "$prd_dir" ]; then
        count=$(find "$prd_dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "$count"
            return
        fi
    fi
    
    # Third, count PRD files in docs/prds
    local docs_prd_dir="$project/docs/prds"
    if [ -d "$docs_prd_dir" ]; then
        count=$(find "$docs_prd_dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ] && [ "$count" -le "$MAX_STREAMS" ]; then
            echo "$count"
            return
        fi
    fi
    
    # Default
    echo "$DEFAULT_STREAMS"
}

# Resolve absolute path first (needed for detect_stream_count)
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

# Determine stream count
if [ -n "$NUM_STREAMS_ARG" ] && [[ "$NUM_STREAMS_ARG" =~ ^[0-9]+$ ]]; then
    NUM_STREAMS="$NUM_STREAMS_ARG"
else
    # Auto-detect from PRDs
    NUM_STREAMS=$(detect_stream_count "$PROJECT_ROOT")
    log_info "Auto-detected $NUM_STREAMS streams from project PRDs"
fi

# Determine agent type
detect_agent() {
    # If explicitly set via argument or env var
    if [ -n "$AGENT_ARG" ]; then
        echo "$AGENT_ARG"
        return
    fi
    
    if [ "$AGENT_TYPE" != "auto" ]; then
        echo "$AGENT_TYPE"
        return
    fi
    
    # Auto-detect: prefer claude, then opencode, then manual
    if command -v claude &> /dev/null; then
        echo "claude"
    elif command -v opencode &> /dev/null; then
        echo "opencode"
    else
        echo "manual"
    fi
}

SELECTED_AGENT=$(detect_agent)

# Get agent display name
get_agent_name() {
    case "$1" in
        claude) echo "Claude Code" ;;
        opencode) echo "OpenCode" ;;
        manual) echo "Manual (no auto-launch)" ;;
        *) echo "$1" ;;
    esac
}

# Worktrees directory (sibling to project)
WORKTREES_DIR="$PROJECT_ROOT/../worktrees"

# Logging functions
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Print banner
print_banner() {
    local agent_display
    agent_display=$(get_agent_name "$SELECTED_AGENT")
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          🐝 SIGMA PROTOCOL - MULTI-AGENT ORCHESTRATION        ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    printf "║  Streams: %-5s  Agent: %-20s              ║\n" "$NUM_STREAMS" "$agent_display"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check tmux
    if ! command -v tmux &> /dev/null; then
        log_error "tmux is not installed. Please install it first:"
        echo "  macOS: brew install tmux"
        echo "  Ubuntu: sudo apt install tmux"
        exit 1
    fi
    log_success "tmux found: $(tmux -V)"
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    # Check if in git repo
    if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &> /dev/null; then
        log_error "Not a git repository: $PROJECT_ROOT"
        exit 1
    fi
    log_success "Git repository found"
    
    # Check selected agent
    case "$SELECTED_AGENT" in
        claude)
            if ! command -v claude &> /dev/null; then
                log_warn "Claude Code not found in PATH"
                log_warn "Install with: npm install -g @anthropic/claude-code"
                SELECTED_AGENT="manual"
            else
                log_success "Claude Code found"
            fi
            ;;
        opencode)
            if ! command -v opencode &> /dev/null; then
                log_warn "OpenCode not found in PATH"
                log_warn "Install with: npm install -g opencode"
                SELECTED_AGENT="manual"
            else
                log_success "OpenCode found"
            fi
            ;;
        manual)
            log_info "Manual mode - no auto-launch of AI agent"
            ;;
        *)
            log_warn "Unknown agent: $SELECTED_AGENT, falling back to manual"
            SELECTED_AGENT="manual"
            ;;
    esac
    
    # Validate stream count
    if [[ ! "$NUM_STREAMS" =~ ^[0-9]+$ ]] || [ "$NUM_STREAMS" -lt 1 ] || [ "$NUM_STREAMS" -gt "$MAX_STREAMS" ]; then
        log_error "Invalid stream count: $NUM_STREAMS (must be 1-$MAX_STREAMS)"
        exit 1
    fi
}

# Check for existing session
check_existing_session() {
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        log_warn "Session '$SESSION_NAME' already exists"
        echo ""
        echo "Options:"
        echo "  1) Attach to existing session: tmux attach -t $SESSION_NAME"
        echo "  2) Kill and recreate: tmux kill-session -t $SESSION_NAME"
        echo ""
        read -p "Kill existing session and create new? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            tmux kill-session -t "$SESSION_NAME"
            log_success "Existing session killed"
        else
            log_info "Attaching to existing session..."
            tmux attach -t "$SESSION_NAME"
            exit 0
        fi
    fi
}

# Create Git worktrees for each stream
create_worktrees() {
    log_info "Creating Git worktrees for parallel development..."
    
    mkdir -p "$WORKTREES_DIR"
    
    local letters=("A" "B" "C" "D" "E" "F" "G" "H")
    local current_branch
    current_branch=$(git -C "$PROJECT_ROOT" branch --show-current)
    
    for i in $(seq 0 $((NUM_STREAMS - 1))); do
        local letter="${letters[$i]}"
        # Portable lowercase conversion (works on bash 3.x and macOS)
        local letter_lower
        letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
        local worktree_path="$WORKTREES_DIR/stream-${letter_lower}"
        local branch_name="stream-${letter_lower}"
        
        if [ -d "$worktree_path" ]; then
            log_info "Worktree exists: $worktree_path"
            continue
        fi
        
        # Create branch if it doesn't exist
        if ! git -C "$PROJECT_ROOT" show-ref --verify --quiet "refs/heads/$branch_name"; then
            git -C "$PROJECT_ROOT" branch "$branch_name" "$current_branch" 2>/dev/null || true
        fi
        
        # Create worktree
        git -C "$PROJECT_ROOT" worktree add "$worktree_path" "$branch_name" 2>/dev/null || {
            log_warn "Worktree creation failed for $letter, using detached HEAD"
            git -C "$PROJECT_ROOT" worktree add --detach "$worktree_path" 2>/dev/null || true
        }
        
        log_success "Created worktree: stream-${letter_lower}"
    done
}

# Create tmux session with panes
create_tmux_session() {
    log_info "Creating tmux session with $((NUM_STREAMS + 1)) panes..."
    
    local letters=("A" "B" "C" "D" "E" "F" "G" "H")
    
    # Create session (detached)
    tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_ROOT" -n "sigma"
    
    # Name the first pane (orchestrator)
    tmux select-pane -t "$SESSION_NAME:0.0" -T "ORCHESTRATOR"
    
    # Create panes for each stream
    for i in $(seq 1 $NUM_STREAMS); do
        tmux split-window -t "$SESSION_NAME" -h -c "$PROJECT_ROOT"
        tmux select-layout -t "$SESSION_NAME" tiled
    done
    
    # Final tiled layout
    tmux select-layout -t "$SESSION_NAME" tiled
    
    log_success "Created tmux session with $((NUM_STREAMS + 1)) panes"
}

# Launch AI agent in each pane
launch_agent_instances() {
    local agent_name
    agent_name=$(get_agent_name "$SELECTED_AGENT")
    log_info "Launching $agent_name instances..."
    
    local letters=("A" "B" "C" "D" "E" "F" "G" "H")
    
    # Get the launch command for the selected agent
    get_agent_command() {
        case "$SELECTED_AGENT" in
            claude) echo "claude" ;;
            opencode) echo "opencode" ;;
            manual) echo "" ;;
            *) echo "" ;;
        esac
    }
    
    local agent_cmd
    agent_cmd=$(get_agent_command)
    
    # Orchestrator pane (pane 0)
    tmux send-keys -t "$SESSION_NAME:0.0" "export SIGMA_ROLE=orchestrator" Enter
    tmux send-keys -t "$SESSION_NAME:0.0" "export SIGMA_AGENT='$SELECTED_AGENT'" Enter
    tmux send-keys -t "$SESSION_NAME:0.0" "export SIGMA_PROJECT_ROOT='$PROJECT_ROOT'" Enter
    tmux send-keys -t "$SESSION_NAME:0.0" "cd '$PROJECT_ROOT'" Enter
    tmux send-keys -t "$SESSION_NAME:0.0" "echo '🎯 ORCHESTRATOR - Run @orchestrate'" Enter
    
    if [ -n "$agent_cmd" ]; then
        tmux send-keys -t "$SESSION_NAME:0.0" "$agent_cmd" Enter
    else
        tmux send-keys -t "$SESSION_NAME:0.0" "echo 'Manual mode: Launch your AI agent and run @orchestrate'" Enter
    fi
    
    # Stream panes
    for i in $(seq 1 $NUM_STREAMS); do
        local pane_index=$i
        local letter="${letters[$((i-1))]}"
        # Portable lowercase conversion
        local letter_lower
        letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
        local worktree_path="$WORKTREES_DIR/stream-${letter_lower}"
        
        # Set environment and navigate
        tmux send-keys -t "$SESSION_NAME:0.$pane_index" "export SIGMA_ROLE=stream" Enter
        tmux send-keys -t "$SESSION_NAME:0.$pane_index" "export SIGMA_STREAM_NAME='$letter'" Enter
        tmux send-keys -t "$SESSION_NAME:0.$pane_index" "export SIGMA_AGENT='$SELECTED_AGENT'" Enter
        tmux send-keys -t "$SESSION_NAME:0.$pane_index" "export SIGMA_PROJECT_ROOT='$PROJECT_ROOT'" Enter
        
        if [ -d "$worktree_path" ]; then
            tmux send-keys -t "$SESSION_NAME:0.$pane_index" "cd '$worktree_path'" Enter
        else
            tmux send-keys -t "$SESSION_NAME:0.$pane_index" "cd '$PROJECT_ROOT'" Enter
        fi
        
        tmux send-keys -t "$SESSION_NAME:0.$pane_index" "echo '🐝 STREAM $letter - Run @stream --name=$letter'" Enter
        
        if [ -n "$agent_cmd" ]; then
            tmux send-keys -t "$SESSION_NAME:0.$pane_index" "$agent_cmd" Enter
        else
            tmux send-keys -t "$SESSION_NAME:0.$pane_index" "echo 'Manual mode: Launch your AI agent and run @stream --name=$letter'" Enter
        fi
    done
    
    log_success "Launched $agent_name instances in all panes"
}

# Create orchestration config file
create_orchestration_config() {
    log_info "Creating orchestration configuration..."
    
    local config_dir="$PROJECT_ROOT/.sigma/orchestration"
    mkdir -p "$config_dir"
    
    local letters=("A" "B" "C" "D" "E" "F" "G" "H")
    local streams_json="["
    
    for i in $(seq 0 $((NUM_STREAMS - 1))); do
        local letter="${letters[$i]}"
        # Portable lowercase conversion
        local letter_lower
        letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
        local worktree="stream-${letter_lower}"
        
        if [ $i -gt 0 ]; then
            streams_json+=","
        fi
        
        streams_json+="{\"name\":\"$letter\",\"prds\":[],\"worktree\":\"$worktree\"}"
    done
    streams_json+="]"
    
    cat > "$config_dir/streams.json" << EOF
{
  "version": "1.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "session": "$SESSION_NAME",
  "agent": "$SELECTED_AGENT",
  "projectRoot": "$PROJECT_ROOT",
  "streams": $streams_json,
  "dependencies": {},
  "merge_order": [$(for i in $(seq 0 $((NUM_STREAMS - 1))); do echo -n "\"${letters[$i]}\""; [ $i -lt $((NUM_STREAMS - 1)) ] && echo -n ","; done)]
}
EOF
    
    # Create active lock file
    touch "$config_dir/active.lock"
    
    log_success "Created orchestration config: $config_dir/streams.json"
}

# Print post-setup instructions
print_instructions() {
    local agent_name
    agent_name=$(get_agent_name "$SELECTED_AGENT")
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 ORCHESTRATION READY!                          ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Session: $SESSION_NAME"
    echo "Streams: $NUM_STREAMS"
    echo "Agent:   $agent_name"
    echo "Project: $PROJECT_ROOT"
    echo ""
    echo -e "${YELLOW}Quick Commands:${NC}"
    echo "  Attach:     tmux attach -t $SESSION_NAME"
    echo "  Detach:     Ctrl+B then D"
    echo "  Switch:     Ctrl+B then arrow keys"
    echo "  Zoom:       Ctrl+B then Z"
    echo "  Kill:       tmux kill-session -t $SESSION_NAME"
    echo ""
    
    if [ "$SELECTED_AGENT" == "manual" ]; then
        echo -e "${YELLOW}Manual Mode - In each pane:${NC}"
        echo "  1. Launch your AI agent (claude, opencode, cursor, etc.)"
        echo "  2. In ORCHESTRATOR: @orchestrate"
        echo "  3. In STREAMS: @stream --name=A (or B, C, etc.)"
    else
        echo -e "${YELLOW}In the ORCHESTRATOR pane, run:${NC}"
        echo "  @orchestrate"
        echo ""
        echo -e "${YELLOW}In each STREAM pane, run:${NC}"
        echo "  @stream --name=A  (for stream A)"
        echo "  @stream --name=B  (for stream B)"
        echo "  ..."
    fi
    echo ""
}

# Cleanup function
cleanup() {
    local config_dir="$PROJECT_ROOT/.sigma/orchestration"
    if [ -f "$config_dir/active.lock" ]; then
        rm -f "$config_dir/active.lock"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    print_banner
    check_prerequisites
    check_existing_session
    create_worktrees
    create_tmux_session
    launch_agent_instances
    create_orchestration_config
    print_instructions
    
    # Give tmux a moment to stabilize
    sleep 1
    
    # Attach if requested
    if [ "$AUTO_ATTACH" == "--attach" ] || [ "$AUTO_ATTACH" == "-a" ]; then
        log_info "Attaching to session..."
        # Use exec to replace the current process with tmux
        exec tmux attach -t "$SESSION_NAME"
    else
        echo -e "${CYAN}To attach to the session, run:${NC}"
        echo "  tmux attach -t $SESSION_NAME"
        echo ""
    fi
}

# Run main
main "$@"

