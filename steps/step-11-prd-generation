---
version: "3.0.0"
last_updated: "2026-01-07"
changelog:
  - "3.0.0: MAJOR - Bulletproof PRDs for full-stack coverage. Added frameworks 8-17, Section 0.5, Section 15, Gates 7-8, Anti-Patterns 11-14."
  - "2.4.0: Added SwiftUI component templates (View, ViewModel, Row, Form/Sheet) in Section 8"
  - "2.3.2: Updated default page wrapper to App/Wide layout (no container mx-auto)"
description: "Step 11: PRD Generation - Create Implementation-Ready PRDs using PR/FAQ, BDD, and Shape Up methodologies"
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
  - mcp_21st-devmagic_21st_magic_component_builder
  - mcp_21st-devmagic_21st_magic_component_inspiration
  - mcp_21st-devmagic_logo_search
  - mcp_sequential-thinking_sequentialthinking

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --feature-id
  - --batch
---

# /step-11-prd-generation — Implementation-Ready PRD Creation (CPO + Lead Architect)

**Mission**  
Generate comprehensive, implementation-ready PRDs (600-1000 lines) that consume Step 8's Shaped Projects and produce executable specifications developers can build from directly.

**Context:** You are the **Chief Product Officer** and **Lead Architect**. You enforce a **"Deep Spec"** methodology where PRDs are technical blueprints validated against multiple quality frameworks.

**Core Philosophy:**
1. **Unified Document:** Single PRD contains frontend + backend + database + testing in one cohesive document. No frontend-only PRDs.
2. **No Hand-Waving:** Every statement must be actionable with actual code. No "TBD" or "to be determined."
3. **Code-First:** Include TypeScript interfaces, SQL DDL, Zod schemas, React component signatures, and complete server actions.
4. **Vertical Slice:** Each PRD specifies the complete feature: database schema → server actions → UI components → tests.
5. **Security-First:** OWASP API Security, RLS policies, auth checks specified upfront—not as afterthoughts.
6. **Agentic-Ready:** PRDs written so AI coding agents can implement without ambiguity. Explicit file paths, complete imports, typed return values.
7. **MCP-Driven Research:** Use MCPs to validate syntax and find real-world patterns.
8. **Auto-Verification:** Every PRD must pass `@verify-prd` with score 8+/10 (70+ points) including backend and agentic gates.

<goal>
You are the CPO + Lead Architect. Execute ALL phases in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| Preflight | Import validation + MCP research | Step 10 data loaded |
| A | PRD Template Setup | PRD file structure |
| B | Section 0-3 (Metadata + Problem + Solution) | Strategic sections |
| C | Section 4-7 (Stories + Requirements + DB + API) | Technical backbone |
| D | Section 8-14 (UI + NFRs + Testing + Rollout) | Implementation detail |
| E | Section 15-16 (Agentic + Ralph) | Agent-readiness |
| F | Quality Gates + Verification | Pass 100/100 |

Final Outputs: docs/prds/F[N]-[FEATURE-NAME].md, docs/prds/.prd-status.json
Quality gate: 100/100 verification score, 8+/10 verify-prd score
</goal>

---

## 🔄 SELF-VALIDATING AGENT HOOKS (Closed Loop Pattern)

**PRD files are automatically validated by PostToolUse hooks.**

When you edit/write files in `docs/prds/`, the `prd-validator.py` hook runs automatically:

```
Agent writes PRD → Hook validates → Sees errors → Auto-fixes → Re-validates → Pass
```

### What the Validator Checks

| Check | Required |
|-------|----------|
| Section 0: Metadata | ✅ |
| Section 1-N structure | ✅ |
| BDD Scenarios (Given/When/Then) | ✅ |
| No TODO/TBD/FIXME | ✅ |
| YAML frontmatter fields | ⚠️ Warning |
| Acceptance criteria | ⚠️ Warning |

### If Validation Fails

The hook returns a JSON response with:
- `agent_instruction`: Explicit fix instructions
- `errors[]`: Each error with line number and `fix_suggestion`

**You MUST fix all errors immediately.** The hook will re-validate on your next edit.

### Example Validation Output

```json
{
  "status": "fail",
  "errors": [
    {
      "line": 0,
      "code": "MISSING_SECTION",
      "message": "Missing: ## BDD Scenarios",
      "fix_suggestion": "Add '## BDD Scenarios' section with Given/When/Then"
    }
  ],
  "agent_instruction": "VALIDATION FAILED: 1 error(s)..."
}
```

**See @specialized-validation skill for details on the Closed Loop Prompt pattern.**

---

## BOILERPLATE STABLE API REFERENCES (NEW - If Using SSS Boilerplate)

**If your project uses an SSS boilerplate, PRDs should reference stable APIs rather than re-specifying foundation components.**

### Detection

```bash
# Check for boilerplate
cat .sigma/boilerplate.json 2>/dev/null
```

### If Boilerplate Detected

**Reference these stable APIs in PRDs (do not re-spec):**

#### Auth API (Stable since v1.0.0)

```typescript
// hooks/use-auth.ts - UseAuthReturn interface
interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<{ error: Error | null }>;
}
```

#### Credits API (Stable since v1.0.0)

```typescript
// hooks/use-credits.ts - UseCreditsReturn interface
interface UseCreditsReturn {
  remaining: number;
  total: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  consume: (amount: number, description?: string) => Promise<boolean>;
  hasEnough: (amount: number) => boolean;
}
```

#### Subscription API (Stable since v1.0.0)

```typescript
// hooks/use-subscription.ts - UseSubscriptionReturn interface
interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: "free" | "starter" | "pro" | "enterprise";
  isPaid: boolean;
  isTrialing: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
  checkout: (priceId: string) => Promise<void>;
}
```

#### Pre-Built Components

```tsx
// Reference in PRDs instead of re-specifying:
import { CreditsBadge } from "@/components/credits/credits-badge";
import { CreditsGate } from "@/components/credits/credits-gate";
import { Button } from "@/components/ui/button";
```

### PRD Template Section for Boilerplate Projects

Include this section at the top of every PRD:

```markdown
## Boilerplate Integration

### Foundation Used
This PRD extends the `nextjs-saas` boilerplate (v1.0.0).

### Stable APIs Referenced

| API | Hook/Component | Usage |
|-----|----------------|-------|
| Auth | `useAuth()` | User context, sign out |
| Credits | `useCredits()` | Check balance, consume on action |
| Gate | `<CreditsGate required={10}>` | Wrap feature with credit check |

### New Components Required

| Component | Location | Purpose |
|-----------|----------|---------|
| [Name] | `components/[project]/` | [Purpose] |

### Database Extensions

| Table | FK | Purpose |
|-------|-----|---------|
| [table] | users.id | [Purpose] |
```

### PRD Writing Rules for Boilerplate Projects

**✅ DO:**
- Reference stable hooks by interface name
- Use `<CreditsGate>` for credit-protected features
- Specify new tables with FK to boilerplate tables
- Put new components in `components/[project]/`

**❌ DON'T:**
- Re-spec auth flows (use `useAuth()`)
- Re-spec credit logic (use `useCredits()`)
- Re-spec billing (use `useSubscription()`)
- Modify boilerplate components

---
**>>> CHECKPOINT: BOILERPLATE API APPROACH APPROVAL <<<**

PRDs will reference boilerplate stable APIs instead of re-specifying them.
**Do NOT continue to PRD generation until the user explicitly approves.**

Reply `approve boilerplate-api` or `revise: [feedback]`.
---

## PRD GENERATION FRAMEWORKS (MANDATORY APPLICATION)

### Framework Summary Table

| # | Framework | Applies To | Key Principle |
|---|-----------|-----------|---------------|
| 1 | Amazon PR/FAQ | Section 1: Press Release | Start with customer, work backwards |
| 2 | BDD Acceptance Criteria | Section 4: User Stories | Executable Given/When/Then specs |
| 3 | Teresa Torres — Outcome Mapping | Section 2: Problem Space | Outcomes over outputs |
| 4 | Shape Up Integration | Section 0: Metadata, Section 3: Scope | Consume shaped work with boundaries |
| 5 | Lean UX Hypothesis | Section 2: Problem Space | Every feature is a hypothesis |
| 6 | Impact Mapping | Section 2: Impact Chain | Trace features to business goals |
| 7 | Marty Cagan — Empowered Teams | Section 12: Success Criteria | Outcome accountability |
| 8 | Vertical Slice Architecture | Section 0.5: Full Stack Overview | DB → API → UI per feature |
| 9 | Google API Design Guide | Section 7: API Routes | Resource-oriented design |
| 10 | Railway-Oriented Programming | Section 7: Server Actions | Typed Result pattern for error flow |
| 11 | Zod Schema Design | Section 6-7: DB + API | Runtime validation at boundaries |
| 12 | OWASP API Security Top 10 | Section 7: API Routes | Security-first API design |
| 13 | Supabase RLS | Section 6: Database Schema | Row-level security policies |
| 14 | Next.js Server Actions | Section 7: Server Actions | Server-side mutation patterns |
| 15 | Feature-Sliced Design | Section 8: UI Components | Layered frontend architecture |
| 16 | TanStack Patterns | Section 8: UI Components | Query/table/form patterns |
| 17 | Agentic PRD Specification | Section 15: Agentic Guide | Unambiguous specs for AI agents |

### The Master Practitioners — Voices You Must Channel

**Apply these frameworks to every PRD. Reference them in validation gates.**

---

### Framework 1: Amazon PR/FAQ (Colin Bryar & Bill Carr)
*Applies to: Section 1 (Press Release) — defines the customer-facing narrative*
**Core Philosophy:** *"Start with the customer and work backwards. Write the press release before building the product."*

**PR/FAQ Structure:**
```
PRESS RELEASE (Customer-Facing)
├─ Headline: [One-sentence announcement]
├─ Subheading: [Who is the customer? What benefit?]
├─ Problem Paragraph: [Pain point described vividly]
├─ Solution Paragraph: [How this solves it]
├─ Quote from Leadership: [Why we built this]
├─ Quote from Customer: [Why they love it]
├─ Call to Action: [How to get started]
└─ Closing: [Next steps]

FAQ (Internal & External)
├─ Customer FAQ: [How do I...? What if...?]
├─ Internal FAQ: [Technical questions, risks, dependencies]
└─ Stakeholder FAQ: [Business questions, metrics, timeline]
```

**Application Checklist:**
- [ ] Is the Press Release written BEFORE technical details?
- [ ] Does it articulate clear customer benefit?
- [ ] Would a customer be excited reading this?
- [ ] Are FAQs comprehensive (customer + internal)?

---

### Framework 2: BDD Acceptance Criteria (Dan North)
*Applies to: Section 4 (User Stories) — executable Given/When/Then specifications*
**Core Philosophy:** *"Acceptance criteria should be executable specifications."*

**Given/When/Then Format:**
```gherkin
Feature: [Feature Name]
  As a [role]
  I want [capability]
  So that [benefit]

  Scenario: [Happy Path - Descriptive Name]
    Given [precondition/context]
    And [additional context]
    When [action/trigger]
    Then [expected outcome]
    And [additional verifiable outcome]

  Scenario: [Edge Case - Descriptive Name]
    Given [edge case context]
    When [action]
    Then [expected behavior]

  Scenario: [Error Case - Descriptive Name]
    Given [error condition]
    When [action]
    Then [error handling behavior]
    And [user feedback]
```

**Application Checklist:**
- [ ] Does every user story have Given/When/Then scenarios?
- [ ] Are Happy Path, Edge Cases, AND Error Cases covered?
- [ ] Can scenarios be directly converted to automated tests?
- [ ] Are outcomes specific and measurable (not vague)?

---

