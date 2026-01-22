/**
 * AgentWorker - Per-agent work loop handler
 *
 * Manages the lifecycle of a single agent's work loop, including:
 * - Periodic tick execution
 * - State transitions (idle → thinking → working → talking)
 * - Task execution
 * - Graceful shutdown
 */

import type { AgentStatus } from "@/types/agent";
import type {
  AgentWorkerConfig,
  TaskAssignmentPayload,
  AgentStateTransition,
} from "./types";
import { isValidTransition } from "./types";

/** Default tick interval in milliseconds */
const DEFAULT_TICK_INTERVAL_MS = 5000;

/** Callback type for state change notifications */
export type StateChangeCallback = (transition: AgentStateTransition) => void;

/** Callback type for requesting LLM completion (placeholder for PRD-011/012) */
export type CompletionCallback = (
  agentId: string,
  prompt: string
) => Promise<string>;

export class AgentWorker {
  private readonly agentId: string;
  private readonly tickIntervalMs: number;

  private running = false;
  private loopTimer: NodeJS.Timeout | null = null;
  private currentState: AgentStatus = "idle";
  private currentTask: TaskAssignmentPayload | null = null;
  private talkingTo: string | null = null;

  private onStateChange: StateChangeCallback | null = null;
  private onCompletion: CompletionCallback | null = null;

  constructor(config: AgentWorkerConfig) {
    this.agentId = config.agentId;
    this.tickIntervalMs = config.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS;
  }

  /**
   * Get the agent ID this worker manages
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get the current state of the agent
   */
  getState(): AgentStatus {
    return this.currentState;
  }

  /**
   * Check if the worker is currently running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get the currently assigned task
   */
  getCurrentTask(): TaskAssignmentPayload | null {
    return this.currentTask;
  }

  /**
   * Get the agent ID this agent is currently talking to
   */
  getTalkingTo(): string | null {
    return this.talkingTo;
  }

  /**
   * Set callback for state change notifications
   */
  setStateChangeCallback(callback: StateChangeCallback): void {
    this.onStateChange = callback;
  }

  /**
   * Set callback for LLM completion requests (placeholder for PRD-011/012)
   */
  setCompletionCallback(callback: CompletionCallback): void {
    this.onCompletion = callback;
  }

  /**
   * Start the agent work loop
   */
  start(): void {
    if (this.running) {
      console.warn(`AgentWorker ${this.agentId} is already running`);
      return;
    }

    this.running = true;
    console.log(`🚀 AgentWorker ${this.agentId} started`);

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

    console.log(`🛑 AgentWorker ${this.agentId} stopped`);
  }

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
    const wastalking = this.talkingTo;
    this.talkingTo = null;

    if (wastalking) {
      console.log(
        `💬 AgentWorker ${this.agentId} finished talking to ${wastalking}`
      );
    }

    // Return to thinking if has task, otherwise idle
    if (this.currentTask) {
      this.transitionTo("thinking", "Finished conversation, resuming task");
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

  /**
   * Execute a single tick of the work loop
   */
  private async tick(): Promise<void> {
    if (!this.running) return;

    try {
      await this.executeTick();
    } catch (error) {
      console.error(`AgentWorker ${this.agentId} tick error:`, error);
      // On error, transition back to idle
      this.transitionTo("idle", "Error during tick");
    }
  }

  /**
   * Core tick logic - determines what the agent should do
   */
  private async executeTick(): Promise<void> {
    switch (this.currentState) {
      case "idle":
        // Agent is idle - check if there's work to do
        if (this.currentTask) {
          this.transitionTo("thinking", "Has pending task");
        }
        // Otherwise, stay idle (could add proactive behaviors later)
        break;

      case "thinking":
        // Agent is thinking - decide next action
        if (this.currentTask) {
          // Has a task, start working on it
          this.transitionTo("working", `Working on: ${this.currentTask.title}`);
        } else if (this.talkingTo) {
          // Needs to talk to someone
          this.transitionTo("talking", `Talking to: ${this.talkingTo}`);
        } else {
          // Nothing to do, go idle
          this.transitionTo("idle", "No pending work");
        }
        break;

      case "working":
        // Agent is working on a task
        // In future PRDs, this will call LLM for actual work
        // For now, simulate work progress
        if (this.onCompletion && this.currentTask) {
          // Placeholder: would call LLM here
          // const result = await this.onCompletion(
          //   this.agentId,
          //   `Work on task: ${this.currentTask.description}`
          // );
        }
        // Stay in working state until task is cleared externally
        break;

      case "talking":
        // Agent is in conversation
        // Stay in talking state until stopTalking() is called
        break;

      case "walking":
        // Agent is walking to a destination
        // Stay in walking state until destination reached (handled by game layer)
        break;

      default:
        console.warn(`AgentWorker ${this.agentId} in unknown state: ${this.currentState}`);
        this.transitionTo("idle", "Unknown state recovery");
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: AgentStatus, reason?: string): void {
    const oldState = this.currentState;

    // Validate transition
    if (!isValidTransition(oldState, newState)) {
      console.warn(
        `AgentWorker ${this.agentId}: Invalid transition ${oldState} → ${newState}`
      );
      return;
    }

    // Skip if no change
    if (oldState === newState) return;

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

    // Notify listener
    if (this.onStateChange) {
      this.onStateChange(transition);
    }
  }
}
