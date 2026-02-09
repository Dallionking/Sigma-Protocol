import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GoalType = "travel" | "conversations" | "work" | "culture" | null;
export type LevelType = "beginner" | "basics" | "intermediate" | "advanced" | null;
export type WhyLearnReason = "trip" | "family" | "work" | "personal";

interface OnboardingState {
  // Selections
  goal: GoalType;
  level: LevelType;
  motivation: WhyLearnReason[];
  notificationsOptIn: boolean | null;

  // Progress
  xpEarned: number;
  currentStep: number;

  // Actions
  setGoal: (goal: GoalType) => void;
  setLevel: (level: LevelType) => void;
  toggleMotivation: (reason: WhyLearnReason) => void;
  setNotifications: (optIn: boolean) => void;
  addXP: (amount: number) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  goal: null as GoalType,
  level: null as LevelType,
  motivation: [] as WhyLearnReason[],
  notificationsOptIn: null as boolean | null,
  xpEarned: 0,
  currentStep: 0,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setGoal: (goal) => set({ goal }),

      setLevel: (level) => set({ level }),

      toggleMotivation: (reason) => {
        const current = get().motivation;
        const exists = current.includes(reason);
        set({
          motivation: exists
            ? current.filter((r) => r !== reason)
            : [...current, reason],
        });
      },

      setNotifications: (optIn) => set({ notificationsOptIn: optIn }),

      addXP: (amount) => set({ xpEarned: get().xpEarned + amount }),

      setStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: "@app/onboarding",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Goal options data
export const GOALS = [
  { id: "travel" as const, label: "Travel", icon: "Plane" },
  { id: "conversations" as const, label: "Conversations", icon: "MessageCircle" },
  { id: "work" as const, label: "Work", icon: "Briefcase" },
  { id: "culture" as const, label: "Culture / Family", icon: "Home" },
] as const;

// Level options data
export const LEVELS = [
  { id: "beginner" as const, label: "Complete beginner", subtitle: "Just getting started", icon: "Leaf" },
  { id: "basics" as const, label: "Know some basics", subtitle: "Familiar with fundamentals", icon: "Sprout" },
  { id: "intermediate" as const, label: "Intermediate", subtitle: "Can handle core concepts", icon: "TreeDeciduous" },
  { id: "advanced" as const, label: "Advanced", subtitle: "Comfortable but want mastery", icon: "Mountain" },
] as const;

// Why learn options
export const WHY_LEARN_OPTIONS = [
  { id: "trip" as const, label: "Trip coming up" },
  { id: "family" as const, label: "Family / heritage" },
  { id: "work" as const, label: "Work / career" },
  { id: "personal" as const, label: "Personal growth" },
] as const;



