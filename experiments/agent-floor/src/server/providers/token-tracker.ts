/**
 * Token Tracker - Per-agent token usage tracking
 *
 * Tracks inputTokens and outputTokens per request, aggregates per agent,
 * and emits usage events to Colyseus state.
 *
 * @see PRD-020: Token/Cost Dashboard
 */

import type { ProviderId } from "@/types/provider";

// =============================================================================
// Constants
// =============================================================================

/**
 * Provider pricing rates (cost per 1M tokens in USD)
 * Prices as of Jan 2026 - should be updated periodically
 */
export const PROVIDER_RATES: Record<ProviderId, { inputPer1M: number; outputPer1M: number }> = {
  "claude-code": { inputPer1M: 15.0, outputPer1M: 75.0 }, // Opus 4.5 rates
  anthropic: { inputPer1M: 3.0, outputPer1M: 15.0 }, // Sonnet 4 rates
  openai: { inputPer1M: 2.5, outputPer1M: 10.0 }, // GPT-4o rates
  gemini: { inputPer1M: 0.075, outputPer1M: 0.3 }, // Gemini 2.0 Flash rates
  openrouter: { inputPer1M: 3.0, outputPer1M: 15.0 }, // Varies by model
  xai: { inputPer1M: 2.0, outputPer1M: 10.0 }, // Grok rates
  ollama: { inputPer1M: 0, outputPer1M: 0 }, // Local, no cost
};

// =============================================================================
// Types
// =============================================================================

/**
 * Token usage record for a single request
 */
export interface TokenUsageRecord {
  agentId: string;
  provider: ProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}

/**
 * Aggregated token usage for an agent
 */
export interface AgentTokenStats {
  agentId: string;
  provider: ProviderId;
  model: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  requestCount: number;
  lastUpdated: number;
}

/**
 * Usage event emitted when tokens are tracked
 */
export interface UsageEvent {
  type: "token_usage";
  agentId: string;
  provider: ProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  aggregated: AgentTokenStats;
}

/**
 * Callback for usage events
 */
export type UsageEventCallback = (event: UsageEvent) => void;

// =============================================================================
// TokenTracker Class
// =============================================================================

/**
 * TokenTracker - Server-side token usage tracking
 *
 * Features:
 * - Track inputTokens and outputTokens per request (AC1)
 * - Aggregate per agent (AC2)
 * - Emit usage events (AC3)
 * - Cost calculation per provider (AC4)
 */
export class TokenTracker {
  /** Per-agent aggregated stats */
  private agentStats: Map<string, AgentTokenStats> = new Map();

  /** Usage history (for debugging/analysis) */
  private history: TokenUsageRecord[] = [];

  /** Maximum history size */
  private maxHistory: number;

  /** Event callback */
  private onUsage: UsageEventCallback | null = null;

  constructor(options?: { maxHistory?: number }) {
    this.maxHistory = options?.maxHistory ?? 1000;
  }

  /**
   * Calculate cost from token counts (AC4)
   *
   * @param provider - LLM provider ID
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Cost in USD
   */
  calculateCost(provider: ProviderId, inputTokens: number, outputTokens: number): number {
    const rates = PROVIDER_RATES[provider] || PROVIDER_RATES.anthropic;
    const inputCost = (inputTokens / 1_000_000) * rates.inputPer1M;
    const outputCost = (outputTokens / 1_000_000) * rates.outputPer1M;
    return inputCost + outputCost;
  }

