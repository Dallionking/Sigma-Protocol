# Sigma Protocol Command Catalog

**Version:** 1.0.0-alpha.1
**Last Updated:** 2026-02-04

Complete index of all Sigma Protocol commands, organized by category.

---

## Quick Reference

| Category | Commands | Purpose |
|----------|----------|---------|
| **CLI** | 18 | Global `sigma` command + interactive tools |
| **Steps** | 20 | Core 13-step workflow + Ralph-mode conversions |
| **Audit** | 16 | Quality assurance + code simplification |
| **Dev** | 5 | Development workflow + compound engineering |
| **Ops** | 34 | Operations & management + orchestration |
| **Deploy** | 4 | Shipping & handoff |
| **Generators** | 15 | Code & doc generation |
| **Marketing** | 25 | GTM workflow + Content Creation Studio |
| **Ralph Loop** | 1 | Autonomous agent orchestration |
| **Skills** | 39 | Foundation skills (frontend, marketing, multi-agent) |
| **Agents** | 12 | Specialist agent personas |
| **Total** | **189** | |

---

## Platform Support

| Platform | Command Style | Configuration |
|----------|---------------|---------------|
| **Cursor** | `@command-name` | `.cursor/commands/` |
| **Claude Code** | `/command-name` | `.claude/` + `CLAUDE.md` |
| **OpenCode** | `/command-name` | `.opencode/` + `AGENTS.md` |
| **Codex** | `$command-name` (skills) | `.codex/` + `.codex/skills/` + `.agents/skills/` (legacy) + `AGENTS.md` |

**Codex note:** Codex loads skills from `.codex/skills` (legacy fallback: `.agents/skills`) and discovers `AGENTS.md` automatically, so Sigma steps are installed as skills to keep full prompts intact.

**Install for your platform:**
```bash
npm install -g sigma-protocol
sigma install
```

---

## CLI Commands

The global `sigma` command provides an interactive interface.

### Global Flags

| Flag | Description |
|------|-------------|
| `-D, --debug` | Enable debug output (includes verbose) |
| `-v, --verbose` | Enable verbose output |
| `-n, --dry-run` | Preview changes without executing (supported by most commands) |

### Core Commands

| Command | Description |
|---------|-------------|
| `sigma` | Interactive menu (like `claude` for Claude Code) |
| `sigma new` | Create new project wizard |
| `sigma retrofit` | Add Sigma to existing project |
| `sigma install` | Install commands to current project |
| `sigma doctor` | System health check |
| `sigma tutorial` | Interactive tutorial |
| `sigma status` | Check installation status |
| `sigma build` | Build platform-specific outputs |
| `sigma update` | Update to latest Sigma version |
| `sigma slas` | Self-learning session system (init, distill, status) |

### Maintenance Commands

| Command | Description |
|---------|-------------|
| `sigma maid` | Repository maintenance wizard (cleanup + simplify) |
| `sigma maid --quick` | Quick scan for cruft files (non-AI) |
| `sigma rollback` | List, restore, or clean up backup files |
| `sigma rollback --list` | List all available backups |
| `sigma rollback --restore=N` | Restore backup by number |
| `sigma rollback --clean` | Remove all backup files |

### Orchestration Commands

| Command | Description |
|---------|-------------|
| `sigma orchestrate` | Multi-agent orchestration |
| `sigma orchestrate --attach` | Attach to running session |
| `sigma orchestrate --status` | Check orchestration status |
| `sigma orchestrate --kill` | Stop orchestration session |
| `sigma approve --stream=X` | Approve stream completion |
| `sigma health` | Check health of orchestration streams |
| `sigma merge` | Merge completed stream worktrees |

---

## Steps Commands (`steps/`)

The core 13-step product development methodology.

