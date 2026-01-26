/**
 * Step Definition Types
 * Defines the 13-step Sigma Protocol workflow structure
 * @module @sigma-protocol/core/types/step
 */

import type { StepStatus, HITLDecision } from "./state.js";

/**
 * Step categories for organization
 */
export type StepCategory =
  | "discovery"      // Steps 0-1.5
  | "design"         // Steps 2-4
  | "prototype"      // Steps 5-7
  | "specification"  // Steps 8-10
  | "implementation" // Steps 11-12
  | "delivery";      // Step 13

/**
 * Quality gate criteria
 */
export interface QualityGateCriteria {
  /**
   * Criteria identifier
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of what this criteria evaluates
   */
  description: string;

  /**
   * Weight in overall score (0-1)
   */
  weight: number;

  /**
   * Minimum score to pass (0-100)
   */
  minScore?: number;

  /**
   * Whether this criteria is required to pass
   */
  required?: boolean;
}

/**
 * Quality gate definition for a step
 */
export interface QualityGate {
  /**
   * Minimum overall score to pass (0-100)
   */
  minScore: number;

  /**
   * Individual criteria
   */
  criteria: QualityGateCriteria[];

  /**
   * Whether to block progression on failure
   */
  blockOnFailure?: boolean;

  /**
   * Allow manual override by user
   */
  allowOverride?: boolean;
}

/**
 * Quality gate score result
 */
export interface StepScore {
  /**
   * Overall score (0-100)
   */
  overall: number;

  /**
   * Individual criteria scores
   */
  criteria: Record<string, number>;

  /**
   * Whether step passes quality gate
   */
  passed: boolean;

  /**
   * Feedback for improvement
   */
  feedback: string[];

  /**
   * When score was calculated
   */
  evaluatedAt: string;
}

/**
 * HITL checkpoint types
 */
export type HITLCheckpointType =
  | "review"     // Review generated content
  | "approve"    // Approve before proceeding
  | "input"      // User input required
  | "decision"   // User decision needed
  | "validate";  // Validate implementation

/**
 * HITL checkpoint definition
 */
export interface HITLCheckpoint {
  /**
   * Unique checkpoint ID
   */
  id: string;

  /**
   * Checkpoint type
   */
  type: HITLCheckpointType;

  /**
   * When in step this checkpoint occurs
   */
  timing: "before" | "during" | "after";

  /**
   * Title shown to user
   */
  title: string;

  /**
   * Description of what user should review/decide
   */
  description: string;

  /**
   * Available actions for user
   */
  actions: Array<{
    id: string;
    label: string;
    type: HITLDecision["type"];
  }>;

  /**
   * Whether this checkpoint is required
   */
  required?: boolean;

  /**
   * Timeout in seconds (null = no timeout)
   */
  timeoutSeconds?: number | null;

  /**
   * Default action if timeout occurs
   */
  timeoutAction?: HITLDecision["type"];
}

/**
 * Step dependency configuration
 */
export interface StepDependency {
  /**
   * Required step number
   */
  stepNumber: number;

  /**
   * Required status (default: completed)
   */
  requiredStatus?: StepStatus;

  /**
   * Minimum score required (if quality gate exists)
   */
  minScore?: number;

  /**
   * Whether this dependency is soft (warning only)
   */
  soft?: boolean;
}

/**
 * Step output definition
 */
export interface StepOutput {
  /**
   * Output identifier
   */
  id: string;

  /**
   * Output name
   */
  name: string;

  /**
   * Output file path (relative to project root)
   */
  path: string;

  /**
   * Output type
   */
  type: "markdown" | "json" | "yaml" | "code" | "binary";

  /**
   * Whether this output is required
   */
  required?: boolean;

  /**
   * Template path for this output
   */
  template?: string;
}

/**
 * Step tool reference
 */
export interface StepToolRef {
  /**
   * Tool name
   */
  name: string;

  /**
   * Whether this tool is required
   */
  required?: boolean;

  /**
   * Default parameters
   */
  defaultParams?: Record<string, unknown>;
}

/**
 * Complete step definition
 */
export interface StepDefinition {
  /**
   * Step number (0-13, with 1.5 and 11.5 as decimals)
   */
  number: number;

  /**
   * Step name
   */
  name: string;

  /**
   * Step description
   */
  description: string;

  /**
   * Step category
   */
  category: StepCategory;

  /**
   * Dependencies on other steps
   */
  dependencies: StepDependency[];

  /**
   * Quality gate for this step
   */
  qualityGate: QualityGate;

  /**
   * HITL checkpoints in this step
   */
  hitlCheckpoints: HITLCheckpoint[];

  /**
   * Expected outputs from this step
   */
  outputs: StepOutput[];

  /**
   * Tools used by this step
   */
  tools: StepToolRef[];

  /**
   * Skills recommended for this step
   */
  skills?: string[];

  /**
   * Agents specialized for this step
   */
  agents?: string[];

  /**
   * Whether this step is optional
   */
  optional?: boolean;

  /**
   * Condition for when step should be included
   */
  condition?: {
    type: "state" | "output" | "custom";
    expression: string;
  };

  /**
   * Estimated duration hint
   */
  estimatedMinutes?: number;

  /**
   * Tags for filtering
   */
  tags?: string[];
}

/**
 * Step execution context
 */
export interface StepExecutionContext {
  /**
   * Step being executed
   */
  step: StepDefinition;

  /**
   * Project root path
   */
  projectRoot: string;

  /**
   * Outputs from previous steps
   */
  previousOutputs: Record<number, Record<string, unknown>>;

  /**
   * Custom context data
   */
  metadata?: Record<string, unknown>;
}

/**
 * Step registry interface
 */
export interface StepRegistry {
  /**
   * Get step by number
   */
  get(stepNumber: number): StepDefinition | undefined;

  /**
   * List all steps in order
   */
  list(): StepDefinition[];

  /**
   * Get steps by category
   */
  getByCategory(category: StepCategory): StepDefinition[];

  /**
   * Check if step can be started (dependencies met)
   */
  canStart(stepNumber: number, completedSteps: number[]): boolean;

  /**
   * Get next step after given step
   */
  getNext(currentStep: number): StepDefinition | undefined;

  /**
   * Get all required steps (non-optional)
   */
  getRequired(): StepDefinition[];
}

/**
 * Standard Sigma Protocol steps
 */
export const SIGMA_STEPS: readonly number[] = [
  0,    // Environment Setup
  1,    // Ideation
  1.5,  // Offer Architecture (conditional)
  2,    // Architecture
  3,    // UX Design
  4,    // Flow Tree
  5,    // Wireframe Prototypes
  6,    // Design System
  7,    // Interface States
  8,    // Technical Spec
  9,    // Landing Page (optional)
  10,   // Feature Breakdown
  11,   // PRD Generation
  11.5, // PRD Swarm (optional)
  12,   // Context Engine
  13,   // Skillpack Generator
] as const;

/**
 * Check if a step number is valid
 */
export function isValidStepNumber(stepNumber: number): boolean {
  return SIGMA_STEPS.includes(stepNumber as typeof SIGMA_STEPS[number]);
}

/**
 * Get step category by number
 */
export function getStepCategory(stepNumber: number): StepCategory {
  if (stepNumber <= 1.5) return "discovery";
  if (stepNumber <= 4) return "design";
  if (stepNumber <= 7) return "prototype";
  if (stepNumber <= 10) return "specification";
  if (stepNumber <= 12) return "implementation";
  return "delivery";
}
