/**
 * AgentManager - Server-side manager for agent lifecycle and work loops
 *
 * Responsibilities:
 * - Spawns AgentWorker for each agent in the room
 * - Starts/stops all agent work loops
 * - Routes tasks to appropriate agents based on role
 * - Manages agent state transitions
 * - Coordinates inter-agent communication via MessageBus
 * - Routes messages to workers for @mention handling
 */

import type { FloorRoom } from "../rooms/FloorRoom";
import type { MessageBus, RoutableMessage } from "./MessageBus";
import type { AgentStatus, AgentRole } from "@/types/agent";
import type { LLMProvider } from "@/types/provider";
import type {
  TaskAssignmentPayload,
  AgentStateTransition,
} from "./types";
import { ROLE_TASK_KEYWORDS } from "./types";
import { AgentWorker, type AgentMessage } from "./AgentWorker";
import type { TokenTracker } from "../providers/token-tracker";

/** Configuration for AgentManager */
export interface AgentManagerConfig {
  tickIntervalMs?: number; // Default tick interval for workers
  llmProvider?: LLMProvider; // Optional LLM provider for workers
}

export class AgentManager {
  private readonly room: FloorRoom;
  private readonly messageBus: MessageBus;
  private readonly tokenTracker: TokenTracker | null;
  private readonly workers: Map<string, AgentWorker> = new Map();
  private readonly config: AgentManagerConfig;

  private running = false;
  private llmProvider: LLMProvider | null = null;
  private messageIdCounter = 0;

  constructor(
    room: FloorRoom,
    messageBus: MessageBus,
    tokenTracker?: TokenTracker,
    config: AgentManagerConfig = {}
  ) {
    this.room = room;
    this.messageBus = messageBus;
    this.tokenTracker = tokenTracker ?? null;
    this.config = config;

    // Set LLM provider if provided in config
    if (config.llmProvider) {
      this.llmProvider = config.llmProvider;
    }

    console.log("🤖 AgentManager initialized" + (tokenTracker ? " with token tracking" : ""));
  }

  /**
   * Set the LLM provider for all workers
   */
  setLLMProvider(provider: LLMProvider): void {
    this.llmProvider = provider;
    // Update existing workers
    this.workers.forEach((worker) => {
      worker.setLLMProvider(provider);
    });
    console.log(`🤖 AgentManager: LLM provider set to ${provider.name}`);
  }

  /**
   * Check if the manager is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get the number of active workers
   */
  getWorkerCount(): number {
    return this.workers.size;
  }

  /**
   * Get a worker by agent ID
   */
  getWorker(agentId: string): AgentWorker | undefined {
    return this.workers.get(agentId);
  }

  /**
   * Get all worker IDs
   */
  getWorkerIds(): string[] {
    return Array.from(this.workers.keys());
  }

  /**
   * Start agent work loops for all agents in the room
   * Spawns an AgentWorker for each agent and starts their work loops
   */
  startAgentLoops(): void {
    if (this.running) {
      console.warn("AgentManager: Agent loops already running");
      return;
    }

    this.running = true;
    const agents = this.room.state.agents;

    console.log(`🚀 AgentManager: Starting loops for ${agents.size} agents`);

    // Spawn a worker for each agent
    agents.forEach((agent, agentId) => {
      this.spawnWorker(agentId);
    });

    console.log(`✅ AgentManager: ${this.workers.size} agent loops started`);
  }

  /**
   * Stop all agent work loops gracefully
   */
  stopAgentLoops(): void {
    if (!this.running) {
      console.warn("AgentManager: Agent loops not running");
      return;
    }

    console.log(`🛑 AgentManager: Stopping ${this.workers.size} agent loops`);

    // Stop all workers
    this.workers.forEach((worker, agentId) => {
      worker.stop();
    });

    // Clear workers map
    this.workers.clear();
    this.running = false;

    console.log("✅ AgentManager: All agent loops stopped");
  }

  /**
   * Spawn a worker for a specific agent
   */
  private spawnWorker(agentId: string): AgentWorker {
    // Check if worker already exists
    const existingWorker = this.workers.get(agentId);
    if (existingWorker) {
      console.warn(`AgentManager: Worker for ${agentId} already exists`);
      return existingWorker;
    }

    // Get agent data from room state
    const agent = this.room.state.agents.get(agentId);
    if (!agent) {
      console.error(`AgentManager: Agent ${agentId} not found in room state`);
      throw new Error(`Agent ${agentId} not found`);
    }

    // Create new worker with agent context
    const worker = new AgentWorker({
      agentId,
      tickIntervalMs: this.config.tickIntervalMs,
      name: agent.name,
      role: agent.role as AgentRole,
      systemPrompt: agent.systemPrompt,
      provider: agent.provider,
      model: agent.model,
      tokenTracker: this.tokenTracker ?? undefined,
    });

    // Set up state change callback to sync with Colyseus state
    worker.setStateChangeCallback((transition) => {
      this.handleStateTransition(transition);
    });

    // Set up message sending callback
    worker.setSendMessageCallback((fromAgentId, content, targetAgentId) => {
      this.handleWorkerMessage(fromAgentId, content, targetAgentId);
    });

    // Set LLM provider if available
    if (this.llmProvider) {
      worker.setLLMProvider(this.llmProvider);
    }

    // Store and start worker
    this.workers.set(agentId, worker);
    worker.start();

    console.log(`🤖 AgentManager: Spawned worker for ${agentId} (${agent.name})`);

    return worker;
  }

