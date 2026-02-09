import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AIMode = "conversation" | "grammar" | "story" | "drill" | "voice";

export type MessageSender = "user" | "tutor";

export type Correction = {
  original: string;
  corrected: string;
  explanation: string;
};

export type Message = {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: number;
  corrections?: Correction[];
  isTyping?: boolean;
};

export type SessionStats = {
  messageCount: number;
  voiceDurationSeconds: number;
  correctionsLearned: number;
  startTime: number;
  endTime?: number;
};

interface AIState {
  // Current session
  currentMode: AIMode | null;
  messages: Message[];
  isTyping: boolean;
  sessionStats: SessionStats | null;

  // Voice state
  isRecording: boolean;
  isListening: boolean;
  isSpeaking: boolean;

  // Session history (for resume)
  lastSessionMode: AIMode | null;
  lastSessionMessages: Message[];

  // XP
  xpEarned: number;

  // Actions
  startSession: (mode: AIMode) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setTyping: (isTyping: boolean) => void;
  addCorrection: (messageId: string, correction: Correction) => void;
  setVoiceState: (state: { isRecording?: boolean; isListening?: boolean; isSpeaking?: boolean }) => void;
  addVoiceDuration: (seconds: number) => void;
  endSession: () => void;
  resumeSession: () => void;
  reset: () => void;
}

const XP_PER_MESSAGE = 5;
const XP_PER_CORRECTION = 10;
const XP_PER_VOICE_MINUTE = 15;

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const initialState = {
  currentMode: null as AIMode | null,
  messages: [] as Message[],
  isTyping: false,
  sessionStats: null as SessionStats | null,
  isRecording: false,
  isListening: false,
  isSpeaking: false,
  lastSessionMode: null as AIMode | null,
  lastSessionMessages: [] as Message[],
  xpEarned: 0,
};

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (mode) =>
        set({
          currentMode: mode,
          messages: [],
          isTyping: false,
          sessionStats: {
            messageCount: 0,
            voiceDurationSeconds: 0,
            correctionsLearned: 0,
            startTime: Date.now(),
          },
          isRecording: false,
          isListening: false,
          isSpeaking: false,
          xpEarned: 0,
        }),

      addMessage: (message) =>
        set((state) => {
          const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          };

          const newMessageCount = (state.sessionStats?.messageCount ?? 0) + 1;
          const xpGain = message.sender === "user" ? XP_PER_MESSAGE : 0;

          return {
            messages: [...state.messages, newMessage],
            sessionStats: state.sessionStats
              ? { ...state.sessionStats, messageCount: newMessageCount }
              : null,
            xpEarned: state.xpEarned + xpGain,
          };
        }),

      setTyping: (isTyping) => set({ isTyping }),

      addCorrection: (messageId, correction) =>
        set((state) => {
          const messages = state.messages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                corrections: [...(msg.corrections ?? []), correction],
              };
            }
            return msg;
          });

          const correctionsLearned =
            (state.sessionStats?.correctionsLearned ?? 0) + 1;

          return {
            messages,
            sessionStats: state.sessionStats
              ? { ...state.sessionStats, correctionsLearned }
              : null,
            xpEarned: state.xpEarned + XP_PER_CORRECTION,
          };
        }),

      setVoiceState: (voiceState) =>
        set((state) => ({
          isRecording: voiceState.isRecording ?? state.isRecording,
          isListening: voiceState.isListening ?? state.isListening,
          isSpeaking: voiceState.isSpeaking ?? state.isSpeaking,
        })),

      addVoiceDuration: (seconds) =>
        set((state) => {
          const newDuration =
            (state.sessionStats?.voiceDurationSeconds ?? 0) + seconds;
          const minutesAdded = Math.floor(seconds / 60);
          const xpGain = minutesAdded * XP_PER_VOICE_MINUTE;

          return {
            sessionStats: state.sessionStats
              ? { ...state.sessionStats, voiceDurationSeconds: newDuration }
              : null,
            xpEarned: state.xpEarned + xpGain,
          };
        }),

      endSession: () =>
        set((state) => ({
          lastSessionMode: state.currentMode,
          lastSessionMessages: state.messages,
          sessionStats: state.sessionStats
            ? { ...state.sessionStats, endTime: Date.now() }
            : null,
          currentMode: null,
          isRecording: false,
          isListening: false,
          isSpeaking: false,
        })),

      resumeSession: () =>
        set((state) => ({
          currentMode: state.lastSessionMode,
          messages: state.lastSessionMessages,
          sessionStats: {
            messageCount: state.lastSessionMessages.length,
            voiceDurationSeconds: 0,
            correctionsLearned: state.lastSessionMessages.reduce(
              (acc, msg) => acc + (msg.corrections?.length ?? 0),
              0
            ),
            startTime: Date.now(),
          },
        })),

      reset: () => set(initialState),
    }),
    {
      name: "@app/ai",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastSessionMode: state.lastSessionMode,
        lastSessionMessages: state.lastSessionMessages.slice(-10), // Keep last 10 messages
      }),
    }
  )
);

