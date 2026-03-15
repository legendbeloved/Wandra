import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  setProfile: (profile) => set({ profile }),

  clearAuth: () => set({ 
    user: null, 
    profile: null, 
    isAuthenticated: false,
    isLoading: false
  }),
}));