  /**
   * Handle message from a worker (send to room/other agents)
   */
  private handleWorkerMessage(
    fromAgentId: string,
    content: string,
    targetAgentId?: string
  ): void {
    const agent = this.room.state.agents.get(fromAgentId);
    const agentName = agent?.name ?? fromAgentId;

    // Add message to room state
    const messageId = `msg-${Date.now()}-${this.messageIdCounter++}`;

    // Broadcast to room (handled by FloorRoom)
    this.room.broadcast("agent-message", {
      id: messageId,
      from: fromAgentId,
      fromName: agentName,
      content,
      target: targetAgentId,
      timestamp: Date.now(),
    });

    console.log(
      `📤 AgentManager: ${agentName} sent message${targetAgentId ? ` to ${targetAgentId}` : ""}`
    );
  }

  /**
   * Handle state transition from a worker
   * Syncs the state change to Colyseus room state
   */
  private handleStateTransition(transition: AgentStateTransition): void {
    const agent = this.room.state.agents.get(transition.agentId);
    if (!agent) {
      console.warn(
        `AgentManager: Agent ${transition.agentId} not found in room state`
      );
      return;
    }

    // Update Colyseus state
    agent.status = transition.to;

    // Update talkingTo if entering/leaving talking state
    const worker = this.workers.get(transition.agentId);
    if (worker) {
      agent.talkingTo = worker.getTalkingTo() ?? "";
    }

    // Broadcast state change if needed (for UI updates)
    // This is automatically handled by Colyseus state sync
  }

  /**
   * Route a task to the most appropriate agent based on role matching
   * Returns the agent ID of the best match, or null if no match found
   */
  routeTaskToAgent(task: {
    title: string;
    description: string;
    priority?: string;
  }): string | null {
    const taskText = `${task.title} ${task.description}`.toLowerCase();
    const agents = this.room.state.agents;

    // Score each agent based on keyword matches
    let bestMatchAgentId: string | null = null;
    let bestMatchScore = 0;

    agents.forEach((agent, agentId) => {
      const role = agent.role as AgentRole;
      const keywords = ROLE_TASK_KEYWORDS[role] ?? [];

      // Calculate match score
      let score = 0;
      for (const keyword of keywords) {
        if (taskText.includes(keyword)) {
          score++;
        }
      }

      // Prefer idle agents
      if (agent.status === "idle") {
        score += 0.5;
      }

      // Update best match
      if (score > 0 && score > bestMatchScore) {
        bestMatchAgentId = agentId;
        bestMatchScore = score;
      }
    });

    if (bestMatchAgentId) {
      console.log(
        `📍 AgentManager: Routed task "${task.title}" to ${bestMatchAgentId} (score: ${bestMatchScore})`
      );
      return bestMatchAgentId;
    }

    // Fallback: assign to first idle agent or project manager
    let fallbackAgent: string | null = null;

    agents.forEach((agent, agentId) => {
      if (!fallbackAgent) {
        if (agent.status === "idle") {
          fallbackAgent = agentId;
        } else if (agent.role === "project-manager") {
          fallbackAgent = agentId;
        }
      }
    });

    if (fallbackAgent) {
      console.log(
        `📍 AgentManager: Routed task "${task.title}" to ${fallbackAgent} (fallback)`
      );
    }

    return fallbackAgent;
  }

  /**
   * Assign a task to a specific agent
   */
  assignTaskToAgent(
    taskId: string,
    agentId: string,
    taskInfo?: { title: string; description: string; priority?: string }
  ): boolean {
    const worker = this.workers.get(agentId);
    if (!worker) {
      console.warn(`AgentManager: No worker found for ${agentId}`);
      return false;
    }

    const agent = this.room.state.agents.get(agentId);
    if (!agent) {
      console.warn(`AgentManager: Agent ${agentId} not found in room state`);
      return false;
    }

    // Get task from room state if not provided
    const task = this.room.state.tasks.get(taskId);
    const title = taskInfo?.title ?? task?.title ?? "Unknown Task";
    const description = taskInfo?.description ?? task?.description ?? "";
    const priority = (taskInfo?.priority ?? task?.priority ?? "medium") as
      | "low"
      | "medium"
      | "high"
      | "critical";

    // Create task assignment payload
    const payload: TaskAssignmentPayload = {
      taskId,
      title,
      description,
      priority,
      assignee: agentId,
    };

    // Assign to worker
    worker.assignTask(payload);

    // Update agent's currentTask in Colyseus state
    agent.currentTask = taskId;

    console.log(`📋 AgentManager: Assigned task "${title}" to ${agentId}`);

    return true;
  }