### Framework 3: Teresa Torres — Outcome Mapping
*Applies to: Section 2 (Problem Space) — outcome trees and opportunity mapping*
**Core Philosophy:** *"Every feature must trace to a desired outcome."*

**Opportunity Solution Tree:**
```
        [Desired Outcome] (from Step-1 PRD)
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
[Opportunity][Opportunity][Opportunity]
 (User Need)  (Pain Point) (Desire)
    ↓              ↓           ↓
[Solution]    [Solution]  [Solution]
 (Feature)    (Feature)   (Feature)
    ↓              ↓           ↓
[Experiment]  [Experiment] [Experiment]
 (Hypothesis)  (Test)      (Validation)
```

**Application Checklist:**
- [ ] Does feature link to a desired outcome from Step-1?
- [ ] Is the opportunity (user need/pain) documented?
- [ ] Is there a testable hypothesis?
- [ ] Can we articulate WHY this feature matters?

---

### Framework 4: Shape Up Integration (Ryan Singer)
*Applies to: Section 0 (Metadata) + Section 3 (Scope) — shaped work import from Step 10*
**Core Philosophy:** *"Consume shaped work with clear boundaries and identified risks."*

**Step 10 → Step 11 Mapping:**
```
FROM STEP 10 (Betting Table)    →    TO STEP 11 (PRD Section)
├─ Shaped Project ID           →    Section 0: Metadata
├─ Appetite (Small/Big Batch)  →    Effort Budget
├─ Priority (P0/P1/P2/P3)      →    Priority Classification
├─ Phase (0/1/2/3)             →    Release Phase
├─ Kano Type                   →    Feature Classification
├─ INVEST Score                →    Quality Validation
├─ Outcome Link                →    Section 2: Problem Space
├─ Boundaries (IN/OUT)         →    Section 3: Scope Definition
├─ Rabbit Holes                →    Technical Risks section
├─ Impact Chain                →    Section 2: Impact Chain
└─ Mini-PR/FAQ                 →    Section 1: Press Release
```

**Application Checklist:**
- [ ] Is all Step 10 metadata imported into Section 0?
- [ ] Are Boundaries (IN/OUT) explicit in Section 3?
- [ ] Are Rabbit Holes documented with mitigations?
- [ ] Does Appetite define the effort budget?

---

### Framework 5: Lean UX Hypothesis (Jeff Gothelf)
*Applies to: Section 2 (Problem Space) — hypothesis-driven feature validation*
**Core Philosophy:** *"Every feature is a hypothesis to be validated."*

**Hypothesis Format:**
```
We believe that [building this feature/capability]
For [these users/personas]
Will achieve [this outcome/behavior change]
We will know we're successful when [measurable signal/metric]
```

**Experiment Definition:**
```
├─ Hypothesis: [Statement above]
├─ Test Method: [How we'll validate]
├─ Success Metric: [Specific threshold]
├─ Minimum Viable Test: [Smallest experiment]
└─ Learning: [What we'll learn regardless of outcome]
```

**Application:** Add hypothesis to Section 2 for features with uncertainty.

---

### Framework 6: Gojko Adzic — Impact Mapping
*Applies to: Section 2 (Impact Chain) — goal→actor→impact→deliverable tracing*
**Core Philosophy:** *"Features should trace back to business goals through actors and impacts."*

**Impact Chain:**
```
Goal (WHY) → Actor (WHO) → Impact (HOW) → Deliverable (WHAT)

Example:
"Increase conversions by 30%"
  └─ "Solo Founders"
      └─ "Reduce perceived complexity"
          └─ "1-Click Onboarding" feature
```

**Application:** Every PRD Section 2 must include a complete Impact Chain.

---

### Framework 7: Marty Cagan — Empowered Product Teams
*Applies to: Section 12 (Success Criteria) — outcome accountability over output tracking*
**Core Philosophy:** *"PRDs should enable teams, not constrain them."*

**Key Principles:**
- Specify WHAT (outcomes, constraints) not HOW (implementation)
- Define the problem clearly, let teams discover solutions
- Include "guardrails" not "rails"
- Focus on customer value, not feature lists

**Application Checklist:**
- [ ] Does PRD define outcomes without dictating implementation?
- [ ] Are acceptance criteria testable without being prescriptive?
- [ ] Is there room for team creativity within constraints?
- [ ] Are success metrics customer-focused?

---

### Framework 8: Jimmy Bogard — Vertical Slice Architecture
*Applies to: Section 0.5 (Full Stack Overview) — DB→API→UI per feature slice*
**Core Philosophy:** *"Organize code by feature, not by technical layer. Each feature owns its complete vertical slice."*

**Vertical Slice Structure (Per Feature):**
```
VERTICAL SLICE (Per Feature)
├─ Request/Command (DTO with validation)
├─ Handler (Business logic)
├─ Database query/mutation
├─ Response (DTO)
└─ Tests (unit + integration)
```

**Why This Matters for PRDs:**
- Forces PRDs to specify the COMPLETE feature (not just UI or just API)
- Ensures database, API, and UI are co-designed
- Makes PRDs self-contained and independently implementable
- Reduces coordination overhead between frontend/backend teams

**Application Checklist:**
- [ ] Is each feature self-contained (not spread across layers)?
- [ ] Does the PRD define the complete slice (input → processing → output → storage)?
- [ ] Are cross-cutting concerns (auth, logging) handled via middleware, not duplicated?
- [ ] Can this feature be implemented without touching other feature slices?

---

### Framework 9: Google API Design Guide — Resource-Oriented Design
*Applies to: Section 7 (API Routes) — RESTful resource naming and patterns*
**Core Philosophy:** *"Design APIs around resources (nouns), not actions (verbs). Use standard methods."*

**Standard Methods:**
| Method | HTTP Verb | URI Pattern | Description |
|--------|-----------|-------------|-------------|
| List | GET | /resources | Get collection (with pagination) |
| Get | GET | /resources/{id} | Get single resource |
| Create | POST | /resources | Create new resource |
| Update | PUT/PATCH | /resources/{id} | Full or partial update |
| Delete | DELETE | /resources/{id} | Remove resource |

**Custom Methods (when standard methods don't fit):**
```
POST /resources/{id}:action
Examples:
  POST /documents/{id}:publish
  POST /users/{id}:deactivate
  POST /orders/{id}:cancel
```

**Application Checklist:**
- [ ] Are resources clearly defined as nouns (not /getUser, but GET /users)?
- [ ] Do endpoints follow REST conventions?
- [ ] Is pagination specified for List methods (cursor or offset)?
- [ ] Are error responses standardized (error code, message, details)?
- [ ] Is API versioning strategy defined (/v1/ prefix or header)?

---

### Framework 10: Scott Wlaschin — Railway-Oriented Programming
*Applies to: Section 7 (Server Actions) — typed Result pattern for error handling*
**Core Philosophy:** *"Make errors explicit in the type system. Functions return Result<Success, Error>, never throw."*

**TypeScript Result Pattern:**
```typescript
// Define explicit Result type
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Define specific error types (not just string)
type CreateUserError = 
  | { code: "VALIDATION_ERROR"; field: string; message: string }
  | { code: "DUPLICATE_EMAIL"; email: string }
  | { code: "DATABASE_ERROR"; details: string };

// Every server action returns Result
export async function createUser(
  input: CreateUserInput
): Promise<Result<User, CreateUserError>> {
  // Validation → Processing → Storage
  // Each step can fail, errors are typed
  const validated = schema.safeParse(input);
  if (!validated.success) {
    return { 
      success: false, 
      error: { code: "VALIDATION_ERROR", field: "...", message: "..." }
    };
  }
  // ... continue with typed error handling
}
```

**Application Checklist:**
- [ ] Are all server action return types explicit (success + error cases)?
- [ ] Are error types enumerated (not just `string` or generic `Error`)?
- [ ] Is error handling composable (chain operations without try/catch)?
- [ ] Can the UI display specific error messages based on error codes?

---

### Framework 11: Zod Schema Design Best Practices
*Applies to: Sections 6-7 (Database + API) — runtime validation at system boundaries*
**Core Philosophy:** *"Schema is the single source of truth for validation, types, and documentation."*

**Best Practices (2025):**
1. **Colocate schemas** with their usage (in the same action file, not separate)
2. **Infer types** from schemas (`z.infer<typeof schema>`) — never duplicate types
3. **Use `.transform()`** for data normalization (trim, lowercase email)
4. **Use `.refine()`** for custom validation with clear error messages
5. **Compose schemas** with `.merge()`, `.extend()`, `.pick()`, `.omit()`
6. **Define error maps** for user-friendly messages

**PRD Schema Template:**
```typescript
// actions/[feature]/create-[entity].ts
import { z } from "zod";

export const createEntitySchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .transform(s => s.trim()),
  email: z.string()
    .email("Please enter a valid email address")
    .transform(s => s.toLowerCase().trim()),
  role: z.enum(["admin", "member", "viewer"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  metadata: z.object({
    source: z.string().optional(),
  }).optional(),
});

// Infer type from schema (single source of truth)
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

**Application Checklist:**
- [ ] Does every server action have a Zod schema for input validation?
- [ ] Are error messages user-friendly (not "Invalid input")?
- [ ] Are types inferred from schemas (single source of truth)?
- [ ] Are transforms applied for data normalization?

---

### Framework 12: OWASP API Security Top 10 (2023)
*Applies to: Section 7 (API Routes) — security-first API design*
**Core Philosophy:** *"APIs are the #1 attack vector. Secure by design, not afterthought."*

**Top 10 Risks (PRD must address):**

| Risk | Description | PRD Requirement |
|------|-------------|-----------------|
| API1:2023 | Broken Object Level Authorization | Verify user owns resource before access |
| API2:2023 | Broken Authentication | JWT best practices, refresh tokens, secure storage |
| API3:2023 | Broken Object Property Level Authorization | Only expose needed fields in responses |
| API4:2023 | Unrestricted Resource Consumption | Rate limiting, pagination limits, payload size limits |
| API5:2023 | Broken Function Level Authorization | RBAC on every endpoint, admin routes protected |
| API6:2023 | Unrestricted Access to Sensitive Business Flows | Abuse prevention (captcha, rate limits on sensitive ops) |
| API7:2023 | Server Side Request Forgery | URL validation, allowlisting for external requests |
| API8:2023 | Security Misconfiguration | Secure headers, CORS policy, minimal error exposure |
| API9:2023 | Improper Inventory Management | API versioning, deprecation notices, documentation |
| API10:2023 | Unsafe Consumption of APIs | Validate all external API responses |

**PRD Security Section Template:**
```markdown
### Security Considerations (OWASP API Top 10)

| Risk | Mitigation | Implementation |
|------|------------|----------------|
| BOLA (API1) | Ownership check | `WHERE user_id = auth.uid()` in all queries |
| Auth (API2) | JWT + Refresh | Access token 15min, refresh 30 days, httpOnly |
| Property Auth (API3) | Field filtering | Return only `id, name, email` not `password_hash` |
| Resource (API4) | Rate limiting | 100 req/min/user, 10 req/min for auth endpoints |
| Function Auth (API5) | RBAC | Admin routes require `role = 'admin'` |
```

**Application Checklist:**
- [ ] Does every endpoint check user owns resource (BOLA)?
- [ ] Are sensitive fields excluded from API responses?
- [ ] Is rate limiting specified for all endpoints?
- [ ] Are RBAC permissions defined per endpoint?
- [ ] Are external API responses validated before use?

---

### Framework 13: Supabase RLS Best Practices
*Applies to: Section 6 (Database Schema) — row-level security policies*
**Core Philosophy:** *"Security at the database layer. Policies enforce access even if application code has bugs."*

**RLS Policy Patterns:**

**Pattern 1: User Owns Row**
```sql
-- Users can only access their own data
CREATE POLICY "Users own their data"
  ON table_name FOR ALL
  USING (user_id = auth.uid());
```

**Pattern 2: Organization Membership**
```sql
-- Users can access data belonging to their organization
CREATE POLICY "Org members can access org data"
  ON table_name FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid()
    )
  );
