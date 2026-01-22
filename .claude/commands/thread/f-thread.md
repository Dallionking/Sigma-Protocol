---
description: "Run a Fusion Thread - same prompt to multiple agents, aggregate best results"
allowed-tools:
  - Read
  - Write
  - Bash
---

# /f-thread

Run a Fusion Thread (F-Thread) - the same prompt sent to multiple agents simultaneously, with results aggregated.

## Why Use F-Thread?

- **Rapid Prototyping** - Get multiple solutions quickly
- **Increased Confidence** - If 4/5 agents agree, you can trust it
- **Code Review** - Multiple perspectives on the same code
- **Best of N** - Pick the best result from several attempts

## Usage

```
/f-thread "Review the authentication implementation"
/f-thread --count=5 "Implement user dashboard"
/f-thread --aggregate=consensus "What's the best approach for caching?"
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--count=N` | 3 | Number of agents to spawn |
| `--aggregate=STRATEGY` | best | How to combine results |

### Aggregation Strategies

- `best` - Pick the best result (human review)
- `consensus` - Find common patterns across results
- `merge` - Combine unique insights from each
- `vote` - Majority wins

## How It Works

```
           ┌─► Agent 1 ──┐
  Prompt ──┼─► Agent 2 ──┼──► Aggregate ──► Best Result
           └─► Agent 3 ──┘
```

1. Same prompt sent to N agents in parallel
2. All agents work independently
3. Results collected and compared
4. Best/aggregated result selected

## Example: Code Review

```
/f-thread --count=5 --aggregate=consensus \
  "Review src/auth/ for security issues"
```

This spawns 5 agents, each reviewing the auth code. The consensus of their findings gives higher confidence than a single review.

## Execution

```bash
#!/bin/bash
PROMPT="$1"
COUNT="${2:-3}"
AGGREGATE="${3:-best}"

echo "Starting F-Thread..."
echo "  Prompt: $PROMPT"
echo "  Agents: $COUNT"
echo "  Strategy: $AGGREGATE"

# Use CLI to start fusion thread
sigma f-thread --prompt="$PROMPT" --count="$COUNT" --aggregate="$AGGREGATE"
```

## Related Commands

- `/thread` - Thread type wizard
- `/orchestrate-start` - P-Thread orchestration
- `/thread-status` - View active threads

## Documentation

See [THREAD-BASED-ENGINEERING.md](docs/THREAD-BASED-ENGINEERING.md) for the full framework.

*"The chances of successful completion go UP when you have MORE agents trying."* — IndyDevDan


