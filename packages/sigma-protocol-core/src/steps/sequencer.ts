/**
 * Step Sequencer
 * Manages step execution order, dependency resolution, and workflow progression
 * @module @sigma-protocol/core/steps/sequencer
 */

import type { StepDefinition, StepRegistry } from "../types/step.js";
import type { SigmaState, StepStatus } from "../types/state.js";
import { STEP_DEFINITIONS } from "./definitions.js";

/**
 * Dependency check result
 */
export interface DependencyCheckResult {
  /**
   * Whether all dependencies are satisfied
   */
  satisfied: boolean;

  /**
   * Missing dependencies (step numbers)
   */
  missing: number[];

  /**
   * Dependencies with insufficient scores
   */
  insufficientScores: Array<{ stepNumber: number; required: number; actual: number }>;

  /**
   * Soft dependencies that are warnings only
   */
  warnings: number[];
}

/**
 * Step sequencer for managing workflow progression
 */
export class StepSequencer implements StepRegistry {
  private steps: Map<number, StepDefinition>;

  constructor(customSteps?: StepDefinition[]) {
    this.steps = new Map();

    // Load step definitions
    const stepsToLoad = customSteps ?? [...STEP_DEFINITIONS];
    for (const step of stepsToLoad) {
      this.steps.set(step.number, step);
    }
  }

  /**
   * Get step by number
   */
  get(stepNumber: number): StepDefinition | undefined {
    return this.steps.get(stepNumber);
  }

  /**
   * List all steps in order
   */
  list(): StepDefinition[] {
    return Array.from(this.steps.values()).sort((a, b) => a.number - b.number);
  }

  /**
   * Get steps by category
   */
  getByCategory(category: StepDefinition["category"]): StepDefinition[] {
    return this.list().filter((s) => s.category === category);
  }

  /**
   * Check if step can be started based on completed steps
   */
  canStart(stepNumber: number, completedSteps: number[]): boolean {
    const result = this.checkDependencies(stepNumber, completedSteps);
    return result.satisfied;
  }

  /**
   * Get next step after given step
   */
  getNext(currentStep: number): StepDefinition | undefined {
    const sortedSteps = this.list();
    const currentIndex = sortedSteps.findIndex((s) => s.number === currentStep);

    if (currentIndex === -1 || currentIndex >= sortedSteps.length - 1) {
      return undefined;
    }

    return sortedSteps[currentIndex + 1];
  }

  /**
   * Get all required (non-optional) steps
   */
  getRequired(): StepDefinition[] {
    return this.list().filter((s) => !s.optional);
  }

  /**
   * Check dependencies for a step
   */
  checkDependencies(
    stepNumber: number,
    completedSteps: number[],
    stepScores?: Record<number, number>
  ): DependencyCheckResult {
    const step = this.get(stepNumber);
    if (!step) {
      return { satisfied: false, missing: [], insufficientScores: [], warnings: [] };
    }

    const missing: number[] = [];
    const insufficientScores: Array<{ stepNumber: number; required: number; actual: number }> = [];
    const warnings: number[] = [];

    for (const dep of step.dependencies) {
      const isCompleted = completedSteps.includes(dep.stepNumber);

      if (!isCompleted) {
        if (dep.soft) {
          warnings.push(dep.stepNumber);
        } else {
          missing.push(dep.stepNumber);
        }
        continue;
      }

      // Check score requirements
      if (dep.minScore !== undefined && stepScores) {
        const actualScore = stepScores[dep.stepNumber];
        if (actualScore === undefined || actualScore < dep.minScore) {
          insufficientScores.push({
            stepNumber: dep.stepNumber,
            required: dep.minScore,
            actual: actualScore ?? 0,
          });
        }
      }
    }

    return {
      satisfied: missing.length === 0 && insufficientScores.length === 0,
      missing,
      insufficientScores,
      warnings,
    };
  }

