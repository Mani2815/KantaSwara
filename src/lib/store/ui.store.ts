import { create } from 'zustand';

interface UIState {
  /* Sidebar */
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /* Command Palette */
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  /* Notifications */
  notificationCount: number;
  setNotificationCount: (count: number) => void;

  /* Active tenant (for super-admin) */
  activeTenantId: string | null;
  setActiveTenantId: (id: string | null) => void;

  /* System health */
  systemHealth: 'healthy' | 'degraded' | 'down';
  apiLatency: number;
  activeAgentsCount: number;
  activeCallsCount: number;
  setSystemHealth: (health: 'healthy' | 'degraded' | 'down') => void;
  setApiLatency: (latency: number) => void;
  setActiveAgentsCount: (count: number) => void;
  setActiveCallsCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  /* Sidebar */
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  /* Command Palette */
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  /* Notifications */
  notificationCount: 0,
  setNotificationCount: (count) => set({ notificationCount: count }),

  /* Active tenant */
  activeTenantId: null,
  setActiveTenantId: (id) => set({ activeTenantId: id }),

  /* System health */
  systemHealth: 'healthy',
  apiLatency: 0,
  activeAgentsCount: 0,
  activeCallsCount: 0,
  setSystemHealth: (health) => set({ systemHealth: health }),
  setApiLatency: (latency) => set({ apiLatency: latency }),
  setActiveAgentsCount: (count) => set({ activeAgentsCount: count }),
  setActiveCallsCount: (count) => set({ activeCallsCount: count }),
}));
