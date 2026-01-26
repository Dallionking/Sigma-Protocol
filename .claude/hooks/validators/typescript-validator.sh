#!/bin/bash
#
# TypeScript Validator - Validates TypeScript/JavaScript files for Sigma Protocol.
#
# This validator runs as a PostToolUse hook, enabling "Closed Loop Prompt" pattern
# where agents automatically fix validation failures in the same session.
#
# Output Contract: Returns JSON that the agent can parse and act upon.
#
# Usage:
#   ./typescript-validator.sh <file_path>
#
# Exit codes:
#   0 - Validation passed
#   1 - Validation failed (errors found)
#   2 - Invalid usage or file not found

set -e

FILE_PATH="${1:-}"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

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
    json_output "error" "Usage: typescript-validator.sh <file_path>" "ERROR: No file path provided to validator"
    exit 2
fi

# Only validate TypeScript/JavaScript files
case "$FILE_PATH" in
    *.ts|*.tsx|*.js|*.jsx)
        ;;
    *)
        json_output "skip" "Not a TypeScript/JavaScript file, skipping validation" ""
        exit 0
        ;;
esac

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    json_output "error" "File not found: $FILE_PATH" "ERROR: File '${FILE_PATH}' does not exist."
    exit 2
fi

# Initialize error collection
ERRORS="[]"
ERROR_COUNT=0
HAS_LINT_ERRORS=false
HAS_TYPE_ERRORS=false

# === RED FLAG CHECKS (Pattern-based, fast) ===
RED_FLAGS=""

# Check for console.log in production code (not in tests or debug files)
if ! echo "$FILE_PATH" | grep -qE '(test|spec|debug|\.test\.|\.spec\.)'; then
    CONSOLE_LOGS=$(grep -n "console\.log" "$FILE_PATH" 2>/dev/null || true)
    if [ -n "$CONSOLE_LOGS" ]; then
        while IFS= read -r line; do
            LINE_NUM=$(echo "$line" | cut -d: -f1)
            RED_FLAGS="$RED_FLAGS{\"line\": $LINE_NUM, \"severity\": \"error\", \"code\": \"CONSOLE_LOG\", \"message\": \"console.log found in production code\", \"fix_suggestion\": \"Remove console.log or use proper logging\"},"
            ((ERROR_COUNT++)) || true
        done <<< "$CONSOLE_LOGS"
    fi
fi

