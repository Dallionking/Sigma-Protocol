---
name: opencode-agent-generator
description: "Creates OpenCode agents in project folders for opencode serve operations. Use when you need to create specialized OpenCode agents that will be used by OpenCode serve."
version: "1.0.0"
platform: opencode
triggers:
  - create-opencode-agent
  - opencode-agent
  - swarm-agent
  - agent-configuration
disable-model-invocation: true
---

# OpenCode Agent Generator Skill

Creates OpenCode agents in project folders (`.opencode/agent/`) for use with OpenCode serve operations.

## When to Invoke

Invoke this skill when:

- Creating new OpenCode agents
- Setting up agent swarms
- Configuring agent permissions
- Defining agent communication protocols

---

## Agent File Structure

### Location

```
project/
└── .opencode/
    └── agent/
        ├── primary-agent.md     # Primary agent
        ├── specialist-one.md    # Subagent
        └── specialist-two.md    # Subagent
```

**Important:** Agent names come from filenames, not frontmatter. The filename `code-analyzer.md` creates an agent named `code-analyzer`.

---

## Agent Template

```markdown
---
description: Brief description of agent's purpose and capabilities
mode: primary # or subagent
tools:
  read: true
  grep: true
  bash: true
  edit: true
  write: true
permissions:
  edit: ask
  write: ask
  bash:
    "git*": allow
    "*": ask
---

# Agent Role and Purpose

You are a [ROLE] specializing in [DOMAIN].

## Core Responsibilities

- Responsibility 1
- Responsibility 2
- Responsibility 3
- Responsibility 4

## Workflow

### Phase 1: [Name]

1. Action 1
2. Action 2
3. Action 3

### Phase 2: [Name]

1. Action 1
2. Action 2

## Swarm Communication Protocol

**CRITICAL**: When communicating with other agents, follow this format:

1. **Introduction**: State your identity and context
2. **Purpose**: Why you're contacting them
3. **Request**: What you need
4. **Expected Response**: Format you need

### Communication Template
```

I am the [Agent_Title] agent from the '[context]'. I am contacting you because I need [specific reason].

I need you to [specific request with details]. Please respond with [expected format/timing].

```

## Constraints

- Constraint 1
- Constraint 2

## Output Format

[Describe expected outputs]
```

---

## Frontmatter Reference

### Required Fields

| Field         | Type   | Description                  |
| ------------- | ------ | ---------------------------- |
| `description` | string | Agent purpose (1-1024 chars) |
| `mode`        | string | `primary` or `subagent`      |

### Tool Configuration

```yaml
tools:
  read: true # Read files
  write: true # Write files
  edit: true # Edit files
  bash: true # Run commands
  grep: true # Search content
  glob: true # Find files
  lsp: true # Language server
  task: true # Spawn subagents
```

### Permission Levels

```yaml
permissions:
  # File operations
  read: allow # No confirmation needed
  write: ask # Ask before writing
  edit: ask # Ask before editing

  # Command execution with patterns
  bash:
    "git *": allow # All git commands allowed
    "npm test": allow # Specific command allowed
    "rm *": deny # Blocked
    "*": ask # Everything else asks
```

---

## Agent Types

### Primary Agent

User-facing, coordinates work:

```yaml
---
description: Main orchestrator for project development
mode: primary
tools:
  read: true
  write: true
  edit: true
  bash: true
  task: true # Can spawn subagents
permissions:
  edit: ask
  write: ask
---
```

### Specialist Subagent

Called by other agents for specific tasks:

```yaml
---
description: Analyzes code quality and suggests improvements
mode: subagent
tools:
  read: true
  grep: true
  lsp: true
permissions:
  edit: deny
  write: deny
---
```

---

## Swarm Patterns

### Orchestrator + Specialists