```

**Pattern 3: Role-Based Access**
```sql
-- Only admins can delete
CREATE POLICY "Admins can delete"
  ON table_name FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

**Pattern 4: Service Role Bypass (for server-side operations)**
```sql
-- Server-side operations bypass RLS
CREATE POLICY "Service role has full access"
  ON table_name FOR ALL
  USING (auth.role() = 'service_role');
```

**Performance Optimization:**
```sql
-- Always create indexes on columns used in RLS policies
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
```

**Application Checklist:**
- [ ] Does every new table have RLS enabled?
- [ ] Are SELECT, INSERT, UPDATE, DELETE policies explicit?
- [ ] Are indexes created for RLS policy columns (performance)?
- [ ] Is service role access documented for server-side operations?

---

### Framework 14: Next.js Server Actions Best Practices (2025)
*Applies to: Section 7 (Server Actions) — server-side mutation patterns*
**Core Philosophy:** *"Server Actions are the new backend. Treat them with the same rigor as API endpoints."*

**Best Practices:**
1. **Always validate input** with Zod before any processing
2. **Return structured responses** (Result pattern, not throw)
3. **Revalidate paths** after mutations
4. **Handle optimistic updates** in UI for instant feedback
5. **Use `useActionState`** for form state management (React 19+)

**Server Action Template:**
```typescript
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/db"

const schema = z.object({
  name: z.string().min(1).max(100),
  // ... validation rules
});

type ActionState = 
  | { success: true; data: { id: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEntity(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Parse and validate input
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { 
      success: false, 
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors 
    };
  }
  
  // 2. Auth check
  const { user } = await auth();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  // 3. Business logic + Database operation
  try {
    const result = await db.insert(entities).values({
      ...parsed.data,
      userId: user.id,
    }).returning({ id: entities.id });
    
    // 4. Revalidate affected paths
    revalidatePath('/entities');
    
    return { success: true, data: { id: result[0].id } };
  } catch (error) {
    return { success: false, error: "Failed to create entity" };
  }
}
```

**Application Checklist:**
- [ ] Does every server action validate input with Zod first?
- [ ] Does every server action check authentication?
- [ ] Are return types explicit (success + error cases)?
- [ ] Is `revalidatePath` called after mutations?
- [ ] Are field-level errors returned for form validation?

---

### Framework 15: Feature-Sliced Design (FSD)
*Applies to: Section 8 (UI Components) — layered frontend architecture*
**Core Philosophy:** *"Organize frontend by layers and slices, with explicit boundaries and dependencies."*

**Layer Structure:**
```
src/
├─ app/          # App initialization, providers, routing, global styles
├─ pages/        # Page components that compose features (thin wrappers)
├─ widgets/      # Complex UI blocks (header, sidebar, footer)
├─ features/     # User interactions (auth-form, checkout, search)
├─ entities/     # Business entities (user, product, order)
├─ shared/       # Reusable utilities, UI kit, config
```

**Dependency Rule:** Each layer can only import from layers BELOW it.
```
app → pages → widgets → features → entities → shared
```

**Slice Structure (within features/):**
```
features/
├─ auth/
│   ├─ ui/           # React components
│   ├─ model/        # State management (Zustand store)
│   ├─ api/          # API calls / server actions
│   └─ index.ts      # Public API (what's exported)
├─ checkout/
│   └─ ...
```

**Application Checklist:**
- [ ] Is the component clearly assigned to a layer (feature vs entity vs shared)?
- [ ] Does it only depend on lower layers?
- [ ] Are shared utilities in `shared/`, not duplicated?
- [ ] Is each feature's public API explicitly exported via index.ts?

---

### Framework 16: TanStack Patterns (Tanner Linsley)
*Applies to: Section 8 (UI Components) — query, table, and form patterns*
**Core Philosophy:** *"Type-safety from database to UI. If TypeScript can't catch it, it's a bug waiting to happen."*

**Key Patterns:**
1. **Queries are separate from mutations** (clear read vs write semantics)
2. **Optimistic updates** with rollback on failure
3. **Stale-while-revalidate** for instant UX
4. **Query invalidation** after mutations (not manual refetch)
5. **Query keys are structured** for granular invalidation

**TanStack Query Pattern:**
```typescript
// Query: Declarative data fetching with caching
const { data, isLoading, error } = useQuery({
  queryKey: ['entities', { filters, page }], // Structured key
  queryFn: () => getEntities({ filters, page }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation: Imperative with optimistic updates
const createMutation = useMutation({
  mutationFn: createEntity,
  onMutate: async (newEntity) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['entities'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['entities']);
    
    // Optimistic update
    queryClient.setQueryData(['entities'], (old) => [...old, newEntity]);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['entities'], context.previous);
  },
  onSettled: () => {
    // Always refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['entities'] });
  },
});
```

**Application Checklist:**
- [ ] Are query keys structured and consistent?
- [ ] Is staleTime configured appropriately?
- [ ] Do mutations invalidate related queries?
- [ ] Are optimistic updates implemented for critical interactions?

---

### Framework 17: Agentic PRD Specification (Cursor/Claude Best Practices)
*Applies to: Section 15 (Agentic Implementation Guide) — unambiguous specs for AI agents*
**Core Philosophy:** *"PRDs should be written for AI agents, not just humans. Explicit is better than implicit."*

**Agentic PRD Requirements:**
1. **File paths explicit** — Don't say "create a component", say "create `components/feature/ComponentName.tsx`"
2. **Code examples complete** — Include imports, types, full implementations (not snippets)
3. **Dependencies declared** — List npm packages with versions
4. **Test files specified** — Include test file paths and example tests
5. **No ambiguity** — If AI could interpret multiple ways, be more specific
6. **Implementation order** — Specify what to build first (database → API → UI)

**File Manifest Template:**
```markdown
### File Manifest
| File | Action | Description |
|------|--------|-------------|
| `db/schema/feature.ts` | CREATE | Drizzle schema for feature tables |
| `actions/feature/create.ts` | CREATE | Server action for creating entity |
| `actions/feature/get.ts` | CREATE | Server action for fetching entities |
| `components/feature/CreateForm.tsx` | CREATE | Form component with validation |
| `components/feature/List.tsx` | CREATE | List component with data fetching |
| `app/feature/page.tsx` | CREATE | Page component composing above |
| `__tests__/feature/create.test.ts` | CREATE | Unit tests for create action |
```

**Implementation Order Template:**
```markdown
### Implementation Order
1. **Database schema** (Section 6) — Enables type generation
2. **Server actions** (Section 7) — Backend complete before UI
3. **UI components** (Section 8) — Uses generated types from schema
4. **Tests** (Section 10) — Validates implementation
5. **Integration** — Wire everything together
```

**Application Checklist:**
- [ ] Are all file paths explicit (not "create a component")?
- [ ] Do code examples include all imports?
- [ ] Are npm dependencies listed with versions?
- [ ] Is implementation order specified?
- [ ] Are test file paths included?
- [ ] Are environment variables documented?

---

## ANTI-PATTERNS TO AVOID (MANDATORY REVIEW)

**Before finalizing ANY PRD, check for these failures:**

### Anti-Pattern 1: Vague Requirements
❌ **Bad:** "The system should be fast"
✅ **Good:** "Page load < 2s on 3G; API response < 200ms P95"

### Anti-Pattern 2: Missing Edge Cases
❌ **Bad:** Only happy path documented
✅ **Good:** Given/When/Then for happy path, edge cases, AND error cases

### Anti-Pattern 3: No Stakeholder Alignment
❌ **Bad:** PRD written in isolation
✅ **Good:** PR/FAQ reviewed by stakeholders before detailed spec

### Anti-Pattern 4: Over-Specification (Dictating HOW)
❌ **Bad:** "Use a HashMap with O(1) lookup"
✅ **Good:** "Lookup must complete in < 10ms"

### Anti-Pattern 5: Missing Boundaries
❌ **Bad:** Scope creep during implementation
✅ **Good:** Explicit IN SCOPE and OUT OF SCOPE (No-Gos)

### Anti-Pattern 6: No Success Metrics
❌ **Bad:** "Users should be satisfied"
✅ **Good:** "NPS > 50; Task completion rate > 85%"

### Anti-Pattern 7: Disconnected from Outcomes
❌ **Bad:** Feature built because "competitor has it"
✅ **Good:** Feature linked to business outcome via Impact Chain

### Anti-Pattern 8: No Hypothesis
❌ **Bad:** "We think users will like this"
✅ **Good:** "We believe X will achieve Y; we'll know when Z"

### Anti-Pattern 9: Missing Rabbit Holes
❌ **Bad:** Risks discovered during implementation
✅ **Good:** Rabbit holes identified in Step 10, mitigations in PRD

### Anti-Pattern 10: Untestable Criteria
❌ **Bad:** "Should be user-friendly"
✅ **Good:** Given/When/Then with specific observable outcomes

### Anti-Pattern 11: Frontend-Only PRD
❌ **Bad:** PRD specifies UI components but backend is "TBD" or "to be designed later"
✅ **Good:** Full vertical slice (Database + API + UI) in one cohesive PRD

**Why it fails:** Creates orphan UI components that can't function. Frontend team blocks on backend. Integration issues discovered late.

### Anti-Pattern 12: Orphan UI Components
❌ **Bad:** UI component fetches/mutates data but no corresponding server action or API endpoint is defined
✅ **Good:** Every data-fetching UI component has a matching server action in Section 7

**Why it fails:** UI developers implement against imaginary APIs. Type safety breaks. Runtime errors in production.

### Anti-Pattern 13: Security as Afterthought
❌ **Bad:** "Add authentication later" or "We'll handle authorization in phase 2"
✅ **Good:** Auth, RLS policies, and input validation specified upfront in the PRD

**Why it fails:** Retrofitting security is expensive and error-prone. OWASP vulnerabilities baked into architecture. Data breaches.

### Anti-Pattern 14: Ambiguous for AI Agents
❌ **Bad:** "Create a form component for user input"
✅ **Good:** "Create `components/users/CreateUserForm.tsx` with the following props interface, validation schema, and server action integration..."

**Why it fails:** AI agents interpret vague instructions inconsistently. Multiple implementations required. Code review overhead increases.

---

## Preflight (auto)

1) **Get date**: `date +"%Y-%m-%d"`.
2) **Verify MCP availability** (Ref, Exa, Supabase, 21st.dev).
3) **Create folders (idempotent)**:
   - `/docs/prds/`
   - `/docs/wireframes/`
