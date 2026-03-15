import { create } from 'zustand';
import { Toast } from '@/types';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  bottomNavVisible: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showBottomNav: () => void;
  hideBottomNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  toasts: [],
  bottomNavVisible: true,

  setTheme: (theme) => set({ theme }),

  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(2, 9) }]
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  showBottomNav: () => set({ bottomNavVisible: true }),
  hideBottomNav: () => set({ bottomNavVisible: false }),
}));
