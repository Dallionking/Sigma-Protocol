# Boilerplate System Design

## Design Principles

### 1. Backward Compatible by Default

Every SSS step must have a clear branch:
- **If boilerplate detected** → reuse/extend boilerplate patterns
- **If custom build** → proceed exactly as before

Detection is based on the presence of `.sigma/boilerplate.json`.

### 2. Boilerplate Minimal by Design

Templates ship with neutral, functional styling. Brand identity is applied in **Step 6: Design System**, not baked into boilerplates.

### 3. Don't Fork Your Foundation

Projects extend boilerplates via **wrappers and overrides**, never by editing core modules directly. This preserves upgrade paths.

### 4. Stable Public APIs

Components and hooks exposed for Step 11 PRDs must have stable, documented prop interfaces. Breaking changes require major version bumps.

### 5. Commands Bundled

Every boilerplate includes SSS commands so the methodology is immediately available after cloning.

---

## Architecture

### Repository Structure

```
github.com/your-org/
├── commands                    ← Private (SSS methodology source)
│   ├── audit/
│   ├── deploy/
│   ├── dev/
│   ├── generators/
│   ├── marketing/
│   ├── ops/
│   ├── steps/
│   ├── Magic UI/
│   └── boilerplates/           ← Template source-of-truth
│       ├── nextjs-saas/
│       ├── expo-mobile/
│       └── ...
│
├── sss-nextjs-starter          ← Public (app + commands bundled)
├── sss-expo-starter            ← Public (app + commands bundled)
├── sss-nextjs-ai               ← Public (app + commands bundled)
├── sss-tanstack-starter        ← Public (app + commands bundled)
└── sss-nextjs-portable         ← Public (app + commands bundled)
```

### Sync Flow

```
COMMANDS REPO                              BOILERPLATE REPO
───────────────                            ─────────────────

boilerplates/nextjs-saas/
├── src/                    ──────────────►  src/
├── package.json           ──────────────►  package.json
└── ...                    ──────────────►  ...

audit/                     ──────────────►  .cursor/commands/audit/
deploy/                    ──────────────►  .cursor/commands/deploy/
dev/                       ──────────────►  .cursor/commands/dev/
generators/                ──────────────►  .cursor/commands/generators/
marketing/                 ──────────────►  .cursor/commands/marketing/
ops/                       ──────────────►  .cursor/commands/ops/
steps/                     ──────────────►  .cursor/commands/steps/
Magic UI/                  ──────────────►  .cursor/commands/Magic UI/

course/                    ──────────────►  (EXCLUDED)
assets/                    ──────────────►  (EXCLUDED)
boilerplates/              ──────────────►  (EXCLUDED)
```

---

## Command Inclusion Policy

### Included in Boilerplates

| Folder | Reason |
|--------|--------|
| `audit/` | Core methodology |
| `deploy/` | Core methodology |
| `dev/` | Core methodology |
| `generators/` | Core methodology |
| `marketing/` | Core methodology |
| `ops/` | Core methodology |
| `steps/` | Core methodology |
| `Magic UI/` | Template resources |

### Excluded from Boilerplates

| Folder | Reason |
|--------|--------|
| `boilerplates/` | Meta (recursive) |
| `course/` | Paid content |
| `assets/` | Personal assets |
| `docs/notebooklm/` | Personal notes |
| `Inspo/` | Personal inspiration |
| `claude-code/` | Internal tooling |
| `.cursor/plans/` | Personal plans |
| `test/` | Internal testing |

---

## Provenance File Specification

### Location

`.sigma/boilerplate.json`

### Schema

```typescript
interface BoilerplateProvenance {
  // Template identification
  template: string;              // e.g., "nextjs-saas"
  template_version: string;      // semver, e.g., "1.0.0"
  origin_repo: string;           // e.g., "your-org/sss-nextjs-starter"
  
  // Project metadata
  project_name: string;          // Set during setup
  created_at: string;            // ISO date
  
  // Feature flags (what's included)
  features: {
    auth?: string;               // "supabase" | "clerk" | "custom"
    payments?: string;           // "stripe" | "revenuecat" | "custom"
    ai?: string;                 // "vercel-ai-sdk" | "langchain" | "custom"
    database?: string;           // "supabase" | "convex" | "drizzle"
    analytics?: string;          // "posthog" | "plausible" | "custom"
    email?: string;              // "resend" | "postmark" | "custom"
  };
  
  // SSS commands version bundled
  commands_version: string;      // semver
  
  // Customization tracking (optional)
  customizations?: {
    setup_completed_at?: string;
    branded?: boolean;
    theme_applied?: string;
  };
}
```

### Detection Rules

```typescript
function detectBoilerplate(projectRoot: string): BoilerplateProvenance | null {
  const provenancePath = path.join(projectRoot, '.sss', 'boilerplate.json');
  
  if (!fs.existsSync(provenancePath)) {
    return null; // Custom build
  }
  
  try {
    return JSON.parse(fs.readFileSync(provenancePath, 'utf-8'));
  } catch {
    return null; // Invalid, treat as custom build
  }
}
```

---

## Versioning Strategy

### Version Numbering

- **Major** (1.0.0 → 2.0.0): Breaking changes to component APIs or structure
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, security updates

