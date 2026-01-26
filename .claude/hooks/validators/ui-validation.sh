#!/bin/bash
#
# UI Validation Hook - Validates UI components using Agent Browser CLI
#
# This validator runs as a PostToolUse hook after Write/Edit operations
# on component files. It uses Vercel's Agent Browser for lightweight,
# context-efficient UI validation (93% less context than Playwright).
#
# Output Contract: Returns JSON that the agent can parse and act upon.
#
# Usage:
#   ./ui-validation.sh <file_path>
#
# Exit codes:
#   0 - Validation passed or skipped
#   1 - Validation failed (UI errors found)
#   2 - Invalid usage or configuration error
#
# Requirements:
#   - agent-browser CLI: npm install -g agent-browser
#   - Dev server running on localhost:3000 (or configured port)

set -e

FILE_PATH="${1:-}"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DEV_SERVER_PORT="${DEV_SERVER_PORT:-3000}"
DEV_SERVER_HOST="${DEV_SERVER_HOST:-localhost}"

# JSON output helper
json_output() {
    local status="$1"
    local message="$2"
    local agent_instruction="$3"
    local errors="${4:-[]}"

    cat <<EOF
{
  "status": "${status}",
  "file_path": "${FILE_PATH}",
  "message": "${message}",
  "errors": ${errors},
  "agent_instruction": "${agent_instruction}"
}
EOF
}

# Check arguments
if [ -z "$FILE_PATH" ]; then
    json_output "error" "Usage: ui-validation.sh <file_path>" "ERROR: No file path provided to validator"
    exit 2
fi

# Only validate component files
case "$FILE_PATH" in
    */components/*.tsx|*/components/*.jsx|*/app/**/page.tsx|*/app/**/page.jsx|*/pages/*.tsx|*/pages/*.jsx)
        ;;
    *)
        json_output "skip" "Not a UI component file, skipping validation" ""
        exit 0
        ;;
esac

# Skip test files
if echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(tsx?|jsx?)$'; then
    json_output "skip" "Test file, skipping UI validation" ""
    exit 0
fi

# Check if agent-browser is installed
if ! command -v agent-browser &>/dev/null; then
    json_output "fail" "agent-browser not installed. Install with: npm install -g agent-browser" "FAIL: agent-browser CLI not found. UI validation cannot proceed. Install with: npm install -g agent-browser"
    exit 1
fi

# Check if dev server is running
if ! curl -s --head "http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}" >/dev/null 2>&1; then
    json_output "skip" "Dev server not running at http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}" "SKIP: Dev server not detected. Start with 'npm run dev' for UI validation."
    exit 0
fi

# Extract route from file path
extract_route() {
    local path="$1"
    local route=""

    # Handle Next.js App Router: app/**/page.tsx -> /path
    if echo "$path" | grep -qE '/app/.*page\.(tsx|jsx)$'; then
        route=$(echo "$path" | sed -E 's|.*/app/(.*)page\.(tsx|jsx)$|/\1|')
        route=$(echo "$route" | sed 's|/\[|/:|g' | sed 's|\]||g')  # [id] -> :id
        route=${route%/}  # Remove trailing slash
        [ -z "$route" ] && route="/"
        echo "$route"
        return
    fi

    # Handle Next.js Pages Router: pages/*.tsx -> /path
    if echo "$path" | grep -qE '/pages/.*\.(tsx|jsx)$'; then
        route=$(echo "$path" | sed -E 's|.*/pages/(.*)\.(tsx|jsx)$|/\1|')
        route=$(echo "$route" | sed 's|/index$||')  # Remove /index
        route=$(echo "$route" | sed 's|/\[|/:|g' | sed 's|\]||g')
        [ -z "$route" ] && route="/"
        echo "$route"
        return
    fi

    # Handle component files: try to infer route from component name
    # e.g., components/dashboard/DashboardHeader.tsx -> /dashboard
    if echo "$path" | grep -qE '/components/'; then
        local dir=$(dirname "$path" | sed -E 's|.*/components/||')
        if [ -n "$dir" ] && [ "$dir" != "." ]; then
            echo "/$dir"
            return
        fi
    fi

    # Default: cannot determine route
    echo ""
}

ROUTE=$(extract_route "$FILE_PATH")

