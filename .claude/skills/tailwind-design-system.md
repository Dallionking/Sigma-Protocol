---
name: tailwind-design-system
description: "Use when creating or maintaining Tailwind CSS design systems. Enforces best practices, prevents arbitrary values, ensures token consistency."
version: 1.0.0
triggers:
  - tailwind
  - design system
  - design tokens
  - CSS utilities
  - tailwind config
  - theme configuration
---

# Tailwind Design System Skill

This skill ensures consistent, maintainable Tailwind CSS design systems. It prevents arbitrary values, enforces token usage, and maintains design consistency across projects.

> **Philosophy:** A design system is a contract between designers and developers. Every utility class should map to a deliberate design decision, not an ad-hoc pixel value.

---

## Core Principles

### 1. Convention Over Configuration

**Always check existing conventions before adding new utilities.**

```bash
# Before adding a new spacing value, check what exists
grep -r "gap-" src/ --include="*.tsx" | head -20
grep -r "p-\|px-\|py-" src/ --include="*.tsx" | head -20
```

Ask yourself:
- Does a similar utility already exist?
- Can I use an existing token instead of creating a new one?
- Will this addition improve or fragment consistency?

### 2. Design Tokens Over Arbitrary Values

**Use tokens from tailwind.config.js or CSS variables. NEVER use arbitrary values.**

```tsx
// BAD: Arbitrary values break consistency
<div className="w-[347px] h-[89px] mt-[23px] text-[15px]">

// GOOD: Use the closest design token
<div className="w-80 h-24 mt-6 text-base">
```

If a design requires a specific value not in your system:
1. Question whether the design truly needs that exact value
2. If yes, add it to your theme configuration with a semantic name
3. Document WHY this token exists

### 3. Dark Mode Consistency

**If existing pages support dark mode, new pages MUST support it too.**

```tsx
// BAD: Breaks in dark mode
<div className="bg-white text-gray-900">

// GOOD: Responds to dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// BETTER: Use semantic tokens that handle it automatically
<div className="bg-background text-foreground">
```

### 4. Tailwind v4 CSS-First Configuration

**Tailwind v4 uses CSS-first configuration with @theme directive.**

```css
/* tailwind.css or global.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: oklch(0.7 0.15 250);
  --color-secondary: oklch(0.6 0.1 200);

  /* Spacing follows 4px base */
  --spacing-18: 4.5rem;

  /* Custom shadows */
  --shadow-soft: 0 2px 8px oklch(0 0 0 / 0.08);
}
```

---

## Token Hierarchy

### Colors (Semantic Naming)

Structure colors by purpose, not appearance:

```css
@theme {
  /* Base palette - raw colors (internal use) */
  --color-slate-50: oklch(0.984 0.003 247.858);
  --color-slate-900: oklch(0.208 0.042 265.755);

  /* Semantic tokens - what designers/devs use */
  --color-background: var(--color-slate-50);
  --color-foreground: var(--color-slate-900);

  --color-primary: oklch(0.623 0.214 259.815);
  --color-primary-foreground: oklch(0.984 0.003 247.858);

  --color-secondary: oklch(0.716 0.191 173.076);
  --color-secondary-foreground: oklch(0.208 0.042 265.755);

  --color-destructive: oklch(0.577 0.245 27.325);
  --color-destructive-foreground: oklch(0.984 0.003 247.858);

  --color-muted: oklch(0.968 0.007 247.896);
  --color-muted-foreground: oklch(0.554 0.046 257.417);

  --color-accent: oklch(0.968 0.007 247.896);
  --color-accent-foreground: oklch(0.208 0.042 265.755);

  --color-card: var(--color-background);
  --color-card-foreground: var(--color-foreground);

  --color-border: oklch(0.929 0.013 255.508);
  --color-input: oklch(0.929 0.013 255.508);
  --color-ring: var(--color-primary);
}
```

### Spacing (4px Base Scale)

Maintain a consistent 4px base unit:

| Token | Value | Pixels |
|-------|-------|--------|
| `0` | 0 | 0px |
| `px` | 1px | 1px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `1.5` | 0.375rem | 6px |
| `2` | 0.5rem | 8px |
| `2.5` | 0.625rem | 10px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| `20` | 5rem | 80px |
| `24` | 6rem | 96px |

```tsx
// Always use token-based spacing
<div className="p-4 gap-6 mt-8">  // 16px, 24px, 32px
```

### Typography

