# Thread-Based Engineering in Sigma Protocol

> *"How do you know you're improving? From the vibe coder to the senior engineer shipping to production with each prompt."*
> — IndyDevDan

Sigma Protocol implements **Thread-Based Engineering**, a framework for operationalizing and measuring AI agent workflows. This document explains how to think about, measure, and improve your agentic engineering capabilities.

---

## What is a Thread?

A **Thread** is a unit of engineering work over time, bookended by two mandatory human actions:

```
┌─────────┐     ┌──────────────┐     ┌─────────┐
│ PROMPT  │ ──► │  AGENT WORK  │ ──► │ REVIEW  │
│ or PLAN │     │ (Tool Calls) │     │ or VALIDATE │
└─────────┘     └──────────────┘     └─────────┘
     ▲                                    ▲
     │                                    │
   YOU                                  YOU
```

**Key Insight**: The value your agent creates is measured in **tool calls**. Tool calls ≈ impact (assuming useful prompts).

Pre-2023, **you** were the tool calls. Now, agents do the work while you focus on **planning** and **reviewing**.

---

## The 6 Thread Types

### 1. Base Thread (B)
The fundamental unit of agentic work.

```
Prompt → Agent Work → Review
```

**In Sigma Protocol:**
- Running any `@step-X` command
- Single Claude Code session
- Any prompt-to-completion cycle

**Example:**
```bash
# In Claude Code
@step-3-ideation "Build a task management app"
# Agent works...
# You review the output
```

---

### 2. P-Thread (Parallel)
Multiple threads running simultaneously to scale output.

```
Prompt A → Agent Work A ──┐
Prompt B → Agent Work B ──┼──► Review All
Prompt C → Agent Work C ──┘
```

**In Sigma Protocol:**
- `sigma orchestrate` - Spawns multiple streams
- mprocs/tmux with multiple panes
- Git worktrees for isolation

**Example:**
```bash
# Launch 4 parallel streams
sigma orchestrate --streams=4 --tui mprocs

# Each stream works on a different PRD
# Stream A: Authentication module
# Stream B: Database schema
# Stream C: API endpoints
# Stream D: Frontend components
```

**Boris Cherny's Setup:** 5 Claude Codes in terminal tabs + 5-10 in web interface

---

### 3. C-Thread (Chained)
Breaking high-stakes work into phases with human checkpoints.

```
Prompt → Work → Review → Prompt → Work → Review → ...
```

**When to use:**
- Work can't fit in a single context window
- High-pressure production work
- Migrations or sensitive deployments

**In Sigma Protocol:**
- The 13-step workflow IS a C-Thread
- Each step is a checkpoint
- `@continue` chains steps together

**Example:**
```bash
@step-5-prd-generation      # Phase 1
# Review PRD, approve
@step-6-tech-architecture   # Phase 2
# Review architecture, approve
@step-7-ux-flow            # Phase 3
# ...continues through deployment
```

---

### 4. F-Thread (Fusion)
Same prompt to multiple agents, aggregate the best results.

```
             ┌─► Claude ──┐
Prompt ──────┼─► Gemini ──┼──► Aggregate/Fuse ──► Best Result
             └─► Codex  ──┘
```

**Use cases:**
- Rapid prototyping ("Best of N")
- Increased confidence in answers
- Code review from multiple perspectives

**In Sigma Protocol:**
```bash
# F-Thread: Run same prompt across 3 models
sigma f-thread --prompt="Review auth implementation" \
  --models=claude,gemini,codex \
  --aggregate=best

# Or parallel code reviews
sigma orchestrate --streams=4 --same-prd
```

**Key Insight**: "The chances you'll have a successful agent complete the work go up when you have more agents trying."

---

### 5. B-Thread (Big/Meta)
A super-structure where agents prompt other agents.

```
┌──────────────────────────────────────────┐
│                B-THREAD                  │
│  ┌────────────────────────────────────┐  │
│  │  Orchestrator Agent                │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  │
│  │  │Plan │ │Scout│ │Build│ │Review│ │  │
│  │  │Agent│ │Agent│ │Agent│ │Agent│  │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
          ▲                        │
        Prompt                  Review
         YOU ◄─────────────────────┘
```

**In Sigma Protocol:**
- **Ralph Loop** = B-Thread implementation
- Orchestrator + Stream agents
- Sub-agents within Claude Code

**The Ralph Wiggum Pattern:**
```
Loop {
  Agent plans → Agent builds → Validation → Continue or Stop
}
```

