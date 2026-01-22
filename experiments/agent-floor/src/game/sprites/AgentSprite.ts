import * as Phaser from "phaser";
import type { Agent, AgentStatus, Position } from "@/types/agent";
import { Pathfinding, type WorldPoint, type PathResult } from "../utils/pathfinding";

/**
 * Walk direction for 4-direction animation
 */
export type WalkDirection = "up" | "down" | "left" | "right";

/**
 * Status color mapping for visual indicators
 */
const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: 0x4ade80,
  working: 0xfbbf24,
  thinking: 0x60a5fa,
  talking: 0xc084fc,
  walking: 0x34d399,
};

/**
 * Direction color tints for walk frames
 * These tints help visually distinguish directions without sprite sheets
 */
const DIRECTION_TINTS: Record<WalkDirection, number> = {
  down: 0xffffff,  // No tint - facing camera (default)
  up: 0xcccccc,    // Slightly darker - facing away
  left: 0xeeeeff,  // Slight blue tint - left side
  right: 0xffeee8, // Slight warm tint - right side
};

/**
 * Options for walkTo method
 */
export interface WalkToOptions {
  /** Called when the agent arrives at the destination */
  onArrival?: () => void;
  /** Called when the path cannot be found */
  onBlocked?: () => void;
  /** Agents to avoid (their positions will be marked as blocked) */
  avoidAgents?: AgentSprite[];
  /** Use direct movement instead of pathfinding (for short distances) */
  direct?: boolean;
}

/**
 * Configuration for AgentSprite initialization
 */
export interface AgentSpriteConfig {
  agent: Agent;
  onSelect?: (agentId: string) => void;
  /** Pathfinding instance for movement (required for walkTo with pathfinding) */
  pathfinder?: Pathfinding;
}

/**
 * AgentSprite - Phaser sprite class for agent characters
 *
 * A self-contained Container that manages:
 * - Agent visual representation (sprite, name label, status indicator)
 * - Walking animations with tweens
 * - Status updates with visual feedback
 * - Selection state with highlight ring
 * - Talking lines to other agents
 *
 * @extends Phaser.GameObjects.Container
 */
export class AgentSprite extends Phaser.GameObjects.Container {
  // Agent data
  private agentData: Agent;
  private config: AgentSpriteConfig;

  // Visual components
  private sprite: Phaser.GameObjects.Image;
  private nameLabel: Phaser.GameObjects.Text;
  private statusIndicator: Phaser.GameObjects.Arc;
  private selectionHighlight: Phaser.GameObjects.Graphics | null = null;
  private talkingLine: Phaser.GameObjects.Graphics | null = null;

  // State
  private isSelected: boolean = false;
  private isWalking: boolean = false;
  private walkTween: Phaser.Tweens.Tween | null = null;
  private currentDirection: WalkDirection = "down";
  private currentPath: WorldPoint[] = [];
  private currentPathIndex: number = 0;
  private walkAnimFrame: number = 0;
  private onArrivalCallback: (() => void) | null = null;

  // Coffee break state (PRD-019-002)
  private isResting: boolean = false;
  private restingTween: Phaser.Tweens.Tween | null = null;
  private coffeeIcon: Phaser.GameObjects.Text | null = null;

  // Animation constants
  private static readonly WALK_SPEED = 100; // pixels per second
  private static readonly WALK_BOB_AMPLITUDE = 2;
  private static readonly WALK_BOB_FREQUENCY = 8;
  private static readonly WALK_FRAME_DURATION = 150; // ms per walk animation frame

