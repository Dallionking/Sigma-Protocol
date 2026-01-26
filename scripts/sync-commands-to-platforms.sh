#!/bin/bash
# sync-commands-to-platforms.sh
# Syncs commands from .claude/commands/ to platform directories
# Ensures platform parity for commands

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MASTER_COMMANDS="$PROJECT_ROOT/.claude/commands"
CLAUDE_CODE_COMMANDS="$PROJECT_ROOT/platforms/claude-code/commands"
OPENCODE_COMMANDS="$PROJECT_ROOT/platforms/opencode/commands"

echo "=== Sigma Protocol Command Sync ==="
echo "Source: $MASTER_COMMANDS"
echo ""

# Ensure target directories exist
mkdir -p "$CLAUDE_CODE_COMMANDS"
mkdir -p "$OPENCODE_COMMANDS"

# Count existing
master_count=$(ls -1 "$MASTER_COMMANDS"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Master commands: $master_count"

claude_synced=0
opencode_synced=0

# Sync to Claude Code platform
echo ""
echo "Syncing to Claude Code platform..."
for cmd_file in "$MASTER_COMMANDS"/*.md; do
    [[ ! -f "$cmd_file" ]] && continue

    cmd_name=$(basename "$cmd_file")
    target_file="$CLAUDE_CODE_COMMANDS/$cmd_name"

    # Copy if not exists or if source is newer
    if [[ ! -f "$target_file" ]] || [[ "$cmd_file" -nt "$target_file" ]]; then
        cp "$cmd_file" "$target_file"
        ((claude_synced++))
    fi
done
echo "  Synced: $claude_synced commands"

# Sync to OpenCode platform
echo ""
echo "Syncing to OpenCode platform..."
for cmd_file in "$MASTER_COMMANDS"/*.md; do
    [[ ! -f "$cmd_file" ]] && continue

    cmd_name=$(basename "$cmd_file")
    target_file="$OPENCODE_COMMANDS/$cmd_name"

    # Copy if not exists or if source is newer
    if [[ ! -f "$target_file" ]] || [[ "$cmd_file" -nt "$target_file" ]]; then
        cp "$cmd_file" "$target_file"
        ((opencode_synced++))
    fi
done
echo "  Synced: $opencode_synced commands"

# Handle marketing subdirectory if it exists
if [[ -d "$MASTER_COMMANDS/marketing" ]]; then
    echo ""
    echo "Syncing marketing subcommands..."
    mkdir -p "$CLAUDE_CODE_COMMANDS/marketing"
    mkdir -p "$OPENCODE_COMMANDS/marketing"

    marketing_synced=0
    for cmd_file in "$MASTER_COMMANDS/marketing"/*.md; do
        [[ ! -f "$cmd_file" ]] && continue

        cmd_name=$(basename "$cmd_file")

        # Claude Code
        target_file="$CLAUDE_CODE_COMMANDS/marketing/$cmd_name"
        if [[ ! -f "$target_file" ]] || [[ "$cmd_file" -nt "$target_file" ]]; then
            cp "$cmd_file" "$target_file"
        fi

        # OpenCode
        target_file="$OPENCODE_COMMANDS/marketing/$cmd_name"
        if [[ ! -f "$target_file" ]] || [[ "$cmd_file" -nt "$target_file" ]]; then
            cp "$cmd_file" "$target_file"
        fi

        ((marketing_synced++))
    done
    echo "  Synced: $marketing_synced marketing commands"
fi

# Final counts
echo ""
echo "=== Sync Complete ==="
echo "Claude Code: $(ls -1 "$CLAUDE_CODE_COMMANDS"/*.md 2>/dev/null | wc -l | tr -d ' ') commands"
echo "OpenCode: $(ls -1 "$OPENCODE_COMMANDS"/*.md 2>/dev/null | wc -l | tr -d ' ') commands"