**Example:**
```bash
# Start B-Thread orchestration
sigma orchestrate --mode=full-auto

# Orchestrator manages:
# - Planning agent (generates PRDs)
# - Scout agents (research/analysis)
# - Build agents (implementation)
# - Review agents (code review)
# - Deploy agent (staging/production)
```

---

### 6. L-Thread (Long Duration)
High autonomy, extended duration work without human intervention.

```
Prompt ────────────────────────────────────────────────► Review
         │ Tool │ Tool │ Tool │ ... │ Tool │ Tool │
         │ Call │ Call │ Call │ 100s│ Call │ Call │
         └──────┴──────┴──────┴─────┴──────┴──────┘
              Hours or even days of work
```

**In Sigma Protocol:**
- Long-running `@implement-prd` sessions
- Background Claude Code instances
- Stop hooks for validation

**Boris's Setup:** 
- Tasks running 1 day, 2+ hours
- Stop hooks for deterministic validation
- Background verification agents

**Stop Hook Pattern:**
```
Agent tries to stop → Stop hook runs → Validation code → 
  ├─► Continue (re-loop)
  └─► Complete (exit)
```

---

### 7. Z-Thread (Zero Touch) — The North Star
The ultimate goal: no human review needed.

```
Prompt ──────────────────────────────────────────────► Done
         (Fully autonomous, self-validating)
```

**This represents:**
- Complete trust in your agent system
- Self-validating workflows
- "Living software that works while you sleep"

**Progress toward Z-Thread:**
1. Start with Base threads
2. Add parallelism (P-threads)
3. Build orchestration (B-threads)
4. Extend duration (L-threads)
5. Remove checkpoints → Z-Thread

---

## How to Know You're Improving

### The 4 Dimensions of Growth

| Dimension | Metric | How to Improve |
|-----------|--------|----------------|
| **More Threads** | # of parallel agents | Use P-threads, multiple terminals |
| **Longer Threads** | Tool calls per session | Better prompts, context management |
| **Thicker Threads** | Nested agent depth | B-threads, orchestration |
| **Fewer Checkpoints** | Human interventions | Build trust, add validation |

### Self-Assessment Questions

1. How many agents are you running in parallel?
   - 1 = Beginner
   - 2-4 = Intermediate
   - 5-10+ = Advanced (Boris level)

2. How long do your agent sessions run?
   - Minutes = Getting started
   - Hours = Good autonomy
   - Days = Expert level

3. Do your agents prompt other agents?
   - No = Base threads only
   - Yes, sub-agents = B-thread capable
   - Full orchestration = Advanced

4. How often do you interrupt for review?
   - Every few minutes = Building trust
   - Every hour = Good trust
   - Only at milestones = High trust

---

## Sigma Protocol Thread Commands

### Quick Reference

```bash
# Base Thread - Single agent work
@step-7-ux-flow "Design checkout flow"

# P-Thread - Parallel agents
sigma orchestrate --streams=4 --tui mprocs

# C-Thread - Chained phases
sigma workflow --mode=stepped

# F-Thread - Fusion/multi-model
sigma f-thread --models=claude,gemini --prompt="Review API design"

# B-Thread - Orchestrated agents
sigma orchestrate --mode=full-auto

# L-Thread - Long duration
sigma orchestrate --duration=long --stop-hooks

# Thread Status
sigma thread status
sigma thread metrics
```

### Thread Type Selection Guide

| Scenario | Thread Type | Command |
|----------|-------------|---------|
| Quick task | Base | `@command` |
| Multiple features | P-Thread | `sigma orchestrate` |
| Production migration | C-Thread | Step-by-step workflow |
| Rapid prototyping | F-Thread | `sigma f-thread` |
| Full project build | B-Thread | `sigma orchestrate --mode=full-auto` |
| Background processing | L-Thread | Long-running with stop hooks |

---

## The Core Four

Everything comes back to these fundamentals:

1. **Context** - What the agent knows
2. **Model** - The AI's capabilities
3. **Prompt** - Your instructions
4. **Tools** - Agent's abilities

Master these, and you master Thread-Based Engineering.

---

## References

- [IndyDevDan - Thread-Based Engineering](https://www.youtube.com/indydevdan)
- [Boris Cherny's Claude Code Setup](https://twitter.com/ArkSyncAI/status/example)
- [mprocs - TUI for parallel processes](https://github.com/pvolok/mprocs)
- [Ralph Wiggum Pattern](https://github.com/jeff-huntley/ralph-wiggum)

---

*"If you want to scale your impact, you must scale your compute."* — IndyDevDan

