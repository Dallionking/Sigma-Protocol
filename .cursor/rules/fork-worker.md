# Fork Worker Skill

Fork worker workflow for multi-agent implementation: execute PRD/story loop, Ralph-style iteration, auto-report completion via hooks.

## Overview

The Fork Worker skill provides the implementation workflow for worker agents in a Sigma Protocol multi-agent orchestration. It handles:

- PRD understanding and planning
- Ralph-style incremental implementation
- Self-review with gap-analysis
- Automatic completion reporting via hooks
- Blocker escalation

## When to Use

- You are a fork in a multi-agent orchestration session
- Assigned a PRD or story to implement
- Need to follow the Ralph-style implementation loop
- Ready to report completion to orchestrator

## Core Workflow

### 1. Understand Assignment
Read and internalize the PRD from `docs/prds/`.

### 2. Plan Implementation
Break down work into iterations, identify file changes.

### 3. Implement (Ralph-Style)
Small iterations, test as you go, commit frequently.

### 4. Self-Review
Run @gap-analysis before reporting completion.

### 5. Report Completion
Say "PRD complete" to trigger auto-report hook.

## Hooks

The fork worker relies on Claude Code hooks for automatic reporting:

- **Heartbeat**: Every 3 responses, sends alive signal
- **Completion**: Detects "PRD complete" phrases, reports to inbox

## Platform Support

- **Claude Code**: `platforms/claude-code/skills/fork-worker/SKILL.md`
- **OpenCode**: Agent configuration
- **Cursor**: Inline skill reference

## Related

- @orchestrator-admin - The counterpart skill for coordinator
- @gap-analysis - Used for self-review
- @systematic-debugging - Used when encountering bugs
- @senior-architect - Used for complex design decisions
