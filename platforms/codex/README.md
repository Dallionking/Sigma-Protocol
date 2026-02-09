# Codex Platform Configuration

**Platform:** OpenAI Codex CLI / Desktop App
**Model:** GPT-5.3-Codex (combined coding + reasoning, ~25% faster than GPT-5.1)
**Status:** Production
**Last Updated:** 2026-02-08

---

## Overview

Codex is OpenAI's agentic coding tool, available as a CLI (`codex`), Desktop App, and GitHub Action. It uses **project-scoped config** under `.codex/`, **skills** under `.codex/skills/`, and reads `AGENTS.md` for project-wide instructions. Sigma Protocol integrates with Codex through profiles, execution-policy rules, MCP servers, and synced skills.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **GPT-5.3-Codex** | Combined coding + reasoning model, ~25% faster than GPT-5.1 |
| **Steer Mode** | Interactive editing with inline guidance (default mode) |
| **Background Mode** | Fire-and-forget tasks that run asynchronously |
| **Profiles** | Named configuration presets (sigma-dev, sigma-strict, sigma-fast) |
| **Execution Policy** | Starlark rules (`.rules`) that block dangerous commands at the sandbox level |
| **MCP Servers** | stdio + HTTP tool servers (Firecrawl, EXA, Ref, Context7, Greptile) |
| **Desktop App** | Parallel agent sessions for multi-PRD execution |
| **GitHub Action** | `openai/codex-action@v1` for automated PR review and code generation |
| **Cloud Tasks** | Offload long-running work to OpenAI's cloud infrastructure |
| **Session Management** | Fork, resume, and share sessions |
| **Network Sandbox** | Configurable network isolation per sandbox mode |

---

## Directory Structure

```
.codex/
├── config.toml              # Project config (profiles, model, MCP, features)
├── rules/
│   ├── sigma-safety.rules   # Execution policy: destructive ops, force-push, chmod
│   ├── sigma-workflow.rules # Execution policy: git + deploy workflow guards
│   └── sigma-quality.rules  # Execution policy: build, test, dependency guards
└── skills/
    └── <skill-name>/
        └── SKILL.md          # Synced from .claude/skills/ (canonical source)

~/.codex/
├── config.toml              # User-level defaults (applied first, project overrides)
└── rules/
    └── *.rules              # User-level execution policy rules (Starlark)

AGENTS.md                    # Project-wide instructions (cross-platform standard)
```

### File Precedence

1. `~/.codex/config.toml` -- user defaults (applied first)
2. `.codex/config.toml` -- project overrides (merged on top)
3. `AGENTS.md` -- discovered via repo root, then parent paths, then `~/`

---

## Configuration Reference

### config.toml

The full production config lives at `platforms/codex/config.toml`. Key sections:

```toml
#:schema https://developers.openai.com/codex/config-schema.json

# ── Model ────────────────────────────────────────────────────────────────
model = "gpt-5.3-codex"

# ── Defaults ─────────────────────────────────────────────────────────────
approval_policy = "on-request"     # "on-request" | "on-failure" | "untrusted"
sandbox_mode = "workspace-write"   # "workspace-write" | "read-only" | "full-access"
reasoning_effort = "high"          # "low" | "medium" | "high"
web_search = "cached"              # "cached" | "live" | "disabled"
model_personality = "pragmatic"    # "pragmatic" | "concise" | "verbose"
```

### Approval Policies

| Policy | Behavior | Use Case |
|--------|----------|----------|
| `on-request` | Approve each write/exec individually | Daily development (sigma-dev) |
| `on-failure` | Auto-approve unless command fails | Rapid prototyping (sigma-fast) |
| `untrusted` | Read-only, no writes allowed | Code review & audit (sigma-strict) |

### Sandbox Modes

| Mode | File Access | Network | Use Case |
|------|-------------|---------|----------|
| `workspace-write` | Read/write within project | Configurable | Standard development |
| `read-only` | Read only | Blocked | Auditing, review |
| `full-access` | Unrestricted | Open | System-level tasks (use sparingly) |

### Profiles

Profiles are named presets that override defaults. Switch at launch:

```bash
codex --profile sigma-dev       # Balanced daily workflow (default)
codex --profile sigma-strict    # Read-only audit/review
codex --profile sigma-fast      # Rapid prototyping, auto-approve
```

Profile definitions in `config.toml`:

```toml
[profiles.sigma-dev]
approval_policy = "on-request"
reasoning_effort = "high"
sandbox_mode = "workspace-write"

[profiles.sigma-strict]
approval_policy = "untrusted"
reasoning_effort = "high"
sandbox_mode = "read-only"

[profiles.sigma-fast]
approval_policy = "on-failure"
reasoning_effort = "medium"
sandbox_mode = "workspace-write"
```

