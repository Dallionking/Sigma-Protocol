/**
 * MessageBus - Agent-to-agent message routing system (A2A Protocol)
 *
 * Implements PRD-010: Message routing system for agent-to-agent communication
 * with @mention parsing, broadcast support, and per-agent message queues.
 *
 * Responsibilities:
 * - Parse @mentions from message content
 * - Route messages to correct agent(s)
 * - Handle broadcast messages (to all agents)
 * - Maintain message queue per agent
 * - Provide getMessagesFor(agentId) to retrieve queued messages
 */

import type { FloorRoom } from "../rooms/FloorRoom";

/** Parsed @mention from message content */
export interface ParsedMention {
  /** The raw mention text (e.g., "@Alex") */
  raw: string;
  /** The extracted name (e.g., "Alex") */
  name: string;
  /** The resolved agent ID (if found) */
  agentId: string | null;
  /** Position in the original content */
  position: number;
}

/** Message type for routing */
export type MessageType = "mention" | "direct" | "broadcast" | "task" | "chat";

/** Message structure for routing */
export interface RoutableMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: MessageType | string; // Allow string for flexibility with external message types
  timestamp: number;
}

/** Message stored in the per-agent queue */
export interface QueuedMessage extends RoutableMessage {
  /** Has this message been processed by the agent */
  processed: boolean;
  /** Time when the message was queued */
  queuedAt: number;
}

/** Callback for when a message is queued to an agent */
export type MessageQueuedCallback = (
  agentId: string,
  message: QueuedMessage
) => void;

export class MessageBus {
  private readonly room: FloorRoom;

  /** Per-agent message queues: Map<agentId, QueuedMessage[]> */
  private readonly messageQueues: Map<string, QueuedMessage[]> = new Map();

  /** Counter for generating unique message IDs */
  private messageIdCounter = 0;

  /** Optional callback when messages are queued */
  private onMessageQueued: MessageQueuedCallback | null = null;

  constructor(room: FloorRoom) {
    this.room = room;

    // Initialize queues for existing agents
    this.room.state.agents.forEach((_, agentId) => {
      this.messageQueues.set(agentId, []);
    });

    console.log(
      `📬 MessageBus initialized with ${this.messageQueues.size} agent queues`
    );
  }

  // ==========================================================================
  // Configuration
  // ==========================================================================

  /**
   * Set callback for when messages are queued to agents
   * This allows AgentManager to be notified of new messages
   */
  setMessageQueuedCallback(callback: MessageQueuedCallback): void {
    this.onMessageQueued = callback;
  }

  /**
   * Initialize or add a queue for a new agent
   */
  initializeAgentQueue(agentId: string): void {
    if (!this.messageQueues.has(agentId)) {
      this.messageQueues.set(agentId, []);
      console.log(`📬 MessageBus: Initialized queue for ${agentId}`);
    }
  }

  /**
   * Remove an agent's queue (on agent removal)
   */
  removeAgentQueue(agentId: string): void {
    this.messageQueues.delete(agentId);
    console.log(`📬 MessageBus: Removed queue for ${agentId}`);
  }

  // ==========================================================================
  // @Mention Parsing (AC1)
  // ==========================================================================

  /**
   * Parse @mentions from message content
   * Extracts all @mentions and resolves them to agent IDs
   *
   * @param content - The message content to parse
   * @returns Array of parsed mentions with resolved agent IDs
   */
  parseMentions(content: string): ParsedMention[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: ParsedMention[] = [];
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      const raw = match[0]; // "@Alex"
      const name = match[1]; // "Alex"
      const position = match.index;

      // Try to resolve to an agent ID
      let agentId: string | null = null;
      const nameLower = name.toLowerCase();

      this.room.state.agents.forEach((agent, id) => {
        if (agent.name.toLowerCase() === nameLower) {
          agentId = id;
        }
      });

      mentions.push({
        raw,
        name,
        agentId,
        position,
      });
    }

