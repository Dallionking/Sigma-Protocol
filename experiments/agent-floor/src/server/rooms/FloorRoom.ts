import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { nanoid } from "nanoid";
import { AgentManager } from "../agents/AgentManager";
import { MessageBus } from "../agents/MessageBus";

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

class FloorState extends Schema {
  @type({ map: AgentSchema }) agents = new MapSchema<AgentSchema>();
  @type([MessageSchema]) messages = new ArraySchema<MessageSchema>();
  @type({ map: TaskSchema }) tasks = new MapSchema<TaskSchema>();
  @type("string") teamId: string = "";
}

export class FloorRoom extends Room<FloorState> {
  private agentManager!: AgentManager;
  private messageBus!: MessageBus;
  private maxMessages = 100; // Keep last 100 messages

  onCreate(options: { teamId: string }) {
    console.log(`🏠 Creating floor room: ${options.teamId}`);

    // Initialize state
    this.setState(new FloorState());
    this.state.teamId = options.teamId;

    // Initialize managers
    this.messageBus = new MessageBus(this);
    this.agentManager = new AgentManager(this, this.messageBus);

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
