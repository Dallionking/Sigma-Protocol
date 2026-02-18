---
version: "2.5.0"
last_updated: "2026-01-07"
changelog:
  - "2.5.0: Added react-performance.md reference in animation implementation checklist"
  - "2.4.0: Added SwiftUI Design Tokens format (Swift DesignTokens struct with Colors, Typography, Spacing, Radius, Shadows, Motion)"
  - "2.3.2: Added App Shell layout guardrails (wide vs narrow containers, sidebar width rules, dashboard grid patterns, surface layering checks) to prevent narrow/flat dashboards"
description: "Step 6: Design System & Style Guide - Visual specifications with tokens, components, and accessibility standards"
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
  - mcp_21st-devmagic_21st_magic_component_builder

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_firecrawl_firecrawl_search
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --theme
---

# /step-6-design-system — Design System & Style Guide Creation (Senior Design Systems Architect + $1B Valuation Context)

**Mission**  
Run a complete, interactive **Step-4: Design System → Visual Specifications** for a startup project in one go. 
**Valuation Context:** You are a **Senior Design Systems Architect at a FAANG Company**. Your design system must be **scalable, accessible, and visually stunning**. It is the foundation of a **premium product**.

**Perceived Value Principle:**
The UI must *look* expensive to justify "Grand Slam Pricing".
- **High Trust**: Professional typography, consistent spacing.
- **High Status**: "Expensive" whitespace, subtle shadows, refined motion.

---

<goal>
You are a Senior Design Systems Architect at a FAANG company. Execute ALL phases (A through I) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| A0 | Extract Tokens from Wireframe Prototypes | Tokens extracted from Step 5 |
| A | Design System Research | Research findings |
| B | Color System | Color tokens and palettes |
| C | Typography System | Type scale and font pairings |
| D | Spacing & Layout | Spacing scale and grid system |
| E | Component Library | Component catalog |
| F | Icons & Imagery | Icon and image guidelines |
| G | Effects Layer | Hover depth, border effects |
| H | Motion & Animation | Animation principles |
| I | Animation Quality Framework | Implementation patterns |
| J | Design Tokens | Token documentation |
| K | Assemble Design System | DESIGN-SYSTEM.md file |

Final Outputs: /docs/design/DESIGN-SYSTEM.md
Quality gate: Professional, accessible, scalable design system (80+/100 score)
</goal>

---

## BOILERPLATE THEMING (NEW - If Using SSS Boilerplate)

**If your project uses an SSS boilerplate, the design system EXTENDS (not replaces) the foundation.**

### Detection

```bash
# Check for boilerplate
cat .sigma/boilerplate.json 2>/dev/null
```

### If Boilerplate Detected

**The boilerplate provides:**
- Base CSS variables in `src/app/globals.css`
- shadcn/ui components in `src/components/ui/`
- Theme toggle (light/dark) in `src/components/providers/`
- Neutral color palette (intentionally bland for customization)

**Your job in Step 6:**
- **Override CSS variables** with your brand colors
- **Define brand tokens** (don't recreate base UI)
- **Add custom components** to `src/components/[project]/`
- **Extend, don't modify** boilerplate files

### Brand Token Override Pattern

```css
/* src/app/globals.css - AFTER boilerplate defaults */

:root {
  /* ═══════════════════════════════════════════════════
   * BRAND OVERRIDES (Step 6 Design System)
   * ═══════════════════════════════════════════════════ */
  
  /* Primary - Your brand color */
  --primary: 220 90% 56%;           /* Blue example */
  --primary-foreground: 0 0% 100%;
  
  /* Accent - Secondary brand color */
  --accent: 280 65% 60%;            /* Purple example */
  --accent-foreground: 0 0% 100%;
  
  /* Custom semantic colors */
  --brand: 220 90% 56%;
  --brand-subtle: 220 90% 96%;
}

.dark {
  /* Dark mode brand overrides */
  --primary: 220 90% 65%;
  --primary-foreground: 0 0% 100%;
}
```

### Font Override Pattern

```tsx
// src/app/layout.tsx - Replace font import

// BEFORE (boilerplate default):
import { GeistSans } from "geist/font/sans";

// AFTER (your brand font):
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

### What NOT to Modify in Boilerplate

| File | Why |
|------|-----|
| `components/ui/button.tsx` | shadcn managed - use variants instead |
| `components/ui/input.tsx` | shadcn managed |
| `lib/supabase/*` | Core infrastructure |
| `.cursor/commands/*` | SSS methodology |

### What TO Create

| File | Purpose |
|------|---------|
| `components/[project]/logo.tsx` | Your brand logo |
| `components/[project]/brand-button.tsx` | Branded button wrapper |
| `components/[project]/hero.tsx` | Custom hero section |
| `public/fonts/*` | Custom brand fonts |

---
**>>> CHECKPOINT: BOILERPLATE THEMING APPROVAL <<<**

Present the boilerplate extension approach and brand token override plan to the user.
**Do NOT continue to Phase A (Design System Research) until the user explicitly approves.**

Reply `confirm extend` to continue with boilerplate theming, or `custom system` to build from scratch.
---

---

## EMOTIONAL DESIGN FRAMEWORKS (MANDATORY APPLICATION)

### The Craft Philosophy: "Less, But Better"
**Our design system must NOT produce generic AI slop.** Every token, component, and pattern must be crafted with intention. The system itself should embody the emotion we want users to feel.

### Framework 1: Dieter Rams' 10 Principles of Good Design
Apply these to EVERY design decision:

| Principle | Application to Design System |
|-----------|------------------------------|
| **1. Innovative** | Push boundaries purposefully—don't just copy Material/Tailwind defaults |
| **2. Useful** | Every component solves a real problem; no bloat |
| **3. Aesthetic** | Beautiful in simplicity—pleasing proportions, harmony |
| **4. Understandable** | Self-explanatory components; clear naming; obvious usage |
| **5. Unobtrusive** | Serves the content/user, not the designer's ego |
| **6. Honest** | No dark patterns; authentic, not manipulative |
| **7. Long-lasting** | Timeless, not trendy; avoid fads that date quickly |
| **8. Thorough** | Every detail considered—down to focus states and edge cases |
| **9. Environmentally friendly** | Performance-conscious; minimal CSS; no waste |
| **10. As little design as possible** | Back to purity; remove everything non-essential |

**The Rams Mantra:** *"Weniger, aber besser"* (Less, but better)

### Framework 2: The Three Levels Applied to Design Systems

| Level | Design System Application | Quality Check |
|-------|---------------------------|---------------|
| **Visceral** | Colors evoke right emotion; typography feels premium; spacing creates calm | "Does seeing this palette/type make me feel [intended emotion]?" |
| **Behavioral** | Components work flawlessly; states are clear; feedback is instant | "Does every component feel responsive and reliable?" |
| **Reflective** | System tells a story; has personality; creates brand recognition | "Would users recognize this product by its design alone?" |

### Framework 3: Perceived Value Through Visual Design
**Premium UI signals that justify premium pricing:**

| Element | Cheap/Generic | Premium/Crafted |
|---------|---------------|-----------------|
| **Typography** | System fonts, inconsistent sizes | Carefully chosen fonts, modular scale, perfect line heights |
| **Spacing** | Random px values, cramped | Mathematical scale (8px base), generous whitespace |
| **Colors** | Pure RGB, harsh contrasts | Sophisticated palettes, subtle gradients, considered neutrals |
| **Shadows** | Drop shadows everywhere | Subtle, layered shadows that create depth |
| **Borders** | 1px solid everywhere | Thoughtful use; sometimes none; subtle dividers |
| **Motion** | Jarring or none | Smooth, physics-based, purposeful |
| **Icons** | Mixed sources, inconsistent | Unified style, consistent stroke width, balanced optical weight |

### Framework 4: Jony Ive on Visual Design
**Key Principles:**

> "Just because something is uncluttered doesn't mean it's good. It can be cold, it can be soulless. Minimalism isn't about less—it's about clarity, about revealing what's essential and true."

**Application:**
- **Clarity over minimalism** — Remove clutter, but keep warmth
- **Every pixel intentional** — If you can't justify it, remove it
- **Materials matter** — Color, typography, spacing ARE the "materials" of digital design
- **Care is visible** — Users can feel when something is crafted vs. assembled

### Framework 5: Linear/Stripe/Vercel Design DNA
What makes these design systems special:

| Company | Design DNA | What to Steal |
|---------|------------|---------------|
| **Linear** | Speed + craft; dark mode as default; keyboard-first | Monospace accents, depth layers, animation timing |
| **Stripe** | Information density done right; gradients that work | Mesh gradients, documentation clarity, code-as-design |
| **Vercel** | Stark minimalism with moments of delight | Geist font, black/white courage, purposeful animation |
| **Notion** | Warmth + flexibility; playful empty states | Personality in microcopy, emoji-as-design, inviting neutrals |
| **Figma** | Collaborative DNA baked in; real-time feedback | Multiplayer indicators, presence design, contextual UI |

### Framework 6: Typography as Emotion
Typography is 90% of design. Choose fonts that **evoke the right feeling**:

| Emotion Wanted | Font Characteristics | Examples |
|----------------|---------------------|----------|
| **Trust/Professional** | Clean sans-serif, balanced x-height | Inter, SF Pro, Söhne |
| **Modern/Tech** | Geometric sans, monospace accents | Geist, Space Grotesk, JetBrains Mono |
| **Warm/Approachable** | Rounded corners, open counters | Nunito, Poppins, Plus Jakarta Sans |
| **Premium/Luxury** | High contrast serif, refined details | Playfair Display, Editorial New |
| **Bold/Confident** | Heavy weights, tight tracking | Clash Display, Cabinet Grotesk |

*(Typography quality checks are in the Emotional Design Quality Gates below and Phase C specifications.)*

### Framework 7: Color Psychology in UI

| Color | Emotion/Association | UI Usage |
|-------|---------------------|----------|
| **Blue** | Trust, calm, professional | Primary actions, links, information |
| **Green** | Success, growth, safety | Success states, positive actions, money |
| **Red** | Urgency, error, danger | Errors, destructive actions, alerts |
| **Yellow/Orange** | Warning, energy, attention | Warnings, highlights, notifications |
| **Purple** | Premium, creative, wisdom | Upgrade prompts, creative tools |
| **Neutral/Gray** | Professional, balanced | Text, borders, backgrounds |

*(Color quality checks are in the Emotional Design Quality Gates below and Phase B specifications.)*

### Emotional Design Quality Gates for Design System
Before finalizing ANY design system, verify:

- [ ] **Dieter Rams check**: Is this as little design as possible while being complete?
- [ ] **Visceral check**: Does the palette/typography evoke the intended emotion?
- [ ] **Craft check**: Does every token feel considered, not generated?
- [ ] **Premium check**: Would this design system justify $100+/month pricing?
- [ ] **Personality check**: Can you describe the "character" of this system?
- [ ] **Consistency check**: Is there a clear, mathematical logic to all values?
- [ ] **Timelessness check**: Will this look dated in 2 years? (If yes, simplify)

---

This command:
- Builds on the UX Spec from Step-3 with **current-year design research**.
- Invokes **FAANG-level specialist personas** (Design Systems Architect/Visual Designer/Accessibility/Performance).
- Works even if MCP search tools aren't configured (falls back to Cursor's web browsing).
- Produces development-ready **Design System** and a comprehensive **/docs pack**, with **human-in-the-loop** checkpoints.
- **Hard-stops for your approval** before Step-7 (Interface States).

---

## Preflight (auto)
1) **Get date**: run `date +"%Y-%m-%d"` and capture `TODAY`, and derive `YEAR`.  
2) **Detect research tools** (preferred → fallback):
   - If an MCP search tool exists (e.g., `firecrawl`, `exa`, `ref`, `greptile`), prefer it.
   - Else, use Cursor's web browsing.