| Command | Description | Key Output |
|---------|-------------|------------|
| `step-0-environment-setup` | Environment validation | None (validation) |
| `step-1-ideation` | Product ideation with Hormozi frameworks | MASTER_PRD.md |
| `step-1.5-offer-architecture` | Offer design (monetized products) | OFFER-SPEC.md |
| `step-2-architecture` | System architecture design | ARCHITECTURE.md |
| `step-3-ux-design` | UX/UI design | UX-DESIGN.md |
| `step-4-flow-tree` | Navigation flow design | FLOW-TREE.md |
| `step-5-wireframe-prototypes` | Wireframe prototypes | WIREFRAME-SPEC.md |
| `step-5b-prd-to-json` | Convert prototype PRDs to Ralph backlog | docs/ralph/prototype/prd.json |
| | *Supports `--use-taskmaster=true` for AI-powered parsing* | |
| `step-6-design-system` | Design system & tokens | DESIGN-SYSTEM.md |
| `step-7-interface-states` | Interface state specs | STATE-SPEC.md |
| `step-8-technical-spec` | Technical specification | TECHNICAL-SPEC.md |
| `step-9-landing-page` | Landing page design | LANDING-PAGE-COPY.md |
| `step-10-feature-breakdown` | Feature breakdown | FEATURE-BREAKDOWN.md |
| `step-11-prd-generation` | PRD generation | /docs/prds/*.md |
| `step-11a-prd-to-json` | Convert implementation PRDs to Ralph backlog | docs/ralph/implementation/prd.json |
| | *Supports `--use-taskmaster=true` for AI-powered parsing* | |
| `step-11b-prd-swarm` | PRD swarm orchestration (supports Ralph-mode) | /docs/prds/swarm-*/, SWARM-PLAN.md |
| `step-12-context-engine` | Context engine setup | .cursorrules |
| `step-13-skillpack-generator` | Platform configuration | Skills/rules |

---

## Audit Commands (`audit/`)

Quality assurance and verification — **16 commands**.

| Command | Description | Score? |
|---------|-------------|--------|
| `holes` | Pre-implementation gap analysis | Yes |
| `gap-analysis` | Post-implementation verification | Yes |
| `verify-prd` | PRD implementation scoring | Yes |
| `step-verify` | Step completion verification | Yes |
| `ui-healer` | Browser UI testing (Cursor/Playwright/Claude) | Yes |
| `security-audit` | Security vulnerability scan | Yes |
| `accessibility-audit` | WCAG compliance check | Yes |
| `performance-check` | Performance analysis | Yes |
| `code-quality-report` | Code quality metrics | Yes |
| `tech-debt-audit` | Technical debt analysis | Yes |
| `analyze` | General analysis | No |
| `license-check` | Dependency license audit | No |
| `load-test` | Load testing | Yes |
| `seo-audit` | SEO analysis | Yes |
| `simplify` | Code simplification (inspired by code-simplifier) | No |
| `sigma-simplify` | Sigma-specific code simplification | No |

### Audit Command Differentiation

These commands serve **different purposes** at different stages of development:

| Command | When to Use | Purpose |
|---------|-------------|---------|
| `@holes` | **BEFORE** coding | Analyze PLANS/PRDs for gaps and risks |
| `@gap-analysis` | **AFTER** coding | Verify CODE matches requirements, auto-fix issues |
| `@verify-prd` | After implementation | Score implementation quality against PRD |

**Workflow:**
1. **Pre-implementation**: Run `@holes` on your PRD to find missing requirements
2. **Post-implementation**: Run `@gap-analysis` to verify code completeness  
3. **Quality check**: Run `@verify-prd` for a quality score

---

## Dev Commands (`dev/`)

Development workflow.

| Command | Description |
|---------|-------------|
| `implement-prd` | Implement a PRD feature |
| `plan` | Create implementation plan |
| `db-migrate` | Database migration assistance |
| `compound-engineering` | Plan → Work → Review → Compound structured workflow |

---

## Ralph Loop Commands (`scripts/ralph/`)

Autonomous agent implementation orchestration for continuous PRD processing.

| Command | Description | Invocation |
|---------|-------------|------------|
| `sigma-ralph.sh` | Ralph Loop runner - spawns fresh AI sessions per story | `./scripts/ralph/sigma-ralph.sh <project> <prd.json> [agent]` |

**Usage:**
```bash
# Run Ralph loop on a feature PRD backlog
./scripts/ralph/sigma-ralph.sh /path/to/project docs/ralph/implementation/prd.json claude-code

# Run Ralph loop on prototype PRD backlog  
./scripts/ralph/sigma-ralph.sh /path/to/project docs/ralph/prototype/prd.json opencode
```

