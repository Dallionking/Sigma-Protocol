import * as EasyStar from "easystarjs";

/**
 * Tile types for the floor grid
 */
export enum TileType {
  WALKABLE = 0,
  BLOCKED = 1,
  DESK = 2,
  FURNITURE = 3,
}

/**
 * Point on the grid (in tile coordinates)
 */
export interface GridPoint {
  x: number;
  y: number;
}

/**
 * Point in world coordinates (pixels)
 */
export interface WorldPoint {
  x: number;
  y: number;
}

/**
 * Path result with both grid and world coordinates
 */
export interface PathResult {
  /** Path in grid coordinates */
  gridPath: GridPoint[];
  /** Path in world coordinates (pixel positions) */
  worldPath: WorldPoint[];
  /** Smoothed path in world coordinates */
  smoothedPath: WorldPoint[];
  /** Total path distance in pixels */
  distance: number;
}

/**
 * Configuration for the pathfinding system
 */
export interface PathfindingConfig {
  /** Size of each tile in pixels */
  tileSize: number;
  /** Width of the grid in tiles */
  gridWidth: number;
  /** Height of the grid in tiles */
  gridHeight: number;
  /** Enable diagonal movement */
  allowDiagonals?: boolean;
  /** Enable corner cutting when moving diagonally */
  allowCornerCutting?: boolean;
  /** Iterations per calculation (higher = faster but more blocking) */
  iterationsPerCalculation?: number;
}

/**
 * Pathfinding - EasyStar.js wrapper for agent movement
 *
 * Provides pathfinding functionality for the office floor:
 * - Grid-based A* pathfinding using EasyStar.js
 * - Walkable tile management
 * - Async path calculation
 * - Path smoothing for natural movement
 *
 * Usage:
 * ```typescript
 * const pathfinder = new Pathfinding({
 *   tileSize: 32,
 *   gridWidth: 25,
 *   gridHeight: 20,
 * });
 *
 * // Initialize with all walkable
 * pathfinder.initializeGrid();
 *
 * // Block desk positions
 * pathfinder.setTileBlocked(5, 6, true);
 *
 * // Find path
 * const result = await pathfinder.findPath(
 *   { x: 100, y: 100 },  // start (world coords)
 *   { x: 400, y: 300 }   // end (world coords)
 * );
 * ```
 */
export class Pathfinding {
  private easystar: EasyStar.js;
  private config: Required<PathfindingConfig>;
  private grid: number[][] = [];
  private isInitialized: boolean = false;

  // Default configuration
  private static readonly DEFAULT_CONFIG: Omit<Required<PathfindingConfig>, 'tileSize' | 'gridWidth' | 'gridHeight'> = {
    allowDiagonals: true,
    allowCornerCutting: false,
    iterationsPerCalculation: 1000,
  };

  constructor(config: PathfindingConfig) {
    this.config = {
      ...Pathfinding.DEFAULT_CONFIG,
      ...config,
    };

    this.easystar = new EasyStar.js();
    this.configureEasyStar();
  }

  /**
   * Configure EasyStar instance with settings
   */
  private configureEasyStar(): void {
    // Set walkable tiles
    this.easystar.setAcceptableTiles([TileType.WALKABLE]);

    // Configure diagonal movement
    if (this.config.allowDiagonals) {
      this.easystar.enableDiagonals();
    }

    // Configure corner cutting
    if (this.config.allowCornerCutting) {
      this.easystar.enableCornerCutting();
    } else {
      this.easystar.disableCornerCutting();
    }

    // Set iterations per calculation for async behavior
    this.easystar.setIterationsPerCalculation(this.config.iterationsPerCalculation);

    // Set tile costs (furniture costs more to walk around)
    this.easystar.setTileCost(TileType.WALKABLE, 1);
  }

  /**
   * Initialize the grid with all walkable tiles
   * Call this to set up the floor grid before adding obstacles
   */
  initializeGrid(): void {
    this.grid = [];

    for (let y = 0; y < this.config.gridHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.config.gridWidth; x++) {
        row.push(TileType.WALKABLE);
      }
      this.grid.push(row);
    }

