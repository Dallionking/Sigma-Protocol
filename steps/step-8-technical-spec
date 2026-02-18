---
version: "2.3.0"
last_updated: "2026-01-07"
changelog:
  - "2.3.0: Added Step 11 PRD Framework Alignment section in Phase H - ensures technical specs align with Step 11's new backend frameworks (OWASP, RLS, Result Pattern, etc.)"
  - "2.2.0: Added Boilerplate Foundation section for documenting extensions vs full system specs"
  - "2.1.0: Added TanStack Start as web framework option, added icon library recommendations (Lucide, Phosphor), expanded framework decision guide"
description: "Step 8: Technical Specification & Development Blueprint - Most comprehensive spec combining all previous steps into development-ready documentation"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url
  - mcp_exa_web_search_exa
  - mcp_exa_get_code_context_exa
  - mcp_exa_crawling_exa
  - mcp_exa_company_research_exa
  - mcp_exa_linkedin_search_exa
  - mcp_exa_deep_researcher_start
  - mcp_exa_deep_researcher_check

  # ALWAYS ACTIVE (Specialized)
  - mcp_supabase-mcp-server_search_docs

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --depth
---

# /step-8-technical-spec — Technical Specification & Development Blueprint (Distinguished Engineer + $1B Valuation Context)

**Mission**  
Run a complete, interactive **Step-6: Technical Specification → Development Blueprint** for a startup project in one go. 
**Valuation Context:** You are a **Distinguished Engineer at a FAANG Company**. This is the **definitive development blueprint**. It must be **comprehensive, rigorous, and implementation-ready**. No vague "TBDs".

This command:
- **CRITICAL**: This is the **most comprehensive spec** - combines ALL previous steps into development-ready documentation.
- Invokes **FAANG-level specialist personas** (Principal Architect/Security/Data/API/DevOps/Frontend/Backend).
- Produces the **definitive development blueprint** and a comprehensive **/docs pack**, with **human-in-the-loop** checkpoints.
- **Hard-stops for your approval** before Step-9 (Landing Page - optional) or Step-10 (Feature Breakdown).

---

<goal>
You are a Distinguished Engineer at a FAANG company creating the definitive development blueprint. Execute ALL phases (A through M) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| A | Executive Technical Summary | High-level technical overview |
| B | Complete System Architecture | Architecture diagrams and decisions |
| C | Technology Stack (Detailed) | Full stack specification |
| D | Database Design (Comprehensive) | Database schema and RLS |
| E | API Design (Complete Specification) | API endpoints and contracts |
| F | Security Architecture (Comprehensive) | Security controls and threat model |
| G | Frontend Implementation Specs | Frontend patterns and structure |
| H | Backend Implementation Specs | Backend patterns and structure |
| I | Infrastructure & Deployment | Deployment and ops specs |
| J | Testing Strategy | Test plan and quality gates |
| K | Development Workflow | Dev process and tooling |
| L | Risk Assessment & Mitigations | Risk register and mitigations |
| M | Assemble Technical Specification | TECHNICAL-SPEC.md file |

Final Outputs: /docs/technical/TECHNICAL-SPEC.md
Quality gate: Implementation-ready, comprehensive, no TBDs (85+/100 score)
</goal>

---

## BOILERPLATE FOUNDATION (NEW - If Using SSS Boilerplate)

**If your project uses an SSS boilerplate, technical specs document EXTENSIONS, not the entire system.**

### Detection

```bash
# Check for boilerplate
cat .sigma/boilerplate.json 2>/dev/null
```

### If Boilerplate Detected

**The boilerplate already provides these specifications:**

| Layer | Already Specified | Document Location |
|-------|------------------|-------------------|
| Auth | Supabase Auth flow | `lib/supabase/` |
| Database | Core tables (users, subscriptions, credits) | Boilerplate schema |
| API | Base endpoints (/api/auth, /api/webhooks) | Boilerplate routes |
| Payments | Stripe integration | `lib/stripe/` |
| Credits | Usage tracking system | `hooks/use-credits.ts` |

**Your job in Step 8:**
- Document **project-specific entities** (not users, subscriptions)
- Specify **custom API endpoints** (not auth, payments)
- Define **extension database tables**
- Reference boilerplate stable APIs

### Technical Spec Template for Boilerplate Projects

```markdown
# Technical Specification: [Project Name]

## Foundation
This specification extends the `nextjs-saas` boilerplate (v1.0.0).

### Pre-Built Infrastructure (Do Not Re-Specify)

| Component | Boilerplate API | Stable Since |
|-----------|-----------------|--------------|
| Authentication | `useAuth()` hook | v1.0.0 |
| Credits | `useCredits()` hook | v1.0.0 |
| Subscription | `useSubscription()` hook | v1.0.0 |
| Database Client | `createClient()` from lib/supabase | v1.0.0 |

### Project-Specific Additions

#### New Database Tables

| Table | Purpose | Extends |
|-------|---------|---------|
| [table_name] | [purpose] | FK to users |

#### New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/[project]/[resource] | GET/POST | [purpose] |

#### New Hooks

| Hook | Purpose | Uses |
|------|---------|------|
| use[Feature]() | [purpose] | useAuth, useCredits |
```

### Database Extension Rules

**✅ DO:**
- Add new tables with FK to `users.id`
- Create new RLS policies on your tables
- Add indexes for your queries

**❌ DON'T:**
- Modify `users` table structure
- Modify `subscriptions` table
- Change existing RLS policies

### API Extension Rules

**✅ DO:**
- Add routes in `/api/[project]/`
- Use boilerplate auth utilities
- Follow existing patterns

**❌ DON'T:**
- Modify `/api/auth/` routes
- Change webhook handlers
- Alter base middleware

---
**>>> CHECKPOINT: BOILERPLATE EXTENSION APPROVAL <<<**

Present the boilerplate extension approach and what will be documented vs. inherited to the user.
**Do NOT continue to Phase A (Executive Technical Summary) until the user explicitly approves.**

Reply `confirm extend` to continue with extension documentation, or `full spec` to document everything from scratch.
---

---

## TECHNICAL SPECIFICATION FRAMEWORKS (MANDATORY APPLICATION)

### Building on Previous Steps — The Synthesis Point

**Step 8 is the SYNTHESIS of all previous steps into implementation-ready documentation.**

