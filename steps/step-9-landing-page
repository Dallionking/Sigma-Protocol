---
version: "2.3.0"
last_updated: "2026-01-07"
changelog:
  - "2.3.0: Added Superdesign AI Design Agent for rapid landing page mockup generation. References superdesign-integration.md foundation skill"
  - "2.2.0: Added Monorepo Deployment Note in Phase E for Turborepo/Nx projects, references monorepo-architecture.md"
  - "2.1.0: Added icon library recommendations (Lucide React) for landing page consistency, added quality gates"
description: "Step 9: Landing Page & Conversion Optimization - High-converting copy creation with avatars, emotional diaries, CRO tactics, Cialdini principles, and Magic UI templates (4-part process)"
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
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --avatars-only
  - --diary-only
  - --page-only
  - --template-only
---

# /step-9-landing-page — Landing Page Creation & Conversion Optimization (Senior Conversion Copywriter + $1B Valuation Context)

**Mission**  
Run a complete, interactive **Step-9: Landing Page → High-Converting Copy & Scaffolding** for a startup project. 
**Valuation Context:** You are a **Senior Conversion Copywriter** AND a **Frontend Architect**. You don't just write persuasive copy; you **implement it immediately** using proven, high-performance templates.

**Core Philosophy:**
> "People don't remember what you say. They remember how you made them feel."

This command:
- **OPTIONAL** step for marketing/sales landing pages (can skip if product-focused).
- Runs as a **5-phase sequential process**: Blocking Gate → Avatars → Diary → Landing Page Copy → **Template Selection & Scaffolding**.
- Invokes **FAANG-level specialist personas** (Senior Conversion Copywriter/UX/Customer Research/Brand/Frontend Architect).
- Uses **Magic UI Templates** to accelerate development.
- Integrates **Cialdini's 7 Principles of Persuasion** + **Emotional Design Frameworks** from Steps 3, 5, 7.
- Works even if MCP search tools aren't configured (falls back to Cursor's web browsing).
- Produces a **high-converting landing page** with emotional copy, CRO tactics, and a **production-ready codebase**.
- **Hard-stops for your approval** after each part and before Step-10 (Feature Breakdown).

**Note on Wireframe Integration:**
While this step uses Magic UI templates for landing page scaffolding, you can also use Step 5 (Wireframe Prototypes) for landing page design if you prefer building wireframes first. If Step 5 was completed, reference `/wireframes/` for the landing page prototype and `/docs/wireframes/screenshots/` for visual references.

<goal>
You are the Senior Conversion Copywriter & Frontend Architect. Execute ALL phases (A through E) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| A | Blocking Gate & Prerequisite Loading | Offer architecture validated, wireframe refs loaded |
| B | Customer Avatar Research | Problem Aware Avatar (1000+ words), research sources |
| C | Emotional Diary Creation | 3-5 diary entries, Five Drivers extraction |
| D | Landing Page Copy & CRO | 15-section landing page framework, Cialdini audit |
| E | Template Selection & Scaffolding | Magic UI template mapped, scaffolding plan, final docs |

Final Outputs: `/docs/landing-page/LANDING-PAGE.md`, `/docs/avatars/PROBLEM-AWARE-AVATAR.md`, `/docs/avatars/DIARY-ENTRIES.md`, `/docs/landing-page/HERO-SECTION.md`, `/docs/landing-page/VALUE-PROPOSITION.md`, `/docs/landing-page/SOCIAL-PROOF.md`, `/docs/landing-page/OBJECTION-HANDLING.md`, `/docs/landing-page/CTA-VARIANTS.md`, `/docs/landing-page/TEMPLATE-MAPPING.md`, `/docs/landing-page/CIALDINI-AUDIT.md`, `/docs/research/LANDING-SOURCES-${TODAY}.md`
Quality gate: All 7 Cialdini principles addressed, F-K grade 5-8, NESB score 28/40+
</goal>

---

## SUPERDESIGN RAPID LANDING PAGE DESIGN (OPTIONAL — RECOMMENDED)

