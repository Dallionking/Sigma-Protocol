/**
 * Sigma Protocol Quality Module
 * Quality gate evaluation and scoring
 * @module @sigma-protocol/core/quality
 */

export {
  type QualityValidator,
  type ValidationContext,
  type ValidationResult,
  type QualityEvaluationResult,
  QualityGateEngine,
  createQualityGateEngine,
  quickQualityCheck,
} from "./engine.js";
