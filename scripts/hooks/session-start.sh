#!/bin/bash
# ============================================================================
# session-start.sh - Claude Code Session Start Hook for Sigma Orchestration
# ============================================================================
# Called when a Claude Code session starts - auto-registers as stream worker
# if running in an orchestration environment.
#
# Install location: ~/.sigma/hooks/session-start.sh
#
# Hook configuration in ~/.claude/settings.json:
# {
#   "hooks": {
#     "SessionStart": [
#       {
#         "matcher": ".*",
#         "hooks": [
#           {
#             "type": "command",
#             "command": "~/.sigma/hooks/session-start.sh"
#           }
#         ]
#       }
#     ]
#   }
# }
# ============================================================================

set -euo pipefail

# Configuration from environment
STREAM_NAME="${SIGMA_STREAM_NAME:-}"
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
ORCHESTRATION_DIR="$PROJECT_ROOT/.sigma/orchestration"

# Exit if not in orchestration mode
if [ -z "$STREAM_NAME" ]; then
    # Not a stream worker, check if orchestrator
    if [ "${SIGMA_ROLE:-}" = "orchestrator" ]; then
        echo "🎯 Orchestrator session started"
        echo "Run @orchestrate to begin coordination"
    fi
    exit 0
fi

# Log file for debugging
LOG_FILE="$ORCHESTRATION_DIR/hooks.log"
mkdir -p "$ORCHESTRATION_DIR"

# Log function
log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [session-start] $1" >> "$LOG_FILE"
}

# Register with orchestrator
register_stream() {
    local inbox_file="$ORCHESTRATION_DIR/inbox/orchestrator.json"
    
    # Create registration message
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local message_id="msg-$(date +%s%N | cut -b1-13)"
    local worktree
    worktree=$(pwd)
    
    local message="{
        \"id\": \"$message_id\",
        \"from_agent\": \"stream-${STREAM_NAME,,}\",
        \"to_agent\": \"orchestrator\",
        \"msg_type\": \"register\",
        \"payload\": {
            \"name\": \"$STREAM_NAME\",
            \"worktree\": \"$worktree\",
            \"capabilities\": [\"implement\", \"test\", \"verify\"],
            \"status\": \"ready\"
        },
        \"timestamp\": \"$timestamp\"
    }"
    
    # Ensure inbox directory exists
    mkdir -p "$(dirname "$inbox_file")"
    
    # Append to inbox
    if [ -f "$inbox_file" ]; then
        python3 << EOF
import json

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
    
    log "Registered stream: $STREAM_NAME"
}

# Print welcome message
print_welcome() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          🐝 SIGMA STREAM $STREAM_NAME - SESSION STARTED              ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Stream: $STREAM_NAME"
    echo "Worktree: $(pwd)"
    echo ""
    echo "Commands:"
    echo "  @stream --name=$STREAM_NAME  # Start stream worker"
    echo ""
}

# Main
main() {
    log "Session started for stream: $STREAM_NAME"
    
    # Check if orchestration is active
    if [ -f "$ORCHESTRATION_DIR/active.lock" ]; then
        # Auto-register with orchestrator
        register_stream
        print_welcome
    else
        # Orchestration not active yet
        echo "🐝 Stream $STREAM_NAME ready (orchestration not yet active)"
    fi
}

main "$@"