  /**
   * Record token usage for a request (AC1, AC2)
   *
   * @param agentId - Agent identifier
   * @param provider - LLM provider ID
   * @param model - Model name/ID used
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns The usage record
   */
  recordUsage(
    agentId: string,
    provider: ProviderId,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): TokenUsageRecord {
    const cost = this.calculateCost(provider, inputTokens, outputTokens);
    const timestamp = Date.now();

    // Create usage record
    const record: TokenUsageRecord = {
      agentId,
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      timestamp,
    };

    // Add to history
    this.history.push(record);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Update aggregated stats (AC2)
    const existing = this.agentStats.get(agentId);
    const stats: AgentTokenStats = existing
      ? {
          ...existing,
          provider,
          model,
          totalInputTokens: existing.totalInputTokens + inputTokens,
          totalOutputTokens: existing.totalOutputTokens + outputTokens,
          totalCost: existing.totalCost + cost,
          requestCount: existing.requestCount + 1,
          lastUpdated: timestamp,
        }
      : {
          agentId,
          provider,
          model,
          totalInputTokens: inputTokens,
          totalOutputTokens: outputTokens,
          totalCost: cost,
          requestCount: 1,
          lastUpdated: timestamp,
        };

    this.agentStats.set(agentId, stats);

    // Emit usage event (AC3)
    if (this.onUsage) {
      const event: UsageEvent = {
        type: "token_usage",
        agentId,
        provider,
        model,
        inputTokens,
        outputTokens,
        cost,
        aggregated: stats,
      };
      this.onUsage(event);
    }

    console.log(
      `[TokenTracker] Agent ${agentId}: +${inputTokens} in, +${outputTokens} out = $${cost.toFixed(
        4
      )} (total: $${stats.totalCost.toFixed(4)})`
    );

    return record;
  }

  /**
   * Set callback for usage events (AC3)
   *
   * @param callback - Function to call when usage is recorded
   */
  setUsageCallback(callback: UsageEventCallback | null): void {
    this.onUsage = callback;
  }

  /**
   * Get aggregated stats for a specific agent
   *
   * @param agentId - Agent identifier
   * @returns Agent stats or undefined
   */
  getAgentStats(agentId: string): AgentTokenStats | undefined {
    return this.agentStats.get(agentId);
  }

  /**
   * Get all agent stats
   *
   * @returns Map of agent ID to stats
   */
  getAllStats(): Map<string, AgentTokenStats> {
    return new Map(this.agentStats);
  }

  /**
   * Get total cost across all agents
   *
   * @returns Total cost in USD
   */
  getTotalCost(): number {
    let total = 0;
    this.agentStats.forEach((stats) => {
      total += stats.totalCost;
    });
    return total;
  }

  /**
   * Get total tokens across all agents
   *
   * @returns Object with totalInput and totalOutput
   */
  getTotalTokens(): { totalInput: number; totalOutput: number } {
    let totalInput = 0;
    let totalOutput = 0;
    this.agentStats.forEach((stats) => {
      totalInput += stats.totalInputTokens;
      totalOutput += stats.totalOutputTokens;
    });
    return { totalInput, totalOutput };
  }

  /**
   * Get usage history
   *
   * @param limit - Maximum number of records to return
   * @returns Recent usage records
   */
  getHistory(limit?: number): TokenUsageRecord[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Reset all stats and history
   */
  reset(): void {
    this.agentStats.clear();
    this.history = [];
    console.log("[TokenTracker] Stats and history reset");
  }

  /**
   * Reset stats for a specific agent
   *
   * @param agentId - Agent identifier
   */
  resetAgent(agentId: string): void {
    this.agentStats.delete(agentId);
    this.history = this.history.filter((r) => r.agentId !== agentId);
    console.log(`[TokenTracker] Stats reset for agent ${agentId}`);
  }

  /**
   * Export stats as JSON-serializable object
   *
   * @returns Stats object for persistence/transmission
   */
  exportStats(): Record<string, AgentTokenStats> {
    const result: Record<string, AgentTokenStats> = {};
    this.agentStats.forEach((stats, agentId) => {
      result[agentId] = { ...stats };
    });
    return result;
  }

  /**
   * Import stats from a previous export
   *
   * @param stats - Previously exported stats
   */
  importStats(stats: Record<string, AgentTokenStats>): void {
    for (const [agentId, agentStats] of Object.entries(stats)) {
      this.agentStats.set(agentId, { ...agentStats });
    }
    console.log(`[TokenTracker] Imported stats for ${Object.keys(stats).length} agents`);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/** Global token tracker instance */
let globalTracker: TokenTracker | null = null;

/**
 * Get the global token tracker instance
 *
 * @returns Global TokenTracker
 */
export function getTokenTracker(): TokenTracker {
  if (!globalTracker) {
    globalTracker = new TokenTracker();
  }
  return globalTracker;
}

/**
 * Create a new token tracker instance
 *
 * @param options - Tracker options
 * @returns New TokenTracker instance
 */
export function createTokenTracker(options?: { maxHistory?: number }): TokenTracker {
  return new TokenTracker(options);
}

// =============================================================================
// Re-exports
// =============================================================================

export type { ProviderId } from "@/types/provider";
