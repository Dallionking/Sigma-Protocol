# SSS TanStack Start Starter

> Modern full-stack SaaS with TanStack Start, type-safe routing, and SSS methodology.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/sss-tanstack-starter.git my-app
cd my-app

# Run setup wizard
npm run setup

# Install dependencies
npm install

# Start development
npm run dev
```

## What's Included

### Core Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Authentication | Supabase Auth | ✅ Ready |
| Database | Supabase Postgres | ✅ Ready |
| Payments | Stripe | ✅ Ready |
| AI Integration | Vercel AI SDK | ✅ Ready |
| Email | Resend | ✅ Ready |
| Analytics | PostHog | ✅ Ready |
| Type-Safe Routing | TanStack Router | ✅ Ready |

### Tech Stack

- **Framework**: TanStack Start (Vite-powered)
- **Routing**: TanStack Router (100% type-safe)
- **Data Fetching**: TanStack Query
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Vercel AI SDK

### Why TanStack Start?

1. **100% Type-Safe Routing** - Route params, search params, all typed
2. **Vite-Native** - Fastest HMR, no Next.js overhead
3. **Client-First** - No RSC complexity
4. **Full-Stack Ready** - Server functions, API routes
5. **Modern React** - Latest patterns without legacy baggage

## Project Structure

```
app/
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Home page (/)
│   ├── login.tsx           # Login page (/login)
│   ├── signup.tsx          # Signup page (/signup)
│   └── _authenticated/     # Protected routes
│       ├── dashboard.tsx   # Dashboard (/dashboard)
│       └── settings.tsx    # Settings (/settings)
├── components/
│   ├── auth/               # Auth components
│   ├── ui/                 # Base UI components
│   └── providers/          # Context providers
├── hooks/
│   ├── use-auth.ts         # Auth hook
│   └── use-subscription.ts # Subscription hook
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── stripe/             # Stripe config
│   └── utils.ts            # Utilities
└── styles/
    └── globals.css         # Global styles
```

## TanStack Router Patterns

### Type-Safe Routes

```typescript
// app/routes/users.$userId.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$userId')({
  // params are fully typed!
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    return { user };
  },
  component: UserPage,
});

function UserPage() {
  const { user } = Route.useLoaderData();
  const { userId } = Route.useParams(); // Typed!
  return <div>{user.name}</div>;
}
```

### Type-Safe Search Params

```typescript
// app/routes/search.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().optional(),
  page: z.number().default(1),
  filter: z.enum(['all', 'active', 'archived']).default('all'),
});

export const Route = createFileRoute('/search')({
  validateSearch: searchSchema,
  component: SearchPage,
});

function SearchPage() {
  const { q, page, filter } = Route.useSearch(); // All typed!
  return <div>Searching for: {q}</div>;
}
```

### Protected Routes

```typescript
// app/routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
```

## Configuration

### 1. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy URL and anon key to `.env.local`

### 2. Stripe Setup

1. Create Stripe account
2. Get API keys
3. Set up products and prices

### 3. Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
OPENAI_API_KEY=sk-...
```

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location |
|------|----------|
| Routes | `app/routes/` |
| Components | `app/components/[project]/` |
| Hooks | `app/hooks/` |
| API | `app/routes/api/` |

### ❌ Don't Modify

| Area | Why |
|------|-----|
| `app/components/ui/` | shadcn managed |
| `app/lib/supabase/` | Core infrastructure |
| SSS Commands | Methodology source |

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Cloudflare Pages

```bash
npm run build
wrangler pages deploy dist
```

### Node.js Server

```bash
npm run build
npm start
```

## License

MIT - Use freely for personal and commercial projects.