3) **Create folders (idempotent)** if missing:
   - `/docs/design`, `/docs/components`, `/docs/tokens`, `/docs/research`
4) **Read UI Profile (required)**:
   - Read: `/docs/design/UI-PROFILE.md`
   - Read: `/docs/design/ui-profile.json`
   - If missing: **STOP** and run Step 3 UI Profile Selection first.
5) **Writing policy**: For large files, **write in small chunks** to avoid editor limits.

---

## Planning & Task Creation (CRITICAL - DO THIS FIRST)

**Before executing anything, you MUST:**

1. **Analyze Requirements**: Review UX Spec, brand guidelines, understand design scope
2. **Create Task List**: Generate comprehensive task list with checkboxes
3. **Present Plan**: Show the user your complete design system plan
4. **Get Approval**: Wait for user to approve the plan before executing

**Task List Format** (create at the start):
```markdown
## Step-6 Design System Development Plan

### Phase A: Design System Research
- [ ] Build YEAR-aware queries (design tokens, color systems, typography scales)
- [ ] Execute MCP search for 5-10 sources
- [ ] Write `/docs/research/DESIGN-SOURCES-${TODAY}.md`
- [ ] CHECKPOINT: Present research
- [ ] Wait for approval

### Phase B: Color System
- [ ] Design primary brand colors (3-4 shades each, 50-950 scale)
- [ ] Define semantic colors (success, warning, error, info)
- [ ] Create neutral palette (grayscale for text, backgrounds, borders)
- [ ] Design dark mode (if applicable)
- [ ] Validate WCAG contrast ratios (4.5:1 text, 3:1 UI)
- [ ] Test color-blind simulation
- [ ] CHECKPOINT: Present color system
- [ ] Wait for approval

### Phase C: Typography System
- [ ] Select font families with fallback stacks
- [ ] Define type scale (modular scale or ratio-based)
- [ ] Specify font weights (400, 500, 600, 700, 800)
- [ ] Map hierarchy (H1-H6, body, button, caption)
- [ ] Plan responsive typography
- [ ] CHECKPOINT: Present typography system
- [ ] Wait for approval

### Phase D: Spacing & Layout
- [ ] Define spacing scale (4px or 8px base with consistent intervals)
- [ ] Specify grid system (12-column with responsive gutters)
- [ ] Define breakpoints (640, 768, 1024, 1280, 1536)
- [ ] Create z-index scale (0, 10, 20, 30, 40, 50, 60, 70)
- [ ] CHECKPOINT: Present spacing & layout
- [ ] Wait for approval

### Phase E: Component Library
- [ ] Define atomic design structure (atoms/molecules/organisms)
- [ ] Specify core components with variants (Button, Input, Select, etc.)
- [ ] Document component props and states
- [ ] Define accessibility requirements per component
- [ ] CHECKPOINT: Present component library
- [ ] Wait for approval

### Phase F: Icons & Imagery
- [ ] Select icon system (Lucide, Heroicons, Phosphor)
- [ ] Define icon sizes (16, 20, 24, 32px)
- [ ] Specify image treatment (border radius, aspect ratios)
- [ ] CHECKPOINT: Present icons & imagery
- [ ] Wait for approval

### Phase F.5: Effects Layer (Cool, Not Toy) ⭐ NEW
- [ ] Read UI Profile cool layer settings (on/off) and motion intensity
- [ ] Define **Hover Depth** spec (subtle lift + shadow/border lift)
- [ ] Define **Border Beam / Focus Trail** spec (hover/focus only for professional profiles)
- [ ] Define apply-to allow-list (interactive cards, CTAs, inputs only)
- [ ] Define reduced-motion fallback (beam → border lift)
- [ ] CHECKPOINT: Present effects layer rules
- [ ] Wait for approval

### Phase G: Motion & Animation
- [ ] Define easing functions and durations
- [ ] Specify component animations
- [ ] Plan GPU-accelerated properties
- [ ] Include prefers-reduced-motion support
- [ ] CHECKPOINT: Present motion system
- [ ] Wait for approval

### Phase H: Design Tokens
- [ ] Structure tokens (CSS variables, JSON)
- [ ] Export for platforms (web, React Native, iOS, Android)
- [ ] Plan theming support (light/dark)
- [ ] CHECKPOINT: Present design tokens
- [ ] Wait for approval

### Phase I: Document Assembly & File Creation
- [ ] Write `/docs/design/DESIGN-SYSTEM.md`
- [ ] Write `/docs/design/TOKENS.md` (color, typography, spacing tokens)
- [ ] Write `/docs/design/COMPONENTS.md` (component library with atoms, molecules, organisms)
- [ ] Write `/docs/design/MOTION.md` (animation system)
- [ ] Write `/docs/design/ICONS.md` (icon system)
- [ ] Verify all quality gates pass
- [ ] FINAL checkpoint: Present complete design system
- [ ] Wait for final approval
```

