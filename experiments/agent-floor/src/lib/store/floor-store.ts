import { create } from "zustand";
import { Client, Room } from "colyseus.js";
import type { Agent, AgentStatus, Position } from "@/types/agent";
import type { FloorMessage } from "@/types/message";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done" | "blocked";
  assignee: string | null;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: number;
  updatedAt: number;
}

interface FloorState {
  // Connection state
  client: Client | null;
  room: Room | null;
  isConnected: boolean;
  teamId: string | null;

  // Floor state
  agents: Agent[];
  messages: FloorMessage[];
  tasks: Task[];

  // UI state
  selectedAgentId: string | null;
  inputMessage: string;

  // Actions
  connect: (teamId: string) => Promise<void>;
  disconnect: () => void;

  // Agent actions
  selectAgent: (agentId: string | null) => void;
  moveAgent: (agentId: string, position: Position) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  updateAgent: (agentId: string, updates: Partial<Pick<Agent, 'name' | 'provider' | 'model' | 'systemPrompt'>>) => void;

  // Message actions
  sendMessage: (content: string, to?: string) => void;
  setInputMessage: (message: string) => void;

  // Task actions
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  assignTask: (taskId: string, agentId: string) => void;
}

export const useFloorStore = create<FloorState>((set, get) => ({
  // Initial state
  client: null,
  room: null,
  isConnected: false,
  teamId: null,
  agents: [],
  messages: [],
  tasks: [],
  selectedAgentId: null,
  inputMessage: "",

  // Connect to Colyseus server
  connect: async (teamId: string) => {
    try {
      const client = new Client("ws://localhost:2567");
      const room = await client.joinOrCreate("floor", { teamId });

      set({ client, room, teamId, isConnected: true });

      // Listen for state changes
      room.onStateChange((state) => {
        const agents: Agent[] = [];
        const messages: FloorMessage[] = [];
        const tasks: Task[] = [];

        // Convert Colyseus MapSchema to arrays
        if (state.agents) {
          state.agents.forEach((agent: Agent) => {
            agents.push({ ...agent });
          });
        }

        if (state.messages) {
          state.messages.forEach((msg: FloorMessage) => {
            messages.push({ ...msg });
          });
        }

        if (state.tasks) {
          state.tasks.forEach((task: Task) => {
            tasks.push({ ...task });
          });
        }

        set({ agents, messages, tasks });
      });

      room.onLeave(() => {
        set({ isConnected: false });
      });

      room.onError((code, message) => {
        console.error("Room error:", code, message);
      });
    } catch (error) {
      console.error("Connection failed:", error);
      // For development, populate with mock data if server not running
      set({
        isConnected: false,
        agents: getMockAgents(teamId),
        messages: getMockMessages(),
        tasks: getMockTasks(),
      });
    }
  },

  disconnect: () => {
    const { room, client } = get();
    if (room) room.leave();
    set({
      client: null,
      room: null,
      isConnected: false,
      teamId: null,
    });
  },

  selectAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  moveAgent: (agentId, position) => {
    const { room } = get();
    if (room) {
      room.send("moveAgent", { agentId, position });
    }
  },

  updateAgentStatus: (agentId, status) => {
    const { room } = get();
    if (room) {
      room.send("updateAgentStatus", { agentId, status });
    }
  },

  updateAgent: (agentId, updates) => {
    const { room } = get();
    if (room) {
      room.send("updateAgent", { agentId, updates });
    } else {
      // Mock update for development
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, ...updates } : a
        ),
      }));
    }
  },

  sendMessage: (content, to) => {
    const { room } = get();
    if (room) {
      room.send("message", { content, to: to || "broadcast" });
    } else {
      // Mock message for development
      const newMessage: FloorMessage = {
        id: `msg-${Date.now()}`,
        from: "user",
        to: to || "broadcast",
        content,
        timestamp: Date.now(),
        type: "chat",
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    }
    set({ inputMessage: "" });
  },

  setInputMessage: (message) => {
    set({ inputMessage: message });
  },

  createTask: (task) => {
    const { room } = get();
    if (room) {
      room.send("createTask", task);
    } else {
      // Mock task for development
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((state) => ({
        tasks: [...state.tasks, newTask],
      }));
    }
  },

  updateTask: (taskId, updates) => {
    const { room } = get();
    if (room) {
      room.send("updateTask", { taskId, updates });
    } else {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t
        ),
      }));
    }
  },

  assignTask: (taskId, agentId) => {
    const { room } = get();
    if (room) {
      room.send("assignTask", { taskId, agentId });
    } else {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, assignee: agentId, updatedAt: Date.now() }
            : t
        ),
      }));
    }
  },
}));