**Agent Options:** `claude-code` (default), `opencode`

---

## Thread-Based Engineering

Sigma Protocol implements **Thread-Based Engineering** - a framework for measuring and improving agentic engineering workflows.

See: [THREAD-BASED-ENGINEERING.md](THREAD-BASED-ENGINEERING.md) for full framework documentation.

### Thread Types

| Type | Symbol | Description | Sigma Command |
|------|--------|-------------|---------------|
| Base Thread | B | Single prompt → work → review | `@step-X`, any command |
| P-Thread | P | Parallel agents | `sigma orchestrate` |
| C-Thread | C | Chained phases with checkpoints | 13-step workflow |
| F-Thread | F | Fusion - same prompt, multiple agents | `sigma f-thread` |
| B-Thread | B+ | Meta - agents prompting agents | `sigma orchestrate --mode=full-auto` |
| L-Thread | L | Long duration, extended autonomy | Stop hooks + long sessions |
| Z-Thread | Z | Zero touch (goal) | Full automation |

### Thread CLI Commands

| Command | Description |
|---------|-------------|
| `sigma thread` | Thread type wizard - choose the right thread |
| `sigma thread status` | View active threads and sessions |
| `sigma thread metrics` | Track improvement across 4 dimensions |
| `sigma f-thread` | Start a Fusion Thread (multi-agent) |
| `sigma f-thread --prompt="..."` | Run prompt across multiple agents |
| `sigma f-thread --count=5` | Specify number of agents |
| `sigma f-thread --aggregate=best` | Aggregation strategy (best/consensus/merge/vote) |

### Slash Commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/thread` | Thread type wizard |
| `/thread-status` | View active threads |
| `/f-thread` | Run a fusion thread |

---

## Orchestration Commands (P-Thread)

Multi-agent parallel development - implements the **P-Thread** pattern.

### CLI Commands

| Command | Description |
|---------|-------------|
| `sigma orchestrate` | Interactive orchestration setup |
| `sigma orchestrate --streams=N` | Start N parallel stream workers |
| `sigma orchestrate --tui mprocs` | Use mprocs TUI (recommended) |
| `sigma orchestrate --tui overmind` | Use Overmind TUI |
| `sigma orchestrate --tui tmux` | Use standard tmux (default) |
| `sigma orchestrate --agent=claude` | Use Claude Code agent |
| `sigma orchestrate --agent=opencode` | Use OpenCode agent |
| `sigma orchestrate --agent=manual` | Manual agent launch |
| `sigma orchestrate --attach` | Attach to running session |
| `sigma orchestrate --status` | Check orchestration status |
| `sigma orchestrate --kill` | Stop orchestration session |
| `sigma approve --stream=X` | Approve stream X's PRD completion |

### Slash Commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/orchestrate-start` | Launch orchestration session |
| `/orchestrate-status` | Check current status |
| `/orchestrate-attach` | Attach to running session |
| `/orchestrate-stop` | Gracefully stop orchestration |
| `/orchestrate` | Help and overview |

### TUI Options

| TUI | Install | Features |
|-----|---------|----------|
| **mprocs** (recommended) | `brew install mprocs` | Sidebar navigation, keyboard shortcuts, copy mode |
| **Overmind** | `brew install overmind` | Procfile-based, sidebar switching |
| **tmux** (default) | `brew install tmux` | Classic multiplexer, panes |

### Supporting Scripts

| Script | Description |
|--------|-------------|
| `scripts/orchestrator/spawn-mprocs.sh` | Create mprocs session (recommended) |
| `scripts/orchestrator/spawn-overmind.sh` | Create Overmind session |
| `scripts/orchestrator/spawn-streams.sh` | Create tmux session with panes |
| `scripts/orchestrator/orchestrator.py` | Main orchestrator logic |
| `scripts/orchestrator/stream-worker.py` | Stream worker implementation |
| `scripts/orchestrator/health-monitor.sh` | Crash detection and recovery |
| `scripts/orchestrator/merge-streams.sh` | Sequential merge strategy |
| `scripts/notify/voice.py` | ElevenLabs voice notifications |

### Configuration Files

