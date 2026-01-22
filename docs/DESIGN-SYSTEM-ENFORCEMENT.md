# Design System Enforcement

This document explains how Sigma Protocol enforces design system consistency during development, particularly in the Ralph autonomous loop.

## Overview

Design system enforcement ensures that all UI implementations follow the design tokens, patterns, and constraints defined in Step 3 (UX Design) and Step 6 (Design System).

The enforcement happens at three levels:
1. **Pre-Implementation** - UI Profile validation before coding
2. **During Implementation** - Frontend-design skill guidance
3. **Post-Implementation** - UI Healer verification

## UI Profile (`ui-profile.json`)

The UI Profile is the source of truth for design constraints, created during Step 3.

### Location

```
docs/design/ui-profile.json
```

### Structure

```json
{
  "name": "MyApp Design System",
  "preset": "saas-dashboard",
  "version": "1.0.0",

  "dials": {
    "radius": "soft",           // sharp | soft | rounded | pill
    "density": "comfortable",   // compact | comfortable | spacious
    "motionIntensity": "subtle" // none | subtle | moderate | expressive
  },

  "rules": {
    "maxAccentColorsPerScreen": 2,
    "maxGradientsPerCard": 1,
    "requireDarkModeSupport": true
  },

  "bannedPatterns": [
    "glassmorphism",
    "neon-glow",
    "rainbow-gradients",
    "heavy-shadows"
  ],

  "tokens": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "background": "#ffffff",
      "surface": "#f8fafc"
    },
    "spacing": {
      "unit": 4,
      "scale": [0, 4, 8, 12, 16, 24, 32, 48, 64]
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "scale": [12, 14, 16, 18, 20, 24, 30, 36, 48]
    }
  }
}
```

## Ralph Loop Integration

### Automatic Detection

When Ralph processes a story with UI tasks (task IDs starting with `UI-`), it automatically:

1. Checks for `docs/design/ui-profile.json`
2. Extracts design constraints
3. Injects them into the worker prompt

### Worker Prompt Injection

Workers receive design context in their prompts:

```markdown
## Design System Constraints (MANDATORY)

**Profile:** saas-dashboard
**Reference:** docs/design/ui-profile.json

### Dials
- Radius: soft
- Density: comfortable
- Motion: subtle

### Rules
- Max accent colors per screen: 2
- Max gradients per card: 1

### Banned Patterns (DO NOT USE)
glassmorphism, neon-glow, rainbow-gradients, heavy-shadows

### Required Actions for UI Tasks
1. Read `docs/design/ui-profile.json` before implementing
2. Use only design tokens defined in the profile
3. Verify visual output matches the profile aesthetic
4. Run `@ui-healer` to validate design compliance
```

### Validation Flow

```
Story starts
    ↓
[UI Task Detected?] ──No──→ Continue normally
    │ Yes
    ↓
[UI Profile exists?] ──No──→ Warning: Design enforcement disabled
    │ Yes
    ↓
Inject design context into worker prompt
    ↓
Worker implements using @frontend-design skill
    ↓
Worker runs @ui-healer validation
    ↓
[Validation passes?] ──No──→ Fix issues, retry
    │ Yes
    ↓
Story complete
```

## Validators

### Pre-Commit Validation

The design system can be validated on commit via Lefthook:

```yaml
# lefthook.yml
pre-commit:
  commands:
    design-tokens:
      glob: "*.{tsx,jsx,css,scss}"
      run: npx sigma-validate-design --config=docs/design/ui-profile.json {staged_files}
```

### UI Healer (`@ui-healer`)

Comprehensive UI validation skill that checks:

- Color usage (accent colors, contrast ratios)
- Spacing consistency (matches token scale)
- Typography adherence
- Motion patterns
- Banned pattern detection
- Responsive breakpoints
- Accessibility compliance

### Running Validation

```bash
# Via CLI
sigma audit ui-healer

# Via skill in AI IDE
@ui-healer

# Specific component
@ui-healer src/components/Dashboard.tsx
```

## Creating a UI Profile

### Option 1: Step 3 Generation

The recommended approach - generated automatically during Step 3:

```bash
claude "Run @step-3-ux-design for my app"
```

### Option 2: Manual Creation

Create `docs/design/ui-profile.json` manually using the schema above.

### Option 3: From Existing Design

```bash
# Extract from existing Tailwind config
sigma design extract --from=tailwind.config.js

# Extract from Figma (requires Figma API token)
sigma design extract --from=figma://file-id
```

## Presets

Sigma includes presets for common design aesthetics:

| Preset | Description | Radius | Density | Motion |
|--------|-------------|--------|---------|--------|
| `minimal-saas` | Clean SaaS dashboard | sharp | comfortable | subtle |
| `consumer-app` | Friendly consumer app | rounded | comfortable | moderate |
| `enterprise` | Professional enterprise | sharp | compact | none |
| `creative-portfolio` | Expressive portfolio | pill | spacious | expressive |
| `mobile-first` | Mobile-optimized | soft | compact | subtle |

## Troubleshooting

### "No UI Profile found" Warning

Create the profile:
```bash
claude "Run @step-3-ux-design for my app"
```

Or create manually at `docs/design/ui-profile.json`.

### Design Violations in Ralph

If Ralph workers produce design violations:

1. Check that `ui-profile.json` exists
2. Verify `@frontend-design` skill is available
3. Run `@ui-healer` manually to see violations
4. Update the profile if constraints are too strict

### Banned Pattern Detected

If a banned pattern is detected:

```bash
# See what was banned
@ui-healer --verbose

# Override if intentional (not recommended)
# Add to ui-profile.json:
{
  "overrides": {
    "allow": ["glassmorphism"]
  }
}
```

## Best Practices

1. **Create UI Profile Early** - Do it in Step 3, before any coding
2. **Keep Constraints Reasonable** - Too strict = constant violations
3. **Document Exceptions** - If you override, explain why
4. **Run UI Healer Regularly** - Catch drift early
5. **Update Profile Incrementally** - Don't change everything at once