  /**
   * Check dependencies using workflow state
   */
  checkDependenciesFromState(stepNumber: number, state: SigmaState): DependencyCheckResult {
    const completedSteps = Object.entries(state.workflow.steps)
      .filter(([_, s]) => s.status === "completed")
      .map(([n, _]) => parseFloat(n));

    const stepScores: Record<number, number> = {};
    for (const [num, stepState] of Object.entries(state.workflow.steps)) {
      if (stepState.score !== null) {
        stepScores[parseFloat(num)] = stepState.score;
      }
    }

    return this.checkDependencies(stepNumber, completedSteps, stepScores);
  }

  /**
   * Get next available step based on state
   */
  getNextAvailableStep(state: SigmaState): StepDefinition | null {
    const completedSteps = Object.entries(state.workflow.steps)
      .filter(([_, s]) => s.status === "completed")
      .map(([n, _]) => parseFloat(n));

    for (const step of this.list()) {
      // Skip completed steps
      if (completedSteps.includes(step.number)) {
        continue;
      }

      // Skip optional steps that don't meet condition
      if (step.optional && step.condition) {
        if (!this.evaluateCondition(step.condition.expression, state, step.condition.type)) {
          continue;
        }
      }

      // Check if dependencies are met
      if (this.canStart(step.number, completedSteps)) {
        return step;
      }
    }

    return null;
  }

  /**
   * Calculate overall workflow progress (0-100)
   */
  calculateProgress(state: SigmaState): number {
    const requiredSteps = this.getRequired();
    const totalRequired = requiredSteps.length;

    if (totalRequired === 0) return 100;

    const completedRequired = requiredSteps.filter((step) => {
      const stepState = state.workflow.steps[step.number];
      return stepState?.status === "completed";
    }).length;

    return Math.round((completedRequired / totalRequired) * 100);
  }

  /**
   * Get step execution status summary
   */
  getStepStatusSummary(state: SigmaState): Array<{
    number: number;
    name: string;
    status: StepStatus;
    score: number | null;
    blocked: boolean;
    blockedBy: number[];
  }> {
    const completedSteps = Object.entries(state.workflow.steps)
      .filter(([_, s]) => s.status === "completed")
      .map(([n, _]) => parseFloat(n));

    return this.list().map((step) => {
      const stepState = state.workflow.steps[step.number];
      const depCheck = this.checkDependencies(step.number, completedSteps);

      return {
        number: step.number,
        name: step.name,
        status: stepState?.status ?? "pending",
        score: stepState?.score ?? null,
        blocked: !depCheck.satisfied && stepState?.status !== "completed",
        blockedBy: depCheck.missing,
      };
    });
  }

