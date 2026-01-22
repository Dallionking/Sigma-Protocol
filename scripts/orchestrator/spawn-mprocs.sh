#!/bin/bash
# ============================================================================
# spawn-mprocs.sh - Sigma Protocol Multi-Agent Orchestration with mprocs TUI
# ============================================================================
# Uses mprocs (https://github.com/pvolok/mprocs) for a beautiful TUI
# with sidebar process management, keyboard navigation, and remote control.
#
# Usage:
#   ./spawn-mprocs.sh <project_root> [num_streams] [--agent=claude|opencode|manual]
#   ./spawn-mprocs.sh . 4
#   ./spawn-mprocs.sh /path/to/project 6 --agent=opencode
#
# Requirements:
#   - mprocs installed (brew install mprocs)
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

# Print banner
agent_display=$(get_agent_name "$SELECTED_AGENT")
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🐝 SIGMA PROTOCOL - MPROCS ORCHESTRATION                  ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
printf "║  Streams: %-5s  Agent: %-20s              ║\n" "$NUM_STREAMS" "$agent_display"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v mprocs &> /dev/null; then
    log_error "mprocs is not installed. Install with:"
    echo "  brew install mprocs"
    echo "  # or cargo install mprocs"
    exit 1
fi
log_success "mprocs found: $(mprocs --version 2>&1)"

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
            SELECTED_AGENT="manual"
        fi
        ;;
    opencode)
        if command -v opencode &> /dev/null; then
            log_success "OpenCode found"
            AGENT_CMD="opencode"
        else
            log_warn "OpenCode not found - falling back to manual mode"
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

# Worktrees directory
WORKTREES_DIR="$PROJECT_ROOT/../worktrees"

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

# Create mprocs.yaml config
log_info "Creating mprocs configuration..."

config_dir="$PROJECT_ROOT/.sigma/orchestration"
mkdir -p "$config_dir"

MPROCS_CONFIG="$config_dir/mprocs.yaml"

# Build the mprocs config
cat > "$MPROCS_CONFIG" << 'HEADER'
# Sigma Protocol Multi-Agent Orchestration - mprocs config
# https://github.com/pvolok/mprocs

# Process list width (sidebar)
proc_list_width: 30

# Scrollback buffer
scrollback: 10000

# Key bindings
keymap_procs:
  <C-q>: { c: quit-or-ask }
  <C-a>: { c: toggle-focus }
  
keymap_term:
  <C-a>: { c: toggle-focus }

procs:
HEADER

# Add orchestrator process
if [ -n "$AGENT_CMD" ]; then
    cat >> "$MPROCS_CONFIG" << EOF
  orchestrator:
    shell: "cd '$PROJECT_ROOT' && export SIGMA_ROLE=orchestrator && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🎯 ORCHESTRATOR - Run @orchestrate' && $AGENT_CMD"
    cwd: "$PROJECT_ROOT"
    env:
      SIGMA_ROLE: orchestrator
      SIGMA_AGENT: "$SELECTED_AGENT"
EOF
else
    cat >> "$MPROCS_CONFIG" << EOF
  orchestrator:
    shell: "cd '$PROJECT_ROOT' && export SIGMA_ROLE=orchestrator && echo '🎯 ORCHESTRATOR - Manual mode: Launch your AI agent and run @orchestrate' && bash"
    cwd: "$PROJECT_ROOT"
    env:
      SIGMA_ROLE: orchestrator
      SIGMA_AGENT: manual
EOF
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
        cat >> "$MPROCS_CONFIG" << EOF
  stream-$letter:
    shell: "cd '$work_dir' && export SIGMA_STREAM=$letter && export SIGMA_AGENT='$SELECTED_AGENT' && echo '🐝 STREAM $letter - Run @stream --name=$letter' && $AGENT_CMD"
    cwd: "$work_dir"
    env:
      SIGMA_STREAM: "$letter"
      SIGMA_AGENT: "$SELECTED_AGENT"
      SIGMA_ROLE: stream
EOF
    else
        cat >> "$MPROCS_CONFIG" << EOF
  stream-$letter:
    shell: "cd '$work_dir' && export SIGMA_STREAM=$letter && echo '🐝 STREAM $letter - Manual mode: Launch your AI agent and run @stream --name=$letter' && bash"
    cwd: "$work_dir"
    env:
      SIGMA_STREAM: "$letter"
      SIGMA_AGENT: manual
      SIGMA_ROLE: stream
EOF
    fi
done

log_success "Created mprocs config: $MPROCS_CONFIG"

# Create streams.json
log_info "Creating orchestration configuration..."

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
  "mode": "mprocs",
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
echo -e "${GREEN}║              🎉 MPROCS ORCHESTRATION READY!                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Streams: $NUM_STREAMS"
echo "Agent:   $agent_display"
echo "Project: $PROJECT_ROOT"
echo "Config:  $MPROCS_CONFIG"
echo ""
echo -e "${YELLOW}mprocs TUI Keyboard Shortcuts:${NC}"
echo "  q           — Quit (graceful)"
echo "  Q           — Force quit"
echo "  k / ↑       — Select previous process"
echo "  j / ↓       — Select next process"
echo "  x           — Stop selected process"
echo "  s           — Start selected process"
echo "  r           — Restart selected process"
echo "  Ctrl+A      — Toggle focus (sidebar ↔ terminal)"
echo "  z           — Zoom into terminal"
echo "  v           — Enter copy mode"
echo ""
if [ "$SELECTED_AGENT" == "manual" ]; then
    echo -e "${YELLOW}Manual Mode:${NC}"
    echo "  In each process, launch your preferred AI agent"
    echo "  Then run the corresponding @sigma command."
    echo ""
fi

# Ask to start
read -p "Start mprocs now? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    log_info "Starting mprocs..."
    cd "$PROJECT_ROOT"
    exec mprocs --config "$MPROCS_CONFIG"
fi

