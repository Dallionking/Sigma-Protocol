# ADR-002: Use Supabase as Primary Backend

## Status
**Accepted**

## Context
Trading Platform needs:
- PostgreSQL for reliable financial data
- Real-time updates for balance/AI status
- Authentication with Apple SSO
- Row-level security for data isolation
- Serverless functions for Plaid integration

Options considered:
1. **Supabase** — Managed PostgreSQL + Realtime + Auth + Edge Functions
2. **Firebase** — NoSQL + Realtime + Auth
3. **Custom Backend** — Node.js/Express + PostgreSQL + WebSockets

## Decision
We will use **Supabase** as the primary backend platform.

## Consequences

### ✅ Benefits
- **PostgreSQL** — ACID transactions for financial data
- **Row Level Security** — Native data isolation per user
- **Realtime** — WebSocket subscriptions without custom infrastructure
- **Edge Functions** — Deno-based serverless for Plaid/webhooks
- **MCP Support** — AI-first development with Cursor integration
- **Cost Effective** — Free tier covers MVP, predictable scaling

### ⚠️ Trade-offs
- Vendor lock-in (mitigated by standard PostgreSQL)
- Edge Function cold starts (~200-500ms)
- Rate limits on free tier

### ❌ Risks
- Supabase outage affects entire app (mitigate with local cache)
- Complex migrations harder than traditional ORM

## Alternatives Considered

### Firebase
- **Rejected:** NoSQL not ideal for financial data requiring ACID guarantees
- Less flexible querying than PostgreSQL

### Custom Backend (Node.js + PostgreSQL)
- **Rejected:** Significant infrastructure management overhead
- Would require building auth, realtime, and hosting from scratch
- Longer time to market

### PlanetScale / Neon
- **Considered:** Good database options but lack integrated auth/realtime
- Would require combining multiple services

## Notes
- Use Supabase Local for development
- Supabase's MCP integration enables AI-assisted development
- Can export data to standard PostgreSQL if migration needed

---
*Decision made: 2025-12-11*



