import * as Phaser from "phaser";

/**
 * Style variants for thought bubbles
 */
export type BubbleStyle = "thinking" | "speaking";

/**
 * Configuration for ThoughtBubble initialization
 */
export interface ThoughtBubbleConfig {
  /** The style of the bubble - thinking (cloud) or speaking (speech) */
  style?: BubbleStyle;
  /** Maximum width of the bubble before wrapping */
  maxWidth?: number;
  /** Delay in ms before fade out starts after text completes */
  fadeDelay?: number;
  /** Duration in ms of the fade out animation */
  fadeDuration?: number;
  /** Callback when bubble fully fades out */
  onComplete?: () => void;
  /** Speed of text streaming in characters per second */
  textSpeed?: number;
}

/**
 * Default configuration values
 */
const DEFAULTS = {
  style: "thinking" as BubbleStyle,
  maxWidth: 200,
  fadeDelay: 3000,
  fadeDuration: 500,
  textSpeed: 30,
};

/**
 * ThoughtBubble - Comic-style thought/speech bubble for agent reasoning
 *
 * Features:
 * - Streams text character by character
 * - Auto-sizes based on content
 * - Fades out after completion
 * - Different styles for thinking (cloud) vs speaking (speech)
 * - Typing indicator dots animation
 *
 * @extends Phaser.GameObjects.Container
 */
export class ThoughtBubble extends Phaser.GameObjects.Container {
  // Configuration
  private config: Required<ThoughtBubbleConfig>;

  // Visual components
  private bubbleGraphics: Phaser.GameObjects.Graphics;
  private textObject: Phaser.GameObjects.Text;
  private typingIndicator: Phaser.GameObjects.Container | null = null;

  // State
  private fullText: string = "";
  private displayedChars: number = 0;
  private isStreaming: boolean = false;
  private streamTimer: Phaser.Time.TimerEvent | null = null;
  private fadeTimer: Phaser.Time.TimerEvent | null = null;
  private typingDots: Phaser.GameObjects.Arc[] = [];
  private typingTween: Phaser.Tweens.Tween | null = null;

  // Bubble dimensions
  private bubbleWidth: number = 0;
  private bubbleHeight: number = 0;
  private readonly PADDING = 12;
  private readonly MIN_WIDTH = 60;
  private readonly MIN_HEIGHT = 40;
  private readonly TAIL_SIZE = 12;

