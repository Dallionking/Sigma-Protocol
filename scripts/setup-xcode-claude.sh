#!/bin/bash
set -euo pipefail

# =================================================================
# Xcode 26.3 Claude Agent Integration Setup
# =================================================================
#
# Idempotent setup script that:
# 1. Verifies Xcode 26.3+ is installed
# 2. Verifies xcrun mcpbridge exists
# 3. Symlinks .claude/skills/ and .claude/commands/ to Xcode ClaudeAgentConfig
# 4. Registers the MCP bridge with Claude Code
#
# Usage: ./scripts/setup-xcode-claude.sh [--project-dir <path>]
# =================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Parse arguments
PROJECT_DIR=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --project-dir=*) PROJECT_DIR="${1#*=}"; shift ;;
    --project-dir) PROJECT_DIR="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--project-dir <path>]"
      echo ""
      echo "Sets up Xcode 26.3 Claude Agent integration by symlinking"
      echo "project skills/commands to Xcode's ClaudeAgentConfig directory."
      echo ""
      echo "Options:"
      echo "  --project-dir  Project root directory (default: current directory)"
      echo "  -h, --help     Show this help message"
      exit 0
      ;;
    *) shift ;;
  esac
done

# Resolve project directory
if [[ -z "$PROJECT_DIR" ]]; then
  # Try to find project root (look for .claude/ directory)
  PROJECT_DIR="$PWD"
  while [[ "$PROJECT_DIR" != "/" ]]; do
    if [[ -d "$PROJECT_DIR/.claude" ]]; then
      break
    fi
    PROJECT_DIR="$(dirname "$PROJECT_DIR")"
  done
  if [[ "$PROJECT_DIR" == "/" ]]; then
    log_error "Could not find project root (no .claude/ directory found)"
    exit 1
  fi
fi

XCODE_CONFIG_DIR="$HOME/Library/Developer/Xcode/CodingAssistant/ClaudeAgentConfig"
CLAUDE_SKILLS="$PROJECT_DIR/.claude/skills"
CLAUDE_COMMANDS="$PROJECT_DIR/.claude/commands"

echo "==========================================="
echo " Xcode 26.3 Claude Agent Setup"
echo "==========================================="
echo ""
log_info "Project: $PROJECT_DIR"
echo ""

# -----------------------------------------------------------------
# Step 1: Verify Xcode version
# -----------------------------------------------------------------
log_info "Step 1: Checking Xcode version..."

if ! command -v xcodebuild &>/dev/null; then
  log_error "xcodebuild not found. Install Xcode from the App Store."
  exit 1
fi

XCODE_VERSION=$(xcodebuild -version 2>/dev/null | head -1 | sed 's/Xcode //')
XCODE_MAJOR=$(echo "$XCODE_VERSION" | cut -d. -f1)
XCODE_MINOR=$(echo "$XCODE_VERSION" | cut -d. -f2)

if [[ "$XCODE_MAJOR" -lt 26 ]] || { [[ "$XCODE_MAJOR" -eq 26 ]] && [[ "$XCODE_MINOR" -lt 3 ]]; }; then
  log_error "Xcode 26.3+ required. Found: Xcode $XCODE_VERSION"
  log_error "Download from: https://developer.apple.com/xcode/"
  exit 1
fi

log_success "Xcode $XCODE_VERSION detected"

# -----------------------------------------------------------------
# Step 2: Verify mcpbridge
# -----------------------------------------------------------------
log_info "Step 2: Checking xcrun mcpbridge..."

if ! xcrun --find mcpbridge &>/dev/null 2>&1; then
  log_error "xcrun mcpbridge not found."
  log_error "Ensure Xcode 26.3 CLI tools are selected: xcode-select -p"
  log_error "If needed: sudo xcode-select --switch /Applications/Xcode.app"
  exit 1
fi

log_success "xcrun mcpbridge found"

# -----------------------------------------------------------------
# Step 3: Create ClaudeAgentConfig directories
# -----------------------------------------------------------------
log_info "Step 3: Setting up ClaudeAgentConfig directory..."

mkdir -p "$XCODE_CONFIG_DIR"

# -----------------------------------------------------------------
# Step 4: Symlink skills
# -----------------------------------------------------------------
log_info "Step 4: Symlinking skills..."

