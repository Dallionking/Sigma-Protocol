---
name: skill-creator
description: "Guide for creating effective skills for Claude Code. Use when users want to create a new skill that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations."
version: "1.0.0"
source: "@anthropics/skills"
platform: claude-code
triggers:
  - create-skill
  - new-skill
  - skill-development
  - claude-code-extension
disable-model-invocation: true
---

# Skill Creator Skill

Guide for creating effective skills for Claude Code. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.

## When to Invoke

Invoke this skill when:

- User wants to create a new Claude Code skill
- User needs help with SKILL.md file structure
- User wants to understand skill frontmatter
- User needs examples of effective skills
- User wants to convert knowledge into a skill

---

## Skill File Structure

### Location

```
project/
└── .claude/
    └── skills/
        └── my-skill/
            ├── SKILL.md           # Required: Main skill file
            └── references/        # Optional: Supporting docs
                ├── examples.md
                └── api-reference.md
```

### SKILL.md Template

````markdown
---
name: skill-name
description: "Clear description of what this skill does and when to use it. Use third-person ('This skill should be used when...')."
version: "1.0.0"
---

# Skill Title

Brief introduction to what this skill provides.

## When to Use

Bullet list of scenarios when this skill should be invoked:

- Scenario 1
- Scenario 2
- Scenario 3

---

## Core Concepts

### Concept 1

Explanation with examples.

### Concept 2

Explanation with examples.

---

## Workflows

### Workflow 1: [Name]

Step-by-step instructions:

1. Step one
2. Step two
3. Step three

```code
Example code or commands
```
````

---

## Templates

### Template 1

```
[Reusable template content]
```

---

## Best Practices

- Best practice 1
- Best practice 2
- Best practice 3

---

## Anti-Patterns

- What NOT to do 1
- What NOT to do 2

---

## Integration Notes

How this skill integrates with other tools or skills.

---

_Footer note or reminder_

````

---

## Frontmatter Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Skill identifier (kebab-case) |
| `description` | string | When to use this skill (1-1024 chars) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semantic version |
| `triggers` | array | Keywords that activate the skill |
| `tools` | array | MCP tools this skill uses |
| `dependencies` | array | Other skills this depends on |

### Description Best Practices

The description should tell Claude WHEN to invoke this skill:

```yaml
# GOOD - Clear trigger conditions
description: "This skill should be used when the user asks to build web components, pages, or applications. Use for frontend development tasks requiring HTML, CSS, or JavaScript."

# BAD - Vague, doesn't help Claude decide
description: "A helpful skill for development tasks."
````

---

## Skill Categories

### Knowledge Skills

Encode domain expertise:

```markdown
---
name: aws-lambda-patterns
description: "This skill provides AWS Lambda best practices and patterns. Use when designing, implementing, or debugging Lambda functions."
---

# AWS Lambda Patterns

## Cold Start Optimization

[Detailed knowledge about reducing cold starts]

## Error Handling Patterns

[Best practices for Lambda error handling]
```

### Workflow Skills

Define step-by-step processes:

```markdown
---
name: code-review
description: "This skill should be used when reviewing code changes. Provides a structured code review process."
---

# Code Review Workflow

## Review Checklist

1. [ ] Code correctness
2. [ ] Test coverage
3. [ ] Security considerations
       ...
```

### Template Skills

Provide reusable templates:

````markdown
---
name: documentation-templates
description: "This skill provides templates for technical documentation. Use when creating README, API docs, or architecture docs."
---

# Documentation Templates

## README Template

```markdown
# Project Name

...
```
````

````

### Integration Skills

Connect to external tools:

```markdown
---
name: github-workflow
description: "This skill helps create and manage GitHub Actions workflows. Use when setting up CI/CD pipelines."
---

# GitHub Actions Patterns

## Standard CI Workflow
[Workflow templates and explanations]
````

---

## Writing Effective Skills

### Be Specific

```markdown
# BAD - Too vague

"Use this skill for coding tasks."

# GOOD - Clear scope

"Use this skill when implementing React components with TypeScript, particularly when dealing with complex state management or performance optimization."
```

### Include Examples

````markdown
# BAD - No examples

"Use proper error handling."

# GOOD - Concrete examples

"Use proper error handling:

````typescript
// Pattern: Error boundaries for React
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent />;
    }
    return this.props.children;
  }
}
```"
````
````

### Structure for Scanning

Use headers, lists, and tables that Claude can quickly scan:

```markdown
## Quick Reference

| Pattern   | Use When               | Example             |
| --------- | ---------------------- | ------------------- |
| Singleton | Single instance needed | Database connection |
| Factory   | Object creation varies | User types          |
| Observer  | Event notification     | UI updates          |
```

### Include Anti-Patterns

Help Claude avoid common mistakes:

````markdown
## Anti-Patterns

### Don't: Premature Optimization

```typescript
// BAD: Over-engineering simple code
const memoizedValue = useMemo(() => items.length, [items.length]);

// GOOD: Simple is fine for simple cases
const itemCount = items.length;
```
````

````

---

## Testing Skills

### Manual Testing

1. Create the skill in `.claude/skills/`
2. Start a new Claude conversation
3. Ask Claude to perform a task that should trigger the skill
4. Verify the skill was used correctly
5. Test edge cases

### Checklist

- [ ] Skill loads without errors
- [ ] Description clearly explains when to use
- [ ] All examples are correct and runnable
- [ ] No conflicts with other skills
- [ ] Covers main use cases
- [ ] Anti-patterns are documented

---

## Skill Maintenance

### Versioning

```yaml
# Use semantic versioning
version: "1.0.0"  # Initial release
version: "1.1.0"  # New feature added
version: "1.0.1"  # Bug fix
version: "2.0.0"  # Breaking change
````

### Changelog

Keep a changelog in the skill:

```markdown
## Changelog

### 1.1.0 (2025-01-05)

- Added support for TypeScript examples
- Fixed incorrect SQL syntax in examples

### 1.0.0 (2024-12-01)

- Initial release
```

---

## Integration with Sigma Protocol

### Step 13 (Skillpack Generator)

Use this skill to create project-specific skills.

### Custom Workflows

Create skills that encode project-specific processes.

### Team Knowledge

Convert team expertise into reusable skills.

---

_Remember: Good skills are focused, well-documented, and include concrete examples. Start small and iterate based on actual usage._