    return mentions;
  }

  /**
   * Extract just the agent IDs from @mentions (convenience method)
   * Filters out unresolved mentions
   */
  extractMentionedAgentIds(content: string): string[] {
    const mentions = this.parseMentions(content);
    return mentions
      .filter((m) => m.agentId !== null)
      .map((m) => m.agentId as string);
  }

  // ==========================================================================
  // Message Routing (AC2)
  // ==========================================================================

  /**
   * Route a message to the appropriate recipient(s)
   * Handles @mentions, direct messages, and broadcasts
   *
   * @param message - The message to route
   */
  routeMessage(message: RoutableMessage): void {
    const { from, to, content, type } = message;

    // Ensure message has an ID
    const messageWithId: RoutableMessage = {
      ...message,
      id: message.id || this.generateMessageId(),
    };

    // Parse @mentions from content
    const mentions = this.parseMentions(content);
    const mentionedAgentIds = mentions
      .filter((m) => m.agentId !== null)
      .map((m) => m.agentId as string);

    // Determine routing strategy
    if (to === "broadcast") {
      // Broadcast to all agents except sender
      this.broadcastMessage(messageWithId, from);
    } else if (mentionedAgentIds.length > 0) {
      // Route to mentioned agents
      for (const agentId of mentionedAgentIds) {
        // Don't send to self
        if (agentId !== from) {
          this.sendToAgent(agentId, {
            ...messageWithId,
            type: "mention",
          });
        }
      }
    } else if (to && to !== "user" && to !== "system") {
      // Direct message to specific agent
      this.sendToAgent(to, {
        ...messageWithId,
        type: "direct",
      });
    }

    console.log(
      `📬 MessageBus: Routed message from ${from} → ${to || "mentions"} (${mentionedAgentIds.length} mentions)`
    );
  }

  // ==========================================================================
  // Broadcast Messages (AC3)
  // ==========================================================================

  /**
   * Broadcast a message to all agents except the sender
   *
   * @param message - The message to broadcast
   * @param excludeAgentId - Agent ID to exclude (typically the sender)
   */
  broadcastMessage(message: RoutableMessage, excludeAgentId?: string): void {
    const broadcastMessage: RoutableMessage = {
      ...message,
      type: "broadcast",
    };

    this.room.state.agents.forEach((_, agentId) => {
      if (agentId !== excludeAgentId) {
        this.sendToAgent(agentId, broadcastMessage);
      }
    });

    console.log(
      `📢 MessageBus: Broadcast to ${this.room.state.agents.size - (excludeAgentId ? 1 : 0)} agents`
    );
  }

  // ==========================================================================
  // Message Queue Per Agent (AC4)
  // ==========================================================================

  /**
   * Send a message directly to an agent's queue
   *
   * @param agentId - The target agent ID
   * @param message - The message to send
   */
  sendToAgent(agentId: string, message: RoutableMessage): void {
    // Verify agent exists
    const agent = this.room.state.agents.get(agentId);
    if (!agent) {
      console.warn(`📬 MessageBus: Agent ${agentId} not found, dropping message`);
      return;
    }

    // Ensure queue exists for this agent
    if (!this.messageQueues.has(agentId)) {
      this.initializeAgentQueue(agentId);
    }

    // Create queued message
    const queuedMessage: QueuedMessage = {
      ...message,
      id: message.id || this.generateMessageId(),
      processed: false,
      queuedAt: Date.now(),
    };

    // Add to agent's queue
    const queue = this.messageQueues.get(agentId)!;
    queue.push(queuedMessage);

    console.log(
      `📤 MessageBus: Queued ${message.type} to ${agentId} (queue size: ${queue.length})`
    );

    // Notify callback if set (for AgentManager integration)
    if (this.onMessageQueued) {
      this.onMessageQueued(agentId, queuedMessage);
    }
  }

  // ==========================================================================
  // Get Messages For Agent (AC5)
  // ==========================================================================

  /**
   * Get all messages for a specific agent
   * Returns unprocessed messages by default
   *
   * @param agentId - The agent ID to get messages for
   * @param includeProcessed - Whether to include already-processed messages
   * @returns Array of messages for this agent
   */
  getMessagesFor(agentId: string, includeProcessed = false): QueuedMessage[] {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      return [];
    }

    if (includeProcessed) {
      return [...queue];
    }

    return queue.filter((m) => !m.processed);
  }

  /**
   * Get the next unprocessed message for an agent
   *
   * @param agentId - The agent ID
   * @returns The next unprocessed message, or null if none
   */
  getNextMessageFor(agentId: string): QueuedMessage | null {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      return null;
    }

    return queue.find((m) => !m.processed) ?? null;
  }

  /**
   * Mark a message as processed
   *
   * @param agentId - The agent ID
   * @param messageId - The message ID to mark as processed
   */
  markMessageProcessed(agentId: string, messageId: string): boolean {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      return false;
    }

    const message = queue.find((m) => m.id === messageId);
    if (message) {
      message.processed = true;
      return true;
    }

    return false;
  }

  /**
   * Get the count of unprocessed messages for an agent
   */
  getUnprocessedCountFor(agentId: string): number {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      return 0;
    }

    return queue.filter((m) => !m.processed).length;
  }

  /**
   * Clear processed messages from an agent's queue
   * Useful for memory management
   */
  clearProcessedMessages(agentId: string): number {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      return 0;
    }

    const initialLength = queue.length;
    const unprocessed = queue.filter((m) => !m.processed);
    this.messageQueues.set(agentId, unprocessed);

    return initialLength - unprocessed.length;
  }

  /**
   * Clear all messages from an agent's queue
   */
  clearAllMessages(agentId: string): void {
    if (this.messageQueues.has(agentId)) {
      this.messageQueues.set(agentId, []);
    }
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${this.messageIdCounter++}`;
  }

  /**
   * Get queue statistics for debugging/monitoring
   */
  getQueueStats(): Map<string, { total: number; unprocessed: number }> {
    const stats = new Map<string, { total: number; unprocessed: number }>();

    this.messageQueues.forEach((queue, agentId) => {
      stats.set(agentId, {
        total: queue.length,
        unprocessed: queue.filter((m) => !m.processed).length,
      });
    });

    return stats;
  }

  /**
   * Check if an agent has unprocessed messages
   */
  hasUnprocessedMessages(agentId: string): boolean {
    return this.getUnprocessedCountFor(agentId) > 0;
  }
}