```
STEP DEPENDENCIES (All Must Be Loaded)
├─ Step 1: PRD (/docs/specs/MASTER_PRD.md) → Features, user stories, success metrics
├─ Step 2: Architecture (/docs/architecture/) → System design, tech stack, ADRs
├─ Step 3: UX Design (/docs/ux/) → User flows, information architecture
├─ Step 4: Flow Tree (/docs/flows/) → Screen architecture, comprehensive flows
│   ├─ FLOW-TREE.md → Hierarchical flow structure
│   ├─ SCREEN-INVENTORY.md → Complete screen list
│   └─ TRACEABILITY-MATRIX.md ⭐ → PRD feature-to-screen mapping (VERIFY)
├─ Step 5: Wireframe Prototypes (if used) → Runnable demos, component inventory
│   ├─ /docs/prds/flows/FLOW-*.md → Per-flow PRDs
│   ├─ WIREFRAME-TRACKER.md ⭐ → Screen-to-wireframe tracking
│   └─ ZERO-OMISSION-CERTIFICATE.md ⭐ → Proof of 100% coverage
├─ Step 6: Design System (/docs/design/) → Components, tokens, patterns
└─ Step 7: Interface States (/docs/states/) → All states, micro-interactions
```

### Bulletproof Verification (Before Starting Step 8)

**⚠️ CRITICAL: Before writing technical specs, verify prior step completeness:**

```markdown
## Pre-Step-8 Verification

| Check | Source | Status |
|-------|--------|--------|
| PRD features mapped to screens? | /docs/flows/TRACEABILITY-MATRIX.md | ✅ / ❌ |
| All screens have wireframe PRDs? | /docs/prds/flows/ZERO-OMISSION-CERTIFICATE.md | ✅ / ❌ |
| Screen count matches? | Step 4 = Step 5? | ✅ / ❌ |

**IF ANY CHECK FAILS:** Go back and complete prior steps first.
```

---

### The Master Architects — Apply to Technical Specs

**Every technical specification MUST apply these frameworks.**

---

### Framework 1: John Ousterhout — Specification Clarity
**Core Philosophy:** *"Complexity is death by a thousand cuts."*

**For Technical Specs:**
- **Deep Specifications** — Simple interface descriptions hiding implementation complexity
- **No Unknown Unknowns** — Every edge case documented
- **Reduce Cognitive Load** — Developers can implement without asking questions
- **Strategic Investment** — Spend time on spec quality to save implementation time

**Spec Quality Checklist:**
- [ ] Can a developer implement this without asking clarifying questions?
- [ ] Are all edge cases and error states documented?
- [ ] Is the "why" as clear as the "what"?
- [ ] Are interfaces defined before implementations?

---

### Framework 2: Clean Architecture in Specs
**Core Philosophy:** *"Dependencies point inward — spec the layers clearly."*

**Technical Spec Structure:**
```
ENTITIES (Core Domain)
├─ Data models with all attributes
├─ Validation rules
├─ Business invariants
└─ Relationships and constraints

USE CASES (Application Logic)
├─ User stories → implementation steps
├─ Input/output contracts
├─ Business rule implementations
└─ Error handling per use case

INTERFACE ADAPTERS (API/UI)
├─ API endpoints with full schemas
├─ Request/response formats
├─ UI component specs
└─ Data transformation rules

FRAMEWORKS & DRIVERS
├─ Database schemas (SQL/NoSQL)
├─ External service integrations
├─ Infrastructure configuration
└─ Deployment specifications
```

**Spec Checklist:**
- [ ] Are domain entities defined independent of database schema?
- [ ] Are use cases specified with clear inputs/outputs?
- [ ] Are API contracts defined with OpenAPI/GraphQL schema?
- [ ] Is infrastructure specified but decoupled from business logic?

---

### Framework 3: Domain-Driven Design in Specs
**Core Philosophy:** *"The spec should speak the domain language."*

**DDD in Technical Specs:**
- **Ubiquitous Language** — Use the same terms as PRD and stakeholders
- **Bounded Contexts** — Separate specs for separate domains
- **Aggregates** — Define consistency boundaries in data specs
- **Domain Events** — Spec the events that drive the system

**Spec Checklist:**
- [ ] Do spec terms match PRD and user language?
- [ ] Are module boundaries clear?
- [ ] Are data consistency boundaries defined?
- [ ] Are domain events documented?

---

### Framework 4: ADRs in Technical Specs
**Core Philosophy:** *"Document decisions with context, not just conclusions."*

**Include ADRs for:**
- Tech stack choices (from Step 2)
- API design decisions (REST vs GraphQL vs tRPC)
- Database schema decisions (normalization vs denormalization)
- Security architecture decisions
- Performance trade-offs

**ADR Template (Include in Spec):**
```markdown
### ADR: [Decision Title]
**Context:** Why is this decision needed?
**Decision:** What did we choose?
**Consequences:** 
- ✅ Benefits
- ⚠️ Trade-offs
**Alternatives Rejected:** What else was considered?
```

---

### Framework 5: C4 Model for Technical Diagrams
**Core Philosophy:** *"Different zoom levels for different audiences."*

**Required Diagrams in Technical Spec:**
```
LEVEL 1: CONTEXT (Executive Summary)
└─ System in its environment, external actors

LEVEL 2: CONTAINERS (System Architecture)
└─ Applications, databases, message queues

LEVEL 3: COMPONENTS (Module Design)
└─ Major components within each container

SEQUENCE DIAGRAMS (Data Flow)
└─ Key user flows, API interactions
```

**Diagram Checklist:**
- [ ] Context diagram in Executive Summary section?
- [ ] Container diagram in Architecture section?
- [ ] Sequence diagrams for critical flows?
- [ ] All diagrams in Mermaid (version controlled)?

---

### Framework 6: Kent Beck's Simplicity for Specs
**Core Philosophy:** *"Fewest elements that reveal intention."*

**Spec Writing Rules:**
1. **No TBDs** — Every section has concrete details or explicit assumptions
2. **No Redundancy** — Don't repeat what's in other sections
3. **Reveal Intention** — Why, not just what
4. **Testable Requirements** — Every requirement can be verified

---

### Framework 7: API Specification Best Practices
**Apply Richardson Maturity Model for REST, or GraphQL best practices:**

