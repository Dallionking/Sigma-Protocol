---
name: new-command
description: "Create a new Sigma command with research-backed frameworks, expert citations, Epistemic Gate blocks, and consistent structure"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# new-command

**Source:** Sigma Protocol generators module
**Version:** 3.0.0

---


# @new-command — Create Research-Backed Command

**Mission**
Create new Sigma commands that follow the gold standard established by the steps/ folder. Every command should cite industry experts, include HITL checkpoints, quality gates, and proper MCP tool configuration.

**Context:** You are a **Command Architect** building tools that meet $1B startup standards.

---

## 📋 Command Parameters

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `--name` | Command name (e.g., `security-audit`) | Yes | - |
| `--folder` | Target folder (steps, audit, dev, deploy, ops, generators) | Yes | - |
| `--type` | Command type: `workflow`, `audit`, `generator`, `utility` | No | `workflow` |
| `--tier` | Epistemic tier: `1` (decision), `2` (analysis), `3` (execution), `4` (content) | No | Auto-detect |
| `--skip-research` | Skip expert research phase | No | `false` |

---

## 🔬 Phase A: Expert Research Methodology

**Goal:** Find 3-5 industry experts and their frameworks relevant to the command's domain.

### A1: Research Sources (Priority Order)

1. **Books/Publications**
   - O'Reilly publications
   - Addison-Wesley Professional
   - Pragmatic Programmers
   - Industry whitepapers

2. **Industry Standards**
   - ISO standards (ISO 27001, ISO 9001)
   - OWASP (security)
   - WCAG (accessibility)
   - DORA (DevOps)
   - NIST (security frameworks)

3. **Thought Leaders**
   - Conference speakers (QCon, StrangeLoop, KubeCon)
   - Blog authors with 10+ years experience
   - Authors of canonical books
   - Framework creators

4. **Companies/Teams**
   - Google (SRE, design systems)
   - Netflix (chaos engineering, microservices)
   - Stripe (API design, documentation)
   - Airbnb (design systems, testing)

### A2: Expert Research Queries

**Use Exa deep research for each domain:**

```
Domain: [Security]
Query: "Who are the leading experts in application security and what frameworks did they create?"
Expected: OWASP founders, Gary McGraw, Dan Kaminsky, Troy Hunt

Domain: [Performance]
Query: "Who are the leading experts in web performance and what methodologies did they create?"
Expected: Ilya Grigorik, Addy Osmani, Steve Souders, Philip Walton

Domain: [DevOps]
Query: "Who are the leading experts in DevOps and what frameworks did they create?"
Expected: Gene Kim, Nicole Forsgren, Jez Humble, Patrick Debois

Domain: [UX]
Query: "Who are the leading experts in user experience design and what frameworks did they create?"
Expected: Don Norman, Jakob Nielsen, Steve Krug, Alan Cooper

Domain: [Architecture]
Query: "Who are the leading experts in software architecture and what patterns did they create?"
Expected: Martin Fowler, Uncle Bob, Eric Evans, Kent Beck
```

### A3: Document Expert Findings

**Template for each expert:**

```markdown
## Expert: [Name]
- **Credentials:** [Title, Company, Publications]
- **Framework/Methodology:** [Name of framework]
- **Key Principles:**
  1. [Principle 1]
  2. [Principle 2]
  3. [Principle 3]
- **How to Apply:** [Specific application to this command]
- **Source:** [Book/Article/Talk URL]
```

**HITL Checkpoint →** Present expert research findings. Wait for approval.

---

## 📐 Phase B: Command Structure Template

### B1: Required Frontmatter

```yaml
---
description: "[Step/Category] X: [Name] - [One-line purpose]"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_Ref_ref_search_documentation
  - mcp_Ref_ref_read_url
  - mcp_exa_web_search_exa
  - mcp_exa_get_code_context_exa
  
  # ALWAYS ACTIVE (Specialized) - Add if applicable
  - mcp_supabase-mcp-server_search_docs      # For database commands
  - mcp_21st-devmagic_21st_magic_component_builder  # For UI commands
  - mcp_sequential-thinking_sequentialthinking      # For complex logic
  
  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_perplexity-ask_perplexity_ask
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
  - todo_write
parameters:
  - --flag1
  - --flag2
---
```

### B2: Required Sections (In Order)

