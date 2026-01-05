# UI Standard Handoff (Reference: `nextjs-saas`)

This doc captures **exactly what we changed** in the `boilerplates/nextjs-saas` UI overhaul, plus a **repeatable checklist** you can apply to the other boilerplates (Next.js, TanStack, Expo) to get consistent, “beautiful out-of-the-box” results.

---

## Goals (What “done” looks like)

- **No layout overlap**: fixed sidebar never covers main content; pages have consistent padding and max-width.
- **Good hierarchy**: consistent headings, spacing, card layout, and section grouping across pages.
- **Theme correctness**:
  - **Dark mode = true black app** (near-black background, not navy/slate).
  - **Light mode = clean white app** (high contrast, subtle borders).
  - Theme toggle works across the app shell (sidebar + header).
- **Centering**: settings/billing/admin/dashboard content aligned with a shared container.
- **Baseline polish**: hover/focus states, borders, and surfaces feel coherent.
- **AI Chat**: present as a real “starter module” with modern chat UI primitives (bubbles, loading state, message actions).

---

## Key Principles We Enforced

### 1) Use semantic theme tokens (not hardcoded colors)

**Bad**: `bg-slate-950 text-slate-200 border-slate-800` sprinkled everywhere.  
**Good**: `bg-background text-foreground border-border bg-card text-muted-foreground`.

This makes it possible to swap palettes once (in CSS variables) without chasing classes across the app.

### 2) “True black” dark mode done the right way

We used **near-black** and **raised surfaces** for depth:

- **Background**: `#0a0a0a`
- **Card/surface**: `#121212`
- **Borders**: `#262626`
- **Text**: `#FAFAFA`

This reads as a black app while keeping contrast comfortable and surfaces distinguishable.

### 3) Centering & spacing are system-level, not per-page hacks

We introduced a shared container class:

- `content-container`: consistent `max-width`, padding, and vertical rhythm

And a shared card class:

- `theme-card`: consistent card background/border/radius

Pages then compose these primitives rather than reinventing layout every time.

### 4) UI Profiles + “Cool Layer” (NEW)

To prevent “AI-built / toy dashboard” drift, we now treat **UI Profiles** as a first-class input in the workflow:

- Step 3 writes:
  - `/docs/design/UI-PROFILE.md` (human source of truth)
  - `/docs/design/ui-profile.json` (machine-readable rules + thresholds)
- Steps 4/5/6/11 and automation must follow it.

#### Cool Professional (Enterprise Baseline)

**Baseline:** Square/Linear-style restraint (hierarchy + spacing + neutrals)  
**Optional “Cool Layer”:** subtle micro-interactions that never look like a toy:

- **Hover depth**: tiny lift + soft shadow/border lift (interactive only)
- **Border beam / focus trail**: hover/focus only (not always-on), respects reduced motion

**Allow-list (hard rule):**
- Interactive cards (clickable)
- CTAs
- Inputs (focus-visible)

#### Satin Dark / Soft Depth (Profile Option)

This is an enterprise dark mode variant with “materiality”:
- Near-black background
- Raised surfaces
- Hairline borders
- Subtle **specular highlight** at the top edge of cards (very low opacity)

**Recommended card treatment (example):**

```css
/* Example – apply only to raised surfaces */
.satin-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.08);
  background-image: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 55%);
}
```

**Avoid:** glass morphism by default, always-on glows, rainbow gradients, bounce-by-default motion.

---

## What We Changed in `nextjs-saas` (File-by-file)

### Theme system & tokens

- [`nextjs-saas/src/app/globals.css`](nextjs-saas/src/app/globals.css)
  - Defined **CSS variables** for light/dark palettes (true-black dark mode).
  - Added global `body` baseline using `bg-background text-foreground`.
  - Added reusable utilities:
    - `.content-container`
    - `.theme-card`
    - small animation utilities used for page transitions.

- [`nextjs-saas/src/components/providers/theme-provider.tsx`](nextjs-saas/src/components/providers/theme-provider.tsx)
  - Next Themes provider wrapper (already correct).

