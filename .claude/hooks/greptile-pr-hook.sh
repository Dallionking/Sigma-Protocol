#!/usr/bin/env bash
# Greptile PR Review Hook
# Triggered: PostToolUse on Bash commands containing "gh pr create"
# Purpose: Detect new PR creation and remind to run Greptile review after processing delay
#
# This hook reads the tool output to extract PR details and injects
# a reminder into the model's additionalContext so Claude knows to
# suggest running /greptile-pr-review after Greptile has had time
# to process the PR.

set -euo pipefail

# The tool input/output is available via CLAUDE_TOOL_INPUT and CLAUDE_TOOL_OUTPUT
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"
TOOL_OUTPUT="${CLAUDE_TOOL_OUTPUT:-}"

# Only trigger on gh pr create commands
if ! echo "$TOOL_INPUT" | grep -q "gh pr create"; then
  exit 0
fi

# Try to extract PR number from the output
# gh pr create outputs a URL like: https://github.com/owner/repo/pull/42
PR_URL=$(echo "$TOOL_OUTPUT" | grep -oE 'https://github\.com/[^/]+/[^/]+/pull/[0-9]+' | head -1 || true)
PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$' || true)

if [ -z "$PR_NUMBER" ]; then
  # Couldn't extract PR number, still remind but without specifics
  cat <<'EOF'
[GREPTILE_PR_HOOK] A PR was just created. Greptile's AI review bot will analyze it automatically on GitHub.

ACTION REQUIRED: After ~90 seconds, run:
  /greptile-pr-review

To auto-resolve any Greptile comments:
  /greptile-pr-review --auto-resolve
EOF
  exit 0
fi

# Extract repo from URL
REPO=$(echo "$PR_URL" | grep -oE 'github\.com/[^/]+/[^/]+' | sed 's|github\.com/||' || true)

cat <<EOF
[GREPTILE_PR_HOOK] PR #${PR_NUMBER} was just created${REPO:+ on ${REPO}}.

Greptile's AI review bot will analyze this PR automatically on GitHub.
It typically takes 60-120 seconds for Greptile to complete its review.

SUGGESTED NEXT STEPS:
1. Wait ~90 seconds for Greptile to process
2. Run: /greptile-pr-review --pr=${PR_NUMBER}
3. To auto-fix Greptile comments: /greptile-pr-review --auto-resolve --pr=${PR_NUMBER}

TIP: You can continue working while Greptile processes. Run the review command when ready.
EOF
