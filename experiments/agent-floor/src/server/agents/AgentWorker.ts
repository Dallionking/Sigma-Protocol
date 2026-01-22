/**
 * AgentWorker - Individual agent worker with autonomous work loop
 *
 * Implements the agent work loop pattern:
 * 1. Check messages (respond to @mentions)
 * 2. Check tasks (process assigned work)
 * 3. Idle (wait for new work)
 *
 * Responsibilities:
 * - Periodic tick execution with proper work loop order
 * - Message queue processing and @mention responses
 * - Task processing via LLM provider
 * - State transitions (idle → thinking → working → talking)
 * - Real-time status updates via callbacks
 * - Graceful error handling with recovery
 */

import type {
  AgentStatus,
  AgentRole,
  PersonalityTrait,
  CommunicationStyle,
  AgentMood,
} from "@/types/agent";
import type { LLMProvider, Message, Completion } from "@/types/provider";
import type {
  AgentWorkerConfig,
  TaskAssignmentPayload,
  AgentStateTransition,
  AgentWorkContext,
} from "./types";
import { isValidTransition } from "./types";

/** Default tick interval in milliseconds */
const DEFAULT_TICK_INTERVAL_MS = 5000;

/** Maximum messages to process per tick */
const MAX_MESSAGES_PER_TICK = 5;

/** Maximum retries for LLM errors */
const MAX_LLM_RETRIES = 3;

/** Retry delay base in ms (exponential backoff) */
const RETRY_DELAY_BASE_MS = 1000;

/** Callback type for state change notifications */
export type StateChangeCallback = (transition: AgentStateTransition) => void;

/** Callback type for sending messages to the room */
export type SendMessageCallback = (
  agentId: string,
  content: string,
  targetAgentId?: string
) => void;

/** Message in the agent's inbox */
export interface AgentMessage {
  id: string;
  from: string;
  content: string;
  type: "mention" | "direct" | "broadcast" | "task";
  timestamp: number;
  processed: boolean;
}

/** Extended configuration for AgentWorker */
export interface ExtendedAgentWorkerConfig extends AgentWorkerConfig {
  name?: string;
  role?: AgentRole;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  // Personality & mood (PRD-019)
  personalitySociability?: PersonalityTrait;
  personalityCommunication?: CommunicationStyle;
  mood?: AgentMood;
  fatigueLevel?: number;
}

export class AgentWorker {
  private readonly agentId: string;
  private readonly tickIntervalMs: number;

  // Agent identity (set via setContext)
  private name: string = "";
  private role: AgentRole = "project-manager";
  private systemPrompt: string = "";
  private providerName: string = "";
  private modelName: string = "";

  // Personality & mood (PRD-019)
  private personalitySociability: PersonalityTrait = "extrovert";
  private personalityCommunication: CommunicationStyle = "casual";
  private mood: AgentMood = "happy";
  private fatigueLevel: number = 100;

  // Work loop state
  private running = false;
  private loopTimer: NodeJS.Timeout | null = null;
  private currentState: AgentStatus = "idle";
  private currentTask: TaskAssignmentPayload | null = null;
  private talkingTo: string | null = null;

  // Message queue for incoming messages
  private messageQueue: AgentMessage[] = [];
  private processedMessageIds: Set<string> = new Set();

  // LLM provider for task processing
  private llmProvider: LLMProvider | null = null;

  // Callbacks
  private onStateChange: StateChangeCallback | null = null;
  private onSendMessage: SendMessageCallback | null = null;

  // Error tracking
  private consecutiveErrors = 0;
  private lastErrorTime: number | null = null;

  constructor(config: ExtendedAgentWorkerConfig) {
    this.agentId = config.agentId;
    this.tickIntervalMs = config.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS;

    // Set optional config values
    if (config.name) this.name = config.name;
    if (config.role) this.role = config.role;
    if (config.systemPrompt) this.systemPrompt = config.systemPrompt;
    if (config.provider) this.providerName = config.provider;
    if (config.model) this.modelName = config.model;

    // Personality & mood (PRD-019)
    if (config.personalitySociability) this.personalitySociability = config.personalitySociability;
    if (config.personalityCommunication) this.personalityCommunication = config.personalityCommunication;
    if (config.mood) this.mood = config.mood;
    if (config.fatigueLevel !== undefined) this.fatigueLevel = config.fatigueLevel;
  }