```markdown
# @[command-name] — [Descriptive Title]

**Mission**
[Clear purpose statement with valuation context - "$1B startup standard"]

**Context:** You are a **[Specialist Role]** ensuring [quality outcome].

---

## 🎯 Purpose & Scope

[Why this command exists, what problems it solves]

---

## 📚 Expert Frameworks

### [Framework 1 Name] ([Expert Name])
- **Concept:** [Brief explanation]
- **Application:** [How we apply it]
- **Source:** [Book/Article]

### [Framework 2 Name] ([Expert Name])
[Same structure]

---

## 📋 Preflight (auto)

1) **Get date**: `date +"%Y-%m-%d"`
2) **Create required folders**: [List folders]
3) **Load prerequisites**: [What to read first]

---

## 🎯 Planning & Task Creation

**Before executing, create comprehensive task list:**

```markdown
## [Command-Name] Execution Plan

### Phase A: [Name]
- [ ] Task 1
- [ ] Task 2
- [ ] HITL checkpoint: [What to present]
- [ ] Wait for approval

### Phase B: [Name]
- [ ] Task 1
- [ ] Task 2
- [ ] HITL checkpoint: [What to present]
- [ ] Wait for approval

[Continue phases...]
```

---

## 📥 Inputs to Capture

**Ask user:**
1. [Question 1]
2. [Question 2]

---

## 👥 Persona Pack

### [Persona 1 Name] — [Role]
[What this persona focuses on]

### [Persona 2 Name] — [Role]
[What this persona focuses on]

---

## Phase A: [Name]

### A1: [Sub-phase]
[Detailed instructions]

### A2: [Sub-phase]
[Detailed instructions]

**HITL Checkpoint →** [What to present and ask]

---

## Phase B: [Name]
[Continue with phases...]

---

## 📝 Document Assembly

**Files to Create:**
- `/path/to/FILE-1.md` — [Description]
- `/path/to/FILE-2.md` — [Description]

**Files to Update:**
- `/path/to/existing.md` — [What to add]

---

## ✅ Quality Gates

Before completing, verify:

1. [ ] [Gate 1]
2. [ ] [Gate 2]
3. [ ] [Gate 3]
4. [ ] [Gate 4]

---

## 🚪 Final Review Gate

**Prompt to user (blocking):**
> "Please review [output].
> • Reply `approve` to complete, or
> • Reply `revise: [feedback]` to iterate.
> I won't continue until you approve."

---

## 🔗 Related Commands

- **Run Before:** `@[command]` — [Why]
- **Run After:** `@[command]` — [Why]
- **Alternative:** `@[command]` — [When to use instead]

---

<verification>
## [Command] Verification Schema

### Required Files (20 points)
| File | Path | Min Size | Points |
|------|------|----------|--------|
| [File 1] | /path/to/file | 1KB | 10 |
| [File 2] | /path/to/file | 1KB | 10 |

### Required Sections (30 points)
| Document | Section | Points |
|----------|---------|--------|
| [Doc] | ## Section 1 | 10 |
| [Doc] | ## Section 2 | 10 |
| [Doc] | ## Section 3 | 10 |

### Content Quality (30 points)
| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:[file]:[regex] | [What to check] | 10 |
| has_pattern:[file]:[regex] | [What to check] | 10 |
| has_pattern:[file]:[regex] | [What to check] | 10 |

### Checkpoints (10 points)
| Checkpoint | Evidence | Points |
|------------|----------|--------|
| [Checkpoint 1] | [How to verify] | 5 |
| [Checkpoint 2] | [How to verify] | 5 |

### Success Criteria (10 points)
| Criterion | Check | Points |
|-----------|-------|--------|
| [Criterion 1] | [How to verify] | 5 |
| [Criterion 2] | [How to verify] | 5 |

</verification>
```

---

## 🔧 Phase C: MCP Tool Configuration

### C1: Tool Priority Hierarchy

**ALL commands must follow this hierarchy:**

```yaml
# TIER 1: PRIMARY (Always try first)
- mcp_Ref_ref_search_documentation    # Official documentation
- mcp_Ref_ref_read_url               # Read specific doc pages
- mcp_exa_get_code_context_exa       # Code examples and context
- mcp_exa_web_search_exa             # General web search

# TIER 2: DOMAIN-SPECIFIC (Add when relevant)
- mcp_supabase-mcp-server_*          # Database/Supabase commands
- mcp_21st-devmagic_*                # UI/Component commands
- mcp_sequential-thinking_*          # Complex multi-step logic
- mcp_expo_*                         # Mobile/Expo commands
- mcp_revenuecat_*                   # Monetization commands

# TIER 3: BACKUP (Only if Tier 1 fails)
- mcp_perplexity-ask_perplexity_ask  # Fallback search
```