```css
@theme {
  /* Font families */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Font sizes with line heights */
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;

  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;

  --text-base: 1rem;
  --text-base--line-height: 1.5rem;

  --text-lg: 1.125rem;
  --text-lg--line-height: 1.75rem;

  --text-xl: 1.25rem;
  --text-xl--line-height: 1.75rem;

  --text-2xl: 1.5rem;
  --text-2xl--line-height: 2rem;

  --text-3xl: 1.875rem;
  --text-3xl--line-height: 2.25rem;

  --text-4xl: 2.25rem;
  --text-4xl--line-height: 2.5rem;

  /* Font weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Borders

```css
@theme {
  /* Border radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-DEFAULT: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* Border widths */
  --border-DEFAULT: 1px;
  --border-0: 0px;
  --border-2: 2px;
  --border-4: 4px;
  --border-8: 8px;
}
```

### Shadows (Elevation System)

```css
@theme {
  /* Elevation levels */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-DEFAULT: 0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 oklch(0 0 0 / 0.05);
  --shadow-none: 0 0 #0000;
}
```

---

## Deprecated Utilities (Tailwind v4)

These utilities were deprecated in Tailwind v4. Use the modern replacements:

| Deprecated | Replacement | Notes |
|------------|-------------|-------|
| `bg-opacity-*` | `bg-black/50` | Use color modifiers |
| `text-opacity-*` | `text-black/50` | Use color modifiers |
| `border-opacity-*` | `border-black/50` | Use color modifiers |
| `ring-opacity-*` | `ring-black/50` | Use color modifiers |
| `flex-shrink-*` | `shrink-*` | Simplified naming |
| `flex-shrink` | `shrink` | Simplified naming |
| `flex-grow-*` | `grow-*` | Simplified naming |
| `flex-grow` | `grow` | Simplified naming |
| `overflow-ellipsis` | `text-ellipsis` | More semantic |
| `decoration-slice` | `box-decoration-slice` | More specific |
| `decoration-clone` | `box-decoration-clone` | More specific |

```tsx
// BAD: Deprecated v3 syntax
<div className="bg-black bg-opacity-50 flex-shrink-0 overflow-ellipsis">

// GOOD: v4 syntax
<div className="bg-black/50 shrink-0 text-ellipsis">
```

---

## Anti-Patterns

### 1. Arbitrary Values

```tsx
// BAD: Arbitrary pixel values fragment the design system
<div className="w-[347px] mt-[23px] text-[15px] rounded-[7px]">

// GOOD: Use the closest design token
<div className="w-80 mt-6 text-base rounded-lg">

// If truly needed, extend your theme:
@theme {
  --width-card: 21.6875rem; /* 347px - documented reason */
}
```

### 2. Inline Styles

```tsx
// BAD: Inline styles bypass the design system
<div style={{ marginTop: '23px', fontSize: '15px' }}>

// GOOD: Extend the theme if you need custom values
<div className="mt-6 text-base">
```

### 3. Non-Semantic Colors

```tsx
// BAD: Raw color values have no semantic meaning
<button className="text-blue-500 hover:text-blue-600 bg-blue-100">

// GOOD: Semantic tokens convey intent
<button className="text-primary hover:text-primary/90 bg-primary/10">

// BETTER: Component variants
<Button variant="primary">Click me</Button>
```

### 4. Margin for Component Spacing

```tsx
// BAD: Margins on child components create coupling
<Card className="mb-4" />
<Card className="mb-4" />
<Card className="mb-0" />  // Last one needs override

// GOOD: Parent controls spacing with gap
<div className="flex flex-col gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

### 5. Inconsistent Responsive Breakpoints

```tsx
// BAD: Random breakpoint usage
<div className="text-sm md:text-base lg:text-lg xl:text-xl">

// GOOD: Mobile-first with intentional breakpoints
<div className="text-sm sm:text-base lg:text-lg">
```

---

## Color System Setup

### CSS Custom Properties Pattern

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Light mode (default) */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0.017 285.823);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0.017 285.823);
  --color-primary: oklch(0.205 0.042 265.755);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-secondary: oklch(0.961 0.007 247.896);
  --color-secondary-foreground: oklch(0.205 0.042 265.755);
  --color-muted: oklch(0.961 0.007 247.896);
  --color-muted-foreground: oklch(0.554 0.046 257.417);
  --color-accent: oklch(0.961 0.007 247.896);
  --color-accent-foreground: oklch(0.205 0.042 265.755);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-destructive-foreground: oklch(0.985 0 0);
  --color-border: oklch(0.922 0.013 255.508);
  --color-input: oklch(0.922 0.013 255.508);
  --color-ring: oklch(0.708 0.165 254.624);
}

