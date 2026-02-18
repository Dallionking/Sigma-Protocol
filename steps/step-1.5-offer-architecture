---
version: "1.0.0"
last_updated: "2025-12-05"
changelog:
  - "1.0.0: Initial release - Offer architecture as official step with doc sync"
description: "Step 1.5: Offer Architecture → Design Grand Slam Offers and sync pricing/monetization across all project docs"
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

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
parameters:
  - --market=[target-market]
  - --product=[product-name]
  - --research-depth=[shallow|deep]
  - --skip-sync  # Skip document synchronization (not recommended)
---

# /step-1.5-offer-architecture — Grand Slam Offer Design with Document Sync

**Mission**
Design irresistible offers using Alex Hormozi's $100M framework, then **automatically synchronize** pricing and monetization decisions across all project documentation.

**Why This Step Exists:**
For monetized apps (especially AI apps with credit systems, usage tiers, subscriptions), the offer architecture directly impacts:
- **Database schema** — credit ledgers, usage tracking, subscription tiers
- **API design** — rate limiting, quota enforcement, metering endpoints
- **UI/UX** — upgrade prompts, usage dashboards, paywall flows
- **Business logic** — billing cycles, overage handling, grace periods

**This step ensures pricing decisions are made BEFORE architecture, and all docs stay consistent.**

<goal>
You are the Offer Strategist & Pricing Architect. Execute ALL phases (A through D) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| A | Context & Cost Analysis | COGS calculation |
| B | Offer Design | Pricing tiers + bonuses + guarantee |
| C | Document Synchronization | All docs updated |
| D | Verification | Final consistency check |

Final Outputs: OFFER_ARCHITECTURE.md, updated MASTER_PRD.md, synced stack-profile.json
Quality gate: Pricing validated, offer approved, all docs consistent, score 80+/100
</goal>

---

## 🔍 When to Use This Step

### Automatically Suggested After Step 1 When:
- ✅ Project type is SaaS, AI tool, or subscription service
- ✅ MASTER_PRD mentions: pricing, tiers, credits, subscriptions, monetization
- ✅ stack-profile.json includes a `payments` field
- ✅ User indicated revenue generation in ideation

### Skip This Step If:
- ❌ Internal tool or hobby project
- ❌ Open-source with no monetization
- ❌ Enterprise contract (custom pricing handled separately)

---

## ⚡ Preflight (auto)

```typescript
// 1. Get date
const today = new Date().toISOString().split('T')[0];

// 2. Read existing project context
const masterPrd = await readFile('docs/specs/MASTER_PRD.md');
const stackProfile = await readFile('docs/stack-profile.json');

// 3. Check for existing offer architecture
const existingOffer = await fileExists('docs/specs/OFFER_ARCHITECTURE.md');

// 4. Extract current pricing info from MASTER_PRD (if any)
const currentPricing = extractSection(masterPrd, 'Business Model & Monetization');

// 5. Identify cost centers from dependencies
const packageJson = await readFile('package.json');
const deps = JSON.parse(packageJson).dependencies || {};
const costCenters = {
  ai: deps['openai'] || deps['@anthropic-ai/sdk'] || deps['@google/generative-ai'],
  database: deps['@supabase/supabase-js'] || deps['drizzle-orm'],
  payments: deps['stripe'] || deps['@polar-sh/sdk'] || deps['@revenuecat/purchases'],
};

// 6. Display context summary
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 STEP 1.5: OFFER ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}
Existing Offer: ${existingOffer ? 'Yes (will update)' : 'No (will create)'}
Cost Centers: ${Object.keys(costCenters).filter(k => costCenters[k]).join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
```

---

## 📋 Task Execution Flow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 STEP 1.5: OFFER ARCHITECTURE WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase A: Context Loading
  [ ] A1: Read MASTER_PRD for product context
  [ ] A2: Read stack-profile.json for tech context
  [ ] A3: Calculate COGS (Cost of Goods Sold)
  ⏸️  CHECKPOINT: Review cost analysis

