#!/bin/bash
# ============================================================================
# post-edit.sh - Claude Code Post-Edit Hook for Sigma Orchestration
# ============================================================================
# Called after Claude Code edits files - reports progress to orchestrator.
# This hook is triggered by Claude Code's PostToolUse hook system.
#
# Install location: ~/.sigma/hooks/post-edit.sh
#
# Hook configuration in ~/.claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": [
#       {
#         "matcher": "Write|Edit",
#         "hooks": [
#           {
#             "type": "command",
#             "command": "~/.sigma/hooks/post-edit.sh"
#           }
#         ]
#       }
#     ]
#   }
# }
# ============================================================================

set -euo pipefail

# Configuration from environment
STREAM_NAME="${SIGMA_STREAM_NAME:-unknown}"
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
ORCHESTRATION_DIR="$PROJECT_ROOT/.sigma/orchestration"

# Check if we're in orchestration mode
if [ ! -f "$ORCHESTRATION_DIR/active.lock" ]; then
    # Not in orchestration mode, exit silently
    exit 0
fi

# Log file for debugging
LOG_FILE="$ORCHESTRATION_DIR/hooks.log"

# Log function
log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [post-edit] $1" >> "$LOG_FILE"
}

# Get changed files from git
get_changed_files() {
    git -C "$PROJECT_ROOT" diff --name-only HEAD 2>/dev/null || echo ""
}

# Report to orchestrator
report_activity() {
    local changed_files="$1"
    local inbox_file="$ORCHESTRATION_DIR/inbox/orchestrator.json"
    
    # Create message
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local message_id="msg-$(date +%s%N | cut -b1-13)"
    
    # Build JSON message
    local message="{
        \"id\": \"$message_id\",
        \"from_agent\": \"stream-${STREAM_NAME,,}\",
        \"to_agent\": \"orchestrator\",
        \"msg_type\": \"status_update\",
        \"payload\": {
            \"event\": \"files_modified\",
            \"files\": \"$changed_files\",
            \"stream\": \"$STREAM_NAME\"
        },
        \"timestamp\": \"$timestamp\"
    }"
    
    # Ensure inbox directory exists
    mkdir -p "$(dirname "$inbox_file")"
    
    # Append to inbox (create if doesn't exist)
    if [ -f "$inbox_file" ]; then
        # Load existing messages, add new one
        python3 << EOF
import json
import os

inbox_file = "$inbox_file"
new_message = $message

try:
    with open(inbox_file, 'r') as f:
        messages = json.load(f)
except:
    messages = []

messages.append(new_message)

with open(inbox_file, 'w') as f:
    json.dump(messages, f, indent=2)
EOF
    else
        echo "[$message]" > "$inbox_file"
    fi
    
    log "Reported activity: $changed_files"
}

# Main
main() {
    log "Hook triggered for stream: $STREAM_NAME"
    
    # Get changed files
    local changed_files
    changed_files=$(get_changed_files | head -5 | tr '\n' ', ' | sed 's/,$//')
    
    if [ -n "$changed_files" ]; then
        report_activity "$changed_files"
    fi
}

main "$@"


