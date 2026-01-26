/**
 * Sigma Protocol - Cost Estimation and Budget Tracking
 * 
 * Provides cost estimates for sandbox orchestration and tracks spending
 */

import { loadCostLog, getRemainingBudget, appendCostLog } from './config.js';

/**
 * Provider pricing (USD per minute)
 * These are approximate rates as of 2025
 */
export const PROVIDER_PRICING = {
  e2b: {
    costPerMinute: 0.10,        // ~$6/hour for standard sandbox
    setupCost: 0.05,            // One-time setup cost per sandbox
    description: 'E2B Cloud (~$0.10/min)'
  },
  docker: {
    costPerMinute: 0,           // Free (uses local resources)
    setupCost: 0,
    description: 'Docker (Free - Local)'
  },
  daytona: {
    costPerMinute: 0.08,        // Slightly cheaper than E2B
    setupCost: 0.03,
    description: 'Daytona (~$0.08/min)'
  }
};

/**
 * Average story completion times (in minutes)
 * Based on typical AI agent performance
 */
export const AVERAGE_STORY_TIMES = {
  simple: 5,      // Simple UI changes, config updates
  medium: 15,     // New features, API endpoints
  complex: 30,    // Complex integrations, multi-file changes
  default: 15     // Default assumption
};

/**
 * Cost Estimator class
 */
export class CostEstimator {
  constructor(projectRoot, config = {}) {
    this.projectRoot = projectRoot;
    this.config = config;
    this.pricing = PROVIDER_PRICING;
  }

  /**
   * Get pricing for a provider
   * @param {string} provider
   * @returns {Object}
   */
  getPricing(provider) {
    return this.pricing[provider] || { costPerMinute: 0, setupCost: 0 };
  }

  /**
   * Estimate cost for orchestration
   * @param {Object} options
   * @param {string} options.provider - Provider name
   * @param {number} options.stories - Number of stories
   * @param {number} options.forksPerStory - Forks per story (Best of N)
   * @param {number} options.estimatedMinutesPerStory - Estimated minutes per story
   * @returns {Promise<Object>}
   */
  async estimate(options) {
    const {
      provider = this.config?.provider || 'docker',
      stories = 1,
      forksPerStory = this.config?.defaults?.forks_per_story || 3,
      estimatedMinutesPerStory = AVERAGE_STORY_TIMES.default
    } = options;

    const pricing = this.getPricing(provider);
    const totalSandboxes = stories * forksPerStory;
    const totalMinutes = stories * estimatedMinutesPerStory;
    
    // Calculate costs
    const setupCost = totalSandboxes * pricing.setupCost;
    const runtimeCost = totalMinutes * pricing.costPerMinute * forksPerStory;
    const totalCost = setupCost + runtimeCost;
    
    // Add buffer (20% for variability)
    const costWithBuffer = totalCost * 1.2;
    
    // Get remaining budget
    const remainingBudget = await getRemainingBudget(this.projectRoot, this.config);
    const budgetLimit = this.config?.budget?.max_spend_usd || 50;
    const warnThreshold = this.config?.budget?.warn_at_usd || 25;
    
    // Determine if this would exceed budget
    const wouldExceedBudget = costWithBuffer > remainingBudget;
    const wouldTriggerWarning = (budgetLimit - remainingBudget + costWithBuffer) > warnThreshold;

    return {
      provider,
      providerDescription: pricing.description,
      
      // Counts
      stories,
      forksPerStory,
      totalSandboxes,
      
      // Time estimates
      estimatedMinutesPerStory,
      totalEstimatedMinutes: totalMinutes,
      totalEstimatedHours: (totalMinutes / 60).toFixed(1),
      
      // Cost breakdown
      setupCost: roundCurrency(setupCost),
      runtimeCost: roundCurrency(runtimeCost),
      estimatedCost: roundCurrency(totalCost),
      estimatedCostWithBuffer: roundCurrency(costWithBuffer),
      
      // Cost range (min to max with buffer)
      costRange: {
        min: roundCurrency(totalCost * 0.8),
        max: roundCurrency(costWithBuffer)
      },
      
      // Budget info
      budgetLimit,
      remainingBudget: roundCurrency(remainingBudget),
      budgetAfterRun: roundCurrency(remainingBudget - costWithBuffer),
      wouldExceedBudget,
      wouldTriggerWarning,
      
      // Savings options
      savingsOptions: this.getSavingsOptions(options, costWithBuffer)
    };
  }

