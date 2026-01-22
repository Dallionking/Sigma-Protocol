---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Avoids generic AI aesthetics and generates creative, polished code. Inspired by Claude's official frontend design skill."
version: "2.0.0"
triggers:
  - step-9-landing-page
  - scaffold
  - ui-healer
  - implement-prd
  - component-design
changelog:
  - "2.0.0: Major upgrade - Enhanced anti-AI-slop rules, expanded typography library, new background effects, better motion patterns"
  - "1.0.0: Initial release"
---

# Frontend Design Skill

This skill guides creation of **distinctive, production-grade frontend interfaces** that escape "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

> **"Models often have the ability to do more than they express by default. Skills are a way to access Claude's deeper capabilities when you need them."** — Anthropic

---

## 🚫 The AI Slop Problem

You know it when you see it:
- Inter font everywhere
- Purple-to-blue gradients
- Rounded corners galore
- Designs that scream "I asked AI to build this"

This is **distributional convergence** — the AI aesthetic monoculture. LLMs gravitate toward the most common patterns. The result? Every AI-generated design looks the same.

**This skill breaks that pattern.**

---

## When to Invoke

Invoke this skill when:
- Building UI components, pages, or applications
- Creating landing pages (Step 9)
- Healing UI issues (@ui-healer)
- Scaffolding new features (@scaffold)
- Any frontend implementation work
- You want to escape "AI slop"

---

## 🎯 Design Thinking Process

Before coding, understand the context and commit to a **BOLD aesthetic direction**:

### 1. Purpose Analysis
- What problem does this interface solve?
- Who uses it?
- What's the emotional response we want?

### 2. Tone Selection

**Pick an extreme - don't be generic:**

| Tone | Description | Example Use |
|------|-------------|-------------|
| **Brutally Minimal** | Sparse, essential, lots of white space | Portfolio, docs |
| **Maximalist Chaos** | Dense, layered, information-rich | Dashboards, data viz |
| **Retro-Futuristic** | Neon, grids, cyberpunk vibes | Gaming, crypto |
| **Organic/Natural** | Soft curves, earth tones, flowing | Wellness, food |
| **Luxury/Refined** | Gold accents, serif fonts, sophisticated | Finance, luxury goods |
| **Playful/Toy-like** | Bright colors, rounded, bouncy | Kids, casual apps |
| **Editorial/Magazine** | Strong typography, grid-based, clean | Media, publishing |
| **Brutalist/Raw** | Exposed structure, harsh, unpolished | Art, experimental |
| **Art Deco/Geometric** | Symmetry, gold, patterns | Events, hospitality |
| **Soft/Pastel** | Gentle colors, friendly, approachable | Consumer apps |
| **Industrial/Utilitarian** | Functional, no-nonsense, dark | Dev tools, B2B |
| **Neo-Tokyo** | High contrast, glitch, anime-inspired | Entertainment, music |
| **Scandinavian Clean** | Muted colors, functional beauty | Lifestyle, home |
| **Memphis Revival** | Bold shapes, clashing colors, patterns | Creative agencies |

### 3. Differentiation Question

Ask: **What makes this UNFORGETTABLE?** What's the one thing someone will remember?

---

## 🔤 Typography Guidelines

### BANNED FONTS (Never Use)

These fonts trigger instant "AI slop" recognition:

```
❌ Inter          — The #1 AI font. Instant generic look.
❌ Roboto         — Safe but soulless
❌ Arial          — Windows 95 called
❌ System fonts   — -apple-system, BlinkMacSystemFont
❌ Open Sans      — Overused to death
❌ Lato           — The "I didn't pick a font" font
❌ Poppins        — Used to be unique, now everywhere
❌ Space Grotesk  — Claude's previous favorite (avoid!)
```

### APPROVED FONTS (Use These)

**Display/Headlines:**

| Font | Vibe | Best For | Link |
|------|------|----------|------|
| Playfair Display | Elegant, editorial | Luxury, editorial | Google Fonts |
| Bebas Neue | Bold, condensed | Headlines, posters | Google Fonts |
| Clash Display | Modern, distinctive | Tech, startups | Fontshare |
| Cabinet Grotesk | Clean, geometric | Modern apps | Fontshare |
| Fraunces | Soft serif, quirky | Creative, playful | Google Fonts |
| Unbounded | Futuristic, rounded | Gaming, tech | Google Fonts |
| Instrument Serif | Classic editorial | Publishing, luxury | Google Fonts |
| Archivo Black | Powerful, impact | Sports, bold brands | Google Fonts |
| Bricolage Grotesque | Distinctive, warm | Startups, friendly | Google Fonts |
| Darker Grotesque | Tall, elegant | Fashion, lifestyle | Google Fonts |

