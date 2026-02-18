#!/usr/bin/env bash
# =============================================================================
# Sigma-Ralph Loop Runner
# =============================================================================
# Ralph-style autonomous implementation loop that spawns fresh Claude Code or
# OpenCode sessions for each story, ensuring clean context per iteration.
#
# Usage:
#   sigma-ralph.sh --workspace=/path/to/project --mode=prototype
#   sigma-ralph.sh --workspace=/path/to/project --mode=implementation --stream=1
#   sigma-ralph.sh --workspace=/path/to/project --backlog=docs/ralph/custom/prd.json
#
# Requirements:
#   - claude or opencode CLI installed
#   - jq for JSON parsing
#   - prd.json backlog created by Step 5.5 or Step 11.25
#
# Based on the Ralph pattern: https://github.com/snarktank/ralph
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

VERSION="3.0.0"  # Native task persistence, atomic backlog updates, parent task creation. v2.2.0: sandbox isolation, retry limits, backoff, validation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIGMA_PROTOCOL_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Source the dynamic skill registry system
if [[ -f "$SCRIPT_DIR/skill-registry.sh" ]]; then
    source "$SCRIPT_DIR/skill-registry.sh"
    SKILL_REGISTRY_AVAILABLE=true
else
    SKILL_REGISTRY_AVAILABLE=false
fi

# Default values
WORKSPACE=""
MODE="prototype"
BACKLOG=""
STREAM=""
MAX_ITERATIONS=100
ENGINE="auto"
DRY_RUN=false
VERBOSE=false
SKIP_VERIFICATION=false
PROMPT_TEMPLATE=""
QUIET=false

# NEW v2.0.0: Parallel execution mode
PARALLEL=false                  # Run streams in parallel
PARALLEL_MONITOR_INTERVAL=10    # Seconds between status checks

# NEW v3.1.0: Swarm mode (claudesp integration)
SWARM_MODE=false                # Enable swarm mode with claudesp
SWARM_SPAWN_SUBAGENTS=true      # Always spawn sub-agents for every story

# NEW v2.2.0: Sandbox isolation settings
SANDBOX_ENABLED=false           # Enable sandbox isolation
SANDBOX_PROVIDER="docker"       # docker, e2b, daytona
SANDBOX_TIMEOUT=120             # Sandbox creation timeout (seconds)
SANDBOX_MEMORY="4g"             # Docker memory limit
SANDBOX_CPUS=2                  # Docker CPU limit
BUDGET_MAX=50                   # Max spend in USD before stopping
BUDGET_WARN=25                  # Warning threshold in USD
VALIDATE_ONLY=false             # Only validate PRD without running
ENGINE_ARGS=""                  # Extra args to pass to the engine

# Native Task Management (v3.0.0)
NATIVE_TASKS_ENABLED=false      # Enable Claude Code native task tracking
TASK_LIST_ID=""                 # Task list ID for persistence across sessions

# Retry limits with exponential backoff (PR #98, #106)
declare -A RETRY_COUNTS         # Track retries per story
MAX_RETRIES="${MAX_RETRIES:-3}" # Max retries (env override)
BACKOFF_INITIAL=2               # Initial backoff in seconds
BACKOFF_MAX=60                  # Maximum backoff in seconds

# Error recovery settings
STORY_TIMEOUT=600           # 10 minutes per story
MAX_RETRIES_PER_STORY=2     # Retry failed stories up to 2 times
RETRY_DELAY=5               # Seconds between retries
AUTO_ROLLBACK=true          # Git rollback on failure
FAILURE_MODE="prompt"       # prompt | skip | abort

# Session auto-restart settings (for Claude Code Max session limits)
SESSION_TIMEOUT=9000        # 2 hours 30 minutes = 9000 seconds
AUTO_RESTART=false          # Auto-restart when session timeout reached
SESSION_START_TIME=0        # Tracks when this session started

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Activity monitor DEPRECATED in v2.1.17
# Native Claude Code now provides:
# - Task spinner with activeForm (shows current sub-task)
# - /tasks command for progress overview
# - Built-in status line with context usage
#
# The custom heartbeat monitor has been removed in favor of:
# 1. stream-json mode with activity-filter.sh for real-time output
# 2. Native TaskCreate/TaskUpdate for sub-task tracking
# 3. Native Claude Code status indicators
#
# For OpenCode, progress is shown via its native status display.

show_help() {
    cat << EOF
Sigma-Ralph Loop Runner v${VERSION}

Ralph-style autonomous implementation loop for Sigma Protocol.
Spawns fresh Claude Code or OpenCode sessions for each story.

USAGE:
    sigma-ralph.sh [OPTIONS]

OPTIONS:
    --workspace=PATH       Path to target project workspace (required)
    --mode=MODE            Backlog mode: prototype (Step 5.5) or implementation (Step 11.25)
                           Default: prototype
    --backlog=PATH         Custom backlog path (overrides mode-based default)
    --stream=ID            Only process stories in this stream/swarm
    --max-iterations=N     Maximum iterations before stopping (default: 100)
    --engine=ENGINE        AI engine: auto, claude, opencode (default: auto)
    --dry-run              Show what would be done without executing
    --skip-verification    Skip verification commands (faster, less safe)
    --verbose              Show detailed output
    --quiet, -q            Disable real-time activity monitor
    --help                 Show this help message

ERROR RECOVERY OPTIONS:
    --timeout=SECONDS      Timeout per story in seconds (default: 600 = 10 min)
    --max-retries=N        Max retries per story before skipping (default: 2)
    --failure-mode=MODE    How to handle failures: prompt, skip, abort (default: prompt)
    --no-rollback          Don't auto-rollback git changes on failure

SESSION AUTO-RESTART OPTIONS:
    --auto-restart         Enable auto-restart when session timeout reached
    --session-timeout=SEC  Session timeout in seconds (default: 9000 = 2h30m)
                           Restarts loop before Claude Code session expires

PARALLEL EXECUTION OPTIONS (v2.0.0 - Claude Code v2.1.17+):
    --parallel, -P         Run streams in parallel (requires streams[] in backlog)
    --parallel-interval=N  Seconds between status checks (default: 10)

    Parallel mode spawns independent Claude sessions for each stream defined
    in the backlog. Stories within a stream run sequentially, but streams run
    concurrently. Uses background agents with run_in_background for monitoring.

NATIVE TASK MANAGEMENT (v3.0.0):
    --native-tasks         Enable Claude Code native task tracking
    --task-list-id=ID      Use specific task list ID (for resume across sessions)
    --no-native-tasks      Force disable native tasks (override env var)

    Native task mode creates parent tasks for each story and exports
    CLAUDE_CODE_TASK_LIST_ID for persistence. The task list ID is stored
    in prd.json for automatic resume.

SWARM MODE (v3.1.0 - Swarm-First Philosophy):
    --swarm                Enable swarm mode with claudesp (Claude Swarm Protocol)
    --no-swarm-spawn       Disable automatic sub-agent spawning (not recommended)

    Swarm mode uses claudesp instead of claude CLI, enabling:
    - Automatic sub-agent spawning for every story
    - Parallel agent execution within each story
    - Agent-to-task routing based on file patterns
    - Skill injection based on task type

    Each story session can spawn:
    - sigma-planner for design decisions
    - sigma-executor for implementation
    - sigma-reviewer for verification

SANDBOX ISOLATION OPTIONS (v2.2.0):
    --sandbox              Enable sandbox isolation for story execution
    --sandbox-provider=P   Provider: docker (default), e2b, daytona
    --sandbox-timeout=S    Sandbox creation timeout in seconds (default: 120)
    --sandbox-memory=SIZE  Docker memory limit (default: 4g)
    --sandbox-cpus=N       Docker CPU limit (default: 2)
    --budget-max=USD       Max spend before stopping (default: 50)
    --budget-warn=USD      Warning threshold (default: 25)
    --validate-only        Validate PRD without executing stories
    --                     Pass remaining args to AI engine (e.g. -- --dangerously-skip-permissions)

    Sandbox mode runs each story in an isolated environment:
    - docker: FREE local isolation using Docker containers
    - e2b: Cloud sandboxes (~$0.10/min), scalable to 10+ concurrent
    - daytona: Open-source cloud (~$0.08/min), self-hostable

    Setup sandboxes with: sigma sandbox setup --provider=docker

EXAMPLES:
    # Run prototype implementation
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype

    # Run implementation with stream filter
    sigma-ralph.sh --workspace=/path/to/myapp --mode=implementation --stream=1

    # Custom backlog
    sigma-ralph.sh --workspace=/path/to/myapp --backlog=docs/ralph/custom/prd.json

    # Dry run preview
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --dry-run

    # Parallel execution (run all streams concurrently)
    sigma-ralph.sh --workspace=/path/to/myapp --mode=implementation --parallel

    # Sandbox mode with Docker (FREE)
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --sandbox

    # Sandbox mode with E2B (cloud)
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --sandbox --sandbox-provider=e2b

    # With budget limits
    sigma-ralph.sh --workspace=/path/to/myapp --sandbox --budget-max=20 --budget-warn=10

    # Validate PRD without running
    sigma-ralph.sh --workspace=/path/to/myapp --validate-only

    # Pass extra args to Claude Code
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype -- --dangerously-skip-permissions

    # Native task tracking (v3.0.0)
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --native-tasks

    # Resume with existing task list
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --task-list-id=ralph-myapp-1234567890

    # Swarm mode (v3.1.0) - Always spawn sub-agents
    sigma-ralph.sh --workspace=/path/to/myapp --mode=implementation --swarm

    # Swarm mode with parallel execution
    sigma-ralph.sh --workspace=/path/to/myapp --mode=implementation --swarm --parallel

BACKLOG PATHS:
    prototype:       docs/ralph/prototype/prd.json
    implementation:  docs/ralph/implementation/prd.json

REQUIREMENTS:
    - claude CLI (Claude Code) or opencode CLI
    - jq for JSON parsing
    - Backlog created by Step 5.5 or Step 11.25

For more information, see: https://github.com/snarktank/ralph
EOF
}

