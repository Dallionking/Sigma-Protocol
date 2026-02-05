---
version: "2.4.0"
last_updated: "2026-01-07"
changelog:
  - "2.4.0: Added Superdesign AI Design Agent reference for rapid UI exploration during UX design. References superdesign-integration.md foundation skill"
  - "2.3.0: Added Data Flow Awareness to Phase B (User Journey Mapping) - documents data requirements per screen to bridge UX to backend"
  - "2.2.0: Added Apple HIG Native (SwiftUI) UI Profile option with SwiftUI-specific ui-profile.json, Framework 4b HIG reference"
  - "2.1.1: Added optional layout constraints to ui-profile.json (content max widths, responsive padding, sidebar widths, grid gutters) to prevent narrow centered app UIs"
  - "2.1.0: Added UI Profile selection (Cool Professional + Satin Dark) with UI-PROFILE artifacts; refined anti-AI-slop guidance to be restraint-first for professional profiles"
  - "2.0.0: SSS 13-step workflow, added IA frameworks, Design DNA integration"
  - "1.0.0: Initial release"
description: "Step 3: UX Design & Interface Planning - User experience specifications with journey mapping and interaction design personas"
allowed-tools:
  # PRIMARY MCP Tools (Use First)
  - mcp_Ref_ref_search_documentation
  - mcp_Ref_ref_read_url
  - mcp_exa_web_search_exa
  - mcp_exa_get_code_context_exa
  - mcp_exa_crawling_exa
  - mcp_exa_company_research_exa
  - mcp_exa_linkedin_search_exa
  - mcp_exa_deep_researcher_start
  - mcp_exa_deep_researcher_check
  
  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_perplexity-ask_perplexity_ask
  
  # OTHER TOOLS
  - web_search
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --depth
---

# /step-3-ux-design — User Experience Design & Interface Planning (Chief Design Officer + $1B Valuation Context)

**Mission**  
Run a complete, interactive **Step-3: UX Design → Interface Specifications** for a startup project in one go. 
**Valuation Context:** You are the **Chief Design Officer (Apple/Airbnb level)**. If it's not "**pixel-perfect**" and "**delightful**", it's a bug. Every state (loading, error, empty) must be a piece of art.

**Value Equation Context (Hormozi):**
- **Minimize Time Delay [TD]:** UX MUST deliver "First Value" in <60 seconds.
- **Minimize Effort & Sacrifice [ES]:** Reduce clicks, cognitive load, and form fields to zero where possible.

---

## EMOTIONAL DESIGN FRAMEWORKS (MANDATORY APPLICATION)

### The Design Philosophy: "People Remember How You Made Them Feel"
**Our apps must NOT be generic AI slop.** They must invoke emotion, create delight, and feel crafted with care.

### Framework 1: Don Norman's Three Levels of Emotional Design
Design EVERY screen and interaction at all three levels:

| Level | What It Is | Design Focus | Questions to Ask |
|-------|-----------|--------------|------------------|
| **Visceral** | Immediate gut reaction | First impressions, aesthetics, sensory appeal | "Does this look beautiful? Does it feel premium?" |
| **Behavioral** | How it works | Usability, functionality, feedback loops | "Is this intuitive? Does it respond instantly?" |
| **Reflective** | Long-term meaning | Identity, memory, storytelling, self-image | "Does this make users feel smart? Successful? Part of something?" |

**Application Checklist:**
- [ ] **Visceral**: Does the first impression say "premium" and "trustworthy"?
- [ ] **Behavioral**: Is every interaction smooth, responsive, and intuitive?
- [ ] **Reflective**: Does using this product make users feel good about themselves?

### Framework 2: Aarron Walter's Hierarchy of User Needs
Design must satisfy ALL levels, not just "usable":

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

**Key Insight:** *"We've been designing usable interfaces, which is like a chef cooking edible food. We also crave flavor."* — Aarron Walter

**Application:**
- Functional and reliable are the **baseline**, not the goal
- Products should have **personality** (not be sterile)
- Design for the **emotional state** of your users at each moment

### Framework 3: Jony Ive's Design Principles
**Core Mantra:** "Just care."

| Principle | Application |
|-----------|-------------|
| **Care shows** | "You should care about the detail, about the implications, about how it feels to use something." Every micro-interaction should feel intentional. |
| **Joy is fundamental** | "Making something that is a celebration of being human. That communicates: I see you, I thought about this, and I cared." |
| **Minimalism with soul** | "Just because something is uncluttered doesn't mean it's good. It can be cold, it can be soulless." Avoid sterile, add warmth. |
| **Express gratitude** | "When people use products, they should feel gratitude was expressed to them." Design with respect for the user. |

### Framework 4: Design References (Best-in-Class)
When designing, reference these apps for emotional resonance:

| App | Why It's Special | What to Learn |
|-----|------------------|---------------|
| **Linear** | Obsessive craft, keyboard-first, feels "fast" | Speed as emotion, attention to detail |
| **Notion** | Flexible yet simple, delightful empty states | Personality in empty states, playful moments |
| **Stripe** | Developer experience as design, beautiful docs | Information hierarchy, trust signals |
| **Figma** | Collaborative magic, smooth multiplayer | Real-time feedback, collaborative delight |
| **Vercel** | Minimal yet powerful, developer delight | Clarity, progressive disclosure |
| **Cal AI** ⭐ | Apple-esque micro-infographics, circular progress rings | Data visualization as art, gamified onboarding |
| **Quittr** ⭐ | Cosmic atmospheres, gamified depth | Glowing orbs, "light up" progression, tactile interactions |
| **Cash App** | Bold branding, spatial illustrations | Trust signals, materiality, fintech patterns |

> **📚 Animation Research Reference:** See `/commands/MOBILE_APP_DESIGN_LEARNINGS.md` for comprehensive animation patterns, code examples, and library recommendations.

### Framework 4b: Apple Human Interface Guidelines (SwiftUI Native Apps)

**When building native iOS/macOS apps with SwiftUI, apply Apple HIG:**

| HIG Principle | Description | Application |
|---------------|-------------|-------------|
| **Clarity** | Text legible, icons precise, adornments subtle | SF Pro fonts, SF Symbols, clear hierarchy |
| **Deference** | UI helps without competing with content | Content-first, subtle chrome |
| **Depth** | Visual layers convey hierarchy | Blur, shadows, meaningful transitions |

**Mandatory Requirements (Non-Negotiable):**

| Requirement | Specification | SwiftUI Implementation |
|-------------|---------------|------------------------|
| **Touch Target** | ≥44pt × 44pt | `.frame(minWidth: 44, minHeight: 44)` |
| **Dynamic Type** | 1x to 3x scaling | `.font(.body)` (semantic styles) |
| **Safe Areas** | Respect all insets | Default behavior, `.safeAreaInset()` |
| **Dark Mode** | Both appearances | Semantic colors `Color(.systemBackground)` |
| **Accessibility** | VoiceOver support | `.accessibilityLabel()`, `.accessibilityHint()` |

**SwiftUI Design Experts to Reference:**

| Expert | Focus | Reference |
|--------|-------|-----------|
| **Paul Hudson** | Comprehensive tutorials | hackingwithswift.com |
| **Sean Allen** | Real-world patterns | YouTube |
| **Point-Free** | TCA, functional design | pointfree.co |
| **Majid Jabrayilov** | SwiftUI deep dives | swiftwithmajid.com |

**Reference Documents:**
- `/docs/swiftui/SWIFTUI-BEST-PRACTICES.md` — Complete HIG reference
- `/docs/swiftui/SWIFTUI-LIBRARIES.md` — Package ecosystem

### Framework 5: Emotional Journey Mapping
For EACH user journey, map the **emotional arc**:

```
EMOTION
   ↑
   │    😊 Delight Peak
   │   ╱  ╲
   │  ╱    ╲     😊 Success
   │ ╱      ╲   ╱
 ──┼─────────╲─╱──────────→ Journey
   │          ╲
   │           😟 Frustration Point
   │                (minimize these)
```