**Body Text:**

| Font | Vibe | Best For | Link |
|------|------|----------|------|
| Source Serif Pro | Readable, classic | Long-form content | Google Fonts |
| IBM Plex Sans | Technical, clear | Enterprise, docs | Google Fonts |
| DM Sans | Clean, modern | Apps, dashboards | Google Fonts |
| Nunito Sans | Friendly, rounded | Consumer apps | Google Fonts |
| Satoshi | Balanced, versatile | Modern startups | Fontshare |
| General Sans | Clean, professional | Business apps | Fontshare |
| Plus Jakarta Sans | Geometric, modern | SaaS, tech | Google Fonts |
| Outfit | Geometric, warm | Friendly apps | Google Fonts |

**Monospace (Code):**

| Font | Vibe | Link |
|------|------|------|
| JetBrains Mono | Developer favorite | JetBrains |
| Fira Code | Ligatures, popular | Google Fonts |
| Berkeley Mono | Premium, clean | Berkeley Graphics |
| Commit Mono | Open source, neutral | GitHub |
| Geist Mono | Vercel's font | Vercel |

### Font Pairing Recipes

```css
/* Editorial/Magazine */
--font-display: 'Instrument Serif', serif;
--font-body: 'Source Serif Pro', serif;

/* Modern Tech Startup */
--font-display: 'Clash Display', sans-serif;
--font-body: 'Satoshi', sans-serif;

/* Playful Consumer App */
--font-display: 'Fraunces', serif;
--font-body: 'Nunito Sans', sans-serif;

/* Bold Statement */
--font-display: 'Bebas Neue', sans-serif;
--font-body: 'DM Sans', sans-serif;

/* Luxury/Premium */
--font-display: 'Playfair Display', serif;
--font-body: 'General Sans', sans-serif;

/* Developer Tools */
--font-display: 'Cabinet Grotesk', sans-serif;
--font-body: 'IBM Plex Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Futuristic */
--font-display: 'Unbounded', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;
```

### Typography Scale

Use a consistent scale with clear hierarchy:

```css
:root {
  /* Type Scale - 1.250 ratio (Major Third) */
  --text-xs: clamp(0.64rem, 0.58rem + 0.29vw, 0.8rem);
  --text-sm: clamp(0.8rem, 0.73rem + 0.36vw, 1rem);
  --text-base: clamp(1rem, 0.91rem + 0.45vw, 1.25rem);
  --text-lg: clamp(1.25rem, 1.14rem + 0.57vw, 1.563rem);
  --text-xl: clamp(1.563rem, 1.42rem + 0.71vw, 1.953rem);
  --text-2xl: clamp(1.953rem, 1.78rem + 0.89vw, 2.441rem);
  --text-3xl: clamp(2.441rem, 2.22rem + 1.11vw, 3.052rem);
  --text-4xl: clamp(3.052rem, 2.78rem + 1.39vw, 3.815rem);
}
```

---

## 🎨 Color Strategy

### Avoid Clichés

**BANNED COLOR PATTERNS:**

```
❌ Purple gradient on white — Universal AI look
❌ #3B82F6 (Tailwind blue-500) — Unmodified default
❌ #8B5CF6 (Tailwind violet-500) — AI purple
❌ Rainbow/evenly-distributed palettes — No hierarchy
❌ Generic corporate blue + gray — Soulless
```

### The 80-15-5 Rule

```css
/* BAD: Timid, even distribution */
:root {
  --color-1: #3B82F6;
  --color-2: #8B5CF6;
  --color-3: #EC4899;
  --color-4: #10B981;
}

/* GOOD: Dominant with sharp accent */
:root {
  --color-bg: #0A0A0A;           /* 80% of UI - Background */
  --color-surface: #1A1A1A;      /* 15% of UI - Cards/sections */
  --color-accent: #FF6B35;       /* 5% of UI - POPS */
  --color-text: #FAFAFA;
  --color-text-muted: #737373;
}
```

### Theme Palettes

**Dark Mode (Not Just Gray):**

```css
/* Warm Dark */
:root {
  --bg: #1C1917;          /* Stone-900 */
  --surface: #292524;     /* Stone-800 */
  --accent: #F97316;      /* Orange-500 */
}

/* Cool Dark */
:root {
  --bg: #0F172A;          /* Slate-900 */
  --surface: #1E293B;     /* Slate-800 */
  --accent: #06B6D4;      /* Cyan-500 */
}

/* True Black (OLED) */
:root {
  --bg: #000000;
  --surface: #0A0A0A;
  --accent: #22C55E;      /* Green-500 */
}
```

