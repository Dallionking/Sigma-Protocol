---
version: "3.7.0"
last_updated: "2026-01-07"
changelog:
  - "3.7.0: Added Superdesign AI Design Agent integration - rapid UI mockup generation, wireframe prototyping, design system extraction. References superdesign-integration.md foundation skill"
  - "3.6.0: Added Section 5B Backend Data Operations - ensures wireframe PRDs document data operations needed, enabling full-stack Step 11 PRDs"
  - "3.5.0: Added iOS Native (SwiftUI) as platform option with SF Symbols icon reference"
description: "Step 5: Generate Wireframe PRDs - Create detailed PRDs with ASCII wireframes, component specs, and project setup. USER implements PRDs to build interactive UI prototype (foundation for Step 11)"
allowed-tools:
  # PRIMARY Research Tools
  - mcp_exa_get_code_context_exa
  - mcp_exa_web_search_exa
  - mcp_exa_crawling_exa
  - mcp_exa_deep_researcher_start
  - mcp_exa_deep_researcher_check
  
  # Component Generation & Inspiration
  - mcp_21st-devmagic_21st_magic_component_builder
  - mcp_21st-devmagic_21st_magic_component_inspiration
  - mcp_21st-devmagic_21st_magic_component_refiner
  - mcp_21st-devmagic_logo_search
  
  # Mobile-Specific
  - mcp_expo-mcp_search_documentation
  - mcp_expo-mcp_add_library
  - mcp_expo-mcp_learn
  
  # Documentation Reference
  - mcp_ref_ref_search_documentation
  - mcp_ref_ref_read_url

  # BACKUP MCP Tools (Use only if primary fails)
  - mcp_firecrawl_firecrawl_search
  
  # File & Terminal Operations
  - read_file
  - write
  - list_dir
  - run_terminal_cmd
parameters:
  - --platform     # web | mobile (optional, will ask if not provided)
  - --flow         # specific flow to build (optional)
  - --new-project  # bootstrap fresh project
---

# /step-5-wireframe-prototypes — Flow-Based Wireframe Specification (CMO of a $100M-$1B COMPANY)

**Mission**  
Generate comprehensive **Flow PRDs** with detailed ASCII wireframes, modern React stack integration specs, and researched component selections. The **USER** then implements these PRDs in Cursor to build an interactive UI prototype. This prototype code becomes the **foundation for Step 11** feature development.

**Workflow:**
1. **Step 5 (This Step):** AI generates detailed PRDs for each flow
2. **User Implementation:** User takes PRDs into Cursor and builds the UI prototype
3. **Iteration:** User refines the prototype until satisfied with the UI/UX
4. **Step 11:** AI generates feature PRDs that build on the prototype code

**Valuation Context:** You are the **CMO of a $100 MILLION to $1 BILLION COMPANY**. Every pixel, animation, and interaction must **maximize conversion**, **reduce friction**, and **feel premium**. This is **revenue engineering through design** — no AI slop, no generic templates.

**Core Philosophy:**
1. **Flow-First PRDs:** One comprehensive PRD per user flow (Auth, Onboarding, Dashboard, Checkout, etc.)
2. **Research-Driven Specs:** Use shadcn MCP + Exa to find best patterns and document component selections
3. **Modern Stack Integration:** Spec zod, react-hook-form, tRPC, react-query, and other 2025 best practices
4. **Detailed Wireframes:** ASCII diagrams with exact component breakdowns, props, and usage examples
5. **First Flow = Project Setup:** First PRD (01-auth) includes project bootstrap commands
6. **User Implements:** PRDs are designed for user to implement in Cursor, not for AI execution
7. **No AI Slop:** Every app must feel unique — no generic animations, no pulsating circles, no emoji icons
8. **Premium Icons Only:** Use Lucide, Phosphor, or Tabler icons — **NEVER use emojis as icons**

**⚠️ CRITICAL: This step generates PRDs only. The USER implements the code by dragging PRDs into Cursor.**

**🚫 BANNED: Emojis as icons, pulsating circle splash screens, generic bounce animations, solid color backgrounds with static logos.**

---

<goal>
You are the CMO of a $100M-$1B company executing flow-based wireframe specifications. Execute ALL phases (0 through E) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.
Each phase ends with a STOP marker — halt and wait for user approval before proceeding.

Phase Roadmap:
| Phase | Name | Key Output |
|-------|------|------------|
| 0 | Step-4 Import & Validation (Bulletproof Gate) | Screen inventory imported, UI Profile loaded |
| A | Platform & Flow Discovery | Platform selected, flow list confirmed |
| B | PRD Setup | Directory structure, tracker initialized |
| C | Per-Flow PRD Generation | One comprehensive PRD per flow |
| D | Documentation & Handoff | PRD-SUMMARY.md, WIREFRAME-TRACKER.md |
| E | Zero Omission Verification & Final Review | ZERO-OMISSION-CERTIFICATE.md |

Final Outputs: Flow PRDs in /docs/prds/flows/, WIREFRAME-TRACKER.md, PRD-SUMMARY.md, ZERO-OMISSION-CERTIFICATE.md
Quality gate: 100% screen coverage (Step 4 screens = Step 5 wireframes)
</goal>
## PHASE 0 — STEP-4 IMPORT & VALIDATION (BULLETPROOF GATE) ⭐ CRITICAL

**This phase ensures ZERO wireframes are missed by importing and validating against Step 4 outputs.**

### 0.1 Mandatory Step-4 Import

**Before ANY flow discovery or wireframe work, you MUST:**

```bash
# Read Step 4 outputs (REQUIRED - DO NOT SKIP)
Read: /docs/flows/FLOW-TREE.md
Read: /docs/flows/SCREEN-INVENTORY.md
Read: /docs/flows/TRANSITION-MAP.md
Read: /docs/flows/TRACEABILITY-MATRIX.md
```

**⚠️ If these files don't exist, STOP and run Step 4 first.**

### 0.1B Mandatory UI Profile Import (NEW - BLOCKING)

**Before generating any PRDs, you MUST import the UI Profile chosen in Step 3.**

```bash
# Read Step 3 UI Profile outputs (REQUIRED)
Read: /docs/design/UI-PROFILE.md
Read: /docs/design/ui-profile.json
```

**⚠️ If these files don't exist, STOP and run Step 3 (UI Profile Selection) first.**

### 0.2 Extract Step-4 Screen Count

**From `/docs/flows/SCREEN-INVENTORY.md`, extract:**

```markdown
## Step-4 Import Summary

| Metric | Value | Source |
|--------|-------|--------|
| **Total Screens from Step 4** | [X] | SCREEN-INVENTORY.md |
| **P0 Screens** | [Y] | SCREEN-INVENTORY.md |
| **P1 Screens** | [Z] | SCREEN-INVENTORY.md |
| **Flow Categories** | [N] | FLOW-TREE.md |

**⚠️ TARGET: Step 5 must produce [X] wireframe PRDs (one per screen)**

---

## UI Profile Import Summary (Step 3)

| Field | Value | Source |
|-------|-------|--------|
| **Profile ID** | [uiProfile.id] | /docs/design/ui-profile.json |
| **Profile Name** | [uiProfile.name] | /docs/design/ui-profile.json |
| **Cool Layer** | [on/off] | /docs/design/ui-profile.json |
| **Motion Intensity** | [subtle/moderate/expressive] | /docs/design/ui-profile.json |

**⚠️ RULE:** Every PRD in Step 5 must follow this UI Profile (tokens, motion, effects allow-list).
```

### 0.3 Create Screen-to-Wireframe Tracking Table

**Create `/docs/prds/flows/WIREFRAME-TRACKER.md`:**

```markdown
# Screen-to-Wireframe Tracking Table

**Imported from Step 4:** [DATE]
**Total Screens to Wireframe:** [X]
**Target Completion:** 100%

---

## Tracking Table

| # | Screen ID (from Step 4) | Flow | Wireframe Status | PRD Location | Completed Date |
|---|------------------------|------|------------------|--------------|----------------|
| 1 | auth-signup-enter-email | F-AUTH | ⬜ Not Started | — | — |
| 2 | auth-signup-verify-code | F-AUTH | ⬜ Not Started | — | — |
| 3 | auth-signup-create-password | F-AUTH | ⬜ Not Started | — | — |
| 4 | home-dashboard-main | F-CORE | ⬜ Not Started | — | — |
| ... | ... | ... | ... | ... | ... |
| [X] | [last-screen-id] | [Flow] | ⬜ Not Started | — | — |

---

## Progress Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Complete | 0 | 0% |
| 🔄 In Progress | 0 | 0% |
| ⬜ Not Started | [X] | 100% |
| **TOTAL** | [X] | — |

**Gap Count: [X] screens remaining**
```

### 0.4 Gap Detection Formula

**After completing each flow, verify:**

```
Step-4 Total Screens - Completed Wireframes = Remaining Gap

[X] - [Completed] = [Gap]

⚠️ BLOCKING RULE: Cannot approve Step 5 if Gap > 0
```

---
**>>> CHECKPOINT: STEP-4 IMPORT APPROVAL <<<**

Present Step-4 import summary to the user.
**Do NOT continue to Flow Discovery until the user explicitly approves.**

Reply `approve step-4-import` or `revise: [feedback]`.

**Prompt:**
```
## Step-4 Import Complete ✅

I've imported the following from Step 4:

**SCREEN INVENTORY:**
- Total Screens: [X]
- P0 Screens: [Y]
- P1 Screens: [Z]
- Flow Categories: [N]

**WIREFRAME TRACKER CREATED:**
- Location: /docs/prds/flows/WIREFRAME-TRACKER.md
- Screens to wireframe: [X]
- Current completion: 0%

**TARGET:** This step must produce [X] wireframe PRDs.
I will update the tracker after each flow completion.

Reply `approve step-4-import` or `revise: [feedback]`.
```
---

---

## FLOW DISCOVERY & INVENTORY

### Standard User Flows

| Flow ID | Flow Name | Typical Screens | Priority |
|---------|-----------|-----------------|----------|
| `F-AUTH` | Authentication Flow | Landing, Login, Signup, Forgot Password, OAuth | P0 |
| `F-ONBOARD` | Onboarding Flow | Welcome, Profile Setup, Preferences, Tutorial, First Action | P0 |
| `F-CORE` | Core Feature Flow | Main dashboard, primary feature screens | P0 |
| `F-SETTINGS` | Settings/Profile Flow | Account, Preferences, Notifications, Privacy | P1 |
| `F-CHECKOUT` | Checkout/Payment Flow | Cart, Payment, Confirmation, Receipt | P1 (if applicable) |
| `F-ADMIN` | Admin Flow | Admin dashboard, user management, analytics | P2 (if applicable) |
| `F-EMPTY` | Empty/Error States | Empty states, loading states, error pages | P1 |

### Flow Discovery Process (STEP-4 VALIDATED)

1. **Read Step-4 Outputs FIRST (MANDATORY):**
   - `/docs/flows/FLOW-TREE.md` ⭐ PRIMARY SOURCE
   - `/docs/flows/SCREEN-INVENTORY.md` ⭐ PRIMARY SOURCE
   - `/docs/flows/TRACEABILITY-MATRIX.md` (for PRD traceability)

2. **Cross-Reference with Context (SECONDARY):**
   - `/docs/ux/UX-DESIGN.md` (user journeys from Step 3)
   - `/docs/specs/MASTER_PRD.md` (product vision from Step 1)
   - `/docs/stack-profile.json` (tech stack)

3. **⚠️ CRITICAL: Flow inventory MUST match Step 4:**
   - Use the EXACT flow categories from Step 4's FLOW-TREE.md
   - Use the EXACT screen IDs from Step 4's SCREEN-INVENTORY.md
   - Do NOT invent new flows or screens not in Step 4

4. **Create Flow Inventory Table (from Step 4):**

| Flow ID | Flow Name | Screens from Step 4 | Entry Point | Exit Points | Status |
|---------|-----------|---------------------|-------------|-------------|--------|
| F-AUTH | Auth | 5 (per SCREEN-INVENTORY) | Landing | Dashboard | ⬜ To Build |
| F-ONBOARD | Onboarding | 4 (per SCREEN-INVENTORY) | Post-signup | Dashboard | ⬜ To Build |
| [etc.] | | | | | |

---
**>>> CHECKPOINT: FLOW INVENTORY APPROVAL <<<**

Present flow inventory extracted from Step 4 to the user.
**Do NOT continue to Flow PRD Template until the user explicitly approves.**

Reply `approve flows` or `revise: [feedback]`.

**Prompt:**
```
## Flow Inventory (from Step 4)

I've extracted the following flows from Step 4's Flow Tree:

| Flow | Screens | Status |
|------|---------|--------|
| F-AUTH | 5 | ⬜ To Build |
| F-ONBOARD | 4 | ⬜ To Build |
| [etc.] | | |

**TOTAL SCREENS: [X] (must match Step 4)**

Approve flow list? Reply `approve flows` or `revise: [feedback]`.

⚠️ NOTE: This list is imported from Step 4. If screens are missing from Step 4,
go back and update Step 4 first, then re-run this step.
```
---

---

## FLOW PRD TEMPLATE

### PRD Folder Structure (Numbered by Implementation Order)

Organize PRDs in numbered folders by flow, with numbered files per screen:

```
docs/prds/flows/
├── 01-auth/                        # First flow to implement
│   ├── FLOW-AUTH.md                # Flow overview PRD
│   ├── 01-welcome-screen.md        # Screen 1 (implementation order)
│   ├── 02-login-screen.md          # Screen 2
│   ├── 03-signup-screen.md         # Screen 3
│   └── 04-forgot-password.md       # Screen 4
├── 02-onboarding/                  # Second flow to implement
│   ├── FLOW-ONBOARD.md
│   ├── 01-profile-setup.md
│   ├── 02-preferences.md
│   └── 03-first-action.md
├── 03-dashboard/                   # Third flow to implement
│   ├── FLOW-DASHBOARD.md
│   └── 01-main-dashboard.md
└── 04-settings/                    # Fourth flow (P1)
    ├── FLOW-SETTINGS.md
    ├── 01-account-settings.md
    └── 02-notifications.md
```

**Numbering = Implementation Order.** This ensures:
- Step 11 knows which screens to build first
- Dependencies are clear (lower numbers first)
- Progress tracking is straightforward

**File Location:** `/docs/prds/flows/[NN]-[flow-name]/FLOW-[ID]-[NAME].md`

```markdown
# Flow PRD: [Flow Name]

**Flow ID:** [F-XXX]
**Platform:** [Web / Mobile]
**Date:** [YYYY-MM-DD]
**Status:** To Implement

---

## 1. FLOW METADATA

| Field | Value |
|-------|-------|
| **Screens in Flow** | [N] screens |
| **Entry Point** | [Where user enters this flow] |
| **Exit Points** | [Where user can go after completing] |
| **Estimated Build Time** | [X hours/days] |
| **Dependencies** | [Other flows that must exist first] |

---

## 1A. UI PROFILE COMPLIANCE (MANDATORY)

**Source of truth (from Step 3):**
- `/docs/design/UI-PROFILE.md`
- `/docs/design/ui-profile.json`

### Selected Profile

| Field | Value |
|-------|-------|
| **Profile ID** | [uiProfile.id] |
| **Profile Name** | [uiProfile.name] |
| **Radius / Density** | [sharp/soft/round] / [compact/comfortable/spacious] |
| **Accent / Motion** | [muted/moderate/vibrant] / [subtle/moderate/expressive] |
| **Cool Layer** | [on/off] |

### Hard Guardrails (Anti-Toy)

Copy from `ui-profile.json` `rules`:
- Max accent colors per screen: `[rules.maxAccentColorsPerScreen]`
- Max semantic saturation: `[rules.maxSemanticSaturationPercent]%`
- Minimum spring damping (pro profiles): `[rules.minSpringDamping]`
- Max gradients per card: `[rules.maxGradientsPerCard]`
- Max bounce per interaction: `[rules.maxBouncePerInteraction]`

### Effects Layer (Cool, Not Toy)

If cool layer is **on**, apply **only** to:
- Interactive cards (clickable)
- CTAs
- Inputs (focus-visible)

If cool layer is **off**, you still must provide premium focus-visible styles for accessibility.

### Profile Notes (Quick Reference)

- **Cool Professional**: neutral surfaces, minimal accent, subtle hover depth; avoid confetti/bounce-by-default.
- **Satin Dark / Soft Depth**: near-black “satin” base, hairline borders, subtle specular highlight on raised surfaces; avoid always-on glow/beam.

---

## 1B. SPLASH SCREEN ANIMATION SPEC (Mobile Only - Include for Auth/Onboarding Flows)

**⚠️ ANTI-SLOP REQUIREMENT: Every app must have a UNIQUE splash screen. No pulsating circles. No solid backgrounds with static logos.**

### Animation Direction

| Element | Style | Implementation |
|---------|-------|----------------|
| **Background** | [Animated gradient / Particle effect / Lottie scene / Blur layers] | [Library + specific effect] |
| **Logo Entry** | [Fade+Scale / Spin in / Morph from shape / Slide+Bounce / Draw-in] | [Moti/Reanimated config] |
| **Logo Animation** | [Continuous subtle motion / One-time entry / Interactive] | [Duration, easing] |
| **Transition Out** | [Fade to first screen / Slide up / Zoom through logo] | [Transition preset] |

### Lottie Assets (If Using)

| Asset | LottieFiles Link | Local Path | Purpose |
|-------|------------------|------------|---------|
| Splash Background | [URL or "Custom"] | `/assets/animations/splash-bg.json` | Animated background |
| Logo Animation | [URL or "Code-based"] | `/assets/animations/logo.json` | Logo entry effect |

### Timing Spec

| Phase | Duration | Notes |
|-------|----------|-------|
| Background animation start | 0ms | Immediate |
| Logo appears | [X]ms | After background establishes |
| Logo animation completes | [X]ms | Before transition |
| Transition to next screen | [X]ms | Total splash duration |
| **Total Duration** | [X-X]ms | 2-4 seconds recommended |

### Anti-Slop Verification

- [ ] Background is NOT a solid color
- [ ] Logo does NOT have pulsating circle behind it
- [ ] Animation timing is NOT default 300ms everywhere
- [ ] This splash is UNIQUE to this app (not reused from other projects)
- [ ] Animation style matches app personality/tone

---

## 2. CMO CONTEXT (Value Anchoring)

### Revenue Impact
- **Conversion Point:** [Is this a conversion-critical flow?]
- **Drop-off Risk:** [Where do users typically abandon?]
- **Value Delivery:** [What value does user receive?]

### Value Equation Optimization
| Factor | Current State | Target State | Strategy |
|--------|--------------|--------------|----------|
| Dream Outcome ↑ | [Pain point] | [Desired state] | [How we achieve it] |
| Perceived Likelihood ↑ | [Doubt] | [Confidence] | [Trust signals] |
| Time Delay ↓ | [Wait time] | [Instant value] | [Speed optimization] |
| Effort/Sacrifice ↓ | [Friction] | [Effortless] | [Friction removal] |

### Friction Points to Eliminate
1. [Friction point 1] → Solution: [How to fix]
2. [Friction point 2] → Solution: [How to fix]
3. [Friction point 3] → Solution: [How to fix]

---

## 3. USER JOURNEY MAP

```
[Entry Point]
     │
     ▼
┌─────────────┐
│  Screen 1   │ → [User action] → [Emotion target]
│  [Name]     │
└─────────────┘
     │
     ▼
┌─────────────┐
│  Screen 2   │ → [User action] → [Emotion target]
│  [Name]     │
└─────────────┘
     │
     ▼
   [Exit Points]
```

---

## 4. SCREEN SPECIFICATIONS

### Screen 1: [Screen Name]

**Route:** `/path/to/screen` (web) or `ScreenName` (mobile)

**Emotion Target:**
- 0-2 sec: "[First impression feeling]"
- 2-10 sec: "[Exploration feeling]"
- 10+ sec: "[Action feeling]"

**Layout:**
```
┌────────────────────────────────────┐
│           [Header/Nav]             │
├────────────────────────────────────┤
│                                    │
│         [Main Content]             │
│                                    │
├────────────────────────────────────┤
│           [CTA Section]            │
└────────────────────────────────────┘
```

**Components Needed:**
| Component | Source | Install Command | Notes |
|-----------|--------|-----------------|-------|
| [Component 1] | [Library] | [Command] | [Why chosen] |
| [Component 2] | [Library] | [Command] | [Why chosen] |

**Animation Requirements:**
- [ ] [Animation 1]: [Description]
- [ ] [Animation 2]: [Description]

**Interactive States:**
- Default: [Description]
- Hover: [Description]
- Active: [Description]
- Loading: [Description]
- Success: [Description]
- Error: [Description]

---

### Screen 2: [Screen Name]
[Repeat structure for each screen in flow]

---

## 5. MODERN STACK INTEGRATION

### Libraries Required for This Flow

| Library | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| zod | latest | Form validation | `npm i zod` |
| react-hook-form | latest | Form state | `npm i react-hook-form @hookform/resolvers` |
| [etc.] | | | |

### Implementation Patterns

**Forms Pattern (if flow has forms):**
```typescript
// 1. Define Zod schema
const schema = z.object({
  // fields here
})

// 2. Setup react-hook-form
const form = useForm({
  resolver: zodResolver(schema)
})

// 3. Use shadcn Form components
<Form {...form}>
  <FormField name="email" ... />
</Form>
```

**Data Fetching Pattern (if flow needs data):**
```typescript
// 1. Define tRPC procedure
const router = t.router({
  user: {
    list: t.procedure.query(async () => { ... })
  }
})

// 2. Use in component
const { data, isLoading } = trpc.user.list.useQuery()
```

**[Add patterns for each library used in this flow]**

---

## 5A. PROJECT SETUP (INCLUDE IN FIRST FLOW PRD ONLY)

**⚠️ This section should ONLY be included in the FIRST flow PRD (01-auth/FLOW-AUTH.md)**

When implementing this PRD (the first flow), run these commands first to bootstrap the project:

### Web (Next.js) - Recommended

```bash
# 1. Create Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install core UI dependencies
npm install lucide-react clsx tailwind-merge next-themes sonner

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Install premium animation & transition stack
npm install framer-motion next-view-transitions lenis @number-flow/react

# 5. Install components needed for this flow (from Section 6)
npx shadcn@latest add button input form card dialog drawer separator sheet
# Add other components as specified in Component Breakdown tables

# 6. Install modern stack libraries (from Section 5)
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query nuqs
# Add other libraries as specified in Libraries Required table
```

### Web (TanStack Start)

```bash
# 1. Create TanStack Start project
npx create-tanstack-app@latest . --template file-router

# 2. Install Tailwind and core dependencies
npm install tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Install components and libraries per Sections 5 & 6
```

### Mobile (Expo + React Native)

```bash
# 1. Create Expo project
npx create-expo-app@latest . --template blank-typescript

# 2. Install NativeWind (Tailwind for React Native)
npm install nativewind tailwindcss
npx tailwindcss init

# 3. Install navigation (includes gesture handler for screen transitions)
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/elements react-native-screens react-native-safe-area-context react-native-gesture-handler

# 4. Install icons (premium - NO EMOJIS)
npm install lucide-react-native react-native-svg
# Optional alternatives:
# npm install phosphor-react-native        # 9,000+ icons with weight variants
# npm install @tabler/icons-react-native   # 2,200+ MIT icons

# 5. Install animation libraries (PREMIUM STACK)
npx expo install react-native-reanimated
npm install moti react-native-screen-transitions
npx expo install lottie-react-native       # Animated icons & splash screens

# 6. Install charts & data visualization
npm install victory-native                  # React-style charts with animations
# Optional for GPU-accelerated graphics:
# npx expo install @shopify/react-native-skia

# 7. Install special effects & polish
npx expo install expo-blur                  # Frosted glass / blur effects
npx expo install expo-haptics               # Tactile feedback
npx expo install expo-linear-gradient       # Gradient backgrounds
npm install @gorhom/bottom-sheet            # Premium bottom sheets
npm install react-native-confetti-cannon   # Celebration effects

# 8. Install utilities
npm install clsx tailwind-merge zod react-hook-form @hookform/resolvers
```

### Screen Transitions Setup (Expo Router)

After installing `react-native-screen-transitions`, create a custom stack for Expo Router:

```typescript
// app/stack.tsx
import type {
  ParamListBase,
  StackNavigationState,
} from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import {
  createBlankStackNavigator,
  type BlankStackNavigationEventMap,
  type BlankStackNavigationOptions,
} from "react-native-screen-transitions/blank-stack";

const { Navigator } = createBlankStackNavigator();

export const Stack = withLayoutContext<
  BlankStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  BlankStackNavigationEventMap
>(Navigator);
```

Then use in your layout:

```typescript
// app/_layout.tsx
import Transition from "react-native-screen-transitions";
import { Stack } from "./stack";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="details"
        options={{
          ...Transition.Presets.SlideFromBottom(),
        }}
      />
    </Stack>
  );
}
```

### Folder Structure to Create

```
src/
├── app/                    # Routes/pages (Next.js App Router)
│   ├── (auth)/            # Auth flow routes
│   ├── (dashboard)/       # Dashboard flow routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   └── flows/             # Flow-specific components
│       ├── auth/          # Auth flow components
│       └── onboarding/    # Onboarding flow components
├── lib/
│   ├── utils.ts           # cn() and other utilities
│   └── validations/       # Zod schemas
└── hooks/                 # Custom React hooks
```

### After Setup

1. Run `npm run dev` to start the development server
2. Open http://localhost:3000 to verify it works
3. Begin implementing screens from Section 6

---

## 5B. BACKEND DATA OPERATIONS (MANDATORY — Enables Full-Stack PRDs in Step 11)

**⚠️ CRITICAL: Even though Step 5 focuses on UI wireframes, you MUST document the backend data operations needed. This ensures Step 11 PRDs are full-stack from the start.**

### Why This Section Exists

Step 11 PRDs must include database schemas, server actions, and API endpoints. If we don't consider backend requirements during wireframing, Step 11 will produce frontend-only PRDs. This section forces early consideration of data operations.

### Data Operations Required for This Flow

| Screen | Operation | Type | Data Needed | Implementation Note |
|--------|-----------|------|-------------|-------------------|
| [Screen 1] | [e.g., Load user profile] | READ | [e.g., user.name, user.email, user.avatar] | [Will use server component / useQuery] |
| [Screen 1] | [e.g., Update profile] | WRITE | [e.g., name, email, preferences] | [Will use server action / useMutation] |
| [Screen 2] | [e.g., List items] | READ | [e.g., items with pagination] | [Cursor pagination, 20 per page] |
| [Screen 3] | [e.g., Create item] | WRITE | [e.g., title, description, category] | [Optimistic update expected] |

### Database Tables Needed (Preview for Step 11)

| Table | Purpose | Key Fields | RLS Policy Needed |
|-------|---------|------------|-------------------|
| [table_name] | [purpose] | [id, user_id, ...] | Yes - user owns row |

### Server Actions / API Endpoints Needed (Preview for Step 11)

| Action/Endpoint | Purpose | Input | Output |
|-----------------|---------|-------|--------|
| `get[Entity]` | Fetch data for [screen] | [params] | [Entity or Entity[]] |
| `create[Entity]` | Create from [form] | [FormData fields] | [Created Entity] |
| `update[Entity]` | Update from [form] | [id, FormData] | [Updated Entity] |
| `delete[Entity]` | Delete from [button] | [id] | [success boolean] |

### External Integrations

| Service | Purpose | Which Screens | Implementation Note |
|---------|---------|---------------|---------------------|
| [e.g., Stripe] | [e.g., Payment processing] | [Checkout screen] | [Use existing boilerplate hook] |
| [e.g., Resend] | [e.g., Email notifications] | [Invite screen] | [Server action only] |

### Security Considerations (Preview for Step 11)

- [ ] Which operations require authentication? [List]
- [ ] Which operations require specific roles? [List]
- [ ] Are there rate limits needed? [List high-risk operations]
- [ ] Are there sensitive fields to exclude from responses? [List]

**Note to Step 11:** When generating the full PRD for this flow, use this section as the starting point for Section 6 (Database Schema) and Section 7 (Server Actions).

---

## 6. DETAILED COMPONENT SPECIFICATIONS

### Screen 1: [Name]

#### ASCII Wireframe
```
┌─────────────────────────────────────────────────┐
│  ← Back                              [Avatar]   │  ← Header (72px)
├─────────────────────────────────────────────────┤
│                                                 │
│  [HEADLINE TEXT]                    ← h1, 48px │
│  [Subheadline]                      ← p, 18px  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Email                                  │   │
│  │  [input field]                          │   │  ← shadcn Input
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  [Submit Button]                        │   │  ← shadcn Button
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### Component Breakdown (from shadcn MCP + Exa)