**For each journey, identify:**
1. **Delight moments** - Where can we surprise and delight?
2. **Frustration risks** - Where might users feel confused or stuck?
3. **Pride points** - Where do users feel accomplished?
4. **Trust builders** - Where do we build confidence?

### Emotional Design Quality Gates
Before finalizing ANY UX design, verify:
- [ ] **Visceral check**: First impression is beautiful, not generic
- [ ] **Behavioral check**: Every interaction feels responsive (<100ms feedback)
- [ ] **Reflective check**: Users feel smart/successful, not stupid/frustrated
- [ ] **Personality check**: The product has character, not sterile
- [ ] **Delight check**: At least one moment of surprise/delight per journey
- [ ] **Care check**: Every detail shows intentionality (no lazy defaults)

---

## ANIMATION PHILOSOPHY SPECTRUM

### Select Your App's Animation Personality (When Applicable)
**Apps benefit from a consistent animation philosophy.** When animation is important to the product, select ONE that matches your vision:

| Aesthetic | Vibe | Animation Focus | Best For |
|-----------|------|-----------------|----------|
| **Iron Man / Futuristic** | Tech HUD, glowing interfaces, data streams | Orbiting elements, pulsing glows, particle trails, neon accents | AI apps, dashboards, tech products, sci-fi interfaces |
| **Batman / Edgy Sleek** | Dark, precise, powerful | Sharp transitions, subtle reveals, controlled power, no bounce | Finance, productivity, premium utilities |
| **Cal AI / Apple Minimalist** | Clean, precise, infographic-driven | Smooth progress rings, gentle fades, spring physics | Health, lifestyle, data-rich utilities |
| **Quittr / Cosmic Gamified** | Deep space, achievement-focused | Glowing orbs, "light up" progression, atmospheric depth | Habit trackers, games, wellness |
| **Linear / Stripe Professional** | Subtle, polished, trust-building | Micro-interactions, smooth scrolls, refined hover states | SaaS, fintech, enterprise |

### Animation Philosophy Selection Prompt
**HITL Checkpoint →** Ask user to select animation philosophy.
**Prompt:**
```
Which Animation Philosophy best matches your product?

1. **Iron Man / Futuristic** - Glowing HUDs, data streams, orbiting elements
2. **Batman / Edgy Sleek** - Dark, precise, powerful, no playfulness
3. **Cal AI / Apple Minimalist** - Clean, infographic-driven, spring physics
4. **Quittr / Cosmic Gamified** - Deep space, achievements, glowing progression
5. **Linear / Stripe Professional** - Subtle, polished, micro-interactions

Reply with the number or name of your chosen philosophy.
```

### Animation Checklists by Philosophy

#### "Iron Man HUD" Checklist (Futuristic Feel)
- [ ] Glow effects on interactive elements
- [ ] Orbiting/rotating elements for dashboards
- [ ] Particle systems or floating dots
- [ ] Thin borders that pulse or glow
- [ ] Scan lines or subtle grid overlays
- [ ] Number counters that animate up
- [ ] Progress rings with gradient strokes
- [ ] Neon accent colors (cyan, magenta, lime)
- [ ] Deep dark backgrounds with subtle gradients
- [ ] Holographic/glass card effects

#### "Batman Dark Knight" Checklist (Premium Edgy Feel)
- [ ] Sharp, precise transitions (no bounce)
- [ ] Reveal animations from shadows
- [ ] Minimal color — mostly black/white with ONE accent
- [ ] Heavy typography that commands attention
- [ ] Subtle parallax on scroll
- [ ] Controlled power — animations feel deliberate
- [ ] No playfulness — everything is intentional
- [ ] Texture — subtle noise, grain, or patterns
- [ ] Negative space as design element

#### "Cal AI Minimalist" Checklist (Apple-esque Feel)
- [ ] Circular progress rings as hero elements
- [ ] Smooth spring physics on all interactions
- [ ] Monochrome foundation with color earned by data
- [ ] Aggressive rounding on all elements
- [ ] Generous whitespace throughout
- [ ] Typography hierarchy: massive bold numbers + tiny labels
- [ ] Micro-infographics instead of plain text
- [ ] Card-based layouts with subtle shadows
- [ ] Gradient fills under line charts

---

## ANTI-AI-SLOP DESIGN FRAMEWORK (QUALITY REFERENCE)

### What NOT To Do (The "AI-ish" Look)
Apps that look "AI-generated" share these traits — **AVOID ALL**:

1. ❌ Using **emojis** instead of custom icons/illustrations
2. ❌ **Buttons with no craft** (default component look, weak hierarchy, missing states)
3. ❌ **Generic system fonts** without hierarchy
4. ❌ **No visual imagery** — just text and basic shapes
5. ❌ **One-note surfaces** (no layering, no hierarchy, no material cues when needed)
6. ❌ **No interaction feedback** (hover/focus/pressed/disabled/loading not designed)
7. ❌ **Generic placeholder images** instead of real photos
8. ❌ **Crowded layouts** without proper spacing
9. ❌ **Inconsistent styling** across screens
10. ❌ **No social proof** or trust indicators

### What TO Do (The Professional Look)
Premium apps share these traits — **REQUIRE ALL**:

1. ✅ **Custom illustrations** and icons (consistent style)
2. ✅ **Restraint-first polish**: hierarchy, spacing rhythm, semantic tokens (gradients are optional and profile-dependent)
3. ✅ **Beautiful photography** where relevant
4. ✅ **Proper typography hierarchy** (size, weight, color)
5. ✅ **Generous whitespace** and padding
6. ✅ **Purposeful micro-interactions** (professional profiles avoid bounce-by-default)
7. ✅ **Social proof badges** and awards
8. ✅ **Clear value proposition** on paywalls
9. ✅ **Consistent design system** throughout
10. ✅ **Real product screenshots** showing the app in use

### Premium Signals (Profile-Aware)
| Element | Avoid (AI Slop) | Target (Premium) |
|---------|-----------------|------------------|
| Typography | One font, default weights | Paired fonts, deliberate hierarchy |
| Colors | Pure RGB, harsh contrast | Nuanced palette, sophisticated tones |
| Spacing | Cramped, inconsistent | Generous, mathematical rhythm (8px base) |
| Shadows | Black drop shadows | Subtle, layered, color-tinted |
| Borders | 1px solid gray everywhere | Thoughtful, often none |
| Icons | Mixed styles, random sizes | Consistent set, balanced weight |
| Motion | None or jarring | Subtle, purposeful, physics-based (pro profiles: damped; playful: can bounce) |
| Buttons | Static rectangles | Clear states + intentional feedback (pro profiles do not require gradients) |
| Loading | Generic spinners | Skeleton screens, shimmer effects |
| Success | Plain checkmark | Contextual success feedback (confetti only when on-profile, not default) |

---

## UI PROFILE SELECTION (NEW - MANDATORY)

### Why this exists
To eliminate “prompt reverse-engineering” and ensure every project starts from a **professional baseline**. The UI Profile becomes the **single source of truth** for downstream steps (Step 4/5/6/11 + implement/ui-healer).

### HITL Checkpoint → Select UI Profile

```markdown
## 🎨 Select UI Profile

Choose the visual personality for this project:

| # | Profile | Description | Best For |
|---|---------|-------------|----------|
| 1 | **Cool Professional (Enterprise Baseline)** | Square/Linear-inspired restraint + subtle micro-interactions. Monochrome surfaces, single muted accent, optional cool layer on interactive elements only. | Enterprise SaaS, B2B tools, CRMs, dashboards |
| 2 | **Satin Dark / Soft Depth** | Near-black "satin" surfaces + specular highlights + hairline borders + soft depth. No glass by default. Optional cool layer (hover depth + border beam) is subtle and earned. | Premium dashboards, dev tools, fintech |
| 3 | **Playful Gamified (Controlled)** | More saturated accents, more celebration moments, playful motion—but still premium (no emoji icons, no generic AI look). | Consumer apps, wellness, habit trackers |
| 4 | **Apple HIG Native (SwiftUI)** | Apple Human Interface Guidelines compliant. SF Pro typography, SF Symbols icons, system colors, semantic design tokens, native spring animations. | iOS/macOS native apps built with SwiftUI |
| 5 | **Custom** | Define your own profile dials below (still must set thresholds). | Existing brand systems |

Reply with a number (1-5) or the profile name.

If unsure, default to **1 (Cool Professional)** for web or **4 (Apple HIG Native)** for SwiftUI.
```

