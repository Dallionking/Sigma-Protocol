#!/bin/bash
# Sigma Protocol Installer for Claude Code
# Installs commands, skills, and agents into ~/.claude/

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m'

# Defaults
FORCE=false
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f) FORCE=true; shift ;;
        --dry-run|-n) DRY_RUN=true; shift ;;
        --help|-h)
            echo "Usage: install-claude-code.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --force     Override all existing files"
            echo "  -n, --dry-run   Preview only, don't modify files"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(dirname "$SCRIPT_DIR")"

# Claude Code directories
CLAUDE_HOME="$HOME/.claude"
CLAUDE_COMMANDS="$CLAUDE_HOME/commands"
CLAUDE_SKILLS="$CLAUDE_HOME/skills"
CLAUDE_AGENTS="$CLAUDE_HOME/agents"

echo -e "${MAGENTA}\n🚀 Sigma Protocol Installer for Claude Code\n${NC}"
echo -e "${GRAY}Source: $SOURCE_ROOT${NC}"
echo -e "${GRAY}Target: $CLAUDE_HOME${NC}"

# Create directories
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$CLAUDE_COMMANDS/steps"
    mkdir -p "$CLAUDE_COMMANDS/audit"
    mkdir -p "$CLAUDE_COMMANDS/deploy"
    mkdir -p "$CLAUDE_COMMANDS/dev"
    mkdir -p "$CLAUDE_COMMANDS/generators"
    mkdir -p "$CLAUDE_COMMANDS/marketing"
    mkdir -p "$CLAUDE_COMMANDS/ops"
    mkdir -p "$CLAUDE_SKILLS"
    mkdir -p "$CLAUDE_AGENTS"
    echo -e "${GREEN}✅ Created ~/.claude directory structure${NC}"
else
    echo -e "${YELLOW}📋 DRY RUN: Would create ~/.claude directory structure${NC}"
fi

# Counters
ADDED=0
UPDATED=0
SKIPPED=0

# =============================================================================
# Install Step Commands (steps/)
# =============================================================================
echo -e "${CYAN}\n📦 Installing step commands (steps/) ...${NC}"

STEPS_DIR="$SOURCE_ROOT/steps"
if [ -d "$STEPS_DIR" ]; then
    for file in "$STEPS_DIR"/*; do
        [ -f "$file" ] || continue
        FILENAME=$(basename "$file")
        TARGET="$CLAUDE_COMMANDS/steps/$FILENAME"

        if [ -f "$TARGET" ] && [ "$FORCE" = false ]; then
            echo -e "  ${GRAY}⏭️  Skipped (exists): steps/$FILENAME${NC}"
            ((SKIPPED++)) || true
        else
            if [ "$DRY_RUN" = false ]; then
                cp "$file" "$TARGET"
            fi
            echo -e "  ${GREEN}✅ Installed: steps/$FILENAME${NC}"
            ((ADDED++)) || true
        fi
    done
else
    echo -e "${RED}❌ steps/ not found at $STEPS_DIR${NC}"
fi

# =============================================================================
# Install Command Categories (audit, deploy, dev, etc.)
# =============================================================================
COMMAND_FOLDERS=("audit" "deploy" "dev" "generators" "marketing" "ops")

for folder in "${COMMAND_FOLDERS[@]}"; do
    SOURCE_FOLDER="$SOURCE_ROOT/$folder"
    TARGET_FOLDER="$CLAUDE_COMMANDS/$folder"
    
    if [ ! -d "$SOURCE_FOLDER" ]; then
        continue
    fi
    
    echo -e "${CYAN}\n📦 Installing $folder commands...${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TARGET_FOLDER"
    fi
    
    for file in "$SOURCE_FOLDER"/*; do
        [ -f "$file" ] || continue
        FILENAME=$(basename "$file")
        
        # Skip non-markdown files
        if [[ ! "$FILENAME" =~ \.(md|mdc)$ ]]; then
            continue
        fi
        
        TARGET="$TARGET_FOLDER/$FILENAME"
        
        if [ -f "$TARGET" ] && [ "$FORCE" = false ]; then
            ((SKIPPED++)) || true
        else
            if [ "$DRY_RUN" = false ]; then
                cp "$file" "$TARGET"
            fi
            echo -e "  ${GREEN}✅ $folder/$FILENAME${NC}"
            ((ADDED++)) || true
        fi
    done
done

# =============================================================================
# Install Skills from platforms/claude-code/skills/
# =============================================================================
echo -e "${CYAN}\n📦 Installing Claude Code skills...${NC}"

PLATFORM_SKILLS="$SOURCE_ROOT/platforms/claude-code/skills"
if [ -d "$PLATFORM_SKILLS" ]; then
    for skill_dir in "$PLATFORM_SKILLS"/*/; do
        [ -d "$skill_dir" ] || continue
        SKILL_NAME=$(basename "$skill_dir")
        TARGET_SKILL="$CLAUDE_SKILLS/$SKILL_NAME"
        
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$TARGET_SKILL"
        fi
        
        for file in "$skill_dir"*; do
            [ -f "$file" ] || continue
            FILENAME=$(basename "$file")
            
            if [ "$DRY_RUN" = false ]; then
                cp "$file" "$TARGET_SKILL/$FILENAME"
            fi
        done
        
        echo -e "  ${GREEN}✅ Skill: $SKILL_NAME${NC}"
        ((ADDED++)) || true
    done
