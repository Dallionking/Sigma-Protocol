# Codex User Guide

**Platform:** OpenAI Codex CLI / Desktop App
**Model:** GPT-5.3-Codex
**Last Updated:** 2026-02-08

---

## Quick Start with Sigma

### 1. Install Sigma Skills

```bash
# Sync canonical skills to Codex format
./scripts/sync-skills-to-platforms.sh --platform codex

# Or install directly
sigma install --platform codex
sigma install-skills --platform codex
```

### 2. Copy Config to Your Project

```bash
# Copy the Sigma Codex config to your project root
cp platforms/codex/config.toml .codex/config.toml
mkdir -p .codex/rules
cp platforms/codex/rules/*.rules .codex/rules/
```

### 3. Start Codex

```bash
# Default profile (sigma-dev)
codex --profile sigma-dev

# Or just start with defaults from config.toml
codex
```

### 4. Run a Sigma Step

```
> Run step 1 ideation for a task management app
```

Codex will load the `step-1-ideation` skill from `.codex/skills/` and execute it as a full prompt.

---

## Profile Selection Guide

Choose the right profile for each task type:

### sigma-dev (Default)

**When to use:** Daily development, feature implementation, debugging.

```bash
codex --profile sigma-dev
```

- Approval policy: `on-request` -- you approve each write/exec individually
- Reasoning: `high` -- full reasoning for complex tasks
- Sandbox: `workspace-write` -- can modify files within the project
- Best for: `/implement-prd`, `/plan`, `/scaffold`, `/new-feature`

### sigma-strict

**When to use:** Code review, security audit, compliance checks, reading unfamiliar code.

```bash
codex --profile sigma-strict
```

- Approval policy: `untrusted` -- no writes allowed at all
- Reasoning: `high` -- thorough analysis
- Sandbox: `read-only` -- cannot modify any files
- Best for: `/pr-review`, `/security-audit`, `/gap-analysis`, `/compliance-check`

### sigma-fast

**When to use:** Rapid prototyping, boilerplate generation, quick experiments.

```bash
codex --profile sigma-fast
```

- Approval policy: `on-failure` -- auto-approves unless a command fails
- Reasoning: `medium` -- faster responses, less deliberation
- Sandbox: `workspace-write` -- can modify files within the project
- Best for: `/scaffold`, early-stage exploration, throwaway prototypes

### Decision Matrix

| Task | Profile | Why |
|------|---------|-----|
| Implementing a PRD | sigma-dev | Need write access + careful review |
| PR review | sigma-strict | Read-only prevents accidental changes |
| Security audit | sigma-strict | Audit without modification |
| Scaffolding a new feature | sigma-fast | Quick boilerplate, iterate later |
| Debugging a failing test | sigma-dev | Need to read and modify test files |
| Exploring a new codebase | sigma-strict | Safe read-only exploration |
| Sprint planning | sigma-strict | Analysis only, no code changes |
| Rapid prototyping | sigma-fast | Speed over precision |

---

## Steer Mode Best Practices

Steer mode is Codex's default interactive mode. It works like a conversation where you guide the agent through a task.

### Effective Prompting

**Be specific about files and functions:**
```
> Fix the authentication bug in src/auth/login.ts where the JWT expiry check is off by one
```

Not:
```
> Fix the auth bug
```

**Reference skills by name:**
```
> Use the frontend-design skill to build the dashboard component
```

**Chain instructions:**
```
> 1. Read the PRD at docs/prds/user-settings.md
> 2. Create the implementation plan
> 3. Build the components following the design system
```

### Inline Refinement

Steer mode lets you refine output in place:

```
> That component needs error handling for the API call. Add a try/catch with a toast notification.
```

The agent will modify its previous output rather than starting from scratch.

### Session Branching

When exploring alternatives:

```
> Fork this session -- I want to try a different approach to the state management
```

This creates a branch point. You can return to the original session later.

---

## Cloud Tasks for CI/CD

Cloud tasks offload long-running work to OpenAI's infrastructure. Use them for:

- **Automated PR review** -- triggered on PR open/sync
- **Code generation** -- generate implementations from PRDs
- **Test generation** -- create test suites for untested code
- **Documentation** -- generate docs from code

### GitHub Action Setup