  // ==========================================================================
  // Public Getters
  // ==========================================================================

  getAgentId(): string {
    return this.agentId;
  }

  getState(): AgentStatus {
    return this.currentState;
  }

  isRunning(): boolean {
    return this.running;
  }

  getCurrentTask(): TaskAssignmentPayload | null {
    return this.currentTask;
  }

  getTalkingTo(): string | null {
    return this.talkingTo;
  }

  getMessageQueueLength(): number {
    return this.messageQueue.filter((m) => !m.processed).length;
  }

  getContext(): AgentWorkContext & {
    personalitySociability: PersonalityTrait;
    personalityCommunication: CommunicationStyle;
    mood: AgentMood;
    fatigueLevel: number;
  } {
    return {
      agentId: this.agentId,
      name: this.name,
      role: this.role,
      systemPrompt: this.systemPrompt,
      provider: this.providerName,
      model: this.modelName,
      currentTask: this.currentTask,
      talkingTo: this.talkingTo,
      // Personality & mood (PRD-019)
      personalitySociability: this.personalitySociability,
      personalityCommunication: this.personalityCommunication,
      mood: this.mood,
      fatigueLevel: this.fatigueLevel,
    };
  }

  // ==========================================================================
  // Configuration Methods
  // ==========================================================================

  /**
   * Set the agent's context (identity, role, prompts)
   */
  setContext(context: Partial<AgentWorkContext>): void {
    if (context.name) this.name = context.name;
    if (context.role) this.role = context.role;
    if (context.systemPrompt) this.systemPrompt = context.systemPrompt;
    if (context.provider) this.providerName = context.provider;
    if (context.model) this.modelName = context.model;
  }

  /**
   * Set callback for state change notifications
   */
  setStateChangeCallback(callback: StateChangeCallback): void {
    this.onStateChange = callback;
  }

  /**
   * Set callback for sending messages to the room
   */
  setSendMessageCallback(callback: SendMessageCallback): void {
    this.onSendMessage = callback;
  }

