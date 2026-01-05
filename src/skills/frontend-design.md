---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Avoids generic AI aesthetics and generates creative, polished code."
version: "1.0.0"
triggers:
  - step-9-landing-page
  - scaffold
  - ui-healer
  - implement-prd
  - component-design
---

# Frontend Design Skill

This skill guides creation of **distinctive, production-grade frontend interfaces** that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## When to Invoke

Invoke this skill when:
- Building UI components, pages, or applications
- Creating landing pages (Step 9)
- Healing UI issues (@ui-healer)
- Scaffolding new features (@scaffold)
- Any frontend implementation work

---

## Design Thinking Process

Before coding, understand the context and commit to a **BOLD aesthetic direction**:

### 1. Purpose Analysis
- What problem does this interface solve?
- Who uses it?
- What's the emotional response we want?

### 2. Tone Selection

Pick an extreme - don't be generic:

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

### 3. Differentiation Question

Ask: **What makes this UNFORGETTABLE?** What's the one thing someone will remember?

---

## Typography Guidelines

### Font Selection Rules

**NEVER USE:**
- Inter (the most overused "AI font")
- Roboto
- Arial
- System fonts
- Open Sans
- Lato

**INSTEAD USE:**

| Category | Example Fonts | When to Use |
|----------|---------------|-------------|
| **Display/Headers** | Playfair Display, Bebas Neue, Clash Display, Satoshi, Cabinet Grotesk | Headlines, hero text |
| **Body** | Source Serif Pro, IBM Plex Sans, Nunito Sans, DM Sans | Long-form reading |
| **Mono** | JetBrains Mono, Fira Code, Berkeley Mono | Code, technical |
| **Unique** | Fraunces, Newsreader, Syne, Space Mono | Brand differentiation |

### Font Pairing Strategy

```css
/* Example: Editorial feel */
--font-display: 'Playfair Display', serif;
--font-body: 'Source Serif Pro', serif;

/* Example: Modern tech */
--font-display: 'Cabinet Grotesk', sans-serif;
--font-body: 'DM Sans', sans-serif;

/* Example: Playful */
--font-display: 'Syne', sans-serif;
--font-body: 'Nunito Sans', sans-serif;
```

---

## Color Strategy

### Avoid Clichés

**NEVER USE:**
- Purple gradients on white (the universal AI look)
- Generic blue (#3B82F6) without customization
- Evenly-distributed rainbow palettes

### Instead: Dominant + Accent

```css
/* BAD: Timid, even distribution */
:root {
  --color-1: #3B82F6;
  --color-2: #8B5CF6;
  --color-3: #EC4899;
  --color-4: #10B981;
}

/* GOOD: Dominant with sharp accents */
:root {
  --color-bg: #0A0A0A;           /* 80% of UI */
  --color-surface: #1A1A1A;      /* 15% of UI */
  --color-accent: #FF6B35;       /* 5% - pops */
  --color-text: #FAFAFA;
}
```

### Theme Inspiration Sources

Draw from:
- IDE themes (Dracula, Nord, Catppuccin, Gruvbox)
- Film color grades
- Architecture and interior design
- Cultural aesthetics (Japanese minimalism, Scandinavian hygge, Memphis design)

---

## Motion & Animation

### Priority: High-Impact Moments

One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

```css
/* Staggered reveal on page load */
.card {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease-out forwards;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Micro-Interactions

Focus on:
- Button hover states that surprise
- Input focus animations
- Scroll-triggered reveals
- Loading state transitions

### Accessibility

Always respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Spatial Composition

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
  background: var(--color-surface);
  padding: 2rem;
}
```

### Asymmetry

Don't center everything. Create visual tension:

```css
/* Asymmetric grid */
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
}
```

### Generous Negative Space

White space is a feature, not wasted space:

```css
.section {
  padding: clamp(4rem, 10vw, 8rem) 0;
}

.content {
  max-width: 65ch; /* Optimal reading width */
}
```

---

## Backgrounds & Textures

### Create Atmosphere

Don't default to solid colors:

```css
/* Gradient mesh */
.hero {
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(255, 119, 115, 0.2) 0%, transparent 50%),
    #0A0A0A;
}

/* Noise texture overlay */
.surface::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

---

## Component Examples

### Button (Not Generic)

```tsx
// ❌ BAD: Generic AI button
<button className="bg-blue-500 text-white px-4 py-2 rounded-md">
  Click me
</button>

// ✅ GOOD: Distinctive button
<button className="
  relative overflow-hidden
  bg-gradient-to-r from-orange-500 to-rose-500
  text-white font-medium
  px-6 py-3
  rounded-full
  shadow-lg shadow-orange-500/25
  transition-all duration-300
  hover:shadow-xl hover:shadow-orange-500/40
  hover:scale-105
  active:scale-95
  group
">
  <span className="relative z-10">Get Started</span>
  <div className="
    absolute inset-0 
    bg-gradient-to-r from-rose-500 to-orange-500
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  " />
</button>
```

### Card (With Character)

```tsx
<div className="
  relative
  bg-zinc-900/80 backdrop-blur-xl
  border border-zinc-800
  rounded-2xl
  p-6
  shadow-2xl
  transition-all duration-500
  hover:border-zinc-700
  hover:shadow-orange-500/10
  group
">
  {/* Glow effect */}
  <div className="
    absolute -inset-px
    bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0
    rounded-2xl
    opacity-0 group-hover:opacity-100
    transition-opacity duration-500
    blur-xl
  " />
  
  <div className="relative">
    {/* Content */}
  </div>
</div>
```

---

## Anti-Patterns Checklist

Before submitting any frontend code, verify:

- [ ] No Inter, Roboto, or Arial fonts
- [ ] No default Tailwind blue (#3B82F6) without customization
- [ ] No purple gradients on white backgrounds
- [ ] No perfectly centered, symmetrical layouts (unless intentional)
- [ ] No generic card-with-shadow components
- [ ] Animation/motion is present and intentional
- [ ] Color palette has clear hierarchy (dominant + accent)
- [ ] Typography has character (display + body pairing)
- [ ] There's at least one memorable/distinctive element

---

## Integration with SSS Protocol

### Step 9 (Landing Page)
Apply this skill's principles to create landing pages that convert AND impress.

### @scaffold
When generating UI scaffolds, inject distinctive defaults rather than generic templates.

### @ui-healer
When healing UI issues, don't just fix bugs—elevate the design using these principles.

### @implement-prd
When implementing PRD features with UI, reference this skill for aesthetic guidance.

---

## MCP Integration

When researching design patterns:

- Use `mcp_21st-devmagic_21st_magic_component_inspiration` for component ideas
- Use `mcp_exa_web_search_exa` for design trends and examples
- Use `mcp_Ref_ref_search_documentation` for framework-specific implementations

---

*Remember: Claude is capable of extraordinary creative work. Don't hold back—show what can truly be created when thinking outside the box and committing fully to a distinctive vision.*