```yaml
name: Codex CI
on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:
    inputs:
      task:
        description: "Task for Codex to perform"
        required: true

jobs:
  codex-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Review this PR:
            - Check for correctness and edge cases
            - Verify test coverage
            - Flag security issues
            - Check adherence to the design system
          profile: sigma-strict

  codex-generate:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: ${{ github.event.inputs.task }}
          profile: sigma-dev
          mode: cloud
```

### Action Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `openai-api-key` | Yes | -- | OpenAI API key (or `AZURE_OPENAI_API_KEY`) |
| `prompt` | Yes* | -- | Inline task description (*or use `prompt-file`) |
| `prompt-file` | Yes* | -- | File path to read task from (*or use `prompt`) |
| `profile` | No | default | Sigma profile name |
| `model` | No | gpt-5.3-codex | Model override |
| `effort` | No | auto | Reasoning effort: `auto`, `low`, `medium`, `high` |
| `sandbox` | No | workspace-write | `read-only`, `workspace-write`, `danger-full-access` |
| `codex-args` | No | -- | Additional CLI args (JSON array or shell string) |
| `output-file` | No | -- | Write results to this file |
| `codex-home` | No | ~/.codex | Override Codex config directory (shared across steps) |
| `codex-version` | No | latest | Pin a specific Codex CLI version |
| `safety-strategy` | No | drop-sudo | `drop-sudo`, `unprivileged-user`, `read-only` (Linux/macOS) |

---

## Desktop App for Parallel PRD Execution

The Codex Desktop App lets you run multiple agent sessions simultaneously, each in its own pane.

### Multi-PRD Workflow

1. **Open Desktop App** and create a workspace for your project
2. **Create agent panes** -- one per PRD or feature:
   - Pane 1: `docs/prds/auth-system.md` with `sigma-dev`
   - Pane 2: `docs/prds/dashboard.md` with `sigma-dev`
   - Pane 3: `docs/prds/api-endpoints.md` with `sigma-dev`
3. **Start each pane** with its task:
   ```
   Implement the PRD at docs/prds/auth-system.md following the Sigma workflow
   ```
4. **Monitor progress** across all panes in the unified view
5. **Review diffs** per pane when each agent completes
6. **Approve or reject** changes per pane, then merge

### Git Worktrees for Parallel Agents

Each Desktop App pane can use a separate git worktree, preventing file conflicts between parallel agents:

```bash
# Create worktrees for parallel PRD work
git worktree add ../project-auth feature/auth
git worktree add ../project-dashboard feature/dashboard
git worktree add ../project-api feature/api
```

Open each worktree as a separate pane in the Desktop App. Agents work on isolated branches without stepping on each other.

### Tips for Parallel Execution

- **Use worktrees:** Avoid file conflicts by giving each agent its own branch
- **Use sigma-dev profile:** Requires your approval for each write, preventing runaway changes
- **Stagger starts:** Start the most independent features first, then dependent ones
- **Monitor resource usage:** Each pane runs its own agent process
- **Agents run up to 30 minutes** autonomously before requiring review

### Automations (Scheduled Tasks)

The Desktop App supports **Automations** -- recurring tasks that run on a schedule:

1. Open Desktop App and go to **Automations** tab
2. Create a new automation with:
   - **Instructions**: Natural language task (e.g., "Run security audit on recent changes")
   - **Skills**: Attach relevant Sigma skills
   - **Schedule**: Frequency (daily, weekly, on-push)
3. Results land in a **review queue** -- changes don't apply until you approve them

**Example Automations for Sigma:**

| Automation | Schedule | Instructions |
|------------|----------|-------------|
| Security scan | Daily | "Run security-audit skill on all changed files since yesterday" |
| Dependency check | Weekly | "Check for outdated dependencies and create upgrade PRD" |
| PRD verification | On-push | "Verify that recent changes match the PRD acceptance criteria" |
| Ralph continuation | Daily | "Continue the Ralph loop on any incomplete PRDs" |

---

## GitHub Action for Automated Code Review

### Basic PR Review

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    task: "Review this PR for correctness, security, and test coverage."
    profile: sigma-strict
```

### Security-Focused Review

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    task: |
      Perform a security review:
      - Check for OWASP Top 10 vulnerabilities
      - Verify input validation and sanitization
      - Check authentication and authorization logic
      - Flag hardcoded secrets or credentials
      - Review dependency security
    profile: sigma-strict
```