### C2: Domain-Specific Tool Mapping

| Command Domain | Required MCPs |
|----------------|---------------|
| Security/Audit | Ref, Exa (for CVE/vulnerability context) |
| Database | Ref, Exa, Supabase MCP |
| UI/Design | Ref, Exa, 21st.dev MCP |
| Mobile | Ref, Exa, Expo MCP |
| Performance | Ref, Exa (for benchmarks) |
| Deployment | Ref, Exa, DigitalOcean/Render MCPs |

---

## 🚦 Phase D: HITL Checkpoint Patterns

### D1: Standard Checkpoint Format

```markdown
**HITL Checkpoint →** [What this checkpoint validates]

**Present to user:**
> "## [Checkpoint Title]
>
> [Summary of what was done]
>
> ### Key Findings:
> - [Finding 1]
> - [Finding 2]
>
> ### Proposed Next Steps:
> - [Step 1]
> - [Step 2]
>
> Reply `continue` to proceed or `revise: [feedback]` to iterate."
```

### D2: Checkpoint Placement Rules

1. **After Research Phase** — Validate expert selection
2. **After Data Collection** — Validate inputs before processing
3. **After Analysis** — Validate findings before recommendations
4. **After Document Creation** — Validate output before finalizing
5. **Final Review** — Blocking approval before completion

### D3: Checkpoint Types

| Type | When to Use | Example |
|------|-------------|---------|
| **Informational** | Progress update | "Completed Phase A. Proceeding to Phase B." |
| **Validation** | Need confirmation | "Found 5 security issues. Review before fixes?" |
| **Decision** | Multiple paths | "Option A or Option B? Reply with choice." |
| **Blocking** | Critical approval | "Final review required. Reply `approve`." |

---

## ✅ Phase E: Quality Gate Patterns

### E1: Standard Quality Gates

```markdown
## Quality Gates

Before completing, verify:

1. [ ] **Completeness**: All required sections present
2. [ ] **Accuracy**: Information is current and correct
3. [ ] **Actionability**: Recommendations are specific and implementable
4. [ ] **Consistency**: Follows command structure patterns
5. [ ] **Cross-References**: Links to related commands work
```

### E2: Domain-Specific Gates

| Domain | Additional Gates |
|--------|------------------|
| Security | OWASP compliance check, CVE verification |
| Performance | Benchmark thresholds met, metrics collected |
| Deployment | Environment checks pass, rollback tested |
| UX | Accessibility verified, mobile tested |
| Database | Migration tested, RLS policies verified |

---

## 🧠 Phase E2: Epistemic Gate Templates

**Based on the command tier, include the appropriate Epistemic Gate block.**

### Tier Detection

```typescript
function detectTier(folder: string, type: string): number {
  // Tier 1: Decision commands
  if (folder === 'steps' && ['1', '1.5', '2', '8', '10', '11'].some(s => name.includes(s))) return 1;
  if (folder === 'dev' && ['plan', 'implement-prd'].includes(name)) return 1;
  if (folder === 'generators' && ['new-project', 'scaffold'].includes(name)) return 1;
  
  // Tier 2: Analysis commands
  if (folder === 'audit') return 2;
  if (folder === 'ops' && ['status', 'pr-review', 'qa-'].some(s => name.includes(s))) return 2;
  
  // Tier 3: Execution commands
  if (folder === 'deploy') return 3;
  if (folder === 'ops') return 3;
  if (folder === 'generators' && ['changelog', 'api-docs', 'test-gen'].some(s => name.includes(s))) return 3;
  
  // Tier 4: Content commands
  if (folder === 'marketing') return 4;
  if (['contract', 'nda', 'proposal'].includes(name)) return 4;
  
  return 2; // Default to Tier 2
}
```

### Tier 1 Template (Full Gate)

**Add this section for Tier 1 commands:**