# Check for TODO/FIXME comments
TODO_FIXME=$(grep -n -E "(TODO|FIXME)" "$FILE_PATH" 2>/dev/null || true)
if [ -n "$TODO_FIXME" ]; then
    while IFS= read -r line; do
        LINE_NUM=$(echo "$line" | cut -d: -f1)
        CONTENT=$(echo "$line" | cut -d: -f2-)
        # Escape special characters for JSON
        CONTENT=$(echo "$CONTENT" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g')
        RED_FLAGS="$RED_FLAGS{\"line\": $LINE_NUM, \"severity\": \"warning\", \"code\": \"TODO_FIXME\", \"message\": \"Found TODO/FIXME comment\", \"fix_suggestion\": \"Resolve or remove the TODO/FIXME\"},"
    done <<< "$TODO_FIXME"
fi

# Check for @ts-ignore without justification
TS_IGNORE=$(grep -n "@ts-ignore" "$FILE_PATH" 2>/dev/null || true)
if [ -n "$TS_IGNORE" ]; then
    while IFS= read -r line; do
        LINE_NUM=$(echo "$line" | cut -d: -f1)
        RED_FLAGS="$RED_FLAGS{\"line\": $LINE_NUM, \"severity\": \"error\", \"code\": \"TS_IGNORE\", \"message\": \"@ts-ignore without justification\", \"fix_suggestion\": \"Fix the TypeScript error or add justification comment\"},"
        ((ERROR_COUNT++)) || true
    done <<< "$TS_IGNORE"
fi

# Check for eslint-disable without justification
ESLINT_DISABLE=$(grep -n "eslint-disable" "$FILE_PATH" 2>/dev/null | grep -v "eslint-disable.*--" || true)
if [ -n "$ESLINT_DISABLE" ]; then
    while IFS= read -r line; do
        LINE_NUM=$(echo "$line" | cut -d: -f1)
        RED_FLAGS="$RED_FLAGS{\"line\": $LINE_NUM, \"severity\": \"warning\", \"code\": \"ESLINT_DISABLE\", \"message\": \"eslint-disable without justification\", \"fix_suggestion\": \"Fix the ESLint error or add justification comment\"},"
    done <<< "$ESLINT_DISABLE"
fi

# Check for empty catch blocks
EMPTY_CATCH=$(grep -n -A1 "catch\s*(" "$FILE_PATH" 2>/dev/null | grep -B1 "^\s*}" | grep -v "^\s*}" || true)
# This is a simplified check - might have false positives

# Check for hardcoded secrets patterns
SECRETS=$(grep -n -iE "(api[_-]?key|secret|password|token)\s*[=:]\s*['\"][^'\"]+['\"]" "$FILE_PATH" 2>/dev/null || true)
if [ -n "$SECRETS" ]; then
    while IFS= read -r line; do
        LINE_NUM=$(echo "$line" | cut -d: -f1)
        RED_FLAGS="$RED_FLAGS{\"line\": $LINE_NUM, \"severity\": \"error\", \"code\": \"HARDCODED_SECRET\", \"message\": \"Possible hardcoded secret detected\", \"fix_suggestion\": \"Move to environment variables\"},"
        ((ERROR_COUNT++)) || true
    done <<< "$SECRETS"
fi

# === ESLINT CHECK (if available) ===
cd "$PROJECT_ROOT" 2>/dev/null || true

# Try to find and run ESLint
ESLINT_BIN=""
if [ -f "node_modules/.bin/eslint" ]; then
    ESLINT_BIN="node_modules/.bin/eslint"
elif command -v eslint &>/dev/null; then
    ESLINT_BIN="eslint"
elif [ -f "node_modules/eslint/bin/eslint.js" ]; then
    ESLINT_BIN="node node_modules/eslint/bin/eslint.js"
fi

if [ -n "$ESLINT_BIN" ]; then
    # Run ESLint with JSON output
    :
else
    echo "Warning: ESLint not found, skipping lint check" >&2
fi

if [ -n "$ESLINT_BIN" ]; then
    ESLINT_OUTPUT=$($ESLINT_BIN "$FILE_PATH" --format json 2>/dev/null || true)

    if [ -n "$ESLINT_OUTPUT" ]; then
        # Parse ESLint JSON output
        LINT_ERROR_COUNT=$(echo "$ESLINT_OUTPUT" | jq '.[0].errorCount // 0' 2>/dev/null || echo "0")
        LINT_WARNING_COUNT=$(echo "$ESLINT_OUTPUT" | jq '.[0].warningCount // 0' 2>/dev/null || echo "0")

        if [ "$LINT_ERROR_COUNT" -gt 0 ]; then
            HAS_LINT_ERRORS=true
            # Extract first 3 lint errors for agent instruction
            LINT_MESSAGES=$(echo "$ESLINT_OUTPUT" | jq -r '.[0].messages[:3][] | "Line \(.line): \(.message)"' 2>/dev/null || echo "")

            # Add to errors array
            LINT_ERRORS=$(echo "$ESLINT_OUTPUT" | jq '[.[0].messages[:5][] | {line: .line, severity: (if .severity == 2 then "error" else "warning" end), code: .ruleId, message: .message, fix_suggestion: "Fix the ESLint error"}]' 2>/dev/null || echo "[]")

            ((ERROR_COUNT += LINT_ERROR_COUNT)) || true
        fi
    fi
fi

# === TYPESCRIPT CHECK (if available) ===
TSC_BIN=""
if [ -f "node_modules/.bin/tsc" ]; then
    TSC_BIN="node_modules/.bin/tsc"
elif command -v tsc &>/dev/null; then
    TSC_BIN="tsc"
fi

if [ -z "$TSC_BIN" ] && [[ "$FILE_PATH" == *.ts* ]]; then
    echo "Warning: TSC not found, skipping TypeScript type check" >&2
fi

if [ -n "$TSC_BIN" ] && [[ "$FILE_PATH" == *.ts* ]]; then
    # Run TypeScript compiler in check mode (no emit)
    TSC_OUTPUT=$($TSC_BIN --noEmit "$FILE_PATH" 2>&1 || true)

    if echo "$TSC_OUTPUT" | grep -q "error TS"; then
        HAS_TYPE_ERRORS=true
        # Count errors
        TYPE_ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || echo "0")
        ((ERROR_COUNT += TYPE_ERROR_COUNT)) || true

        # Extract first error for agent instruction
        FIRST_TYPE_ERROR=$(echo "$TSC_OUTPUT" | grep "error TS" | head -1 || echo "")
        if [ -n "$FIRST_TYPE_ERROR" ]; then
            LINE_NUM=$(echo "$FIRST_TYPE_ERROR" | grep -oE '\([0-9]+,' | tr -d '(,' || echo "0")
            MESSAGE=$(echo "$FIRST_TYPE_ERROR" | sed 's/.*: //' | sed 's/"/\\"/g')
            RED_FLAGS="$RED_FLAGS{\"line\": ${LINE_NUM:-0}, \"severity\": \"error\", \"code\": \"TYPE_ERROR\", \"message\": \"${MESSAGE}\", \"fix_suggestion\": \"Fix the TypeScript type error\"},"
        fi
    fi
fi

# === BUILD FINAL RESULT ===
# Remove trailing comma from RED_FLAGS and wrap in array
if [ -n "$RED_FLAGS" ]; then
    ERRORS="[${RED_FLAGS%,}]"
fi

# Determine status
if [ "$ERROR_COUNT" -gt 0 ]; then
    STATUS="fail"

    # Build agent instruction
    INSTRUCTION="VALIDATION FAILED: $ERROR_COUNT error(s) in $FILE_PATH\\n\\n"

    if [ "$HAS_LINT_ERRORS" = true ]; then
        INSTRUCTION="${INSTRUCTION}ESLint errors found. Run 'npm run lint' for details.\\n"
    fi

    if [ "$HAS_TYPE_ERRORS" = true ]; then
        INSTRUCTION="${INSTRUCTION}TypeScript errors found. Run 'tsc --noEmit' for details.\\n"
    fi

    INSTRUCTION="${INSTRUCTION}\\nFIX these errors NOW, then the hook will re-validate automatically."

    json_output "$STATUS" "$ERROR_COUNT validation errors found" "$INSTRUCTION" "$ERRORS"
    exit 1
else
    STATUS="pass"
    json_output "$STATUS" "Validation passed" "VALIDATION PASSED: $FILE_PATH has no errors." "[]"
    exit 0
fi
