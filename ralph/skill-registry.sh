#!/bin/bash
# =============================================================================
# Ralph Skill Registry v2.1 - Dynamic Skill Matching System
# =============================================================================
# Builds a comprehensive registry of all available skills by parsing frontmatter
# from skill files, then dynamically matches skills to stories based on:
#   - Story title, description, and content keywords
#   - Task ID prefixes (UI-*, API-*, DB-*, TEST-*)
#   - File paths being modified
#   - Story tags (complexity, module, feature)
#   - Skill triggers defined in frontmatter
#
# This enables Ralph workers to leverage ALL 260+ installed skills dynamically
# rather than relying on a hardcoded static list.
#
# Usage:
#   source skill-registry.sh
#   build_skill_registry "/path/to/project"
#   matched_skills=$(get_matching_skills "$story_json")
#   skill_section=$(generate_skill_injection "$story_json")
# =============================================================================

# Skill Registry Data (built by build_skill_registry)
# Format: JSON file at $SKILL_REGISTRY_PATH
SKILL_REGISTRY_PATH=""
SKILL_REGISTRY_LOADED=false

# =============================================================================
# Build Skill Registry
# =============================================================================
# Scans .claude/skills/ and src/skills/ directories, parses frontmatter from
# each skill file to extract name, description, and triggers.
#
# Creates a JSON registry file for efficient querying.
#
# Args:
#   $1 - Project/workspace directory
#   $2 - (Optional) Sigma Protocol root directory
# =============================================================================
build_skill_registry() {
    local project_dir="$1"
    local sigma_root="${2:-}"

    # Create temp file for registry
    SKILL_REGISTRY_PATH=$(mktemp /tmp/ralph-skill-registry.XXXXXX.json)

    local skills_found=0
    local all_skills=""
    local seen_skills=""

    # Collect skills from multiple locations
    local skill_dirs=(
        "$project_dir/.claude/skills"
        "$project_dir/src/skills"
        # Platform skill directories (148+ Claude Code, 149+ OpenCode)
        "$project_dir/platforms/claude-code/skills"
        "$project_dir/platforms/opencode/skill"
        # Package skill directories
        "$project_dir/packages/sigma-harness/skills"
        "$project_dir/packages/sigma-protocol-plugin/skills"
    )

    # Add Sigma root if provided (for external projects using Sigma)
    if [[ -n "$sigma_root" ]]; then
        [[ -d "$sigma_root/src/skills" ]] && skill_dirs+=("$sigma_root/src/skills")
        [[ -d "$sigma_root/platforms/claude-code/skills" ]] && skill_dirs+=("$sigma_root/platforms/claude-code/skills")
        [[ -d "$sigma_root/platforms/opencode/skill" ]] && skill_dirs+=("$sigma_root/platforms/opencode/skill")
    fi

    # Parse all skill files
    for skills_dir in "${skill_dirs[@]}"; do
        [[ ! -d "$skills_dir" ]] && continue

        # Find skill files (both flat .md and SKILL.md in subdirs)
        while IFS= read -r skill_file; do
            [[ -z "$skill_file" ]] && continue
            [[ ! -f "$skill_file" ]] && continue

            # Parse the skill file
            local skill_name=""
            local description=""
            local triggers=""
            local in_frontmatter=false
            local in_triggers=false

            while IFS= read -r line || [[ -n "$line" ]]; do
                # Detect frontmatter boundaries
                if [[ "$line" == "---" ]]; then
                    if [[ "$in_frontmatter" == true ]]; then
                        break  # End of frontmatter
                    else
                        in_frontmatter=true
                        continue
                    fi
                fi

                if [[ "$in_frontmatter" == true ]]; then
                    # Extract name (handle both quoted and unquoted)
                    if [[ "$line" == name:* ]]; then
                        skill_name="${line#name:}"
                        skill_name="${skill_name# }"
                        skill_name="${skill_name#\"}"
                        skill_name="${skill_name#\'}"
                        skill_name="${skill_name%\"}"
                        skill_name="${skill_name%\'}"
                        skill_name="${skill_name% }"
                    fi

                    # Extract description
                    if [[ "$line" == description:* ]]; then
                        description="${line#description:}"
                        description="${description# }"
                        description="${description#\"}"
                        description="${description#\'}"
                        description="${description%\"}"
                        description="${description%\'}"
                        description="${description% }"
                    fi

                    # Handle triggers (YAML array)
                    if [[ "$line" == triggers:* ]]; then
                        in_triggers=true
                        continue
                    fi

                    if [[ "$in_triggers" == true ]]; then
                        if [[ "$line" == "  - "* ]] || [[ "$line" == "- "* ]]; then
                            local trigger="${line#*- }"
                            trigger="${trigger# }"
                            trigger="${trigger% }"
                            trigger="${trigger#\"}"
                            trigger="${trigger#\'}"
                            trigger="${trigger%\"}"
                            trigger="${trigger%\'}"
                            if [[ -n "$triggers" ]]; then
                                triggers="$triggers,$trigger"
                            else
                                triggers="$trigger"
                            fi
                        elif [[ "$line" != "" ]] && [[ "$line" != "  "* ]]; then
                            in_triggers=false
                        fi
                    fi
                fi
            done < "$skill_file"

            # Fallback to filename if no name in frontmatter
            if [[ -z "$skill_name" ]]; then
                skill_name=$(basename "$skill_file" .md)
                skill_name="${skill_name%/SKILL}"
            fi

            # Skip internal/Ralph-specific skills
            case "$skill_name" in
                ralph-loop|ralph-tail|fork-worker|orchestrator-admin|SKILL)
                    continue
                    ;;
            esac

            # Skip if already seen
            if [[ "$seen_skills" == *"|$skill_name|"* ]]; then
                continue
            fi
            seen_skills="$seen_skills|$skill_name|"

            # Escape JSON strings
            description="${description//\\/\\\\}"
            description="${description//\"/\\\"}"
            skill_name="${skill_name//\\/\\\\}"
            skill_name="${skill_name//\"/\\\"}"

            # Build JSON
            local skill_json="{\"name\":\"$skill_name\",\"description\":\"$description\",\"triggers\":\"$triggers\"}"

            if [[ -n "$all_skills" ]]; then
                all_skills="$all_skills,$skill_json"
            else
                all_skills="$skill_json"
            fi

            ((skills_found++)) || true

        done < <(find "$skills_dir" \( -name "*.md" \) -type f 2>/dev/null | grep -v "/worktrees/" | grep -v "/forks/")
    done

    # Write registry
    echo "{\"skills\":[$all_skills],\"count\":$skills_found,\"builtAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$SKILL_REGISTRY_PATH"

    SKILL_REGISTRY_LOADED=true
    echo "Skill registry built: $skills_found skills" >&2
}

