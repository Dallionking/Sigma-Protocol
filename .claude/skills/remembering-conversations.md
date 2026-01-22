---
name: remembering-conversations
description: "Search previous AI assistant conversations for facts, patterns, decisions, and context using semantic or text search. Use for long-running projects to maintain context continuity."
version: "1.0.0"
source: "@obra/superpowers-skills"
triggers:
  - context-recall
  - previous-discussion
  - decision-history
  - conversation-search
  - project-memory
---

# Remembering Conversations Skill

Search previous AI assistant conversations for facts, patterns, decisions, and context using semantic or text search. This skill helps maintain continuity across long-running projects.

## When to Invoke

Invoke this skill when:

- User references a previous discussion ("as we discussed")
- Need to recall project decisions or rationale
- Looking for previously established patterns
- Building on earlier work or context
- User asks about past conversations

---

## Context Recall Patterns

### 1. Decision Archaeology

When you need to understand why a decision was made:

```markdown
## Decision Recall Request

**Decision Area:** [Architecture/Design/Technical/Business]
**Keywords to Search:** [relevant terms]
**Timeframe:** [if known]

**Questions to Answer:**

- What was decided?
- Why was it decided this way?
- What alternatives were considered?
- Who made the decision?
- Are there documented trade-offs?
```

### 2. Pattern Recognition

When looking for established patterns in the project:

```markdown
## Pattern Search

**Looking For:**

- Naming conventions
- Code structure patterns
- API design patterns
- Error handling approaches
- Testing strategies

**Search Terms:**

- "[pattern name]"
- "we decided to"
- "convention is"
- "standard approach"
```

### 3. Context Continuity

When resuming work after a break:

```markdown
## Context Restoration

**Project:** [name]
**Last Active:** [date if known]

**Recall:**

1. What were we working on?
2. What was the current state?
3. What were the next steps?
4. Were there any blockers?
5. Any pending decisions?
```

---

## Search Strategies

### Text-Based Search

For specific terms, names, or phrases:

```
Search: "authentication flow"
Search: "database schema"
Search: "API endpoint"
Search: "[specific error message]"
```

### Semantic Search

For concepts and related discussions:

```
Query: "discussions about performance optimization"
Query: "decisions around user authentication"
Query: "rationale for choosing [technology]"
Query: "alternatives considered for [feature]"
```

### Temporal Search

For time-bounded context:

```
Query: "last week's discussions about [topic]"
Query: "initial architecture discussions"
Query: "recent changes to [component]"
```

---

## Documentation Patterns

### Decision Log

Maintain a living document of decisions:

```markdown
# Decision Log

## 2025-01-05: Authentication Strategy

**Decision:** Use NextAuth.js with database sessions

**Context:**

- Need to support multiple OAuth providers
- Require server-side session validation
- Team familiar with Next.js ecosystem

**Alternatives Considered:**

1. Auth0 - Rejected (cost at scale)
2. Clerk - Rejected (vendor lock-in concerns)
3. Custom JWT - Rejected (security complexity)

**Decided By:** Technical Lead
**Related Discussions:** [links to conversations]
```

### Context Checkpoints

Create periodic summaries:

```markdown
# Context Checkpoint: 2025-01-05

## Current State

- Authentication: Implemented and tested
- Database: Schema finalized, migrations ready
- Frontend: Dashboard layout complete

## In Progress

- User settings page
- API rate limiting
- Email notifications

## Blockers

- Waiting on design review for settings page
- Need decision on email provider

## Next Steps

1. Complete settings page after design review
2. Implement rate limiting
3. Set up email infrastructure

## Key Decisions This Period

- Chose Resend for transactional email
- Decided on PostgreSQL over MySQL
```

---

## Memory Organization

### Project Knowledge Base

Structure for maintaining project memory:

```
docs/
├── decisions/
│   ├── ADR-001-authentication.md
│   ├── ADR-002-database.md
│   └── ADR-003-frontend-framework.md
├── context/
│   ├── checkpoint-2025-01.md
│   ├── checkpoint-2025-02.md
│   └── glossary.md
└── conversations/
    ├── architecture-discussions.md
    └── design-decisions.md
```

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: Authentication Strategy

## Status

Accepted

## Context

We need to implement user authentication for the application. Requirements:

- Support for email/password
- Support for OAuth (Google, GitHub)
- Session management
- Role-based access control

## Decision

We will use NextAuth.js with Prisma adapter and PostgreSQL for session storage.

## Consequences

### Positive

- Mature, well-documented library
- Built-in support for many OAuth providers
- Active community and maintenance
- Type-safe with TypeScript

### Negative

- Tied to Next.js ecosystem
- Some learning curve for team
- Limited customization for edge cases

## Related

- PRD: Authentication Feature
- Design: Login/Signup Flows
```

---

## Recall Commands

### Quick Recall

```
/recall [topic]
```

Searches conversation history for relevant context.

### Decision Lookup

```
/decision [area]
```

Finds documented decisions in the specified area.

### Context Restore

```
/context [project]
```

Restores context for the specified project.

---

## Best Practices

### During Conversations

- Document important decisions as they're made
- Summarize key points at natural breakpoints
- Create explicit checkpoints before long pauses
- Tag decisions with categories for easy retrieval

### For Recall

- Use specific keywords when possible
- Provide context about the timeframe
- Start with broader searches, then narrow
- Verify recalled information before acting on it

### For Continuity

- Create checkpoint summaries weekly
- Maintain ADRs for architectural decisions
- Keep a glossary of project-specific terms
- Document rationale, not just decisions

---

## Integration with SSS Protocol

### Project Continuity

Use this skill to maintain context across SSS workflow sessions.

### Decision Tracking

Reference past architecture and design decisions.

### Pattern Consistency

Ensure new work aligns with established patterns.

### Onboarding

Help new team members understand project history.

---

## Limitations

- Search quality depends on conversation history availability
- May not have access to very old conversations
- Context can be incomplete if not documented
- Should verify critical information independently

---

_Remember: Good documentation is the foundation of good recall. Document decisions as you make them, and future you will thank past you._
