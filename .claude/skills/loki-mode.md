---
name: loki-mode
description: Use when orchestrating multiple AI agents for complex tasks, coordinating parallel work streams, or resolving inter-agent conflicts
version: 1.0.0
tags: [multi-agent, orchestration, coordination, parallel-execution, conflict-resolution]
triggers: [multi-agent, orchestration, coordinate, parallel agents, swarm, loki, agent coordination]
---

# Loki Mode: Multi-Agent Orchestration

Multi-agent orchestration patterns from the Antigravity framework. Use when a single agent cannot efficiently complete a task due to scope, parallelism requirements, or specialized domain knowledge.

## Overview

Loki Mode transforms complex tasks into coordinated multi-agent operations. The core principle: **decompose work into independent units, assign to specialized agents, coordinate results, resolve conflicts**.

Key insight: Multi-agent systems trade single-agent coherence for parallelism and specialization. Use when benefits outweigh coordination overhead.

## When to Use

**Use multi-agent when:**
- Task has 3+ independent subtasks that can run in parallel
- Subtasks require different domain expertise (frontend, backend, security)
- Single-agent context window would overflow
- Speed matters more than minimal coordination overhead
- Task requires adversarial review (one agent checks another)

**Use single-agent when:**
- Task is highly sequential with tight dependencies
- Context needs to flow continuously across steps
- Coordination overhead exceeds parallelism gains
- Task requires consistent voice/style throughout

```
Subtasks > 2 AND independent?
    ├── YES → Multi-agent (Loki Mode)
    └── NO → Single agent or sequential handoff
```

## Role Assignment Patterns

### Specialist Agents

Assign agents to specific domains. Each agent loads only relevant skills and context.

| Role | Focus | Skills Loaded |
|------|-------|---------------|
| **Architect** | System design, API contracts | architecture-patterns, api-design |
| **Frontend** | UI components, state, UX | frontend-design, react-performance |
| **Backend** | Business logic, data, APIs | database patterns, security |
| **QA** | Testing, edge cases, validation | verification, tdd-skill-creation |
| **Security** | Vulnerabilities, auth, data protection | security-audit, authentication |
| **Docs** | README, API docs, comments | writing-clearly, doc-coauthoring |

**Assignment rule:** Each agent owns ONE domain. Overlap creates conflicts.

### Generalist Agents

Use generalists when domains blur or task count exceeds specialist availability.

```
IF task_count > specialist_slots:
    Use generalists with balanced load
ELSE:
    Use specialists with domain ownership
```

## Inter-Agent Communication Protocols

### Message Types

| Type | Purpose | Example |
|------|---------|---------|
| **Task** | Assign work | "Implement user auth endpoint" |
| **Result** | Report completion | "Auth endpoint complete, tests pass" |
| **Dependency** | Declare blocker | "Need API contract before implementation" |
| **Conflict** | Flag disagreement | "Security agent rejects auth approach" |
| **Query** | Request information | "What is the database schema for users?" |

### Communication Patterns

**Broadcast:** One-to-many. Orchestrator announces to all agents.
```
Orchestrator → [Agent A, Agent B, Agent C]
Message: "API contract finalized, proceed with implementation"
```

**Direct:** One-to-one. Agent requests from specific peer.
```
Frontend → Backend
Message: "Need user endpoint response schema"
```

**Escalation:** Agent-to-orchestrator. Unresolved issues bubble up.
```
Agent A → Orchestrator
Message: "Conflict with Agent B on auth approach, requesting resolution"
```

## Conflict Resolution

When agents disagree, apply resolution hierarchy:

### Resolution Hierarchy

1. **Explicit constraint wins:** If requirements specify approach, that wins
2. **Security over convenience:** Security agent vetoes insecure patterns
3. **Domain owner decides:** For domain-specific questions, domain expert wins
4. **Orchestrator breaks ties:** When peers cannot resolve, escalate

### Conflict Types

| Conflict | Resolution |
|----------|------------|
| **Technical approach** | Domain owner decides |
| **Security concern** | Security agent vetoes |
| **Resource allocation** | Orchestrator decides |
| **API contract** | Architect decides, implementers comply |
| **Scope creep** | Orchestrator enforces original scope |

### Resolution Protocol

```
1. Agent A flags conflict with Agent B
2. Both agents present reasoning (max 100 words each)
3. Apply resolution hierarchy
4. Winner implements, loser acknowledges
5. Document decision for future reference
```

## Task Decomposition for Parallel Execution

### Decomposition Criteria

| Criterion | Good for Parallel | Bad for Parallel |
|-----------|-------------------|------------------|
| **Dependencies** | None or one-way | Circular or many |
| **Shared state** | Read-only or isolated | Heavy writes |
| **Output format** | Combinable | Must interleave |
| **Domain** | Distinct | Overlapping |

