# Cost Management Guide

Track, estimate, and optimize costs for sandbox orchestration.

## Overview

Sandbox orchestration costs come from:

1. **Sandbox Runtime** - Time sandboxes are active
2. **AI API Calls** - Claude/GPT usage within sandboxes
3. **Best of N Multiplier** - More forks = higher costs

## Provider Pricing

| Provider | Per Minute | Per Hour | Setup Cost |
|----------|------------|----------|------------|
| E2B | $0.10 | $6.00 | $0.05 |
| Docker | Free | Free | Free |
| Daytona | $0.08 | $4.80 | $0.03 |

*Prices are approximate and may change. Check provider websites for current rates.*

## Cost Estimation

### Before Running

Sigma shows a cost estimate before launching:

```bash
sigma orchestrate --sandbox
```

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
├─────────────────────────────────────────────────────────────────┤
│  [1] Proceed                                                    │
│  [2] Reduce forks (saves ~60%)                                  │
│  [3] Use Docker instead (free)                                  │
│  [4] Cancel                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Estimation Formula

```
Total Cost = (Stories × Forks × Minutes × CostPerMin) + (Sandboxes × SetupCost)

Where:
- Stories = Number of stories in PRD
- Forks = Best of N value (default: 3)
- Minutes = Average time per story (default: 15)
- CostPerMin = Provider rate
- SetupCost = One-time sandbox creation cost
```

### Example Calculations

**Small Project (5 stories, 1 fork):**
```
E2B:    5 × 1 × 15 × $0.10 + 5 × $0.05 = $7.75
Docker: Free
Daytona: 5 × 1 × 15 × $0.08 + 5 × $0.03 = $6.15
```

**Medium Project (20 stories, 3 forks):**
```
E2B:    20 × 3 × 15 × $0.10 + 60 × $0.05 = $93.00
Docker: Free
Daytona: 20 × 3 × 15 × $0.08 + 60 × $0.03 = $73.80
```

## Budget Controls

### Setting Limits

```bash
# Per-run budget
sigma orchestrate --sandbox --budget=25

# Default budget in config
sigma config --set sandbox.budget.max_spend_usd=50
sigma config --set sandbox.budget.warn_at_usd=25
```

### Configuration File

In `.sigma/orchestration/sandbox-config.json`:

```json
{
  "budget": {
    "max_spend_usd": 50,
    "warn_at_usd": 25,
    "track_usage": true
  }
}
```

### Budget Enforcement

- **Warning**: Alert when spending exceeds `warn_at_usd`
- **Soft Stop**: Prompt before exceeding `max_spend_usd`
- **Hard Stop**: Auto-pause and destroy sandboxes at limit

## Cost Tracking

### View Summary

```bash
# All-time spending
sigma sandbox cost

# By period
sigma sandbox cost --period=day
sigma sandbox cost --period=week
sigma sandbox cost --period=month
```

### Output Example

```
💰 Sandbox Cost Summary

Period: week
Total spent: $23.45
Total sandboxes: 45
Total runtime: 3.5 hours

By provider:
  e2b: $21.50 (40 sandboxes)
  docker: $0.00 (5 sandboxes)
  daytona: $1.95 (0 sandboxes)
```

### Cost Log

Detailed log at `.sigma/orchestration/cost-log.json`:

```json
{
  "entries": [
    {
      "timestamp": "2026-01-12T10:30:00Z",
      "provider": "e2b",
      "sandboxCount": 12,
      "runtimeMinutes": 45,
      "cost": 4.95,
      "sessionId": "abc-123"
    }
  ],
  "totalSpent": 23.45
}
```

## Optimization Strategies

### 1. Use Docker for Development

```bash
# Free local sandboxes
sigma sandbox setup --provider=docker
sigma orchestrate --sandbox=docker
```

**Savings**: 100% of sandbox costs

### 2. Reduce Fork Count

```bash
# Development: 1 fork
sigma orchestrate --sandbox --forks=1

# Production: 3 forks (default)
sigma orchestrate --sandbox --forks=3
```

| Forks | Cost Multiplier | Quality |
|-------|-----------------|---------|
| 1 | 1x | Baseline |
| 2 | 2x | +15% |
| 3 | 3x | +25% |
| 5 | 5x | +30% |