| Element | Component | Source | Install | Props/Config | Usage Example |
|---------|-----------|--------|---------|--------------|---------------|
| Email Input | Input + Form | shadcn MCP | `npx shadcn@latest add form input` | `type="email", required` | `<FormField control={form.control} name="email" render={...} />` |
| Submit Button | Button | shadcn MCP | `npx shadcn@latest add button` | `type="submit", disabled={isLoading}` | `<Button type="submit">Submit</Button>` |
| Validation | Zod | npm | `npm i zod` | Schema: `z.string().email()` | `email: z.string().email("Invalid email")` |

#### Form Implementation Spec

**Validation Schema:**
```typescript
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
})
```

**Form Setup:**
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" }
})
```

**Submit Handler:**
```typescript
const onSubmit = async (data: z.infer<typeof formSchema>) => {
  // Call tRPC mutation
  await loginMutation.mutateAsync(data)
}
```

#### Interactive States (All Required)

- **Default:** Empty form, button enabled
- **Typing:** Live validation feedback below fields
- **Validation Error:** Red border on input, error text below
- **Submitting:** Button disabled, loading spinner inside button
- **Success:** Toast notification, redirect to dashboard
- **Error:** Toast with error message, form stays filled

[Repeat this detailed structure for EVERY screen in the flow]

---

## 7. COMPONENT RESEARCH

### shadcn MCP Findings

**Components Queried:**
- [Component name]: [Props, variants, usage]

### Exa Research Findings

**Query:** "[Flow type] UI components premium animation react"

**Key Patterns Found:**
1. [Pattern 1]: [Source URL] - [What to adopt]
2. [Pattern 2]: [Source URL] - [What to adopt]
3. [Pattern 3]: [Source URL] - [What to adopt]

### 21st.dev Inspiration

**Components Explored:**
- [Component name]: [Relevance to this flow]

### Component Selection Decisions

| Need | Options Considered | Selected | Rationale |
|------|-------------------|----------|-----------|
| [Button with animation] | KokonutUI particle-button, Motion Primitives | KokonutUI particle-button | Better visual impact for CTA |
| [Text animation] | Motion Primitives text-effect, KokonutUI typing-text | Motion Primitives text-effect | More customizable |

---

## 8. DESIGN TOKENS

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | #[HEX] | CTAs, links |
| `--background` | #[HEX] | Page background |
| `--foreground` | #[HEX] | Text |
| `--muted` | #[HEX] | Secondary text |
| `--accent` | #[HEX] | Highlights |

### Typography
| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Display | [Font] | [Size] | [Weight] | [LH] |
| H1 | [Font] | [Size] | [Weight] | [LH] |
| Body | [Font] | [Size] | [Weight] | [LH] |

### Spacing
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px

### Border Radius
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `full`: 9999px

---

## 9. IMPLEMENTATION CHECKLIST (For User During Build)

**Use this checklist as you implement this PRD in Cursor.**

### Screen Implementation
- [ ] Screen 1: [Name] - Built and responsive
- [ ] Screen 2: [Name] - Built and responsive
- [ ] Screen N: [Name] - Built and responsive

### Navigation
- [ ] Flow routing configured
- [ ] Transitions between screens smooth
- [ ] Back navigation works correctly
- [ ] Exit points lead to correct destinations

### Animations
- [ ] Entry animations implemented
- [ ] Interaction animations implemented
- [ ] Loading states animated
- [ ] Success/error animations implemented

### Quality Gates
- [ ] Mobile responsive (web) / Platform-native feel (mobile)
- [ ] Dark mode supported (if applicable)
- [ ] Accessibility: Focus states, ARIA labels
- [ ] Performance: No jank, smooth 60fps animations
- [ ] No AI slop: Unique, crafted, memorable

---

## 10. SCREENSHOTS

| Screen | Desktop | Mobile |
|--------|---------|--------|
| [Screen 1] | `screenshots/[flow]-[screen]-desktop.png` | `screenshots/[flow]-[screen]-mobile.png` |

---
```

---


---

## PLATFORM SELECTION (MANDATORY FIRST STEP)

### Ask User for Platform Type

If `--platform` not provided, ask:

```
Which platform are you building for?

1. **Web App (Next.js)** - Next.js 15+ App Router + Tailwind CSS v4 (recommended for most projects)
2. **Web App (TanStack)** - TanStack Start + Router + Tailwind CSS v4 (type-safe, Vite-native)
3. **Mobile App (React Native)** - Expo + React Native + NativeWind (iOS/Android cross-platform)
4. **iOS Native (SwiftUI)** - SwiftUI + SF Symbols (iOS only, Apple-native)

Reply with `nextjs`, `tanstack`, `mobile`, or `swiftui`.
```

### Platform Configuration

| Platform | Framework | Styling | Preview Method |
|----------|-----------|---------|----------------|
| **Web (Next.js)** | Next.js 15+ App Router | Tailwind CSS v4 | `localhost:3000` |
| **Web (TanStack)** | TanStack Start + Router | Tailwind CSS v4 | `localhost:3000` |
| **Mobile (React Native)** | Expo + React Native | NativeWind | iOS Simulator / Expo Go |
| **iOS Native (SwiftUI)** | SwiftUI | Native modifiers | Xcode Simulator / SweetPad |

---

## SUPERDESIGN RAPID PROTOTYPING (OPTIONAL — RECOMMENDED)