| File | Purpose |
|------|---------|
| `.sigma/orchestration/streams.json` | Stream-to-PRD assignments |
| `.sigma/orchestration/state.json` | Current orchestration state |
| `.sigma/orchestration/progress.json` | PRD completion progress |
| `.sigma/orchestration/inbox/` | Inter-agent message queue |

**See:** [ORCHESTRATION.md](ORCHESTRATION.md) for full documentation.

---

## Ops Commands (`ops/`)

Operations and project management — **34 commands**.

### Tracking & Planning

| Command | Description |
|---------|-------------|
| `backlog-groom` | Create/update product backlog |
| `prd-orchestrate` | PRD swarm orchestration for parallel dev |
| `sprint-plan` | Plan and commit sprint |
| `daily-standup` | Daily standup with git awareness |
| `job-status` | Query PRD/sprint status |
| `status` | Project health overview |
| `continue` | Find and resume unfinished work |
| `sigma-continue` | Sigma-specific work continuation |

### Orchestration

| Command | Description |
|---------|-------------|
| `orchestrate` | Multi-agent orchestration setup |
| `sigma-orchestrate` | Sigma-specific orchestration |
| `stream` | Stream worker management |
| `sigma-stream` | Sigma stream operations |

### Quality Assurance

| Command | Description |
|---------|-------------|
| `qa-plan` | Generate QA test plan |
| `qa-run` | Execute QA tests |
| `qa-report` | Generate QA report |

### Code Reviews

| Command | Description |
|---------|-------------|
| `pr-review` | Code review with scoring |
| `test-review` | Test quality review |
| `release-review` | Final go/no-go decision |

### Maintenance

| Command | Description |
|---------|-------------|
| `dependency-update` | Update dependencies safely |
| `maintenance-plan` | Create maintenance schedule |
| `maid` | Repository maintenance wizard |
| `cleanup-repo` | Clean up repository files |
| `doctor-fix` | Auto-fix common installation issues |
| `lint-commands` | Lint Sigma command files |
| `docs-update` | Update documentation |
| `onboard` | Onboard new team member |
| `prompt-handoff` | Handoff context to another session |
| `repair-manifest` | Repair module manifests |
| `sync-workspace-commands` | Sync commands in workspace |
| `platform-sync` | Sync with platform changelogs |
| `system-health` | System health check |

### Retrofit

| Command | Description |
|---------|-------------|
| `retrofit-analyze` | Analyze existing codebase |
| `retrofit-enhance` | Enhance existing code |
| `retrofit-generate` | Generate from existing patterns |

---

## Deploy Commands (`deploy/`)

Deployment and shipping.

| Command | Description |
|---------|-------------|
| `ship-check` | Pre-deployment validation |
| `ship-stage` | Deploy to staging |
| `ship-prod` | Deploy to production |
| `client-handoff` | Client delivery documentation |

---

## Generator Commands (`generators/`)

Code and document generation.

| Command | Description |
|---------|-------------|
| `scaffold` | Generate project scaffolding |
| `new-feature` | Create new feature structure |
| `new-project` | Initialize new Sigma project |
| `new-command` | Create new Sigma command |
| `test-gen` | Generate tests from PRD |
| `api-docs-gen` | Generate API documentation |
| `wireframe` | Generate wireframe spec |
| `changelog` | Generate changelog |
| `contract` | Generate contract template |
| `nda` | Generate NDA template |
| `proposal` | Generate project proposal |
| `prototype-proposal` | Generate prototype proposal |
| `estimation-engine` | Estimate project scope |
| `cost-optimizer` | Optimize project costs |
| `notebooklm-format` | Format for NotebookLM |

---

## Marketing Commands (`marketing/`)

Go-to-market workflow — **25 commands**.

### Research & Strategy

| Command | Description |
|---------|-------------|
| `01-market-research` | Market research analysis |
| `02-customer-avatar` | Customer persona creation |
| `03-brand-voice` | Brand voice guidelines |
| `04-offer-architect` | Offer design |
| `05-sales-strategy` | Sales strategy |

### Content & Copy

