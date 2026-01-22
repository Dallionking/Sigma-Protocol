import * as Phaser from "phaser";
import type { Agent, AgentStatus } from "@/types/agent";
import { AgentSprite } from "../sprites/AgentSprite";

/**
 * Configuration for OfficeScene initialization
 */
export interface OfficeSceneConfig {
  teamId: string;
  onAgentSelect?: (agentId: string | null) => void;
  onReady?: () => void;
}

/**
 * Agent sprite data with associated desk
 */
interface AgentSpriteData {
  sprite: AgentSprite;
  desk: Phaser.GameObjects.Image;
}

/**
 * OfficeScene - Main Phaser scene for the virtual office floor
 *
 * Manages:
 * - Floor grid rendering
 * - Agent sprites with status indicators
 * - Agent selection and interaction
 * - Walking animations (prepared for future PRDs)
 * - Talking connection lines between agents
 */
export class OfficeScene extends Phaser.Scene {
  // Configuration
  private config: OfficeSceneConfig;

  // Agent management
  private agents: Agent[] = [];
  private selectedAgentId: string | null = null;
  private agentSprites: Map<string, AgentSpriteData> = new Map();

  // Graphics
  private floorTiles: Phaser.GameObjects.Image[] = [];
  private talkingLines: Phaser.GameObjects.Graphics[] = [];
  private titleText: Phaser.GameObjects.Text | null = null;

  // Constants
  private static readonly TILE_SIZE = 32;
  private static readonly AGENT_SPACING = 120;
  private static readonly AGENT_START_X = 100;
  private static readonly AGENT_START_Y = 200;

  constructor(config: OfficeSceneConfig) {
    super({ key: "OfficeScene" });
    this.config = config;
  }

  /**
   * Preload all game assets
   * Creates procedural textures for agents, desks, and floor tiles
   */
  preload(): void {
    this.createAgentTextures();
    this.createFurnitureTextures();
    this.createFloorTextures();
  }

  /**
   * Create procedural textures for agent status indicators
   */
  private createAgentTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const statusColors: Record<AgentStatus, number> = {
      idle: 0x4ade80,
      working: 0xfbbf24,
      thinking: 0x60a5fa,
      talking: 0xc084fc,
      walking: 0x34d399,
    };

    // Create texture for each status
    for (const [status, color] of Object.entries(statusColors)) {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillCircle(16, 16, 12);
      graphics.generateTexture(`agent-${status}`, 32, 32);
    }