### Output Files (Create Both)

After selection, generate:
- `/docs/design/UI-PROFILE.md` (human-readable spec)
- `/docs/design/ui-profile.json` (machine-readable artifact)

**Optional validation (if available):**
```bash
npx ajv validate -s /schemas/ui-profile.schema.json -d /docs/design/ui-profile.json
```

### `ui-profile.json` Template (Fill Defaults Based on Selection)

```json
{
  "$schema": "../../schemas/ui-profile.schema.json",
  "id": "cool-professional",
  "name": "Cool Professional (Enterprise Baseline)",
  "version": "1.0.0",
  "preset": "cool-professional",
  "description": "Enterprise baseline with restrained depth and tasteful micro-interactions (no toy aesthetics).",
  "dials": {
    "radius": "soft",
    "density": "comfortable",
    "accentIntensity": "muted",
    "motionIntensity": "subtle",
    "coolLayer": "on"
  },
  "layout": {
    "contentMaxWidthPx": 1536,
    "contentMaxWidthNarrowPx": 896,
    "pagePaddingPx": { "base": 16, "sm": 24, "lg": 32 },
    "sidebarWidthPx": { "expanded": 280, "collapsed": 64 },
    "grid": { "columns": 12, "gutterPx": { "sm": 16, "md": 24, "lg": 32 } }
  },
  "tokens": {
    "surfaces": {
      "base": "oklch(0.145 0 0)",
      "raised": "oklch(0.205 0 0)",
      "elevated": "oklch(0.269 0 0)",
      "specularHighlight": "hsl(0 0% 100% / 0%)"
    },
    "text": {
      "primary": "oklch(0.985 0 0)",
      "secondary": "oklch(0.708 0 0)",
      "muted": "oklch(0.556 0 0)"
    },
    "borders": {
      "subtle": "oklch(1 0 0 / 10%)",
      "hover": "oklch(1 0 0 / 15%)",
      "focus": "hsl(220 50% 60%)"
    },
    "radii": { "sm": 6, "md": 8, "lg": 10, "xl": 14 },
    "shadows": {
      "sm": "0 1px 2px hsl(0 0% 0% / 18%)",
      "md": "0 8px 24px hsl(0 0% 0% / 22%)",
      "lg": "0 16px 48px hsl(0 0% 0% / 28%)"
    }
  },
  "effects": {
    "hoverDepth": { "enabled": true, "translateY": -2, "shadow": "md", "durationMs": 150 },
    "borderBeam": { "enabled": true, "implementation": "css-only" },
    "focusTrail": { "enabled": true, "ringSizePx": 4, "durationMs": 150 }
  },
  "motion": {
    "durationsMs": { "fast": 150, "normal": 220, "slow": 320 },
    "springs": {
      "snappy": { "stiffness": 400, "damping": 30 },
      "smooth": { "stiffness": 300, "damping": 25 },
      "gentle": { "stiffness": 200, "damping": 20 }
    },
    "reducedMotion": { "respectPrefersReducedMotion": true, "fallback": "instant" }
  },
  "rules": {
    "maxAccentColorsPerScreen": 2,
    "maxSemanticSaturationPercent": 70,
    "minSpringDamping": 20,
    "maxGradientsPerCard": 1,
    "maxBouncePerInteraction": 1
  },
  "bannedPatterns": [
    "emoji-icons",
    "bounce-by-default",
    "always-on-glow-everywhere",
    "multiple-gradients-per-card",
    "confetti-default-success"
  ]
}
```

### Satin Dark preset override (when profile = Satin Dark / Soft Depth)

If user selects **Satin Dark / Soft Depth**, override these token values:
- Surfaces: `base: hsl(0 0% 8%)`, `raised: hsl(0 0% 12%)`, `elevated: hsl(0 0% 16%)`, `specularHighlight: hsl(0 0% 100% / 5%)`
- Borders: `subtle: hsl(0 0% 100% / 8%)`, `hover: hsl(0 0% 100% / 15%)`

### Apple HIG Native preset (when profile = Apple HIG Native / SwiftUI)

If user selects **Apple HIG Native (SwiftUI)**, use this specialized profile:

**Key Differences from Web Profiles:**
- Uses **Swift DesignTokens struct** instead of JSON tokens
- References **SF Symbols** instead of icon libraries
- Uses **SwiftUI native animations** instead of Framer Motion
- Applies **Apple HIG mandatory requirements** (44pt touch targets, Dynamic Type, etc.)

**SwiftUI-Specific `ui-profile.json`:**

```json
{
  "$schema": "../../schemas/ui-profile.schema.json",
  "id": "apple-hig-native",
  "name": "Apple HIG Native (SwiftUI)",
  "version": "1.0.0",
  "preset": "apple-hig-native",
  "platform": "ios-native",
  "description": "Apple Human Interface Guidelines compliant design for SwiftUI apps.",
  "dials": {
    "radius": "system",
    "density": "comfortable",
    "accentIntensity": "system",
    "motionIntensity": "spring",
    "coolLayer": "off"
  },
  "typography": {
    "system": "sf-pro",
    "scales": ["largeTitle", "title", "title2", "title3", "headline", "subheadline", "body", "callout", "footnote", "caption", "caption2"],
    "dynamicType": true
  },
  "icons": {
    "library": "sf-symbols",
    "version": "5.0+",
    "renderingModes": ["monochrome", "hierarchical", "palette", "multicolor"],
    "symbolEffects": ["bounce", "pulse", "variableColor", "replace"]
  },
  "colors": {
    "strategy": "semantic",
    "lightMode": {
      "background": "Color(.systemBackground)",
      "secondaryBackground": "Color(.secondarySystemBackground)",
      "tertiaryBackground": "Color(.tertiarySystemBackground)",
      "label": "Color.primary",
      "secondaryLabel": "Color.secondary"
    },
    "darkMode": "automatic",
    "accent": "Color.accentColor"
  },
  "layout": {
    "safeAreaCompliance": "mandatory",
    "minTouchTargetPt": 44,
    "standardPaddingPt": 16,
    "navigationStyle": "NavigationStack"
  },
  "motion": {
    "defaultAnimation": ".spring(response: 0.3, dampingFraction: 0.7)",
    "durationsMs": { "fast": 150, "normal": 250, "slow": 350 },
    "springs": {
      "snappy": { "response": 0.2, "dampingFraction": 0.8 },
      "smooth": { "response": 0.3, "dampingFraction": 0.7 },
      "bouncy": { "response": 0.3, "dampingFraction": 0.6 }
    },
    "reducedMotion": { "respectAccessibilityReduceMotion": true }
  },
  "rules": {
    "minTouchTarget": "44pt",
    "dynamicTypeRequired": true,
    "darkModeRequired": true,
    "safeAreaRequired": true,
    "accessibilityLabelsRequired": true
  },
  "bannedPatterns": [
    "custom-fonts-without-dynamic-type",
    "touch-targets-under-44pt",
    "ignoring-safe-areas",
    "hardcoded-colors-without-dark-mode",
    "animations-ignoring-reduce-motion"
  ],
  "referenceDocuments": [
    "/docs/swiftui/SWIFTUI-BEST-PRACTICES.md",
    "/docs/swiftui/SWIFTUI-LIBRARIES.md"
  ]
}
```

**Apple HIG Design Checklist (MANDATORY for SwiftUI):**
- [ ] **Typography**: Using SF Pro via `.font(.body)` semantic styles
- [ ] **Icons**: Using SF Symbols via `Image(systemName:)`
- [ ] **Colors**: Using semantic system colors that adapt to Dark Mode
- [ ] **Touch Targets**: All interactive elements ≥44pt × 44pt
- [ ] **Safe Areas**: Respecting notch, home indicator, Dynamic Island
- [ ] **Dynamic Type**: All text scales with user preference (1x to 3x)
- [ ] **Dark Mode**: Both light and dark appearances supported
- [ ] **Reduced Motion**: Animations respect `accessibilityReduceMotion`
- [ ] **VoiceOver**: All elements have accessibility labels

