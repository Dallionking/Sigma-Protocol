/**
 * Sigma Protocol - Best of N Evaluator
 * 
 * Implements the Best of N pattern for AI agent orchestration:
 * 1. Run N parallel attempts for each story
 * 2. Evaluate results using automated tests + AI scoring
 * 3. Filter to top candidates
 * 4. Present for human review (hybrid mode)
 */

const path = require('path');

/**
 * Evaluation weights for scoring fork results
 */
const EVALUATION_WEIGHTS = {
  testPassRate: 0.40,      // 40% - Test results
  codeQuality: 0.20,       // 20% - ESLint/linting score
  completeness: 0.20,      // 20% - Acceptance criteria met
  performance: 0.10,       // 10% - Build time, bundle size
  aiSubjective: 0.10       // 10% - AI evaluation
};

/**
 * Minimum thresholds for acceptance
 */
const THRESHOLDS = {
  testPassRate: 0.80,      // 80% tests passing minimum
  codeQuality: 70,         // ESLint score minimum
  aiScore: 70              // AI subjective score minimum
};

/**
 * Best of N Evaluator
 */
class BestOfNEvaluator {
  constructor(options = {}) {
    this.weights = { ...EVALUATION_WEIGHTS, ...options.weights };
    this.thresholds = { ...THRESHOLDS, ...options.thresholds };
    this.reviewStrategy = options.reviewStrategy || 'hybrid';
    this.topCandidates = options.topCandidates || 3;
  }

  /**
   * Evaluate all fork results for a story
   * @param {Object[]} results - Array of fork results
   * @param {Object} story - Story being evaluated
   * @returns {Promise<Object>}
   */
  async evaluateResults(results, story) {
    const evaluatedResults = [];

    for (const result of results) {
      const evaluation = await this.evaluateSingleResult(result, story);
      evaluatedResults.push({
        ...result,
        evaluation
      });
    }

    // Sort by total score
    evaluatedResults.sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore);

    // Filter to top candidates
    const topCandidates = evaluatedResults.slice(0, this.topCandidates);

    // Determine recommendation
    const recommendation = this.determineRecommendation(evaluatedResults);

