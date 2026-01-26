# Ralph Loop with E2B Cloud Sandbox

This tutorial guides you through setting up E2B cloud sandboxes for running Ralph Loop in isolated, scalable environments.

## What is E2B?

[E2B](https://e2b.dev) provides isolated cloud sandboxes for AI agents. Used by Perplexity, Manus, and Groq for production workloads, E2B offers:

- **Instant startup** (~30 seconds)
- **Full isolation** from your local machine
- **Scalable** - run 10+ parallel sandboxes
- **Pre-configured** with Node.js, Python, git

**Cost**: ~$0.10/minute (~$6/hour)

## Prerequisites

- Node.js 18+
- Sigma Protocol CLI installed (`npm install -g sigma-protocol`)
- E2B account at https://e2b.dev

## Step 1: Get Your E2B API Key

1. Create an account at https://e2b.dev
2. Go to the Dashboard
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `sk_...`)

## Step 2: Configure E2B

### Option A: Interactive Setup

```bash
sigma sandbox setup
# Select [1] E2B Cloud
# Enter your API key when prompted
```

### Option B: Quick Setup

```bash
# Set environment variable
export E2B_API_KEY="sk_your_key_here"

# Quick configure
sigma sandbox setup --provider=e2b
```

### Option C: Add to .env file

```bash
# In your project root
echo 'E2B_API_KEY=sk_your_key_here' >> .env
```

## Step 3: Verify Configuration

```bash
# Test E2B connection
sigma sandbox test

# Check status
sigma sandbox status
```

Expected output:
```
Provider: e2b
Forks per story: 3
Review strategy: hybrid

Budget:
  Limit: $50
  Remaining: $50.00
```

## Step 4: Run Ralph with E2B Sandbox

### Basic Usage

```bash
# Run Ralph loop with E2B isolation
sigma ralph --sandbox --sandbox-provider=e2b
```

### With Specific Backlog

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=e2b \
  --backlog=docs/ralph/prototype/prd.json
```

### With Budget Controls

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=e2b \
  --budget-max=25 \
  --budget-warn=15
```

### Parallel Execution (Multiple Backlogs)

```bash
sigma ralph \
  --sandbox \
  --sandbox-provider=e2b \
  --parallel
```

## Step 5: Monitor Costs

```bash
# View cost summary
sigma sandbox cost

# View by time period
sigma sandbox cost --period=day
sigma sandbox cost --period=week
```

## Cost Estimation

Before running, estimate costs:

| Stories | Minutes/Story | Forks | Estimated Cost |
|---------|---------------|-------|----------------|
| 5 | 15 | 1 | ~$7.50 |
| 10 | 15 | 1 | ~$15.00 |
| 10 | 15 | 3 | ~$45.00 |
| 20 | 15 | 1 | ~$30.00 |

**Tip**: Use `--dry-run` to preview what would happen without spending:

```bash
sigma ralph --sandbox --sandbox-provider=e2b --dry-run
```

## Troubleshooting

### "E2B_API_KEY not found"

```bash
# Check if key is set
echo $E2B_API_KEY

# Set it if missing
export E2B_API_KEY="sk_your_key_here"
```

### "E2B SDK not installed"

```bash
npm install e2b
```

### "401 Unauthorized"

Your API key is invalid. Generate a new one at https://e2b.dev/dashboard

### "Budget exceeded"

Ralph automatically stops when budget is reached. Increase with:

```bash
sigma ralph --sandbox --sandbox-provider=e2b --budget-max=100
```

### Sandbox timeout

Increase timeout for complex stories:

```bash
sigma ralph --sandbox --sandbox-provider=e2b --sandbox-timeout=300
```

## Best Practices

1. **Start with dry-run**: Always preview with `--dry-run` first
2. **Set budget limits**: Prevent runaway costs with `--budget-max`
3. **Use Docker for testing**: Test locally with Docker before E2B
4. **Monitor costs**: Check `sigma sandbox cost` regularly
5. **Use single forks first**: Start with `--forks=1` before scaling

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `E2B_API_KEY` | Your E2B API key | Required |
| `SIGMA_BUDGET_MAX` | Override max budget | 50 |
| `SIGMA_BUDGET_WARN` | Override warn threshold | 25 |
| `ANTHROPIC_API_KEY` | Passed to sandbox for Claude | - |

## Next Steps

- [Docker Tutorial](RALPH-DOCKER-TUTORIAL.md) - Free local alternative
- [Daytona Tutorial](RALPH-DAYTONA-TUTORIAL.md) - Open-source cloud option
- [Integration Guide](../RALPH-SANDBOX-INTEGRATION.md) - Full architecture details
