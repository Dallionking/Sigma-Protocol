# Sigma Protocol - E2B Sandbox Template
# Pre-configured with Claude Code and Agent Hub MCP for multi-agent orchestration
#
# Build and push to E2B:
#   e2b template build
#   e2b template publish
#
# Use in E2B config:
#   template: 'sigma-sandbox'

FROM e2b/base:latest

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    tmux \
    python3 \
    python3-pip \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Claude Code CLI (requires Anthropic subscription)
# Note: Users need ANTHROPIC_API_KEY set for this to work
RUN npm install -g @anthropic-ai/claude-code || echo "Claude Code install skipped (will install at runtime)"

# Install Agent Hub MCP for inter-agent communication
# This enables /hub:register, /hub:sync, /hub:status commands
RUN npm install -g agent-hub-mcp || echo "agent-hub-mcp install skipped"

# Install OpenCode as alternative (open-source)
RUN curl -fsSL https://opencode.dev/install.sh | bash || echo "OpenCode install skipped"

# Install Sigma Protocol CLI
RUN npm install -g sigma-protocol || echo "Sigma CLI install skipped"

# Install mprocs for TUI
RUN curl -fsSL https://github.com/pvolok/mprocs/releases/download/v0.6.4/mprocs-0.6.4-linux64.tar.gz \
    | tar -xz -C /usr/local/bin || echo "mprocs install skipped"

# Create workspace structure
WORKDIR /workspace
RUN mkdir -p /workspace/.sigma/orchestration \
    && mkdir -p /workspace/docs/prds \
    && mkdir -p /workspace/worktrees \
    && mkdir -p /root/.agent-hub

# Configure Agent Hub MCP for Claude Code
RUN mkdir -p /root/.claude && \
    echo '{"mcpServers":{"agent-hub":{"command":"npx","args":["-y","agent-hub-mcp@latest"]}}}' > /root/.claude/mcp.json

# Pre-configure for headless operation
ENV CLAUDE_HEADLESS=1
ENV CLAUDE_AUTO_APPROVE=1
ENV SIGMA_SANDBOX=e2b

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && python3 --version || exit 1

# Default command - keep container running
CMD ["tail", "-f", "/dev/null"]