4) **Load Context from Previous Steps**:
   - Read `docs/specs/MASTER_PRD.md` (Step 1: Product vision, outcomes)
   - Read `docs/architecture/ARCHITECTURE.md` (Step 2: System design)
   - Read `docs/ux/UX-DESIGN.md` (Step 3: User flows)
   - **Read `docs/design/UI-PROFILE.md` (Step 3: UI Profile source of truth)**
   - **Read `docs/design/ui-profile.json` (Step 3: machine-readable UI Profile)**
   - Read `docs/design/DESIGN-SYSTEM.md` (Step 6: UI tokens)
   - Read `docs/states/STATE-SPEC.md` (Step 7: State patterns)
   - Read `docs/technical/TECHNICAL-SPEC.md` (Step 8: Tech stack)

   **UI Profile rule (blocking):**
   - If UI Profile files are missing, **STOP** and run Step 3 (UI Profile Selection) before generating any Step 11 PRDs.
   - **CRITICAL - Step 10 Outputs:**
     - Read `docs/implementation/FEATURE-BREAKDOWN.md` (Features)
     - Read `docs/implementation/BETTING-TABLE.md` (Priorities, Appetites)
     - Read `docs/implementation/OUTCOME-MAP.md` (Outcome links)
     - Read `docs/implementation/RABBIT-HOLES.md` (Risks)
     - Read `docs/implementation/INVEST-SCORECARD.md` (Validation)
     - Read `docs/implementation/STORY-MAP.md` (User journey)
     - Read `docs/implementation/PRD-ROADMAP.md` (Build order)
  - **Step 5 Wireframe Outputs (if completed):**
    - Reference `/src/` (web) or Expo project (mobile) (Runnable prototype with foundation code)
    - Read `/docs/wireframes/screenshots/[screen-name]-*.png` (Visual references)
    - Read `/docs/wireframes/PROTOTYPE-SUMMARY.md` (Design decisions, component inventory)
    - **Read `/docs/prds/flows/[NN]-[flow-name]/FLOW-[ID].md`** (Per-flow PRDs with screen specs) ⭐
    - **Read `/docs/prds/flows/[NN]-[flow-name]/[NN]-[screen-name].md`** (Individual screen PRDs) ⭐
    - **Read `/docs/prds/flows/WIREFRAME-TRACKER.md`** (Screen completion tracking) ⭐
    - **Read `/docs/flows/TRACEABILITY-MATRIX.md`** (PRD feature-to-screen mapping) ⭐
    - **Verify `/docs/flows/ZERO-OMISSION-CERTIFICATE.md`** (100% coverage proof) ⭐
    
    **Step 5 PRD Folder Structure (Numbered by Implementation Order):**
    ```
    docs/prds/flows/
    ├── 01-auth/                        # First flow to implement
    │   ├── FLOW-AUTH.md                # Flow overview PRD
    │   ├── 01-welcome-screen.md        # Screen 1 (implementation order)
    │   ├── 02-login-screen.md          # Screen 2
    │   └── 03-signup-screen.md         # Screen 3
    ├── 02-onboarding/                  # Second flow
    │   ├── FLOW-ONBOARD.md
    │   └── 01-profile-setup.md
    └── ...
    ```
    **Numbering = Implementation Order.** Lower numbers = build first.
   
   - **⚠️ CRITICAL: Before generating PRDs:**
    Verify Zero Omission Certificate shows Step-4 Screens = Step-5 Wireframes.
    Verify TRACEABILITY-MATRIX.md shows "Features WITHOUT Screens = 0".
    If coverage < 100%, go back to Step 4/5 and complete missing screens/wireframes FIRST.
   - Read `/db/schema.ts` (if exists)

---

## MCP Research Phase (Before Writing)

**For EVERY PRD, you MUST:**

1. **Use Sequential Thinking MCP** to plan the PRD structure (10-15 thinking steps)
2. **Use Exa MCP** to find similar implementations:
   - `get_code_context_exa` with query: "[Feature] implementation examples [Tech Stack]"
3. **Use Supabase MCP** (if database/backend):
   - `search_docs` for RLS policy patterns, auth flows, realtime subscriptions
4. **Use 21st.dev MCP** (if UI feature):
   - `21st_magic_component_inspiration` to find component patterns
5. **Use Ref MCP** (if needed for specific APIs):
   - `ref_search_documentation` for official docs

**Document all MCP findings** in Section 14: MCP Research Notes.

---

## PRD TEMPLATE (MANDATORY - 17 Sections: 0-16)

**File:** `docs/prds/F[N]-[FEATURE-NAME].md`

**Target Length:** 600-1000 lines minimum

```markdown
# PRD: [Feature Name]

**Product:** [Product Name from Step 1]  
**Feature:** [Feature Name]  
**Date:** [Current Date]  
**Version:** 1.0  
**Status:** To Implement  
**Owner:** [Owner Name]  

---

## SECTION 0: SHAPE UP METADATA (From Step 10)

| Field | Value | Source |
|-------|-------|--------|
| **Shaped Project ID** | F[N] | Betting Table |
| **Appetite** | [Small Batch 1-2wk / Big Batch 4-6wk] | Step 10 Shaping |
| **Priority** | [P0/P1/P2/P3] | Betting Table |
| **Phase** | [0/1/2/3] | Betting Table |
| **Kano Type** | [Must-Have/Performance/Delighter] | Betting Table |
| **INVEST Score** | [I:✅ N:✅ V:✅ E:✅ S:✅ T:✅] | INVEST Scorecard |
| **Outcome Link** | [Linked outcome from Step-1] | Outcome Map |
| **Dependencies** | [List from Dependency Graph] | Feature Dependencies |

### Quality Gate Status (From Step 10)
- [ ] INVEST Validation: Passed
- [ ] Vertical Slice: Confirmed (DB + API + UI)
- [ ] Boundaries Defined: IN/OUT scope clear
- [ ] Rabbit Holes: Identified and documented

---

## SECTION 0.5: FULL STACK OVERVIEW (MANDATORY)

**Purpose:** Force early consideration of both frontend AND backend requirements. Prevents frontend-only PRDs.

### Scope Matrix

| Layer | Count | Files/Resources |
|-------|-------|-----------------|
| Database Tables | [N] | [list table names] |
| Server Actions/API | [N] | [list action/endpoint names] |
| UI Pages | [N] | [list route paths] |
| UI Components | [N] | [list component names] |

### Backend Requirements

| Requirement | Details |
|-------------|---------|
| **New database tables** | [list or "None"] |
| **Modified tables** | [list tables and changes, or "None"] |
| **New server actions** | [list action names with purposes] |
| **New API routes** | [list routes or "None - using server actions only"] |
| **Background jobs** | [list or "None"] |
| **External integrations** | [list services (Stripe, email, etc.) or "None"] |
| **Webhooks** | [list webhook endpoints or "None"] |

### Frontend Requirements

| Requirement | Details |
|-------------|---------|
| **New pages** | [list routes: `/feature`, `/feature/[id]`] |
| **New components** | [list: `FeatureForm`, `FeatureList`, `FeatureCard`] |
| **State management** | [Zustand stores needed, or "Server state only via TanStack Query"] |
| **Data fetching strategy** | [Server Components / TanStack Query / Server Actions] |
| **Form handling** | [react-hook-form + zod / useActionState] |

### Security Requirements

| Requirement | Details |
|-------------|---------|
| **Auth required** | [Yes/No - list which endpoints/pages] |
| **RBAC roles** | [list roles and their permissions] |
| **RLS policies needed** | [list tables requiring RLS] |
| **Input validation** | [list Zod schemas to create] |
| **Rate limiting** | [specify limits per endpoint] |

### Dependencies

| Type | Package | Version | Purpose |
|------|---------|---------|---------|
| npm | [package] | [version] | [purpose] |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| [VAR_NAME] | [description] | Yes/No |

**Completeness Check:**
- [ ] Backend scope is non-empty (tables OR actions OR integrations defined)
- [ ] Every UI component that fetches data has a corresponding server action
- [ ] Security requirements are explicitly stated (not "TBD")

---

## SECTION 1: PRESS RELEASE (Amazon PR/FAQ)

### Headline
[One-sentence announcement that would excite customers]

### Subheading
[Who is the customer and what is the key benefit?]

### Problem Paragraph
[Describe the pain point vividly. Include:]
- Current manual process (time/cost)
- Inconsistencies or errors
- Business impact (lost revenue, poor UX)
- Quantified pain: "[X] minutes per [task]" or "[Y]% failure rate"

### Solution Paragraph
[Describe how this feature solves the problem:]
- High-level approach (not implementation details)
- Key capability that addresses the pain
- Value delivered (time saved, accuracy improved)

### Quote from Leadership
> "[Why we built this - vision and commitment]"
> — [Name, Title]

### Quote from Customer
> "[What a delighted customer would say after using this]"
> — [Persona Name, Role]

### Getting Started
[Single first action a user takes to experience value]

### FAQ

**Customer FAQ:**
- Q: How do I [primary action]?
  A: [Answer]
- Q: What happens if [edge case]?
  A: [Answer]
- Q: Can I [common request]?
  A: [Answer]

**Internal FAQ:**
- Q: What are the technical dependencies?
  A: [Answer]
- Q: What's the estimated effort?
  A: [Appetite from Section 0]
- Q: What are the risks?
  A: [Summary of Rabbit Holes]

---

## SECTION 2: PROBLEM SPACE (Teresa Torres + Gojko Adzic)

### Desired Outcome
[From Step-1 PRD - what business outcome does this achieve?]
- **Metric:** [Specific measurable outcome]
- **Target:** [Quantified goal]
- **Timeline:** [When we expect to see impact]

### Opportunity
[What user need/pain does this address?]
- **User Segment:** [Who experiences this pain?]
- **Pain Point:** [Specific problem]
- **Current Workaround:** [How they solve it today]
- **Frequency:** [How often they experience this]

### Impact Chain (Gojko Adzic)
```
Goal: [Business goal from Step-1 PRD]
  └─ Actor: [Who benefits - specific persona]
      └─ Impact: [How their behavior changes]
          └─ Deliverable: [This feature]
```

### Hypothesis (Lean UX)
```
We believe that [building this feature]
For [these users - be specific]
Will achieve [this outcome - measurable]
We will know we're successful when [specific signal/metric threshold]
```

### Validation Approach
- **Minimum Viable Test:** [Smallest experiment to validate]
- **Success Threshold:** [What number/outcome = success]
- **Failure Response:** [What we do if hypothesis is wrong]

---

## SECTION 3: SOLUTION SPACE (Ryan Singer Boundaries)

### Boundaries - IN SCOPE
[Specific functionality included in this PRD:]
- ✅ [Functionality 1 - be specific]
- ✅ [Functionality 2 - be specific]
- ✅ [Screen/UI 1]
- ✅ [API endpoint 1]
- ✅ [Database table/change 1]

### Boundaries - OUT OF SCOPE (No-Gos)
[Explicitly excluded from this PRD:]
- ❌ [Functionality NOT included] → Deferred to [F[X] or "future"]
- ❌ [Edge case NOT handled] → Reason: [Why]
- ❌ [Integration NOT included] → Deferred to [Phase X]

### Rabbit Holes (From Step 10)
| Risk ID | Risk Description | Impact | Probability | Mitigation Strategy |
|---------|-----------------|--------|-------------|---------------------|
| RH-1 | [Risk from Step 8] | High/Med/Low | High/Med/Low | [Specific mitigation] |
| RH-2 | [Risk from Step 8] | High/Med/Low | High/Med/Low | [Specific mitigation] |

### Technical Constraints
- [Constraint 1 from Step 8 Technical Spec]
- [Constraint 2 - performance requirement]
- [Constraint 3 - security requirement]

---

## SECTION 4: USER STORIES (BDD Format)

### Epic: [Epic Name]

#### Story 4.1: [Story Title]
**Priority:** P[0/1/2] | **Estimate:** [Within Appetite]

```gherkin
Feature: [Feature Name]
  As a [role - specific persona]
  I want [capability - specific action]
  So that [benefit - measurable outcome]

  Background:
    Given [common precondition for all scenarios]
    And [additional common context]

  @happy-path
  Scenario: Successfully [action] with valid inputs
    Given [user context - logged in, on page, etc.]
    And [data context - existing records, state]
    When [user action - click, submit, etc.]
    Then [system response - what happens]
    And [user feedback - toast, redirect, etc.]
    And [data change - database state]

  @edge-case
  Scenario: [Action] with [edge condition]
    Given [edge case context]
    And [specific data state]
    When [user action]
    Then [expected behavior for edge case]
    And [user feedback]

  @error-handling
  Scenario: [Action] fails due to [error condition]
    Given [error precondition]
    When [user action]
    Then [error handling behavior]
    And [user sees error message "[specific message]"]
    And [system state remains unchanged]

  @validation
  Scenario: [Action] with invalid [field]
    Given [context]
    When [user enters invalid data]
    Then [validation error displayed]
    And [field is highlighted]
    And [form is not submitted]
