"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Cpu,
  Speaker,
  Bell,
  Palette,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import ProviderConfig from "@/components/settings/ProviderConfig";
import VoiceSettings from "@/components/settings/VoiceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import { useSettingsStore } from "@/lib/store/settings-store";

/**
 * Settings section configuration
 */
interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "providers",
    label: "Providers",
    icon: <Cpu className="w-4 h-4" />,
    component: ProviderConfig,
  },
  {
    id: "voice",
    label: "Voice & Audio",
    icon: <Speaker className="w-4 h-4" />,
    component: VoiceSettings,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
    component: NotificationSettings,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette className="w-4 h-4" />,
    component: ThemeSettings,
  },
];

/**
 * Full Settings Page
 *
 * Acceptance Criteria:
 * - [AC1] Provider configuration section (type: visual)
 * - [AC2] Voice settings section (type: visual)
 * - [AC3] Notification settings section (type: visual)
 * - [AC4] Theme preferences (type: visual)
 * - [AC5] Back to home link (type: visual)
 */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("providers");
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetConfirm = useCallback(() => {
    resetToDefaults();
    setShowResetConfirm(false);
  }, [resetToDefaults]);

  // Get the active section component
  const ActiveComponent =
    SETTINGS_SECTIONS.find((s) => s.id === activeSection)?.component ||
    ProviderConfig;

  return (
    <div className="min-h-screen bg-floor-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-floor-panel border-b border-floor-accent">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* [AC5] Back to home link */}
              <Link
                href="/"
                className="p-2 text-floor-muted hover:text-floor-text hover:bg-floor-accent rounded-lg transition-colors"
                aria-label="Back to home"
                data-testid="back-to-home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-floor-accent flex items-center justify-center">
                  <Settings className="w-5 h-5 text-floor-highlight" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-floor-text">
                    Settings
                  </h1>
                  <p className="text-xs text-floor-muted">
                    Configure your AgentFloor preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-floor-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              data-testid="reset-settings"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-56 flex-shrink-0" aria-label="Settings navigation">
            <div className="sticky top-24 space-y-1">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                    activeSection === section.id
                      ? "bg-floor-highlight/10 text-floor-highlight border-l-2 border-floor-highlight"
                      : "text-floor-muted hover:text-floor-text hover:bg-floor-accent"
                  )}
                  aria-current={activeSection === section.id ? "page" : undefined}
                  data-testid={`nav-${section.id}`}
                >
                  <span
                    className={cn(
                      activeSection === section.id
                        ? "text-floor-highlight"
                        : "text-floor-muted"
                    )}
                  >
                    {section.icon}
                  </span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <ActiveComponent />
          </main>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-md p-6 bg-floor-panel rounded-lg border border-floor-accent shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-floor-text mb-2">
              Reset All Settings?
            </h2>
            <p className="text-sm text-floor-muted mb-4">
              This will reset all settings to their default values, including
              provider configurations and API keys. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                data-testid="confirm-reset"
              >
                Reset All Settings
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-floor-muted hover:text-floor-text transition-colors"
                data-testid="cancel-reset"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