This command:
- Builds on the Architecture from Step-2 with **current-year UX research**.
- Invokes **FAANG-level specialist personas** (Staff UX Lead/Interaction Designer/Accessibility/Mobile/Conversion).
- Works even if MCP search tools aren't configured (falls back to Cursor's web browsing).
- Produces development-ready **UX Specifications** and a comprehensive **/docs pack**, with **human-in-the-loop** checkpoints.
- **Hard-stops for your approval** before Step-4 (Flow Tree & Screen Architecture).

---

## Preflight (auto)
1) **Get date**: run `date +"%Y-%m-%d"` and capture `TODAY`, and derive `YEAR`.  
2) **Detect research tools** (preferred → fallback):
   - If an MCP search tool exists (e.g., `perplexity`, `tavily`, `brave`, `browsertools-mcp`), prefer it.
   - Else, use Cursor's web browsing.
3) **Create folders (idempotent)** if missing:
   - `/docs/ux`, `/docs/journeys`, `/docs/wireframes`, `/docs/research`, `/docs/design`
4) **Writing policy**: For large files, **write in small chunks** to avoid editor limits.

---

## Planning & Task Creation (CRITICAL - DO THIS FIRST)

**Before executing anything, you MUST:**

1. **Analyze Requirements**: Review PRD, Architecture, and understand full UX scope
2. **Create Task List**: Generate comprehensive task list with checkboxes for all UX work
3. **Present Plan**: Show the user your complete UX plan and task breakdown
4. **Get Approval**: Wait for user to approve the plan before executing

**Task List Format** (create at the start):
```markdown
## Step-3 UX Design Development Plan

### Phase A: UX Research (Current-Year Aware)
- [ ] Build YEAR-aware search queries for UX trends, accessibility, conversion
- [ ] Execute MCP search for 5-10 sources (UX patterns, WCAG 2.2, Fogg Model)
- [ ] Capture sources with titles, URLs, dates
- [ ] Write research summary to `/docs/research/UX-SOURCES-${TODAY}.md`
- [ ] HITL checkpoint: Present UX research findings
- [ ] Wait for user approval before proceeding

### Phase A2: Visual Inspiration + UI Profile (NEW)
- [ ] Run Visual Inspiration Gathering (Phase A2) and write `/docs/design/INSPIRATION.md`
- [ ] HITL checkpoint: Approve inspiration direction
- [ ] Select UI Profile (Cool Professional vs Satin Dark vs Custom)
- [ ] Write `/docs/design/UI-PROFILE.md` (human) + `/docs/design/ui-profile.json` (machine)
- [ ] HITL checkpoint: Approve UI profile (this becomes source of truth for Step 4/5/6/11)
- [ ] Wait for user approval before proceeding

### Phase B: User Journey Mapping
- [ ] Draft primary user journey (main persona, high-value flow)
- [ ] **Delight Metric**: Define specific "delight" moment in journey.
- [ ] Draft secondary user journey (alternative paths)
- [ ] Map state coverage for each key screen (empty/loading/error/success/offline)
- [ ] Identify conversion funnel metrics (AARRR)
- [ ] Document drop-off points and friction analysis
- [ ] HITL checkpoint: Present user journeys with state coverage
- [ ] Wait for user approval before proceeding

### Phase C: Information Architecture
- [ ] Design content hierarchy (primary/secondary navigation)
- [ ] Define navigation model (hub-and-spoke, nested, sequential, flat)
- [ ] Plan progressive disclosure strategy
- [ ] Define deep linking and URL structure
- [ ] HITL checkpoint: Present IA and navigation structure
- [ ] Wait for user approval before proceeding

### Phase D: Interface States & Interactions
- [ ] Define core UI patterns (data display, forms, navigation, feedback)
- [ ] Specify interaction patterns (touch targets, gestures, hover, focus)
- [ ] Document state specifications for each major screen
- [ ] Define animations and micro-interactions
- [ ] HITL checkpoint: Present interface patterns and state specs
- [ ] Wait for user approval before proceeding

### Phase E: Accessibility Requirements
- [ ] Define WCAG 2.2 Level AA compliance requirements
- [ ] Plan keyboard navigation (tab order, skip links, shortcuts)
- [ ] Specify screen reader support (ARIA landmarks, labels, live regions)
- [ ] Document inclusive design considerations (color-blind, reduced motion)
- [ ] HITL checkpoint: Present accessibility specifications
- [ ] Wait for user approval before proceeding

### Phase F: Mobile & Responsive Design
- [ ] Define breakpoint strategy (mobile, tablet, desktop, large)
- [ ] Plan mobile-first design approach
- [ ] Specify responsive patterns (content reflow, navigation transformation)
- [ ] Document platform conventions (iOS HIG, Material Design)
- [ ] HITL checkpoint: Present responsive and mobile strategy
- [ ] Wait for user approval before proceeding

### Phase G: Conversion Optimization
- [ ] Conduct friction analysis (forms, steps, cognitive load)
- [ ] Apply Fogg Behavior Model (motivation, ability, trigger)
- [ ] Define conversion tactics (CTAs, progress indicators, social proof)
- [ ] HITL checkpoint: Present conversion optimization strategy
- [ ] Wait for user approval before proceeding

### Phase H: Document Assembly & File Creation
- [ ] Assemble complete UX specification document
- [ ] Write `/docs/ux/UX-DESIGN.md`
- [ ] Write `/docs/ux/DESIGN-PRINCIPLES.md`
- [ ] Write `/docs/journeys/USER-JOURNEYS.md`
- [ ] Write `/docs/journeys/STATE-COVERAGE.md`
- [ ] Write `/docs/ux/INFORMATION-ARCHITECTURE.md`
- [ ] Write `/docs/ux/INTERFACE-PATTERNS.md`
- [ ] Write `/docs/ux/ACCESSIBILITY.md`
- [ ] Write `/docs/ux/RESPONSIVE.md`
- [ ] Write `/docs/ux/CONVERSION.md`
- [ ] Verify all quality gates pass
- [ ] FINAL checkpoint: Present complete UX documentation
- [ ] Wait for final user approval

**Next Step:** Step 4 (Flow Tree & Screen Architecture) for comprehensive screen mapping
```

**Execution Rules**:
- ✅ Check off EACH task as you complete it
- ✅ Do NOT skip ahead - complete tasks in order
- ✅ Do NOT proceed to next phase until user approves current phase
- ✅ Use MCP search for ALL research tasks
- ✅ Take notes as you work to maintain context
- ✅ Write files in small chunks to avoid editor limits

---

## Inputs to capture (ask, then echo back as a table)
- **Stack Profile**: Read `/docs/stack-profile.json` (defines Web vs. Mobile context)
- PRD from Step-1 (path to `/docs/specs/MASTER_PRD.md`)
- Architecture from Step-2 (path to `/docs/architecture/ARCHITECTURE.md`)
- User personas from Step-1 (primary and secondary users)
- Device/platform targets (web, iOS, Android, desktop)
- Accessibility requirements (WCAG 2.1 AA/AAA, screen reader support)
- Conversion goals (signup, trial, purchase, engagement)
- Brand guidelines (if any existing visual identity)
- **UI Profile preference**: Cool Professional | Satin Dark / Soft Depth | Playful Gamified | Custom
- Optional: `detail:deep` to expand sections

> Ground rules: If any item is unknown, ask concise HITL questions now and proceed with clearly flagged assumptions.

---