```

#### Story 4.2: [Story Title]
[Repeat BDD format for each story - minimum 3 stories per feature]

---

## SECTION 5: FUNCTIONAL REQUIREMENTS

### 5.1 [Core Feature Area]

**Input:**
- `fieldName` (type: `string`) - [Description, constraints]
- `fieldName2` (type: `number`) - [Description, min/max]

**Processing Logic:**

```typescript
// Algorithm pseudocode or actual implementation
function processFeature(input: InputType): OutputType {
  // Step 1: Validate input
  if (!isValid(input)) {
    throw new ValidationError("Specific error message");
  }
  
  // Step 2: Transform data
  const transformed = transform(input);
  
  // Step 3: Apply business rules
  if (condition) {
    return resultA;
  } else {
    return resultB;
  }
}
```

**Logic Table:**
| Input Condition | Business Rule | Output | Notes |
|-----------------|---------------|--------|-------|
| X > 10 | Apply discount | Y | [Explanation] |
| X <= 10 | Standard price | Z | [Explanation] |
| X is null | Use default | W | [Fallback behavior] |

**Output:**
- `resultField` (type: `ResultType`) - [Description]

### 5.2 [Secondary Feature Area]
[Repeat pattern for each functional area]

---

## SECTION 6: DATABASE SCHEMA

### New Tables

```typescript
// db/schema/[feature]-schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tableName = pgTable('table_name', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Feature-specific fields
  fieldName: text('field_name').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  metadata: jsonb('metadata').$type<MetadataType>(),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const tableNameRelations = relations(tableName, ({ one, many }) => ({
  user: one(users, {
    fields: [tableName.userId],
    references: [users.id],
  }),
}));

// Type exports
export type TableName = typeof tableName.$inferSelect;
export type NewTableName = typeof tableName.$inferInsert;
```

### SQL Migration

```sql
-- Migration: XXXX_add_[feature].sql

-- Create table
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes (from Step 8 performance analysis)
CREATE INDEX idx_table_name_user_id ON table_name(user_id);
CREATE INDEX idx_table_name_status ON table_name(status);
CREATE INDEX idx_table_name_created_at ON table_name(created_at DESC);

-- RLS Policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own records
CREATE POLICY "Users can view own records"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert own records"
  ON table_name FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own records
CREATE POLICY "Users can update own records"
  ON table_name FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own records
CREATE POLICY "Users can delete own records"
  ON table_name FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Admins can view all records
CREATE POLICY "Admins can view all records"
  ON table_name FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      AND admin_roles.role IN ('admin', 'super_admin')
    )
  );
```

---

## SECTION 7: SERVER ACTIONS / API ROUTES

### CRUD Server Action Pattern (Full Template: `create[Entity]`)

All server actions follow the same pattern: Zod validation → auth check → DB operation → revalidate → Result type return.

```typescript
// actions/[feature]/create-[entity].ts
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/db/db"
import { tableName } from "@/db/schema"
import { auth } from "@/lib/supabase/auth"

const createSchema = z.object({
  fieldName: z.string().min(1, "Field is required").max(255),
  // Add all fields with validation
})

export type Create[Entity]Input = z.infer<typeof createSchema>

export type Create[Entity]Result = {
  success: true;
  data: { id: string };
} | {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export async function create[Entity](input: Create[Entity]Input): Promise<Create[Entity]Result> {
  try {
    const validated = createSchema.parse(input)

    const { user } = await auth()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const [created] = await db.insert(tableName).values({
      ...validated,
      userId: user.id,
    }).returning({ id: tableName.id })

    revalidatePath('/path/to/list')

    return { success: true, data: { id: created.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(err.message)
      })
      return { success: false, error: "Validation failed", fieldErrors }
    }
    return { success: false, error: "Failed to create" }
  }
}
```

### CRUD Variations (diff from create template)

| Action | File | Schema | DB Operation | Extra Steps | Return Type |
|--------|------|--------|-------------|-------------|-------------|
| `get[Entity]ById` | `get-[entity]-by-id.ts` | `z.object({ id: z.string().uuid() })` | `db.query.tableName.findFirst({ where: and(eq(id), eq(userId)) })` | Check `!result` → "Not found" | `{ success, data: TableName }` |
| `update[Entity]` | `update-[entity].ts` | Partial fields + `id: z.string().uuid()` | Verify ownership first, then `db.update(tableName).set({ ...data, updatedAt: new Date() })` | Revalidate detail + list paths | `{ success, error? }` |
| `delete[Entity]` | `delete-[entity].ts` | `z.string().uuid()` (id only) | `db.delete(tableName).where(and(eq(id), eq(userId))).returning()` | Check `result.length === 0` → "Not found" | `{ success, error? }` |

**All actions share:** `"use server"` directive, Zod input validation, `auth()` check, ownership verification via `userId`, `revalidatePath()`, Result type returns.

---

## SECTION 8: UI COMPONENTS

### Wireframe-Based Components (If Step 3.5 Completed)

**Goal:** Refine wireframe foundation code into production-ready React components using shadcn/ui and the design system.

**Reference Files:**
- **Wireframe Prototype:** `/wireframes/` (web) or `/wireframes-mobile/` (mobile)
- **Wireframe Screenshots:** `/docs/wireframes/screenshots/[screen-name]-*.png`
- **Prototype Summary:** `/docs/wireframes/PROTOTYPE-SUMMARY.md`
- **Screen PRDs:** `/docs/wireframes/screen-prds/[screen-name].md`

**UI Profile (Required):**
- `/docs/design/UI-PROFILE.md`
- `/docs/design/ui-profile.json`

> **Rule:** UI Profile constrains **tokens, motion, and effects**. The design system extends the foundation, but UI Profile determines the “personality” (Cool Professional vs Satin Dark, etc.).

---

#### Refinement Strategy

**Phase 1: Analyze Wireframe Components**
1. Review wireframe components at `/wireframes/src/components/`
2. Identify component hierarchy (atoms → molecules → organisms)
3. Note interactive elements and states already implemented
4. Reference wireframe screenshots for visual validation

**Phase 2: Refine for Production**
1. **Review Existing Components:**
   - Wireframe `Button.tsx` → Refine with full Props interface
   - Wireframe `Input.tsx` → Add validation states, accessibility
   - Wireframe `Card.tsx` → Add variants, ensure consistency
   - [Continue for all components]

2. **Formalize Styles from Wireframes:**
   - Colors: Document Tailwind classes as design system tokens
   - Typography: Map font sizes to design system scale
   - Spacing: Document spacing patterns as tokens
   - Borders: Document border-radius values

3. **Enhance Component Specifications:**
   - Add full TypeScript Props interfaces
   - Document all component variants
   - Add missing states (loading, error, success)
   - Ensure accessibility compliance

**Phase 3: Migrate to Production**
1. Option A: Migrate components from `/wireframes/` to main app
2. Option B: Extend wireframes project into production app
3. Add comprehensive tests
4. Verify against wireframe screenshots for visual consistency

---

#### Example: Refining Wireframe Button

**Wireframe Component (existing foundation code):**
```typescript
// /wireframes/src/components/ui/Button.tsx
export function Button({ children, variant = 'primary' }) {
  return (
    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
      {children}
    </button>
  )
}
```

**Production Refinement:**
```typescript
// Production component with full TypeScript
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }
)
```

**Design System Token Mapping:**
- `bg-blue-600` → `primary-600` token
- `px-6 py-3` → `space-6` and `space-3` tokens
- `rounded-lg` → `radius-lg` token (8px)
- `hover:bg-blue-700` → `primary-700` token

---

#### Component Refinement Checklist

**For EACH component from Wireframes:**

**Atoms (Buttons, Inputs, Labels, Icons):**
- [ ] Review wireframe component structure
- [ ] Add full TypeScript Props interface
- [ ] Formalize styles as design system tokens
- [ ] Define all component variants
- [ ] Add states: default, hover, active, disabled, loading
- [ ] Test against wireframe screenshot
- [ ] Validate accessibility (WCAG AA)
- [ ] Add unit tests

**Molecules (Form Fields, Cards, CTA Blocks):**
- [ ] Identify component composition (which atoms)
- [ ] Review wireframe component structure
- [ ] Add TypeScript Props interface
- [ ] Implement component logic refinements
- [ ] Add state management (if needed)
- [ ] Test against wireframe screenshot
- [ ] Validate responsive behavior
- [ ] Add integration tests

**Organisms (Complex Components):**
- [ ] Break down into molecules and atoms
- [ ] Review wireframe component structure
- [ ] Add comprehensive TypeScript interfaces
- [ ] Implement state management (Zustand, React Query)
- [ ] Add business logic
- [ ] Implement all states (empty, loading, populated, error, success)
- [ ] Test against ALL wireframe screenshots (default + states)
- [ ] Validate responsive behavior (mobile, tablet, desktop)
- [ ] Validate accessibility (keyboard nav, screen readers)

---

#### Design Token Reference

**From `/docs/wireframes/PROTOTYPE-SUMMARY.md`:**

**Color Mapping:**
| Wireframe Class | Design System Token | Hex Value |
|-----------------|---------------------|-----------|
| `bg-blue-600` | `primary-600` | `#[HEX]` |
| `text-gray-900` | `neutral-900` | `#[HEX]` |
| [From PROTOTYPE-SUMMARY.md] | [Token] | [Hex] |

**Typography Mapping:**
| Wireframe Class | Design System Token | CSS |
|-----------------|---------------------|-----|
| `text-4xl font-bold` | `display-large` | `48px / 1.2 / 700` |
| `text-lg` | `body-large` | `18px / 1.6 / 400` |
| [From PROTOTYPE-SUMMARY.md] | [Token] | [CSS] |

**Spacing Mapping:**
| Wireframe Class | Design System Token | Value |
|-----------------|---------------------|-------|
| `p-6` | `space-6` | `24px` |
| `gap-4` | `space-4` | `16px` |
| [From PROTOTYPE-SUMMARY.md] | [Token] | [Value] |

---

#### Wireframe Quality Gates

Before marking component refinement complete:
- [ ] **Visual Match:** Production component matches wireframe screenshot (90%+ similarity)
- [ ] **Responsive:** Works on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] **States:** All states implemented (default, hover, active, disabled, loading, error, success)
- [ ] **Accessibility:** WCAG AA compliant (color contrast, keyboard nav, ARIA labels)
- [ ] **Performance:** No layout shifts, fast render (<100ms)
- [ ] **Type-Safe:** Full TypeScript coverage, no `any` types
- [ ] **Design System:** Uses design system tokens (no hardcoded values)
- [ ] **UI Profile Compliance:** Matches `/docs/design/UI-PROFILE.md` guardrails (accent limits, motion damping, gradients/shadows limits) and cool-layer allow-list
- [ ] **Tested:** Unit tests for logic, visual regression tests for UI

---

### SwiftUI Component Templates (iOS Native Apps)

**If platform is SwiftUI, use these templates instead of React:**

#### SwiftUI View Template

```swift
// Views/[Feature]/[Feature]View.swift
import SwiftUI

struct [Feature]View: View {
    @StateObject private var viewModel = [Feature]ViewModel()
    
    var body: some View {
        NavigationStack {
            content
                .navigationTitle("[Feature Title]")
                .toolbar { toolbarContent }
                .task { await viewModel.load() }
        }
    }
    
    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            ProgressView()
        case .loaded(let items):
            List(items) { item in
                [Item]Row(item: item)
            }
        case .empty:
            ContentUnavailableView(
                "No [Items]",
                systemImage: "tray",
                description: Text("Add your first [item] to get started.")
            )
        case .error(let error):
            ContentUnavailableView(
                "Error",
                systemImage: "exclamationmark.triangle",
                description: Text(error.localizedDescription)
            )
        }
    }
    
    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            Button {
                viewModel.showCreateSheet = true
            } label: {
                Label("Add", systemImage: "plus")
            }
        }
    }
}
```

