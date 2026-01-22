# Sigma Protocol - Docker Sandbox Template
# Pre-configured with Claude Code and Agent Hub MCP for multi-agent orchestration
#
# Build:
#   docker build -t sigma-sandbox:latest .
#
# Run:
#   docker run -d --name sigma-stream-a \
#     -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
#     -e SIGMA_STREAM=A \
#     sigma-sandbox:latest

FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    tmux \
    python3 \
    python3-pip \
    jq \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI (requires Anthropic subscription)
RUN npm install -g @anthropic-ai/claude-code || echo "Claude Code install requires ANTHROPIC_API_KEY at runtime"

# Install Agent Hub MCP for inter-agent communication
# This enables /hub:register, /hub:sync, /hub:status commands
RUN npm install -g agent-hub-mcp || echo "agent-hub-mcp install skipped"

# Install Sigma Protocol CLI
RUN npm install -g sigma-protocol || echo "Sigma CLI install skipped"

# Install mprocs for TUI
RUN curl -fsSL https://github.com/pvolok/mprocs/releases/download/v0.6.4/mprocs-0.6.4-linux64.tar.gz \
    | tar -xz -C /usr/local/bin || echo "mprocs install skipped"

# Install OpenCode as alternative (open-source)
RUN curl -fsSL https://opencode.dev/install.sh | bash || echo "OpenCode install skipped"

# Create workspace structure
WORKDIR /workspace
RUN mkdir -p /workspace/.sigma/orchestration \
    && mkdir -p /workspace/docs/prds \
    && mkdir -p /workspace/worktrees \
    && mkdir -p /root/.agent-hub

# Configure Agent Hub MCP for Claude Code
RUN mkdir -p /root/.claude && \
    echo '{"mcpServers":{"agent-hub":{"command":"npx","args":["-y","agent-hub-mcp@latest"]}}}' > /root/.claude/mcp.json

# Copy and set up entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Configure for headless operation
ENV CLAUDE_HEADLESS=1
ENV SIGMA_SANDBOX=docker

# Resource limits (can be overridden at runtime)
# --memory 2g --cpus 2

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && python3 --version || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]

