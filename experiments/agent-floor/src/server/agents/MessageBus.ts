/**
 * MessageBus - Agent-to-agent message routing system
 *
 * Placeholder implementation for PRD-010 (A2A Protocol)
 * This provides the basic interface needed by AgentManager and FloorRoom
 */

import type { FloorRoom } from "../rooms/FloorRoom";

/** Message structure for routing */
export interface RoutableMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: string;
  timestamp: number;
}

export class MessageBus {
  private readonly room: FloorRoom;

  constructor(room: FloorRoom) {
    this.room = room;
    console.log("📬 MessageBus initialized");
  }

  /**
   * Route a message to the appropriate recipient(s)
   * This is called when a new message is received
   */
  routeMessage(message: RoutableMessage): void {
    const { from, to, content, type } = message;

    // Parse @mentions in content
    const mentions = this.parseMentions(content);

    if (to === "broadcast") {
      // Broadcast to all agents
      this.broadcastMessage(message);
    } else if (mentions.length > 0) {
      // Route to mentioned agents
      mentions.forEach((agentId) => {
        this.sendToAgent(agentId, message);
      });
    } else if (to && to !== "user") {
      // Direct message to specific agent
      this.sendToAgent(to, message);
    }

    console.log(`📬 MessageBus: Routed message from ${from} to ${to}`);
  }

  /**
   * Send a message directly to an agent
   */
  sendToAgent(agentId: string, message: RoutableMessage): void {
    // In full implementation (PRD-010), this would:
    // 1. Add to agent's message queue
    // 2. Notify AgentManager to process
    // 3. Handle JSON-RPC format

    const agent = this.room.state.agents.get(agentId);
    if (!agent) {
      console.warn(`MessageBus: Agent ${agentId} not found`);
      return;
    }

    console.log(`📤 MessageBus: Sent to ${agentId}: ${message.content.slice(0, 50)}...`);
  }

  /**
   * Broadcast a message to all agents
   */
  broadcastMessage(message: RoutableMessage): void {
    this.room.state.agents.forEach((_, agentId) => {
      this.sendToAgent(agentId, message);
    });
  }

  /**
   * Parse @mentions from message content
   */
  parseMentions(content: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      const name = match[1].toLowerCase();

      // Find agent by name
      this.room.state.agents.forEach((agent, agentId) => {
        if (agent.name.toLowerCase() === name) {
          mentions.push(agentId);
        }
      });
    }

    return mentions;
  }
}
