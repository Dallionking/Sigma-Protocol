---
name: applying-brand-guidelines
description: "This skill applies consistent corporate branding and styling to all generated documents including colors, fonts, layouts, and messaging."
version: "1.0.0"
source: "@anthropics/claude-cookbooks"
triggers:
  - brand-application
  - design-system
  - marketing-content
  - documentation-styling
  - client-handoff
---

# Applying Brand Guidelines Skill

This skill applies consistent corporate branding and styling to all generated documents including colors, fonts, layouts, and messaging.

## When to Invoke

Invoke this skill when:

- Creating branded documents or presentations
- Generating marketing content
- Applying design system tokens
- Ensuring brand consistency across outputs
- Preparing client deliverables

---

## Brand Guidelines Framework

### 1. Brand Configuration

Define brand guidelines in a structured format:

```json
{
  "brand": {
    "name": "Company Name",
    "tagline": "Your tagline here",

    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "accent": "#F59E0B",
      "neutral": {
        "50": "#F8FAFC",
        "100": "#F1F5F9",
        "200": "#E2E8F0",
        "300": "#CBD5E1",
        "400": "#94A3B8",
        "500": "#64748B",
        "600": "#475569",
        "700": "#334155",
        "800": "#1E293B",
        "900": "#0F172A"
      },
      "semantic": {
        "success": "#22C55E",
        "warning": "#EAB308",
        "error": "#EF4444",
        "info": "#3B82F6"
      }
    },

    "typography": {
      "fontFamily": {
        "display": "Inter",
        "body": "Inter",
        "mono": "JetBrains Mono"
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    },

    "spacing": {
      "unit": "0.25rem",
      "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
    },

    "borderRadius": {
      "none": "0",
      "sm": "0.125rem",
      "default": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "2xl": "1rem",
      "full": "9999px"
    },

    "voice": {
      "tone": ["Professional", "Approachable", "Innovative"],
      "personality": ["Confident", "Helpful", "Clear"],
      "doNot": ["Use jargon", "Be condescending", "Overpromise"]
    },

    "assets": {
      "logo": {
        "primary": "/assets/logo.svg",
        "white": "/assets/logo-white.svg",
        "icon": "/assets/icon.svg"
      },
      "patterns": {
        "background": "/assets/pattern-bg.svg"
      }
    }
  }
}
```

### 2. Loading Brand Configuration

```javascript
// Load brand guidelines
async function loadBrandConfig(projectPath) {
  const possiblePaths = [
    `${projectPath}/brand.json`,
    `${projectPath}/docs/design/brand.json`,
    `${projectPath}/docs/design/DESIGN-SYSTEM.md`,
  ];

  for (const path of possiblePaths) {
    if (await fileExists(path)) {
      return await loadConfig(path);
    }
  }

  // Return defaults if no brand config found
  return getDefaultBrandConfig();
}
```

---

## Application Patterns

### CSS Variables Generation

```css
/* Generated from brand config */
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;

  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* Typography */
  --font-display: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  /* ... etc */

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

### Tailwind Config Generation

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          // ... full scale
        },
        secondary: {
          DEFAULT: "#10B981",
          // ... full scale
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
};
```

### Component Styling

```tsx
// Branded Button Component
interface ButtonProps {
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
}

function BrandedButton({ variant, size, children }: ButtonProps) {
  const baseStyles = `
    font-family: var(--font-body);
    font-weight: 600;
    border-radius: var(--radius-md);
    transition: all 150ms ease;
  `;

  const variantStyles = {
    primary: `
      background: var(--color-primary);
      color: white;
      &:hover { background: var(--color-primary-600); }
    `,
    secondary: `
      background: var(--color-secondary);
      color: white;
      &:hover { background: var(--color-secondary-600); }
    `,
    outline: `
      background: transparent;
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
      &:hover { background: var(--color-primary-50); }
    `,
  };

  const sizeStyles = {
    sm: "padding: var(--space-2) var(--space-3); font-size: 0.875rem;",
    md: "padding: var(--space-3) var(--space-4); font-size: 1rem;",
    lg: "padding: var(--space-4) var(--space-6); font-size: 1.125rem;",
  };

  return (
    <button
      style={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </button>
  );
}
```