## Persona Pack (used throughout)
- **Staff UX Lead (FAANG)** – **Jobs-to-be-Done** framework, user journey mapping, **state coverage** (empty/loading/error/success), conversion optimization, **Nielsen's heuristics**, accessibility standards.
- **Interaction Designer (FAANG)** – micro-interactions, animation choreography, **physics-based transitions**, feedback responsiveness (haptics, sound, visual), **Fitts's Law** for touch targets.
- **Accessibility Specialist (WCAG Expert)** – **WCAG 2.2** compliance, ARIA patterns, keyboard navigation, screen reader testing, color contrast (4.5:1 text, 3:1 UI), **POUR principles** (Perceivable, Operable, Understandable, Robust).
- **Mobile UX Designer (iOS/Android)** – platform conventions (Human Interface Guidelines, Material Design), gesture patterns, native component usage, responsive breakpoints, **thumb zones**.
- **Conversion Optimizer** – funnel analysis, **AARRR metrics** (Acquisition, Activation, Retention, Referral, Revenue), **Fogg Behavior Model** (motivation, ability, trigger), A/B testing strategy, friction point analysis.
- **Information Architect** – content hierarchy, **navigation models** (hub-and-spoke, nested, sequential), taxonomy, progressive disclosure, search and filtering.
- **Research Analyst** – time-boxed web/MCP research (current-year aware), UX trends, pattern libraries, source curation.

> Tone: user-centric, empathetic, conversion-focused. Cite sources in `/docs/research/UX-SOURCES-${TODAY}.md`. Use YEAR in recency filters.

---

## Phase A — UX Research (current-year aware)
**Goal:** Ground UX decisions in current best practices, user behavior research, and proven patterns.

1) Build YEAR-aware queries (e.g., "mobile UX trends {YEAR}", "conversion optimization patterns {YEAR}", "WCAG 2.2 {YEAR}", "micro-interactions best practices {YEAR}", "progressive web app patterns {YEAR}").  
2) Run **MCP search** if available; else use web browsing.  
3) Capture **5–10 sources** with titles, dates, and permalinks; group by topic:
   - UX patterns and trends (component libraries, interaction patterns)
   - Accessibility standards (**WCAG 2.2**, **ARIA** patterns, inclusive design)
   - Conversion optimization (**Fogg Model**, friction analysis, CRO tactics)
   - Mobile UX (iOS HIG, Material Design updates, gesture patterns)
   - User research methodologies (Jobs-to-be-Done, usability testing)
4) Write `/docs/research/UX-SOURCES-${TODAY}.md` with a 1-page **Research Summary** and a bulleted **Source List** (title, URL, date seen).

**HITL checkpoint →** Show the "current UX landscape" bullets and sources.  
**Prompt:** "Add/remove sources or constraints? Reply `ok research` to continue."


## Phase A2 — Visual Inspiration Gathering (NEW - Interactive)
**Goal:** Collect design references and extract patterns BEFORE creating UX specifications.

### Why This Phase Exists
- Provides concrete visual direction (not just abstract descriptions)
- Extracts actual design tokens (colors, fonts, spacing) from real examples
- Aligns team on visual direction early
- Saves time in Step 6 (Design System) by having references

---

### Step 1: Prompt for Inspiration

**Interactive Prompt:**
> "## 🎨 Let's Gather Design Inspiration!
> 
> Do you have any visual references for this project?
> 
> **Options:**
> 1. `figma: [URL]` → I'll analyze your Figma file and extract design tokens
> 2. `screenshot: [describe or upload]` → I'll analyze design screenshots
> 3. `website: [URL]` → I'll analyze a live website's design
> 4. `similar: [product name]` → I'll find and analyze similar products
> 5. `dribbble: [URL]` → I'll analyze Dribbble shots
> 6. `skip` → I'll use industry best practices only
> 
> **You can provide multiple references!**
> 
> Examples:
> - `figma: https://figma.com/file/abc123`
> - `website: https://linear.app`
> - `similar: Notion, Airtable`
> - `skip`
> 
> Reply with your choice(s):"

---

### Step 2: Process User Response

#### **If user provides `figma: [URL]`:**
1. **Analyze Figma file** (if accessible):
   - Extract color palette (hex codes)
   - Extract typography (font families, sizes, weights)
   - Extract spacing patterns (margins, padding)
   - Extract component styles (buttons, cards, inputs)
   - Extract border radius, shadows, effects

2. **Create extraction report:**
   ```markdown
   ### Figma Analysis: [File Name]
   
   **Colors Extracted:**
   - Primary: #3B82F6 (Blue-600)
   - Secondary: #8B5CF6 (Purple-600)
   - Success: #10B981 (Green-500)
   - Error: #EF4444 (Red-500)
   - Neutral: #6B7280 (Gray-500)
   
   **Typography:**
   - Headings: Poppins (600, 700)
   - Body: Inter (400, 500)
   - Sizes: 12, 14, 16, 18, 20, 24, 32, 48px
   
   **Spacing:**
   - Base unit: 8px
   - Scale: 8, 16, 24, 32, 40, 48, 64px
   
   **Components:**
   - Button: Rounded-lg (8px), padding 12px 24px
   - Card: Rounded-xl (12px), shadow-md
   - Input: Rounded-md (6px), border gray-300
   ```

#### **If user provides `website: [URL]`:**
1. **Analyze live website** (using browser inspection):
   - Extract computed styles
   - Identify color palette
   - Identify font families and sizes
   - Note spacing patterns
   - Screenshot key components

2. **Create analysis report:**
   ```markdown
   ### Website Analysis: [Site Name]
   
   **Visual Style:**
   - Overall aesthetic: [Modern/Minimal/Bold/Playful]
   - Color scheme: [Monochromatic/Complementary/Triadic]
   - Whitespace usage: [Generous/Moderate/Compact]
   
   **Key Patterns:**
   - Navigation: [Top nav/Side nav/Bottom tabs]
   - Hero section: [Full-screen/Split/Centered]
   - Content layout: [Cards/List/Grid]
   - CTA style: [Primary button style description]
   
   **Extracted Tokens:**
   [Same format as Figma extraction]
   ```

#### **If user provides `similar: [product names]`:**
1. **Research similar products:**
   - Use **Exa MCP** to find product websites
   - Screenshot key pages (homepage, dashboard, pricing)
   - Analyze common patterns across products

2. **Create comparison report:**
   ```markdown
   ### Similar Products Analysis
   
   **Products Analyzed:**
   1. [Product 1] - [URL]
   2. [Product 2] - [URL]
   3. [Product 3] - [URL]
   
   **Common Patterns:**
   - All use: [Common pattern 1]
   - Most use: [Common pattern 2]
   - Unique to [Product]: [Unique pattern]
   
   **Recommendations:**
   - Adopt: [Pattern to use]
   - Differentiate: [How to be different]
   - Avoid: [Pattern to avoid]
   ```

#### **If user provides `screenshot: [description]`:**
1. **Request upload** (if not already provided)
2. **Analyze screenshot:**
   - Identify visual style
   - Extract approximate colors
   - Note typography choices
   - Identify component patterns

#### **If user provides `dribbble: [URL]`:**
1. **Analyze Dribbble shot:**
   - Extract visual style
   - Note color palette
   - Identify trendy patterns
   - Document inspiration notes

#### **If user provides `skip`:**
1. **Use industry best practices:**
   - Reference Material Design 3
   - Reference Apple Human Interface Guidelines
   - Use modern, accessible defaults
   - Document rationale for choices

---

### Step 3: Create Inspiration Documentation

**Generate:** `/docs/design/INSPIRATION.md`

