#!/bin/bash
# Ralph Log Tail - Spawn terminal windows to monitor Ralph loops
# Usage: tail-logs.sh [ios|web|--list|--terminal]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Find most recent logs
IOS_LOG=$(ls -t /tmp/ralph-ios-*.log 2>/dev/null | head -1)
WEB_LOG=$(ls -t /tmp/ralph-web-*.log 2>/dev/null | head -1)

# Parse arguments
TARGET="${1:-all}"
FORCE_TERMINAL=false

if [[ "$1" == "--terminal" ]] || [[ "$2" == "--terminal" ]]; then
  FORCE_TERMINAL=true
  [[ "$1" == "--terminal" ]] && TARGET="${2:-all}"
fi

# List mode
if [[ "$TARGET" == "--list" ]]; then
  echo -e "${BLUE}Ralph Log Files:${NC}"
  echo ""
  if [[ -n "$IOS_LOG" ]]; then
    AGE_IOS=$(($(date +%s) - $(stat -f %m "$IOS_LOG")))
    echo -e "  ${GREEN}iOS:${NC} $IOS_LOG"
    echo -e "       Age: ${AGE_IOS}s ago"
  else
    echo -e "  ${YELLOW}iOS:${NC} No active log found"
  fi
  echo ""
  if [[ -n "$WEB_LOG" ]]; then
    AGE_WEB=$(($(date +%s) - $(stat -f %m "$WEB_LOG")))
    echo -e "  ${GREEN}Web:${NC} $WEB_LOG"
    echo -e "       Age: ${AGE_WEB}s ago"
  else
    echo -e "  ${YELLOW}Web:${NC} No active log found"
  fi
  exit 0
fi

# Check if any logs exist
if [[ -z "$IOS_LOG" ]] && [[ -z "$WEB_LOG" ]]; then
  echo -e "${RED}Error:${NC} No Ralph logs found in /tmp/"
  echo -e "Start a Ralph loop first: ${BLUE}sigma ralph --backlog <path>${NC}"
  exit 1
fi

# Determine which logs to open
LOGS_TO_OPEN=()
NAMES=()

case "$TARGET" in
  ios)
    if [[ -n "$IOS_LOG" ]]; then
      LOGS_TO_OPEN+=("$IOS_LOG")
      NAMES+=("iOS Ralph")
    else
      echo -e "${YELLOW}Warning:${NC} No iOS log found"
      exit 1
    fi
    ;;
  web)
    if [[ -n "$WEB_LOG" ]]; then
      LOGS_TO_OPEN+=("$WEB_LOG")
      NAMES+=("Web Ralph")
    else
      echo -e "${YELLOW}Warning:${NC} No Web log found"
      exit 1
    fi
    ;;
  all|*)
    [[ -n "$IOS_LOG" ]] && LOGS_TO_OPEN+=("$IOS_LOG") && NAMES+=("iOS Ralph")
    [[ -n "$WEB_LOG" ]] && LOGS_TO_OPEN+=("$WEB_LOG") && NAMES+=("Web Ralph")
    ;;
esac

# Detect OS
OS="$(uname -s)"

spawn_macos_terminals() {
  local use_iterm=false

  # Check for iTerm unless forced to use Terminal
  if [[ "$FORCE_TERMINAL" == false ]] && [[ -d "/Applications/iTerm.app" ]]; then
    use_iterm=true
  fi

  if [[ "$use_iterm" == true ]]; then
    echo -e "${GREEN}Spawning iTerm windows...${NC}"

    # Build AppleScript for iTerm
    local script="tell application \"iTerm\"
      activate
      create window with default profile
      tell current session of current window
        write text \"echo '📱 ${NAMES[0]} Log' && tail -f ${LOGS_TO_OPEN[0]}\"
      end tell"

    # Add tabs for additional logs
    for i in "${!LOGS_TO_OPEN[@]}"; do
      if [[ $i -gt 0 ]]; then
        script="$script
      create tab with default profile
      tell current session of current window
        write text \"echo '🌐 ${NAMES[$i]} Log' && tail -f ${LOGS_TO_OPEN[$i]}\"
      end tell"
      fi
    done

    script="$script
    end tell"

    osascript -e "$script"

  else
    echo -e "${GREEN}Spawning Terminal.app windows...${NC}"

    for i in "${!LOGS_TO_OPEN[@]}"; do
      osascript -e "tell application \"Terminal\"
        activate
        do script \"echo '${NAMES[$i]} Log' && tail -f ${LOGS_TO_OPEN[$i]}\"
      end tell"
    done
  fi
}

spawn_linux_terminals() {
  echo -e "${GREEN}Spawning terminal windows...${NC}"

  for i in "${!LOGS_TO_OPEN[@]}"; do
    if command -v gnome-terminal &> /dev/null; then
      gnome-terminal --title="${NAMES[$i]}" -- bash -c "tail -f ${LOGS_TO_OPEN[$i]}; exec bash"
    elif command -v konsole &> /dev/null; then
      konsole --new-tab -e "tail -f ${LOGS_TO_OPEN[$i]}" &
    elif command -v xterm &> /dev/null; then
      xterm -title "${NAMES[$i]}" -e "tail -f ${LOGS_TO_OPEN[$i]}" &
    else
      echo -e "${YELLOW}No supported terminal found. Run manually:${NC}"
      echo "  tail -f ${LOGS_TO_OPEN[$i]}"
    fi
  done
}

# Main execution
case "$OS" in
  Darwin)
    spawn_macos_terminals
    ;;
  Linux)
    spawn_linux_terminals
    ;;
  *)
    echo -e "${YELLOW}Unsupported OS. Run manually:${NC}"
    for log in "${LOGS_TO_OPEN[@]}"; do
      echo "  tail -f $log"
    done
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✓ Opened ${#LOGS_TO_OPEN[@]} log window(s)${NC}"
for i in "${!LOGS_TO_OPEN[@]}"; do
  echo -e "  ${NAMES[$i]}: ${LOGS_TO_OPEN[$i]}"
done
