import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LessonPosition, LessonProgressStatus, Tier } from "@/lib/schemas/learn";

export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  essential: 1,
  pro: 2,
  vip: 3,
} as const;

export function hasTierAccess(activeTier: Tier, requiredTier: Tier): boolean {
  return TIER_RANK[activeTier] >= TIER_RANK[requiredTier];
}

export type LessonProgressRecord = {
  status: LessonProgressStatus;
  completion_percent: number; // 0-100
  last_position: LessonPosition;
  started_at?: string;
  completed_at?: string;
  xp_earned?: number;
};

export type AssessmentResult = {
  attempts: number;
  best_score_percent: number; // 0-100
  passed: boolean;
  last_attempt_at?: string;
};

interface LearnState {
  // Access / gating
  activeTier: Tier;

  // Progress
  currentLessonId: string | null;
  progressByLessonId: Record<string, LessonProgressRecord>;
  assessmentByCategoryId: Record<string, AssessmentResult>;

  // Local user actions
  savedVocabIds: Record<string, true>;
  flaggedVocabIds: Record<string, true>;

  // Basic gamification (local prototype)
  xpEarned: number;

  // Actions
  setActiveTier: (tier: Tier) => void;
  setCurrentLessonId: (lessonId: string | null) => void;

  startLesson: (lessonId: string) => void;
  setLessonCompletionPercent: (lessonId: string, completionPercent: number) => void;
  setLessonPosition: (lessonId: string, position: LessonPosition) => void;
  completeLesson: (lessonId: string, xpReward?: number) => void;

  recordAssessmentAttempt: (categoryId: string, scorePercent: number, passed: boolean) => void;

  toggleSavedVocab: (vocabId: string) => void;
  toggleFlaggedVocab: (vocabId: string) => void;

  addXP: (amount: number) => void;
  reset: () => void;
}

const initialState = {
  activeTier: "free" as Tier,
  currentLessonId: null as string | null,
  progressByLessonId: {} as Record<string, LessonProgressRecord>,
  assessmentByCategoryId: {} as Record<string, AssessmentResult>,
  savedVocabIds: {} as Record<string, true>,
  flaggedVocabIds: {} as Record<string, true>,
  xpEarned: 0,
};

function clampPercent(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ensureProgress(
  progressByLessonId: Record<string, LessonProgressRecord>,
  lessonId: string
): Record<string, LessonProgressRecord> {
  if (progressByLessonId[lessonId]) return progressByLessonId;

  return {
    ...progressByLessonId,
    [lessonId]: {
      status: "not_started",
      completion_percent: 0,
      last_position: {},
    },
  };
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveTier: (tier) => set({ activeTier: tier }),
      setCurrentLessonId: (lessonId) => set({ currentLessonId: lessonId }),

      startLesson: (lessonId) =>
        set((state) => {
          const nextProgress = ensureProgress(state.progressByLessonId, lessonId);
          const existing = nextProgress[lessonId];

          return {
            currentLessonId: lessonId,
            progressByLessonId: {
              ...nextProgress,
              [lessonId]: {
                ...existing,
                status: existing.status === "completed" ? "completed" : "in_progress",
                started_at: existing.started_at ?? new Date().toISOString(),
              },
            },
          };
        }),

      setLessonCompletionPercent: (lessonId, completionPercent) =>
        set((state) => {
          const nextProgress = ensureProgress(state.progressByLessonId, lessonId);
          const existing = nextProgress[lessonId];
          const percent = clampPercent(completionPercent);

          const status: LessonProgressStatus =
            percent >= 100 ? "completed" : percent > 0 ? "in_progress" : existing.status;

          return {
            progressByLessonId: {
              ...nextProgress,
              [lessonId]: {
                ...existing,
                status,
                completion_percent: percent,
                completed_at: status === "completed" ? new Date().toISOString() : existing.completed_at,
              },
            },
          };
        }),

      setLessonPosition: (lessonId, position) =>
        set((state) => {
          const nextProgress = ensureProgress(state.progressByLessonId, lessonId);
          const existing = nextProgress[lessonId];

          return {
            progressByLessonId: {
              ...nextProgress,
              [lessonId]: {
                ...existing,
                last_position: {
                  ...existing.last_position,
                  ...position,
                },
              },
            },
          };
        }),

      completeLesson: (lessonId, xpReward) =>
        set((state) => {
          const nextProgress = ensureProgress(state.progressByLessonId, lessonId);
          const existing = nextProgress[lessonId];
          const alreadyCompleted = existing.status === "completed";
          const xp = alreadyCompleted ? 0 : xpReward ?? existing.xp_earned ?? 0;
          const now = new Date().toISOString();

          return {
            currentLessonId: lessonId,
            xpEarned: state.xpEarned + xp,
            progressByLessonId: {
              ...nextProgress,
              [lessonId]: {
                ...existing,
                status: "completed",
                completion_percent: 100,
                completed_at: existing.completed_at ?? now,
                xp_earned: (existing.xp_earned ?? 0) + xp,
              },
            },
          };
        }),

      recordAssessmentAttempt: (categoryId, scorePercent, passed) =>
        set((state) => {
          const percent = clampPercent(scorePercent);
          const existing = state.assessmentByCategoryId[categoryId];

          const next: AssessmentResult = {
            attempts: (existing?.attempts ?? 0) + 1,
            best_score_percent: Math.max(existing?.best_score_percent ?? 0, percent),
            passed: existing?.passed ? true : passed,
            last_attempt_at: new Date().toISOString(),
          };

          return {
            assessmentByCategoryId: {
              ...state.assessmentByCategoryId,
              [categoryId]: next,
            },
          };
        }),

      toggleSavedVocab: (vocabId) =>
        set((state) => {
          const next = { ...state.savedVocabIds };
          if (next[vocabId]) delete next[vocabId];
          else next[vocabId] = true;
          return { savedVocabIds: next };
        }),

      toggleFlaggedVocab: (vocabId) =>
        set((state) => {
          const next = { ...state.flaggedVocabIds };
          if (next[vocabId]) delete next[vocabId];
          else next[vocabId] = true;
          return { flaggedVocabIds: next };
        }),

      addXP: (amount) => set((state) => ({ xpEarned: state.xpEarned + Math.max(0, amount) })),

      reset: () => set(initialState),
    }),
    {
      name: "@app/learn",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