```
┌─────────────────────────────────────────┐
│           Primary Orchestrator           │
│  - Receives user requests               │
│  - Breaks down tasks                    │
│  - Delegates to specialists             │
│  - Integrates results                   │
└────────────────┬────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Analyzer │ │Implement│ │ Tester  │
│Subagent │ │Subagent │ │Subagent │
└─────────┘ └─────────┘ └─────────┘
```

### Communication Flow

```markdown
## Orchestrator Communication

When delegating to specialists:

1. **Analyzer**
   "I am the Orchestrator. I need you to analyze [target] for [criteria].
   Please return findings in structured format."

2. **Implementer**
   "I am the Orchestrator. Based on analysis [summary], implement [feature].
   Follow project patterns and return file changes."

3. **Tester**
   "I am the Orchestrator. Verify implementation [description].
   Return test results and any failures."
```

---

## Example Agents

### Code Analyzer Agent

```markdown
---
description: Analyzes code for quality, patterns, and potential issues
mode: subagent
tools:
  read: true
  grep: true
  glob: true
  lsp: true
permissions:
  edit: deny
  write: deny
  bash:
    "*": deny
---

# Code Analyzer Agent

You are a Code Analyzer specializing in static code analysis.

## Core Responsibilities

- Analyze code structure and patterns
- Identify potential bugs and issues
- Assess code quality metrics
- Suggest improvements

## Analysis Process

1. Scan target files
2. Check for anti-patterns
3. Evaluate complexity
4. Generate report

## Output Format

### Analysis Report: [Target]

**Overall Score:** [1-10]

**Issues Found:**
| Severity | Location | Issue | Suggestion |
|----------|----------|-------|------------|
| High | file:line | Description | Fix |

**Metrics:**

- Complexity: [score]
- Maintainability: [score]
- Test Coverage: [estimate]

**Recommendations:**

1. [Recommendation]
2. [Recommendation]
```

### Implementation Agent

```markdown
---
description: Implements features based on specifications
mode: subagent
tools:
  read: true
  write: true
  edit: true
  bash: true
  grep: true
permissions:
  edit: allow
  write: allow
  bash:
    "npm *": ask
    "git *": allow
    "*": deny
---

# Implementation Agent

You are an Implementation Specialist who writes production-quality code.

## Core Responsibilities

- Implement features from specifications
- Follow project patterns and conventions
- Write tests for new code
- Update related documentation

## Implementation Process

1. Understand specification
2. Review existing patterns
3. Plan implementation
4. Write code
5. Add tests
6. Update docs

## Communication Protocol

When receiving tasks:
```

Received task from [Agent]: [Summary]
Understanding: [My interpretation]
Plan: [Implementation steps]
Starting implementation...

```

When reporting completion:
```

Implementation complete.
Files changed: [list]
Tests added: [count]
Ready for review.

```

```

---

## Best Practices

### Focused Responsibility

Each agent should have a single, clear purpose:

```yaml
# GOOD: Focused
description: Analyzes TypeScript code for type safety issues

# BAD: Too broad
description: Handles all code-related tasks
```

### Minimal Permissions

Grant only necessary permissions:

```yaml
# Analyzer: Read-only
permissions:
  edit: deny
  write: deny

# Implementer: Write access
permissions:
  edit: allow
  write: allow
```

### Clear Communication

Define explicit communication protocols for swarm coordination.

---

## Integration with Sigma Protocol

### Sigma Workflow Agents

Create agents for Sigma workflow support:

- `sss-planner` - Workflow planning and coordination
- `sss-researcher` - Research and context gathering
- `sss-implementer` - Code implementation
- `sss-reviewer` - Code review and quality

### Skill Integration

Agents can reference skills:

```markdown
## Available Skills

For specialized guidance, reference:

- `frontend-design` - UI implementation
- `architecture-patterns` - System design
- `quality-gates` - Testing and CI/CD
```

---

_Remember: Effective agents are focused, well-constrained, and communicate clearly. Start simple and add complexity as needed._
