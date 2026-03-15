import { create } from 'zustand';

export interface Journey {
  id: string;
  user_id: string;
  destination_name: string;
  status: 'active' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
  journal_text?: string;
  mood_tag?: string;
  distance_km?: number;
  moments: Moment[];
}

export interface Moment {
  id: string;
  journey_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  place_name: string;
  weather: string;
  weather_icon: string;
  temperature?: number;
  note?: string;
  photo_url?: string;
  is_key_moment: boolean;
}

interface WandraState {
  // Auth
  session: any | null;
  profile: any | null;
  setSession: (session: any | null) => void;
  setProfile: (profile: any | null) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Journeys
  journeys: Journey[];
  activeJourney: Journey | null;
  selectedJourney: Journey | null;
  setJourneys: (journeys: Journey[]) => void;
  setActiveJourney: (journey: Journey | null) => void;
  setSelectedJourney: (journey: Journey | null) => void;
  addJourney: (journey: Journey) => void;
  removeJourney: (id: string) => void;

  // UI
  isSyncing: boolean;
  showAuth: boolean;
  setIsSyncing: (syncing: boolean) => void;
  setShowAuth: (show: boolean) => void;
}

export const useWandraStore = create<WandraState>((set) => ({
  // Auth
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  // Navigation
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),

  // Journeys
  journeys: [],
  activeJourney: null,
  selectedJourney: null,
  setJourneys: (journeys) => set({ journeys }),
  setActiveJourney: (activeJourney) => set({ activeJourney }),
  setSelectedJourney: (selectedJourney) => set({ selectedJourney }),
  addJourney: (journey) => set((state) => ({ journeys: [journey, ...state.journeys] })),
  removeJourney: (id) => set((state) => ({ journeys: state.journeys.filter((j) => j.id !== id) })),

  // UI
  isSyncing: false,
  showAuth: false,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setShowAuth: (showAuth) => set({ showAuth }),
}));
