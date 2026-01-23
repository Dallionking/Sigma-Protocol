"use client";

import { useRef, useCallback, KeyboardEvent } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TabId = "agents" | "chat" | "tasks" | "dashboard" | "settings";

export interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  testId?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: TabId | null;
  onTabChange: (tabId: TabId | null) => void;
  showLabels?: boolean;
  className?: string;
}

/**
 * TabNavigation component with proper accessibility and keyboard navigation.
 *
 * Features:
 * - ARIA attributes for screen readers (role="tablist", role="tab", aria-selected)
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Badge support for notifications
 * - Toggle behavior (clicking active tab closes panel)
 */
export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  showLabels = false,
  className,
}: TabNavigationProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    const ref = tabRefs.current[index];
    if (ref) {
      ref.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const tabCount = tabs.length;
      let newIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          newIndex = (currentIndex + 1) % tabCount;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          newIndex = (currentIndex - 1 + tabCount) % tabCount;
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newIndex = tabCount - 1;
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          const tab = tabs[currentIndex];
          onTabChange(activeTab === tab.id ? null : tab.id);
          return;
      }

      if (newIndex !== null) {
        focusTab(newIndex);
      }
    },
    [tabs, activeTab, onTabChange, focusTab]
  );

  const handleTabClick = useCallback(
    (tabId: TabId) => {
      // Toggle behavior: clicking active tab closes panel
      onTabChange(activeTab === tabId ? null : tabId);
    },
    [activeTab, onTabChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Floor panels"
      className={cn("flex items-center gap-1", className)}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isSettings = tab.id === "settings";

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            data-testid={tab.testId || `${tab.id}-tab`}
            className={cn(
              "relative flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-1 focus:ring-offset-floor-panel",
              isActive
                ? "bg-floor-highlight text-white"
                : "hover:bg-floor-accent text-floor-text",
              isSettings && "ml-2" // Extra margin before settings
            )}
            title={tab.label}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />

            {/* Label - shown based on showLabels prop */}
            {showLabels && (
              <span className="text-sm font-medium">{tab.label}</span>
            )}

            {/* Badge for notifications */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 min-w-5 h-5 px-1",
                  "flex items-center justify-center",
                  "text-xs font-bold text-white rounded-full",
                  "bg-gradient-to-r from-floor-highlight to-purple-500",
                  "animate-pulse"
                )}
                aria-label={`${tab.badge} new items`}
              >
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}

            {/* Active indicator line */}
            {isActive && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * TabPanel wrapper component for proper ARIA association with tabs.
 */
interface TabPanelProps {
  id: TabId;
  activeTab: TabId | null;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (activeTab !== id) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn("focus:outline-none", className)}
    >
      {children}
    </div>
  );
}

/**
 * Separator component for visual division between tab groups.
 */
export function TabSeparator() {
  return (
    <div
      className="w-px h-6 bg-floor-accent mx-2"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

export default TabNavigation;