Phase B: Offer Design (invoke @04-offer-architect core)
  [ ] B1: Define target avatar & dream outcome
  [ ] B2: Map problems → solutions → delivery
  [ ] B3: Design pricing tiers (Decoy Strategy)
  [ ] B4: Create bonus stack
  [ ] B5: Engineer guarantee
  [ ] B6: Add scarcity/urgency triggers
  [ ] B7: Name the offer
  ⏸️  CHECKPOINT: Human approves offer design

Phase C: Document Synchronization (CRITICAL)
  [ ] C1: Create/Update OFFER_ARCHITECTURE.md
  [ ] C2: Update MASTER_PRD.md (Business Model section)
  [ ] C3: Update stack-profile.json (pricing config)
  [ ] C4: Create pricing-config.json (if credits/usage)
  ⏸️  CHECKPOINT: Review all document changes

Phase D: Verification
  [ ] D1: Verify all docs reference same pricing
  [ ] D2: Confirm stack-profile has billing provider
  [ ] D3: Generate offer summary for handoff
  ⏸️  FINAL: Human confirms, ready for Step 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Phase A: Context & Cost Analysis

### A1-A2: Load Project Context

Read and summarize:
- **MASTER_PRD.md** — Product vision, features, target users
- **stack-profile.json** — Tech stack, especially payment provider
- **package.json** — Dependencies for cost estimation

### A3: Calculate COGS (Cost of Goods Sold)

**For AI Apps - Critical Cost Factors:**

```markdown
## 💰 COGS Analysis

### Variable Costs Per User (Monthly)

| Cost Center | Calculation | Monthly Cost |
|-------------|-------------|--------------|
| **AI Tokens** | [model] × [avg requests] × [tokens/request] | $X.XX |
| **Database** | [storage GB] × [rate] + [compute] | $X.XX |
| **File Storage** | [avg GB/user] × [rate] | $X.XX |
| **Email/Notifications** | [emails/month] × [rate] | $X.XX |
| **Third-party APIs** | [calls/month] × [rate] | $X.XX |
| **Support Allocation** | [avg tickets] × [cost/ticket] | $X.XX |
| **TOTAL COGS/USER** | | **$X.XX** |

### Pricing Floor Calculation

- COGS/user: $X.XX/month
- Minimum 3x margin: $X.XX/month
- Target 5x margin (SaaS standard): $X.XX/month
- Premium 10x margin (if value supports): $X.XX/month

### Credit/Usage Considerations (if applicable)

| Usage Tier | Credits/Month | AI Calls | Storage | Price Floor |
|------------|---------------|----------|---------|-------------|
| Starter | X | Y | Z GB | $XX |
| Pro | X | Y | Z GB | $XX |
| Enterprise | Unlimited | Y | Z GB | $XX |
```

---
**>>> CHECKPOINT: PHASE A APPROVAL (Cost Analysis) <<<**

Present cost analysis to the user.
**Do NOT continue to Phase B (Offer Design) until the user explicitly approves.**

Reply `approve costs` or `revise: [feedback]`.
---

## 🔄 Phase B: Offer Design

**Invoke the core offer design process from @04-offer-architect:**

### B1: Target Avatar & Dream Outcome

Pull from MASTER_PRD's Target Audience section, then refine:

```markdown
## 🎯 Target Avatar (Refined for Offer)

**Primary Avatar:**
- **Who:** [Specific role, company size, industry]
- **Current State:** [Their painful reality]
- **Dream State:** [What perfect success looks like]
- **Trigger Event:** [What makes them search for a solution NOW]

**Avatar Score (Hormozi's 4 Indicators):**
| Indicator | Score (1-10) | Evidence |
|-----------|--------------|----------|
| Massive Pain | X | [Why it hurts] |
| Purchasing Power | X | [Budget evidence] |
| Easy to Target | X | [Where to find them] |
| Growing Market | X | [Growth data] |
| **TOTAL** | **/40** | |

**Dream Outcome Statement:**
> "We help [AVATAR] achieve [DREAM OUTCOME] in [TIME FRAME] without [PAIN] or [RISK]."
```