**Light Mode (Not Just White):**

```css
/* Warm Cream */
:root {
  --bg: #FFFBEB;          /* Amber-50 */
  --surface: #FEF3C7;     /* Amber-100 */
  --accent: #D97706;      /* Amber-600 */
  --text: #1C1917;
}

/* Cool Gray */
:root {
  --bg: #F8FAFC;          /* Slate-50 */
  --surface: #F1F5F9;     /* Slate-100 */
  --accent: #0EA5E9;      /* Sky-500 */
  --text: #0F172A;
}

/* Paper */
:root {
  --bg: #FAF9F6;          /* Off-white */
  --surface: #F5F4F1;
  --accent: #DC2626;      /* Red-600 */
  --text: #18181B;
}
```

### IDE-Inspired Themes

Draw from popular editor themes:

```css
/* Dracula */
:root {
  --bg: #282A36;
  --surface: #44475A;
  --accent: #BD93F9;
  --cyan: #8BE9FD;
  --green: #50FA7B;
  --pink: #FF79C6;
}

/* Nord */
:root {
  --bg: #2E3440;
  --surface: #3B4252;
  --accent: #88C0D0;
  --aurora-green: #A3BE8C;
  --aurora-purple: #B48EAD;
}

/* Catppuccin Mocha */
:root {
  --bg: #1E1E2E;
  --surface: #313244;
  --accent: #CBA6F7;      /* Mauve */
  --text: #CDD6F4;
}

/* Gruvbox Dark */
:root {
  --bg: #282828;
  --surface: #3C3836;
  --accent: #FE8019;      /* Orange */
  --aqua: #8EC07C;
}

/* Tokyo Night */
:root {
  --bg: #1A1B26;
  --surface: #24283B;
  --accent: #7AA2F7;
  --magenta: #BB9AF7;
}
```

---

## ✨ Motion & Animation

### Priority: High-Impact Moments

One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

### Page Load Animation (Essential)

```css
/* Staggered reveal */
.animate-in {
  opacity: 0;
  transform: translateY(24px);
  animation: slideUp 0.6s ease-out forwards;
}

.animate-in:nth-child(1) { animation-delay: 0.0s; }
.animate-in:nth-child(2) { animation-delay: 0.1s; }
.animate-in:nth-child(3) { animation-delay: 0.2s; }
.animate-in:nth-child(4) { animation-delay: 0.3s; }
.animate-in:nth-child(5) { animation-delay: 0.4s; }

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Effects (Make Them Count)

```css
/* Magnetic hover */
.magnetic {
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.magnetic:hover {
  transform: scale(1.05) translateY(-2px);
}

/* Glow on hover */
.glow-hover {
  transition: box-shadow 0.3s ease;
}
.glow-hover:hover {
  box-shadow: 
    0 0 20px rgba(var(--accent-rgb), 0.3),
    0 0 40px rgba(var(--accent-rgb), 0.2);
}

/* Border gradient reveal */
.border-reveal {
  position: relative;
  background: var(--surface);
}
.border-reveal::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, transparent 40%, var(--accent) 100%);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.border-reveal:hover::before {
  opacity: 1;
}
```

### Scroll Animations

```javascript
// Intersection Observer for scroll reveals
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Accessibility: Respect Reduced Motion

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

## 🌌 Backgrounds & Effects

### Never Default to Solid Colors

**Gradient Mesh:**

```css
.hero {
  background: 
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(120, 119, 198, 0.3) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 50%, rgba(255, 119, 115, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse 50% 80% at 50% 100%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
    #0A0A0A;
}
```

**Grid Pattern:**

```css
.grid-bg {
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

**Noise Texture:**

```css
.noise::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

**Dot Pattern:**

```css
.dots-bg {
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

**Aurora Effect:**

```css
.aurora {
  background: 
    linear-gradient(
      115deg,
      rgba(56, 189, 248, 0.2) 0%,
      rgba(232, 121, 249, 0.2) 25%,
      rgba(34, 197, 94, 0.2) 50%,
      rgba(250, 204, 21, 0.2) 75%,
      rgba(56, 189, 248, 0.2) 100%
    );
  background-size: 400% 400%;
  animation: aurora 15s ease infinite;
}

@keyframes aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 🧱 Component Examples

### Button (Distinctive)

```tsx
// ❌ BAD: Generic AI button
<button className="bg-blue-500 text-white px-4 py-2 rounded-md">
  Click me
</button>

// ✅ GOOD: Distinctive button with personality
<button className="
  group relative
  px-6 py-3
  bg-gradient-to-r from-amber-500 to-orange-600
  text-white font-medium
  rounded-xl
  shadow-lg shadow-orange-500/25
  transition-all duration-300
  hover:shadow-xl hover:shadow-orange-500/40
  hover:scale-[1.02]
  active:scale-[0.98]
  overflow-hidden
">
  <span className="relative z-10 flex items-center gap-2">
    Get Started
    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </span>
  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
</button>
```

