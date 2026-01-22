# Sigma Protocol Sandbox Image
# Used for E2B custom template, Docker sandbox, and Daytona
#
# Build: docker build -t sigma-sandbox:latest .
# Run:   docker run -it --rm sigma-sandbox:latest

FROM node:20-slim

LABEL maintainer="Sigma Protocol"
LABEL description="Isolated sandbox environment for AI agent orchestration"
LABEL version="1.0.0"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    tmux \
    vim \
    python3 \
    python3-pip \
    jq \
    htop \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install mprocs for TUI (multi-process terminal)
RUN curl -fsSL https://github.com/pvolok/mprocs/releases/download/v0.6.4/mprocs-0.6.4-linux64.tar.gz \
    | tar -xz -C /usr/local/bin

# Install global npm packages
RUN npm install -g \
    typescript \
    ts-node \
    pnpm \
    yarn

# Install Claude Code CLI (the AI agent)
RUN npm install -g @anthropic-ai/claude-code 2>/dev/null || echo "Claude Code CLI not available via npm yet"

# Install Sigma Protocol CLI
RUN npm install -g sigma-protocol 2>/dev/null || echo "Sigma Protocol not published yet, will use local"

# Create workspace directory structure
WORKDIR /workspace
RUN mkdir -p /workspace/repo /workspace/output /workspace/.sigma

# Copy default mprocs configuration
RUN echo 'procs:\n  main:\n    shell: "bash"\n  logs:\n    shell: "tail -f /workspace/.sigma/agent.log 2>/dev/null || echo Waiting for logs..."' > /workspace/mprocs.yaml

# Set up shell aliases
RUN echo 'alias ll="ls -la"' >> /root/.bashrc && \
    echo 'alias sigma="sigma-protocol"' >> /root/.bashrc && \
    echo 'export PS1="\[\033[1;36m\][sigma-sandbox]\[\033[0m\] \w \$ "' >> /root/.bashrc

# Environment variables
ENV NODE_ENV=development
ENV SIGMA_SANDBOX=true
ENV WORKSPACE=/workspace

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && git --version || exit 1

# Expose common development ports
EXPOSE 3000 8080 5173 4000

# Default command keeps container running
CMD ["bash"]