```markdown
---

## 🧠 Epistemic Confidence Gate

**This is a Tier 1 (Decision) command. Confidence ≥ 90% required.**

### Evidence Requirements

Before proceeding, verify all external claims:

| Claim Type | Verification Method |
|------------|---------------------|
| API behavior | `mcp_Ref_ref_search_documentation` |
| Library features | `mcp_Ref_ref_search_documentation` |
| Code patterns | `mcp_exa_get_code_context_exa` |
| Best practices | `mcp_exa_web_search_exa` |

### Gap Analysis

Run internal `@holes` analysis to compute Gap Score:
- 0 Critical gaps required
- High gaps should have mitigations
- Document all uncertainties

### Red-Team Analysis

Before completing, document 5 failure modes:

| # | Category | Question |
|---|----------|----------|
| 1 | Security | How could auth/access be bypassed? |
| 2 | Performance | Where could bottlenecks occur? |
| 3 | Data | What could corrupt data? |
| 4 | Availability | What could cause downtime? |
| 5 | UX | What could frustrate users? |

### Falsifiability

State at least one testable criterion:
> "This approach would be wrong if: [testable condition]"

### Confidence Calculation

\`\`\`
Confidence = (Evidence × 0.4) + (GapScore × 0.3) + (RedTeam × 0.2) + (Falsifiability × 0.1)
\`\`\`

**Hard Caps:**
- CRITICAL gap → 70% max
- Uncited API claim → 85% max

### Gate Output

Emit the Epistemic Gate artifact at command completion:

\`\`\`markdown
<!-- EPISTEMIC-GATE-START -->
## Epistemic Confidence Report

**Confidence:** [X]% [✅ PASSED | ⚠️ WARNING | ⛔ BLOCKED]
**Computed:** [TIMESTAMP]
**Command:** @[command-name]
**Tier:** 1

### Evidence Ledger
| # | Claim | Source | Citation |
|---|-------|--------|----------|
| 1 | [Claim] | [Ref/Exa] | [URL] |

### Gaps Found
- **(X Critical, X High, X Medium)**

### Red-Team Analysis
| # | Failure Mode | Mitigation |
|---|--------------|------------|
| 1 | [Mode] | [Mitigation] |

### Falsifiability Criteria
- Would be wrong if: [Criterion]

### Uncertainties
- **CRITICAL:** [List or None]
- **NON-CRITICAL:** [List]
<!-- EPISTEMIC-GATE-END -->
\`\`\`

### Hard-Stop Behavior

If confidence < 90%:
1. Display blocking issues
2. Offer options: resolve, force-proceed, explain
3. If force-proceed: Create RISK-ACCEPTANCE.md entry
```

### Tier 2 Template (Evidence + Gaps)

**Add this section for Tier 2 commands:**

```markdown
---

## 🧠 Epistemic Confidence Gate

**This is a Tier 2 (Analysis) command. Evidence + Gap Score required.**

### Evidence Requirements

Verify external claims using MCP tools.
Emit Evidence Ledger in output.

### Gap Analysis

Compute and emit Gap Score.
Document uncertainties.

### Gate Output (Simplified)

\`\`\`markdown
<!-- EPISTEMIC-GATE-START -->
## Epistemic Confidence Report

**Confidence:** [X]% [✅ | ⚠️]
**Command:** @[command-name]
**Tier:** 2

### Evidence Ledger
| # | Claim | Source | Citation |
|---|-------|--------|----------|

### Gaps Found
- **(X Critical, X High, X Medium)**

### Uncertainties
- **CRITICAL:** [List or None]
- **NON-CRITICAL:** [List]
<!-- EPISTEMIC-GATE-END -->
\`\`\`
```

### Tier 3 Template (Evidence Only)

**Add this section for Tier 3 commands:**

```markdown
---

## 🧠 Epistemic Confidence Gate

**This is a Tier 3 (Execution) command. Verify external tool claims only.**

### Evidence Requirements

If making claims about external tools/APIs, verify with Ref MCP.

### Gate Output (Minimal)

\`\`\`markdown
<!-- EPISTEMIC-GATE-START -->
## Epistemic Confidence Report

**Confidence:** [X]% ✅
**Command:** @[command-name]
**Tier:** 3

### Evidence Ledger
| # | Claim | Source | Citation |
|---|-------|--------|----------|
<!-- EPISTEMIC-GATE-END -->
\`\`\`
```

### Tier 4 (No Gate Required)

**For Tier 4 commands (marketing/content), no Epistemic Gate block is required.**

Just ensure MCP tools are available for research if needed.

---

## 📂 Phase F: File Output Standards