if [[ -d "$CLAUDE_SKILLS" ]]; then
  TARGET="$XCODE_CONFIG_DIR/skills"

  if [[ -L "$TARGET" ]]; then
    CURRENT=$(readlink "$TARGET")
    if [[ "$CURRENT" == "$CLAUDE_SKILLS" ]]; then
      log_success "Skills symlink already correct"
    else
      log_warn "Updating skills symlink (was: $CURRENT)"
      rm "$TARGET"
      ln -s "$CLAUDE_SKILLS" "$TARGET"
      log_success "Skills symlink updated -> $CLAUDE_SKILLS"
    fi
  elif [[ -d "$TARGET" ]]; then
    BACKUP="$TARGET.backup.$(date +%Y%m%d%H%M%S)"
    log_warn "Backing up existing skills directory to $BACKUP"
    mv "$TARGET" "$BACKUP"
    ln -s "$CLAUDE_SKILLS" "$TARGET"
    log_success "Skills symlinked -> $CLAUDE_SKILLS"
  else
    ln -s "$CLAUDE_SKILLS" "$TARGET"
    log_success "Skills symlinked -> $CLAUDE_SKILLS"
  fi
else
  log_warn "No .claude/skills/ directory found at $CLAUDE_SKILLS"
fi

# -----------------------------------------------------------------
# Step 5: Symlink commands
# -----------------------------------------------------------------
log_info "Step 5: Symlinking commands..."

if [[ -d "$CLAUDE_COMMANDS" ]]; then
  TARGET="$XCODE_CONFIG_DIR/commands"

  if [[ -L "$TARGET" ]]; then
    CURRENT=$(readlink "$TARGET")
    if [[ "$CURRENT" == "$CLAUDE_COMMANDS" ]]; then
      log_success "Commands symlink already correct"
    else
      log_warn "Updating commands symlink (was: $CURRENT)"
      rm "$TARGET"
      ln -s "$CLAUDE_COMMANDS" "$TARGET"
      log_success "Commands symlink updated -> $CLAUDE_COMMANDS"
    fi
  elif [[ -d "$TARGET" ]]; then
    BACKUP="$TARGET.backup.$(date +%Y%m%d%H%M%S)"
    log_warn "Backing up existing commands directory to $BACKUP"
    mv "$TARGET" "$BACKUP"
    ln -s "$CLAUDE_COMMANDS" "$TARGET"
    log_success "Commands symlinked -> $CLAUDE_COMMANDS"
  else
    ln -s "$CLAUDE_COMMANDS" "$TARGET"
    log_success "Commands symlinked -> $CLAUDE_COMMANDS"
  fi
else
  log_warn "No .claude/commands/ directory found at $CLAUDE_COMMANDS"
fi

# -----------------------------------------------------------------
# Step 6: Register MCP bridge with Claude Code
# -----------------------------------------------------------------
log_info "Step 6: Registering MCP bridge..."

if command -v claude &>/dev/null; then
  # Check if already registered (idempotent)
  if claude mcp list 2>/dev/null | grep -q "xcode"; then
    log_success "MCP bridge 'xcode' already registered"
  else
    claude mcp add --transport stdio xcode -- xcrun mcpbridge 2>/dev/null || {
      log_warn "Could not auto-register MCP bridge. Add manually:"
      log_warn "  claude mcp add --transport stdio xcode -- xcrun mcpbridge"
    }
    log_success "MCP bridge 'xcode' registered"
  fi
else
  log_warn "Claude Code CLI not found. Register MCP bridge manually:"
  log_warn "  claude mcp add --transport stdio xcode -- xcrun mcpbridge"
fi

# -----------------------------------------------------------------
# Done
# -----------------------------------------------------------------
echo ""
echo "==========================================="
log_success "Setup complete!"
echo "==========================================="
echo ""
log_info "Verification steps:"
echo "  1. Open Xcode 26.3 and open your project"
echo "  2. Open the Claude Agent panel (Editor > Claude Agent)"
echo "  3. Ask: 'What skills are available?'"
echo "  4. Verify it lists Ball-AI skills from .claude/skills/"
echo ""
log_info "Symlink locations:"
echo "  Skills:   $XCODE_CONFIG_DIR/skills -> $CLAUDE_SKILLS"
echo "  Commands: $XCODE_CONFIG_DIR/commands -> $CLAUDE_COMMANDS"
echo ""
log_info "MCP servers configured in .mcp.json:"
echo "  xcode:         xcrun mcpbridge (interactive)"
echo "  XcodeBuildMCP: npx xcodebuildmcp@beta (headless)"
echo ""
log_info "Documentation: docs/setup/XCODE-CLAUDE-SETUP.md"
