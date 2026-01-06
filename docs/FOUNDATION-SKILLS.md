# Foundation Skills Reference

SSS Protocol includes **24 pre-bundled Foundation Skills** that provide universal AI capabilities across all supported platforms.

---

## Overview

Foundation Skills are installed at **Step 0** (Environment Setup) and provide capabilities that enhance every step of the SSS workflow. They are **universal** and **project-agnostic**.

**Step 13** (Skillpack Generator) creates **project-specific overlays** that build on these foundation skills with your project's:

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
npx sss-protocol install-skills --platform cursor
```

### Claude Code

Skills are installed as `SKILL.md` directories:

```bash
# Location
.claude/skills/{skill-name}/SKILL.md

# Install command
npx sss-protocol install-skills --platform claude-code
```

### OpenCode

Skills are installed as `SKILL.md` directories:

```bash
# Location
.opencode/skill/{skill-name}/SKILL.md

# Install command
npx sss-protocol install-skills --platform opencode
```

---

## Skill Categories

### SSS Core (6 skills)

These skills power the 13-step SSS methodology.

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

### Platform Tools (4 skills)

Create custom skills and agents for each platform.

| Skill                         | Description               | Platform    | Auto-Triggers               |
| ----------------------------- | ------------------------- | ----------- | --------------------------- |
| **skill-creator**             | Create Claude Code skills | Claude Code | create skill, new skill     |
| **agent-development**         | Create Claude Code agents | Claude Code | create agent, agent design  |
| **opencode-agent-generator**  | Create OpenCode agents    | OpenCode    | opencode agent, swarm agent |
| **creating-opencode-plugins** | Create OpenCode plugins   | OpenCode    | opencode plugin, event hook |

---

## Skill File Locations

### Source Files (Platform-Agnostic)

```
src/foundation-skills/
├── research.md
├── verification.md
├── bdd-scenarios.md
├── hormozi-frameworks.md
├── output-generation.md
├── frontend-design.md
├── brainstorming.md
├── systematic-debugging.md
├── architecture-patterns.md
├── api-design-principles.md
├── prompt-engineering-patterns.md
├── quality-gates.md
├── ux-designer.md
├── senior-qa.md
├── senior-architect.md
├── xlsx.md
├── pptx.md
├── applying-brand-guidelines.md
├── web-artifacts-builder.md
├── remembering-conversations.md
├── skill-creator.md
├── agent-development.md
├── opencode-agent-generator.md
└── creating-opencode-plugins.md
```

### Platform-Specific Distributions

```
platforms/
├── cursor/rules/
│   └── sss-*.mdc           # 24 .mdc rules with globs/keywords
├── claude-code/skills/
│   └── */SKILL.md          # 24 skill directories
└── opencode/skill/
    └── */SKILL.md          # 24 skill directories
```

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

**Step 0** installs these 24 Foundation Skills (universal).

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
