export type AgentStatus = "idle" | "thinking" | "working" | "talking" | "walking";

export type AgentRole =
  | "project-manager"
  | "architect"
  | "frontend-engineer"
  | "backend-engineer"
  | "qa-engineer"
  | "devops-engineer"
  | "analyst"
  | "quant"
  | "risk-manager"
  | "trader"
  | "compliance"
  | "writer"
  | "designer"
  | "reviewer"
  | "editor"
  | "producer";

export interface Position {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  position: Position;
  desk: Position;
  status: AgentStatus;
  currentTask: string | null;
  talkingTo: string | null;
  provider: string;
  model: string;
  systemPrompt: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  desk: Position;
  systemPrompt: string;
  provider?: string;
  model?: string;
}

export interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  map: string;
  agents: AgentConfig[];
}

export interface AgentThought {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: "thinking" | "decision" | "question" | "answer";
}
