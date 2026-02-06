# Ralph Loop with Docker Local Sandbox

This tutorial guides you through setting up Docker local sandboxes for running Ralph Loop in isolated containers on your machine.

## Why Docker?

Docker provides **free local isolation** for AI agents:

- **No API costs** - runs on your hardware
- **Works offline** - no internet required
- **Fast startup** (~10 seconds)
- **Full control** - customize resources

**Cost**: FREE (uses local machine resources)

## Prerequisites

- Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- Node.js 18+
- Sigma Protocol CLI installed (`npm install -g sigma-protocol`)

## Step 1: Install Docker

### macOS

```bash
# Option A: Download from docker.com
open https://www.docker.com/products/docker-desktop/

# Option B: Via Homebrew
brew install --cask docker
```

### Windows

Download Docker Desktop from https://www.docker.com/products/docker-desktop/

### Linux (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add yourself to docker group
sudo usermod -aG docker $USER

# Restart terminal or run:
newgrp docker
```

## Step 2: Verify Docker is Running

```bash
# Check Docker version
docker --version

# Check Docker daemon
docker info

# Test with hello-world
docker run hello-world
```

## Step 3: Configure Docker Sandbox

### Option A: Interactive Setup

```bash
sigma sandbox setup
# Select [2] Docker (Local)
# Follow prompts to build image
```

### Option B: Quick Setup

```bash
sigma sandbox setup --provider=docker
```

### Option C: Build Image Manually

```bash
sigma sandbox build
```

## Step 4: Verify Configuration

```bash
# Check sandbox status
sigma sandbox status

# Verify Docker image exists
docker images | grep sigma-sandbox
```

Expected output:
```
Provider: docker
Forks per story: 3
Review strategy: hybrid

Budget:
  Limit: $50 (not applicable for Docker)
  Remaining: $50.00
```

## Step 5: Run Ralph with Docker Sandbox

### Basic Usage

```bash
# Run Ralph loop with Docker isolation
sigma ralph --sandbox --sandbox-provider=docker
```

### With Specific Backlog

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=docker \
  --backlog=docs/ralph/prototype/prd.json
```

### With Custom Resources

```bash
# Increase memory and CPUs for complex stories
sigma ralph \
  --sandbox \
  --sandbox-provider=docker \
  --sandbox-memory=8g \
  --sandbox-cpus=4
```

### Parallel Execution

```bash
# Run multiple backlogs (limited by local resources)
sigma ralph \
  --sandbox \
  --sandbox-provider=docker \
  --parallel
```

**Note**: Docker parallel execution is limited by your machine's RAM and CPU. Typically 2-4 concurrent sandboxes work well.

## Step 6: Monitor Running Containers

```bash
# List running sigma-sandbox containers
docker ps | grep sigma-sandbox

# View container logs
docker logs sigma-sandbox-<id>

# View resource usage
docker stats
```

## Customizing the Docker Image

The default `sigma-sandbox:latest` image includes:
- Node.js 20
- Python 3
- Git
- tmux
- Claude Code CLI

To customize, create `scripts/sandbox/Dockerfile`:

```dockerfile
# Custom Sigma Sandbox Image
FROM node:20-slim

# Install base dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    tmux \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Add your custom tools here
RUN npm install -g typescript tsx

# Install Claude Code CLI
# Install Claude Code CLI (native installer preferred, npm fallback for Docker)
RUN npm install -g @anthropic-ai/claude-code 2>/dev/null || true

WORKDIR /workspace

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version || exit 1

CMD ["tail", "-f", "/dev/null"]
```

Rebuild the image:

```bash
sigma sandbox build
```

## Troubleshooting

### "Docker not found or not running"

```bash
# macOS: Open Docker Desktop application
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker

# Verify it's running
docker info
```

### "Permission denied"

On Linux, add yourself to the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### "Image not found"

Build the sigma-sandbox image:

```bash
sigma sandbox build
```

### "Container runs out of memory"

Increase memory limit:

```bash
sigma ralph --sandbox --sandbox-provider=docker --sandbox-memory=8g
```

Also increase Docker Desktop memory in Preferences > Resources.

### "Slow container startup"

Pull the base image first:

```bash
docker pull node:20-slim
```

### "Cannot access Anthropic API in container"

Ensure your API key is set:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# The key is automatically passed to containers
```

## Performance Tips

1. **Allocate enough resources**: Give Docker at least 4GB RAM and 2 CPUs
2. **Use Docker Desktop settings**: Increase limits in Preferences > Resources
3. **Limit parallel sandboxes**: 2-4 concurrent containers is usually optimal
4. **Clean up old containers**: `docker system prune` periodically
5. **Use local volumes**: Mount project as volume for faster file access

## Resource Recommendations

| Machine RAM | Recommended Sandboxes | Memory/Sandbox |
|-------------|----------------------|----------------|
| 8GB | 1-2 | 4g |
| 16GB | 2-4 | 4g |
| 32GB | 4-6 | 4g-8g |
| 64GB | 6-10 | 4g-8g |

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCKER_HOST` | Remote Docker host | Local daemon |
| `ANTHROPIC_API_KEY` | Passed to sandbox for Claude | - |

## Next Steps

- [E2B Tutorial](RALPH-E2B-TUTORIAL.md) - Scalable cloud alternative
- [Daytona Tutorial](RALPH-DAYTONA-TUTORIAL.md) - Open-source cloud option
- [Integration Guide](../RALPH-SANDBOX-INTEGRATION.md) - Full architecture details
