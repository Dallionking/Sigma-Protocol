# Sandbox Orchestration Guide

Run AI agent orchestration in isolated, scalable sandbox environments with the Best of N pattern for higher quality outputs.

## Overview

Sigma Protocol supports three sandbox providers:

| Provider | Type | Cost | Best For |
|----------|------|------|----------|
| **E2B** | Cloud | ~$0.10/min | Production, scalability, preview URLs |
| **Docker** | Local | Free | Development, offline work, full control |
| **Daytona** | Cloud | ~$0.08/min | Self-hosted option, IDE integration |

## Quick Start

### 1. Setup Provider

```bash
# Interactive setup wizard
sigma sandbox setup

# Or specify provider directly
sigma sandbox setup --provider=docker
sigma sandbox setup --provider=e2b
sigma sandbox setup --provider=daytona
```

### 2. Run Orchestration with Sandbox

```bash
# Use configured provider
sigma orchestrate --sandbox

# Specify provider
sigma orchestrate --sandbox=e2b

# With Best of N pattern (3 forks per story)
sigma orchestrate --sandbox --forks=3

# With budget limit
sigma orchestrate --sandbox --budget=25
```

### 3. Monitor & Manage

```bash
# Check sandbox status
sigma sandbox status

# View costs
sigma sandbox cost
sigma sandbox cost --period=week

# Destroy sandboxes
sigma sandbox destroy --id=<sandbox-id>
sigma sandbox destroy --all
```

## Provider Setup Details

### E2B Cloud

E2B provides isolated cloud sandboxes used by Perplexity, Manus, and Groq.

**Setup:**
1. Create account at [e2b.dev](https://e2b.dev)
2. Get API key from dashboard
3. Run `sigma sandbox setup --provider=e2b`
4. Enter API key when prompted

**Environment Variables:**
```bash
export E2B_API_KEY="your-api-key"
```

**Features:**
- Cloud-hosted, scalable
- Preview URLs for each sandbox
- Fast startup (~5 seconds)
- Pay-per-minute billing

### Docker (Local)

Docker provides free local isolation using containers.

**Prerequisites:**
- Docker installed and running
- At least 8GB RAM recommended
- 20GB disk space for images

**Setup:**
```bash
# Check Docker is available
docker --version

# Setup provider
sigma sandbox setup --provider=docker

# Build the sigma-sandbox image (first time)
sigma sandbox build
```

**Manual Image Build:**
```bash
cd scripts/sandbox
docker build -t sigma-sandbox:latest .
```

**Features:**
- Free (uses local resources)
- Works offline
- Full control over environment
- No network latency

### Daytona

Daytona provides open-source cloud development environments.

**Setup:**
1. Create account at [daytona.io](https://www.daytona.io)
2. Get API key from dashboard
3. Run `sigma sandbox setup --provider=daytona`
4. Enter API key when prompted

**Environment Variables:**
```bash
export DAYTONA_API_KEY="your-api-key"
# Optional: for self-hosted
export DAYTONA_API_URL="https://your-daytona-instance.com"
```

**Features:**
- Slightly cheaper than E2B
- Self-hosted option available
- IDE integration
- Git integration built-in

## Best of N Pattern

The Best of N pattern runs multiple parallel attempts for each story and selects the best result.

### How It Works

```
Story → [Fork 1] →┐
       [Fork 2] →├→ AI Evaluation → Top 3 → Human Review → Winner
       [Fork 3] →┘
```

1. **Parallel Execution**: N sandboxes run the same story simultaneously
2. **Result Collection**: Wait for all forks to complete or timeout
3. **AI Evaluation**: Score each result on tests, code quality, completeness
4. **Human Review**: Top candidates presented for final selection
5. **Merge**: Selected implementation merged to main branch

### Configuration

```bash
# Number of forks (default: 3)
sigma orchestrate --sandbox --forks=5

# Review strategy
# hybrid: AI filters, human picks (default)
# ai-only: Full automation
# manual: All candidates shown
sigma orchestrate --sandbox --review=hybrid
```

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Test Pass Rate | 40% | Automated test results |
| Code Quality | 20% | ESLint score |
| Completeness | 20% | Acceptance criteria met |
| Performance | 10% | Build time, bundle size |
| AI Subjective | 10% | Claude evaluation |

## Cost Management

### Budget Limits

```bash
# Set per-run budget
sigma orchestrate --sandbox --budget=25

# Configure default budget
sigma config --set sandbox.budget.max_spend_usd=50
sigma config --set sandbox.budget.warn_at_usd=25
```

### Cost Estimation

Before running, you'll see a cost estimate:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SANDBOX COST ESTIMATE                        │
├─────────────────────────────────────────────────────────────────┤
│  Provider:        E2B Cloud (~$0.10/min)                        │
│  Stories:         12                                            │
│  Forks per story: 3                                             │
│  Total sandboxes: 36                                            │
│  Est. runtime:    ~45 minutes                                   │
│                                                                 │
│  ESTIMATED COST:  $8.50 - $15.00                               │
│                                                                 │
│  Budget limit:    $50.00 (you have $42.00 remaining)           │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Tracking

```bash
# View spending summary
sigma sandbox cost

# By time period
sigma sandbox cost --period=day
sigma sandbox cost --period=week
sigma sandbox cost --period=month

# Detailed log at .sigma/orchestration/cost-log.json
```

### Cost-Saving Tips

1. **Use Docker for development** - Free and fast
2. **Reduce forks** - `--forks=1` for initial testing
3. **Set budget limits** - Prevent runaway costs
4. **Review complexity** - Simpler stories need fewer forks

## Troubleshooting

### E2B Issues

**"E2B_API_KEY not set"**
```bash
export E2B_API_KEY="your-key"
# Or add to .env file
```

**"API validation failed"**
- Check API key is correct
- Verify account is active
- Check E2B status page

### Docker Issues

**"Docker not available"**
```bash
# Start Docker daemon
open -a Docker  # macOS
sudo systemctl start docker  # Linux
```

**"sigma-sandbox image not found"**
```bash
sigma sandbox build
# Or manually:
cd scripts/sandbox && docker build -t sigma-sandbox:latest .
```

**"Out of disk space"**
```bash
# Clean up old images
docker system prune -a
```

### Daytona Issues

**"Connection failed"**
- Check API key is valid
- Verify API URL if self-hosted
- Check firewall settings

## Configuration Reference

Configuration stored at `.sigma/orchestration/sandbox-config.json`:

```json
{
  "provider": "e2b",
  "credentials": {
    "e2b_api_key": "${E2B_API_KEY}",
    "docker_socket": "/var/run/docker.sock"
  },
  "defaults": {
    "forks_per_story": 3,
    "sandbox_lifetime_seconds": 1800,
    "auto_destroy": true
  },
  "budget": {
    "max_spend_usd": 50,
    "warn_at_usd": 25,
    "track_usage": true
  },
  "best_of_n": {
    "mode": "per-story",
    "n": 3,
    "review_strategy": "hybrid"
  },
  "limits": {
    "max_concurrent": {
      "e2b": 10,
      "docker": 4,
      "daytona": 10
    }
  }
}
```

## See Also

- [Best of N Pattern](./BEST-OF-N.md) - Deep dive into fork evaluation
- [Cost Management](./COST-MANAGEMENT.md) - Budget tracking and optimization
- [Orchestration Guide](./ORCHESTRATION.md) - General orchestration documentation


