import { create } from 'zustand';

interface UIStoreState {
  sidebarOpen: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  modals: {
    transaction: boolean;
    import: boolean;
  };
  isLoading: boolean;
}

interface UIStoreActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  showSnackbar: (message: string, severity?: UIStoreState['snackbar']['severity']) => void;
  hideSnackbar: () => void;
  setLoading: (loading: boolean) => void;
  openTransactionModal: () => void;
  closeTransactionModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
}

type UIStore = UIStoreState & UIStoreActions;

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  modals: {
    transaction: false,
    import: false,
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  isLoading: false,

  openTransactionModal: () => set((state) => ({ modals: { ...state.modals, transaction: true } })),
  closeTransactionModal: () => set((state) => ({ modals: { ...state.modals, transaction: false } })),
  openImportModal: () => set((state) => ({ modals: { ...state.modals, import: true } })),
  closeImportModal: () => set((state) => ({ modals: { ...state.modals, import: false } })),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  showSnackbar: (message, severity = 'info') =>
    set({ snackbar: { open: true, message, severity } }),

  hideSnackbar: () =>
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
