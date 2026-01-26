/**
 * Platform Adapter Interface
 * Defines the contract that all platform implementations must follow
 * @module @sigma-protocol/core/types/platform
 */

import type { SigmaState, HITLDecision } from "./state.js";
import type { ToolDefinition, ToolContext } from "./tool.js";
import type { AgentDefinition, AgentResult } from "./agent.js";
import type { HITLCheckpoint, StepDefinition } from "./step.js";

/**
 * Supported platform types
 */
export type PlatformType = "opencode" | "claude-code" | "cursor" | "factory-droid";

/**
 * Log levels for platform logging
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Platform adapter interface
 * All platform implementations must implement this interface
 */
export interface PlatformAdapter {
  /**
   * Platform identifier
   */
  readonly platform: PlatformType;

  /**
   * Adapter version
   */
  readonly version: string;

  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;

  /**
   * Shutdown the adapter
   */
  shutdown(): Promise<void>;

  // Tool Management

  /**
   * Execute a tool with given parameters
   */
  executeTool<T>(tool: ToolDefinition, params: unknown, context: ToolContext): Promise<T>;

  /**
   * Register a tool with the platform
   */
  registerTool(tool: ToolDefinition): void;

  /**
   * Get list of available tools
   */
  getAvailableTools(): ToolDefinition[];

  // Agent Management

  /**
   * Execute an agent with input
   */
  executeAgent(agent: AgentDefinition, input: string): Promise<AgentResult>;

  /**
   * Switch to a different agent
   */
  switchAgent(agentId: string): Promise<void>;

  /**
   * Get the currently active agent
   */
  getActiveAgent(): AgentDefinition | null;

  // State Management

  /**
   * Load state from storage
   */
  loadState(): Promise<SigmaState>;

  /**
   * Save state to storage
   */
  saveState(state: SigmaState): Promise<void>;

  // Step Execution

  /**
   * Execute tools for a specific step
   * This is platform-specific as different platforms have different tool implementations
   */
  executeStepTools(step: StepDefinition): Promise<StepOutputs>;

  // User Interaction

  /**
   * Show progress indicator
   */
  showProgress(step: number, progress: number, message?: string): void;

  /**
   * Prompt user for HITL decision
   */
  promptUser(checkpoint: HITLCheckpoint): Promise<HITLDecision>;

  /**
   * Display message to user
   */
  displayMessage(message: string, type?: "info" | "success" | "warning" | "error"): void;

  // Logging

  /**
   * Log a message
   */
  log(level: LogLevel, message: string, data?: unknown): void;

  // Skill Management

  /**
   * Get skill content by ID
   */
  getSkillContent(skillId: string): Promise<string | null>;

  /**
   * Get skills directory path
   */
  getSkillsDirectory(): string;
}

/**
 * Step execution outputs
 */
export interface StepOutputs {
  /**
   * Map of output name to content
   */
  [outputName: string]: string | Buffer | unknown;
}

/**
 * Base adapter configuration
 */
export interface AdapterConfig {
  /**
   * Project root directory
   */
  projectRoot: string;

  /**
   * State directory (default: .sigma)
   */
  stateDir?: string;

  /**
   * Skills directory
   */
  skillsDir?: string;

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Abstract base adapter with common functionality
 */
export abstract class BaseAdapter implements PlatformAdapter {
  abstract readonly platform: PlatformType;
  abstract readonly version: string;

  protected config: AdapterConfig;
  protected initialized = false;

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
  abstract executeTool<T>(tool: ToolDefinition, params: unknown, context: ToolContext): Promise<T>;
  abstract registerTool(tool: ToolDefinition): void;
  abstract getAvailableTools(): ToolDefinition[];
  abstract executeAgent(agent: AgentDefinition, input: string): Promise<AgentResult>;
  abstract switchAgent(agentId: string): Promise<void>;
  abstract getActiveAgent(): AgentDefinition | null;
  abstract loadState(): Promise<SigmaState>;
  abstract saveState(state: SigmaState): Promise<void>;
  abstract executeStepTools(step: StepDefinition): Promise<StepOutputs>;
  abstract showProgress(step: number, progress: number, message?: string): void;
  abstract promptUser(checkpoint: HITLCheckpoint): Promise<HITLDecision>;
  abstract displayMessage(message: string, type?: "info" | "success" | "warning" | "error"): void;

  log(level: LogLevel, message: string, data?: unknown): void {
    const prefix = `[${this.platform}]`;
    const timestamp = new Date().toISOString();

    switch (level) {
      case "debug":
        if (this.config.debug) {
          console.debug(`${timestamp} ${prefix} DEBUG: ${message}`, data ?? "");
        }
        break;
      case "info":
        console.info(`${timestamp} ${prefix} INFO: ${message}`, data ?? "");
        break;
      case "warn":
        console.warn(`${timestamp} ${prefix} WARN: ${message}`, data ?? "");
        break;
      case "error":
        console.error(`${timestamp} ${prefix} ERROR: ${message}`, data ?? "");
        break;
    }
  }

  async getSkillContent(skillId: string): Promise<string | null> {
    const { readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");

    const skillPath = join(this.getSkillsDirectory(), `${skillId}.md`);

    if (!existsSync(skillPath)) {
      return null;
    }

    return readFileSync(skillPath, "utf-8");
  }

  getSkillsDirectory(): string {
    const { join } = require("path");
    return this.config.skillsDir ?? join(this.config.projectRoot, ".claude", "skills");
  }

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Adapter not initialized. Call initialize() first.");
    }
  }
}