  constructor(scene: Phaser.Scene, config: AgentSpriteConfig) {
    const { agent } = config;
    super(scene, agent.position.x, agent.position.y);

    this.agentData = agent;
    this.config = config;

    // Create visual components
    this.sprite = this.createSprite();
    this.nameLabel = this.createNameLabel();
    this.statusIndicator = this.createStatusIndicator();

    // Add components to container
    this.add([this.sprite, this.nameLabel, this.statusIndicator]);

    // Set container size and make interactive
    this.setSize(48, 64);
    this.setInteractive({ useHandCursor: true });

    // Set up click handler
    this.on("pointerdown", this.handleClick, this);

    // Add hover effects
    this.on("pointerover", this.handlePointerOver, this);
    this.on("pointerout", this.handlePointerOut, this);

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create the main agent sprite
   */
  private createSprite(): Phaser.GameObjects.Image {
    const statusTexture = `agent-${this.agentData.status}`;
    const sprite = this.scene.add.image(0, -12, statusTexture);
    sprite.setScale(1.2);
    return sprite;
  }

  /**
   * Create the name label below the sprite
   */
  private createNameLabel(): Phaser.GameObjects.Text {
    const label = this.scene.add.text(0, 20, this.agentData.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#eaeaea",
      stroke: "#1a1a2e",
      strokeThickness: 2,
    });
    label.setOrigin(0.5);
    return label;
  }

  /**
   * Create the status indicator dot
   */
  private createStatusIndicator(): Phaser.GameObjects.Arc {
    const color = STATUS_COLORS[this.agentData.status];
    const indicator = this.scene.add.circle(14, -24, 5, color);
    indicator.setStrokeStyle(1, 0x1a1a2e);
    return indicator;
  }

  /**
   * Handle click on the agent sprite
   */
  private handleClick(): void {
    this.config.onSelect?.(this.agentData.id);
  }

  /**
   * Handle pointer over (hover) effect
   */
  private handlePointerOver(): void {
    if (!this.isSelected) {
      this.sprite.setTint(0xdddddd);
    }
  }

  /**
   * Handle pointer out effect
   */
  private handlePointerOut(): void {
    if (!this.isSelected) {
      this.sprite.clearTint();
    }
  }

  /**
   * Walk to a target position using pathfinding with smooth animation
   *
   * @param targetX - Target X coordinate (world pixels)
   * @param targetY - Target Y coordinate (world pixels)
   * @param options - Walk options including callbacks and collision avoidance
   * @returns Promise that resolves when walking is complete
   */
  async walkTo(targetX: number, targetY: number, options: WalkToOptions = {}): Promise<void> {
    const { onArrival, onBlocked, avoidAgents, direct } = options;

    // Cancel any existing walk
    this.stopWalking();

    // Calculate distance
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

    // Skip if already at destination
    if (distance < 5) {
      onArrival?.();
      return;
    }

    // Store callback for when we arrive
    this.onArrivalCallback = onArrival || null;

    // Set walking state
    this.isWalking = true;
    this.setStatus("walking");

    // Determine initial direction
    this.updateWalkDirection(targetX, targetY);

    // Use pathfinding if available and not direct mode
    const pathfinder = this.config.pathfinder;
    if (pathfinder && !direct) {
      // Mark other agents as obstacles to avoid
      if (avoidAgents && avoidAgents.length > 0) {
        for (const agent of avoidAgents) {
          if (agent !== this) {
            const gridPos = pathfinder.worldToGrid({ x: agent.x, y: agent.y });
            pathfinder.avoidPoint(gridPos.x, gridPos.y);
          }
        }
      }

      // Find path using A* pathfinding
      const pathResult = await pathfinder.findPath(
        { x: this.x, y: this.y },
        { x: targetX, y: targetY }
      );

      // Clear avoided points
      pathfinder.clearAvoidedPoints();

      if (!pathResult || pathResult.smoothedPath.length === 0) {
        // No path found - blocked
        this.isWalking = false;
        this.setStatus("idle");
        onBlocked?.();
        return;
      }

      // Use smoothed path for natural movement
      await this.walkAlongPath(pathResult.smoothedPath);
    } else {
      // Direct movement without pathfinding
      await this.walkDirect(targetX, targetY);
    }

    // Walking complete - trigger callback
    this.isWalking = false;
    this.sprite.setY(-12); // Reset bob
    this.sprite.clearTint(); // Clear direction tint
    this.currentDirection = "down";

    if (this.onArrivalCallback) {
      this.onArrivalCallback();
      this.onArrivalCallback = null;
    }
  }

