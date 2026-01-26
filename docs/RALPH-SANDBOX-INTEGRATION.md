# Ralph Loop Sandbox Integration

This guide explains the architecture and integration of sandbox providers with the Ralph autonomous implementation loop.

## Overview

Ralph Loop can now run stories in **isolated sandbox environments**, providing:

- **Safety**: Code changes happen in isolated containers, not your local machine
- **Reproducibility**: Each story runs in a clean environment
- **Scalability**: Run multiple stories in parallel across cloud sandboxes
- **Cost Control**: Budget limits prevent runaway spending

## Quick Start

```bash
# 1. Set up a sandbox provider
sigma sandbox setup

# 2. Run Ralph with sandbox isolation
sigma ralph --sandbox

# 3. Monitor costs
sigma sandbox cost
```

## Architecture

### The "Russian Doll" Layering

```
┌─────────────────────────────────────────────────────────────┐
│                  SANDBOX (E2B/Docker/Daytona)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   GIT WORKTREE                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                 STREAM A                        │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │         PRD F01, F05, F12                 │  │  │  │
│  │  │  │         (stories processed)               │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Integration

```
sigma ralph --sandbox
      │
      ▼
┌─────────────────┐
│  sigma-cli.js   │  ← CLI parses flags, validates
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ sigma-ralph.sh  │  ← Main Ralph loop (bash)
│   (Bash)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ralph-bridge.js │  ← Bridge to Node.js sandbox
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           SandboxManager                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   E2B    │ │  Docker  │ │   Daytona    │ │
│  │ Provider │ │ Provider │ │   Provider   │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────┘
```

## Provider Comparison

| Factor | E2B | Docker | Daytona |
|--------|-----|--------|---------|
| **Location** | Cloud | Local | Cloud |
| **Cost** | ~$0.10/min | FREE | ~$0.08/min |
| **Setup** | API key only | Docker Desktop | API key + URL |
| **Startup Time** | ~30s | ~10s | ~45s |
| **Scalability** | High (10+ concurrent) | Limited (2-4) | High (10+) |
| **Best For** | CI/CD, teams | Solo dev, testing | Open-source teams |
| **Offline** | No | Yes | No |

### Decision Matrix

```
"I want FREE and LOCAL"                 → Docker
"I want SCALABLE and don't mind paying" → E2B
"I want CLOUD but CHEAPER"              → Daytona
"I'm in CI/CD and need AUTO-SCALING"    → E2B
"I want SELF-HOSTED cloud option"       → Daytona
```

## CLI Reference

### Sandbox Management

```bash
# Interactive setup wizard
sigma sandbox setup

# Quick setup with specific provider
sigma sandbox setup --provider=docker
sigma sandbox setup --provider=e2b
sigma sandbox setup --provider=daytona

# Check status
sigma sandbox status

# View costs
sigma sandbox cost
sigma sandbox cost --period=week

# Build Docker image
sigma sandbox build

# Test E2B connection
sigma sandbox test

# Destroy sandboxes
sigma sandbox destroy --id=<sandbox-id>
sigma sandbox destroy --all
```

### Ralph with Sandbox

```bash
# Basic sandbox usage (defaults to Docker)
sigma ralph --sandbox

# Specific provider
sigma ralph --sandbox --sandbox-provider=e2b
sigma ralph --sandbox --sandbox-provider=docker
sigma ralph --sandbox --sandbox-provider=daytona

# With budget controls
sigma ralph --sandbox --sandbox-provider=e2b \
  --budget-max=25 \
  --budget-warn=15

# With resource limits (Docker)
sigma ralph --sandbox --sandbox-provider=docker \
  --sandbox-memory=8g \
  --sandbox-cpus=4

# With timeout (for slow stories)
sigma ralph --sandbox --sandbox-timeout=300

# Dry run (preview without executing)
sigma ralph --sandbox --dry-run

# Validate PRD only
sigma ralph --sandbox --validate-only

