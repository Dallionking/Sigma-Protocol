/**
 * Factory Droid Platform Adapter
 * Implements PlatformAdapter for Factory Droid
 * @module @sigma-protocol/core/adapters/factory-droid
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
 * Factory Droid-specific configuration
 */
export interface FactoryDroidAdapterConfig extends AdapterConfig {
  /**
   * Path to commands directory
   */
  commandsDir?: string;

  /**
   * Path to droids directory (Factory Droid's equivalent of agents)
   */
  droidsDir?: string;

  /**
   * Reasoning effort level for Factory Droid
   */
  reasoningEffort?: "low" | "medium" | "high";
}

/**
 * Factory Droid Platform Adapter
 */
export class FactoryDroidAdapter extends BaseAdapter {
  readonly platform: PlatformType = "factory-droid";
  readonly version = "1.0.0";

  private stateManager: StateManager | null = null;
  private skillResolver: SkillResolver | null = null;
  private stepSequencer: StepSequencer | null = null;
  private qualityEngine: QualityGateEngine | null = null;
  private tools: Map<string, ToolDefinition> = new Map();
  private agents: Map<string, AgentDefinition> = new Map();
  private activeAgent: AgentDefinition | null = null;
  private factoryDroidConfig: FactoryDroidAdapterConfig;

  constructor(config: FactoryDroidAdapterConfig) {
    super(config);
    this.factoryDroidConfig = {
      ...config,
      commandsDir: config.commandsDir ?? ".factory/commands",
      droidsDir: config.droidsDir ?? ".factory/droids",
      reasoningEffort: config.reasoningEffort ?? "high",
    };
  }

  /**
   * Initialize the adapter
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log("info", "Initializing Factory Droid adapter");

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

    // Load droids (Factory Droid's agents)
    await this.loadDroids();

    this.initialized = true;
    this.log("info", "Factory Droid adapter initialized", {
      skills: this.skillResolver.getStats().total,
      droids: this.agents.size,
      reasoningEffort: this.factoryDroidConfig.reasoningEffort,
    });
  }

  /**
   * Shutdown the adapter
   */
  async shutdown(): Promise<void> {
    this.ensureInitialized();

    this.log("info", "Shutting down Factory Droid adapter");

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
   * Execute an agent (droid)
   */
  async executeAgent(agent: AgentDefinition, input: string): Promise<AgentResult> {
    this.ensureInitialized();

    this.log("info", `Executing droid: ${agent.name}`, { inputLength: input.length });

    const startTime = Date.now();

    try {
      const duration = Date.now() - startTime;

      const result: AgentResult = {
        success: true,
        output: `Droid ${agent.name} executed with input of ${input.length} characters`,
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
      this.log("error", `Droid ${agent.name} failed`, { error });
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Switch to a different agent (droid)
   */
  async switchAgent(agentId: string): Promise<void> {
    this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Droid not found: ${agentId}`);
    }

    this.activeAgent = agent;

    // Update state
    const state = await this.loadState();
    state.agents.activeAgentId = agentId;
    await this.saveState(state);

    this.log("info", `Switched to droid: ${agent.name}`);
  }

  /**
   * Get active agent (droid)
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
    const progressBar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
    console.log(`Step ${step}: [${progressBar}] ${progress}% ${message ?? ""}`);
  }

  /**
   * Prompt user for HITL decision
   */
  async promptUser(checkpoint: HITLCheckpoint): Promise<HITLDecision> {
    this.ensureInitialized();

    this.log("info", `HITL checkpoint: ${checkpoint.title}`);

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
    return this.config.skillsDir ?? join(this.config.projectRoot, ".factory", "skills");
  }

  /**
   * Load droids from directory
   * Factory Droid uses .md files for droid definitions
   */
  private async loadDroids(): Promise<void> {
    const { join } = await import("path");
    const { existsSync } = await import("fs");
    const { readdir, readFile } = await import("fs/promises");

    const droidsDir = join(this.config.projectRoot, this.factoryDroidConfig.droidsDir!);

    if (!existsSync(droidsDir)) {
      this.log("debug", "Droids directory not found, skipping droid loading");
      return;
    }

    try {
      const files = await readdir(droidsDir);

      for (const file of files) {
        if (!file.endsWith(".md")) continue;

        try {
          const content = await readFile(join(droidsDir, file), "utf-8");

          // Parse droid definition from markdown frontmatter or content
          const idMatch = content.match(/id:\s*["']?([^\s"']+)["']?/) ??
            [null, file.replace(/\.md$/, "")];
          const nameMatch = content.match(/name:\s*["']?([^\n"']+)["']?/) ??
            [null, file.replace(/\.md$/, "")];
          const descMatch = content.match(/description:\s*["']?([^\n"']+)["']?/);

          const agent: AgentDefinition = {
            id: idMatch[1]!,
            name: nameMatch[1]!,
            description: descMatch?.[1] ?? "",
            systemPrompt: content,
            model: {
              provider: "anthropic",
              modelId: "claude-sonnet-4-20250514",
            },
            capabilities: {},
            triggers: [],
            skills: [],
          };

          this.agents.set(agent.id, agent);
        } catch {
          this.log("warn", `Failed to parse droid file: ${file}`);
        }
      }

      this.log("debug", `Loaded ${this.agents.size} droids`);
    } catch (error) {
      this.log("warn", "Failed to load droids", { error });
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
 * Create a Factory Droid adapter with default settings
 */
export function createFactoryDroidAdapter(projectRoot: string): FactoryDroidAdapter {
  return new FactoryDroidAdapter({ projectRoot });
}
