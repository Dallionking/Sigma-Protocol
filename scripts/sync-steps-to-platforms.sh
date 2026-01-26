#!/bin/bash
# sync-steps-to-platforms.sh
# Syncs step templates from templates/steps/ to all platform directories
# Creates condensed .mdc versions for Cursor

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source directory
TEMPLATES_STEPS="$PROJECT_ROOT/templates/steps"

# Target directories
CLAUDE_COMMANDS="$PROJECT_ROOT/.claude/commands"
OPENCODE_COMMANDS="$PROJECT_ROOT/platforms/opencode/commands"
FACTORY_COMMANDS="$PROJECT_ROOT/.factory/commands"
CURSOR_RULES="$PROJECT_ROOT/.cursor/rules"

echo "=== Sigma Protocol Step Sync ==="
echo "Source: $TEMPLATES_STEPS"
echo ""

# Check source directory exists
if [[ ! -d "$TEMPLATES_STEPS" ]]; then
    echo "ERROR: Source directory not found: $TEMPLATES_STEPS"
    exit 1
fi

# Count source files
source_count=$(ls -1 "$TEMPLATES_STEPS"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Source step files: $source_count"
echo ""

# Ensure target directories exist
echo "Creating target directories..."
mkdir -p "$CLAUDE_COMMANDS"
mkdir -p "$OPENCODE_COMMANDS"
mkdir -p "$FACTORY_COMMANDS"
mkdir -p "$CURSOR_RULES"

# Counters
claude_synced=0
opencode_synced=0
factory_synced=0
cursor_synced=0

# Get step description from file content
get_step_description() {
    local file="$1"
    local basename=$(basename "$file" .md)
    
    # Try to extract from **Mission** line or first meaningful description
    local mission=$(grep -m1 "^\*\*Mission\*\*" "$file" 2>/dev/null | sed 's/\*\*Mission\*\*//g' | tr -d '*' | xargs)
    
    if [[ -n "$mission" ]]; then
        echo "$mission" | head -c 100
        return
    fi
    
    # Fallback: generate from filename
    case "$basename" in
        step-0-environment-setup) echo "Environment setup and project initialization" ;;
        step-1-ideation) echo "Product ideation with Hormozi Value Equation" ;;
        step-1.5-offer-architecture) echo "Offer architecture and pricing strategy" ;;
        step-2-architecture) echo "System architecture design" ;;
        step-3-ux-design) echo "UX/UI design and user flows" ;;
        step-4-flow-tree) echo "Navigation flow and screen inventory" ;;
        step-5-wireframe-prototypes) echo "Wireframe prototypes generation" ;;
        step-5a-prototype-prep) echo "Prototype preparation and component mapping" ;;
        step-5b-prd-to-json) echo "Convert prototype PRDs to JSON for Ralph mode" ;;
        step-6-design-system) echo "Design system and tokens" ;;
        step-7-interface-states) echo "Interface state specifications" ;;
        step-8-technical-spec) echo "Technical specifications" ;;
        step-9-landing-page) echo "Landing page design" ;;
        step-10-feature-breakdown) echo "Feature breakdown and epic decomposition" ;;
        step-11-prd-generation) echo "PRD generation for implementation" ;;
        step-11a-prd-to-json) echo "Convert implementation PRDs to JSON" ;;
        step-11b-prd-swarm) echo "PRD swarm orchestration" ;;
        step-12-context-engine) echo "Context engine setup for coding assistants" ;;
        step-13-skillpack-generator) echo "Generate project-specific skillpack" ;;
        step-verify|validate-methodology) echo "Verify step completion and quality gates" ;;
        dev-loop) echo "Continuous development loop execution" ;;
        *) echo "Sigma Protocol step: $basename" ;;
    esac
}