  /**
   * Set the LLM provider for task processing
   */
  setLLMProvider(provider: LLMProvider): void {
    this.llmProvider = provider;
    console.log(
      `🤖 AgentWorker ${this.agentId}: LLM provider set to ${provider.name}`
    );
  }

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  /**
   * Start the agent work loop
   */
  start(): void {
    if (this.running) {
      console.warn(`AgentWorker ${this.agentId} is already running`);
      return;
    }

    this.running = true;
    this.consecutiveErrors = 0;
    console.log(`🚀 AgentWorker ${this.agentId} (${this.name || "unnamed"}) started`);

    // Execute first tick immediately
    this.tick();

    // Schedule periodic ticks
    this.loopTimer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  /**
   * Stop the agent work loop gracefully
   */
  stop(): void {
    if (!this.running) {
      console.warn(`AgentWorker ${this.agentId} is not running`);
      return;
    }

    this.running = false;

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    // Transition to idle on stop
    if (this.currentState !== "idle") {
      this.transitionTo("idle", "Worker stopped");
    }

    console.log(`🛑 AgentWorker ${this.agentId} (${this.name || "unnamed"}) stopped`);
  }

  // ==========================================================================
  // Task Management
  // ==========================================================================

  /**
   * Assign a task to this agent
   */
  assignTask(task: TaskAssignmentPayload): void {
    this.currentTask = task;
    console.log(
      `📋 AgentWorker ${this.agentId} assigned task: ${task.title}`
    );

    // Trigger thinking state when task is assigned
    if (this.currentState === "idle") {
      this.transitionTo("thinking", `New task assigned: ${task.title}`);
    }
  }

  /**
   * Clear the current task (task completed or cancelled)
   */
  clearTask(): void {
    const taskTitle = this.currentTask?.title;
    this.currentTask = null;

    if (taskTitle) {
      console.log(`✅ AgentWorker ${this.agentId} completed task: ${taskTitle}`);
    }

    // Return to idle if not talking
    if (this.currentState === "working") {
      this.transitionTo("idle", "Task completed");
    }
  }

  // ==========================================================================
  // Message Management
  // ==========================================================================

  /**
   * Add a message to the agent's inbox
   */
  enqueueMessage(message: Omit<AgentMessage, "processed">): void {
    // Skip if already processed
    if (this.processedMessageIds.has(message.id)) {
      return;
    }

    this.messageQueue.push({
      ...message,
      processed: false,
    });

    console.log(
      `📬 AgentWorker ${this.agentId} received message from ${message.from}: ${message.content.slice(0, 50)}...`
    );

    // If idle, start thinking about the message
    if (this.currentState === "idle") {
      this.transitionTo("thinking", "New message received");
    }
  }

  /**
   * Check if agent has unprocessed messages
   */
  hasUnprocessedMessages(): boolean {
    return this.messageQueue.some((m) => !m.processed);
  }

  /**
   * Get next unprocessed message
   */
  private getNextMessage(): AgentMessage | null {
    return this.messageQueue.find((m) => !m.processed) ?? null;
  }

  /**
   * Mark a message as processed
   */
  private markMessageProcessed(messageId: string): void {
    const message = this.messageQueue.find((m) => m.id === messageId);
    if (message) {
      message.processed = true;
      this.processedMessageIds.add(messageId);
    }
  }

  // ==========================================================================
  // Conversation Management
  // ==========================================================================

  /**
   * Start talking to another agent
   */
  startTalking(targetAgentId: string): void {
    this.talkingTo = targetAgentId;
    this.transitionTo("talking", `Talking to ${targetAgentId}`);
  }

  /**
   * Stop talking
   */
  stopTalking(): void {
    const wasTalkingTo = this.talkingTo;
    this.talkingTo = null;

    if (wasTalkingTo) {
      console.log(
        `💬 AgentWorker ${this.agentId} finished talking to ${wasTalkingTo}`
      );
    }

    // Return to thinking if has task or messages, otherwise idle
    if (this.currentTask || this.hasUnprocessedMessages()) {
      this.transitionTo("thinking", "Finished conversation, resuming work");
    } else {
      this.transitionTo("idle", "Finished conversation");
    }
  }

  /**
   * Force transition to a specific state (for external control)
   */
  forceState(state: AgentStatus, reason?: string): void {
    this.transitionTo(state, reason ?? "Forced state change");
  }

  // ==========================================================================
  // Personality-Aware Prompt Generation (PRD-019)
  // ==========================================================================

  /**
   * Build a personality-aware system prompt that incorporates:
   * - Base system prompt (role, responsibilities)
   * - Personality traits (introvert/extrovert, formal/casual)
   * - Current mood (happy, stressed, focused, tired)
   * - Fatigue level (affects response verbosity)
   */
  private buildPersonalityAwareSystemPrompt(): string {
    const basePrompt = this.systemPrompt || `You are ${this.name}, a ${this.role}.`;

    // Personality modifiers based on traits
    const personalityInstructions: string[] = [];

    // Sociability affects communication frequency and depth
    if (this.personalitySociability === "introvert") {
      personalityInstructions.push(
        "You prefer to think deeply before responding. Keep responses concise and thoughtful. You're more comfortable with written communication than spontaneous discussion."
      );
    } else {
      personalityInstructions.push(
        "You're naturally outgoing and enjoy collaboration. You engage actively in discussions and aren't afraid to share ideas early. You build rapport easily with team members."
      );
    }

    // Communication style affects tone and formality
    if (this.personalityCommunication === "formal") {
      personalityInstructions.push(
        "Maintain a professional, formal tone. Use proper grammar and avoid slang. Structure your responses clearly with proper punctuation."
      );
    } else {
      personalityInstructions.push(
        "Keep your tone friendly and approachable. It's okay to use casual language and even appropriate humor when it fits the situation."
      );
    }

    // Mood affects response style and energy
    const moodInstructions = this.getMoodInstructions();
    if (moodInstructions) {
      personalityInstructions.push(moodInstructions);
    }

    // Fatigue affects response length and detail
    const fatigueInstructions = this.getFatigueInstructions();
    if (fatigueInstructions) {
      personalityInstructions.push(fatigueInstructions);
    }

    // Combine all instructions
    if (personalityInstructions.length === 0) {
      return basePrompt;
    }

    return `${basePrompt}

PERSONALITY & CURRENT STATE:
${personalityInstructions.map(i => `- ${i}`).join("\n")}`;
  }

  /**
   * Get mood-specific instructions for the system prompt
   */
  private getMoodInstructions(): string | null {
    switch (this.mood) {
      case "happy":
        return "You're in a positive mood today. Approach tasks with enthusiasm and be encouraging to teammates.";
      case "stressed":
        return "You're feeling a bit stressed. Focus on the essentials and be direct. It's okay to ask for help if needed.";
      case "focused":
        return "You're in a deep focus state. Provide detailed, thorough responses but don't get sidetracked by tangents.";
      case "tired":
        return "You're feeling tired. Keep responses brief and to the point. Prioritize the most important information.";
      default:
        return null;
    }
  }

  /**
   * Get fatigue-specific instructions for the system prompt
   */
  private getFatigueInstructions(): string | null {
    if (this.fatigueLevel >= 80) {
      return null; // Well-rested, no modification needed
    } else if (this.fatigueLevel >= 50) {
      return "Energy level is moderate. Balance thoroughness with efficiency.";
    } else if (this.fatigueLevel >= 20) {
      return "Energy is running low. Focus only on what's essential. Consider suggesting a break if appropriate.";
    } else {
      return "Energy is very low. Provide minimal but accurate responses. A break is strongly recommended.";
    }
  }

  /**
   * Update the agent's mood
   */
  setMood(mood: AgentMood): void {
    this.mood = mood;
    console.log(`🎭 AgentWorker ${this.agentId} mood changed to: ${mood}`);
  }

  /**
   * Get the agent's current mood
   */
  getMood(): AgentMood {
    return this.mood;
  }

  /**
   * Update the agent's fatigue level
   */
  setFatigueLevel(level: number): void {
    this.fatigueLevel = Math.max(0, Math.min(100, level));
    console.log(`⚡ AgentWorker ${this.agentId} fatigue level: ${this.fatigueLevel}`);
  }

  /**
   * Get the agent's fatigue level
   */
  getFatigueLevel(): number {
    return this.fatigueLevel;
  }

  /**
   * Decrease fatigue (after completing work)
   */
  decreaseFatigue(amount: number = 10): void {
    this.setFatigueLevel(this.fatigueLevel - amount);
  }

  /**
   * Increase fatigue (after rest/break)
   */
  increaseFatigue(amount: number = 20): void {
    this.setFatigueLevel(this.fatigueLevel + amount);
  }

  // ==========================================================================
  // Work Loop Implementation
  // ==========================================================================

  /**
   * Execute a single tick of the work loop
   * Order: Check messages → Check tasks → Idle
   */
  private async tick(): Promise<void> {
    if (!this.running) return;

    try {
      await this.executeTick();
      // Reset error counter on successful tick
      this.consecutiveErrors = 0;
    } catch (error) {
      await this.handleTickError(error);
    }
  }

  /**
   * Core tick logic - autonomous work loop
   * Priority: Messages > Tasks > Idle
   */
  private async executeTick(): Promise<void> {
    // Step 1: Check messages (highest priority)
    if (this.hasUnprocessedMessages()) {
      await this.processMessages();
      return;
    }

    // Step 2: Check tasks
    if (this.currentTask) {
      await this.processTask();
      return;
    }

    // Step 3: Idle
    await this.processIdle();
  }

  /**
   * Process incoming messages
   */
  private async processMessages(): Promise<void> {
    let messagesProcessed = 0;

    while (
      this.hasUnprocessedMessages() &&
      messagesProcessed < MAX_MESSAGES_PER_TICK
    ) {
      const message = this.getNextMessage();
      if (!message) break;

      // Update state to thinking while processing
      if (this.currentState !== "thinking" && this.currentState !== "talking") {
        this.transitionTo("thinking", `Processing message from ${message.from}`);
      }

      try {
        await this.handleMessage(message);
        this.markMessageProcessed(message.id);
        messagesProcessed++;
      } catch (error) {
        console.error(
          `AgentWorker ${this.agentId} error processing message:`,
          error
        );
        // Mark as processed to avoid infinite loop, but log the error
        this.markMessageProcessed(message.id);
      }
    }

    // If done with messages and no task, go idle
    if (!this.hasUnprocessedMessages() && !this.currentTask) {
      this.transitionTo("idle", "Messages processed, no tasks");
    }
  }

  /**
   * Handle a single message
   */
  private async handleMessage(message: AgentMessage): Promise<void> {
    console.log(
      `🔄 AgentWorker ${this.agentId} handling ${message.type} from ${message.from}`
    );

    switch (message.type) {
      case "mention":
        await this.handleMention(message);
        break;
      case "direct":
        await this.handleDirectMessage(message);
        break;
      case "task":
        // Task messages are handled through assignTask
        console.log(`📋 AgentWorker ${this.agentId} received task message`);
        break;
      case "broadcast":
        // Broadcasts are informational, just acknowledge
        console.log(`📢 AgentWorker ${this.agentId} acknowledged broadcast`);
        break;
    }
  }

  /**
   * Handle @mention - respond via LLM
   * Uses personality-aware system prompt (PRD-019)
   */
  private async handleMention(message: AgentMessage): Promise<void> {
    if (!this.llmProvider) {
      console.warn(
        `AgentWorker ${this.agentId}: No LLM provider, cannot respond to mention`
      );
      // Send a fallback response
      this.sendResponse(
        `I received your message, but I'm not configured to respond yet.`,
        message.from
      );
      return;
    }

    // Build personality-aware prompt for LLM (PRD-019)
    const personalityAwarePrompt = this.buildPersonalityAwareSystemPrompt();

    const messages: Message[] = [
      {
        role: "system",
        content: personalityAwarePrompt,
      },
      {
        role: "user",
        content: `${message.from} said: ${message.content}`,
        name: message.from,
      },
    ];

    // Get LLM response with retries
    const response = await this.callLLMWithRetry(messages);

    if (response) {
      this.sendResponse(response.content, message.from);
      // Start talking state if responding to another agent
      if (message.from !== "user" && message.from !== "system") {
        this.startTalking(message.from);
      }

      // Decrease fatigue after responding (PRD-019)
      this.decreaseFatigue(5);
    }
  }

  /**
   * Handle direct message from another agent
   */
  private async handleDirectMessage(message: AgentMessage): Promise<void> {
    // Similar to mention handling
    await this.handleMention(message);
  }

  /**
   * Process the current task
   * Uses personality-aware system prompt (PRD-019)
   */
  private async processTask(): Promise<void> {
    if (!this.currentTask) return;

    // Transition to working state
    if (this.currentState !== "working") {
      this.transitionTo("working", `Working on: ${this.currentTask.title}`);
    }

    // Check if LLM provider is available
    if (!this.llmProvider) {
      console.log(
        `AgentWorker ${this.agentId}: No LLM provider, simulating work on "${this.currentTask.title}"`
      );
      // Stay in working state - task will be completed externally
      return;
    }

    // Build personality-aware task prompt (PRD-019)
    const personalityAwarePrompt = this.buildPersonalityAwareSystemPrompt();

    const messages: Message[] = [
      {
        role: "system",
        content: `${personalityAwarePrompt}\n\nComplete the assigned task thoroughly.`,
      },
      {
        role: "user",
        content: `Task: ${this.currentTask.title}\n\nDescription: ${this.currentTask.description}\n\nPriority: ${this.currentTask.priority}\n\nProvide a detailed response to complete this task.`,
      },
    ];

    // Process task with LLM
    const response = await this.callLLMWithRetry(messages);

    if (response) {
      console.log(
        `✨ AgentWorker ${this.agentId} completed task "${this.currentTask.title}"`
      );

      // Send completion message
      this.sendResponse(
        `Completed task "${this.currentTask.title}":\n\n${response.content}`,
        "broadcast"
      );

      // Decrease fatigue after completing task (PRD-019)
      this.decreaseFatigue(15);

      // Task completion will be handled by AgentManager
      // For now, stay in working state until clearTask() is called
    }
  }

  /**
   * Process idle state
   */
  private async processIdle(): Promise<void> {
    // Ensure we're in idle state
    if (this.currentState !== "idle") {
      this.transitionTo("idle", "No pending work");
    }

    // Could add proactive behaviors here in the future:
    // - Check for unassigned tasks
    // - Offer help to busy agents
    // - Self-reflect on completed work
  }

  // ==========================================================================
  // LLM Integration
  // ==========================================================================

  /**
   * Call LLM with exponential backoff retry
   */
  private async callLLMWithRetry(
    messages: Message[]
  ): Promise<Completion | null> {
    if (!this.llmProvider) return null;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_LLM_RETRIES; attempt++) {
      try {
        // Check if provider is available
        const available = await this.llmProvider.isAvailable();
        if (!available) {
          throw new Error(`LLM provider ${this.llmProvider.name} is not available`);
        }

        // Make the completion request
        const completion = await this.llmProvider.complete(messages, {
          model: this.modelName || undefined,
          maxTokens: 1024,
        });

        return completion;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `AgentWorker ${this.agentId} LLM attempt ${attempt + 1} failed:`,
          lastError.message
        );

        // Wait before retry (exponential backoff)
        if (attempt < MAX_LLM_RETRIES - 1) {
          const delay = RETRY_DELAY_BASE_MS * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    console.error(
      `AgentWorker ${this.agentId} LLM failed after ${MAX_LLM_RETRIES} retries:`,
      lastError
    );
    return null;
  }

  /**
   * Send a response message
   */
  private sendResponse(content: string, target?: string): void {
    if (this.onSendMessage) {
      this.onSendMessage(this.agentId, content, target);
    } else {
      console.log(`📤 AgentWorker ${this.agentId} (no callback): ${content}`);
    }
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  /**
   * Handle errors during tick execution
   */
  private async handleTickError(error: unknown): Promise<void> {
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();

    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `AgentWorker ${this.agentId} tick error (${this.consecutiveErrors}/${MAX_LLM_RETRIES}):`,
      errorMessage
    );

    // Implement circuit breaker pattern
    if (this.consecutiveErrors >= MAX_LLM_RETRIES) {
      console.error(
        `AgentWorker ${this.agentId}: Too many consecutive errors, entering recovery mode`
      );

      // Transition to idle to prevent further errors
      this.transitionTo("idle", "Error recovery");

      // Increase tick interval temporarily (backoff)
      if (this.loopTimer) {
        clearInterval(this.loopTimer);
        const backoffInterval = this.tickIntervalMs * 2;
        this.loopTimer = setInterval(() => {
          this.tick();
        }, backoffInterval);

        console.log(
          `AgentWorker ${this.agentId}: Backing off to ${backoffInterval}ms tick interval`
        );
      }

      // Reset error counter after backoff
      this.consecutiveErrors = 0;
    }
  }

  // ==========================================================================
  // State Machine
  // ==========================================================================

  /**
   * Transition to a new state
   */
  private transitionTo(newState: AgentStatus, reason?: string): void {
    const oldState = this.currentState;

    // Skip if no change
    if (oldState === newState) return;

    // Validate transition
    if (!isValidTransition(oldState, newState)) {
      console.warn(
        `AgentWorker ${this.agentId}: Invalid transition ${oldState} → ${newState}`
      );
      return;
    }

    this.currentState = newState;

    const transition: AgentStateTransition = {
      agentId: this.agentId,
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      reason,
    };

    console.log(
      `🔄 AgentWorker ${this.agentId}: ${oldState} → ${newState}${reason ? ` (${reason})` : ""}`
    );

    // Notify listener (updates Colyseus state in real-time)
    if (this.onStateChange) {
      this.onStateChange(transition);
    }
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