    graphics.destroy();
  }

  /**
   * Create procedural textures for office furniture
   */
  private createFurnitureTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Desk texture
    graphics.fillStyle(0x3d3d5c);
    graphics.fillRect(0, 0, 48, 32);
    graphics.lineStyle(2, 0x5c5c8a);
    graphics.strokeRect(0, 0, 48, 32);
    graphics.generateTexture("desk", 48, 32);

    graphics.destroy();
  }

  /**
   * Create procedural textures for floor tiles
   */
  private createFloorTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Floor tile texture
    graphics.fillStyle(0x16213e);
    graphics.fillRect(0, 0, OfficeScene.TILE_SIZE, OfficeScene.TILE_SIZE);
    graphics.lineStyle(1, 0x0f3460, 0.3);
    graphics.strokeRect(0, 0, OfficeScene.TILE_SIZE, OfficeScene.TILE_SIZE);
    graphics.generateTexture("floor-tile", OfficeScene.TILE_SIZE, OfficeScene.TILE_SIZE);

    graphics.destroy();
  }

  /**
   * Set up the scene - floor grid, agents, and interactions
   */
  create(): void {
    this.drawFloorGrid();
    this.createTitle();
    this.setupInputHandlers();

    // Notify that the scene is ready
    this.config.onReady?.();
  }

  /**
   * Draw the floor grid covering the entire viewport
   */
  private drawFloorGrid(): void {
    // Clear existing tiles
    this.floorTiles.forEach((tile) => tile.destroy());
    this.floorTiles = [];

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const halfTile = OfficeScene.TILE_SIZE / 2;

    for (let x = 0; x < width; x += OfficeScene.TILE_SIZE) {
      for (let y = 0; y < height; y += OfficeScene.TILE_SIZE) {
        const tile = this.add.image(x + halfTile, y + halfTile, "floor-tile");
        this.floorTiles.push(tile);
      }
    }
  }

  /**
   * Create the team title text
   */
  private createTitle(): void {
    if (this.titleText) {
      this.titleText.destroy();
    }

    const displayTitle = this.config.teamId.replace(/-/g, " ").toUpperCase();
    this.titleText = this.add.text(16, 16, displayTitle, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      color: "#8b8b8b",
    });
  }

  /**
   * Set up input handlers for agent selection
   * Note: AgentSprite handles its own click events via onSelect callback
   * This handler clears selection when clicking on empty space
   */
  private setupInputHandlers(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Check if click was on empty space (not on any agent)
      let clickedOnAgent = false;

      this.agentSprites.forEach((spriteData) => {
        const bounds = spriteData.sprite.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          clickedOnAgent = true;
        }
      });

      // Clear selection if clicked on empty space
      if (!clickedOnAgent) {
        this.setSelectedAgent(null);
      }
    });
  }

  /**
   * Main update loop - handles animations and state updates
   */
  update(_time: number, _delta: number): void {
    // Update agent sprite states based on current data
    this.updateAgentSprites();

    // Update talking connection lines
    this.updateTalkingLines();
  }

  /**
   * Update all agent sprites to reflect current state
   */
  private updateAgentSprites(): void {
    // Update existing sprites
    this.agents.forEach((agent, index) => {
      const spriteData = this.agentSprites.get(agent.id);
      if (spriteData) {
        // Update agent data (handles status changes)
        spriteData.sprite.updateAgentData(agent);

        // Update selection state
        spriteData.sprite.setSelected(this.selectedAgentId === agent.id);

        // Update position if not walking (for layout changes)
        if (!spriteData.sprite.getIsWalking()) {
          const targetX = OfficeScene.AGENT_START_X + index * OfficeScene.AGENT_SPACING;
          const targetY = OfficeScene.AGENT_START_Y;
          spriteData.sprite.setPosition(targetX, targetY);
          spriteData.desk.setPosition(targetX, targetY + 30);
        }
      }
    });
  }

  /**
   * Update talking connection lines between agents
   */
  private updateTalkingLines(): void {
    // Clear existing lines from old system
    this.talkingLines.forEach((line) => line.destroy());
    this.talkingLines = [];

    // Update talking lines using AgentSprite's built-in method
    this.agents.forEach((agent) => {
      const spriteData = this.agentSprites.get(agent.id);
      if (!spriteData) return;

      if (agent.talkingTo) {
        const targetAgent = this.agents.find((a) => a.id === agent.talkingTo);
        const targetSpriteData = targetAgent ? this.agentSprites.get(targetAgent.id) : null;

        if (targetSpriteData) {
          spriteData.sprite.drawTalkingLine(targetSpriteData.sprite);
        } else {
          spriteData.sprite.clearTalkingLine();
        }
      } else {
        spriteData.sprite.clearTalkingLine();
      }
    });
  }

  /**
   * Get the color for an agent status
   */
  private getStatusColor(status: AgentStatus): number {
    const colors: Record<AgentStatus, number> = {
      idle: 0x4ade80,
      working: 0xfbbf24,
      thinking: 0x60a5fa,
      talking: 0xc084fc,
      walking: 0x34d399,
    };
    return colors[status] ?? 0x8b8b8b;
  }

  // === Public API for external state management ===

  /**
   * Update the agents displayed in the scene
   */
  setAgents(agents: Agent[]): void {
    const previousAgentIds = new Set(this.agents.map((a) => a.id));
    const newAgentIds = new Set(agents.map((a) => a.id));

    // Remove sprites for agents that no longer exist
    previousAgentIds.forEach((id) => {
      if (!newAgentIds.has(id)) {
        this.removeAgentSprite(id);
      }
    });

    // Add sprites for new agents
    agents.forEach((agent, index) => {
      if (!previousAgentIds.has(agent.id)) {
        this.createAgentSprite(agent, index);
      }
    });

    this.agents = agents;
  }

  /**
   * Create a sprite for a new agent using AgentSprite class
   */
  private createAgentSprite(agent: Agent, index: number): void {
    const x = OfficeScene.AGENT_START_X + index * OfficeScene.AGENT_SPACING;
    const y = OfficeScene.AGENT_START_Y;

    // Create desk
    const desk = this.add.image(x, y + 30, "desk");

    // Create AgentSprite with positioned agent data
    const positionedAgent: Agent = {
      ...agent,
      position: { x, y },
    };

    const agentSprite = new AgentSprite(this, {
      agent: positionedAgent,
      onSelect: (agentId) => this.setSelectedAgent(agentId),
    });

    // Store sprite data
    this.agentSprites.set(agent.id, {
      sprite: agentSprite,
      desk,
    });
  }

  /**
   * Remove a sprite for an agent that no longer exists
   */
  private removeAgentSprite(agentId: string): void {
    const spriteData = this.agentSprites.get(agentId);
    if (spriteData) {
      spriteData.sprite.destroy();
      spriteData.desk.destroy();
      this.agentSprites.delete(agentId);
    }
  }

  /**
   * Set the currently selected agent
   */
  setSelectedAgent(agentId: string | null): void {
    this.selectedAgentId = agentId;
    this.config.onAgentSelect?.(agentId);
  }

  /**
   * Get the current config
   */
  getConfig(): OfficeSceneConfig {
    return this.config;
  }

  /**
   * Update the team ID and refresh the title
   */
  setTeamId(teamId: string): void {
    this.config.teamId = teamId;
    this.createTitle();
  }

  /**
   * Handle window resize
   */
  resize(width: number, height: number): void {
    this.cameras.main.setSize(width, height);
    this.drawFloorGrid();
  }

  /**
   * Clean up when scene is shut down
   */
  shutdown(): void {
    this.agentSprites.forEach((spriteData) => {
      spriteData.sprite.destroy();
      spriteData.desk.destroy();
    });
    this.agentSprites.clear();
    this.floorTiles.forEach((tile) => tile.destroy());
    this.floorTiles = [];
    this.talkingLines.forEach((line) => line.destroy());
    this.talkingLines = [];
  }

  /**
   * Get an AgentSprite by agent ID
   */
  getAgentSprite(agentId: string): AgentSprite | undefined {
    return this.agentSprites.get(agentId)?.sprite;
  }

  /**
   * Walk an agent to a target position
   */
  async walkAgentTo(agentId: string, targetX: number, targetY: number): Promise<void> {
    const spriteData = this.agentSprites.get(agentId);
    if (spriteData) {
      await spriteData.sprite.walkTo(targetX, targetY);
      // Update desk position after walk
      spriteData.desk.setPosition(targetX, targetY + 30);
    }
  }
}

export default OfficeScene;
