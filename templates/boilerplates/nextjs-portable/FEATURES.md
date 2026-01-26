# Sigma Next.js Portable - Features

> Self-hostable SaaS with Drizzle ORM and flexible database support.

## Included Modules

| Module | Status | Description |
|--------|--------|-------------|
| Marketing | ✅ Included | Landing, pricing pages |
| Auth | ✅ Included | Better Auth |
| Dashboard | ✅ Included | App shell with sidebar |
| Settings | ✅ Included | User settings |
| Billing | ✅ Included | Subscription management |
| Admin | ✅ Included | Admin dashboard |
| Error States | ✅ Included | Error boundaries |

## Optional Modules

| Module | Status | Description | How to Enable |
|--------|--------|-------------|---------------|
| AI Chat | 🔲 Disabled | AI chat interface | Set `enabledModules.aiChat = true` |
| CRUD Example | 🔲 Disabled | Example data patterns | Set `enabledModules.crudExample = true` |

## Feature Backlog

> Edit this list to track what you want to add or remove.

### To Add
- [ ] Multi-database support (MySQL, SQLite)
- [ ] Self-hosted deployment scripts
- [ ] Docker Compose setup
- [ ] Database migrations UI
- [ ] Backup/restore tools
- [ ] Environment configuration UI

### To Customize
- [ ] Replace Better Auth with NextAuth
- [ ] Add database seeding
- [ ] Configure connection pooling

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Drizzle ORM + Any Postgres |
| Auth | Better Auth |
| Payments | Stripe |
| Styling | Tailwind CSS + shadcn/ui |

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=

# AI (optional)
OPENAI_API_KEY=
```

## Quick Start

```bash
npm install
npm run db:push    # Push schema to database
npm run db:seed    # Seed initial data
npm run dev        # Start development server
```

## Database Schema

```
db/
├── index.ts          # Drizzle client
└── schema/
    ├── users.ts      # User table
    └── subscriptions.ts  # Subscription tables
```

## Self-Hosting

This template is designed for self-hosting:
- No vendor lock-in for database
- Standard Postgres compatible
- Docker-ready deployment

---

*Last updated: 2025-12-20*

