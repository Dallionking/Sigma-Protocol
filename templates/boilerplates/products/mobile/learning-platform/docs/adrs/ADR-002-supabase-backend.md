# ADR-002: Use Supabase as Backend-as-a-Service

## Status
**Accepted** — 2025-12-17

## Context

We need a backend solution that provides:
- Database (PostgreSQL preferred for relational data)
- Authentication (email, social providers)
- Realtime subscriptions (for live features)
- File storage (media, worksheets)
- Serverless functions (AI integrations)

**Options Considered:**
1. **Supabase** — Open-source Firebase alternative
2. **Firebase** — Google's BaaS
3. **Convex** — Real-time backend with TypeScript
4. **Custom Backend** — Node.js/Python API with managed database
5. **Appwrite** — Open-source BaaS

## Decision

**Use Supabase** as the primary backend platform.

## Rationale

### Why Supabase:

1. **PostgreSQL Foundation**
   - Relational data model ideal for learning content structure
   - Row Level Security (RLS) for authorization at database level
   - Full SQL capabilities, stored procedures, triggers

2. **Built-in Auth**
   - Supabase Auth handles OAuth (Apple, Google), email, phone
   - JWT tokens work seamlessly with RLS
   - No separate auth service needed

3. **Realtime Subscriptions**
   - Native Postgres realtime for live updates
   - Presence for "who's online" features (future)
   - Works with React Native via `@supabase/supabase-js`

4. **Edge Functions**
   - Deno-based serverless functions
   - Perfect for AI integrations (OpenAI, ElevenLabs)
   - Same project, no separate deployment

5. **File Storage**
   - S3-compatible storage for media
   - CDN delivery included
   - Integrates with database via foreign keys

6. **MCP Compatibility**
   - Official Supabase MCP server in Cursor
   - AI can query/modify database directly during development
   - 10/10 MCP compatibility score

7. **Pricing**
   - Free tier for development
   - Pro tier ($25/mo) handles production needs
   - Predictable costs for small-medium apps

### Why Not Alternatives:

| Option | Rejection Reason |
|--------|------------------|
| Firebase | NoSQL less suitable for relational content, vendor lock-in |
| Convex | Less mature, limited SQL capabilities |
| Custom Backend | Requires significant DevOps, slower to market |
| Appwrite | Smaller community, fewer integrations |

## Consequences

### Benefits
- ✅ Single platform for DB, Auth, Storage, Functions
- ✅ Strong RLS for authorization security
- ✅ Native Expo integration documented
- ✅ Local development with Supabase CLI
- ✅ Open-source (can self-host if needed)

### Trade-offs
- ⚠️ Edge Functions use Deno (not Node.js)
- ⚠️ Some complex queries may need optimization
- ⚠️ Realtime has connection limits per tier

### Risks
- ❌ Supabase outage affects entire backend (mitigated: high uptime SLA)
- ❌ RLS complexity can lead to security bugs (mitigated: thorough testing)

## Implementation Notes

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## References
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Expo Guide](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