    return {
      story,
      allResults: evaluatedResults,
      topCandidates,
      recommendation,
      aiPreFiltered: {
        from: results.length,
        to: topCandidates.length
      }
    };
  }

  /**
   * Evaluate a single fork result
   * @param {Object} result - Fork result
   * @param {Object} story - Story being evaluated
   * @returns {Promise<Object>}
   */
  async evaluateSingleResult(result, story) {
    const scores = {
      testPassRate: await this.evaluateTests(result),
      codeQuality: await this.evaluateCodeQuality(result),
      completeness: await this.evaluateCompleteness(result, story),
      performance: await this.evaluatePerformance(result),
      aiSubjective: await this.evaluateWithAI(result, story)
    };

    // Calculate weighted total
    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score.score * this.weights[key]);
    }, 0);

    // Check if meets minimum thresholds
    const meetsThresholds = this.checkThresholds(scores);

    return {
      scores,
      totalScore: Math.round(totalScore),
      meetsThresholds,
      passedChecks: Object.entries(meetsThresholds).filter(([, v]) => v).length,
      totalChecks: Object.keys(meetsThresholds).length
    };
  }

  /**
   * Evaluate test results
   * @param {Object} result
   * @returns {Promise<Object>}
   */
  async evaluateTests(result) {
    const tests = result.testResults || {};
    const total = tests.total || 0;
    const passed = tests.passed || 0;
    const failed = tests.failed || 0;

    if (total === 0) {
      return {
        score: 50, // Neutral if no tests
        details: 'No tests found',
        raw: { total, passed, failed }
      };
    }

    const passRate = passed / total;
    const score = Math.round(passRate * 100);

    return {
      score,
      details: `${passed}/${total} tests passing (${score}%)`,
      raw: { total, passed, failed, passRate }
    };
  }

  /**
   * Evaluate code quality (ESLint, etc.)
   * @param {Object} result
   * @returns {Promise<Object>}
   */
  async evaluateCodeQuality(result) {
    const linting = result.lintResults || {};
    const errors = linting.errors || 0;
    const warnings = linting.warnings || 0;

    // Simple scoring: 100 - (errors * 10) - (warnings * 2)
    // Clamped to 0-100
    let score = 100 - (errors * 10) - (warnings * 2);
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      details: `${errors} errors, ${warnings} warnings`,
      raw: { errors, warnings }
    };
  }

  /**
   * Evaluate completeness against acceptance criteria
   * @param {Object} result
   * @param {Object} story
   * @returns {Promise<Object>}
   */
  async evaluateCompleteness(result, story) {
    const criteria = story.acceptanceCriteria || [];
    const implemented = result.implementedCriteria || [];

    if (criteria.length === 0) {
      return {
        score: 100, // Full score if no criteria defined
        details: 'No acceptance criteria defined',
        raw: { total: 0, implemented: 0 }
      };
    }

    const completedCount = implemented.filter(Boolean).length;
    const score = Math.round((completedCount / criteria.length) * 100);

    return {
      score,
      details: `${completedCount}/${criteria.length} criteria met`,
      raw: { total: criteria.length, implemented: completedCount }
    };
  }

  /**
   * Evaluate performance metrics
   * @param {Object} result
   * @returns {Promise<Object>}
   */
  async evaluatePerformance(result) {
    const metrics = result.performanceMetrics || {};
    const buildTime = metrics.buildTimeMs || 0;
    const bundleSize = metrics.bundleSizeKb || 0;

    // Scoring based on reasonable thresholds
    // Build time: < 30s = 100, > 120s = 0
    // Bundle size: < 500KB = 100, > 2MB = 0

    let buildScore = 100;
    if (buildTime > 0) {
      buildScore = Math.max(0, 100 - ((buildTime - 30000) / 900) * 100);
      buildScore = Math.min(100, buildScore);
    }

    let bundleScore = 100;
    if (bundleSize > 0) {
      bundleScore = Math.max(0, 100 - ((bundleSize - 500) / 15) * 100);
      bundleScore = Math.min(100, bundleScore);
    }

    const score = Math.round((buildScore + bundleScore) / 2);

    return {
      score,
      details: `Build: ${buildTime}ms, Bundle: ${bundleSize}KB`,
      raw: { buildTime, bundleSize, buildScore, bundleScore }
    };
  }

  /**
   * AI-based subjective evaluation
   * @param {Object} result
   * @param {Object} story
   * @returns {Promise<Object>}
   */
  async evaluateWithAI(result, story) {
    // If AI evaluation was already done during sandbox execution
    if (result.aiEvaluation) {
      return {
        score: result.aiEvaluation.score || 50,
        details: result.aiEvaluation.justification || 'AI evaluation provided',
        raw: result.aiEvaluation
      };
    }

    // Default to neutral score if no AI evaluation available
    return {
      score: 75, // Slightly positive default
      details: 'AI evaluation not performed',
      raw: null
    };
  }

  /**
   * Check if result meets minimum thresholds
   * @param {Object} scores
   * @returns {Object}
   */
  checkThresholds(scores) {
    return {
      testPassRate: (scores.testPassRate.raw?.passRate || 0) >= this.thresholds.testPassRate,
      codeQuality: scores.codeQuality.score >= this.thresholds.codeQuality,
      aiScore: scores.aiSubjective.score >= this.thresholds.aiScore
    };
  }

  /**
   * Determine recommendation from evaluated results
   * @param {Object[]} evaluatedResults
   * @returns {Object}
   */
  determineRecommendation(evaluatedResults) {
    if (evaluatedResults.length === 0) {
      return {
        type: 'none',
        message: 'No results to evaluate'
      };
    }

    const top = evaluatedResults[0];
    const second = evaluatedResults[1];

    // Check if top candidate passes all thresholds
    const allChecksPassed = Object.values(top.evaluation.meetsThresholds).every(Boolean);

    if (!allChecksPassed) {
      return {
        type: 'caution',
        message: 'Best result does not meet all quality thresholds',
        recommended: top,
        confidence: 'low'
      };
    }

    // Check if there's a clear winner (>10 point difference)
    if (second && (top.evaluation.totalScore - second.evaluation.totalScore) >= 10) {
      return {
        type: 'strong',
        message: `Fork ${top.forkIndex} is clearly the best choice`,
        recommended: top,
        confidence: 'high'
      };
    }

    // Close race - recommend review
    if (second && (top.evaluation.totalScore - second.evaluation.totalScore) < 5) {
      return {
        type: 'review',
        message: 'Close results - manual review recommended',
        recommended: top,
        alternatives: [second],
        confidence: 'medium'
      };
    }

    return {
      type: 'accept',
      message: `Fork ${top.forkIndex} recommended`,
      recommended: top,
      confidence: 'medium-high'
    };
  }

  /**
   * Format evaluation results for display
   * @param {Object} evaluation
   * @returns {string}
   */
  formatForDisplay(evaluation) {
    const lines = [
      '┌─────────────────────────────────────────────────────────────────┐',
      `│              BEST OF N RESULTS - ${padCenter(evaluation.story.title || 'Story', 28)}│`,
      '├─────────────────────────────────────────────────────────────────┤',
      `│  AI Pre-filtered from ${evaluation.aiPreFiltered.from} → ${evaluation.aiPreFiltered.to} candidates${' '.repeat(27)}│`,
      '│                                                                 │'
    ];

    for (const candidate of evaluation.topCandidates) {
      const isRecommended = candidate === evaluation.recommendation.recommended;
      const label = isRecommended ? '(Recommended)' : '';
      
      lines.push(`│  ┌─────────────────────────────────────────────────────────┐    │`);
      lines.push(`│  │ FORK ${candidate.forkIndex} ${padRight(label, 48)}│    │`);
      lines.push(`│  │ Tests: ${padRight(candidate.evaluation.scores.testPassRate.details, 45)}│    │`);
      lines.push(`│  │ AI Score: ${padRight(String(candidate.evaluation.scores.aiSubjective.score) + '/100', 42)}│    │`);
      
      if (candidate.previewUrl) {
        lines.push(`│  │ Preview: ${padRight(candidate.previewUrl.slice(0, 42), 43)}│    │`);
      }
      if (candidate.prNumber) {
        lines.push(`│  │ PR: #${padRight(String(candidate.prNumber), 48)}│    │`);
      }
      
      lines.push(`│  └─────────────────────────────────────────────────────────┘    │`);
      lines.push('│                                                                 │');
    }

    lines.push('└─────────────────────────────────────────────────────────────────┘');

    return lines.join('\n');
  }
}