  /**
   * Walk along a smoothed path with interpolation
   * @param path - Array of world coordinate points
   */
  private async walkAlongPath(path: WorldPoint[]): Promise<void> {
    if (path.length < 2) return;

    this.currentPath = path;
    this.currentPathIndex = 0;

    // Walk through each segment of the path
    for (let i = 1; i < path.length && this.isWalking; i++) {
      this.currentPathIndex = i;
      const target = path[i];

      // Update direction based on movement
      this.updateWalkDirection(target.x, target.y);

      // Tween to next point
      await this.tweenToPoint(target.x, target.y);
    }

    this.currentPath = [];
    this.currentPathIndex = 0;
  }

  /**
   * Walk directly to a point without pathfinding
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   */
  private async walkDirect(targetX: number, targetY: number): Promise<void> {
    await this.tweenToPoint(targetX, targetY);
  }

  /**
   * Tween to a single point with walking animation
   */
  private tweenToPoint(targetX: number, targetY: number): Promise<void> {
    return new Promise((resolve) => {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      const duration = (distance / AgentSprite.WALK_SPEED) * 1000;

      if (distance < 2) {
        resolve();
        return;
      }

      this.walkTween = this.scene.tweens.add({
        targets: this,
        x: targetX,
        y: targetY,
        duration: duration,
        ease: "Linear",
        onUpdate: () => {
          this.updateWalkAnimation();
        },
        onComplete: () => {
          this.walkTween = null;
          resolve();
        },
      });
    });
  }

  /**
   * Update walk direction based on movement vector
   */
  private updateWalkDirection(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    // Determine primary direction based on larger delta
    if (Math.abs(dx) > Math.abs(dy)) {
      this.currentDirection = dx > 0 ? "right" : "left";
    } else {
      this.currentDirection = dy > 0 ? "down" : "up";
    }

    // Apply direction-based tint
    this.sprite.setTint(DIRECTION_TINTS[this.currentDirection]);
  }

  /**
   * Stop the current walk and reset state
   */
  stopWalking(): void {
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = null;
    }

