# Antigravity Skills Directory

This directory contains skills optimized for Google's Antigravity platform.

## Directory Structure

```
skills/
├── README.md                    # This file
├── <skill-name>/
│   └── SKILL.md                 # Skill definition
└── ...
```

## Skill Format

Each skill uses the universal SKILL.md format with YAML frontmatter:

```yaml
---
name: skill-name                 # Required: kebab-case identifier
description: "Brief description" # Required: under 100 chars
version: 1.0.0                   # Required: semantic version
author: sigma-protocol           # Optional: author/maintainer
tags: [tag1, tag2]               # Optional: categorization
triggers:                        # Optional: auto-activation keywords
  - keyword1
  - keyword2
globs:                           # Optional: file pattern triggers
  - "*.tsx"
  - "*.jsx"
---

# Skill Name

Skill content in markdown...
```

## Available Skills

Skills are synchronized from the Sigma Protocol master skill library. Run the sync script to populate this directory:

```bash
# Sync all skills
./scripts/sync-platforms.sh antigravity

# Sync specific category
./scripts/sync-platforms.sh antigravity --category=frontend
```

## Creating Custom Skills

1. Create a new directory with your skill name
2. Add a `SKILL.md` file with proper frontmatter
3. Write your skill instructions in markdown

Example:

```bash
mkdir skills/my-custom-skill
touch skills/my-custom-skill/SKILL.md
```

## Skill Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `frontend` | Frontend development | react, vue, component design |
| `backend` | Backend development | api design, database, auth |
| `quality` | Quality assurance | testing, verification, debugging |
| `design` | Design systems | ui/ux, accessibility, responsive |
| `productivity` | Workflow tools | brainstorming, planning, research |
| `marketing` | Marketing content | copywriting, SEO, launch strategy |

## Integration with Loki Mode

Skills can be assigned to specific agents in Loki mode:

```yaml
# .agent/loki-config.yaml
agents:
  - name: frontend-agent
    skills:
      - frontend-design
      - react-performance
      - component-design
  - name: backend-agent
    skills:
      - api-design-principles
      - database-design
```

## Related Documentation

- [Antigravity README](../README.md) - Platform overview
- [SKILL.md Format](https://skills.sh/format) - Format specification
- [FOUNDATION-SKILLS.md](../../../docs/FOUNDATION-SKILLS.md) - Core skills
