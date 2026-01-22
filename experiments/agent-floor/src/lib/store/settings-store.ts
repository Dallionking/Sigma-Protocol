import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProviderId, ProviderConfig } from "@/types/provider";

/**
 * Panel visibility preferences for the UI
 */
export interface PanelPreferences {
  chatPanel: boolean;
  taskPanel: boolean;
  agentPanel: boolean;
  tokenDashboard: boolean;
}

/**
 * UI preferences for theming and layout
 */
export interface UIPreferences {
  theme: "light" | "dark" | "system";
  panelLayout: "left" | "right" | "bottom";
  showMinimap: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  volume: number;
  panels: PanelPreferences;
}

/**
 * Provider configuration with API key (sensitive)
 */
export interface StoredProviderConfig {
  id: ProviderId;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
}

/**
 * Settings store state
 */
interface SettingsState {
  // Provider configurations
  providers: StoredProviderConfig[];

  // Selected team preference
  selectedTeam: string | null;
  recentTeams: string[];

  // UI preferences
  ui: UIPreferences;

  // Actions - Provider management
  getProvider: (id: ProviderId) => StoredProviderConfig | undefined;
  updateProvider: (id: ProviderId, updates: Partial<StoredProviderConfig>) => void;
  setProviderEnabled: (id: ProviderId, enabled: boolean) => void;
  setProviderApiKey: (id: ProviderId, apiKey: string) => void;

  // Actions - Team preferences
  setSelectedTeam: (teamId: string | null) => void;
  addRecentTeam: (teamId: string) => void;
  clearRecentTeams: () => void;

  // Actions - UI preferences
  setTheme: (theme: UIPreferences["theme"]) => void;
  setPanelLayout: (layout: UIPreferences["panelLayout"]) => void;
  togglePanel: (panel: keyof PanelPreferences) => void;
  setPanelVisible: (panel: keyof PanelPreferences, visible: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setShowMinimap: (show: boolean) => void;

  // Utility actions
  resetToDefaults: () => void;
}

/**
 * Default provider configurations
 */
const defaultProviders: StoredProviderConfig[] = [
  {
    id: "claude-code",
    enabled: true,
    defaultModel: "opus",
  },
  {
    id: "anthropic",
    enabled: false,
    apiKey: "",
    defaultModel: "claude-sonnet-4-20250514",
  },
  {
    id: "openai",
    enabled: false,
    apiKey: "",
    defaultModel: "gpt-4o",
  },
  {
    id: "gemini",
    enabled: false,
    apiKey: "",
    defaultModel: "gemini-2.0-flash",
  },
  {
    id: "openrouter",
    enabled: false,
    apiKey: "",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-sonnet-4",
  },
  {
    id: "xai",
    enabled: false,
    apiKey: "",
    defaultModel: "grok-2",
  },
  {
    id: "ollama",
    enabled: false,
    baseUrl: "http://localhost:11434",
    defaultModel: "llama3.2",
  },
];

/**
 * Default UI preferences
 */
const defaultUIPreferences: UIPreferences = {
  theme: "system",
  panelLayout: "right",
  showMinimap: true,
  soundEnabled: true,
  voiceEnabled: false,
  volume: 0.7,
  panels: {
    chatPanel: true,
    taskPanel: true,
    agentPanel: true,
    tokenDashboard: false,
  },
};

/**
 * Settings store with localStorage persistence
 *
 * Stores:
 * - Provider configurations (API keys, enabled state, default models)
 * - Team preferences (selected team, recent teams)
 * - UI preferences (theme, panel states, sound/voice settings)
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      providers: defaultProviders,
      selectedTeam: null,
      recentTeams: [],
      ui: defaultUIPreferences,

      // Provider management
      getProvider: (id) => {
        return get().providers.find((p) => p.id === id);
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      setProviderEnabled: (id, enabled) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, enabled } : p
          ),
        }));
      },

      setProviderApiKey: (id, apiKey) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, apiKey } : p
          ),
        }));
      },

      // Team preferences
      setSelectedTeam: (teamId) => {
        set({ selectedTeam: teamId });
        if (teamId) {
          get().addRecentTeam(teamId);
        }
      },

      addRecentTeam: (teamId) => {
        set((state) => {
          const filtered = state.recentTeams.filter((t) => t !== teamId);
          return {
            recentTeams: [teamId, ...filtered].slice(0, 5), // Keep last 5
          };
        });
      },

      clearRecentTeams: () => {
        set({ recentTeams: [] });
      },

      // UI preferences
      setTheme: (theme) => {
        set((state) => ({
          ui: { ...state.ui, theme },
        }));
      },

      setPanelLayout: (panelLayout) => {
        set((state) => ({
          ui: { ...state.ui, panelLayout },
        }));
      },

      togglePanel: (panel) => {
        set((state) => ({
          ui: {
            ...state.ui,
            panels: {
              ...state.ui.panels,
              [panel]: !state.ui.panels[panel],
            },
          },
        }));
      },

      setPanelVisible: (panel, visible) => {
        set((state) => ({
          ui: {
            ...state.ui,
            panels: {
              ...state.ui.panels,
              [panel]: visible,
            },
          },
        }));
      },

      setSoundEnabled: (soundEnabled) => {
        set((state) => ({
          ui: { ...state.ui, soundEnabled },
        }));
      },

      setVoiceEnabled: (voiceEnabled) => {
        set((state) => ({
          ui: { ...state.ui, voiceEnabled },
        }));
      },

      setVolume: (volume) => {
        set((state) => ({
          ui: { ...state.ui, volume: Math.max(0, Math.min(1, volume)) },
        }));
      },

      setShowMinimap: (showMinimap) => {
        set((state) => ({
          ui: { ...state.ui, showMinimap },
        }));
      },

      // Utility
      resetToDefaults: () => {
        set({
          providers: defaultProviders,
          selectedTeam: null,
          recentTeams: [],
          ui: defaultUIPreferences,
        });
      },
    }),
    {
      name: "agent-floor-settings",
      storage: createJSONStorage(() => localStorage),
      // Version for migrations
      version: 1,
      // Partial persistence - exclude sensitive data on certain conditions if needed
      partialize: (state) => ({
        providers: state.providers,
        selectedTeam: state.selectedTeam,
        recentTeams: state.recentTeams,
        ui: state.ui,
      }),
    }
  )
);

/**
 * Selector hooks for common use cases
 */
export const useTheme = () => useSettingsStore((state) => state.ui.theme);
export const usePanels = () => useSettingsStore((state) => state.ui.panels);
export const useProviders = () => useSettingsStore((state) => state.providers);
export const useEnabledProviders = () =>
  useSettingsStore((state) => state.providers.filter((p) => p.enabled));
export const useSelectedTeam = () =>
  useSettingsStore((state) => state.selectedTeam);
