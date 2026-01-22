# Cursor Rules Reference

This document catalogs all Cursor rules available in Sigma Protocol. Rules are MDC (Markdown Component) files that auto-trigger based on file patterns and keywords.

## How Cursor Rules Work

Rules in `.cursor/rules/` use YAML frontmatter to define when they activate:

```yaml
---
description: "Short description shown in Cursor"
globs: ["**/*.tsx", "**/*.jsx"]     # File patterns that trigger
keywords: ["ui", "component"]       # Keywords that trigger
---
```

When you open a matching file OR mention a keyword, Cursor automatically loads the relevant rule into context.

---

## Rules by Category

### Architecture (3 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-api-design` | N/A | api, rest, graphql, endpoint | REST/GraphQL API design principles |
| `sigma-architecture-patterns` | N/A | architecture, hexagonal, clean, DDD | Clean/Hexagonal architecture patterns |
| `sigma-senior-architect` | N/A | architecture, design, system | System-level architectural decisions |

### Design (3 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-frontend-design` | `*.tsx`, `*.jsx`, `*.vue`, `*.css`, `components/**` | ui, component, tailwind, shadcn | Production-grade UI avoiding generic aesthetics |
| `sigma-ux-designer` | N/A | ux, wireframe, flow, accessibility | UX design, wireframes, user flows |
| `sigma-web-artifacts` | N/A | artifact, widget, embed | Web artifact/widget generation |

### Development (4 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-agent-development` | N/A | agent, subagent, tool | Building AI agents and tools |
| `sigma-opencode-agents` | `.opencode/**` | opencode, agent | OpenCode-specific agents |
| `sigma-opencode-plugins` | N/A | plugin, opencode, hook | Creating OpenCode plugins |
| `sigma-skill-creator` | `.claude/skills/**`, `.cursor/rules/**` | skill, create skill | Creating Sigma skills |

### Quality (5 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-bdd-scenarios` | `*.feature`, `e2e/**` | bdd, gherkin, scenario | BDD test scenarios in Gherkin |
| `sigma-quality-gates` | `lefthook.yml`, `.github/workflows/**` | hook, gate, ci, quality | Git hooks and CI quality gates |
| `sigma-senior-qa` | `*.test.*`, `*.spec.*`, `tests/**`, `e2e/**` | test, qa, coverage | Test strategies and automation |
| `sigma-systematic-debugging` | N/A | bug, error, debug, fix, broken | Structured debugging methodology |
| `sigma-verification` | N/A | verify, validate, check | Implementation verification |

### Productivity (5 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-brainstorming` | N/A | brainstorm, idea, explore | Idea exploration before implementation |
| `sigma-prompt-engineering` | N/A | prompt, llm, template | Prompt engineering patterns |
| `sigma-remembering` | N/A | remember, memory, context | Context persistence across sessions |
| `sigma-research` | N/A | research, investigate, find | Deep research using MCP tools |
| `sss-ralph-tail` | N/A | ralph, tail, loop | Ralph loop observability |

### Documents (3 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-output-generation` | N/A | output, generate, document | Standard output generation patterns |
| `sigma-pptx` | `*.pptx` | presentation, slides, pptx | PowerPoint creation and editing |
| `sigma-xlsx` | `*.xlsx`, `*.csv`, `*.tsv` | spreadsheet, excel, csv | Spreadsheet manipulation |

### Marketing (3 rules)

| Rule | File Pattern | Keywords | Purpose |
|------|--------------|----------|---------|
| `sigma-brand-guidelines` | N/A | brand, style, guidelines | Applying brand consistency |
| `sigma-hormozi` | N/A | offer, pricing, value | Hormozi $100M frameworks |
| `sigma-persuasion-psychology` | N/A | persuasion, copywriting | Persuasion and copywriting psychology |

---

## Installation

Rules are installed automatically when you run:

```bash
sigma install -p cursor
```

They're placed in:
```
.cursor/rules/
  ├── architecture/
  ├── design/
  ├── development/
  ├── documents/
  ├── marketing/
  ├── productivity/
  └── quality/
```

---

## Using Rules

### Automatic Triggering

Rules activate automatically when:
1. You open a file matching the `globs` pattern
2. Your message contains a `keywords` match

### Manual Invocation

To manually invoke a rule, reference it in your prompt:
```
@sigma-frontend-design Help me build this component
```

### Checking Active Rules

In Cursor, you can see which rules are active in the context panel.

---

## Customizing Rules

### Adding Custom Triggers

Edit the rule file to add more globs or keywords:

```yaml
---
description: "My custom triggers"
globs: ["**/*.custom.tsx"]
keywords: ["my-keyword"]
---
```

### Creating Custom Rules

1. Create a new `.mdc` file in the appropriate category folder
2. Add YAML frontmatter with `description`, `globs`, and `keywords`
3. Write the rule content in Markdown

```yaml
---
description: "My custom rule"
globs: ["**/my-pattern/**"]
keywords: ["my-keyword"]
---

# My Custom Rule

Instructions for when this rule activates...
```

### Disabling Rules

To disable a rule, either:
- Delete the file from `.cursor/rules/`
- Add `disabled: true` to the frontmatter

---

## Rule Priority

When multiple rules match:
1. More specific globs take priority over generic ones
2. Exact keyword matches beat partial matches
3. Rules are combined, not replaced

---

## Troubleshooting

### Rule Not Activating

1. Check file pattern matches your file
2. Verify keywords are in your message
3. Restart Cursor to refresh rules

### Too Many Rules Active

1. Make glob patterns more specific
2. Remove generic keywords
3. Split large rules into focused ones

### Conflicting Rules

If rules give contradictory guidance:
1. Use more specific keywords in your prompt
2. Manually invoke the rule you want: `@rule-name`
3. Consolidate overlapping rules

---

## See Also

- [Skill Routing](./SKILL-ROUTING.md) - How skills auto-trigger
- [Design System Enforcement](./DESIGN-SYSTEM-ENFORCEMENT.md) - UI validation
- [Quick Reference](./QUICK-REFERENCE.md) - Command cheatsheet
