#!/bin/bash
# =============================================================================
# Sigma Protocol Setup Hook (Claude Code v2.1.10+)
# =============================================================================
# Triggered by: claude --init, claude --init-only, claude --maintenance
# Verifies environment and dependencies are ready for Sigma workflow.
# =============================================================================

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

errors=0
warnings=0

# Check required directories
for dir in ".claude/commands" ".claude/skills" "docs"; do
    if [[ ! -d "$PROJECT_DIR/$dir" ]]; then
        echo "ERROR: Missing directory: $dir" >&2
        ((errors++))
    fi
done

# Check CLAUDE.md exists
if [[ ! -f "$PROJECT_DIR/CLAUDE.md" ]]; then
    echo "ERROR: CLAUDE.md not found" >&2
    ((errors++))
fi

# Check platform versions tracking
if [[ ! -f "$PROJECT_DIR/docs/.platform-versions.json" ]]; then
    echo "WARNING: docs/.platform-versions.json missing — run /platform-sync" >&2
    ((warnings++))
fi

# Check for required CLI tools
for cmd in jq git node; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "WARNING: $cmd not found in PATH" >&2
        ((warnings++))
    fi
done

# Check Claude Code version
CLAUDE_VERSION=$(claude --version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if [[ -n "$CLAUDE_VERSION" ]]; then
    echo "Claude Code v$CLAUDE_VERSION detected"
else
    echo "WARNING: Could not detect Claude Code version" >&2
    ((warnings++))
fi

# Check Agent Teams prerequisites
USER_SETTINGS="$HOME/.claude/settings.json"
if [[ -f "$USER_SETTINGS" ]]; then
    # Check if teammateMode is configured
    TEAMMATE_MODE=$(jq -r '.teammateMode // empty' "$USER_SETTINGS" 2>/dev/null)
    if [[ -z "$TEAMMATE_MODE" ]]; then
        echo "TIP: Agent Teams works best with split panes. Add to ~/.claude/settings.json:" >&2
        echo '  "teammateMode": "tmux"' >&2
        ((warnings++))
    else
        echo "Agent Teams teammate mode: $TEAMMATE_MODE"
    fi
else
    echo "TIP: Create ~/.claude/settings.json with '\"teammateMode\": \"tmux\"' for Agent Teams split panes" >&2
    ((warnings++))
fi

# Check tmux availability (needed for split pane mode)
if ! command -v tmux &>/dev/null; then
    echo "TIP: Install tmux for Agent Teams split pane view (brew install tmux)" >&2
fi

# Summary
if [[ $errors -gt 0 ]]; then
    echo "Setup check: $errors error(s), $warnings warning(s)" >&2
    exit 1
fi

echo "Setup check passed ($warnings warning(s))"
exit 0
