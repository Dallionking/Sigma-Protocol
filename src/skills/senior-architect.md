---
name: senior-architect
description: "Comprehensive software architecture skill for designing scalable, maintainable systems. Includes architecture diagram generation, system design patterns, tech stack decisions, and dependency analysis."
version: "1.0.0"
source: "@alirezarezvani/claude-skills"
triggers:
  - step-2-architecture
  - step-8-technical-spec
  - system-design
  - tech-stack-decision
  - scalability-review
---

# Senior Architect Skill

Comprehensive software architecture skill for designing scalable, maintainable systems. Use when designing system architecture, making technical decisions, creating architecture diagrams, evaluating trade-offs, or defining integration patterns.

## When to Invoke

Invoke this skill when:

- Designing system architecture (Step 2)
- Writing technical specifications (Step 8)
- Making tech stack decisions
- Evaluating scalability requirements
- Designing integrations between systems
- Reviewing architectural decisions

---

## Architecture Decision Framework

### 1. Context Gathering

Before making any architectural decision:

```markdown
## Context

### Business Requirements

- [Primary business goal]
- [Secondary goals]
- [Constraints (budget, timeline, team size)]

### Technical Requirements

- **Scale:** [Expected users, requests/sec, data volume]
- **Availability:** [SLA target, e.g., 99.9%]
- **Latency:** [P95 target, e.g., < 200ms]
- **Security:** [Compliance requirements]

### Team Context

- **Team size:** [N engineers]
- **Expertise:** [Languages, frameworks, platforms]
- **Constraints:** [Time zones, hiring plans]

### Existing Infrastructure

- [Current systems that must integrate]
- [Legacy systems to consider]
```

### 2. Option Analysis

```markdown
## Architecture Options

### Option A: [Name]

**Description:** [High-level description]

**Diagram:**
```

[ASCII or mermaid diagram]

```

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Risks:**
- [Risk 1] - Mitigation: [How to address]

**Effort:** [T-shirt size: S/M/L/XL]

**Cost:** [Monthly estimate]

---

### Option B: [Name]
[Same structure]

---

### Option C: [Name]
[Same structure]
```

### 3. Decision Matrix

```markdown
## Decision Matrix

| Criteria           | Weight | Option A | Option B | Option C |
| ------------------ | ------ | -------- | -------- | -------- |
| Scalability        | 25%    | 8/10     | 9/10     | 7/10     |
| Maintainability    | 20%    | 7/10     | 8/10     | 9/10     |
| Cost               | 15%    | 6/10     | 5/10     | 8/10     |
| Time to Market     | 20%    | 9/10     | 6/10     | 7/10     |
| Team Expertise     | 10%    | 8/10     | 5/10     | 9/10     |
| Future Flexibility | 10%    | 7/10     | 9/10     | 6/10     |
| **Weighted Total** | 100%   | 7.45     | 7.10     | 7.60     |
```

---

## System Design Patterns

### Monolith vs Microservices

| Factor         | Monolith            | Microservices                    |
| -------------- | ------------------- | -------------------------------- |
| **Team Size**  | < 10 engineers      | > 20 engineers                   |
| **Deployment** | Simple, single unit | Complex, independent             |
| **Scaling**    | Vertical first      | Horizontal per service           |
| **Complexity** | Lower initial       | Higher initial                   |
| **Best For**   | MVPs, small teams   | Large orgs, varied scaling needs |

**Rule of Thumb:** Start monolith, extract services when needed.

### Event-Driven Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Service A  │───▶│   Message   │───▶│  Service B  │
│  (Producer) │    │    Queue    │    │  (Consumer) │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Service C  │
                   │  (Consumer) │
                   └─────────────┘
```

**When to Use:**

- Async processing required
- Services need loose coupling
- Event sourcing/audit trail needed
- Variable load/spike handling

### API Gateway Pattern

```
                    ┌─────────────────────┐
                    │     API Gateway     │
   Clients ────────▶│  - Authentication  │
                    │  - Rate Limiting   │
                    │  - Routing         │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Service A  │     │  Service B  │     │  Service C  │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### CQRS (Command Query Responsibility Segregation)

```
                     ┌─────────────┐
       Commands ────▶│   Write     │───▶ Write DB
                     │   Model     │        │
                     └─────────────┘        │
                                            │ Events
                                            ▼
       Queries ─────▶┌─────────────┐     ┌─────────────┐
                     │   Read      │◀────│   Read DB   │
                     │   Model     │     │ (Optimized) │
                     └─────────────┘     └─────────────┘
```

**When to Use:**

- Read/write patterns differ significantly
- Complex querying requirements
- High read-to-write ratio

---

## Tech Stack Decision Framework

### Database Selection

