#!/usr/bin/env bash
# =============================================================================
# SSS-Ralph Loop Runner
# =============================================================================
# Ralph-style autonomous implementation loop that spawns fresh Claude Code or
# OpenCode sessions for each story, ensuring clean context per iteration.
#
# Usage:
#   sss-ralph.sh --workspace=/path/to/project --mode=prototype
#   sss-ralph.sh --workspace=/path/to/project --mode=implementation --stream=1
#   sss-ralph.sh --workspace=/path/to/project --backlog=docs/ralph/custom/prd.json
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

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSS_PROTOCOL_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

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

show_help() {
    cat << EOF
SSS-Ralph Loop Runner v${VERSION}

Ralph-style autonomous implementation loop for SSS Protocol.
Spawns fresh Claude Code or OpenCode sessions for each story.

USAGE:
    sss-ralph.sh [OPTIONS]

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
    --help                 Show this help message

EXAMPLES:
    # Run prototype implementation
    sss-ralph.sh --workspace=/path/to/myapp --mode=prototype

    # Run implementation with stream filter
    sss-ralph.sh --workspace=/path/to/myapp --mode=implementation --stream=1

    # Custom backlog
    sss-ralph.sh --workspace=/path/to/myapp --backlog=docs/ralph/custom/prd.json

    # Dry run preview
    sss-ralph.sh --workspace=/path/to/myapp --mode=prototype --dry-run

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
    
    # Detect AI engine
    detect_engine
}

detect_engine() {
    if [[ "$ENGINE" == "auto" ]]; then
        if command -v claude &> /dev/null; then
            ENGINE="claude"
            log_info "Detected Claude Code CLI"
        elif command -v opencode &> /dev/null; then
            ENGINE="opencode"
            log_info "Detected OpenCode CLI"
        else
            log_error "No AI engine found. Install claude or opencode CLI."
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
    local temp_file=$(mktemp)
    
    # Update passes to true and add lastAttempt
    jq --arg id "$story_id" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        '(.stories[] | select(.id == $id)) |= . + {
            passes: true,
            lastAttempt: {
                timestamp: $ts,
                engine: "'"$ENGINE"'",
                success: true
            }
        } | .meta.passedStories = ([.stories[] | select(.passes == true)] | length)' \
        "$BACKLOG" > "$temp_file"
    
    mv "$temp_file" "$BACKLOG"
    log_success "Story $story_id marked as passed"
}

record_attempt() {
    local story_id="$1"
    local success="$2"
    local error_msg="${3:-}"
    local temp_file=$(mktemp)
    
    jq --arg id "$story_id" \
       --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg engine "$ENGINE" \
       --argjson success "$success" \
       --arg error "$error_msg" \
        '(.stories[] | select(.id == $id)) |= . + {
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
        }' "$BACKLOG" > "$temp_file"
    
    mv "$temp_file" "$BACKLOG"
}

get_progress() {
    local total=$(jq '.stories | length' "$BACKLOG")
    local passed=$(jq '[.stories[] | select(.passes == true)] | length' "$BACKLOG")
    local remaining=$((total - passed))
    echo "$passed/$total (${remaining} remaining)"
}

# =============================================================================
# Prompt Generation
# =============================================================================

