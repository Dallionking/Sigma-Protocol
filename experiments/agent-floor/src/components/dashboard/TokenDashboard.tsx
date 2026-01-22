"use client";

import { useMemo } from "react";
import {
  useTokenStore,
  formatTokens,
  formatCost,
  PROVIDER_RATES,
  type AgentTokenUsage,
} from "@/lib/store/token-store";
import { useFloorStore } from "@/lib/store/floor-store";
import {
  Activity,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Cpu,
} from "lucide-react";
import type { ProviderId } from "@/types/provider";

/**
 * TokenDashboard - Shows token usage and costs per agent
 *
 * Acceptance Criteria:
 * - [AC1] Per-agent token counter (input/output)
 * - [AC2] Cost calculation based on provider rates
 * - [AC3] Budget progress bar
 * - [AC4] Warning when approaching limit
 * - [AC5] Reset counters button
 */
export default function TokenDashboard() {
  const {
    agentUsage,
    budget,
    sessionStarted,
    getTotalCost,
    getBudgetPercentage,
    isApproachingLimit,
    isOverBudget,
    resetCounters,
  } = useTokenStore();

  const { agents } = useFloorStore();

  // Calculate totals
  const totalCost = getTotalCost();
  const budgetPercentage = getBudgetPercentage();
  const approachingLimit = isApproachingLimit();
  const overBudget = isOverBudget();

  // Aggregate stats
  const stats = useMemo(() => {
    const usageList = Object.values(agentUsage);
    return {
      totalInput: usageList.reduce((sum, u) => sum + u.inputTokens, 0),
      totalOutput: usageList.reduce((sum, u) => sum + u.outputTokens, 0),
      totalRequests: usageList.reduce((sum, u) => sum + u.requestCount, 0),
      agentCount: usageList.length,
    };
  }, [agentUsage]);

  // Session duration
  const sessionDuration = useMemo(() => {
    const ms = Date.now() - sessionStarted;
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, [sessionStarted]);

  // Sort agents by cost (descending)
  const sortedUsage = useMemo(() => {
    return Object.values(agentUsage).sort((a, b) => {
      const costA = calculateAgentCost(a);
      const costB = calculateAgentCost(b);
      return costB - costA;
    });
  }, [agentUsage]);

  return (
    <div className="h-full flex flex-col bg-floor-panel">
      {/* Header */}
      <div className="p-4 border-b border-floor-accent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-floor-highlight" />
            <h2 className="text-lg font-semibold">Token Usage</h2>
          </div>
          <button
            onClick={resetCounters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
              border border-floor-accent hover:bg-floor-accent
              transition-colors"
            title="Reset all counters"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
        <p className="text-sm text-floor-muted">
          Session: {sessionDuration}
        </p>
      </div>

      {/* Budget Progress Bar - AC3 */}
      {budget.enabled && (
        <div className="p-4 border-b border-floor-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget</span>
            <span className="text-sm text-floor-muted">
              {formatCost(totalCost)} / {formatCost(budget.dailyLimit)}
            </span>
          </div>
          <div className="relative h-2 bg-floor-accent rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                overBudget
                  ? "bg-red-500"
                  : approachingLimit
                  ? "bg-yellow-500"
                  : "bg-floor-highlight"
              }`}
              style={{ width: `${Math.min(budgetPercentage * 100, 100)}%` }}
            />
          </div>

          {/* Warning when approaching limit - AC4 */}
          {approachingLimit && !overBudget && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-500">
                Approaching budget limit ({Math.round(budgetPercentage * 100)}%)
              </span>
            </div>
          )}

          {overBudget && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">
                Budget limit exceeded!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="p-4 border-b border-floor-accent">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<ArrowUpRight className="w-4 h-4 text-blue-400" />}
            label="Input Tokens"
            value={formatTokens(stats.totalInput)}
          />
          <StatCard
            icon={<ArrowDownRight className="w-4 h-4 text-purple-400" />}
            label="Output Tokens"
            value={formatTokens(stats.totalOutput)}
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4 text-green-400" />}
            label="Total Cost"
            value={formatCost(totalCost)}
          />
          <StatCard
            icon={<Zap className="w-4 h-4 text-yellow-400" />}
            label="Requests"
            value={stats.totalRequests.toString()}
          />
        </div>
      </div>

      {/* Per-Agent Usage - AC1 & AC2 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-floor-muted mb-3">
          Per-Agent Usage
        </h3>

        {sortedUsage.length === 0 ? (
          <div className="text-center py-8 text-floor-muted">
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No token usage recorded yet</p>
            <p className="text-xs mt-1">
              Usage will appear as agents work
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedUsage.map((usage) => (
              <AgentUsageCard key={usage.agentId} usage={usage} agents={agents} />
            ))}
          </div>
        )}
      </div>

      {/* Provider Rates Reference */}
      <div className="p-4 border-t border-floor-accent">
        <details className="text-sm">
          <summary className="text-floor-muted cursor-pointer hover:text-floor-text">
            Provider Rates
          </summary>
          <div className="mt-2 space-y-1 text-xs text-floor-subtle">
            {Object.entries(PROVIDER_RATES).map(([provider, rates]) => (
              <div key={provider} className="flex justify-between">
                <span>{provider}</span>
                <span>
                  ${rates.inputPer1M}/M in, ${rates.outputPer1M}/M out
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

/**
 * Small stat card component
 */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 bg-floor-accent rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-floor-muted">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

/**
 * Per-agent usage card with token breakdown
 */
function AgentUsageCard({
  usage,
  agents,
}: {
  usage: AgentTokenUsage;
  agents: { id: string; name: string }[];
}) {
  const cost = calculateAgentCost(usage);
  const agent = agents.find((a) => a.id === usage.agentId);
  const displayName = agent?.name || usage.agentName;

  return (
    <div className="p-3 bg-floor-bg border border-floor-accent rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-floor-highlight/20 flex items-center justify-center">
            <span className="text-xs font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-sm">{displayName}</div>
            <div className="text-xs text-floor-muted">
              {usage.provider} / {usage.model}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-400">{formatCost(cost)}</div>
          <div className="text-xs text-floor-muted">
            {usage.requestCount} request{usage.requestCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Token breakdown - AC1 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-2 bg-floor-accent/50 rounded">
          <ArrowUpRight className="w-3 h-3 text-blue-400" />
          <span className="text-floor-muted">In:</span>
          <span className="font-medium">{formatTokens(usage.inputTokens)}</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 bg-floor-accent/50 rounded">
          <ArrowDownRight className="w-3 h-3 text-purple-400" />
          <span className="text-floor-muted">Out:</span>
          <span className="font-medium">{formatTokens(usage.outputTokens)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate cost for a single agent's usage - AC2
 */
function calculateAgentCost(usage: AgentTokenUsage): number {
  const rates = PROVIDER_RATES[usage.provider as ProviderId] || PROVIDER_RATES.anthropic;
  const inputCost = (usage.inputTokens / 1_000_000) * rates.inputPer1M;
  const outputCost = (usage.outputTokens / 1_000_000) * rates.outputPer1M;
  return inputCost + outputCost;
}
