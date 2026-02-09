import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SessionType = "1:1" | "group" | "workshop";
export type SessionStatus = "upcoming" | "completed" | "cancelled";

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
}

export interface Session {
  id: string;
  tutor: Tutor;
  date: string; // ISO string
  durationMinutes: number;
  type: SessionType;
  status: SessionStatus;
  meetingUrl?: string;
  notes?: string;
  rating?: number;
}

export interface AvailabilitySlot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAvailable: boolean;
}

interface ScheduleState {
  sessions: Session[];
  availabilitySlots: AvailabilitySlot[];
  selectedDate: string | null;
  selectedSlot: AvailabilitySlot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  cancelSession: (id: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedSlot: (slot: AvailabilitySlot | null) => void;
  bookSlot: (slot: AvailabilitySlot, tutor: Tutor) => Promise<void>;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      sessions: [],
      availabilitySlots: [],
      selectedDate: null,
      selectedSlot: null,
      isLoading: false,
      error: null,

      setSessions: (sessions) => set({ sessions }),
      
      addSession: (session) => set((state) => ({ 
        sessions: [...state.sessions, session].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ) 
      })),

      cancelSession: (id) => set((state) => ({
        sessions: state.sessions.map((s) => 
          s.id === id ? { ...s, status: "cancelled" } : s
        )
      })),

      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),

      bookSlot: async (slot, tutor) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          const newSession: Session = {
            id: `session_${Date.now()}`,
            tutor,
            date: slot.startTime,
            durationMinutes: 30,
            type: "1:1",
            status: "upcoming",
            meetingUrl: "https://livekit.io/prototype",
          };

          get().addSession(newSession);
          set({ selectedSlot: null, selectedDate: null });
        } catch (e) {
          set({ error: "Failed to book session. Please try again." });
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => set({
        sessions: [],
        availabilitySlots: [],
        selectedDate: null,
        selectedSlot: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: "@app/schedule",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        sessions: state.sessions 
      }),
    }
  )
);