generate_worker_prompt() {
    local story_json="$1"
    local story_id=$(echo "$story_json" | jq -r '.id')
    local story_title=$(echo "$story_json" | jq -r '.title')
    local story_desc=$(echo "$story_json" | jq -r '.description')
    local source_prd=$(echo "$story_json" | jq -r '.source.prdPath')
    local criteria=$(echo "$story_json" | jq -r '.acceptanceCriteria | map("- [\(.id)] \(.description) (type: \(.type))") | join("\n")')
    local depends_on=$(echo "$story_json" | jq -r '.dependsOn | if length > 0 then join(", ") else "None" end')
    local agent_instructions=$(echo "$story_json" | jq -r '.agentInstructions // "None"')
    
    # Paths for memory files
    local progress_file="$(dirname "$BACKLOG")/progress.txt"
    local agents_file="AGENTS.md"
    
    cat << EOF
You are an autonomous coding agent implementing a single story from a Ralph-style backlog.

## CONTEXT (Read These First)

1. **AGENTS.md (Long-Term Memory):**
   If \`$agents_file\` exists at the project root, read it for coding patterns, gotchas, and conventions.

2. **progress.txt (Short-Term Memory):**
   If \`$progress_file\` exists, read it to understand what previous iterations learned.

## STORY: $story_title
**ID:** $story_id
**Description:** $story_desc
**Source PRD:** $source_prd
**Dependencies:** $depends_on
**Agent Instructions:** $agent_instructions

## INSTRUCTIONS

1. **READ context first:**
   - Read AGENTS.md (if exists) for project patterns
   - Read progress.txt (if exists) for recent learnings
   - Read \`$source_prd\` completely before implementing

2. **IMPLEMENT only this story:**
   Do not implement other stories or add features beyond scope.

3. **VERIFY against acceptance criteria:**
$criteria

4. **RUN verification commands:**
   For each acceptance criterion with type "command", run the specified command.
   For type "file-exists", verify the file exists.
   For type "ui-validation", run @ui-healer if available.

5. **UPDATE AGENTS.md (if you learned something important):**
   If you discovered a coding pattern, gotcha, or convention that future iterations should know,
   append it to AGENTS.md in the appropriate folder. This is LONG-TERM memory.

6. **COMMIT your changes:**
   After all acceptance criteria pass, commit your changes:
   \`\`\`bash
   git add -A
   git commit -m "feat($story_id): $story_title"
   \`\`\`

7. **REPORT completion:**
   When all acceptance criteria pass AND changes are committed, output exactly:
   \`\`\`
   RALPH_STORY_COMPLETE: $story_id
   \`\`\`

   If you cannot complete the story, output:
   \`\`\`
   RALPH_STORY_BLOCKED: $story_id
   REASON: <explain why>
   \`\`\`

## RULES
- Do NOT deviate from the PRD specification
- Do NOT implement multiple stories
- Do NOT skip verification steps
- Do NOT forget to commit your changes
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
# Progress File
# =============================================================================

append_progress() {
    local story_id="$1"
    local status="$2"
    local message="${3:-}"
    local progress_file="$(dirname "$BACKLOG")/progress.txt"
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    cat >> "$progress_file" << EOF

### $timestamp - $story_id
**Status:** $status
**Engine:** $ENGINE
${message:+**Notes:** $message}

---
EOF
}

# =============================================================================
# Main Loop
# =============================================================================

run_story() {
    local story_json="$1"
    local story_id=$(echo "$story_json" | jq -r '.id')
    local story_title=$(echo "$story_json" | jq -r '.title')
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "STORY: $story_title ($story_id)"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ "$DRY_RUN" == true ]]; then
        log_warn "[DRY RUN] Would execute story: $story_id"
        generate_worker_prompt "$story_json"
        return 0
    fi
    
    # Generate prompt
    local prompt=$(generate_worker_prompt "$story_json")
    local prompt_file=$(mktemp)
    echo "$prompt" > "$prompt_file"
    
    # Execute in target workspace
    cd "$WORKSPACE"
    
    local output_file=$(mktemp)
    local exit_code=0
    
    log_info "Spawning fresh $ENGINE session..."
    
    case "$ENGINE" in
        claude)
            # Claude Code CLI invocation
            # Using --dangerously-skip-permissions for autonomous mode
            if timeout 600 claude --dangerously-skip-permissions -p "$(cat "$prompt_file")" > "$output_file" 2>&1; then
                exit_code=0
            else
                exit_code=$?
            fi
            ;;
        opencode)
            # OpenCode CLI invocation
            if timeout 600 opencode --mode=plan -p "$(cat "$prompt_file")" > "$output_file" 2>&1; then
                exit_code=0
            else
                exit_code=$?
            fi
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
        log_error "Story did not complete with expected marker"
        record_attempt "$story_id" false "No completion marker"
        append_progress "$story_id" "INCOMPLETE" "No RALPH_STORY_COMPLETE marker found"
        
        if [[ "$VERBOSE" == true ]]; then
            log_info "Output:"
            cat "$output_file"
        fi
        
        rm -f "$prompt_file" "$output_file"
        return 1
    fi
}

main_loop() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔄 SSS-RALPH LOOP v${VERSION}"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Workspace: $WORKSPACE"
    log_info "Backlog:   $BACKLOG"
    log_info "Mode:      $MODE"
    log_info "Engine:    $ENGINE"
    log_info "Stream:    ${STREAM:-all}"
    log_info "Progress:  $(get_progress)"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local iteration=0
    local consecutive_failures=0
    local max_consecutive_failures=3
    
    while [[ $iteration -lt $MAX_ITERATIONS ]]; do
        iteration=$((iteration + 1))
        
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
        log_info "Iteration $iteration/$MAX_ITERATIONS - Story: $story_id"
        
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
    main_loop
}

main "$@"