  constructor(scene: Phaser.Scene, x: number, y: number, config?: ThoughtBubbleConfig) {
    super(scene, x, y);

    // Merge config with defaults
    this.config = {
      style: config?.style ?? DEFAULTS.style,
      maxWidth: config?.maxWidth ?? DEFAULTS.maxWidth,
      fadeDelay: config?.fadeDelay ?? DEFAULTS.fadeDelay,
      fadeDuration: config?.fadeDuration ?? DEFAULTS.fadeDuration,
      textSpeed: config?.textSpeed ?? DEFAULTS.textSpeed,
      onComplete: config?.onComplete ?? (() => {}),
    };

    // Create visual components
    this.bubbleGraphics = scene.add.graphics();
    this.textObject = this.createTextObject();

    // Add to container
    this.add([this.bubbleGraphics, this.textObject]);

    // Initially hidden
    this.setVisible(false);
    this.setAlpha(0);

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create the text object for displaying bubble content
   */
  private createTextObject(): Phaser.GameObjects.Text {
    const text = this.scene.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#1a1a2e",
      wordWrap: { width: this.config.maxWidth - this.PADDING * 2 },
      lineSpacing: 4,
    });
    text.setOrigin(0.5, 0.5);
    return text;
  }

  /**
   * Show the thought bubble with streaming text
   *
   * @param text - The full text to display
   * @returns This bubble for chaining
   */
  show(text: string): this {
    // Cancel any existing animations
    this.cancelAnimations();

    // Store full text
    this.fullText = text;
    this.displayedChars = 0;
    this.isStreaming = true;

    // Reset visibility
    this.setVisible(true);
    this.setAlpha(1);

    // Show typing indicator first
    this.showTypingIndicator();

    // Start streaming after brief typing indicator delay
    this.scene.time.delayedCall(500, () => {
      this.hideTypingIndicator();
      this.startTextStreaming();
    });

    return this;
  }

  /**
   * Show the typing indicator dots animation
   */
  private showTypingIndicator(): void {
    // Create typing indicator container
    this.typingIndicator = this.scene.add.container(0, 0);

    // Create three dots
    const dotSpacing = 10;
    const dotRadius = 3;
    this.typingDots = [];

    for (let i = 0; i < 3; i++) {
      const dot = this.scene.add.circle(
        (i - 1) * dotSpacing,
        0,
        dotRadius,
        0x60a5fa, // Thinking blue
        1
      );
      this.typingDots.push(dot);
      this.typingIndicator.add(dot);
    }

    this.add(this.typingIndicator);

    // Animate dots with bounce effect
    this.typingTween = this.scene.tweens.add({
      targets: this.typingDots,
      y: -5,
      duration: 300,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
      delay: (target: Phaser.GameObjects.Arc, key: string, value: unknown, index: number) => index * 100,
    });

    // Draw minimal bubble for typing indicator
    this.drawBubble(50, 30);
  }

  /**
   * Hide the typing indicator
   */
  private hideTypingIndicator(): void {
    if (this.typingTween) {
      this.typingTween.stop();
      this.typingTween = null;
    }

    if (this.typingIndicator) {
      this.typingIndicator.destroy();
      this.typingIndicator = null;
    }

    this.typingDots = [];
  }

  /**
   * Start streaming text character by character
   */
  private startTextStreaming(): void {
    // Calculate final bubble size
    this.textObject.setText(this.fullText);
    const textBounds = this.textObject.getBounds();
    this.bubbleWidth = Math.max(this.MIN_WIDTH, textBounds.width + this.PADDING * 2);
    this.bubbleHeight = Math.max(this.MIN_HEIGHT, textBounds.height + this.PADDING * 2);

    // Reset text for streaming
    this.textObject.setText("");
    this.displayedChars = 0;

    // Draw bubble at final size
    this.drawBubble(this.bubbleWidth, this.bubbleHeight);

    // Calculate interval between characters
    const intervalMs = 1000 / this.config.textSpeed;

    // Stream characters
    this.streamTimer = this.scene.time.addEvent({
      delay: intervalMs,
      callback: this.streamNextChar,
      callbackScope: this,
      repeat: this.fullText.length - 1,
    });
  }

  /**
   * Stream the next character
   */
  private streamNextChar(): void {
    if (this.displayedChars < this.fullText.length) {
      this.displayedChars++;
      this.textObject.setText(this.fullText.substring(0, this.displayedChars));

      // Check if streaming complete
      if (this.displayedChars >= this.fullText.length) {
        this.onStreamComplete();
      }
    }
  }

  /**
   * Called when text streaming is complete
   */
  private onStreamComplete(): void {
    this.isStreaming = false;
    this.streamTimer = null;

    // Start fade timer
    this.fadeTimer = this.scene.time.delayedCall(this.config.fadeDelay, () => {
      this.fadeOut();
    });
  }

  /**
   * Fade out the bubble
   */
  private fadeOut(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: this.config.fadeDuration,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.setVisible(false);
        this.config.onComplete();
      },
    });
  }

  /**
   * Draw the bubble background based on style
   *
   * @param width - Bubble width
   * @param height - Bubble height
   */
  private drawBubble(width: number, height: number): void {
    this.bubbleGraphics.clear();

    if (this.config.style === "thinking") {
      this.drawThinkingBubble(width, height);
    } else {
      this.drawSpeechBubble(width, height);
    }
  }

  /**
   * Draw a cloud-style thinking bubble
   */
  private drawThinkingBubble(width: number, height: number): void {
    const graphics = this.bubbleGraphics;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Main bubble with cloud-like rounded shape
    graphics.fillStyle(0xffffff, 0.95);
    graphics.lineStyle(2, 0x60a5fa, 1);

    // Draw rounded rectangle for main bubble
    graphics.fillRoundedRect(-halfWidth, -halfHeight, width, height, 12);
    graphics.strokeRoundedRect(-halfWidth, -halfHeight, width, height, 12);

    // Draw cloud poofs (small circles at the bottom-left for thinking trail)
    const poofCount = 3;
    const poofStartX = -halfWidth + 10;
    const poofStartY = halfHeight + 5;

    for (let i = 0; i < poofCount; i++) {
      const poofSize = 6 - i * 1.5;
      const offsetX = i * -8;
      const offsetY = i * 8;

      graphics.fillStyle(0xffffff, 0.95);
      graphics.fillCircle(poofStartX + offsetX, poofStartY + offsetY, poofSize);
      graphics.lineStyle(2, 0x60a5fa, 1);
      graphics.strokeCircle(poofStartX + offsetX, poofStartY + offsetY, poofSize);
    }
  }

  /**
   * Draw a speech bubble with tail
   */
  private drawSpeechBubble(width: number, height: number): void {
    const graphics = this.bubbleGraphics;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Main bubble fill
    graphics.fillStyle(0xffffff, 0.95);
    graphics.lineStyle(2, 0xc084fc, 1);

    // Draw rounded rectangle
    graphics.fillRoundedRect(-halfWidth, -halfHeight, width, height, 8);
    graphics.strokeRoundedRect(-halfWidth, -halfHeight, width, height, 8);

    // Draw speech tail (pointing down-left)
    const tailX = -halfWidth + 15;
    const tailY = halfHeight;

    graphics.fillStyle(0xffffff, 0.95);
    graphics.beginPath();
    graphics.moveTo(tailX, tailY - 2);
    graphics.lineTo(tailX - this.TAIL_SIZE, tailY + this.TAIL_SIZE);
    graphics.lineTo(tailX + this.TAIL_SIZE, tailY - 2);
    graphics.closePath();
    graphics.fillPath();

    // Stroke tail
    graphics.lineStyle(2, 0xc084fc, 1);
    graphics.beginPath();
    graphics.moveTo(tailX, tailY);
    graphics.lineTo(tailX - this.TAIL_SIZE, tailY + this.TAIL_SIZE);
    graphics.lineTo(tailX + this.TAIL_SIZE, tailY);
    graphics.strokePath();
  }

  /**
   * Set the bubble style
   *
   * @param style - "thinking" or "speaking"
   */
  setStyle(style: BubbleStyle): this {
    this.config.style = style;

    // Redraw if visible
    if (this.visible && this.bubbleWidth > 0) {
      this.drawBubble(this.bubbleWidth, this.bubbleHeight);
    }

    return this;
  }

  /**
   * Get the current style
   */
  getStyle(): BubbleStyle {
    return this.config.style;
  }

  /**
   * Check if currently streaming text
   */
  getIsStreaming(): boolean {
    return this.isStreaming;
  }

  /**
   * Cancel all running animations and timers
   */
  private cancelAnimations(): void {
    // Cancel stream timer
    if (this.streamTimer) {
      this.streamTimer.remove();
      this.streamTimer = null;
    }

    // Cancel fade timer
    if (this.fadeTimer) {
      this.fadeTimer.remove();
      this.fadeTimer = null;
    }

    // Hide typing indicator
    this.hideTypingIndicator();

    // Stop any tweens
    this.scene.tweens.killTweensOf(this);

    this.isStreaming = false;
  }

  /**
   * Hide the bubble immediately
   */
  hide(): this {
    this.cancelAnimations();
    this.setVisible(false);
    this.setAlpha(0);
    this.textObject.setText("");
    this.fullText = "";
    this.displayedChars = 0;
    this.bubbleGraphics.clear();
    return this;
  }

  /**
   * Set the text speed
   *
   * @param speed - Characters per second
   */
  setTextSpeed(speed: number): this {
    this.config.textSpeed = speed;
    return this;
  }

  /**
   * Set the fade delay
   *
   * @param delay - Delay in milliseconds before fade starts
   */
  setFadeDelay(delay: number): this {
    this.config.fadeDelay = delay;
    return this;
  }

  /**
   * Destroy the bubble and clean up resources
   */
  destroy(fromScene?: boolean): void {
    this.cancelAnimations();

    // Clean up components
    if (this.bubbleGraphics) {
      this.bubbleGraphics.destroy();
    }

    if (this.textObject) {
      this.textObject.destroy();
    }

    super.destroy(fromScene);
  }
}

export default ThoughtBubble;