### Feature Flags

```toml
[features]
shell_snapshot = true      # Capture shell state for session resume
unified_exec = true        # Unified execution engine
exec_policy = true         # Enable execution policy rules
request_rule = true        # Enable request-level rules
undo = true                # Enable undo for file operations
```

### Shell Environment

Control which env vars are inherited by the sandbox:

```toml
[shell_environment_policy]
inherit = [
  "PATH", "HOME", "NODE_PATH", "EDITOR",
  "SHELL", "TERM", "USER", "LANG", "LC_ALL",
  "GH_TOKEN", "NPM_TOKEN",
]
```

### MCP Servers

Codex supports both **stdio** (local process) and **HTTP/Streamable HTTP** (remote) MCP transports.

```toml
# stdio servers (local process)
[mcp_servers.firecrawl]
command = "npx"
args = ["-y", "firecrawl-mcp"]

[mcp_servers.exa]
command = "npx"
args = ["-y", "@anthropic/exa-mcp-server"]

[mcp_servers.ref]
command = "npx"
args = ["-y", "@anthropic/ref-mcp-server"]

[mcp_servers.context7]
command = "npx"
args = ["-y", "@context7/mcp-server"]

[mcp_servers.task-master-ai]
command = "npx"
args = ["-y", "--package=task-master-ai", "task-master-ai"]

# HTTP server (remote)
[mcp_servers.greptile]
type = "http"
url = "https://api.greptile.com/mcp"
bearer_token_env_var = "GREPTILE_API_KEY"
```

HTTP servers support `bearer_token_env_var`, `http_headers`, and `env_http_headers` for auth.
Tool filtering is available via `allow_tools` and `deny_tools` arrays.

### Network Access

```toml
[sandbox_workspace_write]
network_access = true      # Allow network in workspace-write mode
```

---

## Execution Policy Rules

Execution policy rules (`.codex/rules/*.rules`) control which shell commands are allowed, prompted, or forbidden. Rules use Starlark `prefix_rule()` syntax with **command prefix matching** (not regex).

### Rule Format

```python
# Starlark prefix_rule() — matches command prefixes
prefix_rule(
    pattern       = ["rm", ["-rf", "-Rf"], ["/", "~"]],  # list of prefix tokens
    decision      = "forbidden",                           # "allow" | "prompt" | "forbidden"
    justification = "Recursive deletion of root/home is never allowed.",
    match         = ["rm -rf /", "rm -Rf ~/"],             # inline tests (should match)
    not_match     = ["rm -rf ./build"],                    # inline tests (should NOT match)
)
```

- **pattern**: List of command tokens. Each element is a string or list of alternatives.
- **decision**: `forbidden` > `prompt` > `allow` (most restrictive wins when rules overlap).
- **justification**: Shown in the approval prompt when `decision = "prompt"`.
- **Validate**: `codex execpolicy check --pretty --rules .codex/rules/sigma-safety.rules -- rm -rf /`

### Sigma Rule Files

Three rule files ship with the Sigma Codex config:

| File | Coverage |
|------|----------|
| `sigma-safety.rules` | Destructive ops (rm -rf), force-push, chmod 777, npm publish, kill -9 |
| `sigma-workflow.rules` | Git workflow guards, GitHub CLI, deployment commands |
| `sigma-quality.rules` | Build/test/lint allow-listing, dependency install prompts, DB migration guards |

---

## Steer Mode

Steer mode is the default interactive mode in Codex. Tips for effective use with Sigma:

1. **Be directive.** Give clear, specific instructions. Reference file paths and function names.
2. **Use profiles.** Start with `--profile sigma-dev` for normal work. Switch to `sigma-strict` for reviews.
3. **Leverage skills.** Sigma skills are loaded from `.codex/skills/`. Reference them: "Use the frontend-design skill."
4. **Iterate inline.** Steer mode lets you refine output in-place -- use it to tighten implementations.
5. **Check diffs.** Review proposed changes before approving. Use `on-request` policy for safety.
6. **Fork sessions.** When exploring alternatives, fork the session to preserve the main branch of work.

---

## Session Management

| Action | Command |
|--------|---------|
| Start new session | `codex` or `codex --profile sigma-dev` |
| Resume last session | `codex resume --last` |
| Resume by ID | `codex resume <SESSION_ID>` |
| Pick from recent | `codex resume` (interactive picker) |
| Show all sessions | `codex resume --all` |

### In-Session Slash Commands

| Command | Description |
|---------|-------------|
| `/compact` | Summarize history to free context tokens |
| `/fork` | Branch session to explore alternatives |
| `/resume` | Switch to a different session |
| `/permissions` | Change sandbox mode mid-session |
| `/personality` | Change agent personality (friendly/pragmatic/none) |
| `/review` | Structured code review of current changes |
| `/status` | Show session status and pending approvals |
| `/debug-config` | Inspect merged config (user + project) |