**Execution Rules**:
- ✅ Check off EACH task as you complete it
- ✅ Do NOT skip ahead - complete tasks in order
- ✅ Do NOT proceed to next phase until user approves
- ✅ Use MCP search for research
- ✅ Take notes to maintain context
- ✅ Write files in small chunks

---

## Inputs to capture (ask, then echo back as a table)
- UX Spec from Step-3 (path to `/docs/ux/UX-DESIGN.md`)
- UI Profile from Step-3 (read `/docs/design/UI-PROFILE.md` and `/docs/design/ui-profile.json`)
- Brand guidelines (if any existing: colors, fonts, logo, voice)
- Design inspiration (similar products, style preferences)
- Accessibility requirements (WCAG level, contrast needs)
- Platform targets (web, iOS, Android - affects component library)
- Performance constraints (bundle size, animation budget)
- Optional: `detail:deep` to expand sections

> Ground rules: If any item is unknown, ask concise HITL questions now and proceed with clearly flagged assumptions.

---

## Persona Pack (used throughout)
- **Senior Design Systems Architect (FAANG)** – **atomic design** (atoms/molecules/organisms), **design tokens** (CSS variables, JSON), component documentation, **Figma** integration, version control.
- **Visual Designer (Brand)** – color theory, typography hierarchy, **golden ratio** layout, visual balance, brand personality, **emotional design**.
- **Accessibility Designer** – **WCAG 2.2** contrast ratios (4.5:1 text, 3:1 UI), color-blind testing, reduced motion, **high contrast mode**, semantic HTML.
- **Performance Designer** – CSS optimization, **critical CSS**, bundle size, **lazy loading**, **font loading** strategy (FOUT vs. FOIT), animation performance (60fps, GPU acceleration).
- **Component Engineer** – **Storybook** setup, component API design, **prop types**, variant management, **composition patterns**, **design-to-code** handoff.
- **Research Analyst** – time-boxed web/MCP research (current-year aware), design system trends, component libraries, source curation.

> Tone: systematic, visual, implementation-focused. Cite sources in `/docs/research/DESIGN-SOURCES-${TODAY}.md`. Use YEAR in recency filters.

---


---

## Phase A0 — Extract Tokens from Wireframe Prototypes (If Step 5 Completed)

**Goal:** Use wireframe prototype designs as the foundation for the design system, rather than creating from scratch.

**When to Run:** If Step 5 (Wireframe Prototypes) was completed. If skipped, proceed directly to Phase A.

### Step 1: Verify Wireframe Outputs Exist

Check for these files from Step 5:
- `/docs/wireframes/PROTOTYPE-SUMMARY.md`
- `/docs/wireframes/screen-prds/` (directory with screen PRDs)
- `/wireframes/` or `/wireframes-mobile/` (runnable prototype)

If files don't exist, skip to Phase A (traditional design system creation).

### Step 2: Read Wireframe Documentation

1. **Read PROTOTYPE-SUMMARY.md:**
   - Extract color palette (primary, secondary, accent, neutral, semantic)
   - Extract typography (font families, sizes, weights, line heights)
   - Extract spacing scale
   - Extract border radius values
   - Extract shadow definitions
   - Extract component patterns from Component Inventory section

2. **Review Wireframe Components:**
   - Browse `/wireframes/src/components/` (web) or `/wireframes-mobile/components/` (mobile)
   - List all components found
   - Note variants and states implemented
   - Identify priority components

3. **Review Screen PRDs:**
   - Read `/docs/wireframes/screen-prds/*.md` for design token decisions
   - Note any design constraints or requirements

### Step 3: Create Preliminary Token Set

Based on wireframe outputs, create initial design tokens:

**File:** `/docs/tokens/WIREFRAME-TOKENS-PRELIMINARY.md`

```markdown
# Preliminary Design Tokens (From Wireframes)

**Date:** [Date]  
**Source:** Step 5 Wireframe Prototypes

---

## Color Tokens (From Wireframes)

### Primary Colors
**Base Color:** `#[HEX]` (extracted from wireframes)
**Scale to Generate:** primary-50 through primary-950 (calculate tints/shades from base)
[Repeat for Secondary, Accent, Neutral, Semantic colors]

---

## Typography Tokens (From Wireframes)
- **Fonts:** Display/Heading: [Font], Body: [Font], Monospace: [Font or default]
- **Sizes Found:** [List extracted sizes]
- **Scale to Generate:** Display Large/Medium, H1-H6, Body Large/Medium/Small, Caption

---

## Spacing Tokens (From Wireframes)
**Values Found:** [List px values from wireframes]
**Scale to Generate:** 0-24 (0px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px)

---

## Component Tokens (From Wireframes)
For each component (Button, Card, Input, etc.), extract:
- **Variants, Sizes, States** found in wireframes
- **Tokens to define:** height (sm/md/lg), padding-x, padding-y, border-radius
[Repeat for all components from PROTOTYPE-SUMMARY.md]

---

## Gaps & Missing Tokens

**Colors:**
- [ ] Full 50-950 scale for primary (wireframes only provided base)
- [ ] Full 50-950 scale for secondary
- [ ] Dark mode variants (if not in wireframes)

**Typography:**
- [ ] Additional font weights (if wireframes only used 400, 600)
- [ ] Responsive scaling (mobile vs desktop)
- [ ] Line height scale (if not fully specified)

**Spacing:**
- [ ] Larger spacing values (if wireframes only used up to 48px)
- [ ] Negative spacing (for overlaps, if needed)

**Components:**
- [ ] States not covered in wireframes (disabled, loading, etc.)
- [ ] Variants not covered (ghost buttons, etc.)

---

## Validation Notes

**WCAG Contrast:**
- [ ] Primary color contrast: [Ratio] (needs to be 4.5:1 for text)
- [ ] Secondary color contrast: [Ratio]
- [ ] Accent color contrast: [Ratio]

**Consistency:**
- [ ] Spacing values follow consistent scale
- [ ] Typography sizes follow modular scale
- [ ] Colors have sufficient tints/shades

---

## Next Steps

**Phase A (Design System Research):**
- Use wireframe tokens as starting point
- Fill gaps with research and calculations
- Expand to full 50-950 color scales
- Add missing component states
- Validate accessibility