    if (this.isWalking) {
      this.isWalking = false;
      this.sprite.setY(-12);
      this.sprite.clearTint();
      this.currentPath = [];
      this.currentPathIndex = 0;
      this.onArrivalCallback = null;
    }
  }

  /**
   * Update the walking bob animation with direction-aware effects
   */
  private updateWalkAnimation(): void {
    if (!this.isWalking) return;

    const time = this.scene.time.now;

    // Calculate bob offset (up-down motion)
    const bobOffset = Math.sin(time / 1000 * AgentSprite.WALK_BOB_FREQUENCY * Math.PI * 2) * AgentSprite.WALK_BOB_AMPLITUDE;
    this.sprite.setY(-12 + bobOffset);

    // Calculate frame for walk animation (4 frames: 0, 1, 2, 1)
    const frameIndex = Math.floor(time / AgentSprite.WALK_FRAME_DURATION) % 4;
    this.walkAnimFrame = frameIndex === 3 ? 1 : frameIndex;

    // Apply slight horizontal sway for left/right walking
    if (this.currentDirection === "left" || this.currentDirection === "right") {
      const swayOffset = Math.sin(time / 1000 * AgentSprite.WALK_BOB_FREQUENCY * Math.PI) * 1;
      this.sprite.setX(swayOffset);
    } else {
      this.sprite.setX(0);
    }

    // Scale effect for up/down (perspective simulation)
    if (this.currentDirection === "up") {
      // Slightly smaller when walking away
      this.sprite.setScale(1.15);
    } else if (this.currentDirection === "down") {
      // Slightly larger when walking toward
      this.sprite.setScale(1.25);
    } else {
      this.sprite.setScale(1.2);
    }
  }

  /**
   * Set the agent's status with visual update
   *
   * @param status - New status to set
   */
  setStatus(status: AgentStatus): void {
    this.agentData.status = status;

    // Update sprite texture
    const statusTexture = `agent-${status}`;
    this.sprite.setTexture(statusTexture);

    // Update status indicator color
    const color = STATUS_COLORS[status];
    this.statusIndicator.setFillStyle(color);

    // Add pulse effect on status change
    this.scene.tweens.add({
      targets: this.statusIndicator,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  /**
   * Set the selection state
   *
   * @param selected - Whether the agent is selected
   */
  setSelected(selected: boolean): void {
    this.isSelected = selected;

    if (selected && !this.selectionHighlight) {
      // Create selection highlight ring
      this.selectionHighlight = this.scene.add.graphics();
      this.selectionHighlight.lineStyle(2, 0xe94560);
      this.selectionHighlight.strokeCircle(0, -12, 20);
      this.add(this.selectionHighlight);
      this.sendToBack(this.selectionHighlight);

      // Add pulse animation
      this.scene.tweens.add({
        targets: this.selectionHighlight,
        alpha: 0.5,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.sprite.setTint(0xffffff);
    } else if (!selected && this.selectionHighlight) {
      // Remove selection highlight
      this.selectionHighlight.destroy();
      this.selectionHighlight = null;
      this.sprite.clearTint();
    }
  }

  /**
   * Draw a talking line to another agent sprite
   *
   * @param targetSprite - Target AgentSprite to connect to, or null to clear
   */
  drawTalkingLine(targetSprite: AgentSprite | null): void {
    // Clear existing line
    if (this.talkingLine) {
      this.talkingLine.destroy();
      this.talkingLine = null;
    }

    if (!targetSprite) {
      return;
    }

    // Create new talking line (added to scene, not container, for correct positioning)
    this.talkingLine = this.scene.add.graphics();

    // Draw dashed line with gradient effect
    const startX = this.x;
    const startY = this.y - 12;
    const endX = targetSprite.x;
    const endY = targetSprite.y - 12;

    // Main line
    this.talkingLine.lineStyle(2, 0xc084fc, 0.6);
    this.talkingLine.lineBetween(startX, startY, endX, endY);

    // Add glow effect
    this.talkingLine.lineStyle(4, 0xc084fc, 0.2);
    this.talkingLine.lineBetween(startX, startY, endX, endY);

    // Add animated particles along the line (small dots)
    this.createTalkingParticles(startX, startY, endX, endY);
  }

  /**
   * Create animated particles along the talking line
   */
  private createTalkingParticles(startX: number, startY: number, endX: number, endY: number): void {
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.circle(startX, startY, 3, 0xc084fc, 0.8);

      // Animate particle along the line
      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        duration: 1500,
        delay: i * 500,
        repeat: -1,
        ease: "Linear",
        onUpdate: () => {
          // Fade based on position
          const progress = Phaser.Math.Distance.Between(startX, startY, particle.x, particle.y) /
            Phaser.Math.Distance.Between(startX, startY, endX, endY);
          particle.setAlpha(0.8 * (1 - Math.abs(progress - 0.5) * 2));
        },
      });

      // Store particle for cleanup (attach to line graphics)
      if (this.talkingLine) {
        (this.talkingLine as Phaser.GameObjects.Graphics & { particles?: Phaser.GameObjects.Arc[] }).particles =
          (this.talkingLine as Phaser.GameObjects.Graphics & { particles?: Phaser.GameObjects.Arc[] }).particles || [];
        (this.talkingLine as Phaser.GameObjects.Graphics & { particles?: Phaser.GameObjects.Arc[] }).particles!.push(particle);
      }
    }
  }

  /**
   * Update the talking line position (call in scene update)
   *
   * @param targetSprite - Target sprite to update line to
   */
  updateTalkingLine(targetSprite: AgentSprite | null): void {
    if (this.talkingLine && targetSprite) {
      // Redraw the line with updated positions
      this.drawTalkingLine(targetSprite);
    }
  }

  /**
   * Clear the talking line
   */
  clearTalkingLine(): void {
    if (this.talkingLine) {
      // Clean up particles
      const lineWithParticles = this.talkingLine as Phaser.GameObjects.Graphics & { particles?: Phaser.GameObjects.Arc[] };
      if (lineWithParticles.particles) {
        lineWithParticles.particles.forEach((p) => p.destroy());
      }

      this.talkingLine.destroy();
      this.talkingLine = null;
    }
  }

  /**
   * Get the agent data
   */
  getAgentData(): Agent {
    return this.agentData;
  }

  /**
   * Get the agent ID
   */
  getAgentId(): string {
    return this.agentData.id;
  }

  /**
   * Check if the agent is currently walking
   */
  getIsWalking(): boolean {
    return this.isWalking;
  }

  /**
   * Check if the agent is selected
   */
  getIsSelected(): boolean {
    return this.isSelected;
  }

  /**
   * Get the current walk direction
   */
  getCurrentDirection(): WalkDirection {
    return this.currentDirection;
  }

  /**
   * Get the current path being walked
   */
  getCurrentPath(): WorldPoint[] {
    return this.currentPath;
  }

  /**
   * Get the current position in the path
   */
  getCurrentPathIndex(): number {
    return this.currentPathIndex;
  }

  /**
   * Set the pathfinder instance (for deferred initialization)
   */
  setPathfinder(pathfinder: Pathfinding): void {
    this.config.pathfinder = pathfinder;
  }

  /**
   * Update agent data (position, status, etc.)
   *
   * @param agent - Updated agent data
   */
  updateAgentData(agent: Agent): void {
    const previousStatus = this.agentData.status;
    this.agentData = agent;

    // Update status if changed
    if (agent.status !== previousStatus) {
      this.setStatus(agent.status);
    }

    // Update name if changed
    if (this.nameLabel.text !== agent.name) {
      this.nameLabel.setText(agent.name);
    }
  }

  /**
   * Start the resting animation for coffee break (PRD-019-002)
   * Shows a coffee icon and gentle breathing animation
   */
  startResting(): void {
    if (this.isResting) return;

    this.isResting = true;
    this.setStatus("idle");

    // Create coffee icon above the agent
    this.coffeeIcon = this.scene.add.text(0, -40, "☕", {
      fontSize: "16px",
    });
    this.coffeeIcon.setOrigin(0.5);
    this.add(this.coffeeIcon);

    // Animate the coffee icon (floating up and down)
    this.scene.tweens.add({
      targets: this.coffeeIcon,
      y: -45,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Add gentle breathing animation to the sprite
    this.restingTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.22,
      scaleY: 1.18,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    console.log(`☕ AgentSprite ${this.agentData.id}: Started resting animation`);
  }

  /**
   * Stop the resting animation (PRD-019-002)
   */
  stopResting(): void {
    if (!this.isResting) return;

    this.isResting = false;

    // Remove coffee icon
    if (this.coffeeIcon) {
      this.scene.tweens.killTweensOf(this.coffeeIcon);
      this.coffeeIcon.destroy();
      this.coffeeIcon = null;
    }

    // Stop breathing animation
    if (this.restingTween) {
      this.restingTween.stop();
      this.restingTween = null;
    }

    // Reset sprite scale
    this.sprite.setScale(1.2);

    console.log(`☕ AgentSprite ${this.agentData.id}: Stopped resting animation`);
  }

  /**
   * Check if the agent is currently resting (PRD-019-002)
   */
  getIsResting(): boolean {
    return this.isResting;
  }

  /**
   * Destroy the sprite and clean up resources
   */
  destroy(fromScene?: boolean): void {
    // Stop any running walk
    this.stopWalking();

    // Stop resting animation
    this.stopResting();

    // Clear talking line
    this.clearTalkingLine();

    // Clear selection highlight
    if (this.selectionHighlight) {
      this.selectionHighlight.destroy();
      this.selectionHighlight = null;
    }

    // Remove event listeners
    this.off("pointerdown", this.handleClick, this);
    this.off("pointerover", this.handlePointerOver, this);
    this.off("pointerout", this.handlePointerOut, this);

    super.destroy(fromScene);
  }
}

export default AgentSprite;
