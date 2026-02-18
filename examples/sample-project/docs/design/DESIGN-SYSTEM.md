# Design System -- TaskFlow

**Project:** TaskFlow
**Version:** 1.0.0
**Created:** 2026-02-01
**Step:** 6 - Design System

---

## Overview

This design system provides the foundational tokens, components, and patterns for building TaskFlow with consistency and quality.

---

## 1. Design Tokens

### Colors

```css
:root {
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --bg-hover: #E5E7EB;

  /* Brand */
  --brand-primary: #6366F1;    /* Indigo - primary actions */
  --brand-secondary: #8B5CF6;  /* Violet - secondary accent */

  /* Semantic */
  --accent-success: #22C55E;   /* Green - completed, success */
  --accent-danger: #EF4444;    /* Red - overdue, error */
  --accent-warning: #F59E0B;   /* Amber - due soon, warning */
  --accent-info: #3B82F6;      /* Blue - informational */

  /* Text */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  /* Priority Colors */
  --priority-urgent: #EF4444;
  --priority-high: #F97316;
  --priority-medium: #F59E0B;
  --priority-low: #6B7280;

  /* Borders */
  --border-default: #E5E7EB;
  --border-hover: #D1D5DB;
  --border-focus: rgba(99, 102, 241, 0.5);
}
```

### Dark Mode

```css
[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-tertiary: #334155;
  --bg-hover: #475569;

  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  --border-default: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-3xl: 1.875rem;  /* 30px - page titles */
  --text-2xl: 1.5rem;    /* 24px - section headers */
  --text-xl: 1.25rem;    /* 20px - card titles */
  --text-lg: 1.125rem;   /* 18px - subtitles */
  --text-base: 1rem;     /* 16px - body */
  --text-sm: 0.875rem;   /* 14px - secondary text */
  --text-xs: 0.75rem;    /* 12px - captions, labels */

  /* Font Weights */
  --font-bold: 700;
  --font-semibold: 600;
  --font-medium: 500;
  --font-regular: 400;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing

```css
:root {
  /* Base: 4px */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px - badges, tags */
  --radius-md: 0.5rem;    /* 8px - cards, inputs */
  --radius-lg: 0.75rem;   /* 12px - modals */
  --radius-xl: 1rem;      /* 16px - large cards */
  --radius-full: 9999px;  /* Circular - avatars */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-drag: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

---

## 2. Core Components

### Task Card

```
+-------------------------------------------+
|  [Priority Dot] Task Title          [...] |
|                                           |
|  Description preview text (1-2 lines)     |
|                                           |
|  [Label] [Label]     [Avatar] [Due: Mar 5]|
+-------------------------------------------+
```

| Token | Value |
|-------|-------|
| Background | `--bg-primary` |
| Border | `--border-default` |
| Border Radius | `--radius-md` |
| Padding | `--space-4` |
| Shadow | `--shadow-card` |
| Drag Shadow | `--shadow-drag` |

### Column Header

```
+-------------------------------------------+
|  Column Name               (12)    [+]    |
+-------------------------------------------+
```

| Token | Value |
|-------|-------|
| Font | `--text-sm`, `--font-semibold` |
| Count Badge | `--bg-tertiary`, `--radius-full` |

### Avatar

| Size | Dimension | Usage |
|------|-----------|-------|
| xs | 20px | Inline mentions |
| sm | 24px | Task card assignee |
| md | 32px | Comment author |
| lg | 40px | Team member list |

---

## 3. Animation Tokens

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Card drag | 150ms | ease-out | Drag-and-drop feedback |
| Column reorder | 200ms | ease-in-out | Column repositioning |
| Task complete | 300ms | ease-out | Check animation |
| Modal open | 200ms | ease-out | Dialog entrance |
| Modal close | 150ms | ease-in | Dialog exit |
| Toast enter | 300ms | spring(1, 80, 10) | Notification slide-in |

<!-- Truncated for brevity -- actual output is typically 400-700 lines -->
