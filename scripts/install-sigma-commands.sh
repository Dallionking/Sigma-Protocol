#!/bin/bash
# Sigma Commands Installer (Bash version)
# Installs Sigma commands into .cursor/ structure with folder preservation

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

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f) FORCE=true; shift ;;
        --dry-run|-n) DRY_RUN=true; shift ;;
        --backup|-b) BACKUP=true; shift ;;
        --verbose|-v) VERBOSE=true; shift ;;
        --help|-h)
            echo "Usage: install-sigma-commands.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --force     Override all existing files"
            echo "  -n, --dry-run   Preview only, don't modify files"
            echo "  -b, --backup    Backup files before overriding"
            echo "  -v, --verbose   Show detailed output"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(dirname "$SCRIPT_DIR")"

TARGET_COMMANDS=".cursor/commands"
TARGET_RULES=".cursor/rules"

# Counters
ADDED=0
UPDATED=0
SKIPPED=0
BACKED=0
ERRORS=0

echo -e "${MAGENTA}\n🚀 Sigma Commands Installer\n${NC}"
echo -e "${GRAY}Source: $SOURCE_ROOT${NC}"
echo -e "${GRAY}Target: $TARGET_COMMANDS (commands), $TARGET_RULES (rules)${NC}"

# Create target directories
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_COMMANDS"
    mkdir -p "$TARGET_RULES"
    echo -e "${GREEN}✅ Created .cursor directory structure${NC}"
else
    echo -e "${YELLOW}📋 DRY RUN: Would create .cursor directory structure${NC}"
fi

# Define command folders
COMMAND_FOLDERS=("steps" "audit" "deploy" "dev" "generators" "marketing" "ops" "Magic UI")

echo -e "${CYAN}\n📦 Processing command files...${NC}"

for folder in "${COMMAND_FOLDERS[@]}"; do
    FOLDER_PATH="$SOURCE_ROOT/$folder"
    
    if [ ! -d "$FOLDER_PATH" ]; then
        if [ "$VERBOSE" = true ]; then
            echo -e "${YELLOW}⚠️  Folder not found: $folder${NC}"
        fi
        continue
    fi
    
    echo -e "${CYAN}\n📁 Processing $folder/...${NC}"
    
    # Create target subfolder
    TARGET_SUBFOLDER="$TARGET_COMMANDS/$folder"
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TARGET_SUBFOLDER"
    fi
    
    # Process files
    find "$FOLDER_PATH" -type f | while read -r file; do
        RELATIVE_PATH="${file#$FOLDER_PATH/}"
        FILENAME=$(basename "$file")
        EXTENSION="${FILENAME##*.}"
        
        if [ "$EXTENSION" = "mdc" ]; then
            # Rules go to .cursor/rules/ flat
            TARGET_PATH="$TARGET_RULES/$FILENAME"
        else
            # Commands go to .cursor/commands/[folder]/ preserving structure
            TARGET_PATH="$TARGET_SUBFOLDER/$RELATIVE_PATH"
            
            # Ensure parent directory exists
            TARGET_PARENT=$(dirname "$TARGET_PATH")
            if [ "$DRY_RUN" = false ] && [ ! -d "$TARGET_PARENT" ]; then
                mkdir -p "$TARGET_PARENT"
            fi
        fi
        
        TARGET_NAME="$folder/$RELATIVE_PATH"
        
        if [ -f "$TARGET_PATH" ]; then
            if [ "$FORCE" = true ]; then
                # Force override
                if [ "$BACKUP" = true ]; then
                    BACKUP_PATH="$TARGET_PATH.backup-$(date +%Y%m%d-%H%M%S)"
                    if [ "$DRY_RUN" = false ]; then
                        cp "$TARGET_PATH" "$BACKUP_PATH"
                    fi
                    ((BACKED++)) || true
                    if [ "$VERBOSE" = true ]; then
                        echo -e "  ${YELLOW}📦 Backed up: $TARGET_NAME${NC}"
                    fi
                fi
                
                if [ "$DRY_RUN" = false ]; then
                    cp "$file" "$TARGET_PATH"
                fi
                ((UPDATED++)) || true
                echo -e "  ${YELLOW}🔄 Overrode: $TARGET_NAME${NC}"
            else
                # Smart comparison
                SOURCE_HASH=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1 || shasum "$file" 2>/dev/null | cut -d' ' -f1)
                TARGET_HASH=$(md5sum "$TARGET_PATH" 2>/dev/null | cut -d' ' -f1 || shasum "$TARGET_PATH" 2>/dev/null | cut -d' ' -f1)
                
                if [ "$SOURCE_HASH" != "$TARGET_HASH" ]; then
                    if [ "$BACKUP" = true ]; then
                        BACKUP_PATH="$TARGET_PATH.backup-$(date +%Y%m%d-%H%M%S)"
                        if [ "$DRY_RUN" = false ]; then
                            cp "$TARGET_PATH" "$BACKUP_PATH"
                        fi
                        ((BACKED++)) || true
                    fi
                    
                    if [ "$DRY_RUN" = false ]; then
                        cp "$file" "$TARGET_PATH"
                    fi
                    ((UPDATED++)) || true
                    echo -e "  ${CYAN}✏️  Updated: $TARGET_NAME${NC}"
                else
                    ((SKIPPED++)) || true
                    if [ "$VERBOSE" = true ]; then
                        echo -e "  ${GRAY}⏭️  Skipped (unchanged): $TARGET_NAME${NC}"
                    fi
                fi
            fi
        else
            # New file - add it
            if [ "$DRY_RUN" = false ]; then
                cp "$file" "$TARGET_PATH"
            fi
            ((ADDED++)) || true
            echo -e "  ${GREEN}✅ Added: $TARGET_NAME${NC}"
        fi
    done
done

# Summary
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

echo -e "${MAGENTA}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${NC}"

# Next steps
if [ "$DRY_RUN" = false ]; then
    echo -e "${CYAN}🎯 Next Steps:${NC}"
    echo -e "   1. Review installed commands in .cursor/commands/"
    echo -e "   2. Review rules in .cursor/rules/"
    echo -e "   3. Run validation: /lint-commands"
    echo -e "   4. Test a command: /step-0-environment-setup"
fi

echo -e "${GREEN}\n✅ Installation complete!${NC}"

