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

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIGMA_PROTOCOL_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

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

# Error recovery settings
STORY_TIMEOUT=600           # 10 minutes per story
MAX_RETRIES_PER_STORY=2     # Retry failed stories up to 2 times
RETRY_DELAY=5               # Seconds between retries
AUTO_ROLLBACK=true          # Git rollback on failure
FAILURE_MODE="prompt"       # prompt | skip | abort

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

# Activity monitor - shows file changes and git status while Claude works
start_activity_monitor() {
    local story_id="$1"
    local start_time=$(date +%s)

    while true; do
        sleep 5

        local elapsed=$(( $(date +%s) - start_time ))
        local mins=$((elapsed / 60))
        local secs=$((elapsed % 60))

        # Clear line and show heartbeat
        echo -ne "\r\033[K"
        echo -ne "${BLUE}[♥ ${mins}m${secs}s]${NC} "

        # Show recently modified files (last 30 seconds)
        local recent_files=$(find "$WORKSPACE" -type f \( -name "*.swift" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" \) -mmin -0.5 2>/dev/null | head -3)
        if [[ -n "$recent_files" ]]; then
            local file_count=$(echo "$recent_files" | wc -l | tr -d ' ')
            echo -ne "📝 ${file_count} files "
            local latest=$(echo "$recent_files" | head -1)
            echo -ne "${GREEN}$(basename "$latest")${NC} "
        fi

        # Show git changes count
        local git_changes=$(cd "$WORKSPACE" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$git_changes" -gt 0 ]]; then
            echo -ne "📦 ${git_changes} staged "
        fi

        # Check if Claude is still running
        if ! ps -p $CLAUDE_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}(completing)${NC}"
            break
        fi
    done
}

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

EXAMPLES:
    # Run prototype implementation
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype

    # Run implementation with stream filter
    sigma-ralph.sh --workspace=/path/to/myapp --mode=implementation --stream=1

    # Custom backlog
    sigma-ralph.sh --workspace=/path/to/myapp --backlog=docs/ralph/custom/prd.json

    # Dry run preview
    sigma-ralph.sh --workspace=/path/to/myapp --mode=prototype --dry-run

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

# Generate skill delegation matrix for worker prompts
generate_skill_matrix() {
    cat << 'SKILL_MATRIX'
## CRITICAL: Skill Delegation Matrix

**DO NOT IMPLEMENT DIRECTLY** - Use specialized skills for all implementation.

| Task Type | Required Skill | When to Use |
|-----------|----------------|-------------|
| Architecture | `@senior-architect` | BEFORE any coding begins |
| UI Components | `@frontend-design` | ALL UI work (React, SwiftUI, Tailwind) |
| File Scaffolding | `@scaffold` | New features requiring multiple files |
| Error Diagnosis | `@systematic-debugging` | When ANY error occurs |
| PRD Compliance | `@gap-analysis` | AFTER implementing, verify against PRD |
| Test Validation | `@qa-engineer` | Verify acceptance criteria pass |
| Web UI Testing | `agent-browser` CLI | Web projects - validate rendered UI |
| iOS UI Testing | `xcrun simctl` | iOS projects - screenshot validation |

### How to Use Skills

1. **Invoke by name**: Type `@skill-name` in your response
2. **Via Skill tool**: Use the Skill tool with skill parameter
3. **Read skill docs**: Check `.claude/skills/` for detailed instructions

### Mandatory Skill Usage

- **Before coding**: `@senior-architect` for design review
- **For UI changes**: `@frontend-design` must be used
- **After implementing**: `@gap-analysis` to verify PRD compliance
- **On any error**: `@systematic-debugging` before retrying

You will be **REJECTED** if you implement directly without skill delegation.
SKILL_MATRIX
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

    # NEW: Get design system context for UI tasks
    local design_context=$(get_design_system_context "$story_json")
    
    # Paths for memory files
    local progress_file="$(dirname "$BACKLOG")/progress.txt"
    local agents_file="AGENTS.md"

    # Detect available skills in workspace
    local detected_skills=$(detect_skills "$WORKSPACE")
    local skill_matrix=$(generate_skill_matrix)

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
# Progress File
# =============================================================================

# Initialize progress file with header if it doesn't exist
init_progress_file() {
    local progress_file="$(dirname "$BACKLOG")/progress.txt"

    if [[ ! -f "$progress_file" ]]; then
        local backlog_name=$(basename "$(dirname "$BACKLOG")")
        cat > "$progress_file" << EOF
# Ralph Progress Log
**Backlog:** $backlog_name
**Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Engine:** $ENGINE
**Workspace:** $WORKSPACE

---

EOF
        log_info "Created progress file: $progress_file"
    fi
}

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

                case "${choice^^}" in
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

    local MONITOR_PID=""

    case "$ENGINE" in
        claude)
            # Claude Code CLI invocation
            # Using --dangerously-skip-permissions for autonomous mode
            if [[ "$QUIET" != true && -f "$SCRIPT_DIR/activity-filter.sh" ]]; then
                # Stream JSON mode with real-time activity display
                # IMPORTANT: --verbose is REQUIRED for stream-json to work
                local json_output=$(mktemp)
                local text_output=$(mktemp)

                # Cleanup trap for temp files on interrupt/error
                trap "rm -f '$json_output' '$text_output' 2>/dev/null" EXIT INT TERM

                timeout "$STORY_TIMEOUT" claude --dangerously-skip-permissions \
                    --output-format stream-json \
                    --verbose \
                    -p "$(cat "$prompt_file")" 2>&1 | \
                    "$SCRIPT_DIR/activity-filter.sh" > "$json_output" &
                CLAUDE_PID=$!
                MONITOR_PID=""

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
                # Quiet mode or fallback - direct execution without stream-json
                timeout "$STORY_TIMEOUT" claude --dangerously-skip-permissions \
                    -p "$(cat "$prompt_file")" > "$output_file" 2>&1 &
                CLAUDE_PID=$!

                if [[ "$QUIET" != true ]]; then
                    start_activity_monitor "$story_id" &
                    MONITOR_PID=$!
                fi

                wait $CLAUDE_PID
                exit_code=$?

                if [[ -n "$MONITOR_PID" ]]; then
                    kill $MONITOR_PID 2>/dev/null || true
                    echo ""  # New line after monitor output
                fi
            fi
            ;;
        opencode)
            # OpenCode CLI invocation
            timeout "$STORY_TIMEOUT" opencode --mode=plan -p "$(cat "$prompt_file")" > "$output_file" 2>&1 &
            CLAUDE_PID=$!

            # Start activity monitor (unless quiet mode)
            if [[ "$QUIET" != true ]]; then
                start_activity_monitor "$story_id" &
                MONITOR_PID=$!
            fi

            # Wait for OpenCode to finish
            wait $CLAUDE_PID
            exit_code=$?

            # Stop monitor
            if [[ -n "$MONITOR_PID" ]]; then
                kill $MONITOR_PID 2>/dev/null || true
                echo ""  # New line after monitor output
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

main_loop() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔄 SIGMA-RALPH LOOP v${VERSION}"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Workspace: $WORKSPACE"
    log_info "Backlog:   $BACKLOG"
    log_info "Mode:      $MODE"
    log_info "Engine:    $ENGINE"
    log_info "Stream:    ${STREAM:-all}"
    log_info "Progress:  $(get_progress)"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Initialize progress file with header
    init_progress_file

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