# Parallel with sandbox
sigma ralph --sandbox --parallel
```

## Configuration File

Configuration is stored in `.sigma/sandbox-config.json`:

```json
{
  "provider": "docker",
  "credentials": {
    "e2b_api_key": "${E2B_API_KEY}",
    "daytona_api_key": "${DAYTONA_API_KEY}",
    "daytona_api_url": "https://api.daytona.io"
  },
  "defaults": {
    "timeout_seconds": 1800,
    "forks_per_story": 3,
    "fork_selection": "best-of-n",
    "memory": "4g",
    "cpus": 2
  },
  "budget": {
    "max_spend_usd": 50,
    "warn_at_usd": 25,
    "period": "monthly"
  }
}
```

## Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `E2B_API_KEY` | E2B API key | E2B |
| `DAYTONA_API_KEY` | Daytona API key | Daytona |
| `DAYTONA_API_URL` | Daytona endpoint | Daytona (optional) |
| `ANTHROPIC_API_KEY` | Claude API key | All (passed to sandbox) |
| `SIGMA_BUDGET_MAX` | Override max budget | All (optional) |
| `SIGMA_BUDGET_WARN` | Override warn threshold | All (optional) |
| `MAX_RETRIES` | Override retry limit | All (optional) |

## How It Works

### 1. Story Execution Flow

```
1. Ralph loop reads prd.json
2. For each story:
   a. Check budget (cloud providers)
   b. Create sandbox
   c. Clone workspace into sandbox
   d. Execute story implementation
   e. Capture output and verify
   f. Destroy sandbox
   g. Record cost
3. Continue to next story
```

### 2. Budget Protection

Cloud providers track costs automatically:

```bash
# Budget check happens before each story
if estimated_cost > remaining_budget:
    echo "Would exceed budget, stopping"
    exit 1
```

### 3. Retry Logic

Stories can retry on failure with exponential backoff:

```bash
# Default: 3 retries with exponential backoff
# Retry 1: wait 2s
# Retry 2: wait 4s
# Retry 3: wait 8s

MAX_RETRIES=3 sigma ralph --sandbox
```

### 4. PRD Validation

Before running, PRDs are validated:

```bash
# Check for:
# - Valid JSON
# - stories array exists
# - No duplicate story IDs
# - Required fields present

sigma ralph --sandbox --validate-only
```

## Performance Optimizations

### From ralphy PRs

The integration includes optimizations from the community:

1. **PR #98 - Retry Limits**: Configurable max retries per story
2. **PR #106 - Exponential Backoff**: Smart retry timing
3. **PR #10 - PRD Validation**: Validate before running
4. **PR #87 - Engine Arg Pass-through**: Pass flags to Claude/OpenCode

### Using Engine Args

Pass flags directly to the AI engine:

```bash
# Pass --dangerously-skip-permissions to claude
sigma ralph --sandbox -- --dangerously-skip-permissions
```

## Cost Management

### Estimate Before Running

```bash
# Preview costs without running
sigma ralph --sandbox --sandbox-provider=e2b --dry-run

# Example output:
# Provider: E2B (~$0.10/min)
# Stories: 10
# Estimated runtime: ~150 minutes
# Estimated cost: $15.00 - $18.00
```

### Set Budget Limits

```bash
# Set warning at $20, stop at $30
sigma ralph --sandbox \
  --sandbox-provider=e2b \
  --budget-warn=20 \
  --budget-max=30
```

### Track Spending

```bash
# View all-time costs
sigma sandbox cost

# View this week
sigma sandbox cost --period=week

# Example output:
# Period: week
# Total spent: $12.50
# Total sandboxes: 15
# Total runtime: 2.1 hours
```

## Troubleshooting

### Common Issues

1. **"Provider not configured"**: Run `sigma sandbox setup`
2. **"Docker not running"**: Start Docker Desktop
3. **"API key invalid"**: Check environment variables
4. **"Budget exceeded"**: Increase with `--budget-max`
5. **"Timeout"**: Increase with `--sandbox-timeout`

### Debug Mode

```bash
# Verbose output
sigma ralph --sandbox --verbose

# Check what would happen
sigma ralph --sandbox --dry-run --verbose
```

### Cleanup

```bash
# Destroy all sandboxes
sigma sandbox destroy --all

# Cleanup Docker
docker system prune
docker rm $(docker ps -aq --filter "name=sigma-sandbox")
```

## Tutorials

- [E2B Tutorial](tutorials/RALPH-E2B-TUTORIAL.md) - Cloud sandbox setup
- [Docker Tutorial](tutorials/RALPH-DOCKER-TUTORIAL.md) - Local sandbox setup
- [Daytona Tutorial](tutorials/RALPH-DAYTONA-TUTORIAL.md) - Open-source cloud setup

## Related Documentation

- [Ralph Mode](RALPH-MODE.md) - Ralph loop overview
- [Workflow Overview](WORKFLOW-OVERVIEW.md) - Full SSS methodology
- [Foundation Skills](FOUNDATION-SKILLS.md) - Available skills
