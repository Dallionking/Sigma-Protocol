import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { nanoid } from "nanoid";
import { AgentManager } from "../agents/AgentManager";
import { MessageBus } from "../agents/MessageBus";
import { createTokenTracker, type TokenTracker, type UsageEvent } from "../providers/token-tracker";

// Schema definitions for Colyseus state sync
class Position extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

class AgentSchema extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") role: string = "";
  @type("string") avatar: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") deskX: number = 0;
  @type("number") deskY: number = 0;
  @type("string") status: string = "idle";
  @type("string") currentTask: string = "";
  @type("string") talkingTo: string = "";
  @type("string") provider: string = "claude-code";
  @type("string") model: string = "opus";
  @type("string") systemPrompt: string = "";
  // Personality & mood (PRD-019)
  @type("string") personalitySociability: string = "extrovert"; // introvert | extrovert
  @type("string") personalityCommunication: string = "casual"; // formal | casual
  @type("string") mood: string = "happy"; // happy | stressed | focused | tired
  @type("number") fatigueLevel: number = 100; // 0-100, 100 = fully rested
  @type("number") fatigueLastBreak: number = 0; // timestamp
  @type("number") fatigueTasksSinceBreak: number = 0;
}

class MessageSchema extends Schema {
  @type("string") id: string = "";
  @type("string") from: string = "";
  @type("string") to: string = "";
  @type("string") content: string = "";
  @type("number") timestamp: number = 0;
  @type("string") type: string = "chat";
}

class TaskSchema extends Schema {
  @type("string") id: string = "";
  @type("string") title: string = "";
  @type("string") description: string = "";
  @type("string") status: string = "todo";
  @type("string") assignee: string = "";
  @type("string") priority: string = "medium";
  @type("number") createdAt: number = 0;
  @type("number") updatedAt: number = 0;
}

/**
 * Token usage tracking schema for Colyseus state sync
 * @see PRD-020: Token/Cost Dashboard
 */
class TokenUsageSchema extends Schema {
  @type("string") agentId: string = "";
  @type("string") provider: string = "";
  @type("string") model: string = "";
  @type("number") totalInputTokens: number = 0;
  @type("number") totalOutputTokens: number = 0;
  @type("number") totalCost: number = 0;
  @type("number") requestCount: number = 0;
  @type("number") lastUpdated: number = 0;
}

class FloorState extends Schema {
  @type({ map: AgentSchema }) agents = new MapSchema<AgentSchema>();
  @type([MessageSchema]) messages = new ArraySchema<MessageSchema>();
  @type({ map: TaskSchema }) tasks = new MapSchema<TaskSchema>();
  @type({ map: TokenUsageSchema }) tokenUsage = new MapSchema<TokenUsageSchema>();
  @type("string") teamId: string = "";
}

export class FloorRoom extends Room<FloorState> {
  private agentManager!: AgentManager;
  private messageBus!: MessageBus;
  private tokenTracker!: TokenTracker;
  private maxMessages = 100; // Keep last 100 messages

  onCreate(options: { teamId: string }) {
    console.log(`🏠 Creating floor room: ${options.teamId}`);

    // Initialize state
    this.setState(new FloorState());
    this.state.teamId = options.teamId;

    // Initialize managers
    this.messageBus = new MessageBus(this);
    this.tokenTracker = createTokenTracker();
    this.agentManager = new AgentManager(this, this.messageBus, this.tokenTracker);

    // Wire up token usage events to Colyseus state (AC3)
    this.tokenTracker.setUsageCallback((event: UsageEvent) => {
      this.updateTokenUsage(event);
    });

    // Load team template
    this.loadTeamTemplate(options.teamId);

    // Add system welcome message
    this.addMessage({
      from: "system",
      to: "broadcast",
      content: `Welcome to the ${options.teamId.replace("-", " ")}! Agents are ready to collaborate.`,
      type: "system",
    });

    // Register message handlers
    this.registerMessageHandlers();

    // Start agent work loops
    this.agentManager.startAgentLoops();
  }