### Card (With Character)

```tsx
<div className="
  group relative
  bg-zinc-900/80 backdrop-blur-xl
  border border-zinc-800/50
  rounded-2xl
  p-6
  transition-all duration-500
  hover:border-zinc-700
  hover:bg-zinc-900/90
  overflow-hidden
">
  {/* Gradient glow */}
  <div className="
    absolute -inset-px
    bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0
    rounded-2xl
    opacity-0 group-hover:opacity-100
    transition-opacity duration-500
    blur-xl
    -z-10
  " />
  
  {/* Content */}
  <div className="relative">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">Feature Title</h3>
    <p className="text-zinc-400">
      Description of the feature with enough detail to be helpful.
    </p>
  </div>
</div>
```

### Input (Elevated)

```tsx
<div className="relative group">
  <input
    type="text"
    placeholder="Enter your email"
    className="
      w-full
      px-4 py-3
      bg-zinc-900/50
      border border-zinc-800
      rounded-xl
      text-white placeholder:text-zinc-500
      transition-all duration-300
      focus:outline-none
      focus:border-orange-500/50
      focus:ring-2 focus:ring-orange-500/20
      focus:bg-zinc-900
    "
  />
  <div className="
    absolute inset-0
    rounded-xl
    bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0
    opacity-0 group-focus-within:opacity-100
    transition-opacity
    pointer-events-none
    -z-10
    blur-xl
  " />
</div>
```

---

## 📐 Spatial Composition

### Break the Grid (Intentionally)

```css
/* Unexpected overlap */
.hero-image {
  position: relative;
  z-index: 1;
}

.hero-text {
  position: relative;
  z-index: 2;
  margin-top: -4rem;
  margin-left: 2rem;
  background: var(--surface);
  padding: 2rem;
}
```

### Asymmetry Creates Interest

```css
/* Asymmetric hero layout */
.hero {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Offset sections */
.offset-section {
  padding-left: 10vw;
}
.offset-section:nth-child(even) {
  padding-left: 0;
  padding-right: 10vw;
}
```

### Generous Negative Space

```css
.section {
  padding: clamp(4rem, 12vw, 10rem) 0;
}

.content {
  max-width: 65ch; /* Optimal reading width */
}

/* Don't fear empty space */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
}
```

---

## ✅ Anti-Pattern Checklist

Before submitting any frontend code, verify:

### Typography
- [ ] No Inter, Roboto, Arial, or Space Grotesk
- [ ] Display font differs from body font
- [ ] Font sizes use a consistent scale
- [ ] Line heights are appropriate (1.5-1.6 for body)

### Color
- [ ] No unmodified Tailwind blue-500 (#3B82F6)
- [ ] No purple gradient on white background
- [ ] Clear 80-15-5 color hierarchy
- [ ] Accent color pops appropriately

### Layout
- [ ] Not everything is centered
- [ ] Some intentional asymmetry
- [ ] Generous padding/margins
- [ ] At least one memorable visual element

### Motion
- [ ] Page load animation present
- [ ] Hover states are distinctive
- [ ] Reduced motion respected
- [ ] Animations feel intentional

### Background
- [ ] Not a flat solid color
- [ ] Some depth/atmosphere
- [ ] Texture or gradient present

### Overall
- [ ] Would someone remember this design?
- [ ] Does it have personality?
- [ ] Is it distinctly NOT generic AI output?

---

## 🔗 Integration with Sigma Protocol

### Step 9 (Landing Page)
Apply this skill's principles to create landing pages that convert AND impress.

### @scaffold
When generating UI scaffolds, inject distinctive defaults rather than generic templates.

### @ui-healer
When healing UI issues, don't just fix bugs—elevate the design using these principles.

### @implement-prd
When implementing PRD features with UI, reference this skill for aesthetic guidance.

### @compound-engineering
After completing UI work, compound learnings about what worked into AGENTS.md.

---

## 🛠 MCP Integration

When researching design patterns:

- Use `mcp_21st-devmagic_21st_magic_component_inspiration` for component ideas
- Use `mcp_exa_web_search_exa` for design trends and examples
- Use `mcp_Ref_ref_search_documentation` for framework-specific implementations

---

*Remember: Claude is capable of extraordinary creative work. The defaults are safe, but you have access to so much more. Don't hold back—show what can truly be created when thinking outside the box and committing fully to a distinctive vision.*
