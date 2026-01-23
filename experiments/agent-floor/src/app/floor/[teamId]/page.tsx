"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ListTodo, Settings, Users, Activity } from "lucide-react";
import ChatPanel from "@/components/chat/ChatPanel";
import TaskBoard from "@/components/tasks/TaskBoard";
import AgentList from "@/components/floor/AgentList";
import { TokenDashboard } from "@/components/dashboard";
import { TabNavigation, TabPanel, TabSeparator, Tab, TabId } from "@/components/floor/TabNavigation";
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

// Define tabs configuration
const MAIN_TABS: Tab[] = [
  { id: "agents", label: "Agents", icon: Users, testId: "agents-tab" },
  { id: "chat", label: "Chat", icon: MessageSquare, testId: "chat-tab" },
  { id: "tasks", label: "Tasks", icon: ListTodo, testId: "tasks-tab" },
  { id: "dashboard", label: "Dashboard", icon: Activity, testId: "dashboard-tab" },
];

const SETTINGS_TABS: Tab[] = [
  { id: "settings", label: "Settings", icon: Settings, testId: "settings-tab" },
];

export default function FloorPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [activeTab, setActiveTab] = useState<TabId | null>("chat");
  const { connect, disconnect, agents, messages, reconnect } = useFloorStore();

  // Calculate unread message count (for future use)
  const unreadCount = useMemo(() => {
    // For now, return 0 - in a real app this would track unread state
    return 0;
  }, [messages]);

  // Tabs with dynamic badges
  const tabsWithBadges = useMemo(() => {
    return MAIN_TABS.map((tab) => ({
      ...tab,
      badge: tab.id === "chat" ? unreadCount : undefined,
    }));
  }, [unreadCount]);

  useEffect(() => {
    // Connect to Colyseus server
    connect(teamId);

    return () => {
      disconnect();
    };
  }, [teamId, connect, disconnect]);

  const handleTabChange = (tabId: TabId | null) => {
    setActiveTab(tabId);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-floor-panel border-b border-floor-accent flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-floor-accent transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold capitalize">
              {teamId.replace("-", " ")}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <ConnectionStatusIndicator size="sm" />
              <span className="text-floor-muted" aria-hidden="true">•</span>
              <span className="text-floor-muted">
                {agents.length} agents active
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center" aria-label="Floor panel navigation">
          <TabNavigation
            tabs={tabsWithBadges}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <TabSeparator />
          <TabNavigation
            tabs={SETTINGS_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </nav>
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

        {/* Side panel with TabPanel components */}
        {activeTab && (
          <aside
            className="w-96 bg-floor-panel border-l border-floor-accent overflow-hidden panel-slide-in"
            aria-label={`${activeTab} panel`}
          >
            <TabPanel id="chat" activeTab={activeTab} className="h-full">
              <ChatPanel />
            </TabPanel>
            <TabPanel id="tasks" activeTab={activeTab} className="h-full">
              <TaskBoard />
            </TabPanel>
            <TabPanel id="agents" activeTab={activeTab} className="h-full">
              <AgentList />
            </TabPanel>
            <TabPanel id="dashboard" activeTab={activeTab} className="h-full">
              <TokenDashboard />
            </TabPanel>
            <TabPanel id="settings" activeTab={activeTab} className="h-full p-4">
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <p className="text-floor-muted">Settings panel coming soon...</p>
            </TabPanel>
          </aside>
        )}
      </div>

      {/* Toast notifications for connection events */}
      <ConnectionToast />
    </div>
  );
}
