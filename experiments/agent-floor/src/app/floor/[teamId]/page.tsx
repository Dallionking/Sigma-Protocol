"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ListTodo, Settings, Users, Activity } from "lucide-react";
import ChatPanel from "@/components/chat/ChatPanel";
import TaskBoard from "@/components/tasks/TaskBoard";
import AgentList from "@/components/floor/AgentList";
import { TokenDashboard } from "@/components/dashboard";
import { useFloorStore } from "@/lib/store/floor-store";
import {
  ConnectionStatusIndicator,
  ConnectionOverlay,
  ConnectionToast,
} from "@/components/ui/connection-status";

// Dynamic import for Phaser (client-side only)
const FloorCanvas = dynamic(() => import("@/components/floor/FloorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-floor-bg">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-floor-highlight border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-floor-muted">Loading office...</p>
      </div>
    </div>
  ),
});

type Panel = "chat" | "tasks" | "agents" | "dashboard" | "settings" | null;

export default function FloorPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [activePanel, setActivePanel] = useState<Panel>("chat");
  const { connect, disconnect, connectionStatus, agents, reconnect } = useFloorStore();

  useEffect(() => {
    // Connect to Colyseus server
    connect(teamId);

    return () => {
      disconnect();
    };
  }, [teamId, connect, disconnect]);

  const togglePanel = (panel: Panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-floor-panel border-b border-floor-accent flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-floor-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold capitalize">
              {teamId.replace("-", " ")}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <ConnectionStatusIndicator size="sm" />
              <span className="text-floor-muted">•</span>
              <span className="text-floor-muted">
                {agents.length} agents active
              </span>
            </div>
          </div>
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePanel("agents")}
            className={`p-2 rounded-lg transition-colors ${
              activePanel === "agents"
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent"
            }`}
            title="Agents"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => togglePanel("chat")}
            className={`p-2 rounded-lg transition-colors relative ${
              activePanel === "chat"
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent"
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => togglePanel("tasks")}
            className={`p-2 rounded-lg transition-colors ${
              activePanel === "tasks"
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent"
            }`}
            title="Tasks"
          >
            <ListTodo className="w-5 h-5" />
          </button>
          <button
            onClick={() => togglePanel("dashboard")}
            className={`p-2 rounded-lg transition-colors ${
              activePanel === "dashboard"
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent"
            }`}
            title="Token Dashboard"
            data-testid="dashboard-tab"
          >
            <Activity className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-floor-accent mx-2" />
          <button
            onClick={() => togglePanel("settings")}
            className={`p-2 rounded-lg transition-colors ${
              activePanel === "settings"
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent"
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Game canvas */}
        <div className="flex-1 relative">
          <FloorCanvas teamId={teamId} />

          {/* Connection overlay for reconnecting/failed states */}
          <ConnectionOverlay
            onRetry={() => reconnect()}
            onCancel={() => {
              // On cancel during reconnect, just stop reconnecting
              // On cancel after failure, go back to landing
            }}
          />
        </div>

        {/* Side panel */}
        {activePanel && (
          <div className="w-96 bg-floor-panel border-l border-floor-accent overflow-hidden panel-slide-in">
            {activePanel === "chat" && <ChatPanel />}
            {activePanel === "tasks" && <TaskBoard />}
            {activePanel === "agents" && <AgentList />}
            {activePanel === "dashboard" && <TokenDashboard />}
            {activePanel === "settings" && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                <p className="text-floor-muted">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast notifications for connection events */}
      <ConnectionToast />
    </div>
  );
}
