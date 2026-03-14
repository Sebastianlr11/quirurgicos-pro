import { create } from 'zustand';

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: false,

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem('darkMode', String(next));
      return { darkMode: next };
    }),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