/**
 * AI Evaluation prompt generator
 */
function generateAIEvaluationPrompt(result, story) {
  return `Evaluate this implementation for story: "${story.title}"

Acceptance Criteria:
${(story.acceptanceCriteria || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

Code Changes Summary:
${result.diffSummary || 'No diff available'}

Files Changed:
${(result.filesChanged || []).join('\n') || 'Unknown'}

Test Results:
- Total: ${result.testResults?.total || 'Unknown'}
- Passed: ${result.testResults?.passed || 'Unknown'}
- Failed: ${result.testResults?.failed || 'Unknown'}

Evaluate on:
1. Does it meet ALL acceptance criteria? (Yes/No + explanation)
2. Is the code clean and maintainable? (1-10)
3. Are there any obvious bugs or issues? (List or "None")
4. Overall quality score (0-100)

Respond in JSON format:
{
  "criteriaMet": boolean,
  "codeQuality": number,
  "issues": string[],
  "score": number,
  "justification": string
}`;
}

/**
 * Helper: Pad string to center
 */
function padCenter(str, length) {
  const padding = Math.max(0, length - str.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
}

/**
 * Helper: Pad string to right
 */
function padRight(str, length) {
  return str.padEnd(length);
}

module.exports = {
  BestOfNEvaluator,
  EVALUATION_WEIGHTS,
  THRESHOLDS,
  generateAIEvaluationPrompt
};


