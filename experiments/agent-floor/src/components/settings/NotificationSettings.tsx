"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  BellOff,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Webhook,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Notification trigger types
 */
type NotificationTrigger = "need_input" | "task_complete" | "error" | "mention";

interface NotificationChannel {
  id: string;
  type: "slack" | "discord" | "email";
  name: string;
  webhookUrl?: string;
  email?: string;
  enabled: boolean;
  triggers: NotificationTrigger[];
}

/**
 * Available notification triggers with metadata
 */
const NOTIFICATION_TRIGGERS: {
  id: NotificationTrigger;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "need_input",
    label: "Need Input",
    description: "When an agent needs your decision",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: "task_complete",
    label: "Task Complete",
    description: "When a task is marked done",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: "error",
    label: "Error",
    description: "When an agent encounters an error",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: "mention",
    label: "Mention",
    description: "When you are @mentioned",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

/**
 * Notification Settings Component
 *
 * Configures:
 * - Browser notifications
 * - Slack/Discord webhooks
 * - Notification triggers
 */
export default function NotificationSettings() {
  // Local state for demonstration (in production, persist to settings store)
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({
    type: "slack",
    name: "",
    webhookUrl: "",
    enabled: true,
    triggers: ["need_input", "error"],
  });

  const handleAddChannel = useCallback(() => {
    if (!newChannel.name || !newChannel.webhookUrl) return;

    const channel: NotificationChannel = {
      id: `channel-${Date.now()}`,
      type: newChannel.type as "slack" | "discord",
      name: newChannel.name,
      webhookUrl: newChannel.webhookUrl,
      enabled: true,
      triggers: newChannel.triggers || [],
    };

    setChannels((prev) => [...prev, channel]);
    setNewChannel({
      type: "slack",
      name: "",
      webhookUrl: "",
      enabled: true,
      triggers: ["need_input", "error"],
    });
    setShowAddForm(false);
  }, [newChannel]);

  const handleRemoveChannel = useCallback((id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleToggleChannel = useCallback((id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  }, []);

  const handleToggleTrigger = useCallback(
    (channelId: string, trigger: NotificationTrigger) => {
      setChannels((prev) =>
        prev.map((c) => {
          if (c.id !== channelId) return c;
          const triggers = c.triggers.includes(trigger)
            ? c.triggers.filter((t) => t !== trigger)
            : [...c.triggers, trigger];
          return { ...c, triggers };
        })
      );
    },
    []
  );

  return (
    <div className="space-y-6" data-testid="notification-settings">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-floor-text flex items-center gap-2">
          <Bell className="w-5 h-5 text-floor-highlight" />
          Notifications
        </h2>
        <p className="text-sm text-floor-muted mt-1">
          Configure how you receive alerts from your agents
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Browser Notifications */}
        <div
          className={cn(
            "p-4 rounded-lg border transition-all",
            browserNotifications
              ? "bg-floor-panel border-floor-highlight/50"
              : "bg-floor-bg border-floor-accent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  browserNotifications
                    ? "bg-floor-highlight/20"
                    : "bg-floor-accent"
                )}
              >
                {browserNotifications ? (
                  <Bell className="w-5 h-5 text-floor-highlight" />
                ) : (
                  <BellOff className="w-5 h-5 text-floor-muted" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">
                  Browser Notifications
                </h3>
                <p className="text-xs text-floor-muted">
                  Show desktop notifications when agents need attention
                </p>
              </div>
            </div>

            <button
              onClick={() => setBrowserNotifications(!browserNotifications)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel",
                browserNotifications ? "bg-floor-highlight" : "bg-floor-accent"
              )}
              role="switch"
              aria-checked={browserNotifications}
              aria-label="Enable browser notifications"
              data-testid="browser-notifications-toggle"
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  browserNotifications && "translate-x-6"
                )}
              />
            </button>
          </div>
        </div>

        {/* Webhook Channels Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-floor-muted uppercase tracking-wide flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook Channels
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-xs text-floor-highlight hover:underline"
                data-testid="add-webhook-button"
              >
                <Plus className="w-3 h-3" />
                Add Webhook
              </button>
            )}
          </div>

          {/* Add Channel Form */}
          {showAddForm && (
            <div
              className="p-4 rounded-lg border border-floor-highlight/50 bg-floor-panel space-y-3"
              data-testid="add-webhook-form"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-floor-muted mb-1">
                    Platform
                  </label>
                  <select
                    value={newChannel.type}
                    onChange={(e) =>
                      setNewChannel((prev) => ({
                        ...prev,
                        type: e.target.value as "slack" | "discord",
                      }))
                    }
                    className="w-full px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight"
                  >
                    <option value="slack">Slack</option>
                    <option value="discord">Discord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-floor-muted mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) =>
                      setNewChannel((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. #agent-alerts"
                    className="w-full px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-floor-muted mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={newChannel.webhookUrl}
                  onChange={(e) =>
                    setNewChannel((prev) => ({
                      ...prev,
                      webhookUrl: e.target.value,
                    }))
                  }
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-floor-highlight"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleAddChannel}
                  disabled={!newChannel.name || !newChannel.webhookUrl}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    newChannel.name && newChannel.webhookUrl
                      ? "bg-floor-highlight text-white hover:bg-opacity-90"
                      : "bg-floor-accent text-floor-muted cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Add Channel
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 text-sm text-floor-muted hover:text-floor-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Channel List */}
          {channels.length > 0 ? (
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    channel.enabled
                      ? "bg-floor-panel border-floor-accent"
                      : "bg-floor-bg border-floor-accent opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded",
                          channel.type === "slack"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {channel.type}
                      </span>
                      <span className="font-medium text-floor-text">
                        {channel.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleChannel(channel.id)}
                        className={cn(
                          "relative w-10 h-5 rounded-full transition-colors",
                          channel.enabled ? "bg-floor-highlight" : "bg-floor-accent"
                        )}
                        role="switch"
                        aria-checked={channel.enabled}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                            channel.enabled && "translate-x-5"
                          )}
                        />
                      </button>
                      <button
                        onClick={() => handleRemoveChannel(channel.id)}
                        className="p-1 text-floor-muted hover:text-red-400 transition-colors"
                        aria-label={`Remove ${channel.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Trigger Selection */}
                  <div className="flex flex-wrap gap-2">
                    {NOTIFICATION_TRIGGERS.map((trigger) => (
                      <button
                        key={trigger.id}
                        onClick={() =>
                          handleToggleTrigger(channel.id, trigger.id)
                        }
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
                          channel.triggers.includes(trigger.id)
                            ? "bg-floor-highlight/20 text-floor-highlight border border-floor-highlight/50"
                            : "bg-floor-bg text-floor-muted border border-floor-accent hover:border-floor-highlight/50"
                        )}
                      >
                        {trigger.icon}
                        {trigger.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showAddForm && (
              <div className="p-6 rounded-lg border border-dashed border-floor-accent text-center">
                <Webhook className="w-8 h-8 mx-auto text-floor-muted mb-2" />
                <p className="text-sm text-floor-muted mb-2">
                  No webhook channels configured
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-sm text-floor-highlight hover:underline"
                >
                  Add your first webhook
                </button>
              </div>
            )
          )}
        </div>

        {/* Help Link */}
        <div className="pt-4 border-t border-floor-accent">
          <a
            href="https://api.slack.com/messaging/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-floor-muted hover:text-floor-highlight transition-colors"
          >
            Learn how to create a Slack webhook
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
