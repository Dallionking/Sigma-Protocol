#!/usr/bin/env bash
# =============================================================================
# Activity Filter - Claude Stream JSON Parser (FIXED)
# =============================================================================
# Filters Claude's stream-json output to show human-readable tool activity.
#
# IMPORTANT: Claude CLI outputs tool_use NESTED inside assistant messages:
#   {"type":"assistant","message":{"content":[{"type":"tool_use","name":"Read",...}]}}
# NOT as top-level tool_use events.
#
# Usage: claude --output-format stream-json --verbose -p "prompt" | ./activity-filter.sh
# =============================================================================

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Track start time for elapsed calculation
START_TIME=$(date +%s)

# Tool call counter
TOTAL_TOOLS=0

# Temp file for tracking tool names (for summary)
TOOL_LOG=$(mktemp)
trap "rm -f '$TOOL_LOG'" EXIT

# Function to format elapsed time
format_time() {
    local elapsed=$1
    local mins=$((elapsed / 60))
    local secs=$((elapsed % 60))
    printf "%dm%02ds" "$mins" "$secs"
}

# Function to truncate string with ellipsis
truncate() {
    local str="$1"
    local max="$2"
    if [[ ${#str} -gt $max ]]; then
        echo "${str:0:$((max-3))}..."
    else
        echo "$str"
    fi
}

# Function to get basename safely
safe_basename() {
    local path="$1"
    if [[ -n "$path" && "$path" != "?" && "$path" != "null" ]]; then
        basename "$path" 2>/dev/null || echo "$path"
    else
        echo "?"
    fi
}

# Main processing loop
while IFS= read -r line; do
    # Pass through to stdout for capture (full JSON)
    echo "$line"

    # Skip empty lines
    [[ -z "$line" ]] && continue

    # Try to parse JSON - skip if invalid
    MSG_TYPE=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
    [[ -z "$MSG_TYPE" ]] && continue

    # Calculate elapsed time
    ELAPSED=$(( $(date +%s) - START_TIME ))
    TIME_STR=$(format_time $ELAPSED)

    # Handle assistant messages with tool_use content
    # This is the CORRECT structure: assistant.message.content[].type == "tool_use"
    if [[ "$MSG_TYPE" == "assistant" ]]; then
        # Extract tool_use items from content array
        # Each tool has: name, input (object)
        TOOLS=$(echo "$line" | jq -r '.message.content[]? | select(.type == "tool_use") | .name + "|||" + (.input | @json)' 2>/dev/null)

        while IFS= read -r tool_line; do
            [[ -z "$tool_line" ]] && continue
            ((TOTAL_TOOLS++))

            TOOL_NAME="${tool_line%%|||*}"
            TOOL_INPUT="${tool_line#*|||}"

            # Log tool name for summary
            echo "$TOOL_NAME" >> "$TOOL_LOG"

            case "$TOOL_NAME" in
                Read|read)
                    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // .filePath // "?"' 2>/dev/null)
                    FNAME=$(safe_basename "$FILE")
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 📖 Read: ${GREEN}${FNAME}${NC}" >&2
                    ;;

                Edit|edit)
                    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // .filePath // "?"' 2>/dev/null)
                    FNAME=$(safe_basename "$FILE")
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} ✏️  Edit: ${GREEN}${FNAME}${NC}" >&2
                    ;;

                Write|write)
                    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // .filePath // "?"' 2>/dev/null)
                    FNAME=$(safe_basename "$FILE")
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 📝 Write: ${GREEN}${FNAME}${NC}" >&2
                    ;;

                Bash|bash)
                    CMD=$(echo "$TOOL_INPUT" | jq -r '.command // "?"' 2>/dev/null)
                    CMD_SHORT=$(truncate "$CMD" 50)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🖥️  Bash: ${YELLOW}${CMD_SHORT}${NC}" >&2
                    ;;

                Task|task)
                    AGENT=$(echo "$TOOL_INPUT" | jq -r '.subagent_type // .description // "?"' 2>/dev/null)
                    DESC=$(echo "$TOOL_INPUT" | jq -r '.description // ""' 2>/dev/null)
                    if [[ -n "$DESC" && "$DESC" != "null" && "$DESC" != "?" && "$AGENT" != "$DESC" ]]; then
                        AGENT_INFO="${AGENT}: $(truncate "$DESC" 30)"
                    else
                        AGENT_INFO="$AGENT"
                    fi
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🤖 Agent: ${CYAN}${AGENT_INFO}${NC}" >&2
                    ;;

                Grep|grep)
                    PATTERN=$(echo "$TOOL_INPUT" | jq -r '.pattern // "?"' 2>/dev/null)
                    PATTERN_SHORT=$(truncate "$PATTERN" 40)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🔍 Grep: ${YELLOW}${PATTERN_SHORT}${NC}" >&2
                    ;;

                Glob|glob)
                    PATTERN=$(echo "$TOOL_INPUT" | jq -r '.pattern // "?"' 2>/dev/null)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 📂 Glob: ${YELLOW}${PATTERN}${NC}" >&2
                    ;;

                TodoWrite|todowrite)
                    COUNT=$(echo "$TOOL_INPUT" | jq -r '.todos | length // 0' 2>/dev/null)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 📋 Todo: ${MAGENTA}${COUNT} items${NC}" >&2
                    ;;

                WebFetch|webfetch)
                    URL=$(echo "$TOOL_INPUT" | jq -r '.url // "?"' 2>/dev/null)
                    URL_SHORT=$(truncate "$URL" 50)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🌐 Fetch: ${CYAN}${URL_SHORT}${NC}" >&2
                    ;;

                WebSearch|websearch)
                    QUERY=$(echo "$TOOL_INPUT" | jq -r '.query // "?"' 2>/dev/null)
                    QUERY_SHORT=$(truncate "$QUERY" 40)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🔎 Search: ${CYAN}${QUERY_SHORT}${NC}" >&2
                    ;;

                Skill|skill)
                    SKILL=$(echo "$TOOL_INPUT" | jq -r '.skill // "?"' 2>/dev/null)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} ⚡ Skill: ${MAGENTA}${SKILL}${NC}" >&2
                    ;;

                LSP|lsp)
                    OP=$(echo "$TOOL_INPUT" | jq -r '.operation // "?"' 2>/dev/null)
                    FILE=$(echo "$TOOL_INPUT" | jq -r '.filePath // "?"' 2>/dev/null)
                    FNAME=$(safe_basename "$FILE")
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🔗 LSP: ${GREEN}${OP}${NC} on ${FNAME}" >&2
                    ;;

                mcp__*)
                    # MCP tool calls - extract the meaningful part
                    MCP_SHORT=$(echo "$TOOL_NAME" | sed 's/mcp__//' | cut -d'_' -f1-2)
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🔌 MCP: ${CYAN}${MCP_SHORT}${NC}" >&2
                    ;;

                *)
                    # Unknown tool - show generic
                    echo -e "${BLUE}[♥ ${TIME_STR}]${NC} 🔧 Tool: ${DIM}${TOOL_NAME}${NC}" >&2
                    ;;
            esac
        done <<< "$TOOLS"
    fi

    # Handle error messages
    if [[ "$MSG_TYPE" == "error" ]]; then
        ERROR_MSG=$(echo "$line" | jq -r '.error.message // .message // "Unknown error"' 2>/dev/null)
        ERROR_SHORT=$(truncate "$ERROR_MSG" 60)
        echo -e "${BLUE}[♥ ${TIME_STR}]${NC} ${RED}❌ Error: ${ERROR_SHORT}${NC}" >&2
    fi

    # Handle result messages - extract the final text
    if [[ "$MSG_TYPE" == "result" ]]; then
        RESULT=$(echo "$line" | jq -r '.result // empty' 2>/dev/null)
        if [[ -n "$RESULT" ]]; then
            # Output result for downstream processing (contains RALPH_STORY_COMPLETE markers)
            echo "RESULT_TEXT_START"
            echo "$RESULT"
            echo "RESULT_TEXT_END"
        fi
    fi
done

# Print summary at end
if [[ $TOTAL_TOOLS -gt 0 ]]; then
    ELAPSED=$(( $(date +%s) - START_TIME ))
    TIME_STR=$(format_time $ELAPSED)
    echo -e "\n${BOLD}━━━ Activity Summary (${TIME_STR}) ━━━${NC}" >&2
    echo -e "${DIM}Total tool calls: ${TOTAL_TOOLS}${NC}" >&2

    # Show top tools used
    if [[ -f "$TOOL_LOG" && -s "$TOOL_LOG" ]]; then
        sort "$TOOL_LOG" | uniq -c | sort -rn | head -5 | while read count tool; do
            echo -e "  ${tool}: ${count}" >&2
        done
    fi
fi
