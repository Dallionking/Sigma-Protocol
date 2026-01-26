#!/usr/bin/env bash
# =============================================================================
# Generate Skill Matrix
# =============================================================================
# Scans skill directories and generates a categorized markdown table
# for inclusion in CLAUDE.md swarm-first section.
#
# Usage:
#   ./scripts/generate-skill-matrix.sh [skills-dir]
#   ./scripts/generate-skill-matrix.sh .claude/skills
#
# Output: Markdown tables grouped by category with emoji headers
# =============================================================================

set -eo pipefail

# Default skills directory
SKILLS_DIR="${1:-.claude/skills}"

# Temporary files for each category
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Category definitions (order matters for output)
CATEGORIES="frontend backend architecture testing security devops research mobile ai marketing workflow documentation uncategorized"

# Get emoji for category
get_emoji() {
    case "$1" in
        frontend) echo "🎨" ;;
        backend) echo "⚙️" ;;
        testing) echo "🧪" ;;
        research) echo "🔍" ;;
        devops) echo "🚀" ;;
        architecture) echo "🏛️" ;;
        marketing) echo "📢" ;;
        security) echo "🔒" ;;
        mobile) echo "📱" ;;
        ai) echo "🤖" ;;
        workflow) echo "📋" ;;
        documentation) echo "📚" ;;
        *) echo "📦" ;;
    esac
}

# Get display name for category
get_display_name() {
    case "$1" in
        frontend) echo "Frontend & UI" ;;
        backend) echo "Backend & API" ;;
        testing) echo "Testing & QA" ;;
        research) echo "Research & Investigation" ;;
        devops) echo "DevOps & Deployment" ;;
        architecture) echo "Architecture & Design" ;;
        marketing) echo "Marketing & Copy" ;;
        security) echo "Security & Compliance" ;;
        mobile) echo "Mobile Development" ;;
        ai) echo "AI & Agents" ;;
        workflow) echo "Workflow & Process" ;;
        documentation) echo "Documentation" ;;
        *) echo "Other Skills" ;;
    esac
}

# Keywords to auto-detect category if not specified in frontmatter
detect_category_from_keywords() {
    local skill_name="$1"
    local description="$2"
    local content="$skill_name $description"
    content=$(echo "$content" | tr '[:upper:]' '[:lower:]')

    # Frontend detection
    if echo "$content" | grep -qE 'frontend|ui|ux|react|component|tailwind|css|design|layout|typography|shadcn|responsive'; then
        echo "frontend"
        return
    fi

    # Backend detection
    if echo "$content" | grep -qE 'backend|api|server|endpoint|database|postgres|supabase|drizzle|prisma|action'; then
        echo "backend"
        return
    fi

    # Testing detection
    if echo "$content" | grep -qE 'test|qa|quality|debug|verification|coverage|validation|vitest|jest|playwright'; then
        echo "testing"
        return
    fi

    # Research detection
    if echo "$content" | grep -qE 'research|search|investigate|find|explore|analyze|documentation'; then
        echo "research"
        return
    fi

    # DevOps detection
    if echo "$content" | grep -qE 'deploy|ci|cd|docker|kubernetes|pipeline|vercel|infrastructure'; then
        echo "devops"
        return
    fi

    # Architecture detection
    if echo "$content" | grep -qE 'architect|system|pattern|scalab|structure|monorepo'; then
        echo "architecture"
        return
    fi

    # Marketing detection
    if echo "$content" | grep -qE 'marketing|copy|brand|content|seo|email|campaign|landing|hormozi'; then
        echo "marketing"
        return
    fi

    # Security detection
    if echo "$content" | grep -qE 'security|auth|permission|vulnerability|audit|compliance|owasp|fuzz'; then
        echo "security"
        return
    fi

    # Mobile detection
    if echo "$content" | grep -qE 'mobile|ios|android|swift|kotlin|expo|react.native'; then
        echo "mobile"
        return
    fi

    # AI/Agent detection
    if echo "$content" | grep -qE 'agent|ai|llm|prompt|mcp|swarm|orchestrat'; then
        echo "ai"
        return
    fi

    # Workflow detection
    if echo "$content" | grep -qE 'workflow|process|plan|brainstorm|step|loop|stream'; then
        echo "workflow"
        return
    fi

    echo "uncategorized"
}

# Extract frontmatter field value
extract_frontmatter_field() {
    local file="$1"
    local field="$2"

    # Extract value between --- markers
    sed -n '/^---$/,/^---$/p' "$file" 2>/dev/null | grep -E "^${field}:" | sed "s/^${field}:[[:space:]]*//" | sed 's/^["'"'"']//' | sed 's/["'"'"']$//' | head -1
}

