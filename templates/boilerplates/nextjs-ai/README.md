# Sigma Next.js AI Starter

> AI-first Next.js app with Convex backend for real-time collaboration and AI features.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/sss-nextjs-ai.git my-app
cd my-app

# Run setup wizard
npm run setup

# Install dependencies
npm install

# Start development (runs Next.js + Convex together)
npm run dev
```

## What's Included

### Core Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Authentication | Convex Auth | ✅ Ready |
| Database | Convex (real-time) | ✅ Ready |
| AI Integration | Vercel AI SDK | ✅ Ready |
| Real-time Sync | Convex subscriptions | ✅ Ready |
| File Storage | Convex Storage | ✅ Ready |
| Analytics | PostHog | ✅ Ready |

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Backend**: Convex (serverless, real-time)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK + OpenAI
- **Auth**: Convex Auth
- **Analytics**: PostHog

### Why Convex for AI Apps?

1. **Real-time by default** - AI responses stream live to all clients
2. **Type-safe end-to-end** - Schema → queries → components all typed
3. **No ORM needed** - Write queries in TypeScript
4. **Built-in file storage** - For AI-generated assets
5. **Serverless actions** - For AI API calls
6. **Automatic caching** - Optimized for AI chat interfaces

## Project Structure

```
app/                       # Next.js App Router
├── (auth)/               # Auth pages
├── (main)/               # Main app pages
├── layout.tsx            # Root layout with Convex
└── page.tsx              # Landing page
components/
├── ai/                   # AI-specific components
│   ├── chat.tsx         # Chat interface
│   ├── message.tsx      # Message bubble
│   └── streaming.tsx    # Streaming text
├── ui/                   # Base UI components
└── providers/            # Context providers
convex/
├── _generated/           # Auto-generated types
├── schema.ts            # Database schema
├── auth.ts              # Auth configuration
├── users.ts             # User queries/mutations
├── messages.ts          # Chat messages
└── ai.ts                # AI actions
hooks/
├── use-convex-auth.ts   # Auth hook wrapper
└── use-chat.ts          # Chat state management
lib/
├── ai/                  # AI utilities
└── utils.ts             # General utilities
```

## Convex Patterns

### Queries (Real-time reads)

```typescript
// convex/messages.ts
export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

// In React
const messages = useQuery(api.messages.list, { conversationId });
// Automatically updates when data changes!
```

### Mutations (Writes)

```typescript
// convex/messages.ts
export const send = mutation({
  args: { content: v.string(), conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("messages", {
      content: args.content,
      conversationId: args.conversationId,
      userId: identity!.subject,
      createdAt: Date.now(),
    });
  },
});
```

### Actions (External APIs like AI)

```typescript
// convex/ai.ts
export const generateResponse = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: args.prompt }],
    });
    return response.choices[0].message.content;
  },
});
```

## Configuration

### 1. Convex Setup

```bash
# Install Convex CLI
npm install -g convex

# Login to Convex
npx convex login

# Initialize (creates convex/ folder)
npx convex init

# Deploy to Convex Cloud
npx convex deploy
```

### 2. OpenAI Setup

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to Convex environment:

```bash
npx convex env set OPENAI_API_KEY sk-...
```

## Extension Guidelines

### ✅ Safe to Customize

| Area | Location |
|------|----------|
| Database Schema | `convex/schema.ts` |
| Queries/Mutations | `convex/*.ts` |
| AI Prompts | `convex/ai.ts` |
| Components | `components/[project]/` |

### ❌ Don't Modify

| Area | Why |
|------|-----|
| `convex/_generated/` | Auto-generated |
| `components/ui/` | shadcn managed |
| Sigma Commands | Methodology source |

## License

MIT - Use freely for personal and commercial projects.