**Phase B-F:**
- Build on wireframe foundation
- Expand rather than create from scratch
- Maintain visual consistency with wireframe designs
```

### Step 4: Identify Gaps to Fill

Compare wireframe tokens with complete design system requirements:

**Color Gaps:**
- Missing tints/shades (50, 100, 200, etc.)
- Dark mode variants
- Semantic color full scales

**Typography Gaps:**
- Missing font weights
- Responsive scaling
- Additional sizes for edge cases

**Spacing Gaps:**
- Larger values for layouts
- Negative spacing (if needed)

**Component Gaps:**
- Missing states (disabled, loading, error)
- Missing variants (ghost, outline, etc.)
- Missing sizes (xs, 2xl, etc.)

### Step 5: Strategy for Phase A

**Modified Approach:**
- Phase A (Research): Focus on filling gaps, not creating from scratch
- Use wireframes as "design truth" - research validates/expands it
- Maintain visual consistency with wireframe designs
- Expand color scales using color theory
- Add missing component states using best practices

---
**>>> CHECKPOINT: PHASE A0 APPROVAL <<<**

Present wireframe-extracted tokens and gaps to the user.
**Do NOT continue to Phase A until the user explicitly approves.**

Reply `approve a0` or `revise: [feedback]`.
---

## Phase A — Design System Research (current-year aware)
**Goal:** Ground design decisions in current best practices, design trends, and proven component libraries.

1) Build YEAR-aware queries (e.g., "design system trends {YEAR}", "color theory accessibility {YEAR}", "typography scale {YEAR}", "component library best practices {YEAR}", "design tokens {YEAR}").  
2) Run **MCP search** if available; else use web browsing.  
3) Capture **5–10 sources** with titles, dates, and permalinks; group by topic:
   - Design system architecture (atomic design, tokens, versioning)
   - Color systems (accessibility, palettes, semantic colors)
   - Typography scales (modular scale, responsive type)
   - Component patterns (shadcn/ui, Radix UI, headlessUI)
   - Design-to-code workflows (Figma Tokens, Style Dictionary)
4) Write `/docs/research/DESIGN-SOURCES-${TODAY}.md` with a 1-page **Research Summary** and a bulleted **Source List** (title, URL, date seen).

---
**>>> CHECKPOINT: PHASE A APPROVAL <<<**

Present design system research findings and sources to the user.
**Do NOT continue to Phase B until the user explicitly approves.**

Reply `approve a` or `revise: [feedback]`.
---

---

## Phase B — Color System

### Profile-aware note (NEW)
Before choosing colors, read the UI Profile:
- **Satin Dark / Soft Depth**: near-black base + raised surfaces + hairline borders + subtle specular highlights (no glass by default).
- **Cool Professional**: neutral, trust-building palette; accents are minimal and earned.

1) **Primary brand colors** (3-4 shades each):
   - Primary color (core brand identity)
   - Primary-50 through Primary-950 (tints and shades)
   - Rationale for hue, saturation, lightness choices

2) **Semantic colors** (with WCAG contrast validation):
   - Success (green family, 4.5:1 on white)
   - Warning (yellow/orange family, 4.5:1 on white)
   - Error (red family, 4.5:1 on white)
   - Info (blue family, 4.5:1 on white)

3) **Neutral palette** (grayscale):
   - Gray-50 through Gray-950 (backgrounds, text, borders)
   - Text primary, secondary, tertiary (contrast ratios verified)
   - Border and divider colors

4) **Dark mode** (if applicable):
   - Inverted neutral palette
   - Adjusted semantic colors for dark backgrounds
   - Contrast validation for dark mode (WCAG)

5) **Accessibility validation**:
   - All text combinations meet 4.5:1 (AA) or 7:1 (AAA)
   - All UI components meet 3:1 contrast
   - Color-blind simulation (deuteranopia, protanopia, tritanopia)

---
**>>> CHECKPOINT: PHASE B APPROVAL <<<**

Present color system with palette and contrast ratios to the user.
**Do NOT continue to Phase C until the user explicitly approves.**

Reply `approve b` or `revise: [feedback]`.
---

---

## Phase C — Typography System
1) **Font families**:
   - Primary font (body, UI) with fallback stack
   - Display font (headings, marketing) if different
   - Monospace font (code, data)
   - Web font loading strategy (font-display: swap)

2) **Type scale** (modular scale or ratio-based):
   - Base size (16px = 1rem recommended)
   - Scale ratio (1.125, 1.2, 1.25, 1.333, 1.5, 1.618 golden ratio)
   - Sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
   - Line heights for readability (1.5 for body, 1.2 for headings)

3) **Font weights**:
   - Regular (400) for body text
   - Medium (500) for emphasis
   - Semibold (600) for subheadings
   - Bold (700) for headings
   - Extrabold (800) for display text

4) **Hierarchy mapping**:
   - H1 through H6 (sizes, weights, line heights)
   - Body Large, Body, Body Small
   - Button Large, Button, Button Small
   - Caption, Overline, Label

5) **Responsive typography**:
   - Mobile adjustments (smaller base size)
   - Tablet considerations
   - Desktop optimal sizes
   - Fluid typography (clamp for scaling)

---
**>>> CHECKPOINT: PHASE C APPROVAL <<<**

Present typography scale and hierarchy to the user.
**Do NOT continue to Phase D until the user explicitly approves.**

Reply `approve c` or `revise: [feedback]`.
---

---

## Phase D — Spacing & Layout
1) **Spacing scale** (consistent intervals):
   - Base unit (4px or 8px)
   - Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64
   - Mapped to rem units (0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16)

2) **Grid system**:
   - Container max-widths (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
   - Columns (12-column grid)
   - Gutter sizes (responsive: sm: 16px, md: 24px, lg: 32px)

3) **Breakpoints**:
   - Mobile: 640px
   - Tablet: 768px
   - Desktop: 1024px
   - Large: 1280px
   - XL: 1536px

4) **Z-index scale**:
   - Base: 0
   - Dropdown: 10
   - Sticky: 20
   - Fixed: 30
   - Modal backdrop: 40
   - Modal: 50
   - Popover: 60
   - Tooltip: 70

5) **App Shell layout guardrails** (CRITICAL — prevents “narrow/centered AI dashboards”):

**Rule: Do NOT use `container mx-auto` for app interior screens** (dashboards, tables, command centers, authenticated areas). Tailwind `container` is intended for **marketing/content** pages and will make app UIs feel “floating” on large screens.

**Use one of these wrappers instead** (and keep it consistent across the app):

- **App / Wide (default for dashboards + data-heavy pages)**:
  - `w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8`
- **Content / Narrow (forms, settings detail pages, docs-like pages)**:
  - `w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`

**Page spacing defaults** (map to UI Profile `density`):
- Compact: `py-4 space-y-4` (gap 16px)
- Comfortable: `py-6 space-y-6` (gap 24px)
- Spacious: `py-8 space-y-8` (gap 32px)

**Sidebar proportion rules**:
- Expanded sidebar width: **240–300px** (default: **280px**)
- Collapsed sidebar width: **48–64px** (default: **64px**)
- **Hard rule**: collapsing the sidebar must **increase main content width** (no fixed center column).

Example (CSS grid shell):
```tsx
<div className="grid grid-cols-[280px_1fr]">
  <aside className="border-r">...</aside>
  <main className="min-w-0">
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* page content */}
    </div>
  </main>
</div>
```

**Dashboard grid pattern** (cards scale 1 → 2 → 4 columns):
```tsx
<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card className="satin-card">...</Card>
  <Card className="satin-card">...</Card>
  <Card className="satin-card">...</Card>
  <Card className="satin-card">...</Card>
