#!/bin/bash
# ============================================================================
# health-monitor.sh - Sigma Protocol Stream Health Monitor
# ============================================================================
# Monitors tmux panes and auto-respawns crashed Claude instances.
# Provides voice notifications for important events.
#
# Usage:
#   ./health-monitor.sh [session_name] [--daemon]
#   ./health-monitor.sh sigma-orchestration
#   ./health-monitor.sh sigma-orchestration --daemon
#
# Environment Variables:
#   SIGMA_NOTIFY_ON: Events to notify on (default: prd_complete,blocked,crash)
#   SIGMA_CHECK_INTERVAL: Seconds between checks (default: 5)
# ============================================================================

set -euo pipefail

# Configuration
SESSION="${1:-sigma-orchestration}"
DAEMON_MODE="${2:-}"
CHECK_INTERVAL="${SIGMA_CHECK_INTERVAL:-5}"
NOTIFY_ON="${SIGMA_NOTIFY_ON:-prd_complete,blocked,crash,all_complete}"

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY_SCRIPT="$SCRIPT_DIR/../notify/voice.py"
PROJECT_ROOT="${SIGMA_PROJECT_ROOT:-$(pwd)}"
STATUS_FILE="$PROJECT_ROOT/.sigma/orchestration/health-status.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log_info() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"; }
log_error() { echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1" >&2; }

# Voice notification
notify() {
    local message="$1"
    local event="${2:-general}"
    
    # Check if we should notify for this event
    if [[ ! "$NOTIFY_ON" =~ "$event" ]] && [[ ! "$NOTIFY_ON" =~ "all" ]]; then
        return 0
    fi
    
    log_info "📢 $message"
    
    if [ -f "$NOTIFY_SCRIPT" ]; then
        python3 "$NOTIFY_SCRIPT" "$message" &
    elif command -v say &> /dev/null; then
        # macOS fallback
        say "$message" &
    fi
}

# Check if session exists
check_session() {
    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        log_error "Session '$SESSION' does not exist"
        exit 1
    fi
}

# Get pane information
get_pane_info() {
    tmux list-panes -t "$SESSION" -F '#{pane_index}:#{pane_dead}:#{pane_current_command}:#{pane_title}'
}

# Check for dead panes and respawn
check_and_respawn() {
    local pane_info
    pane_info=$(get_pane_info)
    
    while IFS=':' read -r index dead cmd title; do
        if [ "$dead" = "1" ]; then
            local stream_name="${title:-Pane $index}"
            log_warn "Pane $index ($stream_name) is dead, respawning..."
            
            # Respawn the pane
            tmux respawn-pane -t "$SESSION:0.$index" -k
            
            # Notify
            notify "Stream $stream_name crashed and was restarted" "crash"
            
            # Log to status file
            update_status "$index" "respawned"
        fi
    done <<< "$pane_info"
}

# Check pane activity (detect hangs)
check_activity() {
    local pane_info
    pane_info=$(tmux list-panes -t "$SESSION" -F '#{pane_index}:#{pane_pid}:#{pane_current_command}')
    
    while IFS=':' read -r index pid cmd; do
        # Check if process is responsive
        if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
            log_warn "Pane $index process $pid not responding"
            update_status "$index" "unresponsive"
        fi
    done <<< "$pane_info"
}

# Update status file
update_status() {
    local pane_index="$1"
    local status="$2"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    mkdir -p "$(dirname "$STATUS_FILE")"
    
    # Create or update status file
    if [ ! -f "$STATUS_FILE" ]; then
        echo '{"panes":{},"events":[]}' > "$STATUS_FILE"
    fi
    
    # Use Python for JSON manipulation (more reliable than jq for complex updates)
    python3 << EOF
import json
import os

status_file = "$STATUS_FILE"
try:
    with open(status_file, 'r') as f:
        data = json.load(f)
except:
    data = {"panes": {}, "events": []}

data["panes"]["$pane_index"] = {
    "status": "$status",
    "timestamp": "$timestamp"
}

data["events"].append({
    "pane": "$pane_index",
    "event": "$status",
    "timestamp": "$timestamp"
})

# Keep only last 100 events
data["events"] = data["events"][-100:]

with open(status_file, 'w') as f:
    json.dump(data, f, indent=2)
EOF
}

# Monitor loop
monitor_loop() {
    log_info "Starting health monitor for session: $SESSION"
    log_info "Check interval: ${CHECK_INTERVAL}s"
    log_info "Notifications: $NOTIFY_ON"
    echo ""
    
    while true; do
        check_session
        check_and_respawn
        check_activity
        sleep "$CHECK_INTERVAL"
    done
}

# Print status
print_status() {
    check_session
    
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       SIGMA ORCHESTRATION STATUS          ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    
    local pane_info
    pane_info=$(tmux list-panes -t "$SESSION" -F '#{pane_index}:#{pane_dead}:#{pane_current_command}:#{pane_title}:#{pane_pid}')
    
    echo "Session: $SESSION"
    echo ""
    echo "Panes:"
    
    while IFS=':' read -r index dead cmd title pid; do
        local status_icon="✅"
        local status_text="Running"
        
        if [ "$dead" = "1" ]; then
            status_icon="❌"
            status_text="Dead"
        fi
        
        local pane_name="${title:-Pane $index}"
        printf "  %s %s (%s) - PID: %s - Cmd: %s\n" "$status_icon" "$pane_name" "$status_text" "$pid" "$cmd"
    done <<< "$pane_info"
    
    echo ""
    
    # Show recent events if status file exists
    if [ -f "$STATUS_FILE" ]; then
        echo "Recent Events:"
        python3 << 'EOF'
import json
try:
    with open("$STATUS_FILE", 'r') as f:
        data = json.load(f)
    for event in data.get("events", [])[-5:]:
        print(f"  - {event['timestamp']}: Pane {event['pane']} - {event['event']}")
except:
    pass
EOF
    fi
}

# Main
main() {
    case "${1:-}" in
        --status|-s)
            print_status
            ;;
        --daemon|-d)
            # Run in background
            nohup "$0" "$SESSION" > /tmp/sigma-health-monitor.log 2>&1 &
            log_success "Health monitor started in background (PID: $!)"
            log_info "Logs: /tmp/sigma-health-monitor.log"
            ;;
        --help|-h)
            echo "Usage: $0 [session_name] [--daemon|--status|--help]"
            echo ""
            echo "Options:"
            echo "  --daemon, -d   Run in background"
            echo "  --status, -s   Show current status"
            echo "  --help, -h     Show this help"
            echo ""
            echo "Environment Variables:"
            echo "  SIGMA_NOTIFY_ON        Events to notify (default: prd_complete,blocked,crash)"
            echo "  SIGMA_CHECK_INTERVAL   Seconds between checks (default: 5)"
            ;;
        *)
            if [ "$DAEMON_MODE" = "--daemon" ] || [ "$DAEMON_MODE" = "-d" ]; then
                nohup "$0" "$SESSION" > /tmp/sigma-health-monitor.log 2>&1 &
                log_success "Health monitor started in background (PID: $!)"
            else
                monitor_loop
            fi
            ;;
    esac
}

main "$@"


