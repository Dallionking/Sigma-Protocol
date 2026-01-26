#!/bin/bash
# =============================================================================
# Skill Sync Script - Cross-Platform Skill Library Consistency
# =============================================================================
# Ensures Sigma Protocol skills are consistently available across all platforms:
# - Claude Code (platforms/claude-code/skills/)
# - OpenCode (platforms/opencode/skill/)
# - Ralph Loop (via skill-registry.sh)
#
# Usage:
#   ./scripts/sync-skills.sh [--verbose] [--fix] [--inventory]
#
# Options:
#   --verbose    Show detailed output
#   --fix        Automatically copy missing skills
#   --inventory  Just show inventory counts
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

CLAUDE_CODE_DIR="$PROJECT_ROOT/platforms/claude-code/skills"
OPENCODE_DIR="$PROJECT_ROOT/platforms/opencode/skill"
CURSOR_DIR="$PROJECT_ROOT/platforms/cursor/rules"
SRC_SKILLS_DIR="$PROJECT_ROOT/src/skills"
LOCAL_SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

# Parse arguments
VERBOSE=false
FIX=false
INVENTORY_ONLY=false

for arg in "$@"; do
    case $arg in
        --verbose|-v) VERBOSE=true ;;
        --fix|-f) FIX=true ;;
        --inventory|-i) INVENTORY_ONLY=true ;;
        --help|-h)
            echo "Usage: $0 [--verbose] [--fix] [--inventory]"
            exit 0
            ;;
    esac
done

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

count_skills() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        find "$dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' '
    else
        echo "0"
    fi
}

get_skill_names() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        # Get directory names (SKILL.md style) and file names (.md style)
        find "$dir" -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | grep -v "$(basename "$dir")" | sort
        find "$dir" -maxdepth 1 -name "*.md" -type f -exec basename {} .md \; 2>/dev/null | sort
    fi
}

# =============================================================================
# Inventory Report
# =============================================================================

show_inventory() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                     Sigma Protocol Skill Inventory                  ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo ""

    printf "%-45s %s\n" "Location" "Count"
    printf "%-45s %s\n" "────────────────────────────────────────────" "─────"

    local total=0

    for dir in "$CLAUDE_CODE_DIR" "$OPENCODE_DIR" "$SRC_SKILLS_DIR" "$LOCAL_SKILLS_DIR" "$CURSOR_DIR"; do
        local count=$(count_skills "$dir")
        local short_dir="${dir#$PROJECT_ROOT/}"
        printf "%-45s %s\n" "$short_dir" "$count"
        ((total += count)) || true
    done

    echo ""
    printf "%-45s %s\n" "Total files (with duplicates):" "$total"

    # Count unique skills
    local unique_count=$(cat <(get_skill_names "$CLAUDE_CODE_DIR") \
                            <(get_skill_names "$OPENCODE_DIR") \
                            <(get_skill_names "$SRC_SKILLS_DIR") \
                            <(get_skill_names "$LOCAL_SKILLS_DIR") \
                        | sort | uniq | wc -l | tr -d ' ')
    printf "%-45s %s\n" "Unique skills:" "$unique_count"
    echo ""
}

# =============================================================================
# Sync Claude Code → OpenCode
# =============================================================================

sync_claude_to_opencode() {
    echo ""
    log_info "Checking Claude Code → OpenCode sync..."

    local missing=0
    local synced=0

    # Get lists
    local claude_skills=$(get_skill_names "$CLAUDE_CODE_DIR" | sort)
    local opencode_skills=$(get_skill_names "$OPENCODE_DIR" | sort)

    # Find skills in Claude Code but not in OpenCode
    for skill in $claude_skills; do
        [[ -z "$skill" ]] && continue
        [[ "$skill" == "SKILL" ]] && continue

        if ! echo "$opencode_skills" | grep -qx "$skill"; then
            ((missing++)) || true

            if [[ "$VERBOSE" == true ]]; then
                log_warn "Missing in OpenCode: $skill"
            fi

            if [[ "$FIX" == true ]]; then
                # Determine source path (directory or file)
                if [[ -d "$CLAUDE_CODE_DIR/$skill" ]]; then
                    cp -r "$CLAUDE_CODE_DIR/$skill" "$OPENCODE_DIR/"
                    ((synced++)) || true
                    log_success "Copied: $skill/"
                elif [[ -f "$CLAUDE_CODE_DIR/$skill.md" ]]; then
                    cp "$CLAUDE_CODE_DIR/$skill.md" "$OPENCODE_DIR/"
                    ((synced++)) || true
                    log_success "Copied: $skill.md"
                fi
            fi
        fi
    done

    if [[ $missing -eq 0 ]]; then
        log_success "Claude Code and OpenCode are in sync!"
    else
        if [[ "$FIX" == true ]]; then
            log_success "Synced $synced of $missing missing skills"
        else
            log_warn "$missing skills in Claude Code missing from OpenCode"
            log_info "Run with --fix to auto-sync"
        fi
    fi
}

