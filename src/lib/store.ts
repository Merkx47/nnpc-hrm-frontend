import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role, Notification } from '@/types';

interface AppState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Global scope filters (Region → Branch → Station cascade)
  selectedRegionId: string;
  selectedBranchId: string;
  selectedStationId: string;
  setSelectedRegionId: (id: string) => void;
  setSelectedBranchId: (id: string) => void;
  setSelectedStationId: (id: string) => void;
  clearFilters: () => void;

  // Language
  language: string;
  setLanguage: (code: string) => void;

  // Currency rates (admin-configurable, NGN base)
  currencyRates: Record<string, number>;
  setCurrencyRates: (rates: Record<string, number>) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Theme
      isDark: false,
      toggleTheme: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Sidebar
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Global scope filters (cascade: region → branch → station)
      selectedRegionId: '',
      selectedBranchId: '',
      selectedStationId: '',
      setSelectedRegionId: (id) => set({ selectedRegionId: id, selectedBranchId: '', selectedStationId: '' }),
      setSelectedBranchId: (id) => set({ selectedBranchId: id, selectedStationId: '' }),
      setSelectedStationId: (id) => set({ selectedStationId: id }),
      clearFilters: () => set({ selectedRegionId: '', selectedBranchId: '', selectedStationId: '' }),

      // Language
      language: 'en',
      setLanguage: (code) => set({ language: code }),

      // Currency rates (NGN per 1 unit of foreign currency)
      currencyRates: { USD: 1550, GBP: 1950, EUR: 1700, CNY: 215 },
      setCurrencyRates: (rates) => set({ currencyRates: rates }),

      // Notifications
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'nnpc-hrm-session',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isDark: state.isDark,
        language: state.language,
        currencyRates: state.currencyRates,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Apply dark mode class on initial rehydrate from localStorage
if (typeof window !== 'undefined') {
  const persisted = localStorage.getItem('nnpc-hrm-session');
  if (persisted) {
    try {
      const parsed = JSON.parse(persisted);
      if (parsed?.state?.isDark) {
        document.documentElement.classList.add('dark');
      }
    } catch { /* ignore */ }
  }
}