#### SwiftUI ViewModel Template

```swift
// ViewModels/[Feature]ViewModel.swift
import SwiftUI

enum ViewState<T> {
    case loading
    case loaded(T)
    case empty
    case error(Error)
}

@MainActor
class [Feature]ViewModel: ObservableObject {
    @Published private(set) var state: ViewState<[[Item]]> = .loading
    @Published var showCreateSheet = false
    @Published var errorMessage: String?
    
    private let service: [Feature]ServiceProtocol
    
    init(service: [Feature]ServiceProtocol = [Feature]Service()) {
        self.service = service
    }
    
    func load() async {
        state = .loading
        do {
            let items = try await service.fetchItems()
            state = items.isEmpty ? .empty : .loaded(items)
        } catch {
            state = .error(error)
        }
    }
    
    func create(_ input: Create[Item]Input) async {
        do {
            try await service.createItem(input)
            await load() // Refresh list
            showCreateSheet = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

#### SwiftUI Row Component Template

```swift
// Views/[Feature]/[Item]Row.swift
import SwiftUI

struct [Item]Row: View {
    let item: [Item]
    
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.md) {
            // Leading content
            Image(systemName: "star.fill")
                .foregroundStyle(DesignTokens.Colors.brandPrimary)
                .font(.title3)
            
            // Main content
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.xxs) {
                Text(item.title)
                    .font(DesignTokens.Typography.h5)
                    .foregroundStyle(DesignTokens.Colors.textPrimary)
                
                Text(item.subtitle)
                    .font(DesignTokens.Typography.bodySmall)
                    .foregroundStyle(DesignTokens.Colors.textSecondary)
            }
            
            Spacer()
            
            // Trailing content
            Image(systemName: "chevron.right")
                .foregroundStyle(DesignTokens.Colors.textTertiary)
                .font(.caption)
        }
        .padding(.vertical, DesignTokens.Spacing.xs)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.title), \(item.subtitle)")
    }
}
```

#### SwiftUI Form/Create Sheet Template

```swift
// Views/[Feature]/Create[Item]Sheet.swift
import SwiftUI

struct Create[Item]Sheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var viewModel: [Feature]ViewModel
    
    @State private var title = ""
    @State private var description = ""
    @State private var isSubmitting = false
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("New [Item]")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task { await submit() }
                    }
                    .disabled(title.isEmpty || isSubmitting)
                }
            }
        }
    }
    
    private func submit() async {
        isSubmitting = true
        defer { isSubmitting = false }
        
        await viewModel.create(Create[Item]Input(
            title: title,
            description: description
        ))
    }
}
```

**Reference:** `/docs/swiftui/SWIFTUI-BEST-PRACTICES.md` for architecture patterns

---

### Page Structure (React/Next.js)

**Route:** `app/[route]/page.tsx`

```typescript
// app/[route]/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/supabase/auth'
import { get[Entity]List } from '@/actions/[feature]/get-[entity]-list'
import { [Feature]List } from './_components/[feature]-list'
import { [Feature]ListSkeleton } from './_components/[feature]-list-skeleton'

interface PageProps {
  params: { id?: string }
  searchParams: { [key: string]: string | undefined }
}