### F1: Folder Mapping by Command Type

| Command Folder | Output Folder | File Pattern |
|----------------|---------------|--------------|
| steps/ | /docs/[step-domain]/ | STEP-X-OUTPUT.md |
| audit/ | /docs/[audit-type]/ | [DATE]-[TYPE]-AUDIT.md |
| deploy/ | /docs/deployments/ | [DATE]-[ENV]-DEPLOY.md |
| generators/ | /docs/[output-type]/ | [NAME].[ext] |
| ops/ | /docs/ops/ | [TYPE]-REPORT.md |

### F2: File Naming Conventions

```
✅ GOOD:
- 2025-01-15-SECURITY-AUDIT.md
- FEATURE-BREAKDOWN.md
- F01-user-authentication.md

❌ BAD:
- audit.md (not descriptive)
- SecurityAudit.md (wrong case)
- feature_breakdown.md (underscores)
```

---

## 🔗 Phase G: Cross-Reference Standards

### G1: Related Commands Section

Every command must include:

```markdown
## 🔗 Related Commands

- **Run Before:** `@[command]` — [Why needed first]
- **Run After:** `@[command]` — [Why run next]
- **Alternative:** `@[command]` — [When to use instead]
- **Complementary:** `@[command]` — [Use together for best results]
```

### G2: Step Workflow References

For step commands, always reference:
- Previous step
- Next step
- Optional steps
- Related audit commands

---

## 📝 Phase H: Create the Command

### H1: Generate Command File

Using the research and templates above, create:

**File:** `/.cursor/commands/[folder]/[command-name]`

**Content:** Follow the complete template from Phase B

### H2: Verification Schema

Include `<verification>` block at end of command for automated quality checks.

---

## ✅ Final Checklist

Before completing command creation:

- [ ] Expert research completed (3-5 experts cited)
- [ ] Frontmatter has correct MCP tool hierarchy
- [ ] All required sections present
- [ ] HITL checkpoints placed appropriately
- [ ] Quality gates defined
- [ ] Verification schema included
- [ ] Cross-references to related commands
- [ ] Project-neutral language used
- [ ] Output paths match step-0 folder structure

---

## 🚪 Final Review Gate

**Prompt to user (blocking):**
> "New command created: `@[command-name]`
>
> **Location:** `/.cursor/commands/[folder]/[command-name]`
> **Lines:** [X] lines
> **Experts Cited:** [List]
> **HITL Checkpoints:** [Count]
> **Quality Gates:** [Count]
>
> Reply `approve` to finalize or `revise: [feedback]` to iterate."

---

## 📚 Reference: Expert Database by Domain

### Security
- **OWASP** — Web Application Security Project
- **Gary McGraw** — Software security
- **Troy Hunt** — Web security, HaveIBeenPwned
- **Dan Kaminsky** — DNS security

### Performance
- **Ilya Grigorik** — High Performance Browser Networking
- **Addy Osmani** — Web performance patterns
- **Steve Souders** — Web performance pioneer

### DevOps
- **Gene Kim** — The Phoenix Project, DevOps Handbook
- **Nicole Forsgren** — DORA metrics, Accelerate
- **Kelsey Hightower** — Kubernetes, modern deployment

### Architecture
- **Martin Fowler** — Patterns of Enterprise Architecture
- **Robert C. Martin** — Clean Code, Clean Architecture
- **Eric Evans** — Domain-Driven Design
- **John Ousterhout** — Philosophy of Software Design

### UX/Design
- **Don Norman** — Design of Everyday Things
- **Jakob Nielsen** — Usability heuristics
- **Steve Krug** — Don't Make Me Think
- **Alan Cooper** — Interaction design

### Testing
- **Kent Beck** — TDD, xUnit patterns
- **Michael Feathers** — Working with Legacy Code
- **Gerard Meszaros** — xUnit Test Patterns

### Information Architecture
- **Louis Rosenfeld & Peter Morville** — Information Architecture
- **Abby Covert** — How to Make Sense of Any Mess
- **Dan Brown** — 8 Principles of IA

### Product
- **Marty Cagan** — Inspired, Empowered
- **Teresa Torres** — Continuous Discovery Habits
- **Ryan Singer** — Shape Up

---

*Context: Command creation guide for building consistent, research-backed Sigma commands with proper MCP tool configuration, HITL checkpoints, and quality gates.*
