# Ralph Skill Registry

**Version:** 2.1.0
**Last Updated:** 2026-01-23
**Location:** `ralph/skill-registry.sh`

---

## Overview

The Ralph Skill Registry is a dynamic skill matching system that enables Ralph workers to leverage **260+ installed skills** automatically. Instead of hardcoding skill recommendations, the registry:

1. Builds a comprehensive index of all available skills by parsing frontmatter
2. Matches skills to stories based on content analysis
3. Injects relevant skill recommendations into worker prompts

This allows Ralph to intelligently surface the right expertise for each story without manual configuration.

---

## How It Works

### 1. Registry Building

When Ralph starts, it builds a skill registry by scanning multiple directories:

```bash
skill_dirs=(
    "$project_dir/.claude/skills"           # Master skill directory
    "$project_dir/src/skills"               # Legacy location
    "$project_dir/platforms/claude-code/skills"  # Platform skills
    "$project_dir/platforms/opencode/skill"      # OpenCode skills
    "$project_dir/packages/sss-harness/skills"   # Package skills
)
```

For each skill file, it extracts:
- **name**: Skill identifier
- **description**: What the skill does
- **triggers**: Keywords that activate the skill

### 2. Content Analysis

When processing a story, the registry analyzes:

```json
{
  "title": "Implement user dashboard with charts",
  "description": "Create interactive dashboard with Chart.js",
  "tasks": [
    { "id": "UI-001", "filePath": "src/components/Dashboard.tsx" }
  ],
  "tags": { "complexity": "complex" }
}
```

Searchable content includes:
- Story title and description
- Task IDs (UI-*, API-*, TEST-*, etc.)
- File paths being modified
- Complexity tags

### 3. Skill Matching

Skills are scored using a weighted algorithm:

| Match Type | Points | Description |
|------------|--------|-------------|
| **Direct Trigger** | +10 | Story content contains a skill's trigger keyword |
| **Task ID Prefix** | +8 | Task ID matches skill domain (UI → frontend-design) |
| **File Path Pattern** | +6 | File extension matches skill expertise (*.tsx → React) |
| **Content Keyword** | +4 | Story mentions skill-related terms |
| **Complexity Boost** | +3 | Complex stories get architecture skills |

The top 8 skills by score are recommended.

---

## Configuration

### Skill Frontmatter

Skills define their matching criteria in YAML frontmatter:

```yaml
---
name: frontend-design
description: "Create distinctive, production-grade UI with exceptional design quality"
version: "1.0.0"
source: "@sigma-protocol"
triggers:
  - implement-prd
  - step-5-wireframe-prototypes
  - ui-component
  - dashboard
  - page
---
```

### Trigger Keywords

Triggers are case-insensitive keywords that activate the skill:

```yaml
triggers:
  - react              # Technology mention
  - component          # Artifact type
  - implement-prd      # Command context
  - step-5             # Workflow step
```

---

## Usage

### In Ralph Loop

The registry is automatically used by `sigma-ralph.sh`:

```bash
#!/bin/bash
source ralph/skill-registry.sh

# Build registry (once per session)
build_skill_registry "$PROJECT_ROOT"

# For each story, get matching skills
matched_skills=$(get_matching_skills "$story_json")
skill_section=$(generate_skill_injection "$story_json")

# Inject into worker prompt
worker_prompt="$worker_prompt$skill_section"
```

### Manual Testing

```bash
# Source the registry
source ralph/skill-registry.sh

# Build registry
build_skill_registry "/path/to/project"

# View registry summary
get_registry_summary

# Test matching
story='{"title":"Build login form","description":"Create auth UI"}'
get_matching_skills "$story"
```

---

## Matching Rules

### Task ID Prefixes

| Prefix | Matched Skills |
|--------|---------------|
| `UI-*` | frontend-design, ux-designer, react-performance, web-artifacts-builder |
| `API-*` | api-design-principles, architecture-patterns |
| `TEST-*`, `VERIFY-*` | senior-qa, bdd-scenarios |
| `DB-*` | architecture-patterns |