</section>
```

**Surface layering check** (contrast without heavy borders):
- App background uses **base** surface token.
- Cards/panels use **raised** surface token + hairline border (`--border-subtle`) and/or subtle shadow.
- Popovers/modals use **elevated** surface token.

---
**>>> CHECKPOINT: PHASE D APPROVAL <<<**

Present spacing system and grid to the user.
**Do NOT continue to Phase E until the user explicitly approves.**

Reply `approve d` or `revise: [feedback]`.
---

---

## Phase E — Component Library
1) **Atomic design structure**:
   - **Atoms**: Button, Input, Label, Icon, Avatar, Badge, Spinner
   - **Molecules**: Form Field (label + input + error), Search Bar, Dropdown Menu
   - **Organisms**: Form, Card, Navigation, Modal, Table, List

2) **Core components** (with variants):
   - **Button**: Primary, Secondary, Tertiary, Destructive, Ghost, Link (sizes: sm, md, lg)
   - **Input**: Text, Email, Password, Number, Tel, Search, Textarea (states: default, focus, error, disabled)
   - **Select**: Dropdown, Multi-select, Autocomplete
   - **Checkbox**: Standard, Indeterminate
   - **Radio**: Standard, Card variant
   - **Switch**: Toggle component
   - **Badge**: Default, Success, Warning, Error, Info
   - **Card**: Default, Interactive, Elevated
   - **Modal**: Center, Side, Full-screen
   - **Toast**: Success, Error, Warning, Info (positions: top-right, bottom-right, etc.)

3) **Component specifications** (for each):
   - Variants and states
   - Props API (TypeScript interfaces)
   - Accessibility (ARIA labels, keyboard support)
   - Responsive behavior
   - Animation/transition specs

---
**>>> CHECKPOINT: PHASE E APPROVAL <<<**

Present component library list with variants to the user.
**Do NOT continue to Phase F until the user explicitly approves.**

Reply `approve e` or `revise: [feedback]`.
---

---

## Phase F — Icons & Imagery

### F1: Icon System (CRITICAL - No Emojis)

**Rule:** Never use emojis or basic system icons. Always use a consistent, premium icon library.

1) **Icon style decisions**:
   - Style (outline, filled, or duotone)
   - Sizes (16px, 20px, 24px, 32px)
   - Stroke width consistency (1.5px or 2px)
   - Color treatment (inherit from text or explicit colors)

2) **Recommended Icon Libraries by Platform**:

**Web App Icons (Next.js / TanStack Start):**

| Library | Style | Install | Best For |
|---------|-------|---------|----------|
| **Lucide React** ⭐ | Clean, consistent stroke | `npm i lucide-react` | Primary choice - 1400+ icons, tree-shakeable |
| **Phosphor Icons** | 6 weight variants per icon | `npm i @phosphor-icons/react` | Flexible - thin to bold |
| **Tabler Icons** | Stroke-based, extensive | `npm i @tabler/icons-react` | 5000+ icons, MIT license |
| **Heroicons** | Tailwind official | `npm i @heroicons/react` | Solid + Outline variants |
| **Radix Icons** | Minimal, accessible | `npm i @radix-ui/react-icons` | shadcn/ui compatible |

**Recommended for Web:** Use **Lucide React** as primary. Best balance of quality, quantity, and performance.

```tsx
// Web icon usage
import { Home, Settings, User, ChevronRight } from 'lucide-react';

<Home className="w-6 h-6 text-primary" />
<Settings size={24} strokeWidth={1.5} />
```

**Mobile App Icons (Expo / React Native):**

| Library | Style | Install | Best For |
|---------|-------|---------|----------|
| **Lucide React Native** ⭐ | Matches web | `npm i lucide-react-native react-native-svg` | Primary - consistent with web |
| **@expo/vector-icons** | Built-in | Included with Expo | FontAwesome, Ionicons, MaterialIcons |
| **Phosphor React Native** | 6 weights | `npm i phosphor-react-native react-native-svg` | Flexible weights |
| **Hugeicons React Native** | Modern, detailed | `npm i @hugeicons/react-native` | Premium feel, 4000+ icons |

**Recommended for Mobile:** Use **Lucide React Native** to match web codebase.

```tsx
// Mobile icon usage
import { Home, Settings, User } from 'lucide-react-native';

<Home color="#000" size={24} />
<Settings color={colors.primary} size={24} strokeWidth={1.5} />
```

3) **Icon usage guidelines**:
   - Navigation icons (Home, Search, Settings, Profile)
   - Action icons (Edit, Delete, Save, Share)
   - Status icons (CheckCircle, AlertTriangle, XCircle, Info)
   - Social icons (use official brand icons when available)
   - File type icons (File, FileText, Image, Video)

4) **Icon quality gates**:
   - [ ] All icons from a single library (no mixing)
   - [ ] Consistent stroke width across all icons
   - [ ] Proper sizing for touch targets (min 44px mobile)
   - [ ] Accessible labels for icon-only buttons

### F2: Image Treatment

1) **Border radius scale**: 0, 4px, 8px, 12px, 16px, full
2) **Aspect ratios**: 1:1 (avatar), 4:3 (card), 16:9 (hero), 21:9 (banner)
3) **Lazy loading strategy**: Native `loading="lazy"` or intersection observer
4) **Responsive images**: srcset with 1x, 2x, 3x densities
5) **Placeholder strategy**: blur-up, dominant color, skeleton

---
**>>> CHECKPOINT: PHASE F APPROVAL <<<**

Present icon system and imagery guidelines to the user.
**Do NOT continue to Phase G until the user explicitly approves.**

Reply `approve f` or `revise: [feedback]`.
---

---

## Phase G — Effects Layer (Cool, Not Toy)

**Goal:** Define a profile-aware “cool layer” (hover depth + border beam/focus trail) that adds polish without making the UI look like a toy.

### F5.0 Read UI Profile (Mandatory)

From `/docs/design/UI-PROFILE.md` + `/docs/design/ui-profile.json`, extract:
- Profile ID + name
- `dials.coolLayer` (on/off)
- `dials.motionIntensity`
- Guardrails (`rules.*`) used to prevent “toy” aesthetics

If cool layer is **off**, you still must define **focus-visible** styles (accessibility).

### F5.1 Apply-To Allow List (Hard Rule)

✅ Allowed:
- Interactive cards (clickable)
- Primary/secondary CTAs
- Inputs (focus-visible only)

🚫 Not allowed:
- Static cards or decorative surfaces
- Always-on background effects

### F5.2 Hover Depth Spec (Default)

```css
.cool-hover-depth {
  transition: box-shadow 150ms ease-out, transform 150ms ease-out, border-color 150ms ease-out;
}

