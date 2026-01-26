#!/bin/bash
# Sigma OpenCode Configuration Installer
# Installs Sigma commands, skills, and agents into ~/.config/opencode/
# for global availability across all projects

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Defaults
FORCE=false
DRY_RUN=false
BACKUP=false
VERBOSE=false
SKILLS_ONLY=false
AGENTS_ONLY=false
COMMANDS_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f) FORCE=true; shift ;;
        --dry-run|-n) DRY_RUN=true; shift ;;
        --backup|-b) BACKUP=true; shift ;;
        --verbose|-v) VERBOSE=true; shift ;;
        --skills-only) SKILLS_ONLY=true; shift ;;
        --agents-only) AGENTS_ONLY=true; shift ;;
        --commands-only) COMMANDS_ONLY=true; shift ;;
        --help|-h)
            echo "Usage: install-opencode-config.sh [OPTIONS]"
            echo ""
            echo "Installs Sigma Protocol commands, skills, and agents into OpenCode's"
            echo "global configuration directory (~/.config/opencode/)."
            echo ""
            echo "Options:"
            echo "  -f, --force          Override all existing files"
            echo "  -n, --dry-run        Preview only, don't modify files"
            echo "  -b, --backup         Backup files before overriding"
            echo "  -v, --verbose        Show detailed output"
            echo "  --skills-only        Only install skills"
            echo "  --agents-only        Only install agents"
            echo "  --commands-only      Only install commands"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "After installation, commands are available in OpenCode as:"
            echo "  /step-1-ideation     - Run ideation step"
            echo "  /audit/gap-analysis  - Run gap analysis"
            echo "  @sigma               - Use primary Sigma agent"
            echo "  @sigma-researcher      - Use researcher subagent"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Get script directory and source root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(dirname "$SCRIPT_DIR")"

# OpenCode config directory
OPENCODE_CONFIG="$HOME/.config/opencode"

# Target directories
TARGET_SKILLS="$OPENCODE_CONFIG/skill"
TARGET_AGENTS="$OPENCODE_CONFIG/agent"
TARGET_COMMANDS="$OPENCODE_CONFIG/command"
TARGET_PLUGINS="$OPENCODE_CONFIG/plugin"

# Counters
ADDED=0
UPDATED=0
SKIPPED=0
BACKED=0
ERRORS=0

# Utility functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${GRAY}   $1${NC}"
    fi
}

# Check if we should install all or specific components
should_install_all() {
    if [ "$SKILLS_ONLY" = false ] && [ "$AGENTS_ONLY" = false ] && [ "$COMMANDS_ONLY" = false ]; then
        return 0  # true - install all
    fi
    return 1  # false - install specific
}

# Copy file with smart comparison
copy_file() {
    local source="$1"
    local target="$2"
    local display_name="$3"
    
    # Ensure parent directory exists
    local target_parent=$(dirname "$target")
    if [ "$DRY_RUN" = false ] && [ ! -d "$target_parent" ]; then
        mkdir -p "$target_parent"
    fi
    
    if [ -f "$target" ]; then
        if [ "$FORCE" = true ]; then
            # Force override
            if [ "$BACKUP" = true ]; then
                local backup_path="$target.backup-$(date +%Y%m%d-%H%M%S)"
                if [ "$DRY_RUN" = false ]; then
                    cp "$target" "$backup_path"
                fi
                ((BACKED++)) || true
                log_verbose "Backed up: $display_name"
            fi
            
            if [ "$DRY_RUN" = false ]; then
                cp "$source" "$target"
            fi
            ((UPDATED++)) || true
            echo -e "  ${YELLOW}🔄 Overrode: $display_name${NC}"
        else
            # Smart comparison using checksums
            local source_hash=$(md5sum "$source" 2>/dev/null | cut -d' ' -f1 || shasum "$source" 2>/dev/null | cut -d' ' -f1)
            local target_hash=$(md5sum "$target" 2>/dev/null | cut -d' ' -f1 || shasum "$target" 2>/dev/null | cut -d' ' -f1)
            
            if [ "$source_hash" != "$target_hash" ]; then
                if [ "$BACKUP" = true ]; then
                    local backup_path="$target.backup-$(date +%Y%m%d-%H%M%S)"
                    if [ "$DRY_RUN" = false ]; then
                        cp "$target" "$backup_path"
                    fi
                    ((BACKED++)) || true
                fi
                
                if [ "$DRY_RUN" = false ]; then
                    cp "$source" "$target"
                fi
                ((UPDATED++)) || true
                echo -e "  ${CYAN}✏️  Updated: $display_name${NC}"
            else
                ((SKIPPED++)) || true
                log_verbose "Skipped (unchanged): $display_name"
            fi
        fi
    else
        # New file - add it
        if [ "$DRY_RUN" = false ]; then
            cp "$source" "$target"
        fi
        ((ADDED++)) || true
        echo -e "  ${GREEN}✅ Added: $display_name${NC}"
    fi
}

# Header
echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           Sigma Protocol - OpenCode Configuration Installer         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GRAY}Source: $SOURCE_ROOT${NC}"
echo -e "${GRAY}Target: $OPENCODE_CONFIG${NC}"
echo ""

# Check if OpenCode is installed
if ! command -v opencode &> /dev/null; then
    log_warning "OpenCode CLI not found. Install it first:"
    echo -e "  ${CYAN}curl -fsSL https://opencode.ai/install | bash${NC}"
    echo -e "  ${GRAY}or: npm install -g opencode${NC}"
    echo ""
    echo -e "${YELLOW}Continuing with configuration installation anyway...${NC}"
    echo ""
