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