**[Superdesign](https://superdesign.dev)** accelerates landing page design by generating multiple mockup variations from natural language. Use it **before template selection** to explore design options.

### Superdesign Prompts for Landing Pages

| Section | Superdesign Prompt |
|---------|-------------------|
| **Hero** | "Design 5 hero section variations with headline, subheadline, CTA button, and product screenshot placeholder. Style: Premium SaaS, dark theme" |
| **Features** | "Create a features section with 3 feature cards, icons, and descriptions. Style: Bento grid layout" |
| **Pricing** | "Design a pricing section with 3 tiers, toggle for monthly/annual, and highlighted recommended plan" |
| **Testimonials** | "Generate a testimonials section with 3 customer quotes, avatars, and company logos" |
| **CTA** | "Design a final CTA section with urgency copy and email capture form" |

### Workflow Integration

```
1. Complete Part 3 (Landing Page Copy) first
2. Open Superdesign sidebar
3. Prompt: "Design landing page hero for [PRODUCT]: [HEADLINE]. Style: [REFERENCE]"
4. Generate 3-5 variations
5. Fork best option, iterate
6. Use output to inform Magic UI template selection
7. Extract design tokens with superdesign_extract_system
```

### Style Transfer Examples

```
"Design a landing page hero in the style of Linear.app:
- Dark theme with subtle gradients
- Large bold headline
- Product screenshot with glow effect
- Minimal, premium feel"

"Design a landing page hero in the style of Stripe:
- Clean white background
- Colorful gradient accents
- Product demo animation placeholder
- Trust badges"
```

> **📚 Reference:** See `/src/foundation-skills/superdesign-integration.md` for detailed prompt patterns.

---

## EMOTIONAL DESIGN FRAMEWORKS (MANDATORY — From Steps 3, 5, 7)

### The Landing Page Philosophy: "Every Pixel Must Evoke Emotion"
**Our landing pages must NOT be generic AI slop.** They must invoke emotion, create desire, and feel crafted with care. This isn't just copywriting—it's **revenue engineering through psychology**.

### Framework 1: Don Norman's Three Levels Applied to Landing Pages

| Level | Landing Page Application | Quality Check | Timing |
|-------|--------------------------|---------------|--------|
| **Visceral** (0-2 sec) | Hero section: Does it look premium? Beautiful typography? Right colors? | "First glance = 'Wow, this looks legit'" | Above-the-fold |
| **Behavioral** (2-30 sec) | Is the CTA obvious? Is copy scannable? Does scrolling feel smooth? | "I know exactly what to do and it feels easy" | Entire page |
| **Reflective** (30+ sec) | Does this make them feel smart choosing you? Part of something? | "I'd be proud to use/recommend this" | After engagement |

**Quality Gate:**
- [ ] **Visceral**: First impression screams "premium" and "trustworthy"
- [ ] **Behavioral**: Every interaction is intuitive and responsive
- [ ] **Reflective**: Users feel smart/successful, not confused/frustrated

### Framework 2: Aarron Walter's Hierarchy of User Needs

```
        ▲ PLEASURABLE ← THIS IS THE GOAL!
       ╱ ╲    "Does it delight?"
      ╱   ╲ USABLE
     ╱     ╲    "Can they figure it out?"
    ╱ RELIABLE ╲
   ╱     "Does it work every time?"  ╲
  ╱───────── FUNCTIONAL ─────────────╲
 ╱    "Does it do what it should?"    ╲
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
```

**Key Insight:** *"We've been designing usable interfaces, which is like a chef cooking edible food. We also crave flavor."*

### Framework 3: Emotional Journey Mapping (Per-Scroll Section)

Map the **emotional arc** as users scroll through your landing page:

```
EMOTION
   ↑
   │    😊 "Wow, this is for me!"
   │   ╱  ╲
   │  ╱    ╲     😊 "I can do this"
   │ ╱      ╲   ╱
 ──┼─────────╲─╱──────────→ Scroll
   │          ╲
   │           😟 Problem agitation
   │                (controlled frustration)
```

| Section | Scroll Depth | Target Emotion | Design Goal |
|---------|--------------|----------------|-------------|
| **Hero** | 0-10% | Intrigue + Recognition | "This is for ME" (Visceral wow + relevance) |
| **Problem** | 10-25% | Controlled Frustration | "Yes, that's exactly my problem" |
| **Solution** | 25-40% | Relief + Hope | "There IS a better way" |
| **Features** | 40-55% | Confidence + Empowerment | "I can do this" |
| **Social Proof** | 55-70% | Trust + Belonging | "Others like me succeeded" |
| **Objections** | 70-80% | Calm + Certainty | "My concerns are addressed" |
| **CTA/Pricing** | 80-90% | Urgency + Excitement | "I want this NOW" |
| **Final CTA** | 90-100% | Confidence + Action | "Let's do this!" |

### Framework 4: Anti-Slop Directives

**Include in all design briefs and copy:**

```
ANTI-SLOP DIRECTIVES:
- "NOT a generic template — this must feel uniquely crafted"
- "Avoid: stock hero layouts, predictable left-text/right-image"
- "This landing page should be MEMORABLE, not just functional"
- "Add subtle details that show care: refined spacing, considered typography"
- "The user should feel [SPECIFIC EMOTION] when they see this page"
```

---

## CIALDINI'S 7 PRINCIPLES OF PERSUASION (MANDATORY Checklist)

Before finalizing ANY landing page, verify ALL 7 principles are addressed:

### 1. Reciprocity — "Give Before You Ask"
**Principle:** People feel obligated to give back when they receive something first.

**Landing Page Application:**
- [ ] Free value delivered BEFORE asking for commitment (lead magnet, free tool, instant sample)
- [ ] "Fast Win" moment creates psychological debt
- [ ] Free trial, free tier, or instant download

**Examples:**
- "Download our free PRD template" BEFORE "Start your trial"
- "See your personalized results" BEFORE "Create account"
- "Try the AI for free — no credit card required"

### 2. Commitment & Consistency — "Small Yes → Big Yes"
**Principle:** People want to act consistently with their prior commitments.

**Landing Page Application:**
- [ ] Micro-commitment before email capture (quiz, checkbox, button click)
- [ ] 2-step opt-in pattern (click first, then form)
- [ ] Progressive commitment funnel (low → medium → high friction)
- [ ] "Yes ladder" copywriting (series of agreeable statements)

**Examples:**
- Quiz: "Are you spending too much time on PRDs?" → [YES]
- Checkbox: "I want to ship faster" → ✓
- Button: "Yes, I want better conversions" → [CLICK]

### 3. Social Proof — "Wisdom of Crowds"
**Principle:** People follow the actions of others, especially similar others.

**Landing Page Application:**
- [ ] User count with specificity ("10,432 founders use this")
- [ ] Real testimonials with names, photos, roles
- [ ] "As seen on" logos (media, partners, clients)
- [ ] Real-time activity ("Sarah from Austin just signed up")
- [ ] Star ratings and review counts
- [ ] Case studies with specific results

**Examples:**
- "Join 10,432 founders shipping faster"
- "⭐⭐⭐⭐⭐ 4.9/5 from 1,200+ reviews"
- Real-time: "John D. just started a free trial — 3 minutes ago"

### 4. Authority — "Trust the Expert"
**Principle:** People respect authority and expertise.

**Landing Page Application:**
- [ ] Expert endorsements or certifications
- [ ] Founder credentials (if relevant and impressive)
- [ ] Industry awards and recognition
- [ ] Media mentions ("As featured in TechCrunch, Forbes")
- [ ] Security badges (SOC 2, GDPR, SSL)
- [ ] Partnership logos (integrations with trusted brands)

**Examples:**
- "Recommended by YC partners"
- "SOC 2 Type II Certified"
- "As seen in TechCrunch, Forbes, Product Hunt"

### 5. Liking — "People Buy from People They Like"
**Principle:** We prefer to say yes to people we like.

**Landing Page Application:**
- [ ] Founder story or "About Us" section showing personality
- [ ] Friendly, conversational tone (not corporate speak)
- [ ] Relatable visuals (real people, not stock photos)
- [ ] Shared values and mission alignment
- [ ] Humor where appropriate
- [ ] Behind-the-scenes content

**Examples:**
- "Built by a frustrated founder who spent 40 hours on a single PRD"
- Founder photo with approachable caption
- "We hate busywork as much as you do"

### 6. Scarcity — "Fear of Missing Out"
**Principle:** We want more of what is limited or becoming unavailable.

**Landing Page Application:**
- [ ] Real urgency (cohort dates, seat limits, early-bird pricing)
- [ ] Limited-time bonuses (if genuine)
- [ ] Low-stock/seat alerts (if real)
- [ ] Countdown timers (ONLY if real deadline)
- [ ] ❌ **NO fake scarcity** — destroys trust

**Examples:**
- "Only 23 spots left in the January cohort"
- "Early-bird pricing ends December 31st"
- "Limited to 100 beta testers — 73 claimed"

### 7. Unity — "We're in This Together"
**Principle:** We favor those who are part of our "tribe" or share our identity.

**Landing Page Application:**
- [ ] Shared identity language ("Built by founders, for founders")
- [ ] In-group signaling ("Join the movement", "Become part of the tribe")
- [ ] Common enemy framing ("We hate manual work too")
- [ ] Community belonging ("Join 500+ members in our Slack")
- [ ] Exclusive access feeling ("For serious builders only")

**Examples:**
- "Built by founders, for founders"
- "Join the movement of 10x shippers"
- "We're not for everyone — just those who hate wasting time"

---

## COPYWRITING FRAMEWORKS (Beyond AIDA)

### Framework 1: PAS (Problem → Agitate → Solution)
**Best for:** Emotional, pain-driven copy

**Structure:**
```
PROBLEM: Identify the specific pain
AGITATE: Amplify the consequences of not solving
SOLUTION: Present your offer as the relief
```

**Example:**
- **P**: "You're spending 8 hours on every PRD"
- **A**: "That's 40 hours/month you'll never get back—while competitors ship faster"
- **S**: "Generate complete PRDs in 15 minutes with AI"

### Framework 2: PASO (Problem → Agitate → Solution → OUTCOME)
**Best for:** Transformation-focused copy (add the "After" state)

**Example:**
- **P**: "You're spending 8 hours on every PRD"
- **A**: "That's 40 hours/month you'll never get back"
- **S**: "Our AI generates PRDs in 15 minutes"
- **O**: "Imagine launching 10x faster, impressing your board, finally having time for strategy"

### Framework 3: BAB (Before → After → Bridge)
**Best for:** Testimonials, case studies, transformation stories

**Example:**
- **Before**: "Before [Product], I was drowning in manual work..."
- **After**: "Now I launch features in days instead of weeks..."
- **Bridge**: "[Product] was the bridge that got me there."

### Framework 4: 4Ps (Picture → Promise → Proof → Push)
**Best for:** High-ticket offers, complex products

**Example:**
- **Picture**: "Imagine waking up to 5 qualified leads in your inbox"
- **Promise**: "Our system does the heavy lifting while you sleep"
- **Proof**: "1,427 founders already use this daily"
- **Push**: "Start your free trial — no credit card required"

### Framework 5: StoryBrand Framework
**Best for:** Brand positioning, homepage messaging

**Structure:**
1. **Hero**: Your customer (NOT you)
2. **Problem**: External (surface), Internal (feeling), Philosophical (why it matters)
3. **Guide**: Your brand as the mentor (with empathy + authority)
4. **Plan**: 3 simple steps
5. **Call to Action**: Direct ("Start Now") or Transitional ("Learn More")
6. **Success**: What life looks like after
7. **Failure**: What happens if they don't act

---

## VISUAL PERSUASION PSYCHOLOGY

### Eye-Tracking Patterns

**F-Pattern** (for text-heavy pages):
```
→ → → → → → → → → (First horizontal scan)
↓
→ → → → → → (Second horizontal scan, shorter)
↓
↓ (Vertical scan down left side)
↓
```
**Use:** Place critical elements along the F-path.

**Z-Pattern** (for simple landing pages):
```
1 → → → → 2
         ↘
           ↘
3 → → → → 4 (CTA HERE)
```
**Use:** Place your primary CTA at position 4 (end of the Z).

### Above-the-Fold Priority (60% Never Scroll)

**CRITICAL:** 60% of visitors never scroll past the fold. Your hero must do 80% of the persuasion work.

**Above-the-fold MUST contain:**
1. ✅ Headline with benefit/transformation (not just product name)
2. ✅ Subheadline with supporting detail
3. ✅ Primary CTA (outcome-based)
4. ✅ Trust signal (user count, rating, or logo)
5. ✅ Hero visual (product mockup, illustration, or video thumbnail)

**Above-the-fold MUST NOT:**
- ❌ Require scrolling to understand what you offer
- ❌ Have competing CTAs
- ❌ Be cluttered with too many elements
- ❌ Use generic stock imagery

### Color Psychology for CTAs

| Color | Psychological Effect | Best Use |
|-------|---------------------|----------|
| **Orange/Red** | Urgency, excitement, action | Primary CTA buttons |
| **Green** | Go, success, safety, growth | "Start Free Trial", confirmations |
| **Blue** | Trust, calm, reliability | Links, secondary CTAs |
| **Black** | Premium, authority, sophistication | High-end products |
| **White on Dark** | Clarity, focus, contrast | Hero sections with gradients |

**Rule:** CTA button must have **highest contrast** on the page.

---

## CONVERSION BENCHMARKS & QUALITY GATES

### Industry Standards (2024-2025)

| Metric | Average | Good | Excellent | Elite |
|--------|---------|------|-----------|-------|
| **Landing Page CVR** | 5.9-6.6% | 8-10% | 11-15% | 20-30% |
| **Time to First Value** | >5 min | 2-5 min | <2 min | <60 sec |
| **Bounce Rate** | 70%+ | 50-70% | 30-50% | <30% |
| **Form Completion** | 50% | 60% | 70% | 80%+ |
| **Scroll Depth** | 40% | 50% | 60% | 70%+ |

### Conversion Quality Gate

Before launch, verify:
- [ ] Above-the-fold loads in <2 seconds (LCP)
- [ ] Primary CTA visible without scrolling
- [ ] Mobile CTA is thumb-reachable (bottom 50% of screen)
- [ ] Form has ≤3 fields (name, email, [optional 1])
- [ ] Social proof visible above-the-fold
- [ ] Value proposition is clear in <5 seconds

---

## Preflight (auto)
1) **Get date**: run `date +"%Y-%m-%d"` and capture `TODAY`, and derive `YEAR`.  
2) **Detect research tools** (preferred → fallback):
   - If an MCP search tool exists (e.g., `firecrawl`, `exa`, `ref`, `greptile`), prefer it.
   - Else, use Cursor's web browsing.