.cool-hover-depth:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 30px hsl(0 0% 0% / 22%),
    0 2px 8px hsl(0 0% 0% / 14%);
}
```

**Satin Dark adjustment:** prefer border lift + soft shadow, not heavy glow.

### F5.3 Border Beam / Focus Trail

**Preferred:** show beam **only on hover/focus** for professional profiles.

**Option A — Magic UI BorderBeam (web, animated):**
- Reference (in boilerplate repos): `.cursor/commands/Magic UI/startup-template/components/magicui/border-beam.tsx`
- Reference (in this commands repo): `Magic UI/startup-template/components/magicui/border-beam.tsx`
- Pattern: wrap in a `group` container, fade in on hover/focus.

**Option B — CSS-only (no beam):**
```css
.cool-border-lift:hover {
  border-color: hsl(0 0% 100% / 15%);
}
```

### F5.4 Focus Trail (Keyboard Focus — Required)

```css
.cool-focus-trail:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--background)),
    0 0 0 4px hsl(var(--accent));
  transition: box-shadow 150ms ease-out;
}
```

### F5.5 Reduced Motion Handling (Required)

If `prefers-reduced-motion: reduce`:
- Disable border beam animation
- Keep border lift + focus ring only

---
**>>> CHECKPOINT: PHASE G APPROVAL <<<**

Present effects layer rules and allow-list to the user.
**Do NOT continue to Phase H until the user explicitly approves.**

Reply `approve g` or `revise: [feedback]`.
---

## Phase H — Motion & Animation

> **📚 Animation Quality Reference:** See `/commands/MOBILE_APP_DESIGN_LEARNINGS.md` for premium animation benchmarks, component examples, and quality direction.

### G1: Animation Principles (Foundation)

1) **Easing functions**: ease-in, ease-out, ease-in-out, spring
2) **Duration**: fast (100-200ms), normal (200-300ms), slow (300-500ms)
3) **Choreography**: stagger animations, sequence timing

### G2: Animation Philosophy Alignment (Reference)

**Match motion style to the brand's Design DNA established in Step 3:**

| Design DNA | Motion Character | Example Libraries |
|------------|------------------|-------------------|
| **Iron Man / Futuristic** | Sharp, technical, HUD-like | Motion Primitives (border-trail, glow-effect) |
| **Batman / Dark Knight** | Sleek, fast, precise | Framer Motion (spring presets) |
| **Cal AI / Apple Minimalist** | Subtle, elegant, purposeful | Native CSS transitions + Framer |
| **Stripe / Linear Professional** | Polished, smooth, confident | Motion Primitives (animated-number, text-effect) |
| **Cosmic / Gamified** | Playful, dynamic, rewarding | Lottie + Motion Primitives |

**Selection Prompt:** "Based on Step 3's Design DNA, which motion character best fits this product?"

### G3: Premium Animation Libraries (Reference)

**Motion Primitives** — Production-ready animated components:
```bash
# Install specific components as needed
npx motion-primitives@latest add border-trail
npx motion-primitives@latest add dock
npx motion-primitives@latest add animated-number
npx motion-primitives@latest add text-effect
npx motion-primitives@latest add glow-effect
```

**When to use:** When the app needs premium, polished animations that feel "alive" — especially for:
- Hero sections and landing pages
- Data visualizations and dashboards
- Navigation and interactive elements
- Celebratory moments (success states, achievements)

### G4: Spring Physics Presets (Copy-Paste Ready)

```typescript
// Spring animation presets for consistent feel
export const springPresets = {
  // Snappy - buttons, toggles, quick interactions
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  
  // Smooth - modals, drawers, page transitions
  smooth: { type: "spring", stiffness: 300, damping: 25 },
  
  // Bouncy - success states, celebrations, playful UI
  bouncy: { type: "spring", stiffness: 500, damping: 15 },
  
  // Gentle - subtle hovers, focus states
  gentle: { type: "spring", stiffness: 200, damping: 20 },
};

// Usage with Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={springPresets.smooth}
/>
```

### G5: Component Animations (Specifications)

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| **Button** | hover scale (1.02), active scale (0.98) | 100-150ms | ease-out |
| **Modal** | fade-in backdrop, slide-up content | 250-300ms | spring (smooth) |
| **Toast** | slide-in from edge | 300ms | spring (snappy) |
| **Dropdown** | fade-in with slight movement | 200ms | ease-out |
| **Page transitions** | fade or slide | 300-400ms | ease-in-out |
| **List items** | stagger fade-in | 50ms stagger | ease-out |
| **Data updates** | animated-number, text-effect | 400-600ms | spring (smooth) |

### G6: Premium Animation Patterns (Reference Examples)

These represent the **quality benchmark** for premium animations — use when appropriate:

| Pattern | Use Case | Motion Primitive |
|---------|----------|------------------|
| **Border Trail** | Active states, focus indicators, CTAs | `border-trail` |
| **Glow Effect** | Premium buttons, highlighted content | `glow-effect` |
| **Animated Numbers** | Metrics, counters, pricing | `animated-number` |
| **Text Effects** | Headlines, hero text, reveals | `text-effect` |
| **Dock Navigation** | App navigation, toolbars | `dock` |
| **Morphing Cards** | Expandable content, detail views | `transition-panel` |

### G7: Animation Quality Signals (Reference Checklist)

**"Alive" App Indicators** — animations that feel premium:

| Signal | Static/Generic | Alive/Premium |
|--------|----------------|---------------|
| **Data changes** | Instant swap | Animated transitions (numbers roll, text morphs) |
| **Loading** | Basic spinner | Skeleton shimmer + staggered content reveal |
| **Navigation** | Instant page swap | Smooth transitions with depth |
| **Interactions** | No feedback | Micro-animations (hover, press, focus) |
| **Success states** | Text message only | Celebratory animation + haptic (mobile) |
| **Empty states** | Static illustration | Subtle animation loop |

**Quality Check Questions:**
- [ ] Do data changes animate smoothly (not instant swap)?
- [ ] Does navigation have depth and continuity?
- [ ] Do interactive elements provide immediate visual feedback?
- [ ] Are success moments celebrated with appropriate animation?
- [ ] Does the overall feel match the Design DNA from Step 3?

### G8: Performance Requirements

1) **GPU-accelerated properties only**: transform, opacity
2) **Avoid layout animations**: width, height, margin, padding
3) **60fps target** for all animations
4) **prefers-reduced-motion support** — always provide static fallback:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---
**>>> CHECKPOINT: PHASE H APPROVAL <<<**

Present animation system and motion principles to the user.
**Do NOT continue to Phase I until the user explicitly approves.**

Reply `approve h` or `revise: [feedback]`.
---

---

## Phase I — Animation Implementation Quality Framework

> **Philosophy:** This section ensures animations are **implemented well** (technical quality), not what animations to use (style is determined by Design DNA in Step 3). High-quality implementation = smooth, performant, accessible.

### G.5.1 Animation Budget Planning

**Define animation constraints BEFORE implementation:**

```markdown
## Animation Performance Budget

| Metric | Target | Maximum | Measurement |
|--------|--------|---------|-------------|
| **Frame Rate** | 60fps | 55fps min | Chrome DevTools Performance |
| **First Animation** | <100ms | 150ms | Time to first visual feedback |
| **Complex Animation** | <300ms | 500ms | Modal, page transitions |
| **Total JS Bundle for Animations** | <20KB | 35KB | Bundle analyzer |
| **Animation CPU Impact** | <10% | 20% | Performance monitor |

### Animation Library Budget
- Framer Motion: ~30KB (tree-shakeable to ~15KB)
- Motion Primitives: ~5KB per component
- Native CSS: 0KB (prefer when possible)

### Priority: CSS > Web Animations API > Framer Motion > Heavy libraries
```

### G.5.2 Animation Implementation Checklist (Per Component)

**For EACH component with animation, verify:**

```markdown
## Animation Implementation Quality Checklist

### Performance (MUST PASS)
- [ ] **GPU-only properties**: Only animates `transform` and `opacity`
- [ ] **No layout thrashing**: Does NOT animate `width`, `height`, `margin`, `padding`, `top`, `left`
- [ ] **Hardware acceleration**: Uses `will-change` sparingly (only on active animations)
- [ ] **Composited layers**: Complex animations are on their own layer
- [ ] **Debounced**: Rapid-fire animations are debounced/throttled
- [ ] **60fps verified**: Tested in Chrome DevTools Performance tab

### Accessibility (MUST PASS)
- [ ] **Reduced motion**: Respects `prefers-reduced-motion: reduce`
- [ ] **No vestibular triggers**: No parallax, zooming, or spinning that could cause discomfort
- [ ] **Focus visible**: Animation doesn't hide focus indicators
- [ ] **Screen reader compatible**: State changes are announced, not just animated