# =============================================================================
# Argument Parsing
# =============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --workspace=*)
                WORKSPACE="${1#*=}"
                shift
                ;;
            --mode=*)
                MODE="${1#*=}"
                shift
                ;;
            --backlog=*)
                BACKLOG="${1#*=}"
                shift
                ;;
            --stream=*)
                STREAM="${1#*=}"
                shift
                ;;
            --max-iterations=*)
                MAX_ITERATIONS="${1#*=}"
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
            --skip-verification)
                SKIP_VERIFICATION=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --quiet|-q)
                QUIET=true
                shift
                ;;
            --timeout=*)
                STORY_TIMEOUT="${1#*=}"
                shift
                ;;
            --max-retries=*)
                MAX_RETRIES_PER_STORY="${1#*=}"
                shift
                ;;
            --failure-mode=*)
                FAILURE_MODE="${1#*=}"
                shift
                ;;
            --no-rollback)
                AUTO_ROLLBACK=false
                shift
                ;;
            --auto-restart)
                AUTO_RESTART=true
                shift
                ;;
            --session-timeout=*)
                SESSION_TIMEOUT="${1#*=}"
                shift
                ;;
            --parallel|-P)
                PARALLEL=true
                shift
                ;;
            --parallel-interval=*)
                PARALLEL_MONITOR_INTERVAL="${1#*=}"
                shift
                ;;
            --swarm)
                SWARM_MODE=true
                shift
                ;;
            --no-swarm-spawn)
                SWARM_SPAWN_SUBAGENTS=false
                shift
                ;;
            --sandbox)
                SANDBOX_ENABLED=true
                shift
                ;;
            --sandbox-provider=*)
                SANDBOX_PROVIDER="${1#*=}"
                shift
                ;;
            --sandbox-timeout=*)
                SANDBOX_TIMEOUT="${1#*=}"
                shift
                ;;
            --sandbox-memory=*)
                SANDBOX_MEMORY="${1#*=}"
                shift
                ;;
            --sandbox-cpus=*)
                SANDBOX_CPUS="${1#*=}"
                shift
                ;;
            --budget-max=*)
                BUDGET_MAX="${1#*=}"
                shift
                ;;
            --budget-warn=*)
                BUDGET_WARN="${1#*=}"
                shift
                ;;
            --validate-only)
                VALIDATE_ONLY=true
                shift
                ;;
            --native-tasks)
                NATIVE_TASKS_ENABLED=true
                shift
                ;;
            --task-list-id=*)
                TASK_LIST_ID="${1#*=}"
                NATIVE_TASKS_ENABLED=true
                shift
                ;;
            --no-native-tasks)
                NATIVE_TASKS_ENABLED=false
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            --)
                # Everything after -- is passed to the engine
                shift
                ENGINE_ARGS="$*"
                break
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
    # Check for jq
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed. Install with: brew install jq"
        exit 1
    fi
    
    # Check for workspace
    if [[ -z "$WORKSPACE" ]]; then
        log_error "--workspace is required"
        show_help
        exit 1
    fi
    
    if [[ ! -d "$WORKSPACE" ]]; then
        log_error "Workspace directory does not exist: $WORKSPACE"
        exit 1
    fi
    
    # Resolve backlog path
    if [[ -z "$BACKLOG" ]]; then
        case "$MODE" in
            prototype)
                BACKLOG="$WORKSPACE/docs/ralph/prototype/prd.json"
                ;;
            implementation)
                BACKLOG="$WORKSPACE/docs/ralph/implementation/prd.json"
                ;;
            *)
                log_error "Invalid mode: $MODE. Use 'prototype' or 'implementation'"
                exit 1
                ;;
        esac
    elif [[ ! "$BACKLOG" = /* ]]; then
        # Make relative paths absolute
        BACKLOG="$WORKSPACE/$BACKLOG"
    fi
    
    if [[ ! -f "$BACKLOG" ]]; then
        log_error "Backlog not found: $BACKLOG"
        log_info "Run Step 5.5 or Step 11.25 to create the backlog"
        exit 1
    fi

    # NEW v2.2.0: Validate PRD file (PR #10)
    if ! validate_prd "$BACKLOG"; then
        exit 1
    fi

    # NEW v2.2.0: Validate only mode - exit after PRD validation
    if [[ "$VALIDATE_ONLY" == true ]]; then
        log_success "PRD validation complete (--validate-only mode)"
        exit 0
    fi

    # NEW v2.1.0: Build dynamic skill registry for intelligent skill matching
    if [[ "$SKILL_REGISTRY_AVAILABLE" == true ]]; then
        log_info "Building skill registry from workspace and Sigma Protocol..."
        build_skill_registry "$WORKSPACE" "$SIGMA_PROTOCOL_DIR"
    fi

    # Detect AI engine
    detect_engine

    # NEW v2.2.0: Validate sandbox provider if enabled
    if [[ "$SANDBOX_ENABLED" == true ]]; then
        if ! validate_sandbox_provider; then
            exit 1
        fi

        # Build Docker image if needed
        if [[ "$SANDBOX_PROVIDER" == "docker" ]]; then
            if ! build_docker_image; then
                exit 1
            fi
        fi

        # Check budget for cloud providers
        if ! check_budget; then
            exit 1
        fi
    fi
}

detect_engine() {
    if [[ "$ENGINE" == "auto" ]]; then
        # NEW v3.1.0: Check for claudesp first if swarm mode enabled
        if [[ "$SWARM_MODE" == true ]] && command -v claudesp &> /dev/null; then
            ENGINE="claudesp"
            log_info "Detected Claude Swarm Protocol CLI (swarm mode)"
        elif command -v claude &> /dev/null; then
            ENGINE="claude"
            log_info "Detected Claude Code CLI"
            if [[ "$SWARM_MODE" == true ]]; then
                log_warn "Swarm mode enabled but claudesp not found - using claude with Task tool delegation"
            fi
        elif command -v opencode &> /dev/null; then
            ENGINE="opencode"
            log_info "Detected OpenCode CLI"
            if [[ "$SWARM_MODE" == true ]]; then
                log_warn "Swarm mode works best with claudesp or claude"
            fi
        else
            log_error "No AI engine found. Install claude, claudesp, or opencode CLI."
            exit 1
        fi
    else
        if ! command -v "$ENGINE" &> /dev/null; then
            log_error "$ENGINE CLI not found. Please install it."
            exit 1
        fi
    fi
}

# =============================================================================
# Sandbox Integration (v2.2.0)
# =============================================================================

# Path to the ralph-bridge.js Node.js CLI
RALPH_BRIDGE="$SIGMA_PROTOCOL_DIR/cli/lib/sandbox/ralph-bridge.js"

# Validate sandbox provider configuration
validate_sandbox_provider() {
    if [[ "$SANDBOX_ENABLED" != true ]]; then
        return 0
    fi

    log_info "Validating sandbox provider: $SANDBOX_PROVIDER"

    # Check if ralph-bridge.js exists
    if [[ ! -f "$RALPH_BRIDGE" ]]; then
        log_error "ralph-bridge.js not found at: $RALPH_BRIDGE"
        log_info "Make sure Sigma Protocol is properly installed"
        return 1
    fi

    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required for sandbox mode"
        log_info "Install Node.js 18+ from https://nodejs.org"
        return 1
    fi

    # Validate provider via bridge
    local result
    result=$(node "$RALPH_BRIDGE" --action=validate --provider="$SANDBOX_PROVIDER" --workspace="$WORKSPACE" 2>&1)
    local exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        log_error "Sandbox provider validation failed:"
        echo "$result" | grep -i "error" | head -5
        log_info ""
        log_info "Setup sandbox with: sigma sandbox setup --provider=$SANDBOX_PROVIDER"
        return 1
    fi

    log_success "Sandbox provider validated: $SANDBOX_PROVIDER"
    return 0
}

# Build Docker image if using Docker provider
build_docker_image() {
    if [[ "$SANDBOX_PROVIDER" != "docker" ]]; then
        return 0
    fi

    log_info "Checking Docker image..."

    local result
    result=$(node "$RALPH_BRIDGE" --action=build-image --workspace="$WORKSPACE" 2>&1)
    local exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        log_error "Failed to build Docker image"
        echo "$result"
        return 1
    fi

    if echo "$result" | grep -q "BUILT=true"; then
        log_success "Docker image built: sigma-sandbox:latest"
    else
        log_info "Docker image already exists"
    fi

    return 0
}

# Calculate exponential backoff delay (PR #106)
calculate_backoff() {
    local attempt="$1"
    local delay=$((BACKOFF_INITIAL * (2 ** (attempt - 1))))
    echo $((delay > BACKOFF_MAX ? BACKOFF_MAX : delay))
}

# Get retry count for a story
get_retry_count() {
    local story_id="$1"
    echo "${RETRY_COUNTS[$story_id]:-0}"
}

# Increment retry count for a story
increment_retry_count() {
    local story_id="$1"
    local current="${RETRY_COUNTS[$story_id]:-0}"
    RETRY_COUNTS[$story_id]=$((current + 1))
}

# Check if story has exceeded retry limit
should_retry_story() {
    local story_id="$1"
    local count=$(get_retry_count "$story_id")
    [[ $count -lt $MAX_RETRIES ]]
}

# Validate PRD file (PR #10)
validate_prd() {
    local prd_file="$1"

    # Check file exists
    if [[ ! -f "$prd_file" ]]; then
        log_error "PRD file not found: $prd_file"
        return 1
    fi

    # Check valid JSON
    if ! jq empty "$prd_file" 2>/dev/null; then
        log_error "PRD file is not valid JSON: $prd_file"
        return 1
    fi

    # Check has stories array
    if ! jq -e '.stories' "$prd_file" &>/dev/null; then
        log_error "PRD file missing 'stories' array: $prd_file"
        return 1
    fi

    # Check for duplicate IDs
    local duplicates
    duplicates=$(jq -r '[.stories[].id] | group_by(.) | map(select(length > 1)) | flatten | unique[]' "$prd_file" 2>/dev/null)
    if [[ -n "$duplicates" ]]; then
        log_error "PRD file has duplicate story IDs: $duplicates"
        return 1
    fi

    # Get stats
    local total=$(jq '.stories | length' "$prd_file")
    local pending=$(jq '[.stories[] | select(.passes != true)] | length' "$prd_file")

    log_info "PRD validated: $total stories ($pending pending)"
    return 0
}

# Run a story in sandbox isolation
run_story_in_sandbox() {
    local story_json="$1"
    local story_id=$(echo "$story_json" | jq -r '.id')

    log_info "Running story $story_id in $SANDBOX_PROVIDER sandbox..."

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Would run story $story_id in $SANDBOX_PROVIDER sandbox"
        return 0
    fi

    # Call the bridge to run the story
    local result
    result=$(node "$RALPH_BRIDGE" \
        --action=run-story \
        --story-id="$story_id" \
        --provider="$SANDBOX_PROVIDER" \
        --workspace="$WORKSPACE" \
        --prd-file="$BACKLOG" \
        --timeout="$SANDBOX_TIMEOUT" \
        --memory="$SANDBOX_MEMORY" \
        --cpus="$SANDBOX_CPUS" \
        --budget-max="$BUDGET_MAX" \
        --budget-warn="$BUDGET_WARN" \
        --engine="$ENGINE" \
        --output-format=bash \
        2>&1)

    local exit_code=$?

    # Parse result
    if echo "$result" | grep -q "SUCCESS=true"; then
        log_success "Story completed in sandbox: $story_id"
        return 0
    else
        local error_msg=$(echo "$result" | grep "ERROR=" | sed 's/ERROR=//')
        log_error "Story failed in sandbox: $story_id"
        [[ -n "$error_msg" ]] && log_error "Error: $error_msg"
        return 1
    fi
}

# Check budget before running
check_budget() {
    if [[ "$SANDBOX_PROVIDER" == "docker" ]]; then
        # Docker is free
        return 0
    fi

    local stories_remaining=$(jq '[.stories[] | select(.passes != true)] | length' "$BACKLOG")

    local result
    result=$(node "$RALPH_BRIDGE" \
        --action=estimate \
        --provider="$SANDBOX_PROVIDER" \
        --workspace="$WORKSPACE" \
        --stories="$stories_remaining" \
        --output-format=bash \
        2>&1)

    if echo "$result" | grep -q "WOULD_EXCEED_BUDGET=true"; then
        local estimated=$(echo "$result" | grep "ESTIMATED_COST=" | sed 's/ESTIMATED_COST=//')
        local remaining=$(echo "$result" | grep "REMAINING_BUDGET=" | sed 's/REMAINING_BUDGET=//')
        log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_error "⚠️ BUDGET EXCEEDED"
        log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_error "Estimated cost: \$$estimated"
        log_error "Remaining budget: \$$remaining"
        log_error "Reduce stories or switch to Docker (free)"
        return 1
    fi

    if echo "$result" | grep -q "WOULD_TRIGGER_WARNING=true"; then
        log_warn "Budget warning: This run may approach your spending limit"
    fi

    return 0
}

# =============================================================================
# Native Task Management (v3.0.0)
# =============================================================================

# File lock for atomic backlog updates (parallel stream safety)
BACKLOG_LOCK=""

# Atomic backlog update with file locking (for parallel streams)
update_backlog_atomic() {
    local jq_filter="$1"
    local lock_file="${BACKLOG}.lock"

    # Use flock for atomic updates (prevents race conditions in parallel mode)
    (
        flock -x -w 30 200 || {
            log_error "Failed to acquire backlog lock after 30s"
            return 1
        }
        local temp_file=$(mktemp)
        if jq "$jq_filter" "$BACKLOG" > "$temp_file" 2>/dev/null; then
            mv "$temp_file" "$BACKLOG"
        else
            rm -f "$temp_file"
            log_error "jq filter failed: $jq_filter"
            return 1
        fi
    ) 200>"$lock_file"
}

# Initialize native task tracking
init_native_tasks() {
    if [[ "$NATIVE_TASKS_ENABLED" != true ]]; then
        return 0
    fi

    # Generate task list ID if not provided
    if [[ -z "$TASK_LIST_ID" ]]; then
        TASK_LIST_ID="ralph-$(basename "$WORKSPACE")-$(date +%s)"
    fi

    # Export for Claude Code native task persistence
    export CLAUDE_CODE_TASK_LIST_ID="$TASK_LIST_ID"

    log_info "Native task tracking enabled: $TASK_LIST_ID"

    # Store task list ID in backlog for resume capability
    update_backlog_atomic --arg id "$TASK_LIST_ID" '.meta.taskListId = $id'

    return 0
}

# Create parent task instruction for story (injected into worker prompt)
create_story_parent_task() {
    local story_id="$1"
    local story_title="$2"

    [[ "$NATIVE_TASKS_ENABLED" != true ]] && return

    cat << PARENT_TASK

## PARENT TASK (Mandatory First Step)

**IMPORTANT:** Before implementing anything, create a parent task for this story:

\`\`\`
Use TaskCreate tool with:
- subject: "[$story_id] $story_title"
- description: "Ralph story implementation - see PRD for details"
- activeForm: "Implementing $story_id..."
\`\`\`

Then immediately mark it in progress:
\`\`\`
Use TaskUpdate tool with:
- taskId: (the ID returned from TaskCreate)
- status: "in_progress"
\`\`\`

When the story is complete (all acceptance criteria pass), mark the parent task completed:
\`\`\`
Use TaskUpdate tool with:
- taskId: (the parent task ID)
- status: "completed"
\`\`\`

**Benefits:**
- Native spinner shows story progress
- Task persists across session restarts
- /tasks command shows Ralph loop progress
- Task list ID: $TASK_LIST_ID

PARENT_TASK
}

# =============================================================================
# Backlog Operations
# =============================================================================

get_next_story() {
    local filter='.stories[] | select(.passes == false)'
    
    # Add stream filter if specified
    if [[ -n "$STREAM" ]]; then
        filter="$filter | select(.tags.streamId == \"swarm-$STREAM\" or .tags.streamId == \"$STREAM\")"
    fi
    
    # Get first matching story sorted by priority
    jq -r "[$filter] | sort_by(.priority) | .[0]" "$BACKLOG"
}

get_story_by_id() {
    local story_id="$1"
    jq -r ".stories[] | select(.id == \"$story_id\")" "$BACKLOG"
}

mark_story_passed() {
    local story_id="$1"

    # Use atomic update for parallel safety
    local jq_filter
    jq_filter=$(cat << 'FILTER'
(.stories[] | select(.id == $id)) |= . + {
    passes: true,
    lastAttempt: {
        timestamp: $ts,
        engine: $engine,
        success: true
    }
} | .meta.passedStories = ([.stories[] | select(.passes == true)] | length)
FILTER
)

    local lock_file="${BACKLOG}.lock"
    (
        flock -x -w 30 200 || {
            log_error "Failed to acquire backlog lock"
            return 1
        }
        local temp_file=$(mktemp)
        jq --arg id "$story_id" \
           --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           --arg engine "$ENGINE" \
           "$jq_filter" "$BACKLOG" > "$temp_file"
        mv "$temp_file" "$BACKLOG"
    ) 200>"$lock_file"

    log_success "Story $story_id marked as passed"
}

record_attempt() {
    local story_id="$1"
    local success="$2"
    local error_msg="${3:-}"

    # Use atomic update for parallel safety
    local jq_filter='(.stories[] | select(.id == $id)) |= . + {
        lastAttempt: {
            timestamp: $ts,
            engine: $engine,
            success: $success,
            errorMessage: (if $error != "" then $error else null end)
        },
        attempts: ((.attempts // []) + [{
            timestamp: $ts,
            engine: $engine,
            success: $success,
            errorMessage: (if $error != "" then $error else null end)
        }])
    }'

    local lock_file="${BACKLOG}.lock"
    (
        flock -x -w 30 200 || {
            log_error "Failed to acquire backlog lock"
            return 1
        }
        local temp_file=$(mktemp)
        jq --arg id "$story_id" \
           --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           --arg engine "$ENGINE" \
           --argjson success "$success" \
           --arg error "$error_msg" \
           "$jq_filter" "$BACKLOG" > "$temp_file"
        mv "$temp_file" "$BACKLOG"
    ) 200>"$lock_file"
}

get_progress() {
    local total=$(jq '.stories | length' "$BACKLOG")
    local passed=$(jq '[.stories[] | select(.passes == true)] | length' "$BACKLOG")
    local remaining=$((total - passed))
    echo "$passed/$total (${remaining} remaining)"
}

# =============================================================================
# Skill Detection (from Ralphy PR #69 pattern)
# =============================================================================

# Detect available skill directories in the workspace
detect_skills() {
    local workdir="$1"
    local found=""

    for dir in ".claude/skills" ".opencode/skills" ".skills"; do
        if [[ -d "$workdir/$dir" ]]; then
            found+="- $dir\n"
        fi
    done

    echo -e "$found"
}

# Generate core workflow skill matrix (static mandatory skills)
generate_skill_matrix() {
    cat << 'SKILL_MATRIX'
## CRITICAL: Core Workflow Skills

**DO NOT IMPLEMENT DIRECTLY** - Use specialized skills for all implementation.

| Phase | Required Skill | When to Use |
|-------|----------------|-------------|
| Planning | `@senior-architect` | BEFORE any coding begins |
| UI Work | `@frontend-design` | ALL UI components |
| Errors | `@systematic-debugging` | When ANY error occurs |
| Verification | `@gap-analysis` | AFTER implementing |
| Testing | `@senior-qa` | Verify acceptance criteria |
| Browser Testing | `@agent-browser-validation` | Web UI validation |

### Mandatory Workflow

1. **@senior-architect** → Design review before coding
2. **@frontend-design** → All UI changes (enforced by hook)
3. **@systematic-debugging** → Any error encountered
4. **@gap-analysis** → PRD compliance after implementation
SKILL_MATRIX
}

# Generate story-specific skill recommendations based on content analysis
# NEW v2.1.0: Uses dynamic skill registry to match 40+ skills
generate_story_skill_injection() {
    local story_json="$1"

    # Skip if registry not available
    if [[ "$SKILL_REGISTRY_AVAILABLE" != true ]]; then
        return
    fi

    # Use the skill registry to generate dynamic recommendations
    generate_skill_injection "$story_json"
}

# =============================================================================
# Design System Validation (Phase 5: Design Enforcement)
# =============================================================================

check_design_system() {
    local task_id="$1"
    local ui_profile_path="$WORKSPACE/docs/design/ui-profile.json"

    # Only check for UI tasks
    if [[ "$task_id" == UI-* ]]; then
        if [[ -f "$ui_profile_path" ]]; then
            local profile_name=$(jq -r '.name // "Unknown"' "$ui_profile_path" 2>/dev/null)
            local profile_preset=$(jq -r '.preset // "custom"' "$ui_profile_path" 2>/dev/null)
            log_info "🎨 Design system: $profile_name ($profile_preset)"

            # Extract banned patterns for the prompt
            local banned=$(jq -r '.bannedPatterns // [] | join(", ")' "$ui_profile_path" 2>/dev/null)
            if [[ -n "$banned" && "$banned" != "" ]]; then
                log_info "   Banned patterns: $banned"
            fi

            return 0
        else
            log_warn "⚠️ No UI Profile found at $ui_profile_path"
            log_warn "   Design enforcement disabled - UI may be inconsistent"
            log_warn "   Run Step 3 (UX Design) to create the UI Profile"
            return 1
        fi
    fi

    return 0
}

# Extract design system context for UI tasks
get_design_system_context() {
    local story_json="$1"
    local ui_profile_path="$WORKSPACE/docs/design/ui-profile.json"

    # Check if story has UI tasks
    local has_ui_tasks=$(echo "$story_json" | jq -r '.tasks[]? | select(.id | startswith("UI-")) | .id' 2>/dev/null | head -1)

    if [[ -z "$has_ui_tasks" ]]; then
        echo ""
        return
    fi

    if [[ ! -f "$ui_profile_path" ]]; then
        echo "## Design System: NOT CONFIGURED
**WARNING:** No UI Profile found. Design may be inconsistent.
"
        return
    fi

    # Extract key design constraints
    local preset=$(jq -r '.preset // "custom"' "$ui_profile_path" 2>/dev/null)
    local radius=$(jq -r '.dials.radius // "soft"' "$ui_profile_path" 2>/dev/null)
    local density=$(jq -r '.dials.density // "comfortable"' "$ui_profile_path" 2>/dev/null)
    local motion=$(jq -r '.dials.motionIntensity // "moderate"' "$ui_profile_path" 2>/dev/null)
    local banned=$(jq -r '.bannedPatterns // [] | join(", ")' "$ui_profile_path" 2>/dev/null)
    local max_accents=$(jq -r '.rules.maxAccentColorsPerScreen // 2' "$ui_profile_path" 2>/dev/null)
    local max_gradients=$(jq -r '.rules.maxGradientsPerCard // 1' "$ui_profile_path" 2>/dev/null)

    cat << DESIGN_CONTEXT
## Design System Constraints (MANDATORY)

**Profile:** $preset
**Reference:** docs/design/ui-profile.json

### Dials
- Radius: $radius
- Density: $density
- Motion: $motion

### Rules
- Max accent colors per screen: $max_accents
- Max gradients per card: $max_gradients

### Banned Patterns (DO NOT USE)
$banned

### Required Actions for UI Tasks
1. Read \`docs/design/ui-profile.json\` before implementing
2. Use only design tokens defined in the profile
3. Verify visual output matches the profile aesthetic
4. Run \`@ui-healer\` to validate design compliance

DESIGN_CONTEXT
}

# =============================================================================
# Native Task Management (Claude Code v2.1.17+)
# =============================================================================

# Generate TaskCreate instructions for granular sub-task tracking
generate_task_tracking_section() {
    local tasks_json="$1"
    local story_id="$2"

    # Handle empty/null tasks array
    if [[ -z "$tasks_json" ]] || [[ "$tasks_json" == "[]" ]] || [[ "$tasks_json" == "null" ]]; then
        return
    fi

    local task_count=$(echo "$tasks_json" | jq 'length' 2>/dev/null || echo "0")
    if [[ "$task_count" -eq 0 ]]; then
        return
    fi

    local task_list=""
    while IFS= read -r task; do
        local task_id=$(echo "$task" | jq -r '.id')
        local task_desc=$(echo "$task" | jq -r '.description')
        task_list+="
- **$task_id**: $task_desc"
    done < <(echo "$tasks_json" | jq -c '.[]' 2>/dev/null)

    cat << TASK_SECTION

## NATIVE TASK TRACKING (Claude Code v2.1.17+)

Use Claude Code's native task management to track sub-task progress:

### Sub-Tasks for This Story
$task_list

### How to Track Progress

1. **At the start**, create tasks for each sub-task:
\`\`\`
Use TaskCreate tool with:
- subject: "<task_id>: <brief description>"
- description: "<full description from above>"
- activeForm: "Implementing <task_id>..."
\`\`\`

2. **When starting a sub-task**, mark it in progress:
\`\`\`
Use TaskUpdate tool with:
- taskId: "<task_id>"
- status: "in_progress"
\`\`\`

3. **When completing a sub-task**, mark it completed:
\`\`\`
Use TaskUpdate tool with:
- taskId: "<task_id>"
- status: "completed"
\`\`\`

4. **To check progress**, use TaskList to see all task statuses.

### Benefits
- Native spinner shows current task (activeForm)
- Progress visible via \`/tasks\` command
- Clear completion status for each sub-task
- Better observability than progress.txt

TASK_SECTION
}

# Generate dependency section with blockedBy for native enforcement
generate_dependency_section() {
    local depends_on_array="$1"
    local story_id="$2"

    # Handle empty/null dependencies
    if [[ -z "$depends_on_array" ]] || [[ "$depends_on_array" == "[]" ]] || [[ "$depends_on_array" == "null" ]]; then
        return
    fi

    local dep_list=""
    while IFS= read -r dep_id; do
        [[ -n "$dep_id" ]] && dep_list+="
- $dep_id"
    done < <(echo "$depends_on_array" | jq -r '.[]' 2>/dev/null)

    cat << DEP_SECTION

## STORY DEPENDENCIES

This story depends on the following stories being completed first:
$dep_list

### Dependency Enforcement

If you create sub-tasks for this story, use TaskCreate with \`addBlockedBy\` to enforce ordering:

\`\`\`
Use TaskCreate tool with:
- subject: "First task of $story_id"
- description: "..."
- addBlockedBy: ["dependent-story-task-id"]
\`\`\`

If dependencies are not met, you should:
1. Check if dependent stories are marked as \`passes: true\` in the backlog
2. If not, output: \`RALPH_STORY_BLOCKED: $story_id\`
3. Include \`REASON: Waiting for dependencies: <list>\`

DEP_SECTION
}

# =============================================================================
# Prompt Generation
# =============================================================================

# Generate swarm spawn instructions for worker prompt
generate_swarm_instructions() {
    local story_json="$1"
    local story_id=$(echo "$story_json" | jq -r '.id')

    if [[ "$SWARM_MODE" != true ]] || [[ "$SWARM_SPAWN_SUBAGENTS" != true ]]; then
        return
    fi

    # Check if story has UI tasks
    local has_ui_tasks=$(echo "$story_json" | jq -r '.tasks[]? | select(.id | startswith("UI-")) | .id' 2>/dev/null | head -1)
    local has_api_tasks=$(echo "$story_json" | jq -r '.tasks[]? | select(.id | startswith("API-") or .id | startswith("DB-")) | .id' 2>/dev/null | head -1)
    local has_test_tasks=$(echo "$story_json" | jq -r '.tasks[]? | select(.id | startswith("TEST-")) | .id' 2>/dev/null | head -1)

    cat << 'SWARM_INSTRUCTIONS'

## 🐝 SWARM-FIRST PHILOSOPHY (MANDATORY)

**CRITICAL RULE: Never work solo. Always delegate to sub-agents.**

### You MUST Use the Task Tool to Spawn Sub-Agents

For this story, use the following swarm pattern:

```markdown
1. **PLANNING PHASE** — Spawn sigma-planner first
   Task tool: spawn general-purpose agent
   Prompt: "You are sigma-planner. Review PRD and design implementation approach.
            Use @senior-architect skill. Output: implementation plan with file order."

2. **IMPLEMENTATION PHASE** — Spawn appropriate executor(s)
SWARM_INSTRUCTIONS

    # Add frontend instructions if UI tasks
    if [[ -n "$has_ui_tasks" ]]; then
        cat << 'UI_SWARM'
   Task tool: spawn general-purpose agent
   Prompt: "You are sigma-frontend. Implement UI components for this story.
            Use @frontend-design skill. Follow design system strictly."
UI_SWARM
    fi

    # Add backend instructions if API/DB tasks
    if [[ -n "$has_api_tasks" ]]; then
        cat << 'API_SWARM'
   Task tool: spawn general-purpose agent
   Prompt: "You are sigma-backend. Implement API/database changes for this story.
            Use @api-design-principles and @architecture-patterns skills."
API_SWARM
    fi

    cat << 'SWARM_INSTRUCTIONS_CONT'

3. **VERIFICATION PHASE** — Spawn sigma-sisyphus
   Task tool: spawn general-purpose agent
   Prompt: "You are sigma-sisyphus. Verify all acceptance criteria pass.
            Use @gap-analysis and @systematic-debugging skills.
            Loop until all criteria pass or document blockers."
```

### Parallel Spawning (When Tasks Are Independent)

If UI and API tasks are independent, spawn them in parallel:

```markdown
[Single message with multiple Task tool calls]
- sigma-frontend: Implement UI components
- sigma-backend: Implement API endpoints
[Wait for both to complete]
- sigma-sisyphus: Verify entire story
```

### Agent Skill Requirements

| Agent | Required Skills |
|-------|----------------|
| sigma-planner | @senior-architect, @brainstorming |
| sigma-frontend | @frontend-design, @react-performance |
| sigma-backend | @api-design-principles, @architecture-patterns |
| sigma-reviewer | @senior-qa, @systematic-debugging |
| sigma-sisyphus | @gap-analysis, @quality-gates |

**DO NOT implement directly. ALWAYS delegate via Task tool.**

SWARM_INSTRUCTIONS_CONT
}

generate_worker_prompt() {
    local story_json="$1"
    local story_id=$(echo "$story_json" | jq -r '.id')
    local story_title=$(echo "$story_json" | jq -r '.title')
    local story_desc=$(echo "$story_json" | jq -r '.description // "No description provided"')
    local source_prd=$(echo "$story_json" | jq -r '.source.prdPath')
    local criteria=$(echo "$story_json" | jq -r '(.acceptanceCriteria // []) | map("- [\(.id)] \(.description) (type: \(.type))") | join("\n")' 2>/dev/null || echo "See PRD for acceptance criteria")
    local depends_on=$(echo "$story_json" | jq -r '(.dependsOn // []) | if length > 0 then join(", ") else "None" end' 2>/dev/null || echo "None")
    local agent_instructions=$(echo "$story_json" | jq -r '.agentInstructions // "None"')

    # NEW v2.1.17: Extract tasks and estimated iterations for native task management
    local estimated_iterations=$(echo "$story_json" | jq -r '.estimatedIterations // 1')
    local tasks_json=$(echo "$story_json" | jq '.tasks // []' 2>/dev/null)
    local tasks_count=$(echo "$tasks_json" | jq 'length' 2>/dev/null || echo "0")

    # NEW v3.0.0: Generate parent task instruction for native task persistence
    local parent_task_instruction=""
    if [[ "$NATIVE_TASKS_ENABLED" == true ]]; then
        parent_task_instruction=$(create_story_parent_task "$story_id" "$story_title")
    fi

    # NEW v2.1.17: Generate native TaskCreate instructions for granular tracking
    local task_tracking_section=""
    if [[ "$tasks_count" -gt 0 ]]; then
        task_tracking_section=$(generate_task_tracking_section "$tasks_json" "$story_id")
    fi

    # NEW v2.1.17: Generate dependency section with blockedBy for native enforcement
    local dependency_section=""
    local depends_on_array=$(echo "$story_json" | jq -r '.dependsOn // []')
    if [[ "$(echo "$depends_on_array" | jq 'length')" -gt 0 ]]; then
        dependency_section=$(generate_dependency_section "$depends_on_array" "$story_id")
    fi

    # NEW v2.1.17: Plan mode instruction for complex stories
    # Note: Uses structured planning inline (not EnterPlanMode which requires user approval)
    local plan_mode_instruction=""
    if [[ "$estimated_iterations" -gt 2 ]]; then
        plan_mode_instruction="
## ⚠️ COMPLEX STORY - STRUCTURED PLANNING REQUIRED

This story has estimatedIterations=$estimated_iterations (complexity > 2).
**You MUST plan thoroughly BEFORE implementing.**

### Planning Checklist (Complete BEFORE Coding)

1. **Explore codebase first:**
   - Use Glob/Grep to understand existing patterns
   - Read related files to understand architecture
   - Identify all files that need changes

2. **Design your approach:**
   - List files to create/modify (in order)
   - Identify potential blockers
   - Consider edge cases and error handling

3. **Use @senior-architect skill:**
   - Invoke the skill to validate your approach
   - Get architectural guidance before coding

4. **Document your plan:**
   - Write your implementation plan as a comment
   - Include file paths and key decisions
   - This becomes valuable context for debugging

### Why This Matters

Complex stories (estimatedIterations > 2) have higher failure rates when
implementations start without proper planning. Taking time to explore and
design prevents rework and wasted iterations.

**BEGIN by reading existing code patterns, THEN plan, THEN implement.**
"
    fi

    # Get design system context for UI tasks
    local design_context=$(get_design_system_context "$story_json")

    # Paths for memory files
    local progress_file="$(dirname "$BACKLOG")/progress.txt"
    local agents_file="AGENTS.md"

    # Detect available skills in workspace
    local detected_skills=$(detect_skills "$WORKSPACE")
    local skill_matrix=$(generate_skill_matrix)

    # NEW v2.1.0: Generate dynamic story-specific skill recommendations
    local story_skills=""
    if [[ "$SKILL_REGISTRY_AVAILABLE" == true ]]; then
        story_skills=$(generate_story_skill_injection "$story_json")
    fi

    # NEW v3.1.0: Generate swarm instructions for delegation
    local swarm_instructions=""
    if [[ "$SWARM_MODE" == true ]]; then
        swarm_instructions=$(generate_swarm_instructions "$story_json")
    fi

    cat << EOF
You are an autonomous coding agent implementing a single story from a Ralph-style backlog.

## CONTEXT (Read These First)

1. **AGENTS.md (Long-Term Memory):**
   If \`$agents_file\` exists at the project root, read it for coding patterns, gotchas, and conventions.

2. **progress.txt (Short-Term Memory):**
   If \`$progress_file\` exists, read it to understand what previous iterations learned.

3. **Agent Skills (Auto-Detected):**
   This repo includes skill docs:
$detected_skills
   Before implementing, load and use the appropriate skill from the matrix below.

## STORY: $story_title
**ID:** $story_id
**Description:** $story_desc
**Source PRD:** $source_prd
**Dependencies:** $depends_on
**Agent Instructions:** $agent_instructions

$design_context

$skill_matrix
$story_skills
$swarm_instructions
$plan_mode_instruction
$parent_task_instruction
$task_tracking_section
$dependency_section

## INSTRUCTIONS

1. **READ context first:**
   - Read AGENTS.md (if exists) for project patterns AND skill usage
   - Read progress.txt (if exists) for recent learnings
   - Read \`$source_prd\` completely before implementing

2. **PLAN before implementing (use skills):**
   - Use @senior-architect to review the PRD and design your approach
   - Use @brainstorming if multiple implementation paths exist
   - Plan the order of files to create/modify

3. **IMPLEMENT the story:**
   - Do not implement other stories or add features beyond scope
   - Use @frontend-design for UI components
   - Use @systematic-debugging if you encounter errors

4. **VERIFY against acceptance criteria:**
$criteria

5. **RUN verification commands:**
   For each acceptance criterion with type "command", run the specified command.
   For type "file-exists", verify the file exists.
   For type "ui-validation", use @agent-browser or project-specific validation skills.
   Use @gap-analysis to verify PRD compliance.

6. **UPDATE AGENTS.md (if you learned something important):**
   If you discovered a coding pattern, gotcha, or convention that future iterations should know,
   append it to AGENTS.md in the appropriate folder. This is LONG-TERM memory.

7. **COMMIT your changes:**
   After all acceptance criteria pass, commit your changes:
   \`\`\`bash
   git add -A
   git commit -m "feat($story_id): $story_title"
   \`\`\`

8. **REPORT completion:**
   When all acceptance criteria pass AND changes are committed, output exactly:
   \`\`\`
   RALPH_STORY_COMPLETE: $story_id
   \`\`\`

   If you cannot complete the story, output:
   \`\`\`
   RALPH_STORY_BLOCKED: $story_id
   REASON: <explain why>
   \`\`\`

## UI VALIDATION (MANDATORY - DO NOT SKIP)

**⚠️ YOU MUST VALIDATE YOUR WORK VISUALLY BEFORE REPORTING COMPLETION ⚠️**

Stories will be REJECTED if you skip visual validation. This is NOT optional.

**DO NOT use Playwright MCP tools** (browser_navigate, browser_click, browser_snapshot, mcp__playwright__*, etc.)

### For WEB Apps (Next.js, React):

1. **Start the dev server** (if not running):
   \`\`\`bash
   cd <web-app-directory> && npm run dev &
   sleep 5
   \`\`\`

2. **Validate with agent-browser CLI**:
   \`\`\`bash
   # Open the page you implemented
   agent-browser open http://localhost:3000/<route>

   # Capture interactive elements - VERIFY they exist
   agent-browser snapshot -i

   # Take screenshot as EVIDENCE
   agent-browser screenshot validation-${story_id}.png

   # Verify expected content is present
   agent-browser snapshot -i | grep -i "expected text"
   \`\`\`

3. **Confirm in your output**: List which UI elements you verified

### For iOS Apps (SwiftUI):

1. **Build and install to simulator**:
   \`\`\`bash
   cd <ios-app-directory>
   xcodegen generate
   xcodebuild -project *.xcodeproj -scheme <scheme> \\
     -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
   xcrun simctl install booted <path-to-app>
   xcrun simctl launch booted <bundle-id>
   \`\`\`

2. **Capture screenshot as EVIDENCE**:
   \`\`\`bash
   sleep 3
   xcrun simctl io booted screenshot validation-${story_id}.png
   \`\`\`

3. **Confirm in your output**: Describe what the screenshot shows

### Validation Checklist (MUST DO):
- [ ] App/page loads without errors
- [ ] Screenshot captured and saved
- [ ] UI elements from acceptance criteria are visible
- [ ] NO skipping validation "because it looks correct in code"

## RULES
- Do NOT deviate from the PRD specification
- Do NOT implement multiple stories
- Do NOT skip verification steps - ESPECIALLY UI validation
- Do NOT forget to commit your changes
- Do NOT use Playwright MCP tools (mcp__playwright__*) - use agent-browser CLI or xcrun simctl
- Do NOT report RALPH_STORY_COMPLETE without running visual validation
- If stuck, output RALPH_STORY_BLOCKED rather than guessing
- UPDATE AGENTS.md if you learn something important for future iterations

Begin by reading AGENTS.md and the source PRD: $source_prd
EOF
}

# =============================================================================
# Git Operations
# =============================================================================

ensure_git_commit() {
    local story_id="$1"
    local story_title="$2"
    
    # Check if there are uncommitted changes
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
        log_info "Committing changes for story: $story_id"
        git add -A
        git commit -m "feat($story_id): $story_title" --no-verify 2>/dev/null || {
            log_warn "Git commit failed or no changes to commit"
        }
    else
        log_info "No uncommitted changes (agent may have committed)"
    fi
}

# =============================================================================
# Progress File (DEPRECATED in v2.0.0)
# =============================================================================
# Progress tracking has moved to:
# 1. Native Claude Code TaskCreate/TaskUpdate for sub-task tracking
# 2. prd.json backlog (primary source of truth with attempts array)
# 3. On-demand progress reports via generate-progress-report.sh
#
# The append_progress function is now a no-op. To generate a progress
# report from the backlog, run:
#   ./scripts/ralph/generate-progress-report.sh docs/ralph/<mode>/prd.json
# =============================================================================

# Initialize progress file with deprecation header
init_progress_file() {
    local progress_file="$(dirname "$BACKLOG")/progress.txt"

    # Create a minimal header pointing to new tracking approach
    if [[ ! -f "$progress_file" ]]; then
        local backlog_name=$(basename "$(dirname "$BACKLOG")")
        cat > "$progress_file" << EOF
# Ralph Progress Log (DEPRECATED)

**Note:** As of v2.0.0, progress tracking uses:
- Native Claude Code TaskCreate/TaskUpdate for sub-task tracking
- prd.json backlog (check .stories[].attempts for history)
- On-demand reports: ./scripts/ralph/generate-progress-report.sh

To generate a fresh progress report from backlog:
  ./scripts/ralph/generate-progress-report.sh $BACKLOG

**Backlog:** $backlog_name
**Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Engine:** $ENGINE

---

EOF
        log_info "Created progress file: $progress_file (see note about native task tracking)"
    fi
}

# DEPRECATED: Progress now tracked in prd.json attempts array
# Kept for backwards compatibility but does nothing
append_progress() {
    # No-op in v2.0.0+
    # Progress is now tracked via:
    # 1. prd.json .stories[].attempts array (by record_attempt)
    # 2. Native Claude Code TaskCreate/TaskUpdate (in worker prompts)
    #
    # To generate a progress report from backlog:
    #   ./scripts/ralph/generate-progress-report.sh <backlog-path>
    :  # Bash no-op
}

# =============================================================================
# Error Recovery (Phase: Tier 1 Critical Fix)
# =============================================================================

# Validate memory files before running a story
validate_memory_files() {
    local agents_file="$WORKSPACE/AGENTS.md"
    local progress_file="$(dirname "$BACKLOG")/progress.txt"

    # Check AGENTS.md exists and is readable
    if [[ -f "$agents_file" ]]; then
        if ! head -1 "$agents_file" > /dev/null 2>&1; then
            log_warn "AGENTS.md exists but is not readable"
        fi
    fi

    # Check progress.txt is not corrupted
    if [[ -f "$progress_file" ]]; then
        if ! head -1 "$progress_file" > /dev/null 2>&1; then
            log_warn "progress.txt exists but is not readable"
        fi
    fi

    # Check backlog JSON is valid
    if ! jq empty "$BACKLOG" 2>/dev/null; then
        log_error "Backlog JSON is invalid: $BACKLOG"
        return 1
    fi

    return 0
}

# Categorize failure type based on output
categorize_failure() {
    local output_file="$1"
    local exit_code="$2"

    # Check for timeout (exit code 124 from timeout command)
    if [[ "$exit_code" -eq 124 ]]; then
        echo "timeout"
        return
    fi

    # Check for common error patterns
    if grep -qi "syntax error\|SyntaxError\|Unexpected token" "$output_file" 2>/dev/null; then
        echo "syntax"
        return
    fi

    if grep -qi "module not found\|cannot find module\|ModuleNotFoundError\|ImportError" "$output_file" 2>/dev/null; then
        echo "dependency"
        return
    fi

    if grep -qi "permission denied\|EACCES\|EPERM" "$output_file" 2>/dev/null; then
        echo "permission"
        return
    fi

    if grep -qi "network error\|ENOTFOUND\|ETIMEDOUT\|fetch failed" "$output_file" 2>/dev/null; then
        echo "network"
        return
    fi

    if grep -qi "out of memory\|heap out of memory\|ENOMEM" "$output_file" 2>/dev/null; then
        echo "memory"
        return
    fi

    echo "unknown"
}

# Git rollback for failed story
git_rollback_story() {
    local story_id="$1"

    if [[ "$AUTO_ROLLBACK" != true ]]; then
        log_info "Auto-rollback disabled, skipping git rollback"
        return 0
    fi

    cd "$WORKSPACE"

    # Check if there are uncommitted changes
    if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
        log_warn "Rolling back uncommitted changes for failed story: $story_id"

        # Stash changes instead of discarding (safer)
        local stash_msg="ralph-rollback-$story_id-$(date +%Y%m%d-%H%M%S)"
        git stash push -m "$stash_msg" --include-untracked 2>/dev/null || {
            log_error "Git stash failed, changes preserved"
            return 1
        }

        log_info "Changes stashed as: $stash_msg"
        log_info "To recover: git stash apply 'stash@{0}'"
        return 0
    fi

    return 0
}

# Handle story failure with recovery options
handle_story_failure() {
    local story_id="$1"
    local failure_type="$2"
    local output_file="$3"
    local attempt="$4"

    log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_error "STORY FAILED: $story_id"
    log_error "Failure type: $failure_type"
    log_error "Attempt: $attempt / $MAX_RETRIES_PER_STORY"
    log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Rollback git changes
    git_rollback_story "$story_id"

    # Provide guidance based on failure type
    case "$failure_type" in
        timeout)
            log_info "Story exceeded ${STORY_TIMEOUT}s timeout."
            log_info "Suggestions:"
            log_info "  1. Increase timeout: --timeout=$((STORY_TIMEOUT * 2))"
            log_info "  2. Split story into smaller tasks"
            log_info "  3. Debug with @systematic-debugging"
            ;;
        syntax)
            log_info "Syntax error detected in generated code."
            log_info "Suggestions:"
            log_info "  1. Run @systematic-debugging on the failing file"
            log_info "  2. Check AI-generated code for issues"
            ;;
        dependency)
            log_info "Missing dependency detected."
            log_info "Suggestions:"
            log_info "  1. Run: npm install / pip install"
            log_info "  2. Check imports in generated code"
            ;;
        permission)
            log_info "Permission error detected."
            log_info "Suggestions:"
            log_info "  1. Check file/directory permissions"
            log_info "  2. Ensure you have write access"
            ;;
        network)
            log_info "Network error detected."
            log_info "Suggestions:"
            log_info "  1. Check internet connection"
            log_info "  2. Retry after a short wait"
            ;;
        memory)
            log_info "Out of memory error detected."
            log_info "Suggestions:"
            log_info "  1. Close other applications"
            log_info "  2. Reduce parallel operations"
            ;;
        *)
            log_info "Unknown failure type."
            log_info "Check output file for details."
            ;;
    esac

    # Handle based on failure mode
    case "$FAILURE_MODE" in
        skip)
            log_warn "Failure mode: skip - moving to next story"
            return 1
            ;;
        abort)
            log_error "Failure mode: abort - stopping Ralph loop"
            exit 1
            ;;
        prompt)
            # Interactive prompt for user decision
            if [[ -t 0 ]]; then  # Check if stdin is a terminal
                echo ""
                log_info "What would you like to do?"
                echo "  [R] Retry this story"
                echo "  [S] Skip to next story"
                echo "  [D] Debug with @systematic-debugging"
                echo "  [V] View output"
                echo "  [A] Abort Ralph loop"
                echo ""
                read -p "Choice [R/S/D/V/A]: " choice
                choice=$(echo "$choice" | tr '[:lower:]' '[:upper:]')

                case "$choice" in
                    R)
                        log_info "Retrying story..."
                        return 2  # Signal retry
                        ;;
                    S)
                        log_warn "Skipping story..."
                        return 1  # Signal skip
                        ;;
                    D)
                        log_info "Debug mode: Run @systematic-debugging in your AI IDE"
                        log_info "Output saved to: $output_file"
                        read -p "Press Enter when ready to continue..."
                        return 2  # Signal retry after debug
                        ;;
                    V)
                        echo ""
                        echo "=== Output (last 50 lines) ==="
                        tail -50 "$output_file"
                        echo "=== End Output ==="
                        echo ""
                        read -p "Press Enter to continue..."
                        return 1  # Show output, then skip
                        ;;
                    A)
                        log_error "Aborting Ralph loop..."
                        exit 1
                        ;;
                    *)
                        log_warn "Invalid choice, skipping story"
                        return 1
                        ;;
                esac
            else
                # Non-interactive mode: default to skip
                log_warn "Non-interactive mode: skipping failed story"
                return 1
            fi
            ;;
    esac

    return 1
}

# =============================================================================
# Main Loop
# =============================================================================

run_story() {
    local story_json="$1"
    local attempt="${2:-1}"
    local story_id=$(echo "$story_json" | jq -r '.id')
    local story_title=$(echo "$story_json" | jq -r '.title')

    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "STORY: $story_title ($story_id)"
    log_info "Attempt: $attempt / $MAX_RETRIES_PER_STORY"
    log_info "Timeout: ${STORY_TIMEOUT}s"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Validate memory files before starting
    if ! validate_memory_files; then
        log_error "Memory file validation failed, aborting story"
        return 1
    fi

    # Check for UI tasks and validate design system
    local first_task_id=$(echo "$story_json" | jq -r '.tasks[0]?.id // ""')
    if [[ -n "$first_task_id" ]]; then
        check_design_system "$first_task_id"
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Would execute story: $story_id"
        if [[ "$SANDBOX_ENABLED" == true ]]; then
            log_warn "[DRY RUN] Using $SANDBOX_PROVIDER sandbox"
        fi
        generate_worker_prompt "$story_json"
        return 0
    fi

    # NEW v2.2.0: Use sandbox isolation if enabled
    if [[ "$SANDBOX_ENABLED" == true ]]; then
        log_info "🔒 Running in $SANDBOX_PROVIDER sandbox..."

        if run_story_in_sandbox "$story_json"; then
            # Story completed in sandbox - mark as passed
            ensure_git_commit "$story_id" "$story_title"
            mark_story_passed "$story_id"
            return 0
        else
            # Story failed in sandbox - handle with exponential backoff
            local retry_count=$(get_retry_count "$story_id")
            increment_retry_count "$story_id"

            if should_retry_story "$story_id"; then
                local backoff=$(calculate_backoff $((retry_count + 1)))
                log_warn "Story failed, retrying in ${backoff}s... (attempt $((retry_count + 2))/$MAX_RETRIES)"
                sleep "$backoff"
                run_story "$story_json" $((attempt + 1))
                return $?
            else
                log_error "Story exceeded retry limit ($MAX_RETRIES), skipping"
                record_attempt "$story_id" false "Exceeded retry limit"
                return 1
            fi
        fi
    fi

    # Generate prompt (non-sandbox mode)
    local prompt=$(generate_worker_prompt "$story_json")
    local prompt_file=$(mktemp)
    echo "$prompt" > "$prompt_file"

    # Execute in target workspace
    cd "$WORKSPACE"

    local output_file=$(mktemp)
    local exit_code=0

    log_info "Spawning fresh $ENGINE session..."

    # NOTE: Custom activity monitor removed in v2.1.17
    # Native Claude Code now provides task spinners (activeForm) and /tasks command
    # Workers using TaskCreate/TaskUpdate get automatic progress display

    case "$ENGINE" in
        claude|claudesp)
            # Claude Code / Claude Swarm Protocol CLI invocation
            # Using --dangerously-skip-permissions for autonomous mode
            local engine_cmd="$ENGINE"

            if [[ "$QUIET" != true && -f "$SCRIPT_DIR/activity-filter.sh" ]]; then
                # Stream JSON mode with real-time activity display
                # IMPORTANT: --verbose is REQUIRED for stream-json to work
                local json_output=$(mktemp)
                local text_output=$(mktemp)

                # Cleanup trap for temp files on interrupt/error
                trap "rm -f '$json_output' '$text_output' 2>/dev/null" EXIT INT TERM

                timeout "$STORY_TIMEOUT" $engine_cmd --dangerously-skip-permissions \
                    --output-format stream-json \
                    --verbose \
                    $ENGINE_ARGS \
                    -p "$(cat "$prompt_file")" 2>&1 | \
                    "$SCRIPT_DIR/activity-filter.sh" > "$json_output" &
                CLAUDE_PID=$!

                wait $CLAUDE_PID
                exit_code=$?

                # Extract result text from filter output (between RESULT_TEXT_START and RESULT_TEXT_END)
                sed -n '/RESULT_TEXT_START/,/RESULT_TEXT_END/p' "$json_output" | \
                    grep -v 'RESULT_TEXT_START\|RESULT_TEXT_END' > "$text_output"

                # Use text output for completion checking
                cat "$text_output" > "$output_file"
                rm -f "$json_output" "$text_output"
                trap - EXIT INT TERM  # Reset trap after cleanup
                echo ""  # New line after activity output
            else
                # Quiet mode or fallback - direct execution
                # Native Claude Code status line handles progress display
                timeout "$STORY_TIMEOUT" $engine_cmd --dangerously-skip-permissions \
                    $ENGINE_ARGS \
                    -p "$(cat "$prompt_file")" > "$output_file" 2>&1 &
                CLAUDE_PID=$!

                wait $CLAUDE_PID
                exit_code=$?
            fi
            ;;
        opencode)
            # OpenCode CLI invocation
            # OpenCode has its own native status display
            timeout "$STORY_TIMEOUT" opencode --mode=plan $ENGINE_ARGS -p "$(cat "$prompt_file")" > "$output_file" 2>&1 &
            CLAUDE_PID=$!

            wait $CLAUDE_PID
            exit_code=$?
            ;;
    esac

    # Check for completion marker
    if grep -q "RALPH_STORY_COMPLETE: $story_id" "$output_file"; then
        log_success "Story completed: $story_id"

        # Ensure changes are committed (fallback if agent didn't)
        ensure_git_commit "$story_id" "$story_title"

        mark_story_passed "$story_id"
        append_progress "$story_id" "COMPLETED" ""
        rm -f "$prompt_file" "$output_file"
        return 0
    elif grep -q "RALPH_STORY_BLOCKED: $story_id" "$output_file"; then
        local reason=$(grep -A1 "RALPH_STORY_BLOCKED" "$output_file" | grep "REASON:" | sed 's/REASON: //')
        log_warn "Story blocked: $story_id - $reason"
        record_attempt "$story_id" false "$reason"
        append_progress "$story_id" "BLOCKED" "$reason"
        rm -f "$prompt_file" "$output_file"
        return 1
    else
        # Story failed - use error recovery
        local failure_type=$(categorize_failure "$output_file" "$exit_code")
        record_attempt "$story_id" false "Failure type: $failure_type"
        append_progress "$story_id" "FAILED" "Type: $failure_type, Exit code: $exit_code"

        if [[ "$VERBOSE" == true ]]; then
            log_info "Output (last 30 lines):"
            tail -30 "$output_file"
        fi

        # Handle failure with recovery options
        local recovery_result
        handle_story_failure "$story_id" "$failure_type" "$output_file" "$attempt"
        recovery_result=$?

        # Cleanup prompt file
        rm -f "$prompt_file"

        case $recovery_result in
            0)
                # Success (shouldn't happen in failure handler)
                rm -f "$output_file"
                return 0
                ;;
            1)
                # Skip this story
                rm -f "$output_file"
                return 1
                ;;
            2)
                # Retry requested
                rm -f "$output_file"
                if [[ $attempt -lt $MAX_RETRIES_PER_STORY ]]; then
                    log_info "Retrying in ${RETRY_DELAY}s..."
                    sleep "$RETRY_DELAY"
                    run_story "$story_json" $((attempt + 1))
                    return $?
                else
                    log_warn "Max retries ($MAX_RETRIES_PER_STORY) reached, skipping story"
                    return 1
                fi
                ;;
            *)
                rm -f "$output_file"
                return 1
                ;;
        esac
    fi
}

# Check if session timeout reached (for auto-restart)
check_session_timeout() {
    if [[ "$AUTO_RESTART" != true ]]; then
        return 1  # Not using auto-restart
    fi

    local current_time=$(date +%s)
    local elapsed=$((current_time - SESSION_START_TIME))

    if [[ $elapsed -ge $SESSION_TIMEOUT ]]; then
        return 0  # Timeout reached
    fi

    return 1  # Still within session
}

# Format seconds as human readable time
format_time() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))

    if [[ $hours -gt 0 ]]; then
        printf "%dh%dm%ds" $hours $minutes $secs
    elif [[ $minutes -gt 0 ]]; then
        printf "%dm%ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}

# =============================================================================
# Parallel Execution Mode (v2.0.0 - Claude Code v2.1.17+)
# =============================================================================

# Get streams from backlog
get_streams() {
    jq -r '.streams // []' "$BACKLOG"
}

# Count active streams
count_streams() {
    jq '.streams | length' "$BACKLOG" 2>/dev/null || echo "0"
}

# Get stories for a specific stream
get_stream_stories() {
    local stream_id="$1"
    jq -r "[.stories[] | select(.tags.streamId == \"$stream_id\")] | length" "$BACKLOG"
}

# Get stream progress
get_stream_progress() {
    local stream_id="$1"
    local total=$(jq "[.stories[] | select(.tags.streamId == \"$stream_id\")] | length" "$BACKLOG")
    local passed=$(jq "[.stories[] | select(.tags.streamId == \"$stream_id\" and .passes == true)] | length" "$BACKLOG")
    echo "$passed/$total"
}

# Spawn a parallel stream worker
spawn_stream_worker() {
    local stream_id="$1"
    local stream_name="$2"
    local log_file="$(dirname "$BACKLOG")/stream-${stream_id}.log"

    log_info "  Spawning worker for stream: $stream_name ($stream_id)"
    log_info "  Log file: $log_file"

    # Run sigma-ralph for this specific stream in background
    "$SCRIPT_DIR/sigma-ralph.sh" \
        --workspace="$WORKSPACE" \
        --backlog="$BACKLOG" \
        --stream="$stream_id" \
        --engine="$ENGINE" \
        --timeout="$STORY_TIMEOUT" \
        --max-retries="$MAX_RETRIES_PER_STORY" \
        --failure-mode=skip \
        --quiet \
        > "$log_file" 2>&1 &

    local pid=$!
    echo "$pid"
}

# Monitor parallel workers
monitor_parallel_workers() {
    local -n pids=$1
    local -n stream_names=$2

    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "⏳ Monitoring ${#pids[@]} parallel workers..."
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    local all_done=false
    local check_count=0

    while [[ "$all_done" != true ]]; do
        sleep "$PARALLEL_MONITOR_INTERVAL"
        check_count=$((check_count + 1))

        all_done=true
        local active_count=0
        local completed_count=0

        echo ""
        log_info "─── Status Check #$check_count ───"

        for i in "${!pids[@]}"; do
            local pid="${pids[$i]}"
            local name="${stream_names[$i]}"

            if ps -p "$pid" > /dev/null 2>&1; then
                all_done=false
                active_count=$((active_count + 1))
                log_info "  [$name] RUNNING (PID: $pid)"
            else
                completed_count=$((completed_count + 1))
                # Check exit status
                if wait "$pid" 2>/dev/null; then
                    log_success "  [$name] COMPLETED"
                else
                    log_warn "  [$name] FINISHED (with errors)"
                fi
            fi
        done

        log_info "Active: $active_count | Completed: $completed_count | Total: ${#pids[@]}"
        log_info "Overall progress: $(get_progress)"
    done

    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "🎉 ALL PARALLEL WORKERS COMPLETE!"
    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Run streams in parallel
run_parallel() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 SIGMA-RALPH PARALLEL MODE v${VERSION}"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Workspace: $WORKSPACE"
    log_info "Backlog:   $BACKLOG"
    log_info "Engine:    $ENGINE"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check if streams exist
    local stream_count=$(count_streams)
    if [[ "$stream_count" -eq 0 ]]; then
        log_error "No streams defined in backlog."
        log_info "Streams are defined in the 'streams' array of prd.json."
        log_info "Run Step 11b (PRD Swarm) to generate streams, or use sequential mode."
        exit 1
    fi

    # Initialize native tasks for parallel mode too
    if [[ "$NATIVE_TASKS_ENABLED" == true ]]; then
        init_native_tasks
    fi

    log_info "Found $stream_count streams in backlog:"

    # Parse streams and spawn workers
    local -a worker_pids=()
    local -a worker_names=()

    while IFS= read -r stream; do
        local stream_id=$(echo "$stream" | jq -r '.id')
        local stream_name=$(echo "$stream" | jq -r '.name')
        local story_count=$(get_stream_stories "$stream_id")

        log_info "  - $stream_name ($stream_id): $story_count stories"
    done < <(jq -c '.streams[]' "$BACKLOG")

    echo ""
    log_info "Spawning parallel workers..."

    while IFS= read -r stream; do
        local stream_id=$(echo "$stream" | jq -r '.id')
        local stream_name=$(echo "$stream" | jq -r '.name')

        local pid=$(spawn_stream_worker "$stream_id" "$stream_name")
        worker_pids+=("$pid")
        worker_names+=("$stream_name")
    done < <(jq -c '.streams[]' "$BACKLOG")

    echo ""

    # Monitor workers
    monitor_parallel_workers worker_pids worker_names

    # Final progress report
    echo ""
    log_info "Final progress: $(get_progress)"

    # Check for any incomplete stories
    local remaining=$(jq '[.stories[] | select(.passes == false)] | length' "$BACKLOG")
    if [[ "$remaining" -gt 0 ]]; then
        log_warn "$remaining stories still incomplete."
        log_info "Check individual stream logs for details:"
        for stream_id in $(jq -r '.streams[].id' "$BACKLOG"); do
            local log_file="$(dirname "$BACKLOG")/stream-${stream_id}.log"
            if [[ -f "$log_file" ]]; then
                log_info "  - $log_file"
            fi
        done
        return 1
    fi

    return 0
}

# =============================================================================
# Sequential Execution Mode (Default)
# =============================================================================

main_loop() {
    # Record session start time
    SESSION_START_TIME=$(date +%s)

    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔄 SIGMA-RALPH LOOP v${VERSION}"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Workspace: $WORKSPACE"
    log_info "Backlog:   $BACKLOG"
    log_info "Mode:      $MODE"
    log_info "Engine:    $ENGINE"
    log_info "Stream:    ${STREAM:-all}"
    log_info "Progress:  $(get_progress)"
    if [[ "$SANDBOX_ENABLED" == true ]]; then
        log_info "Sandbox:   $SANDBOX_PROVIDER (budget: \$$BUDGET_MAX max)"
    fi
    if [[ "$NATIVE_TASKS_ENABLED" == true ]]; then
        log_info "Tasks:     Native (ID: ${TASK_LIST_ID:-auto-generated})"
    fi
    if [[ "$SWARM_MODE" == true ]]; then
        log_info "Swarm:     Enabled (always spawn sub-agents)"
    fi
    if [[ "$AUTO_RESTART" == true ]]; then
        log_info "Session:   $(format_time $SESSION_TIMEOUT) (auto-restart enabled)"
    fi
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Initialize progress file with header
    init_progress_file

    # NEW v3.0.0: Initialize native task tracking
    if [[ "$NATIVE_TASKS_ENABLED" == true ]]; then
        init_native_tasks
    fi

    local iteration=0
    local consecutive_failures=0
    local max_consecutive_failures=3

    while [[ $iteration -lt $MAX_ITERATIONS ]]; do
        iteration=$((iteration + 1))

        # Check session timeout before starting next story
        if check_session_timeout; then
            log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_warn "⏰ SESSION TIMEOUT ($(format_time $SESSION_TIMEOUT))"
            log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "Progress: $(get_progress)"
            return 124  # Special exit code for session timeout
        fi

        # Get next story
        local story_json=$(get_next_story)

        if [[ "$story_json" == "null" ]] || [[ -z "$story_json" ]]; then
            log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_success "🎉 ALL STORIES COMPLETE!"
            log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "Final progress: $(get_progress)"
            return 0
        fi

        local story_id=$(echo "$story_json" | jq -r '.id')

        # Show time remaining if auto-restart enabled
        if [[ "$AUTO_RESTART" == true ]]; then
            local elapsed=$(($(date +%s) - SESSION_START_TIME))
            local remaining=$((SESSION_TIMEOUT - elapsed))
            log_info "Iteration $iteration/$MAX_ITERATIONS - Story: $story_id ($(format_time $remaining) remaining)"
        else
            log_info "Iteration $iteration/$MAX_ITERATIONS - Story: $story_id"
        fi

        if run_story "$story_json"; then
            consecutive_failures=0
        else
            consecutive_failures=$((consecutive_failures + 1))

            if [[ $consecutive_failures -ge $max_consecutive_failures ]]; then
                log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_error "⛔ STOPPING: $max_consecutive_failures consecutive failures"
                log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_info "Progress: $(get_progress)"
                return 1
            fi
        fi

        log_info "Progress: $(get_progress)"
        echo ""
    done

    log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_warn "⚠️ MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
    log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Progress: $(get_progress)"
    return 0
}

# =============================================================================
# Entry Point
# =============================================================================

main() {
    parse_args "$@"
    validate_requirements

    # NEW v2.0.0: Parallel execution mode
    if [[ "$PARALLEL" == true ]]; then
        run_parallel
        exit $?
    fi

    if [[ "$AUTO_RESTART" == true ]]; then
        # Auto-restart mode: loop until all stories complete
        local cycle=1
        while true; do
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "🔄 AUTO-RESTART CYCLE $cycle"
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            main_loop
            local exit_code=$?

            if [[ $exit_code -eq 0 ]]; then
                # All stories complete
                log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_success "🎉 ALL STORIES COMPLETE ACROSS ALL CYCLES!"
                log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                exit 0
            elif [[ $exit_code -eq 124 ]]; then
                # Session timeout - restart
                log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                log_warn "⏰ RESTARTING IN 10 SECONDS..."
                log_warn "   Press Ctrl+C to abort"
                log_warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                sleep 10
                cycle=$((cycle + 1))
            else
                # Error - exit
                log_error "Loop exited with error code $exit_code"
                exit $exit_code
            fi
        done
    else
        # Single run mode (default)
        main_loop
    fi
}

main "$@"