| Command | Description |
|---------|-------------|
| `06-email-sequences` | Email sequence creation |
| `07-landing-page-copy` | Landing page copywriting |
| `08-ads-strategy` | Advertising strategy |
| `09-retargeting-strategy` | Retargeting strategy |
| `10-launch-playbook` | Launch planning |

### Partnerships & Content

| Command | Description |
|---------|-------------|
| `11-partnership-outreach` | Partnership outreach |
| `12-content-ideation` | Content ideation |
| `13-content-matrix` | Content matrix |
| `14-video-script` | Video script writing |
| `15-thumbnail-prompts` | Thumbnail prompt generation |
| `16-seo-content` | SEO content creation |
| `17-community-update` | Community update posts |

### Content Creation Studio (NEW)

| Command | Description |
|---------|-------------|
| `18-youtube-script-writer` | Long-form YouTube scripts |
| `19-short-form-scripts` | TikTok/Reels/Shorts scripts |
| `20-linkedin-writer` | LinkedIn post writer |
| `21-twitter-threads` | Twitter thread generator |
| `22-video-research` | Video topic research |
| `23-story-posts` | Instagram/Facebook story posts |

### AI Asset Prompts

| Command | Description |
|---------|-------------|
| `ai-video-prompt` | AI video generation prompts |
| `ai-image-prompt` | AI image generation prompts |

---

## Foundation Skills (`src/skills/`)

Skills provide reusable capabilities — **163 skills** (39 Foundation + 124 external). See [FOUNDATION-SKILLS.md](FOUNDATION-SKILLS.md) for complete reference.

### Sigma Core (6)

| Skill | Description |
|-------|-------------|
| `research` | MCP-orchestrated web research |
| `verification` | Step completion verification with scoring |
| `bdd-scenarios` | Given/When/Then scenario generation |
| `hormozi-frameworks` | Value equation and offer architecture |
| `output-generation` | Consistent document formatting |
| `frontend-design` | Distinctive UI creation |

### Design & Development (7)

| Skill | Description |
|-------|-------------|
| `ux-designer` | Wireframes, user flows, accessibility |
| `architecture-patterns` | Clean Architecture, Hexagonal, DDD |
| `api-design-principles` | REST and GraphQL best practices |
| `web-artifacts-builder` | Complex multi-component UIs |
| `react-performance` | React optimization patterns |
| `monorepo-architecture` | Monorepo setup and patterns |
| `superdesign-integration` | Superdesign AI integration |

### Quality & Process (6)

| Skill | Description |
|-------|-------------|
| `brainstorming` | Pre-implementation exploration |
| `systematic-debugging` | Structured root cause analysis |
| `quality-gates` | Git hooks, testing, CI/CD setup |
| `senior-qa` | Test strategies, automation, coverage |
| `senior-architect` | System design, tech decisions |
| `specialized-validation` | Domain-specific validation |

### Productivity (6)

| Skill | Description |
|-------|-------------|
| `prompt-engineering-patterns` | LLM prompt optimization |
| `xlsx` | Spreadsheet creation and analysis |
| `pptx` | Presentation creation and editing |
| `applying-brand-guidelines` | Consistent branding |
| `remembering-conversations` | Context recall |
| `memory-systems` | Persistent context systems |

### Platform Tools (5)

| Skill | Description |
|-------|-------------|
| `skill-creator` | Create Claude Code skills |
| `agent-development` | Create Claude Code agents |
| `opencode-agent-generator` | Create OpenCode agents |
| `creating-opencode-plugins` | Create OpenCode plugins |
| `agentic-coding` | AI-assisted coding patterns |

### Content & Marketing (4)

| Skill | Description |
|-------|-------------|
| `brand-voice` | Consistent brand voice |
| `content-atomizer` | Content repurposing |
| `direct-response-copy` | Conversion copywriting |
| `video-hooks` | Video script patterns |

### Document Generation (2)

| Skill | Description |
|-------|-------------|
| `docx-generation` | Create Word documents |
| `pdf-manipulation` | PDF generation and manipulation |

### Multi-Agent (3)

| Skill | Description |
|-------|-------------|
| `browser-verification` | Platform-adaptive browser testing |
| `fork-worker` | PRD implementation specialist |
| `orchestrator-admin` | Multi-agent coordination |

---

## Agent Personas (`src/agents/`)

