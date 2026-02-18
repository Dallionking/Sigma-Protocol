#!/bin/bash
# =============================================================================
# Ralph Skill Enforcement PreToolUse Hook (Claude Code v2.1.17+)
# =============================================================================
# Injects additionalContext when editing UI files to remind workers to use
# the @frontend-design skill. This enforces the skill delegation matrix
# at the tool level, not just in prompts.
#
# Usage: Called automatically by Claude Code PreToolUse hook
# Input: CLAUDE_FILE_PATH environment variable (file being edited)
# Output: JSON with additionalContext to stdout
# =============================================================================

FILE_PATH="${CLAUDE_FILE_PATH:-$1}"

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Get file extension
EXT="${FILE_PATH##*.}"
BASENAME=$(basename "$FILE_PATH")

# Check if this is a UI file that requires @frontend-design
is_ui_file() {
    case "$EXT" in
        tsx|jsx)
            # React/Next.js UI files
            return 0
            ;;
        swift)
            # SwiftUI files (check if contains View or UI pattern)
            if [[ "$BASENAME" == *View* ]] || [[ "$BASENAME" == *Screen* ]] || [[ "$BASENAME" == *Component* ]]; then
                return 0
            fi
            ;;
        vue)
            # Vue components
            return 0
            ;;
        svelte)
            # Svelte components
            return 0
            ;;
    esac
    return 1
}

# Check if file is in a components/UI directory
is_ui_directory() {
    if [[ "$FILE_PATH" == */components/* ]] || \
       [[ "$FILE_PATH" == */views/* ]] || \
       [[ "$FILE_PATH" == */screens/* ]] || \
       [[ "$FILE_PATH" == */ui/* ]] || \
       [[ "$FILE_PATH" == */Components/* ]] || \
       [[ "$FILE_PATH" == */Views/* ]] || \
       [[ "$FILE_PATH" == */Screens/* ]]; then
        return 0
    fi
    return 1
}

# Determine if skill enforcement is needed
if is_ui_file || is_ui_directory; then
    # Output JSON with additionalContext
    cat << 'EOF'
{
  "additionalContext": "## SKILL ENFORCEMENT REMINDER\n\n**This is a UI file.** Before making significant UI changes:\n\n1. Consider using `@frontend-design` skill for UI component work\n2. For design system compliance, check `docs/design/ui-profile.json`\n3. For visual testing after changes, use `@ui-healer` or `agent-browser`\n\nSmall fixes and bug repairs don't require skill invocation, but new components, layouts, or styling changes should leverage specialized skills for best results."
}
EOF
fi

exit 0
