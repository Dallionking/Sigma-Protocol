/**
 * Agent Definition Types
 * Defines the structure for AI agents in Sigma Protocol
 * @module @sigma-protocol/core/types/agent
 */

/**
 * Supported AI model providers
 */
export type ModelProvider = "anthropic" | "openai" | "google" | "local";

/**
 * Valid model identifiers
 * Always use top-tier models by default
 */
export type ModelId =
  // Anthropic (prefer Opus 4.5)
  | "claude-opus-4-5-20251101"  // Top-tier default
  | "claude-sonnet-4-20250514"
  | "claude-opus-4-20250514"
  | "claude-3-5-sonnet"
  | "claude-3-opus"
  | "claude-3-haiku"
  // OpenAI (prefer GPT 5.2 / Codex 5.2)
  | "gpt-5.2"      // Top-tier default
  | "codex-5.2"    // Top-tier for code
  | "gpt-4o"
  | "gpt-4-turbo"
  | "o3"
  | "o3-mini"
  | "o1"
  | "o1-mini"
  // Google (prefer Gemini 3)
  | "gemini-3"         // Top-tier default
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "gemini-2.0-flash"
  // Local/Custom
  | "local"
  | string;

/**
 * Agent model configuration
 */
export interface AgentModelConfig {
  /**
   * Model provider
   */
  provider: ModelProvider;

  /**
   * Model identifier
   */
  modelId: ModelId;

  /**
   * Temperature for generation (0-2)
   */
  temperature?: number;

  /**
   * Maximum tokens to generate
   */
  maxTokens?: number;

  /**
   * Top-p sampling
   */
  topP?: number;

  /**
   * Stop sequences
   */
  stopSequences?: string[];
}

/**
 * Agent capability flags
 */
export interface AgentCapabilities {
  /**
   * Can read files
   */
  fileRead?: boolean;

  /**
   * Can write files
   */
  fileWrite?: boolean;

  /**
   * Can execute shell commands
   */
  shellExec?: boolean;

  /**
   * Can make web requests
   */
  webAccess?: boolean;

  /**
   * Can use MCP tools
   */
  mcpTools?: boolean;

  /**
   * Can spawn sub-agents
   */
  subAgents?: boolean;

  /**
   * Custom capabilities
   */
  custom?: Record<string, boolean>;
}

/**
 * Agent trigger condition
 */
export interface AgentTrigger {
  /**
   * Trigger type
   */
  type: "keyword" | "pattern" | "step" | "event" | "manual";

  /**
   * Trigger value (keyword, regex pattern, step number, or event name)
   */
  value: string | number;

  /**
   * Priority when multiple agents match (higher = preferred)
   */
  priority?: number;
}

/**
 * Agent skill reference
 */
export interface AgentSkillRef {
  /**
   * Skill ID
   */
  skillId: string;

  /**
   * Whether this skill is required
   */
  required?: boolean;
}

/**
 * Agent definition
 */
export interface AgentDefinition {
  /**
   * Unique agent identifier
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Agent description
   */
  description: string;

  /**
   * System prompt for the agent
   */
  systemPrompt: string;

  /**
   * Model configuration
   */
  model: AgentModelConfig;

  /**
   * Agent capabilities
   */
  capabilities: AgentCapabilities;

  /**
   * Trigger conditions for auto-activation
   */
  triggers: AgentTrigger[];

  /**
   * Skills this agent can use
   */
  skills: AgentSkillRef[];

  /**
   * Steps this agent is specialized for
   */
  specializedSteps?: number[];

  /**
   * Whether this agent requires HITL approval
   */
  requiresHITL?: boolean;

  /**
   * Agent category for organization
   */
  category?: string;

  /**
   * Tags for discovery
   */
  tags?: string[];

  /**
   * Whether agent is enabled
   */
  enabled?: boolean;
}

/**
 * Agent execution result
 */
export interface AgentResult {
  /**
   * Whether execution succeeded
   */
  success: boolean;

  /**
   * Output content
   */
  output: string;

  /**
   * Structured data output
   */
  data?: unknown;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Files created/modified
   */
  filesModified?: string[];

  /**
   * Tokens used
   */
  tokensUsed?: {
    input: number;
    output: number;
  };

  /**
   * Execution duration in milliseconds
   */
  durationMs?: number;

  /**
   * Whether HITL approval was requested
   */
  hitlRequested?: boolean;
}

/**
 * Agent registry interface
 */
export interface AgentRegistry {
  /**
   * Register an agent
   */
  register(agent: AgentDefinition): void;

  /**
   * Get agent by ID
   */
  get(id: string): AgentDefinition | undefined;

  /**
   * List all agents
   */
  list(): AgentDefinition[];

  /**
   * Find agents by trigger
   */
  findByTrigger(input: string): AgentDefinition[];

  /**
   * Find agents for a step
   */
  findByStep(stepNumber: number): AgentDefinition[];

  /**
   * Find agents by category
   */
  findByCategory(category: string): AgentDefinition[];
}

/**
 * Create a simple agent registry
 */
export function createAgentRegistry(): AgentRegistry {
  const agents = new Map<string, AgentDefinition>();

  return {
    register(agent: AgentDefinition): void {
      agents.set(agent.id, agent);
    },

    get(id: string): AgentDefinition | undefined {
      return agents.get(id);
    },

    list(): AgentDefinition[] {
      return Array.from(agents.values()).filter((a) => a.enabled !== false);
    },

    findByTrigger(input: string): AgentDefinition[] {
      const lowerInput = input.toLowerCase();

      return Array.from(agents.values())
        .filter((agent) => {
          if (agent.enabled === false) return false;

          return agent.triggers.some((trigger) => {
            if (trigger.type === "keyword") {
              return lowerInput.includes(String(trigger.value).toLowerCase());
            }
            if (trigger.type === "pattern") {
              const regex = new RegExp(String(trigger.value), "i");
              return regex.test(input);
            }
            return false;
          });
        })
        .sort((a, b) => {
          const aPriority = Math.max(...a.triggers.map((t) => t.priority ?? 0));
          const bPriority = Math.max(...b.triggers.map((t) => t.priority ?? 0));
          return bPriority - aPriority;
        });
    },

    findByStep(stepNumber: number): AgentDefinition[] {
      return Array.from(agents.values()).filter(
        (agent) =>
          agent.enabled !== false &&
          (agent.specializedSteps?.includes(stepNumber) ||
            agent.triggers.some(
              (t) => t.type === "step" && t.value === stepNumber
            ))
      );
    },

    findByCategory(category: string): AgentDefinition[] {
      return Array.from(agents.values()).filter(
        (agent) => agent.enabled !== false && agent.category === category
      );
    },
  };
}