  /**
   * Get options to reduce costs
   * @param {Object} options
   * @param {number} currentCost
   * @returns {Array}
   */
  getSavingsOptions(options, currentCost) {
    const savings = [];
    
    // Option 1: Reduce forks
    if (options.forksPerStory > 1) {
      const reducedForksCost = currentCost / options.forksPerStory;
      savings.push({
        option: 'Reduce forks to 1',
        newCost: roundCurrency(reducedForksCost),
        savings: roundCurrency(currentCost - reducedForksCost),
        savingsPercent: Math.round((1 - 1/options.forksPerStory) * 100)
      });
    }
    
    // Option 2: Use Docker instead (if not already)
    if (options.provider !== 'docker') {
      savings.push({
        option: 'Use Docker instead (free)',
        newCost: 0,
        savings: roundCurrency(currentCost),
        savingsPercent: 100
      });
    }
    
    // Option 3: Process sequentially (not parallel)
    if (options.stories > 1) {
      const sequentialCost = currentCost * 0.6; // Estimate 40% savings
      savings.push({
        option: 'Process stories sequentially',
        newCost: roundCurrency(sequentialCost),
        savings: roundCurrency(currentCost - sequentialCost),
        savingsPercent: 40
      });
    }
    
    return savings;
  }

  /**
   * Record actual cost after sandbox run
   * @param {Object} costRecord
   * @returns {Promise<void>}
   */
  async recordCost(costRecord) {
    await appendCostLog(this.projectRoot, {
      ...costRecord,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get cost summary for a time period
   * @param {string} period - 'day', 'week', 'month', 'all'
   * @returns {Promise<Object>}
   */
  async getCostSummary(period = 'all') {
    const log = await loadCostLog(this.projectRoot);
    const entries = log.entries || [];
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    const filteredEntries = entries.filter(e => new Date(e.timestamp) >= startDate);
    
    const totalCost = filteredEntries.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalSandboxes = filteredEntries.reduce((sum, e) => sum + (e.sandboxCount || 0), 0);
    const totalMinutes = filteredEntries.reduce((sum, e) => sum + (e.runtimeMinutes || 0), 0);
    
    // Group by provider
    const byProvider = {};
    for (const entry of filteredEntries) {
      const provider = entry.provider || 'unknown';
      if (!byProvider[provider]) {
        byProvider[provider] = { cost: 0, sandboxes: 0, minutes: 0 };
      }
      byProvider[provider].cost += entry.cost || 0;
      byProvider[provider].sandboxes += entry.sandboxCount || 0;
      byProvider[provider].minutes += entry.runtimeMinutes || 0;
    }
    
    return {
      period,
      totalCost: roundCurrency(totalCost),
      totalSandboxes,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      entryCount: filteredEntries.length,
      byProvider,
      averageCostPerSandbox: totalSandboxes > 0 
        ? roundCurrency(totalCost / totalSandboxes) 
        : 0,
      averageCostPerMinute: totalMinutes > 0 
        ? roundCurrency(totalCost / totalMinutes) 
        : 0
    };
  }

  /**
   * Format cost estimate for display
   * @param {Object} estimate
   * @returns {string}
   */
  formatEstimate(estimate) {
    const lines = [
      '┌─────────────────────────────────────────────────────────────────┐',
      '│                    SANDBOX COST ESTIMATE                        │',
      '├─────────────────────────────────────────────────────────────────┤',
      `│  Provider:        ${padRight(estimate.providerDescription, 43)}│`,
      `│  Stories:         ${padRight(String(estimate.stories), 43)}│`,
      `│  Forks per story: ${padRight(String(estimate.forksPerStory), 43)}│`,
      `│  Total sandboxes: ${padRight(String(estimate.totalSandboxes), 43)}│`,
      `│  Est. runtime:    ${padRight(`~${estimate.totalEstimatedMinutes} minutes`, 43)}│`,
      '│                                                                 │',
      `│  ESTIMATED COST:  ${padRight(`$${estimate.costRange.min} - $${estimate.costRange.max}`, 43)}│`,
      '│                                                                 │',
      `│  Budget limit:    ${padRight(`$${estimate.budgetLimit} (you have $${estimate.remainingBudget} remaining)`, 43)}│`,
    ];
    
    if (estimate.wouldExceedBudget) {
      lines.push('│                                                                 │');
      lines.push('│  ⚠️  WARNING: This would exceed your remaining budget!          │');
    }
    
    lines.push('└─────────────────────────────────────────────────────────────────┘');
    
    return lines.join('\n');
  }
}

/**
 * Round to 2 decimal places for currency
 * @param {number} value
 * @returns {number}
 */
export function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Pad string to right
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
function padRight(str, length) {
  return str.padEnd(length);
}

/**
 * Show formatted cost report for CLI command
 * @param {string} projectRoot - Project root directory
 * @param {string} period - 'day', 'week', 'month', 'all'
 * @returns {Promise<Object>} - Cost report object
 */
export async function showCostReport(projectRoot, period = 'all') {
  const { loadSandboxConfig, getRemainingBudget } = await import('./config.js');

  const config = await loadSandboxConfig(projectRoot);
  const estimator = new CostEstimator(projectRoot, config);

  const summary = await estimator.getCostSummary(period);
  const remainingBudget = await getRemainingBudget(projectRoot, config);
  const budgetLimit = config?.budget?.max_spend_usd || 50;
  const budgetUsed = budgetLimit - remainingBudget;
  const budgetPercent = Math.round((budgetUsed / budgetLimit) * 100);

  return {
    ...summary,
    remainingBudget: roundCurrency(remainingBudget),
    budgetLimit,
    budgetUsed: roundCurrency(budgetUsed),
    budgetPercent
  };
}

/**
 * Display formatted cost report
 * @param {string} projectRoot - Project root directory
 * @param {string} period - 'day', 'week', 'month', 'all'
 */
export async function displayCostReport(projectRoot, period = 'all') {
  const report = await showCostReport(projectRoot, period);

  const width = 55;
  const border = '═'.repeat(width);

  console.log('\n╔' + border + '╗');
  console.log('║' + centerText('SANDBOX COST REPORT', width) + '║');
  console.log('╠' + border + '╣');

  console.log('║' + padRight(`  Period: ${report.period}`, width) + '║');
  console.log('║' + padRight('', width) + '║');
  console.log('║' + padRight(`  Total spent:     $${report.totalCost}`, width) + '║');
  console.log('║' + padRight(`  Total sandboxes: ${report.totalSandboxes}`, width) + '║');
  console.log('║' + padRight(`  Total runtime:   ${report.totalHours} hours`, width) + '║');
  console.log('║' + padRight('', width) + '║');

  // Budget bar
  const barWidth = 30;
  const filledWidth = Math.min(barWidth, Math.round((report.budgetPercent / 100) * barWidth));
  const emptyWidth = barWidth - filledWidth;
  const bar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);

  console.log('║' + padRight(`  Budget: [${bar}] ${report.budgetPercent}%`, width) + '║');
  console.log('║' + padRight(`          $${report.budgetUsed} / $${report.budgetLimit} used`, width) + '║');
  console.log('║' + padRight(`          $${report.remainingBudget} remaining`, width) + '║');

  // Provider breakdown
  if (Object.keys(report.byProvider).length > 0) {
    console.log('║' + padRight('', width) + '║');
    console.log('║' + padRight('  By Provider:', width) + '║');
    for (const [provider, data] of Object.entries(report.byProvider)) {
      const line = `    ${provider}: $${data.cost.toFixed(2)} (${data.sandboxes} runs, ${(data.minutes / 60).toFixed(1)}h)`;
      console.log('║' + padRight(line, width) + '║');
    }
  }

  console.log('╚' + border + '╝\n');

  return report;
}

/**
 * Center text in width
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function centerText(text, width) {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  return ' '.repeat(left) + text + ' '.repeat(padding - left);
}
