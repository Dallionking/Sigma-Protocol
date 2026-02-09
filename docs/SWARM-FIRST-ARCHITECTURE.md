# Swarm-First Architecture Analysis

**Working Document** -- Platform-adaptive swarm orchestration design.
**Date:** 2026-02-08
**Updated:** 2026-02-09 (CLI redesign, cleanup plan, UX design, DA review consolidated, command count corrections, module system, hooks strategy, SigmaStream architecture, Gotham Night palette, 28-PRD roadmap, pre-rewrite brainstorming sweep, prompting methodology, OSS repo cleanup plan)

**Supported Platforms:** Claude Code, Codex, Factory Droid, OpenCode

---

## 1. Current State: What `sigma install --platform <X>` Actually Does

### Claude Code (`sigma install --platform claude-code`)
- Copies 186 skills to `.claude/skills/`
- Copies 187 commands to `.claude/commands/`
- Copies 22 agent definitions to `.claude/agents/`
- Copies rules to `.claude/rules/`
- Generates CLAUDE.md (project instructions)
- Sets up hooks in `.claude/hooks/`
- Installs MCP config (`.mcp.json`)

### Codex (`sigma install --platform codex`)
- Copies ~182 skills to `.codex/skills/<name>/SKILL.md`
- Copies config.toml to `.codex/config.toml`
- Copies 3 execution policy rules to `.codex/rules/`
- Generates AGENTS.md at project root
- Copies Ralph scripts to `scripts/ralph/`
- **MISSING: No agents installed** (Codex doesn't have `.codex/agents/`)
- **MISSING: No commands installed** (steps work as skills only)

### Factory Droid (`sigma install --platform factory-droid`)
- Copies 163 skills to `.factory/skills/<name>/SKILL.md`
- Copies 120+ commands to `.factory/commands/`
- Copies droids to `.factory/droids/`
- Generates .droid.yaml config
- **Has builder but no dedicated builder file** (uses index.js generic)

### OpenCode (`sigma install --platform opencode`)
- Copies skills to `.opencode/skill/<name>/SKILL.md`
- Copies commands to `.opencode/commands/`
- **Status: Planned, not fully deployed**

---

## 2. Platform Capability Matrix

| Capability | Claude Code | Codex | Factory Droid | OpenCode |
|-----------|------------|-------|--------------|----------|
| **Agent Teams** | Native (TeamCreate + SendMessage) -- EXPERIMENTAL | Collab mode (experimental) + Desktop App panes + Worktrees | Custom Droids (subagents) + Droid Army | Planned |
| **Subagent Spawning** | Task tool (restricted by agent) | 5 collab tools: spawn_agent, send_input, wait, resume_agent, close_agent | Task tool with subagent_type (custom droids) | Planned |
| **Spawn Depth Guard** | No documented limit | MAX_THREAD_SPAWN_DEPTH (hard limit in Rust core) | Not documented | N/A |
| **Task Dependencies** | blockedBy/blocks (TaskCreate) | None (manual coordination) | None (manual via TodoWrite) | Planned |
| **Agent Memory** | MEMORY.md (3 scopes: project/local/user) | Session snapshots + fork/resume | Session continuation via --session-id | Planned |
| **Execution Policy** | Hooks system (Pre/PostToolUse) | Starlark prefix_rule() in .rules files | --auto tiered autonomy (5 levels) | Planned |
| **MCP Servers** | Full (stdio + HTTP) | Full (stdio + HTTP) | Full (40+ in registry: Figma, Chrome DevTools, etc.) | Planned |
| **Background/Async** | Task subagents (run_in_background) | Background mode + Cloud tasks | droid exec headless (one-shot) | Planned |
| **Session Fork/Resume** | No | Yes (fork, resume, share) | Session continuation (--session-id) | No |
| **Plan Mode** | Yes (EnterPlanMode) | /review structured + Plan mode default (v0.94.0) | Spec mode (--use-spec --spec-model) | No |
| **Lifecycle Hooks** | 9 events (Pre/PostToolUse, etc.) | Starlark rules + request_rule | 9 events (SubagentStop, etc.) | Planned |
| **Skills System** | 186 flat .md | 182 folder/SKILL.md | 163 folder/SKILL.md | 0 |
| **Commands** | 187 | 0 (as skills) | 120+ | 0 |
| **Agents** | 22 defined | 0 (3 built-in AgentRoles) | Custom droids (user-defined, YAML frontmatter) | 0 |
| **GitHub Action** | No official action | openai/codex-action@v1 | Factory-AI/droid-code-review@latest | No |
| **Desktop App** | N/A | Codex App (worktrees, cloud, automations) | N/A | Desktop App with review panes |
| **Model Support** | Opus 4.6 (primary) | GPT-5.3-Codex (primary), gpt-5.1-codex-mini (Explorer) | Multi-model: Claude Opus/Sonnet/Haiku 4.5, GPT-5.1-Codex-Max, Gemini 3 Pro/Flash, GLM-4.6 | Multi-model |
| **Agent Import** | N/A (canonical source) | N/A | `/droids` -> "Import from Claude Code" auto-converts .claude/agents/ | N/A |

---

## 3. Research Findings: Subagent Capabilities Deep Dive

### 3.1 Claude Code Multi-Agent System (Official Docs Verified)

**Source:** code.claude.com official documentation, npm changelog, GitHub releases

Claude Code has TWO DISTINCT multi-agent mechanisms:

#### Subagents (Task Tool) -- Production
- `Task(subagent_type, prompt)` spawns focused workers
- Each subagent gets a fresh context window
- Results return to caller only
- Lower token cost than full teams
- `Task(agent_type)` syntax in agent frontmatter restricts which types an agent can spawn (v2.1.33)

#### Agent Teams (TeamCreate + SendMessage) -- EXPERIMENTAL
- **Requires:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` env var
- Full independent sessions with inter-agent messaging
- Shared task list (TaskCreate/Update/List/Get with blockedBy/blocks)
- Two display modes: **in-process** (default) and **split panes** (tmux/iTerm2)
- **Delegate mode** (Shift+Tab): restricts lead to coordination-only tools
- Plan approval for teammates (plan_mode_required)
- Task claiming uses file locking
- Teams stored at `~/.claude/teams/{team-name}/`
- Each teammate loads CLAUDE.md, MCP, skills but NOT lead's conversation history
- **Limitations:** No nested teams. No session resumption with in-process teammates.

#### Memory System
- `memory:` frontmatter with 3 scopes: project, local, user
- MEMORY.md injection (first 200 lines into system prompt at session start)
- Project scope: `.claude/agent-memory/` (committed to git)
- Local scope: `.claude/agent-memory-local/` (gitignored, sensitive)
- User scope: `~/.claude/agent-memory/` (spans all repos)

#### Lifecycle Hooks (9 events)
PreToolUse, PostToolUse, UserPromptSubmit, Notification, Stop, SubagentStop, PreCompact, SessionStart, SessionEnd

#### Version Reference
| Version | Key Changes |
|---------|-------------|
| **v2.1.37** | Fixed `/fast` not available after `/extra-usage` |
| **v2.1.36** | Fast mode for Opus 4.6 (same model, faster output, toggle with `/fast`) |
| **v2.1.34** | Security fix (sandbox bypass), agent teams crash fix, agent color customization |
| **v2.1.33** | TeammateIdle hook, TaskCompleted hook, `Task(agent_type)` spawn restrictions, memory frontmatter |
| **v2.1.32** | Opus 4.6 model, Agent Teams research preview, auto memory system |

**Breaking:** Claude Opus 4 and 4.1 deprecated. Current model: Opus 4.6.

### 3.2 Codex Subagent System (Source Code + Official Docs Verified)

**Source:** Codex CLI source code (`codex-rs/core/src/agent/role.rs`, `codex-rs/core/src/tools/handlers/collab.rs`), developers.openai.com

#### AgentRole Enum (4 roles)

```rust
pub enum AgentRole {
    Default,       // Inherit parent agent's configuration unchanged
    Orchestrator,  // Coordination-only (COMMENTED OUT in ALL_ROLES)
    Worker,        // Task-executing agent for implementation work
    Explorer,      // Fast codebase queries, uses gpt-5.1-codex-mini, medium reasoning
}
```

**Active roles:** Default, Worker, Explorer (3 of 4).
**Orchestrator:** Defined but commented out of `ALL_ROLES` -- has `orchestrator.md` prompt template but not yet stable.

#### Collab Tools (5 tools -- bidirectional communication)

The collab system is gated behind the `Feature::Collab` flag. When enabled, the model gets **5 dedicated tools** defined in `codex-rs/core/src/tools/spec.rs`:

| Tool | Parameters | Description |
|------|-----------|-------------|
| `spawn_agent` | `message` (required), `agent_type` (optional: default/explorer/worker) | Spawn a sub-agent for a scoped task. Returns agent ID. |
| `send_input` | `id`, `message`, `interrupt` (optional bool) | Send message to running agent. `interrupt=true` redirects immediately. |
| `wait` | `ids` (array), `timeout_ms` (optional) | Wait for multiple agents to reach final status. |
| `resume_agent` | `id` | Re-open a previously closed agent for more work. |
| `close_agent` | `id` | Close an agent and return its last known status. |

**Key distinction from Claude Code:** Codex collab is **bidirectional** -- the parent can send additional messages to running agents, interrupt them, wait on multiple agents simultaneously, and resume closed agents. Claude Code's Task tool is fire-and-forget (spawn, wait, get result).

The `collabToolCall` event protocol (from `codex-rs/app-server/README.md`):
```
collabToolCall: { id, tool, status, senderThreadId, receiverThreadId?, newThreadId?, prompt?, agentStatus? }
```
Where `status` is: `inProgress`, `completed`, or `failed`.

#### Orchestrator Prompt (from `codex-rs/core/templates/agents/orchestrator.md`)

> "Sub-agents are there to make you go fast and time is a big constraint so leverage them smartly as much as you can."

Key rules: prefer multiple sub-agents for parallelization, wait for them before yielding, don't do work when agents are running -- only coordinate.

#### Spawn Depth Limit
`MAX_THREAD_SPAWN_DEPTH` exists as a hard guard in Rust (`codex-rs/core/src/agent/guards.rs`), preventing infinite recursion.

#### Codex App (Desktop) -- Official Docs
- **Worktrees:** Git-native isolation for parallel agent sessions. Each pane gets its own worktree. Auto-cleanup after 4+ days of inactivity.
- **Cloud Execution:** Offload long-running tasks to OpenAI infrastructure.
- **Automations:** Schedule recurring tasks (daily, weekly, on-push). Results go through review queue.
- **Multi-project:** Manage multiple repos in a single workspace.

#### Sandbox Modes (Official Docs)
| Mode | File Access | Network | Use Case |
|------|-------------|---------|----------|
| `read-only` | Read only | Blocked | Auditing, review |
| `workspace-write` | Read/write within project | Configurable | Standard development |
| `danger-full-access` | Unrestricted | Open | System-level tasks |

#### Enterprise Management
- `/etc/codex/requirements.toml` for org-wide policy enforcement
- Voice input via Ctrl+M

#### Known Limitations
- Orchestrator role not yet activated (commented out in `ALL_ROLES`)
- Worker model not yet overridden (placeholder comments for model/instructions)
- No native task dependency system (no blockedBy/blocks)
- No TodoWrite/TaskCreate equivalent for progress tracking
- **Quota drain bug** (Issue #9748): Spawning 6-12 concurrent subagents instantly depletes Pro plan quota due to DDoS rate-limiter, not actual usage
- **Signal delivery bug** (Issue #9607, fixed in v0.88.0): Main agent sometimes didn't receive subagent completion signals
- Community MCP solution: `codex-subagents-mcp` provides a `delegate` tool
- Feature request: Issue #8664 for expanded native subagent system

#### Version Reference
- **Current:** v0.98.0 (GPT-5.3-Codex, Steer mode default)
- **Collab introduced:** v0.92.0 (experimental)
- **Key features:** Personal skill loading (v0.95.0), Desktop App parallel threads (v0.95.0), session-scoped tool approvals (v0.97.0), live skill update detection (v0.97.0)

### 3.3 Factory Droid Subagent System (Official Docs Verified)

**Source:** docs.factory.ai official documentation, community guides

#### Custom Droid Definition (YAML Frontmatter)

```yaml
---
name: code-reviewer
description: Focused code reviewer for quality and style
model: inherit          # or claude-sonnet-4-5-20250929, gpt-5.1-codex-max, etc.
reasoningEffort: high   # low | medium | high
tools: read-only        # read-only | [array] | category
---
[System prompt body in markdown]
```

**Tool categories:** read-only, edit, execute, web, mcp
**TodoWrite** is auto-included for all droids (pending/in_progress/completed progress tracking).

#### Claude Code Agent Import
Factory Droid can auto-convert all 22 `.claude/agents/*.md` files:
- Navigate to `/droids` -> "Import from Claude Code"
- Converts agent frontmatter to droid YAML frontmatter
- Maps tool restrictions and model preferences
- Preserves system prompt content

#### Delegation Mechanism

```
Primary Droid (main assistant)
  |-- Task tool -> Custom Droid A (code review)
  |-- Task tool -> Custom Droid B (security audit)
  +-- Task tool -> Custom Droid C (test writer)
```

- Each subagent runs with a fresh context window
- Task tool streams live progress (tool calls, results, TodoWrite updates)
- SubagentStop hook fires when sub-droid finishes (can block with exit code 2)

#### Lifecycle Hooks (9 events)
PreToolUse, PostToolUse, UserPromptSubmit, Notification, Stop, SubagentStop, PreCompact, SessionStart, SessionEnd

**Note:** No SubagentStart hook exists. SubagentStop CAN block (exit code 2 or `"decision": "block"`).

#### Droid Exec (Headless Mode) -- Official Docs

| Autonomy Level | Permissions | Use Case |
|---------------|-------------|----------|
| Default (read-only) | File reading, git status, directory listing | Code review, planning |
| `--auto low` | + File creation/editing within project | Docs, formatting |
| `--auto medium` | + Package install, network, git (no push) | Development |
| `--auto high` | + Arbitrary execution, git push, production | Full automation |
| `--skip-permissions-unsafe` | All permissions, no confirmation | Docker/sandbox only |

**Fail-fast:** Exceeding autonomy level returns non-zero exit code immediately.
**Output formats:** text (default), JSON, stream-JSON (JSONL), stream-JSONRPC.

#### Mixed Models (Spec Mode)
- `--use-spec --spec-model <model>`: Use one model for planning, another for execution
- Enables cost optimization (expensive model for spec, cheaper for implementation)

#### Model Support
Claude Opus 4.5, Sonnet 4.5, Haiku 4.5, GPT-5.1-Codex-Max, GPT-5.1, Gemini 3 Pro, Gemini 3 Flash, GLM-4.6

#### GitHub Integration
- **GitHub Action:** `Factory-AI/droid-code-review@latest`
- **Delegation URL:** Slack/Linear integration for task routing
- **GitHub App:** Factory GitHub App for PR reviews

#### MCP Server Registry
40+ servers available including: Figma, Chrome DevTools Protocol, Sentry, Linear, Notion, Supabase, Stripe, Twilio, SendGrid, and more.

#### Known Limitations & Open Issues
- No task dependency system (no blockedBy/blocks)
- No native coordination between multiple droid exec instances -- coordination is "tool-centric" (GitHub, Jira, Slack, file system) rather than inter-droid messaging
- Task tool spawns subdroids **sequentially** -- no native parallel subagent spawning within a single session
- Nested spawning (droid spawns droid) is unreliable -- **Issue #211**: specialist droids hang when invoked via Task tool
- **Issue #276**: droid exec cannot invoke custom droids (open since Oct 2025, fix promised but still pending)
- **Issue #308**: MCP servers not exposed inside custom droid sessions
- Parallel droid exec instances require shell-level orchestration (xargs, background jobs, tmux/iTerm2)

#### Version Reference
- **Current:** v1.10
- **Key features:** Custom Droids enabled by default, Gemini 3 Flash, Figma MCP, Chrome DevTools MCP, hooks permanently enabled, MCP Manager visual UI, custom completion sounds, 9 lifecycle hooks

---

## 4. The Core Problem (Gaps Identified)

### Gap 1: Swarm orchestration is Claude Code-only (PARTIALLY CORRECTED)
- The 22 agents, Task tool dependencies, mandatory DA + GA pattern -- exist ONLY in Claude Code
- **Codex HAS collab mode** for in-session subagent spawning (Default/Worker/Explorer roles)
- **Factory Droid HAS Task tool** for droid-to-droid delegation via custom droids
- However, neither Codex nor Factory Droid has task DEPENDENCIES (blockedBy/blocks)

### Gap 2: No `/swarm` command exists
- `@step-11b-prd-swarm` organizes PRDs into parallel groups
- `@orchestrate` spawns multi-agent sessions (iTerm2/tmux/Task backends)
- But there's no single `/swarm` command that:
  - Always uses delegation
  - Always includes Devil's Advocate
  - Always includes Gap Analyst
  - Works across platforms (adapting to each platform's subagent mechanism)

### Gap 3: Devil's Advocate + Gap Analyst are NOT guaranteed
- They're documented as "mandatory" in `swarm-orchestration.md`
- But that's a Claude Code RULE, not enforced in the install/setup
- No other platform has these agents/droids pre-installed
- No mechanism forces their inclusion in every team/swarm

### Gap 4: No `/tutorial` command exists
- No onboarding walkthrough for first-time users
- Users must read docs to understand the 13-step workflow
- No interactive guide that adapts to the platform being used

### Gap 5: Context-before-delegation is a Claude Code convention, not enforced
- `swarm-orchestration.md` says "invoke deep-research before ANY planning"
- But this is a prompt instruction, not a system-level enforcement
- Other platforms don't have this convention at all

### Gap 6: Install doesn't set up swarm-first from the beginning
- Skills and configs get installed, but the swarm infrastructure doesn't
- No team templates, no default swarm configurations
- Users have to manually set up swarm patterns

### Gap 7: PRD-to-JSON and Ralph Loop are fragmented
- Step 5b (prototype PRDs to JSON) and Step 11a (implementation PRDs to JSON) are separate commands
- Both use the same `ralph-backlog.schema.json` and differ only in source/output paths
- Ralph Loop execution is buried in `src/commands/ralph.md`
- No single command to convert any PRD to a task list and optionally execute

---

## 5. How Each Platform Should Handle Swarms

### Claude Code (Full Orchestration)
- **Subagent Mechanism:** Task tool with `subagent_type` parameter
- **Team Coordination:** TeamCreate + SendMessage + TaskCreate/Update/List/Get (requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- **Orchestrator:** sigma-orchestrator spawns teams, delegates to typed agents
- **DA + GA:** Automatically added as final tasks (blockedBy all implementation tasks)
- **Context:** deep-research skill auto-invoked before planning via PreToolUse hook
- **Memory:** Agents persist learnings via MEMORY.md (project/local/user scopes)
- **Spawn Restriction:** Only sigma-orchestrator (unrestricted) and sigma-security-lead (5 security agents) can spawn via Task(agent_type) syntax
- **Display Modes:** in-process (default) or split panes (tmux/iTerm2)
- **Delegate Mode:** Shift+Tab restricts lead to coordination-only tools

### Codex (Collab Mode Orchestration)
- **Subagent Mechanism:** 5 collab tools -- `spawn_agent`, `send_input`, `wait`, `resume_agent`, `close_agent`
- **Team Coordination:** Bidirectional -- parent can message running agents, interrupt, wait on multiple, resume closed agents
- **Orchestrator:** AGENTS.md instructs main agent to use collab for delegation; Orchestrator role exists but not yet activated
- **DA + GA:** Installed as skills; AGENTS.md instructs agent to invoke after implementation
- **Context:** AGENTS.md instruction: "Before delegating any task, gather context using MCP research tools"
- **Limitation:** No task dependency system; DA + GA ordering is by instruction, not enforcement
- **Desktop App:** Worktrees for parallel sessions, cloud execution for long-running tasks
- **Enterprise:** `/etc/codex/requirements.toml` for org-wide policy enforcement
- **Workaround:** Community `codex-subagents-mcp` provides `delegate` tool for MCP-based delegation

### Factory Droid (Custom Droid Delegation)
- **Subagent Mechanism:** Task tool with `subagent_type` targeting custom droids in `.factory/droids/`
- **Team Coordination:** TodoWrite progress tracking; SubagentStop hook for lifecycle management
- **Orchestrator:** Orchestrator droid defined in `.factory/droids/orchestrator.md`
- **DA + GA:** Installed as custom droids with read-only tool config (DA) and full-access tool config (GA)
- **Context:** Orchestrator droid instructions include pre-research phase
- **Agent Import:** Can auto-convert all 22 Claude Code agents via `/droids` -> "Import from Claude Code"
- **Mixed Models:** `--use-spec --spec-model` for planning vs execution model split
- **Limitation:** No task dependency system; no inter-droid messaging; droid exec bug prevents custom droid use in headless mode
- **Headless:** `droid exec --auto <level>` for CI/CD; parallel via shell-level xargs/background jobs
- **GitHub:** `Factory-AI/droid-code-review@latest` for automated PR review

### OpenCode (Future)
- **Status:** Skills system (v1.1.48), shell.env hook (v1.1.50), .agents/skills directory reading (v1.1.50)
- **DA + GA:** Planned as agents/skills when deployed
- **Desktop App:** Available with review panes (v1.1.6+)
- **Plugins:** Official Copilot plugin, deduplication by name
- **Model:** TBD based on platform evolution

---

## 6. Subagent API Comparison

| Feature | Claude Code | Codex | Factory Droid |
|---------|------------|-------|--------------|
| **Spawn API** | `Task(subagent_type, prompt)` | `spawn_agent(message, agent_type?)` + 4 more tools | `Task(subagent_type, prompt)` |
| **Agent Types** | 22 custom agents (.claude/agents/) | 4 built-in roles (Default/Worker/Explorer/Orchestrator*) | User-defined droids (.factory/droids/) |
| **Custom Agents** | Markdown frontmatter with tool restrictions | Not yet supported (built-in only) | YAML frontmatter: name, model, reasoningEffort, tools |
| **Spawn Restriction** | `Task(agent_type)` limits which types an agent can spawn | `MAX_THREAD_SPAWN_DEPTH` limits nesting depth | Not documented |
| **Progress Tracking** | TaskCreate/Update/List/Get with blockedBy/blocks | None native | TodoWrite (pending/in_progress/completed) |
| **Team Messaging** | SendMessage (DM, broadcast, shutdown_request) | Bidirectional: `send_input` + `wait` + `resume_agent` | None (SubagentStop hook only) |
| **Task Dependencies** | blockedBy/blocks arrays | None | None |
| **Fresh Context** | Yes (each subagent gets fresh context) | Yes (each collab agent gets fresh context) | Yes (each sub-droid gets fresh context) |
| **Interrupt Running** | No | Yes (`send_input(interrupt=true)`) | No |
| **Resume Closed** | No | Yes (`resume_agent(id)`) | No |
| **Wait Multiple** | No (wait per-task) | Yes (`wait([id1, id2], timeout_ms)`) | No |
| **Lifecycle Hooks** | 9 events (TeammateIdle, TaskCompleted, etc.) | collabToolCall events (inProgress/completed/failed) | 9 events (SubagentStop can block) |
| **Background Mode** | `run_in_background: true` | Background mode + Cloud tasks | `droid exec` headless |
| **Memory Persistence** | MEMORY.md with 3 scopes | Session snapshots + fork/resume | Session continuation (--session-id) |
| **Multi-Model** | Single model (Opus 4.6) | gpt-5.1-codex-mini for Explorer | Mixed models via --use-spec --spec-model |
| **Agent Import** | N/A (canonical source) | N/A | Auto-import from .claude/agents/ |
| **Maturity** | Production (v2.1.32+); Teams EXPERIMENTAL | Experimental (v0.92.0+, collab) | Production (custom droids enabled by default) |

\* Orchestrator role is defined but commented out, not yet user-facing.

---

## 7. PRD Consolidation Plan

### Current State (Fragmented)

| Command | Purpose | Source Dir | Output |
|---------|---------|-----------|--------|
| `/step-5b-prd-to-json` | Convert prototype PRDs to JSON | `docs/prds/flows/` | `docs/ralph/prototype/prd.json` |
| `/step-11a-prd-to-json` | Convert implementation PRDs to JSON | `docs/prds/` or `docs/prds/swarm-*/` | `docs/ralph/implementation/prd.json` |
| `sigma ralph` (src/commands/ralph.md) | Execute Ralph Loop on backlog | Reads `prd.json` | Implements stories |

Both step-5b and step-11a use the same `ralph-backlog.schema.json`. They differ only in:
- Source directory (prototype vs implementation PRDs)
- Output path (prototype/ vs implementation/)
- `meta.mode` field ("prototype" vs "implementation")

### Proposed Consolidation

#### `/prd-json` Command (replaces step-5b + step-11a)

**Purpose:** Convert any PRD (or set of PRDs) to a Ralph-compatible JSON task list.

```
/prd-json <prd-path-or-dir> [--mode prototype|implementation|auto] [--output <path>] [--dry-run]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `<prd-path-or-dir>` | Required | Path to a single PRD or directory of PRDs |
| `--mode` | `auto` | Auto-detect from path (`docs/prds/flows/` = prototype, `docs/prds/` = implementation) |
| `--output` | Auto (based on mode) | Output path for the JSON file |
| `--dry-run` | false | Preview without writing |
| `--scope` | all | Filter by feature area |
| `--stream-aware` | false | Group by parallel execution streams |

**Auto-detection logic:**
- Path contains `flows/` or `prototype` -> mode = prototype, output = `docs/ralph/prototype/prd.json`
- Path contains `swarm-` -> mode = implementation, output = `docs/ralph/implementation/prd.json`
- Otherwise -> mode = implementation, output = `docs/ralph/implementation/prd.json`

**Schema:** Uses existing `schemas/ralph-backlog.schema.json` unchanged.

#### `/sigma-ralph-loop` Command (replaces sigma ralph)

**Purpose:** Execute the Ralph autonomous implementation loop on a JSON backlog.

```
/sigma-ralph-loop [--backlog <path>] [--background] [--all] [--resume]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--backlog` | Auto-detect latest prd.json | Path to the JSON backlog to execute |
| `--background` | false | Run in background mode |
| `--all` | false | Process all stories (vs. next unstarted) |
| `--resume` | false | Resume from last checkpoint |

**Workflow:**
1. Reads prd.json backlog
2. For each story (in dependency order):
   - Spawns a fresh agent session
   - Agent implements the story following acceptance criteria
   - Commits on success, marks story status
   - Moves to next story
3. On completion, generates summary report

#### Migration Path

| Old | New | Action |
|-----|-----|--------|
| `/step-5b-prd-to-json` | `/prd-json docs/prds/flows/` | Alias or redirect |
| `/step-11a-prd-to-json` | `/prd-json docs/prds/` | Alias or redirect |
| `sigma ralph -b <backlog>` | `/sigma-ralph-loop --backlog <backlog>` | New command |
| `./scripts/ralph/sigma-ralph.sh` | `/sigma-ralph-loop` | Keep script as alternative |

**Platform installation:**

| Platform | /prd-json | /sigma-ralph-loop |
|----------|-----------|-------------------|
| Claude Code | `.claude/commands/prd-json.md` | `.claude/commands/sigma-ralph-loop.md` |
| Codex | `.codex/skills/prd-json/SKILL.md` | `.codex/skills/sigma-ralph-loop/SKILL.md` |
| Factory Droid | `.factory/commands/prd-json.md` | `.factory/commands/sigma-ralph-loop.md` |
| OpenCode | `.opencode/commands/prd-json.md` | `.opencode/commands/sigma-ralph-loop.md` |

---

## 8. Proposed New Features

### 8.1 `/swarm` Command

**Purpose:** Universal swarm delegation command that adapts to platform capabilities.

**Behavior by platform:**

| Platform | What `/swarm` Does |
|----------|-------------------|
| Claude Code | Creates a team via TeamCreate, spawns agents via Task tool, adds DA + GA as final blocked tasks (blockedBy all impl tasks) |
| Codex | Spawns Worker/Explorer subagents via Collab tool, generates SWARM-PLAN.md with DA + GA as final steps, instructs execution order |
| Factory Droid | Spawns custom droids via Task tool, generates orchestration config, includes DA + GA droids as final steps |
| OpenCode | Generates a checklist-based plan (no orchestration), includes DA + GA verification steps |

**Always includes:**
1. Context gathering phase (deep-research auto-invoke)
2. Implementation phase (parallel where supported)
3. Devil's Advocate review (mandatory, blocked until all impl done)
4. Gap Analysis + auto-fix (mandatory, blocked until DA done)
5. Ship/No-Ship decision

**Platform-specific subagent mapping:**

| Sigma Agent Role | Claude Code | Codex | Factory Droid |
|-----------------|------------|-------|--------------|
| Orchestrator | sigma-orchestrator (Task tool) | Main agent (coordinates) | Orchestrator droid |
| Implementation | sigma-executor (Task tool) | Worker (Collab tool) | Implementation droid (Task tool) |
| Research | sigma-lead-architect (Task tool) | Explorer (Collab tool, gpt-5.1-codex-mini) | Research droid (read-only) |
| Devil's Advocate | sigma-devils-advocate (Task tool) | DA skill (invoked by main agent) | DA droid (read-only tools) |
| Gap Analyst | sigma-gap-analyst (Task tool) | GA skill (invoked by main agent) | GA droid (full-access tools) |

**Install action:** `/swarm` command file installed to each platform's command/skill directory during `sigma install`.

### 8.2 `/tutorial` Command

**Purpose:** Interactive walkthrough that teaches users the Sigma Protocol for their specific platform.

**Behavior:**
1. Detects which platform is running (Claude Code, Codex, Factory Droid, OpenCode)
2. Shows a step-by-step guide in the chat window
3. Covers:
   - What Sigma Protocol is
   - The 13-step workflow (simplified)
   - How to start (Step 1 ideation)
   - How to use commands on THIS platform
   - How to use swarm orchestration on THIS platform
   - How to read PRDs
   - How to use `/prd-json` and `/sigma-ralph-loop`
   - How to run gap analysis
   - How to ship

**Sections:**
- "Getting Started" -- first-time setup
- "Running Your First Step" -- guided Step 1
- "Understanding PRDs" -- what they are, how to use them
- "Using Agent Swarms" -- platform-specific swarm guide
- "The Ralph Loop" -- autonomous implementation
- "Commands Quick Reference" -- top 10 commands for this platform
- "Troubleshooting" -- common issues per platform

**Install action:** `/tutorial` command file installed to each platform's command/skill directory during `sigma install`.

### 8.3 Mandatory DA + GA Enforcement

**Current state:** Only a rule in `swarm-orchestration.md` (Claude Code only).

**Proposed enforcement:**

| Platform | Enforcement Mechanism |
|----------|----------------------|
| Claude Code | Agent definition in `.claude/agents/` + swarm-orchestration.md rule + `/swarm` command always adds them as blocked tasks |
| Codex | AGENTS.md instruction requiring DA + GA after implementation + execution policy rule prompting "Did you run devil's advocate?" before `git push` |
| Factory Droid | DA + GA custom droids in `.factory/droids/` + orchestrator droid instructions chain them after implementation + SubagentStop hook validates |
| OpenCode | Instructions in .opencode config requiring DA + GA before shipping |

**Skills installed on ALL platforms:**
- `devils-advocate` skill (verification checklist)
- `gap-analysis` skill (traceability + auto-fix)
- `verification-before-completion` skill (evidence-based verification)

### 8.4 Context-Before-Delegation Guarantee

**Proposed approach:**

| Platform | How Context is Guaranteed |
|----------|--------------------------|
| Claude Code | Hook: `PreToolUse` on Task tool injects "run deep-research first" reminder. Agent instructions require it. |
| Codex | AGENTS.md includes explicit instruction: "Before delegating any task via Collab, gather context using MCP research tools (EXA, Firecrawl, Ref)." |
| Factory Droid | Orchestrator droid instructions include pre-research phase. Research droid spawned first. |
| OpenCode | Config instruction: "Research the problem space before implementing." |

### 8.5 Swarm Dependency Graph Enforcement

**Requirement:** The `/swarm` command MUST create a task dependency graph before any delegation begins. This is not optional.

**Workflow:**
1. `/swarm` receives PRD(s) as input
2. Parse PRDs and extract inter-feature dependencies
3. Build a DAG (directed acyclic graph) of tasks
4. Visualize the DAG in the terminal (ASCII or Bubble Tea rendered)
5. HITL checkpoint: User reviews and approves the graph
6. Only after approval: delegate to subagents with skill assignments

**Platform behavior:**

| Platform | Graph Storage | Visualization |
|----------|--------------|---------------|
| Claude Code | TaskCreate with blockedBy/blocks | TUI DAG view (Go) or ASCII fallback |
| Codex | SWARM-PLAN.md with dependency notation | Markdown table |
| Factory Droid | TodoWrite with dependency annotations | ASCII in chat |

**Skills auto-assigned per node:** Based on agent skill mapping in `swarm-orchestration.md`. Each graph node includes `assigned_skills[]` derived from keyword matching.

---

## 9. Install Process Changes Needed

### Current `sigma install` flow:
```
1. User runs: sigma install --platform <platform>
2. CLI copies skills to platform directory
3. CLI copies commands to platform directory
4. CLI generates config file (CLAUDE.md, AGENTS.md, config.toml, etc.)
5. Done
```

### Proposed enhanced flow:
```
1. User runs: sigma install --platform <platform>
2. CLI copies skills (including DA + GA skills) -- ALREADY DONE
3. CLI copies commands (including /swarm, /tutorial, /prd-json, /sigma-ralph-loop) -- NEW
4. CLI copies agents/droids (platform-adapted, including DA + GA) -- PARTIAL
5. CLI generates config (with swarm-first instructions) -- NEEDS UPDATE
6. CLI installs enforcement rules (DA+GA mandatory) -- NEW
7. CLI shows: "Run /tutorial to get started" -- NEW
```

### What needs to be added per platform:

**Claude Code:**
- `/swarm` command in `.claude/commands/`
- `/tutorial` command in `.claude/commands/`
- `/prd-json` command in `.claude/commands/`
- `/sigma-ralph-loop` command in `.claude/commands/`
- Already has agents, rules, hooks

**Codex:**
- `/swarm` skill as `.codex/skills/swarm/SKILL.md`
- `/tutorial` skill as `.codex/skills/tutorial/SKILL.md`
- `/prd-json` skill as `.codex/skills/prd-json/SKILL.md`
- `/sigma-ralph-loop` skill as `.codex/skills/sigma-ralph-loop/SKILL.md`
- AGENTS.md update: swarm-first instructions with Collab tool guidance, DA + GA mandatory
- Execution policy rule: prompt before push without DA review

**Factory Droid:**
- `/swarm` command in `.factory/commands/`
- `/tutorial` command in `.factory/commands/`
- `/prd-json` command in `.factory/commands/`
- `/sigma-ralph-loop` command in `.factory/commands/`
- DA + GA droids in `.factory/droids/`
- Orchestrator droid in `.factory/droids/`
- .droid.yaml workflow template with DA + GA chain
- Can auto-import Claude Code agents via `/droids` -> "Import from Claude Code"

**OpenCode:**
- `/swarm` command in `.opencode/commands/`
- `/tutorial` command in `.opencode/commands/`
- `/prd-json` command in `.opencode/commands/`
- `/sigma-ralph-loop` command in `.opencode/commands/`
- Agent definitions when agent system ships

### 9b. Hooks Strategy (Shell Scripts, Not Go)

**Key decision:** Hooks remain as shell/Python scripts. They are NOT ported to Go.

**Rationale:** Claude Code's hook system executes shell commands via the `command` field in `settings.json`. The Go binary cannot replace hooks -- it manages their installation.

**Current hooks inventory (14 hooks + 7 validators):**

| Hook | Event | File |
|------|-------|------|
| `setup-check.sh` | Setup | Validates environment |
| `ralph-skill-enforcement.sh` | PreToolUse | Skill routing enforcement |
| `task-completed-handler.sh` | TaskCompleted | DA/GA unblocking |
| `teammate-idle.sh` | TeammateIdle | Team coordination |
| `orchestrator-stop.sh` | Stop | Cleanup orchestration |
| `greptile-pr.sh` | PostToolUse | PR review trigger |
| `team-iterm-launcher.sh` | SessionStart | iTerm2 layout |
| `team-pane-watcher.sh` | PostToolUse | Pane monitoring |
| `session-start-context.sh` | SessionStart | SLAS context injection |
| `session-end-summary.sh` | SessionEnd | Session metadata logging |
| 7 PostToolUse validators | PostToolUse | PRD, BDD, TypeScript, design-tokens, CSV, UI |

**Go binary responsibilities:**
1. Copy hook scripts from `platforms/claude-code/hooks/` to `.claude/hooks/`
2. Generate `settings.json` hook entries with correct glob patterns
3. `sigma doctor --hooks` validates all hooks are installed and executable
4. `sigma install --hooks-only` reinstalls hooks without full platform rebuild

### 9c. Module System (Boilerplate Selection)

**Current JS implementation:** `cli/lib/constants.js` (MODULES constant) + `cli/lib/ui/prompts.js` (selectModules) + `cli/sigma-cli.js` (install flow)

Users choose which command categories to install. This is an **opt-out** model (all checked by default).

**7 modules (1 required, 6 optional):**

| Module | Required | Source Dir | File Count | Description |
|--------|----------|-----------|------------|-------------|
| `steps` | Yes | `steps/` | 21 | Core 13-step product development workflow |
| `audit` | No | `audit/` | 16 | Security, accessibility, and quality audits |
| `ops` | No | `ops/` | 36 | Operations (pr-review, sprint-plan, status, onboard) |
| `marketing` | No | `marketing/` | 25 | Full marketing workflow (01-23 + AI prompts) |
| `generators` | No | `generators/` | 15 | Code generators (scaffold, test-gen, contract, nda) |
| `dev` | No | `dev/` | 5 | Development workflow (implement-prd, plan) |
| `deploy` | No | `deploy/` | 4 | Deployment (ship-check, ship-prod, client-handoff) |

**Total source commands in module system:** 122 files

**Always-installed commands (outside module system):**

| Category | File Count | Contents |
|----------|------------|----------|
| `tm/` (TaskMaster) | 47 | Task management AI integration |
| `orchestrate/` | 5 | start, stop, attach, status, help |
| `thread/` | 3 | f-thread, status, wizard |
| `maid/` | 4 | cleanup, simplify, help, full |
| Standalone | ~9 | sigma-stream, orchestrate, continue, greptile-pr-review, etc. |

**Total always-installed:** ~68 files (not user-selectable)

**Selection UX (current JS):**
1. ASCII gradient banner (cyan -> purple) with SIGMA PROTOCOL art
2. Platform selection via checkbox prompt (multi-select)
3. Module selection via checkbox prompt (steps is disabled/locked as required)
4. User presses space to toggle, 'a' for all, Enter to confirm
5. Confirmation screen shows summary
6. Listr2 progress bars during installation
7. `.sigma-manifest.json` tracks installed platforms + modules + history

**Conditional orchestrator generation:**
- CLAUDE.md includes "Audit Commands" section only if `modules.includes("audit")`
- Same for dev, ops, deploy, generators, marketing
- This keeps the orchestrator file lean for projects that don't need all modules

**Non-interactive mode:**
```bash
sigma install -y -p claude-code -m all           # All modules
sigma install -y -p claude-code -m "steps,audit"  # Selective
```

**Go rewrite requirements (PRD-GO-WIZARD):**
- Replace inquirer checkboxes with Huh v2 multi-select forms
- Replace gradient-string banner with Lip Gloss styled ASCII art (Gotham Night palette)
- Replace Listr2 with Bubble Tea spinner + progress bar components
- Add module preview: show command count per module before selection
- Add "recommended for [project type]" presets (e.g., SaaS -> steps + audit + ops + deploy + generators)
- Animate module installation with per-file progress (Harmonica spring animation for the progress bar)
- Preserve `.sigma-manifest.json` for tracking (migrate to TOML in Go)

---

## 10. The Big Picture

```
                    Sigma Protocol
                         |
            +-----------+-----------+
            |                       |
      Shared Core              Platform Layer
            |                       |
    - 13-step workflow       +------+------+------+
    - Skill content          |      |      |      |
    - PRD structure      Claude  Codex  Factory  Open
    - Value Equation      Code          Droid    Code
    - DA + GA logic          |      |      |      |
    - Ralph backlog       Teams   Collab  Droids  Future
      schema              Task    tool    Task
                          tool    Worker/ tool
                          Hooks   Explorer --auto
                          Memory  Profiles Levels
                          Send    Session  Todo
                          Message fork    Write
                          Delegate Cloud   Mixed
                          mode    tasks   models
```

**Key insight:** The METHODOLOGY is universal. The ORCHESTRATION is platform-specific. All three priority platforms (Claude Code, Codex, Factory Droid) have native subagent delegation -- the gap is in task dependencies and enforcement, not in spawning capability.

---

## 11. Priority Execution Plan

### Phase 1: PRD Consolidation (Quick Win)
1. Create `/prd-json` command (consolidates step-5b + step-11a)
2. Create `/sigma-ralph-loop` command (consolidates ralph execution)
3. Keep old commands as aliases for backward compatibility
4. Install on all 4 platforms (Claude Code, Codex, Factory Droid, OpenCode)

### Phase 2: `/swarm` Command
1. Claude Code: Full implementation with TeamCreate + Task tool + DA/GA blocked tasks
2. Factory Droid: Custom droid orchestration + DA/GA droids + auto-import from Claude Code agents
3. Codex: Collab-based delegation + AGENTS.md instructions for DA/GA

### Phase 3: `/tutorial` Command
1. Platform detection logic
2. Platform-specific content sections
3. Interactive mode with step-by-step guidance
4. Install on all 4 platforms

### Phase 4: DA + GA Enforcement
1. Claude Code: Already enforced via agent definitions + swarm-orchestration.md
2. Factory Droid: DA + GA droids + orchestrator droid instructions + SubagentStop hook
3. Codex: AGENTS.md instructions + execution policy rule before git push
4. OpenCode: Config-level instruction enforcement

---

## 12. Questions for Discussion

1. Should `/swarm` be a command (`.claude/commands/`) or a skill (`.claude/skills/`)? Commands are user-invoked, skills are auto-loaded. A command makes more sense since users explicitly invoke it.

2. Should `/tutorial` be interactive (asking questions in chat) or a static guide? Interactive is better UX -- adapts to where the user is.

3. For Codex, should we wait for the Orchestrator role to stabilize, or build the /swarm command around Worker + Explorer roles now?

4. For Factory Droid, the droid exec + custom droids bug (cannot use custom droids in headless mode) blocks CI/CD automation. Should we design around this limitation or assume it will be fixed?

5. Should `/prd-json` auto-detect mode from the path, or always require explicit `--mode`? Auto-detection is more ergonomic but may surprise users.

6. Claude Code Agent Teams require `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Should `/swarm` use Teams (full messaging) or stick with subagents (Task tool only, production-ready)?

7. Factory Droid can auto-import Claude Code agents. Should `sigma install --platform factory-droid` trigger this import automatically, or keep it as a manual step?

---

## 13. CLI Architecture Redesign (Go + Bubble Tea)

### 13.1 Current CLI Reality

The existing Node.js CLI is significantly larger than initially estimated:

| Metric | Value |
|--------|-------|
| **Total files** | 56 JS files |
| **Total lines** | 28,083 lines |
| **Main entry point** | `sigma-cli.js` (5,717 lines) |
| **Dependencies** | commander, inquirer, chalk, ora, boxen, fs-extra, glob |
| **Existing refactoring plan** | `cli/REFACTORING-PLAN.md` (partially completed) |

The `cli/lib/` directory has already been partially modularized:
- `lib/config.js`, `lib/doctor.js`, `lib/errors.js`, `lib/help.js` -- extracted and clean
- `lib/platform/` -- platform builders (claude-code.js, codex.js, opencode.js, cursor.js)
- `lib/orchestration/` -- multi-agent orchestration
- `lib/sandbox/` -- sandbox execution
- But `sigma-cli.js` remains a 5,717-line monolith containing command routing, install logic, and platform detection

### 13.2 Technology Selection: Go + Charm Stack

**Recommendation:** Go + Bubble Tea is production-ready and the best fit for this migration.

| Component | Library | Stars | Purpose | Replaces (Node.js) |
|-----------|---------|-------|---------|---------------------|
| **TUI Framework** | Bubble Tea v2 | 30k+ | Elm Architecture, Model-View-Update | inquirer + ora + custom |
| **Styling** | Lip Gloss v2 | 8k+ | CSS-like terminal styling, responsive | chalk + boxen |
| **Forms** | Huh v2 | 4k+ | Single/multi-select, text input, confirm | inquirer |
| **Components** | Bubbles | 5k+ | Tables, spinners, progress bars, lists | cli-table3 + ora |
| **Markdown** | Glamour v2 | 4k+ | Markdown rendering in terminal | marked-terminal |
| **Syntax Highlighting** | Chroma | 4k+ | 250+ languages | highlight.js |
| **CLI Routing** | Cobra | 35k+ | Commands, flags, help generation | commander |
| **Config** | Viper | 25k+ | TOML/YAML/JSON config, env vars | custom config.js |
| **Git** | go-git v6 | 5k+ | Pure Go git operations | simple-git |
| **File Watching** | fsnotify | 9k+ | Cross-platform file events | chokidar |
| **Distribution** | GoReleaser | 13k+ | Multi-platform builds, Homebrew, Scoop | npm publish |
| **Animations** | Harmonica | 2k+ | Spring-based terminal animations | custom |
| **Demo Recording** | VHS | 14k+ | Script terminal sessions, export GIFs | N/A |

**Production validation:** Bubble Tea powers 10,000+ applications including lazygit (37k stars), TruffleHog (NVIDIA), eks-node-viewer (AWS), and tools from GitHub and Sourcegraph.

**Why not alternatives:**
- **Ratatui (Rust):** 15% less CPU, 30-40% less memory, but steeper learning curve, less complete ecosystem. Overkill for a CLI tool.
- **Ink (React/Node.js):** Stays in Node.js ecosystem, which we're trying to leave. Single-binary distribution advantage lost.
- **Textual (Python):** Good framework, wrong language for this project. No compiled binary distribution.
- **OpenTUI (TypeScript + Zig):** Explicitly NOT production-ready (Feb 2026). Used by OpenCode but unstable.

### 13.3 Architecture: Full Go Rewrite

The existing 28,083 lines of JS represent accumulated logic, not irreducible complexity. Much of it is boilerplate (commander setup, chalk formatting, inquirer prompts) that Cobra + Lip Gloss + Huh replace with less code. The actual business logic -- skill transformation, platform building, config generation -- ports directly to Go.

**Key insight:** We're building a framework for AI-assisted development. The rewrite itself will be executed by AI swarms running PRDs in parallel. Traditional human-developer time estimates don't apply.

```
                    sigma (Go binary -- single artifact)
                         |
              +----------+----------+----------+
              |          |          |          |
         TUI Layer   CLI Layer  Platform    Core
         (Bubble Tea) (Cobra)   Builders    Logic
              |          |          |          |
    +----+----+    +-----+-----+   |    +-----+-----+
    |    |    |    |     |     |   |    |     |     |
   Dash Swarm Tut  step  swarm dr  |   Skill Config Schema
   board View orial cmds  cmd  cmd |   Xform  Mgmt  Valid
              |          |     |   |          |
         Lip Gloss   Cobra     |   +----+----+----+
         Huh Forms   Viper     |   |    |    |    |
         Bubbles               | Claude Codex Fact Open
         Harmonica             | Code        Droid Code
                               |
                          go-git v6
                          fsnotify
```

**Module mapping (JS -> Go):**

| JS Module | Lines | Go Package | Notes |
|-----------|-------|-----------|-------|
| `sigma-cli.js` (routing) | ~500 | `cmd/` (Cobra) | Cobra auto-generates help, completions |
| `sigma-cli.js` (install) | ~1,200 | `pkg/install/` | Platform detection + skill copy |
| `sigma-cli.js` (build) | ~800 | `pkg/build/` | Platform builder orchestration |
| `lib/platform/claude-code.js` | ~600 | `pkg/platform/claudecode/` | Skill/agent/command transformers |
| `lib/platform/codex.js` | ~400 | `pkg/platform/codex/` | TOML config + AGENTS.md generation |
| `lib/platform/opencode.js` | ~300 | `pkg/platform/opencode/` | Skill transformation |
| `lib/config.js` | ~200 | `pkg/config/` (Viper) | Viper handles TOML/YAML/JSON natively |
| `lib/doctor.js` | ~400 | `pkg/doctor/` | Health checks + fix suggestions |
| `lib/help.js` | ~150 | Built-in (Cobra) | Cobra auto-generates |
| `lib/install-wizard.js` | ~300 | `pkg/wizard/` (Huh) | Huh forms replace inquirer |
| `lib/interactive.js` | ~200 | `pkg/tui/` (Bubble Tea) | TUI replaces all interactive prompts |
| `lib/tutorial.js` | ~250 | `pkg/tutorial/` | Interactive walkthrough |
| `lib/search.js` | ~200 | `pkg/search/` | Fuzzy search (command palette) |
| `lib/terminal-utils.js` | ~150 | Unnecessary | Lip Gloss handles all terminal formatting |
| `lib/errors.js` | ~100 | `pkg/errors/` | Standard Go error patterns |
| `lib/maid.js` | ~300 | `pkg/maid/` | Cleanup utilities |
| `lib/retrofit.js` | ~400 | `pkg/retrofit/` | Legacy project upgrade |
| `lib/new-project.js` | ~300 | `pkg/scaffold/` | Project scaffolding |
| `lib/threads.js` | ~200 | `pkg/threads/` | Thread orchestration |
| `lib/orchestration/` | ~800 | `pkg/orchestration/` | Multi-agent orchestration |
| `lib/orchestration/worktree-manager.js` | ~200 | `pkg/orchestration/worktree.go` | Worktree creation for streams |
| `lib/orchestration/fork-manager.js` | ~200 | `pkg/orchestration/fork.go` | Best-of-N fork pattern |
| `lib/sandbox/` | ~400 | `pkg/sandbox/` | Sandbox execution |
| Marketing commands (23) | ~2,300 | `pkg/commands/marketing/` | 23 marketing subcommands |
| Taskmaster commands (47) | ~4,700 | `pkg/commands/taskmaster/` | Task management commands |
| Thread commands (3) | ~300 | `pkg/commands/thread/` | Thread orchestration |
| Maid commands (4) | ~400 | `pkg/commands/maid/` | Cleanup subcommands |
| Orchestrate subcommands (5) | ~500 | `pkg/commands/orchestrate/` | start, stop, attach, status, help |
| `lib/platform/cursor.js` | 215 | **Deleted** | Platform removed |
| Formatting/boilerplate | ~5,000+ | **Eliminated** | chalk, ora, boxen, inquirer = 0 lines |

**Estimated Go codebase:** ~22,000-26,000 lines (vs 28,083 JS). Reduction comes from:
- Cobra/Viper/Lip Gloss eliminate ~5,000 lines of boilerplate
- Go's standard library replaces several npm dependencies
- Shared platform builder interface reduces duplication
- TUI components (Bubbles) replace custom UI code

**Execution plan:**

| Phase | PRD | What Gets Built |
|-------|-----|-----------------|
| 1 | PRD-GO-SCAFFOLD | Go module init, directory structure, Cobra root command, Viper config, CI/CD with GoReleaser |
| 2 | PRD-GO-CORE | Skill parser, config manager, schema validator, platform builder interface |
| 3 | PRD-GO-PLATFORMS | Claude Code, Codex, Factory Droid, OpenCode builders (parallel PRDs) |
| 4 | PRD-GO-CMD-* (9 PRDs) | All sigma subcommands split by module (see Section 18.2) |
| 5 | PRD-GO-TUI | Bubble Tea app shell, dashboard, step view, swarm view, command palette |
| 6 | PRD-GO-WIZARD | First-run experience, Huh forms, platform detection, module selection |
| 7 | PRD-GO-TUTORIAL | Interactive tutorial system |
| 8 | PRD-GO-DISTRIBUTION | GoReleaser, Homebrew tap, Scoop manifest, GitHub Action |

Phases 1-3 can be swarm-executed in parallel (core + platforms are independent). Phase 4 (9 command sub-PRDs) depends on platforms but all sub-PRDs are parallelizable. Phase 5-7 depend on commands. Phase 8 is final.

### 13.4 Distribution Strategy

| Method | Platform | Command |
|--------|----------|---------|
| **Homebrew** | macOS/Linux | `brew install sigma-protocol/tap/sigma` |
| **Scoop** | Windows | `scoop install sigma` |
| **Go Install** | All | `go install github.com/sigma-protocol/sigma@latest` |
| **Binary Download** | All | GitHub Releases (checksummed) |

GoReleaser handles all of the above from a single `.goreleaser.yaml` config, triggered on git tag. No Node.js runtime required.

### 13.5 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture pattern | Elm (Model-View-Update) | Matches Bubble Tea, predictable state, testable |
| State management | Single app model struct | All views share one model, Update() returns new state |
| Routing | Cobra subcommands | `sigma`, `sigma dashboard`, `sigma step 3`, `sigma doctor` |
| Config format | TOML (Viper) | Consistent with Codex config.toml |
| Minimum terminal | 80x24 | Graceful degradation with single-column layout |
| Target terminal | 120x40 | Full two-panel layout with activity log |
| Color support | True color (24-bit) + 256 fallback | Lip Gloss handles detection automatically |

### 13.6 CLI Operation Modes

The Go binary is a **launcher and orchestrator**, not an AI engine. It does NOT require a Claude Code / Codex / Factory Droid subscription to install or run basic commands.

**Standalone (no AI subscription needed):**
- `sigma install` -- Copy skills, commands, agents, hooks to project
- `sigma doctor` -- Health checks, fix suggestions, metrics
- `sigma status` -- Workflow progress display
- `sigma maid` -- Repository cleanup
- `sigma` (TUI dashboard) -- Read-only view of project state
- `sigma tutorial` -- Static tutorial content

**AI-dependent (requires active platform subscription):**
- `sigma step <N>` -- Executes via `claude -p` / `codex` / `droid exec`
- `sigma swarm` -- Orchestrates multi-agent sessions
- `sigma ralph` -- Autonomous implementation loop
- All marketing commands (01-23)
- `sigma prd-json` -- AI-powered PRD parsing
- `sigma tutorial --interactive` -- AI-guided walkthrough

**How it works:** The Go binary uses `os/exec` to shell out to the active platform CLI (`claude`, `codex`, `droid`). The platform CLI handles all AI interaction. The Go binary handles routing, config, TUI, and artifact management.

### 13.7 Module System Architecture (Go)

The Go binary preserves the module selection system with enhanced UX:

```go
// pkg/modules/registry.go
type Module struct {
    Name        string
    Description string
    Required    bool
    SourceDir   string
    FileCount   int
    Commands    []string  // List of command names in this module
}

var Registry = []Module{
    {Name: "steps", Required: true, SourceDir: "steps/", FileCount: 21},
    {Name: "audit", Required: false, SourceDir: "audit/", FileCount: 16},
    // ... all 7 modules
}
```

**Selection flow (Bubble Tea + Huh):**
1. Gotham Night ASCII banner with animated gradient
2. Platform multi-select (Huh form with descriptions)
3. Module multi-select with live preview:
   ```
   [x] Steps (21 commands)        Required
   [x] Audit (16 commands)        Security, accessibility, quality
   [x] Ops (36 commands)          Operations, PR review, sprint planning
   [ ] Marketing (25 commands)    Full marketing workflow (01-23)
   [x] Generators (15 commands)   Code generators, scaffolding
   [x] Dev (5 commands)           Development workflow
   [x] Deploy (4 commands)        Deployment pipeline

   Total: 97 commands selected (+ 68 always-installed = 165)
   ```
4. Confirmation with animated progress
5. Write `.sigma-manifest.toml` (migrated from JSON)

**Presets (new in Go):**

| Preset | Modules | Use Case |
|--------|---------|----------|
| `sigma install --preset full` | All 7 | Complete installation |
| `sigma install --preset lean` | steps + dev + deploy | Minimal development |
| `sigma install --preset agency` | steps + ops + generators + deploy + marketing | Client-facing projects |
| `sigma install --preset audit` | steps + audit + ops | Code review / quality focus |

---

## 14. Codebase Cleanup Plan

### 14.1 Cleanup Scope Summary

| Category | Files to Delete | Lines to Remove | Space Reclaimed |
|----------|----------------|-----------------|-----------------|
| **Cursor platform** | 40+ files | ~1,200 lines | ~800 KB |
| **Antigravity platform** | 30+ files | ~1,000 lines | ~600 KB |
| **Cursor/Antigravity skills** | 170+ SKILL.md files | ~8,000 lines | ~1.1 MB |
| **Scripts** | 4 sync scripts (consolidate to 1) | ~800 lines | ~50 KB |
| **Stale docs** | Various | ~500 lines | ~100 KB |
| **Total** | ~240+ files | ~11,500 lines | ~2.5 MB |

### 14.2 Phase 1: Platform Removal (Cursor)

**Files to delete:**

```
platforms/cursor/                       # Entire directory
.cursor/rules/                          # All cursor rules
cli/lib/platform/cursor.js              # 215 lines -- buildCursor(), transformToCursorRule()
scripts/condense-for-cursor.py          # 445 lines -- Python transformer
packages/sigma-protocol-core/src/adapters/cursor/  # 334 lines -- adapter
```

**Files to modify:**

| File | Change |
|------|--------|
| `cli/sigma-cli.js` | Remove `buildCursor()` call (~lines 108-174), remove cursor imports |
| `packages/sigma-protocol-core/src/generators/types.ts` | Remove `"cursor"` from PlatformType union |
| `packages/sigma-protocol-core/src/generators/types.ts` | Remove cursor entry from PLATFORM_CONFIGS |
| `CLAUDE.md` | Remove Cursor from platforms table |
| `docs/PLATFORMS.md` | Remove entire Cursor section |
| `.claude/rules/skills-reference.md` | No Cursor-specific references (clean) |

### 14.3 Phase 2: Platform Removal (Antigravity)

**Files to delete:**

```
platforms/antigravity/                  # Entire directory
.agent/                                 # Antigravity config directory
scripts/transform-for-antigravity.py    # 330 lines -- Python transformer
packages/sigma-protocol-core/src/adapters/antigravity/  # 360 lines -- adapter
```

**Files to modify:**

| File | Change |
|------|--------|
| `cli/sigma-cli.js` | Remove antigravity build logic, remove imports |
| `packages/sigma-protocol-core/src/generators/types.ts` | Remove `"antigravity"` from PlatformType union |
| `packages/sigma-protocol-core/src/generators/types.ts` | Remove antigravity entry from PLATFORM_CONFIGS |
| `CLAUDE.md` | Remove Antigravity from platforms table |
| `docs/PLATFORMS.md` | Remove entire Antigravity section |

### 14.4 Phase 3: Script Consolidation

**Current state:** 4 separate sync/transform scripts:

| Script | Lines | Purpose |
|--------|-------|---------|
| `scripts/condense-for-cursor.py` | 445 | Transform skills to Cursor rules |
| `scripts/transform-for-antigravity.py` | 330 | Transform skills to Antigravity format |
| `scripts/sync-*.sh` (various) | ~200 | Platform sync helpers |
| `scripts/platform-sync.sh` | ~150 | Cross-platform sync |

**Proposed:** Single `scripts/sync-platforms.sh` that:
- Reads platform list from config (Claude Code, Codex, Factory Droid, OpenCode)
- Runs appropriate builder for each detected platform
- Reports results with counts

### 14.5 Phase 4: Skill Count Correction

| Source | Claims | Actual |
|--------|--------|--------|
| CLAUDE.md "189 skills" | 189 | 186 |
| CLAUDE.md "128 commands" | 128 | 187 |
| docs/PLATFORMS.md | Various | Needs audit |
| Codex section "182 skills" | 182 | Needs recount |

**Action:** Add a `sigma doctor --audit-counts` subcommand that:
1. Counts actual files in each platform directory
2. Compares to documented numbers
3. Reports mismatches
4. Optionally auto-fixes documentation

### 14.6 Phase 5: Documentation Cleanup

| Document | Issue | Action |
|----------|-------|--------|
| `docs/PLATFORMS.md` | Contains Cursor + Antigravity sections | Remove both sections |
| `CLAUDE.md` platforms table | 6 platforms listed, should be 4 | Remove Cursor + Antigravity rows |
| Memory files | Reference Cursor/Antigravity versions | Update version table to 4 platforms |
| `platform-sync` command | Syncs 6 platforms | Update to sync 4 platforms |
| `.claude/rules/swarm-orchestration.md` | Clean (no platform-specific refs) | No change needed |

### 14.7 Phase 6: .gitignore and Generated File Audit

- Verify all SKILL.md files remain in `.gitignore`
- Verify `docs/analysis/` remains gitignored
- Remove any orphaned `.cursor/` or `.agent/` entries from `.gitignore`
- Verify `platforms/cursor/` and `platforms/antigravity/` directories are fully removed from git tracking

---

## 15. Step Command Consolidation

### 15.1 Command Inventory (245+ total)

| Category | Count | Examples |
|----------|-------|---------|
| **Core Steps** | 19 commands | step-0 through step-13, plus step-1.5, step-5b, step-11a, step-11b |
| **Utility Commands** | 70+ commands | status, doctor, maid, onboard, scaffold, implement-prd |
| **Marketing Commands** | 23 commands | market-research through community-update (01-23) |
| **Taskmaster Commands** | 47 commands | tm:add-task, tm:expand, tm:next, tm:init, etc. |

### 15.2 Redundancies Found

| Redundant Command | Identical To | Action |
|-------------------|-------------|--------|
| `/step-5b-prd-to-json` | `/step-11a-prd-to-json` (same schema, differ only in input/output paths) | Merge into `/prd-json` (see Section 7) |
| `/prd-orchestrate` | `/step-11b-prd-swarm` (pure alias) | Remove alias, keep step-11b |
| `/sigma-continue` | Functionally overlaps with `/continue` | Keep `/continue`, alias `/sigma-continue` |
| `/cleanup-repo` | Renamed to `/maid` | Already aliased, remove old command file |

### 15.3 Workflow Notation Fix

`workflow.md` currently uses decimal notation that doesn't match command names:

| Current (workflow.md) | Actual Command | Fix |
|----------------------|---------------|-----|
| Step 5.5 | `/step-5b-prd-to-json` | Change to "Step 5b" |
| Step 11.25 | `/step-11a-prd-to-json` | Change to "Step 11a" |

**Proposed workflow.md update:**

```
Step 5: Wireframes -> docs/prds/flows/*.md
    |
Step 5b: PRD to JSON (Ralph-mode) -> docs/ralph/prototype/prd.json
    |
...
Step 11: PRD Generation -> /docs/prds/*.md
    |
Step 11a: PRD to JSON (Ralph-mode) -> docs/ralph/implementation/prd.json
    |
Step 11b: PRD Swarm (optional) -> swarm-*/
```

### 15.4 Step Flow Analysis

**Dependencies verified correct:**
- Steps 0-5 are sequential (each requires previous)
- Step 5b is optional (Ralph-mode only)
- Steps 6-8 can partially parallelize (design system, states, tech spec draw from step 5)
- Step 9 is optional (landing page)
- Steps 10-11 are sequential (feature breakdown -> PRDs)
- Step 11a is optional (Ralph-mode only)
- Step 11b is optional (swarm execution)
- Steps 12-13 are sequential (context engine -> skillpack)

**No gaps or missing steps identified.** The 13-step flow is sound. The issues are purely in naming consistency and redundant aliases.

### 15.5 Proposed Command Structure (Post-Cleanup)

```
Core Steps (15 commands):
  sigma step 0    Environment Setup
  sigma step 1    Ideation
  sigma step 1.5  Offer Architecture (optional)
  sigma step 2    Architecture
  sigma step 3    UX Design
  sigma step 4    Flow Tree
  sigma step 5    Wireframe Prototypes
  sigma step 6    Design System
  sigma step 7    Interface States
  sigma step 8    Technical Spec
  sigma step 9    Landing Page (optional)
  sigma step 10   Feature Breakdown
  sigma step 11   PRD Generation
  sigma step 12   Context Engine
  sigma step 13   Skillpack Generator

Consolidated Commands (replacing fragments):
  sigma prd-json          Replaces step-5b + step-11a
  sigma ralph             Replaces sigma-ralph-loop + scripts/sigma-ralph.sh
  sigma swarm             New universal swarm command (Section 8.1)
  sigma tutorial          New interactive guide (Section 8.2)

Removed (aliases/legacy):
  prd-orchestrate         -> sigma swarm (or step-11b)
  sigma-continue          -> sigma continue (aliased)
  cleanup-repo            -> sigma maid (already aliased)
```

### 15.6 SigmaStream Architecture

**What it is:** A 538-line parallel worker agent (`sigma-stream.md`) that:
- Registers with orchestrator via Agent Hub MCP (`mcp_agent_mail`)
- Executes PRDs via Ralph loop methodology
- Supports status, skip, retry, pause, abort commands
- Part of `orchestrate -> stream -> ralph` pipeline

**Current distribution (naive):** Round-robin PRD assignment across streams.

**Proposed: Smart dependency-aware distribution:**
1. Build DAG from PRD dependencies (blockedBy/blocks)
2. Find connected components (independent clusters)
3. Bin-pack components into N streams (balanced by estimated effort)
4. Topologically sort within each stream (dependencies first)
5. Independent components run in true parallel across streams

**Key change:** Remove git worktree creation. Each stream works in the same repo, on non-overlapping files determined by PRD scope. The user explicitly stated: "It doesn't need to create Git worktrees. It just needs to separate the PRDs based on dependencies evenly."

**Go equivalent:** `pkg/orchestration/stream.go` with `StreamDistributor` that implements dependency-aware bin-packing.

---

## 16. TUI UX Design Summary

Full design document: `docs/ux/SIGMA-TUI-UX-DESIGN.md`

### 16.1 Design Philosophy: "Mission Control"

The TUI should feel like a mission control center -- calm, authoritative, information-dense but never overwhelming.

**Three principles:**
1. **Progressive disclosure** -- Show the minimum needed now; let the user drill in
2. **Keyboard-first, discoverable** -- Every action reachable by keyboard, shortcuts shown inline
3. **State always visible** -- Active agents, current step, system health always one glance away

**What "wow" looks like in a terminal:**
- Opening the TUI and immediately seeing where you are in a 13-step process
- Seeing 8 agents working in parallel with real-time status
- A first-run experience under 90 seconds that lands you in Step 1
- Zero moments of "what do I press next?"

### 16.2 Views and Navigation

| # | View | Shortcut | Purpose |
|---|------|----------|---------|
| 1 | **First-Run** | Auto | Welcome, platform detect, project init, MCP setup, kickoff prompt |
| 2 | **Dashboard** | `1` | Workflow progress, active agents, recent activity |
| 3 | **Steps** | `2` | Detailed step execution with substeps and output |
| 4 | **Agents** | `3` | Agent roster, status, memory, spawn history |
| 5 | **Swarm** | `4` | Live swarm orchestration with dependency graph |
| 6 | **Settings** | `5` | Platform config, MCP servers, preferences |
| 7 | **Doctor** | `d` | Diagnostics, health checks, fix suggestions |

**Overlays:**
- **Command Palette** (`/`): Fuzzy search across all 245+ commands
- **Help** (`?`): Context-sensitive keyboard shortcut reference

### 16.3 Color System

```
BRAND (Gotham Night)
  Gotham Purple    #9D4EDD   Primary accent, headings, active selection
  Electric Blue    #00D9FF   Secondary accent, links, interactive elements

SURFACE
  Background       #0D1117   Main background (GitHub dark)
  Surface          #161B22   Cards, panels, elevated surfaces
  Border           #30363D   Subtle borders
  Text Primary     #E6EDF3   Main text
  Text Secondary   #8B949E   Muted text, labels

SEMANTIC
  Success Neon     #39FF14   Completed steps, passing checks
  Warning Gold     #FFD60A   In-progress, caution states
  Error Crimson    #FF0055   Failures, blocked agents
  Info Blue        #00D9FF   Informational (shares with Electric Blue)

AGENT STATUS
  Idle             #484F58   Dim, waiting
  Working          #FFD60A   Gold pulse animation
  Completed        #39FF14   Neon green
  Blocked          #FF0055   Crimson
  Reviewing        #9D4EDD   Gotham Purple (DA / GA)

ACCENTS
  Neon Magenta     #FF00FF   Alerts, critical badges (sparingly)
  Cyber Teal       #00FFD1   Special highlights, selection rings
```

All colors verified WCAG AA compliant against #0D1117 background. Lip Gloss Go implementation included in TUI PRD.

### 16.4 First-Run Experience (< 90 seconds)

```
Welcome Screen (2s auto-advance)
    |
Platform Detection (auto-detect installed tools)
    |
Project Init (name, description, type via Huh forms)
    |
MCP Setup (optional, skippable)
    |
"What do you want to build?" (seed prompt)
    |
Handoff to Step 1 Ideation
```

Key design decisions:
- ASCII art logo in Gotham Purple (#9D4EDD), "Press any key" pulses gently
- Detected platforms get green checkmarks, pre-selected for install
- MCP servers are optional with "set up later with [sigma doctor]" reassurance
- "What do you want to build?" seeds Step 1 directly
- 4 screens total, each completable in ~20 seconds

### 16.5 Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SIGMA  my-awesome-app                          Step 3/13    Claude Code    │
├───────────────────┬──────────────────────────────────────────────────────────┤
│                   │                                                          │
│  WORKFLOW         │  STEP 3: UX DESIGN                                      │
│                   │  Status: In Progress | Substeps: 4/7                    │
│  0  Environment   │                                                          │
│  1  Ideation      │  ACTIVE AGENTS                                          │
│  2  Architecture  │  sigma-ux-director      Working    2m ago               │
│  3  UX Design  <  │  sigma-lead-architect   Idle                            │
│  4  Flow Tree     │                                                          │
│  ...              │  RECENT ACTIVITY                                        │
│  13 Skillpack     │  14:32  UX Director generated 3 user flows              │
│                   │  14:28  Architecture doc updated (v2)                    │
│  QUICK ACTIONS    │  14:15  Step 2 verified: 87/100                         │
│  [s] Run step     │                                                          │
│  [r] Ralph loop   │                                                          │
│  [w] Swarm        │                                                          │
│  [d] Doctor       │                                                          │
├───────────────────┴──────────────────────────────────────────────────────────┤
│  [1]Dashboard [2]Steps [3]Agents [4]Swarm [5]Settings     [?]Help  [q]Quit  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Responsive behavior:**
- **120x40** (target): Full two-panel layout as shown above
- **80x24** (minimum): Left panel collapses to step numbers only, labels hidden
- **200x50+** (large): Three-panel layout with expanded activity log

### 16.6 Onboarding Best Practices (Research Findings)

| Principle | Application to Sigma |
|-----------|---------------------|
| **15-minute rule** | Users must find value within 15 minutes of first `sigma` run |
| **Progressive disclosure** | Show 5 core commands first (`step`, `swarm`, `doctor`, `status`, `tutorial`); reveal 240+ advanced commands in palette |
| **Show, don't tell** | Interactive tutorial walks through Step 1 live, not just docs |
| **Gamification** | Quality scores per step (0-100), completion badges, streak tracking |
| **Escape hatches** | Every screen has `Esc` to go back, `q` to quit, `?` for help |
| **Forgiving input** | Fuzzy command palette matches partial names, typos tolerated |
| **Context-sensitive help** | `?` shows shortcuts relevant to CURRENT view, not global dump |

**Reference implementations studied:**
- GitHub CLI (`gh`): Progressive auth flow, guided first PR
- Vercel CLI: Deploy in <60 seconds, visual progress
- Railway CLI: Interactive project linking, live logs
- lazygit: Keyboard cheat sheet overlay, gradual complexity

### 16.7 Bubble Tea Model Mapping

| TUI View | Go Model | Bubble Tea Component |
|----------|----------|---------------------|
| App Shell | `appModel` | Top-level program, routes to child models |
| Dashboard | `dashboardModel` | Layout with viewport + list |
| Steps | `stepModel` | Viewport with spinner + progress bar |
| Agents | `agentModel` | Table with status indicators |
| Swarm | `swarmModel` | Custom DAG renderer + table |
| Tutorial | `tutorialModel` | Paginated viewport with highlights |
| Doctor | `doctorModel` | Checklist with spinner per check |
| First-Run | `wizardModel` | Huh form groups (4 pages) |
| Command Palette | `paletteModel` | Filterable list overlay |

State machine: 9 states (one per view) + 2 overlay states (palette, help). Overlays render on top of current view.

---

## 17. Devil's Advocate Review & Decisions

### 17.1 Risks Raised by Devil's Advocate

| # | Risk Raised | Severity | Response |
|---|------------|----------|----------|
| 1 | CLI is 28K lines, not 2K | Noted | 28K JS != 28K Go. ~5K is boilerplate (chalk/ora/inquirer/boxen) eliminated by Charm stack. Estimated Go output: 22-26K lines (revised upward to account for full 245+ command surface). |
| 2 | Existing REFACTORING-PLAN.md partially completed | Noted | JS refactoring plan is obsolete once Go rewrite ships. The modularization insights (module boundaries) inform Go package structure. |
| 3 | Zero Go files in repo | Noted | AI agents write Go. The framework this tool builds is literally designed for this -- parallel PRD execution by AI swarms. |
| 4 | TUI used ~30 seconds per project | Disagree | This conflates current usage with potential. Current CLI has no TUI -- of course people don't use what doesn't exist. The TUI changes the interaction model. |
| 5 | "4-6 months" estimate | Reject | Based on solo human developer timelines. With AI swarms executing 12 PRDs in parallel (Wave 4), wall-clock time is days, not months. See Section 19 for task execution metrics. |

### 17.2 Decision: Full Go Rewrite (Not Hybrid)

The DA recommended a hybrid (Go shell + JS platform logic via `os/exec`). This was rejected.

**Reasons:**
- **No time constraint.** We're using AI to code with AI. The rewrite will be swarm-executed.
- **Two runtimes is worse than one.** Hybrid requires users to have both Go and Node.js. Single Go binary via Homebrew is cleaner.
- **Maintenance burden.** Hybrid means bugs in two languages. Full rewrite means one language, one build system, one test framework.
- **The JS CLI was never designed for TUI.** Retrofitting Bubble Tea alongside commander/inquirer creates architectural debt from day one.
- **Distribution.** `brew install sigma` (single binary, no deps) beats `npm install -g` (requires Node.js 18+, npm, global install permissions).

### 17.3 Alternative Noted: Web Dashboard

The DA proposed `sigma serve` at localhost:3000 as an alternative to TUI.

**Decision:** TUI first. Web dashboard can be added later as `sigma serve` using the same Go data layer + an embedded web server. The Go architecture supports both -- the TUI's model layer is UI-agnostic.

### 17.4 DA Review: Round 2 Findings (6 checks, 4 FAIL, 2 WARN)

| # | Finding | Severity | Resolution |
|---|---------|----------|-----------|
| 6 | 55+ commands unaccounted in Go rewrite | FAIL | Added to module mapping (Section 13.3), split into 9 sub-PRDs (Section 18) |
| 7 | SigmaStream incorrectly flagged for removal | FAIL | Fixed in Section 15.2, architecture documented in Section 15.6 |
| 8 | Landing page PRD missing | FAIL | Added PRD-LANDING-PAGE in Section 18 |
| 9 | PRD-GO-COMMANDS scope too large (245+ commands in one PRD) | FAIL | Split into 9 sub-PRDs by module (Section 18) |
| 10 | Subscription model undefined (when does CLI need AI?) | WARN | Clarified in Section 13.6 (CLI Operation Modes) |
| 11 | /swarm dependency graph not enforced | WARN | Added enforcement in Section 8.5 |

### 17.5 Resolved DA Questions

| Question | Answer |
|----------|--------|
| Where do users spend time? | In the AI coding tool. The TUI is the **launcher** and **dashboard** -- not where you work, where you start and check status. |
| Monitoring or control? | **Control.** Start steps, configure swarms, run doctor, launch tutorials. Not a passive dashboard. |
| What does "feel like an app" mean? | Animated transitions, real-time agent status, keyboard navigation, progressive disclosure, first-run wizard. Defined in Section 16. |
| What's the actual interaction? | Launch `sigma` -> dashboard -> press `s` to run step OR `w` for swarm OR `d` for doctor -> hand off to platform. |

---

## 18. PRD Generation Roadmap

Each section above maps to one or more implementation PRDs. **28 PRDs in 6 waves.**

### 18.1 PRD Table

| PRD | Source Section | Scope | Complexity |
|-----|---------------|-------|-----------|
| **PRD-CLI-CLEANUP** | Section 14 | Remove Cursor/Antigravity, consolidate scripts, fix counts | Simple |
| **PRD-STEP-CONSOLIDATION** | Section 15 | Merge prd-json, remove aliases, fix workflow.md | Simple |
| **PRD-GO-SCAFFOLD** | Section 13.3 Phase 1 | Go module init, directory structure, Cobra root, Viper config, GoReleaser CI/CD | Simple |
| **PRD-LANDING-PAGE** | User request + OpenClaw reference | One-page site: hero with install command, about section, feature highlights. Deploy to Vercel. React/Next.js. | Simple |
| **PRD-GO-CORE** | Section 13.3 Phase 2 | Skill parser, config manager, schema validator, platform builder interface | Medium |
| **PRD-GO-HOOKS** | Section 9b | Go binary manages hook installation, settings.json generation, `sigma doctor --hooks` | Medium |
| **PRD-GO-PLATFORM-CLAUDE** | Section 13.3 Phase 3 | Claude Code builder (skills, agents, commands, hooks, CLAUDE.md) | Medium |
| **PRD-GO-PLATFORM-CODEX** | Section 13.3 Phase 3 | Codex builder (skills, config.toml, rules, AGENTS.md) | Medium |
| **PRD-GO-PLATFORM-FACTORY** | Section 13.3 Phase 3 | Factory Droid builder (skills, commands, droids, .droid.yaml) | Medium |
| **PRD-GO-PLATFORM-OPENCODE** | Section 13.3 Phase 3 | OpenCode builder (skills, commands) | Simple |
| **PRD-GO-CMD-CORE** | Section 13.3 + 9c | install, build, status, doctor, config, init + always-installed (tm/, maid/, thread/, orchestrate/) | Complex |
| **PRD-GO-CMD-STEPS** | Section 13.3 | step 0-13, step 1.5, prd-json, validate-methodology, dev-loop | Medium |
| **PRD-GO-CMD-ORCHESTRATION** | Section 13.3 | swarm, ralph, stream, sigma-stream, sigma-orchestrate | Medium |
| **PRD-GO-CMD-AUDIT** | Section 13.3 + 9c | security-audit, accessibility-audit, gap-analysis, performance-check, tech-debt-audit, etc. (~16 commands) | Medium |
| **PRD-GO-CMD-OPS** | Section 13.3 + 9c | sprint-plan, daily-standup, backlog-groom, onboard, pr-review, etc. (~25 commands) | Medium |
| **PRD-GO-CMD-GENERATORS** | Section 13.3 + 9c | new-project, scaffold, new-feature, proposal, contract, test-gen, etc. (~15 commands) | Medium |
| **PRD-GO-CMD-DEPLOY** | Section 13.3 + 9c | ship-check, ship-stage, ship-prod, client-handoff (~4 commands) | Simple |
| **PRD-GO-CMD-MARKETING** | Section 13.3 + 9c | 01-market-research through 23-story-posts, ai-image-prompt, ai-video-prompt (~25 commands) | Medium |
| **PRD-GO-CMD-DEV** | Section 13.3 + 9c | implement-prd, plan, db-migrate, compound-engineering, prompt-enhancer (~5 commands) | Simple |
| **PRD-SWARM-COMMAND** | Sections 8.1 + 8.5 | Universal /swarm command across 4 platforms with DAG enforcement | Complex |
| **PRD-DA-GA-ENFORCEMENT** | Section 8.3 | Mandatory DA + GA on all platforms | Medium |
| **PRD-SIGMASTREAM-SMART** | Section 15.6 | Dependency-aware DAG distribution, remove worktrees, bin-packing algorithm | Medium |
| **PRD-GO-TUI** | Sections 13.3 + 16 | Bubble Tea app shell, dashboard, step view, swarm view, command palette, Gotham Night color system | Complex |
| **PRD-GO-WIZARD** | Sections 16.4 + 9c + 13.7 | First-run experience (4 screens, Huh forms, platform detection, module selection) | Medium |
| **PRD-GO-TUTORIAL** | Section 16.6 | Interactive tutorial system with progressive disclosure | Medium |
| **PRD-TUTORIAL-COMMAND** | Section 8.2 | Platform-adaptive /tutorial command | Medium |
| **PRD-TASK-METRICS** | Section 19 | Task execution timing, agent memory, estimation learning | Medium |
| **PRD-GO-DISTRIBUTION** | Section 13.4 | GoReleaser, Homebrew tap, Scoop manifest, GitHub Action | Simple |

### 18.2 Command Sub-PRD Breakdown (9 PRDs replacing PRD-GO-COMMANDS)

The original PRD-GO-COMMANDS (245+ commands in one PRD) was too large. Split into 9 sub-PRDs by module:

| PRD | Commands Covered | Count | Module |
|-----|-----------------|-------|--------|
| `PRD-GO-CMD-CORE` | install, build, status, doctor, config, init + always-installed (tm/, maid/, thread/, orchestrate/) | ~74 | Always |
| `PRD-GO-CMD-STEPS` | step 0-13, step 1.5, prd-json, validate-methodology, dev-loop | ~21 | steps |
| `PRD-GO-CMD-ORCHESTRATION` | swarm, ralph, stream, sigma-stream, sigma-orchestrate | ~8 | Always |
| `PRD-GO-CMD-AUDIT` | security-audit, accessibility-audit, gap-analysis, holes, performance-check, tech-debt-audit, seo-audit, analyze, verify-prd, step-verify, ui-healer, load-test, license-check, code-quality-report, simplify | ~16 | audit |
| `PRD-GO-CMD-OPS` | sprint-plan, daily-standup, backlog-groom, onboard, retrofit-*, sync-*, pr-review, platform-sync, qa-*, docs-update, release-review, maintenance-plan, prompt-handoff, status, job-status | ~25 | ops |
| `PRD-GO-CMD-GENERATORS` | new-project, scaffold, new-feature, new-command, proposal, contract, nda, test-gen, changelog, api-docs-gen, cost-optimizer, estimation-engine, wireframe, notebooklm-format, prototype-proposal | ~15 | generators |
| `PRD-GO-CMD-DEPLOY` | ship-check, ship-stage, ship-prod, client-handoff | ~4 | deploy |
| `PRD-GO-CMD-MARKETING` | 01-market-research through 23-story-posts, ai-image-prompt, ai-video-prompt | ~25 | marketing |
| `PRD-GO-CMD-DEV` | implement-prd, plan, db-migrate, compound-engineering, prompt-enhancer | ~5 | dev |

**Total:** 9 command sub-PRDs covering all 193+ commands across all modules.

### 18.3 Wave Execution Plan

```
Wave 1 (parallel -- no dependencies):
  PRD-CLI-CLEANUP
  PRD-STEP-CONSOLIDATION
  PRD-GO-SCAFFOLD
  PRD-LANDING-PAGE

Wave 2 (depends on GO-SCAFFOLD):
  PRD-GO-CORE
  PRD-GO-HOOKS

Wave 3 (parallel -- depends on GO-CORE):
  PRD-GO-PLATFORM-CLAUDE
  PRD-GO-PLATFORM-CODEX
  PRD-GO-PLATFORM-FACTORY
  PRD-GO-PLATFORM-OPENCODE

Wave 4 (parallel -- depends on platforms, 12 PRDs):
  PRD-GO-CMD-CORE
  PRD-GO-CMD-STEPS
  PRD-GO-CMD-ORCHESTRATION
  PRD-GO-CMD-AUDIT
  PRD-GO-CMD-OPS
  PRD-GO-CMD-GENERATORS
  PRD-GO-CMD-DEPLOY
  PRD-GO-CMD-MARKETING
  PRD-GO-CMD-DEV
  PRD-SWARM-COMMAND
  PRD-DA-GA-ENFORCEMENT
  PRD-SIGMASTREAM-SMART

Wave 5 (parallel -- depends on commands):
  PRD-GO-TUI
  PRD-GO-WIZARD
  PRD-GO-TUTORIAL
  PRD-TUTORIAL-COMMAND
  PRD-TASK-METRICS

Wave 6 (final):
  PRD-GO-DISTRIBUTION
```

**6 waves. 28 PRDs total. Waves 1, 3, 4, and 5 are parallelizable. Wave 4 is the largest (12 PRDs) but all are independent command groups building on the same platform foundation. With AI swarms, each wave is ~1 day of wall-clock time.**

---

## 19. Task Execution Metrics & Estimation Learning

### 19.1 The Problem

AI agents (and humans reviewing their work) currently have no data on how long tasks actually take to execute. This leads to:
- Overestimation based on human developer timelines (e.g., "4-6 months" for a Go rewrite)
- No learning loop -- the same task type gets the same guess every time
- No way to calibrate swarm sizing (how many agents, how long to wait)

### 19.2 What Already Exists

| Component | Location | What It Captures |
|-----------|----------|-----------------|
| `session-end-summary.sh` | `.claude/hooks/slas/` | Session ID, timestamp, branch, commit, files_changed (JSONL) |
| `session-utils.sh` | `.claude/hooks/slas/lib/` | `calc_duration()` function for start/end timestamps |
| `task-completed-handler.sh` | `.claude/hooks/` | TaskCompleted hook -- currently only checks DA/GA unblocking |
| TaskCreate/TaskUpdate | Claude Code native | Tasks have created_at, updated_at timestamps in JSON |
| Agent memory (MEMORY.md) | `.claude/agent-memory/` | Persistent notes across sessions (first 200 lines injected) |

### 19.3 Proposed: Task Timing Pipeline

```
TaskUpdate(status: "in_progress")
    |
    +--- PostToolUse hook captures start_time
    |
    [Agent works on task]
    |
TaskUpdate(status: "completed")
    |
    +--- TaskCompleted hook captures end_time
    |
    +--- Calculates duration = end_time - start_time
    |
    +--- Logs to task-metrics.jsonl:
    |      { task_id, subject, complexity, duration_seconds,
    |        agent_type, model, files_changed, lines_added }
    |
    +--- Updates agent memory with rolling averages:
           "Average task completion: Simple=4m, Medium=12m, Complex=28m"
```

### 19.4 Metrics Schema

```jsonl
{"task_id":"t-001","subject":"Implement login form","complexity":"medium","duration_seconds":720,"agent_type":"sigma-executor","model":"opus-4.6","files_changed":3,"lines_added":145,"lines_removed":12,"timestamp":"2026-02-09T14:32:00Z","team":"prd-auth","wave":2}
{"task_id":"t-002","subject":"Write auth tests","complexity":"simple","duration_seconds":340,"agent_type":"sigma-qa","model":"opus-4.6","files_changed":1,"lines_added":89,"lines_removed":0,"timestamp":"2026-02-09T14:38:00Z","team":"prd-auth","wave":2}
```

Fields captured per task:
- `task_id`: Unique task identifier
- `subject`: Task description (for pattern matching)
- `complexity`: simple | medium | complex (from PRD or auto-detected)
- `duration_seconds`: Wall-clock time from in_progress to completed
- `agent_type`: Which agent type executed it
- `model`: AI model used (opus-4.6, sonnet-4.5, etc.)
- `files_changed`, `lines_added`, `lines_removed`: Scope of changes
- `team`: Which swarm team this belonged to
- `wave`: Which execution wave (for parallel analysis)

### 19.5 Learning Loop

After N tasks are logged, the system can:

1. **Estimate future tasks:** "Tasks tagged 'medium' with 'platform builder' in the subject take an average of 15 minutes with sigma-executor on Opus 4.6."

2. **Calibrate swarm sizing:** "Wave 3 (4 parallel platform builders) completed in 18 minutes. Wave 4 (3 dependent tasks) took 22 minutes. Total PRD execution: 1h 12m."

3. **Inject into planning:** When `/swarm` or `/plan` is invoked, the agent reads `task-metrics.jsonl` from agent memory and says: "Based on 47 previous tasks, this PRD should take approximately 45 minutes across 3 waves."

4. **Detect anomalies:** "Task t-015 took 45 minutes (3x the average for 'simple' tasks). Something may have gone wrong."

### 19.6 Implementation

| Component | Type | What It Does |
|-----------|------|-------------|
| `task-timer-start.sh` | PostToolUse hook (on TaskUpdate) | When task status changes to `in_progress`, write `{task_id: start_time}` to `/tmp/sigma-task-timers.json` |
| `task-timer-end.sh` | TaskCompleted hook (enhance existing) | Read start_time from temp file, calculate duration, append to `task-metrics.jsonl`, update agent memory rolling averages |
| `task-metrics.jsonl` | Data file | `.claude/agent-memory/task-metrics.jsonl` (project scope, committed to git) |
| `estimation-model` | Agent memory entry | Rolling averages by complexity + agent_type, injected into orchestrator MEMORY.md |
| `sigma doctor --metrics` | CLI subcommand | Display task execution stats, averages, anomalies |
| TUI Metrics View | Go TUI | Dashboard panel showing execution history, trends, averages |

### 19.7 Privacy & Scope

- **Project-scoped by default:** `task-metrics.jsonl` lives in `.claude/agent-memory/` (committed to git, shared with team)
- **No conversation content:** Only task metadata (subject, duration, file counts). No prompts, no code content.
- **Opt-out:** `sigma config set metrics.enabled false` disables collection
- **Aggregation:** Agent memory stores only rolling averages (last 100 tasks), not raw data. Raw data stays in JSONL file.

---

## 20. Pre-Rewrite Brainstorming Sweep

**Date:** 2026-02-09
**Method:** 5 specialized agents (step commands sweep, non-step commands sweep, architecture/agents/skills sweep, competitive research, plan synthesis with devil's advocate cross-check)

This section captures all findings from a comprehensive project-wide audit conducted before PRD generation begins.

---

### 20.1 Consolidation Opportunities

#### 20.1.1 Exact Duplicates (delete immediately)

| File to Delete | Canonical File | Evidence |
|----------------|---------------|----------|
| `.claude/commands/sigma-continue.md` | `.claude/commands/continue.md` | Byte-for-byte identical |
| `.claude/commands/sigma-orchestrate.md` | `.claude/commands/orchestrate.md` | Identical 727-line duplicates |
| `.claude/commands/prd-orchestrate.md` | `.claude/commands/ops/prd-orchestrate.md` | Alias pointing to same logic |

#### 20.1.2 Overlapping Audit Commands

| Current Commands | Resolution | Rationale |
|-----------------|------------|-----------|
| `gap-analysis.md` + `verify-prd.md` | Keep both, clarify scope | gap-analysis = POST-implementation vs code; verify-prd = PRD compliance scoring. Different inputs. |
| `holes.md` + `step-verify.md` | Keep both, cross-link | holes = PRE-implementation plan gaps; step-verify = step-level scoring. Complementary. |

#### 20.1.3 Step File Consolidation

| Current | Proposed | Savings |
|---------|----------|---------|
| `step-5a-prototype-prep.md` (20KB) | Absorb into `step-5-wireframe-prototypes.md` | -1 file, -20KB. Step 5a is a thin wrapper around Step 0 env checks. |
| `step-5b-prd-to-json.md` + `step-11a-prd-to-json.md` | Merge into single `prd-to-json.md` with `--phase prototype\|implementation` flag | -1 file, single entry point for Ralph JSON conversion |

#### 20.1.4 Status Command Consolidation

5 status-related commands exist: `ops/status.md`, `ops/job-status.md`, `orchestrate/status.md`, `thread/status.md`, `tm/status/project-status.md`. Reduce to 2:
- `sigma status` -- Unified project status (steps + PRDs + orchestration)
- `sigma status --jobs` -- Active job/agent status

#### 20.1.5 TaskMaster Evaluation

`tm/` directory has 67 files. Significant overlap with Claude Code's native `TaskCreate`/`TaskUpdate`/`TaskList`/`TaskGet`. Potential to deprecate 30-40% of tm commands that duplicate native functionality. Flag for Go rewrite PRD analysis.

---

### 20.2 Quality Standardization

#### 20.2.1 Missing Verification Blocks

Steps 3-9 are missing verification blocks (the `## Verification Criteria` section with 100-point scoring). Steps 1, 2, 10-13 have them. Universal template:

| Category | Weight | Criteria |
|----------|--------|----------|
| Completeness | 30 | All required artifacts generated |
| Quality | 30 | Meets quality gates |
| Consistency | 20 | Aligns with previous steps |
| Actionability | 20 | Clear enough for next step |

**Pass threshold:** 80/100. Apply to all 13 steps uniformly.

#### 20.2.2 Frontmatter Schema Standardization

Inconsistencies found across 187 command files:
- Some use `name:` field, some don't
- Some use `allowed-tools:`, some use `tools:`
- Platform-specific includes (`$ARGUMENTS`, `$SELECTION`) vary

**Resolution:** Define canonical frontmatter schema in PRD-CLI-CLEANUP and run `ops/lint-commands` to enforce.

#### 20.2.3 commands-reference.md Completeness

`.claude/rules/commands-reference.md` is severely incomplete:
- Only 4 of 23 marketing commands listed
- 0 retrofit commands listed
- 0 maid commands listed
- 0 tm commands listed
- Missing orchestrate/*, thread/* subcommands

**Resolution:** Auto-generate from actual command files. Use as verification source for Go rewrite.

#### 20.2.4 Agent Fixes Required

| Issue | Resolution |
|-------|------------|
| Devil's Advocate agent says "READ-ONLY" (line 72) but frontmatter lists `Bash` tool | Remove Bash from tools OR remove "READ-ONLY" claim |
| Missing agent memory directories for `sigma-content-director` and `sigma-venture-studio` (both `memory: user` scope) | Create `~/.claude/agent-memory/sigma-content-director/MEMORY.md` and `~/.claude/agent-memory/sigma-venture-studio/MEMORY.md` |
| 3 skills referenced in swarm-orchestration.md but path unclear: `deep-research`, `gap-analysis`, `quality-gates` | Verify paths match actual skill file locations |

#### 20.2.5 Platform Divergence

`.cursor/rules/` has 194 files vs `.claude/rules/` has 7. This is the largest quality gap in the project. The Go rewrite should generate platform rules from a single source of truth (Section 13.7 module system).

---

### 20.3 Missing Features (Competitive Research)

Competitive analysis of 10 frameworks: BMAD Method, OpenSpec, GitHub Spec Kit, Roo Code, Aider, AIOS, Claude-Flow, Oh My Claude Code, Devin/SWE-Agent, Cline.

#### 20.3.1 From BMAD Method

| Feature | What BMAD Does | Sigma Equivalent | Priority |
|---------|---------------|------------------|----------|
| **Expansion Packs** | YAML-based add-on modules (e-commerce, SaaS, mobile) that inject agents + workflows | Module system exists but lacks domain templates. Add curated module presets with domain-specific skills. | Medium |
| **Scale-Adaptive Intelligence** | Adjusts methodology depth based on project size (solo/team/enterprise) | Add `--scale solo\|team\|enterprise` flag to `sigma install` that adjusts required vs optional steps. | Medium |
| **Document Sharding** | Splits large docs into chunks for 90% token savings | Relevant for Go TUI context loading. Skills already flat .md (good). | Low |
| **Agent Customization Guide** | Lets users create/modify agents without deep knowledge | `plugin-dev:agent-development` skill exists. Add `sigma new-agent` command in Go. | Low |

#### 20.3.2 From OpenSpec / GitHub Spec Kit

| Feature | What They Do | Sigma Equivalent | Priority |
|---------|-------------|------------------|----------|
| **Spec-as-Source-of-Truth** | All code changes must trace to a spec artifact | Add `--trace-to-prd` flag to implementation commands enforcing PRD reference in every commit | Medium |
| **Lean Mode** | 4 core artifacts only (proposal, specs, design, tasks) | `sigma install --preset lean` with only steps + dev + deploy (Section 13.7 presets) | High (already planned) |
| **Quality Gate Command** | `/analyze` runs comprehensive quality check | `@analyze` already exists as audit command. Promote in docs. | Low |

#### 20.3.3 From Roo Code / Aider

| Feature | What They Do | Sigma Equivalent | Priority |
|---------|-------------|------------------|----------|
| **Mode Switching** | 5 modes (Architect/Code/Debug/Ask/Custom) with automatic tool restrictions | Agent system handles this via frontmatter. Add `sigma mode architect\|code\|debug` as TUI shortcut. | Medium |
| **Repository Map** | Tree-sitter AST-based context map | Go rewrite could generate a repo map for context injection. Relevant for PRD-GO-CORE. | Medium |
| **Auto Lint/Test/Fix Loop** | Automatically runs lint + test after each change, fixes failures | Ralph loop does this partially. Enhance with `--auto-fix` flag. | Low |

#### 20.3.4 Novel Features (Agent Brainstorming)

| Feature | Description | Priority | Target PRD |
|---------|-------------|----------|-----------|
| **Dry-Run Mode** | `sigma step 5 --dry-run` shows what would happen without executing | High | PRD-GO-CMD-STEPS |
| **Split-Pane Log View** | TUI shows live agent output in split panes (Bubble Tea layout) | High | PRD-GO-TUI |
| **AI Command Palette** | Fuzzy-search command picker with descriptions (like VS Code Cmd+P) | High | PRD-GO-TUI |
| **Hot Reload** | `sigma watch` re-runs installation when skill/command files change | Medium | PRD-GO-TUI |
| **Token Budget Estimator** | Before executing a step, estimate token cost based on skill complexity + context size | Medium | PRD-GO-TUI |
| **Example Projects Gallery** | `sigma examples` lists curated example projects with pre-run steps | Medium | PRD-GO-TUTORIAL |
| **Explain Mode** | `sigma explain step-5` gives educational overview without executing | Medium | PRD-GO-TUTORIAL |
| **Learning Paths** | Curated sequences for skill levels (beginner: 1-5, intermediate: full 13, advanced: swarm) | Medium | PRD-TUTORIAL-COMMAND |
| **Notification Center** | Collect alerts from hooks, agents, steps into a TUI notification panel | Medium | PRD-GO-TUI |
| **Progress Badges** | Gamification -- earn badges for completing steps, achieving quality scores | Low | PRD-GO-TUI |

---

### 20.4 Architectural Improvements

#### 20.4.1 Artifact Registry

No central registry of what each step produces. Create `docs/ARTIFACT-REGISTRY.md`:

| Step | Output Artifact | Required | Format |
|------|----------------|----------|--------|
| 0 | Environment validated | Yes | Check output |
| 1 | `MASTER_PRD.md` | Yes | Markdown |
| 2 | `ARCHITECTURE.md` | Yes | Markdown |
| 3 | `UX-DESIGN.md` | Yes | Markdown |
| 4 | Flow tree diagrams | Yes | Markdown + ASCII |
| 5 | Wireframe PRDs | Yes | Markdown |
| 6 | `DESIGN-SYSTEM.md` | Yes | Markdown |
| 7 | `STATE-SPEC.md` | Yes | Markdown |
| 8 | `TECHNICAL-SPEC.md` | Yes | Markdown |
| 9 | Landing page (optional) | No | HTML/React |
| 10 | `FEATURE-BREAKDOWN.md` | Yes | Markdown |
| 11 | `docs/prds/*.md` | Yes | Markdown |
| 12 | `.cursorrules` / context | Yes | Platform-specific |
| 13 | Skillpack overlay | Yes | .md files |

This becomes the source of truth for the Go binary's `sigma status` command.

#### 20.4.2 Command Taxonomy

Formalize the command categorization for the Go binary's `cobra` CLI:

```
sigma <verb> [noun] [flags]
  install    -- Platform + module installation
  step       -- Execute methodology steps (0-13)
  audit      -- Quality checks (security, performance, gaps)
  ops        -- Operations (sprint, standup, status)
  gen        -- Generators (scaffold, project, feature)
  deploy     -- Ship check/stage/prod
  dev        -- Implementation (prd, plan, migrate)
  marketing  -- Marketing workflow (01-23)
  swarm      -- Multi-agent orchestration
  maid       -- Cleanup utilities
  tm         -- Task management
  doctor     -- Health checks
  tutorial   -- Learning mode
  config     -- Configuration management
  mode       -- Switch operation modes
```

#### 20.4.3 Centralized Hooks Manifest

Current hooks are scattered across multiple directories. Centralized manifest for Go binary:

```toml
# .sigma/hooks.toml
[hooks.ralph-enforcement]
event = "PreToolUse"
script = "hooks/ralph-skill-enforcement.sh"
required = true

[hooks.setup-check]
event = "Setup"
script = "hooks/setup-check.sh"
required = true
```

Managed by PRD-GO-HOOKS (Section 9b).

#### 20.4.4 SLAS Integration Enhancement

SLAS stores preferences but doesn't actively influence step execution. Enhancement: SLAS preferences should auto-adjust step depth (e.g., if user always skips marketing, `sigma install` defaults to excluding marketing module). Feed into PRD-GO-WIZARD preset system.

---

### 20.5 Go Rewrite Considerations

#### 20.5.1 Testing Strategy

Every Go package should have table-driven tests:
- **Unit tests** for all command parsers
- **Integration tests** for the install flow
- **Snapshot tests** for TUI components (`teatest` from Charm)
- **E2E tests** for `sigma install` -> `sigma doctor` -> `sigma step 1` flow

#### 20.5.2 Error Handling Philosophy

Adopt structured errors with `fmt.Errorf("install: %w", err)` pattern. Every user-facing error includes:
1. What happened
2. Why it happened (context)
3. How to fix it (actionable)
4. `sigma doctor` suggestion if applicable

#### 20.5.3 Config Migration

`.sigma-manifest.json` -> `.sigma-manifest.toml` migration must be non-destructive. The Go binary reads both formats and auto-migrates on next write. Zero user action required.

#### 20.5.4 Plugin System

Third-party skill/command packs via a plugin system. Enables "expansion pack" concept from BMAD without bloating the core binary. Plugin registry managed by PRD-GO-DISTRIBUTION.

#### 20.5.5 Offline Mode

Go binary works offline for all non-AI commands (install, doctor, status, maid). Cache skill/command files locally so `sigma install` works without network access after initial download.

---

### 20.6 Prioritized Action Items

#### 20.6.1 Do Now (Before PRD Generation)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Delete `sigma-continue.md` (exact duplicate) | `.claude/commands/sigma-continue.md` | 1 min |
| 2 | Delete `sigma-orchestrate.md` (exact duplicate) | `.claude/commands/sigma-orchestrate.md` | 1 min |
| 3 | Delete `prd-orchestrate.md` (alias) | `.claude/commands/prd-orchestrate.md` | 1 min |
| 4 | Fix Devil's Advocate tool contradiction | `.claude/agents/sigma-devils-advocate.md` | 5 min |
| 5 | Create missing agent memory directories | `~/.claude/agent-memory/sigma-content-director/MEMORY.md`, `~/.claude/agent-memory/sigma-venture-studio/MEMORY.md` | 2 min |
| 6 | Verify skill file references in swarm-orchestration.md | `.claude/rules/swarm-orchestration.md` | 10 min |
| 7 | Update `commands-reference.md` with complete listing | `.claude/rules/commands-reference.md` | 30 min |

#### 20.6.2 Do Next (Incorporate into Go Rewrite PRDs)

| # | Action | Target PRD |
|---|--------|-----------|
| 1 | Add verification blocks to Steps 3-9 | PRD-STEP-CONSOLIDATION |
| 2 | Standardize frontmatter schema across all commands | PRD-CLI-CLEANUP |
| 3 | Merge step-5a into step-5 | PRD-STEP-CONSOLIDATION |
| 4 | Merge step-5b + step-11a into single prd-to-json | PRD-STEP-CONSOLIDATION |
| 5 | Consolidate 5 status commands to 2 | PRD-GO-CMD-OPS |
| 6 | Evaluate tm/ overlap with native Task tools | PRD-GO-CMD-CORE |
| 7 | Create artifact registry | PRD-GO-SCAFFOLD |
| 8 | Formalize command taxonomy (`sigma verb noun flags`) | PRD-GO-SCAFFOLD |
| 9 | Add dry-run mode to step commands | PRD-GO-CMD-STEPS |
| 10 | Add expansion pack presets | PRD-GO-WIZARD |

#### 20.6.3 Do Later (Post-Go-Rewrite Enhancements)

| # | Action | Target PRD |
|---|--------|-----------|
| 1 | Hot reload (`sigma watch`) | PRD-GO-TUI |
| 2 | Token budget estimator | PRD-GO-TUI |
| 3 | Progress badges / gamification | PRD-GO-TUI |
| 4 | Example projects gallery | PRD-GO-TUTORIAL |
| 5 | Explain mode for steps | PRD-GO-TUTORIAL |
| 6 | Learning paths (beginner/intermediate/advanced) | PRD-TUTORIAL-COMMAND |
| 7 | AI command palette (fuzzy search) | PRD-GO-TUI |
| 8 | Notification center in TUI | PRD-GO-TUI |
| 9 | Repository map generation (tree-sitter AST) | PRD-GO-CORE |
| 10 | Plugin system for third-party expansion packs | PRD-GO-DISTRIBUTION |
| 11 | SLAS preference-driven install defaults | PRD-GO-WIZARD |
| 12 | Spec-as-source-of-truth (`--trace-to-prd`) | PRD-DA-GA-ENFORCEMENT |
| 13 | Scale-adaptive intelligence (solo/team/enterprise) | PRD-GO-WIZARD |
| 14 | Auto lint/test/fix loop enhancement | PRD-SIGMASTREAM-SMART |
| 15 | Mode switching TUI shortcut | PRD-GO-TUI |
| 16 | Centralized hooks manifest (`.sigma/hooks.toml`) | PRD-GO-HOOKS |

---

## 21. Prompting & Context Engineering Methodology

**Full document:** [`docs/SIGMA-PROMPTING-METHODOLOGY.md`](SIGMA-PROMPTING-METHODOLOGY.md)

### 21.1 Summary

A unified methodology that synthesizes Anthropic and OpenAI best practices into a Sigma-specific framework for structuring PRDs, commands, skills, and agent definitions for optimal LLM consumption across both Claude and GPT.

**Core philosophy:** Prompt enhancement, not hard-coding. Enrich the agent's understanding of intent, direction, and context so it can do its job well while retaining freedom to explore, discover, and adapt.

### 21.2 The Three-Level Task Prompt

Every task in a Sigma PRD carries three levels:

| Level | Name | Description |
|-------|------|-------------|
| 1 | **Intent** | The WHAT and WHY — business-level description |
| 2 | **Direction** | The WHERE TO LOOK — discovery hints, pattern references |
| 3 | **Quality Bar** | Observable, testable criteria for done |

**Schema:** `schemas/sigma-task-prompt.schema.json`

### 21.3 Integration Points with This Document

| Section | Integration |
|---------|-------------|
| **Section 5 (Swarm Orchestration)** | Orchestrator loads full PRD (Phase 1), shards into enhanced task prompts per agent (Phase 2). 85-90% token savings vs full-context-per-agent. |
| **Section 8 (New Features)** | Document sharding strategy (BMAD-inspired) uses sharded + discovery instead of sharded + hard-coded. |
| **Section 13 (CLI Architecture)** | Go binary routes tasks to platform CLI without reformatting. Unified markdown/YAML format is platform-agnostic. |
| **Section 15 (Step Consolidation)** | Step 11 PRD generation adopts enhanced prompt format. Step 12 rules become prompt-enhancing context. Step 13 overlays follow the intent/direction pattern. |
| **Section 18 (PRD Roadmap)** | All 28 PRDs should use enhanced task prompts with discovery hints. |
| **Section 19 (Estimation)** | `estimated_tokens` field in task prompt schema feeds into estimation learning system. |
| **Section 20 (Pre-Rewrite Sweep)** | Methodology formalizes the "agentic-ready" definition: enhanced prompts, not hard-coded paths. |

### 21.4 Key Decisions

1. **Unified format** — Task prompts use markdown + YAML universally. No per-platform conversion. ~5% Claude optimization traded for 100% portability.
2. **Discovery-first** — Agents explore the codebase during plan mode rather than receiving hard-coded file paths. Adapts to mid-project changes.
3. **Config layer handles platform differences** — XML (Claude) vs Markdown (GPT) formatting lives in Steps 12-13 config generation, NOT in task prompts.
4. **Behavioral verification** — Gap analysis and acceptance criteria verify what code DOES, not where files LIVE.
5. **Ralph extension** — `agentInstructions` field in `ralph-backlog.schema.json` adopts the intent + direction + quality_bar format. `discovery_hints` added to task schema.

---

## 22. OSS Repo Cleanup Plan

Before public release, the repo needs to present a clean, professional package. Users who clone should see commands, skills, agents, schemas, scripts, and documentation — nothing else.

### 22.1 Current State

**122 files tracked by git that are already in `.gitignore`** — committed before rules were added, git continues tracking them. These are "phantom tracked" files that will appear in the public repo despite being gitignored.

**Problem categories:**

| Category | Count | Examples |
|----------|-------|---------|
| Agent memory state | 9 | `.claude/agent-memory/sigma-*/MEMORY.md` |
| User-specific config | 4 | `.claude/settings.json`, `.mcp.json`, `.sigma-manifest.json` |
| Personal CLAUDE.md | 1 | Root `CLAUDE.md` (not distributable) |
| Generated doc metadata | 2 | `docs/.manifest.json`, `docs/.platform-versions.json` |
| Ralph execution state | 4 | `docs/ralph/implementation/prd.json`, `progress.txt` |
| Experiments directory | 102 | `experiments/agent-floor/` — entire Next.js test app |

### 22.2 Files to Remove from Git Tracking

These are already in `.gitignore` — just need `git rm --cached` to stop tracking:

```bash
# Agent memory (session state, not distributable)
git rm -r --cached .claude/agent-memory/

# User-specific configs
git rm --cached .claude/settings.json
git rm --cached .cursor/settings.json
git rm --cached .mcp.json
git rm --cached .sigma-manifest.json

# Personal root files
git rm --cached CLAUDE.md

# Generated metadata
git rm --cached docs/.manifest.json
git rm --cached docs/.platform-versions.json

# Ralph execution state
git rm -r --cached docs/ralph/implementation/
git rm --cached docs/ralph/NATIVE-TASK-INTEGRATION.md

# Full experiments directory
git rm -r --cached experiments/
```

### 22.3 Files to Add to .gitignore and Remove

These are tracked and NOT yet in `.gitignore`:

| File/Directory | Action | Reason |
|---------------|--------|--------|
| `v2/` | gitignore + untrack | WIP conductor experiments, not ready for public |
| `cli/REFACTORING-PLAN.md` | gitignore + untrack | Internal planning doc, not product code |
| `cli/__tests__/` | gitignore + untrack | Test files for pre-Go CLI — will be replaced |
| `docs/ux/` | gitignore + untrack | Internal UX design working doc |

New `.gitignore` additions:
```
# WIP / internal planning
v2/
cli/REFACTORING-PLAN.md
cli/__tests__/

# Internal UX working docs
docs/ux/
```

### 22.4 Docs That Stay (Product Documentation)

| File | Why It Stays |
|------|-------------|
| `docs/WORKFLOW-OVERVIEW.md` | Users need the 13-step workflow guide |
| `docs/FOUNDATION-SKILLS.md` | Skills catalog reference |
| `docs/EXTERNAL-SKILLS.md` | External skills documentation |
| `docs/PLATFORMS.md` | Multi-platform setup guide |
| `docs/CODEX-GUIDE.md` | Codex platform documentation |
| `docs/FACTORY-DROID-INTEGRATION.md` | Factory Droid integration guide |
| `docs/RALPH-MODE.md` | Ralph autonomous loop documentation |
| `docs/RALPH-SKILL-REGISTRY.md` | Skill matching reference |
| `docs/RALPH-SANDBOX-INTEGRATION.md` | Sandbox environment docs |
| `docs/QUICK-REFERENCE.md` | Quick start guide |
| `docs/COMMANDS.md` | Command reference |
| `docs/FILE-PATH-REFERENCE.md` | Project structure reference |
| `docs/PLUGIN-SYSTEM.md` | Plugin development guide |
| `docs/SIGMA-VERSIONING.md` | Versioning docs |
| `docs/SIGMA-PROMPTING-METHODOLOGY.md` | Core methodology (new) |
| `docs/SWARM-FIRST-ARCHITECTURE.md` | Architecture guide |
| `docs/architecture/XCODE-MCP-INTEGRATION.md` | Xcode ADR |
| `docs/setup/XCODE-CLAUDE-SETUP.md` | Setup guide |
| `docs/tutorials/*.md` | All tutorials (Docker, E2B, Daytona) |
| `docs/ralph/NATIVE-TASK-INTEGRATION.md` | Ralph integration docs (untrack from git, but keep if useful) |

### 22.5 Docs Already Gitignored (No Action Needed)

These are already properly excluded and never appear in the repo:

| Directory | Content | Status |
|-----------|---------|--------|
| `docs/analysis/` | Gap analysis reports, platform sync reports, research | Gitignored |
| `docs/sessions/` | SLAS session metadata | Gitignored |
| `docs/products/` | Internal business strategy (SSS Unified) | Gitignored |
| `docs/reviews/` | Greptile PR review reports | Gitignored |

### 22.6 Root-Level Directory Inventory (Post-Cleanup)

What the public repo looks like after cleanup:

| Directory | Purpose | Ships? |
|-----------|---------|--------|
| `.claude/` | Claude Code config (agents, skills, rules, hooks, commands) | Yes |
| `.codex/` | Codex platform config | Yes |
| `.cursor/` | Cursor platform config | Yes |
| `.factory/` | Factory Droid platform config | Yes |
| `.github/` | GitHub workflows | Yes |
| `.playwright-mcp/` | Browser automation MCP config | Yes |
| `audit/` | Audit commands (source) | Yes |
| `cli/` | CLI source code (pre-Go, JavaScript) | Yes |
| `deploy/` | Deploy commands (source) | Yes |
| `dev/` | Dev commands (source) | Yes |
| `docs/` | Product documentation + tutorials | Yes |
| `generators/` | Generator commands (source) | Yes |
| `marketing/` | Marketing commands (source) | Yes |
| `ops/` | Ops commands (source) | Yes |
| `packages/` | NPM packages (core, plugin, harness) | Yes |
| `platforms/` | Platform-specific files (source) | Yes |
| `schemas/` | JSON schemas | Yes |
| `scripts/` | Installation + utility scripts | Yes |
| `src/` | Source skills and commands | Yes |
| `steps/` | Step commands (source) | Yes |
| `templates/` | Project templates + boilerplates | Yes |
| `tools/` | CLI tools (sss-cli.js) | Yes |
| `experiments/` | ~~Test app~~ | **Removed** |
| `v2/` | ~~WIP conductors~~ | **Removed** |

### 22.7 Scripts Inventory

All scripts in `scripts/` are product scripts that ship:

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Installation** | `install-claude-code.sh`, `install-sigma-commands.sh`, `install-opencode-config.sh` | User-facing installation |
| **Ralph loop** | `sigma-ralph.sh`, `tmux-spawn.sh`, `iterm-spawn.sh`, `skill-registry.sh` | Autonomous implementation |
| **Orchestration** | `spawn-streams.sh`, `merge-streams.sh`, `health-monitor.sh` | Multi-agent coordination |
| **Platform sync** | `sync-skills-to-platforms.sh`, `sync-commands-to-platforms.sh`, `sync-steps-to-platforms.sh` | Cross-platform file sync |
| **Utilities** | `categorize-skills.sh`, `condense-for-cursor.py`, `convert-to-factory.sh` | Maintenance tools |
| **Hooks** | `post-edit.sh`, `session-start.sh` | SLAS session hooks |
| **Sandbox** | `Dockerfile`, `run-in-sandbox.sh` | Ralph sandbox execution |
| **Windows** | `scripts/windows/*.cmd` | Windows compatibility |
| **Plugin** | `build-plugin.sh` | Plugin building |

### 22.8 Security Notes

| Item | Status | Risk |
|------|--------|------|
| `.env` | NOT tracked (gitignored) | Safe — never committed |
| `.claude/settings.local.json` | NOT tracked (gitignored) | Safe — never committed |
| `.claude/settings.json` | Tracked (phantom) | **Low** — untrack with `git rm --cached` |
| `.mcp.json` | Tracked (phantom) | **Low** — contains placeholder keys, untrack |
| `CLAUDE.md.example` | Tracked | Safe — template with no secrets |
| `.env.example` | Tracked | Safe — template with no secrets |

### 22.9 Execution Order

1. Add new `.gitignore` rules (Section 22.3)
2. Run `git rm --cached` for all phantom-tracked files (Section 22.2 + 22.3)
3. Commit: "chore: untrack 126 gitignored files for clean OSS release"
4. Verify: `git ls-files -ci --exclude-standard | wc -l` should return `0`
5. Verify: `git status` shows removed files as "deleted" (from git's perspective only)
6. Final audit: `git ls-files | grep -E '\.(env|secret|key|token)' ` should return nothing