    this.easystar.setGrid(this.grid);
    this.isInitialized = true;
  }

  /**
   * Set the grid from an external source
   * @param grid - 2D array of tile types
   */
  setGrid(grid: number[][]): void {
    this.grid = grid;
    this.easystar.setGrid(this.grid);
    this.isInitialized = true;
  }

  /**
   * Set a tile as blocked or walkable
   * @param tileX - X coordinate in tile units
   * @param tileY - Y coordinate in tile units
   * @param blocked - Whether the tile should be blocked
   */
  setTileBlocked(tileX: number, tileY: number, blocked: boolean): void {
    if (!this.isValidTile(tileX, tileY)) return;

    this.grid[tileY][tileX] = blocked ? TileType.BLOCKED : TileType.WALKABLE;
    this.easystar.setGrid(this.grid);
  }

  /**
   * Set a tile type
   * @param tileX - X coordinate in tile units
   * @param tileY - Y coordinate in tile units
   * @param type - Tile type to set
   */
  setTileType(tileX: number, tileY: number, type: TileType): void {
    if (!this.isValidTile(tileX, tileY)) return;

    this.grid[tileY][tileX] = type;
    this.easystar.setGrid(this.grid);
  }

  /**
   * Mark a rectangular area as blocked (e.g., for desks)
   * @param startTileX - Starting X in tile units
   * @param startTileY - Starting Y in tile units
   * @param width - Width in tiles
   * @param height - Height in tiles
   * @param type - Tile type to set (default: BLOCKED)
   */
  setAreaBlocked(
    startTileX: number,
    startTileY: number,
    width: number,
    height: number,
    type: TileType = TileType.BLOCKED
  ): void {
    for (let y = startTileY; y < startTileY + height; y++) {
      for (let x = startTileX; x < startTileX + width; x++) {
        if (this.isValidTile(x, y)) {
          this.grid[y][x] = type;
        }
      }
    }
    this.easystar.setGrid(this.grid);
  }

  /**
   * Temporarily avoid a point (e.g., another agent's position)
   * @param tileX - X coordinate in tile units
   * @param tileY - Y coordinate in tile units
   */
  avoidPoint(tileX: number, tileY: number): void {
    if (this.isValidTile(tileX, tileY)) {
      this.easystar.avoidAdditionalPoint(tileX, tileY);
    }
  }

  /**
   * Stop avoiding a point
   * @param tileX - X coordinate in tile units
   * @param tileY - Y coordinate in tile units
   */
  stopAvoidingPoint(tileX: number, tileY: number): void {
    this.easystar.stopAvoidingAdditionalPoint(tileX, tileY);
  }

  /**
   * Clear all avoided points
   */
  clearAvoidedPoints(): void {
    this.easystar.stopAvoidingAllAdditionalPoints();
  }

  /**
   * Find a path between two points (async)
   *
   * @param start - Start position in world coordinates (pixels)
   * @param end - End position in world coordinates (pixels)
   * @returns Promise resolving to path result, or null if no path found
   */
  async findPath(start: WorldPoint, end: WorldPoint): Promise<PathResult | null> {
    if (!this.isInitialized) {
      console.warn("Pathfinding: Grid not initialized. Call initializeGrid() first.");
      return null;
    }

    const startTile = this.worldToGrid(start);
    const endTile = this.worldToGrid(end);

    // Validate tiles
    if (!this.isValidTile(startTile.x, startTile.y)) {
      console.warn(`Pathfinding: Start tile (${startTile.x}, ${startTile.y}) is out of bounds`);
      return null;
    }

    if (!this.isValidTile(endTile.x, endTile.y)) {
      console.warn(`Pathfinding: End tile (${endTile.x}, ${endTile.y}) is out of bounds`);
      return null;
    }

    return new Promise((resolve) => {
      this.easystar.findPath(
        startTile.x,
        startTile.y,
        endTile.x,
        endTile.y,
        (path) => {
          if (!path || path.length === 0) {
            resolve(null);
            return;
          }

          const gridPath: GridPoint[] = path.map((p) => ({ x: p.x, y: p.y }));
          const worldPath = this.gridPathToWorld(gridPath);
          const smoothedPath = this.smoothPath(worldPath);
          const distance = this.calculatePathDistance(smoothedPath);

          resolve({
            gridPath,
            worldPath,
            smoothedPath,
            distance,
          });
        }
      );

      // Process the path calculation
      this.easystar.calculate();
    });
  }

  /**
   * Find a path using grid coordinates directly
   *
   * @param startTile - Start position in tile coordinates
   * @param endTile - End position in tile coordinates
   * @returns Promise resolving to path result, or null if no path found
   */
  async findPathGrid(startTile: GridPoint, endTile: GridPoint): Promise<PathResult | null> {
    const startWorld = this.gridToWorld(startTile);
    const endWorld = this.gridToWorld(endTile);
    return this.findPath(startWorld, endWorld);
  }

  /**
   * Smooth a path using Catmull-Rom spline interpolation
   * Reduces jagged movement by creating curved paths
   *
   * @param path - Array of world coordinate points
   * @param tension - Spline tension (0-1, default 0.5)
   * @param segments - Number of segments between each point (default 5)
   * @returns Smoothed path with interpolated points
   */
  smoothPath(path: WorldPoint[], tension: number = 0.5, segments: number = 5): WorldPoint[] {
    if (path.length < 3) {
      return [...path];
    }

    const smoothed: WorldPoint[] = [];

    // Add the first point
    smoothed.push(path[0]);

    // Interpolate between points using Catmull-Rom
    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[Math.max(0, i - 1)];
      const p1 = path[i];
      const p2 = path[Math.min(path.length - 1, i + 1)];
      const p3 = path[Math.min(path.length - 1, i + 2)];

      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const point = this.catmullRom(p0, p1, p2, p3, t, tension);
        smoothed.push(point);
      }
    }

    return smoothed;
  }

  /**
   * Catmull-Rom spline interpolation
   */
  private catmullRom(
    p0: WorldPoint,
    p1: WorldPoint,
    p2: WorldPoint,
    p3: WorldPoint,
    t: number,
    tension: number
  ): WorldPoint {
    const t2 = t * t;
    const t3 = t2 * t;

    const m0x = tension * (p2.x - p0.x);
    const m0y = tension * (p2.y - p0.y);
    const m1x = tension * (p3.x - p1.x);
    const m1y = tension * (p3.y - p1.y);

    const a0 = 2 * t3 - 3 * t2 + 1;
    const a1 = t3 - 2 * t2 + t;
    const a2 = -2 * t3 + 3 * t2;
    const a3 = t3 - t2;

    return {
      x: a0 * p1.x + a1 * m0x + a2 * p2.x + a3 * m1x,
      y: a0 * p1.y + a1 * m0y + a2 * p2.y + a3 * m1y,
    };
  }

  /**
   * Calculate total distance of a path
   * @param path - Array of world coordinate points
   * @returns Total distance in pixels
   */
  calculatePathDistance(path: WorldPoint[]): number {
    if (path.length < 2) return 0;

    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance;
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  worldToGrid(point: WorldPoint): GridPoint {
    return {
      x: Math.floor(point.x / this.config.tileSize),
      y: Math.floor(point.y / this.config.tileSize),
    };
  }

  /**
   * Convert grid coordinates to world coordinates (center of tile)
   */
  gridToWorld(point: GridPoint): WorldPoint {
    const halfTile = this.config.tileSize / 2;
    return {
      x: point.x * this.config.tileSize + halfTile,
      y: point.y * this.config.tileSize + halfTile,
    };
  }

  /**
   * Convert an array of grid points to world coordinates
   */
  private gridPathToWorld(gridPath: GridPoint[]): WorldPoint[] {
    return gridPath.map((p) => this.gridToWorld(p));
  }

  /**
   * Check if a tile coordinate is valid
   */
  isValidTile(tileX: number, tileY: number): boolean {
    return (
      tileX >= 0 &&
      tileX < this.config.gridWidth &&
      tileY >= 0 &&
      tileY < this.config.gridHeight
    );
  }

  /**
   * Check if a tile is walkable
   */
  isTileWalkable(tileX: number, tileY: number): boolean {
    if (!this.isValidTile(tileX, tileY)) return false;
    return this.grid[tileY][tileX] === TileType.WALKABLE;
  }

  /**
   * Get the current grid
   */
  getGrid(): number[][] {
    return this.grid;
  }

  /**
   * Get the configuration
   */
  getConfig(): Required<PathfindingConfig> {
    return this.config;
  }

  /**
   * Get grid dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.gridWidth,
      height: this.config.gridHeight,
    };
  }

  /**
   * Step the pathfinding calculation manually
   * Call this in your game loop if using async mode
   */
  calculate(): void {
    this.easystar.calculate();
  }

  /**
   * Enable synchronous mode (blocking)
   * Use with caution - can cause frame drops
   */
  enableSync(): void {
    this.easystar.enableSync();
  }

  /**
   * Disable synchronous mode (async, non-blocking)
   */
  disableSync(): void {
    this.easystar.disableSync();
  }
}

export default Pathfinding;
