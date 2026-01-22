#!/bin/bash
# ============================================================================
# spawn-overmind.sh - Sigma Protocol Multi-Agent Orchestration with Overmind TUI
# ============================================================================
# Uses Overmind (https://github.com/DarthSim/overmind) for a beautiful TUI
# with sidebar process management, similar to the screenshot you shared.
#
# Usage:
#   ./spawn-overmind.sh <project_root> [num_streams] [--agent=claude|opencode|manual]
#   ./spawn-overmind.sh . 4
#   ./spawn-overmind.sh /path/to/project 6 --agent=opencode
#
# Requirements:
#   - overmind installed (brew install overmind)
#   - tmux installed
#   - git repository initialized
#   - Your chosen AI agent installed (claude, opencode, or manual mode)
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEFAULT_STREAMS=4
MAX_STREAMS=8
AGENT_TYPE="${SIGMA_AGENT:-auto}"

# Parse arguments
PROJECT_ROOT="${1:-.}"
NUM_STREAMS_ARG="${2:-}"
AGENT_ARG=""

# Parse remaining arguments
for arg in "$@"; do
    case $arg in
        --agent=*)
            AGENT_ARG="${arg#*=}"
            ;;
    esac
done

# Resolve absolute path
PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

# Logging
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Detect stream count dynamically
detect_stream_count() {
    local project="$1"
    local count=0
    
    # Check streams.json
    local streams_json="$project/.sigma/orchestration/streams.json"
    if [ -f "$streams_json" ]; then
        count=$(grep -o '"name"' "$streams_json" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "$count"
            return
        fi
    fi
    
    # Count PRD files in orchestration directory
    local prd_dir="$project/.sigma/orchestration/prds"
    if [ -d "$prd_dir" ]; then
        count=$(find "$prd_dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "$count"
            return
        fi
    fi
    
    # Count PRD files in docs/prds
    local docs_prd_dir="$project/docs/prds"
    if [ -d "$docs_prd_dir" ]; then
        count=$(find "$docs_prd_dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ] && [ "$count" -le "$MAX_STREAMS" ]; then
            echo "$count"
            return
        fi
    fi
    
    # Count Ralph PRD directories
    local ralph_dir="$project/docs/ralph"
    if [ -d "$ralph_dir" ]; then
        count=$(find "$ralph_dir" -name "prd.json" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ] && [ "$count" -le "$MAX_STREAMS" ]; then
            echo "$count"
            return
        fi
    fi
    
    echo "$DEFAULT_STREAMS"
}

# Determine stream count
if [ -n "$NUM_STREAMS_ARG" ] && [[ "$NUM_STREAMS_ARG" =~ ^[0-9]+$ ]]; then
    NUM_STREAMS="$NUM_STREAMS_ARG"
else
    NUM_STREAMS=$(detect_stream_count "$PROJECT_ROOT")
    log_info "Auto-detected $NUM_STREAMS streams from project PRDs"
fi

# Validate
if [[ ! "$NUM_STREAMS" =~ ^[0-9]+$ ]] || [ "$NUM_STREAMS" -lt 1 ] || [ "$NUM_STREAMS" -gt "$MAX_STREAMS" ]; then
    log_error "Invalid stream count: $NUM_STREAMS (must be 1-$MAX_STREAMS)"
    exit 1
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

# Worktrees directory
WORKTREES_DIR="$PROJECT_ROOT/../worktrees"

# Print banner
agent_display=$(get_agent_name "$SELECTED_AGENT")
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🐝 SIGMA PROTOCOL - OVERMIND ORCHESTRATION                ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
printf "║  Streams: %-5s  Agent: %-20s              ║\n" "$NUM_STREAMS" "$agent_display"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v overmind &> /dev/null; then
    log_error "overmind is not installed. Install with:"
    echo "  brew install overmind"
    exit 1
fi
log_success "overmind found: $(overmind --version 2>&1 | head -1)"

if ! command -v tmux &> /dev/null; then
    log_error "tmux is not installed"
    exit 1
fi
log_success "tmux found"

if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &> /dev/null; then
    log_error "Not a git repository: $PROJECT_ROOT"
    exit 1
fi
log_success "Git repository found"

# Check selected agent
AGENT_CMD=""
case "$SELECTED_AGENT" in
    claude)
        if command -v claude &> /dev/null; then
            log_success "Claude Code found"
            AGENT_CMD="claude"
        else
            log_warn "Claude Code not found - falling back to manual mode"
            log_warn "Install with: npm install -g @anthropic/claude-code"
            SELECTED_AGENT="manual"
        fi
        ;;
    opencode)
        if command -v opencode &> /dev/null; then
            log_success "OpenCode found"
            AGENT_CMD="opencode"
        else
            log_warn "OpenCode not found - falling back to manual mode"
            log_warn "Install with: npm install -g opencode"
            SELECTED_AGENT="manual"
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

# Create Git worktrees
log_info "Creating Git worktrees..."
mkdir -p "$WORKTREES_DIR"

letters=("A" "B" "C" "D" "E" "F" "G" "H")
current_branch=$(git -C "$PROJECT_ROOT" branch --show-current)

for i in $(seq 0 $((NUM_STREAMS - 1))); do
    letter="${letters[$i]}"
    letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
    worktree_path="$WORKTREES_DIR/stream-${letter_lower}"
    branch_name="stream-${letter_lower}"
    
    if [ -d "$worktree_path" ]; then
        log_info "Worktree exists: stream-${letter_lower}"
        continue
    fi
    
    # Create branch if needed
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

# Create Procfile for Overmind
log_info "Creating Procfile for Overmind..."

PROCFILE="$PROJECT_ROOT/.sigma/orchestration/Procfile.sigma"
mkdir -p "$(dirname "$PROCFILE")"

cat > "$PROCFILE" << 'PROCFILE_HEADER'
# Sigma Protocol Multi-Agent Orchestration Procfile
# Each process runs Claude Code in its own worktree
# Use overmind connect <name> to attach to a specific agent

PROCFILE_HEADER

# Add orchestrator
if [ -n "$AGENT_CMD" ]; then
    echo "orchestrator: cd '$PROJECT_ROOT' && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🎯 ORCHESTRATOR - Run @orchestrate' && $AGENT_CMD" >> "$PROCFILE"
else
    echo "orchestrator: cd '$PROJECT_ROOT' && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🎯 ORCHESTRATOR - Manual mode: Launch your AI agent and run @orchestrate' && bash" >> "$PROCFILE"
fi

# Add stream agents
for i in $(seq 0 $((NUM_STREAMS - 1))); do
    letter="${letters[$i]}"
    letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
    worktree_path="$WORKTREES_DIR/stream-${letter_lower}"
    
    if [ -d "$worktree_path" ]; then
        work_dir="$worktree_path"
    else
        work_dir="$PROJECT_ROOT"
    fi
    
    if [ -n "$AGENT_CMD" ]; then
        echo "agent-${letter_lower}: cd '$work_dir' && export SIGMA_STREAM=$letter && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🐝 STREAM $letter - Run @stream --name=$letter' && $AGENT_CMD" >> "$PROCFILE"
    else
        echo "agent-${letter_lower}: cd '$work_dir' && export SIGMA_STREAM=$letter && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🐝 STREAM $letter - Manual mode: Launch your AI agent and run @stream --name=$letter' && bash" >> "$PROCFILE"
    fi
done

log_success "Created Procfile: $PROCFILE"

# Create orchestration config
log_info "Creating orchestration configuration..."

config_dir="$PROJECT_ROOT/.sigma/orchestration"
streams_json="["

for i in $(seq 0 $((NUM_STREAMS - 1))); do
    letter="${letters[$i]}"
    letter_lower=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
    worktree="stream-${letter_lower}"
    
    if [ $i -gt 0 ]; then
        streams_json+=","
    fi
    
    streams_json+="{\"name\":\"$letter\",\"prds\":[],\"worktree\":\"$worktree\",\"status\":\"ready\"}"
done
streams_json+="]"

cat > "$config_dir/streams.json" << EOF
{
  "version": "1.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "mode": "overmind",
  "agent": "$SELECTED_AGENT",
  "projectRoot": "$PROJECT_ROOT",
  "streams": $streams_json,
  "merge_order": [$(for i in $(seq 0 $((NUM_STREAMS - 1))); do echo -n "\"${letters[$i]}\""; [ $i -lt $((NUM_STREAMS - 1)) ] && echo -n ","; done)]
}
EOF

log_success "Created streams.json"

# Print instructions
agent_display=$(get_agent_name "$SELECTED_AGENT")
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 OVERMIND ORCHESTRATION READY!                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Streams: $NUM_STREAMS"
echo "Agent:   $agent_display"
echo "Project: $PROJECT_ROOT"
echo "Procfile: $PROCFILE"
echo ""
echo -e "${YELLOW}To start the TUI orchestration:${NC}"
echo "  cd '$PROJECT_ROOT'"
echo "  overmind start -f .sigma/orchestration/Procfile.sigma"
echo ""
echo -e "${YELLOW}Overmind TUI Commands:${NC}"
echo "  overmind connect orchestrator  # Connect to orchestrator"
echo "  overmind connect agent-a       # Connect to Stream A"
echo "  overmind connect agent-b       # Connect to Stream B"
echo "  overmind status                # Show all process statuses"
echo "  overmind restart agent-a       # Restart Stream A"
echo "  overmind quit                  # Stop all agents gracefully"
echo ""
echo -e "${YELLOW}Inside Overmind TUI:${NC}"
echo "  Ctrl+C then 'a'    # Toggle focus between processes"
echo "  j/k                # Navigate up/down in process list"
echo "  s                  # Start selected process"
echo "  q                  # Quit Overmind"
echo ""
if [ "$SELECTED_AGENT" == "manual" ]; then
    echo -e "${YELLOW}Manual Mode:${NC}"
    echo "  In each process, launch your preferred AI agent (claude, opencode, cursor, etc.)"
    echo "  Then run the corresponding @sigma command."
    echo ""
fi

# Ask to start
read -p "Start Overmind now? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    log_info "Starting Overmind..."
    cd "$PROJECT_ROOT"
    overmind start -f .sigma/orchestration/Procfile.sigma
fi

