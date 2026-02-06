# Skill-Agent Registry

**Version:** 1.0.0
**Last Updated:** 2026-02-05
**Purpose:** Master mapping of every skill to its agent category and bound agent(s).

---

## Overview

This registry maps skills to agent categories. Each skill is assigned a primary agent and optional secondary agents. Skills may appear in multiple categories when shared across domains.

### Architecture Note

Skills and agents exist in two tiers:

| Tier | Skills Location | Agents Location | Purpose |
|------|----------------|-----------------|---------|
| **Source** | `src/skills/` | `src/agents/` | Canonical definitions distributed to projects |
| **Foundation** | `.claude/skills/` | `.claude/agents/` | Runtime skills/agents available via platform tools |

This registry primarily maps **source skills** from `src/skills/` (50 files). A small number of foundation skills (e.g., `defense-in-depth`, `better-auth-best-practices`) are included when they are bound to agents.

When Step 12/13 generates project-specific agents, they are created in `.claude/agents/` with `sigma-*` prefixed names (e.g., `sigma-planner.md`, `sigma-security-lead.md`).

---

## Registry Table

| # | Skill | Category | Primary Agent | Secondary Agent(s) |
|---|-------|----------|---------------|---------------------|
| 1 | `agent-browser-validation` | UX/Design | ux-director | frontend-engineer, qa-engineer |
| 2 | `agent-development` | Developer Tools | orchestrator | -- |
| 3 | `agentic-coding` | Implementation | fork-worker | orchestrator |
| 4 | `api-design-principles` | Architecture | lead-architect | -- |
| 5 | `applying-brand-guidelines` | Design Systems | design-systems-architect | content-director |
| 6 | `architecture-patterns` | Architecture | lead-architect | -- |
| 7 | `bdd-scenarios` | QA & Testing | qa-engineer | product-owner |
| 8 | `brainstorming` | Product & Strategy | product-owner | venture-studio-partner |
| 9 | `brand-voice` | Content & Marketing | content-director | -- |
| 10 | `browser-verification` | UX/Design | ux-director | frontend-engineer, qa-engineer |
| 11 | `content-atomizer` | Content & Marketing | content-director | -- |
| 12 | `creating-opencode-plugins` | Developer Tools | orchestrator | -- |
| 13 | `direct-response-copy` | Content & Marketing | content-director | -- |
| 14 | `docx-generation` | Documentation | content-director | -- |
| 15 | `fork-worker` | Implementation | fork-worker | -- |
| 16 | `frontend-design` | Frontend | frontend-engineer | design-systems-architect |
| 17 | `hormozi-frameworks` | Product & Strategy | venture-studio-partner | product-owner |
| 18 | `memory-systems` | Orchestration | orchestrator | -- |
| 19 | `monorepo-architecture` | Architecture | lead-architect | -- |
| 20 | `opencode-agent-generator` | Developer Tools | orchestrator | -- |
| 21 | `orchestrator-admin` | Orchestration | orchestrator | -- |
| 22 | `output-generation` | Documentation | content-director | fork-worker |
| 23 | `pdf-manipulation` | Documentation | content-director | -- |
| 24 | `pptx` | Documentation | content-director | -- |
| 25 | `prompt-engineering-patterns` | Developer Tools | orchestrator | -- |
| 26 | `quality-gates` | QA & Testing | qa-engineer | orchestrator |
| 27 | `ralph-loop` | Implementation | fork-worker | orchestrator |
| 28 | `ralph-tail` | Implementation | fork-worker | orchestrator |
| 29 | `react-performance` | Frontend | frontend-engineer | qa-engineer |
| 30 | `remembering-conversations` | Orchestration | orchestrator | -- |
| 31 | `research` | Product & Strategy | venture-studio-partner | lead-architect |
| 32 | `senior-architect` | Architecture | lead-architect | fork-worker |
| 33 | `senior-qa` | QA & Testing | qa-engineer | -- |
| 34 | `sigma-ralph` | Implementation | fork-worker | orchestrator |
| 35 | `skill-creator` | Developer Tools | orchestrator | -- |
| 36 | `specialized-validation` | QA & Testing | qa-engineer | -- |
| 37 | `superdesign-integration` | Design Systems | design-systems-architect | frontend-engineer |
| 38 | `systematic-debugging` | Debugging | qa-engineer | fork-worker |
| 39 | `ux-designer` | UX/Design | ux-director | -- |
| 40 | `verification` | QA & Testing | qa-engineer | fork-worker |
| 41 | `video-hooks` | Content & Marketing | content-director | -- |
| 42 | `web-artifacts-builder` | Frontend | frontend-engineer | -- |
| 43 | `xlsx` | Documentation | content-director | -- |
| 44 | `owasp-web-security` | Security | security-lead | security-web-api, security-mobile |
| 45 | `owasp-api-security` | Security | security-web-api | security-lead |
| 46 | `owasp-llm-security` | Security | security-ai-safety | -- |
| 47 | `defense-in-depth` | Security | security-lead | security-web-api |
| 48 | `security-code-review` | Security | security-lead | security-compliance |
| 49 | `dependency-security` | Security | security-infra | security-ai-safety |
| 50 | `secrets-detection` | Security | security-infra | -- |
| 51 | `saas-security-patterns` | Security | security-compliance | -- |
| 52 | `mobile-app-security` | Security | security-mobile | -- |
| 53 | `better-auth-best-practices` | Security | security-web-api | -- |
| 54 | `create-auth-skill` | Security | security-web-api | -- |

