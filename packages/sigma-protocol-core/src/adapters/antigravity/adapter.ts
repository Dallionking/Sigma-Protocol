/**
 * Antigravity Platform Adapter
 * Implementation of PlatformAdapter for Antigravity
 * @module @sigma-protocol/core/adapters/antigravity
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
 * Antigravity-specific configuration
 */
export interface AntigravityAdapterConfig extends AdapterConfig {
  /**
   * Enable Loki mode for multi-agent sequential coordination
   */
  lokiEnabled?: boolean;

  /**
   * Maximum number of Loki agents (default: 5)
   */
  lokiMaxAgents?: number;

  /**
   * Loki coordination strategy
   */
  lokiCoordination?: "sequential" | "parallel";

  /**
   * Enable voice agent support (disabled by default)
   */
  voiceEnabled?: boolean;

  /**
   * Voice agent language
   */
  voiceLanguage?: string;

  /**
   * Maximum context tokens (default: 128000)
   */
  maxContextTokens?: number;
}

/**
 * Antigravity Platform Adapter
 *
 * Antigravity uses ".agent/skills/" for skill files and ".agent/commands/"
 * for commands. It runs Google Gemini models and supports Loki mode for
 * multi-agent sequential coordination (not traditional agent switching).
 */
export class AntigravityAdapter extends BaseAdapter {
  readonly platform: PlatformType = "antigravity";
  readonly version = "1.0.0";

  private stateManager: StateManager | null = null;
  private skillResolver: SkillResolver | null = null;
  private stepSequencer: StepSequencer | null = null;
  private qualityEngine: QualityGateEngine | null = null;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(config: AntigravityAdapterConfig) {
    super(config);
  }

  /**
   * Initialize the adapter
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log("info", "Initializing Antigravity adapter");

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

    // No agent loading — Antigravity uses Loki mode, not traditional agents

    this.initialized = true;
    this.log("info", "Antigravity adapter initialized", {
      skills: this.skillResolver.getStats().total,
    });
  }

  /**
   * Shutdown the adapter
   */
  async shutdown(): Promise<void> {
    this.ensureInitialized();

    this.log("info", "Shutting down Antigravity adapter");

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
   * Execute an agent — Antigravity uses Loki mode, not traditional agents
   */
  async executeAgent(_agent: AgentDefinition, _input: string): Promise<AgentResult> {
    throw new Error(
      "Antigravity uses Loki mode for multi-agent coordination. Use the Loki API directly."
    );
  }

  /**
   * Switch to a different agent — Antigravity uses Loki mode, not traditional agents
   */
  async switchAgent(_agentId: string): Promise<void> {
    throw new Error(
      "Antigravity uses Loki mode for multi-agent coordination. Use the Loki API directly."
    );
  }

  /**
   * Get active agent — always null for Antigravity (uses Loki mode)
   */
  getActiveAgent(): AgentDefinition | null {
    return null;
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
   * Get skills directory — Antigravity uses .agent/skills/
   */
  getSkillsDirectory(): string {
    const { join } = require("path");
    return this.config.skillsDir ?? join(this.config.projectRoot, ".agent", "skills");
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
 * Create an Antigravity adapter with default settings
 */
export function createAntigravityAdapter(projectRoot: string): AntigravityAdapter {
  return new AntigravityAdapter({ projectRoot });
}