### Code Quality (SHOULD PASS)
- [ ] **Reusable**: Animation defined as reusable preset/variant
- [ ] **Consistent**: Uses design system timing tokens
- [ ] **Documented**: Animation purpose and usage documented
- [ ] **Tested**: Unit tests verify animation completion callbacks

### User Experience (SHOULD PASS)
- [ ] **Purposeful**: Animation communicates something (not just decoration)
- [ ] **Interruptible**: Long animations can be cancelled by user action
- [ ] **Responsive**: Animation scales appropriately on different devices
- [ ] **Battery-aware**: Reduced animations on low-power mode (mobile)
```

> **📚 React Performance Reference:** For detailed React-specific optimization patterns (memoization to prevent re-render during animation, virtualization, code splitting), see `/src/foundation-skills/react-performance.md`.

### G.5.3 Animation Testing Requirements

**Include these tests in QA process:**

```typescript
// Animation testing utilities
describe('Animation Quality', () => {
  // 1. Performance test
  it('maintains 60fps during animation', async () => {
    const fps = await measureAnimationFPS(element);
    expect(fps).toBeGreaterThanOrEqual(55);
  });

  // 2. Reduced motion test
  it('respects prefers-reduced-motion', () => {
    mockMatchMedia('(prefers-reduced-motion: reduce)', true);
    render(<AnimatedComponent />);
    expect(element).not.toHaveAnimation();
    // OR expect instant transition
  });

  // 3. Completion callback test
  it('fires onAnimationComplete callback', async () => {
    const onComplete = jest.fn();
    render(<AnimatedComponent onAnimationComplete={onComplete} />);
    await waitForAnimation(element);
    expect(onComplete).toHaveBeenCalled();
  });

  // 4. Interruptibility test
  it('can be interrupted by user action', async () => {
    render(<AnimatedComponent />);
    fireEvent.click(cancelButton);
    expect(animationState).toBe('cancelled');
  });
});
```

### G.5.4 Reduced Motion Implementation (Required)

**EVERY animation MUST have a reduced-motion alternative:**

```css
/* Global reduced motion override */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```typescript
// React hook for reduced motion
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
};

// Usage in components
const MyAnimatedComponent = () => {
  const prefersReduced = usePrefersReducedMotion();
  
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReduced ? { duration: 0 } : springPresets.smooth}
    />
  );
};
```

### G.5.5 Animation Documentation Template

**Document each animation in the design system:**

```markdown
## [Animation Name]

**Purpose:** [Why this animation exists - what it communicates]
**Usage:** [Where to use this animation]

### Specification
| Property | Value |
|----------|-------|
| Duration | 200ms |
| Easing | ease-out |
| Properties Animated | transform (translateY), opacity |
| Trigger | On mount / On hover / On state change |

### Code
```typescript
const [animationName] = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: 'easeOut' }
};
```

### Accessibility
- Reduced motion: Instant (duration: 0)
- Screen reader: [Announcement if needed]

### Performance
- GPU accelerated: ✅
- Composited: ✅ (uses transform only)
- Bundle impact: 0KB (CSS) / 2KB (Framer variant)
```

### G.5.6 Animation Quality Gates (For Step 6 Approval)

**Before approving motion & animation section, verify:**

- [ ] **Performance budget defined**: Animation limits documented
- [ ] **Reduced motion global**: CSS fallback exists for all animations
- [ ] **Implementation checklist created**: Per-component checklist template ready
- [ ] **Testing requirements documented**: Animation tests specified
- [ ] **Animation tokens exported**: Timing, easing as CSS variables
- [ ] **Documentation template**: Standard format for animation documentation

---

## Phase J — Design Tokens
1) **Token structure** (CSS variables or JSON):
   - Colors: `--color-primary-500`, `--color-text-primary`
   - Typography: `--font-size-lg`, `--font-weight-bold`
   - Spacing: `--space-4`, `--space-8`
   - Shadows: `--shadow-sm`, `--shadow-lg`
   - Radii: `--radius-sm`, `--radius-lg`
   - Z-index: `--z-modal`, `--z-tooltip`

2) **Platform export**:
   - CSS custom properties (web)
   - JSON (React Native, iOS, Android)
   - SCSS variables (legacy support)
   - **Swift struct** (SwiftUI) — see below

3) **SwiftUI Design Tokens (iOS Native)**:

**When platform is SwiftUI, export tokens as a Swift struct:**

```swift
// DesignTokens.swift
import SwiftUI

struct DesignTokens {
    
    // MARK: - Colors
    struct Colors {
        // Semantic colors (adapt to Dark Mode automatically)
        static let textPrimary = Color.primary
        static let textSecondary = Color.secondary
        static let textTertiary = Color(.tertiaryLabel)
        
        // Surfaces
        static let background = Color(.systemBackground)
        static let surfaceRaised = Color(.secondarySystemBackground)
        static let surfaceElevated = Color(.tertiarySystemBackground)
        
        // Brand (define in Assets.xcassets with dark variants)
        static let brandPrimary = Color("BrandPrimary")
        static let brandSecondary = Color("BrandSecondary")
        
        // Status
        static let success = Color(.systemGreen)
        static let warning = Color(.systemOrange)
        static let error = Color(.systemRed)
        static let info = Color(.systemBlue)
    }
    
    // MARK: - Typography (uses SF Pro automatically)
    struct Typography {
        // Headings
        static let displayLarge = Font.system(size: 48, weight: .bold)
        static let displayMedium = Font.system(size: 36, weight: .bold)
        static let h1 = Font.largeTitle.weight(.bold)
        static let h2 = Font.title.weight(.semibold)
        static let h3 = Font.title2.weight(.semibold)
        static let h4 = Font.title3.weight(.medium)
        static let h5 = Font.headline
        static let h6 = Font.subheadline.weight(.semibold)
        
        // Body
        static let bodyLarge = Font.body
        static let bodyMedium = Font.callout
        static let bodySmall = Font.footnote
        
        // Utility
        static let caption = Font.caption
        static let captionSmall = Font.caption2
        static let button = Font.body.weight(.semibold)
    }
    
    // MARK: - Spacing (4pt base unit)
    struct Spacing {
        static let xxxs: CGFloat = 2   // 0.5x
        static let xxs: CGFloat = 4    // 1x
        static let xs: CGFloat = 8     // 2x
        static let sm: CGFloat = 12    // 3x
        static let md: CGFloat = 16    // 4x (standard)
        static let lg: CGFloat = 24    // 6x
        static let xl: CGFloat = 32    // 8x
        static let xxl: CGFloat = 48   // 12x
        static let xxxl: CGFloat = 64  // 16x
    }
    
    // MARK: - Corner Radius
    struct Radius {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let full: CGFloat = 9999
    }
    
    // MARK: - Shadows
    struct Shadows {
        static let sm = ShadowStyle(color: .black.opacity(0.08), radius: 2, x: 0, y: 1)
        static let md = ShadowStyle(color: .black.opacity(0.12), radius: 8, x: 0, y: 4)
        static let lg = ShadowStyle(color: .black.opacity(0.16), radius: 16, x: 0, y: 8)
    }
    
    // MARK: - Animation
    struct Motion {
        static let fast: Double = 0.15
        static let normal: Double = 0.25
        static let slow: Double = 0.35
        
        static let springSnappy = Animation.spring(response: 0.2, dampingFraction: 0.8)
        static let springSmooth = Animation.spring(response: 0.3, dampingFraction: 0.7)
        static let springBouncy = Animation.spring(response: 0.3, dampingFraction: 0.6)
    }
}

// Helper for shadows
struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

extension View {
    func shadow(_ style: ShadowStyle) -> some View {
        self.shadow(color: style.color, radius: style.radius, x: style.x, y: style.y)
    }
}
```