---

## By Category

### Architecture (agent: lead-architect)

| Skill | Description |
|-------|-------------|
| `architecture-patterns` | System architecture pattern selection |
| `monorepo-architecture` | Monorepo structure and tooling |
| `senior-architect` | Principal architect decision-making |
| `api-design-principles` | REST/GraphQL/tRPC API design |

### Frontend (agent: frontend-engineer)

| Skill | Description |
|-------|-------------|
| `frontend-design` | Distinctive UI aesthetics, CVA patterns |
| `react-performance` | Vercel's 57 optimization rules |
| `web-artifacts-builder` | Web artifact and component generation |

### UX/Design (agent: ux-director)

| Skill | Description |
|-------|-------------|
| `ux-designer` | User experience design patterns |
| `browser-verification` | Platform-adaptive browser testing |
| `agent-browser-validation` | Agent-driven browser validation |

### Design Systems (agent: design-systems-architect)

| Skill | Description |
|-------|-------------|
| `applying-brand-guidelines` | Brand guideline application |
| `superdesign-integration` | SuperDesign tool integration |
| `frontend-design` | (shared) Design token patterns |

### QA & Testing (agent: qa-engineer)

| Skill | Description |
|-------|-------------|
| `senior-qa` | Senior QA methodology |
| `quality-gates` | Quality gate enforcement |
| `verification` | Verification-before-completion |
| `bdd-scenarios` | BDD scenario writing |
| `specialized-validation` | Specialized validation rules |
| `systematic-debugging` | Systematic debugging methodology |

### Security (agents: security-lead, security-web-api, security-infra, security-compliance, security-mobile, security-ai-safety)

| Skill | Primary Agent | Description |
|-------|---------------|-------------|
| `owasp-web-security` | security-lead | OWASP Top 10 web vulnerability detection |
| `owasp-api-security` | security-web-api | OWASP API Security Top 10 |
| `owasp-llm-security` | security-ai-safety | OWASP LLM Top 10 risks |
| `defense-in-depth` | security-lead | Layered security controls |
| `security-code-review` | security-lead | Security-focused code review |
| `dependency-security` | security-infra | SCA, SBOM, supply chain |
| `secrets-detection` | security-infra | Pre-commit secrets scanning |
| `saas-security-patterns` | security-compliance | SaaS security and compliance |
| `mobile-app-security` | security-mobile | OWASP Mobile Top 10 |
| `better-auth-best-practices` | security-web-api | Authentication implementation |
| `create-auth-skill` | security-web-api | Auth system scaffolding |

### Product & Strategy (agents: venture-studio-partner, product-owner)

| Skill | Description |
|-------|-------------|
| `hormozi-frameworks` | Hormozi Value Equation frameworks |
| `brainstorming` | One-question-at-a-time exploration |
| `research` | Deep research orchestration |

### Implementation (agent: fork-worker)

| Skill | Description |
|-------|-------------|
| `fork-worker` | Fork worker iteration pattern |
| `agentic-coding` | Agentic coding practices |
| `ralph-loop` | Ralph autonomous implementation loop |
| `ralph-tail` | Ralph tail/monitoring |
| `sigma-ralph` | Sigma Ralph orchestration |

### Orchestration (agent: orchestrator)

| Skill | Description |
|-------|-------------|
| `orchestrator-admin` | Orchestrator workflow management |
| `memory-systems` | Memory and context management |
| `remembering-conversations` | Conversation recall patterns |