# =============================================================================
# Check OpenCode → Claude Code (reverse sync)
# =============================================================================

check_opencode_extras() {
    echo ""
    log_info "Checking for OpenCode-only skills..."

    local extras=0

    local claude_skills=$(get_skill_names "$CLAUDE_CODE_DIR" | sort)
    local opencode_skills=$(get_skill_names "$OPENCODE_DIR" | sort)

    for skill in $opencode_skills; do
        [[ -z "$skill" ]] && continue
        [[ "$skill" == "SKILL" ]] && continue

        if ! echo "$claude_skills" | grep -qx "$skill"; then
            ((extras++)) || true
            if [[ "$VERBOSE" == true ]]; then
                log_info "OpenCode-only: $skill"
            fi
        fi
    done

    if [[ $extras -eq 0 ]]; then
        log_success "No OpenCode-only skills (platforms are symmetric)"
    else
        log_info "$extras OpenCode-only skills (intentional platform differences)"
    fi
}

# =============================================================================
# Validate Frontmatter
# =============================================================================

validate_frontmatter() {
    echo ""
    log_info "Validating skill frontmatter..."

    local missing_name=0
    local missing_desc=0
    local checked=0

    for dir in "$CLAUDE_CODE_DIR" "$OPENCODE_DIR"; do
        [[ ! -d "$dir" ]] && continue

        while IFS= read -r skill_file; do
            [[ -z "$skill_file" ]] && continue

            ((checked++)) || true

            # Check for name field
            if ! grep -q "^name:" "$skill_file" 2>/dev/null; then
                ((missing_name++)) || true
                if [[ "$VERBOSE" == true ]]; then
                    log_warn "Missing 'name:' in ${skill_file#$PROJECT_ROOT/}"
                fi
            fi

            # Check for description field
            if ! grep -q "^description:" "$skill_file" 2>/dev/null; then
                ((missing_desc++)) || true
                if [[ "$VERBOSE" == true ]]; then
                    log_warn "Missing 'description:' in ${skill_file#$PROJECT_ROOT/}"
                fi
            fi

        done < <(find "$dir" -name "*.md" -type f 2>/dev/null)
    done

    echo "  Checked: $checked files"

    if [[ $missing_name -eq 0 ]] && [[ $missing_desc -eq 0 ]]; then
        log_success "All skills have valid frontmatter"
    else
        [[ $missing_name -gt 0 ]] && log_warn "$missing_name skills missing 'name:' field"
        [[ $missing_desc -gt 0 ]] && log_warn "$missing_desc skills missing 'description:' field"
    fi
}

# =============================================================================
# Cursor Conversion Candidates
# =============================================================================

show_cursor_candidates() {
    echo ""
    log_info "Top Cursor conversion candidates (not yet in rules/)..."

    local cursor_rules=$(get_skill_names "$CURSOR_DIR" | sort)
    local count=0

    # High-value skills that should be in Cursor
    local candidates=(
        "react-performance"
        "monorepo-architecture"
        "agentic-coding"
        "memory-systems"
        "stripe-best-practices"
        "frontend-design"
        "api-design-principles"
        "systematic-debugging"
        "senior-architect"
        "quality-gates"
    )

    for skill in "${candidates[@]}"; do
        if ! echo "$cursor_rules" | grep -qx "$skill"; then
            ((count++)) || true
            echo "  - $skill"
        fi
    done

    if [[ $count -eq 0 ]]; then
        log_success "All high-value skills are in Cursor!"
    else
        log_info "$count high-value skills could be converted to Cursor .mdc format"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo "🔄 Sigma Protocol Skill Sync"
    echo "════════════════════════════"

    # Always show inventory
    show_inventory

    if [[ "$INVENTORY_ONLY" == true ]]; then
        exit 0
    fi

    # Run sync checks
    sync_claude_to_opencode
    check_opencode_extras
    validate_frontmatter
    show_cursor_candidates

    echo ""
    echo "════════════════════════════"
    log_success "Skill sync check complete!"
    echo ""
}

main