/* Dark mode */
.dark {
  --color-background: oklch(0.145 0.017 285.823);
  --color-foreground: oklch(0.985 0 0);
  --color-card: oklch(0.145 0.017 285.823);
  --color-card-foreground: oklch(0.985 0 0);
  --color-primary: oklch(0.985 0 0);
  --color-primary-foreground: oklch(0.205 0.042 265.755);
  --color-secondary: oklch(0.269 0.032 264.052);
  --color-secondary-foreground: oklch(0.985 0 0);
  --color-muted: oklch(0.269 0.032 264.052);
  --color-muted-foreground: oklch(0.708 0.022 261.325);
  --color-accent: oklch(0.269 0.032 264.052);
  --color-accent-foreground: oklch(0.985 0 0);
  --color-destructive: oklch(0.396 0.141 25.723);
  --color-destructive-foreground: oklch(0.985 0 0);
  --color-border: oklch(0.269 0.032 264.052);
  --color-input: oklch(0.269 0.032 264.052);
  --color-ring: oklch(0.439 0.078 257.281);
}
```

### Using Dark Mode

```tsx
// Component automatically responds to theme
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Muted content</p>
  <Button className="bg-primary text-primary-foreground">
    Primary Action
  </Button>
</div>
```

### HSL vs OKLCH Format

**Tailwind v4 uses OKLCH by default** (perceptually uniform color space):

```css
/* OKLCH format: oklch(lightness chroma hue / alpha) */
--color-primary: oklch(0.623 0.214 259.815);
--color-primary-50: oklch(0.623 0.214 259.815 / 0.5);  /* 50% opacity */
```

Benefits of OKLCH:
- Perceptually uniform lightness
- Better color interpolation
- More intuitive adjustments

---

## Integration

### Extracting Tokens from Figma

1. **Use Figma Tokens Plugin** or Variables
2. Export as JSON:

```json
{
  "colors": {
    "primary": { "value": "#3B82F6", "type": "color" },
    "secondary": { "value": "#10B981", "type": "color" }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "spacing" },
    "sm": { "value": "8px", "type": "spacing" }
  }
}
```

3. Transform to Tailwind CSS:

```css
@theme {
  --color-primary: oklch(from #3B82F6 l c h);
  --color-secondary: oklch(from #10B981 l c h);
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
}
```

### Syncing with shadcn/ui

shadcn/ui uses CSS variables that align with this system:

```bash
# Install shadcn/ui component
npx shadcn@latest add button
```

Components use your theme tokens automatically:

```tsx
// Button uses --color-primary, --color-primary-foreground, etc.
import { Button } from "@/components/ui/button";

<Button variant="default">Uses primary colors</Button>
<Button variant="destructive">Uses destructive colors</Button>
<Button variant="secondary">Uses secondary colors</Button>
```

### Cross-Reference with @frontend-design

This skill focuses on **token consistency and technical implementation**.
The @frontend-design skill focuses on **aesthetic choices and anti-AI-slop patterns**.

Use together:
1. **@frontend-design**: Choose fonts, colors, visual direction
2. **@tailwind-design-system**: Implement tokens correctly

```tsx
// @frontend-design chose Clash Display + warm orange accent
// @tailwind-design-system ensures proper token usage

@theme {
  --font-display: "Clash Display", sans-serif;
  --color-accent: oklch(0.702 0.191 41.116);  /* warm orange */
}

// Usage follows both skills
<h1 className="font-display text-4xl text-accent">
  Distinctive + Consistent
</h1>
```

---

## Validation Checklist

Before committing Tailwind code:

- [ ] No arbitrary values (`w-[347px]`, `mt-[23px]`)
- [ ] No inline styles for spacing/colors
- [ ] All colors use semantic tokens (`text-foreground`, not `text-gray-900`)
- [ ] Dark mode works if existing pages support it
- [ ] Spacing uses gap on parents, not margins on children
- [ ] No deprecated utilities (see table above)
- [ ] Typography uses font tokens, not arbitrary sizes
- [ ] New tokens are documented with reasoning

---

## Quick Reference

### Common Token Mappings

```tsx
// Colors
text-primary         // Brand color for text
text-foreground      // Default text color
text-muted-foreground // Subdued text
bg-background        // Page background
bg-card              // Card/surface background
border-border        // Default border color

// Spacing (common values)
gap-1   // 4px - tight grouping
gap-2   // 8px - related items
gap-4   // 16px - standard spacing
gap-6   // 24px - section spacing
gap-8   // 32px - major sections

// Typography
text-sm   // 14px - small/caption
text-base // 16px - body text
text-lg   // 18px - emphasized body
text-xl   // 20px - small heading
text-2xl  // 24px - section heading
text-3xl  // 30px - page heading
text-4xl  // 36px - hero heading

// Radius
rounded-sm  // 2px - subtle
rounded     // 4px - default
rounded-md  // 6px - buttons
rounded-lg  // 8px - cards
rounded-xl  // 12px - modals
rounded-2xl // 16px - large surfaces
rounded-full // pill shapes

// Shadows
shadow-sm   // Subtle lift
shadow      // Default elevation
shadow-md   // Cards
shadow-lg   // Dropdowns
shadow-xl   // Modals
```

---

*A well-maintained design system is invisible to users but obvious to developers. It creates consistency without constraining creativity.*