// Mock data for development without server
function getMockAgents(teamId: string): Agent[] {
  const baseAgents: Record<string, Agent[]> = {
    "dev-team": [
      {
        id: "pm",
        name: "Alex",
        role: "project-manager",
        avatar: "pm",
        position: { x: 100, y: 150 },
        desk: { x: 100, y: 150 },
        status: "idle",
        currentTask: null,
        talkingTo: null,
        provider: "claude-code",
        model: "opus",
        systemPrompt: "You are a project manager.",
      },
      {
        id: "architect",
        name: "Jordan",
        role: "architect",
        avatar: "architect",
        position: { x: 200, y: 150 },
        desk: { x: 200, y: 150 },
        status: "thinking",
        currentTask: "task-1",
        talkingTo: null,
        provider: "claude-code",
        model: "opus",
        systemPrompt: "You are a senior architect.",
      },
      {
        id: "frontend",
        name: "Sam",
        role: "frontend-engineer",
        avatar: "frontend",
        position: { x: 300, y: 150 },
        desk: { x: 300, y: 150 },
        status: "working",
        currentTask: "task-2",
        talkingTo: null,
        provider: "claude-code",
        model: "sonnet",
        systemPrompt: "You are a frontend engineer.",
      },
      {
        id: "backend",
        name: "Riley",
        role: "backend-engineer",
        avatar: "backend",
        position: { x: 400, y: 150 },
        desk: { x: 400, y: 150 },
        status: "idle",
        currentTask: null,
        talkingTo: null,
        provider: "openai",
        model: "gpt-4o",
        systemPrompt: "You are a backend engineer.",
      },
      {
        id: "qa",
        name: "Casey",
        role: "qa-engineer",
        avatar: "qa",
        position: { x: 500, y: 150 },
        desk: { x: 500, y: 150 },
        status: "talking",
        currentTask: null,
        talkingTo: "frontend",
        provider: "anthropic",
        model: "claude-sonnet-4",
        systemPrompt: "You are a QA engineer.",
      },
    ],
    "trading-floor": [
      {
        id: "analyst",
        name: "Morgan",
        role: "analyst",
        avatar: "analyst",
        position: { x: 100, y: 150 },
        desk: { x: 100, y: 150 },
        status: "working",
        currentTask: null,
        talkingTo: null,
        provider: "claude-code",
        model: "opus",
        systemPrompt: "You are a market analyst.",
      },
    ],
    "creative-studio": [
      {
        id: "writer",
        name: "Quinn",
        role: "writer",
        avatar: "writer",
        position: { x: 100, y: 150 },
        desk: { x: 100, y: 150 },
        status: "thinking",
        currentTask: null,
        talkingTo: null,
        provider: "claude-code",
        model: "opus",
        systemPrompt: "You are a creative writer.",
      },
    ],
  };

  return baseAgents[teamId] || baseAgents["dev-team"];
}

function getMockMessages(): FloorMessage[] {
  return [
    {
      id: "msg-1",
      from: "system",
      to: "broadcast",
      content: "Welcome to the floor! Agents are ready to collaborate.",
      timestamp: Date.now() - 60000,
      type: "system",
    },
    {
      id: "msg-2",
      from: "architect",
      to: "broadcast",
      content: "I've reviewed the architecture spec. Ready to discuss with @frontend.",
      timestamp: Date.now() - 30000,
      type: "chat",
      metadata: { mentions: ["frontend"] },
    },
    {
      id: "msg-3",
      from: "frontend",
      to: "architect",
      content: "Sure! Walking over to discuss the component structure.",
      timestamp: Date.now() - 15000,
      type: "chat",
    },
  ];
}

function getMockTasks(): Task[] {
  return [
    {
      id: "task-1",
      title: "Design system architecture",
      description: "Create the overall system architecture diagram",
      status: "in-progress",
      assignee: "architect",
      priority: "high",
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: "task-2",
      title: "Build login component",
      description: "Implement the login form with validation",
      status: "in-progress",
      assignee: "frontend",
      priority: "medium",
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 900000,
    },
    {
      id: "task-3",
      title: "API authentication",
      description: "Set up JWT authentication on backend",
      status: "todo",
      assignee: null,
      priority: "high",
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: "task-4",
      title: "Write E2E tests",
      description: "Create Playwright tests for auth flow",
      status: "todo",
      assignee: "qa",
      priority: "medium",
      createdAt: Date.now() - 900000,
      updatedAt: Date.now() - 900000,
    },
  ];
}