  /**
   * Validate step can transition to new status
   */
  validateStatusTransition(
    currentStatus: StepStatus | undefined,
    newStatus: StepStatus
  ): { valid: boolean; reason?: string } {
    // Define valid transitions
    const validTransitions: Record<StepStatus | "undefined", StepStatus[]> = {
      undefined: ["pending", "in_progress"],
      pending: ["in_progress", "skipped"],
      in_progress: ["completed", "failed", "pending"],
      completed: ["in_progress"], // Allow re-running
      failed: ["in_progress", "pending"],
      skipped: ["pending", "in_progress"],
    };

    const key = currentStatus ?? "undefined";
    const allowed = validTransitions[key];

    if (!allowed.includes(newStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${key} to ${newStatus}`,
      };
    }

    return { valid: true };
  }

  /**
   * Evaluate a step condition against the current state
   * Conditions are strings that reference state properties
   * Examples:
   *   - "workflow.monetized" -> checks if state.workflow.monetized is truthy
   *   - "prds.count > 0" -> checks if PRDs exist
   *   - "steps.1.completed" -> checks if step 1 is completed
   *
   * @param expression - The condition expression to evaluate
   * @param state - The current Sigma state
   * @param type - The condition type (state, output, or custom)
   */
  evaluateCondition(
    expression: string,
    state: SigmaState,
    type: "state" | "output" | "custom" = "state"
  ): boolean {
    try {
      const trimmed = expression.trim();

      // For "output" type conditions, check if specific outputs exist
      if (type === "output") {
        // Check if the output file path exists in completed step outputs
        for (const stepState of Object.values(state.workflow.steps)) {
          if (stepState.outputs.some((o) => o.includes(trimmed))) {
            return true;
          }
        }
        return false;
      }

      // For "custom" type, evaluate as a direct boolean expression on metadata
      if (type === "custom" && state.metadata?.custom) {
        const value = this.getNestedProperty(state.metadata.custom, trimmed);
        return Boolean(value);
      }

      // For "state" type conditions (default), evaluate against state properties

      // Pattern: "workflow.<property>"
      if (trimmed.startsWith("workflow.")) {
        const prop = trimmed.slice("workflow.".length);
        return this.getNestedProperty(state.workflow, prop) === true;
      }

      // Pattern: "steps.<number>.completed"
      const stepMatch = trimmed.match(/^steps\.(\d+(?:\.\d+)?)\.(completed|status)$/);
      if (stepMatch) {
        const stepNum = parseFloat(stepMatch[1]);
        const checkType = stepMatch[2];
        const stepState = state.workflow.steps[stepNum];

        if (checkType === "completed") {
          return stepState?.status === "completed";
        }
        return stepState !== undefined;
      }

      // Pattern: "prds.count > 0" or similar
      if (trimmed.includes("prds.count")) {
        const prdCount = state.prds.generated.length;
        if (trimmed.includes("> 0")) return prdCount > 0;
        if (trimmed.includes("== 0")) return prdCount === 0;
        return prdCount > 0;
      }

      // Pattern: "metadata.<key>" for custom metadata checks
      if (trimmed.startsWith("metadata.") && state.metadata) {
        const prop = trimmed.slice("metadata.".length);
        return this.getNestedProperty(state.metadata, prop) === true;
      }

      // Default: if condition is just a truthy string, check if it's a state property
      const value = this.getNestedProperty(state, trimmed);
      return Boolean(value);
    } catch {
      // If condition evaluation fails, default to false (skip the step)
      return false;
    }
  }

  /**
   * Safely get a nested property from an object using dot notation
   */
  private getNestedProperty(obj: unknown, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Get topological order for parallel execution
   * Returns groups of steps that can be executed in parallel
   */
  getParallelExecutionGroups(): StepDefinition[][] {
    const groups: StepDefinition[][] = [];
    const completed = new Set<number>();
    const remaining = new Set(this.list().map((s) => s.number));

    while (remaining.size > 0) {
      const group: StepDefinition[] = [];

      for (const stepNum of remaining) {
        const step = this.get(stepNum)!;
        const deps = step.dependencies.map((d) => d.stepNumber);

        // Check if all dependencies are completed
        if (deps.every((d) => completed.has(d))) {
          group.push(step);
        }
      }

      if (group.length === 0) {
        // Circular dependency or error - break to avoid infinite loop
        break;
      }

      groups.push(group);

      // Mark group as completed
      for (const step of group) {
        completed.add(step.number);
        remaining.delete(step.number);
      }
    }

    return groups;
  }

  /**
   * Register a custom step (for extensions)
   */
  registerStep(step: StepDefinition): void {
    this.steps.set(step.number, step);
  }

  /**
   * Remove a step (for customization)
   */
  removeStep(stepNumber: number): boolean {
    return this.steps.delete(stepNumber);
  }
}

/**
 * Create default step sequencer with standard Sigma steps
 */
export function createStepSequencer(): StepSequencer {
  return new StepSequencer();
}

/**
 * Create step sequencer with custom steps
 */
export function createCustomStepSequencer(steps: StepDefinition[]): StepSequencer {
  return new StepSequencer(steps);
}