### B2: Problem → Solution → Delivery Matrix

```markdown
## 🔧 Problem → Solution Matrix

### Problem 1: [Core obstacle preventing dream outcome]
- **Pain Statement:** "I can't [X] because [Y]"
- **Solution:** "How to [achieve X] even if [Y]"
- **Delivery:** [Feature/module that solves this]
- **Value Driver:** [↑Dream | ↑Likelihood | ↓Time | ↓Effort]

### Problem 2: [Secondary obstacle]
... (repeat for all major problems)

### Problem 3: [Tertiary obstacle]
...
```

### B3: Pricing Tiers (Decoy Strategy)

```markdown
## 💰 Pricing Architecture

### Tier Structure

| Tier | Name | Monthly | Annual | Target Segment | Conversion Goal |
|------|------|---------|--------|----------------|-----------------|
| 1 | **Starter** | $XX | $XX/yr | Testers, hobbyists | Anchor (make Pro look good) |
| 2 | **Pro** ⭐ | $XX | $XX/yr | Core customers | Primary revenue driver |
| 3 | **Team/Agency** | $XX | $XX/yr | Power users | High-value accounts |

### Feature Matrix

| Feature | Starter | Pro ⭐ | Team |
|---------|---------|--------|------|
| [Core Feature 1] | ✅ Limited | ✅ Full | ✅ Full |
| [Core Feature 2] | ❌ | ✅ | ✅ |
| [Premium Feature] | ❌ | ✅ | ✅ |
| [Team Feature] | ❌ | ❌ | ✅ |
| **Credits/Usage** | X/mo | Y/mo | Z/mo |
| **Support** | Community | Email | Priority |

### Credit/Usage System (if applicable)

| Resource | Starter | Pro | Team | Overage Rate |
|----------|---------|-----|------|--------------|
| AI Credits | X | Y | Z | $0.XX/credit |
| Storage | X GB | Y GB | Z GB | $0.XX/GB |
| API Calls | X | Y | Unlimited | $0.XX/1K |
| Team Members | 1 | 3 | Unlimited | $X/seat |
```

### B4: Bonus Stack

```markdown
## 🎁 Bonus Stack

| Bonus | Description | Perceived Value | Actual Cost | Tier |
|-------|-------------|-----------------|-------------|------|
| **Bonus 1** | [Templates/Presets] | $XXX | $0 | Pro+ |
| **Bonus 2** | [Training/Course] | $XXX | $0 | Pro+ |
| **Bonus 3** | [Community Access] | $XXX | $0 | All |
| **Bonus 4** | [Priority Feature Requests] | $XXX | $0 | Team |

**Total Bonus Value:** $X,XXX
**Rule Check:** Bonus value > Pro tier price? [YES/NO]
```

### B5: Guarantee Engineering

```markdown
## 🛡️ Risk Reversal (Guarantee)

### Selected Guarantee Type: [Unconditional / Conditional / Anti-Guarantee]

**Guarantee Statement:**
> "[Full guarantee text that removes purchase risk]"

**Terms:**
- Time window: [X days]
- Conditions (if any): [What they must do]
- Process: [How to claim]

**Risk Assessment:**
- Estimated claim rate: X%
- Maximum exposure: $X per claim
- Mitigation: [How to reduce abuse]
```

### B6: Scarcity & Urgency

```markdown
## ⏰ Scarcity & Urgency Triggers

### Active Triggers:

| Trigger | Type | Authentic? | Implementation |
|---------|------|------------|----------------|
| [Trigger 1] | Scarcity | ✅ | [How it works] |
| [Trigger 2] | Urgency | ✅ | [How it works] |

### Trigger Statements:
- Launch: "[Founding member pricing for first 100 customers]"
- Ongoing: "[Annual pricing locked in, monthly may increase]"
```

