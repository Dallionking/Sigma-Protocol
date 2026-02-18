# Ralph-Mode: Autonomous Agent Implementation Guide

**Version:** 1.0.0-alpha.1
**Last Updated:** 2026-02-04

This document explains how the Sigma Protocol integrates the "Ralph Loop" autonomous agent pattern for continuous, self-correcting PRD implementation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [New Commands & Schemas](#3-new-commands--schemas)
4. [End-to-End Workflow](#4-end-to-end-workflow)
5. [Ralph CLI Command](#5-ralph-cli-command)
6. [Verification Integration](#6-verification-integration)
7. [Agent Browser UI Validation](#7-agent-browser-ui-validation)
8. [Sandbox Execution](#8-sandbox-execution)
9. [PostToolUse Hooks](#9-posttooluse-hooks)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Overview

### What is the Ralph Loop?

The Ralph Loop is an autonomous AI agent workflow that iteratively implements user stories from a machine-readable `prd.json` backlog. Each iteration:

1. **Picks a pending story** from `prd.json`
2. **Spawns a fresh AI agent session** (Claude Code or OpenCode CLI)
3. **Implements the story** following the implementation guide
4. **Verifies implementation** against explicit acceptance criteria
5. **Updates story status** (`passes`/`fails`) in the backlog
6. **Records learnings** in `progress.txt` and `AGENTS.md`
7. **Loops** until all stories complete

### Thread-Based Engineering Connection

The Ralph Loop is a **B-Thread (Big/Meta Thread)** in the Thread-Based Engineering framework:

```
┌──────────────────────────────────────┐
│            RALPH LOOP                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │Pick  │→│Spawn │→│Impl  │→│Verify││
│  │Story │ │Agent │ │Story │ │Result││
│  └──────┘ └──────┘ └──────┘ └──────┘│
│             ↑                  │     │
│             └──────────────────┘     │
│                  LOOP                │
└──────────────────────────────────────┘
```

See [THREAD-BASED-ENGINEERING.md](THREAD-BASED-ENGINEERING.md) for the full framework.

### Why Ralph-Mode?

The previous Sigma v2 had gaps where agents would claim completion without actually verifying work. Ralph-mode solves this by:

- **Machine-readable backlogs** - JSON format enforces structure
- **Atomic stories** - Small enough for single context windows
- **Explicit acceptance criteria** - Verifiable tests prevent false claims
- **Fresh context per story** - Prevents context drift
- **Built-in verification** - Leverages `@verify-prd`, `@gap-analysis`, `@ui-healer`
- **Agent Browser validation** - 93% less context than Playwright for UI checks
- **Sandbox isolation** - Run agents in Docker, E2B, or Daytona environments
- **PostToolUse hooks** - Closed-loop validation catches errors in real-time

---

## 1.5 Taskmaster MCP Integration (Recommended)

For the best PRD-to-JSON conversion, we recommend using [Taskmaster MCP](https://github.com/eyaltoledano/claude-task-master) — an AI-powered task management system that intelligently parses PRDs into atomic tasks.

### Why Taskmaster?

| Manual Regex Parsing | Taskmaster MCP |
|---------------------|----------------|
| Fixed patterns | AI-powered understanding |
| May miss context | Intelligent decomposition |
| Basic task splitting | Smart breakdown with dependencies |
| No research | Can research best practices |

### Setup Taskmaster MCP

**For Claude Code:**
```bash
claude mcp add taskmaster-ai -- npx -y task-master-ai
```

**For Cursor:**
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Using Taskmaster with Ralph

```bash
# Step 5b: Convert prototype PRDs with Taskmaster
@step-5b-prd-to-json --use-taskmaster=true

# Step 11a: Convert implementation PRDs with Taskmaster
@step-11a-prd-to-json --use-taskmaster=true

# Then run Ralph loop as normal
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

### Taskmaster Tools Used

| Tool | Purpose |
|------|---------|
| `mcp_taskmaster_parse_prd` | Parse markdown PRD into tasks |
| `mcp_taskmaster_get_tasks` | Retrieve task list with subtasks |
| `mcp_taskmaster_expand_task` | Break complex tasks into subtasks |
| `mcp_taskmaster_analyze_project_complexity` | Assess project scope |
| `mcp_taskmaster_next_task` | Get next task to implement |
| `mcp_taskmaster_set_task_status` | Update task status |

---

## 1.6 Native Task Management (v3.0.0)

Ralph v3.0.0 adds native Claude Code task persistence for improved observability and session resume capability.

### The Hybrid Approach

Ralph uses a **hybrid approach** combining:
- **JSON backlog** (`prd.json`) - Story orchestration and completion tracking
- **Native tasks** - Sub-task tracking and session persistence via `CLAUDE_CODE_TASK_LIST_ID`

### Enabling Native Tasks

```bash
# Enable with auto-generated task list ID
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code --native-tasks

# Resume with existing task list ID
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code \
  --task-list-id=ralph-myproject-1234567890

# Force disable native tasks
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code --no-native-tasks
```

### How It Works

1. **On startup**, Ralph generates or loads a task list ID
2. **Exports** `CLAUDE_CODE_TASK_LIST_ID` for Claude Code to use
3. **Stores** the task list ID in `prd.json.meta.taskListId` for resume
4. **Worker prompts** include parent task creation instructions

### Worker Prompt Enhancement

When `--native-tasks` is enabled, worker prompts include:

```
## PARENT TASK (Mandatory First Step)

Before implementing anything, create a parent task for this story:
- subject: "[S001-001] Story Title"
- description: "Ralph story implementation"
- activeForm: "Implementing S001-001..."

Then mark it in progress, and when complete, mark it completed.
```

### Benefits

| Feature | Without Native Tasks | With Native Tasks |
|---------|---------------------|-------------------|
| Progress visibility | MARKER output only | Native spinner + /tasks |
| Session resume | Restart from beginning | Resume with task context |
| Parallel safety | Risk of race conditions | Atomic backlog updates |
| Observability | Check prd.json manually | Real-time status line |

### Resume After Interruption

```bash
# Read task list ID from prd.json
TASK_ID=$(jq -r '.meta.taskListId' docs/ralph/prototype/prd.json)

# Resume with same task list
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code \
  --task-list-id="$TASK_ID"
```

### Parallel Streams with Native Tasks

Native tasks are safe for parallel execution thanks to atomic backlog updates:

```bash
# Terminal 1
./ralph/sigma-ralph.sh . prd.json claude-code --native-tasks --stream=1

# Terminal 2
./ralph/sigma-ralph.sh . prd.json claude-code --native-tasks --stream=2
```

File locking (`flock`) prevents race conditions when updating `prd.json`.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Sigma Protocol Workflow                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Step 5: Wireframes        Step 11: PRD Generation                    │
│        ↓                            ↓                                   │
│   [Prototype PRDs]          [Implementation PRDs with ## Tasks]         │
│   docs/prds/flows/          docs/prds/F*.md                             │
│        ↓                            ↓                                   │
│   ┌────────────────┐        ┌────────────────┐                         │
│   │ Step 5b       │        │ Step 11a     │                         │
│   │ PRD → JSON     │        │ PRD → JSON     │                         │
│   └───────┬────────┘        └───────┬────────┘                         │
│           ↓                         ↓                                   │
│   .sigma/ralph-backlog.json    .sigma/ralph-backlog.json                   │
│           │                         │                                   │
│           └─────────┬───────────────┘                                   │
│                     ↓                                                   │
│           ┌─────────────────┐                                           │
│           │  sigma ralph    │  ←── Unified CLI command                  │
│           │  (Ralph CLI)    │      (replaces sigma-ralph.sh)            │
│           └────────┬────────┘                                           │
│                    ↓                                                    │
│           ┌─────────────────┐                                           │
│           │ Claude Code or  │  ←── Fresh session per story              │
│           │ Cursor/OpenCode │      (optional sandbox isolation)         │
│           └────────┬────────┘                                           │
│                    ↓                                                    │
│           ┌─────────────────────────────────────────────────┐          │
│           │ PostToolUse Hooks (Closed Loop Validation)      │          │
│           │  • prd-validator.py (PRD structure)             │          │
│           │  • typescript-validator.sh (type check)         │          │
│           │  • ui-validation.sh (Agent Browser)             │          │
│           │  • design-tokens-validator.py (tokens)          │          │
│           └────────┬────────────────────────────────────────┘          │
│                    ↓                                                    │
│           ┌─────────────────┐                                           │
│           │ Agent Browser   │  ←── 93% less context than Playwright     │
│           │ UI Validation   │      @e1, @e2 ref-based elements         │
│           └────────┬────────┘                                           │
│                    ↓                                                    │
│           [ralph-backlog.json updated with passes/fails]                │
│           [progress.txt updated with learnings]                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose | Location |
|------|---------|----------|
| `ralph-backlog.json` | Machine-readable story backlog | `.sigma/` or `docs/ralph/` |
| `invokes.json` | Agent/skill invocation map | `.sigma/` |
| `prd-map.json` | Maps markdown PRDs to JSON backlogs | `docs/ralph/` |
| `progress.txt` | Short-term memory between iterations | `docs/ralph/` |
| `AGENTS.md` | Long-term architectural learnings | `docs/ralph/` |
| `sss-cli.js` | Ralph CLI (sigma ralph command) | `tools/` |
| `run-in-sandbox.sh` | Sandbox orchestrator (Docker/E2B/Daytona) | `scripts/sandbox/` |
| `ui-validation.sh` | Agent Browser UI validation hook | `.claude/hooks/validators/` |
| `prd-validator.py` | PRD structure validation hook | `.claude/hooks/validators/` |

---

## 3. New Commands & Schemas

### 3.1 JSON Schemas

**`schemas/ralph-backlog.schema.json`**

Defines the structure for `prd.json` backlogs:

```json
{
  "$schema": "...",
  "meta": {
    "generatedAt": "2026-01-11T00:00:00Z",
    "sourcePrd": "docs/prds/F01-auth.md",
    "version": "1.0.0"
  },
  "stories": [
    {
      "id": "F01-S01",
      "title": "User can enter email on login form",
      "description": "...",
      "status": "pending",
      "priority": "P0",
      "dependencies": [],
      "acceptanceCriteria": [
        {
          "description": "Login form component exists",
          "type": "file_exists",
          "command": "ls src/components/LoginForm.tsx",
          "expectedOutput": "LoginForm.tsx",
          "status": "pending"
        }
      ],
      "implementationGuide": "Create LoginForm component with email input...",
      "filesToCreate": ["src/components/LoginForm.tsx"]
    }
  ]
}
```

**`schemas/ralph-prd-map.schema.json`**

Tracks conversions for change detection:

```json
{
  "mappings": [
    {
      "prdId": "F01",
      "markdownPath": "docs/prds/F01-auth.md",
      "jsonBacklogPath": "docs/ralph/implementation/F01-auth.json",
      "conversionDate": "2026-01-11T00:00:00Z",
      "status": "converted",
      "originalHash": "abc123..."
    }
  ]
}
```

### 3.2 New Step Commands

| Command | When to Use | Input | Output |
|---------|-------------|-------|--------|
| `@step-5b-prd-to-json` | After Step 5, before prototype implementation | `docs/prds/flows/**/*.md` | `docs/ralph/prototype/prd.json` |
| `@step-11a-prd-to-json` | After Step 11, before implementation | `docs/prds/F*.md` | `docs/ralph/implementation/prd.json` |

**Parameters:**

```bash
# Convert specific PRD
@step-5b-prd-to-json --prd-path="docs/prds/flows/01-auth/01-login.md"

# Convert all prototype PRDs
@step-5b-prd-to-json --all-prds

# Convert implementation PRDs
@step-11a-prd-to-json --all-prds
```

### 3.3 Updated Step 11b (Swarm Mode)

Now supports Ralph-mode:

```bash
# Traditional swarm (manual implementation)
@step-11b-prd-swarm --terminals=4

# Ralph-mode swarm (autonomous implementation)
@step-11b-prd-swarm --terminals=4 --ralph-mode
```

When `--ralph-mode` is enabled, Step 11b:
1. Groups PRDs into swarms
2. Runs `@step-11a-prd-to-json` for each swarm
3. Generates `prd.json` backlogs ready for Ralph runner

---

## 4. End-to-End Workflow

### 4.1 Prototype Implementation (Steps 5 → 5.5 → Ralph)

```bash
# 1. Generate wireframes and prototype PRDs
@step-5-wireframe-prototypes --flow="Onboarding"

# 2. Convert to Ralph-mode JSON
@step-5b-prd-to-json --all-prds

# 3. Run Ralph loop for prototype implementation
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

### 4.2 Full Implementation (Steps 11 → 11.25 → Ralph)

```bash
# 1. Generate implementation PRDs
@step-11-prd-generation --feature="User Authentication"

# 2. Convert to Ralph-mode JSON
@step-11a-prd-to-json --all-prds

# 3. Run Ralph loop for full implementation
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

### 4.3 Swarm Implementation (Multiple PRDs in Parallel)

```bash
# 1. Generate all PRDs
@step-11-prd-generation --all-features

# 2. Orchestrate with Ralph-mode
@step-11b-prd-swarm --terminals=4 --ralph-mode

# 3. Run Ralph loop on each swarm (in separate terminals)
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-1/prd.json claude-code
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-2/prd.json claude-code
# etc.
```

---

## 5. Ralph CLI Command

The `sigma ralph` command is the unified entry point for Ralph Loop execution.

### Installation

```bash
# Install globally (if published)
npm install -g sigma-protocol

# Or use locally via npx
npx sigma ralph --help
```

### Usage

```bash
sigma ralph [options]

Options:
  -t, --target <directory>   Target project directory (default: current)
  -e, --engine <engine>      AI engine: claude, cursor, opencode (default: claude)
  -p, --parallel <count>     Parallel execution count or 'auto'
  --prd <name>               Run specific PRD only
  --stream <id>              Run specific stream only
  -b, --backlog <path>       Path to ralph-backlog.json
  --browser                  Enable Agent Browser UI validation (default: on)
  --no-browser               Disable browser validation
  --sandbox <type>           Run in sandbox: docker, e2b, daytona
  --dry-run                  Show execution plan without running
```

### Examples

```bash
# Basic usage - runs all pending stories
sigma ralph

# Use Cursor as the AI engine
sigma ralph --engine cursor

# Run specific PRD only
sigma ralph --prd feature-auth

# Run in Docker sandbox for isolation
sigma ralph --sandbox docker

# Run in E2B cloud sandbox
sigma ralph --sandbox e2b

# Parallel execution with 3 workers
sigma ralph --parallel 3

# Show execution plan without running
sigma ralph --dry-run

# Use custom backlog file
sigma ralph --backlog docs/ralph/custom-backlog.json
```

### What the CLI Does

1. **Loads backlog** from `.sigma/ralph-backlog.json` (or custom path)
2. **Filters stories** by status (`pending`), dependencies, PRD name, or stream
3. **Displays execution plan** and confirms with user
4. **For each story:**
   - Builds implementation prompt with tasks and acceptance criteria
   - Spawns fresh AI session (Claude Code, Cursor, or OpenCode)
   - Optionally wraps in sandbox (Docker/E2B/Daytona)
   - Verifies acceptance criteria after implementation
   - Runs Agent Browser UI validation if `ui-validation` AC type present
5. **Updates backlog** with `passes: true/false` and timestamps
6. **Generates summary report** with pass/fail counts

### Legacy Shell Script

The original `sigma-ralph.sh` script is still available for backward compatibility:

```bash
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

But the `sigma ralph` CLI is now the recommended approach.

---

## 6. Verification Integration

### Acceptance Criteria Types

| Type | Validator | Example | Description |
|------|-----------|---------|-------------|
| `file-exists` | Built-in | `src/components/Button.tsx` | File exists at path |
| `file-contains` | Built-in | `export default` | File contains pattern |
| `command` | Built-in | `npm run build` | Command exits with code 0 |
| `ui-validation` | Agent Browser | `/login` | Page renders correctly |
| `artifact-check` | Design Tokens | `tokens.json` | Tokens valid |
| `manual` | Human review | N/A | Requires human verification |

### UI Validation Mode Selection

The `ui-validation` acceptance criteria type supports multiple browser modes:

```json
{
  "type": "ui-validation",
  "route": "/dashboard",
  "mode": "agent-browser",
  "checks": [
    { "type": "content-exists", "expectedText": "Dashboard" },
    { "type": "interaction", "action": "click", "selector": "button" }
  ]
}
```

**Supported modes:**
- `agent-browser` - Vercel's Agent Browser CLI (recommended, 93% less context)
- `playwright` - Playwright MCP server
- `cursor-browser` - Cursor IDE built-in browser
- `claude-browser` - Claude Code browser extension
- `any` - Auto-select available browser
- `manual` - Human verification required

---

## 7. Agent Browser UI Validation

Agent Browser by Vercel is the recommended tool for UI validation in Ralph mode. It uses 93% less context than Playwright MCP by returning ref-based element identifiers instead of full DOM trees.

### Installation

```bash
npm install -g agent-browser
```

### How It Works

1. **PostToolUse hook triggers** after Write/Edit on component files
2. **Hook extracts route** from file path (Next.js App/Pages Router)
3. **Agent Browser opens route** and takes snapshot
4. **Validation checks:**
   - Page renders without errors (no 500/404)
   - Expected content exists
   - Interactive elements present
5. **JSON result** returned to agent with pass/fail

### Agent Browser Commands

```bash
# Open a URL
agent-browser open http://localhost:3000/dashboard

# Get interactive elements (returns @refs like @e1, @e2)
agent-browser snapshot -i

# Interact with elements
agent-browser click @e2
agent-browser fill @e3 "test@example.com"
agent-browser select @e4 "option-value"

# Take screenshot
agent-browser screenshot validation-dashboard.png

# Session management (for isolation)
agent-browser session create my-session
agent-browser session use my-session
agent-browser session destroy my-session
```

### Route Extraction

The `ui-validation.sh` hook automatically extracts routes from file paths:

| File Path | Extracted Route |
|-----------|-----------------|
| `app/dashboard/page.tsx` | `/dashboard` |
| `app/settings/profile/page.tsx` | `/settings/profile` |
| `app/users/[id]/page.tsx` | `/users/:id` |
| `pages/about.tsx` | `/about` |
| `components/dashboard/Header.tsx` | `/dashboard` |

### Validation Output Contract

```json
{
  "status": "pass",
  "file_path": "src/app/dashboard/page.tsx",
  "message": "UI validation passed at route /dashboard",
  "errors": [],
  "agent_instruction": "RALPH_UI_VALIDATION_PASSED: Component renders correctly at /dashboard"
}
```

---

## 8. Sandbox Execution

Run Ralph Loop in isolated sandbox environments for safety and reproducibility.

### Quick Start

```bash
# 1. Set up sandbox provider (interactive wizard)
sigma sandbox setup

# 2. Run Ralph with sandbox isolation
sigma ralph --sandbox --sandbox-provider=docker

# 3. Monitor costs
sigma sandbox cost
```

### Provider Comparison

| Provider | Cost | Startup | Scalability | Best For |
|----------|------|---------|-------------|----------|
| **Docker** | FREE | ~10s | 2-4 local | Solo dev, testing |
| **E2B** | ~$0.10/min | ~30s | 10+ cloud | CI/CD, teams |
| **Daytona** | ~$0.08/min | ~45s | 10+ cloud | Open-source teams |

### CLI Flags

```bash
sigma ralph --sandbox                          # Enable sandbox isolation
sigma ralph --sandbox-provider=<provider>      # docker, e2b, daytona
sigma ralph --sandbox-timeout=<seconds>        # Creation timeout (default: 120)
sigma ralph --sandbox-memory=<size>            # Docker memory (default: 4g)
sigma ralph --sandbox-cpus=<n>                 # Docker CPUs (default: 2)
sigma ralph --budget-max=<usd>                 # Max spend (default: $50)
sigma ralph --budget-warn=<usd>                # Warning threshold (default: $25)
sigma ralph --validate-only                    # Validate PRD without running
```

### Docker Sandbox (FREE)

```bash
# Set up Docker provider
sigma sandbox setup --provider=docker

# Build sigma-sandbox image (automatic on first use)
sigma sandbox build

# Run Ralph with Docker isolation
sigma ralph --sandbox --sandbox-provider=docker

# Custom resources
sigma ralph --sandbox --sandbox-provider=docker --sandbox-memory=8g --sandbox-cpus=4
```

Docker provides free local isolation using containers. No API keys required.

### E2B Cloud Sandbox

```bash
# Set API key
export E2B_API_KEY="sk_..."

# Set up E2B provider
sigma sandbox setup --provider=e2b

# Test connection
sigma sandbox test

# Run Ralph with E2B
sigma ralph --sandbox --sandbox-provider=e2b --budget-max=25
```

E2B provides scalable cloud sandboxes. Used by Perplexity, Manus, Groq.

### Daytona Sandbox

```bash
# Set API key
export DAYTONA_API_KEY="..."
export DAYTONA_API_URL="https://api.daytona.io"  # Optional

# Set up Daytona provider
sigma sandbox setup --provider=daytona

# Run Ralph with Daytona
sigma ralph --sandbox --sandbox-provider=daytona
```

Daytona is an open-source option with self-hosting capabilities.

### Budget Protection

Cloud providers automatically track costs:

```bash
# Set budget limits
sigma ralph --sandbox --sandbox-provider=e2b \
  --budget-max=30 \
  --budget-warn=20

# View current spending
sigma sandbox cost
sigma sandbox cost --period=week
```

Budget protection prevents runaway costs. Ralph stops if budget is exceeded.

### Sandbox Management Commands

```bash
# Interactive setup wizard
sigma sandbox setup

# Quick provider setup
sigma sandbox setup --provider=docker

# Check status
sigma sandbox status

# View costs
sigma sandbox cost --period=week

# Destroy all sandboxes
sigma sandbox destroy --all
```

### Sandbox Session Schema

Session state is tracked in `.sigma/sandbox-session.json`:

```json
{
  "sessionId": "uuid",
  "startedAt": "2026-01-21T00:00:00Z",
  "provider": "docker",
  "status": "running",
  "sandboxes": [
    {
      "id": "sandbox-1",
      "storyId": "F01-S01",
      "status": "completed",
      "result": {
        "testResults": { "total": 5, "passed": 5, "failed": 0 },
        "evaluation": { "score": 95, "meetsThresholds": true }
      }
    }
  ]
}
```

### Tutorials

For detailed setup guides:
- [E2B Tutorial](tutorials/RALPH-E2B-TUTORIAL.md)
- [Docker Tutorial](tutorials/RALPH-DOCKER-TUTORIAL.md)
- [Daytona Tutorial](tutorials/RALPH-DAYTONA-TUTORIAL.md)
- [Full Integration Guide](RALPH-SANDBOX-INTEGRATION.md)

---

## 9. PostToolUse Hooks

PostToolUse hooks enable the "Closed Loop Prompt" pattern where agents automatically fix validation failures in the same session.

### Configured Hooks

| Hook | Trigger | Files | Purpose |
|------|---------|-------|---------|
| `prd-validator.py` | Edit/Write | `**/prds/*.md` | Validate PRD structure |
| `bdd-validator.py` | Edit/Write | `**/*.feature` | Validate BDD scenarios |
| `typescript-validator.sh` | Edit/Write | `**/*.{ts,tsx}` | Type check |
| `ui-validation.sh` | Edit/Write | `**/components/**/*.{tsx,jsx}` | Agent Browser validation |
| `ui-validation.sh` | Edit/Write | `**/app/**/page.{tsx,jsx}` | Page validation |
| `design-tokens-validator.py` | Edit/Write | `**/*token*.json`, `**/*theme*.json` | Token validation |

### Hook Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validators/prd-validator.py\" \"$CLAUDE_FILE_PATH\"",
            "condition": {
              "glob": "**/prds/*.md"
            }
          }
        ]
      }
    ]
  }
}
```

### Hook Output Contract

All validators return JSON with this structure:

```json
{
  "status": "pass|fail|skip|error",
  "file_path": "/path/to/file",
  "errors": [
    {
      "line": 42,
      "severity": "error",
      "code": "MISSING_SECTION",
      "message": "Missing: ## BDD Scenarios",
      "fix_suggestion": "Add BDD scenarios section"
    }
  ],
  "warnings": [],
  "summary": {
    "total_errors": 1,
    "ralph_ready": false
  },
  "agent_instruction": "FIX these errors NOW, then the hook will re-validate automatically."
}
```

### PRD Validator Ralph Integration

The PRD validator checks for Ralph Loop readiness:

- **Section 16: Ralph Loop Tasks** - Task checklist with IDs (DB-001, API-001, etc.)
- **AC Mapping Table** - Maps tasks to story IDs and AC types
- **UI Validation ACs** - Components have ui-validation acceptance criteria

A PRD is `ralph_ready: true` when:
- Has Section 16 with 3+ tasks
- Has AC mapping table
- Has ui-validation ACs for UI components

---

## 10. Agent/Skill Invocation Map (@invokes)

Step 13 now generates `.sigma/invokes.json` with machine-readable agent selection rules.

### Pattern-Based Agent Selection

```json
{
  "patterns": {
    "**/components/**": {
      "primary": "@frontend-engineer",
      "fallback": "@senior-architect"
    },
    "**/api/**": {
      "primary": "@lead-architect",
      "fallback": "@senior-architect"
    },
    "**/*.test.*": {
      "primary": "@qa-engineer",
      "fallback": "@senior-qa"
    }
  },
  "acceptanceCriteriaTypes": {
    "ui-validation": {
      "validator": "ui-validation.sh",
      "agent": "@frontend-engineer"
    },
    "command": {
      "validator": "typescript-validator.sh",
      "agent": "@qa-engineer"
    }
  }
}
```

### Usage in Ralph Loop

When executing a story, the CLI:
1. Reads `.sigma/invokes.json`
2. Matches story files against patterns
3. Selects appropriate agent
4. Injects agent instructions into prompt

---

## 11. Troubleshooting & FAQ

### Q: Stories keep failing verification?

**A:** Check that acceptance criteria are correctly configured:
- Ensure file paths match your project structure
- Verify the AC `type` is correct (`file-exists`, `command`, `ui-validation`)
- Run verification commands manually to debug

### Q: Agent Browser validation failing?

**A:** Check:
1. Dev server is running: `npm run dev`
2. Agent Browser is installed: `npm install -g agent-browser`
3. Route exists in your app router
4. No console errors on the page

Run manually to debug:
```bash
agent-browser open http://localhost:3000/your-route
agent-browser snapshot -i
```

### Q: PostToolUse hooks not running?

**A:** Verify hook configuration in `.claude/settings.json`:
1. Check `matcher` matches the tool (Edit, Write)
2. Check `condition.glob` matches your file path
3. Ensure hook script is executable

### Q: How do I resume after interruption?

**A:** Simply run the CLI again - it picks up from the first `pending` story:
```bash
sigma ralph
```

### Q: Can I run multiple Ralph loops in parallel?

**A:** Yes, using the `--parallel` flag or separate streams:
```bash
# Automatic parallel execution
sigma ralph --parallel 3

# Or manual with streams
sigma ralph --stream swarm-1  # Terminal 1
sigma ralph --stream swarm-2  # Terminal 2
```

### Q: How do I run in a sandbox?

**A:** Use the `--sandbox` flag:
```bash
# Docker (local)
sigma ralph --sandbox docker

# E2B (cloud) - requires E2B_API_KEY
export E2B_API_KEY="your-key"
sigma ralph --sandbox e2b

# Daytona
sigma ralph --sandbox daytona
```

### Q: How do I handle dependencies between stories?

**A:** Stories have a `dependsOn` array:
```json
{
  "id": "F01-S02",
  "dependsOn": ["F01-S01"],
  "passes": false
}
```
The CLI skips stories with unmet dependencies.

### Q: PRD not marked as "ralph_ready"?

**A:** Your PRD needs:
1. Section 16: Ralph Loop Tasks with 3+ tasks
2. AC mapping table with Task ID → Story ID mapping
3. ui-validation AC types for UI components

Run the validator to check:
```bash
python3 .claude/hooks/validators/prd-validator.py docs/prds/your-prd.md
```

### Q: Where are learnings stored?

**A:**
- **Short-term:** `docs/ralph/progress.txt` (per-story notes)
- **Long-term:** `docs/ralph/AGENTS.md` (architectural patterns)
- **Backlog:** `.sigma/ralph-backlog.json` (story status)

---

## Quick Start Checklist

- [ ] Install Sigma CLI: `npm install -g sigma-protocol`
- [ ] Install Agent Browser: `npm install -g agent-browser`
- [ ] Generate PRDs (Step 5 or Step 11)
- [ ] Convert to JSON: `sigma step-5b-prd-to-json` or `sigma step-11a-prd-to-json`
- [ ] Start dev server: `npm run dev`
- [ ] Run Ralph loop: `sigma ralph`
- [ ] Monitor `.sigma/ralph-backlog.json` for status updates

### For Sandbox Execution

- [ ] Docker: `docker build -t sigma-sandbox:latest scripts/sandbox/`
- [ ] E2B: Set `E2B_API_KEY` environment variable
- [ ] Daytona: Install Daytona CLI

---

## Related Documentation

- [COMMANDS.md](./COMMANDS.md) - Full command catalog
- [schemas/ralph-backlog.schema.json](../schemas/ralph-backlog.schema.json) - Backlog schema
- [schemas/sandbox-session.schema.json](../schemas/sandbox-session.schema.json) - Sandbox session schema
- [steps/step-5b-prd-to-json](../steps/step-5b-prd-to-json) - Prototype converter
- [steps/step-11a-prd-to-json](../steps/step-11a-prd-to-json) - Implementation converter
- [src/skills/browser-verification.md](../src/skills/browser-verification.md) - Agent Browser skill