3) **Create folders (idempotent)** if missing:
   - `/docs/marketing`, `/docs/avatars`, `/docs/landing-page`, `/docs/research`, `/components/landing`
4) **Writing policy**: For large files, **write in small chunks** to avoid editor limits.

---

## Planning & Task Creation (CRITICAL - DO THIS FIRST)

**Before executing anything, you MUST:**

1. **Analyze Requirements**: Review Technical Spec, understand marketing/conversion goals
2. **Create Task List**: Generate comprehensive 4-part task list with checkboxes
3. **Present Plan**: Show the user your complete landing page plan
4. **Get Approval**: Wait for user to approve the plan before executing

**Task List Format** (create at the start):
```markdown
## Step-9 Landing Page Development Plan (5-Phase Process)

### Phase A: Blocking Gate & Prerequisite Loading
- [ ] Validate offer architecture (load OFFER-ARCHITECTURE.md)
- [ ] Check Step 5 wireframe outputs
- [ ] STOP — Present prerequisite status, wait for approval

### Phase B: Customer Avatar Research
- [ ] Build YEAR-aware queries (landing page CRO, Fogg Model, value proposition)
- [ ] Execute MCP search for 5-10 sources
- [ ] Write `/docs/research/LANDING-SOURCES-${TODAY}.md`
- [ ] STOP — Present research summary, wait for approval
- [ ] Create Problem Aware Avatar (1000+ words: demographics, psychographics, deep psychology, emotional landscape, purchasing behavior, primary wants)
- [ ] STOP — Present avatar, wait for approval

### Phase C: Emotional Diary Creation
- [ ] Create 3-5 diary entries (300-500 words each): Awakening, Struggle, Search, Doubt, Hope
- [ ] Extract dominant emotions, language patterns, emotional triggers, Five Drivers
- [ ] STOP — Present diary entries and emotional insights, wait for approval

### Phase D: Landing Page Copy & CRO
- [ ] Create 15-section landing page framework (Hero through A/B Testing)
- [ ] Complete Cialdini audit, NESB audit, Five Drivers audit
- [ ] STOP — Present complete landing page framework, wait for approval

### Phase E: Template Selection & Scaffolding
- [ ] Analyze project archetype, recommend Magic UI template
- [ ] Map copy sections to template components
- [ ] STOP — Confirm template selection, wait for approval
- [ ] Define scaffolding plan (source, target, design system injection)
- [ ] STOP — Confirm scaffolding plan, wait for approval
- [ ] Write all output files and verify quality gates
- [ ] FINAL STOP — Present complete landing page documentation, wait for final approval
```

**Execution Rules**:
- Check off EACH task as you complete it
- This is a 5-PHASE sequential process - do NOT skip phases
- Do NOT proceed to next phase until user approves current phase
- ✅ Use MCP search for research
- ✅ Take notes to maintain emotional context from diaries
- ✅ Write files in small chunks
- ✅ This step is OPTIONAL - can be skipped if product-focused

---

## Inputs to capture (ask, then echo back as a table)
- Technical Spec from Step-8 (path to `/docs/technical/TECHNICAL-SPEC.md`)
- Design System from Step-6 (for brand colors, typography)
- Target audience (from PRD - who is the primary buyer?)
- Pricing model (free trial, freemium, paid tiers)
- Conversion goal (signup, demo request, purchase, waitlist)
- **Market Research**: Read `/docs/marketing/RESEARCH-*.md` (for Blue Ocean strategy)
- **Offer Strategy**: Read `/docs/marketing/OFFER-*.md` (for Pricing Tiers & Guarantees)
- **Magic UI Templates**: Check available templates in `.cursor/commands/Magic UI/`
- Competitive positioning (what makes you different?)
- Optional: Skip this step entirely if product-focused (not marketing-focused)

> Ground rules: If any item is unknown, ask concise HITL questions now and proceed with clearly flagged assumptions.

---

## MAGIC UI TEMPLATES INVENTORY

**Template Location:** `.cursor/commands/Magic UI/`

### Available Templates

| Template | Best For | Key Components Path |
|----------|----------|---------------------|
| `startup-template/` | B2B SaaS, General Startups | `components/landing/hero-section.tsx`, `pricing-section.tsx`, `cta-section.tsx` |
| `agent-template-/` | AI Agents, Chatbots, Automation | `src/components/sections/` - bento grids, feature cards, modern dark mode |
| `mobile-template-/` | iOS/Android App Landing Pages | `src/components/sections/hero.tsx`, `features.tsx`, `pricing.tsx`, device mockups |
| `devtool-template/` | Developer Tools, APIs, CLI | `src/components/sections/` - code blocks, documentation focus, technical aesthetic |
| `portfolio/` | Personal Brand, Service Providers | `src/components/` - resume cards, project cards, dock navigation |
| `blog-template-bc0cb81/` | Content Sites, Newsletters | `components/` - blog cards, author cards, table of contents |
| `changelog-template/` | Product Updates, Release Notes | `components/` - accordion, timeline, marquee |

### Section-to-Component Mapping

| Landing Page Section | startup-template | agent-template | mobile-template | devtool-template |
|---------------------|------------------|----------------|-----------------|------------------|
| **Hero** | `landing/hero-section.tsx` | `sections/hero.tsx` | `sections/hero.tsx` | `sections/hero.tsx` |
| **Features** | `landing/client-section.tsx` | `sections/bento.tsx` | `sections/features.tsx` | `sections/features.tsx` |
| **Feature Highlight** | N/A | `sections/feature-highlight.tsx` | `sections/feature-highlight.tsx` | `sections/feature-highlight.tsx` |
| **Benefits** | N/A | `sections/benefits.tsx` | `sections/benefits.tsx` | `sections/benefits.tsx` |
| **Pricing** | `landing/pricing-section.tsx` | `sections/pricing.tsx` | `sections/pricing.tsx` | `sections/pricing.tsx` |
| **CTA** | `landing/cta-section.tsx` | `sections/cta.tsx` | `sections/cta.tsx` | `sections/cta.tsx` |
| **FAQ** | N/A | `sections/faq.tsx` | `sections/faq.tsx` | `sections/faq.tsx` |
| **Testimonials** | N/A | `sections/testimonials.tsx` | `sections/testimonials.tsx` | `sections/testimonials.tsx` |
| **Header/Nav** | `site-header.tsx` | `sections/header.tsx` | `sections/header.tsx` | `sections/header.tsx` |
| **Footer** | `site-footer.tsx` | `sections/footer.tsx` | `sections/footer.tsx` | `sections/footer.tsx` |

### Magic UI Components (Shared)

Available in `components/magicui/` across templates:
- `border-beam.tsx` - Animated border effect
- `marquee.tsx` - Scrolling logo/text ticker
- `particles.tsx` - Background particle effects
- `sphere-mask.tsx` - 3D sphere mask effect
- `text-shimmer.tsx` - Shimmering text animation
- `flickering-grid.tsx` - Grid background effect

