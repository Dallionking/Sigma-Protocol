# Orchestrator Admin Skill

Orchestrator workflow for multi-agent coordination: poll inbox, run gap-analysis on completions, compare forks, manage cleanup, send smart prompts to workers.

## Overview

The Orchestrator Admin skill provides the coordination workflow for the lead agent in a Sigma Protocol multi-agent orchestration. It handles:

- Inbox polling and message processing
- Completion review with gap-analysis
- Fork comparison and winner selection
- Work assignment with smart prompting
- Context management and cleanup

## When to Use

- You are the orchestrator in a multi-agent session
- Managing multiple fork workers on parallel PRDs
- A fork reports completion and needs review
- Comparing multiple fork implementations
- Assigning new work to available forks

## Core Workflow

### 1. Inbox Check
Check `.sigma/orchestration/inbox/orchestrator.json` for new messages from fork workers.

### 2. Review Completions
Run @gap-analysis on completed PRDs before approval.

### 3. Fork Comparison
When multiple forks complete the same PRD, compare implementations and pick winner.

### 4. Work Assignment
Send structured prompts to available forks with clear success criteria.

### 5. Cleanup
Maintain inbox below 50 messages, summarize older context.

## Platform Support

- **Claude Code**: `platforms/claude-code/skills/orchestrator-admin/SKILL.md`
- **OpenCode**: Agent configuration
- **Cursor**: Inline skill reference

## Related

- @fork-worker - The counterpart skill for worker agents
- @gap-analysis - Used to review completions
- @senior-architect - Used for technical arbitration
