# Ralph Loop with Daytona Cloud Sandbox

This tutorial guides you through setting up Daytona cloud sandboxes for running Ralph Loop in isolated, open-source cloud environments.

## What is Daytona?

[Daytona](https://www.daytona.io) is an open-source development environment manager that provides:

- **Open-source** - can be self-hosted
- **Cloud isolation** - similar to E2B
- **Slightly cheaper** than E2B (~$0.08/min)
- **Self-hosting option** for enterprise use

**Cost**: ~$0.08/minute (~$4.80/hour) or FREE if self-hosted

## Prerequisites

- Node.js 18+
- Sigma Protocol CLI installed (`npm install -g sigma-protocol`)
- Daytona account at https://www.daytona.io

## Step 1: Get Your Daytona API Key

1. Create an account at https://www.daytona.io
2. Go to the Dashboard
3. Navigate to **Settings** > **API Keys**
4. Generate a new API key
5. Copy the key

## Step 2: Configure Daytona

### Option A: Interactive Setup

```bash
sigma sandbox setup
# Select [3] Daytona
# Enter your API key when prompted
# Optionally enter custom API URL (press Enter for default)
```

### Option B: Quick Setup

```bash
# Set environment variables
export DAYTONA_API_KEY="your_key_here"
export DAYTONA_API_URL="https://api.daytona.io"  # Optional, uses default

# Quick configure
sigma sandbox setup --provider=daytona
```

### Option C: Add to .env file

```bash
# In your project root
echo 'DAYTONA_API_KEY=your_key_here' >> .env
echo 'DAYTONA_API_URL=https://api.daytona.io' >> .env
```

## Step 3: Verify Configuration

```bash
# Check sandbox status
sigma sandbox status
```

Expected output:
```
Provider: daytona
Forks per story: 3
Review strategy: hybrid

Budget:
  Limit: $50
  Remaining: $50.00
```

## Step 4: Run Ralph with Daytona Sandbox

### Basic Usage

```bash
# Run Ralph loop with Daytona isolation
sigma ralph --sandbox --sandbox-provider=daytona
```

### With Specific Backlog

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=daytona \
  --backlog=docs/ralph/prototype/prd.json
```

### With Budget Controls

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=daytona \
  --budget-max=30 \
  --budget-warn=20
```

### Parallel Execution

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=daytona \
  --parallel
```

## Step 5: Monitor Costs

```bash
# View cost summary
sigma sandbox cost

# View by time period
sigma sandbox cost --period=week
```

## Cost Estimation

| Stories | Minutes/Story | Forks | Estimated Cost |
|---------|---------------|-------|----------------|
| 5 | 15 | 1 | ~$6.00 |
| 10 | 15 | 1 | ~$12.00 |
| 10 | 15 | 3 | ~$36.00 |
| 20 | 15 | 1 | ~$24.00 |

**Savings vs E2B**: ~20% cheaper per minute

## Self-Hosting Daytona

For enterprise use or to eliminate cloud costs, you can self-host Daytona.

### Prerequisites for Self-Hosting

- Kubernetes cluster or Docker Swarm
- Domain name with SSL certificate
- 8GB+ RAM, 4+ CPUs for the control plane

### Basic Self-Host Setup

```bash
# Clone Daytona
git clone https://github.com/daytonaio/daytona.git
cd daytona

# Follow official documentation
# https://www.daytona.io/docs/installation/self-hosted
```

### Configure Sigma for Self-Hosted

```bash
export DAYTONA_API_KEY="your_self_hosted_key"
export DAYTONA_API_URL="https://your-daytona-instance.com"

sigma sandbox setup --provider=daytona
```

## Troubleshooting

### "DAYTONA_API_KEY not found"

```bash
# Check if key is set
echo $DAYTONA_API_KEY

# Set it if missing
export DAYTONA_API_KEY="your_key_here"
```

### "Connection refused"

Check if you're using the correct API URL:

```bash
# Cloud (default)
export DAYTONA_API_URL="https://api.daytona.io"

# Self-hosted
export DAYTONA_API_URL="https://your-instance.com"
```

### "401 Unauthorized"

Your API key is invalid. Generate a new one from the Daytona dashboard.

### "Workspace creation failed"

Daytona workspaces require specific configurations. Ensure your project has:
- Valid git repository
- `.devcontainer/devcontainer.json` (optional but recommended)

### Slow startup

Daytona workspaces take ~45 seconds to start. This is normal. Increase timeout if needed:

```bash
sigma ralph --sandbox --sandbox-provider=daytona --sandbox-timeout=180
```

## Daytona vs E2B vs Docker

| Feature | Daytona | E2B | Docker |
|---------|---------|-----|--------|
| Cost/min | $0.08 | $0.10 | FREE |
| Self-host | Yes | No | Yes |
| Startup | ~45s | ~30s | ~10s |
| Scalability | High | High | Limited |
| Open-source | Yes | No | N/A |

**Choose Daytona when:**
- You want cloud isolation but want to save 20% vs E2B
- You need a self-hosted option for enterprise compliance
- You prefer open-source solutions

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DAYTONA_API_KEY` | Your Daytona API key | Required |
| `DAYTONA_API_URL` | Daytona API endpoint | `https://api.daytona.io` |
| `SIGMA_BUDGET_MAX` | Override max budget | 50 |
| `SIGMA_BUDGET_WARN` | Override warn threshold | 25 |
| `ANTHROPIC_API_KEY` | Passed to sandbox for Claude | - |

## Next Steps

- [E2B Tutorial](RALPH-E2B-TUTORIAL.md) - Most popular cloud option
- [Docker Tutorial](RALPH-DOCKER-TUTORIAL.md) - Free local alternative
- [Integration Guide](../RALPH-SANDBOX-INTEGRATION.md) - Full architecture details