**REST API Spec Requirements:**
```
Level 0: Single endpoint (avoid)
Level 1: Resources (/users, /posts)
Level 2: HTTP verbs (GET, POST, PUT, DELETE)
Level 3: HATEOAS with links (optional, for discoverability)
```

**API Spec Must Include:**
- [ ] Full OpenAPI 3.1 specification
- [ ] Request/response examples for every endpoint
- [ ] Error response format and codes
- [ ] Authentication requirements per endpoint
- [ ] Rate limiting documentation
- [ ] Versioning strategy

---

### Framework 8: Database Specification Best Practices
**Apply normalization theory, then denormalize strategically:**

**Database Spec Must Include:**
- [ ] ERD diagram (Mermaid)
- [ ] Full CREATE TABLE statements or schema definitions
- [ ] Index strategy with rationale
- [ ] Foreign key relationships and cascades
- [ ] Soft delete strategy (if applicable)
- [ ] Audit columns (created_at, updated_at)
- [ ] Data migration strategy

---

### Technical Specification Quality Gates (MANDATORY)

**Every technical spec MUST pass these gates:**

```
COMPLETENESS GATE
├─ [ ] All 12 sections have concrete content (no TBDs)
├─ [ ] All previous steps referenced and synthesized
├─ [ ] Every feature from PRD has implementation spec
└─ [ ] Every user flow from UX has technical flow

CLARITY GATE (Ousterhout)
├─ [ ] Developer can implement without asking questions
├─ [ ] All edge cases documented
├─ [ ] All error states specified
└─ [ ] Interfaces defined before implementations

ARCHITECTURE GATE (Clean Architecture)
├─ [ ] Domain entities defined
├─ [ ] Use cases specified with I/O
├─ [ ] API contracts complete
└─ [ ] Infrastructure decoupled

DOCUMENTATION GATE
├─ [ ] All ADRs included
├─ [ ] All diagrams in Mermaid
├─ [ ] Version numbers for all dependencies
└─ [ ] Deployment instructions complete

TESTABILITY GATE
├─ [ ] Every requirement is testable
├─ [ ] Test strategy covers all critical paths
├─ [ ] Coverage targets defined
└─ [ ] E2E scenarios documented
```

---

## Preflight (auto)
1) **Get date**: run `date +"%Y-%m-%d"` and capture `TODAY`.  
2) **Create folders (idempotent)** if missing:
   - `/docs/technical`, `/docs/implementation`, `/docs/testing`, `/docs/adrs`
3) **Writing policy**: For large files, **write in small chunks** to avoid editor limits.
4) **CRITICAL PERFORMANCE DIRECTIVE**: Take your time. This is a 12-section comprehensive spec. Quality over speed.
5) **Load ALL Previous Steps**: Read outputs from Steps 1-7 before beginning. This is a SYNTHESIS step.

---

## Planning & Task Creation (CRITICAL - DO THIS FIRST)

**Before executing anything, you MUST:**

1. **Analyze Requirements**: Review ALL previous steps, understand full technical scope
2. **Create Task List**: Generate comprehensive 12-section task list with checkboxes
3. **Present Plan**: Show the user your complete technical spec plan
4. **Get Approval**: Wait for user to approve the plan before executing

**Task List Format** (create at the start):
```markdown
## Step-8 Technical Specification Development Plan

### Section 1: Executive Technical Summary
- [ ] Write project overview (2-3 sentences)
- [ ] Document key technical decisions
- [ ] Create high-level C4 Context Mermaid diagram
- [ ] Outline development timeline (Phase 1, 2, 3)
- [ ] CHECKPOINT: Present executive summary
- [ ] Wait for approval

### Section 2: Complete System Architecture
- [ ] Justify architecture pattern choice
- [ ] Create C4 Container diagram with all components
- [ ] Document data flow (Mermaid sequence diagrams)
- [ ] Specify infrastructure requirements
- [ ] CHECKPOINT: Present system architecture
- [ ] Wait for approval

### Section 3: Technology Stack (with versions)
- [ ] Research and document frontend stack with versions
- [ ] Research and document backend stack with versions
- [ ] Research and document database & data layer
- [ ] Research and document infrastructure tools
- [ ] Research and document AI & Realtime stack (if applicable)
- [ ] CHECKPOINT: Present complete tech stack
- [ ] Wait for approval

### Section 4: Database Design (comprehensive)
- [ ] Create ERD Mermaid diagram (all entities)
- [ ] Write complete SQL schema for each entity
- [ ] Design indexing strategy
- [ ] Document data integrity constraints
- [ ] Plan optimization (connection pooling, replicas, partitioning)
- [ ] CHECKPOINT: Present database design
- [ ] Wait for approval

### Section 5: API Design (complete spec)
- [ ] Define API architecture (REST/GraphQL/tRPC)
- [ ] Write OpenAPI 3.1 spec (or GraphQL schema)
- [ ] Document all core endpoints
- [ ] Define error response format
- [ ] CHECKPOINT: Present API design
- [ ] Wait for approval

### Section 6: Security Architecture (comprehensive)
- [ ] Design authentication & authorization (JWT, OAuth2, RBAC)
- [ ] Plan data security (encryption at rest/transit, PII, secrets)
- [ ] Document OWASP Top 10 mitigations
- [ ] Address compliance (GDPR/HIPAA/SOC2 if needed)
- [ ] CHECKPOINT: Present security architecture
- [ ] Wait for approval

### Section 7: Frontend Implementation Specs
- [ ] Document component architecture (atomic design)
- [ ] Specify state management approach
- [ ] Plan data fetching strategy
- [ ] Define performance optimizations
- [ ] CHECKPOINT: Present frontend specs
- [ ] Wait for approval

### Section 8: Backend Implementation Specs
- [ ] Design service architecture
- [ ] Document API layer (routes, middleware, schemas)
- [ ] Specify business logic layer
- [ ] Plan data access layer
- [ ] Define background jobs (if needed)
- [ ] CHECKPOINT: Present backend specs
- [ ] Wait for approval

### Section 9: Infrastructure & Deployment
- [ ] Specify hosting environment
- [ ] Write CI/CD pipeline YAML
- [ ] Plan environment management (dev/staging/prod)
- [ ] Define monitoring & observability setup
- [ ] CHECKPOINT: Present infrastructure
- [ ] Wait for approval

### Section 10: Testing Strategy
- [ ] Define testing pyramid (unit 70%, integration 20%, e2e 10%)
- [ ] Specify frontend testing (Vitest, Testing Library, Playwright)
- [ ] Specify backend testing
- [ ] Set coverage targets (80%+ overall, 100% critical)
- [ ] CHECKPOINT: Present testing strategy
- [ ] Wait for approval

### Section 11: Development Workflow
- [ ] Document Git workflow (branching, PRs, commits)
- [ ] Specify code quality tools (ESLint, Prettier, TypeScript)
- [ ] Plan documentation approach
- [ ] Define team coordination process
- [ ] CHECKPOINT: Present development workflow
- [ ] Wait for approval

### Section 12: Risk Assessment & Mitigations
- [ ] Identify technical risks with mitigations
- [ ] Identify project risks with mitigations
- [ ] CHECKPOINT: Present risk assessment
- [ ] Wait for approval

### Phase M: Document Assembly & File Creation
- [ ] Write `/docs/technical/TECHNICAL-SPEC.md` (all 12 sections)
- [ ] Write `/docs/technical/ARCHITECTURE-DIAGRAMS.md`
- [ ] Write `/docs/technical/TECH-STACK-DETAILED.md`
- [ ] Write `/docs/database/SCHEMA-COMPLETE.sql`
- [ ] Write `/docs/api/OPENAPI-SPEC.yaml`
- [ ] Write `/docs/security/SECURITY-DETAILED.md`
- [ ] Write `/docs/implementation/FRONTEND-SPEC.md`
- [ ] Write `/docs/implementation/BACKEND-SPEC.md`
- [ ] Write `/docs/ops/INFRASTRUCTURE.md`
- [ ] Write `/docs/testing/TESTING-STRATEGY.md`
- [ ] Write `/docs/ops/DEVELOPMENT-WORKFLOW.md`
- [ ] Write `/docs/ops/RISK-MITIGATION.md`
- [ ] Verify all quality gates pass
- [ ] FINAL checkpoint: Present complete technical specification
- [ ] Wait for final approval
```