export default async function [Feature]Page({ params, searchParams }: PageProps) {
  const { user } = await auth()
  if (!user) redirect('/auth/sign-in')
  
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">[Feature Title]</h1>
        {/* Action buttons */}
      </header>
      
      <Suspense fallback={<[Feature]ListSkeleton />}>
        <[Feature]ListWrapper userId={user.id} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function [Feature]ListWrapper({ 
  userId, 
  searchParams 
}: { 
  userId: string
  searchParams: Record<string, string | undefined>
}) {
  const result = await get[Entity]List({ userId, ...searchParams })
  
  if (!result.success) {
    return <div className="text-destructive">{result.error}</div>
  }
  
  return <[Feature]List items={result.data} />
}
```

### Core Components

#### [ComponentName]

**File:** `components/[feature]/[component-name].tsx`

```typescript
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface [Component]Props {
  item: ItemType
  onUpdate?: (item: ItemType) => void
  onDelete?: (id: string) => void
}

export function [ComponentName]({ item, onUpdate, onDelete }: [Component]Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  const handleAction = async () => {
    setIsLoading(true)
    try {
      // Perform action
      toast({ title: "Success", description: "Action completed" })
      router.refresh()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Action failed", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleAction}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Action
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Component State Specifications

| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Normal appearance | Interactive |
| **Loading** | Spinner, disabled | Non-interactive |
| **Success** | Green toast | Refresh data |
| **Error** | Red toast, form preserved | Allow retry |
| **Empty** | Empty state illustration | Show CTA |

---

## SECTION 9: NON-FUNCTIONAL REQUIREMENTS

### Performance
| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load (LCP) | < 2.5s | Lighthouse CI |
| API Response (P95) | < 200ms | Server logs |
| First Input Delay | < 100ms | Web Vitals |
| Bundle Size | < 200KB (initial) | Bundle analyzer |

### Security
- [ ] Authentication required for all mutations
- [ ] Authorization checked (user owns resource)
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevented (parameterized queries via ORM)
- [ ] XSS prevented (React default escaping)
- [ ] RLS policies enforce data isolation

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all interactions
- [ ] Screen reader compatible (ARIA labels)
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible

---

## SECTION 10: TESTING STRATEGY

### Unit Tests (Given/When/Then)

```typescript
// __tests__/[feature].test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { create[Entity] } from '@/actions/[feature]/create-[entity]'

describe('[Feature] - Create', () => {
  // Given/When/Then format
  describe('Given valid input', () => {
    describe('When creating a new [entity]', () => {
      it('Then should return success with ID', async () => {
        const input = { fieldName: 'Test Value' }
        const result = await create[Entity](input)
        
        expect(result.success).toBe(true)
        expect(result.data?.id).toBeDefined()
      })
    })
  })
  
  describe('Given invalid input', () => {
    describe('When field is empty', () => {
      it('Then should return validation error', async () => {
        const input = { fieldName: '' }
        const result = await create[Entity](input)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('required')
      })
    })
  })
  
  describe('Given unauthorized user', () => {
    describe('When creating without auth', () => {
      it('Then should return unauthorized error', async () => {
        // Mock no auth
        const result = await create[Entity]({ fieldName: 'Test' })
        
        expect(result.success).toBe(false)
        expect(result.error).toBe('Unauthorized')
      })
    })
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/[feature].spec.ts
import { test, expect } from '@playwright/test'

test.describe('[Feature] E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })
  
  test('should create new [entity]', async ({ page }) => {
    // Given: User is on the feature page
    await page.goto('/[feature]')
    
    // When: User clicks create and fills form
    await page.click('[data-testid="create-button"]')
    await page.fill('[name="fieldName"]', 'Test Entity')
    await page.click('[data-testid="submit-button"]')
    
    // Then: New entity appears in list
    await expect(page.locator('[data-testid="entity-item"]')).toContainText('Test Entity')
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })
  
  test('should show validation error for empty field', async ({ page }) => {
    await page.goto('/[feature]/new')
    await page.click('[data-testid="submit-button"]')
    
    await expect(page.locator('[data-testid="field-error"]')).toContainText('required')
  })
})
```

### Test Coverage Targets
| Area | Target | Critical Paths |
|------|--------|----------------|
| Unit Tests | 80%+ | Business logic, validation |
| Integration | 60%+ | API endpoints, DB queries |
| E2E | Key flows | Create, Read, Update, Delete |

---

## SECTION 11: ROLLOUT PLAN

### Phase 1: Foundation (Days 1-3)
- [ ] Database migration applied
- [ ] Schema types generated
- [ ] Server actions implemented
- [ ] Unit tests passing (80%+)

### Phase 2: UI Implementation (Days 4-7)
- [ ] Page components built
- [ ] Loading/error states implemented
- [ ] Form validation working
- [ ] Integration tests passing

### Phase 3: Polish & Testing (Days 8-10)
- [ ] E2E tests passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Error tracking configured

### Phase 4: Deploy (Days 11-12)
- [ ] Staging deployment
- [ ] QA sign-off
- [ ] Production deployment
- [ ] Monitoring dashboards configured

---

## SECTION 12: SUCCESS CRITERIA (Measurable)

| Metric | Current Baseline | Target | Measurement Method | Timeline |
|--------|------------------|--------|-------------------|----------|
| [Primary Metric] | [Baseline] | [Target] | [How to measure] | [When] |
| [Secondary Metric] | [Baseline] | [Target] | [How to measure] | [When] |
| Task Completion Rate | N/A | > 90% | Analytics events | Week 2 |
| Error Rate | N/A | < 1% | Sentry tracking | Week 1 |
| User Satisfaction | N/A | NPS > 40 | In-app survey | Week 4 |

### Hypothesis Validation
| Hypothesis | Success Signal | Measurement | Decision |
|------------|----------------|-------------|----------|
| [From Section 2] | [What we expect to see] | [How we measure] | [Pivot/Persevere threshold] |

---

## SECTION 13: OPEN QUESTIONS & ASSUMPTIONS

### Open Questions
| ID | Question | Owner | Due Date | Impact if Unresolved |
|----|----------|-------|----------|---------------------|
| Q1 | [Question needing stakeholder input] | [Name] | [Date] | [Impact] |
| Q2 | [Technical question] | [Name] | [Date] | [Impact] |

### Assumptions
| ID | Assumption | Risk if Wrong | Validation Plan |
|----|------------|---------------|-----------------|
| A1 | [Assumption made] | [What happens if wrong] | [How we'll validate] |
| A2 | [Assumption made] | [What happens if wrong] | [How we'll validate] |

---

## SECTION 14: REFERENCES & MCP RESEARCH

### Step References
- **Step 1 (Master PRD):** `docs/specs/MASTER_PRD.md` - [Specific section referenced]
- **Step 2 (Architecture):** `docs/architecture/ARCHITECTURE.md` - [Specific section]
- **Step 3 (UX Design):** `docs/ux/UX-DESIGN.md` - [Specific user flow]
- **Step 4 (Flow Tree):** 
  - `docs/flows/FLOW-TREE.md` - [Specific screen flow]
  - `docs/flows/SCREEN-INVENTORY.md` - [Screen specifications]
  - `docs/flows/TRACEABILITY-MATRIX.md` ⭐ - [PRD feature-to-screen mapping]
- **Step 5 (Wireframes):** 
  - `docs/prds/flows/FLOW-*.md` - [Per-flow PRDs with screen specs]
  - `docs/prds/flows/WIREFRAME-TRACKER.md` ⭐ - [Screen completion tracking]
  - `docs/flows/ZERO-OMISSION-CERTIFICATE.md` ⭐ - [100% coverage proof]
  - `docs/wireframes/PROTOTYPE-SUMMARY.md` - [Design decisions, component inventory]
- **Step 6 (Design System):** `docs/design/DESIGN-SYSTEM.md` - [Specific tokens]
- **Step 7 (Interface States):** `docs/states/STATE-SPEC.md` - [Specific states]
- **Step 8 (Technical Spec):** `docs/technical/TECHNICAL-SPEC.md` - [Specific tech]
- **Step 10 (Feature Breakdown):** `docs/implementation/FEATURE-BREAKDOWN.md` - Feature F[N]
- **Step 10 (Betting Table):** `docs/implementation/BETTING-TABLE.md` - Row [N]
- **Step 10 (Rabbit Holes):** `docs/implementation/RABBIT-HOLES.md` - [Specific risks]

### MCP Research Notes

#### Exa Research
- **Query:** "[Feature] implementation examples [Tech Stack]"
- **Key Findings:** [Summarize patterns found]
- **Code Examples:** [Link to relevant examples]

#### Supabase MCP Research
- **Query:** "[Database pattern] RLS policies"
- **Key Findings:** [Summarize patterns]
- **Applied Patterns:** [Which patterns used in this PRD]

#### RevenueCat MCP Research (Mobile)
- **Query:** "Offerings configuration" or "Subscription status"
- **Key Findings:** [Summarize findings]
- **Applied Patterns:** [Entitlement structure]

#### App Store Connect MCP Research (Mobile)
- **Query:** "App metadata" or "TestFlight groups"
- **Key Findings:** [Summarize findings]
- **Applied Patterns:** [Release requirements]

#### 21st.dev Research
- **Query:** "[Component type]"
- **Components Found:** [List components]
- **Selected:** [Which components integrated]

### Related PRDs
- [F[X] - Dependency PRD Name](./F[X]-[NAME].md)
- [F[Y] - Related PRD Name](./F[Y]-[NAME].md)

---

## SECTION 15: AGENTIC IMPLEMENTATION GUIDE

**Purpose:** Make this PRD fully actionable for AI coding agents (Cursor, Claude, Copilot). Eliminate ambiguity.

### File Manifest

| File | Action | Layer | Description |
|------|--------|-------|-------------|
| `db/schema/[feature].ts` | CREATE | Database | Drizzle schema definitions |
| `db/migrations/XXXX_[feature].sql` | CREATE | Database | SQL migration file |
| `actions/[feature]/create.ts` | CREATE | API | Server action for create operation |
| `actions/[feature]/get.ts` | CREATE | API | Server action for read operations |
| `actions/[feature]/update.ts` | CREATE | API | Server action for update operation |
| `actions/[feature]/delete.ts` | CREATE | API | Server action for delete operation |
| `components/[feature]/[Name]Form.tsx` | CREATE | UI | Form component with validation |
| `components/[feature]/[Name]List.tsx` | CREATE | UI | List component with data fetching |
| `components/[feature]/[Name]Card.tsx` | CREATE | UI | Card component for display |
| `app/[feature]/page.tsx` | CREATE | UI | Page component (route handler) |
| `__tests__/[feature]/[action].test.ts` | CREATE | Test | Unit tests for server actions |

### Implementation Order

**Phase 1: Database (enables type generation)**
1. Create Drizzle schema (`db/schema/[feature].ts`)
2. Run `npx drizzle-kit generate` to create migration
3. Run `npx drizzle-kit push` to apply migration
4. Enable RLS and create policies

**Phase 2: Server Actions (backend complete before UI)**
1. Create Zod validation schemas
2. Implement CRUD server actions
3. Test actions with Postman/Thunder Client
4. Verify RLS policies work correctly

**Phase 3: UI Components (uses generated types)**
1. Create form components (uses Zod schema for validation)
2. Create list/display components
3. Create page components that compose above
4. Wire up data fetching (TanStack Query or Server Components)

**Phase 4: Testing & Integration**
1. Write unit tests for server actions
2. Write integration tests for key flows
3. Manual testing of complete feature
4. Performance testing if needed

### Dependencies to Install

```bash
# List exact packages needed for this feature
npm install [package]@[version]
```

| Package | Version | Purpose |
|---------|---------|---------|
| [package] | [version] | [purpose] |

### Environment Variables Required

```env
# Add to .env.local (required for this feature)
[VARIABLE_NAME]=[description_or_example]
```

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| [VAR] | [description] | Yes/No | [example value] |

### Code Examples (Complete with Imports)

**Example Server Action:**
```typescript
// actions/[feature]/create.ts
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { featureTable } from "@/db/schema/feature"

const schema = z.object({
  // ... validation schema
});

type ActionState = 
  | { success: true; data: { id: string } }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function create[Feature](
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Implementation per Section 7
}
```

### Agent Instructions

**For AI Coding Agents:**
1. Follow the Implementation Order exactly
2. Use exact file paths from File Manifest
3. Include all imports shown in code examples
4. Run type-check after each file: `npx tsc --noEmit`
5. Test each layer before moving to next
6. Commit after completing each phase

**Verification Commands:**
```bash
# After Phase 1 (Database)
npx drizzle-kit studio  # Verify tables created

# After Phase 2 (Server Actions)
npm run test:actions    # Run action tests

# After Phase 3 (UI)
npm run dev             # Visual verification
npm run lint            # No lint errors

# After Phase 4 (Complete)
npm run test            # All tests pass
npm run build           # Build succeeds
```

---

## SECTION 16: RALPH LOOP TASKS (Auto-Generated Checklist)

**Purpose:** Machine-readable task checklist for Ralph Loop autonomous implementation. Each task maps to a story in `ralph-backlog.json`.

### Task ID Format

| Prefix | Category | Example | Description |
|--------|----------|---------|-------------|
| `DB-` | Database | DB-001 | Schema creation, migrations, RLS policies |
| `API-` | Server Actions | API-001 | Server actions, API routes, backend logic |
| `UI-` | UI Components | UI-001 | React components, forms, lists, cards |
| `PAGE-` | Page Routes | PAGE-001 | App router pages, layouts, loading states |
| `TEST-` | Testing | TEST-001 | Unit tests, integration tests, E2E tests |
| `VERIFY-` | Verification | VERIFY-001 | Type checks, lint, build verification |
| `UI-VAL-` | UI Validation | UI-VAL-001 | Browser-based UI validation, visual checks |

### Task Checklist (22 Tasks Across 6 Phases)

<!-- Auto-generated by Step 11.25 PRD-to-JSON conversion. Each checkbox = one Ralph Loop story. -->

**Phase 1: Database Layer**
- [ ] **DB-001:** Create database schema (`db/schema/[feature].ts`)
- [ ] **DB-002:** Run migration (`npx drizzle-kit push`)
- [ ] **DB-003:** Configure RLS policies (Supabase dashboard or SQL)
- [ ] **DB-004:** Add database indexes for query optimization

**Phase 2: Server Actions (API Layer)**
- [ ] **API-001:** Create server action: `create[Feature]` (`actions/[feature]/create.ts`)
- [ ] **API-002:** Create server action: `get[Feature]s` (`actions/[feature]/get.ts`)
- [ ] **API-003:** Create server action: `get[Feature]ById` (`actions/[feature]/get-by-id.ts`)
- [ ] **API-004:** Create server action: `update[Feature]` (`actions/[feature]/update.ts`)
- [ ] **API-005:** Create server action: `delete[Feature]` (`actions/[feature]/delete.ts`)

**Phase 3: UI Components**
- [ ] **UI-001:** Create form component (`components/[feature]/[Name]Form.tsx`)
- [ ] **UI-002:** Create list component (`components/[feature]/[Name]List.tsx`)
- [ ] **UI-003:** Create card/item component (`components/[feature]/[Name]Card.tsx`)
- [ ] **UI-004:** Create detail view component (`components/[feature]/[Name]Detail.tsx`)
- [ ] **UI-005:** Create loading skeleton (`components/[feature]/[Name]Skeleton.tsx`)

**Phase 4: Page Routes**
- [ ] **PAGE-001:** Create page route (`app/[feature]/page.tsx`)
- [ ] **PAGE-002:** Create detail page route (`app/[feature]/[id]/page.tsx`)
- [ ] **PAGE-003:** Create loading state (`app/[feature]/loading.tsx`)
- [ ] **PAGE-004:** Update navigation/sidebar if needed

**Phase 5: Testing**
- [ ] **TEST-001:** Write server action tests (`__tests__/[feature]/actions.test.ts`)
- [ ] **TEST-002:** Write component tests (`__tests__/[feature]/components.test.tsx`)

**Phase 6: Verification & Validation**
- [ ] **VERIFY-001:** Run type check (`npx tsc --noEmit`) - passes
- [ ] **VERIFY-002:** Run lint (`npm run lint`) - no errors
- [ ] **VERIFY-003:** Run tests (`npm run test`) - passes
- [ ] **VERIFY-004:** Run build (`npm run build`) - succeeds
- [ ] **UI-VAL-001:** Validate UI renders at `/[feature]` route
- [ ] **UI-VAL-002:** Validate interactive elements respond correctly

### Acceptance Criteria Mapping

| Task ID | Story ID | AC Type | Verification Command |
|---------|----------|---------|---------------------|
| DB-001 | f[n]-db-schema | file-exists | `ls db/schema/[feature].ts` |
| DB-002 | f[n]-db-migration | command | `npx drizzle-kit push --dry-run` |
| DB-003 | f[n]-db-rls | file-contains | `grep "POLICY" db/schema/[feature].ts` |
| API-001 | f[n]-api-create | file-contains | `grep "use server" actions/[feature]/create.ts` |
| API-002 | f[n]-api-get | file-exists | `ls actions/[feature]/get.ts` |
| UI-001 | f[n]-ui-form | file-exists | `ls components/[feature]/[Name]Form.tsx` |
| PAGE-001 | f[n]-page-main | file-exists | `ls app/[feature]/page.tsx` |
| TEST-001 | f[n]-test-actions | file-exists | `ls __tests__/[feature]/actions.test.ts` |
| VERIFY-001 | f[n]-typecheck | command | `npx tsc --noEmit` |
| VERIFY-004 | f[n]-build | command | `npm run build` |
| UI-VAL-001 | f[n]-ui-validation | ui-validation | `agent-browser validate /[feature]` |

### Ralph Loop Configuration

```json
{
  "featureId": "F[N]",
  "featureName": "[Feature Name]",
  "totalTasks": 22,
  "phases": [
    { "name": "Database Layer", "tasks": ["DB-001", "DB-002", "DB-003", "DB-004"] },
    { "name": "Server Actions", "tasks": ["API-001", "API-002", "API-003", "API-004", "API-005"] },
    { "name": "UI Components", "tasks": ["UI-001", "UI-002", "UI-003", "UI-004", "UI-005"] },
    { "name": "Page Routes", "tasks": ["PAGE-001", "PAGE-002", "PAGE-003", "PAGE-004"] },
    { "name": "Testing", "tasks": ["TEST-001", "TEST-002"] },
    { "name": "Verification", "tasks": ["VERIFY-001", "VERIFY-002", "VERIFY-003", "VERIFY-004", "UI-VAL-001", "UI-VAL-002"] }
  ],
  "estimatedIterations": 6,
  "uiValidation": {
    "mode": "agent-browser",
    "route": "/[feature]",
    "detailRoute": "/[feature]/[id]",
    "checks": ["renders", "interactive-elements", "no-console-errors", "responsive"]
  },
  "dependencies": {
    "API-*": ["DB-001", "DB-002"],
    "UI-*": ["API-001", "API-002"],
    "PAGE-*": ["UI-001", "UI-002"],
    "TEST-*": ["API-*"],
    "VERIFY-*": ["PAGE-001"],
    "UI-VAL-*": ["PAGE-001", "VERIFY-004"]
  }
}
```

### Instructions for Creating Ralph-Compatible Task Lists

1. **Use Task ID Prefixes:** Every task must have a prefix from the table above (DB-, API-, UI-, PAGE-, TEST-, VERIFY-, UI-VAL-)

2. **Include File Paths:** Each task should specify the exact file path in parentheses: `Create component (components/feature/Name.tsx)`

3. **Map to Acceptance Criteria:** Every task should have at least one AC entry in the mapping table

4. **Define Dependencies:** Tasks should respect the dependency order:
   - Database → Server Actions → UI Components → Pages → Tests → Verification → UI Validation

5. **Keep Tasks Atomic:** Each task should produce exactly one file or run one command. Split large tasks.

6. **Verify Command Format:** Verification commands must be executable and return exit code 0 on success

**Note:** This section is consumed by Step 11.25 (PRD-to-JSON) to generate the `ralph-backlog.json` file. Task IDs must be unique within the PRD.

---

**Document Owner:** [Owner Name]
**Last Updated:** [Date]
**Estimated Effort:** [Appetite from Section 0]
**Dependencies:** [List from Section 0]
```

---

## QUALITY GATES (Must Pass Before Implementation)

### Gate 1: Completeness Gate
- [ ] All 17 sections have concrete content (no TBDs)
- [ ] Section 0 metadata imported from Step 10 Betting Table
- [ ] Press Release (Section 1) written and compelling
- [ ] Outcome linkage documented (Section 2)

### Gate 2: BDD Testability Gate
- [ ] All user stories have Given/When/Then scenarios
- [ ] Happy path, edge cases, AND error cases covered
- [ ] Scenarios can be converted to automated tests
- [ ] Outcomes are specific and measurable

### Gate 3: Technical Feasibility Gate
- [ ] Database schema includes actual SQL/Drizzle code
- [ ] Server actions have full implementations with Zod
- [ ] UI components have Props interfaces
- [ ] Dependencies from Betting Table are satisfied

### Gate 4: Scope Clarity Gate
- [ ] IN SCOPE is explicit (not assumed)
- [ ] OUT OF SCOPE is explicit (No-Gos documented)
- [ ] Rabbit Holes from Step 10 documented with mitigations
- [ ] Appetite defines effort budget

### Gate 5: Outcome Validation Gate
- [ ] Links to business outcome from Step-1 PRD
- [ ] Hypothesis is testable (Lean UX format)
- [ ] Success metrics are measurable with specific targets
- [ ] Impact Chain is complete

### Gate 6: Anti-Pattern Gate
- [ ] No vague requirements (all specific and measurable)
- [ ] No missing edge cases (BDD covers all scenarios)
- [ ] No over-specification (WHAT not HOW)
- [ ] No disconnected features (all linked to outcomes)

### Gate 7: Backend Completeness Gate (NEW)
**Purpose:** Ensure backend is fully specified, not "TBD" or deferred.

- [ ] **Database Schema:** Includes actual Drizzle ORM code (not just descriptions)
- [ ] **Database RLS:** Policies defined for all new tables with actual SQL
- [ ] **Database Indexes:** Indexes specified for query patterns and RLS columns
- [ ] **Server Actions:** At least one server action with full implementation code
- [ ] **Zod Schemas:** Every server action input has a Zod validation schema
- [ ] **Result Types:** Return types are explicit (success + typed error cases)
- [ ] **OWASP Security:** API Security Top 10 considerations documented in PRD
- [ ] **Auth Per-Endpoint:** Authentication requirements specified for each endpoint
- [ ] **No Orphan UIs:** If UI component fetches/mutates data, corresponding server action exists
- [ ] **Section 0.5 Complete:** Full Stack Overview filled in with concrete values (not "TBD")

**Blocking:** PRD fails this gate if any UI component references a server action that isn't fully specified.

### Gate 8: Agentic Readiness Gate (NEW)
**Purpose:** Ensure PRD can be implemented by AI coding agents without ambiguity.

- [ ] **File Paths Explicit:** All files use exact paths (`components/feature/Name.tsx` not "create a component")
- [ ] **Imports Included:** Code examples include all import statements
- [ ] **Dependencies Listed:** npm packages listed with exact versions
- [ ] **Implementation Order:** Section 15 specifies exact build sequence
- [ ] **Test Paths Included:** Test file locations specified
- [ ] **Environment Variables:** All required env vars documented with examples
- [ ] **Verification Commands:** Commands provided to verify each implementation phase
- [ ] **No Ambiguous Instructions:** Every instruction has exactly one interpretation

**Test:** Have an AI agent read just this PRD and list the files it would create. If the list doesn't match Section 15 File Manifest exactly, the PRD fails this gate.

### Gate 9: Ralph Loop Readiness Gate (NEW)
**Purpose:** Ensure PRD is optimized for autonomous Ralph Loop execution.

- [ ] **Section 16 Present:** Ralph Loop Tasks section exists with task checklist
- [ ] **Task IDs Unique:** Each task has a unique ID (e.g., DB-001, API-001, UI-001)
- [ ] **Acceptance Criteria Mapping:** Each task maps to an AC type (file-exists, command, ui-validation)
- [ ] **Verification Commands:** Each task has a shell command to verify completion
- [ ] **UI Validation Config:** If feature has UI, includes agent-browser validation configuration
- [ ] **Estimated Iterations:** Ralph Loop iteration estimate is provided
- [ ] **No Manual-Only Tasks:** Minimize tasks requiring human signoff (prefer machine-verifiable)

**Test:** Run `sigma ralph --dry-run --prd F[N]-[feature].md` and verify tasks parse correctly into stories.

---

## Auto-Verification Step

**After PRD generation, automatically run:**

```bash
@verify-prd --feature=[Feature Name]
```

**Expected Score:** 8+/10

**If score < 8:**
1. Read verification feedback
2. Identify weak sections
3. Regenerate those sections with more detail
4. Re-run verification
5. Repeat until score ≥ 8

---

## Final Review Gate

**All outputs for this step:**
- [ ] docs/prds/F[N]-[FEATURE-NAME].md created (600-1000 lines)
- [ ] docs/prds/.prd-status.json updated
- [ ] All quality gates passed (100/100 verification score)
- [ ] verify-prd score >= 8/10

**Quality Gates Passed:**
- [ ] Completeness Gate: All 17 sections complete
- [ ] BDD Testability Gate: Given/When/Then for all stories
- [ ] Technical Feasibility Gate: Code implementations included
- [ ] Scope Clarity Gate: Boundaries clear, Rabbit Holes documented
- [ ] Outcome Validation Gate: Hypothesis testable, metrics defined
- [ ] Anti-Pattern Gate: No common PRD failures
- [ ] Backend Completeness Gate: Score >= 12/15
- [ ] Agentic Readiness Gate: Score >= 8/10

---
**>>> FINAL CHECKPOINT: STEP 11 COMPLETE <<<**

**Do NOT proceed to Step 12 without explicit approval.**

Reply `approve step 11` to finalize, or `revise: [section]` to improve.
---

---
## Optional: Ralph Loop (Autonomous Implementation)

To convert PRDs into a machine-executable backlog and run autonomous implementation:
1. Run `/prd-json` to convert PRDs → `docs/ralph/implementation/prd.json`
2. Run `./ralph/sigma-ralph.sh --workspace=. --mode=implementation`

See `ralph/README.md` for setup and usage.

---

## Terminology Reference

| Old Term | New Term | Source |
|----------|----------|--------|
| Priority | **Betting Confidence** | Ryan Singer |
| Complexity (S/M/L) | **Appetite** | Ryan Singer |
| User Story | **BDD Scenario** | Dan North |
| Acceptance Criteria | **Executable Specification** | Gojko Adzic |
| Requirements | **Shaped Work** | Ryan Singer |
| Feature PRD | **Product Pitch** | Basecamp |
| Executive Summary | **Press Release** | Amazon |
| Risk | **Rabbit Hole** | Ryan Singer |
| Success Metric | **Hypothesis Validation Signal** | Lean UX |

---

<verification>
## Step 11 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| PRD Status | /docs/prds/.prd-status.json | 50B | 5 |
| PRD Directory | /docs/prds/ | exists | 3 |
| At Least 1 PRD | /docs/prds/F*-*.md | 5KB | 8 |
| PRD Template | /docs/prds/PRD-TEMPLATE.md | 2KB | 4 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| F*-*.md | ## Press Release | 4 |
| F*-*.md | ## Problem Statement | 4 |
| F*-*.md | ## Solution | 4 |
| F*-*.md | ## User Stories | 5 |
| F*-*.md | ## Technical Specification | 5 |
| F*-*.md | ## Acceptance Criteria | 5 |
| F*-*.md | ## Rabbit Holes | 3 |

### Content Quality (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:F*-*.md:Given.*When.*Then | BDD acceptance criteria | 5 |
| has_pattern:F*-*.md:interface\|type.*= | TypeScript interfaces present | 4 |
| has_pattern:F*-*.md:Appetite.*Small\|Big | Appetite defined per Shape Up | 3 |
| word_count:F*-*.md:1500 | PRD has substantial content (1500+ words) | 4 |
| json_valid:.prd-status.json | Valid PRD status tracking | 2 |
| has_table:F*-*.md | Feature tables present | 2 |

### Backend Completeness (15 points) — NEW

| Check | Description | Points |
|-------|-------------|--------|
| has_section:F*-*.md:SECTION 0.5.*FULL STACK OVERVIEW | Full Stack Overview present | 3 |
| has_pattern:F*-*.md:CREATE TABLE\|export const.*=.*pgTable | Database schema code present | 3 |
| has_pattern:F*-*.md:CREATE POLICY\|ENABLE ROW LEVEL SECURITY | RLS policies defined | 2 |
| has_pattern:F*-*.md:z\.object\|z\.string\|z\.number | Zod validation schemas | 2 |
| has_pattern:F*-*.md:"use server"\|export async function.*Action | Server actions present | 3 |
| has_pattern:F*-*.md:success: true\|success: false | Result pattern return types | 2 |

### Agentic Readiness (10 points) — NEW

| Check | Description | Points |
|-------|-------------|--------|
| has_section:F*-*.md:SECTION 15.*AGENTIC | Agentic Implementation Guide present | 2 |
| has_pattern:F*-*.md:File Manifest | File Manifest table present | 2 |
| has_pattern:F*-*.md:Implementation Order | Implementation Order specified | 2 |
| has_pattern:F*-*.md:components/\|actions/\|db/\|app/ | Explicit file paths (not generic) | 2 |
| has_pattern:F*-*.md:npm install\|pnpm add | Dependencies listed | 2 |

### Ralph Loop Readiness (10 points) — NEW

| Check | Description | Points |
|-------|-------------|--------|
| has_section:F*-*.md:SECTION 16.*RALPH LOOP | Ralph Loop Tasks section present | 2 |
| has_pattern:F*-*.md:Task Checklist | Task checklist with checkboxes | 2 |
| has_pattern:F*-*.md:DB-\d+\|API-\d+\|UI-\d+ | Unique task IDs present | 2 |
| has_pattern:F*-*.md:Acceptance Criteria Mapping | AC mapping table present | 2 |
| has_pattern:F*-*.md:agent-browser\|ui-validation | UI validation configured | 2 |

### Security (5 points) — NEW

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:F*-*.md:OWASP\|BOLA\|API Security | OWASP considerations documented | 2 |
| has_pattern:F*-*.md:auth\(\)\|auth\.uid\(\)\|getUser | Auth checks in server actions | 2 |
| has_pattern:F*-*.md:rate limit\|Rate Limit | Rate limiting specified | 1 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| PRD Verified | verify-prd score >= 8/10 | 5 |
| Status Tracked | .prd-status.json updated | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Implementation Ready | No TBDs in Sections 0.5, 6, 7, 15 | 4 |
| Testable | BDD scenarios are executable | 3 |
| Scoped | Boundaries and rabbit holes documented | 3 |

### Gate Summary (Pass/Fail)

| Gate | Requirement | Auto-Check |
|------|-------------|------------|
| Gate 7 | Backend Completeness | Backend score >= 12/15 |
| Gate 8 | Agentic Readiness | Agentic score >= 8/10 |

**Minimum Passing Score:** 100/100 — No room for incomplete PRDs
**Blocking:** PRDs scoring below 100 MUST be revised before proceeding to Step 12

</verification>
