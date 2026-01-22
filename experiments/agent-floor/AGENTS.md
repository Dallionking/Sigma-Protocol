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

## Known Issues

### Pre-existing Build Errors (2026-01-22)
- `floor-store.ts`: Type errors with Colyseus state typing (`state` is of type 'unknown')
- `FloorRoom.ts`: Missing AgentManager/MessageBus modules, decorator errors
- These are outside scope of pathfinding work and should be fixed in their respective PRDs

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
