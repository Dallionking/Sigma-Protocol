import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProviderId } from "@/types/provider";

/**
 * Token usage record for a single agent
 */
export interface AgentTokenUsage {
  agentId: string;
  agentName: string;
  provider: ProviderId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requestCount: number;
  lastUpdated: number;
}

/**
 * Provider pricing rates (cost per 1M tokens in USD)
 */
export interface ProviderRates {
  inputPer1M: number;
  outputPer1M: number;
}

/**
 * Default pricing rates per provider
 * Prices as of Jan 2026 - should be updated periodically
 */
export const PROVIDER_RATES: Record<ProviderId, ProviderRates> = {
  "claude-code": { inputPer1M: 15.0, outputPer1M: 75.0 }, // Opus 4.5 rates
  anthropic: { inputPer1M: 3.0, outputPer1M: 15.0 }, // Sonnet 4 rates
  openai: { inputPer1M: 2.5, outputPer1M: 10.0 }, // GPT-4o rates
  gemini: { inputPer1M: 0.075, outputPer1M: 0.3 }, // Gemini 2.0 Flash rates
  openrouter: { inputPer1M: 3.0, outputPer1M: 15.0 }, // Varies by model
  xai: { inputPer1M: 2.0, outputPer1M: 10.0 }, // Grok rates
  ollama: { inputPer1M: 0, outputPer1M: 0 }, // Local, no cost
};

/**
 * Budget configuration
 */
export interface BudgetConfig {
  dailyLimit: number; // USD
  warningThreshold: number; // Percentage (0-1)
  enabled: boolean;
}

/**
 * Token store state
 */
interface TokenState {
  // Usage tracking
  agentUsage: Record<string, AgentTokenUsage>;

  // Budget configuration
  budget: BudgetConfig;

  // Session tracking
  sessionStarted: number;

  // Computed values
  getTotalCost: () => number;
  getAgentCost: (agentId: string) => number;
  getBudgetPercentage: () => number;
  isApproachingLimit: () => boolean;
  isOverBudget: () => boolean;

  // Actions
  recordUsage: (
    agentId: string,
    agentName: string,
    provider: ProviderId,
    model: string,
    inputTokens: number,
    outputTokens: number
  ) => void;
  resetCounters: () => void;
  resetAgentCounters: (agentId: string) => void;
  setBudgetLimit: (limit: number) => void;
  setWarningThreshold: (threshold: number) => void;
  setBudgetEnabled: (enabled: boolean) => void;
}

/**
 * Calculate cost from token counts
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  provider: ProviderId
): number {
  const rates = PROVIDER_RATES[provider] || PROVIDER_RATES.anthropic;
  const inputCost = (inputTokens / 1_000_000) * rates.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * rates.outputPer1M;
  return inputCost + outputCost;
}

/**
 * Token usage store with localStorage persistence
 */
export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      // Initial state
      agentUsage: {},
      budget: {
        dailyLimit: 10.0, // $10 default daily limit
        warningThreshold: 0.8, // Warn at 80%
        enabled: true,
      },
      sessionStarted: Date.now(),

      // Computed: total cost across all agents
      getTotalCost: () => {
        const { agentUsage } = get();
        return Object.values(agentUsage).reduce((total, usage) => {
          return total + calculateCost(usage.inputTokens, usage.outputTokens, usage.provider);
        }, 0);
      },

      // Computed: cost for specific agent
      getAgentCost: (agentId: string) => {
        const { agentUsage } = get();
        const usage = agentUsage[agentId];
        if (!usage) return 0;
        return calculateCost(usage.inputTokens, usage.outputTokens, usage.provider);
      },

      // Computed: budget usage percentage
      getBudgetPercentage: () => {
        const { budget, getTotalCost } = get();
        if (!budget.enabled || budget.dailyLimit === 0) return 0;
        return Math.min(getTotalCost() / budget.dailyLimit, 1);
      },

      // Computed: check if approaching limit
      isApproachingLimit: () => {
        const { budget, getBudgetPercentage } = get();
        if (!budget.enabled) return false;
        return getBudgetPercentage() >= budget.warningThreshold;
      },

      // Computed: check if over budget
      isOverBudget: () => {
        const { budget, getTotalCost } = get();
        if (!budget.enabled) return false;
        return getTotalCost() >= budget.dailyLimit;
      },

      // Record token usage for an agent
      recordUsage: (agentId, agentName, provider, model, inputTokens, outputTokens) => {
        set((state) => {
          const existing = state.agentUsage[agentId];
          const updated: AgentTokenUsage = existing
            ? {
                ...existing,
                provider,
                model,
                inputTokens: existing.inputTokens + inputTokens,
                outputTokens: existing.outputTokens + outputTokens,
                totalTokens: existing.totalTokens + inputTokens + outputTokens,
                requestCount: existing.requestCount + 1,
                lastUpdated: Date.now(),
              }
            : {
                agentId,
                agentName,
                provider,
                model,
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                requestCount: 1,
                lastUpdated: Date.now(),
              };

          return {
            agentUsage: {
              ...state.agentUsage,
              [agentId]: updated,
            },
          };
        });
      },

      // Reset all counters
      resetCounters: () => {
        set({
          agentUsage: {},
          sessionStarted: Date.now(),
        });
      },

      // Reset specific agent's counters
      resetAgentCounters: (agentId: string) => {
        set((state) => {
          const { [agentId]: _, ...rest } = state.agentUsage;
          return { agentUsage: rest };
        });
      },

      // Budget configuration
      setBudgetLimit: (limit: number) => {
        set((state) => ({
          budget: { ...state.budget, dailyLimit: Math.max(0, limit) },
        }));
      },

      setWarningThreshold: (threshold: number) => {
        set((state) => ({
          budget: { ...state.budget, warningThreshold: Math.max(0, Math.min(1, threshold)) },
        }));
      },

      setBudgetEnabled: (enabled: boolean) => {
        set((state) => ({
          budget: { ...state.budget, enabled },
        }));
      },
    }),
    {
      name: "agent-floor-tokens",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

/**
 * Selector hooks for common use cases
 */
export const useAgentUsage = (agentId: string) =>
  useTokenStore((state) => state.agentUsage[agentId]);
export const useAllUsage = () => useTokenStore((state) => state.agentUsage);
export const useBudget = () => useTokenStore((state) => state.budget);
export const useTotalCost = () => useTokenStore((state) => state.getTotalCost());

/**
 * Format token count for display
 */
export function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  if (cost < 1) {
    return `$${cost.toFixed(3)}`;
  }
  return `$${cost.toFixed(2)}`;
}