### Upgrade Policy

1. Boilerplates are **starting points**, not dependencies
2. Projects are expected to diverge from boilerplates
3. No automatic upgrade mechanism (intentional)
4. Major improvements documented in release notes for manual adoption

### Breaking Change Communication

- Release notes in GitHub releases
- Migration guides for major versions
- Deprecation warnings 1 minor version before removal

---

## Ownership Boundaries

### Boilerplate Owns

| Area | Files | Notes |
|------|-------|-------|
| Auth infrastructure | `lib/supabase/`, `components/auth/` | Stable APIs |
| Payment infrastructure | `lib/stripe/`, `components/payments/` | Stable APIs |
| AI infrastructure | `lib/ai/`, `hooks/use-ai.ts` | Stable APIs |
| Base UI | `components/ui/` | shadcn managed |
| SSS Commands | `.cursor/commands/` | Methodology |

### Project Owns

| Area | Files | Notes |
|------|-------|-------|
| Business logic | `lib/[project]/` | Custom |
| Custom components | `components/[project]/` | Custom |
| Custom routes | `app/(routes)/` | Custom |
| Custom API | `app/api/[project]/` | Custom |
| Database extensions | `lib/db/schema/[project].ts` | Custom |
| Brand tokens | `app/globals.css` (overrides) | Custom |

---

## Extension Patterns

### Pattern 1: Wrapper Components

```tsx
// components/project/branded-button.tsx
import { Button } from "@/components/ui/button";

export function BrandedButton(props) {
  return <Button className="bg-brand-primary" {...props} />;
}
```

### Pattern 2: Hook Composition

```tsx
// hooks/use-project-credits.ts
import { useCredits } from "@/hooks/use-credits";

export function useProjectCredits() {
  const credits = useCredits();
  
  // Add project-specific logic
  return {
    ...credits,
    hasEnoughForFeatureX: credits.remaining >= 10,
  };
}
```

### Pattern 3: Theme Token Override

```css
/* app/globals.css */
:root {
  /* Override boilerplate defaults */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}
```

### Pattern 4: Route Extension

```
app/
├── (auth)/              ← Boilerplate routes
│   ├── login/
│   └── signup/
├── (dashboard)/         ← Boilerplate routes
│   └── settings/
└── (project)/           ← Project-specific routes
    ├── feature-a/
    └── feature-b/
```

---

## Stable API Contract

### Component Props (Public API)

Components used in Step 11 PRDs must document their props:

```typescript
// components/auth/login-form.tsx

/**
 * @public
 * @stable since 1.0.0
 */
export interface LoginFormProps {
  /** Redirect path after successful login */
  redirectTo?: string;
  
  /** Show "Remember me" checkbox */
  showRememberMe?: boolean;
  
  /** Custom footer content */
  footer?: React.ReactNode;
  
  /** Called after successful login */
  onSuccess?: () => void;
}
```

### Hook Returns (Public API)

```typescript
// hooks/use-credits.ts

/**
 * @public
 * @stable since 1.0.0
 */
export interface UseCreditsReturn {
  /** Current credit balance */
  remaining: number;
  
  /** Total credits ever purchased */
  total: number;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Refresh credits from server */
  refresh: () => Promise<void>;
  
  /** Consume credits (returns success) */
  consume: (amount: number) => Promise<boolean>;
}
```

---

## Testing Requirements

### Template Smoke Tests

Each boilerplate must pass:

1. `npm install` → Success
2. `npm run build` → Success
3. `npm run lint` → No errors
4. `npm run setup` → Completes without errors
5. `npm run dev` → Server starts

### SSS Command Integration

Commands must work after bundling:
- Step 11 generates valid PRDs
- Audit commands find correct files
- Generators produce valid output

---

## Known Tradeoffs

### Trade: Simplicity vs Flexibility

**Decision**: Ship opinionated stacks (Supabase, Stripe, AI SDK).

**Why**: Most projects need the same foundation. Custom builds exist for edge cases.

**Mitigation**: Clear "custom build" path documented in every step.

### Trade: Bundled vs Linked Commands

**Decision**: Copy commands into each boilerplate (not git submodule).

**Why**: Simpler for students, works offline, no git submodule complexity.

**Mitigation**: GitHub Action auto-syncs changes from source.

### Trade: Version Lock vs Auto-Update

**Decision**: No automatic upgrades from boilerplate after clone.

**Why**: Projects diverge immediately. Automatic merges would conflict.

**Mitigation**: Release notes + migration guides for major improvements.

---

## FAQ

### Q: Can I upgrade a project to a newer boilerplate version?

A: Not automatically. Review release notes and manually apply relevant changes. Boilerplates are starting points, not dependencies.

### Q: What if I need a stack not covered by templates?

A: Use the "custom build" path. All SSS steps work without boilerplates—they detect this automatically.

### Q: Can I contribute a new boilerplate?

A: Yes! Create a PR with:
1. Template in `boilerplates/[name]/`
2. Update to `IMPLEMENTATION-TRACKER.md`
3. Entry in this design doc

### Q: How do I know what version I'm on?

A: Check `.sigma/boilerplate.json` → `template_version` field.