  private loadTeamTemplate(teamId: string) {
    // Default team configurations
    const templates: Record<string, Array<Partial<AgentSchema>>> = {
      "dev-team": [
        {
          id: "pm",
          name: "Alex",
          role: "project-manager",
          avatar: "pm",
          x: 100,
          y: 150,
          deskX: 100,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Alex, a project manager. Break down requirements, assign tasks, coordinate the team, and ensure delivery.",
          personalitySociability: "extrovert",
          personalityCommunication: "casual",
          mood: "happy",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "architect",
          name: "Jordan",
          role: "architect",
          avatar: "architect",
          x: 220,
          y: 150,
          deskX: 220,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Jordan, a senior software architect. Design systems, review PRs, mentor the team, and make technical decisions.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "frontend",
          name: "Sam",
          role: "frontend-engineer",
          avatar: "frontend",
          x: 340,
          y: 150,
          deskX: 340,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "sonnet",
          systemPrompt:
            "You are Sam, a frontend engineer. Build React components, implement UI designs, and ensure great user experiences.",
          personalitySociability: "extrovert",
          personalityCommunication: "casual",
          mood: "happy",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "backend",
          name: "Riley",
          role: "backend-engineer",
          avatar: "backend",
          x: 460,
          y: 150,
          deskX: 460,
          deskY: 150,
          status: "idle",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt:
            "You are Riley, a backend engineer. Build APIs, manage databases, handle infrastructure, and optimize performance.",
          personalitySociability: "introvert",
          personalityCommunication: "casual",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "qa",
          name: "Casey",
          role: "qa-engineer",
          avatar: "qa",
          x: 580,
          y: 150,
          deskX: 580,
          deskY: 150,
          status: "idle",
          provider: "anthropic",
          model: "claude-sonnet-4",
          systemPrompt:
            "You are Casey, a QA engineer. Write tests, find bugs, ensure quality, and verify requirements are met.",
          personalitySociability: "extrovert",
          personalityCommunication: "formal",
          mood: "stressed",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
      ],
      "trading-floor": [
        {
          id: "analyst",
          name: "Morgan",
          role: "analyst",
          avatar: "analyst",
          x: 100,
          y: 150,
          deskX: 100,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Morgan, a market analyst. Research markets, analyze trends, and provide insights to the team.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "quant",
          name: "Taylor",
          role: "quant",
          avatar: "quant",
          x: 220,
          y: 150,
          deskX: 220,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Taylor, a quantitative analyst. Build models, analyze data, and develop trading strategies.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "risk",
          name: "Jordan",
          role: "risk-manager",
          avatar: "risk",
          x: 340,
          y: 150,
          deskX: 340,
          deskY: 150,
          status: "idle",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt:
            "You are Jordan, a risk manager. Monitor positions, assess risks, and ensure compliance with risk limits.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "stressed",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "trader",
          name: "Alex",
          role: "trader",
          avatar: "trader",
          x: 460,
          y: 150,
          deskX: 460,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "sonnet",
          systemPrompt:
            "You are Alex, a trader. Execute trades, manage positions, and optimize execution quality.",
          personalitySociability: "extrovert",
          personalityCommunication: "casual",
          mood: "happy",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "compliance",
          name: "Sam",
          role: "compliance",
          avatar: "compliance",
          x: 580,
          y: 150,
          deskX: 580,
          deskY: 150,
          status: "idle",
          provider: "anthropic",
          model: "claude-sonnet-4",
          systemPrompt:
            "You are Sam, a compliance officer. Ensure regulatory compliance, review trades, and maintain audit trails.",
          personalitySociability: "extrovert",
          personalityCommunication: "formal",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
      ],
      "creative-studio": [
        {
          id: "writer",
          name: "Quinn",
          role: "writer",
          avatar: "writer",
          x: 100,
          y: 150,
          deskX: 100,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Quinn, a creative writer. Write compelling copy, stories, and content for various media.",
          personalitySociability: "introvert",
          personalityCommunication: "casual",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "designer",
          name: "Avery",
          role: "designer",
          avatar: "designer",
          x: 220,
          y: 150,
          deskX: 220,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "opus",
          systemPrompt:
            "You are Avery, a designer. Create visual designs, layouts, and brand assets.",
          personalitySociability: "extrovert",
          personalityCommunication: "casual",
          mood: "happy",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "reviewer",
          name: "Jordan",
          role: "reviewer",
          avatar: "reviewer",
          x: 340,
          y: 150,
          deskX: 340,
          deskY: 150,
          status: "idle",
          provider: "openai",
          model: "gpt-4o",
          systemPrompt:
            "You are Jordan, a content reviewer. Review work, provide feedback, and ensure quality standards.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "focused",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "editor",
          name: "Riley",
          role: "editor",
          avatar: "editor",
          x: 460,
          y: 150,
          deskX: 460,
          deskY: 150,
          status: "idle",
          provider: "anthropic",
          model: "claude-sonnet-4",
          systemPrompt:
            "You are Riley, an editor. Edit content, refine messaging, and polish final outputs.",
          personalitySociability: "introvert",
          personalityCommunication: "formal",
          mood: "stressed",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
        {
          id: "producer",
          name: "Casey",
          role: "producer",
          avatar: "producer",
          x: 580,
          y: 150,
          deskX: 580,
          deskY: 150,
          status: "idle",
          provider: "claude-code",
          model: "sonnet",
          systemPrompt:
            "You are Casey, a producer. Coordinate projects, manage timelines, and ensure deliverables.",
          personalitySociability: "extrovert",
          personalityCommunication: "casual",
          mood: "happy",
          fatigueLevel: 100,
          fatigueLastBreak: Date.now(),
          fatigueTasksSinceBreak: 0,
        },
      ],
    };

    // Load agents for team
    const agents = templates[teamId] || templates["dev-team"];
    agents.forEach((agentConfig) => {
      const agent = new AgentSchema();
      Object.assign(agent, agentConfig);
      this.state.agents.set(agent.id, agent);
    });

    console.log(`📋 Loaded ${agents.length} agents for ${teamId}`);
  }

  private registerMessageHandlers() {
    // Handle user messages
    this.onMessage("message", (client, data: { content: string; to?: string }) => {
      const message = this.addMessage({
        from: "user",
        to: data.to || "broadcast",
        content: data.content,
        type: "chat",
      });

      // Route to agents
      this.messageBus.routeMessage(message);
    });

    // Handle agent movement
    this.onMessage(
      "moveAgent",
      (_, data: { agentId: string; position: { x: number; y: number } }) => {
        const agent = this.state.agents.get(data.agentId);
        if (agent) {
          agent.x = data.position.x;
          agent.y = data.position.y;
        }
      }
    );

    // Handle agent status updates
    this.onMessage(
      "updateAgentStatus",
      (_, data: { agentId: string; status: string }) => {
        const agent = this.state.agents.get(data.agentId);
        if (agent) {
          agent.status = data.status;
        }
      }
    );

    // Handle task creation
    this.onMessage(
      "createTask",
      (
        _,
        data: {
          title: string;
          description: string;
          priority: string;
          assignee?: string;
        }
      ) => {
        const task = new TaskSchema();
        task.id = `task-${nanoid(8)}`;
        task.title = data.title;
        task.description = data.description;
        task.priority = data.priority;
        task.status = "todo";
        task.assignee = data.assignee || "";
        task.createdAt = Date.now();
        task.updatedAt = Date.now();

        this.state.tasks.set(task.id, task);

        // Notify agents about new task
        this.addMessage({
          from: "system",
          to: "broadcast",
          content: `New task created: "${task.title}"`,
          type: "system",
        });
      }
    );

    // Handle task updates
    this.onMessage(
      "updateTask",
      (_, data: { taskId: string; updates: Partial<TaskSchema> }) => {
        const task = this.state.tasks.get(data.taskId);
        if (task) {
          Object.assign(task, data.updates);
          task.updatedAt = Date.now();
        }
      }
    );

    // Handle task assignment
    this.onMessage(
      "assignTask",
      (_, data: { taskId: string; agentId: string }) => {
        const task = this.state.tasks.get(data.taskId);
        const agent = this.state.agents.get(data.agentId);

        if (task && agent) {
          task.assignee = data.agentId;
          task.updatedAt = Date.now();

          this.addMessage({
            from: "system",
            to: data.agentId,
            content: `Task assigned: "${task.title}"`,
            type: "task",
          });
        }
      }
    );
  }

  addMessage(data: {
    from: string;
    to: string;
    content: string;
    type: string;
  }): MessageSchema {
    const message = new MessageSchema();
    message.id = `msg-${nanoid(8)}`;
    message.from = data.from;
    message.to = data.to;
    message.content = data.content;
    message.type = data.type;
    message.timestamp = Date.now();

    this.state.messages.push(message);

    // Trim old messages
    while (this.state.messages.length > this.maxMessages) {
      this.state.messages.shift();
    }

    return message;
  }

  /**
   * Update token usage in Colyseus state (AC3 - Emit usage events)
   *
   * @param event - Usage event from TokenTracker
   */
  private updateTokenUsage(event: UsageEvent): void {
    const { agentId, aggregated } = event;

    // Get or create token usage schema for this agent
    let usage = this.state.tokenUsage.get(agentId);
    if (!usage) {
      usage = new TokenUsageSchema();
      usage.agentId = agentId;
      this.state.tokenUsage.set(agentId, usage);
    }

    // Update with aggregated stats
    usage.provider = aggregated.provider;
    usage.model = aggregated.model;
    usage.totalInputTokens = aggregated.totalInputTokens;
    usage.totalOutputTokens = aggregated.totalOutputTokens;
    usage.totalCost = aggregated.totalCost;
    usage.requestCount = aggregated.requestCount;
    usage.lastUpdated = aggregated.lastUpdated;

    // Broadcast token usage update to all clients
    this.broadcast("tokenUsageUpdate", {
      agentId,
      provider: aggregated.provider,
      model: aggregated.model,
      inputTokens: event.inputTokens,
      outputTokens: event.outputTokens,
      cost: event.cost,
      totalInputTokens: aggregated.totalInputTokens,
      totalOutputTokens: aggregated.totalOutputTokens,
      totalCost: aggregated.totalCost,
      requestCount: aggregated.requestCount,
    });
  }

  /**
   * Get the token tracker for this room
   *
   * @returns TokenTracker instance
   */
  getTokenTracker(): TokenTracker {
    return this.tokenTracker;
  }

  onJoin(client: Client) {
    console.log(`👤 Client joined: ${client.sessionId}`);
  }

  onLeave(client: Client) {
    console.log(`👤 Client left: ${client.sessionId}`);
  }

  onDispose() {
    console.log(`🏠 Room disposed: ${this.state.teamId}`);
    this.agentManager.stopAgentLoops();
  }
}