### Icon Library (CRITICAL - Consistency)

**Rule:** Use a consistent icon library throughout the landing page. Never use emojis as icons.

**Recommended Libraries:**

| Library | Install | Best For |
|---------|---------|----------|
| **Lucide React** ⭐ | `npm i lucide-react` | Primary choice - 1400+ icons, consistent with product UI |
| **Phosphor Icons** | `npm i @phosphor-icons/react` | 6 weight variants for flexibility |
| **Heroicons** | `npm i @heroicons/react` | Tailwind-native, solid + outline |

**Usage in Landing Page:**
```tsx
import { ArrowRight, CheckCircle, Sparkles, Shield } from 'lucide-react';

// Hero CTA
<Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>

// Feature lists with checkmarks
<CheckCircle className="h-5 w-5 text-green-500" />

// Premium/AI features
<Sparkles className="h-5 w-5 text-purple-500" />

// Trust indicators
<Shield className="h-5 w-5 text-blue-500" />
```

**Icon Quality Gate:**
- [ ] All icons from same library (no mixing)
- [ ] Consistent sizing (use design system scale)
- [ ] Meaningful icons that reinforce copy message
- [ ] No emojis used as icon replacements

### Template Selection Guide

---
**>>> CHECKPOINT: TEMPLATE SELECTION APPROVAL <<<**

Present recommended template with rationale (project type, why it fits, source path) to the user.
**Do NOT continue to Phase E scaffolding until the user explicitly approves.**

Reply `approve template` or `revise: [feedback]`.
---

---

## Persona Pack (used throughout)
- **Senior Conversion Copywriter (FAANG)** – **PAS** (Problem-Agitation-Solution), **AIDA** (Attention-Interest-Desire-Action), **PASO**, **BAB**, **4Ps**, **StoryBrand**, **value proposition** canvas, **Fogg Behavior Model**, **Cialdini's 7 Principles**, CRO tactics.
- **Customer Research Specialist** – **Eugene Schwartz's 5 Stages of Market Awareness** (Unaware, Problem Aware, Solution Aware, Product Aware, Most Aware), JTBD, pain point analysis.
- **UX/Conversion Designer** – **conversion funnel**, friction analysis, **CTA optimization**, trust signals, social proof placement, **visual hierarchy**, **F-pattern/Z-pattern**.
- **Frontend Architect** – component mapping, **Tailwind** configuration, **Magic UI** integration, responsive design implementation.
- **Brand Strategist** – brand voice (friendly, professional, bold), emotional triggers, storytelling, positioning, differentiation.
- **Research Analyst** – time-boxed web/MCP research (current-year aware), landing page trends, CRO best practices, source curation.

> Tone: persuasive, empathetic, conversion-focused. Cite sources in `/docs/research/LANDING-SOURCES-${TODAY}.md`. Use YEAR in recency filters.

---

## **Phase A: Blocking Gate & Prerequisite Loading**

### A1: Offer Architecture (PREREQUISITE)

Load and validate `docs/specs/OFFER-ARCHITECTURE.md` (from Step 1.5). If missing, skip monetization sections.

**File check order:**
1. `/docs/specs/OFFER_ARCHITECTURE.md` (primary, from Step 1.5)
2. `/docs/specs/pricing-config.json` (structured pricing data)
3. Legacy: `/docs/marketing/OFFER-ARCHITECTURE-*.md`, `/docs/marketing/PRICING-TIERS.md`

**If found:** Use as source of truth for all pricing copy. Proceed to A2.
**If missing:** Ask user: `1` Run Step 1.5 (recommended), `2` Quick inline offer, or `3` Skip.

---

### A2: Step 5 Landing Page Wireframe (PREREQUISITE)

**Step 5 (Wireframe Prototypes) should have produced the VISUAL landing page design.**

This step focuses ONLY on **conversion copywriting**—the words that replace placeholders.

### Check for Step 5 Outputs

Look for these files:
- `/docs/wireframes/LANDING-PAGE-WIREFRAME.md` (wireframe structure)
- Runnable prototype with placeholder copy

### If Step 5 Landing Page Wireframe Missing

---
**>>> CHECKPOINT: WIREFRAME PREREQUISITE <<<**

Present missing wireframe status to the user. Options: `1` Go back to Step 5, `2` Select template now (fallback), `3` Proceed without template.
**Do NOT continue to Phase B until the user explicitly chooses.**

Reply `1`, `2`, or `3`.
---

### If Step 5 Was Completed

Reference the wireframe outputs:
- **Wireframe structure:** `/docs/wireframes/LANDING-PAGE-WIREFRAME.md`
- **Template used:** [From wireframe file]
- **Sections defined:** [From wireframe file]

**This step will replace all `[PLACEHOLDER]` text with conversion-optimized copy.**

### Bulletproof Verification (Recommended)

Before creating landing page copy, verify screen completeness from earlier steps:

**Check these artifacts exist:**
- `/docs/flows/TRACEABILITY-MATRIX.md` (Step 4 - PRD feature-to-screen mapping)
- `/docs/flows/ZERO-OMISSION-CERTIFICATE.md` (Step 4/5 - Zero screen omission proof)

**If missing:** Run `@step-4-flow-tree` and `@step-5-wireframe-prototypes` first to ensure no screens are missed.

### Animation & State Quality References

When designing landing page interactions, reference these frameworks:
- **Step 6 Animation Quality:** `/docs/design/DESIGN-SYSTEM.md` → Animation Implementation Quality Framework
  - Performance budgets (60fps, <100ms first animation)
  - GPU-accelerated properties only (transform, opacity)
  - Reduced motion support required
- **Step 7 State Transitions:** `/docs/states/STATE-SPEC.md` → State Transition Implementation Quality
  - Loading → Populated transitions (300ms max)
  - Form state changes (success/error feedback)
  - CTA hover/focus states

---

## **Phase B: Customer Avatar Research (Market Awareness)**

### Phase A1 — Landing Page Research (current-year aware)
**Goal:** Ground copy decisions in current CRO best practices and conversion psychology.

1) Build YEAR-aware queries (e.g., "landing page conversion optimization {YEAR}", "SaaS landing page best practices {YEAR}", "Fogg Behavior Model {YEAR}", "Cialdini principles {YEAR}", "value proposition canvas {YEAR}").  
2) Run **MCP search** if available; else use web browsing.  
3) Capture **5–10 sources** with titles, dates, and permalinks; group by topic:
   - Landing page conversion tactics
   - Copywriting frameworks (PAS, AIDA, PASO, BAB, StoryBrand)
   - Customer psychology (Fogg, Cialdini)
   - SaaS pricing page optimization
   - Visual persuasion (eye-tracking, color psychology)
4) Write `/docs/research/LANDING-SOURCES-${TODAY}.md` with a 1-page **Research Summary** and a bulleted **Source List**.

---
**>>> CHECKPOINT: PHASE B1 — RESEARCH APPROVAL <<<**

Present research summary and source list to the user.
**Do NOT continue to Phase B2 (Avatar creation) until the user explicitly approves.**

Reply `approve research` or `revise: [feedback]`.
---

---

### Phase A2 — Create Customer Avatars (5 Stages of Market Awareness)
Based on **Eugene Schwartz's Breakthrough Advertising** framework, create **one detailed avatar** for the **Problem Aware** stage (most important for SaaS conversions):

**IMPORTANT — Market Sophistication Assessment (Schwartz):**

Before writing copy, also determine your market's sophistication level:

| Level | Indicators | Positioning Strategy |
|-------|------------|---------------------|
| **1 - First** | Virgin market, no competitors | Direct claim: "Get [result]" |
| **2 - Second** | Claims exist but not maximized | Enlarged claim: "Get [specific result] in [timeframe]" |
| **3 - Third** | Claims saturated, need differentiation | Introduce mechanism: "The [Name] Protocol" |
| **4 - Fourth** | Mechanisms used by competitors | Super-mechanism: "The ONLY [type] that..." |
| **5 - Fifth** | Everything done, claims exhausted | Identity: "For [specific identity] who..." |

**Your Market Sophistication Level**: _____ (impacts all headline and claim strategies)

**Problem Aware Avatar** (1000+ words):
- **Demographics**: Name, age, job, income, location, education
- **Psychographics**: Personality traits, values, life victories/failures
- **Deep Psychology**:
  - What keeps them awake at night (specific anxieties)
  - What they're secretly afraid of (hidden fears)
  - What they're angry about (frustrations and who they blame)
  - Top 3 daily frustrations
  - Biggest secret desire
  - Common language patterns (how they talk about the problem)