if [ -z "$ROUTE" ]; then
    json_output "skip" "Could not determine route from file path" "SKIP: Unable to infer route for UI validation from $FILE_PATH"
    exit 0
fi

# Create isolated session for this validation
SESSION_ID="ui-val-$(date +%s)-$$"

# Run Agent Browser validation
run_validation() {
    local route="$1"
    local url="http://${DEV_SERVER_HOST}:${DEV_SERVER_PORT}${route}"

    # Create isolated session
    agent-browser session create "$SESSION_ID" 2>/dev/null || true
    agent-browser session use "$SESSION_ID" 2>/dev/null || true

    # Open the route
    local open_result
    open_result=$(agent-browser open "$url" 2>&1) || true

    # Check for immediate error
    if echo "$open_result" | grep -qiE 'error|failed|timeout|refused'; then
        echo "OPEN_FAILED: $open_result"
        return 1
    fi

    # Wait for page to settle
    sleep 2

    # Get snapshot of interactive elements
    local snapshot
    snapshot=$(agent-browser snapshot -i 2>&1) || true

    # Check for errors in the page
    if echo "$snapshot" | grep -qiE '500|404|error|exception|undefined is not'; then
        echo "PAGE_ERROR: $snapshot"
        return 1
    fi

    # Check if page has any interactive elements (not blank)
    local element_count
    element_count=$(echo "$snapshot" | grep -c '^@e' 2>/dev/null || echo "0")

    if [ "$element_count" -lt 1 ]; then
        # Page might be valid but have no interactive elements
        # Check if it at least loaded (has any content)
        if [ -z "$snapshot" ]; then
            echo "EMPTY_PAGE: No content rendered"
            return 1
        fi
    fi

    # Take screenshot for evidence
    local screenshot_path="$PROJECT_ROOT/.sss/validation-screenshots/${SESSION_ID}.png"
    mkdir -p "$(dirname "$screenshot_path")" 2>/dev/null || true
    agent-browser screenshot "$screenshot_path" 2>/dev/null || true

    # Cleanup session
    agent-browser session destroy "$SESSION_ID" 2>/dev/null || true

    echo "PASSED: $element_count interactive elements found"
    return 0
}

# Execute validation
VALIDATION_RESULT=$(run_validation "$ROUTE" 2>&1)
VALIDATION_EXIT=$?

# Cleanup session on any exit
trap "agent-browser session destroy '$SESSION_ID' 2>/dev/null || true" EXIT

if [ $VALIDATION_EXIT -ne 0 ] || echo "$VALIDATION_RESULT" | grep -qE '^(OPEN_FAILED|PAGE_ERROR|EMPTY_PAGE):'; then
    # Extract error message
    ERROR_MSG=$(echo "$VALIDATION_RESULT" | head -1)

    # Build error JSON
    ERRORS="[{\"line\": 0, \"severity\": \"error\", \"code\": \"UI_VALIDATION\", \"message\": \"${ERROR_MSG}\", \"fix_suggestion\": \"Check component renders correctly at ${ROUTE}\"}]"

    INSTRUCTION="UI VALIDATION FAILED for ${FILE_PATH}\\n\\n"
    INSTRUCTION="${INSTRUCTION}Route: ${ROUTE}\\n"
    INSTRUCTION="${INSTRUCTION}Error: ${ERROR_MSG}\\n\\n"
    INSTRUCTION="${INSTRUCTION}ACTIONS:\\n"
    INSTRUCTION="${INSTRUCTION}1. Ensure dev server is running (npm run dev)\\n"
    INSTRUCTION="${INSTRUCTION}2. Check component renders without errors\\n"
    INSTRUCTION="${INSTRUCTION}3. Verify route exists in app router\\n"
    INSTRUCTION="${INSTRUCTION}4. Fix any runtime/render errors\\n\\n"
    INSTRUCTION="${INSTRUCTION}Re-save the file to trigger re-validation."

    json_output "fail" "UI validation failed at route $ROUTE" "$INSTRUCTION" "$ERRORS"
    exit 1
else
    json_output "pass" "UI validation passed at route $ROUTE" "RALPH_UI_VALIDATION_PASSED: Component renders correctly at $ROUTE" "[]"
    exit 0
fi
