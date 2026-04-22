import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Execution, Project, FilterState } from './types';
import { MOCK_EXECUTIONS, MOCK_PROJECTS } from './mockData';

interface AppState {
  // Data
  executions: Execution[];
  projects: Project[];

  // UI State
  selectedExecutionId: string | null;
  selectedProjectId: string;
  activeTab: 'files' | 'skills' | 'request' | 'response';
  filters: FilterState;
  sidebarCollapsed: boolean;

  // Actions
  selectExecution: (id: string) => void;
  selectProject: (id: string) => void;
  setActiveTab: (tab: 'files' | 'skills' | 'request' | 'response') => void;
  setFilters: (filters: Partial<FilterState>) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial data
      executions: MOCK_EXECUTIONS,
      projects: MOCK_PROJECTS,

      // Initial UI state
      selectedExecutionId: MOCK_EXECUTIONS[0]?.id ?? null,
      selectedProjectId: 'oasis',
      activeTab: 'files',
      filters: {
        search: '',
        status: 'all',
        dateFrom: null,
        dateTo: null,
      },
      sidebarCollapsed: false,

      // Actions
      selectExecution: (id) => set({ selectedExecutionId: id, activeTab: 'files' }),
      selectProject: (id) => set({ selectedProjectId: id, selectedExecutionId: null }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'agent-lens-state',
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
        filters: state.filters,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Derived selectors
export const useSelectedExecution = () => {
  const { executions, selectedExecutionId } = useAppStore();
  return executions.find((e) => e.id === selectedExecutionId) ?? null;
};

export const useFilteredExecutions = () => {
  const { executions, filters, selectedProjectId } = useAppStore();
  return executions.filter((e) => {
    // Project filter
    if (e.project !== selectedProjectId) return false;

    // Status filter
    if (filters.status !== 'all' && e.status !== filters.status) return false;

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inPrompt = e.prompt.toLowerCase().includes(q);
      const inAgent = e.agent.toLowerCase().includes(q);
      const inFiles = e.context_files.some((f) => f.path.toLowerCase().includes(q));
      if (!inPrompt && !inAgent && !inFiles) return false;
    }

    return true;
  });
};