### B7: Offer Naming

```markdown
## 📛 Offer Name

**Final Offer Name:** [The X System / X Pro / etc.]

**Naming Criteria Check:**
- [ ] Easy to remember
- [ ] Implies the outcome
- [ ] Differentiated from competitors
- [ ] Sounds premium
- [ ] Works as a product name
```

---
**>>> CHECKPOINT: PHASE B APPROVAL (Offer Design) <<<**

Present complete offer design to the user.
**Do NOT continue to Phase C (Document Synchronization) until the user explicitly approves.**

Reply `approve offer` or `revise: [feedback]`.
---

## 🔄 Phase C: Document Synchronization (CRITICAL)

**This is what makes Step 1.5 essential — keeping all docs in sync.**

### C1: Create/Update OFFER_ARCHITECTURE.md

**Location:** `/docs/specs/OFFER_ARCHITECTURE.md`

```markdown
# [Project Name] - Offer Architecture
**Version:** 1.0 | **Date:** {TODAY} | **Status:** Approved

## Offer Summary
[Grand Slam Offer Statement]

## Target Avatar
[From B1]

## Value Proposition
[Dream Outcome + Key Differentiators]

## Pricing Tiers
[Complete tier table from B3]

## Feature Matrix
[Feature comparison table from B3]

## Credit/Usage System
[If applicable - complete credit structure]

## Bonus Stack
[From B4]

## Guarantee
[From B5]

## Scarcity/Urgency
[From B6]

## Unit Economics
- COGS per user: $X/month
- Target margin: Xx
- LTV:CAC target: X:1
- Break-even: X months

## Implementation Notes
[Technical considerations for dev team]

---
*This document is the source of truth for all pricing/offer references.*
*Last synced: {TODAY}*
```

### C2: Update MASTER_PRD.md

**Replace the "Business Model & Monetization" section with:**

```markdown
## Business Model & Monetization

> 📎 **Source of Truth:** See [OFFER_ARCHITECTURE.md](./OFFER_ARCHITECTURE.md) for complete offer details.

### Revenue Model
- **Primary:** [Subscription/Usage/Transaction]
- **Billing Provider:** [Stripe/Polar/RevenueCat]

### Pricing Tiers (Summary)
| Tier | Price | Target Segment |
|------|-------|----------------|
| Starter | $XX/mo | [Who] |
| Pro ⭐ | $XX/mo | [Who] |
| Team | $XX/mo | [Who] |

### Unit Economics (Target)
- COGS/user: $XX/mo
- LTV: $XXX
- CAC Target: $XX
- LTV:CAC: X:1
- Payback: X months

### Credit System (if applicable)
| Tier | Credits/mo | Overage |
|------|------------|---------|
| Starter | X | $0.XX |
| Pro | Y | $0.XX |
| Team | Z | $0.XX |

### Go-to-Market Strategy
[From original PRD, updated if needed]
```

### C3: Update stack-profile.json

**Add/update pricing configuration:**

```json
{
  "platform": "web",
  "frontend": "nextjs",
  "database": "supabase",
  "auth": "supabase-auth",
  "payments": {
    "provider": "stripe",
    "model": "subscription",
    "tiers": ["starter", "pro", "team"],
    "has_usage_billing": true,
    "has_credits": true
  },
  "pricing": {
    "starter": { "monthly": 29, "annual": 290 },
    "pro": { "monthly": 79, "annual": 790 },
    "team": { "monthly": 199, "annual": 1990 }
  },
  "credits": {
    "enabled": true,
    "unit": "AI credits",
    "starter_monthly": 100,
    "pro_monthly": 500,
    "team_monthly": 2000,
    "overage_rate": 0.05
  },
  "hosting": "vercel"
}
```

### C4: Create pricing-config.json (for credit/usage systems)

**Location:** `/docs/specs/pricing-config.json`

