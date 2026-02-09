# ADR-005: Modular Monolith Architecture Pattern

## Status
**Accepted** — 2025-12-17

## Context

We need to choose an architectural pattern for the mobile app and backend that:
- Supports a 2-3 person development team
- Scales to ~10,000 initial users, with path to 100,000+
- Minimizes operational overhead
- Allows rapid iteration

**Options Considered:**
1. **Modular Monolith** — Single codebase with feature-based modules
2. **Microservices** — Distributed services per domain
3. **Serverless-First** — Individual functions per endpoint
4. **Layered Monolith** — Traditional layered architecture

## Decision

**Use Modular Monolith with Feature-Based Organization**

## Rationale

### Why Modular Monolith:

1. **Right-Sized for Team**
   - 2-3 developers don't benefit from microservices overhead
   - Single codebase easier to understand and debug
   - Shared types between modules reduce duplication

2. **Clear Module Boundaries**
   - Feature folders in mobile app (auth, lessons, ai-tutor, booking)
   - Shared libraries for common functionality
   - Can extract to services later if needed

3. **Single Deployment**
   - One Expo app binary
   - Supabase Edge Functions in one project
   - Simplified CI/CD and rollback

4. **Performance Benefits**
   - No inter-service network latency
   - Shared database with optimized queries
   - Simpler state management

5. **Future Evolution Path**
   - Module boundaries serve as future service boundaries
   - Can extract AI services if scaling requires
   - Martin Fowler's "Monolith First" principle

### Architecture Frameworks Applied:

**Martin Fowler — Evolutionary Architecture:**
- ✅ Architecture supports evolution (modules can become services)
- ✅ Shared understanding across small team
- ✅ Avoids Big Design Up Front

**Uncle Bob — Clean Architecture:**
- ✅ Dependencies point inward (UI → Use Cases → Domain)
- ✅ Business logic independent of UI framework
- ✅ External services abstracted behind interfaces

**Sam Newman — When NOT Microservices:**
- ✅ Small team (< 10 developers)
- ✅ No independent scaling requirements yet
- ✅ Limited DevOps maturity for distributed systems

### Why Not Alternatives:

| Option | Rejection Reason |
|--------|------------------|
| Microservices | Operational overhead without benefit at this scale |
| Serverless-First | Cold starts impact UX, harder to test locally |
| Layered Monolith | Less suited for feature teams, harder to refactor |

## Consequences

### Benefits
- ✅ Simple to understand, test, and deploy
- ✅ Fast development velocity
- ✅ Clear ownership boundaries per feature
- ✅ Easy to refactor within single codebase
- ✅ Single source of truth for types/schemas

### Trade-offs
- ⚠️ All modules share same deployment cycle
- ⚠️ Scaling is all-or-nothing (addressed by Supabase/Edge scaling)
- ⚠️ Discipline needed to maintain module boundaries

### Risks
- ❌ Module coupling if boundaries not enforced (mitigated: code review)
- ❌ Single point of failure (mitigated: Supabase reliability, error handling)

## Implementation: Mobile App Structure

```
learning-platform/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth module screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── home.tsx
│   │   ├── learn.tsx
│   │   ├── practice.tsx
│   │   ├── schedule.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx
│   ├── lessons/[id].tsx          # Lesson detail (dynamic)
│   ├── ai-tutor/                 # AI chat screens
│   ├── video-call/               # LiveKit screens
│   ├── booking/                  # Session booking
│   └── subscription/             # Paywall, upgrade
│
├── modules/                      # Feature modules
│   ├── auth/                     # Authentication
│   │   ├── hooks/
│   │   ├── components/
│   │   └── services/
│   ├── lessons/                  # Learning content
│   │   ├── hooks/
│   │   ├── components/
│   │   └── services/
│   ├── ai-tutor/                 # AI chat functionality
│   │   ├── hooks/
│   │   ├── components/
│   │   └── services/
│   ├── booking/                  # Session scheduling
│   ├── subscription/             # RevenueCat integration
│   └── gamification/             # XP, streaks, achievements
│
├── shared/                       # Cross-module shared code
│   ├── components/               # UI components (design system)
│   ├── hooks/                    # Common hooks
│   ├── lib/                      # Utilities, clients
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── revenuecat.ts
│   └── types/                    # TypeScript types
│
└── supabase/                     # Backend code
    ├── functions/                # Edge Functions
    │   ├── ai-chat/
    │   ├── ai-voice/
    │   ├── generate-token/
    │   └── sync-subscription/
    └── migrations/               # Database migrations
```

## Module Dependency Rules

```
┌─────────────────────────────────────────────────────────────┐
│                         APP (Screens)                        │
│  • Can import from modules/* and shared/*                   │
│  • Cannot have business logic                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODULES (Feature Logic)                   │
│  • Can import from shared/*                                 │
│  • Can import from other modules via defined interfaces     │
│  • Contains: hooks, components, services, types             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SHARED (Common Utilities)                  │
│  • Cannot import from modules/*                             │
│  • Contains: Supabase client, UI primitives, types          │
└─────────────────────────────────────────────────────────────┘
```

## References
- [Martin Fowler: MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- [Sam Newman: Microservices Prerequisites](https://samnewman.io/blog/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