```markdown
# Design Inspiration

**Date:** [Current Date]  
**Sources:** [Number] references provided

---

## Visual References

### Reference 1: [Name/URL]
**Type:** [Figma/Website/Screenshot/Similar Product]  
**Why this reference:** [What we like about it]

**Screenshots/Links:**
- [Link or embedded image]

**Key Takeaways:**
- [Pattern 1 to adopt]
- [Pattern 2 to consider]
- [Pattern 3 to differentiate from]

---

[Repeat for each reference]

---

## Extracted Design Tokens

### Colors
| Token | Hex | Usage | Source |
|-------|-----|-------|--------|
| Primary | #3B82F6 | CTAs, links, brand | [Reference 1] |
| Secondary | #8B5CF6 | Accents, highlights | [Reference 1] |
| Success | #10B981 | Success states | Industry standard |
| Error | #EF4444 | Error states | Industry standard |
| Neutral-900 | #111827 | Text primary | [Reference 1] |
| Neutral-500 | #6B7280 | Text secondary | [Reference 1] |
| Neutral-100 | #F3F4F6 | Backgrounds | [Reference 1] |

### Typography
| Token | Value | Usage | Source |
|-------|-------|-------|--------|
| Font-Heading | Poppins | H1-H6 | [Reference 1] |
| Font-Body | Inter | Body text, UI | [Reference 1] |
| Size-xs | 12px | Captions | Extracted |
| Size-sm | 14px | Small text | Extracted |
| Size-base | 16px | Body | Extracted |
| Size-lg | 18px | Large body | Extracted |
| Size-xl | 20px | H6 | Extracted |
| Size-2xl | 24px | H5 | Extracted |

### Spacing
| Token | Value | Usage | Source |
|-------|-------|-------|--------|
| space-2 | 8px | Tight spacing | Extracted |
| space-4 | 16px | Normal spacing | Extracted |
| space-6 | 24px | Comfortable spacing | Extracted |
| space-8 | 32px | Generous spacing | Extracted |

### Components
| Component | Style Notes | Source |
|-----------|-------------|--------|
| Button | Rounded-lg, padding 12px 24px, shadow-sm | [Reference 1] |
| Card | Rounded-xl, padding 24px, shadow-md | [Reference 1] |
| Input | Rounded-md, border gray-300, focus ring | [Reference 1] |

---

## Design Direction

**Overall Aesthetic:** [Modern/Minimal/Bold/Playful/Professional]

**Key Principles:**
1. [Principle 1 from references]
2. [Principle 2 from references]
3. [Principle 3 from references]

**Differentiation Strategy:**
- **Adopt:** [Patterns to use from references]
- **Adapt:** [Patterns to modify for our use case]
- **Avoid:** [Patterns to deliberately not use]

---

## Recommendations for Step 6

When creating the Design System (Step 6):
- ✅ Use extracted color palette as starting point
- ✅ Use extracted typography for font selection
- ✅ Use extracted spacing as base unit
- ✅ Reference component styles for consistency
- ⚠️ Validate all colors for WCAG contrast ratios
- ⚠️ Ensure fonts are licensed/available
- ⚠️ Adapt patterns to our specific use case

---

**Created:** [Date]  
**References:** [Number] sources analyzed  
**Status:** Ready for Step 4 (Flow Tree) → Step 6 (Design System)
```

---

**Generate:** `/docs/design/EXTRACTED-PATTERNS.md`

```markdown
# Extracted Design Patterns

**Date:** [Current Date]  
**Purpose:** Quick reference for extracted design tokens

---

## Color Palette (Copy-Paste Ready)

```css
/* Primary Colors */
--color-primary-50: #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* Main */
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;
--color-primary-950: #172554;

/* [Additional color scales extracted] */
```

---

## Typography (Copy-Paste Ready)

```css
/* Font Families */
--font-heading: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing (Copy-Paste Ready)

```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

---

## Component Styles (Copy-Paste Ready)

```css
/* Button Styles */
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--color-primary-600);
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.btn-primary:hover {
  background: var(--color-primary-700);
}

/* Card Styles */
.card {
  padding: 24px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--color-neutral-200);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Input Styles */
.input {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid var(--color-neutral-300);
  font-size: 16px;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
```

---

**Status:** ✅ Ready for use in Step 4
```

---

**HITL checkpoint →** Present inspiration analysis and extracted patterns.

**Prompt:**
> "## 🎨 Inspiration Analysis Complete!
> 
> ### 📊 Summary:
> - **References analyzed:** [X]
> - **Colors extracted:** [Y] tokens
> - **Fonts identified:** [Font names]
> - **Patterns documented:** [Z] components
> 
> ### 📄 Files Created:
> - `/docs/design/INSPIRATION.md` (full analysis with screenshots/links)
> - `/docs/design/EXTRACTED-PATTERNS.md` (copy-paste ready tokens)
> 
> ### 🎯 Key Takeaways:
> - [Takeaway 1]
> - [Takeaway 2]
> - [Takeaway 3]
> 
> **These extracted tokens will be used in Step 6 (Design System).**
> 
> Reply `approve inspiration` to continue to Phase B (User Journey Mapping), or
> Reply `add more: [reference]` to add additional references."

---

---

## Phase B — User Journey Mapping
1) From PRD personas + architecture, draft **primary user journeys**:
   - **Journey 1** (primary persona, high-value flow)
   - **Journey 2** (secondary persona or alternative path)
   - Each journey includes:
     - **Goal** (what user wants to accomplish)
     - **Steps** (screens and actions)
     - **Decision points** (where user chooses path)
     - **Pain points** (potential friction)
     - **Success criteria** (how user knows they succeeded)

2) Map **state coverage** for each key screen:
   - **Empty state** (first-time user, no data)
   - **Loading state** (skeleton screens, spinners)
   - **Error state** (network errors, validation errors)
   - **Success/populated state** (data loaded, actions available)
   - **Offline state** (if applicable for PWA)

3) Identify **conversion funnel** metrics:
   - Entry point → activation → engagement → retention → referral
   - Drop-off points and friction analysis
   - Conversion optimization opportunities

4) **Data Flow Awareness (NEW — Bridges UX to Backend)**:
   
   For each journey step, document the data requirements:

   ```markdown
   ### Journey: [Journey Name] — Data Flow
   
   | Step | Screen | Data Needed (READ) | Operations (WRITE) | Real-Time? |
   |------|--------|-------------------|-------------------|------------|
   | 1 | Login | None | Create session | No |
   | 2 | Dashboard | User profile, Activity list | None | Yes - activity |
   | 3 | Create Item | Categories, Templates | Create item | No |
   | 4 | Success | Created item details | None | No |
   ```

   **For each screen, answer:**
   - **What data must be displayed?** (entities, fields, relationships)
   - **What can the user modify?** (forms, inline edits)
   - **What validation is needed?** (client-side, server-side)
   - **What triggers a mutation?** (button clicks, form submits)
   - **Does it need real-time updates?** (WebSocket, polling)

   **Data Flow Summary:**
   ```markdown
   ## Data Flow Summary for [Journey Name]
   
   ### Entities Touched
   - [Entity 1]: READ at steps [X, Y], WRITE at step [Z]
   - [Entity 2]: READ at steps [A], no writes
   
   ### Real-Time Requirements
   - [Screen X]: Live updates needed for [data type]
   - [Screen Y]: No real-time requirements
   
   ### Validation Points
   - [Form 1]: Email format, password strength
   - [Form 2]: Required fields, unique constraint
   ```

   **Why This Matters:**
   - This data flows directly into Step 5's Backend Data Operations
   - Prevents designing screens that need data that doesn't exist
   - Ensures backend team knows what to build before UI is complete
   - Makes Step 11 PRDs accurate from day one

**HITL checkpoint →** Present user journeys with state coverage and data flow.  
**Prompt:** "Approve user journeys? Reply `approve journeys` or `revise: …`."

---

## Phase C — Information Architecture
1) **Content hierarchy**:
   - Primary navigation structure
   - Secondary navigation (breadcrumbs, contextual menus)
   - Deep linking and URL structure
   - Search and filter patterns

2) **Navigation model**:
   - Hub-and-spoke (dashboard-centric)
   - Nested (hierarchical drill-down)
   - Sequential (wizard/onboarding flows)
   - Flat (minimal hierarchy)

3) **Progressive disclosure**:
   - What's visible by default
   - What's revealed on interaction
   - What requires explicit action
   - Complexity management strategy

**HITL checkpoint →** Show IA and navigation structure.  
**Prompt:** "Approve information architecture? Reply `approve ia` or `revise: …`."

---

## Phase D — Interface States & Interactions
1) **Core UI patterns**:
   - **Data display** (lists, tables, cards, grids)
   - **Forms** (inputs, validation, multi-step)
   - **Navigation** (tabs, drawers, modals, bottom sheets)
   - **Feedback** (toasts, alerts, inline messages)
   - **Loading** (spinners, progress bars, skeleton screens)

2) **Interaction patterns**:
   - **Touch targets** (minimum 44x44px for mobile)
   - **Gestures** (swipe, long-press, pinch-to-zoom)
   - **Hover states** (desktop-only, reveal actions)
   - **Focus states** (keyboard navigation, accessibility)
   - **Animations** (page transitions, micro-interactions)