### Implementation from PRD

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    task: "Implement the feature described in docs/prds/${{ github.event.inputs.prd }}"
    profile: sigma-dev
    mode: cloud
```

---

## MCP Configuration and Available Tools

### Configured MCP Servers

| Server | Package | Tools Provided |
|--------|---------|----------------|
| **Firecrawl** | `firecrawl-mcp` | Web scraping, crawling, content extraction |
| **EXA** | `@anthropic/exa-mcp-server` | Semantic search, code context, deep research |
| **Ref** | `@anthropic/ref-mcp-server` | Documentation search, URL reading |
| **Context7** | `@context7/mcp-server` | Library-specific documentation lookup |
| **Task Master AI** | `task-master-ai` | PRD parsing, task management, research integration |

### Adding a New MCP Server

Add to `.codex/config.toml`:

```toml
[mcp_servers.my-server]
command = "npx"
args = ["-y", "@org/my-mcp-server"]
```

### Transport Types

- **stdio** (local process): Run a command that speaks MCP over stdin/stdout. Used for Firecrawl, EXA, Ref, Context7.
- **HTTP/Streamable HTTP** (remote): Connect to a remote URL. Supports `bearer_token_env_var`, `http_headers`, and `env_http_headers` for auth. Used for Greptile.
- **Tool filtering**: Use `allow_tools` and `deny_tools` arrays to restrict which tools are exposed.

### Notes

- **Sandbox restrictions:** MCP servers run within the sandbox. If `network_access = false`, servers that need network will fail.
- **Env vars:** MCP servers do not automatically inherit environment variables. Add required vars to `shell_environment_policy.include_only`.

---

## Comparison: Claude Code vs Codex Workflow

### Side-by-Side Workflow

| Step | Claude Code | Codex |
|------|-------------|-------|
| **Start session** | `claude` | `codex --profile sigma-dev` |
| **Run step** | `claude "Run step 1 ideation"` | `> Run step 1 ideation` (in steer mode) |
| **Switch to review** | Change permission mode | `codex --profile sigma-strict` |
| **Parallel execution** | Agent Teams (Shift+Tab) | Desktop App (GUI panes) |
| **CI/CD integration** | MCP + hooks | `openai/codex-action@v1` |
| **Safety rules** | Hooks (PreToolUse) | Execution policy (Starlark `.rules`) |
| **Config format** | `.claude/settings.json` | `.codex/config.toml` |
| **Skills location** | `.claude/skills/*.md` (flat) | `.codex/skills/*/SKILL.md` (folders) |
| **Project instructions** | `CLAUDE.md` | `AGENTS.md` |
| **Session fork** | Not supported | `codex session fork` |
| **Background tasks** | Task tool (subagents) | Background mode + Cloud tasks |

### When to Use Each

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Primary development | Claude Code | Canonical source, deepest integration |
| Quick code review | Codex (sigma-strict) | Fast read-only mode with execution policy |
| Parallel PRD execution | Codex Desktop App | Native parallel agent panes |
| CI/CD automation | Codex GitHub Action | First-party Action with cloud mode |
| Security audit | Either | Both have equivalent skill support |
| Open-source projects | Codex | Better OSS model availability |
| Agent team orchestration | Claude Code | Native agent teams with task management |
| Enterprise deployment | Factory Droid | SOC-2, air-gapped, on-premise |

### Shared Artifacts

Both platforms use the same Sigma artifacts:

- **Skills:** Canonical in `.claude/skills/`, synced to `.codex/skills/`
- **AGENTS.md:** Cross-platform project instructions (auto-discovered by both)
- **Foundation skills:** Same 39 foundation skills deployed to both
- **Step workflow:** Same 13-step methodology, same commands

---

## Execution Policy Reference

### How prefix_rule() Works

Execution policies match **command prefixes** -- the leading tokens of a shell command. Each `pattern` element corresponds to one position in the command. Rules do NOT match file operations or content; use linters for that.

### Decision Hierarchy

| Decision | Behavior | Priority |
|----------|----------|----------|
| `forbidden` | Block the command, show justification | Highest (always wins) |
| `prompt` | Ask user for approval, show justification | Medium |
| `allow` | Run without prompting | Lowest |

When multiple rules match the same command, the most restrictive `decision` wins.

### Writing Custom Rules

```python
# .codex/rules/my-project.rules