# Extract description from frontmatter (handles multiline)
extract_description() {
    local file="$1"
    local desc=$(extract_frontmatter_field "$file" "description")
    # Truncate to first sentence or 80 chars for table display
    # Note: Using tr for special chars since sed brackets treat \r\n as literals
    echo "$desc" | head -1 | cut -c1-80 | tr -d '"\r\n' | sed 's/|/\\|/g'
}

# Add skill to category file
add_skill_to_category() {
    local category="$1"
    local name="$2"
    local description="$3"

    echo "${name}|${description}" >> "$TEMP_DIR/${category}.txt"
}

# Scan skills directory
scan_skills() {
    local dir="$1"

    if [[ ! -d "$dir" ]]; then
        echo "Error: Skills directory not found: $dir" >&2
        exit 1
    fi

    # Initialize category files
    for cat in $CATEGORIES; do
        touch "$TEMP_DIR/${cat}.txt"
    done

    # Scan flat files (*.md)
    for skill_file in "$dir"/*.md; do
        [[ -f "$skill_file" ]] || continue

        local filename=$(basename "$skill_file" .md)

        # Skip SKILL.md files (directory format)
        [[ "$filename" == "SKILL" ]] && continue

        # Extract frontmatter fields
        local name=$(extract_frontmatter_field "$skill_file" "name")
        [[ -z "$name" ]] && name="$filename"

        local description=$(extract_description "$skill_file")
        local category=$(extract_frontmatter_field "$skill_file" "category")

        # Auto-detect category if not specified
        if [[ -z "$category" ]]; then
            category=$(detect_category_from_keywords "$name" "$description")
        fi

        # Normalize category to lowercase
        category=$(echo "$category" | tr '[:upper:]' '[:lower:]')

        # Validate category
        if ! echo "$CATEGORIES" | grep -qw "$category"; then
            category="uncategorized"
        fi

        add_skill_to_category "$category" "$name" "$description"
    done

    # Also scan directory-style skills (skill-name/SKILL.md)
    for skill_dir in "$dir"/*/; do
        [[ -d "$skill_dir" ]] || continue

        local skill_file="$skill_dir/SKILL.md"
        [[ -f "$skill_file" ]] || continue

        local dirname=$(basename "$skill_dir")
        local name=$(extract_frontmatter_field "$skill_file" "name")
        [[ -z "$name" ]] && name="$dirname"

        local description=$(extract_description "$skill_file")
        local category=$(extract_frontmatter_field "$skill_file" "category")

        if [[ -z "$category" ]]; then
            category=$(detect_category_from_keywords "$name" "$description")
        fi

        category=$(echo "$category" | tr '[:upper:]' '[:lower:]')

        if ! echo "$CATEGORIES" | grep -qw "$category"; then
            category="uncategorized"
        fi

        add_skill_to_category "$category" "$name" "$description"
    done
}

# Generate markdown output
generate_markdown() {
    local total_skills=0
    local category_count=0

    # Count total skills and non-empty categories
    for category in $CATEGORIES; do
        if [[ -s "$TEMP_DIR/${category}.txt" ]]; then
            local count=$(wc -l < "$TEMP_DIR/${category}.txt" | tr -d ' ')
            total_skills=$((total_skills + count))
            category_count=$((category_count + 1))
        fi
    done

    echo "<!-- Auto-generated by scripts/generate-skill-matrix.sh -->"
    echo "<!-- Total: $total_skills skills across $category_count categories -->"
    echo ""

    # Output each category
    for category in $CATEGORIES; do
        [[ -s "$TEMP_DIR/${category}.txt" ]] || continue

        local emoji=$(get_emoji "$category")
        local display_name=$(get_display_name "$category")
        local skill_count=$(wc -l < "$TEMP_DIR/${category}.txt" | tr -d ' ')

        echo "### ${emoji} ${display_name} (${skill_count} skills)"
        echo ""
        echo "| Skill | Use When |"
        echo "|-------|----------|"

        # Sort skills alphabetically within category
        sort "$TEMP_DIR/${category}.txt" | while IFS='|' read -r skill_name skill_desc; do
            [[ -z "$skill_name" ]] && continue
            echo "| \`@$skill_name\` | $skill_desc |"
        done

        echo ""
    done
}

# Main
main() {
    scan_skills "$SKILLS_DIR"
    generate_markdown
}

main