- **Emotional Landscape**:
  - Top 3 dominant negative emotions
  - Top 3 dominant positive emotions from solving this problem
  - Top 3 beliefs about the world
  - Biggest lifestyle desire
- **Purchasing Behavior**:
  - Top 3 decision triggers
  - Prior purchases for this pain
  - Price tolerance
  - Research behavior
- **Primary Wants** (Motivation Matrix):
  - Wants to gain (benefits)
  - Wants to be (identity transformation)
  - Wants to do (capabilities)
  - Wants to save (time, money, effort)
  - Wants to avoid (fears)
  - Wants to feel (emotional states)

---
**>>> CHECKPOINT: PHASE B2 — AVATAR APPROVAL <<<**

Present the complete Problem Aware Avatar (1000+ words) to the user.
**Do NOT continue to Phase C (Emotional Diary) until the user explicitly approves.**

Reply `approve avatar` or `revise: [feedback]`.
---

---

## **Phase C: Emotional Diary Creation**

### Phase B — Create Diary Entries (Emotional Profile)
From the Problem Aware avatar, create **3-5 diary entries** (300-500 words each) that capture their emotional journey:

**Entry 1: The Awakening** (moment they realize the problem)
**Entry 2: The Struggle** (daily impact and frustration)
**Entry 3: The Search** (looking for solutions, disappointments)
**Entry 4: The Doubt** (self-doubt and fear of failure)
**Entry 5: The Hope** (glimpse of possibility)

