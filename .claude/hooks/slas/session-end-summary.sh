#!/bin/bash
# Session End Summary Hook
# Logs minimal session metadata when a session ends
# Note: For rich context capture, use /sigma-exit skill before ending

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SESSIONS_DIR="$PROJECT_DIR/docs/sessions"
LOGS_DIR="$SESSIONS_DIR/logs"
METADATA_FILE="$SESSIONS_DIR/session-metadata.jsonl"

# Ensure directories exist
mkdir -p "$LOGS_DIR"
mkdir -p "$(dirname "$METADATA_FILE")"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date +%Y-%m-%d)

# Generate session ID
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)-$$}"

# Get git info
GIT_BRANCH=""
GIT_COMMIT=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "")
fi

# Count files changed in session (if git available)
FILES_CHANGED=0
if [[ -n "$GIT_BRANCH" ]]; then
    FILES_CHANGED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
fi

# Create metadata entry
METADATA=$(cat <<EOF
{"session_id":"$SESSION_ID","timestamp":"$TIMESTAMP","branch":"$GIT_BRANCH","commit":"$GIT_COMMIT","files_changed":$FILES_CHANGED,"project":"$(basename "$PROJECT_DIR")"}
EOF
)

# Append to JSONL file
echo "$METADATA" >> "$METADATA_FILE"

# Output reminder for rich capture
echo ""
echo "---"
echo "Session metadata logged."
echo ""
echo "For rich session context, run /sigma-exit before ending your session."
echo "This captures accomplishments, decisions, and patterns for future sessions."
echo "---"
