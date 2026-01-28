# Sigma Protocol - AGENTS.md

> This file follows the ecosystem-wide AGENTS.md standard, compatible with:
> Claude Code, Factory Droid, Cursor, Aider, Gemini CLI, Jules, Codex, Zed, Phoenix

---

## Execution Philosophy: Swarm-First

**Never work solo. Always use agent swarms for PRD execution.**

### Swarm Sizing
| PRD Complexity | Agent Count | Parallel Streams |
|----------------|-------------|------------------|
| Simple (1-3 features) | 5 agents | 2-3 |
| Medium (4-7 features) | 10 agents | 4-5 |
| Complex (8+ features) | 15-20 agents | 6-8 |

### Research-First Planning

**CRITICAL: Before ANY planning session:**
1. Invoke `deep-research` skill automatically
2. Use Firecrawl for competitor/market research
3. Use EXA for technical patterns and code examples
4. Synthesize findings BEFORE brainstorming

### Automatic Skill Invocation

| Task Contains | Auto-Invoke Skill |
|---------------|-------------------|
| plan, design, ideate | `brainstorming` + `deep-research` |
| architecture, technical | `deep-research` first |
| component, UI, *.tsx | `frontend-design` |
| test, verify, done | `verification-before-completion` |
| docs, README, commit | `writing-clearly` |
| marketing, launch, SEO | `marketing-*` skills |
| 3+ independent tasks | `dispatching-parallel-agents` |

### Agent Skill Assignment

| Agent Role | Skills |
|------------|--------|
| **Planning Agents** | deep-research, brainstorming, executing-plans |
| **Frontend Agents** | frontend-design, react-performance |
| **Backend Agents** | verification-before-completion |
| **QA Agents** | verification-before-completion, tdd-skill-creation |
| **Documentation Agents** | writing-clearly |
| **Marketing Agents** | marketing-copywriting, marketing-psychology |

---

## MCP Tools Required

### Research Tools (Required for Planning)
- **Firecrawl**: Web scraping, site crawling, content extraction
- **EXA**: Semantic search, code context, deep research
- **Ref**: Documentation search, URL reading
- **Context7**: Library-specific documentation

### Task Management
- **Task Master AI**: PRD parsing, task management

---

## Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Run development server
npm run dev
```

---

## Architecture Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

### Core Workflow
```
Step 0: Environment Setup
Step 1: Ideation → MASTER_PRD.md
Step 1.5: Offer Architecture (if monetized)
Step 2-13: Full development lifecycle
```

### Key Technologies
- TypeScript / JavaScript
- Markdown-based configuration
- Multi-platform support (Claude Code, OpenCode, Cursor, Factory Droid)

---

## Available Commands

### Core Steps
| Command | Description |
|---------|-------------|
| `step-1-ideation` | Product Ideation with Hormozi Value Equation |
| `step-2-architecture` | System Architecture Design |
| `step-5-wireframe-prototypes` | Wireframe Prototypes |
| `step-11-prd-generation` | PRD Generation |
| `implement-prd` | Implement a PRD feature |

### Audit Commands
| Command | Description |
|---------|-------------|
| `security-audit` | Security vulnerability assessment |
| `gap-analysis` | PRD coverage analysis |
| `performance-check` | Performance analysis |

### Ops Commands
| Command | Description |
|---------|-------------|
| `pr-review` | Pull request review |
| `sprint-plan` | Sprint planning |

---

## Conventions & Patterns

### File Organization
```
.factory/
├── skills/           # Reusable capabilities
├── droids/           # Custom subagents
├── commands/         # Slash commands
└── .droid.yaml       # Configuration
```

### Skill Format
```yaml
---
name: skill-name
description: "What this skill does"
version: "1.0.0"
triggers:
  - keyword1
  - keyword2
---

# Skill Content
```

---

## Security

- Never commit `.env` files or secrets
- Use environment variables for sensitive data
- Follow OWASP top 10 guidelines
- Run `security-audit` before deployments

---

## Git Workflows

- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `docs:`
- Squash merge to main
- Run tests before pushing

---

## Gotchas

1. **Skill triggers are case-insensitive** - Keywords match regardless of case
2. **Commands support $ARGUMENTS** - Use for dynamic input
3. **Droids need tools field** - Specify allowed tools explicitly
4. **AGENTS.md overrides CLAUDE.md** - Factory Droid prioritizes AGENTS.md

---

## Related Documentation

- [Sigma Protocol Docs](./docs/)
- [Factory Droid Integration](./docs/FACTORY-DROID-INTEGRATION.md)
- [Platform Reference](./docs/PLATFORMS.md)
