export type AgentStatus = "idle" | "thinking" | "working" | "talking" | "walking";

// Personality traits for PRD-019
export type PersonalityTrait = "introvert" | "extrovert";
export type CommunicationStyle = "formal" | "casual";

export interface PersonalityTraits {
  sociability: PersonalityTrait;
  communication: CommunicationStyle;
}

// Mood system for PRD-019
export type AgentMood = "happy" | "stressed" | "focused" | "tired";

// Fatigue system for PRD-019
export interface FatigueState {
  level: number; // 0-100, where 100 is fully rested
  lastBreak: number; // timestamp of last break
  tasksCompletedSinceBreak: number;
}

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
  // Personality & mood (PRD-019)
  personality: PersonalityTraits;
  mood: AgentMood;
  fatigue: FatigueState;
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
  // Personality & mood (PRD-019)
  personality?: Partial<PersonalityTraits>;
  mood?: AgentMood;
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
