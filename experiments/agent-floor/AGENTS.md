# Agent Floor - AGENTS.md

Long-term memory for AI agents working on this project.

## Project Structure

```
src/
├── game/
│   ├── scenes/     # Phaser scenes (OfficeScene)
│   ├── sprites/    # Phaser sprite classes (AgentSprite)
│   └── utils/      # Game utilities (Pathfinding)
├── lib/
│   └── store/      # Zustand stores
├── server/
│   ├── agents/     # Agent lifecycle management (AgentManager, AgentWorker)
│   ├── providers/  # LLM provider registry (factory pattern)
│   └── rooms/      # Colyseus rooms
└── types/          # TypeScript type definitions
```

## Coding Patterns

### EasyStar.js Pathfinding
- Import as: `import * as EasyStar from "easystarjs"` (not default import)
- EasyStar class is `EasyStar.js` (note the `.js` suffix)
- Grid uses tile coordinates, not world coordinates
- Always call `easystar.calculate()` after `findPath()` for async mode
- TileType enum: WALKABLE=0, BLOCKED=1, DESK=2, FURNITURE=3

### Phaser Integration
- OfficeScene uses TILE_SIZE = 32 pixels
- Agent positions are in world coordinates (pixels)
- Convert world-to-grid: `Math.floor(worldX / tileSize)`
- Convert grid-to-world: `gridX * tileSize + tileSize/2` (center of tile)

### Type Definitions
- Agent types are in `@/types/agent`
- Use path alias `@/` for imports from src/

### AgentManager System
- AgentManager lives in `src/server/agents/AgentManager.ts`
- AgentWorker handles per-agent work loops (tick-based)
- State machine: idle → thinking → working → talking (walking also valid)
- Valid transitions defined in `types.ts` - use `isValidTransition()` helper
- ROLE_TASK_KEYWORDS maps roles to task keywords for intelligent routing
- Workers notify state changes via callback to AgentManager
- AgentManager syncs state to Colyseus for real-time client updates

## Known Issues

### Pre-existing Build Errors (2026-01-22)
- `floor-store.ts`: Type errors with Colyseus state typing (`state` is of type 'unknown')
- `FloorRoom.ts`: Decorator errors (Colyseus @type decorators require experimentalDecorators)
- These are pre-existing and don't block agent system functionality

## Completed Stories

### PRD004-003: EasyStar.js Pathfinding (2026-01-22)
- Created `src/game/utils/pathfinding.ts`
- Implements A* pathfinding with EasyStar.js
- Features:
  - Grid initialization with walkable/blocked tiles
  - Async path calculation
  - Catmull-Rom spline path smoothing
  - World-to-grid coordinate conversion
  - Point avoidance for dynamic obstacles

### PRD009-001: AgentManager Class (2026-01-22)
- Created `src/server/agents/` module with:
  - `AgentManager.ts` - Orchestrator for agent lifecycle
  - `AgentWorker.ts` - Per-agent work loop handler
  - `MessageBus.ts` - Message routing placeholder (for PRD-010)
  - `types.ts` - Shared types and state machine helpers
  - `index.ts` - Barrel exports
- Features:
  - `startAgentLoops()` / `stopAgentLoops()` lifecycle methods
  - Spawns AgentWorker for each agent in room
  - Task routing based on role-to-keyword matching
  - State machine with validated transitions
  - Syncs agent state to Colyseus for real-time updates

### PRD009-002: AgentWorker Class (2026-01-22)
- Enhanced `AgentWorker.ts` with autonomous work loop:
  - Work loop priority: check messages → check tasks → idle
  - Message queue with types: mention, direct, broadcast, task
  - LLM provider integration via `LLMProvider` interface
  - `callLLMWithRetry()` with exponential backoff (3 retries)
  - Circuit breaker pattern for error recovery
- Key methods:
  - `enqueueMessage()` - Add message to worker inbox
  - `handleMention()` - Process @mentions via LLM
  - `processTask()` - Execute assigned tasks via LLM
  - `setLLMProvider()` - Configure LLM for completions
  - `setSendMessageCallback()` - Wire up message sending
- AgentManager updates:
  - Workers initialized with full context (name, role, systemPrompt)
  - `routeMessageToWorkers()` for MessageBus integration
  - `setLLMProvider()` propagates to all workers

### PRD010-001: MessageBus Class (2026-01-22)
- Full implementation of `MessageBus.ts` for A2A (Agent-to-Agent) protocol
- Features:
  - `parseMentions(content)` - Extract @mentions with position tracking
  - `routeMessage(message)` - Route to correct agent(s) based on @mentions or direct addressing
  - `broadcastMessage()` - Send to all agents except sender
  - Per-agent message queues (`Map<agentId, QueuedMessage[]>`)
  - `getMessagesFor(agentId)` - Retrieve queued messages
  - `markMessageProcessed()` - Mark messages as handled
  - `setMessageQueuedCallback()` - Integration hook for AgentManager
