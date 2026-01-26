/**
 * Quality Gate Engine
 * Evaluates step outputs against quality criteria and produces scores
 * @module @sigma-protocol/core/quality/engine
 */

import type {
  QualityGateCriteria,
  StepScore,
  StepDefinition,
} from "../types/step.js";

/**
 * Validator function signature
 */
export type QualityValidator = (
  context: ValidationContext
) => Promise<ValidationResult>;

/**
 * Context provided to validators
 */
export interface ValidationContext {
  /**
   * Step being validated
   */
  step: StepDefinition;

  /**
   * Criteria being evaluated
   */
  criteria: QualityGateCriteria;

  /**
   * Step outputs to validate
   */
  outputs: Record<string, unknown>;

  /**
   * Project root path
   */
  projectRoot: string;

  /**
   * Additional context
   */
  metadata?: Record<string, unknown>;
}

/**
 * Validation result from a single criteria
 */
export interface ValidationResult {
  /**
   * Score (0-100)
   */
  score: number;

  /**
   * Whether this criteria passed
   */
  passed: boolean;

  /**
   * Feedback for improvement
   */
  feedback: string[];

  /**
   * Details about what was checked
   */
  details?: Record<string, unknown>;
}

/**
 * Quality gate evaluation result
 */
export interface QualityEvaluationResult {
  /**
   * Overall score (0-100)
   */
  score: number;

  /**
   * Whether the quality gate passed
   */
  passed: boolean;

  /**
   * Individual criteria scores
   */
  criteriaScores: Record<string, number>;

  /**
   * Combined feedback from all criteria
   */
  feedback: string[];

  /**
   * When evaluation was performed
   */
  evaluatedAt: string;

  /**
   * Detailed results per criteria
   */
  details: Record<string, ValidationResult>;
}

/**
 * Built-in validator implementations
 */
const builtInValidators: Record<string, QualityValidator> = {
  /**
   * Check if file exists
   */
  fileExists: async (ctx) => {
    const { existsSync } = await import("fs");
    const { join } = await import("path");

    const outputs = ctx.step.outputs.filter((o) => o.required);
    const missing: string[] = [];

    for (const output of outputs) {
      const fullPath = join(ctx.projectRoot, output.path);
      if (!existsSync(fullPath)) {
        missing.push(output.path);
      }
    }

    const passed = missing.length === 0;
    return {
      score: passed ? 100 : Math.max(0, 100 - missing.length * 25),
      passed,
      feedback: missing.length > 0 ? [`Missing outputs: ${missing.join(", ")}`] : [],
    };
  },

  /**
   * Check if content is non-empty
   */
  contentNotEmpty: async (ctx) => {
    const { readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");

    const outputs = ctx.step.outputs.filter((o) => o.required);
    const emptyFiles: string[] = [];

    for (const output of outputs) {
      const fullPath = join(ctx.projectRoot, output.path);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, "utf-8");
        if (content.trim().length < 100) {
          emptyFiles.push(output.path);
        }
      }
    }

    const passed = emptyFiles.length === 0;
    return {
      score: passed ? 100 : Math.max(0, 100 - emptyFiles.length * 25),
      passed,
      feedback: emptyFiles.length > 0 ? [`Files with insufficient content: ${emptyFiles.join(", ")}`] : [],
    };
  },

  /**
   * Check markdown structure
   */
  markdownStructure: async (ctx) => {
    const { readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");

    const markdownOutputs = ctx.step.outputs.filter(
      (o) => o.type === "markdown" && o.required
    );

    let totalScore = 0;
    let count = 0;
    const feedback: string[] = [];

    for (const output of markdownOutputs) {
      const fullPath = join(ctx.projectRoot, output.path);
      if (!existsSync(fullPath)) continue;

      const content = readFileSync(fullPath, "utf-8");
      count++;

      // Check for headers
      const hasH1 = /^#\s+\S/m.test(content);
      const hasH2 = /^##\s+\S/m.test(content);
      const hasContent = content.split("\n").filter((l) => l.trim()).length > 10;

      let fileScore = 0;
      if (hasH1) fileScore += 40;
      if (hasH2) fileScore += 30;
      if (hasContent) fileScore += 30;

      totalScore += fileScore;

      if (!hasH1) feedback.push(`${output.name}: Missing main heading`);
      if (!hasH2) feedback.push(`${output.name}: Missing section headings`);
    }

    const score = count > 0 ? Math.round(totalScore / count) : 100;
    return {
      score,
      passed: score >= 70,
      feedback,
    };
  },

  /**
   * Default pass-through validator
   */
  default: async () => ({
    score: 100,
    passed: true,
    feedback: [],
  }),
};

/**
 * Quality Gate Engine
 */
export class QualityGateEngine {
  private validators: Map<string, QualityValidator>;

  constructor() {
    this.validators = new Map(Object.entries(builtInValidators));
  }

  /**
   * Register a custom validator
   */
  registerValidator(name: string, validator: QualityValidator): void {
    this.validators.set(name, validator);
  }

  /**
   * Get a validator by name
   */
  getValidator(name: string): QualityValidator | undefined {
    return this.validators.get(name);
  }

  /**
   * Evaluate a quality gate
   */
  async evaluate(
    step: StepDefinition,
    outputs: Record<string, unknown>,
    projectRoot: string
  ): Promise<QualityEvaluationResult> {
    const gate = step.qualityGate;
    const criteriaScores: Record<string, number> = {};
    const details: Record<string, ValidationResult> = {};
    const feedback: string[] = [];

    let weightedTotal = 0;
    let totalWeight = 0;

    for (const criteria of gate.criteria) {
      const validator = this.validators.get(criteria.id) ?? builtInValidators.default;

      const context: ValidationContext = {
        step,
        criteria,
        outputs,
        projectRoot,
      };

      const result = await validator(context);
      criteriaScores[criteria.id] = result.score;
      details[criteria.id] = result;
      feedback.push(...result.feedback);

      // Weight the score
      weightedTotal += result.score * criteria.weight;
      totalWeight += criteria.weight;
    }

    const score = totalWeight > 0 ? Math.round(weightedTotal / totalWeight) : 0;
    const passed = score >= gate.minScore;

    return {
      score,
      passed,
      criteriaScores,
      feedback,
      evaluatedAt: new Date().toISOString(),
      details,
    };
  }

  /**
   * Convert evaluation result to StepScore
   */
  toStepScore(result: QualityEvaluationResult): StepScore {
    return {
      overall: result.score,
      criteria: result.criteriaScores,
      passed: result.passed,
      feedback: result.feedback,
      evaluatedAt: result.evaluatedAt,
    };
  }

  /**
   * Quick check if step would pass quality gate
   */
  async wouldPass(
    step: StepDefinition,
    outputs: Record<string, unknown>,
    projectRoot: string
  ): Promise<boolean> {
    const result = await this.evaluate(step, outputs, projectRoot);
    return result.passed;
  }

  /**
   * Get list of registered validators
   */
  listValidators(): string[] {
    return Array.from(this.validators.keys());
  }
}

/**
 * Create a quality gate engine with default validators
 */
export function createQualityGateEngine(): QualityGateEngine {
  return new QualityGateEngine();
}

/**
 * Simple quality check for a single criteria
 */
export async function quickQualityCheck(
  criteria: QualityGateCriteria,
  step: StepDefinition,
  outputs: Record<string, unknown>,
  projectRoot: string
): Promise<ValidationResult> {
  const engine = createQualityGateEngine();
  const validator = engine.getValidator(criteria.id) ?? builtInValidators.default;

  return validator({
    step,
    criteria,
    outputs,
    projectRoot,
  });
}
