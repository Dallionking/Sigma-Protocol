# Sigma TanStack SaaS - Features

> Modern full-stack SaaS with TanStack Start SSR and type-safe routing.

## Included Modules

| Module | Status | Description |
|--------|--------|-------------|
| Marketing | ✅ Included | Landing, pricing pages |
| Auth | ✅ Included | Supabase auth (planned) |
| Dashboard | ✅ Included | App shell with sidebar |
| Settings | ✅ Included | User settings |
| Billing | ✅ Included | Subscription management |
| Admin | ✅ Included | Admin dashboard |
| Error States | ✅ Included | Error boundaries |

## Optional Modules

| Module | Status | Description | How to Enable |
|--------|--------|-------------|---------------|
| AI Chat | 🔲 Disabled | AI chat with streaming | Add chat route to `(app)` |
| CRUD Example | 🔲 Disabled | Example data patterns | Add items routes |

## Feature Backlog

> Edit this list to track what you want to add or remove.

### To Add
- [ ] Server functions (tRPC-style)
- [ ] Real-time subscriptions
- [ ] File uploads
- [ ] Multi-tenant support
- [ ] Localization (i18n)
- [ ] API documentation

### To Remove
- [ ] Admin panel (if not needed)

### To Customize
- [ ] Replace Supabase with another auth
- [ ] Add database with Drizzle
- [ ] Customize routing patterns

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | TanStack Start (Vite + SSR) |
| Router | TanStack Router |
| Data | TanStack Query (React Query) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Styling | Tailwind CSS |
| AI | Vercel AI SDK |

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=

# AI
OPENAI_API_KEY=
```

## Quick Start

```bash
npm install
npm run setup   # Interactive setup
npm run dev     # Start dev server (SSR)
npm run build   # Build for production
npm run start   # Start production server
```

## Route Structure

```
src/routes/
├── __root.tsx           # Root layout with providers
├── index.tsx            # Landing page
├── pricing.tsx          # Pricing page
└── (app)/               # Authenticated app routes
    ├── route.tsx        # App layout with sidebar
    ├── index.tsx        # Dashboard
    ├── settings.tsx     # Settings
    ├── billing.tsx      # Billing
    └── admin.tsx        # Admin panel
```

## Type-Safe Routing

TanStack Router provides full TypeScript support:

```typescript
import { Link } from '@tanstack/react-router';

// Autocomplete for routes and type-safe params
<Link to="/app/settings">Settings</Link>
```

---

*Last updated: 2025-12-20*