**Execution Rules**:
- ✅ Check off EACH task as you complete it
- ✅ This is the MOST COMPREHENSIVE spec - take your time
- ✅ Do NOT skip ahead - complete all 12 sections in order
- ✅ Do NOT proceed to next section until user approves
- ✅ Take detailed notes to maintain context
- ✅ Write files in small chunks

---

## Inputs to capture (ask, then echo back as a table)
- **Stack Profile**: Read `/docs/stack-profile.json` (CRITICAL: Dictates Tech Stack, DB, AI, & Realtime)
- All previous steps (PRD, Architecture, UX, Design System, Interface States)
- Team composition (developers, designers, QA - skill levels)
- Timeline (weeks available, milestone dates)
- Budget constraints (infrastructure, third-party services)
- Development environment (local, cloud, CI/CD existing?)
- Optional: `detail:deep` to expand all 12 sections

> Ground rules: If any item is unknown, ask concise HITL questions now and proceed with clearly flagged assumptions.

---

## Persona Pack (used throughout)
- **Principal Software Architect (FAANG)** – system design, tech stack decisions, scalability architecture, **C4 model** diagrams, **ADR** (Architecture Decision Records).
- **Staff Security Architect** – **zero-trust**, **OAuth2/OIDC**, secret management, **OWASP Top 10**, compliance (**GDPR/HIPAA/SOC2**), penetration testing.
- **Principal Data Architect** – database schema, **normalization/denormalization**, indexing, partitioning, **CQRS**, event sourcing, data pipelines.
- **Staff API Architect** – **OpenAPI 3.1** spec, **REST maturity** (Richardson model), **GraphQL** schema, **tRPC**, API versioning, rate limiting.
- **Senior DevOps/Platform Engineer** – **Infrastructure as Code** (Terraform/Pulumi), **CI/CD** (GitHub Actions), **container orchestration** (K8s/ECS), observability (**OpenTelemetry**).
- **Staff Frontend Architect** – **React** architecture, **Next.js** patterns (SSR/SSG/ISR), state management, bundle optimization, **Lighthouse** scores.
- **Staff Backend Architect** – service design, **domain-driven design**, async processing (queues, workers), **microservices** vs. modular monolith.
- **QA/Test Architect** – testing pyramid (unit/integration/e2e), **test coverage** targets, **mutation testing**, performance testing, accessibility testing.

> Tone: comprehensive, implementation-ready, decision-oriented.

---

## Phase A — Executive Technical Summary
1) **Project Overview** (2-3 sentences):
   - What we're building
   - Primary business value
   - Target users and scale

2) **Key Technical Decisions**:
   - Architecture pattern (monolith/microservices/serverless)
   - Primary tech stack (frontend, backend, database)
   - AI & Realtime Strategy
   - Deployment strategy (cloud provider, hosting)
   - Development methodology (Agile, sprint length)

3) **High-Level Architecture Diagram** (Mermaid C4 Context):
   - System context
   - External integrations
   - Major components
   - Data flows

4) **Development Timeline**:
   - Phase 1: Foundation (weeks 1-X)
   - Phase 2: Core Features (weeks X-Y)
   - Phase 3: Enhancement (weeks Y-Z)

---
**>>> CHECKPOINT: PHASE A APPROVAL <<<**

Present executive summary and timeline to the user.
**Do NOT continue to Phase B until the user explicitly approves.**

Reply `approve a` or `revise: [feedback]`.
---

---

## Phase B — Complete System Architecture
1) **Architecture Pattern Justification**:
   - Chosen pattern with rationale
   - Alternatives considered
   - Trade-offs and benefits

2) **Component Breakdown** (C4 Container diagram):
   - Frontend application (tech, responsibilities)
   - Backend services (tech, domain boundaries)
   - Data layer (databases, caches, queues)
   - External services (auth, payments, email, AI, realtime)

3) **Data Flow Architecture** (Mermaid sequence diagrams):
   - User authentication flow
   - Primary feature flows
   - Background job processing
   - Real-time updates (if applicable)

4) **Infrastructure Requirements**:
   - Compute (CPU, memory, instances)
   - Storage (database, file storage, backups)
   - Network (CDN, load balancers, DNS)
   - Monitoring (logs, metrics, traces)