### 3. Optimize Story Complexity

Simple stories complete faster:
- Clear acceptance criteria
- Focused scope
- Well-defined tests

**Time Savings**: 30-50% reduction

### 4. Use Provider Efficiently

**E2B:**
- Short sandbox lifetime (destroy immediately after completion)
- Reuse sandboxes when possible

**Daytona:**
- Self-host for high-volume usage
- Slightly cheaper than E2B

### 5. Sequential vs Parallel

```bash
# Sequential (longer, cheaper)
sigma orchestrate --sandbox --mode=sequential

# Parallel (faster, same cost per sandbox)
sigma orchestrate --sandbox
```

Sequential saves ~40% if sandbox overhead is significant.

## Cost Comparison: Sandbox vs Local

### When Sandboxes Save Money

Despite per-minute costs, sandboxes can save money:

1. **Parallelization**: 10 streams in 30 min vs 5 hours sequential
2. **Clean environments**: No debugging polluted local state
3. **Reproducibility**: Consistent results reduce rework

### Break-Even Analysis

```
Local Developer Cost: $50-150/hour

10 stories at 30 min each:
- Local: 5 hours × $75/hr = $375
- Sandbox: 30 min × $6/hr × 10 = $30

Even with 3x forks:
- Sandbox: $90 (75% savings)
```

### When to Use Local

- Budget is extremely tight
- Network is unreliable
- Data security requirements
- Quick one-off tasks

## Budget Templates

### Startup/Indie

```json
{
  "budget": {
    "max_spend_usd": 25,
    "warn_at_usd": 15
  },
  "defaults": {
    "forks_per_story": 1
  }
}
```

### Growth Stage

```json
{
  "budget": {
    "max_spend_usd": 100,
    "warn_at_usd": 50
  },
  "defaults": {
    "forks_per_story": 3
  }
}
```

### Enterprise

```json
{
  "budget": {
    "max_spend_usd": 500,
    "warn_at_usd": 250
  },
  "defaults": {
    "forks_per_story": 5
  }
}
```

## Reporting

### Weekly Report

Generate with:

```bash
sigma sandbox cost --period=week --report
```

Outputs markdown report with:
- Total spend
- Cost by provider
- Cost by project/PRD
- Comparison to previous week
- Recommendations

### Export Data

```bash
# JSON export
sigma sandbox cost --export=json > costs.json

# CSV export
sigma sandbox cost --export=csv > costs.csv
```

## Troubleshooting

### "Budget Exceeded"

```bash
# Check current spend
sigma sandbox cost

# Destroy active sandboxes
sigma sandbox destroy --all

# Increase budget if needed
sigma config --set sandbox.budget.max_spend_usd=100
```

### Unexpected High Costs

1. Check for orphaned sandboxes: `sigma sandbox status`
2. Verify auto-destroy is enabled in config
3. Review cost log for anomalies
4. Contact provider support if charges seem wrong

### Cost Log Missing

```bash
# Initialize cost tracking
sigma sandbox setup
# Tracking automatically enabled
```

## API Reference

### CostEstimator Class

```javascript
const { CostEstimator } = require('./cli/lib/sandbox/cost-estimator');

const estimator = new CostEstimator(projectRoot, config);

// Get estimate
const estimate = await estimator.estimate({
  provider: 'e2b',
  stories: 10,
  forksPerStory: 3,
  estimatedMinutesPerStory: 15
});

// Record actual cost
await estimator.recordCost({
  provider: 'e2b',
  sandboxCount: 30,
  runtimeMinutes: 45,
  cost: 4.95
});

// Get summary
const summary = await estimator.getCostSummary('week');
```

### Budget Functions

```javascript
const { 
  getRemainingBudget,
  appendCostLog,
  loadCostLog 
} = require('./cli/lib/sandbox/config');

// Check remaining budget
const remaining = await getRemainingBudget(projectRoot, config);

// Log a cost entry
await appendCostLog(projectRoot, {
  provider: 'e2b',
  cost: 5.00,
  sandboxCount: 10
});
```

## See Also

- [Sandbox Guide](./SANDBOX-GUIDE.md) - Provider setup
- [Best of N Pattern](./BEST-OF-N.md) - Fork evaluation
- [Orchestration Overview](./ORCHESTRATION.md) - General orchestration