---

## Desktop App

The Codex Desktop App (macOS) provides a GUI with parallel agent sessions. Use it for:

- **Multi-PRD execution:** Run multiple PRDs simultaneously in separate agent panes
- **Visual diff review:** Side-by-side comparison of proposed changes
- **Automations:** Schedule recurring tasks (security scans, dependency checks)
- **Worktrees:** Each pane uses a separate git worktree to prevent file conflicts
- **Session management:** Fork, resume, and organize sessions visually
- **Profile switching:** Quick toggle between sigma-dev, sigma-strict, sigma-fast

### Parallel Agent Workflow

1. Open Desktop App and create a workspace for your project
2. Create one agent pane per PRD or feature (each gets its own worktree)
3. Set each pane to the appropriate profile
4. Agents run up to 30 minutes autonomously
5. Results land in a **review queue** -- approve, reject, or refine per pane
6. Merge results

### Automations

Schedule recurring tasks in the Desktop App's Automations tab:

- Combine instructions + optional skills
- Run on a schedule (daily, weekly, on-push)
- Results go through the review queue before applying

---

## GitHub Action

Use `openai/codex-action@v1` for automated code review, generation, and CI/CD integration.

### Basic Setup

```yaml
# .github/workflows/codex-review.yml
name: Codex PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: "Review this PR for correctness, security issues, and test coverage gaps."
          profile: sigma-strict
```

### Cloud Tasks

For long-running CI/CD tasks, use cloud mode:

```yaml
      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: "Implement the feature described in docs/prds/feature-x.md"
          profile: sigma-dev
          mode: cloud
```

---

## Sigma Installation

```bash
# Install Sigma skills to .codex/skills/
sigma install --platform codex

# Install foundation skills (shared across platforms)
sigma install-skills --platform codex

# Sync from canonical source (.claude/skills/)
./scripts/sync-skills-to-platforms.sh --platform codex
```

### Integration Notes

- **Steps remain full prompts.** Sigma steps are installed as Codex skills so each step remains a complete prompt (no sub-agent indirection).
- **AGENTS.md is shared.** The same `AGENTS.md` works across Codex, Claude Code, Factory Droid, and other platforms.
- **Skills are synced.** Canonical skills live in `.claude/skills/` and are copied to `.codex/skills/<name>/SKILL.md` by the sync script.

---

## Troubleshooting

### Reconnection Loops

If Codex enters a reconnection loop (repeatedly connecting/disconnecting):

1. Kill any stale Codex processes: `pkill -f codex`
2. Clear the session cache: `rm -rf ~/.codex/sessions/`
3. Restart: `codex --profile sigma-dev`

### Network Sandbox Issues

If MCP servers or npm commands fail with network errors:

1. Verify network access is enabled:
   ```toml
   [sandbox_workspace_write]
   network_access = true
   ```
2. Check that required env vars are inherited (e.g., `NPM_TOKEN`, `GH_TOKEN`)
3. For read-only mode, network is blocked by design -- switch to `sigma-dev` for tasks needing network

### gh CLI Not Found

The `gh` CLI may not be in the sandbox PATH. Workaround:

1. Add the full path to `shell_environment_policy.inherit`:
   ```toml
   [shell_environment_policy]
   inherit = ["PATH", ...]
   ```
2. Or use the absolute path: `/usr/local/bin/gh` or `/opt/homebrew/bin/gh`

### MCP Server Startup Failures

If MCP servers fail to start:

1. Verify `npx` is available in the sandbox PATH
2. Test the server manually: `npx -y firecrawl-mcp`
3. Check for port conflicts if running multiple Codex instances
4. For HTTP servers, verify `bearer_token_env_var` is set and the URL is reachable

### Execution Policy False Positives

If a legitimate command is blocked by an execution policy rule:

1. Review the rule in `.codex/rules/*.rules`
2. Add a more specific `prefix_rule()` with `decision = "allow"` for the legitimate command
3. Most restrictive decision wins when rules overlap (`forbidden` > `prompt` > `allow`)
4. Use `codex execpolicy check --pretty --rules <file> -- <command>` to test rules

---

## Related Documentation

- [PLATFORMS.md](../../docs/PLATFORMS.md) -- Platform comparison and full Codex section
- [CODEX-GUIDE.md](../../docs/CODEX-GUIDE.md) -- Comprehensive user guide
- [COMMANDS.md](../../docs/COMMANDS.md) -- All Sigma commands
- [FOUNDATION-SKILLS.md](../../docs/FOUNDATION-SKILLS.md) -- Core skills reference