Each entry should:
- Use first-person voice ("I")
- Include visceral, emotional language
- Show (don't tell) their emotional state
- Use their specific language patterns
- Be psychologically authentic

### Five Drivers Integration (Blair Warren Framework)

**For each diary entry, capture these emotional elements:**

| Diary Entry | Primary Five Driver | What to Extract |
|-------------|--------------------|-----------------| 
| **Entry 1: The Awakening** | Confirm Suspicions | What did they suspect was wrong? When did they realize it? |
| **Entry 2: The Struggle** | Justify Failures | What have they tried? Why do they blame themselves? |
| **Entry 3: The Search** | Throw Rocks at Enemies | Who/what frustrated them in their search? What felt like a scam? |
| **Entry 4: The Doubt** | Allay Fears | What specific fears hold them back? What keeps them up at night? |
| **Entry 5: The Hope** | Encourage Dreams | What dream are they starting to believe again? What would success look like? |

**Five Drivers Extraction Template:**

```markdown
## Five Drivers Analysis (from Diary Entries)

### Dreams to Encourage
[What dream emerged in Entry 5? Quote their language.]

### Failures to Justify
[What failed attempts from Entry 2/3? What external reason explains the failure?]

### Fears to Allay
[What specific fears from Entry 4? List top 3.]
1. 
2. 
3. 

### Suspicions to Confirm
[What did they suspect was wrong from Entry 1? What evidence confirms it?]

### Enemies to Fight
[Who/what frustrated them from Entry 3? What's the common enemy?]
```

Extract from diaries:
- **Dominant emotions** (pain points)
- **Key language patterns** (how they talk about the problem)
- **Emotional triggers** (what drives decisions)
- **Conversion opportunities** (hooks for landing page copy)
- **Five Drivers mapping** (for messaging strategy)

---
**>>> CHECKPOINT: PHASE C — DIARY APPROVAL <<<**

Present all diary entries, Five Drivers extraction, and emotional insights to the user.
**Do NOT continue to Phase D (Landing Page Copy) until the user explicitly approves.**

Reply `approve diaries` or `revise: [feedback]`.
---

---

## **Phase D: Landing Page Copy & CRO**

### Phase C — Landing Page Structure
Using the **design system** from Step-6 and **emotional insights** from Part 2, create the landing page framework:

#### Section 1: Hero Section
**Primary Headline** (Use the MAGIC Formula):
- **M**agnetic Reason Why (Benefit)
- **A**nnounce Your Avatar (Who it's for)
- **G**ive Them a Goal (Outcome)
- **I**ndicate a Time Interval (Time to Value)
- **C**ontainer Word (e.g., "System", "Platform")
- *Example:* "The **AI System** That Helps **Founders** Launch **MVPs** in **24 Hours** Without **Writing Code**."

**Secondary Headline** (15-25 words):
- Supporting context + emotional hook
- Addresses primary pain point

**Hero Description** (2-3 sentences):
- Elaborates on value proposition
- Connects with avatar's pain from diaries

**Primary CTA Button** (Hormozi Outcome-Based Method):
- **Formula**: [Action Verb] + [Specific Outcome] + [Timeframe if true]
- **✅ GOOD**: "Generate Your PRD in 15 Minutes", "Start Saving 10 Hours/Week"
- **❌ BANNED**: "Submit", "Sign Up" (alone), "Click Here", "Learn More"

**Social Proof Snippet**:
- Customer count / rating / notable client
- Builds immediate credibility (Cialdini #3: Social Proof)

**Design System Integration**:
- Colors: Primary CTA uses accent color, high contrast
- Typography: H1 for headline (Display Large from design system)
- Spacing: Space-12 between elements, space-24 from edges
- Components: Primary Button (large variant)

---

#### Section 2: Problem Agitation
**Problem Statement Headline**:
- Articulates core problem avatar faces
- Uses their language from diaries

**Pain Point Bullets** (5 specific pains from diaries):
- [ ] "You're spending [time] on [manual task]"
- [ ] "You're losing [money/customers] because [pain point]"
- [ ] "You're frustrated by [specific frustration from diaries]"
- [ ] "You've tried [existing solutions] but [why they failed]"
- [ ] "You're worried about [specific fear from diaries]"

**Emotional Connection Paragraph**:
- Shows deep understanding using diary language
- "We get it. You're tired of..."
- Builds empathy before pitching solution (Cialdini #5: Liking)

---

#### Section 3: Solution Introduction
**Solution Headline**: "Introducing [Product Name]"
**Value Proposition**: What you provide + why it matters
**Unique Selling Proposition**: What makes you different
**The Grand Slam Offer** (Hormozi Method):
- Bundle the core product with high-value bonuses.
- Frame it as "Total Solution" not just a "Tool".
- "You get [Core] + [Bonus 1] + [Bonus 2]... Total Value $[X], for just $[Y]."

**Benefit-Focused Description** (2-3 paragraphs):
- How you solve their problem
- Focus on outcomes, not features
- Transform technical specs into emotional benefits

---

#### Section 4: Features & Benefits Translation (with Value Equation Tags)
For each major feature from Technical Spec, translate to benefits AND tag with Value Equation:

**Template**:
- **Technical Feature**: [From Step-6]
- **Benefit Translation**: What this means for the user
- **Emotional Impact**: How this makes them feel
- **Value Tags**: [DO] [PL] [TD] [ES] (tag applicable levers)

**Example**:
```
Feature: AI-powered voice-to-PRD
- Benefit: "Generate complete PRDs in 15 minutes (vs. 8 hours manual)"
- Emotional: "Finally have time for strategic work you love"
- Value Tags: [DO] [TD] [ES]
  - [DO]: Complete PRD delivered (quantified outcome)
  - [TD]: 15 minutes (vs. 8 hours = 97% time savings)
  - [ES]: Just speak—no typing or formatting
```

**Value Equation Tags** (tag EVERY feature bullet):
- **[DO]** Dream Outcome ↑ (quantified result)
- **[PL]** Perceived Likelihood ↑ (proof, "1,427 users have done this")
- **[TD]** Time Delay ↓ (speed, "See results in 60 seconds")
- **[ES]** Effort/Sacrifice ↓ (ease, "1-click import")

---

#### Section 5: Social Proof & Credibility
**Customer Testimonials** (3 detailed) — Use BAB Framework:
- **Before**: What life was like before
- **After**: What life is like now
- **Bridge**: How your product was the solution
- Include results/metrics where possible
- Use real-sounding names, photos, and roles

**Company Logos**: Notable clients (if applicable) — Cialdini #4: Authority
**Statistics**: Compelling numbers (users, time saved, ROI)
**Awards/Recognition**: Industry recognition
**Media Mentions**: "As seen in..." — Cialdini #4: Authority

---

#### Section 6: How It Works (3 Simple Steps)
**Step 1**: [Sign up / Connect / Import]
**Step 2**: [Configure / Customize / Set up]
**Step 3**: [Launch / Activate / Start seeing results]
**Outcome**: "In minutes, you'll be [desired outcome]"

**Purpose**: Reduces cognitive load, makes it feel achievable (Cialdini #2: Commitment)

---

#### Section 7: Objection Crusher FAQ (10-12 Items - Hormozi Method)
**Always include these 8 core objections** + 2-4 persona-specific from Step-1:

**CORE 8 OBJECTIONS** (mandatory):

1. **Price/ROI**: "Is it worth the cost?"
   - **Answer**: "[ROI calculation]. For $49/mo, you'll save [X hours] worth $[Y]. Break-even in [Z days]."
   - Each answer: outcome-anchored + proof (numbers/process/policy)

2. **Time to Value**: "How long before I see results?"
   - **Answer**: "60 seconds to first PRD. 15 minutes to complete, polished document."
   - Be specific with timeframes

3. **Complexity/Learning Curve**: "Is it hard to learn?"
   - **Answer**: "If you can talk, you can use it. No training needed. [Video demo link]."
   - Address skill requirements

4. **Compatibility/Integration**: "Will it work with [my tools]?"
   - **Answer**: "[List integrations]. Export to [formats]. API available."
   - Be specific about tech stack

5. **Privacy/Security**: "Is my data secure?"
   - **Answer**: "SOC 2 compliant. Encrypted at rest and in transit. GDPR compliant."
   - Cite compliance standards — Cialdini #4: Authority

6. **Support/Success**: "What if I need help?"
   - **Answer**: "Live chat (9am-5pm PT). Email support (<4hr response). Video tutorials."
   - Specify support channels and SLAs

7. **Cancellation/Refund**: "Can I cancel anytime?"
   - **Answer**: "Yes. Cancel with one click. No questions asked. No long-term contracts."
   - Be clear about flexibility

8. **Skepticism** ("I tried similar"): "I've tried other tools. Why is this different?"
   - **Answer**: "[Specific differentiation]. See comparison: [link]. Try risk-free for 30 days."
   - Provide proof of difference

**PERSONA-SPECIFIC OBJECTIONS** (add 2-4 from Step-1 research):

9. **[Persona Pain Point 1]**: "[Question from persona research]?"
   - **Answer**: [Specific to persona needs]

10. **[Persona Pain Point 2]**: "[Question from persona research]?"
    - **Answer**: [Specific to persona needs]

---

#### Section 8: Risk Reversal (Unbeatable Guarantee)
**Guarantee Headline**: "Try it risk-free for 30 days" (or bolder: "Double Your Money Back")
**Guarantee Details**: Specific terms, no questions asked refund.
**"Anti-Risk" Framing**:
- "If you don't [get specific result], we don't want your money."
- "We take all the risk, so you take none."

**Risk Reversal Benefits**: What they get even if not satisfied (e.g., "Keep the bonuses").

**Purpose**: Removes final barrier (Cialdini #1: Reciprocity + Risk Reversal)

---

#### Section 8B: COGS Calculation (REQUIRED before Pricing)

**BEFORE setting pricing, calculate actual costs to ensure healthy margins.**

Hormozi Rule: **Minimum 3x COGS** for software products (target 5-10x).

### COGS Calculation Template

| Cost Center | Monthly Per-User | At Scale (1K users) | Notes |
|-------------|------------------|---------------------|-------|
| **AI/API Costs** | | | OpenAI, Claude, embeddings |
| **Database** | | | Supabase, PlanetScale, storage |
| **Compute** | | | Vercel, Railway, background jobs |
| **Email/SMS** | | | Resend, Twilio |
| **Storage/CDN** | | | R2, S3, Cloudflare |
| **Auth** | | | Clerk, Auth0 (if per-seat) |
| **Third-party APIs** | | | Any integrations |
| **Support Overhead** | | | Estimated hours × rate |
| **TOTAL COGS** | **$[X]** | **$[Y]** | |

### Pricing Floor Calculation

```
Minimum Price = COGS × 3 = $[X] × 3 = $[Y]/mo

Healthy Price = COGS × 5 = $[X] × 5 = $[Z]/mo

Premium Price = COGS × 10 = $[X] × 10 = $[W]/mo
```

### Margin Validation

| Tier | Price | COGS | Gross Margin | Multiplier | Status |
|------|-------|------|--------------|------------|--------|
| Starter | $[X] | $[Y] | [Z]% | [N]x | ✅/❌ |
| Pro | $[X] | $[Y] | [Z]% | [N]x | ✅/❌ |
| Agency | $[X] | $[Y] | [Z]% | [N]x | ✅/❌ |

**Margin Rules:**
- ❌ < 3x = Unsustainable (raise prices or cut costs)
- ⚠️ 3-5x = Acceptable (limited growth budget)
- ✅ 5-10x = Healthy (room for ads, hiring, profit)
- 🚀 > 10x = Premium (pricing power, strong brand)

### Reference: Step 1.5 for Full COGS Framework

If you need deeper analysis, run `@step-1.5-offer-architecture` which includes:
- Variable cost breakdown by user tier
- Fixed cost allocation
- Break-even analysis
- **Automatic sync to MASTER_PRD and stack-profile.json**
- Pricing psychology (charm pricing, decoy effect)

---
**>>> CHECKPOINT: PHASE D — COGS & PRICING APPROVAL <<<**

Present COGS summary, margin calculations, and proposed pricing tiers to the user.
**Do NOT continue to pricing copy until the user explicitly approves margins.**

Reply `approve pricing` or `revise: [feedback]`.
---

---

#### Section 9: Pricing & Offer Stack (Hormozi Method)

### Price Anchoring Framework
**Calculate ALL 4 alternatives, choose largest believable anchor:**

1. **Cost of Not Solving**: (Time lost/month × User's hourly rate) + missed revenue
2. **DIY/Toolchain Cost**: Licenses + integration hours × rate + maintenance
3. **Hire Cost**: Freelancer/agency/employee fully loaded monthly
4. **Competitor Price**: Known competitor pricing (if relevant)

**Display Example**:
```
"Hiring a PM for PRDs ≈ $10,000/mo.
DIY toolchain (Notion + Figma + Loom) = $500/mo + 20 hrs setup.
**Our PRD Generator: $49/mo.**
Even 1 hour saved/week at $100/hr = $400/mo value.
**Break-even in 4 days.**"
```

**Rule**: Position your price as "money at a discount" vs. largest believable anchor.

### Offer Stack & Bonuses
**Bonus Stack** (with $ value anchors):
1. **[Bonus 1 Name]** ($197 value): [1-line benefit]
2. **[Bonus 2 Name]** ($97 value): [1-line benefit]
3. **[Bonus 3 Name]** ($297 value): [1-line benefit]
**Total Bonus Value**: $591
**Your Price**: $49/mo
**Savings**: $542 (92% off equivalent value)

---

#### Section 10: Urgency & Scarcity (Must be REAL)
**Urgency Element**: Limited-time discount, bonus for early sign-ups (real deadline)
**Scarcity Element**: Limited spots, cohort seats, beta access (real limits)
**❌ AVOID**: Fake countdown timers, fake scarcity — destroys trust

**Cialdini #6: Scarcity** — Only use if GENUINE:
- "Only 23 spots left in the January cohort"
- "Early-bird pricing ends December 31st"
- "Limited to 100 beta testers — 73 claimed"

---

#### Section 11: Final CTA Section & Lead Capture

### CTA Copy
**CTA Headline**: Reinforces value ("Join [X] users who [benefit]")
**CTA Description**: Final persuasive paragraph
**Primary CTA Button**: Outcome-based ([Action] + [Outcome] + [Time])
**Secondary CTA Option**: Lower-commitment (e.g., "Watch Demo", "See Example")
**Final Trust Signal**: Money-back guarantee, secure payment

### 2-Step Opt-In Pattern (Hormozi Method)
**When to Use** (boosts conversion 25-40%):
- ✅ Cold traffic (ads, SEO, referrals)
- ✅ Higher-commitment asks (demo request, pricing access)
- ✅ Multi-field forms

**When to Skip** (show form immediately):
- Value is obvious/urgent (instant download)
- Audience is warm (retargeting, email list)
- One field only (email)
- Compliance requires all fields on same screen

**Implementation** (Cialdini #2: Commitment):
- **Step 1**: Low-commitment button click
  - "Yes, I Want [Outcome]" (no form visible yet)
  - High contrast, large button
  
- **Step 2**: Reveal minimal form (name + email max)
  - Privacy line: "No spam. Unsubscribe anytime."
  - Social proof: "1,427 people joined this week"
  - Optional: Trust badges (secure, GDPR)
  
- **Step 3**: Instant Win (≤120 seconds post-opt-in)
  - Immediate template/pack download
  - Sample output with pre-filled data
  - 90-second quickstart video
  - Must deliver value FAST (prefer instant, no login)

---

#### Section 12: Cialdini & NESB Audit

> Cialdini's 7 Principles are defined in full at the top of this file. Use the Heuristics Checklist at the end for the final sign-off audit.

#### Section 12.5: NESB Landing Page Audit (Kyle Milligan Framework)

**Before finalizing, validate your landing page triggers all four emotional responses:**

The NESB Framework ensures your copy makes prospects feel the offer is **N**ew, **E**asy, **S**afe, and **B**ig.

**Score each section 1-10 (aim for 7+ on each):**

### Above the Fold Audit
| Trigger | Question | Score |
|---------|----------|-------|
| **NEW** | Does headline signal a novel mechanism/discovery? | ___/10 |
| **EASY** | Does subhead/visual suggest simplicity? | ___/10 |
| **SAFE** | Is there a trust signal (social proof, guarantee)? | ___/10 |
| **BIG** | Does the promise feel transformational? | ___/10 |

### Body Copy Audit
| Trigger | Implementation | Present? |
|---------|----------------|----------|
| **NEW** | Mechanism named? Discovery narrative? | [ ] |
| **EASY** | Steps numbered (3-5)? Time stated? Skills NOT needed mentioned? | [ ] |
| **SAFE** | Similar-person testimonials? Performance anxiety addressed? | [ ] |
| **BIG** | Specific numbers? Timeline? Identity transformation? | [ ] |

### Offer Section Audit
| Trigger | Implementation | Present? |
|---------|----------------|----------|
| **NEW** | Urgency/scarcity creates "limited opportunity" feeling? | [ ] |
| **EASY** | CTA implies simple next step (not intimidating)? | [ ] |
| **SAFE** | Guarantee stacking maximizes risk reversal? | [ ] |
| **BIG** | Value presentation amplifies transformation? | [ ] |

**NESB Total Score**: N___/10 E___/10 S___/10 B___/10 = ___/40

**Minimum passing**: 28/40 (7 avg) | **Strong**: 32/40 (8 avg)

**If any trigger scores below 7, strengthen before launching.**

---

#### Section 12.6: Five Drivers Audit (Blair Warren Framework)

**Verify all five psychological drivers are addressed somewhere on the page:**

| Driver | Present? | Location | Strength (1-10) |
|--------|----------|----------|-----------------|
| **Encourage Dreams** | [ ] Yes [ ] No | _____________ | ___ |
| **Justify Failures** | [ ] Yes [ ] No | _____________ | ___ |
| **Allay Fears** | [ ] Yes [ ] No | _____________ | ___ |
| **Confirm Suspicions** | [ ] Yes [ ] No | _____________ | ___ |
| **Throw Rocks at Enemies** | [ ] Yes [ ] No | _____________ | ___ |

**Five Drivers Minimum**: At least 4 of 5 drivers should be present.

---

#### Section 13: Design System Implementation
**Visual Design**:
- **Color Palette**: Primary colors for CTAs, semantic colors for trust badges
- **Typography**: Headline hierarchy (H1→H6), body text (readable line-height 1.5)
- **Components**: Buttons, cards, testimonial components from design system
- **Spacing**: Consistent use of spacing scale

**Mobile-First**:
- Touch targets 44x44px minimum
- Responsive typography (clamp or breakpoints)
- Simplified navigation
- Fast loading (lazy load images, optimize fonts)

---

#### Section 14: Mobile-First Design
- Touch targets 44x44px minimum
- CTA in thumb zone (bottom 50% of screen)
- Responsive typography (clamp or breakpoints)
- Simplified navigation (hamburger menu)
- Fast loading (<3s on 3G)
- Lazy load images below fold
- Optimize fonts (font-display: swap)

---

#### Section 15: A/B Testing Opportunities

**Priority Tests**:
1. **Headline variants** (benefit vs. curiosity vs. specific result)
2. **CTA copy** (outcome-based variants)
3. **Hero image** (product shot vs. illustration vs. video)
4. **Social proof placement** (above vs. below fold)
5. **Form length** (email only vs. name + email)
6. **Price anchoring** (with vs. without comparison)

---

## **Phase E: Implementation & Scaffolding (Magic UI)**

### Phase D — Template Selection & Adaptation
**Goal:** Accelerate development by selecting the optimal Magic UI template that matches the project archetype.

1) **Analyze Project Archetype**: Check `docs/stack-profile.json` and PRD context.
   - SaaS (B2B)
   - AI Agent / Automation
   - Mobile App
   - Developer Tool
   - Content / Media
   - Personal Brand

2) **Review Magic UI Templates Inventory**:
   - **`agent-template-`**: Perfect for AI agents, chatbots, and automation tools.
     - Features: Modern dark mode, sleek animations, bento grids.
   - **`startup-template`**: Ideal for general B2B SaaS and startups.
     - Features: Clean corporate look, pricing tables, feature sections.
   - **`mobile-template-`**: Best for iOS/Android app landing pages.
     - Features: App store buttons, device mockups, feature highlights.
   - **`devtool-template`**: Tailored for developer tools, APIs, and CLI products.
     - Features: Code blocks, documentation focus, technical aesthetic.
   - **`portfolio`**: For personal branding and service providers.
   - **`blog-template`**: For content-heavy sites and newsletters.

3) **Recommend Best-Fit Template**:
   - Suggest the template that minimizes custom code.
   - Explain WHY it fits (e.g., "The Agent template has built-in bento grids perfect for your feature set").

4) **Map Copy Sections to Template Components**:
   - Hero Copy → `HeroSection` component
   - Features → `BentoGrid` or `FeatureSection` component
   - Pricing → `PricingSection` component
   - CTA → `CTASection` component

---
**>>> CHECKPOINT: PHASE E1 — TEMPLATE MAPPING APPROVAL <<<**

Present recommended template, component mapping, and copy-to-component alignment to the user.
**Do NOT continue to scaffolding until the user explicitly approves.**

Reply `approve template` or `revise: [feedback]`.
---

---

### Phase E — Scaffolding Plan
**Goal:** Define the execution plan to copy and adapt the template components.

1) **Source Identification**:
   - Locate source folder: `.cursor/commands/Magic UI/[selected-template]/src/components`
   - Identify shared UI components needed (`magicui/`, `ui/`).

2) **Target Mapping**:
   - Define destination: `components/landing/` (or project specific path).
   - List files to copy.

3) **Design System Injection**:
   - Plan updates to `tailwind.config.ts` to match Step-4 colors.
   - Ensure fonts match `docs/design/TYPOGRAPHY.md`.

---
**>>> CHECKPOINT: PHASE E2 — SCAFFOLDING APPROVAL <<<**

Present scaffolding plan (source files, target directory, design system injection) to the user.
**Do NOT continue to file assembly until the user explicitly approves.**

Reply `approve scaffold` or `revise: [feedback]`.
---

### Monorepo Deployment Note (If Applicable)

If Step 1 selected a **monorepo structure**, the landing page should be deployed from the correct app:

| Structure | Landing Page Location | Deployment |
|-----------|----------------------|------------|
| **Single repo** | `src/app/(marketing)/` | Standard Vercel deploy |
| **Monorepo (Turborepo)** | `apps/web/app/(marketing)/` | Vercel with `apps/web` as root |
| **Monorepo (Nx)** | `apps/marketing/` or `apps/web/` | Vercel or Nx Cloud |

**Vercel Monorepo Config** (`apps/web/vercel.json`):
```json
{
  "installCommand": "pnpm install --filter=web...",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web"
}
```

> **📚 Monorepo Reference:** See `/src/foundation-skills/monorepo-architecture.md` for detailed deployment patterns.

---

### Phase F — Assemble the Landing Page (paste back + write files)
**Landing Page Document:**
1) Page Structure Overview (conversion goal, target audience)
2) Hero Section (headline, CTA, social proof)
3) Problem Agitation (pain points, emotional connection)
4) Solution Introduction (value prop, USP, benefits)
5) Features & Benefits (translate technical specs)
6) Social Proof (testimonials, logos, stats)
7) How It Works (3 simple steps)
8) Objection Handling (FAQ)
9) Risk Reversal (guarantee)
10) Pricing & Offer Stack
11) Urgency & Scarcity (if real)
12) Final CTA
13) **Cialdini's 7 Principles Audit** (checklist)
14) Design System Implementation (colors, typography, components, mobile)
15) A/B Testing Opportunities
16) **Template Selection & Component Mapping**

