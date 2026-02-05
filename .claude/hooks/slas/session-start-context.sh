#!/bin/bash
# Session Start Context Hook
# Injects context from previous sessions into new Claude sessions

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SESSIONS_DIR="$PROJECT_DIR/docs/sessions"
LOGS_DIR="$SESSIONS_DIR/logs"
PREFS_FILE="$SESSIONS_DIR/preferences/developer-profile.yaml"
PATTERNS_FILE="$SESSIONS_DIR/patterns/detected-patterns.json"

# Get current date
TODAY=$(date +%Y-%m-%d)

# Create session context output
echo "<session-context>"

# 1. Developer Preferences (if exists)
if [[ -f "$PREFS_FILE" ]]; then
    echo ""
    echo "## Developer Preferences"
    echo "\`\`\`yaml"
    head -50 "$PREFS_FILE"
    echo "\`\`\`"
fi

# 2. Recent Session Summaries (last 3 days)
echo ""
echo "## Recent Sessions"

sessions_found=0
for i in 0 1 2; do
    check_date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "$TODAY - $i days" +%Y-%m-%d 2>/dev/null || echo "")
    if [[ -n "$check_date" && -f "$LOGS_DIR/$check_date.md" ]]; then
        if [[ $sessions_found -eq 0 ]]; then
            echo ""
        fi
        echo "### $check_date"
        # Extract executive summary and next session recommendations
        awk '
            /^## Executive Summary/,/^## / { if (!/^## [^E]/) print }
            /^## Next Session Recommendations/,/^## / { if (!/^## [^N]/) print }
            /^## Work in Progress/,/^## / { if (!/^## [^W]/) print }
        ' "$LOGS_DIR/$check_date.md" | head -30
        echo ""
        sessions_found=$((sessions_found + 1))
    fi
done

if [[ $sessions_found -eq 0 ]]; then
    echo "_No recent sessions found. This appears to be a new project or first session._"
fi

# 3. Git State
echo ""
echo "## Current Git State"
if git rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    last_commit=$(git log -1 --oneline 2>/dev/null || echo "no commits")
    uncommitted=$(git status --short 2>/dev/null | wc -l | tr -d ' ')

    echo "- **Branch**: $branch"
    echo "- **Last Commit**: $last_commit"
    echo "- **Uncommitted Files**: $uncommitted"
else
    echo "_Not a git repository_"
fi

# 4. Pending Work Items (from WIP in recent sessions)
if [[ -f "$LOGS_DIR/$TODAY.md" ]]; then
    wip=$(awk '/^## Work in Progress/,/^## / { if (!/^## /) print }' "$LOGS_DIR/$TODAY.md" | grep -E '^\s*-\s*\[' | head -5)
    if [[ -n "$wip" ]]; then
        echo ""
        echo "## Pending Work Items"
        echo "$wip"
    fi
fi

# 5. Key Reminders from Patterns
if [[ -f "$PATTERNS_FILE" ]]; then
    # Extract frustration triggers to avoid
    triggers=$(python3 -c "
import json
import sys
try:
    with open('$PATTERNS_FILE', 'r') as f:
        data = json.load(f)
    triggers = data.get('patterns', {}).get('frustration_triggers', [])
    for t in triggers[:3]:
        print(f\"- Avoid: {t.get('trigger', 'unknown')}\")
except:
    pass
" 2>/dev/null || true)

    if [[ -n "$triggers" ]]; then
        echo ""
        echo "## Key Reminders"
        echo "$triggers"
    fi
fi

echo ""
echo "</session-context>"
