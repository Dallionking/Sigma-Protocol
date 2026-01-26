/**
 * OpenCode Platform Adapter
 * Reference implementation of PlatformAdapter for OpenCode
 * @module @sigma-protocol/core/adapters/opencode
 */

import {
  BaseAdapter,
  type PlatformType,
  type AdapterConfig,
  type StepOutputs,
  type ToolDefinition,
  type ToolContext,
  type AgentDefinition,
  type AgentResult,
  type SigmaState,
  type HITLCheckpoint,
  type HITLDecision,
  type StepDefinition,
} from "../../types/index.js";
import { StateManager, createStateManager } from "../../state/index.js";
import { SkillResolver, createSkillResolver } from "../../skills/index.js";
import { StepSequencer, createStepSequencer } from "../../steps/index.js";
import { QualityGateEngine, createQualityGateEngine } from "../../quality/index.js";

/**
 * OpenCode-specific configuration
 */
export interface OpenCodeAdapterConfig extends AdapterConfig {
  /**
   * Path to agents directory
   */
  agentsDir?: string;

  /**
   * Path to commands directory
   */
  commandsDir?: string;

  /**
   * Enable background tasks
   */
  backgroundTasks?: boolean;
}

/**
 * OpenCode Platform Adapter
 */
export class OpenCodeAdapter extends BaseAdapter {
  readonly platform: PlatformType = "opencode";
  readonly version = "1.0.0";

  private stateManager: StateManager | null = null;
  private skillResolver: SkillResolver | null = null;
  private stepSequencer: StepSequencer | null = null;
  private qualityEngine: QualityGateEngine | null = null;
  private tools: Map<string, ToolDefinition> = new Map();
  private agents: Map<string, AgentDefinition> = new Map();
  private activeAgent: AgentDefinition | null = null;
  private openCodeConfig: OpenCodeAdapterConfig;

  constructor(config: OpenCodeAdapterConfig) {
    super(config);
    this.openCodeConfig = {
      ...config,
      agentsDir: config.agentsDir ?? ".opencode/agents",
      commandsDir: config.commandsDir ?? ".opencode/commands",
      backgroundTasks: config.backgroundTasks ?? true,
    };
  }

  /**
   * Initialize the adapter
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log("info", "Initializing OpenCode adapter");

    // Initialize state manager
    this.stateManager = createStateManager(this.config.projectRoot);
    await this.stateManager.initialize();

    // Initialize skill resolver
    this.skillResolver = createSkillResolver(this.getSkillsDirectory());
    await this.skillResolver.loadAll();

    // Initialize step sequencer
    this.stepSequencer = createStepSequencer();

    // Initialize quality engine
    this.qualityEngine = createQualityGateEngine();

    // Load agents
    await this.loadAgents();

    this.initialized = true;
    this.log("info", "OpenCode adapter initialized", {
      skills: this.skillResolver.getStats().total,
      agents: this.agents.size,
    });
  }

  /**
   * Shutdown the adapter
   */
  async shutdown(): Promise<void> {
    this.ensureInitialized();

    this.log("info", "Shutting down OpenCode adapter");

    // Save any pending state
    if (this.stateManager?.isDirty()) {
      await this.stateManager.save();
    }

    this.initialized = false;
  }

  /**
   * Execute a tool
   */
  async executeTool<T>(
    tool: ToolDefinition,
    params: unknown,
    context: ToolContext
  ): Promise<T> {
    this.ensureInitialized();

    this.log("debug", `Executing tool: ${tool.name}`, { params });

    const startTime = Date.now();

    try {
      const result = await tool.execute(params, context);
      const duration = Date.now() - startTime;

      this.log("debug", `Tool ${tool.name} completed`, { duration, success: result.success });

      if (!result.success) {
        throw new Error(result.error ?? "Tool execution failed");
      }

      return result.data as T;
    } catch (error) {
      this.log("error", `Tool ${tool.name} failed`, { error });
      throw error;
    }
  }