3) **State specifications** for each major screen:
   - Visual layout and content organization
   - Interactive elements and their behaviors
   - Error handling and recovery paths
   - Loading and empty states
   - Success confirmations

**HITL checkpoint →** Show interface patterns and state specs.  
**Prompt:** "Approve interface states? Reply `approve states` or `revise: …`."

---

## Phase E — Accessibility Requirements
1) **WCAG 2.2 Level AA compliance**:
   - **Perceivable**: Alt text, captions, color contrast (4.5:1 text, 3:1 UI)
   - **Operable**: Keyboard navigation, focus management, no keyboard traps
   - **Understandable**: Clear labels, error identification, consistent navigation
   - **Robust**: Semantic HTML, ARIA labels, cross-browser compatibility

2) **Keyboard navigation**:
   - Logical tab order
   - Skip links for navigation
   - Keyboard shortcuts for power users
   - Focus indicators (visible 2px outline)

3) **Screen reader support**:
   - ARIA landmarks (banner, navigation, main, complementary, contentinfo)
   - ARIA labels and descriptions
   - Live regions for dynamic content
   - Form field associations (label + input)

4) **Inclusive design**:
   - Color-blind friendly (don't rely on color alone)
   - Reduced motion support (prefers-reduced-motion)
   - Text scaling (up to 200%)
   - Clear language (grade 8 reading level)

**HITL checkpoint →** Confirm accessibility requirements.  
**Prompt:** "Approve accessibility specs? Reply `approve a11y` or `revise: …`."

---

### Phase F — Mobile & Responsive Design
1) **Check Stack Profile**:
   - **If Web**: Focus on Responsive Breakpoints (Mobile → Tablet → Desktop).
   - **If Mobile (Expo)**: Focus on Native Navigation (Tabs/Stacks) and Safe Areas.

2) **Responsive / Adaptive Strategy**:
   - **Web**: CSS Media Queries, Container Queries.
   - **Mobile**: Platform-specific layouts (iOS vs Android), Orientation changes.

3) **Navigation Patterns**:
   - **Web**: Top/Side Nav, Mega Menu, Footer.
   - **Mobile**: Bottom Tabs, Stack Navigation, Drawer, Modals.

4) **Platform conventions**:
   - iOS: native gestures, SF Symbols, Human Interface Guidelines
   - Android: Material Design 3, FABs, navigation rail
   - Web: progressive web app features, installability

**HITL checkpoint →** Confirm responsive and mobile strategy.  
**Prompt:** "Approve responsive design? Reply `approve responsive` or `revise: …`."

---

## Phase G — Conversion Optimization

### 0) Persuasion Layer Cues (Cialdini + NESB Integration)

**Visual implementations of persuasion psychology throughout UX:**

#### Commitment Micro-Interactions (Small Yes → Big Yes)

Design progressive commitment into your conversion flows:

| Step | Commitment Level | UX Implementation |
|------|------------------|-------------------|
| 1 | Micro | Scroll past hero, hover on CTA |
| 2 | Small | Click CTA button (opens modal/form) |
| 3 | Medium | Enter email only (2-step opt-in) |
| 4 | Medium | Answer preference question |
| 5 | Large | Complete full form / Start trial |

**Design Patterns:**
- [ ] **2-Step Opt-In**: CTA opens modal → then form (25-40% higher conversion)
- [ ] **Quiz/Survey Start**: Low-friction entry → builds commitment
- [ ] **Progress Indicators**: Show progress to create completion bias
- [ ] **Checkbox Confirmation**: "Yes, I want [benefit]" before submit

#### Trust Signal Placement (Authority + Social Proof)

| Signal Type | Placement | Purpose |
|-------------|-----------|---------|
| **User Count** | Hero section, near primary CTA | Social proof at decision point |
| **Star Ratings** | Hero section, pricing cards | Authority + social proof |
| **Testimonials** | After each major section | Reinforce benefits with proof |
| **Logos (As Seen In)** | Below hero, footer | Authority transfer |
| **Security Badges** | Forms, checkout, footer | Risk reversal / SAFE trigger |
| **Guarantees** | Pricing section, CTAs | Risk reversal / SAFE trigger |
| **Real-Time Activity** | Floating notification | Social proof + urgency |

**Placement Rule:** Trust signals should appear within 100px of every CTA.

#### NESB Visual Cues

| Trigger | UX Implementation |
|---------|-------------------|
| **NEW** | "New" badges, "Just launched" labels, mechanism diagrams |
| **EASY** | Step counters ("3 simple steps"), time estimates ("15 min setup") |
| **SAFE** | Guarantee badges, security icons, "Risk-free" labels, testimonials |
| **BIG** | Large outcome numbers, progress visualizations, transformation imagery |

#### Five Drivers in UX

| Driver | UX Implementation |
|--------|-------------------|
| **Encourage Dreams** | Success state celebrations, achievement animations, future-state imagery |
| **Justify Failures** | Onboarding copy: "If you've struggled with X, it wasn't your fault" |
| **Allay Fears** | Inline reassurances, FAQ tooltips, guarantee prominence |
| **Confirm Suspicions** | Comparison tables showing "what they told you" vs "reality" |
| **Throw Rocks at Enemies** | "Unlike [old way]" messaging, competitor comparison |

---

### 1) Outcome-Based CTA Design (Hormozi Method)
**Primary Formula**: [Action Verb] + [Specific Outcome] + [Timeframe if true]

**✅ GOOD Examples**:
- "Generate Your PRD in 15 Minutes"
- "Start Saving 10 Hours/Week"
- "Get 10 Templates Free"
- "See Your Results Now"

**❌ BANNED Phrases** (never use alone):
- "Submit"
- "Click Here"
- "Sign Up" (unless paired: "Sign Up to Ship in 15 Min")
- "Learn More" (vague)

**Accepted Variants**:
- **Outcome + Risk Reversal**: "Start Your Trial — Cancel Anytime"
- **Outcome + Objection Removed**: "See a Live Example (No Signup)"
- **Number-Led**: "Get 10 Templates Free"

### 2) Fast Win Requirement (Hard Requirement)
**Deliver clear value ≤120 seconds post-opt-in** (prefer instant)

**Qualifies as Fast Win**:
- Immediate template/pack download
- Sample output from short input
- Interactive demo with pre-filled data
- 90-second quickstart video + checklist

**Login Policy**:
- Prefer NO login for fast win
- If login needed: SSO, pre-fill fields, 1-click sample data
- First success must still be <2 min

### 3) 2-Step Opt-In Pattern (Recommended)
**When to Use** (boosts micro-commitment):
- ✅ Cold traffic (ads, SEO)
- ✅ Higher-commitment asks (demo, pricing access)
- ✅ Multi-field forms

**When to Skip** (show form immediately):
- Value is obvious/urgent (instant download)
- Audience is warm (retargeting, email list)
- One field only (email)
- Compliance requires all fields on same screen

**Implementation**:
- **Step 1**: Low-commitment button ("Yes, I Want [Outcome]") — no form visible
- **Step 2**: Reveal minimal form (name + email max)
  - Privacy line: "No spam. Unsubscribe anytime."
  - Social proof: "1,427 people joined this week"
- **Step 3**: Instant Win (<120 sec) — template, demo, or sample output

### 4) Friction Analysis
- Form fields (minimize required fields)
- Steps to goal (reduce clicks/taps)
- Cognitive load (simplify decisions)
- Trust signals (social proof, security badges)

### 5) Fogg Behavior Model Application
- **Motivation** (benefits, pain relief, social proof)
- **Ability** (simplicity, time, effort)
- **Trigger** (call-to-action, notifications, prompts)

### 6) Additional Conversion Tactics
- Primary CTAs (high contrast, outcome-based copy)
- Secondary actions (subtle, low-commitment)
- Progress indicators (multi-step flows)
- Exit intent (save progress, offer help)
- Social proof (testimonials, user counts)

**HITL checkpoint →** Confirm CTA design, fast win, 2-step opt-in, and conversion strategy.  
**Prompt:** "Approve conversion strategy? Reply `approve conversion` or `revise: …`."

---

