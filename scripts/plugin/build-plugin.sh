#!/bin/bash
# build-plugin.sh - Package Sigma Protocol into a distributable plugin format
# This does NOT replace the CLI workflow; it's an alternative distribution channel.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist/plugin"
SCHEMA="$PROJECT_ROOT/src/plugin/plugin-schema.json"

# Parse args
VERSION="${1:-$(date +%Y.%m.%d)}"
DRY_RUN="${DRY_RUN:-false}"

echo "=== Sigma Protocol Plugin Builder ==="
echo "Version: $VERSION"
echo "Source:  $PROJECT_ROOT"
echo "Output:  $DIST_DIR"
echo ""

# Clean previous build
if [ "$DRY_RUN" = "false" ]; then
  rm -rf "$DIST_DIR"
  mkdir -p "$DIST_DIR"/{skills,agents,commands,hooks,rules}
fi

# ── 1. Copy skills ──
echo "▸ Packaging skills..."
SKILL_COUNT=0
if [ -d "$PROJECT_ROOT/.claude/skills" ]; then
  for skill in "$PROJECT_ROOT/.claude/skills"/*.md; do
    [ -f "$skill" ] || continue
    if [ "$DRY_RUN" = "false" ]; then
      cp "$skill" "$DIST_DIR/skills/"
    fi
    SKILL_COUNT=$((SKILL_COUNT + 1))
  done
fi
echo "  $SKILL_COUNT skills"

# ── 2. Copy agents ──
echo "▸ Packaging agents..."
AGENT_COUNT=0
if [ -d "$PROJECT_ROOT/.claude/agents" ]; then
  for agent in "$PROJECT_ROOT/.claude/agents"/sigma-*.md; do
    [ -f "$agent" ] || continue
    if [ "$DRY_RUN" = "false" ]; then
      cp "$agent" "$DIST_DIR/agents/"
    fi
    AGENT_COUNT=$((AGENT_COUNT + 1))
  done
fi
echo "  $AGENT_COUNT agents"

# ── 3. Copy commands ──
echo "▸ Packaging commands..."
CMD_COUNT=0
if [ -d "$PROJECT_ROOT/.claude/commands" ]; then
  for cmd in "$PROJECT_ROOT/.claude/commands"/*.md; do
    [ -f "$cmd" ] || continue
    if [ "$DRY_RUN" = "false" ]; then
      cp "$cmd" "$DIST_DIR/commands/"
    fi
    CMD_COUNT=$((CMD_COUNT + 1))
  done
  # Copy subdirectories
  for subdir in "$PROJECT_ROOT/.claude/commands"/*/; do
    [ -d "$subdir" ] || continue
    dirname=$(basename "$subdir")
    if [ "$DRY_RUN" = "false" ]; then
      mkdir -p "$DIST_DIR/commands/$dirname"
      cp "$subdir"*.md "$DIST_DIR/commands/$dirname/" 2>/dev/null || true
    fi
    sub_count=$(find "$subdir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    CMD_COUNT=$((CMD_COUNT + sub_count))
  done
fi
echo "  $CMD_COUNT commands"

# ── 4. Copy hooks ──
echo "▸ Packaging hooks..."
HOOK_COUNT=0
if [ -d "$PROJECT_ROOT/.claude/hooks" ]; then
  for hook in "$PROJECT_ROOT/.claude/hooks"/*.sh; do
    [ -f "$hook" ] || continue
    if [ "$DRY_RUN" = "false" ]; then
      cp "$hook" "$DIST_DIR/hooks/"
    fi
    HOOK_COUNT=$((HOOK_COUNT + 1))
  done
  # Copy hook subdirectories (validators, slas)
  for subdir in "$PROJECT_ROOT/.claude/hooks"/*/; do
    [ -d "$subdir" ] || continue
    dirname=$(basename "$subdir")
    if [ "$DRY_RUN" = "false" ]; then
      mkdir -p "$DIST_DIR/hooks/$dirname"
      cp "$subdir"* "$DIST_DIR/hooks/$dirname/" 2>/dev/null || true
    fi
    sub_count=$(find "$subdir" -type f 2>/dev/null | wc -l | tr -d ' ')
    HOOK_COUNT=$((HOOK_COUNT + sub_count))
  done
fi
echo "  $HOOK_COUNT hooks"

# ── 5. Copy rules ──
echo "▸ Packaging rules..."
RULE_COUNT=0
if [ -d "$PROJECT_ROOT/.claude/rules" ]; then
  for rule in "$PROJECT_ROOT/.claude/rules"/*.md; do
    [ -f "$rule" ] || continue
    if [ "$DRY_RUN" = "false" ]; then
      cp "$rule" "$DIST_DIR/rules/"
    fi
    RULE_COUNT=$((RULE_COUNT + 1))
  done
fi
echo "  $RULE_COUNT rules"

# ── 6. Generate manifest ──
echo "▸ Generating plugin manifest..."

# Count categorized skills
CAT_A=$(grep -rl 'disable-model-invocation: true' "$PROJECT_ROOT/.claude/skills/" 2>/dev/null | wc -l | tr -d ' ')
CAT_C=$(grep -rl 'user-invocable: false' "$PROJECT_ROOT/.claude/skills/" 2>/dev/null | wc -l | tr -d ' ')
CAT_B=$((SKILL_COUNT - CAT_A - CAT_C))

if [ "$DRY_RUN" = "false" ]; then
  cat > "$DIST_DIR/plugin.json" << MANIFEST
{
  "\$schema": "../src/plugin/plugin-schema.json",
  "name": "sigma-protocol",
  "version": "$VERSION",
  "description": "Sigma Protocol - 13-step product development methodology for AI-assisted development",
  "author": "Dallionking",
  "license": "MIT",
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "components": {
    "skills": {
      "total": $SKILL_COUNT,
      "manual_only": $CAT_A,
      "claude_invocable": $CAT_B,
      "background": $CAT_C
    },
    "agents": $AGENT_COUNT,
    "commands": $CMD_COUNT,
    "hooks": $HOOK_COUNT,
    "rules": $RULE_COUNT
  },
  "platforms": {
    "claude_code": {
      "min_version": "2.1.33",
      "features": ["agent-teams", "tool-search", "skill-categorization"]
    }
  },
  "install": {
    "skills_dir": ".claude/skills/",
    "agents_dir": ".claude/agents/",
    "commands_dir": ".claude/commands/",
    "hooks_dir": ".claude/hooks/",
    "rules_dir": ".claude/rules/"
  }
}
MANIFEST
fi

# ── Summary ──
echo ""
echo "=== Build Complete ==="
echo ""
echo "  Skills:   $SKILL_COUNT ($CAT_A manual-only, $CAT_B auto-invocable, $CAT_C background)"
echo "  Agents:   $AGENT_COUNT"
echo "  Commands: $CMD_COUNT"
echo "  Hooks:    $HOOK_COUNT"
echo "  Rules:    $RULE_COUNT"
echo ""

if [ "$DRY_RUN" = "false" ]; then
  TOTAL_SIZE=$(du -sh "$DIST_DIR" 2>/dev/null | cut -f1)
  echo "  Output:   $DIST_DIR ($TOTAL_SIZE)"
  echo "  Manifest: $DIST_DIR/plugin.json"
else
  echo "  (dry run — no files written)"
fi
echo ""
echo "To install in a project:"
echo "  cp -r $DIST_DIR/.claude/ /path/to/project/.claude/"