fi

# =============================================================================
# Install Agents from src/agents/
# =============================================================================
echo -e "${CYAN}\n📦 Installing agents...${NC}"

AGENTS_DIR="$SOURCE_ROOT/src/agents"
if [ -d "$AGENTS_DIR" ]; then
    for file in "$AGENTS_DIR"/*.md; do
        [ -f "$file" ] || continue
        FILENAME=$(basename "$file")
        TARGET="$CLAUDE_AGENTS/$FILENAME"
        
        if [ -f "$TARGET" ] && [ "$FORCE" = false ]; then
            ((SKIPPED++)) || true
        else
            if [ "$DRY_RUN" = false ]; then
                cp "$file" "$TARGET"
            fi
            echo -e "  ${GREEN}✅ Agent: $FILENAME${NC}"
            ((ADDED++)) || true
        fi
    done
fi

# =============================================================================
# Create sigma-methodology command
# =============================================================================
echo -e "${CYAN}\n📦 Creating sigma-methodology command...${NC}"

SIGMA_METHODOLOGY="$CLAUDE_COMMANDS/sigma-methodology.md"
if [ ! -f "$SIGMA_METHODOLOGY" ] || [ "$FORCE" = true ]; then
    if [ "$DRY_RUN" = false ]; then
        cat > "$SIGMA_METHODOLOGY" << 'EOF'
# Sigma Methodology - Full 0-13 Step Execution

Execute the complete Sigma 13-step methodology in a single terminal.

## Usage
```
/sigma-methodology [PROJECT_NAME]
```

## Pre-Flight
Run `/danger` first for dangerously-skip-permissions mode.

## Step Sequence

Execute each step in order, do NOT stop between steps:

| # | Command | Output |
|---|---------|--------|
| 0 | /step-0-environment-setup | Project scaffold |
| 1 | /step-1-ideation | MASTER_PRD.md |
| 1.5 | /step-1.5-offer-architecture | OFFER_ARCHITECTURE.md (if monetized) |
| 2 | /step-2-architecture | ARCHITECTURE.md |
| 3 | /step-3-ux-design | UX-DESIGN.md |
| 4 | /step-4-flow-tree | FLOW-TREE.md |
| 5 | /step-5-wireframe-prototypes | wireframes/ (optional) |
| 6 | /step-6-design-system | DESIGN-SYSTEM.md |
| 7 | /step-7-interface-states | STATE-SPEC.md |
| 8 | /step-8-technical-spec | TECHNICAL-SPEC.md |
| 9 | /step-9-landing-page | landing/ (optional) |
| 10 | /step-10-feature-breakdown | FEATURE-BREAKDOWN.md |
| 11 | /step-11-prd-generation | docs/prds/*.md |
| 11b | /step-11b-prd-swarm | parallel PRDs (optional) |
| 12 | /step-12-context-engine | .cursorrules, CLAUDE.md |
| 13 | /step-13-skillpack-generator | project skills |

## Rules
- Use MCP tools: Exa for research, GitHub for repos
- Quality gate: 80+ for required steps, 75+ for optional
- Edit existing files, create new if missing
- Save state to .sigma/methodology-state.json after each step

## Start
Ask for project name, then begin Step 0.
EOF
    fi
    echo -e "  ${GREEN}✅ Created: sigma-methodology.md${NC}"
    ((ADDED++)) || true
fi

# =============================================================================
# Summary
# =============================================================================
echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 Installation Summary${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Added:   $ADDED files${NC}"
echo -e "${GRAY}   Skipped: $SKIPPED files (use --force to override)${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}\n⚠️  DRY RUN - No files were modified${NC}"
fi

echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Next steps
echo -e "${CYAN}\n🎯 Next Steps:${NC}"
echo -e "   1. Restart Claude Code to load new commands"
echo -e "   2. Run: /danger"
echo -e "   3. Run: /sigma-methodology YourProjectName"
echo -e ""
echo -e "${CYAN}📁 Installed locations:${NC}"
echo -e "   Commands: ~/.claude/commands/"
echo -e "   Steps:    ~/.claude/commands/steps/"
echo -e "   Skills:   ~/.claude/skills/"
echo -e "   Agents:   ~/.claude/agents/"

echo -e "${GREEN}\n✅ Sigma Protocol installed for Claude Code!${NC}\n"