# =============================================================================
# Get Matching Skills for Story
# =============================================================================
# Analyzes story content and returns skills whose triggers match.
#
# Matching strategy (scored):
#   1. Direct trigger match in story content (+10 points)
#   2. Task ID prefix match (+8 points)
#   3. File path pattern match (+6 points)
#   4. Keyword in title/description (+4 points)
#   5. Complexity-based recommendation (+3 points)
#
# Args:
#   $1 - Story JSON
#
# Returns:
#   JSON array of matching skills with scores
# =============================================================================
get_matching_skills() {
    local story_json="$1"

    if [[ "$SKILL_REGISTRY_LOADED" != true ]] || [[ ! -f "$SKILL_REGISTRY_PATH" ]]; then
        echo "[]"
        return
    fi

    # Extract story content for matching
    local title=$(echo "$story_json" | jq -r '.title // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')
    local description=$(echo "$story_json" | jq -r '.description // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')
    local complexity=$(echo "$story_json" | jq -r '.tags.complexity // ""' 2>/dev/null)
    local estimated=$(echo "$story_json" | jq -r '.estimatedIterations // 1' 2>/dev/null)

    # Get task IDs and file paths
    local task_ids=$(echo "$story_json" | jq -r '.tasks[]?.id // empty' 2>/dev/null | tr '\n' ' ')
    local file_paths=$(echo "$story_json" | jq -r '.tasks[]?.filePath // empty' 2>/dev/null | tr '\n' ' ')

    # Combine all searchable content
    local content="$title $description $task_ids $file_paths"
    content=$(echo "$content" | tr '[:upper:]' '[:lower:]')

    # Build matched skills array with scoring
    local matched="["
    local first=true

    # Read skills from registry
    while IFS= read -r skill_line; do
        [[ -z "$skill_line" ]] && continue

        local name=$(echo "$skill_line" | jq -r '.name' 2>/dev/null)
        local desc=$(echo "$skill_line" | jq -r '.description' 2>/dev/null)
        local triggers=$(echo "$skill_line" | jq -r '.triggers' 2>/dev/null)

        [[ -z "$name" ]] && continue

        local score=0

        # 1. Check trigger matches (compatible with both bash and zsh)
        if [[ -n "$triggers" ]]; then
            # Use IFS-based parsing instead of read -a for shell compatibility
            local OLD_IFS="$IFS"
            IFS=','
            for trigger in $triggers; do
                trigger=$(echo "$trigger" | tr '[:upper:]' '[:lower:]' | xargs 2>/dev/null || echo "$trigger")
                if [[ -n "$trigger" ]] && [[ "$content" == *"$trigger"* ]]; then
                    ((score += 10)) || true
                fi
            done
            IFS="$OLD_IFS"
        fi

        # 2. Task ID prefix matching
        case "$name" in
            frontend-design|ux-designer|react-performance|web-artifacts-builder)
                if [[ "$task_ids" == *"UI-"* ]]; then
                    ((score += 8)) || true
                fi
                ;;
            api-design-principles|architecture-patterns)
                if [[ "$task_ids" == *"API-"* ]]; then
                    ((score += 8)) || true
                fi
                ;;
            senior-qa|bdd-scenarios)
                if [[ "$task_ids" == *"TEST-"* ]] || [[ "$task_ids" == *"VERIFY-"* ]]; then
                    ((score += 8)) || true
                fi
                ;;
        esac

        # 3. File path pattern matching
        if [[ "$file_paths" == *.tsx* ]] || [[ "$file_paths" == *.jsx* ]]; then
            case "$name" in
                frontend-design|react-performance|web-artifacts-builder)
                    ((score += 6)) || true
                    ;;
            esac
        fi

        if [[ "$file_paths" == *route* ]] || [[ "$file_paths" == *api* ]] || [[ "$file_paths" == *endpoint* ]]; then
            case "$name" in
                api-design-principles)
                    ((score += 6)) || true
                    ;;
            esac
        fi

        if [[ "$file_paths" == *test* ]] || [[ "$file_paths" == *spec* ]]; then
            case "$name" in
                senior-qa|bdd-scenarios)
                    ((score += 6)) || true
                    ;;
            esac
        fi

        # 4. Complexity-based recommendations
        if [[ "$complexity" == "complex" ]] || [[ "${estimated:-1}" -gt 2 ]]; then
            case "$name" in
                senior-architect|architecture-patterns|brainstorming)
                    ((score += 3)) || true
                    ;;
            esac
        fi

        # 5. Keyword matching in title/description
        case "$name" in
            frontend-design)
                # UI-related keywords that should trigger frontend-design
                [[ "$content" == *component* ]] || [[ "$content" == *layout* ]] || [[ "$content" == *page* ]] || \
                [[ "$content" == *screen* ]] || [[ "$content" == *tab* ]] || [[ "$content" == *modal* ]] || \
                [[ "$content" == *form* ]] || [[ "$content" == *button* ]] || [[ "$content" == *card* ]] || \
                [[ "$content" == *list* ]] || [[ "$content" == *table* ]] || [[ "$content" == *grid* ]] || \
                [[ "$content" == *header* ]] || [[ "$content" == *footer* ]] || [[ "$content" == *sidebar* ]] || \
                [[ "$content" == *navigation* ]] || [[ "$content" == *menu* ]] || [[ "$content" == *panel* ]] || \
                [[ "$content" == *section* ]] || [[ "$content" == *ui* ]] && ((score += 4)) || true
                ;;
            ux-designer)
                [[ "$content" == *flow* ]] || [[ "$content" == *journey* ]] || [[ "$content" == *wireframe* ]] || \
                [[ "$content" == *user* ]] || [[ "$content" == *experience* ]] || [[ "$content" == *interaction* ]] && ((score += 4)) || true
                ;;
            react-performance)
                [[ "$content" == *react* ]] || [[ "$content" == *performance* ]] || [[ "$content" == *render* ]] || \
                [[ "$content" == *slow* ]] || [[ "$content" == *optimization* ]] || [[ "$content" == *memo* ]] && ((score += 4)) || true
                ;;
            web-artifacts-builder)
                [[ "$content" == *dashboard* ]] || [[ "$content" == *multi* ]] || [[ "$content" == *complex* ]] || \
                [[ "$content" == *interactive* ]] || [[ "$content" == *board* ]] && ((score += 4)) || true
                ;;
            hormozi-frameworks)
                [[ "$content" == *offer* ]] || [[ "$content" == *value* ]] || [[ "$content" == *pricing* ]] && ((score += 4)) || true
                ;;
            brand-voice)
                [[ "$content" == *brand* ]] || [[ "$content" == *voice* ]] || [[ "$content" == *tone* ]] && ((score += 4)) || true
                ;;
            direct-response-copy)
                [[ "$content" == *copy* ]] || [[ "$content" == *landing* ]] || [[ "$content" == *conversion* ]] && ((score += 4)) || true
                ;;
            systematic-debugging)
                [[ "$content" == *bug* ]] || [[ "$content" == *fix* ]] || [[ "$content" == *error* ]] || [[ "$content" == *debug* ]] && ((score += 4)) || true
                ;;
            research)
                [[ "$content" == *research* ]] || [[ "$content" == *investigate* ]] || [[ "$content" == *explore* ]] && ((score += 4)) || true
                ;;
            memory-systems)
                [[ "$content" == *memory* ]] || [[ "$content" == *persist* ]] || [[ "$content" == *context* ]] && ((score += 4)) || true
                ;;
            monorepo-architecture)
                [[ "$content" == *monorepo* ]] || [[ "$content" == *workspace* ]] || [[ "$content" == *turborepo* ]] && ((score += 4)) || true
                ;;
            pdf-manipulation)
                [[ "$content" == *pdf* ]] && ((score += 4)) || true
                ;;
            xlsx)
                [[ "$content" == *excel* ]] || [[ "$content" == *spreadsheet* ]] || [[ "$content" == *xlsx* ]] && ((score += 4)) || true
                ;;
            pptx)
                [[ "$content" == *presentation* ]] || [[ "$content" == *powerpoint* ]] || [[ "$content" == *slide* ]] && ((score += 4)) || true
                ;;
            docx-generation)
                [[ "$content" == *document* ]] || [[ "$content" == *word* ]] || [[ "$content" == *docx* ]] && ((score += 4)) || true
                ;;
            video-hooks)
                [[ "$content" == *video* ]] || [[ "$content" == *youtube* ]] && ((score += 4)) || true
                ;;
            quality-gates)
                [[ "$content" == *ci* ]] || [[ "$content" == *pipeline* ]] || [[ "$content" == *deploy* ]] && ((score += 4)) || true
                ;;
            verification|specialized-validation)
                [[ "$content" == *verify* ]] || [[ "$content" == *validate* ]] && ((score += 4)) || true
                ;;
            browser-verification|agent-browser-validation)
                [[ "$content" == *browser* ]] || [[ "$content" == *e2e* ]] || [[ "$content" == *playwright* ]] && ((score += 4)) || true
                ;;
            prompt-engineering-patterns)
                [[ "$content" == *prompt* ]] || [[ "$content" == *llm* ]] && ((score += 4)) || true
                ;;
            agentic-coding)
                [[ "$content" == *agent* ]] || [[ "$content" == *autonomous* ]] && ((score += 4)) || true
                ;;
        esac

        # Only include if score > 0
        if [[ $score -gt 0 ]]; then
            # Truncate description
            if [[ ${#desc} -gt 80 ]]; then
                desc="${desc:0:77}..."
            fi

            if [[ "$first" == true ]]; then
                first=false
            else
                matched="$matched,"
            fi

            matched="$matched{\"name\":\"$name\",\"score\":$score,\"description\":\"$desc\"}"
        fi

    done < <(jq -c '.skills[]' "$SKILL_REGISTRY_PATH" 2>/dev/null)

    matched="$matched]"

    # Sort by score descending and limit to top 8
    echo "$matched" | jq -c 'sort_by(-.score) | .[0:8]' 2>/dev/null || echo "[]"
}

# =============================================================================
# Generate Skill Injection Section for Worker Prompt
# =============================================================================
# Creates a formatted markdown section listing recommended skills for a story,
# sorted by relevance score.
#
# Args:
#   $1 - Story JSON
#
# Returns:
#   Formatted markdown section for injection into worker prompt
# =============================================================================
generate_skill_injection() {
    local story_json="$1"
    local matched_json=$(get_matching_skills "$story_json")

    # Check if any skills matched
    local count=$(echo "$matched_json" | jq 'length' 2>/dev/null || echo "0")

    if [[ "$count" == "0" ]] || [[ -z "$matched_json" ]] || [[ "$matched_json" == "[]" ]]; then
        return
    fi

    cat << 'HEADER'

## 🛠️ Recommended Skills for This Story

Based on this story's content, these skills can provide specialized guidance:

| Skill | Relevance | Purpose |
|-------|-----------|---------|
HEADER

    # Output each skill as a table row
    echo "$matched_json" | jq -r '.[] | "| `@\(.name)` | \(.score) pts | \(.description) |"' 2>/dev/null

    cat << 'FOOTER'

**How to use:** Type `@skill-name` to invoke a skill for domain expertise.
Higher relevance scores indicate better fit for this story's tasks.

FOOTER
}

# =============================================================================
# Get Registry Summary (for debugging)
# =============================================================================
get_registry_summary() {
    if [[ "$SKILL_REGISTRY_LOADED" != true ]] || [[ ! -f "$SKILL_REGISTRY_PATH" ]]; then
        echo "Registry not loaded"
        return
    fi

    echo "=== Skill Registry Summary ==="
    jq -r '"Total skills: \(.count)"' "$SKILL_REGISTRY_PATH" 2>/dev/null || echo "Total skills: unknown"
    echo ""
    echo "Skills with triggers:"
    jq -r '.skills[] | select(.triggers != "") | "  - \(.name): \(.triggers)"' "$SKILL_REGISTRY_PATH" 2>/dev/null | head -20
}

# =============================================================================
# Cleanup Registry (call on script exit)
# =============================================================================
cleanup_skill_registry() {
    if [[ -n "$SKILL_REGISTRY_PATH" ]] && [[ -f "$SKILL_REGISTRY_PATH" ]]; then
        rm -f "$SKILL_REGISTRY_PATH"
    fi
}

# Register cleanup on exit
trap cleanup_skill_registry EXIT