---

## Document Branding

### Markdown Document Template

```markdown
---
brand: true
theme: corporate
---

# Document Title

<header style="color: var(--color-primary)">
  ![Company Logo](assets/logo.svg)
</header>

## Section Heading

Body text using brand typography and colors.

<footer>
  © 2025 Company Name. All rights reserved.
</footer>
```

### PDF Generation with Brand

```javascript
// Using Puppeteer for branded PDFs
async function generateBrandedPDF(content, brandConfig) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=${brandConfig.typography.fontFamily.body}');
        
        body {
          font-family: '${brandConfig.typography.fontFamily.body}', sans-serif;
          color: ${brandConfig.colors.neutral[800]};
        }
        
        h1, h2, h3 {
          font-family: '${brandConfig.typography.fontFamily.display}', sans-serif;
          color: ${brandConfig.colors.neutral[900]};
        }
        
        a {
          color: ${brandConfig.colors.primary};
        }
        
        .highlight {
          background: ${brandConfig.colors.primary}10;
          border-left: 4px solid ${brandConfig.colors.primary};
          padding: 1rem;
        }
        
        header {
          border-bottom: 2px solid ${brandConfig.colors.primary};
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        
        footer {
          border-top: 1px solid ${brandConfig.colors.neutral[200]};
          padding-top: 1rem;
          margin-top: 2rem;
          color: ${brandConfig.colors.neutral[500]};
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  return pdf;
}
```

---

## Voice & Messaging

### Applying Brand Voice

```javascript
// Brand voice checker
function checkBrandVoice(text, brandConfig) {
  const issues = [];
  const { voice } = brandConfig;

  // Check for forbidden phrases
  voice.doNot.forEach((rule) => {
    // Pattern matching for rule violations
    if (violatesRule(text, rule)) {
      issues.push({
        type: "voice",
        message: `Content may violate brand guideline: "${rule}"`,
        suggestion: getSuggestion(rule),
      });
    }
  });

  // Check tone alignment
  if (!alignsWithTone(text, voice.tone)) {
    issues.push({
      type: "tone",
      message: "Content tone may not align with brand voice",
      expected: voice.tone.join(", "),
    });
  }

  return issues;
}

// Rewrite suggestions
const voiceRewrites = {
  "Use jargon": {
    patterns: ["leverage", "synergy", "paradigm", "utilize"],
    suggestions: ["use", "combination", "model", "use"],
  },
  "Be condescending": {
    patterns: ["obviously", "simply", "just", "clearly"],
    suggestions: ["", "", "", ""],
  },
};
```

---

## Consistency Checklist

### Visual Consistency

- [ ] Colors match brand palette
- [ ] Typography uses brand fonts
- [ ] Spacing follows brand scale
- [ ] Logo usage follows guidelines
- [ ] Icons match brand style

### Voice Consistency

- [ ] Tone matches brand personality
- [ ] No forbidden phrases used
- [ ] Messaging aligns with brand values
- [ ] CTAs use brand language

### Technical Consistency

- [ ] CSS variables used throughout
- [ ] Components use design tokens
- [ ] Responsive behavior consistent
- [ ] Accessibility maintained

---

## Integration with Sigma Protocol

### Step 6 (Design System)

Define and document brand guidelines.

### @client-handoff

Apply branding to all client deliverables.

### Marketing Commands

Ensure all marketing content follows brand guidelines.

### Frontend Implementation

Apply design tokens consistently across UI.

---

_Remember: Brand consistency builds trust. Every touchpoint should feel like it comes from the same source._
