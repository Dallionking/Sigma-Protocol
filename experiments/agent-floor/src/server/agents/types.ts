/**
 * Types for the Agent Manager system
 * Shared types for AgentManager, AgentWorker, and related components
 */

import type { AgentStatus, AgentRole } from "@/types/agent";

/**
 * Configuration for spawning an AgentWorker
 */
export interface AgentWorkerConfig {
  agentId: string;
  tickIntervalMs?: number; // Default: 5000ms
}

/**
 * State transition event emitted by AgentWorker
 */
export interface AgentStateTransition {
  agentId: string;
  from: AgentStatus;
  to: AgentStatus;
  timestamp: number;
  reason?: string;
}

/**
 * Task assignment payload
 */
export interface TaskAssignmentPayload {
  taskId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
}

/**
 * Agent work context passed to the work loop
 */
export interface AgentWorkContext {
  agentId: string;
  name: string;
  role: AgentRole;
  systemPrompt: string;
  provider: string;
  model: string;
  currentTask: TaskAssignmentPayload | null;
  talkingTo: string | null;
}

/**
 * Result of a work loop tick
 */
export interface WorkTickResult {
  action: "idle" | "thinking" | "working" | "talking" | "completed";
  targetAgentId?: string; // For talking action
  message?: string; // For logging/debugging
}

/**
 * Role to task type mapping for intelligent routing
 */
export const ROLE_TASK_KEYWORDS: Record<AgentRole, string[]> = {
  "project-manager": [
    "plan",
    "coordinate",
    "requirement",
    "schedule",
    "sprint",
    "roadmap",
    "assign",
    "track",
  ],
  architect: [
    "design",
    "architecture",
    "review",
    "technical",
    "pattern",
    "scale",
    "system",
    "diagram",
  ],
  "frontend-engineer": [
    "ui",
    "react",
    "component",
    "css",
    "style",
    "layout",
    "responsive",
    "animation",
  ],
  "backend-engineer": [
    "api",
    "database",
    "server",
    "endpoint",
    "query",
    "integration",
    "auth",
    "cache",
  ],
  "qa-engineer": [
    "test",
    "bug",
    "quality",
    "validation",
    "coverage",
    "regression",
    "automation",
    "fix",
  ],
  "devops-engineer": [
    "deploy",
    "ci",
    "cd",
    "pipeline",
    "docker",
    "kubernetes",
    "monitoring",
    "infrastructure",
  ],
  analyst: [
    "research",
    "data",
    "market",
    "trend",
    "report",
    "insight",
    "analysis",
    "metrics",
  ],
  quant: [
    "model",
    "algorithm",
    "quantitative",
    "statistical",
    "backtest",
    "signal",
    "strategy",
    "math",
  ],
  "risk-manager": [
    "risk",
    "exposure",
    "limit",
    "compliance",
    "monitor",
    "hedge",
    "var",
    "stress",
  ],
  trader: [
    "trade",
    "execute",
    "order",
    "position",
    "market",
    "price",
    "fill",
    "slippage",
  ],
  compliance: [
    "regulatory",
    "audit",
    "policy",
    "legal",
    "rule",
    "documentation",
    "report",
    "compliance",
  ],
  writer: [
    "write",
    "content",
    "copy",
    "article",
    "blog",
    "script",
    "narrative",
    "story",
  ],
  designer: [
    "design",
    "visual",
    "graphic",
    "brand",
    "color",
    "typography",
    "mockup",
    "asset",
  ],
  reviewer: [
    "review",
    "feedback",
    "critique",
    "approve",
    "reject",
    "comment",
    "suggestion",
    "edit",
  ],
  editor: [
    "edit",
    "proofread",
    "refine",
    "polish",
    "grammar",
    "clarity",
    "tone",
    "final",
  ],
  producer: [
    "produce",
    "manage",
    "timeline",
    "resource",
    "budget",
    "deliverable",
    "milestone",
    "coordinate",
  ],
};

/**
 * Valid state transitions for agent state machine
 */
export const VALID_STATE_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  idle: ["thinking", "walking"],
  thinking: ["idle", "working", "talking", "walking"],
  working: ["idle", "thinking", "talking"],
  talking: ["idle", "thinking", "working"],
  walking: ["idle", "thinking", "talking"],
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: AgentStatus, to: AgentStatus): boolean {
  return VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
