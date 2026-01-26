/**
 * Sigma Protocol Core Types
 * Re-exports all type definitions for the core package
 * @module @sigma-protocol/core/types
 */

// State types
export {
  STATE_SCHEMA_VERSION,
  type PlatformType,
  type StepStatus,
  type HITLDecisionType,
  type HITLDecision,
  type StepExecutionState,
  type WorkflowExecutionState,
  type PendingHITL,
  type HITLState,
  type AgentState,
  type PRDState,
  type StateSnapshot,
  type StateMetadata,
  type SigmaState,
  createInitialState,
  validateState,
} from "./state.js";

// Agent types
export {
  type ModelProvider,
  type ModelId,
  type AgentModelConfig,
  type AgentCapabilities,
  type AgentTrigger,
  type AgentSkillRef,
  type AgentDefinition,
  type AgentResult,
  type AgentRegistry,
  createAgentRegistry,
} from "./agent.js";

// Step types
export {
  type StepCategory,
  type QualityGateCriteria,
  type QualityGate,
  type StepScore,
  type HITLCheckpointType,
  type HITLCheckpoint,
  type StepDependency,
  type StepOutput,
  type StepToolRef,
  type StepDefinition,
  type StepExecutionContext,
  type StepRegistry,
  SIGMA_STEPS,
  isValidStepNumber,
  getStepCategory,
} from "./step.js";

// Tool types
export {
  type ToolParameterType,
  type ToolParameter,
  type ToolContext,
  type ToolResult,
  type ToolExecutor,
  type ToolDefinition,
  type ToolRegistry,
  createToolRegistry,
  validateToolParams,
} from "./tool.js";

// Platform types
export {
  type LogLevel,
  type PlatformAdapter,
  type StepOutputs,
  type AdapterConfig,
  BaseAdapter,
} from "./platform.js";