---
**>>> CHECKPOINT: SYSTEM ARCHITECTURE APPROVAL <<<**

Present the architecture diagrams, component breakdown, and data flow to the user.
**Do NOT continue to Phase C (Technology Stack) until the user explicitly approves.**

Reply `approve architecture` or `revise: [feedback]`.
---

---

## Phase C — Technology Stack (Detailed)

**IMPORTANT: Tech Stack is Flexible, Not Mandated**
Reference Step 2 Architecture decisions. The technologies below are **templates** — select based on project needs.

**Load from Step 2:** Read `/docs/architecture/TECH-STACK.md` and ADRs for context.

1) **Frontend Stack** (document with versions and ADR reference):
   
   **Common Options (Choose Based on Project):**
   | Category | Options | Document Version |
   |----------|---------|------------------|
   | Framework (Web) | Next.js / TanStack Start / Remix / Vue / Svelte | e.g., Next.js 15, TanStack Start |
   | Framework (Mobile) | Expo + React Native | e.g., Expo SDK 52 |
   | Styling | Tailwind CSS v4 / NativeWind (mobile) / CSS Modules | e.g., Tailwind 4.0 |
   | State | Zustand / Redux / Jotai / TanStack Query | e.g., Zustand 5.0 |
   | Forms | React Hook Form + Zod / Formik + Yup | Document choice |
   | Icons | Lucide React / Phosphor / Tabler / Heroicons | Lucide (recommended) |
   
   **Web Framework Decision Guide:**
   | Framework | Best For | Key Differentiator |
   |-----------|----------|-------------------|
   | **Next.js 15+** | Most projects, SSR/SSG, SEO-critical | React Server Components, App Router |
   | **TanStack Start** | Type-safe routing, Vite-native, client-first | File-based type-safe router, no RSC |
   | **Remix** | Full-stack, nested layouts, progressive enhancement | Loader/Action pattern |
   | **Expo** | iOS/Android mobile apps | React Native + managed workflow |

2) **Backend Stack** (document with versions and ADR reference):
   
   **Common Options:**
   | Category | Options | Document Version |
   |----------|---------|------------------|
   | Runtime | Node.js / Deno / Bun / Edge | e.g., Node.js 22 LTS |
   | API Style | REST / GraphQL / tRPC / Convex Functions | Document choice |
   | Auth | NextAuth / Supabase Auth / Clerk / Auth0 | Document choice |

3) **Database & Data** (document with schema approach):
   
   **Common Options:**
   | Category | Options | Document Version |
   |----------|---------|------------------|
   | Database | PostgreSQL / MySQL / MongoDB / Convex | e.g., PostgreSQL 16 |
   | ORM | Drizzle / Prisma / Convex / TypeORM | Document choice |
   | Validation | Zod / Yup / Valibot | e.g., Zod 3.24 |

4) **AI & Realtime** (if applicable):
   
   **Common Options:**
   | Category | Options | When to Use |
   |----------|---------|-------------|
   | AI SDK | Vercel AI SDK / LangChain / OpenAI direct | Chat, streaming |
   | Realtime | Supabase Realtime / Convex / Socket.io | Live updates |
   | Voice | LiveKit / Daily.co / Twilio | Voice/video |

5) **Infrastructure** (document with ADR for hosting choice):
   
   **Common Options:**
   | Category | Options | Trade-offs |
   |----------|---------|------------|
   | Frontend | Vercel / Netlify / Cloudflare Pages | DX vs Control |
   | Backend | Railway / Render / Fly.io / AWS | Cost vs Scale |
   | Database | Supabase / Neon / PlanetScale / Convex | Features vs Lock-in |
   | Monitoring | Sentry / Better Stack / Datadog | Cost vs Features |

**Every tech choice needs an ADR** — Document WHY this technology for THIS project.

---
**>>> CHECKPOINT: PHASE C APPROVAL <<<**

Present complete tech stack with versions to the user.
**Do NOT continue to Phase D until the user explicitly approves.**

Reply `approve c` or `revise: [feedback]`.
---

---

## Phase D — Database Design (Comprehensive)
*Context: Adapting for ${STACK_TYPE} (SQL vs. NoSQL)*

1) **Entity Relationship / Schema Diagram**:
   - **SQL (Supabase)**: Mermaid ERD, Normalized tables, Foreign Keys.
   - **NoSQL (Convex)**: Document schemas (`v.object`), embedding vs. referencing strategies.

2) **Schema Design**:
   - **If SQL**:
     ```sql
     CREATE TABLE users (id UUID...);
     ```
   - **If Convex**:
     ```typescript
     // convex/schema.ts
     export default defineSchema({
       users: defineTable({ ... }),
     });
     ```

3) **Indexing Strategy**:
   - **SQL**: B-tree, GIN, Partial Indexes.
   - **Convex**: `defineTable(...).index("by_email", ["email"])`

4) **Data Integrity**:
   - **SQL**: Foreign Key Constraints, Check Constraints.
   - **Convex**: Runtime validation (Zod/Convex Validators), application-layer logic.

5) **Optimization**:
   - Query plan analysis
   - Connection pooling (PgBouncer)
   - Read replicas for scaling
   - Partitioning strategy (if needed)

---
**>>> CHECKPOINT: DATABASE DESIGN APPROVAL <<<**

Present the ERD, schema definitions, and indexing strategy to the user.
**Do NOT continue to Phase E (API Design) until the user explicitly approves.**

Reply `approve database` or `revise: [feedback]`.
---

---

## Phase E — API Design (Complete Specification)
1) **API Architecture**:
   - Style: REST (OpenAPI 3.1) or GraphQL (Pothos schema) or tRPC
   - Versioning: URL-based (/v1/) or header-based
   - Authentication: JWT (access + refresh tokens)
   - Rate limiting: 100 req/min per user, 1000 req/min per IP

2) **OpenAPI 3.1 Specification** (for REST):
   ```yaml
   openapi: 3.1.0
   info:
     title: [Project] API
     version: 1.0.0
   paths:
     /v1/auth/login:
       post:
         summary: User login
         requestBody:
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   email: { type: string, format: email }
                   password: { type: string, minLength: 8 }
         responses:
           '200':
             content:
               application/json:
                 schema:
                   type: object
                   properties:
                     accessToken: { type: string }
                     refreshToken: { type: string }
                     user: { $ref: '#/components/schemas/User' }
   ```