```json
{
  "$schema": "pricing-config-v1",
  "created": "{TODAY}",
  "offer_name": "[Offer Name]",
  
  "tiers": {
    "starter": {
      "name": "Starter",
      "monthly_price": 29,
      "annual_price": 290,
      "credits_monthly": 100,
      "features": {
        "core_feature_1": true,
        "core_feature_2": "limited",
        "premium_feature": false
      },
      "limits": {
        "storage_gb": 5,
        "team_members": 1,
        "api_calls_monthly": 1000
      }
    },
    "pro": {
      "name": "Pro",
      "monthly_price": 79,
      "annual_price": 790,
      "credits_monthly": 500,
      "features": {
        "core_feature_1": true,
        "core_feature_2": true,
        "premium_feature": true
      },
      "limits": {
        "storage_gb": 50,
        "team_members": 3,
        "api_calls_monthly": 10000
      }
    },
    "team": {
      "name": "Team",
      "monthly_price": 199,
      "annual_price": 1990,
      "credits_monthly": 2000,
      "features": {
        "core_feature_1": true,
        "core_feature_2": true,
        "premium_feature": true,
        "team_feature": true
      },
      "limits": {
        "storage_gb": 500,
        "team_members": -1,
        "api_calls_monthly": -1
      }
    }
  },
  
  "overages": {
    "credits": { "rate": 0.05, "unit": "per credit" },
    "storage": { "rate": 0.10, "unit": "per GB" },
    "api_calls": { "rate": 0.001, "unit": "per call" }
  },
  
  "guarantee": {
    "type": "conditional",
    "days": 30,
    "statement": "[Guarantee text]"
  }
}
```

---
**>>> CHECKPOINT: PHASE C APPROVAL (Document Sync) <<<**

Show all document changes to the user.
**Do NOT continue to Phase D (Verification) until the user explicitly approves.**

Reply `approve sync` or `revise: [feedback]`.
---

## 🔄 Phase D: Verification

### D1: Cross-Reference Check

```markdown
## ✅ Document Sync Verification

| Document | Pricing Match | Credits Match | Updated |
|----------|---------------|---------------|---------|
| OFFER_ARCHITECTURE.md | ✅ | ✅ | ✅ |
| MASTER_PRD.md | ✅ | ✅ | ✅ |
| stack-profile.json | ✅ | ✅ | ✅ |
| pricing-config.json | ✅ | ✅ | ✅ |

**Consistency Check:** All pricing references match? [YES/NO]
```

### D2: Stack Readiness

```markdown
## 🔧 Stack Readiness for Pricing

- [ ] Payment provider selected: [Stripe/Polar/RevenueCat]
- [ ] Subscription model compatible: [Yes/No]
- [ ] Credit system supported: [Yes/No/N/A]
- [ ] Usage metering available: [Yes/No/N/A]
```

### D3: Handoff Summary

```markdown
## 📋 Step 1.5 Complete - Handoff Summary

**Offer:** [Offer Name]
**Tiers:** Starter ($X) | Pro ($Y) | Team ($Z)
**Model:** [Subscription / Usage / Hybrid]
**Credits:** [Yes/No] - [X/Y/Z per tier]

**Documents Updated:**
- ✅ /docs/specs/OFFER_ARCHITECTURE.md (created)
- ✅ /docs/specs/MASTER_PRD.md (Business Model section)
- ✅ /docs/stack-profile.json (pricing config)
- ✅ /docs/specs/pricing-config.json (if credits)

**Ready for Step 2:** Architecture will incorporate:
- Credit/usage tracking tables
- Rate limiting based on tiers
- Billing webhook handlers
- Usage dashboard components
```

---

## ✅ Quality Gates

**Step 1.5 complete when:**

- [ ] COGS calculated with ≥3x margin in pricing
- [ ] All pricing tiers defined with features
- [ ] Credit/usage system designed (if applicable)
- [ ] Guarantee removes purchase risk
- [ ] OFFER_ARCHITECTURE.md created
- [ ] MASTER_PRD.md synced
- [ ] stack-profile.json updated
- [ ] Human approved all changes

