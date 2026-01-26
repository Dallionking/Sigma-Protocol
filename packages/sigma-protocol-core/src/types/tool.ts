/**
 * Tool Definition Interface
 * Defines the structure for platform tools
 * @module @sigma-protocol/core/types/tool
 */

import type { SigmaState } from "./state.js";

/**
 * Parameter types supported by tools
 */
export type ToolParameterType = "string" | "number" | "boolean" | "object" | "array";

/**
 * Tool parameter definition
 */
export interface ToolParameter {
  /**
   * Parameter name
   */
  name: string;

  /**
   * Parameter type
   */
  type: ToolParameterType;

  /**
   * Human-readable description
   */
  description: string;

  /**
   * Whether this parameter is required
   */
  required: boolean;

  /**
   * Default value if not provided
   */
  default?: unknown;

  /**
   * Validation pattern (for strings)
   */
  pattern?: string;

  /**
   * Enumerated valid values
   */
  enum?: unknown[];

  /**
   * Minimum value (for numbers)
   */
  minimum?: number;

  /**
   * Maximum value (for numbers)
   */
  maximum?: number;
}

/**
 * Context provided to tool execution
 */
export interface ToolContext {
  /**
   * Current workflow state
   */
  state: SigmaState;

  /**
   * Current step number (if in step execution)
   */
  currentStep: number | null;

  /**
   * Project root directory
   */
  projectRoot: string;

  /**
   * Additional context data
   */
  metadata?: Record<string, unknown>;
}

/**
 * Result of tool execution
 */
export interface ToolResult<T = unknown> {
  /**
   * Whether the tool succeeded
   */
  success: boolean;

  /**
   * Result data (if successful)
   */
  data?: T;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Execution time in milliseconds
   */
  executionTime?: number;
}

/**
 * Tool execution function type
 */
export type ToolExecutor<TParams = unknown, TResult = unknown> = (
  params: TParams,
  context: ToolContext
) => Promise<ToolResult<TResult>>;

/**
 * Tool definition
 */
export interface ToolDefinition<TParams = unknown, TResult = unknown> {
  /**
   * Unique tool name
   */
  name: string;

  /**
   * Human-readable description
   */
  description: string;

  /**
   * Tool parameters
   */
  parameters: ToolParameter[];

  /**
   * Tool execution function
   */
  execute: ToolExecutor<TParams, TResult>;

  /**
   * Tool category for organization
   */
  category?: string;

  /**
   * Whether this tool requires confirmation before execution
   */
  requiresConfirmation?: boolean;

  /**
   * Tags for discovery
   */
  tags?: string[];
}

/**
 * Tool registry interface
 */
export interface ToolRegistry {
  /**
   * Register a tool
   */
  register<TParams, TResult>(tool: ToolDefinition<TParams, TResult>): void;

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined;

  /**
   * List all registered tools
   */
  list(): ToolDefinition[];

  /**
   * Find tools by category
   */
  findByCategory(category: string): ToolDefinition[];

  /**
   * Find tools by tag
   */
  findByTag(tag: string): ToolDefinition[];
}

/**
 * Create a simple tool registry
 */
export function createToolRegistry(): ToolRegistry {
  const tools = new Map<string, ToolDefinition>();

  return {
    register<TParams, TResult>(tool: ToolDefinition<TParams, TResult>): void {
      tools.set(tool.name, tool as ToolDefinition);
    },

    get(name: string): ToolDefinition | undefined {
      return tools.get(name);
    },

    list(): ToolDefinition[] {
      return Array.from(tools.values());
    },

    findByCategory(category: string): ToolDefinition[] {
      return Array.from(tools.values()).filter((t) => t.category === category);
    },

    findByTag(tag: string): ToolDefinition[] {
      return Array.from(tools.values()).filter((t) => t.tags?.includes(tag));
    },
  };
}

/**
 * Validate tool parameters against definition
 */
export function validateToolParams(
  tool: ToolDefinition,
  params: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const param of tool.parameters) {
    const value = params[param.name];

    // Check required
    if (param.required && value === undefined) {
      errors.push(`Missing required parameter: ${param.name}`);
      continue;
    }

    // Skip validation if not provided and not required
    if (value === undefined) {
      continue;
    }

    // Type validation
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== param.type) {
      errors.push(
        `Parameter "${param.name}" expected ${param.type}, got ${actualType}`
      );
    }

    // Pattern validation (for strings)
    if (param.type === "string" && param.pattern) {
      const regex = new RegExp(param.pattern);
      if (!regex.test(value as string)) {
        errors.push(
          `Parameter "${param.name}" does not match pattern: ${param.pattern}`
        );
      }
    }

    // Enum validation
    if (param.enum && !param.enum.includes(value)) {
      errors.push(
        `Parameter "${param.name}" must be one of: ${param.enum.join(", ")}`
      );
    }

    // Range validation (for numbers)
    if (param.type === "number") {
      if (param.minimum !== undefined && (value as number) < param.minimum) {
        errors.push(
          `Parameter "${param.name}" must be >= ${param.minimum}`
        );
      }
      if (param.maximum !== undefined && (value as number) > param.maximum) {
        errors.push(
          `Parameter "${param.name}" must be <= ${param.maximum}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
