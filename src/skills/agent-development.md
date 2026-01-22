---
name: agent-development
description: "This skill should be used when the user asks to create an agent, add an agent, write a subagent, or needs guidance on agent structure, system prompts, triggering conditions, or agent development best practices for Claude Code."
version: "1.0.0"
source: "@anthropics/claude-code"
platform: claude-code
triggers:
  - create-agent
  - agent-design
  - subagent-development
  - autonomous-agent
  - agent-system-prompt
---

# Agent Development Skill

Guide for creating agents in Claude Code. Use when creating autonomous agents, defining agent behaviors, or building multi-agent systems.

## When to Invoke

Invoke this skill when:

- User wants to create a Claude Code agent
- User needs help with agent frontmatter
- User asks about subagent patterns
- User needs agent system prompt guidance
- User is building multi-agent workflows

---

## Agent Types

### Primary Agents

Directly callable by users:

```yaml
mode: primary
```

- Accessible via direct invocation
- Handle complete workflows
- Can spawn subagents
- User-facing documentation

### Subagents

Called by other agents:

```yaml
mode: subagent
```

- Specialized, focused tasks
- Called programmatically
- No direct user access
- Reusable components

---

## Agent File Structure

### Location

```
project/
└── .claude/
    └── agents/
        ├── primary-agent.md    # Primary agent
        └── helper-agent.md     # Subagent
```

### Agent Template

```markdown
---
name: agent-name
description: "Clear description of what this agent does."
mode: primary # or subagent
tools:
  - read
  - write
  - bash
  - mcp_tool_name
---

# Agent Name

## Role

You are a [role description] specialized in [domain].

## Responsibilities

- Responsibility 1
- Responsibility 2
- Responsibility 3

## Workflow

### Phase 1: [Name]

1. Step 1
2. Step 2
3. Step 3

### Phase 2: [Name]

1. Step 1
2. Step 2

## Constraints

- Constraint 1
- Constraint 2

## Output Format

[Describe expected outputs]

## Error Handling

When errors occur:

1. [Error handling step]
2. [Recovery approach]
```

---

## Frontmatter Reference

### Required Fields

| Field         | Type   | Description             |
| ------------- | ------ | ----------------------- |
| `name`        | string | Agent identifier        |
| `description` | string | What the agent does     |
| `mode`        | string | `primary` or `subagent` |

### Optional Fields

| Field         | Type   | Description             |
| ------------- | ------ | ----------------------- |
| `tools`       | array  | Tools the agent can use |
| `color`       | string | Display color (hex)     |
| `icon`        | string | Display icon            |
| `permissions` | object | Permission overrides    |

### Tool Configuration

```yaml
tools:
  # Built-in tools
  - read # Read files
  - write # Write files
  - edit # Edit files
  - bash # Run commands
  - glob # Find files
  - grep # Search content

  # MCP tools
  - mcp_exa_web_search_exa
  - mcp_Ref_ref_search_documentation
```

### Permissions

```yaml
permissions:
  # File operations
  read: allow # always allow reading
  write: ask # ask before writing
  edit: allow # always allow editing

  # Command execution
  bash:
    "git *": allow # Allow git commands
    "npm *": ask # Ask for npm commands
    "*": deny # Deny everything else
```

---

## System Prompt Best Practices

### Role Definition

```markdown
## Role

You are a Senior Code Reviewer with expertise in:

- TypeScript and React best practices
- Security vulnerability detection
- Performance optimization
- Clean code principles

Your reviews are thorough, constructive, and actionable.
```

### Clear Constraints

```markdown
## Constraints

1. **Scope**: Only review code in the PR, not the entire codebase
2. **Tone**: Be constructive, not critical
3. **Focus**: Prioritize security and correctness over style
4. **Action**: Every comment should have a suggested fix
```

### Structured Output

```markdown
## Output Format

Provide review as:

### Summary

[1-2 sentence overall assessment]

### Critical Issues

[Security, bugs that must be fixed]

### Suggestions

[Improvements, best practices]

### Praise

[What was done well]
```

---

## Multi-Agent Patterns

### Orchestrator Pattern