### Decomposition Workflow

1. **Map dependencies:** Draw task graph
2. **Identify clusters:** Group tightly-coupled tasks
3. **Assign clusters:** One cluster per agent
4. **Define interfaces:** API contracts between clusters
5. **Parallelize:** Independent clusters run simultaneously

### Example Decomposition

```
Feature: User Dashboard

Parallel clusters:
├── Cluster A (Frontend): Dashboard UI, charts, layout
├── Cluster B (Backend): Data endpoints, aggregations
├── Cluster C (Auth): Permission checks, session management
└── Cluster D (Tests): E2E tests, unit tests

Dependencies:
- A depends on B (API contract, not implementation)
- A depends on C (auth context)
- D depends on A, B, C (runs after implementation)

Execution:
- Phase 1: B and C in parallel (define contracts)
- Phase 2: A in parallel with B/C implementation
- Phase 3: D after all complete
```

## Coordination Patterns

### Hierarchical

Orchestrator assigns, agents report. Clear authority, potential bottleneck.

```
        Orchestrator
       /     |      \
  Agent A  Agent B  Agent C
```

**Use when:** Clear task ownership, need central control, resolving conflicts

### Peer-to-Peer

Agents communicate directly. Fast, but can deadlock without protocol.

```
  Agent A ←→ Agent B
     ↕          ↕
  Agent C ←→ Agent D
```

**Use when:** Agents need frequent coordination, tasks tightly coupled

### Blackboard

Shared state where agents read/write. Good for incremental building.

```
  Agent A → [Blackboard] ← Agent B
               ↑
            Agent C
```

**Use when:** Building shared artifact, agents contribute pieces

**Blackboard rules:**
- Agents claim sections before writing
- Read freely, write to owned sections only
- Orchestrator resolves write conflicts

## Workflow Example

### Scenario: Implement Authentication System

```
Phase 1: Planning (Hierarchical)
├── Orchestrator decomposes into clusters
├── Assigns: Auth Agent, API Agent, Frontend Agent, Test Agent
└── Distributes API contracts

Phase 2: Implementation (Peer-to-Peer + Blackboard)
├── Auth Agent: JWT implementation, writes to auth-service/
├── API Agent: Endpoints, writes to api/
├── Frontend Agent: Login UI, writes to components/
├── Agents query each other for interface details
└── All write to shared types/ directory (blackboard)

Phase 3: Integration (Hierarchical)
├── Test Agent runs integration tests
├── Conflicts escalate to Orchestrator
└── Orchestrator merges, resolves, finalizes

Phase 4: Review (Peer-to-Peer)
├── Security Agent reviews Auth Agent work
├── Each agent reviews adjacent domain
└── Final approval by Orchestrator
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **God Orchestrator** | Orchestrator does work, not just coordination | Orchestrator only assigns, routes, resolves |
| **Chatty Agents** | Excessive inter-agent communication | Define clear interfaces upfront |
| **Scope Drift** | Agents expand beyond assigned cluster | Strict scope enforcement |
| **Conflict Avoidance** | Agents silently work around disagreements | Mandatory conflict escalation |
| **Serial Disguised** | Sequential execution labeled parallel | Verify true independence before parallelizing |
| **Missing Contracts** | Agents assume interface details | API contracts before implementation |

## Checklist

Before launching multi-agent operation:

- [ ] Task has 3+ independent subtasks
- [ ] Subtasks mapped to clusters with clear boundaries
- [ ] API contracts defined between clusters
- [ ] Agents assigned to clusters (specialist or generalist)
- [ ] Communication protocol selected (hierarchical, peer, blackboard)
- [ ] Conflict resolution hierarchy established
- [ ] Orchestrator identified for tie-breaking
- [ ] Success criteria defined per cluster
- [ ] Integration phase planned

During execution:

- [ ] Agents report progress, not just completion
- [ ] Conflicts escalate within 1 turn of detection
- [ ] Scope drift caught and corrected immediately
- [ ] Contracts honored, changes negotiated

After completion:

- [ ] All clusters integrated
- [ ] Cross-agent review completed
- [ ] Conflicts documented with resolutions
- [ ] Lessons learned for next orchestration

## Integration with Sigma Protocol

Cross-reference with:
- `@dispatching-parallel-agents` - Agent dispatch mechanics
- `@subagent-driven-development` - Subagent patterns
- `@executing-plans` - Plan execution with agents
- `@verification-before-completion` - Validation before declaring done

---

_Remember: Multi-agent coordination is a means, not an end. If single-agent works, use it. Loki Mode shines when parallelism and specialization justify coordination overhead._
