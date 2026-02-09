#!/bin/bash
# Sigma Protocol - Cross-Platform Skill Sync
# Syncs skills from .claude/skills/ (canonical source) to all platforms
#
# Usage:
#   ./scripts/sync-skills-to-platforms.sh [OPTIONS]
#
# Options:
#   --dry-run         Show what would be done without making changes
#   --platform NAME   Sync only to specified platform
#   --verbose         Show detailed output
#   --force           Overwrite existing files
#   --help            Show this help message
#
# Supported Platforms:
#   opencode      - Direct copy to platforms/opencode/skill/
#   cursor        - Condensed .mdc format to .cursor/rules/
#   factory       - Direct copy to platforms/factory-droid/skills/
#   antigravity   - SKILL.md folder format to platforms/antigravity/skills/
#   codex         - SKILL.md folder format to platforms/codex/skills/

set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Script paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source directory
CANONICAL_SOURCE="$PROJECT_ROOT/.claude/skills"

# Platform configurations (bash 3.x compatible)
PLATFORMS="opencode cursor factory antigravity codex"

# Get platform target directory
get_platform_target() {
    local platform="$1"
    case "$platform" in
    opencode)    echo "$PROJECT_ROOT/platforms/opencode/skill" ;;
    cursor)      echo "$PROJECT_ROOT/.cursor/rules" ;;
    factory)     echo "$PROJECT_ROOT/platforms/factory-droid/skills" ;;
    antigravity) echo "$PROJECT_ROOT/platforms/antigravity/skills" ;;
    codex)       echo "$PROJECT_ROOT/platforms/codex/skills" ;;
    *)           echo "" ;;
  esac
}

# Get platform format type
get_platform_format() {
    local platform="$1"
    case "$platform" in
    opencode)    echo "direct" ;;
    cursor)      echo "condense" ;;
    factory)     echo "direct" ;;
    antigravity) echo "folder" ;;
    codex)       echo "direct" ;;
    *)           echo "unknown" ;;
  esac
}

# Options
DRY_RUN=false
VERBOSE=false
FORCE=false
TARGET_PLATFORM=""

# Counters
SYNCED_opencode=0
SYNCED_cursor=0
SYNCED_factory=0
SYNCED_antigravity=0
SYNCED_codex=0
SKIPPED_opencode=0
SKIPPED_cursor=0
SKIPPED_factory=0
SKIPPED_antigravity=0
SKIPPED_codex=0
TRANSFORMED_opencode=0
TRANSFORMED_cursor=0
TRANSFORMED_factory=0
TRANSFORMED_antigravity=0
TRANSFORMED_codex=0
ERRORS_opencode=0
ERRORS_cursor=0
ERRORS_factory=0
ERRORS_antigravity=0
ERRORS_codex=0

# Get/set counter value
get_counter() {
    local type="$1"
    local platform="$2"
    eval "echo \${${type}_${platform}}"
}

increment_counter() {
    local type="$1"
    local platform="$2"
    local current
    current=$(get_counter "$type" "$platform")
    eval "${type}_${platform}=$((current + 1))"
}

# --- Helper Functions ---

print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}======================================================================${NC}"
    echo -e "${BOLD}${CYAN}   Sigma Protocol - Cross-Platform Skill Sync${NC}"
    echo -e "${BOLD}${CYAN}======================================================================${NC}"
    echo ""
}

print_usage() {
    cat << EOF
${BOLD}USAGE${NC}
    $0 [OPTIONS]

${BOLD}OPTIONS${NC}
    --dry-run         Show what would be done without making changes
    --platform NAME   Sync only to specified platform (opencode, cursor, factory, antigravity, codex)
    --verbose         Show detailed output
    --force           Overwrite existing files (default: skip existing)
    --help            Show this help message

${BOLD}PLATFORMS${NC}
    opencode      Direct copy (same format)
    cursor        Condensed .mdc format (requires condense-for-cursor.py)
    factory       Direct copy (same format)
    antigravity   SKILL.md folder format (requires transform-for-antigravity.py)
    codex         Direct copy (SKILL.md folder format)

${BOLD}EXAMPLES${NC}
    $0 --dry-run                    # Preview all changes
    $0 --platform cursor            # Sync only to Cursor
    $0 --force --verbose            # Force sync with details

EOF
}

log() {
    local level="$1"
    shift
    local msg="$*"

    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $msg" ;;
        "OK")    echo -e "${GREEN}[OK]${NC} $msg" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $msg" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $msg" ;;
        "SYNC")  echo -e "${GREEN}[SYNC]${NC} $msg" ;;
        "SKIP")  echo -e "${YELLOW}[SKIP]${NC} $msg" ;;
        "DRY")   echo -e "${CYAN}[DRY-RUN]${NC} $msg" ;;
    esac
}