**Usage in SwiftUI views:**

```swift
Text("Hello")
    .font(DesignTokens.Typography.h1)
    .foregroundStyle(DesignTokens.Colors.textPrimary)
    .padding(DesignTokens.Spacing.md)
    .background(DesignTokens.Colors.surfaceRaised)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radius.md))
    .shadow(DesignTokens.Shadows.md)
```

**Reference:** `/docs/swiftui/SWIFTUI-BEST-PRACTICES.md` → Design Tokens section

4) **Theming support**:
   - Light theme (default)
   - Dark theme (optional)
   - Theme switching mechanism

---
**>>> CHECKPOINT: PHASE J APPROVAL <<<**

Present design token structure to the user.
**Do NOT continue to Phase K until the user explicitly approves.**

Reply `approve j` or `revise: [feedback]`.
---

---

## Phase K — Assemble the Design System (paste back + write files)
**Design System Document Outline:**
1) Design System Overview
   - Philosophy and principles
   - Atomic design structure
   - Usage guidelines
2) Color System
   - Brand colors with shades
   - Semantic colors
   - Neutral palette
   - Dark mode (if applicable)
   - Accessibility (contrast ratios)
3) Typography System
   - Font families and loading
   - Type scale and hierarchy
   - Font weights
   - Responsive typography
4) Spacing & Layout
   - Spacing scale
   - Grid system
   - Breakpoints
   - Z-index scale
5) Component Library
   - Atomic design categories
   - Component specifications
   - Variants and states
   - Accessibility requirements
6) Icons & Imagery
   - Icon system
   - Image treatment
   - Loading strategies
7) Motion & Animation
   - Animation principles
   - Component animations
   - Performance guidelines
8) Design Tokens
   - Token structure
   - Platform exports
   - Theming support
9) Implementation Guidelines
   - Figma-to-code workflow
   - Storybook setup
   - Component documentation
**Sources:** link to `/docs/research/DESIGN-SOURCES-${TODAY}.md` (top 5 inline citations)

**Files to create/update**
- `/docs/design/DESIGN-SYSTEM.md` (complete design system)
- `/docs/design/COLOR-SYSTEM.md` (color palette with WCAG validation)
- `/docs/design/TYPOGRAPHY.md` (type scale and hierarchy)
- `/docs/design/SPACING.md` (spacing scale and grid system)
- `/docs/components/COMPONENT-LIBRARY.md` (all component specs)
- `/docs/components/ATOMS.md` (atomic components)
- `/docs/components/MOLECULES.md` (molecular components)
- `/docs/components/ORGANISMS.md` (organism components)
- `/docs/tokens/design-tokens.json` (design tokens for export)
- `/docs/tokens/css-variables.css` (CSS custom properties)
- `/docs/design/MOTION.md` (animation system)
- `/docs/design/ICONS.md` (icon system and usage)
- `/docs/research/DESIGN-SOURCES-${TODAY}.md` (from Phase A)

**Quality gates (must pass)**
- Color combinations meet **WCAG 2.2** contrast ratios (4.5:1 text, 3:1 UI).
- Typography scale is **modular** with clear hierarchy.
- Spacing scale uses **consistent intervals** (4px or 8px base).
- Component library follows **atomic design** structure.
- All components have **accessibility** specs (ARIA, keyboard).
- **Design tokens** are exported as CSS variables and JSON.
- **Animation** specs include **prefers-reduced-motion** support.
- Research file has **5–10 credible sources** with URLs and dates.

**Animation Implementation Quality Gates (must pass)** ⭐ NEW
- **Performance budget defined**: Animation limits (duration, FPS, bundle size) documented.
- **GPU-only enforcement**: All animations use only `transform` and `opacity`.
- **Reduced motion global fallback**: CSS/JS fallback exists for ALL animations.
- **Animation tokens exported**: Timing, easing as CSS variables/constants.
- **Per-component checklist ready**: Implementation checklist template available.
- **Testing requirements documented**: Animation performance/accessibility tests specified.

---

## Final Review Gate (stop here)
**Prompt to user (blocking):**  
> "Please review the Design System and files.  
> • Reply `approve step 6` to proceed to Step-7 Interface States, or  
> • Reply `revise step 6: <notes>` to iterate.  
> I won't continue until you approve."

---

## Fallback Micro-Roles (only used if specific expertise is missing)
- **Color Theory**: Hue/saturation/lightness; WCAG contrast; color-blind testing; semantic color meaning.
- **Typography**: Modular scale; font pairing; line height; responsive type; web font loading.
- **Component Design**: Atomic design; variant patterns; state management; composition; prop API design.
- **Design Tokens**: CSS variables; JSON structure; platform export; theming; design-to-code workflow.
- **Motion Design**: Easing functions; choreography; performance (60fps, GPU); reduced motion.

---

<verification>
## Step 6 Verification Schema

### Required Files (20 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Design System | /docs/design/DESIGN-SYSTEM.md | 5KB | 6 |
| Color System | /docs/design/COLOR-SYSTEM.md | 1KB | 4 |
| Typography | /docs/design/TYPOGRAPHY.md | 1KB | 3 |
| Design Tokens JSON | /docs/tokens/design-tokens.json | 200B | 4 |
| CSS Variables | /docs/tokens/css-variables.css | 200B | 3 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| DESIGN-SYSTEM.md | ## Color System | 5 |
| DESIGN-SYSTEM.md | ## Typography System | 5 |
| DESIGN-SYSTEM.md | ## Spacing & Layout | 4 |
| DESIGN-SYSTEM.md | ## Component Library | 5 |
| DESIGN-SYSTEM.md | ## Motion & Animation | 4 |
| COLOR-SYSTEM.md | ## Primary Colors | 4 |
| COLOR-SYSTEM.md | ## Semantic Colors | 3 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:COLOR-SYSTEM.md:#[0-9A-Fa-f]{6} | Color hex codes defined | 6 |
| has_pattern:DESIGN-SYSTEM.md:4\.5:1\|WCAG | Contrast ratios validated | 5 |
| has_pattern:TYPOGRAPHY.md:rem\|px | Font sizes with units | 4 |
| has_pattern:DESIGN-SYSTEM.md:Button\|Input\|Card | Core components specified | 5 |
| json_valid:design-tokens.json | Valid JSON token file | 5 |
| has_pattern:css-variables.css:--color\|--space | CSS variables defined | 5 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Colors Approved | COLOR-SYSTEM.md exists with scales | 5 |
| Tokens Exported | Both JSON and CSS exports exist | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| WCAG Compliant | Contrast ratios documented | 4 |
| Atomic Structure | Components follow atoms/molecules/organisms | 3 |
| Dark Mode | Dark mode tokens defined (if applicable) | 3 |

### Animation Implementation Quality (15 bonus points) ⭐ NEW

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:MOTION.md:transform\|opacity | GPU-only properties specified | 4 |
| has_pattern:MOTION.md:prefers-reduced-motion | Reduced motion fallback documented | 4 |
| has_pattern:MOTION.md:60fps\|performance | Performance targets documented | 3 |
| has_pattern:MOTION.md:checklist\|Implementation | Implementation checklist present | 4 |

</verification>

---

## Final Review Gate

**All outputs for this step:**
- [ ] /docs/design/DESIGN-SYSTEM.md created/updated
- [ ] All phases (A0–K) completed with user approval
- [ ] Color, typography, spacing systems documented
- [ ] Component library and icon system specified
- [ ] Motion and animation guidelines complete
- [ ] Design tokens exported

**>>> FINAL CHECKPOINT: STEP 6 COMPLETE <<<**
**Do NOT proceed to Step 7 without explicit approval.**