- Types exported:
  - `RoutableMessage` - Base message for routing
  - `QueuedMessage` - Message with queue metadata
  - `ParsedMention` - Extracted mention with agent resolution
  - `MessageType` - Union type for message categories
- Integration notes:
  - MessageBus initializes queues for existing agents on construction
  - Use `setMessageQueuedCallback()` to notify AgentManager of new messages
  - FloorRoom passes messages via `routeMessage()` on user chat

### PRD011-001: LLM Provider Registry (2026-01-22)
- Created `src/server/providers/index.ts` with factory pattern
- Features:
  - `registerProvider(provider)` - Add provider to registry
  - `registerProviderFactory(id, factory)` - Lazy initialization support
  - `getProvider(id)` / `getProviderAsync(id)` - Retrieve providers
  - `listProviders()` / `listProviderIds()` - Enumerate providers
  - `hasProvider(id)` - Check existence
  - `unregisterProvider(id)` / `clearProviders()` - Removal utilities
- Default stub providers auto-registered on import:
  - `claude-code` (CLI-based, type: "cli", Max subscription) - **Now uses real adapter**
  - `anthropic` (Claude API, supportsVision, supportsTools)
  - `openai` (supportsVision, supportsTools)
  - `gemini` (1M context, supportsVision, supportsTools)
  - `openrouter` (multi-model router)
  - `xai` (Grok, supportsTools)
  - `ollama` (local inference)
- Stub providers return mock responses - replace with real adapters in PRD-013
- Re-exports LLMProvider types from `@/types/provider`

### PRD012-001: Claude Code CLI Adapter (2026-01-22)
- Created `src/server/providers/claude-code.ts` - Real Claude Code CLI adapter
- Features:
  - `ClaudeCodeAdapter` class implementing `LLMProvider` interface
  - `formatPrompt(messages)` - Converts message array to CLI prompt format
  - `parseOutput(output)` - Parses JSON or plain text CLI responses
  - Spawns `claude` CLI with `--dangerously-skip-permissions` flag
  - 5-minute timeout (`DEFAULT_TIMEOUT_MS = 5 * 60 * 1000`)
  - Automatic retry with exponential backoff (3 attempts)
  - Streaming support via async generator
  - `isAvailable()` checks CLI installation
- Exported utilities:
  - `createClaudeCodeAdapter(options?)` - Factory function
  - `formatPrompt(messages)` / `parseOutput(output)` - Helpers
- Integration notes:
  - Uses `--print` flag for non-interactive output
  - Supports `--model` and `--max-tokens` options
  - Estimates token usage if not provided by CLI

### PRD017-001: Walking Animation (2026-01-22)
- Enhanced `src/game/sprites/AgentSprite.ts` with pathfinding-based walking
- Features:
  - `WalkDirection` type: "up" | "down" | "left" | "right"
  - `WalkToOptions` interface with `onArrival`, `onBlocked`, `avoidAgents`, `direct` options
  - `walkTo(x, y, options)` - Async walk with pathfinding and callbacks
  - `walkAlongPath(path)` - Iterate through smoothed path points
  - `updateWalkDirection(targetX, targetY)` - Calculate direction from movement vector
  - `stopWalking()` - Cancel current walk and reset state
  - Direction-based visual effects: tints, scale (perspective), sway
- Walk animation effects:
  - Bob offset: `Math.sin(time * frequency) * amplitude` for vertical bounce
  - Sway offset for left/right walking
  - Scale: up=1.15, down=1.25 for perspective simulation
  - `DIRECTION_TINTS` for visual direction distinction
- Integration notes:
  - OfficeScene creates Pathfinding instance in `initializePathfinding()`
  - Pathfinding grid matches camera dimensions / TILE_SIZE
  - Desks marked as `TileType.DESK` in pathfinding grid
  - `walkAgentTo()` automatically passes other agents for collision avoidance
  - Uses `pathfinder.avoidPoint()` for dynamic obstacle avoidance

### PRD002-001: Error Boundary Component (2026-01-22)
- Created `src/components/ui/error-boundary.tsx`
- Features:
  - `ErrorBoundary` class component (required for error catching)
  - `getDerivedStateFromError` + `componentDidCatch` for error handling
  - Console logging with component stack trace
  - Default fallback UI with retry button
  - Custom fallback prop support
  - `onError` callback for external error tracking
  - `onReset` callback for cleanup on retry
  - `withErrorBoundary` HOC for wrapping functional components
- Styling:
  - Uses floor theme colors: `floor-panel`, `floor-accent`, `floor-highlight`
  - AlertTriangle icon from lucide-react
  - RefreshCw icon for retry button
- Test page at `/test/error-boundary` for validation
