# Agent Floor - Long-Term Memory

This file serves as persistent memory for AI agents working on the Agent Floor project.
Agents should read this before starting work and update it with new learnings.

---

## Project Context

### Overview
AgentFloor is a Pokemon-style 2D virtual office where AI agents walk around, visit each other's desks, and collaborate on tasks in real-time.

### Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14+ | Frontend framework |
| React | UI components |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Phaser 3 | Game engine |
| Colyseus | Real-time multiplayer |
| Zustand | State management |
| EasyStar.js | Pathfinding |
| ElevenLabs | Voice synthesis |

### Project Location
```
/Users/dallionking/SSS Projects/SSS-Protocol/experiments/agent-floor/
```

### Directory Structure
```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── chat/         # ChatPanel, CodeBlock
│   ├── floor/        # FloorCanvas, GameCanvas
│   ├── settings/     # ProviderConfig
│   ├── tasks/        # TaskBoard, TaskCard
│   └── ui/           # Shared UI (ErrorBoundary)
├── game/
│   ├── scenes/       # Phaser scenes (OfficeScene)
│   ├── sprites/      # Phaser sprite classes (AgentSprite)
│   └── utils/        # Game utilities (Pathfinding)
├── lib/
│   ├── memory/       # Three-tier memory system
│   └── store/        # Zustand stores
├── server/
│   ├── agents/       # AgentManager, AgentWorker, MessageBus
│   ├── integrations/ # GitHub, external services
│   ├── providers/    # LLM provider adapters
│   ├── rooms/        # Colyseus rooms
│   └── workspace/    # SandboxedWorkspace
└── types/            # TypeScript type definitions
```

---

## Architecture Patterns

### Provider Pattern
LLM providers follow a registry pattern with lazy initialization:
```typescript
// Register a provider
registerProvider(provider: LLMProvider): void
registerProviderFactory(id: string, factory: () => LLMProvider): void

// Retrieve providers
getProvider(id: string): LLMProvider | undefined
getProviderAsync(id: string): Promise<LLMProvider>
```

### Agent State Machine
Valid agent states and transitions:
```
idle → thinking → working → talking
         ↓         ↓
       walking   walking
```
Use `isValidTransition()` helper from `src/server/agents/types.ts`.

### Memory Tiers
1. **LongTermMemory** - Persists to `docs/AGENTS.md` (patterns, conventions)
2. **ShortTermMemory** - Session JSON files (current task, recent decisions)
3. **ImmediateMemory** - Real-time state (positions, status)

### Message Bus (A2A Protocol)
- Parse @mentions with `parseMentions(content)`
- Route via `routeMessage(message)` or `broadcastMessage()`
- Per-agent message queues for async processing

---

## Code Conventions

### Imports
```typescript
// Path alias for src/
import { Agent } from "@/types/agent";
import { createProvider } from "@/server/providers";

// EasyStar.js requires namespace import
import * as EasyStar from "easystarjs";
// Class is EasyStar.js (note the .js suffix)
const easystar = new EasyStar.js();
```

### Phaser Conventions
```typescript
// Tile size constant
const TILE_SIZE = 32; // pixels

// World to grid conversion
const gridX = Math.floor(worldX / TILE_SIZE);
const gridY = Math.floor(worldY / TILE_SIZE);

// Grid to world conversion (center of tile)
const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
```

### Agent Worker Patterns
```typescript
// Always build personality-aware prompts
const systemPrompt = this.buildPersonalityAwareSystemPrompt();

// Use callLLMWithRetry for resilience
const response = await this.callLLMWithRetry(messages, systemPrompt);

// Record token usage after successful calls
this.tokenTracker?.recordUsage(agentId, usage);
```

### Error Handling
```typescript
// Use exponential backoff with jitter for retries
const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
const jitter = delay * 0.1 * Math.random();
await sleep(delay + jitter);
```

### Testing
- Test pages at `/test/{component-name}` for UI validation
- Use `agent-browser` CLI for automated UI testing
- Vitest for unit tests

---

## Learnings

### 2026-01-22: EasyStar.js Integration
- Must call `easystar.calculate()` after `findPath()` for async pathfinding
- Grid uses tile coordinates, not world coordinates
- TileType enum: WALKABLE=0, BLOCKED=1, DESK=2, FURNITURE=3

### 2026-01-22: Colyseus State Typing
- FloorRoom state typing requires `@type` decorators
- Pre-existing type errors in `floor-store.ts` with `state` being `unknown`
- These are architectural issues, don't block feature development

### 2026-01-22: Shiki Syntax Highlighting
- Chosen over Prism for better quality
- Use `codeToHtml()` with `github-dark-default` theme
- Language alias mapping needed (js→javascript, ts→typescript)

### 2026-01-22: Claude Code CLI Adapter
- Uses `--dangerously-skip-permissions` flag for non-interactive mode
- `--print` flag for non-interactive output
- 5-minute default timeout
- Estimates token usage if not provided by CLI

---

## Decisions Log

### Decision: LLM Provider Architecture
**Date:** 2026-01-22
**Context:** Need to support multiple LLM providers (Claude, OpenAI, Gemini, etc.)
**Decision:** Use factory pattern with registry for lazy initialization
**Rationale:**
- Allows adding new providers without modifying core code
- Supports async provider initialization
- Enables provider fallback chains
**Alternatives Considered:**
- Direct instantiation: Rejected (tight coupling)
- Dependency injection: Rejected (overkill for this scale)

### Decision: Three-Tier Memory System
**Date:** 2026-01-22
**Context:** Agents need persistent context across sessions
**Decision:** Implement LongTermMemory (AGENTS.md), ShortTermMemory (JSON), ImmediateMemory (state)
**Rationale:**
- Different persistence needs for different data types
- Human-readable long-term memory (markdown)
- Structured short-term memory (JSON)
- Real-time state for positions/status

### Decision: Agent Personality System
**Date:** 2026-01-22
**Context:** Agents should have distinct communication styles
**Decision:** Personality traits + mood + fatigue affect LLM prompts
**Rationale:**
- More engaging user experience
- Distinct agent identities
- Natural-feeling team dynamics
**Traits:**
- Personality: introvert/extrovert
- Communication: formal/casual
- Mood: happy/stressed/focused/tired
- Fatigue: 0-100 energy level

### Decision: GitHub Integration via CLI
**Date:** 2026-01-22
**Context:** Need to create PRs, branches, commits from agents
**Decision:** Use `gh` CLI instead of direct HTTP API
**Rationale:**
- Already authenticated via user's gh config
- Handles OAuth/token management automatically
- Supports all needed operations
- Consistent with CLAUDE.md guidance

---

## Skills Reference

When implementing features, use these skills:

| Skill | Usage |
|-------|-------|
| `@frontend-design` | All UI components |
| `@senior-architect` | Architecture decisions |
| `@systematic-debugging` | Error diagnosis |
| `@gap-analysis` | PRD compliance verification |
| `@scaffold` | New feature scaffolding |

---

## Quick Commands

```bash
# Start development server
npm run dev

# Run Colyseus server
npm run server

# UI validation
agent-browser open http://localhost:3000/floor/dev-team
agent-browser snapshot -i

# Run tests
npm test
```
