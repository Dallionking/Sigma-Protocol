import * as Phaser from "phaser";
import type { Agent, AgentStatus, Position } from "@/types/agent";

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
 * Configuration for AgentSprite initialization
 */
export interface AgentSpriteConfig {
  agent: Agent;
  onSelect?: (agentId: string) => void;
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

  // Animation constants
  private static readonly WALK_SPEED = 100; // pixels per second
  private static readonly WALK_BOB_AMPLITUDE = 2;
  private static readonly WALK_BOB_FREQUENCY = 8;

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
   * Walk to a target position with smooth animation
   *
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   * @returns Promise that resolves when walking is complete
   */
  walkTo(targetX: number, targetY: number): Promise<void> {
    return new Promise((resolve) => {
      // Cancel any existing walk
      if (this.walkTween) {
        this.walkTween.stop();
        this.walkTween = null;
      }

      // Calculate distance and duration
      const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      const duration = (distance / AgentSprite.WALK_SPEED) * 1000;

      if (distance < 5) {
        resolve();
        return;
      }

      // Set walking state
      this.isWalking = true;
      this.setStatus("walking");

      // Create walking tween
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
          this.isWalking = false;
          this.walkTween = null;
          this.sprite.setY(-12); // Reset bob
          resolve();
        },
      });
    });
  }

  /**
   * Update the walking bob animation
   */
  private updateWalkAnimation(): void {
    if (this.isWalking) {
      const time = this.scene.time.now;
      const bobOffset = Math.sin(time / 1000 * AgentSprite.WALK_BOB_FREQUENCY * Math.PI * 2) * AgentSprite.WALK_BOB_AMPLITUDE;
      this.sprite.setY(-12 + bobOffset);
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
   * Destroy the sprite and clean up resources
   */
  destroy(fromScene?: boolean): void {
    // Stop any running tweens
    if (this.walkTween) {
      this.walkTween.stop();
      this.walkTween = null;
    }

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
