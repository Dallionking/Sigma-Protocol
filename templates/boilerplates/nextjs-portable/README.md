# Sigma Next.js Portable Starter

> Self-hostable Next.js SaaS with Drizzle ORM - deploy anywhere with any Postgres database.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/sss-nextjs-portable.git my-app
cd my-app

# Run setup wizard
npm run setup

# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development
npm run dev
```

## What's Included

### Core Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Authentication | Better Auth | ✅ Ready |
| Database | Drizzle + Postgres | ✅ Ready |
| Payments | Stripe | ✅ Ready |
| AI Integration | Vercel AI SDK | ✅ Ready |
| Email | Resend | ✅ Ready |
| Analytics | PostHog | ✅ Ready |

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **ORM**: Drizzle (type-safe SQL)
- **Database**: Any PostgreSQL
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Better Auth
- **Payments**: Stripe
- **AI**: Vercel AI SDK

### Why Portable?

This template works with ANY PostgreSQL database:

| Provider | Connection |
|----------|------------|
| Neon | `postgresql://user:pass@ep-xxx.neon.tech/db` |
| Supabase | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| Railway | `postgresql://postgres:pass@xxx.railway.app:5432/railway` |
| PlanetScale | Via Drizzle MySQL adapter |
| Local | `postgresql://localhost:5432/myapp` |
| Docker | `postgresql://postgres:postgres@localhost:5432/myapp` |
| Any VPS | Self-hosted Postgres |

## Project Structure

```
app/                       # Next.js App Router
├── (auth)/               # Auth pages (Better Auth)
├── (dashboard)/          # Protected pages
├── api/
│   ├── auth/[...all]/   # Better Auth API routes
│   └── webhooks/        # Stripe webhooks
├── layout.tsx            # Root layout
└── page.tsx              # Landing page
components/
├── auth/                 # Auth components
├── ui/                   # Base UI components
└── providers/            # Context providers
db/
├── schema/              # Drizzle schema files
│   ├── users.ts
│   ├── subscriptions.ts
│   └── index.ts
├── migrations/          # Auto-generated migrations
└── index.ts             # Drizzle client
hooks/
├── use-auth.ts          # Better Auth hook
└── use-subscription.ts  # Subscription state
lib/
├── auth.ts              # Better Auth configuration
├── stripe.ts            # Stripe configuration
└── utils.ts             # Utilities
```

## Drizzle Patterns

### Schema Definition

```typescript
// db/schema/users.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Type-Safe Queries

```typescript
// Drizzle generates types automatically
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Find user - fully typed!
const user = await db.query.users.findFirst({
  where: eq(users.email, "user@example.com"),
});

// Insert user
await db.insert(users).values({
  email: "user@example.com",
  name: "John Doe",
});
```

### Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:push

# Open Drizzle Studio (GUI)
npm run db:studio
```

## Configuration

### 1. Database Setup

Choose your Postgres provider and get a connection string.

```bash
# .env.local
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 2. Better Auth Setup

Better Auth is pre-configured. Customize in `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 3. Stripe Setup

1. Create Stripe account
2. Get API keys
3. Set up webhook endpoint

```bash
# .env.local
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Self-Hosting

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Railway/Render/Fly.io

1. Connect your GitHub repo
2. Add environment variables
3. Deploy automatically

### VPS (Manual)

```bash
# On your VPS
git clone your-repo
cd your-repo
npm install
npm run build
npm start
```

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location |
|------|----------|
| Database Schema | `db/schema/*.ts` |
| Auth Providers | `lib/auth.ts` |
| Components | `components/[project]/` |
| Routes | `app/` |

### ❌ Don't Modify

| Area | Why |
|------|-----|
| `db/migrations/` | Auto-generated |
| `components/ui/` | shadcn managed |
| Sigma Commands | Methodology source |

## License

MIT - Use freely for personal and commercial projects.

