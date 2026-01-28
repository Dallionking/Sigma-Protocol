# Antigravity Platform Support

**Platform:** Antigravity (Google)
**Version:** 1.0.0
**Status:** Beta
**Last Updated:** 2026-01-28

---

## Overview

Antigravity is Google's emerging AI-native development environment with first-class support for agent skills and multi-agent orchestration. It represents Google's vision of an agent-first IDE that integrates seamlessly with their AI infrastructure.

Sigma Protocol provides full compatibility with Antigravity through the universal SKILL.md format, enabling teams to leverage the same methodology and skills across Google's ecosystem.

### Key Differentiators

| Feature | Description |
|---------|-------------|
| **Agent-First Architecture** | Built from the ground up for AI agent workflows |
| **Loki Mode** | Multi-agent orchestration with specialized agents |
| **Voice Agents** | Native speech-based interaction support |
| **Framework Integrations** | CrewAI, LangGraph, and custom agent frameworks |
| **Google Cloud Native** | Deep integration with Vertex AI and GCP services |

---

## Directory Structure

### Platform Directory (Sigma Protocol)

```
platforms/antigravity/
├── README.md              # This documentation
├── antigravity.yaml       # Platform configuration
├── skills/                # Antigravity-optimized skills
│   └── README.md
├── commands/              # Executable commands
│   └── README.md
└── examples/              # Example implementations
    └── basic-skill/
        └── SKILL.md
```

### Project Integration

When using Antigravity in your projects, place configuration in the `.agent/` directory:

```
your-project/
├── .agent/
│   ├── config.yaml        # Agent configuration
│   ├── skills/            # Project-level skills
│   │   └── custom-skill/
│   │       └── SKILL.md
│   └── commands/          # Custom commands
│       └── my-command.md
├── src/
└── package.json
```

---

## SKILL.md Format Specification

Antigravity uses the universal SKILL.md format compatible with the skills.sh ecosystem. This ensures portability across platforms.

### Frontmatter Schema

```yaml
---
# Required fields
name: skill-name                    # Kebab-case identifier
description: "Brief description"    # Under 100 chars for UI display
version: 1.0.0                      # Semantic versioning

# Optional fields
author: organization-or-user        # Skill author/maintainer
source: "@sigma-protocol"           # Origin reference
tags:                               # Categorization tags
  - frontend
  - react
  - component
triggers:                           # Auto-activation keywords
  - react component
  - tsx file
  - ui design
globs:                              # File pattern triggers
  - "*.tsx"
  - "*.jsx"
  - "components/**/*"
requires:                           # Required tools/capabilities
  - Read
  - Write
  - WebFetch
---

# Skill Name

Markdown content with instructions...
```

### Complete Example

```markdown
---
name: react-component-design
description: Best practices for React component architecture
version: 1.0.0
author: sigma-protocol
tags: [react, frontend, components, typescript]
triggers:
  - react component
  - tsx
  - component design
globs:
  - "*.tsx"
  - "components/**/*"
---

# React Component Design

## Purpose
Guide the creation of well-structured, performant React components.

## Principles

### 1. Component Composition
- Prefer composition over inheritance
- Use compound component patterns for complex UI
- Keep components focused and single-purpose

### 2. Type Safety
- Define explicit prop interfaces
- Use discriminated unions for variant props
- Avoid `any` type escapes

### 3. Performance
- Memoize expensive computations with useMemo
- Use useCallback for stable function references
- Implement proper key strategies for lists

## Implementation Pattern

\`\`\`tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant,
  size = 'md',
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
\`\`\`
```

---

## Unique Capabilities

### Loki Mode: Multi-Agent Orchestration

Antigravity's Loki Mode enables coordinated multi-agent workflows:

```yaml
# .agent/loki-config.yaml
orchestration:
  mode: loki
  agents:
    - name: planner
      role: "Break down tasks into subtasks"
      model: gemini-2.0-pro
    - name: implementer
      role: "Write code implementations"
      model: gemini-2.0-flash
    - name: reviewer
      role: "Review code quality"
      model: gemini-2.0-pro
  workflow:
    - planner -> implementer
    - implementer -> reviewer
    - reviewer -> planner  # Feedback loop
```

### Voice Agents

Enable speech-based interaction for hands-free development:

```yaml
# .agent/config.yaml
voice:
  enabled: true
  language: en-US
  wake_word: "hey agent"
  commands:
    - pattern: "run tests"
      action: execute_command
      command: "npm test"
    - pattern: "implement {feature}"
      action: invoke_skill
      skill: implement-prd
```

### Framework Integrations

#### CrewAI Integration

```python
# .agent/crew.py
from crewai import Agent, Task, Crew

architect = Agent(
    role='Software Architect',
    goal='Design scalable system architecture',
    backstory='Expert in distributed systems',
    tools=[ReadTool, GrepTool, WebSearchTool]
)

crew = Crew(
    agents=[architect, developer, reviewer],
    tasks=[design_task, implement_task, review_task],
    process=Process.sequential
)
```

#### LangGraph Integration

```python
# .agent/graph.py
from langgraph.graph import StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("plan", plan_node)
workflow.add_node("implement", implement_node)
workflow.add_node("verify", verify_node)

workflow.add_edge("plan", "implement")
workflow.add_edge("implement", "verify")
workflow.add_conditional_edges("verify", route_based_on_result)
```

---

## Integration with Sigma Protocol

### Step Mapping

