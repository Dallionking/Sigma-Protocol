# Skill Routing System

This document explains how Sigma Protocol's skill routing system works, including auto-triggers, keyword matching, and customization.

## Overview

Skills in Sigma Protocol are specialized capabilities that can be invoked automatically or manually. The routing system determines which skill to activate based on:

1. **Explicit invocation** - Using `@skill-name` or `/skill-name`
2. **Keyword triggers** - Matching words in user messages
3. **File type triggers** - Matching file extensions or patterns
4. **Context triggers** - Based on current task or conversation context

## How Auto-Triggers Work

### Keyword-Based Triggers

Each skill defines keywords that activate it automatically. When a user message contains these keywords, the skill is suggested or auto-loaded.

```yaml
# Example skill frontmatter
---
name: systematic-debugging
description: Structured approach to debugging
triggers:
  - bug
  - error
  - debug
  - fix
  - broken
  - not working
  - failing
---
```

### File Pattern Triggers

Skills can activate when specific file types are detected:

```yaml
---
name: frontend-design
globs:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**/*"
  - "tailwind.config.*"
---
```

### Priority Order

When multiple skills match, they're prioritized by:

1. **Explicit invocation** (highest) - User typed `@skill-name`
2. **Required context** - Skill marked as required for current step
3. **Keyword match strength** - More matching keywords = higher priority
4. **Specificity** - More specific file patterns = higher priority
5. **Recency** - Recently used skills get a slight boost

## Skill Categories

### Foundation Skills

Core skills available in all projects:

| Skill | Auto-Triggers | Purpose |
|-------|--------------|---------|
| `systematic-debugging` | bug, error, fix, broken | Structured debugging approach |
| `frontend-design` | ui, component, tailwind, shadcn | UI component development |
| `senior-architect` | architecture, design, system | System design decisions |
| `senior-qa` | test, qa, coverage | Quality assurance |
| `brainstorming` | brainstorm, idea, explore | Idea exploration |

### Step-Specific Skills

Skills that activate during specific workflow steps:

| Step | Auto-Loaded Skills |
|------|-------------------|
| Step 1 | `brainstorming`, `hormozi-frameworks` |
| Step 2 | `senior-architect`, `architecture-patterns` |
| Step 3 | `ux-designer`, `frontend-design` |
| Steps 5-7 | `frontend-design`, `design-systems-architect` |
| Step 8 | `senior-architect`, `api-design-principles` |
| Step 11+ | `senior-qa`, `gap-analysis` |

## Customizing Skill Routing

### Adding Custom Triggers

Edit the skill file in `.claude/skills/` or `.cursor/rules/`:

```yaml
---
name: my-custom-skill
triggers:
  - my-keyword
  - another-keyword
globs:
  - "**/my-pattern/**/*"
---
```

### Disabling Auto-Triggers

To prevent a skill from auto-loading, remove its triggers:

```yaml
---
name: expensive-skill
triggers: []  # Empty - only manual invocation
---
```

### Priority Overrides

In your project's `.sigma/config.json`:

```json
{
  "skillPriorities": {
    "my-custom-skill": 100,
    "frontend-design": 90,
    "systematic-debugging": 80
  }
}
```

## Debugging Skill Routing

### See Active Skills

```bash
sigma doctor --skills
```

### Check Why a Skill Loaded

In Claude Code:
```
Why did @frontend-design activate?
```

The system will explain the trigger chain.

### Force-Load a Skill

```bash
# Explicit invocation always works
@frontend-design
/frontend-design
```

## Ralph Loop Skill Delegation

During Ralph autonomous implementation, workers must use skills:

| Task Type | Required Skill | Consequence if Skipped |
|-----------|----------------|----------------------|
| Architecture | `@senior-architect` | Story rejected |
| UI Components | `@frontend-design` | Design inconsistency |
| Errors | `@systematic-debugging` | Wasted retries |
| Verification | `@gap-analysis` | PRD drift |

Workers that implement directly without skill delegation will have their stories rejected.

## Platform-Specific Behavior

### Cursor

- Skills loaded as `.mdc` rules in `.cursor/rules/`
- Triggers defined via `keywords` and `globs` frontmatter
- Auto-loaded based on open file

### Claude Code

- Skills loaded as `.md` files in `.claude/skills/`
- Triggers defined via `triggers` frontmatter
- Auto-loaded based on conversation context

### OpenCode

- Skills in `.opencode/skill/` directory
- Uses `SKILL.md` format
- Triggers via OpenCode's native routing

## Best Practices

1. **Be Specific with Triggers** - Avoid generic words like "help" or "please"
2. **Test Routing** - Use `sigma doctor --skills` to verify
3. **Document Custom Skills** - Add them to project README
4. **Monitor for Conflicts** - Two skills with same triggers cause confusion
5. **Use Priority Sparingly** - Let the natural routing work first
