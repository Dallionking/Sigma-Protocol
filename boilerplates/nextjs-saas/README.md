# SSS Next.js SaaS Starter

> Production-ready SaaS boilerplate with authentication, payments, AI integration, and SSS methodology built-in.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/sss-nextjs-starter.git my-app
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
| Payments | Stripe Subscriptions | ✅ Ready |
| AI Integration | Vercel AI SDK + OpenAI | ✅ Ready |
| Credits System | Built-in usage tracking | ✅ Ready |
| Email | Resend | ✅ Ready |
| Analytics | PostHog | ✅ Ready |
| Theme Toggle | next-themes | ✅ Ready |

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (Postgres + RLS)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: Vercel AI SDK
- **Email**: Resend
- **Analytics**: PostHog

### SSS Commands (Bundled)

```
.cursor/commands/
├── audit/          # Security, performance, a11y audits
├── deploy/         # Deployment workflows
├── dev/            # Development helpers
├── generators/     # Code generators
├── marketing/      # Marketing workflows
├── ops/            # Operations & maintenance
├── steps/          # SSS methodology (Steps 0-12)
└── Magic UI/       # UI templates
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI endpoints
│   │   ├── credits/      # Credits management
│   │   └── webhooks/     # Stripe webhooks
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── auth/              # Auth components
│   ├── credits/           # Credits UI
│   ├── payments/          # Payment components
│   ├── ui/                # shadcn/ui components
│   └── providers/         # Context providers
├── hooks/
│   ├── use-auth.ts        # Auth hook
│   ├── use-credits.ts     # Credits hook
│   └── use-subscription.ts # Subscription hook
├── lib/
│   ├── ai/                # AI client config
│   ├── supabase/          # Supabase clients
│   ├── stripe/            # Stripe config
│   └── utils.ts           # Utilities
└── types/                 # TypeScript types
```

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your API keys (see comments in the file).

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in `supabase/migrations/`
3. Enable Email auth in Auth settings
4. Copy your API keys to `.env.local`

### 3. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Create products and prices in Dashboard
3. Set up webhook endpoint: `https://yourapp.com/api/webhooks/stripe`
4. Copy API keys to `.env.local`

### 4. OpenAI Setup

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location | How |
|------|----------|-----|
| Brand Colors | `src/app/globals.css` | Override CSS variables |
| Font | `src/app/layout.tsx` | Change font import |
| Routes | `src/app/` | Add new routes |
| Components | `src/components/[project]/` | Create new components |
| API Routes | `src/app/api/[project]/` | Add new endpoints |
| Database | `supabase/migrations/` | Add new tables |

### ⚠️ Modify with Caution

| Area | Location | Risk |
|------|----------|------|
| Auth Flow | `src/components/auth/` | May break login |
| Payment Webhooks | `src/app/api/webhooks/` | May break billing |
| Credits Logic | `src/hooks/use-credits.ts` | May break usage |

### ❌ Don't Modify

| Area | Location | Why |
|------|----------|-----|
| Supabase Client | `src/lib/supabase/` | Core infrastructure |
| AI Client | `src/lib/ai/` | Core infrastructure |
| Base UI | `src/components/ui/` | shadcn managed |
| SSS Commands | `.cursor/commands/` | Methodology source |

## SSS Workflow

This boilerplate is designed to work with the SSS methodology:

1. **Step 1-2**: Already decided (Next.js + Supabase stack)
2. **Step 3-7**: Design your UX and interfaces
3. **Step 8**: Technical spec builds on this foundation
4. **Step 10-11**: Feature breakdown and PRDs reference boilerplate components
5. **Step 12**: Generate cursor rules for your extensions

## Credits System

Built-in usage tracking for AI features:

```typescript
import { useCredits } from '@/hooks/use-credits';

function MyComponent() {
  const { remaining, consume, isLoading } = useCredits();
  
  const handleAIAction = async () => {
    const success = await consume(10); // Consume 10 credits
    if (success) {
      // Proceed with AI action
    }
  };
  
  return <div>Credits: {remaining}</div>;
}
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Works with any Node.js hosting:
- Railway
- Render
- Fly.io
- Docker

## License

MIT - Use freely for personal and commercial projects.

## Support

- [Documentation](https://docs.sss.dev)
- [Discord Community](https://discord.gg/sss)
- [GitHub Issues](https://github.com/your-org/sss-nextjs-starter/issues)