| Requirement                | Recommended                 | Avoid          |
| -------------------------- | --------------------------- | -------------- |
| ACID compliance, relations | PostgreSQL                  | MongoDB        |
| High-throughput writes     | Cassandra, ScyllaDB         | SQLite         |
| Complex queries, reporting | PostgreSQL                  | DynamoDB       |
| Simple key-value           | Redis, DynamoDB             | PostgreSQL     |
| Document storage           | MongoDB, PostgreSQL (JSONB) | MySQL          |
| Time-series data           | TimescaleDB, InfluxDB       | Standard RDBMS |
| Search                     | Elasticsearch, Meilisearch  | LIKE queries   |

### Frontend Framework Selection

| Requirement         | Recommended           |
| ------------------- | --------------------- |
| SSR/SEO important   | Next.js, Nuxt         |
| SPA, client-heavy   | React SPA, Vue        |
| Content-heavy sites | Astro, Next.js        |
| Mobile + Web        | React Native + React  |
| Real-time UI        | React + WebSocket/SSE |

### Backend Framework Selection

| Requirement           | Recommended                 |
| --------------------- | --------------------------- |
| Rapid development     | Next.js API Routes, FastAPI |
| Enterprise, stability | NestJS, Spring Boot         |
| High performance      | Go (Fiber), Rust (Axum)     |
| Data-heavy, ML        | Python (FastAPI, Django)    |
| Real-time, WebSocket  | Elixir (Phoenix), Node.js   |

---

## Architecture Diagram Templates

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                             │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│    │   Web    │    │  Mobile  │    │   API    │           │
│    │  (Next)  │    │  (RN/FL) │    │ Clients  │           │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘           │
└─────────┼───────────────┼───────────────┼──────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                    ┌─────▼─────┐
                    │    CDN    │
                    │ (Vercel)  │
                    └─────┬─────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                   ┌─────▼─────┐                             │
│                   │    API    │                             │
│                   │  Gateway  │                             │
│                   └─────┬─────┘                             │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐             │
│    │                    │                    │             │
│ ┌──▼───┐          ┌─────▼─────┐        ┌────▼────┐        │
│ │ Auth │          │    Core   │        │  Async  │        │
│ │ Svc  │          │  Service  │        │  Worker │        │
│ └──┬───┘          └─────┬─────┘        └────┬────┘        │
│    │                    │                    │             │
│    └────────────────────┼────────────────────┘             │
│                         │                                   │
│              ┌──────────┼──────────┐                       │
│              │          │          │                       │
│         ┌────▼───┐ ┌────▼───┐ ┌────▼───┐                  │
│         │Postgres│ │ Redis  │ │  S3    │                  │
│         │   DB   │ │ Cache  │ │ Files  │                  │
│         └────────┘ └────────┘ └────────┘                  │
│                                                            │
│                    INFRASTRUCTURE                          │
└────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Action
     │
     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Validate │────▶│ Process │────▶│ Persist │
│  Input   │     │ Business│     │  Data   │
└─────────┘     │  Logic  │     └────┬────┘
                └─────────┘          │
                                     │
                     ┌───────────────┘
                     │
              ┌──────▼──────┐
              │   Publish   │
              │   Events    │
              └──────┬──────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Notify  │   │ Update  │   │  Sync   │
│  User   │   │  Cache  │   │ Search  │
└─────────┘   └─────────┘   └─────────┘
```

---

## Scalability Checklist

### Horizontal Scaling Readiness

- [ ] Stateless services (no session affinity)
- [ ] Externalized configuration
- [ ] Shared nothing architecture
- [ ] Load balancer ready
- [ ] Database connection pooling
- [ ] Cache layer implemented

### Performance Optimization

- [ ] Database indexes optimized
- [ ] N+1 queries eliminated
- [ ] Caching strategy defined
- [ ] CDN for static assets
- [ ] Async processing for heavy tasks
- [ ] Connection pooling configured

### Resilience

- [ ] Circuit breakers implemented
- [ ] Retry logic with backoff
- [ ] Graceful degradation
- [ ] Health checks defined
- [ ] Timeouts configured
- [ ] Bulkhead isolation

---

## Integration with Sigma Protocol

### Step 2 (Architecture)

Use this skill to design comprehensive system architecture.

### Step 8 (Technical Spec)

Apply these patterns when specifying technical implementation.

### Tech Stack Decisions

Reference selection frameworks when choosing technologies.

### Scalability Reviews

Use checklists to evaluate architecture readiness.

---

## MCP Integration

```javascript
// Research architecture patterns
mcp_exa_web_search_exa({
  query: "microservices architecture patterns 2025",
});

// Find case studies
mcp_exa_web_search_exa({
  query: "scalability case study startup growth",
});
```

---

_Remember: The best architecture is one that evolves. Start simple, measure everything, and scale what becomes a bottleneck._
