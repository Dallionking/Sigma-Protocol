#!/bin/bash
# Sigma Protocol - Docker Sandbox Entrypoint
#
# Initializes the sandbox environment and starts the specified command.

set -e

# Initialize orchestration directories
mkdir -p /workspace/.sigma/orchestration/inbox

# Configure git if not already done
if [ ! -f ~/.gitconfig ]; then
    git config --global user.name "Sigma Sandbox"
    git config --global user.email "sandbox@sigma-protocol.dev"
    git config --global init.defaultBranch main
fi

# Set up Claude Code MCP config if ANTHROPIC_API_KEY is set
if [ -n "$ANTHROPIC_API_KEY" ]; then
    mkdir -p ~/.claude
    
    # Create MCP config for agent-mail
    cat > ~/.claude/mcp.json << EOF
{
  "mcpServers": {
    "agent-mail": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-agent-mail"],
      "env": {
        "INBOX_DIR": "/workspace/.sigma/orchestration/inbox"
      }
    }
  }
}
EOF

    echo "✓ Claude Code MCP configured with agent-mail"
fi

# Display environment info
echo ""
echo "═══════════════════════════════════════════════════"
echo "  Sigma Protocol Sandbox"
echo "═══════════════════════════════════════════════════"
echo "  Role:   ${SIGMA_ROLE:-worker}"
echo "  Stream: ${SIGMA_STREAM:-unassigned}"
echo "  PRDs:   ${SIGMA_PRDS:-none}"
echo "═══════════════════════════════════════════════════"
echo ""

# If SIGMA_ROLE is orchestrator, run orchestrator script
if [ "$SIGMA_ROLE" = "orchestrator" ]; then
    echo "Starting orchestrator..."
    if [ -f /usr/local/bin/orchestrator.py ]; then
        python3 /usr/local/bin/orchestrator.py --init &
    fi
fi

# If SIGMA_ROLE is worker and SIGMA_STREAM is set, register with orchestrator
if [ "$SIGMA_ROLE" = "worker" ] && [ -n "$SIGMA_STREAM" ]; then
    echo "Registering stream worker..."
    if [ -f /usr/local/bin/stream-worker.py ]; then
        python3 /usr/local/bin/stream-worker.py --name="$SIGMA_STREAM" &
    fi
fi

# Execute the main command
exec "$@"