```markdown
# Orchestrator Agent

## Role

You coordinate specialized agents to complete complex tasks.

## Available Subagents

### researcher

- Purpose: Gather information and context
- Input: Topic or question
- Output: Research summary

### implementer

- Purpose: Write code implementations
- Input: Specification
- Output: Code files

### reviewer

- Purpose: Review code quality
- Input: Code changes
- Output: Review comments

## Workflow

1. Analyze the task
2. Break into subtasks
3. Delegate to appropriate subagent
4. Collect and integrate results
5. Verify completeness
```

### Pipeline Pattern

```markdown
# Pipeline Agent

## Stages

### Stage 1: Analysis

Call `analyzer` subagent
→ Produces: Analysis report

### Stage 2: Planning

Call `planner` subagent with analysis
→ Produces: Implementation plan

### Stage 3: Implementation

Call `implementer` subagent with plan
→ Produces: Code changes

### Stage 4: Verification

Call `verifier` subagent with changes
→ Produces: Verification report
```

### Specialist Pattern

```markdown
# Specialist Router

## Routing Logic

If task involves frontend:
→ Call `frontend-specialist`

If task involves backend:
→ Call `backend-specialist`

If task involves database:
→ Call `database-specialist`

If task involves infrastructure:
→ Call `devops-specialist`
```

---

## Agent Communication

### Subagent Invocation

```markdown
## Calling Subagents

When you need to call a subagent:

1. Clearly state which subagent you're calling
2. Provide all necessary context
3. Wait for the subagent to complete
4. Process the results

Example:
"I'm calling the `researcher` subagent to gather information about [topic]."
[Subagent executes]
"The researcher found [summary]. Based on this, I will..."
```

### Context Passing

```markdown
## Context for Subagent

### Task

[Specific task to accomplish]

### Background

[Relevant context the subagent needs]

### Constraints

[Any limitations or requirements]

### Expected Output

[What format/content is expected]
```

---

## Example Agents

### Code Reviewer Agent

````markdown
---
name: code-reviewer
description: "Reviews code changes for quality, security, and best practices"
mode: primary
tools:
  - read
  - glob
  - grep
---

# Code Reviewer Agent

## Role

You are an expert code reviewer who provides thorough, constructive feedback.

## Review Checklist

### Security

- [ ] No secrets in code
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention

### Quality

- [ ] Follows project conventions
- [ ] Appropriate test coverage
- [ ] No obvious bugs
- [ ] Clear variable names

### Performance

- [ ] No N+1 queries
- [ ] Efficient algorithms
- [ ] Appropriate caching

## Output Format

```markdown
## Code Review Summary

**Overall Assessment:** [Pass/Needs Changes/Fail]

### Critical Issues

[List with line numbers and fixes]

### Suggestions

[Non-blocking improvements]

### Positive Notes

[What was done well]
```
````

````

### Research Agent

```markdown
---
name: researcher
description: "Gathers and synthesizes information on technical topics"
mode: subagent
tools:
  - read
  - mcp_exa_web_search_exa
  - mcp_Ref_ref_search_documentation
---

# Research Agent

## Role

You research technical topics and provide comprehensive summaries.

## Research Process

1. Understand the question
2. Identify key search terms
3. Search multiple sources
4. Evaluate source credibility
5. Synthesize findings
6. Cite sources

## Output Format

### Research Summary: [Topic]

**Key Findings:**
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

**Sources:**
- [Source 1]: [Summary]
- [Source 2]: [Summary]

**Recommendations:**
[Actionable recommendations based on research]
````

---

## Integration with SSS Protocol

### SSS Workflow Agents

Create agents for specific SSS workflow steps:

- `ideation-agent` - Step 1 ideation support
- `architecture-agent` - Step 2 architecture design
- `ux-agent` - Step 3 UX design
- `implementation-agent` - PRD implementation

### Skill + Agent Integration

Agents can invoke skills for specialized knowledge:

```markdown
## Available Skills

When you need specialized guidance, refer to these skills:

- `frontend-design` - For UI/UX implementation
- `architecture-patterns` - For system design
- `quality-gates` - For testing and CI/CD
```

---

_Remember: Good agents are focused, well-constrained, and have clear output formats. Start with a single responsibility and expand based on needs._
