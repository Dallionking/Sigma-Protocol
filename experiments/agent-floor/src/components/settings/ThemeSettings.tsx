"use client";

import { useCallback } from "react";
import { Sun, Moon, Monitor, Palette, Layout, Map } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore, type UIPreferences } from "@/lib/store/settings-store";

/**
 * Theme option configuration
 */
interface ThemeOption {
  id: UIPreferences["theme"];
  label: string;
  description: string;
  icon: React.ReactNode;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Bright interface for daytime",
    icon: <Sun className="w-5 h-5" />,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes at night",
    icon: <Moon className="w-5 h-5" />,
  },
  {
    id: "system",
    label: "System",
    description: "Follow your OS settings",
    icon: <Monitor className="w-5 h-5" />,
  },
];

/**
 * Panel layout options
 */
interface LayoutOption {
  id: UIPreferences["panelLayout"];
  label: string;
  description: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "right",
    label: "Right Panel",
    description: "Panels on the right side",
  },
  {
    id: "left",
    label: "Left Panel",
    description: "Panels on the left side",
  },
  {
    id: "bottom",
    label: "Bottom Panel",
    description: "Panels below the canvas",
  },
];

/**
 * Theme & Appearance Settings Component
 *
 * Configures:
 * - Color theme (light/dark/system)
 * - Panel layout (left/right/bottom)
 * - Minimap visibility
 */
export default function ThemeSettings() {
  const theme = useSettingsStore((state) => state.ui.theme);
  const panelLayout = useSettingsStore((state) => state.ui.panelLayout);
  const showMinimap = useSettingsStore((state) => state.ui.showMinimap);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setPanelLayout = useSettingsStore((state) => state.setPanelLayout);
  const setShowMinimap = useSettingsStore((state) => state.setShowMinimap);

  const handleThemeChange = useCallback(
    (newTheme: UIPreferences["theme"]) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleLayoutChange = useCallback(
    (newLayout: UIPreferences["panelLayout"]) => {
      setPanelLayout(newLayout);
    },
    [setPanelLayout]
  );

  return (
    <div className="space-y-6" data-testid="theme-settings">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-floor-text flex items-center gap-2">
          <Palette className="w-5 h-5 text-floor-highlight" />
          Appearance
        </h2>
        <p className="text-sm text-floor-muted mt-1">
          Customize how AgentFloor looks and feels
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-floor-muted uppercase tracking-wide">
            Color Theme
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleThemeChange(option.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  theme === option.id
                    ? "bg-floor-panel border-floor-highlight ring-2 ring-floor-highlight/30"
                    : "bg-floor-bg border-floor-accent hover:border-floor-highlight/50"
                )}
                data-testid={`theme-option-${option.id}`}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                    theme === option.id
                      ? "bg-floor-highlight/20 text-floor-highlight"
                      : "bg-floor-accent text-floor-muted"
                  )}
                >
                  {option.icon}
                </div>
                <h4 className="font-semibold text-floor-text">{option.label}</h4>
                <p className="text-xs text-floor-muted mt-0.5">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Layout */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-floor-muted uppercase tracking-wide flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Panel Layout
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleLayoutChange(option.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  panelLayout === option.id
                    ? "bg-floor-panel border-floor-highlight ring-2 ring-floor-highlight/30"
                    : "bg-floor-bg border-floor-accent hover:border-floor-highlight/50"
                )}
                data-testid={`layout-option-${option.id}`}
              >
                {/* Layout Preview */}
                <div
                  className={cn(
                    "w-full h-12 rounded border mb-2 flex overflow-hidden",
                    panelLayout === option.id
                      ? "border-floor-highlight/50"
                      : "border-floor-accent"
                  )}
                >
                  {option.id === "left" && (
                    <>
                      <div className="w-1/3 bg-floor-accent" />
                      <div className="flex-1 bg-floor-bg" />
                    </>
                  )}
                  {option.id === "right" && (
                    <>
                      <div className="flex-1 bg-floor-bg" />
                      <div className="w-1/3 bg-floor-accent" />
                    </>
                  )}
                  {option.id === "bottom" && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 bg-floor-bg" />
                      <div className="h-1/3 bg-floor-accent" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-floor-text text-sm">
                  {option.label}
                </h4>
                <p className="text-xs text-floor-muted">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Minimap Toggle */}
        <div
          className={cn(
            "p-4 rounded-lg border transition-all",
            showMinimap
              ? "bg-floor-panel border-floor-highlight/50"
              : "bg-floor-bg border-floor-accent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  showMinimap ? "bg-floor-highlight/20" : "bg-floor-accent"
                )}
              >
                <Map
                  className={cn(
                    "w-5 h-5",
                    showMinimap ? "text-floor-highlight" : "text-floor-muted"
                  )}
                />
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">Show Minimap</h3>
                <p className="text-xs text-floor-muted">
                  Display a small overview map in the corner
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel",
                showMinimap ? "bg-floor-highlight" : "bg-floor-accent"
              )}
              role="switch"
              aria-checked={showMinimap}
              aria-label="Show minimap"
              data-testid="minimap-toggle"
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  showMinimap && "translate-x-6"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