**Sources:** link to `/docs/research/LANDING-SOURCES-${TODAY}.md`

**Files to create/update**
- `/docs/landing-page/LANDING-PAGE.md` (complete landing page framework)
- `/docs/landing-page/HERO-SECTION.md` (hero copy with variants for A/B testing)
- `/docs/landing-page/VALUE-PROPOSITION.md` (value prop canvas)
- `/docs/avatars/PROBLEM-AWARE-AVATAR.md` (detailed avatar from Part 1)
- `/docs/avatars/DIARY-ENTRIES.md` (emotional diary entries from Part 2)
- `/docs/landing-page/FEATURES-TO-BENEFITS.md` (technical spec translation)
- `/docs/landing-page/SOCIAL-PROOF.md` (testimonials, case studies)
- `/docs/landing-page/OBJECTION-HANDLING.md` (FAQ-style objection responses)
- `/docs/landing-page/CTA-VARIANTS.md` (A/B testing variants for CTAs)
- `/docs/landing-page/TEMPLATE-MAPPING.md` (component mapping for Magic UI)
- `/docs/landing-page/CIALDINI-AUDIT.md` (7 principles verification)
- `/docs/research/LANDING-SOURCES-${TODAY}.md` (from Phase A1)

**Quality gates (must pass)**
- **Problem Aware avatar** is 1000+ words with deep psychology.
- **Diary entries** use first-person voice and emotional language.
- **Features are translated** into benefits, emotional impact, AND **Value Equation tags** [DO][PL][TD][ES].
- **Social proof** addresses specific objections.
- **CTAs** are outcome-based ([Action] + [Outcome] + [Time]), NOT "Submit", "Sign Up" alone.
- **Objection FAQ** has 10-12 items (8 core + 2-4 persona-specific).
- **Price Anchoring** calculated (4 alternatives: Not Solving, DIY, Hire, Competitor).
- **2-step opt-in** pattern specified for cold traffic.
- **Fast win** delivery specified (≤120 sec post-opt-in).
- **Cialdini's 7 Principles** audit completed (all 7 addressed).
- **Design system** colors, typography, and components are specified.
- **Mobile-first** design is detailed.
- **A/B testing** opportunities are identified.
- **Magic UI Template** selected and mapped to copy.