  /**
   * Register a tool
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    this.log("debug", `Registered tool: ${tool.name}`);
  }

  /**
   * Get available tools
   */
  getAvailableTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute an agent
   */
  async executeAgent(agent: AgentDefinition, input: string): Promise<AgentResult> {
    this.ensureInitialized();

    this.log("info", `Executing agent: ${agent.name}`, { inputLength: input.length });

    const startTime = Date.now();

    try {
      // OpenCode-specific agent execution
      // In a real implementation, this would call the OpenCode API
      // For now, we return a placeholder

      const duration = Date.now() - startTime;

      const result: AgentResult = {
        success: true,
        output: `Agent ${agent.name} executed with input of ${input.length} characters`,
        durationMs: duration,
        tokensUsed: {
          input: Math.ceil(input.length / 4),
          output: 50,
        },
      };

      // Record in state
      const state = await this.loadState();
      state.agents.history.push({
        agentId: agent.id,
        input: input.substring(0, 100),
        output: result.output.substring(0, 100),
        timestamp: new Date().toISOString(),
        success: true,
      });
      await this.saveState(state);

      return result;
    } catch (error) {
      this.log("error", `Agent ${agent.name} failed`, { error });
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Switch to a different agent
   */
  async switchAgent(agentId: string): Promise<void> {
    this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    this.activeAgent = agent;

    // Update state
    const state = await this.loadState();
    state.agents.activeAgentId = agentId;
    await this.saveState(state);

    this.log("info", `Switched to agent: ${agent.name}`);
  }

  /**
   * Get active agent
   */
  getActiveAgent(): AgentDefinition | null {
    return this.activeAgent;
  }

  /**
   * Load state
   */
  async loadState(): Promise<SigmaState> {
    this.ensureInitialized();
    return this.stateManager!.getState() as SigmaState;
  }

  /**
   * Save state
   */
  async saveState(_state: SigmaState): Promise<void> {
    this.ensureInitialized();
    // The state manager handles the actual state internally
    // We need to update it through the manager's methods
    await this.stateManager!.save();
  }

  /**
   * Execute tools for a step
   */
  async executeStepTools(step: StepDefinition): Promise<StepOutputs> {
    this.ensureInitialized();

    const outputs: StepOutputs = {};

    this.log("info", `Executing tools for step ${step.number}: ${step.name}`);

    // Update state to in_progress
    await this.stateManager!.updateStepStatus(step.number, "in_progress");

    try {
      // Execute each tool for the step
      for (const toolRef of step.tools) {
        const tool = this.tools.get(toolRef.name);
        if (!tool) {
          if (toolRef.required) {
            throw new Error(`Required tool not found: ${toolRef.name}`);
          }
          continue;
        }

        const context: ToolContext = {
          state: await this.loadState(),
          currentStep: step.number,
          projectRoot: this.config.projectRoot,
        };

        const result = await this.executeTool(tool, toolRef.defaultParams ?? {}, context);
        outputs[toolRef.name] = result;
      }

      // Evaluate quality gate
      const evaluation = await this.qualityEngine!.evaluate(
        step,
        outputs,
        this.config.projectRoot
      );

      // Update state with result
      await this.stateManager!.updateStepStatus(
        step.number,
        evaluation.passed ? "completed" : "failed",
        evaluation.score
      );

      if (!evaluation.passed) {
        this.log("warn", `Step ${step.number} failed quality gate`, {
          score: evaluation.score,
          feedback: evaluation.feedback,
        });
      }

      return outputs;
    } catch (error) {
      await this.stateManager!.updateStepStatus(step.number, "failed");
      throw error;
    }
  }

  /**
   * Show progress
   */
  showProgress(step: number, progress: number, message?: string): void {
    // OpenCode progress display
    const progressBar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
    console.log(`Step ${step}: [${progressBar}] ${progress}% ${message ?? ""}`);
  }

  /**
   * Prompt user for HITL decision
   */
  async promptUser(checkpoint: HITLCheckpoint): Promise<HITLDecision> {
    this.ensureInitialized();

    this.log("info", `HITL checkpoint: ${checkpoint.title}`);

    // In a real implementation, this would use OpenCode's UI
    // For now, we auto-approve
    console.log(`\n=== HITL CHECKPOINT ===`);
    console.log(`Title: ${checkpoint.title}`);
    console.log(`Description: ${checkpoint.description}`);
    console.log(`Actions: ${checkpoint.actions.map((a) => a.label).join(", ")}`);
    console.log(`======================\n`);

    // Default to approve for programmatic use
    return {
      type: "approve",
      timestamp: new Date().toISOString(),
      feedback: "Auto-approved",
    };
  }

  /**
   * Display message
   */
  displayMessage(message: string, type?: "info" | "success" | "warning" | "error"): void {
    const prefix = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    }[type ?? "info"];

    console.log(`${prefix} ${message}`);
  }

  /**
   * Get skills directory
   */
  getSkillsDirectory(): string {
    const { join } = require("path");
    return this.config.skillsDir ?? join(this.config.projectRoot, ".opencode", "skill");
  }

  /**
   * Load agents from directory
   */
  private async loadAgents(): Promise<void> {
    const { join } = await import("path");
    const { existsSync } = await import("fs");
    const { readdir, readFile } = await import("fs/promises");

    const agentsDir = join(this.config.projectRoot, this.openCodeConfig.agentsDir!);

    if (!existsSync(agentsDir)) {
      this.log("debug", "Agents directory not found, skipping agent loading");
      return;
    }

    try {
      const files = await readdir(agentsDir);

      for (const file of files) {
        if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

        try {
          const content = await readFile(join(agentsDir, file), "utf-8");

          // Parse agent definition from file content
          // This is a simplified parser - real implementation would use proper AST parsing
          const idMatch = content.match(/id:\s*["']([^"']+)["']/);
          const nameMatch = content.match(/name:\s*["']([^"']+)["']/);

          if (idMatch && nameMatch) {
            const agent: AgentDefinition = {
              id: idMatch[1],
              name: nameMatch[1],
              description: "",
              systemPrompt: "",
              model: {
                provider: "anthropic",
                modelId: "claude-sonnet-4-20250514",
              },
              capabilities: {},
              triggers: [],
              skills: [],
            };

            this.agents.set(agent.id, agent);
          }
        } catch {
          this.log("warn", `Failed to parse agent file: ${file}`);
        }
      }

      this.log("debug", `Loaded ${this.agents.size} agents`);
    } catch (error) {
      this.log("warn", "Failed to load agents", { error });
    }
  }

  /**
   * Get step sequencer
   */
  getStepSequencer(): StepSequencer {
    this.ensureInitialized();
    return this.stepSequencer!;
  }

  /**
   * Get skill resolver
   */
  getSkillResolver(): SkillResolver {
    this.ensureInitialized();
    return this.skillResolver!;
  }

  /**
   * Get quality engine
   */
  getQualityEngine(): QualityGateEngine {
    this.ensureInitialized();
    return this.qualityEngine!;
  }
}

/**
 * Create an OpenCode adapter with default settings
 */
export function createOpenCodeAdapter(projectRoot: string): OpenCodeAdapter {
  return new OpenCodeAdapter({ projectRoot });
}
