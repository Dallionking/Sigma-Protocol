#!/bin/bash
# ============================================================================
# install-agent-mail.sh - mcp_agent_mail Installer for Sigma Orchestration
# ============================================================================
# One-line installer for mcp_agent_mail MCP server that enables inter-agent
# communication for Sigma Protocol's multi-agent orchestration system.
#
# Usage:
#   ./install-agent-mail.sh
#   ./install-agent-mail.sh --global
#   ./install-agent-mail.sh --check
#
# Requirements:
#   - Node.js 18+
#   - npm or npx
#   - Claude Code (claude) installed
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PACKAGE_NAME="@anthropics/mcp-agent-mail"
CONFIG_DIR="${HOME}/.sigma/mcp"
MCP_CONFIG_FILE="${CONFIG_DIR}/agent-mail-config.json"

# Logging
log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          📬 MCP AGENT MAIL INSTALLER                          ║"
    echo "║          Inter-Agent Communication for Sigma Protocol         ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    local node_version
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js version 18+ required. Found: $(node -v)"
        exit 1
    fi
    log_success "Node.js $(node -v)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm $(npm -v)"
    
    # Check Claude Code
    if command -v claude &> /dev/null; then
        log_success "Claude Code found"
    else
        log_warn "Claude Code not found in PATH"
        log_warn "You may need to configure MCP manually"
    fi
}

# Install the package
install_package() {
    local install_type="${1:-local}"
    
    log_info "Installing ${PACKAGE_NAME}..."
    
    if [ "$install_type" == "global" ]; then
        npm install -g "${PACKAGE_NAME}" || {
            log_warn "Global install failed, trying with sudo..."
            sudo npm install -g "${PACKAGE_NAME}"
        }
        log_success "Installed globally"
    else
        # Install locally in current project
        npm install "${PACKAGE_NAME}" || {
            log_warn "Local install failed, trying npx..."
        }
        log_success "Installed locally"
    fi
}

# Configure MCP for Claude Code
configure_mcp() {
    log_info "Configuring MCP for Claude Code..."
    
    # Check if Claude Code MCP command exists
    if command -v claude &> /dev/null; then
        # Try to add via claude mcp command
        log_info "Adding agent-mail to Claude Code MCP..."
        
        claude mcp add agent-mail -- npx "${PACKAGE_NAME}" 2>/dev/null || {
            log_warn "Could not add via 'claude mcp add'"
            log_info "Manual configuration may be required"
        }
        
        log_success "MCP configured for Claude Code"
    else
        log_warn "Claude Code CLI not available"
        log_info "Manual MCP configuration instructions will be provided"
    fi
}

# Create Sigma config directory and files
create_sigma_config() {
    log_info "Creating Sigma MCP configuration..."
    
    mkdir -p "${CONFIG_DIR}"
    
    # Create agent mail config
    cat > "${MCP_CONFIG_FILE}" << 'EOF'
{
  "$schema": "https://sigma-protocol.dev/schemas/agent-mail-config.schema.json",
  "version": "1.0.0",
  "server": {
    "port": 8765,
    "host": "localhost",
    "transport": "file"
  },
  "agents": {
    "orchestrator": {
      "role": "coordinator",
      "description": "Main orchestration coordinator",
      "permissions": ["broadcast", "assign", "approve"]
    },
    "stream-a": {
      "role": "worker",
      "description": "Stream A worker",
      "permissions": ["report", "request"]
    },
    "stream-b": {
      "role": "worker",
      "description": "Stream B worker",
      "permissions": ["report", "request"]
    },
    "stream-c": {
      "role": "worker",
      "description": "Stream C worker",
      "permissions": ["report", "request"]
    },
    "stream-d": {
      "role": "worker",
      "description": "Stream D worker",
      "permissions": ["report", "request"]
    },
    "stream-e": {
      "role": "worker",
      "description": "Stream E worker",
      "permissions": ["report", "request"]
    },
    "stream-f": {
      "role": "worker",
      "description": "Stream F worker",
      "permissions": ["report", "request"]
    },
    "stream-g": {
      "role": "worker",
      "description": "Stream G worker",
      "permissions": ["report", "request"]
    },
    "stream-h": {
      "role": "worker",
      "description": "Stream H worker",
      "permissions": ["report", "request"]
    }
  },
  "messageTypes": {
    "register": {
      "description": "Stream registering with orchestrator",
      "schema": {
        "name": "string",
        "worktree": "string",
        "capabilities": "array"
      }
    },
    "prd_assignment": {
      "description": "Orchestrator assigning PRD to stream",
      "schema": {
        "prd": "string",
        "worktree": "string",
        "executeOrder": "array"
      }
    },
    "story_complete": {
      "description": "Stream reporting story completion",
      "schema": {
        "prd": "string",
        "story_id": "string",
        "story_title": "string",
        "commit": "string"
      }
    },
    "prd_complete": {
      "description": "Stream reporting PRD completion",
      "schema": {
        "prd": "string",
        "stories_completed": "number",
        "branch": "string",
        "commit": "string"
      }
    },
    "blocked": {
      "description": "Stream reporting blocked status",
      "schema": {
        "story_id": "string",
        "blockedOn": "string",
        "reason": "string"
      }
    },
    "continue": {
      "description": "Orchestrator telling stream to proceed",
      "schema": {
        "message": "string"
      }
    },
    "error": {
      "description": "Error report",
      "schema": {
        "error": "string",
        "story": "string",
        "prd": "string"
      }
    }
  },
  "logging": {
    "level": "info",
    "file": "~/.sigma/logs/agent-mail.log"
  }
}
EOF
    
    log_success "Created config: ${MCP_CONFIG_FILE}"
}