- [`nextjs-saas/src/app/layout.tsx`](nextjs-saas/src/app/layout.tsx)
  - Ensures app is wrapped in `ThemeProvider` using `attribute="class"`.

### App shell layout (fix overlap + consistent centering)

- [`nextjs-saas/src/app/(app)/layout.tsx`](nextjs-saas/src/app/(app)/layout.tsx)
  - Uses **theme-aware background** (`bg-background`).
  - Keeps sidebar fixed and content offset.
  - Wraps page body with `content-container` so every `/app/*` page is centered consistently.
  - Applies light page transition animation (fast, subtle).

### Navigation (theme-aware sidebar + header)

- [`nextjs-saas/src/components/navigation/sidebar.tsx`](nextjs-saas/src/components/navigation/sidebar.tsx)
  - Replaced slate/navy hardcodes with semantic tokens:
    - `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-accent`
  - Ensured hover/active states feel consistent in both themes.
  - Added a **Theme** section and improved bottom user block.

- [`nextjs-saas/src/components/navigation/page-header.tsx`](nextjs-saas/src/components/navigation/page-header.tsx)
  - Made sticky header **theme-aware** (`bg-background/80`, `border-border`, semantic text).
  - Keeps breadcrumbs/back affordance consistent.

- [`nextjs-saas/src/components/ui/theme-toggle.tsx`](nextjs-saas/src/components/ui/theme-toggle.tsx)
  - Updated to use semantic tokens (`bg-muted`, `hover:bg-accent`, etc.).
  - Toggle cycles: `Light → Dark → System`.
  - Note: If your OS “system theme” is dark, “System” will appear as dark.

### Centered, polished core pages

- Dashboard:
  - [`nextjs-saas/src/app/(app)/app/page.tsx`](nextjs-saas/src/app/(app)/app/page.tsx)
  - Converted to `theme-card`, improved hierarchy, consistent text tokens.

- Settings:
  - [`nextjs-saas/src/app/(app)/app/settings/page.tsx`](nextjs-saas/src/app/(app)/app/settings/page.tsx)
  - Tabs + form fields + toggles with theme-aware inputs and proper spacing.

- Billing:
  - [`nextjs-saas/src/app/(app)/app/billing/page.tsx`](nextjs-saas/src/app/(app)/app/billing/page.tsx)
  - Plan card, usage bars, payment method, invoices — all theme-aware and centered.

- Admin:
  - [`nextjs-saas/src/app/(app)/app/admin/page.tsx`](nextjs-saas/src/app/(app)/app/admin/page.tsx)
  - Stats cards + tabbed panel + table, all aligned with `theme-card` and tokens.

### AI Chat UI (starter-grade)

New UI primitives:

- [`nextjs-saas/src/components/ui/chat-bubble.tsx`](nextjs-saas/src/components/ui/chat-bubble.tsx)
- [`nextjs-saas/src/components/ui/message-loading.tsx`](nextjs-saas/src/components/ui/message-loading.tsx)
- [`nextjs-saas/src/components/ui/avatar.tsx`](nextjs-saas/src/components/ui/avatar.tsx)

Enhanced page:

- [`nextjs-saas/src/app/(app)/app/chat/page.tsx`](nextjs-saas/src/app/(app)/app/chat/page.tsx)
  - Modern chat shell (header, message list, composer).
  - Message actions (copy/regenerate placeholders).
  - Loading bubble.

### Routing cleanup (prevent duplicates/conflicts)

We removed duplicate route files that created confusing/incorrect paths:

- Deleted:
  - `nextjs-saas/src/app/(app)/chat/page.tsx`
  - `nextjs-saas/src/app/(app)/items/page.tsx`

**Rule of thumb**: In Next.js App Router, route groups like `(app)` don’t add a path segment. If you want `/app/...`, you must have a real `app/` folder segment inside the group (as we do in `src/app/(app)/app/...`).

---