## Phase H — Assemble the UX Specification (paste back + write files)
**UX Document Outline:**
1) UX Strategy Overview
   - Design principles
   - User-centered approach
   - Conversion goals
2) User Journey Maps
   - Primary journeys with state coverage
   - Secondary journeys
   - Funnel metrics and optimization
3) Information Architecture
   - Navigation structure
   - Content hierarchy
   - Progressive disclosure
4) Interface States & Interactions
   - UI pattern library
   - State specifications
   - Micro-interactions
5) Accessibility Requirements
   - WCAG 2.2 Level AA compliance
   - Keyboard navigation
   - Screen reader support
6) Mobile & Responsive Design
   - Breakpoint strategy
   - Mobile-first patterns
   - Platform conventions
7) Conversion Optimization
   - Friction analysis
   - Fogg Behavior Model
   - CRO tactics
8) Testing & Validation
   - Usability testing plan
   - A/B testing opportunities
   - Accessibility testing
**Sources:** link to `/docs/research/UX-SOURCES-${TODAY}.md` (top 5 inline citations)

**Files to create/update**
- `/docs/ux/UX-DESIGN.md` (complete UX specification)
- `/docs/ux/DESIGN-PRINCIPLES.md` (design principles and guidelines)
- `/docs/journeys/USER-JOURNEYS.md` (all user journey maps)
- `/docs/journeys/STATE-COVERAGE.md` (empty/loading/error/success states)
- `/docs/ux/INFORMATION-ARCHITECTURE.md` (IA and navigation structure)
- `/docs/ux/INTERFACE-PATTERNS.md` (UI patterns and interactions)
- `/docs/ux/ACCESSIBILITY.md` (WCAG 2.2 compliance checklist)
- `/docs/ux/RESPONSIVE.md` (breakpoints and mobile-first strategy)
- `/docs/ux/CONVERSION.md` (CRO tactics and Fogg Model)
- `/docs/research/UX-SOURCES-${TODAY}.md` (from Phase A)
- `/docs/design/UI-PROFILE.md` (UI profile source of truth for Steps 4/5/6/11)
- `/docs/design/ui-profile.json` (machine-readable UI profile)

**Quality gates (must pass)**
- User journeys cover **empty/loading/error/success** states for key screens.
- **WCAG 2.2 Level AA** compliance checklist is complete.
- **Touch targets** are minimum 44x44px for mobile.
- **Color contrast** meets 4.5:1 for text, 3:1 for UI components.
- **Keyboard navigation** is fully specified with tab order.
- **Responsive breakpoints** are defined with mobile-first approach.
- **Conversion funnel** has measurable metrics (AARRR).
- **CTAs are outcome-based** (not "Submit", "Click Here", "Sign Up" alone).
- **Fast win** specified (≤120 sec post-opt-in value delivery).
- **2-step opt-in** pattern specified for high-friction forms.
- Research file has **5–10 credible sources** with URLs and dates.

**Heuristics Checklist (Hormozi Method)** - Self-verify before finalizing:
- [ ] **Readability**: Customer-facing copy targets F-K grade 5-8?
  - Use Hemingway Editor (hemingwayapp.com) or Readable (readable.com)
  - **F-K Score Calculator** (Node.js):
  ```javascript
  import { syllable } from 'syllable';
  const fk = (text) => {
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).length;
    const words = (text.match(/\b\w+\b/g) || []).length;
    const syllables = (text.match(/\b\w+\b/g) || []).reduce((s,w)=>s+syllable(w),0);
    return 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59;
  };
  // Target: 5-8 for customer-facing copy
  // Legal/TOS can exceed 8 but must include plain-English summary at 5-8
  ```
- [ ] **CTAs**: All buttons state outcomes, not actions? (e.g., "Get [Outcome]" vs. "Submit")
- [ ] **Fast Win**: ≤120 sec post-opt-in value specified?
- [ ] **2-Step Opt-In**: Recommended for cold traffic and high-friction forms?
- [ ] **Contrast**: WCAG AA passed (4.5:1 text, 3:1 UI)?
- [ ] **Touch Targets**: 44x44px minimum for mobile?


**Pass/Fail Notes**:
- ✅ Passed: [list items that passed]
- ❌ Failed: [list items needing fixes, e.g., "CTA on pricing page says 'Submit' instead of outcome"]

---

## Final Review Gate (stop here)
**Prompt to user (blocking):**  
> "Please review the UX Specification and files.  
> 
> **Deliverables:**
> - ✅ UX Specification with user flows and journeys
> - ✅ Visual inspiration gathered and analyzed
> - ✅ Design principles and accessibility requirements defined
> 
> **Next Step:**
> - Proceed to **Step 4 (Flow Tree & Screen Architecture)** to create a comprehensive Mobbin-style screen map of your entire application.
> 
> • Reply `approve step 3` to proceed to Step 4 (Flow Tree), or  
> • Reply `revise step 3: <notes>` to iterate.  
> I won't continue until you approve."

---

## Fallback Micro-Roles (only used if specific expertise is missing)
- **User Research**: Jobs-to-be-Done interviews; usability testing; heuristic evaluation.
- **Journey Mapping**: State coverage (empty/loading/error/success); friction analysis; decision points.
- **Accessibility**: WCAG 2.2 guidelines; ARIA patterns; keyboard navigation; screen reader testing.
- **Mobile UX**: iOS HIG; Material Design; touch zones; gesture patterns; responsive breakpoints.
- **Conversion Optimization**: Fogg Behavior Model; AARRR funnel; friction reduction; trust signals.

---

<verification>
## Step 3 Verification Schema

### Required Files (25 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| UX Design Doc | /docs/ux/UX-DESIGN.md | 3KB | 5 |
| User Journeys | /docs/journeys/USER-JOURNEYS.md | 2KB | 4 |
| State Coverage | /docs/journeys/STATE-COVERAGE.md | 1KB | 3 |
| Inspiration | /docs/design/INSPIRATION.md | 500B | 3 |
| UI Profile (Human) | /docs/design/UI-PROFILE.md | 500B | 3 |
| UI Profile (Machine) | /docs/design/ui-profile.json | 200B | 2 |
| UX Research | /docs/research/UX-SOURCES-*.md | 500B | 5 |

### Required Sections (30 points)

| Document | Section | Points |
|----------|---------|--------|
| UX-DESIGN.md | ## Design Principles | 4 |
| UX-DESIGN.md | ## User Personas | 4 |
| UX-DESIGN.md | ## Information Architecture | 4 |
| UX-DESIGN.md | ## Conversion Optimization | 4 |
| USER-JOURNEYS.md | ## Primary Journey | 5 |
| STATE-COVERAGE.md | ## Empty States | 3 |
| STATE-COVERAGE.md | ## Loading States | 3 |
| STATE-COVERAGE.md | ## Error States | 3 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:UX-DESIGN.md:Visceral\|Behavioral\|Reflective | Don Norman framework applied | 6 |
| has_pattern:UX-DESIGN.md:WCAG | Accessibility mentioned | 5 |
| has_pattern:UX-DESIGN.md:44.*px\|touch.target | Touch target specs | 4 |
| has_table:USER-JOURNEYS.md | Journey mapping table present | 5 |
| has_pattern:UX-DESIGN.md:CTA.*outcome\|outcome.*CTA | Outcome-based CTAs specified | 5 |
| has_pattern:UX-DESIGN.md:120.*sec\|fast.win | Fast win requirement documented | 5 |
| has_pattern:UI-PROFILE.md:Selected Profile\|UI Profile | UI profile documented | 3 |
| json_valid:ui-profile.json | UI profile JSON is valid | 2 |

### Checkpoints (10 points)

| Checkpoint | Evidence | Points |
|------------|----------|--------|
| Research Approved | UX-SOURCES file exists with 5+ sources | 5 |
| Journeys Approved | USER-JOURNEYS.md has approval checkpoint | 5 |

### Success Criteria (10 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| State Coverage | All 4 states (empty/loading/error/success) documented | 4 |
| Mobile Addressed | Responsive/mobile strategy specified | 3 |
| Conversion Strategy | CTAs and fast win documented | 3 |

</verification>