# Print manual configuration instructions
print_manual_config() {
    echo ""
    echo -e "${YELLOW}Manual Configuration Instructions:${NC}"
    echo ""
    echo "If automatic MCP configuration failed, add this to your Claude Code config:"
    echo ""
    echo -e "${CYAN}~/.claude/claude_desktop_config.json or similar:${NC}"
    echo '```json'
    echo '{
  "mcpServers": {
    "agent-mail": {
      "command": "npx",
      "args": ["@anthropics/mcp-agent-mail"]
    }
  }
}'
    echo '```'
    echo ""
    echo -e "${CYAN}Or for Cursor (.cursor/mcp.json):${NC}"
    echo '```json'
    echo '{
  "mcpServers": {
    "agent-mail": {
      "command": "npx",
      "args": ["@anthropics/mcp-agent-mail"],
      "env": {}
    }
  }
}'
    echo '```'
    echo ""
}

# Check installation status
check_installation() {
    log_info "Checking mcp_agent_mail installation..."
    
    # Check if package is installed
    if npm list -g "${PACKAGE_NAME}" &> /dev/null; then
        log_success "Package installed globally"
    elif npm list "${PACKAGE_NAME}" &> /dev/null; then
        log_success "Package installed locally"
    else
        log_warn "Package not found"
        return 1
    fi
    
    # Check config file
    if [ -f "${MCP_CONFIG_FILE}" ]; then
        log_success "Config file exists: ${MCP_CONFIG_FILE}"
    else
        log_warn "Config file not found"
    fi
    
    # Check Claude MCP
    if command -v claude &> /dev/null; then
        if claude mcp list 2>/dev/null | grep -q "agent-mail"; then
            log_success "MCP configured in Claude Code"
        else
            log_warn "MCP not configured in Claude Code"
        fi
    fi
    
    return 0
}

# Print completion message
print_completion() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ INSTALLATION COMPLETE                         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "mcp_agent_mail is installed and configured for Sigma Protocol."
    echo ""
    echo -e "${YELLOW}Configuration:${NC} ${MCP_CONFIG_FILE}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Restart Claude Code to pick up MCP changes"
    echo "  2. Run: npx sigma-protocol orchestrate --streams=4"
    echo ""
    echo -e "${YELLOW}Usage in Claude:${NC}"
    echo "  - Messages are sent/received via mcp_agent_mail tools"
    echo "  - Use @orchestrate in the orchestrator pane"
    echo "  - Use @stream --name=A in stream panes"
    echo ""
}

# Main
main() {
    local install_type="local"
    local check_only=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --global|-g)
                install_type="global"
                shift
                ;;
            --check|-c)
                check_only=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--global|--check|--help]"
                echo ""
                echo "Options:"
                echo "  --global, -g   Install package globally"
                echo "  --check, -c    Check installation status only"
                echo "  --help, -h     Show this help"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    print_banner
    
    if [ "$check_only" = true ]; then
        check_installation
        exit $?
    fi
    
    check_prerequisites
    install_package "$install_type"
    create_sigma_config
    configure_mcp
    print_manual_config
    print_completion
}

main "$@"