### File Path Patterns

| Pattern | Matched Skills |
|---------|---------------|
| `*.tsx`, `*.jsx` | frontend-design, react-performance |
| `*route*`, `*api*` | api-design-principles |
| `*test*`, `*spec*` | senior-qa, bdd-scenarios |

### Content Keywords

| Keyword | Matched Skill |
|---------|--------------|
| component, layout, page, screen | frontend-design |
| flow, journey, wireframe | ux-designer |
| react, render, memo, performance | react-performance |
| dashboard, multi, complex | web-artifacts-builder |
| bug, fix, error, debug | systematic-debugging |
| security, vulnerability | semgrep, codeql |
| three, 3d, scene | threejs-fundamentals |
| expo, mobile | expo-*, react-native-* |
| stripe, payment | stripe-best-practices |

---

## Generated Output

### Skill Injection Format

When skills match, they're injected as a markdown table:

```markdown
## Recommended Skills for This Story

Based on this story's content, these skills can provide specialized guidance:

| Skill | Relevance | Purpose |
|-------|-----------|---------|
| `@frontend-design` | 14 pts | Create distinctive, production-grade UI... |
| `@react-performance` | 10 pts | Optimize React application performance... |
| `@web-artifacts-builder` | 8 pts | Build complex multi-component artifacts... |

**How to use:** Type `@skill-name` to invoke a skill for domain expertise.
```

### Worker Invocation

Workers can invoke matched skills using `@skill-name` syntax:

```
@frontend-design help me create the dashboard layout
@react-performance check for unnecessary re-renders
```

---

## Adding New Skills

### 1. Create Skill File

```bash
# Create skill in master directory
cat > .claude/skills/my-new-skill.md << 'EOF'
---
name: my-new-skill
description: "Brief description of what this skill does"
version: "1.0.0"
source: "@your-org"
triggers:
  - keyword1
  - keyword2
  - related-command
---

# My New Skill

Skill content...
EOF
```

### 2. Add Triggers

Choose triggers that will match relevant stories:

```yaml
triggers:
  - domain-keyword      # e.g., "authentication", "payment"
  - technology-name     # e.g., "react", "stripe"
  - artifact-type       # e.g., "component", "api"
  - workflow-step       # e.g., "step-2-architecture"
```

### 3. Test Matching

```bash
# Verify skill is discovered
source ralph/skill-registry.sh
build_skill_registry "$(pwd)"
get_registry_summary | grep "my-new-skill"

# Test matching
story='{"title":"Story with keyword1","description":"Uses keyword2"}'
get_matching_skills "$story" | jq '.[] | select(.name=="my-new-skill")'
```

---

## Performance

### Registry Size

- **Build time**: ~2-3 seconds for 260+ skills
- **Registry file**: ~50KB JSON in /tmp
- **Match time**: <100ms per story

### Optimization

- Skills are deduplicated by name across directories
- Internal skills (ralph-loop, fork-worker) are excluded
- Descriptions are truncated to 80 chars in output
- Top 8 skills returned (configurable)

---

## Debugging

### View Registry Contents

```bash
# Full registry
cat "$SKILL_REGISTRY_PATH" | jq '.'

# Skills with triggers
jq '.skills[] | select(.triggers != "")' "$SKILL_REGISTRY_PATH"

# Skill count
jq '.count' "$SKILL_REGISTRY_PATH"
```

### Check Why Skill Didn't Match

1. Verify skill has proper frontmatter
2. Check trigger keywords are in story content
3. Ensure skill isn't in exclude list (ralph-loop, etc.)
4. Verify skill file is in a scanned directory

---

## Related Documentation

- [RALPH-MODE.md](./RALPH-MODE.md) - Full Ralph Loop documentation
- [EXTERNAL-SKILLS.md](./EXTERNAL-SKILLS.md) - External skill sources
- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) - Core skills reference