## How to Repeat This on Other Boilerplates (Step-by-step)

### Step 1 — Establish theme tokens first (one source of truth)

For web (Next.js/TanStack):

- Create or update the global CSS file to define:
  - `:root { --background, --foreground, --card, --border, --muted, ... }`
  - `.dark { ...overrides... }`
- Ensure components use `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`.

**Where to do it**:

- Next.js boilerplates: `src/app/globals.css`
- TanStack boilerplate: `src/styles/globals.css`

### Step 2 — Make the app shell responsible for spacing/centering

Add a shared container and use it inside the authenticated layout.

- Put `content-container` and `theme-card` utilities in global CSS.
- Ensure layout wraps page children inside that container.

### Step 3 — Refactor navigation to semantic tokens

Convert sidebar/header styles from hardcoded slate/navy to semantic tokens.

Checklist:

- Sidebar surface uses `bg-card` + `border-border`.
- Active item uses `bg-primary/10 text-primary`.
- Default/hover uses `text-muted-foreground` → `hover:text-foreground` + `hover:bg-accent`.
- Theme toggle appears in sidebar and/or header.

### Step 4 — Normalize the “core pages”

For each boilerplate, ensure **Settings**, **Billing**, **Admin**, **Dashboard** share:

- A consistent header: `h1` + short description.
- A single primary card/panel container (`theme-card`) for the main content.
- Predictable spacing: use a single outer `space-y-*` and keep card padding consistent.
- Inputs: `bg-background border-border text-foreground placeholder:text-muted-foreground`.

### Step 5 — AI Chat module feels real

Minimum bar:

- Chat bubbles (sent vs received)
- Loading state
- Composer pinned to bottom of view
- Message actions (copy/regenerate placeholders are fine)

### Step 6 — Update `FEATURES.md` as you go

Every time you touch a boilerplate, keep its `FEATURES.md` accurate:

- **Included modules** (enabled by default)
- **Optional modules** (toggleable)
- **Backlog / missed features** (edit-friendly list)
- **UI standards**: mention that the shell uses semantic tokens + true-black dark mode.

---

## Verification Workflow (Do this every time)

### Manual “5-minute pass”

Visit:

- `/app`
- `/app/settings`
- `/app/billing`
- `/app/admin`
- `/app/chat`

Confirm:

- Sidebar does not overlap content.
- Content is centered with a consistent max width.
- Dark mode looks black (not blue/navy).
- Light mode is clean white with subtle borders.
- Hover/focus states look intentional (no random slate leftovers).

### Use UI Healer (recommended)

Command lives at: [`audit/ui-healer`](../audit/ui-healer)

Example (web apps):

```bash
/ui-healer --pages="/app,/app/settings,/app/billing,/app/admin,/app/chat" --threshold=8
```

This will generate a report you can use to catch:

- spacing/hierarchy issues
- contrast problems
- inconsistent components
- conversion/clarity issues (where relevant)

---

## Notes / Known Follow-ups (Optional Improvements)

- **Sidebar collapse width**: current layout offsets by `pl-64` regardless of collapsed state. It prevents overlap (good), but you may later want the content to “snap” tighter when collapsed by wiring collapse state to layout.
- **AI provider wiring**: chat is currently demo-mode; hook it into your Vercel AI SDK route when you’re ready.
- **Design system consolidation**: consider a shared `Card`, `Input`, and `Tabs` component layer to reduce repeated markup across pages.

---

## Tomorrow’s “Pick Up Here” for Other Boilerplates

Start with web boilerplates (fastest repeat):

1. `boilerplates/nextjs-ai`
2. `boilerplates/nextjs-portable`
3. `boilerplates/tanstack-saas`

Then adapt the same principles to mobile:

4. `boilerplates/expo-mobile` (same hierarchy/spacing rules; token implementation is React Native-specific)

If you want, we can also create a shared “UI kit” under `boilerplates/_shared/` later, but for now the `nextjs-saas` implementation is the concrete reference standard.


