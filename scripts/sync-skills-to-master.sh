#!/bin/bash
# sync-skills-to-master.sh
# Syncs skills from platforms/claude-code/skills/ to .claude/skills/
# Maintains flat .md file structure in .claude/skills/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PLATFORM_SKILLS="$PROJECT_ROOT/platforms/claude-code/skills"
MASTER_SKILLS="$PROJECT_ROOT/.claude/skills"

echo "=== Sigma Protocol Skills Sync ==="
echo "Source: $PLATFORM_SKILLS"
echo "Target: $MASTER_SKILLS"
echo ""

# Ensure target directory exists
mkdir -p "$MASTER_SKILLS"

# Count existing
existing_count=$(ls -1 "$MASTER_SKILLS"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Existing skills in master: $existing_count"

synced=0
skipped=0

# Iterate through platform skill directories
for skill_dir in "$PLATFORM_SKILLS"/*/; do
    skill_name=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    target_file="$MASTER_SKILLS/${skill_name}.md"

    # Skip if SKILL.md doesn't exist
    if [[ ! -f "$skill_file" ]]; then
        echo "  WARN: No SKILL.md in $skill_name"
        continue
    fi

    # Skip if target already exists
    if [[ -f "$target_file" ]]; then
        ((skipped++))
        continue
    fi

    # Copy the skill
    cp "$skill_file" "$target_file"
    echo "  SYNC: $skill_name"
    ((synced++))
done

# Final count
final_count=$(ls -1 "$MASTER_SKILLS"/*.md 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "=== Sync Complete ==="
echo "Synced: $synced skills"
echo "Skipped (already exist): $skipped skills"
echo "Total skills in master: $final_count"
