# SSS Next.js AI - Features

> AI-first application with Convex backend and real-time capabilities.

## Included Modules

| Module | Status | Description |
|--------|--------|-------------|
| Marketing | ✅ Included | Landing, pricing pages |
| Auth | ✅ Included | Convex auth |
| Dashboard | ✅ Included | App shell with sidebar |
| Settings | ✅ Included | User settings |
| Billing | ✅ Included | Subscription management |
| Admin | ✅ Included | Admin dashboard |
| **AI Chat** | ✅ **Enabled** | AI chat with streaming |
| Error States | ✅ Included | Error boundaries |

## Optional Modules

| Module | Status | Description | How to Enable |
|--------|--------|-------------|---------------|
| CRUD Example | 🔲 Disabled | Example data patterns | Set `enabledModules.crudExample = true` |
| Notifications | 🔲 Disabled | In-app notifications | Add notifications module |

## Feature Backlog

> Edit this list to track what you want to add or remove.

### To Add
- [ ] Multiple AI models (Claude, Llama)
- [ ] Conversation sharing
- [ ] File/image analysis
- [ ] Voice input/output
- [ ] RAG with vector search
- [ ] Agent workflows
- [ ] Prompt templates
- [ ] Usage analytics

### To Customize
- [ ] Add custom AI prompts
- [ ] Configure rate limiting
- [ ] Add model selection UI

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Backend | Convex (real-time) |
| Auth | Convex Auth |
| AI | Vercel AI SDK + OpenAI |
| Styling | Tailwind CSS + shadcn/ui |

## Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# AI
OPENAI_API_KEY=
```

## Quick Start

```bash
npm install
npx convex dev   # Start Convex backend
npm run dev      # Start Next.js frontend
```

## AI Chat Features

- Streaming responses
- Message history (stored in Convex)
- Conversation management
- Empty state when API key missing

---

*Last updated: 2025-12-20*