verbose_log() {
    if [[ "$VERBOSE" == true ]]; then
        log "$@"
    fi
}

# Check if Python scripts exist
check_python_scripts() {
    if [[ ! -f "$SCRIPT_DIR/condense-for-cursor.py" ]]; then
        log "WARN" "condense-for-cursor.py not found - Cursor sync will use direct copy"
    fi

    if [[ ! -f "$SCRIPT_DIR/transform-for-antigravity.py" ]]; then
        log "WARN" "transform-for-antigravity.py not found - Antigravity sync will use direct copy"
    fi
}

# Validate platform name
is_valid_platform() {
    local platform="$1"
    case "$platform" in
        opencode|cursor|factory|antigravity|codex) return 0 ;;
        *) return 1 ;;
    esac
}

# --- Sync Functions ---

# Direct copy sync (for opencode, factory)
sync_direct() {
    local platform="$1"
    local target_dir
    target_dir=$(get_platform_target "$platform")

    log "INFO" "Syncing to ${BOLD}$platform${NC} (direct copy)"
    verbose_log "INFO" "Target: $target_dir"

    # Ensure target directory exists
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$target_dir"
    fi

    for skill_file in "$CANONICAL_SOURCE"/*.md; do
        if [[ ! -f "$skill_file" ]]; then
            continue
        fi

        local skill_name
        skill_name=$(basename "$skill_file" .md)
        local target_skill_dir="$target_dir/$skill_name"
        local target_file="$target_skill_dir/SKILL.md"

        # Check if target exists
        if [[ -f "$target_file" && "$FORCE" == false ]]; then
            increment_counter "SKIPPED" "$platform"
            verbose_log "SKIP" "$skill_name (exists)"
            continue
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY" "Would copy: $skill_name -> $target_file"
        else
            mkdir -p "$target_skill_dir"
            cp "$skill_file" "$target_file"
            verbose_log "SYNC" "$skill_name"
        fi

        increment_counter "SYNCED" "$platform"
    done
}

# Cursor condensed format sync
sync_to_cursor() {
    local target_dir
    target_dir=$(get_platform_target "cursor")

    log "INFO" "Syncing to ${BOLD}cursor${NC} (condensed .mdc format)"
    verbose_log "INFO" "Target: $target_dir"

    # Ensure target directory exists
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$target_dir"
    fi

    # Check for Python script
    local use_python=false
    if [[ -f "$SCRIPT_DIR/condense-for-cursor.py" ]]; then
        use_python=true
    fi

    for skill_file in "$CANONICAL_SOURCE"/*.md; do
        if [[ ! -f "$skill_file" ]]; then
            continue
        fi

        local skill_name
        skill_name=$(basename "$skill_file" .md)
        local target_file="$target_dir/sigma-$skill_name.mdc"

        # Check if target exists
        if [[ -f "$target_file" && "$FORCE" == false ]]; then
            increment_counter "SKIPPED" "cursor"
            verbose_log "SKIP" "$skill_name (exists)"
            continue
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY" "Would condense: $skill_name -> sigma-$skill_name.mdc"
        else
            if [[ "$use_python" == true ]]; then
                if python3 "$SCRIPT_DIR/condense-for-cursor.py" --input "$skill_file" --output "$target_file" 2>/dev/null; then
                    increment_counter "TRANSFORMED" "cursor"
                else
                    # Fallback to direct copy on error
                    cp "$skill_file" "$target_file"
                fi
            else
                # Fallback: basic copy with .mdc extension
                cp "$skill_file" "$target_file"
            fi
            verbose_log "SYNC" "$skill_name"
        fi

        increment_counter "SYNCED" "cursor"
    done
}

# Antigravity folder format sync
sync_to_antigravity() {
    local target_dir
    target_dir=$(get_platform_target "antigravity")

    log "INFO" "Syncing to ${BOLD}antigravity${NC} (SKILL.md folder format)"
    verbose_log "INFO" "Target: $target_dir"

    # Ensure target directory exists
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$target_dir"
    fi

    # Check for Python script
    local use_python=false
    if [[ -f "$SCRIPT_DIR/transform-for-antigravity.py" ]]; then
        use_python=true
    fi

    for skill_file in "$CANONICAL_SOURCE"/*.md; do
        if [[ ! -f "$skill_file" ]]; then
            continue
        fi

        local skill_name
        skill_name=$(basename "$skill_file" .md)
        local target_skill_dir="$target_dir/$skill_name"
        local target_file="$target_skill_dir/SKILL.md"

        # Check if target exists
        if [[ -f "$target_file" && "$FORCE" == false ]]; then
            increment_counter "SKIPPED" "antigravity"
            verbose_log "SKIP" "$skill_name (exists)"
            continue
        fi

        if [[ "$DRY_RUN" == true ]]; then
            log "DRY" "Would transform: $skill_name -> $skill_name/SKILL.md"
        else
            mkdir -p "$target_skill_dir"

            if [[ "$use_python" == true ]]; then
                if python3 "$SCRIPT_DIR/transform-for-antigravity.py" --input "$skill_file" --output "$target_file" 2>/dev/null; then
                    increment_counter "TRANSFORMED" "antigravity"
                else
                    # Fallback to direct copy on error
                    cp "$skill_file" "$target_file"
                fi
            else
                # Fallback: direct copy
                cp "$skill_file" "$target_file"
            fi
            verbose_log "SYNC" "$skill_name"
        fi

        increment_counter "SYNCED" "antigravity"
    done
}

# Sync to specific platform
sync_platform() {
    local platform="$1"
    local format
    format=$(get_platform_format "$platform")

    case "$platform" in
        "cursor")
            sync_to_cursor
            ;;
        "antigravity")
            sync_to_antigravity
            ;;
        *)
            sync_direct "$platform"
            ;;
    esac
}

# Print summary
print_summary() {
    echo ""
    echo -e "${BOLD}======================================================================${NC}"
    echo -e "${BOLD}                         SYNC SUMMARY                                ${NC}"
    echo -e "${BOLD}======================================================================${NC}"
    echo ""

    printf "%-15s %10s %10s %12s %10s\n" "Platform" "Synced" "Skipped" "Transformed" "Errors"
    printf "%-15s %10s %10s %12s %10s\n" "---------------" "----------" "----------" "------------" "----------"

    local total_synced=0
    local total_skipped=0
    local total_transformed=0
    local total_errors=0

    for platform in $PLATFORMS; do
        if [[ -n "$TARGET_PLATFORM" && "$TARGET_PLATFORM" != "$platform" ]]; then
            continue
        fi

        local synced skipped transformed errors
        synced=$(get_counter "SYNCED" "$platform")
        skipped=$(get_counter "SKIPPED" "$platform")
        transformed=$(get_counter "TRANSFORMED" "$platform")
        errors=$(get_counter "ERRORS" "$platform")

        printf "%-15s %10d %10d %12d %10d\n" \
            "$platform" \
            "$synced" \
            "$skipped" \
            "$transformed" \
            "$errors"

        total_synced=$((total_synced + synced))
        total_skipped=$((total_skipped + skipped))
        total_transformed=$((total_transformed + transformed))
        total_errors=$((total_errors + errors))
    done

    printf "%-15s %10s %10s %12s %10s\n" "---------------" "----------" "----------" "------------" "----------"
    printf "%-15s %10d %10d %12d %10d\n" "TOTAL" "$total_synced" "$total_skipped" "$total_transformed" "$total_errors"

    echo ""

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${CYAN}[DRY-RUN] No files were modified${NC}"
    else
        echo -e "${GREEN}Sync complete!${NC}"
    fi

    # Return error code if any errors occurred
    if [[ $total_errors -gt 0 ]]; then
        return 1
    fi
    return 0
}

# --- Main ---

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --platform)
                TARGET_PLATFORM="$2"
                if ! is_valid_platform "$TARGET_PLATFORM"; then
                    echo -e "${RED}Error: Unknown platform '$TARGET_PLATFORM'${NC}"
                    echo "Valid platforms: opencode, cursor, factory, antigravity"
                    exit 1
                fi
                shift 2
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                print_usage
                exit 0
                ;;
            *)
                echo -e "${RED}Error: Unknown option '$1'${NC}"
                print_usage
                exit 1
                ;;
        esac
    done

    print_header

    # Verify source directory exists
    if [[ ! -d "$CANONICAL_SOURCE" ]]; then
        log "ERROR" "Canonical source not found: $CANONICAL_SOURCE"
        exit 1
    fi

    # Count source skills
    local source_count
    source_count=$(find "$CANONICAL_SOURCE" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    log "INFO" "Canonical source: $CANONICAL_SOURCE"
    log "INFO" "Skills to sync: ${BOLD}$source_count${NC}"

    if [[ "$DRY_RUN" == true ]]; then
        log "WARN" "DRY-RUN mode enabled - no changes will be made"
    fi

    if [[ "$FORCE" == true ]]; then
        log "WARN" "FORCE mode enabled - existing files will be overwritten"
    fi

    echo ""

    # Check for Python scripts
    check_python_scripts

    echo ""

    # Sync to platforms
    if [[ -n "$TARGET_PLATFORM" ]]; then
        sync_platform "$TARGET_PLATFORM"
    else
        for platform in $PLATFORMS; do
            sync_platform "$platform"
            echo ""
        done
    fi

    # Print summary
    print_summary
}

main "$@"
