# SSS Boilerplate System

Pre-built, production-ready templates that bundle both **app code** AND **SSS commands** for an instant start on new projects.

## Available Templates

| Template | Stack | Status | Use Case |
|----------|-------|--------|----------|
| [`nextjs-saas`](./nextjs-saas/) | Next.js + Supabase + Stripe + AI SDK | ✅ Ready | Full SaaS with auth, payments, credits |
| [`expo-mobile`](./expo-mobile/) | Expo + Supabase + RevenueCat | ✅ Ready | Mobile apps with IAP |
| [`nextjs-ai`](./nextjs-ai/) | Next.js + Convex | ✅ Ready | AI-first real-time apps |
| [`nextjs-portable`](./nextjs-portable/) | Next.js + Drizzle + Any Postgres | ✅ Ready | Self-hostable SaaS |
| [`tanstack-saas`](./tanstack-saas/) | TanStack Start + Supabase | ✅ Ready | Modern full-stack |

## Quick Start

```bash
# Clone the boilerplate (replace with desired template)
git clone https://github.com/your-org/sss-nextjs-starter.git my-app
cd my-app

# Run setup wizard (renames project, configures env)
npm run setup

# Install dependencies
npm install

# Start developing
npm run dev
```

## Template Overview

### 🚀 nextjs-saas (Flagship)

The full-featured SaaS starter with everything you need:

- **Auth**: Supabase Auth (email, OAuth)
- **Database**: Supabase Postgres
- **Payments**: Stripe (subscriptions, one-time)
- **Credits**: Usage-based billing system
- **AI**: Vercel AI SDK integration
- **Analytics**: PostHog
- **Email**: Resend transactional emails
- **Theming**: Light/dark mode toggle

### 📱 expo-mobile

Production mobile app starter for iOS and Android:

- **Auth**: Supabase Auth (secure storage)
- **Payments**: RevenueCat (IAP, subscriptions)
- **Push**: Expo Notifications
- **Analytics**: PostHog React Native
- **Styling**: NativeWind (Tailwind CSS)

### 🤖 nextjs-ai

AI-first applications with real-time backend:

- **Backend**: Convex (real-time, serverless)
- **Auth**: Convex Auth
- **AI**: Vercel AI SDK + streaming
- **Real-time**: Automatic subscriptions
- **Storage**: Convex file storage

### 🔧 nextjs-portable

Self-hostable SaaS that works anywhere:

- **ORM**: Drizzle (type-safe SQL)
- **Database**: Any PostgreSQL
- **Auth**: Better Auth
- **Payments**: Stripe
- **Deploy**: Vercel, Docker, VPS, anywhere

### ⚡ tanstack-saas

Modern full-stack with type-safe routing:

- **Framework**: TanStack Start (Vite-powered)
- **Routing**: TanStack Router (100% typed)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind + shadcn/ui

## Module System (NEW)

Each boilerplate now ships with a **modular architecture** that lets you include or exclude features based on your project's needs.

### How It Works

1. **Step 4** generates `product/flows/flow-tree.json` defining which modules your app needs
2. **`@new-project`** reads the flow-tree and scaffolds only needed modules
3. **Step 5** reconciles modules when flows evolve

### Available Modules

| Module | Platform | Required | Description |
|--------|----------|----------|-------------|
| `marketing` | web | No | Landing, pricing, blog shells |
| `auth` | both | Yes | Authentication flows |
| `dashboard` | both | Yes | Core app shell |
| `settings` | both | Yes | User settings |
| `billing` | web | No | Stripe subscriptions |
| `admin` | web | No | Admin panel |
| `aiChat` | both | No | AI chat interface |
| `crudExample` | both | No | Example CRUD patterns |
| `mobileOnboarding` | mobile | No | Welcome & permissions |
| `purchases` | mobile | No | RevenueCat IAP |

### Usage

```bash
# Use all defaults
@new-project --template=nextjs-saas

# With flow-tree from Step 4
@new-project --template=nextjs-saas --flow-tree=product/flows/flow-tree.json

# Explicit module selection
@new-project --template=nextjs-saas --modules=auth,dashboard,billing
```

### Module Files

Each template has `.sss/modules.manifest.json` defining:
- Files belonging to each module
- Navigation items to add/remove
- Required environment variables
- Module dependencies