# Allow common dev commands without prompting
prefix_rule(
    pattern       = ["npm", "run", ["dev", "build", "test", "lint"]],
    decision      = "allow",
    justification = "Standard dev scripts are safe to run.",
    match         = ["npm run dev", "npm run test"],
    not_match     = ["npm publish"],
)

# Prompt before deploying
prefix_rule(
    pattern       = ["vercel", ["--prod", "deploy"]],
    decision      = "prompt",
    justification = "Deploying to production should be reviewed first.",
    match         = ["vercel --prod", "vercel deploy"],
)

# Block dangerous database commands
prefix_rule(
    pattern       = ["psql", "-c"],
    decision      = "prompt",
    justification = "Direct SQL execution should be reviewed. Prefer ORM migrations.",
)
```

### Validating Rules

```bash
codex execpolicy check --pretty \
  --rules .codex/rules/sigma-safety.rules \
  -- rm -rf /
```

---

## Slash Commands Reference

Within an active Codex session, use these slash commands:

| Command | Description |
|---------|-------------|
| `/compact` | Summarize conversation history to free context tokens |
| `/fork` | Branch the current session (explore alternatives without losing context) |
| `/resume` | Open session picker to switch to a previous session |
| `/permissions` | Switch sandbox mode mid-session (e.g., read-only to workspace-write) |
| `/personality` | Change agent personality (friendly, pragmatic, none) |
| `/review` | Start a structured code review of current changes |
| `/status` | Show session status (files changed, approvals pending) |
| `/debug-config` | Inspect effective configuration (merged user + project) |

---

## Advanced Features

### Session-Scoped Tool Approvals (v0.97.0+)

When using MCP tools, Codex prompts for approval on first use. After you approve a tool:

- The tool stays approved for the **rest of the session**
- New sessions re-prompt for approval (security boundary)
- Reduces approval fatigue during multi-step workflows
- Works with both stdio and HTTP MCP servers

### Live Skill Updates (v0.97.0+)

Codex automatically detects when skill files change on disk:

- Modify a skill in `.codex/skills/<name>/SKILL.md`
- Codex reloads it without restarting the session
- Useful for iterating on skill prompts during development
- No configuration needed -- enabled by default

### AGENTS.md Discovery

Codex discovers `AGENTS.md` by walking the directory tree:

1. Checks repo root (git root) first
2. Walks down to the current working directory
3. Includes **max one file per directory**
4. Concatenates all found files with blank lines
5. Stops at `project_doc_max_bytes` (default: 32 KiB)

Override for user-level defaults: `~/.codex/AGENTS.md` (every project inherits this).

### Codex as MCP Server

Codex can expose itself as an MCP server so other tools can use it:

```bash
codex mcp-server
```

This runs Codex over stdio, allowing other MCP clients to connect. It inherits your global config and exits when the downstream client disconnects. Use this to integrate Codex capabilities into other development workflows.

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Reconnection loops | Kill stale processes (`pkill -f codex`), clear `~/.codex/sessions/` |
| MCP server fails to start | Verify `npx` in PATH, test server manually, check network access |
| gh CLI not found in sandbox | Add full path to `shell_environment_policy.inherit` or use absolute path |
| Network errors in sandbox | Set `network_access = true` in `[sandbox_workspace_write]` |
| Execution policy false positive | Add a more specific `prefix_rule()` with `decision = "allow"` for the command |
| Skills not loading | Verify `.codex/skills/<name>/SKILL.md` exists (not flat `.md` files) |
| HTTP MCP not connecting | Verify `bearer_token_env_var` is set, URL is reachable, and `network_access = true` |

### Debugging Config

```bash
# Show resolved config (user + project merged)
/debug-config                  # Inside a session

# Validate execution policy rules
codex execpolicy check --pretty \
  --rules .codex/rules/sigma-safety.rules \
  -- rm -rf /

# List MCP servers
codex mcp list

# Resume a previous session
codex resume --last
```

---

## Related Documentation

- [platforms/codex/README.md](../platforms/codex/README.md) -- Full configuration reference
- [PLATFORMS.md](./PLATFORMS.md) -- Platform comparison
- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) -- Core skills reference
- [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md) -- 13-step methodology
- [COMMANDS.md](./COMMANDS.md) -- All Sigma commands
