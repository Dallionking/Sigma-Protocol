"use client";

import { useFloorStore } from "@/lib/store/floor-store";
import {
  User,
  Cpu,
  MessageSquare,
  Briefcase,
  Settings,
  Play,
  Pause,
  ChevronRight,
} from "lucide-react";
import type { AgentStatus } from "@/types/agent";

export default function AgentList() {
  const { agents, selectedAgentId, selectAgent, updateAgentStatus } =
    useFloorStore();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-floor-accent">
        <h2 className="text-lg font-semibold">Agents</h2>
        <p className="text-sm text-floor-muted">
          {agents.filter((a) => a.status !== "idle").length} agents working
        </p>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-floor-accent border-2 border-floor-highlight"
                    : "bg-floor-bg border border-floor-accent hover:border-floor-highlight/50"
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${getStatusBgClass(agent.status)}
                    `}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-xs text-floor-muted capitalize">
                      {agent.role.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              {/* Provider info */}
              <div className="flex items-center gap-2 mb-3 text-sm text-floor-muted">
                <Cpu className="w-4 h-4" />
                <span>
                  {agent.provider} / {agent.model}
                </span>
              </div>

              {/* Current activity */}
              {agent.currentTask && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <Briefcase className="w-4 h-4 text-floor-muted" />
                  <span className="truncate">Working on task...</span>
                </div>
              )}

              {agent.talkingTo && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>
                    Talking to{" "}
                    {agents.find((a) => a.id === agent.talkingTo)?.name}
                  </span>
                </div>
              )}

              {/* Actions (when selected) */}
              {isSelected && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-floor-accent">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStatus: AgentStatus =
                        agent.status === "idle" ? "working" : "idle";
                      updateAgentStatus(agent.id, newStatus);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-floor-highlight text-white rounded-lg text-sm hover:bg-opacity-90"
                  >
                    {agent.status === "idle" ? (
                      <>
                        <Play className="w-4 h-4" />
                        Activate
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open settings
                    }}
                    className="p-2 border border-floor-accent rounded-lg hover:bg-floor-accent"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-floor-accent">
        <h3 className="text-sm font-medium mb-2">Team Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-agent-idle" />
            <span className="text-floor-muted">
              Idle: {agents.filter((a) => a.status === "idle").length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-agent-working" />
            <span className="text-floor-muted">
              Working: {agents.filter((a) => a.status === "working").length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-agent-thinking" />
            <span className="text-floor-muted">
              Thinking: {agents.filter((a) => a.status === "thinking").length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-agent-talking" />
            <span className="text-floor-muted">
              Talking: {agents.filter((a) => a.status === "talking").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const statusConfig: Record<
    AgentStatus,
    { label: string; bgClass: string }
  > = {
    idle: { label: "Idle", bgClass: "bg-agent-idle/20 text-agent-idle" },
    working: {
      label: "Working",
      bgClass: "bg-agent-working/20 text-agent-working",
    },
    thinking: {
      label: "Thinking",
      bgClass: "bg-agent-thinking/20 text-agent-thinking",
    },
    talking: {
      label: "Talking",
      bgClass: "bg-agent-talking/20 text-agent-talking",
    },
    walking: {
      label: "Walking",
      bgClass: "bg-floor-muted/20 text-floor-muted",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgClass}`}
    >
      {config.label}
    </span>
  );
}

function getStatusBgClass(status: AgentStatus): string {
  switch (status) {
    case "idle":
      return "bg-agent-idle/30";
    case "working":
      return "bg-agent-working/30";
    case "thinking":
      return "bg-agent-thinking/30";
    case "talking":
      return "bg-agent-talking/30";
    default:
      return "bg-floor-accent";
  }
}
