# Foundation Skills Reference

**Version:** 1.0.0-alpha.1
**Last Updated:** 2026-02-04

Sigma Protocol includes **180+ skills total** (Foundation + External; counts vary by platform) that provide universal AI capabilities across all supported platforms.

> **Note:** In addition to Foundation Skills, Sigma Protocol includes **120+ External Skills** from the skills.sh ecosystem. See [EXTERNAL-SKILLS.md](./EXTERNAL-SKILLS.md) for the complete external skills reference.

---

## Overview

Foundation Skills are installed at **Step 0** (Environment Setup) and provide capabilities that enhance every step of the Sigma workflow. They are **universal** and **project-agnostic**.

**External Skills** (Tier 2) provide domain-specific expertise for security, mobile development, 3D graphics, marketing, and more.

**Step 13** (Skillpack Generator) creates **project-specific overlays** that build on these skills with your project's:

- Design system and tokens
- Stack choices and patterns
- PRD context and requirements
- Custom conventions

---

## Platform Installation

### Cursor

Skills are installed as `.mdc` rules with glob/keyword auto-triggers:

```bash
# Location
.cursor/rules/sss-*.mdc

# Install command
npx sigma-protocol install-skills --platform cursor
```

### Claude Code

Skills are installed as `SKILL.md` directories:

```bash
# Location
.claude/skills/{skill-name}/SKILL.md

# Install command
npx sigma-protocol install-skills --platform claude-code
```

### OpenCode

Skills are installed as `SKILL.md` directories:

```bash
# Location
.opencode/skill/{skill-name}/SKILL.md

# Install command
npx sigma-protocol install-skills --platform opencode
```

### Codex

Skills are installed as `SKILL.md` directories:

```bash
# Location
.codex/skills/{skill-name}/SKILL.md
# Legacy fallback
.agents/skills/{skill-name}/SKILL.md

# Install command
npx sigma-protocol install-skills --platform codex
```

### Factory Droid

Skills are installed as `SKILL.md` directories (same format as Claude Code):

```bash
# Location
.factory/skills/{skill-name}/SKILL.md

# Install command
npx sigma-protocol install-skills --platform factory-droid
# Or use the converter script:
./scripts/convert-to-factory.sh
```

See [FACTORY-DROID-INTEGRATION.md](./FACTORY-DROID-INTEGRATION.md) for detailed Factory Droid setup.

---

## Skill Categories

### Sigma Core (6 skills)

These skills power the 13-step Sigma methodology.

| Skill                  | Description                                        | Auto-Triggers                               | Used In Steps |
| ---------------------- | -------------------------------------------------- | ------------------------------------------- | ------------- |
| **research**           | MCP-orchestrated web research with source curation | research, search, find, investigate, market | 1, 2, 3, 8    |
| **verification**       | Step completion verification with scoring          | verify, validate, check, score              | All steps     |
| **bdd-scenarios**      | Given/When/Then scenario generation                | bdd, scenario, given, when, then            | 10, 11        |
| **hormozi-frameworks** | Value equation and offer architecture              | value, offer, pricing, hormozi              | 1, 1.5        |
| **output-generation**  | Consistent document output formatting              | generate, output, document, format          | All steps     |
| **frontend-design**    | Distinctive UI creation avoiding AI slop           | ui, component, tailwind, shadcn, layout     | 5, 6, 9       |

---

### Design & Development (4 skills)

Architecture and UI pattern expertise.

| Skill                     | Description                                     | Auto-Triggers                            | Used In Steps |
| ------------------------- | ----------------------------------------------- | ---------------------------------------- | ------------- |
| **ux-designer**           | Wireframes, user flows, accessibility (WCAG)    | ux, wireframe, user flow, accessibility  | 3, 4, 5       |
| **architecture-patterns** | Clean Architecture, Hexagonal, DDD patterns     | architecture, structure, pattern, domain | 2, 8          |
| **api-design-principles** | REST and GraphQL API design best practices      | api, endpoint, rest, graphql, route      | 2, 8          |
| **web-artifacts-builder** | Complex multi-component UIs with React/Tailwind | dashboard, complex ui, multi-component   | 9, implement  |

---

### Quality & Process (5 skills)

Testing, debugging, and code quality.