**Heuristics Checklist (Hormozi + Cialdini Method)** - Self-verify before finalizing:
- [ ] **Readability**: All customer-facing copy targets F-K grade 5-8?
  - Use Hemingway Editor (hemingwayapp.com) or F-K calculator
  - **F-K Score Calculator** (Node.js):
  ```javascript
  import { syllable } from 'syllable';
  const fk = (text) => {
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).length;
    const words = (text.match(/\w+/g) || []).length;
    const syllables = (text.match(/\w+/g) || []).reduce((s,w)=>s+syllable(w),0);
    return 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59;
  };
  // Target: 5-8 for landing page copy
  // Actual F-K score: ____ (must document)
  ```
- [ ] **Value Equation**: Every feature bullet tagged with [DO][PL][TD][ES]?
- [ ] **Above-the-fold**: Promise + social proof + outcome-based CTA visible?
- [ ] **Fast Win**: ≤120 sec post-opt-in value specified?
- [ ] **CTAs**: All buttons state outcomes, not actions? (e.g., "Get [Outcome]" vs. "Submit")
- [ ] **Forms**: Minimal fields (2-step opt-in for cold traffic, name + email max)?
- [ ] **Price Anchor**: Largest believable alternative identified and displayed?
- [ ] **Offer Stack**: Bonuses with $ value anchors showing "money at a discount"?
- [ ] **Urgency**: Real (cohort dates, seat limits), not fake timers?
- [ ] **Objections**: 8 core + 2-4 persona-specific = 10-12 total?
- [ ] **Contrast**: WCAG AA passed (4.5:1 text, 3:1 UI)?
- [ ] **Cialdini #1 (Reciprocity)**: Free value before ask?
- [ ] **Cialdini #2 (Commitment)**: Small yes before big yes?
- [ ] **Cialdini #3 (Social Proof)**: Users, testimonials, logos visible?
- [ ] **Cialdini #4 (Authority)**: Badges, media, credentials shown?
- [ ] **Cialdini #5 (Liking)**: Personality, founder story, relatability?
- [ ] **Cialdini #6 (Scarcity)**: Real urgency only (no fake timers)?
- [ ] **Cialdini #7 (Unity)**: Shared identity language ("Built for founders")?

**Pass/Fail Notes**:
- ✅ Passed: [list items that passed, e.g., "All CTAs outcome-based, F-K score: 6.2, All 7 Cialdini principles addressed"]
- ❌ Failed: [list items needing fixes, e.g., "Hero CTA says 'Sign Up' instead of outcome, Missing Unity principle"]

---

## Final Review Gate

**All outputs for this step:**
- [ ] `/docs/avatars/PROBLEM-AWARE-AVATAR.md` created
- [ ] `/docs/avatars/DIARY-ENTRIES.md` created
- [ ] `/docs/landing-page/LANDING-PAGE.md` created
- [ ] `/docs/landing-page/HERO-SECTION.md` created
- [ ] `/docs/landing-page/VALUE-PROPOSITION.md` created
- [ ] `/docs/landing-page/SOCIAL-PROOF.md` created
- [ ] `/docs/landing-page/OBJECTION-HANDLING.md` created
- [ ] `/docs/landing-page/CTA-VARIANTS.md` created
- [ ] `/docs/landing-page/TEMPLATE-MAPPING.md` created
- [ ] `/docs/landing-page/CIALDINI-AUDIT.md` created
- [ ] `/docs/research/LANDING-SOURCES-${TODAY}.md` created
- [ ] All phases (A-E) completed with user approval

**>>> FINAL CHECKPOINT: STEP 9 COMPLETE <<<**
**Do NOT proceed to Step 10 without explicit approval.**

---

## Fallback Micro-Roles (only used if specific expertise is missing)
- **Customer Research**: Eugene Schwartz's 5 Stages; JTBD; pain point analysis; emotional profiling.
- **Conversion Copywriting**: PAS (Problem-Agitation-Solution); PASO; BAB; 4Ps; StoryBrand; AIDA; value proposition canvas; Fogg Model.
- **Persuasion Psychology**: Cialdini's 7 Principles (Reciprocity, Commitment, Social Proof, Authority, Liking, Scarcity, Unity).
- **CRO Tactics**: Trust signals; social proof; risk reversal; urgency/scarcity; friction analysis.
- **Emotional Storytelling**: Diary writing; visceral language; psychological authenticity; empathy building.
- **Landing Page Design**: Above-the-fold optimization; CTA placement; visual hierarchy; F-pattern/Z-pattern; mobile-first.
- **Visual Persuasion**: Color psychology; eye-tracking patterns; contrast optimization.

---

<verification>
## Step 7 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Avatar Document | /docs/marketing/AVATAR.md OR /docs/avatars/*.md | 1KB | 5 |
| Emotional Diary | /docs/marketing/EMOTIONAL-DIARY.md | 1KB | 5 |
| Landing Copy | /docs/landing-page/LANDING-COPY.md | 2KB | 5 |
| Landing Page Code | /app/(marketing)/page.tsx OR similar | 500B | 5 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| AVATAR.md | ## Demographics | 4 |
| AVATAR.md | ## Pain Points | 5 |
| AVATAR.md | ## Goals & Desires | 4 |
| EMOTIONAL-DIARY.md | ## Morning Entry | 4 |
| EMOTIONAL-DIARY.md | ## Key Frustrations | 4 |
| LANDING-COPY.md | ## Hero Section | 5 |
| LANDING-COPY.md | ## Social Proof | 4 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:LANDING-COPY.md:CTA.*Get\|Start\|See | Outcome-based CTAs | 6 |
| has_pattern:LANDING-COPY.md:testimonial\|proof\|trust | Social proof elements | 5 |
| has_pattern:LANDING-COPY.md:Scarcity\|Reciprocity\|Authority | Cialdini principles applied | 6 |
| has_pattern:AVATAR.md:frustrat\|pain\|struggle | Pain points documented | 5 |
| has_pattern:EMOTIONAL-DIARY.md:feel\|emotion\|frustrat | Emotional language present | 4 |
| word_count:LANDING-COPY.md:500 | Substantial copy content | 4 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Avatar Approved | AVATAR.md has detailed persona | 5 |
| Copy Approved | LANDING-COPY.md has all sections | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| Cialdini Applied | At least 4 principles documented | 4 |
| Above-the-Fold | Hero section optimized | 3 |
| Mobile Ready | Responsive considerations documented | 3 |

</verification>

