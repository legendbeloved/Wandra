import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Moment } from '@/types';

interface JourneyState {
  activeJourneyId: string | null;
  destination: { name: string; lat: number; lng: number } | null;
  status: 'idle' | 'active' | 'processing' | 'complete';
  moments: Moment[];
  startedAt: string | null;
  isTracking: boolean;
  lastMomentAt: string | null;

  startJourney: (destination: { name: string; lat: number; lng: number }, journeyId: string) => void;
  addMoment: (moment: Moment) => void;
  setProcessing: () => void;
  setComplete: () => void;
  resetJourney: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      activeJourneyId: null,
      destination: null,
      status: 'idle',
      moments: [],
      startedAt: null,
      isTracking: false,
      lastMomentAt: null,

      startJourney: (destination, journeyId) => set({
        activeJourneyId: journeyId,
        destination,
        status: 'active',
        moments: [],
        startedAt: new Date().toISOString(),
        isTracking: true,
        lastMomentAt: new Date().toISOString()
      }),

      addMoment: (moment) => set((state) => ({
        moments: [...state.moments, moment],
        lastMomentAt: moment.captured_at
      })),

      setProcessing: () => set({ status: 'processing', isTracking: false }),

      setComplete: () => set({ status: 'complete' }),

      resetJourney: () => set({
        activeJourneyId: null,
        destination: null,
        status: 'idle',
        moments: [],
        startedAt: null,
        isTracking: false,
        lastMomentAt: null
      }),
    }),
    {
      name: 'wandra-journey',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