| Skill                    | Description                                    | Auto-Triggers                              | Used In Steps        |
| ------------------------ | ---------------------------------------------- | ------------------------------------------ | -------------------- |
| **brainstorming**        | Pre-implementation exploration of requirements | brainstorm, ideate, explore, think through | 1, 3, 10             |
| **systematic-debugging** | Structured root cause analysis                 | bug, error, fail, debug, broken, crash     | implement, ui-healer |
| **quality-gates**        | Git hooks, testing, CI/CD setup                | test, ci, cd, hook, lint, coverage         | 0, implement         |
| **senior-qa**            | Test strategies, automation, coverage          | qa, coverage, e2e, unit, integration       | qa-plan, qa-run      |
| **senior-architect**     | System design, tech decisions, scalability     | system design, tech stack, scalability     | 2, 8                 |

---

### Productivity (5 skills)

Documents, presentations, and productivity tools.

| Skill                           | Description                               | Auto-Triggers                          | Used In Steps  |
| ------------------------------- | ----------------------------------------- | -------------------------------------- | -------------- |
| **prompt-engineering-patterns** | LLM prompt optimization for production    | prompt, llm, ai, gpt, claude           | AI features    |
| **xlsx**                        | Spreadsheet creation, editing, analysis   | spreadsheet, excel, csv, xlsx          | Data export    |
| **pptx**                        | Presentation creation and editing         | presentation, slides, pptx, pitch deck | Client handoff |
| **applying-brand-guidelines**   | Consistent branding across outputs        | brand, style, theme, guidelines        | 6, marketing   |
| **remembering-conversations**   | Search previous conversations for context | recall, previous, remember, context    | All steps      |

---

### Self-Learning (SLAS) (3 skills)

Session learning and preference capture.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **session-distill** | Distill session history into preferences and patterns | slas, session, distill | All |
| **sigma-exit** | Capture session context before ending a session | slas, exit, session | All |
| **developer-preferences** | Auto-generated preferences overlay from SLAS | preferences, slas | All |

Claude Code hooks live in `.claude/hooks/slas/` (`session-start-context.sh`, `session-end-summary.sh`) and write to `docs/sessions/{logs,preferences,patterns}`. Codex/OpenCode installs include the SLAS skills and session scaffolding but do not run hooks.

---

### Platform Tools (5 skills)

Create custom skills and agents for each platform.

| Skill | Description | Platform | Auto-Triggers |
|-------|-------------|----------|---------------|
| **skill-creator** | Create Claude Code skills | Claude Code | create skill, new skill |
| **agent-development** | Create Claude Code agents | Claude Code | create agent, agent design |
| **opencode-agent-generator** | Create OpenCode agents | OpenCode | opencode agent, swarm agent |
| **creating-opencode-plugins** | Create OpenCode plugins | OpenCode | opencode plugin, event hook |
| **agentic-coding** | AI-assisted coding patterns | All | agentic, ai coding, copilot |

---

### Content & Marketing (4 skills)

Brand voice and content creation.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **brand-voice** | Define, extract, apply consistent brand voice | brand, voice, tone | Marketing |
| **content-atomizer** | Transform pillar content into platform formats | atomize, repurpose, content | Marketing |
| **direct-response-copy** | Conversion-focused copywriting frameworks | copy, conversion, sales | Marketing, Landing |
| **video-hooks** | Video hook and script patterns | hook, video, script | Marketing |

---

### Document Generation (2 skills)

Create and manipulate office documents.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **docx-generation** | Create Word documents programmatically | word, docx, document | Handoff |
| **pdf-manipulation** | Generate, merge, split, extract PDFs | pdf, merge, split | Handoff |

---

### Browser & Verification (1 skill)

Browser testing and UI verification.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **browser-verification** | Platform-adaptive browser testing | browser, test, verify ui | UI-Healer |

---

### Multi-Agent (2 skills)

Orchestration and parallel execution.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **fork-worker** | PRD implementation specialist | fork, worker, implement | Orchestration |
| **orchestrator-admin** | Multi-agent coordination | orchestrate, coordinate | Orchestration |

---

### Additional Skills (6 skills)

Extended capabilities.