---

## 🚫 Final Review Gate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 STEP 1.5 COMPLETE - OFFER ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Offer: [Name]
Pricing: Starter $X | Pro $Y ⭐ | Team $Z

Documents Synced:
✅ OFFER_ARCHITECTURE.md (source of truth)
✅ MASTER_PRD.md (Business Model updated)
✅ stack-profile.json (pricing config added)
✅ pricing-config.json (credit system)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply `approve` to proceed to Step 2: Architecture
Reply `revise: [feedback]` to modify offer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔗 Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-1-ideation` | Prerequisite - provides MASTER_PRD |
| `@04-offer-architect` | Core logic - this step wraps it |
| `@step-2-architecture` | Next step - uses pricing for schema design |
| `@step-9-landing-page` | Uses offer for conversion copy |

---

## 📝 Notes for Step 2 (Architecture)

When proceeding to Step 2, explicitly incorporate:

1. **Database Tables:**
   - `subscriptions` - tier, status, billing cycle
   - `credits` - balance, usage history (if credits enabled)
   - `usage_events` - metered usage tracking

2. **API Considerations:**
   - Rate limiting per tier
   - Credit deduction middleware
   - Usage metering endpoints

3. **UI Components:**
   - Pricing page (from OFFER_ARCHITECTURE)
   - Usage dashboard
   - Upgrade/downgrade flows
   - Credit purchase (if applicable)

---

## Final Review Gate

**All outputs for this step:**
- [ ] /docs/specs/OFFER_ARCHITECTURE.md created
- [ ] /docs/specs/MASTER_PRD.md updated (Business Model section)
- [ ] /docs/stack-profile.json updated (payments + pricing)
- [ ] /docs/specs/pricing-config.json created
- [ ] All phases (A–D) completed with user approval
- [ ] All documents synchronized

---
**>>> FINAL CHECKPOINT: STEP 1.5 COMPLETE <<<**
**Do NOT proceed to Step 2 without explicit approval.**
---

<verification>
## Step 1.5 Verification Schema

### Required Files (25 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Offer Architecture | /docs/specs/OFFER_ARCHITECTURE.md | 3KB | 8 |
| Updated Master PRD | /docs/specs/MASTER_PRD.md | 5KB | 5 |
| Updated Stack Profile | /docs/stack-profile.json | 300B | 5 |
| Pricing Config | /docs/specs/pricing-config.json | 500B | 7 |

### Required Sections (35 points)

| Document | Section | Points |
|----------|---------|--------|
| OFFER_ARCHITECTURE.md | ## Target Avatar | 5 |
| OFFER_ARCHITECTURE.md | ## Pricing Tiers | 8 |
| OFFER_ARCHITECTURE.md | ## Feature Matrix | 5 |
| OFFER_ARCHITECTURE.md | ## Bonus Stack | 4 |
| OFFER_ARCHITECTURE.md | ## Guarantee | 5 |
| OFFER_ARCHITECTURE.md | ## Unit Economics | 5 |
| MASTER_PRD.md | ## Business Model & Monetization (updated) | 3 |

### Content Quality (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_table:OFFER_ARCHITECTURE.md:pricing | Pricing tiers table present | 7 |
| has_table:OFFER_ARCHITECTURE.md:feature | Feature matrix table present | 6 |
| json_valid:stack-profile.json | Stack profile valid with pricing | 5 |
| json_valid:pricing-config.json | Pricing config valid JSON | 5 |
| consistency:pricing | All docs have matching prices | 2 |

### Sync Verification (15 points)

| Check | Description | Points |
|-------|-------------|--------|
| sync:MASTER_PRD | Business Model section references OFFER_ARCHITECTURE | 5 |
| sync:stack-profile | Has payments and pricing fields | 5 |
| sync:pricing-config | Tiers match OFFER_ARCHITECTURE | 5 |

</verification>