### Content & Marketing (agent: content-director)

| Skill | Description |
|-------|-------------|
| `video-hooks` | Viral video hook writing |
| `content-atomizer` | Content atomization strategy |
| `direct-response-copy` | Direct response copywriting |
| `brand-voice` | Brand voice consistency |
| `docx-generation` | Document generation |
| `pdf-manipulation` | PDF creation/manipulation |
| `pptx` | Presentation generation |
| `xlsx` | Spreadsheet generation |
| `output-generation` | General output generation |

### Developer Tools (agent: orchestrator or unbound)

| Skill | Description |
|-------|-------------|
| `agent-development` | Agent development patterns |
| `creating-opencode-plugins` | OpenCode plugin creation |
| `opencode-agent-generator` | OpenCode agent generation |
| `prompt-engineering-patterns` | Prompt engineering patterns |
| `skill-creator` | Skill creation methodology |

### Documentation (shared across agents)

| Skill | Primary Agent | Description |
|-------|---------------|-------------|
| `docx-generation` | content-director | Word document generation |
| `pdf-manipulation` | content-director | PDF creation/manipulation |
| `pptx` | content-director | Presentation generation |
| `xlsx` | content-director | Spreadsheet generation |
| `output-generation` | content-director | General output formatting |

### Debugging (agent: qa-engineer extended)

| Skill | Description |
|-------|-------------|
| `systematic-debugging` | Systematic debugging methodology |

---

## Agent Skill Summary

| Agent | Skill Count | Skills |
|-------|-------------|--------|
| **lead-architect** | 4 | architecture-patterns, monorepo-architecture, senior-architect, api-design-principles |
| **ux-director** | 3 | ux-designer, browser-verification, agent-browser-validation |
| **design-systems-architect** | 3 | applying-brand-guidelines, superdesign-integration, frontend-design (shared) |
| **qa-engineer** | 6 | senior-qa, quality-gates, verification, bdd-scenarios, specialized-validation, systematic-debugging |
| **product-owner** | 2 | hormozi-frameworks, brainstorming |
| **venture-studio-partner** | 2 | hormozi-frameworks, research |
| **fork-worker** | 5 | fork-worker, agentic-coding, ralph-loop, ralph-tail, sigma-ralph |
| **orchestrator** | 7 | orchestrator-admin, memory-systems, remembering-conversations, agent-development, creating-opencode-plugins, opencode-agent-generator, skill-creator |
| **frontend-engineer** | 3 | frontend-design, react-performance, web-artifacts-builder |
| **content-director** | 9 | video-hooks, content-atomizer, direct-response-copy, brand-voice, docx-generation, pdf-manipulation, pptx, xlsx, output-generation |
| **security-lead** | 4 | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review |
| **security-web-api** | 5 | owasp-web-security, owasp-api-security, defense-in-depth, better-auth-best-practices, create-auth-skill |
| **security-infra** | 2 | dependency-security, secrets-detection |
| **security-compliance** | 2 | saas-security-patterns, security-code-review |
| **security-mobile** | 2 | mobile-app-security, owasp-web-security |
| **security-ai-safety** | 2 | owasp-llm-security, dependency-security |
| **Total** | 54 | All skills mapped (includes shared skills across agents) |

---

## Unbound Skills

These skills are available globally or bound only loosely:

| Skill | Notes |
|-------|-------|
| `prompt-engineering-patterns` | Available to all agents, primary: orchestrator |
| `executing-plans` | Referenced in CLAUDE.md, maps to fork-worker workflows |

---

## Cross-References

Skills that appear in multiple agent bindings:

| Skill | Agents |
|-------|--------|
| `frontend-design` | frontend-engineer (primary), design-systems-architect |
| `hormozi-frameworks` | venture-studio-partner (primary), product-owner |
| `browser-verification` | ux-director (primary), frontend-engineer, qa-engineer |
| `agent-browser-validation` | ux-director (primary), frontend-engineer, qa-engineer |
| `verification` | qa-engineer (primary), fork-worker |
| `quality-gates` | qa-engineer (primary), orchestrator |
| `systematic-debugging` | qa-engineer (primary), fork-worker |
| `ralph-loop` | fork-worker (primary), orchestrator |
| `ralph-tail` | fork-worker (primary), orchestrator |
| `sigma-ralph` | fork-worker (primary), orchestrator |
| `senior-architect` | lead-architect (primary), fork-worker |
| `bdd-scenarios` | qa-engineer (primary), product-owner |
