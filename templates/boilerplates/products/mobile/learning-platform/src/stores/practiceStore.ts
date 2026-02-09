import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ExerciseType =
  | "mcq"
  | "fill-blank"
  | "speaking"
  | "sentence-build"
  | "listening"
  | "translation"
  | "timed-drill";

export type AnswerResult = {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
};

interface PracticeState {
  // Current session
  currentExerciseType: ExerciseType | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: AnswerResult[];

  // Scoring
  correctCount: number;
  streakCount: number;
  bestStreak: number;

  // Timing
  sessionStartTime: number | null;
  timedDrillRemaining: number; // seconds

  // XP
  xpEarned: number;
  hintsUsed: number;

  // Pronunciation (for speaking exercises)
  lastPronunciationScore: number | null;
  wordFeedback: Array<{ word: string; score: number; tip?: string }>;

  // Actions
  startSession: (type: ExerciseType, totalQuestions: number) => void;
  recordAnswer: (result: AnswerResult) => void;
  nextQuestion: () => void;
  setPronunciationScore: (
    score: number,
    feedback: Array<{ word: string; score: number; tip?: string }>
  ) => void;
  useHint: () => void;
  setTimedDrillRemaining: (seconds: number) => void;
  endSession: () => void;
  reset: () => void;
}

const XP_PER_CORRECT = 10;
const XP_STREAK_BONUS = 5;
const XP_HINT_PENALTY = 3;

const initialState = {
  currentExerciseType: null as ExerciseType | null,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  answers: [] as AnswerResult[],
  correctCount: 0,
  streakCount: 0,
  bestStreak: 0,
  sessionStartTime: null as number | null,
  timedDrillRemaining: 60,
  xpEarned: 0,
  hintsUsed: 0,
  lastPronunciationScore: null as number | null,
  wordFeedback: [] as Array<{ word: string; score: number; tip?: string }>,
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (type, totalQuestions) =>
        set({
          currentExerciseType: type,
          currentQuestionIndex: 0,
          totalQuestions,
          answers: [],
          correctCount: 0,
          streakCount: 0,
          bestStreak: 0,
          sessionStartTime: Date.now(),
          timedDrillRemaining: type === "timed-drill" ? 60 : 0,
          xpEarned: 0,
          hintsUsed: 0,
          lastPronunciationScore: null,
          wordFeedback: [],
        }),

      recordAnswer: (result) =>
        set((state) => {
          const newAnswers = [...state.answers, result];
          const newCorrectCount = state.correctCount + (result.isCorrect ? 1 : 0);
          const newStreakCount = result.isCorrect ? state.streakCount + 1 : 0;
          const newBestStreak = Math.max(state.bestStreak, newStreakCount);

          // Calculate XP
          let xpGain = result.isCorrect ? XP_PER_CORRECT : 0;
          if (result.isCorrect && newStreakCount >= 3) {
            xpGain += XP_STREAK_BONUS;
          }

          return {
            answers: newAnswers,
            correctCount: newCorrectCount,
            streakCount: newStreakCount,
            bestStreak: newBestStreak,
            xpEarned: state.xpEarned + xpGain,
          };
        }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            state.totalQuestions - 1
          ),
        })),

      setPronunciationScore: (score, feedback) =>
        set({
          lastPronunciationScore: score,
          wordFeedback: feedback,
        }),

      useHint: () =>
        set((state) => ({
          hintsUsed: state.hintsUsed + 1,
          xpEarned: Math.max(0, state.xpEarned - XP_HINT_PENALTY),
        })),

      setTimedDrillRemaining: (seconds) =>
        set({ timedDrillRemaining: seconds }),

      endSession: () =>
        set({
          sessionStartTime: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "@app/practice",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist stats, not session state
        bestStreak: state.bestStreak,
      }),
    }
  )
);