| Skill | Description | Auto-Triggers | Used In Steps |
|-------|-------------|---------------|---------------|
| **memory-systems** | Persistent context and recall | memory, context, recall | All |
| **react-performance** | React optimization patterns | react, performance, memo | Implementation |
| **monorepo-architecture** | Monorepo setup and patterns | monorepo, turborepo, nx | Architecture |
| **superdesign-integration** | Superdesign AI integration | superdesign, design ai | Design |
| **specialized-validation** | Domain-specific validation | validate, schema | All |
| **web-artifacts-builder** | Complex multi-component UIs | dashboard, complex ui | Implementation |

---

## Skill File Locations

### Source Files (Platform-Agnostic)

```
src/skills/                          # 39 total
├── research.md                      # Sigma Core
├── verification.md
├── bdd-scenarios.md
├── hormozi-frameworks.md
├── output-generation.md
├── frontend-design.md
├── brainstorming.md                 # Quality
├── systematic-debugging.md
├── quality-gates.md
├── senior-qa.md
├── senior-architect.md
├── specialized-validation.md
├── architecture-patterns.md         # Design & Dev
├── api-design-principles.md
├── ux-designer.md
├── web-artifacts-builder.md
├── react-performance.md
├── monorepo-architecture.md
├── superdesign-integration.md
├── prompt-engineering-patterns.md   # Productivity
├── xlsx.md
├── pptx.md
├── applying-brand-guidelines.md
├── remembering-conversations.md
├── memory-systems.md
├── skill-creator.md                 # Platform Tools
├── agent-development.md
├── opencode-agent-generator.md
├── creating-opencode-plugins.md
├── agentic-coding.md
├── brand-voice.md                   # Content & Marketing
├── content-atomizer.md
├── direct-response-copy.md
├── video-hooks.md
├── docx-generation.md               # Document Generation
├── pdf-manipulation.md
├── browser-verification.md          # Browser & Verification
├── fork-worker.md                   # Multi-Agent
└── orchestrator-admin.md
```

### Platform-Specific Distributions

```
platforms/
├── cursor/rules/
│   └── sss-*.mdc                # 149 .mdc rules with globs/keywords
├── claude-code/skills/
│   └── */SKILL.md               # 148 skill directories
├── opencode/skill/
│   └── */SKILL.md               # 149 skill directories
└── factory-droid/
    ├── skills/*/SKILL.md        # 158 skill directories
    ├── droids/                  # Custom subagents
    └── commands/                # Slash commands
```

See [PLATFORMS.md](./PLATFORMS.md) for complete platform configuration details.

---

## Auto-Trigger Examples

### Cursor (.mdc)

```yaml
---
description: Use when designing system architecture, selecting patterns, or planning technical structure
globs: ["**/ARCHITECTURE.md", "**/docs/architecture/**/*"]
alwaysApply: false
---
```

### Claude Code / OpenCode (SKILL.md)

```yaml
---
name: architecture-patterns
description: "This skill provides system architecture patterns including Clean Architecture, Hexagonal, and DDD. Use when designing system structure."
version: "1.0.0"
---
```

---

## Customization

### Removing Unwanted Skills

Delete the skill files you don't need:

```bash
# Cursor
rm .cursor/rules/sss-pptx.mdc

# Claude Code
rm -rf .claude/skills/pptx/

# OpenCode
rm -rf .opencode/skill/pptx/
```

### Adding Custom Skills

Create new skills following the same patterns:

```bash
# Cursor: Create .mdc file with globs/keywords
# Claude Code / OpenCode: Create skill-name/SKILL.md directory
```

---

## Relationship with Step 13

**Step 0** installs these 39 Foundation Skills (universal).

**Step 13** (Skillpack Generator) creates **project-specific overlay skills**:

- `frontend-aesthetics` — Your design system, tokens, component patterns
- `backend-engineering` — Your API conventions, auth patterns, error shapes
- `database-modeling` — Your schema patterns, RLS policies, migrations

These overlays **reference** your project docs and **override** generic foundation guidance with your specific decisions.

---

## See Also

- [Step 0: Environment Setup](../steps/step-0-environment-setup) — Where foundation skills are installed
- [Step 13: Skillpack Generator](../steps/step-13-skillpack-generator) — Where project overlays are created
- [src/module.yaml](../src/module.yaml) — Complete skill manifest with metadata
