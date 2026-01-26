---
name: memory-systems
description: "Implement persistent AI memory using MCP memory servers, knowledge graphs, and RAG. Enables context persistence across sessions and accumulated learning."
version: "1.0.0"
triggers:
  - long-running project
  - multi-session development
  - context persistence
  - knowledge retention
  - project memory
---

# AI Memory Systems Skill

This skill guides **persistent memory implementation** for AI-assisted development projects. Enables context persistence across sessions, accumulated learning, and long-term knowledge retention using MCP servers and knowledge graphs.

## Why Memory Matters

Without persistent memory:
- AI forgets project context between sessions
- Decisions must be re-explained repeatedly
- Pattern recognition doesn't accumulate
- Onboarding new team members is painful

With persistent memory:
- AI remembers project architecture, decisions, patterns
- Previous solutions inform new implementations
- Team knowledge persists beyond individuals
- Context window constraints become manageable

---

## Memory Architecture Options

### 1. MCP Memory Server (Recommended)

The official Anthropic Memory MCP Server provides knowledge-graph-based persistent memory:

```json
// claude_desktop_config.json or .cursor/mcp.json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Capabilities:**
- Create entities (people, projects, decisions, patterns)
- Store relationships between entities
- Add observations (facts, learnings) to entities
- Query and retrieve memories semantically

### 2. RAG-Based Memory (For Large Codebases)

For projects with extensive documentation or codebase knowledge:

```json
{
  "mcpServers": {
    "rag-memory": {
      "command": "npx",
      "args": ["-y", "rag-memory-mcp-server"],
      "env": {
        "VECTOR_STORE": "local",
        "EMBEDDING_MODEL": "text-embedding-3-small"
      }
    }
  }
}
```

### 3. File-Based Memory (Simple)

For simpler needs, use structured markdown files:

```
/project/
└── .memory/
    ├── DECISIONS.md         # Architectural decisions with rationale
    ├── PATTERNS.md          # Recurring code patterns
    ├── LEARNINGS.md         # Things learned during development
    ├── PEOPLE.md            # Team members, roles, preferences
    └── CONTEXT.md           # Project-specific context
```

---

## SSS Protocol Memory Structure

### Recommended Memory Entities

```typescript
interface ProjectMemory {
  // Core entities
  project: {
    name: string;
    description: string;
    stack: string[];
    startDate: Date;
    currentPhase: string;
  };
  
  // Decision log
  decisions: Array<{
    id: string;
    date: Date;
    topic: string;
    decision: string;
    rationale: string;
    alternatives: string[];
    outcome?: string;  // Updated later
  }>;
  
  // Architectural patterns
  patterns: Array<{
    id: string;
    name: string;
    description: string;
    usage: string;
    examples: string[];
    antiPatterns: string[];
  }>;
  
  // Team knowledge
  team: Array<{
    name: string;
    role: string;
    expertise: string[];
    preferences: Record<string, string>;
  }>;
  
  // Learnings
  learnings: Array<{
    date: Date;
    context: string;
    learning: string;
    applicability: string[];
  }>;
  
  // Client/stakeholder preferences
  clientPreferences: {
    communicationStyle: string;
    priorities: string[];
    constraints: string[];
    pastFeedback: string[];
  };
}
```

---

## Memory Integration Points

### Step 1 (Ideation) → Memory Write

After ideation completes, store:
- Project vision and goals
- Target audience decisions
- Business model choices
- Stack decisions and rationale

```markdown
<!-- .memory/DECISIONS.md -->
## 2026-01-07: Stack Selection

**Decision:** Use Next.js 15 + Supabase + Expo monorepo

**Rationale:**
- Client needs web + mobile with shared backend
- Team has React expertise
- Supabase provides realtime + auth out of box

**Alternatives Considered:**
- T3 Stack (rejected: no native mobile story)
- Firebase (rejected: vendor lock-in concerns)

**Expected Outcome:** 6-week MVP with shared codebase
```

### Step 11 (PRD) → Memory Read

When generating PRDs, query memory for:
- Previous architectural decisions
- Established patterns to follow
- Known anti-patterns to avoid
- Team preferences

### Ongoing Development → Memory Update

After each significant implementation:
- Add new patterns discovered
- Update decision outcomes
- Record learnings from debugging
- Note client feedback

---

## Implementation Patterns

### Pattern 1: Session Start Context Load

At the start of each session, automatically load context:

```markdown
<!-- System prompt addition -->
Before starting work, I will check my persistent memory for:
1. Project context and current state
2. Recent decisions and their rationale
3. Established patterns and preferences
4. Any pending items or blockers

Memory query: "Load project context for [PROJECT_NAME]"
```

### Pattern 2: Decision Documentation

When making significant decisions:

```typescript
// MCP Memory call pattern
await createEntity({
  name: `decision-${Date.now()}`,
  entityType: "decision",
  observations: [
    `Topic: ${topic}`,
    `Decision: ${decision}`,
    `Rationale: ${rationale}`,
    `Alternatives: ${alternatives.join(', ')}`,
    `Date: ${new Date().toISOString()}`,
  ]
});