  /**
   * Update an agent's state directly
   */
  updateAgentState(agentId: string, status: AgentStatus): void {
    const worker = this.workers.get(agentId);
    if (worker) {
      worker.forceState(status, "External state update");
    }

    // Also update Colyseus state directly
    const agent = this.room.state.agents.get(agentId);
    if (agent) {
      agent.status = status;
    }
  }

  /**
   * Get an agent's current state
   */
  getAgentState(agentId: string): AgentStatus | null {
    const worker = this.workers.get(agentId);
    if (worker) {
      return worker.getState();
    }

    const agent = this.room.state.agents.get(agentId);
    if (agent) {
      return agent.status as AgentStatus;
    }

    return null;
  }

  /**
   * Initiate a conversation between two agents
   */
  startAgentConversation(fromAgentId: string, toAgentId: string): boolean {
    const fromWorker = this.workers.get(fromAgentId);
    const toWorker = this.workers.get(toAgentId);

    if (!fromWorker || !toWorker) {
      console.warn(
        `AgentManager: Cannot start conversation - worker not found`
      );
      return false;
    }

    fromWorker.startTalking(toAgentId);
    toWorker.startTalking(fromAgentId);

    // Update Colyseus state
    const fromAgent = this.room.state.agents.get(fromAgentId);
    const toAgent = this.room.state.agents.get(toAgentId);

    if (fromAgent) fromAgent.talkingTo = toAgentId;
    if (toAgent) toAgent.talkingTo = fromAgentId;

    console.log(
      `💬 AgentManager: Started conversation between ${fromAgentId} and ${toAgentId}`
    );

    return true;
  }

  /**
   * End a conversation between two agents
   */
  endAgentConversation(agentId: string): void {
    const worker = this.workers.get(agentId);
    if (!worker) return;

    const talkingTo = worker.getTalkingTo();
    if (talkingTo) {
      const otherWorker = this.workers.get(talkingTo);
      if (otherWorker) {
        otherWorker.stopTalking();
      }

      // Update Colyseus state for other agent
      const otherAgent = this.room.state.agents.get(talkingTo);
      if (otherAgent) otherAgent.talkingTo = "";
    }

    worker.stopTalking();

    // Update Colyseus state
    const agent = this.room.state.agents.get(agentId);
    if (agent) agent.talkingTo = "";

    console.log(`💬 AgentManager: Ended conversation for ${agentId}`);
  }

  /**
   * Complete a task for an agent
   */
  completeAgentTask(agentId: string): void {
    const worker = this.workers.get(agentId);
    if (worker) {
      worker.clearTask();
    }

    // Update Colyseus state
    const agent = this.room.state.agents.get(agentId);
    if (agent) {
      agent.currentTask = "";
      agent.status = "idle";
    }
  }

  /**
   * Handle a message routed to an agent
   * This is called by MessageBus when a message is directed to an agent
   */
  handleAgentMessage(agentId: string, message: {
    id?: string;
    from: string;
    content: string;
    type: string;
  }): void {
    const worker = this.workers.get(agentId);
    if (!worker) {
      console.warn(`AgentManager: No worker found for ${agentId}`);
      return;
    }

    // Generate message ID if not provided
    const messageId = message.id ?? `msg-${Date.now()}-${this.messageIdCounter++}`;

    // Determine message type for worker
    let messageType: AgentMessage["type"] = "direct";
    if (message.type === "mention" || message.content.includes(`@${worker.getContext().name}`)) {
      messageType = "mention";
    } else if (message.type === "broadcast") {
      messageType = "broadcast";
    } else if (message.type === "task") {
      messageType = "task";
    }

    // Enqueue message to worker
    worker.enqueueMessage({
      id: messageId,
      from: message.from,
      content: message.content,
      type: messageType,
      timestamp: Date.now(),
    });

    console.log(
      `📨 AgentManager: Routed ${messageType} to ${agentId} from ${message.from}`
    );
  }

  /**
   * Route a message from MessageBus to appropriate workers
   */
  routeMessageToWorkers(message: RoutableMessage): void {
    // Parse @mentions from content
    const mentionPattern = /@(\w+)/g;
    let match;

    while ((match = mentionPattern.exec(message.content)) !== null) {
      const mentionedName = match[1].toLowerCase();

      // Find worker by agent name
      this.workers.forEach((worker, agentId) => {
        const context = worker.getContext();
        if (context.name.toLowerCase() === mentionedName) {
          this.handleAgentMessage(agentId, {
            id: message.id,
            from: message.from,
            content: message.content,
            type: "mention",
          });
        }
      });
    }

    // If direct message to specific agent
    if (message.to && message.to !== "broadcast" && message.to !== "user") {
      this.handleAgentMessage(message.to, {
        id: message.id,
        from: message.from,
        content: message.content,
        type: "direct",
      });
    }

    // If broadcast, send to all workers
    if (message.to === "broadcast") {
      this.workers.forEach((_, agentId) => {
        if (agentId !== message.from) {
          this.handleAgentMessage(agentId, {
            id: message.id,
            from: message.from,
            content: message.content,
            type: "broadcast",
          });
        }
      });
    }
  }
}
