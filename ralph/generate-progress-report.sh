#!/bin/bash
# =============================================================================
# Generate Progress Report from prd.json
# =============================================================================
# Generates a human-readable progress.txt from the prd.json backlog.
# This replaces the append-only progress.txt with an on-demand report
# generated from the structured backlog data.
#
# Usage:
#   generate-progress-report.sh <backlog-path> [output-path]
#
# Examples:
#   generate-progress-report.sh docs/ralph/prototype/prd.json
#   generate-progress-report.sh docs/ralph/implementation/prd.json progress.txt
#
# Output:
#   - If output-path provided: writes to that file
#   - If no output-path: writes to same directory as backlog
# =============================================================================

set -euo pipefail

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
BACKLOG="${1:-}"
OUTPUT="${2:-}"

if [[ -z "$BACKLOG" ]]; then
    echo "Usage: generate-progress-report.sh <backlog-path> [output-path]"
    exit 1
fi

if [[ ! -f "$BACKLOG" ]]; then
    echo "Error: Backlog not found: $BACKLOG"
    exit 1
fi

# Determine output path
if [[ -z "$OUTPUT" ]]; then
    OUTPUT="$(dirname "$BACKLOG")/progress.txt"
fi

# Extract metadata
PROJECT_NAME=$(jq -r '.meta.projectName // "Unknown Project"' "$BACKLOG")
MODE=$(jq -r '.meta.mode // "unknown"' "$BACKLOG")
GENERATED_AT=$(jq -r '.meta.generatedAt // "unknown"' "$BACKLOG")
LAST_RUN=$(jq -r '.meta.lastRunAt // "never"' "$BACKLOG")
LAST_ENGINE=$(jq -r '.meta.lastRunEngine // "unknown"' "$BACKLOG")

# Calculate progress
TOTAL_STORIES=$(jq '.stories | length' "$BACKLOG")
PASSED_STORIES=$(jq '[.stories[] | select(.passes == true)] | length' "$BACKLOG")
FAILED_STORIES=$(jq '[.stories[] | select(.passes == false and .lastAttempt.success == false)] | length' "$BACKLOG")
PENDING_STORIES=$((TOTAL_STORIES - PASSED_STORIES))

# Calculate completion percentage
if [[ $TOTAL_STORIES -gt 0 ]]; then
    COMPLETION_PCT=$((PASSED_STORIES * 100 / TOTAL_STORIES))
else
    COMPLETION_PCT=0
fi

# Generate report
cat > "$OUTPUT" << EOF
# Ralph Progress Report
**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Backlog:** $BACKLOG

---

## Project Overview

| Field | Value |
|-------|-------|
| Project | $PROJECT_NAME |
| Mode | $MODE |
| Backlog Created | $GENERATED_AT |
| Last Run | $LAST_RUN |
| Last Engine | $LAST_ENGINE |

---

## Progress Summary

| Metric | Count |
|--------|-------|
| Total Stories | $TOTAL_STORIES |
| Completed | $PASSED_STORIES |
| Pending | $PENDING_STORIES |
| Failed (last attempt) | $FAILED_STORIES |
| **Completion** | **${COMPLETION_PCT}%** |

---

## Completed Stories

EOF

# List completed stories
jq -r '.stories[] | select(.passes == true) | "- [\(.id)] \(.title) - Completed"' "$BACKLOG" >> "$OUTPUT"

cat >> "$OUTPUT" << EOF

---

## Pending Stories

EOF

# List pending stories
jq -r '.stories[] | select(.passes == false) | "- [\(.id)] \(.title) (priority: \(.priority))"' "$BACKLOG" >> "$OUTPUT"

cat >> "$OUTPUT" << EOF

---

## Recent Attempts

EOF

# List recent attempts (last 10)
jq -r '
  [.stories[] | select(.lastAttempt != null) | {
    id: .id,
    title: .title,
    timestamp: .lastAttempt.timestamp,
    success: .lastAttempt.success,
    engine: .lastAttempt.engine,
    error: .lastAttempt.errorMessage
  }] | sort_by(.timestamp) | reverse | .[0:10][] |
  "### \(.timestamp) - \(.id)\n**Title:** \(.title)\n**Engine:** \(.engine)\n**Success:** \(.success)\n\(if .error then "**Error:** \(.error)" else "" end)\n"
' "$BACKLOG" >> "$OUTPUT" 2>/dev/null || echo "No recent attempts recorded." >> "$OUTPUT"

cat >> "$OUTPUT" << EOF

---

## Learnings (from attempt history)

EOF

# Extract learnings from attempts
jq -r '
  [.stories[].attempts[]? | select(.learnings != null) | {
    timestamp: .timestamp,
    learning: .learnings
  }] | sort_by(.timestamp) | reverse | .[0:20][] |
  "- [\(.timestamp)] \(.learning)"
' "$BACKLOG" >> "$OUTPUT" 2>/dev/null || echo "No learnings recorded yet." >> "$OUTPUT"

cat >> "$OUTPUT" << EOF

---

## Stream Progress (if parallel)

EOF

# Check for streams
STREAM_COUNT=$(jq '.streams | length' "$BACKLOG" 2>/dev/null || echo "0")
if [[ "$STREAM_COUNT" -gt 0 ]]; then
    jq -r '
      .streams[] as $stream |
      [.stories[] | select(.tags.streamId == $stream.id)] as $stories |
      [$stories[] | select(.passes == true)] | length as $passed |
      ($stories | length) as $total |
      "| \($stream.name) | \($stream.id) | \($passed)/\($total) |"
    ' "$BACKLOG" | (echo "| Stream | ID | Progress |"; echo "|--------|-----|----------|"; cat) >> "$OUTPUT"
else
    echo "No streams defined (sequential execution mode)." >> "$OUTPUT"
fi

cat >> "$OUTPUT" << EOF

---

*Report generated from prd.json using generate-progress-report.sh*
*Native task tracking via Claude Code v2.1.17+ TaskCreate/TaskUpdate*
EOF

# Print summary to terminal
echo -e "${GREEN}Progress report generated: $OUTPUT${NC}"
echo -e "  Project: $PROJECT_NAME"
echo -e "  Progress: ${PASSED_STORIES}/${TOTAL_STORIES} (${COMPLETION_PCT}%)"
echo -e "  Mode: $MODE"