fi

# Create directory structure
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_SKILLS"
    mkdir -p "$TARGET_AGENTS"
    mkdir -p "$TARGET_COMMANDS"
    mkdir -p "$TARGET_PLUGINS"
    log_success "Created OpenCode directory structure"
else
    echo -e "${YELLOW}📋 DRY RUN: Would create OpenCode directory structure${NC}"
fi

# ══════════════════════════════════════════════════════════════════
# PHASE 1: Install Foundation Skills
# ══════════════════════════════════════════════════════════════════

if should_install_all || [ "$SKILLS_ONLY" = true ]; then
    echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}📚 Phase 1: Installing Foundation Skills${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    SKILLS_SOURCE="$SOURCE_ROOT/platforms/opencode/skill"
    
    if [ -d "$SKILLS_SOURCE" ]; then
        skill_count=0
        for skill_dir in "$SKILLS_SOURCE"/*/; do
            if [ -d "$skill_dir" ]; then
                skill_name=$(basename "$skill_dir")
                skill_file="$skill_dir/SKILL.md"
                
                if [ -f "$skill_file" ]; then
                    # Create skill directory and copy SKILL.md
                    target_skill_dir="$TARGET_SKILLS/$skill_name"
                    if [ "$DRY_RUN" = false ]; then
                        mkdir -p "$target_skill_dir"
                    fi
                    copy_file "$skill_file" "$target_skill_dir/SKILL.md" "skill/$skill_name"
                    ((skill_count++)) || true
                fi
            fi
        done
        log_info "Processed $skill_count skills"
    else
        log_warning "Skills source not found: $SKILLS_SOURCE"
    fi
fi

# ══════════════════════════════════════════════════════════════════
# PHASE 2: Install Sigma Agents
# ══════════════════════════════════════════════════════════════════

if should_install_all || [ "$AGENTS_ONLY" = true ]; then
    echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🤖 Phase 2: Installing Sigma Agents${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    AGENTS_SOURCE="$SOURCE_ROOT/platforms/opencode/agent"
    
    if [ -d "$AGENTS_SOURCE" ]; then
        agent_count=0
        for agent_file in "$AGENTS_SOURCE"/*.md; do
            if [ -f "$agent_file" ]; then
                agent_name=$(basename "$agent_file")
                copy_file "$agent_file" "$TARGET_AGENTS/$agent_name" "agent/$agent_name"
                ((agent_count++)) || true
            fi
        done
        log_info "Processed $agent_count agents"
    else
        log_warning "Agents source not found: $AGENTS_SOURCE"
        log_info "Run this script after creating agents in platforms/opencode/agent/"
    fi
fi

# ══════════════════════════════════════════════════════════════════
# PHASE 3: Install Commands
# ══════════════════════════════════════════════════════════════════

if should_install_all || [ "$COMMANDS_ONLY" = true ]; then
    echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}⚡ Phase 3: Installing Commands${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Command folders to process
    COMMAND_FOLDERS=("steps" "audit" "deploy" "dev" "generators" "marketing" "ops")
    
    for folder in "${COMMAND_FOLDERS[@]}"; do
        FOLDER_PATH="$SOURCE_ROOT/$folder"
        
        if [ ! -d "$FOLDER_PATH" ]; then
            log_verbose "Folder not found: $folder"
            continue
        fi
        
        echo -e "${CYAN}\n📁 Processing $folder/...${NC}"
        
        # Create target subfolder
        TARGET_SUBFOLDER="$TARGET_COMMANDS/$folder"
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$TARGET_SUBFOLDER"
        fi
        
        # Process command files (skip .mdc rules, README, and nested directories)
        find "$FOLDER_PATH" -maxdepth 1 -type f ! -name "*.mdc" ! -name "README.md" ! -name "*.json" | while read -r file; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                # Convert to .md extension for OpenCode if needed
                if [[ "$filename" != *.md ]]; then
                    target_filename="${filename}.md"
                else
                    target_filename="$filename"
                fi
                copy_file "$file" "$TARGET_SUBFOLDER/$target_filename" "$folder/$filename"
            fi
        done
    done
fi

# ══════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 Installation Summary${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Added:   $ADDED files${NC}"
echo -e "${CYAN}   Updated: $UPDATED files${NC}"
echo -e "${GRAY}   Skipped: $SKIPPED files${NC}"
echo -e "${YELLOW}   Backed:  $BACKED files${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}\n⚠️  DRY RUN - No files were actually modified${NC}"
    echo -e "${YELLOW}   Run without --dry-run to apply changes${NC}"
fi

echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Next steps
if [ "$DRY_RUN" = false ]; then
    echo -e "${CYAN}\n🎯 Next Steps:${NC}"
    echo -e "   1. Start OpenCode in any project: ${GREEN}opencode${NC}"
    echo -e "   2. Use Sigma commands: ${GREEN}/step-1-ideation${NC}"
    echo -e "   3. Use Sigma agents: ${GREEN}@sigma${NC} or ${GREEN}@sigma-researcher${NC}"
    echo -e "   4. List available commands: ${GREEN}/help${NC}"
    echo ""
    echo -e "${CYAN}📂 Installed to:${NC}"
    echo -e "   Skills:   $TARGET_SKILLS"
    echo -e "   Agents:   $TARGET_AGENTS"
    echo -e "   Commands: $TARGET_COMMANDS"
fi

echo -e "${GREEN}\n✅ OpenCode configuration installation complete!${NC}\n"





