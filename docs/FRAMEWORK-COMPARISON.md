# Framework Comparison Guide

> A comprehensive comparison of Sigma Protocol vs. other AI-assisted development frameworks.
> **For content creators, evaluators, and developers choosing their workflow.**

---

## Table of Contents

- [The Competitive Landscape](#the-competitive-landscape)
- [Framework Breakdowns](#framework-breakdowns)
  - [Sigma Protocol](#sigma-protocol)
  - [GitHub Spec Kit](#github-spec-kit)
  - [AWS Kiro](#aws-kiro)
  - [BMAD Method](#bmad-method)
  - [Aider](#aider)
  - [Repomix](#repomix)
- [Head-to-Head Comparison](#head-to-head-comparison)
- [Where Sigma Wins](#where-sigma-wins)
- [Where Sigma Falls Short](#where-sigma-falls-short)
- [Can You Use Them Together?](#can-you-use-them-together)
- [For Content Creators](#for-content-creators)

---

## The Competitive Landscape

The AI-assisted development space has exploded with tools and frameworks. They generally fall into these categories:

| Category | Examples | Philosophy |
|----------|----------|------------|
| **Vibe Coding Tools** | Bolt, Lovable, v0 | Prompt → App instantly |
| **AI IDEs** | Cursor, Windsurf, Kiro | AI deeply integrated into editor |
| **CLI Agents** | Claude Code, Aider, Gemini CLI | Terminal-based pair programming |
| **Frameworks/Methodologies** | **Sigma Protocol**, BMAD, Spec Kit | Structured workflows for AI development |
| **Utilities** | Repomix, Codebase context tools | Supporting tools, not full workflows |

**Sigma Protocol sits in the Framework category** — it's not just a tool, it's a complete methodology with tooling to support it.

---

## Framework Breakdowns

### Sigma Protocol

**What it is:** A 13-step AI-native development methodology with CLI tooling, multi-agent orchestration, and platform-agnostic design.

**Core Philosophy:** "Documentation precedes code. Verification is non-negotiable. Parallelism is the multiplier."

**Key Features:**
- 13-step structured workflow (Ideation → Production)
- Thread-Based Engineering (P-Thread, F-Thread, B-Thread, etc.)
- Ralph Loop for autonomous agent work with verification
- Multi-agent orchestration (tmux, Overmind, mprocs)
- Platform agnostic (Cursor, Claude Code, OpenCode)
- Interactive CLI (`sigma`)
- 70+ commands across audit, ops, dev, marketing categories
- HITL (Human-in-the-Loop) checkpoints

**Target Users:**
- Solo founders building production products
- Agencies and consultants
- Teams adopting AI-assisted development
- Senior engineers scaling their output

**Availability:** Free, open-source (MIT License)

**Website:** [GitHub Repository](https://github.com/your-repo/sigma-protocol)

---

### GitHub Spec Kit

**What it is:** An open-source toolkit from GitHub for spec-driven development (SDD). Scaffolds specs, plans, and tasks as repo artifacts.

**Core Philosophy:** "Specs before code" — Generate structured documents that any AI can implement.

**Key Features:**
- Scaffolds specs, plans, and tasks in your repository
- Works with any AI environment (Copilot, Claude, Cursor)
- CLI-based workflow (`spec-kit` command)
- No lock-in to specific tools
- Integrates with VS Code and GitHub Copilot

**Target Users:**
- Teams wanting lightweight structure
- GitHub ecosystem users
- Developers who don't want tool lock-in

**Availability:** Free, open-source

**Limitations:**
- Not a coding agent — just document scaffolding
- No multi-agent orchestration
- No verification/quality gates built-in
- Manual execution of specs

**Sigma Comparison:** Spec Kit generates documents; Sigma generates documents AND executes them with verification. Spec Kit is a starting point; Sigma is the full lifecycle.

---

### AWS Kiro

**What it is:** Amazon's agentic IDE that implements spec-driven development with built-in AI agents. A full IDE, not just a methodology.

**Core Philosophy:** "From prototype to production with structure" — Guide users through requirements → design → tasks → code automatically.

**Key Features:**
- Full IDE experience (not a plugin)
- Automatic spec generation from natural language
- Agent hooks for testing and documentation
- Built-in audit trails
- Requirements traceability
- AWS service integration

**Target Users:**
- Enterprise teams
- AWS-heavy organizations
- Teams wanting all-in-one solution

**Availability:** Paid (part of AWS ecosystem)

**Limitations:**
- Closed ecosystem (proprietary IDE)
- AWS-centric
- Not open source
- No external tool integration
- Learning a new IDE

**Sigma Comparison:** Kiro is a closed IDE; Sigma is an open methodology that works everywhere. Kiro is opinionated about environment; Sigma is environment-agnostic.

---

### BMAD Method

**What it is:** "Breakthrough Method for Agile AI-Driven Development" — A standardized agile framework based on multi-agent systems.

**Core Philosophy:** Combine spec-driven development with human-in-the-loop governance for predictable, maintainable output.

**Key Features:**
- Multi-agent system architecture
- Spec-driven development integration
- Human-in-the-loop checkpoints
- Agent orchestration
- Configuration system
- Document discovery protocol
- Manifest system for tracking

**Target Users:**
- Teams building complex systems
- Organizations wanting standardized AI workflows
- Developers familiar with agile methodologies

**Availability:** Free, open-source

**Limitations:**
- Heavy learning curve
- Less focus on specific workflow steps
- No dedicated CLI experience
- Documentation can be dense

**Sigma Comparison:** BMAD focuses primarily on agent orchestration. Sigma adds a structured 13-step methodology, the Ralph Loop pattern, and an interactive CLI experience. BMAD and Sigma share similar philosophies but different emphasis.

---

### Aider

**What it is:** A CLI-based AI pair programmer that works directly in your terminal with git integration.

**Core Philosophy:** "AI pair programming in your terminal" — Conversational coding with automatic commits.

**Key Features:**
- Terminal-based chat interface
- Automatic git commits
- Works with multiple AI models
- Context-aware of your codebase
- Supports multiple files simultaneously
- Voice mode available

**Target Users:**
- Developers who prefer terminal workflows
- Quick iteration and prototyping
- Solo developers

**Availability:** Free, open-source

**Limitations:**
- No structured methodology
- No multi-agent orchestration
- No verification/quality gates
- Reactive (responds to prompts) not proactive
- No PRD or spec generation

**Sigma Comparison:** Aider is a smart pair programmer; Sigma is a full development operating system. Aider is tactical (write this code); Sigma is strategic (build this product). You could use Aider as an execution tool within Sigma's methodology.

---

### Repomix

**What it is:** A utility that packs your entire codebase into a single AI-friendly file for context sharing.

**Core Philosophy:** "Give AI the full picture" — Make it easy to share your entire codebase with any AI.

**Key Features:**
- Packs codebase into XML, Markdown, or plain text
- Respects .gitignore
- Token counting for LLM limits
- Security scanning (Secretlint)
- File filtering and exclusion
- Code compression with Tree-sitter

**Target Users:**
- Anyone needing to share codebase context with AI
- Code review workflows
- Onboarding AI to existing projects

**Availability:** Free, open-source

**Limitations:**
- Utility only — not a development workflow
- No execution capabilities
- No multi-agent support
- Static context (point-in-time snapshot)

**Sigma Comparison:** Repomix is a supporting utility, not a competitor. You could use Repomix to prepare context for Sigma's retrofit workflow. They're complementary, not alternatives.

---

## Head-to-Head Comparison

### Feature Matrix

| Feature | Sigma Protocol | GitHub Spec Kit | AWS Kiro | BMAD Method | Aider |
|---------|----------------|-----------------|----------|-------------|-------|
| **Type** | Framework + CLI | Toolkit | IDE | Framework | CLI Tool |
| **Approach** | 13-step methodology | Spec scaffolding | Spec-driven IDE | Multi-agent workflow | Pair programming |
| **Multi-Agent** | Yes (P-Thread) | No | No | Yes | No |
| **IDE Agnostic** | Yes | Yes | No (own IDE) | Yes | Yes |
| **PRD-First** | Yes | Yes | Yes | Yes | No |
| **Verification Loop** | Ralph Loop | Manual | Hooks | Checklists | Manual |
| **Learning Curve** | High | Low | Medium | High | Low |
| **Open Source** | Yes | Yes | No | Yes | Yes |
| **Production Focus** | Yes | Partial | Yes | Yes | No |
| **CLI Available** | Yes (`sigma`) | Yes | No | Yes | Yes (`aider`) |
| **Orchestration** | tmux/mprocs/overmind | None | None | Built-in | None |
| **Quality Gates** | HITL checkpoints | Manual | Automated hooks | Manual | None |
| **Thread Types** | 6+ (Base, P, C, F, B, L) | N/A | N/A | Similar concepts | N/A |
| **Interactive Tutorial** | Yes | No | Yes | No | No |

### Philosophy Comparison

| Aspect | Sigma Protocol | GitHub Spec Kit | AWS Kiro | BMAD Method | Aider |
|--------|----------------|-----------------|----------|-------------|-------|
| **Planning vs. Execution** | Both | Planning only | Both | Both | Execution only |
| **Human Role** | Architect + Reviewer | Author | Reviewer | Orchestrator | Collaborator |
| **AI Role** | Executor + Verifier | Implementer | Full lifecycle | Multiple agents | Pair programmer |
| **Parallelism** | First-class | None | None | Supported | None |
| **Verification** | Built-in (Ralph) | Manual | Hooks | Manual | Manual |

---

## Where Sigma Wins

### 1. End-to-End Lifecycle

Sigma covers the entire product development journey:

```
Ideation → Architecture → UX → Flow → Wireframes → Design System → 
Interface States → Tech Spec → Landing Page → Feature Breakdown → 
PRD Generation → Context Engine → Skillpack
```

Other frameworks focus on specific phases. Spec Kit only generates documents. Aider only executes code. Kiro focuses on the middle (specs → code). **Sigma is the only framework that starts at "I have an idea" and ends at "I shipped to production."**

### 2. Multi-Agent Orchestration

Sigma is the first framework to operationalize parallel AI agents with:

- **P-Thread support** — Multiple agents working simultaneously
- **Three TUI modes** — tmux (raw), Overmind (sidebar), mprocs (process list)
- **Agent selection** — Claude Code, OpenCode, or manual
- **Git worktrees** — Each agent gets isolated environment
- **mcp_agent_mail** — Inter-agent communication

No other framework provides this level of orchestration tooling out of the box.

### 3. Thread-Based Engineering Integration

Sigma is the first framework to implement IndyDevDan's Thread-Based Engineering concepts:

| Thread Type | What It Is | Sigma Implementation |
|-------------|------------|----------------------|
| Base Thread | Single linear workflow | Standard step execution |
| P-Thread | Parallel agents | `sigma orchestrate` |
| C-Thread | Chained phases | 13-step workflow |
| F-Thread | Fusion (same prompt, multiple agents) | `sigma f-thread` |
| B-Thread | Meta (agent prompts agents) | Ralph Loop |
| L-Thread | Long-duration autonomous | Extended orchestration |

### 4. Platform Agnosticism

Sigma works with:

- **Cursor** — Full rules and skills support
- **Claude Code** — Native slash commands and CLAUDE.md
- **OpenCode** — Config and commands support

You're not locked into an ecosystem. Switch between tools freely.

### 5. Ralph Loop

The Ralph Loop pattern solves the "AI says it's done but nothing works" problem:

1. Machine-readable backlogs (JSON, not prose)
2. Atomic stories that fit in context windows
3. Explicit acceptance criteria
4. Fresh context per story
5. Verification before marking complete

This is unique to Sigma and proven in production use.

### 6. Interactive CLI

The `sigma` command provides a full TUI experience:

```
┌─────────────────────────────────────────────────────────────────┐
│   ███████╗██╗ ██████╗ ███╗   ███╗ █████╗                        │
│   ██╔════╝██║██╔════╝ ████╗ ████║██╔══██╗                       │
│   ███████╗██║██║  ███╗██╔████╔██║███████║                       │
│   ╚════██║██║██║   ██║██║╚██╔╝██║██╔══██║                       │
│   ███████║██║╚██████╔╝██║ ╚═╝ ██║██║  ██║                       │
│   ╚══════╝╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═════╝  PROTOCOL        │
└─────────────────────────────────────────────────────────────────┘
```

- Interactive menus
- Tutorial system
- Health checks
- Command search
- Configuration wizard

### 7. Retrofit Support

Unlike frameworks that assume greenfield projects, Sigma can be added to existing codebases:

```bash
sigma retrofit
```

This makes adoption practical for real-world teams with existing products.

---

## Where Sigma Falls Short

We believe in honest assessment. Here's where Sigma isn't the best choice:

### 1. Learning Curve

Sigma has:
- 13 steps to understand
- 6+ thread types
- 70+ commands
- Multiple orchestration modes
- Platform-specific configurations

**For someone just wanting to "vibe code," this is overwhelming.** Aider or Spec Kit are much simpler to start with.

### 2. No Built-in IDE

Unlike Kiro, Sigma requires external tools:
- You need Cursor, Claude Code, or OpenCode installed separately
- Configuration happens in multiple places
- No unified visual interface

**If you want everything in one place, Kiro might be better.**

### 3. Less Enterprise Polish

AWS Kiro offers enterprise features we don't have:
- SSO integration
- Audit logs
- Compliance reporting
- Support contracts
- Service level agreements

**For enterprise compliance requirements, Kiro has an advantage.**

### 4. Documentation Volume

The depth of Sigma can be overwhelming:
- Multiple README files
- Step-by-step guides
- Command references
- Workflow documentation

**Some users prefer discovering features organically rather than reading manuals.**

### 5. No Web UI

Sigma is purely CLI/terminal based:
- No visual dashboard
- No drag-and-drop workflow builder
- No web-based monitoring

**Visual thinkers might prefer tools with GUIs.**

### 6. Requires Modern AI Models

Sigma assumes competent AI assistants:
- Works best with Claude Sonnet/Opus, GPT-4, etc.
- Weaker models produce worse results
- No graceful degradation for limited models

**If you're using older or cheaper models, results may vary.**

---

## Can You Use Them Together?

Yes! These tools aren't mutually exclusive:

| Combination | How It Works |
|-------------|--------------|
| **Sigma + Aider** | Use Aider as execution tool within Sigma's methodology |
| **Sigma + Repomix** | Use Repomix to prepare context for Sigma's retrofit |
| **Sigma + Spec Kit** | Use Spec Kit for initial scaffolding, Sigma for execution |
| **Sigma concepts + Kiro** | Apply Sigma's 13-step thinking within Kiro's IDE |
| **BMAD + Sigma** | Use BMAD's agent architecture with Sigma's workflow |

The frameworks represent different philosophies but can complement each other.

---

## For Content Creators

This section is specifically for YouTubers, TikTokers, X/Twitter creators, and bloggers covering AI development tools.

### One-Liner Comparisons

Use these for quick explanations:

- **Sigma vs Spec Kit:** "Spec Kit scaffolds documents. Sigma executes them and orchestrates multiple agents."
- **Sigma vs Kiro:** "Kiro is a closed IDE. Sigma is an open methodology that works everywhere."
- **Sigma vs BMAD:** "BMAD focuses on agent orchestration. Sigma adds 13-step methodology + Ralph Loop."
- **Sigma vs Aider:** "Aider is a smart pair programmer. Sigma is a full development operating system."
- **Sigma vs Vibe Coding:** "Vibe coding is fast and chaotic. Sigma is structured and scalable."

### Key Stats to Cite

- **13** structured steps
- **6+** thread types (Base, P, C, F, B, L)
- **3** orchestration TUI modes (tmux, Overmind, mprocs)
- **70+** commands across categories
- **3** platform support (Cursor, Claude Code, OpenCode)
- **Open source** (MIT License)
- **Interactive CLI** with tutorial system

### Video Talking Points

1. **"What vibe coding misses"** — Why structure matters as projects grow
2. **"Why parallel agents beat single agents"** — P-Thread and orchestration explanation
3. **"The Ralph Loop pattern explained"** — How to verify AI actually finished
4. **"Thread-Based Engineering for beginners"** — IndyDevDan's framework simplified
5. **"From idea to production in 13 steps"** — Full workflow walkthrough
6. **"Sigma vs [X] — Which should you use?"** — Comparison deep dive
7. **"Adding Sigma to an existing project"** — Retrofit demonstration

### Visual Comparison Chart

```
                    STRUCTURE
                        ↑
                        │
           Sigma ●      │      ● Kiro
           Protocol     │
                        │
                  BMAD ●│
                        │
    ← OPEN ─────────────┼─────────────── CLOSED →
                        │
                        │
         Spec Kit ●     │
                        │
           Aider ●      │
                        │
                        ↓
                    FLEXIBILITY
```

### Suggested Demo Flow

For a video demonstrating Sigma:

1. **Start:** Show `sigma` command launching interactive menu
2. **Tutorial:** Walk through one tutorial section
3. **New Project:** Run `sigma new` wizard
4. **Step Execution:** Show one step (e.g., `@step-1-ideation`)
5. **Orchestration:** Launch `sigma orchestrate` with mprocs
6. **Compare:** Show equivalent in another tool (Aider, Spec Kit)
7. **Conclusion:** When to use each

### Hashtags

```
#SigmaProtocol #AIDevelopment #VibeCoding #ClaudeCode #Cursor 
#DevTools #AIWorkflow #ThreadBasedEngineering #RalphLoop 
#MultiAgentAI #OpenSource #DeveloperProductivity
```

---

## Summary

| If you want... | Use... |
|----------------|--------|
| Quick start, minimal learning | Aider |
| Document scaffolding | Spec Kit |
| All-in-one IDE | AWS Kiro |
| Multi-agent framework | BMAD Method |
| **Complete methodology + tooling + orchestration** | **Sigma Protocol** |

Sigma Protocol is the most comprehensive option for developers who are serious about AI-assisted development and want to scale their output while maintaining quality.

---

## Further Reading

- [What is Sigma Protocol?](WHAT-IS-SIGMA.md) — Detailed overview
- [Thread-Based Engineering](THREAD-BASED-ENGINEERING.md) — The framework explained
- [Getting Started](GETTING-STARTED.md) — Installation and setup
- [Quick Reference](QUICK-REFERENCE.md) — Command cheatsheet
- [Orchestration Guide](ORCHESTRATION.md) — Multi-agent setup