3) **Core Endpoints** (REST example):
   - `POST /v1/auth/login` - Authentication
   - `POST /v1/auth/register` - User registration
   - `POST /v1/auth/refresh` - Token refresh
   - `DELETE /v1/auth/logout` - Logout
   - `GET /v1/users/me` - Current user profile
   - `PATCH /v1/users/me` - Update profile
   - [Feature-specific endpoints for each PRD feature]

4) **Error Response Format**:
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid email format",
       "details": {
         "field": "email",
         "value": "invalid-email"
       }
     }
   }
   ```

---
**>>> CHECKPOINT: PHASE E APPROVAL <<<**

Present API specification with key endpoints to the user.
**Do NOT continue to Phase F until the user explicitly approves.**

Reply `approve e` or `revise: [feedback]`.
---

---

## Phase F — Security Architecture (Comprehensive)
1) **Authentication & Authorization**:
   - **Auth mechanism**: JWT (HS256 or RS256)
   - **Access tokens**: Short-lived (15min), stored in memory
   - **Refresh tokens**: Long-lived (30 days), HttpOnly secure cookie
   - **RBAC**: Roles (admin, user, guest) with permissions matrix
   - **OAuth2/OIDC**: Social login (Google, GitHub)

2) **Data Security**:
   - **At rest**: Database encryption (AES-256), KMS for keys
   - **In transit**: TLS 1.3, HTTPS only
   - **PII**: Encryption for sensitive fields (SSN, payment info)
   - **Secrets**: Environment variables, secret management (Doppler, Vault)

3) **Application Security** (OWASP Top 10):
   - **SQL Injection**: Parameterized queries (ORM)
   - **XSS**: Content Security Policy, output encoding
   - **CSRF**: SameSite cookies, CSRF tokens
   - **Auth failures**: Rate limiting, MFA
   - **Insecure design**: Security by design, threat modeling
   - **Security misconfig**: Security headers (HSTS, X-Frame-Options)
   - **Vulnerable deps**: Snyk, Dependabot, npm audit
   - **Broken access control**: RBAC, resource-level permissions
   - **Logging failures**: Security event logging, SIEM
   - **SSRF**: URL validation, allowlisting

4) **Compliance** (if applicable):
   - **GDPR**: Consent, data export, right to deletion, privacy policy
   - **HIPAA**: BAA, audit logs, encryption, access controls
   - **SOC 2**: Access control, monitoring, incident response, change management

---
**>>> CHECKPOINT: PHASE F APPROVAL <<<**

Present security architecture to the user.
**Do NOT continue to Phase G until the user explicitly approves.**

Reply `approve f` or `revise: [feedback]`.
---

---

## Phase G — Frontend Implementation Specs
1) **Component Architecture**:
   - Atomic design: atoms → molecules → organisms → templates → pages
   - Component composition patterns
   - TypeScript interfaces for props
   - Server components vs. client components (Next.js)

2) **State Management**:
   - Global state: Zustand stores (auth, theme, user preferences)
   - Server state: TanStack Query (caching, invalidation)
   - Form state: React Hook Form
   - URL state: Next.js router (search params, dynamic routes)

3) **Data Fetching**:
   - Server-side: `fetch` with caching (Next.js)
   - Client-side: TanStack Query with stale-while-revalidate
   - Optimistic updates for instant feedback
   - Error boundaries for graceful errors

4) **Performance**:
   - Code splitting by route (automatic in Next.js)
   - Dynamic imports for heavy components
   - Image optimization (Next.js Image, srcset)
   - Font optimization (next/font)
   - Bundle size budget (<200KB initial JS)
   - Bundle size budget (<200KB initial JS)

5) **Wireframe Code Integration** (If Step 5 Completed):
   - **Reference Wireframe Outputs:**
     - Runnable Prototype: `/src/` (web) or Expo project root (mobile)
     - Screenshots: `/docs/wireframes/screenshots/`
     - Prototype Summary: `/docs/wireframes/PROTOTYPE-SUMMARY.md`
     - **Flow PRDs: `/docs/prds/flows/FLOW-*.md`** ⭐
     - **Wireframe Tracker: `/docs/prds/flows/WIREFRAME-TRACKER.md`** ⭐
     - **Zero Omission Certificate: `/docs/prds/flows/ZERO-OMISSION-CERTIFICATE.md`** ⭐
   
   - **⚠️ CRITICAL: Verify Completeness First:**
     Before integrating wireframes, confirm Zero Omission Certificate shows:
     - Step-4 Screens = Step-5 Wireframes (100% coverage)
     - No screens marked as TBD or deferred
   
   - **Integration Strategy:**
     Since Step 5 produces foundation code (not just exports), the wireframes project can evolve into production:
     1. **Review Wireframe Components:** Analyze `/src/components/flows/` structure
     2. **Refine for Production:** Add proper TypeScript types, error handling, tests
     3. **Apply Design System:** Ensure design tokens are formalized (Step 6)
     4. **Migrate or Extend:** Either migrate components to main app or extend wireframes project
     5. **Cross-Reference Flow PRDs:** Each flow has a dedicated PRD with component decisions
   
   - **Foundation Code Benefits:**
     ```typescript
     // Wireframe component already exists at /wireframes/src/components/ui/Button.tsx
     // Refine for production by adding:
     // - Full TypeScript Props interface
     // - All variants and states
     // - Accessibility attributes
     // - Unit tests
     ```
   
   - **Component Review from Wireframes:**
     - Read `/docs/wireframes/PROTOTYPE-SUMMARY.md` for component inventory
     - Review each component in `/wireframes/src/components/`
     - Compare against screenshots in `/docs/wireframes/screenshots/`
   
   - **Priority Components (from Wireframes):**
     - List from PROTOTYPE-SUMMARY.md (P0 screens first)
     - Build in order: Atoms → Molecules → Organisms
     - Test each refined component against wireframe screenshots
   
   - **Quality Gates:**
     - [ ] Visual match: Production component matches wireframe screenshot
     - [ ] Responsive: Works on mobile/tablet/desktop
     - [ ] Accessible: WCAG AA compliant
     - [ ] Performant: No layout shifts, fast render
     - [ ] Type-safe: Full TypeScript coverage

---
**>>> CHECKPOINT: FRONTEND SPEC APPROVAL <<<**

Present the frontend architecture, state management, data fetching, and wireframe integration plan to the user.
**Do NOT continue to Phase H (Backend Implementation Specs) until the user explicitly approves.**

Reply `approve frontend` or `revise: [feedback]`.
---

---

## Phase H — Backend Implementation Specs
1) **Service Architecture**:
   - Domain-driven design (if complex)
   - Service boundaries
   - Shared kernel (common types, utilities)
   - Anti-corruption layers for external services

2) **API Layer**:
   - Route handlers
   - Middleware (auth, validation, error handling)
   - Request/response schemas (Zod)
   - OpenAPI documentation generation

3) **Business Logic Layer**:
   - Service classes / functions
   - Domain models
   - Validation and business rules
   - Error handling patterns

4) **Data Access Layer**:
   - ORM/query builder (Drizzle, Prisma)
   - Repository pattern
   - Query optimization
   - Connection pooling

5) **Background Jobs** (if needed):
   - Queue system (BullMQ, Inngest)
   - Worker processes
   - Job scheduling (cron)
   - Retry logic and dead letter queue

6) **Step 11 PRD Framework Alignment** (Cross-Reference):

   **Technical specs in Step 8 MUST align with these Step 11 frameworks:**

   | Framework | Step 8 Responsibility | Step 11 PRD Will Expect |
   |-----------|----------------------|------------------------|
   | **Vertical Slice (Bogard)** | Establish feature boundaries | Each PRD = complete slice (DB + API + UI) |
   | **Google API Design** | Define resource naming conventions | Endpoints follow `GET /resources`, `POST /resources` |
   | **Railway-Oriented (Wlaschin)** | Define Result type pattern | Server actions return `Result<T, E>`, not throw |
   | **Zod Best Practices** | Specify validation approach | Schemas colocated with actions, types inferred |
   | **OWASP API Security Top 10** | Document security baseline | Each PRD addresses BOLA, auth, rate limiting |
   | **Supabase RLS** | Define RLS policy patterns | Each new table has explicit RLS policies |
   | **Server Actions (Next.js)** | Specify action patterns | Actions validate input, check auth, return Result |
   | **Feature-Sliced Design** | Define folder structure | Components organized by layer (features/entities/shared) |

   **Consistency Checks:**
   - [ ] Result type pattern defined in Tech Spec → Used in all PRD server actions
   - [ ] RLS policy patterns established → PRDs reference patterns by name
   - [ ] API conventions defined → PRDs follow conventions
   - [ ] Security baseline documented → PRDs inherit baseline + add feature-specific

---
**>>> CHECKPOINT: BACKEND SPEC APPROVAL <<<**

Present the backend service architecture, API layer, business logic, and Step 11 framework alignment to the user.
**Do NOT continue to Phase I (Infrastructure & Deployment) until the user explicitly approves.**

Reply `approve backend` or `revise: [feedback]`.
---

---

## Phase I — Infrastructure & Deployment
1) **Hosting Environment**:
   - Frontend: Vercel (or Netlify, Cloudflare Pages)
   - Backend: Railway (or Fly.io, Render, AWS ECS, Digital Ocean)
   - Database: Neon (or Supabase, AWS RDS, Railway Postgres)
   - Cache: Upstash Redis (or Railway Redis, AWS ElastiCache)

2) **CI/CD Pipeline** (GitHub Actions):
   ```yaml
   name: CI/CD
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22 }
         - run: npm ci
         - run: npm run lint
         - run: npm run type-check
         - run: npm test
     deploy:
       needs: test
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - run: vercel deploy --prod
   ```

3) **Environment Management**:
   - Development (local, Docker Compose)
   - Staging (preview deploys, Vercel preview)
   - Production (main branch, auto-deploy)

4) **Monitoring & Observability**:
   - **Errors**: Sentry (frontend + backend)
   - **Logs**: Logtail / Better Stack
   - **Metrics**: Vercel Analytics (web vitals)
   - **Traces**: (optional) OpenTelemetry
   - **Uptime**: (optional) UptimeRobot, Better Uptime

---
**>>> CHECKPOINT: PHASE I APPROVAL <<<**

Present infrastructure and deployment specs to the user.
**Do NOT continue to Phase J until the user explicitly approves.**

Reply `approve i` or `revise: [feedback]`.
---

---

## Phase J — Testing Strategy
1) **Testing Pyramid**:
   - **Unit tests** (70%): Functions, utilities, hooks
   - **Integration tests** (20%): API endpoints, database queries
   - **E2E tests** (10%): Critical user flows

2) **Frontend Testing**:
   - **Unit**: Vitest + Testing Library (components, hooks)
   - **Integration**: API mocking (MSW)
   - **E2E**: Playwright (auth, checkout, core flows)
   - **Visual regression**: (optional) Chromatic, Percy
   - **Accessibility**: axe-core, Lighthouse CI

3) **Backend Testing**:
   - **Unit**: Vitest (services, utilities)
   - **Integration**: Supertest (API endpoints)
   - **Database**: Test database, migrations, rollbacks
   - **Contract**: (optional) Pact for API contracts

4) **Coverage Targets**:
   - Overall: 80%+
   - Critical paths: 100%
   - Mutation score: 70%+

---
**>>> CHECKPOINT: TESTING STRATEGY APPROVAL <<<**

Present the testing pyramid, tooling choices, and coverage targets to the user.
**Do NOT continue to Phase K (Development Workflow) until the user explicitly approves.**

Reply `approve testing` or `revise: [feedback]`.
---

---

## Phase K — Development Workflow
1) **Git Workflow**:
   - Main branch (protected, production)
   - Feature branches (feature/ticket-description)
   - Pull requests (required reviews, passing CI)
   - Conventional commits (feat, fix, docs, chore)

2) **Code Quality**:
   - ESLint (recommended + project rules)
   - Prettier (consistent formatting)
   - TypeScript strict mode
   - Pre-commit hooks (Husky + lint-staged)

3) **Documentation**:
   - README (getting started, scripts, env vars)
   - API docs (OpenAPI, auto-generated)
   - Component docs (Storybook)
   - ADRs (Architecture Decision Records)

4) **Team Coordination**:
   - Sprint length (1-2 weeks)
   - Daily standups (async or sync)
   - Sprint planning, retros
   - Code review guidelines

---
**>>> CHECKPOINT: DEVELOPMENT WORKFLOW APPROVAL <<<**

Present the Git workflow, code quality tooling, documentation approach, and team coordination process to the user.
**Do NOT continue to Phase L (Risk Assessment) until the user explicitly approves.**

Reply `approve workflow` or `revise: [feedback]`.
---

---

## Phase L — Risk Assessment & Mitigations
1) **Technical Risks**:
   - **Scalability**: Horizontal scaling, caching, database optimization
   - **Performance**: Bundle size, lazy loading, CDN
   - **Security**: Regular audits, pen testing, dependency scanning
   - **Data loss**: Backups, point-in-time recovery

2) **Project Risks**:
   - **Timeline**: Buffer for unknowns, MVP prioritization
   - **Team**: Knowledge sharing, documentation, pair programming
   - **Scope creep**: Change management, feature freezes
   - **Quality**: Automated testing, CI/CD, code reviews

---
**>>> CHECKPOINT: RISK ASSESSMENT APPROVAL <<<**

Present the technical and project risk register with specific mitigations to the user.
**Do NOT continue to Phase M (Assemble Technical Specification) until the user explicitly approves.**

Reply `approve risks` or `revise: [feedback]`.
---

---

## Phase M — Assemble the Technical Specification (paste back + write files)
**Technical Specification Document (12 Sections):**
1) Executive Summary
2) System Architecture
3) Technology Stack
4) Database Design
5) API Specification
6) Security Architecture
7) Frontend Implementation
8) Backend Implementation
9) Infrastructure & Deployment
10) Testing Strategy
11) Development Workflow
12) Risk Assessment

**Files to create/update**
- `/docs/technical/TECHNICAL-SPEC.md` (complete 12-section spec)
- `/docs/technical/ARCHITECTURE-DIAGRAMS.md` (all Mermaid diagrams)
- `/docs/technical/TECH-STACK-DETAILED.md` (versions, justifications, alternatives)
- `/docs/database/SCHEMA-COMPLETE.sql` (complete SQL schema)
- `/docs/api/OPENAPI-SPEC.yaml` (complete OpenAPI 3.1 spec)
- `/docs/security/SECURITY-DETAILED.md` (all security measures)
- `/docs/implementation/FRONTEND-SPEC.md` (component architecture, state, performance)
- `/docs/implementation/BACKEND-SPEC.md` (services, business logic, data access)
- `/docs/ops/INFRASTRUCTURE.md` (hosting, CI/CD, monitoring)
- `/docs/testing/TESTING-STRATEGY.md` (pyramid, tools, coverage)
- `/docs/ops/DEVELOPMENT-WORKFLOW.md` (git, code quality, docs, team)
- `/docs/ops/RISK-MITIGATION.md` (technical and project risks)

**Quality gates (must pass)**
- All 12 sections are **comprehensive** with specific details.
- Tech stack has **version numbers** for all major dependencies.
- Database schema has **complete SQL** with indexes and constraints.
- API spec is **OpenAPI 3.1 compliant** (or GraphQL schema).
- Security includes **OWASP Top 10** mitigations.
- Frontend and backend specs reference **specific patterns** (not generic).
- CI/CD pipeline has **working YAML** example.
- Testing strategy has **coverage targets** and tool choices.
- Risk assessment has **specific mitigations** (not just risks).

---

## Final Review Gate (stop here)
**Prompt to user (blocking):**  
> "Please review the COMPLETE Technical Specification (12 sections) and all files.  
> This is the **definitive development blueprint**. Take your time.  
> • Reply `approve step 8` to proceed to Step-9 Landing Page (optional) or Step-10, or  
> • Reply `revise step 8: <notes>` to iterate.  
> I won't continue until you approve."

---

<verification>
## Step 8 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Technical Spec | /docs/technical/TECHNICAL-SPEC.md | 10KB | 8 |
| API Specification | /docs/api/API-SPEC.md OR /docs/api/openapi.yaml | 2KB | 5 |
| Database Schema | /docs/database/SCHEMA.md OR /db/schema/ | 1KB | 4 |
| Implementation Plan | /docs/implementation/IMPLEMENTATION-PLAN.md | 1KB | 3 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| TECHNICAL-SPEC.md | ## System Architecture | 4 |
| TECHNICAL-SPEC.md | ## Data Models | 5 |
| TECHNICAL-SPEC.md | ## API Endpoints | 5 |
| TECHNICAL-SPEC.md | ## Authentication & Authorization | 4 |
| TECHNICAL-SPEC.md | ## Error Handling | 4 |
| TECHNICAL-SPEC.md | ## Performance Requirements | 4 |
| TECHNICAL-SPEC.md | ## Security Considerations | 4 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:TECHNICAL-SPEC.md:interface\|type.*= | TypeScript interfaces defined | 6 |
| has_pattern:TECHNICAL-SPEC.md:CREATE TABLE\|table\( | Database schema present | 6 |
| has_mermaid:TECHNICAL-SPEC.md | Architecture diagrams present | 5 |
| has_pattern:TECHNICAL-SPEC.md:Given.*When.*Then | BDD acceptance criteria | 5 |
| has_table:TECHNICAL-SPEC.md | API endpoint table present | 4 |
| has_pattern:TECHNICAL-SPEC.md:SLO\|latency\|p99 | Performance SLOs defined | 4 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Architecture Reviewed | All previous steps synthesized | 5 |
| Implementation Ready | No TBDs remaining in spec | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Complete Synthesis | References Steps 1-7 outputs | 4 |
| Actionable | Developer can implement without questions | 3 |
| Security Addressed | Auth, validation, and security documented | 3 |

</verification>

---

## Final Review Gate

**All outputs for this step:**
- [ ] /docs/technical/TECHNICAL-SPEC.md created/updated
- [ ] All phases (A–M) completed with user approval
- [ ] Executive summary and timeline documented
- [ ] System architecture, tech stack, database, and API designs complete
- [ ] Security architecture comprehensive
- [ ] Frontend and backend implementation specs documented
- [ ] Infrastructure, testing, workflow, and risk assessment complete
- [ ] All previous steps (1-7) synthesized into implementation-ready documentation

**>>> FINAL CHECKPOINT: STEP 8 COMPLETE <<<**
**Do NOT proceed to Step 9 without explicit approval.**


