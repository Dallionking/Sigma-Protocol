import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  streak: number;
  joinedAt: string;
  nativeLanguage: string;
}

export interface UserStats {
  totalXP: number;
  lessonsCompleted: number;
  wordsLearned: number;
  hoursPracticed: number;
  listeningMinutes: number;
  speakingMinutes: number;
  readingMinutes: number;
  writingMinutes: number;
  weeklyActivity: number[]; // 7 days, minutes per day
  streakCalendar: Record<string, boolean>; // "YYYY-MM-DD" -> completed
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "streak" | "lessons" | "vocabulary" | "speaking" | "special";
  unlockedAt?: string;
  progress?: number;
  maxProgress: number;
}

export interface NotificationSettings {
  dailyReminders: boolean;
  reminderTime: string; // "HH:MM"
  weeklyDigest: boolean;
  achievementAlerts: boolean;
  sessionReminders: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  showProgress: boolean;
}

export interface AppearanceSettings {
  theme: "dark" | "system";
  reducedMotion: boolean;
  fontSize: "normal" | "large";
}

export interface LanguageSettings {
  appLanguage: string;
  voiceSpeed: "slow" | "normal" | "fast";
  autoplayAudio: boolean;
}

interface ProfileState {
  // User data
  profile: UserProfile | null;
  stats: UserStats | null;
  achievements: Achievement[];

  // Settings
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  language: LanguageSettings;

  // UI state
  isLoading: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setStats: (stats: UserStats) => void;
  setAchievements: (achievements: Achievement[]) => void;
  unlockAchievement: (achievementId: string) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  updateLanguage: (settings: Partial<LanguageSettings>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyReminders: true,
  reminderTime: "09:00",
  weeklyDigest: true,
  achievementAlerts: true,
  sessionReminders: true,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  showProfile: true,
  showProgress: true,
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  reducedMotion: false,
  fontSize: "normal",
};

const DEFAULT_LANGUAGE: LanguageSettings = {
  appLanguage: "en",
  voiceSpeed: "normal",
  autoplayAudio: true,
};

const initialState = {
  profile: null as UserProfile | null,
  stats: null as UserStats | null,
  achievements: [] as Achievement[],
  notifications: DEFAULT_NOTIFICATIONS,
  privacy: DEFAULT_PRIVACY,
  appearance: DEFAULT_APPEARANCE,
  language: DEFAULT_LANGUAGE,
  isLoading: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setStats: (stats) => set({ stats }),

      setAchievements: (achievements) => set({ achievements }),

      unlockAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, unlockedAt: new Date().toISOString(), progress: a.maxProgress }
              : a
          ),
        })),

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updateAppearance: (settings) =>
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        })),

      updateLanguage: (settings) =>
        set((state) => ({
          language: { ...state.language, ...settings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => set(initialState),
    }),
    {
      name: "@app/profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        stats: state.stats,
        achievements: state.achievements,
        notifications: state.notifications,
        privacy: state.privacy,
        appearance: state.appearance,
        language: state.language,
      }),
    }
  )
);

/**
 * Stubbed API calls for prototype
 */
export const profileApi = {
  updateEmail: async (newEmail: string): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true };
  },

  updatePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true };
  },

  deleteAccount: async (password: string): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true };
  },

  exportData: async (): Promise<{ success: boolean; downloadUrl: string }> => {
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, downloadUrl: "mock://data-export.zip" };
  },

  submitContactForm: async (
    subject: string,
    message: string
  ): Promise<{ success: boolean; ticketId: string }> => {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true, ticketId: `TICKET-${Date.now()}` };
  },
};