Specialist agent personas that provide expert-level guidance — **12 agents**.

### Orchestration Layer

| Agent | Purpose |
|-------|---------|
| `orchestrator` | Multi-agent coordinator - assigns PRDs, reviews completions, merges results |
| `fork-worker` | PRD implementation specialist - executes assigned tasks with focused context |

### Core Development

| Agent | Purpose |
|-------|---------|
| `lead-architect` | System architecture, tech stack decisions, scalability planning |
| `frontend-engineer` | Production-grade UI development with high design quality |
| `qa-engineer` | Test strategies, automation, coverage analysis |

### Design & Product

| Agent | Purpose |
|-------|---------|
| `ux-director` | User experience design, accessibility, interaction patterns |
| `design-systems-architect` | Design tokens, component libraries, brand consistency |
| `product-owner` | PRD generation, feature prioritization, backlog management |
| `venture-studio-partner` | Product vision, market fit, value proposition |

### Specialized

| Agent | Purpose |
|-------|---------|
| `content-director` | Video/social content strategy and production |
| `sigmavue-quant-strategist` | Trading strategies and quantitative analysis |
| `sigmavue-market-data-engineer` | Market data integration and pipelines |

---

## Installation

### Interactive (Recommended)

```bash
npx sigma-protocol install
```

### Manual

See [README.md](../README.md) for manual installation instructions.

### Windows Support

Sigma Protocol includes Windows wrapper scripts for bash-based orchestration tools:

| Script | Purpose |
|--------|---------|
| `scripts/windows/sigma-ralph.cmd` | Run Ralph autonomous loop |
| `scripts/windows/spawn-streams.cmd` | Spawn parallel agent streams |
| `scripts/windows/health-monitor.cmd` | Monitor stream health |
| `scripts/windows/merge-streams.cmd` | Merge completed streams |

**Requirements (choose one):**
- **WSL (Recommended):** Full bash compatibility. Install with `wsl --install`
- **Git Bash:** Good compatibility. Download from https://git-scm.com/download/win
- **Node.js only:** Use `sigma orchestrate` CLI commands directly

See `scripts/windows/README.md` for detailed setup instructions.

---

## Recommended MCP Servers

These MCP servers enhance Sigma Protocol capabilities:

| MCP Server | Purpose | Used By |
|------------|---------|---------|
| **Taskmaster** | AI-powered PRD → JSON conversion | `step-5b`, `step-11a` |
| **Playwright** | Browser automation for testing | `@ui-healer` |
| **Exa** | Web search and research | Research skills |
| **Perplexity** | Knowledge queries | Research skills |
| **Ref** | Documentation search | All commands |

### Taskmaster MCP (Highly Recommended)

[Taskmaster MCP](https://github.com/eyaltoledano/claude-task-master) provides intelligent PRD parsing for the Ralph loop.

**Install for Claude Code:**
```bash
claude mcp add taskmaster-ai -- npx -y task-master-ai
```

**Install for Cursor:**
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

**Usage:**
```bash
@step-5b-prd-to-json --use-taskmaster=true
@step-11a-prd-to-json --use-taskmaster=true
```

---

## Related Documentation

- [GETTING-STARTED.md](GETTING-STARTED.md) - Quick start guide
- [NEW-PROJECT-QUICKSTART.md](NEW-PROJECT-QUICKSTART.md) - New project walkthrough
- [RETROFIT-GUIDE.md](RETROFIT-GUIDE.md) - Add Sigma to existing projects
- [ORCHESTRATION.md](ORCHESTRATION.md) - Multi-agent orchestration
- [WORKFLOW-OVERVIEW.md](WORKFLOW-OVERVIEW.md) - Complete workflow guide
- [FILE-PATH-REFERENCE.md](FILE-PATH-REFERENCE.md) - Output file locations
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Quick command reference
- [SCORING-SYSTEM.md](SCORING-SYSTEM.md) - Quality scoring details
- [RALPH-MODE.md](RALPH-MODE.md) - Ralph Loop documentation
- [TMUX-GUIDE.md](TMUX-GUIDE.md) - tmux tutorial for orchestration
- [ELEVENLABS-SETUP.md](ELEVENLABS-SETUP.md) - Voice notification setup
