# SSS Next.js SaaS - Features

> Production-ready SaaS boilerplate with Supabase, Stripe, and AI integration.

## Included Modules

| Module | Status | Description |
|--------|--------|-------------|
| Marketing | ✅ Included | Landing, pricing, blog, docs shells |
| Auth | ✅ Included | Supabase auth with email, OAuth |
| Dashboard | ✅ Included | App shell with sidebar navigation |
| Settings | ✅ Included | User settings (profile, notifications, appearance, security) |
| Billing | ✅ Included | Stripe subscriptions, invoices, payment methods |
| Admin | ✅ Included | Role-gated admin dashboard |
| Error States | ✅ Included | 404, 500, error boundaries |

## Optional Modules

| Module | Status | Description | How to Enable |
|--------|--------|-------------|---------------|
| AI Chat | 🔲 Disabled | AI chat interface with streaming | Set `enabledModules.aiChat = true` in `src/config/navigation.ts` |
| CRUD Example | 🔲 Disabled | Example list/detail/form patterns | Set `enabledModules.crudExample = true` |
| Onboarding | 🔲 Disabled | First-run welcome wizard | Add onboarding routes |
| Notifications | 🔲 Disabled | In-app notification system | Add notifications module |

## Feature Backlog

> Edit this list to track what you want to add or remove.

### To Add
- [ ] Team management (invite members, roles)
- [ ] API key management
- [ ] Usage analytics dashboard
- [ ] Webhook management
- [ ] Email templates editor
- [ ] Feature flags UI
- [ ] Audit log viewer

### To Remove
- [ ] Admin panel (if not needed)
- [ ] Blog (if using external CMS)

### To Customize
- [ ] Replace Supabase with Clerk/Auth.js
- [ ] Add more OAuth providers
- [ ] Customize pricing tiers
- [ ] Add branded email templates

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Auth | Supabase Auth |
| Database | Supabase (Postgres) |
| Payments | Stripe |
| AI | Vercel AI SDK + OpenAI |
| Styling | Tailwind CSS + shadcn/ui |
| Analytics | PostHog |
| Email | Resend |

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Quick Start

```bash
npm install
npm run setup   # Interactive setup wizard
npm run dev     # Start development server
```

## Module Management

Modules are controlled via `.sss/modules.manifest.json`. Each module has:
- `enabled`: Whether the module is included
- `files`: Files/directories belonging to the module
- `navItems`: Navigation entries (sidebar, header)
- `envVars`: Required environment variables

To prune a module during project creation, use:
```bash
@new-project --template=nextjs-saas --modules=auth,dashboard,billing
```

---

*Last updated: 2025-12-20*