await createRelation({
  from: `decision-${Date.now()}`,
  to: "project",
  relationType: "belongs_to"
});
```

### Pattern 3: Pattern Extraction

After implementing a pattern 2+ times:

```typescript
// Recognize and store patterns
await createEntity({
  name: "pattern-server-action-result",
  entityType: "pattern",
  observations: [
    "Name: Server Action Result Pattern",
    "Description: All server actions return Result<T, E> type",
    "Usage: Any function that can fail should use this",
    "Example: createUser returns Result<User, CreateUserError>",
    "Anti-pattern: Throwing errors from server actions"
  ]
});
```

### Pattern 4: Learning Capture

When debugging or discovering something:

```typescript
await createEntity({
  name: `learning-${Date.now()}`,
  entityType: "learning",
  observations: [
    `Context: Debugging slow dashboard load`,
    `Learning: TanStack Query with staleTime: Infinity caches indefinitely`,
    `Applicability: Any query that doesn't need automatic refetch`,
    `Date: ${new Date().toISOString()}`
  ]
});
```

---

## File-Based Memory Template

For projects not using MCP Memory Server:

### `.memory/CONTEXT.md`

```markdown
# Project Context

## Overview
- **Name:** [Project Name]
- **Type:** [Web / Mobile / Both]
- **Stack:** [Stack details]
- **Phase:** [Current development phase]
- **Team Size:** [Number of developers]

## Architecture Summary
[High-level architecture description]

## Key Files
| File | Purpose |
|------|---------|
| `/apps/web/app/page.tsx` | Landing page |
| `/packages/api/src/client.ts` | API client |

## Current Focus
[What we're currently working on]

## Recent Changes
- [Date]: [Change description]
```

### `.memory/DECISIONS.md`

```markdown
# Architectural Decisions

## ADR-001: [Decision Title]
**Date:** [Date]
**Status:** [Proposed / Accepted / Deprecated / Superseded]

### Context
[Why this decision was needed]

### Decision
[What was decided]

### Consequences
[Positive and negative impacts]

---

## ADR-002: [Next Decision]
...
```

### `.memory/PATTERNS.md`

```markdown
# Established Patterns

## Pattern: [Pattern Name]

### Description
[What this pattern is]

### When to Use
[Conditions for using this pattern]

### Implementation
```tsx
// Code example
```

### Anti-Patterns
- [What NOT to do]

---

## Pattern: [Next Pattern]
...
```

### `.memory/LEARNINGS.md`

```markdown
# Development Learnings

## [Date]: [Learning Title]

### Context
[Situation that led to this learning]

### Learning
[What was learned]

### Future Application
[When this applies in the future]

---
```

---

## Memory Maintenance

### Weekly Memory Cleanup

Remove or archive:
- Outdated decisions (superseded)
- Temporary workarounds (fixed)
- Obsolete patterns (deprecated)

### Memory Validation

Periodically verify:
- Patterns still match codebase
- Decisions still valid
- Team information current

### Memory Migration

When project structure changes:
- Update file paths in context
- Reflect new patterns
- Archive old decisions

---

## Integration with SSS Commands

### `/status` Command Integration

```markdown
<!-- In status output -->
## Memory Check
- Last context update: [date]
- Active patterns: [count]
- Pending decisions: [count]
- Recent learnings: [count]
```

### `/implement-prd` Integration

```markdown
<!-- Before implementation -->
Loading relevant memory:
- Patterns applicable to this feature: [list]
- Related decisions: [list]
- Team preferences for this area: [list]
```

---

## MCP Memory Server Tools Reference

### Available Operations

| Tool | Purpose | Example |
|------|---------|---------|
| `create_entities` | Create new memory entities | Create project, decision, pattern |
| `create_relations` | Link entities | Connect decision to project |
| `add_observations` | Add facts to entity | Add outcome to decision |
| `delete_entities` | Remove entities | Clean up obsolete |
| `delete_observations` | Remove facts | Update incorrect info |
| `delete_relations` | Unlink entities | Remove deprecated connections |
| `read_graph` | Query all entities | Load full context |
| `search_nodes` | Semantic search | Find relevant patterns |
| `open_nodes` | Get specific entities | Load decision details |

---

## Best Practices

### 1. Memory Granularity

```markdown
// ❌ BAD: Too coarse
Entity: "all-decisions"
Observations: ["We use Next.js, Supabase, decided on monorepo..."]

// ✅ GOOD: Granular, queryable
Entity: "decision-stack-nextjs"
Entity: "decision-db-supabase"  
Entity: "decision-architecture-monorepo"
```

### 2. Relationship Modeling

```markdown
// ✅ Model relationships explicitly
project -> has_decision -> decision-stack-nextjs
decision-stack-nextjs -> supersedes -> decision-stack-remix
pattern-server-actions -> belongs_to -> project
```

### 3. Observation Quality

```markdown
// ❌ BAD: Vague
"Decided to use TypeScript"

// ✅ GOOD: Actionable context
"Stack Decision: TypeScript strict mode enabled. Rationale: Catch errors at compile time, team expertise. Date: 2026-01-07. Applies to: all packages in monorepo."
```

---

## Anti-Patterns

### 1. Memory as Documentation Replacement

Memory supplements, doesn't replace:
- README files
- API documentation
- Code comments
- Architecture diagrams

### 2. Stale Memory

```markdown
// ❌ BAD: Memory says one thing, code does another
Memory: "Using REST API"
Reality: Migrated to tRPC 3 months ago
```

### 3. Memory Overload

```markdown
// ❌ BAD: Every small detail stored
"Changed button color from blue to green"
"Fixed typo in comment"

// ✅ GOOD: Significant decisions and learnings only
"Adopted shadcn/ui as component library - rationale: consistency, accessibility"
```

---

*Remember: AI memory is a tool for continuity and learning, not a replacement for proper documentation. Use it to preserve context that helps the AI be a better collaborator across sessions.*