See each template's `FEATURES.md` for module details.

---

## What's Included

Each boilerplate ships with:

### App Shells (NEW)
- ✅ Marketing pages (landing, pricing, blog shells)
- ✅ Auth screens (login, signup, forgot password)
- ✅ Dashboard with sidebar navigation
- ✅ Settings (profile, notifications, appearance, security)
- ✅ Billing management (plans, invoices, payment methods)
- ✅ Admin panel (user management, system settings)

### App Code
- ✅ Authentication (multiple providers)
- ✅ Payments (Stripe/RevenueCat)
- ✅ AI integration (Vercel AI SDK)
- ✅ Credits/usage tracking
- ✅ Analytics (PostHog)
- ✅ Email (Resend)
- ✅ Theme toggle (light/dark)
- ✅ Accessibility baseline

### SSS Commands (Bundled)
```
.cursor/commands/
├── audit/          # Quality & security audits
├── deploy/         # Deployment workflows
├── dev/            # Development helpers
├── generators/     # Code generation
├── marketing/      # Marketing workflows
├── ops/            # Operations & maintenance
├── steps/          # SSS methodology steps
└── Magic UI/       # Template resources
```

## Provenance Tracking

Every project created from a boilerplate includes `.sss/boilerplate.json`:

```json
{
  "template": "nextjs-saas",
  "template_version": "1.0.0",
  "origin_repo": "your-org/sss-nextjs-starter",
  "created_at": "2025-12-20",
  "project_name": "my-awesome-app",
  "features": {
    "auth": "supabase",
    "payments": "stripe",
    "ai": "vercel-ai-sdk"
  },
  "commands_version": "2.0.0"
}
```

This file enables SSS steps (5, 6, 8, 10, 11, 12) to adapt their behavior based on what's already built.

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location | How |
|------|----------|-----|
| Brand Colors | `globals.css` | Override CSS variables |
| Font | `layout.tsx` | Change font import |
| Routes | `app/` | Add new routes |
| Components | `components/[project]/` | Create new components |
| API Routes | `app/api/[project]/` | Add new endpoints |
| Database | New tables with FK | Add new tables |

### ⚠️ Modify with Caution

| Area | Location | Risk |
|------|----------|------|
| Auth Flow | `components/auth/` | May break login |
| Payment Webhooks | `app/api/webhooks/` | May break billing |
| Credits Logic | `hooks/use-credits.ts` | May break usage tracking |

### ❌ Don't Modify

| Area | Location | Why |
|------|----------|-----|
| Supabase Client | `lib/supabase/` | Core infrastructure |
| AI Client | `lib/ai/` | Core infrastructure |
| Base UI | `components/ui/` | shadcn managed |
| SSS Commands | `.cursor/commands/` | Methodology source |

## SSS Workflow Integration

| Step | Boilerplate Behavior |
|------|---------------------|
| Step 0 | Checks GitHub CLI for cloning |
| Step 2 | Offers boilerplate selection matrix |
| Step 5 | Scaffolds from chosen template |
| Step 6 | Extends (not replaces) design tokens |
| Step 8 | Documents extensions only |
| Step 10 | Skips pre-built features |
| Step 11 | References stable APIs |
| Step 12 | Generates `boilerplate-patterns.mdc` |

## Custom Build Path

If your project doesn't fit any boilerplate (exotic stack, special requirements), the SSS workflow still works exactly as before. Steps detect the absence of `.sss/boilerplate.json` and operate in "custom build" mode.

## Distribution

Boilerplates are synced from this repo to standalone GitHub repositories:

| Template | Repository |
|----------|------------|
| nextjs-saas | `github.com/your-org/sss-nextjs-starter` |
| expo-mobile | `github.com/your-org/sss-expo-starter` |
| nextjs-ai | `github.com/your-org/sss-nextjs-ai` |
| nextjs-portable | `github.com/your-org/sss-nextjs-portable` |
| tanstack-saas | `github.com/your-org/sss-tanstack-starter` |

See [DISTRIBUTION-GUIDE.md](./DISTRIBUTION-GUIDE.md) for setup instructions.

## Contributing

See [BOILERPLATE-SYSTEM-DESIGN.md](./BOILERPLATE-SYSTEM-DESIGN.md) for architecture decisions and contribution guidelines.

Track progress in [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md).