# Create condensed MDC version for Cursor
create_cursor_mdc() {
    local source_file="$1"
    local target_file="$2"
    local description="$3"
    
    # Extract key sections: Mission, Core Workflow/Phases, Verification/Output
    local content=""
    
    # Start with YAML frontmatter
    cat > "$target_file" << MDC_HEADER
---
description: "$description"
globs: ["docs/**/*.md", "*.md", "CLAUDE.md"]
alwaysApply: false
---

MDC_HEADER
    
    # Extract Mission section (first 50 lines after Mission or start)
    local in_mission=false
    local in_phase=false
    local in_output=false
    local in_verification=false
    local line_count=0
    local section_lines=0
    
    while IFS= read -r line; do
        ((line_count++))
        
        # Include frontmatter and title
        if [[ $line_count -le 15 ]]; then
            # Skip the original frontmatter but keep title
            if [[ "$line" =~ ^#[^#] ]]; then
                echo "$line" >> "$target_file"
                echo "" >> "$target_file"
            fi
            continue
        fi
        
        # Look for Mission section
        if [[ "$line" =~ ^\*\*Mission\*\* ]] || [[ "$line" =~ ^##.*Mission ]]; then
            in_mission=true
            echo "## Mission" >> "$target_file"
            echo "" >> "$target_file"
            section_lines=0
            continue
        fi
        
        # Look for Core Workflow/Phase sections
        if [[ "$line" =~ ^##.*Phase.*[0-9] ]] || [[ "$line" =~ ^##.*Workflow ]] || [[ "$line" =~ ^##.*Core ]]; then
            in_mission=false
            in_phase=true
            in_output=false
            in_verification=false
            echo "" >> "$target_file"
            echo "$line" >> "$target_file"
            section_lines=0
            continue
        fi
        
        # Look for Output/Handoff sections
        if [[ "$line" =~ ^##.*Output ]] || [[ "$line" =~ ^##.*Handoff ]] || [[ "$line" =~ ^##.*Deliverables ]]; then
            in_mission=false
            in_phase=false
            in_output=true
            in_verification=false
            echo "" >> "$target_file"
            echo "$line" >> "$target_file"
            section_lines=0
            continue
        fi
        
        # Look for Verification sections
        if [[ "$line" =~ ^##.*Verification ]] || [[ "$line" =~ ^##.*Quality ]] || [[ "$line" =~ ^##.*Checklist ]]; then
            in_mission=false
            in_phase=false
            in_output=false
            in_verification=true
            echo "" >> "$target_file"
            echo "$line" >> "$target_file"
            section_lines=0
            continue
        fi
        
        # Stop section on next ## header
        if [[ "$line" =~ ^## ]] && [[ ! "$line" =~ Phase ]] && [[ ! "$line" =~ Verification ]] && [[ ! "$line" =~ Output ]]; then
            in_mission=false
            in_phase=false
            in_output=false
            in_verification=false
        fi
        
        # Output content with section limits
        if $in_mission && [[ $section_lines -lt 20 ]]; then
            echo "$line" >> "$target_file"
            ((section_lines++))
        elif $in_phase && [[ $section_lines -lt 40 ]]; then
            echo "$line" >> "$target_file"
            ((section_lines++))
        elif $in_output && [[ $section_lines -lt 30 ]]; then
            echo "$line" >> "$target_file"
            ((section_lines++))
        elif $in_verification && [[ $section_lines -lt 25 ]]; then
            echo "$line" >> "$target_file"
            ((section_lines++))
        fi
        
    done < "$source_file"
    
    # Add reference to full documentation
    echo "" >> "$target_file"
    echo "---" >> "$target_file"
    echo "" >> "$target_file"
    echo "*This is a condensed version. See \`templates/steps/$(basename "$source_file")\` for full documentation.*" >> "$target_file"
}

# Sync to Claude Code (.claude/commands/)
echo "--- Syncing to Claude Code (.claude/commands/) ---"
for step_file in "$TEMPLATES_STEPS"/*.md; do
    [[ ! -f "$step_file" ]] && continue
    
    step_name=$(basename "$step_file")
    target_file="$CLAUDE_COMMANDS/$step_name"
    
    # Copy if not exists or source is newer
    if [[ ! -f "$target_file" ]] || [[ "$step_file" -nt "$target_file" ]]; then
        cp "$step_file" "$target_file"
        echo "  [+] $step_name"
        ((claude_synced++))
    else
        echo "  [=] $step_name (up to date)"
    fi
done
echo "  Total synced: $claude_synced"
echo ""

# Sync to OpenCode (platforms/opencode/commands/)
echo "--- Syncing to OpenCode (platforms/opencode/commands/) ---"
for step_file in "$TEMPLATES_STEPS"/*.md; do
    [[ ! -f "$step_file" ]] && continue
    
    step_name=$(basename "$step_file")
    target_file="$OPENCODE_COMMANDS/$step_name"
    
    if [[ ! -f "$target_file" ]] || [[ "$step_file" -nt "$target_file" ]]; then
        cp "$step_file" "$target_file"
        echo "  [+] $step_name"
        ((opencode_synced++))
    else
        echo "  [=] $step_name (up to date)"
    fi
done
echo "  Total synced: $opencode_synced"
echo ""

# Sync to Factory Droid (.factory/commands/)
echo "--- Syncing to Factory Droid (.factory/commands/) ---"
for step_file in "$TEMPLATES_STEPS"/*.md; do
    [[ ! -f "$step_file" ]] && continue
    
    step_name=$(basename "$step_file")
    target_file="$FACTORY_COMMANDS/$step_name"
    
    if [[ ! -f "$target_file" ]] || [[ "$step_file" -nt "$target_file" ]]; then
        cp "$step_file" "$target_file"
        echo "  [+] $step_name"
        ((factory_synced++))
    else
        echo "  [=] $step_name (up to date)"
    fi
done
echo "  Total synced: $factory_synced"
echo ""

# Create condensed .mdc versions for Cursor
echo "--- Creating Cursor .mdc files (.cursor/rules/) ---"
for step_file in "$TEMPLATES_STEPS"/*.md; do
    [[ ! -f "$step_file" ]] && continue
    
    step_basename=$(basename "$step_file" .md)
    
    # Handle step-verify -> validate-methodology naming
    if [[ "$step_basename" == "step-verify" ]]; then
        target_name="validate-methodology.mdc"
    else
        target_name="${step_basename}.mdc"
    fi
    
    target_file="$CURSOR_RULES/$target_name"
    description=$(get_step_description "$step_file")
    
    # Always recreate .mdc files to ensure they're properly condensed
    if [[ ! -f "$target_file" ]] || [[ "$step_file" -nt "$target_file" ]]; then
        create_cursor_mdc "$step_file" "$target_file" "$description"
        echo "  [+] $target_name"
        ((cursor_synced++))
    else
        echo "  [=] $target_name (up to date)"
    fi
done
echo "  Total synced: $cursor_synced"
echo ""

# Summary
echo "=== Sync Complete ==="
echo "Claude Code:   $claude_synced files synced to .claude/commands/"
echo "OpenCode:      $opencode_synced files synced to platforms/opencode/commands/"
echo "Factory Droid: $factory_synced files synced to .factory/commands/"
echo "Cursor:        $cursor_synced .mdc files created in .cursor/rules/"
echo ""
echo "Total source steps: $source_count"
