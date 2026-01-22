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

// Connection status enum for detailed state tracking
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

// Reconnection configuration
const RECONNECT_CONFIG = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
} as const;

interface FloorState {
  // Connection state
  client: Client | null;
  room: Room | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  teamId: string | null;

  // Reconnection state
  reconnectAttempts: number;
  reconnectTimeoutId: ReturnType<typeof setTimeout> | null;
  lastError: string | null;

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
  reconnect: () => Promise<void>;
  cancelReconnect: () => void;

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

// Helper to calculate exponential backoff delay
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RECONNECT_CONFIG.baseDelayMs * Math.pow(RECONNECT_CONFIG.backoffMultiplier, attempt),
    RECONNECT_CONFIG.maxDelayMs
  );
  // Add jitter (±10%) to prevent thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

export const useFloorStore = create<FloorState>((set, get) => ({
  // Initial state
  client: null,
  room: null,
  isConnected: false,
  connectionStatus: "disconnected",
  teamId: null,
  reconnectAttempts: 0,
  reconnectTimeoutId: null,
  lastError: null,
  agents: [],
  messages: [],
  tasks: [],
  selectedAgentId: null,
  inputMessage: "",

  // Connect to Colyseus server
  connect: async (teamId: string) => {
    const { cancelReconnect } = get();

    // Cancel any pending reconnection
    cancelReconnect();

    set({
      connectionStatus: "connecting",
      teamId,
      lastError: null,
      reconnectAttempts: 0,
    });

    try {
      const client = new Client("ws://localhost:2567");
      const room = await client.joinOrCreate("floor", { teamId });

      set({
        client,
        room,
        teamId,
        isConnected: true,
        connectionStatus: "connected",
        reconnectAttempts: 0,
        lastError: null,
      });

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

      // Handle disconnection - trigger automatic reconnection
      room.onLeave((code) => {
        console.log(`📡 Disconnected from room (code: ${code})`);
        const { teamId: currentTeamId, reconnect } = get();

        set({
          isConnected: false,
          connectionStatus: "disconnected",
          room: null,
        });

        // Auto-reconnect for unexpected disconnections (not manual disconnect)
        // Code 1000 = normal closure, 4000+ = application-specific codes
        if (currentTeamId && code !== 1000 && code < 4000) {
          console.log("🔄 Initiating automatic reconnection...");
          reconnect();
        }
      });

      room.onError((code, message) => {
        console.error("Room error:", code, message);
        set({ lastError: `Room error: ${code} - ${message}` });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Connection failed:", errorMessage);

      set({
        isConnected: false,
        connectionStatus: "disconnected",
        lastError: errorMessage,
      });

      // For development, populate with mock data if server not running
      set({
        agents: getMockAgents(teamId),
        messages: getMockMessages(),
        tasks: getMockTasks(),
      });
    }
  },

  // Reconnect with exponential backoff
  reconnect: async () => {
    const { teamId, reconnectAttempts, connectionStatus } = get();

    // Don't reconnect if no teamId or already connecting/reconnecting
    if (!teamId || connectionStatus === "connecting" || connectionStatus === "reconnecting") {
      return;
    }

    // Check if max retries exceeded
    if (reconnectAttempts >= RECONNECT_CONFIG.maxRetries) {
      console.error(`❌ Max reconnection attempts (${RECONNECT_CONFIG.maxRetries}) exceeded`);
      set({
        connectionStatus: "failed",
        lastError: `Failed to reconnect after ${RECONNECT_CONFIG.maxRetries} attempts`,
      });
      return;
    }

    const nextAttempt = reconnectAttempts + 1;
    const delay = calculateBackoffDelay(reconnectAttempts);

    console.log(`🔄 Reconnection attempt ${nextAttempt}/${RECONNECT_CONFIG.maxRetries} in ${delay}ms`);

    set({
      connectionStatus: "reconnecting",
      reconnectAttempts: nextAttempt,
    });

    // Schedule reconnection with exponential backoff
    const timeoutId = setTimeout(async () => {
      try {
        const client = new Client("ws://localhost:2567");

        // Use reconnect to restore session if available, otherwise joinOrCreate
        const room = await client.joinOrCreate("floor", { teamId });

        console.log(`✅ Reconnected successfully after ${nextAttempt} attempt(s)`);

        set({
          client,
          room,
          isConnected: true,
          connectionStatus: "connected",
          reconnectAttempts: 0,
          reconnectTimeoutId: null,
          lastError: null,
        });

        // Re-attach state change listener
        room.onStateChange((state) => {
          const agents: Agent[] = [];
          const messages: FloorMessage[] = [];
          const tasks: Task[] = [];

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

        // Re-attach leave listener for future disconnections
        room.onLeave((code) => {
          console.log(`📡 Disconnected from room (code: ${code})`);
          const { teamId: currentTeamId, reconnect } = get();

          set({
            isConnected: false,
            connectionStatus: "disconnected",
            room: null,
          });

          if (currentTeamId && code !== 1000 && code < 4000) {
            console.log("🔄 Initiating automatic reconnection...");
            reconnect();
          }
        });

        room.onError((code, message) => {
          console.error("Room error:", code, message);
          set({ lastError: `Room error: ${code} - ${message}` });
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Reconnection attempt ${nextAttempt} failed:`, errorMessage);

        set({
          lastError: errorMessage,
          reconnectTimeoutId: null,
        });

        // Try again
        const { reconnect } = get();
        reconnect();
      }
    }, delay);

    set({ reconnectTimeoutId: timeoutId });
  },

  // Cancel pending reconnection
  cancelReconnect: () => {
    const { reconnectTimeoutId } = get();
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      set({
        reconnectTimeoutId: null,
        reconnectAttempts: 0,
      });
    }
  },

  disconnect: () => {
    const { room, cancelReconnect } = get();

    // Cancel any pending reconnection
    cancelReconnect();

    // Leave room with code 1000 (normal closure) to prevent auto-reconnect
    if (room) {
      room.leave(true); // consented leave
    }

    set({
      client: null,
      room: null,
      isConnected: false,
      connectionStatus: "disconnected",
      teamId: null,
      reconnectAttempts: 0,
      lastError: null,
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