**[Superdesign](https://superdesign.dev)** is an open-source AI Design Agent that accelerates wireframe and UI mockup generation. Use it **before or alongside** PRD writing to rapidly explore design options.

### When to Use Superdesign

| Use Case | Superdesign Prompt |
|----------|-------------------|
| **Explore layouts** | "Generate 5 variations of a dashboard layout with sidebar, header, and main content area" |
| **Wireframe screens** | "Create a wireframe for a checkout flow: cart review → shipping → payment → confirmation" |
| **Component design** | "Design a React pricing card component with 3 tiers and toggle for monthly/annual" |
| **Style exploration** | "Design a login page in the style of Linear.app with dark theme" |

### Superdesign Workflow for Step 5

```
1. Open Superdesign sidebar in Cursor
2. Prompt: "Generate wireframe for [FLOW_NAME] flow with [KEY_SCREENS]"
3. Review 3-5 variations
4. Fork and iterate on best option
5. Extract design patterns for PRD
6. Use superdesign_extract_system to capture design tokens
```

### Example Prompt for Flow Wireframes

```
"Generate wireframes for an authentication flow:

Screens:
1. Login - email/password, social login buttons, forgot password link
2. Sign Up - email, password, confirm password, terms checkbox
3. Forgot Password - email input, back to login
4. Email Verification - code input, resend button

Style: Minimal, lots of whitespace, shadcn-inspired
Output: HTML with Tailwind
Variations: 3"
```

### Integration with PRD Generation

After using Superdesign:
1. **Screenshots** → Save to `/docs/wireframes/screenshots/`
2. **Design tokens** → Extract with `superdesign_extract_system`
3. **Component patterns** → Reference in PRD component specs
4. **HTML files** → Use as reference for ASCII wireframes in PRD

> **📚 Reference:** See `/src/foundation-skills/superdesign-integration.md` for detailed prompt patterns.

---

## PHASE 0: BOILERPLATE SCAFFOLDING (OPTIONAL)

**If using SSS boilerplates, scaffold the project BEFORE generating wireframe PRDs.**

### Boilerplate Detection

Check if you're already in a boilerplate project:

```bash
# Check for provenance file
cat .sigma/boilerplate.json 2>/dev/null
```

**If provenance file exists:** Skip to SHADCN MCP SETUP - your project is already scaffolded.

**If no project exists:** Consider using a boilerplate for faster development.

### Boilerplate Decision

**Ask User:**

```
Do you want to use an SSS boilerplate template?

Benefits of boilerplates:
✅ Auth, payments, AI already configured
✅ SSS commands bundled
✅ Production-ready from day 1
✅ 5-minute setup

Options:
1. **nextjs-saas** - Full SaaS (Supabase + Stripe + AI)
2. **expo-mobile** - Mobile app (RevenueCat + Supabase)
3. **nextjs-ai** - AI-first (Convex + AI SDK)
4. **custom** - Start from scratch (no boilerplate)

Reply with: `use nextjs-saas`, `use expo-mobile`, `use nextjs-ai`, or `custom`
```

### If Boilerplate Selected

**Scaffold the project:**

```bash
# Clone the boilerplate
git clone https://github.com/your-org/sss-nextjs-starter.git [project-name]
cd [project-name]

# Run setup wizard
npm run setup

# Install dependencies
npm install

# Verify setup
npm run dev
```

**After scaffolding:**
- Provenance file created at `.sigma/boilerplate.json`
- SSS commands available in `.cursor/commands/`
- Auth, payments, and base UI ready to extend

### PRD Guidance for Boilerplate Projects

**If using boilerplate, wireframe PRDs should:**

1. **Skip auth flow specs** - Already implemented in boilerplate
2. **Reference boilerplate components** - Use stable APIs from `components/auth/`, `components/ui/`
3. **Extend, don't recreate** - Add project-specific flows on top of foundation
4. **Focus on unique features** - Don't re-spec what boilerplate provides

**Example PRD intro for boilerplate projects:**

```markdown
# Flow: [Feature Name]

## Foundation
This flow extends the `nextjs-saas` boilerplate (v1.0.0).

### Pre-Built Components Used
- `<AuthProvider>` from `components/providers/`
- `<CreditsBadge>` from `components/credits/`
- `<Button>` variants from `components/ui/`

### New Components to Build
- [List project-specific components]
```

### Custom Build Path

**If user selects `custom`:**
- Proceed to PLATFORM SELECTION
- Generate complete scaffolding in 01-auth PRD
- No boilerplate assumptions in PRDs

---

## PHASE 0.5: MODULE RECONCILIATION (BOILERPLATE PROJECTS ONLY)

**If using SSS boilerplates, reconcile modules when flows evolve from Step 4.**

This phase compares the project's selected modules (from initial scaffolding) against the current flow-tree.json to detect drift.

### When to Trigger

- **Automatic:** Run if `product/flows/flow-tree.json` exists and project has `.sigma/boilerplate.json`
- **Manual:** User explicitly asks for module reconciliation
- **Always skip if:** Custom build (no boilerplate)

### Reconciliation Steps

#### 1. Read Current State

```typescript
// Load flow-tree.json (from Step 4)
const flowTree = JSON.parse(fs.readFileSync('product/flows/flow-tree.json'));
const flowTreeModules = flowTree.modules.map(m => m.id);

// Load provenance (from generator)
const provenance = JSON.parse(fs.readFileSync('.sigma/boilerplate.json'));
const selectedModules = provenance.modules?.selected || [];
const prunedModules = provenance.modules?.pruned || [];
```

#### 2. Compute Module Diff

```typescript
// New modules needed (in flow-tree, not in selected, not in pruned)
const toAdd = flowTreeModules.filter(
  m => !selectedModules.includes(m) && !prunedModules.includes(m)
);

// Modules no longer needed (in selected, not in flow-tree)
const toRemove = selectedModules.filter(
  m => !flowTreeModules.includes(m) && !isRequired(m)
);

// Previously pruned but now needed
const toRestore = prunedModules.filter(
  m => flowTreeModules.includes(m)
);
```

#### 3. Generate Module Diff Report

**Create `/docs/boilerplate/module-diff.md`:**

```markdown
# Module Reconciliation Report

**Generated:** [TODAY]
**Flow-Tree Source:** product/flows/flow-tree.json
**Provenance Source:** .sigma/boilerplate.json

## Summary

| Action | Count | Modules |
|--------|-------|---------|
| ✅ Matched | [X] | auth, dashboard, settings |
| 🆕 To Add | [Y] | aiChat, notifications |
| 🗑️ To Remove | [Z] | admin |
| 🔄 To Restore | [W] | billing |

## Detailed Actions

### 🆕 Modules to Add

These modules are in flow-tree.json but not currently scaffolded:

| Module | Files to Add | Commands |
|--------|--------------|----------|
| aiChat | `src/app/(app)/chat/`, `src/modules/ai-chat/` | `npx sss-add-module aiChat` |
| notifications | `src/app/(app)/notifications/` | `npx sss-add-module notifications` |

**Safe Action:** Add scaffolding for these modules (non-destructive).

### 🗑️ Modules Flagged for Removal

These modules were scaffolded but not in current flow-tree:

| Module | Files to Review | Risk |
|--------|----------------|------|
| admin | `src/app/(app)/admin/` | Low - likely unused |

**Safe Action:** Keep files but remove from navigation (reversible).
**Destructive Action (requires confirmation):** Delete module files.

### 🔄 Modules to Restore

These modules were previously pruned but are now in flow-tree:

| Module | Status | Action |
|--------|--------|--------|
| billing | Pruned on scaffold | Re-scaffold from template |

**Safe Action:** Generate fresh module from template.
```

#### 4. Module Reconciliation Checkpoint

---
**>>> CHECKPOINT: MODULE RECONCILIATION APPROVAL <<<**

Present module reconciliation options to the user.
**Do NOT continue to applying changes until the user explicitly approves an option.**

Reply `apply safe`, `apply all`, `skip`, or `review: [module]`.

**Prompt to user:**

```
## 🔄 Module Reconciliation Required

Your flow-tree has changed since project scaffolding:

**Changes Detected:**
- 🆕 Add: aiChat, notifications
- 🗑️ Remove: admin
- 🔄 Restore: billing

**Options:**
1. `apply safe` - Add missing modules, flag removals (no deletions)
2. `apply all` - Add missing, remove unused (destructive)
3. `skip` - Continue without reconciliation
4. `review: [module]` - Get details on specific module

Which option? (default: apply safe)
```
---

#### 5. Apply Safe Actions (Add-Only)

```typescript
// For each module to add
for (const moduleId of toAdd) {
  await scaffoldModule(moduleId, template);
  updateNavigation(projectPath, moduleId, 'add');
  console.log(`✅ Added module: ${moduleId}`);
}

// For each module to restore
for (const moduleId of toRestore) {
  await scaffoldModule(moduleId, template);
  updateNavigation(projectPath, moduleId, 'add');
  console.log(`🔄 Restored module: ${moduleId}`);
}

// Flag removals (don't delete)
for (const moduleId of toRemove) {
  updateNavigation(projectPath, moduleId, 'comment-out');
  console.log(`⚠️ Flagged for removal: ${moduleId} (nav commented out)`);
}

// Update provenance
updateProvenance(projectPath, {
  selected: [...selectedModules, ...toAdd, ...toRestore],
  pruned: prunedModules.filter(m => !toRestore.includes(m)),
  lastReconciled: new Date().toISOString()
});
```

### Reconciliation is Optional but Recommended

- **If no flow-tree.json:** Skip reconciliation, use boilerplate defaults
- **If flow-tree matches selected modules:** No action needed, proceed to PRDs
- **If significant drift:** Strongly recommend reconciliation before PRDs

---

## SHADCN MCP SETUP (REQUIRED FOR CURSOR)

Before starting Step 5, configure the shadcn MCP server in Cursor for component discovery:

### Setup Steps

1. Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

2. Open Cursor Settings (Cmd/Ctrl + ,)
3. Navigate to MCP Servers section
4. Enable the "shadcn" server (you should see a green dot)
5. Verify tools are available: browse_components, search_components, install_component

### Test Your Setup

Ask the AI: "Show me all available shadcn button components"
- If working: You'll see a list of button variants
- If not: Check Cursor logs under View > Output > "MCP: project-*"

**Why This Matters:** The shadcn MCP gives the AI direct access to component APIs, props, and usage examples during PRD generation. This ensures accurate component specifications with real installation commands and proper usage patterns.

---

## COMPONENT LIBRARY ECOSYSTEM

### Available Premium Component Sources

| Library | Best For | Install Method | Registry |
|---------|----------|----------------|----------|
| **21st.dev MCP** | Custom component generation, inspiration | Via MCP tool | N/A |
| **Magic UI** | Premium animated components (Marquee, Orbs, Grids) | `npx shadcn@latest add https://magicui.design/r/[name]` | [magicui.design](https://magicui.design) |
| **KokonutUI** | Animated buttons, AI components, glass effects | `npx shadcn@latest add @kokonutui/[component]` | `https://kokonutui.com/r/{name}.json` |
| **Motion Primitives** | Polished micro-interactions, morphing dialogs | `npx motion-primitives@latest add [component]` | [motion-primitives.com](https://motion-primitives.com) |
| **Cult UI** | AI patterns, dock, video players | `npx shadcn@latest add https://www.cult-ui.com/r/[name]` | [cult-ui.com](https://cult-ui.com) |
| **NextUI** | Full component system (alternative to shadcn) | `npm i @nextui-org/react` | [nextui.org](https://nextui.org) |
| **Magic UI Templates** | Complete page templates (startup, mobile, portfolio) | Copy from `/commands/Magic UI/` | Local |

### Premium Web Transitions (Next.js)

| Library | Purpose | Install | Rationale |
|---------|---------|---------|-----------|
| **next-view-transitions** | Native View Transition API for Next.js | `npm i next-view-transitions` | Smoothest page transitions without Framer complexity |
| **framer-motion** | Custom page/layout animations | `npm i framer-motion` | Industry standard for orchestrating transitions |
| **react-transition-progress** | Browser-like progress bar for transitions | `npm i react-transition-progress` | Better UX for long-loading page transitions |
| **lenis** | Smooth scrolling for landings/dashboards | `npm i lenis` | Premium feel for long-form content |

### Modern Web Stack (Next.js / TanStack)

| Library | Purpose | Install | Rationale |
|---------|---------|---------|-----------|
| **sonner** | Premium toasts/notifications | `npm i sonner` | Cleanest, lightest notification system |
| **vaul** | Drawer/Bottom sheet for web | `npm i vaul` | Best-in-class mobile-like drawers on web |
| **cmdk** | Command palette (Cmd+K) | `npm i cmdk` | Power user navigation / actions |
| **nuqs** | URL search param state management | `npm i nuqs` | Type-safe URL state for filters/search |
| **embla-carousel** | Fluid carousels and sliders | `npm i embla-carousel-react` | Lightweight and accessible sliders |
| **@number-flow/react** | Animated number transitions | `npm i @number-flow/react` | Best for prices, stats, and counters |

### Premium Icon Libraries (MANDATORY - No Emojis)

**Rule:** Never use emojis or basic system icons. Always use a consistent, premium icon library.

#### Web App Icons (Next.js / TanStack)

| Library | Style | Install | Best For |
|---------|-------|---------|----------|
| **Lucide React** | Clean, consistent stroke icons | `npm i lucide-react` | Primary choice - 1400+ icons, tree-shakeable |
| **Phosphor Icons** | 6 weight variants per icon | `npm i @phosphor-icons/react` | Flexible - thin to bold variants |
| **Tabler Icons** | Stroke-based, extensive | `npm i @tabler/icons-react` | 5000+ icons, MIT license |
| **Heroicons** | Tailwind official | `npm i @heroicons/react` | Solid + Outline variants, Tailwind native |
| **Radix Icons** | Minimal, accessible | `npm i @radix-ui/react-icons` | shadcn/ui compatible |

**Recommended:** Use **Lucide React** as primary. It has the best balance of quality, quantity, and tree-shaking.

```tsx
// Example usage
import { Home, Settings, User, ChevronRight } from 'lucide-react';

<Home className="w-6 h-6 text-primary" />
<Settings size={24} strokeWidth={1.5} />
```

#### Mobile App Icons (Expo / React Native)

| Library | Style | Install | Best For |
|---------|-------|---------|----------|
| **Lucide React Native** | Clean, matches web | `npm i lucide-react-native react-native-svg` | Primary - consistent with web codebase |
| **@expo/vector-icons** | Built-in to Expo | Included with Expo | FontAwesome, Ionicons, MaterialIcons |
| **Phosphor React Native** | 6 weight variants | `npm i phosphor-react-native react-native-svg` | Flexible weights |
| **Hugeicons React Native** | Modern, detailed | `npm i @hugeicons/react-native` | Premium feel, 4000+ icons |

**Recommended:** Use **Lucide React Native** as primary to match web icons.

```tsx
// Example usage (React Native)
import { Home, Settings, User } from 'lucide-react-native';

<Home color="#000" size={24} />
<Settings color={colors.primary} size={24} strokeWidth={1.5} />
```

#### iOS Native Icons (SwiftUI)

| Library | Style | Install | Best For |
|---------|-------|---------|----------|
| **SF Symbols** (built-in) | Apple native | None (built-in) | PRIMARY - 5,000+ icons, no package |
| **SFSafeSymbols** | Type-safe SF Symbols | SPM: `github.com/SFSafeSymbols/SFSafeSymbols` | Compile-time checked names |

**REQUIRED:** Use **SF Symbols** for all SwiftUI apps — no external icon packages.

```swift
// Basic SF Symbol
Image(systemName: "house.fill")
    .font(.title)
    .foregroundStyle(.blue)

// With symbol effects (iOS 17+)
Image(systemName: "wifi")
    .symbolEffect(.variableColor.iterative)

// Multicolor rendering
Image(systemName: "cloud.sun.fill")
    .symbolRenderingMode(.multicolor)

// In a Label (icon + text)
Label("Settings", systemImage: "gear")

// Tab item
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")
        }
}
```

**Browse SF Symbols:** Download the [SF Symbols app](https://developer.apple.com/sf-symbols/) from Apple.

**Reference:** `/docs/swiftui/SWIFTUI-LIBRARIES.md` → SF Symbols section
```

### 3D Graphics & Advanced Animations (Optional Premium)

**When to use 3D:** Logos that need to stand out, product visualizations, hero sections, premium onboarding.

#### Web 3D (Three.js + React Three Fiber)

```bash
npm i three @react-three/fiber @react-three/drei
```

| Library | Purpose | Install |
|---------|---------|---------|
| **Three.js** | Core 3D engine | `npm i three` |
| **React Three Fiber** | React renderer for Three.js | `npm i @react-three/fiber` |
| **Drei** | Useful helpers & components | `npm i @react-three/drei` |

```tsx
// Example: 3D Logo Component
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function Logo3D() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </Float>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
```

#### Mobile 3D (expo-three)

```bash
npx expo install expo-gl expo-three three
```

| Library | Purpose | Install |
|---------|---------|---------|
| **expo-gl** | OpenGL ES context for Expo | `npx expo install expo-gl` |
| **expo-three** | Three.js utilities for Expo | `npx expo install expo-three` |

**Note:** 3D on mobile is more complex. Use sparingly for hero moments, not navigation.

### Animation Libraries (Both Platforms)

| Platform | Library | Install | Use Case |
|----------|---------|---------|----------|
| **Web** | Framer Motion | `npm i framer-motion` | All-purpose animations, gestures |
| **Web** | Motion Primitives | `npx motion-primitives@latest add [component]` | Premium pre-built components |
| **Web** | GSAP | `npm i gsap` | Complex timelines, scroll animations |
| **Mobile** | Moti | `npm i moti` | Declarative, Framer-like API |
| **Mobile** | Reanimated 3 | `npx expo install react-native-reanimated` | High-performance, worklet-based |
| **Mobile** | Screen Transitions | `npm i react-native-screen-transitions` | Shared elements, gesture-driven nav |
| **Mobile** | Lottie | `npx expo install lottie-react-native` | After Effects animations as JSON |
| **Mobile** | React Native Fiesta | `npm i react-native-fiesta` | Celebrations (confetti, stars) |

**Animation Philosophy:**
- Use **Framer Motion** (web) or **Moti** (mobile) for 90% of animations
- Use **Reanimated 3** for performance-critical mobile animations
- Use **Screen Transitions** for Instagram/Apple Music style shared element transitions
- Use **Lottie** for complex illustrations/mascots and splash screens
- Use **Motion Primitives** for premium web components

---

## ANTI-SLOP ANIMATION RULES (MANDATORY)

**Every mobile app MUST avoid generic, AI-generated animation patterns. Each app should feel unique and intentional.**

### ❌ BANNED Animation Patterns (Never Use These)

| Pattern | Why It's Slop | What To Use Instead |
|---------|---------------|---------------------|
| **Pulsating circle behind logo** | Every AI app does this | Unique logo animation (spin, morph, fade-scale) |
| **Solid color splash + static logo** | Lazy, no personality | Animated background + animated logo entry |
| **Same bounce animation everywhere** | Generic, unmemorable | Varied timing, physics-based springs |
| **Default 300ms timing on everything** | Robotic, unnatural | Intentional timing per interaction type |
| **Generic loading spinner** | Boring, no brand | Custom Lottie loader or skeleton screens |
| **Unstyled default charts** | Looks like a template | Themed charts matching design system |
| **Emoji as icons** | Unprofessional | Lucide, Phosphor, or custom icons |

### ✅ REQUIRED Animation Standards

| Element | Requirement | Implementation |
|---------|-------------|----------------|
| **Splash Screen** | Unique animated background + unique logo animation | Lottie OR Moti + linear-gradient |
| **Logo Animation** | Must NOT be pulsating circle | Spin, morph, fade+scale, slide-in, etc. |
| **Screen Transitions** | Custom per app personality | react-native-screen-transitions presets |
| **Loading States** | Branded skeleton OR custom Lottie | Moti Skeleton or LottieFiles |
| **Success States** | Celebration appropriate to action | Confetti, checkmark animation, haptic |
| **Charts** | Themed to design system colors | Victory Native with custom theme |
| **Micro-interactions** | Physics-based, not linear | Moti/Reanimated spring configs |

### Animation Uniqueness Checklist (Per App)

Before approving any flow PRD, verify:

- [ ] Splash screen animation is **unique to this app** (not used in other projects)
- [ ] Logo animation style matches **app personality/tone**
- [ ] Loading states use **branded elements** (not generic spinners)
- [ ] Screen transitions are **intentional** (not default slide)
- [ ] Charts are **themed** to match app colors
- [ ] Success/error states have **appropriate feedback** (haptics, animations)
- [ ] No emojis used as icons anywhere

---

## LOTTIE WORKFLOW (Animated Assets Without Design Skills)

**Lottie lets you use professional After Effects animations without design skills. Browse, download, implement.**

### How It Works

1. **Browse LottieFiles** → https://lottiefiles.com
2. **Download JSON file** → Save to `/assets/animations/`
3. **AI implements component** → Uses `lottie-react-native`

### Recommended LottieFiles Categories

| Use Case | Search Query | Link |
|----------|--------------|------|
| **Splash Screens** | "splash screen", "app intro" | [LottieFiles Splash](https://lottiefiles.com/search?q=splash+screen) |
| **Loading States** | "loading", "spinner", "skeleton" | [LottieFiles Loading](https://lottiefiles.com/search?q=loading) |
| **Success States** | "success", "checkmark", "done" | [LottieFiles Success](https://lottiefiles.com/search?q=success) |
| **Error States** | "error", "warning", "alert" | [LottieFiles Error](https://lottiefiles.com/search?q=error) |
| **Empty States** | "empty", "no data", "not found" | [LottieFiles Empty](https://lottiefiles.com/search?q=empty+state) |
| **Onboarding** | "onboarding", "welcome", "tutorial" | [LottieFiles Onboarding](https://lottiefiles.com/search?q=onboarding) |
| **Celebrations** | "confetti", "celebration", "party" | [LottieFiles Celebration](https://lottiefiles.com/search?q=celebration) |
| **Icons (Animated)** | "icon", "menu", "hamburger" | [LottieFiles Icons](https://lottiefiles.com/search?q=animated+icon) |

### Lottie Implementation Pattern

```typescript
// 1. Install (already in project setup)
// expo install lottie-react-native

// 2. Import in component
import LottieView from 'lottie-react-native';

// 3. Use in JSX
<LottieView
  source={require('../assets/animations/splash.json')}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
  onAnimationFinish={() => navigation.navigate('Home')}
/>
```

### Manual Step Required

**You (the user) must:**
1. Browse LottieFiles and pick animations that match your app's personality
2. Download the `.json` files
3. Place them in `/assets/animations/`

**The AI will:**
- Generate PRD specs referencing these animations
- Implement the Lottie components when you build the PRD

### Animation Levels (Effort Guide)

| Level | Description | Manual Work | Tools |
|-------|-------------|-------------|-------|
| **1 - Code Only** | Logo fades, scales, rotates | None | Moti, Reanimated |
| **2 - Lottie Browse** | Pre-made splash, loaders | 2-5 min browse | LottieFiles.com |
| **3 - Custom Lottie** | Bespoke brand animations | Hire designer | After Effects |
| **4 - 3D/Interactive** | 3D logos, interactive | Significant | expo-three, Skia |

**Most apps should use Level 1-2 only.** Level 3-4 are for premium/funded projects.

### Screen Transitions Presets (Mobile)

| Preset | Description | Best For |
|--------|-------------|----------|
| `SlideFromTop()` | Slides in from top, vertical gesture dismiss | Notifications, alerts |
| `SlideFromBottom()` | Slides in from bottom, vertical gesture dismiss | Modals, sheets, details |
| `ZoomIn()` | Scales in with fade, no gesture | Focus transitions |
| `DraggableCard()` | Multi-directional drag with card scaling | Swipeable cards |
| `ElasticCard()` | Elastic drag with overlay darkening | Interactive cards |
| `SharedIGImage({ sharedBoundTag })` | Instagram-style shared image | Photo galleries |
| `SharedAppleMusic({ sharedBoundTag })` | Apple Music-style shared element | Album/playlist details |
| `SharedXImage({ sharedBoundTag })` | X (Twitter)-style image transition | Media viewers |

**Usage Example:**
```typescript
import Transition from "react-native-screen-transitions";

// Basic preset
<Stack.Screen
  name="detail"
  options={{ ...Transition.Presets.SlideFromBottom() }}
/>

// Shared element (pass tag via params)
<Stack.Screen
  name="photo"
  options={({ route }) => ({
    ...Transition.Presets.SharedIGImage({
      sharedBoundTag: route.params?.sharedBoundTag ?? ""
    })
  })}
/>
```

### Component Selection Strategy (Research-Based)

For EACH UI element needed:
1. **Research First:** Use `get_code_context_exa` with query: "[component type] react animation premium"
2. **Check 21st.dev:** Use MCP `21st_magic_component_inspiration` for inspiration
3. **Match to Library:** Based on research, select the best source:
   - **Animated buttons/loaders** → KokonutUI
   - **Text effects/animations** → Motion Primitives or KokonutUI
   - **AI/Agent patterns** → Cult UI
   - **Full page layouts** → Magic UI templates
   - **Custom/unique needs** → 21st.dev MCP builder
4. **Document in PRD:** Record why each component was chosen

### Animation Library Decision Table (Reference Guide)

**Use this when selecting animation components — not every app needs all categories.**

| Category | Effect | Recommended Component |
|----------|--------|----------------------|
| **Text** | Character reveal | Motion Primitives `text-effect` |
| | Typewriter | KokonutUI `typing-text` |
| | Glitch / Matrix | KokonutUI `glitch-text`, `matrix-text` |
| | Shimmer / Blur | KokonutUI `shimmer-text`, Magic UI `blur-fade` |
| **Numbers** | Smooth flow | `@number-flow/react` |
| | Count up / Slide | Motion Primitives `animated-number`, `sliding-number` |
| **Buttons** | Particle / Magnetic / Gradient | KokonutUI `particle-button`, `magnet-button`, `gradient-button` |
| **Navigation** | macOS dock | Motion Primitives `dock` or Cult UI `dock` |
| | Morphing / Tabs | KokonutUI `morphic-navbar`, `smooth-tab` |
| **Page Transitions** (Web) | Native feel / Layout / Progress | `next-view-transitions`, `framer-motion`, `react-transition-progress` |
| **Input/Form** | Border trail / Glow | Motion Primitives `border-trail`, `glow-effect` |
| | AI-powered | KokonutUI `ai-input-*` |
| **Cards** | Mouse tracking / Shine / Tilt | KokonutUI `mouse-effect-card`, Magic UI `magic-card`, Motion Primitives `tilt` |
| **Backgrounds** | Beams / Grid / Ripple / Paths | KokonutUI `beams-background`, Magic UI `flickering-grid`, `ripple`, KokonutUI `background-paths` |
| **Dialogs** | Morphing / Drawer | Motion Primitives `morphing-dialog`, `vaul`, KokonutUI `smooth-drawer` |
| **Loading** | Premium / AI / Skeleton | KokonutUI `loader`, `ai-state-loading`, custom skeleton |
| **Screen Nav** (Mobile) | Shared element transitions | Screen Transitions: `SharedIGImage`, `SharedAppleMusic`, `SharedXImage` |
| | Sheet / Card / Custom | Screen Transitions: `SlideFromBottom`, `DraggableCard`, `screenStyleInterpolator` |

> **Rule of Thumb:** Motion Primitives for subtle, professional animations. KokonutUI for eye-catching, feature-specific animations.

### KokonutUI Component Catalog (Key Categories)

| Category | Key Components | Install |
|----------|---------------|---------|
| **AI** | `ai-input-selector`, `ai-input-search`, `ai-state-loading`, `ai-voice` | `npx shadcn@latest add @kokonutui/[name]` |
| **Buttons** | `particle-button`, `gradient-button`, `magnet-button`, `hold-button`, `social-button` | |
| **Text** | `typing-text`, `matrix-text`, `glitch-text`, `shimmer-text`, `scroll-text` | |
| **Layout** | `liquid-glass`, `bento-grid`, `mouse-effect-card`, `card-flip-stack`, `morphic-navbar` | |
| **Other** | `loader`, `beams-background`, `background-paths`, `smooth-tab`, `smooth-drawer` | |

### Motion Primitives Component Catalog (Key Categories)

**Top 5 quality benchmark components** (use when they fit the app's needs):

| Component | When to Consider |
|-----------|------------------|
| **`border-trail`** | Forms, inputs, or cards needing premium focus states |
| **`dock`** | Apps where bottom nav is core to the experience |
| **`animated-number`** | Dashboards, stats-heavy apps, progress tracking |
| **`text-effect`** | Onboarding flows, landing pages, hero sections |
| **`glow-effect`** | Card-based UIs, interactive galleries |

**Full catalog by category:**

| Category | Components |
|----------|-----------|
| **Text** | `text-effect`, `text-loop`, `text-morph`, `text-roll`, `text-scramble`, `text-shimmer` |
| **Numbers** | `animated-number`, `sliding-number` |
| **Interactive** | `dock`, `glow-effect`, `tilt`, `magnetic`, `spotlight`, `scroll-progress` |
| **Core** | `accordion`, `border-trail`, `carousel`, `dialog`, `disclosure`, `in-view`, `transition-panel` |
| **Advanced** | `morphing-dialog`, `morphing-popover`, `progressive-blur`, `toolbar-dynamic` |

**Install:** `npx motion-primitives@latest add [component-name]`

> **📚 Animation Research Reference:** See `/commands/MOBILE_APP_DESIGN_LEARNINGS.md` for comprehensive animation patterns, code examples, and aesthetic checklists.

---

## MODERN REACT STACK LIBRARIES (2025 STANDARD)

These libraries should be documented in PRDs when relevant to the flow.

### Form & Validation Layer

| Library | Purpose | Install | When to Use in PRDs |
|---------|---------|---------|---------------------|
| **zod** | Schema validation | `npm i zod` | All forms - define validation schemas |
| **react-hook-form** | Form state management | `npm i react-hook-form @hookform/resolvers` | All forms - wire inputs to validation |
| **@hookform/resolvers** | Connect Zod to RHF | (included above) | Forms with Zod schemas |

**PRD Template Addition:**
```typescript
// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Form setup
const form = useForm({
  resolver: zodResolver(loginSchema)
})
```

### Data Fetching & State Layer

| Library | Purpose | Install | When to Use in PRDs |
|---------|---------|---------|---------------------|
| **tRPC** | Type-safe API client | `npm i @trpc/client @trpc/server @trpc/react-query` | All data-driven screens |
| **@tanstack/react-query** | Async state management | `npm i @tanstack/react-query` | Data fetching, caching |
| **zustand** | Client state management | `npm i zustand` | Global UI state (modals, themes) |

**PRD Template Addition:**
```typescript
// tRPC API call
const { data, isLoading } = trpc.user.list.useQuery()

// Zustand store
const useStore = create((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true })
}))
```

### Utility Libraries

| Library | Purpose | Install | When to Use in PRDs |
|---------|---------|---------|---------------------|
| **date-fns** | Date manipulation | `npm i date-fns` | Screens with dates, calendars |
| **nuqs** | URL state management | `npm i nuqs` | Tables, filters, pagination |

**PRD Template Addition:**
```typescript
// Date formatting
import { format } from 'date-fns'
format(new Date(), 'MMM dd, yyyy')

// URL state (search params)
const [search, setSearch] = useQueryState('q')
```

### Advanced Features

| Library | Purpose | Install | When to Use in PRDs |
|---------|---------|---------|---------------------|
| **@tanstack/react-table** | Advanced tables | `npm i @tanstack/react-table` | Data tables with sorting, filtering |
| **recharts** | Charts & graphs | `npm i recharts` | Dashboards, analytics screens |
| **ai** (Vercel AI SDK) | AI/LLM features | `npm i ai @ai-sdk/react` | Chat, AI assistants, generations |

**PRD Template Addition:**
```typescript
// React Table
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel()
})

// Vercel AI SDK
const { messages, input, handleSubmit } = useChat({
  api: '/api/chat'
})
```

### Library Decision Matrix

When speccing screens, include these libraries based on screen type:

| Screen Type | Required Libraries | Optional Libraries |
|-------------|-------------------|-------------------|
| **Forms** | zod, react-hook-form | date-fns (if dates) |
| **Data Tables** | @tanstack/react-table, react-query | nuqs (URL filters) |
| **Dashboards** | react-query, recharts | zustand (UI state) |
| **Chat/AI** | ai (Vercel SDK), react-query | zustand (chat history) |
| **Auth Flows** | zod, react-hook-form, tRPC | - |

---

## LANDING PAGE WIREFRAME (REQUIRED)

**Purpose:** Build a full landing page prototype with PLACEHOLDER copy. Step 9 will replace placeholder copy with conversion-optimized copy.

### Template Selection

**Template Location:** `.cursor/commands/Magic UI/`

| Template | Best For | When to Use |
|----------|----------|-------------|
| `startup-template/` | B2B SaaS, General Startups | Most common choice - clean, professional |
| `agent-template-/` | AI Agents, Chatbots | Dark mode, modern aesthetic, AI-focused |
| `mobile-template-/` | iOS/Android Apps | Device mockups, app store feel |
| `devtool-template/` | Developer Tools, APIs | Technical aesthetic, code blocks, dark mode |
| `portfolio/` | Personal sites, Agencies | Creative layouts, showcase-focused |
| `blog-template-bc0cb81/` | Content-heavy sites | Article layouts, SEO-focused |
| `changelog-template/` | Product updates, Releases | Timeline layouts, version history |

---
**>>> CHECKPOINT: MAGIC UI TEMPLATE SELECTION <<<**

Present Magic UI template options to the user.
**Do NOT continue to Landing Page Wireframe Structure until the user explicitly selects a template or skips.**

Reply with template name or `skip`.

**Prompt:** "Which Magic UI template best fits your product? Reply with template name or `skip` to proceed without template."
---

### Landing Page Wireframe Structure

Build a full landing page prototype with PLACEHOLDER copy:

1. **Hero Section**
   - Headline placeholder: `[MAIN VALUE PROPOSITION]`
   - Subheadline placeholder: `[SUPPORTING STATEMENT]`
   - CTA button placeholder: `[PRIMARY ACTION]`
   - Hero image/mockup area

2. **Social Proof Bar**
   - Logo placeholders: `[LOGO 1] [LOGO 2] [LOGO 3]`
   - Trust indicator: `[SOCIAL PROOF STATEMENT]`

3. **Problem/Solution Section**
   - Problem headline: `[PAIN POINT]`
   - Solution headline: `[YOUR SOLUTION]`
   - 3-4 benefit points with placeholders

4. **Features/Benefits Grid**
   - Feature cards with placeholder titles and descriptions
   - Icons or illustrations for each feature

5. **Testimonials Section**
   - Quote placeholders: `[CUSTOMER TESTIMONIAL 1]`
   - Customer name/title placeholders

6. **Pricing Section** (if applicable)
   - Tier placeholders: `[TIER 1] [TIER 2] [TIER 3]`
   - Price placeholders: `$[PRICE]/mo`
   - Feature list placeholders

7. **FAQ Section**
   - Question/answer placeholders

8. **Final CTA Section**
   - Closing headline placeholder
   - CTA button placeholder

### Wireframe Output

**Output Files:**
- `/docs/wireframes/LANDING-PAGE-WIREFRAME.md` - Structure documentation + detailed PRD

**User Implementation:** After receiving this PRD, user creates `src/app/(marketing)/page.tsx` (web) or appropriate route

### Integration with Step 9

**Important:** Step 9 (Landing Page) will focus ONLY on conversion copywriting:
- Avatar research (who is the customer?)
- Emotional diary (what do they feel?)
- Hormozi/Cialdini copy frameworks
- Replacing placeholders with optimized copy

This separation ensures:
- Visual design is locked before copywriting
- Copy can be A/B tested without design changes
- Clear handoff between design and marketing

---

## PHASE A — Platform & Flow Discovery

### A.1 Preflight

1. **Get Date:** `date +"%Y-%m-%d"`
2. **Check for Existing Project:**
   ```bash
   # Check if package.json exists
   ls package.json 2>/dev/null
   ```
3. **Read Context Files (if they exist):**
   - `/docs/stack-profile.json`
   - `/docs/ux/UX-DESIGN.md`
   - `/docs/specs/MASTER_PRD.md`
   - `/docs/design/INSPIRATION.md`
   - `/docs/design/UI-PROFILE.md`
   - `/docs/design/ui-profile.json`

### A.2 Platform Selection

**If not provided via `--platform`:**

---
**>>> CHECKPOINT: PLATFORM SELECTION APPROVAL <<<**

Ask platform question to the user.
**Do NOT continue to Flow Discovery until the user explicitly selects a platform.**

Reply `web` or `mobile`.

**Prompt:**
```
Which platform are you building for?

1. **Web App** - Next.js + Tailwind CSS v4
   - Modern web application with App Router
   - Preview at localhost:3000
   - Best for: SaaS, dashboards, marketing sites

2. **Mobile App** - Expo + React Native + NativeWind
   - Native iOS/Android app
   - Preview in iOS Simulator or Android Emulator
   - Best for: Consumer apps, mobile-first experiences

Reply `web` or `mobile`.
```
---

### A.3 Flow Discovery

1. **Read UX Design (if exists):**
   - Extract user journeys
   - Identify all screens mentioned
   - Map to flow categories

2. **Generate Flow Inventory:**

| Flow ID | Flow Name | Screens | Entry | Exit | Priority | Status |
|---------|-----------|---------|-------|------|----------|--------|
| F-AUTH | Authentication | Landing, Login, Signup, Forgot PW | Direct URL | Dashboard | P0 | To Build |
| F-ONBOARD | Onboarding | Welcome, Setup, Tutorial | Post-signup | Dashboard | P0 | To Build |
| [Continue...] | | | | | | |

---
**>>> CHECKPOINT: PHASE A FLOW INVENTORY APPROVAL <<<**

Present flow inventory to the user.
**Do NOT continue to Phase B until the user explicitly approves.**

Reply `approve flows` or `revise: [feedback]`.

**Prompt:**
```
## Flow Inventory

| Flow ID | Flow Name | Screens | Priority |
|---------|-----------|---------|----------|
| F-AUTH | Authentication | 4 screens | P0 |
| F-ONBOARD | Onboarding | 3 screens | P0 |
| F-CORE | Core Features | 5 screens | P0 |
| F-SETTINGS | Settings | 3 screens | P1 |

Approve this flow list? Reply `approve flows` or `revise: [feedback]`.
```
---

---

## PHASE B — PRD Setup (No Code Execution)

### B.1 Verify Step 4 Import

Confirm you have:
- `/docs/flows/FLOW-TREE.md`
- `/docs/flows/SCREEN-INVENTORY.md`
- `/docs/prds/flows/WIREFRAME-TRACKER.md`

### B.2 Create PRD Folder Structure

```bash
mkdir -p docs/prds/flows
mkdir -p docs/wireframes
```

**That's it.** No npm installs, no dev servers, no code generation.

---

## PHASE C — Per-Flow PRD Generation (LOOP)

**Execute this phase for EACH flow, starting with P0 flows.**

### C.1 Enhanced Research Phase (shadcn MCP + Exa)

Before writing the PRD, gather component intelligence using BOTH tools:

**Step 1: shadcn MCP Component Discovery**

Use Cursor's AI with shadcn MCP enabled:

Ask the AI:
- "Show me all shadcn form components" (for auth/form flows)
- "Search shadcn for data table components" (for dashboard flows)
- "What are the props for shadcn Dialog component?" (for modals)

Document findings:
- Component name (e.g., "Dialog", "Form", "DataTable")
- Available variants/sub-components
- Required props and common patterns
- Installation command from MCP

**Step 2: Exa Pattern Research**

Use Exa MCP for broader ecosystem patterns:

```
get_code_context_exa queries:
- "[Flow type] UI design patterns React 2025"
- "[Screen type] form validation zod react-hook-form"
- "tRPC react-query [feature] implementation patterns"
```

Document findings:
- Common implementation patterns
- Integration examples (e.g., react-hook-form + shadcn Form)
- Best practices from production apps

**Step 3: Modern Stack Integration**

Based on screen requirements, identify which modern stack libraries to spec:

- Forms? → zod + react-hook-form + shadcn Form components
- Data fetching? → tRPC + react-query
- Tables? → @tanstack/react-table + shadcn Table
- Charts? → recharts
- Dates? → date-fns + shadcn Calendar
- AI features? → Vercel AI SDK + shadcn custom components

**Step 4: 21st.dev Fallback (if needed)**

Use 21st_magic_component_inspiration for:
- Custom animations not in shadcn
- Unique components not covered by shadcn
- Premium animated variants

**Document ALL findings in PRD Section 5: "Component Research"**

### C.2 Generate Flow PRD

Create `/docs/prds/flows/FLOW-[ID]-[NAME].md` using the template above.

**Key sections to complete:**
1. Flow Metadata (screens, entry/exit points)
2. UI Profile Compliance (required; must match `/docs/design/UI-PROFILE.md`)
3. CMO Context (value anchoring, friction analysis)
4. User Journey Map (visual flow)
5. Screen Specifications (layout, components, animations)
6. Component Research (Exa findings, library selections)
7. Design Tokens (colors, typography, spacing)
8. Implementation Checklist

---
**>>> CHECKPOINT: FLOW PRD APPROVAL <<<**

Present Flow PRD for user approval.
**Do NOT continue to PRD finalization until the user explicitly approves.**

Reply `approve prd` or `revise prd: [feedback]`.

**Prompt:**
```
## Flow PRD: [Flow Name]

I've created the PRD at `/docs/prds/flows/FLOW-[ID]-[NAME].md`.

**Summary:**
- Screens: [N]
- Components to install: [List]
- Key animations: [List]
- Estimated build time: [X hours]

**Component Sources:**
- [Component 1] → KokonutUI
- [Component 2] → Motion Primitives
- [Component 3] → 21st.dev (custom)

Review the PRD and reply:
- `approve prd` - Start building this flow
- `revise prd: [feedback]` - Make changes to the PRD
```
---

### C.3 Finalize PRD Specifications

---
**>>> CHECKPOINT: PRD FINALIZATION APPROVAL <<<**

Present completed PRD to the user for final approval.
**Do NOT continue to next flow until the user explicitly approves or requests revision.**

Reply `approve prd`, `revise prd: [feedback]`, or `done`.

**Prompt:**
```
## Flow PRD Complete: [Flow Name]

I've generated the detailed PRD at `/docs/prds/flows/[NN]-[flow-name]/FLOW-[ID].md`

**What's in this PRD:**
- ✅ [N] screens with detailed ASCII wireframes
- ✅ Component specifications with exact install commands
- ✅ Modern stack patterns (zod, react-hook-form, etc.)
- ✅ Design tokens and styling specs
- ✅ All interactive states defined

---

## YOUR NEXT STEPS (You Implement This)

**Step 5 generates PRDs only. YOU implement the code.**

**To implement this PRD:**
1. Open a new Cursor window in your project folder
2. Drag this PRD file into Cursor chat
3. Ask Cursor to implement it screen by screen

**If this is the FIRST flow (01-auth):**
→ Run the Project Setup commands in Section 5A FIRST
→ This bootstraps Next.js/Expo and installs dependencies

**If this is NOT the first flow:**
→ Just implement the screens - project is already set up

---

Reply:
- `approve prd` - PRD is complete, generate next flow PRD
- `revise prd: [feedback]` - Make changes to this PRD
- `done` - Stop here (I'll implement these PRDs before continuing)
```
---

### C.4 PRD Approval & Tracker Update

After PRD approval:

1. **Update WIREFRAME-TRACKER.md:**
   - Change status from `⬜ Not Started` to `✅ PRD Complete`
   - Add PRD location
   - Add completion date

2. **Calculate Remaining Gap:**
   ```
   Step-4 Total Screens - Completed PRDs = Remaining Gap
   [X] - [Y] = [Z]
   ```

---
**>>> CHECKPOINT: FLOW COMPLETION APPROVAL <<<**

Present flow completion status and tracker update to the user.
**Do NOT continue to next flow until the user explicitly approves.**

Reply `approve flow`, `revise flow: [feedback]`, or `done`.

**Prompt:**
```
## Flow [Name] PRD Complete! ✅

**PRDs Generated:** [N] screens

---

## 📊 WIREFRAME TRACKER UPDATE

| Metric | Value |
|--------|-------|
| Step-4 Total Screens | [X] |
| PRDs Completed (this flow) | [N] |
| **Cumulative Completed** | [Y] |
| **Remaining Gap** | [Z] ← Must reach 0 |

**Progress: [Y]/[X] screens ([%]%)**

---

This flow PRD is complete.

Reply:
- `approve flow` - Flow PRD is complete, proceed to next flow
- `revise flow: [feedback]` - Make changes
- `done` - Stop here (don't generate more flow PRDs yet)
```
---

---

## PHASE D — Documentation & Handoff

After all prioritized flows have PRDs generated:

### D.1 Generate PRD Summary

Create `/docs/wireframes/PRD-SUMMARY.md`:

```markdown
# Wireframe PRD Summary

**Generated:** [DATE]
**Platform:** [Web / Mobile]
**Total PRDs:** [N] flows, [X] screens
**Status:** Ready for Implementation

---

## HOW TO IMPLEMENT THESE PRDs

**Step 5 generated these PRDs. YOU implement them in Cursor.**

### Getting Started

1. Open Cursor in an **empty project folder**
2. Start with `01-auth/FLOW-AUTH.md` (it has project setup)
3. Drag the PRD file into Cursor chat
4. Ask: "Implement this PRD screen by screen"

### Implementation Order

| Order | PRD Folder | Screens | Notes |
|-------|-----------|---------|-------|
| 1 | `01-auth/` | [N] | **START HERE** - includes project bootstrap |
| 2 | `02-onboarding/` | [N] | After auth is working |
| 3 | `03-dashboard/` | [N] | Main app screens |
| [etc.] | | | |

### What You're Building

- **Interactive UI prototype** (frontend only)
- Clickable, navigable screens
- Visual states (loading, error, success)
- Form validation with visual feedback
- **Mock data only** - no real backend yet

### What's NOT Included (That's Step 11)

- Real API calls / backend
- Database integration
- Authentication logic
- Business logic

---

## FLOWS SPECIFIED

| Flow | Status | Screens | PRD Location |
|------|--------|---------|--------------|
| Auth | ✅ PRD Complete | [N] | `/docs/prds/flows/01-auth/` |
| Onboarding | ✅ PRD Complete | [N] | `/docs/prds/flows/02-onboarding/` |
| Dashboard | ✅ PRD Complete | [N] | `/docs/prds/flows/03-dashboard/` |
| [etc.] | | | |

---

## TECH STACK SPECIFIED

### Modern Stack Libraries

| Library | Purpose | Install |
|---------|---------|---------|
| zod | Form validation schemas | `npm i zod` |
| react-hook-form | Form state management | `npm i react-hook-form @hookform/resolvers` |
| @tanstack/react-query | Data fetching (mock for now) | `npm i @tanstack/react-query` |
| zustand | Global UI state | `npm i zustand` |
| date-fns | Date formatting | `npm i date-fns` |
| nuqs | URL state (filters, search) | `npm i nuqs` |
| recharts | Charts/graphs | `npm i recharts` |

### Component Libraries

| Library | Components Used |
|---------|-----------------|
| shadcn/ui | [List from PRDs] |
| KokonutUI | [List from PRDs] |
| Motion Primitives | [List from PRDs] |
| Lucide React | Icons throughout |

---

## AFTER IMPLEMENTATION

Once you've built the UI prototype from these PRDs:

1. **Iterate** - Tweak the UI until you're happy with it
2. **Step 6** - Formalize design tokens into a design system
3. **Steps 7-10** - Continue through the workflow
4. **Step 11** - Generate feature PRDs that add backend/functionality to your UI code

**Your prototype code becomes the foundation for Step 11.**
```

### D.2 Final Quality Gates

**Quality Checklist:**
- [ ] All P0 flows have detailed PRDs generated
- [ ] Each flow has a complete PRD in `/docs/prds/flows/`
- [ ] All PRDs include ASCII wireframes with exact component specs
- [ ] Modern stack libraries (zod, tRPC, react-query, etc.) are documented
- [ ] shadcn MCP + Exa research findings are included
- [ ] Component installation commands are specified
- [ ] Design tokens are documented
- [ ] PRD-SUMMARY.md is comprehensive
- [ ] Zero Omission Certificate shows 100% coverage

---

## PHASE E — ZERO OMISSION VERIFICATION & Final Review Gate

### E.1 Zero Omission Verification (BLOCKING GATE)

**Before final approval, verify 100% screen coverage:**

```markdown
## Zero Omission Verification

### Screen Count Reconciliation

| Metric | Value | Status |
|--------|-------|--------|
| Step-4 Total Screens | [X] | — |
| Step-5 Wireframes Completed | [Y] | — |
| **Gap** | [X - Y] | ✅ / ❌ |

**⚠️ BLOCKING: If Gap > 0, cannot approve Step 5**

### Uncovered Screens (If Gap > 0)

| Screen ID | Flow | Reason Missing | Action Required |
|-----------|------|----------------|-----------------|
| [none] | — | — | — |

### Mathematical Proof

Step-4 Screens = Step-5 Wireframes
[X] = [Y] ✅

**Coverage: 100%**
```

### E.2 Generate Zero Omission Certificate

**Create `/docs/flows/ZERO-OMISSION-CERTIFICATE.md`:**

```markdown
# Zero Omission Certificate — Step 5 Wireframes

**Generated:** [DATE]
**Certified By:** [User approval]

---

## Verification Summary

| Source | Document | Screen Count |
|--------|----------|--------------|
| **Step 4** | /docs/flows/SCREEN-INVENTORY.md | [X] |
| **Step 5** | /docs/prds/flows/WIREFRAME-TRACKER.md | [Y] |
| **Match** | [X] = [Y] | ✅ |

---

## Complete Screen Coverage

| # | Screen ID | Step-4 Flow | Step-5 PRD | Status |
|---|-----------|-------------|------------|--------|
| 1 | [screen-1] | [flow] | FLOW-[X].md | ✅ |
| 2 | [screen-2] | [flow] | FLOW-[X].md | ✅ |
| ... | ... | ... | ... | ✅ |
| [X] | [last-screen] | [flow] | FLOW-[X].md | ✅ |

---

## Certification Statement

I certify that:
- [ ] Every screen from Step 4's SCREEN-INVENTORY has a wireframe PRD
- [ ] The screen count matches exactly: Step-4 = Step-5
- [ ] No screens were skipped, deferred, or marked as TBD
- [ ] The WIREFRAME-TRACKER shows 100% completion

**Certification Status:** APPROVED / PENDING

---
```

### E.3 Final Review Gate

---
**>>> CHECKPOINT: STEP 5 COMPLETE <<<**

Present final deliverables and zero omission certificate to the user.
**Do NOT proceed to Step 6 without explicit approval.**

Reply `approve step-5` or `revise: [feedback]`.

**Prompt:**
```
## Step 5 Complete! 🎉

**STEP 5 DELIVERABLES (PRDs Only):**
- ✅ [N] Flow PRDs generated with detailed wireframes
- ✅ [N] Screens specified with component breakdowns
- ✅ Modern stack libraries documented (zod, react-hook-form, etc.)
- ✅ Project setup instructions in first PRD
- ✅ PRD-SUMMARY.md with implementation guide

**USER BUILDS (After Step 5):**
- User implements PRDs in Cursor → Interactive UI prototype
- User iterates until satisfied with UI/UX
- Prototype becomes foundation for Step 11

---

## 🛡️ ZERO OMISSION CERTIFICATE

**VERIFICATION:**
| Metric | Value |
|--------|-------|
| Step-4 Total Screens | [X] |
| Step-5 Wireframes | [Y] |
| **Gap** | 0 ✅ |
| **Coverage** | 100% |

✅ Every screen from Step 4 has a wireframe PRD
✅ No screens were skipped or deferred
✅ Certificate generated: /docs/flows/ZERO-OMISSION-CERTIFICATE.md

---

**What You'll Have After Implementation:**
Once you implement these PRDs in Cursor, your prototype at [/src or /app] will contain:
- Interactive UI components ready for extension
- Design tokens applied consistently
- Animations implemented with proper libraries
- Form validation with visual feedback (no backend)
- Navigation between all screens

**Next Steps After Building Prototype:**
---
- Step 6: Formalize design system from prototype tokens
- Step 8: Add technical specifications
- Step 11: Generate feature PRDs that add backend/functionality to your UI code

Reply `approve step 5` to finalize PRD generation.

⚠️ The Zero Omission Certificate GUARANTEES that all screens from Step 4 have PRDs.
Step 11 will build features on top of your prototype code.
```

---

## "ALIVE APP" QUALITY REFERENCE

### Premium Animation Quality Signals

**When premium feel is appropriate for the app, consider these quality signals:**

These represent a **preferred animation direction** — apply where they enhance the user experience, not as a mandatory checklist for every project.

- [ ] **Entry animations** — Content reveals intentionally (fade-up, stagger) vs. instant appearance
- [ ] **Interaction feedback** — Buttons respond with spring physics vs. just color change
- [ ] **Loading states** — Skeleton screens with shimmer vs. generic spinners
- [ ] **Success celebrations** — Achievements feel earned when appropriate
- [ ] **Navigation continuity** — Screens flow into each other vs. hard cuts
- [ ] **Data visualizations** — Numbers count up, charts draw in where impactful
- [ ] **Micro-interactions** — Toggles flip, checkboxes bounce where it adds delight
- [ ] **Hover states (web)** — Cards lift/glow where interaction is primary
- [ ] **Focus states** — Clear, intentional focus indicators on inputs

> **Design Philosophy:** Not every app needs every animation. A minimal productivity tool might deliberately avoid celebration animations. A gamified wellness app might lean heavily into them. **Match animation level to app personality and user context.**

### Animation Timing Guidelines

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions (buttons, toggles) | 150-250ms | `spring` or `ease-out` |
| Screen transitions | 300-400ms | `ease-in-out` |
| Content reveals | 400-600ms | `spring` stiffness 100-200 |
| Progress animations | 800-1500ms | `ease-out` |
| Stagger delay between items | 50-100ms | — |

### Spring Physics Presets

```typescript
// Snappy (buttons, toggles)
{ type: "spring", stiffness: 500, damping: 30 }

// Smooth (cards, panels)
{ type: "spring", stiffness: 300, damping: 25 }

// Bouncy (success, celebrations)
{ type: "spring", stiffness: 400, damping: 17 }

// Gentle (fades, subtle reveals)
{ type: "spring", stiffness: 100, damping: 15 }
```

---

## EMOTIONAL DESIGN FRAMEWORK (Apply to ALL Screens)

### The Anti-Slop Manifesto

Every screen must pass these checks:
- [ ] Does NOT look like a generic template
- [ ] Has clear personality and character
- [ ] Includes subtle details that show care
- [ ] Animations feel intentional, not gratuitous
- [ ] Typography has clear hierarchy and rhythm
- [ ] Colors are sophisticated, not garish
- [ ] Whitespace is generous and purposeful

### Emotion Targets by Screen Type

| Screen Type | Target Emotion | Design Strategy |
|-------------|----------------|-----------------|
| Landing | Intrigue → Trust → Desire | Bold hero, proof elements, magnetic CTA |
| Login/Signup | Confidence → Ease | Minimal fields, trust signals, "this is easy" |
| Onboarding | Excitement → Achievement | Progress celebration, quick wins |
| Dashboard | Empowerment → Control | Clear data, actionable insights |
| Settings | Calm → Confidence | Clean organization, clear labels |
| Checkout | Trust → Anticipation | Security signals, progress indicator |
| Success | Accomplishment → Pride | Celebration animation, "you did it!" |
| Error | Frustration → Calm → Guidance | Empathetic tone, clear fix |

### Premium Visual Signals (Mandatory)

| Element | Avoid (AI Slop) | Target (Premium) |
|---------|-----------------|------------------|
| Typography | One font, default weights | Paired fonts, deliberate hierarchy |
| Colors | Pure RGB, harsh contrast | Nuanced palette, sophisticated tones |
| Spacing | Cramped, inconsistent | Generous, mathematical rhythm |
| Shadows | Black drop shadows | Subtle, layered, color-tinted |
| Borders | 1px solid gray everywhere | Thoughtful, often none |
| Icons | Mixed styles, random sizes | Consistent set, balanced weight |
| Motion | None or jarring | Subtle, purposeful, physics-based |

---

## DESIGN TONE-TO-COMPONENT MAPPING

### Expanded Tone Framework

Match your app's DNA archetype to specific component choices and animation styles:

| Tone/DNA | Animation Style | Color Approach | Key Components | Libraries |
|----------|-----------------|----------------|----------------|-----------|
| **Professional/Craft** | Subtle, physics-based, 200-300ms | Monochromatic + single accent | Clean inputs, precise buttons | Motion Primitives, shadcn |
| **Gamified/Engaging** | Celebratory, bouncy, confetti | Bright, high-contrast, energetic | Progress bars, achievement badges | KokonutUI, Lottie |
| **Wellbeing/Calming** | Slow, organic, breathing | Pastels, earth tones, low saturation | Soft cards, rounded elements | Motion Primitives (slow) |
| **Health/Fitness** | Smooth tracking, progress reveals | High energy, bold contrast | Photo capture, progress rings, stat cards | Motion Primitives, react-native-reanimated |
| **Fintech/Trust** | Confidence-building, spatial | Bold brand + greens for success | Balance cards, transaction lists, security badges | Motion Primitives, custom |
| **Crypto/Trading** | Real-time updates, ticker animations | Green/red indicators, dark modes | Price charts, order forms, portfolio cards | Motion Primitives, TradingView widgets |
| **Recovery/Transformation** | Progress trees, milestone celebrations | Growth greens, calming blues | Life trees, streak counters, journal entries | KokonutUI, Lottie, custom |
| **Open/Developer** | Functional, minimal | Clean, accessible, customizable | Code blocks, API explorers, config panels | shadcn, Monaco editor |

### Splash Screen Animation by Tone (MANDATORY REFERENCE)

**Each app tone requires a different splash screen feel. Use this guide when speccing splash animations:**

| Tone | Background Style | Logo Animation | Transition Out | Lottie Search Terms |
|------|------------------|----------------|----------------|---------------------|
| **Professional/Craft** | Subtle gradient shift, clean | Precise fade+scale (no bounce) | Clean fade | "minimal logo", "professional intro" |
| **Gamified/Engaging** | Particles, confetti, energetic | Bouncy entrance, playful | Zoom through logo | "game intro", "playful splash", "fun loading" |
| **Wellbeing/Calming** | Slow gradient, organic waves | Gentle fade, breathing pulse | Slow dissolve | "calm intro", "meditation", "breathing" |
| **Health/Fitness** | Dynamic, energetic gradient | Strong scale-up, confident | Quick slide up | "fitness intro", "energy", "workout" |
| **Fintech/Trust** | Solid brand color, subtle glow | Confident fade+scale, no bounce | Professional slide | "fintech", "bank intro", "secure" |
| **Crypto/Trading** | Dark with accent glows | Sharp fade-in, tech feel | Data-style transition | "crypto", "trading", "tech intro" |
| **Recovery/Transformation** | Nature gradients, growth | Organic grow-in, hopeful | Gentle expansion | "growth", "nature", "hope", "sunrise" |
| **Open/Developer** | Minimal, perhaps terminal-style | Quick functional fade | No-frills transition | "developer", "code", "terminal" |

### Tone-Specific Animation Guidelines

#### Health/Fitness Animations (Cal AI, Ladder Style)
- **Splash Screen:** Energetic gradient background, logo scales up with confidence, quick transition
- **Photo Capture:** Smooth camera transitions, instant feedback
- **Progress Tracking:** Satisfying ring fills, stat reveals
- **Achievement:** Celebratory but not over-the-top, motivational
- **Data Entry:** Minimal friction, auto-suggestions
- **Recommended:** `animated-number`, `scroll-progress`, `in-view`
- **Lottie Ideas:** Search "fitness", "workout", "energy pulse"

#### Fintech/Trust Animations (Cash App, Chime Style)
- **Splash Screen:** Brand color with subtle glow, confident logo fade+scale, professional slide out
- **Balance Updates:** Smooth number transitions, never jarring
- **Transactions:** Slide-in confirmations, clear success states
- **Security:** Reassuring animations during verification
- **Payments:** Clear progress indicators, celebration on completion
- **Recommended:** `sliding-number`, `transition-panel`, `glow-effect`
- **Lottie Ideas:** Search "secure", "shield", "checkmark success"

#### Crypto/Trading Animations (Robinhood, Coinbase Style)
- **Splash Screen:** Dark background with accent glows, sharp logo fade, data-style transition
- **Price Updates:** Real-time without visual noise
- **Charts:** Smooth line drawing, zoom transitions
- **Trade Execution:** Quick confirmation, clear feedback
- **Portfolio Changes:** Green/red with subtle pulsing
- **Recommended:** `animated-number`, `in-view`, custom ticker
- **Lottie Ideas:** Search "crypto", "blockchain", "chart loading"

#### Recovery/Transformation Animations (QUITTR Style)
- **Splash Screen:** Nature gradient (sunrise/growth), organic logo grow-in, hopeful expansion transition
- **Progress Trees:** Growing, organic animations
- **Milestones:** Meaningful celebrations, earned achievements
- **Streak Counters:** Incremental, satisfying updates
- **Journal:** Calm, encouraging entry animations
- **Recommended:** `text-effect`, `animated-group`, Lottie for trees
- **Lottie Ideas:** Search "growth", "tree growing", "sunrise", "hope"

#### Wellbeing/Calming Animations (Meditation Apps Style)
- **Splash Screen:** Slow breathing gradient, gentle logo fade with subtle pulse, slow dissolve transition
- **Breathing Exercises:** Smooth, timed expansions
- **Session Transitions:** Peaceful fades, no jarring movements
- **Achievements:** Gentle celebrations, not overwhelming
- **Recommended:** Moti with slow spring configs, Lottie for organic motion
- **Lottie Ideas:** Search "meditation", "breathing", "calm", "zen"

#### Gamified/Engaging Animations (Game Apps Style)
- **Splash Screen:** Particle effects or confetti, bouncy playful logo entrance, zoom-through transition
- **Level Ups:** Explosive celebrations, confetti, haptic feedback
- **Progress:** Animated progress bars, satisfying fills
- **Achievements:** Badge animations, unlock effects
- **Recommended:** KokonutUI, react-native-confetti-cannon, Lottie
- **Lottie Ideas:** Search "game intro", "level up", "celebration", "trophy"

---

## CATEGORY-SPECIFIC DESIGN INSPIRATION

### Health/Fitness Apps (Cal AI, Ladder Style)

**Research Queries for Exa:**
```
- "Cal AI app design mobile food tracking UX"
- "fitness app onboarding gamification mobile"
- "macro tracking app UI components React Native"
- "health app photo recognition interface patterns"
```

**Key Design Patterns to Implement:**
| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **Photo-First Interaction** | Camera as primary input method | Full-screen camera, instant recognition overlay |
| **Progress Visualization** | Daily/weekly/monthly progress rings | Animated SVG rings, stat cards |
| **Coaching UX** | Personalized guidance, tips | Bottom sheet coaches, contextual help |
| **Streak Tracking** | Gamified consistency motivation | Streak counters, calendar heat maps |
| **Quick Logging** | Minimal friction data entry | Swipe actions, voice input, presets |

**Recommended Components:**
- KokonutUI: `animated-number`, `progress-ring` (custom)
- Motion Primitives: `scroll-progress`, `animated-group`
- 21st.dev: Camera overlays, food recognition cards

**Animation Philosophy (Zach Yadegari, Cal AI):**
> "Every animation should reduce friction or celebrate progress. No decorative motion."

---

### Fintech/Banking Apps (Cash App, Chime Style)

**Research Queries for Exa:**
```
- "Cash App design system spatial illustrations"
- "neobanking app UX patterns mobile"
- "fintech trust signals UI components"
- "mobile banking onboarding KYC flow"
```

**Key Design Patterns to Implement:**
| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **Balance Prominence** | Primary info always visible | Large balance card, swipe for details |
| **Transaction Clarity** | Clear money movement | Status badges, merchant logos, categories |
| **Security Signals** | Trust without friction | Biometric prompts, encryption badges |
| **Quick Actions** | One-tap common tasks | FAB for pay/request, swipe actions |
| **Card Visualization** | Physical card representation | 3D card flip, freeze toggle |

**Recommended Components:**
- Motion Primitives: `sliding-number`, `transition-panel`, `glow-effect`
- KokonutUI: `card-flip-stack`, `profile-dropdown`
- Custom: Balance cards, transaction cells, security badges

**Animation Philosophy (Cameron Worboys & Lauren LoPrete, Cash App):**
> "Materiality, composition, and lighting. Every element has physical presence."

---

### Trading/Crypto Apps (Robinhood, Coinbase Style)

**Research Queries for Exa:**
```
- "Robinhood design system Snack mobile trading"
- "crypto app portfolio UI React Native"
- "trading app real-time data visualization"
- "Coinbase Clarity design system accessibility"
```

**Key Design Patterns to Implement:**
| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **One-Handed Trading** | Thumb-zone optimized | Bottom-heavy UI, swipe to trade |
| **Real-Time Updates** | Live data without overwhelm | Smooth number transitions, subtle indicators |
| **Price Charts** | Clear, actionable visualization | TradingView integration, custom sparklines |
| **Order Simplicity** | Reduce trade complexity | Pre-set amounts, market/limit toggle |
| **Education Integration** | Learn while you earn | Inline tips, reward-based tutorials |

**Recommended Components:**
- Motion Primitives: `animated-number`, `in-view`, `scroll-progress`
- Custom: Price charts (TradingView/Recharts), order forms
- KokonutUI: `hold-button` (for trade confirmation)

**Animation Philosophy (Vlad Tenev, Robinhood):**
> "One screen, one button, one core action. Radical simplicity democratizes access."

---

### Recovery/Transformation Apps (QUITTR Style)

**Research Queries for Exa:**
```
- "QUITTR app onboarding deep personalization"
- "habit breaking app gamification UX"
- "sobriety tracker app design patterns"
- "behavior change app progress visualization"
```

**Key Design Patterns to Implement:**
| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **Deep Personalization** | 34+ step onboarding | Multi-screen quiz, progress bar, skip-able |
| **Quantified Problem** | Show the impact | "You've spent X hours on [problem]" |
| **Life Tree/Progress** | Gamified growth visual | Growing tree animation, milestone rewards |
| **Streak Protection** | Prevent relapse | Emergency buttons, support contacts |
| **Journal/Reflection** | Track triggers and wins | Calendar view, mood tracking |

**Recommended Components:**
- Lottie: Life tree animations, milestone celebrations
- Motion Primitives: `text-effect`, `animated-group`
- KokonutUI: `dynamic-text`, `typing-text` (for personalized messages)
- Custom: Streak counters, trigger logging, community features

**Animation Philosophy (Alex Slater, QUITTR):**
> "Deep personalization for high-intent conversion. More questions = more commitment."

---

## FINTECH-SPECIFIC QUALITY GATE

### Mandatory Quality Checks for Finance Flows

**Before approving any fintech/trading/banking flow, verify:**

| Category | Check | Requirement |
|----------|-------|-------------|
| **Trust** | Security signals present | ✅ Lock icons, encryption badges, biometric prompts |
| **Trust** | Error handling graceful | ✅ Never show raw errors, always provide next steps |
| **Trust** | Loading states informative | ✅ "Verifying identity..." not just spinners |
| **Clarity** | Money amounts unmistakable | ✅ Large, clear numbers, currency symbols |
| **Clarity** | Transaction status obvious | ✅ Pending/complete/failed states distinct |
| **Clarity** | Fee disclosure transparent | ✅ All fees shown before confirmation |
| **Speed** | Critical paths optimized | ✅ < 3 taps to send money, < 5 for trades |
| **Speed** | Real-time feel | ✅ Optimistic updates, background syncing |
| **Security** | Confirmation gates | ✅ Biometric/PIN for transactions over threshold |
| **Security** | Session management | ✅ Auto-logout, activity indicators |
| **Accessibility** | Large touch targets | ✅ Min 44x44pt for all interactive elements |
| **Accessibility** | Screen reader support | ✅ Amounts and statuses announced properly |

### Fintech Component Checklist

For each screen in a finance flow, verify:
- [ ] Balance/amounts use `sliding-number` or `animated-number` for transitions
- [ ] Transaction lists have clear status indicators (colored dots, badges)
- [ ] Confirmation screens have prominent "Review" sections
- [ ] Success states include transaction IDs and "View receipt" options
- [ ] Error states provide specific guidance, not generic messages
- [ ] Loading states show estimated wait times when possible
- [ ] All destructive actions (cancel, close account) require explicit confirmation

### Trading-Specific Additions

For trading/crypto flows, also verify:
- [ ] Price data clearly timestamped
- [ ] Buy/sell colors consistent (green = buy, red = sell industry standard)
- [ ] Order review shows estimated total including fees
- [ ] Real-time data has visible "last updated" indicator
- [ ] Charts have clear time range selectors

---

## FALLBACK MICRO-ROLES

If specific expertise needed:
- **Conversion Optimization:** Value Equation, LIFT Model, friction analysis
- **Visual Design:** Color theory, typography, whitespace, visual hierarchy
- **Animation Design:** Timing functions, entrance/exit, micro-interactions
- **Component Architecture:** Atomic design, composition, variants
- **Responsive Design:** Mobile-first, breakpoints, touch targets
- **Accessibility:** WCAG AA, keyboard nav, screen readers

### Expert Pattern References

**Mobile Interaction Patterns (Steven Hoober & Eric Berkman):**
Validate mobile screens against 76 established interaction patterns from "Designing Mobile Interfaces":
- **Navigation patterns:** Tab bars, drawers, gestures
- **Input patterns:** Forms, pickers, steppers
- **Display patterns:** Lists, grids, cards
- **Feedback patterns:** Loading, success, error

**Interface Patterns (Jenifer Tidwell):**
Map screens to established UI patterns from "Designing Interfaces":
- **Organizing content:** Hub and spoke, pyramid, wizard
- **Navigation:** Global nav, fat menus, breadcrumbs
- **Forms:** Forgiving format, input hints, structured format
- **Actions:** Action panel, prominent done button, smart menu items

**Use these references to validate that your screens follow established, user-tested patterns.**

---

## VERIFICATION SCHEMA

### Required Files (23 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Flow PRD Directory | /docs/prds/flows/ | exists | 5 |
| At least 1 Flow PRD | /docs/prds/flows/*/FLOW-*.md | 5KB | 5 |
| Wireframe Tracker | /docs/prds/flows/WIREFRAME-TRACKER.md | 1KB | 4 |
| PRD Summary | /docs/wireframes/PRD-SUMMARY.md | 1KB | 4 |
| shadcn MCP Config | .cursor/mcp.json | 100B | 2 |
| UI Profile (Human) | /docs/design/UI-PROFILE.md | 500B | 2 |
| UI Profile (Machine) | /docs/design/ui-profile.json | 200B | 1 |

### Required Sections (34 points)

| Document | Section | Points |
|----------|---------|--------|
| 01-*/FLOW-*.md | ## 5A. PROJECT SETUP (first PRD only) | 6 |
| FLOW-*.md | ## 1A. UI PROFILE COMPLIANCE | 4 |
| FLOW-*.md | ## Modern Stack Integration | 6 |
| FLOW-*.md | ## Detailed Component Specifications | 8 |
| FLOW-*.md | ## Component Research (shadcn + Exa) | 5 |
| FLOW-*.md | ASCII Wireframes | 5 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| has_pattern:FLOW-*.md:zod\|react-hook-form\|tRPC | Modern stack libraries specified | 8 |
| has_pattern:FLOW-*.md:shadcn MCP\|get_code_context_exa | Research tools documented | 6 |
| has_pattern:FLOW-*.md:```typescript | Code examples included | 6 |
| has_pattern:FLOW-*.md:npx shadcn@latest add | Installation commands | 5 |
| has_code_block:FLOW-*.md:ascii_wireframe | ASCII wireframes present | 5 |
| has_pattern:FLOW-*.md:UI PROFILE COMPLIANCE\|uiProfile | UI profile compliance included | 3 |

### Success Criteria (20 points)

| Criterion | Check | Points |
|-----------|-------|--------|
| No Code Execution | No package.json changes, no node_modules | 8 |
| Comprehensive Specs | All screens have detailed wireframes + component specs | 6 |
| Ready for Implementation | PRDs can be used directly in Cursor to build | 6 |

---

## Optional: Ralph Loop (Autonomous Implementation)

To convert PRDs into a machine-executable backlog and run autonomous implementation:
1. Run `/prd-json` to convert PRDs → `docs/ralph/prototype/prd.json`
2. Run `./ralph/sigma-ralph.sh --workspace=. --mode=prototype`

See `ralph/README.md` for setup and usage.
