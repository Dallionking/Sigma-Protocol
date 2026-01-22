---
description: "Thread-Based Engineering wizard - choose the right thread type for your task"
allowed-tools:
  - Read
  - Write
  - Bash
---

# /thread

Thread-Based Engineering wizard - helps you choose the right thread type for your task.

## Thread Types

| Type | Symbol | When to Use |
|------|--------|-------------|
| **Base Thread** | B | Single task, quick completion |
| **P-Thread** | P | Multiple independent tasks in parallel |
| **C-Thread** | C | Complex task needing phased checkpoints |
| **F-Thread** | F | Need multiple perspectives/prototypes |
| **B-Thread** | B+ | Full project with orchestrated agents |
| **L-Thread** | L | Extended autonomous work (hours/days) |

## Usage

```
/thread                    # Interactive wizard
/thread status             # View active threads
/thread metrics            # Track improvement
```

## Quick Recommendations

**What are you doing?**

1. **Quick single task** → Use a Base Thread (just run your command)
2. **Multiple features** → Use P-Thread: `sigma orchestrate --tui mprocs`
3. **Step-by-step work** → Use C-Thread: Follow the 13-step workflow
4. **Need best result** → Use F-Thread: `sigma f-thread --prompt="..." --count=5`
5. **Full project build** → Use B-Thread: `sigma orchestrate --mode=full-auto`
6. **Long background work** → Use L-Thread: Configure stop hooks

## The 4 Dimensions of Improvement

Track your progress by measuring:

1. **More Threads** - How many agents in parallel? (Goal: 5-10+)
2. **Longer Threads** - How long do sessions run? (Goal: hours/days)
3. **Thicker Threads** - Do agents prompt other agents? (Goal: B-Thread capable)
4. **Fewer Checkpoints** - How often do you review? (Goal: milestone-only)

## Related Commands

- `/thread-status` - View active orchestration
- `/f-thread` - Start a fusion thread
- `/orchestrate-start` - Launch P-Thread orchestration

## Documentation

See [THREAD-BASED-ENGINEERING.md](docs/THREAD-BASED-ENGINEERING.md) for the full framework.