Sigma Protocol's 13-step methodology maps directly to Antigravity workflows:

| Sigma Step | Antigravity Agent Role |
|------------|------------------------|
| Step 1: Ideation | `planner` agent with brainstorming skill |
| Step 2: Architecture | `architect` agent with senior-architect skill |
| Step 3: UX Design | `designer` agent with ux-designer skill |
| Steps 4-5: Flow/Wireframes | `designer` + `documenter` agents |
| Step 6-7: Design System | `designer` agent with frontend-design skill |
| Step 8: Technical Spec | `architect` agent with api-design skill |
| Steps 10-11: PRD Generation | `planner` agent with executing-plans skill |
| Step 12-13: Context/Skillpack | `documenter` agent |

### Skill Synchronization

Sync Sigma Protocol skills to Antigravity format:

```bash
# Sync all skills
./scripts/sync-platforms.sh antigravity

# Sync specific skill category
./scripts/sync-platforms.sh antigravity --category=frontend

# Validate skill format
./scripts/validate-skills.sh platforms/antigravity/skills/
```

### Command Mapping

Sigma commands map to Antigravity commands with minimal changes:

```yaml
# Sigma Protocol command
---
name: implement-prd
description: "Implement a PRD feature"
category: dev
---

# Antigravity equivalent (in .agent/commands/)
---
name: implement-prd
description: "Implement a PRD feature"
invoke: skill
skill: executing-plans
args:
  prd: $ARGUMENTS
---
```

---

## Configuration Reference

### .agent/config.yaml

```yaml
# Antigravity Agent Configuration
version: "1.0"
name: my-project

# Model configuration
model:
  default: gemini-2.0-flash
  planning: gemini-2.0-pro
  review: gemini-2.0-pro

# Skill configuration
skills:
  enabled: true
  path: .agent/skills/
  auto_invoke: true
  sources:
    - local
    - sigma-protocol

# Tool permissions
tools:
  allowed:
    - Read
    - Write
    - Edit
    - Bash
    - WebFetch
    - WebSearch
  restricted:
    - Bash(rm -rf *)
    - Write(.env)

# Voice configuration (optional)
voice:
  enabled: false
  language: en-US

# Loki mode (optional)
loki:
  enabled: false
  max_agents: 5
  coordination: sequential

# Context management
context:
  max_tokens: 128000
  compression: semantic
  preserve:
    - "*.md"
    - "ARCHITECTURE.md"
    - "MASTER_PRD.md"
```

---

## Quick Start

### 1. Initialize Antigravity in Your Project

```bash
# Create .agent directory structure
mkdir -p .agent/skills .agent/commands

# Copy configuration template
cp /path/to/sigma-protocol/templates/antigravity-project/.agent/config.yaml .agent/

# Sync Sigma Protocol skills
./scripts/sync-platforms.sh antigravity --target=./.agent/skills/
```

### 2. Add Custom Skills

Create `.agent/skills/my-skill/SKILL.md`:

```markdown
---
name: my-custom-skill
description: "Project-specific skill"
version: 1.0.0
author: your-team
tags: [custom, project]
---

# My Custom Skill

Your skill instructions here...
```

### 3. Create Custom Commands

Create `.agent/commands/deploy.md`:

```markdown
---
name: deploy
description: "Deploy to staging environment"
---

Execute the following deployment steps:
1. Run tests: `npm test`
2. Build: `npm run build`
3. Deploy: `npm run deploy:staging`
```

### 4. Start Development

```bash
# Launch Antigravity with your configuration
antigravity start

# Or invoke specific commands
antigravity run deploy
antigravity skill implement-prd "Add user authentication"
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Skills not loading | Check `.agent/config.yaml` has `skills.enabled: true` |
| Loki mode errors | Ensure all agents have proper role definitions |
| Voice not working | Verify microphone permissions and language setting |
| Context overflow | Enable `context.compression: semantic` in config |

### Debugging

```bash
# Validate configuration
antigravity validate

# Check skill loading
antigravity skills list

# Debug mode
antigravity start --debug --verbose
```

---

## Migration Guides

### From Claude Code to Antigravity

1. **Skills**: Copy from `.claude/skills/` to `.agent/skills/` (same format)
2. **Commands**: Copy from `.claude/commands/` to `.agent/commands/`
3. **Settings**: Convert `.claude/settings.json` to `.agent/config.yaml`

```bash
# Automated migration
./scripts/migrate-platform.sh claude-code antigravity
```

### From Cursor to Antigravity

1. **Rules**: Expand `.mdc` files to full SKILL.md format
2. **Add frontmatter** with proper schema
3. **Move** from `.cursor/rules/` to `.agent/skills/`

---

## Resources

- [Antigravity Documentation](https://cloud.google.com/antigravity/docs)
- [Sigma Protocol PLATFORMS.md](../../docs/PLATFORMS.md)
- [SKILL.md Format Specification](https://skills.sh/format)
- [Google Cloud AI Documentation](https://cloud.google.com/ai-platform/docs)

---

## Related Documentation

- [FOUNDATION-SKILLS.md](../../docs/FOUNDATION-SKILLS.md) - Core skills reference
- [EXTERNAL-SKILLS.md](../../docs/EXTERNAL-SKILLS.md) - External skill sources
- [WORKFLOW-OVERVIEW.md](../../docs/WORKFLOW-OVERVIEW.md) - Full methodology
- [PLATFORMS.md](../../docs/PLATFORMS.md) - Platform comparison
