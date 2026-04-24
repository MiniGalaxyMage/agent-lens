import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Execution, Project, FilterState, ExecutionSummary } from './types';
import { MOCK_EXECUTIONS, MOCK_PROJECTS } from './mockData';
import * as tauri from './tauri';

type Theme = 'dark' | 'light' | 'system';

interface AppState {
  executions: Execution[];
  projects: Project[];
  selectedExecutionId: string | null;
  selectedProjectId: string;
  activeTab: 'files' | 'skills' | 'tools' | 'request' | 'response';
  filters: FilterState;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  isTauriMode: boolean;
  theme: Theme;
  loadData: () => Promise<void>;
  selectExecution: (id: string) => void;
  selectProject: (id: string) => void;
  setActiveTab: (tab: 'files' | 'skills' | 'tools' | 'request' | 'response') => void;
  setFilters: (filters: Partial<FilterState>) => void;
  toggleSidebar: () => void;
  saveExecution: (exec: Execution) => Promise<void>;
  deleteExecution: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setTheme: (theme: Theme) => void;
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      executions: MOCK_EXECUTIONS,
      projects: MOCK_PROJECTS,
      selectedExecutionId: MOCK_EXECUTIONS[0]?.id ?? null,
      selectedProjectId: 'oasis',
      activeTab: 'files',
      filters: { search: '', status: 'all', dateFrom: null, dateTo: null },
      sidebarCollapsed: false,
      isLoading: false,
      isTauriMode: false,
      theme: 'dark',

      loadData: async () => {
        set({ isLoading: true });
        try {
          const isT = tauri.isTauri();
          set({ isTauriMode: isT });

          if (isT) {
            const execs = await tauri.getExecutions({});
            const projs = await tauri.getProjects();

            const fullExecs: Execution[] = await Promise.all(
              execs.map(async (e: ExecutionSummary) => {
                try {
                  return await tauri.getExecution(e.id);
                } catch {
                  return {
                    ...e,
                    context_files: [],
                    skills_used: [],
                    tools_used: [],
                    stdout: '',
                    stderr: '',
                    exit_code: 0,
                  };
                }
              })
            );

            const projects: Project[] = projs.length > 0
              ? projs.map((p: string) => ({ id: p, name: p.split('/').pop() ?? p }))
              : MOCK_PROJECTS;

            set({
              executions: fullExecs.length > 0 ? fullExecs : MOCK_EXECUTIONS,
              projects,
              selectedExecutionId: fullExecs[0]?.id ?? MOCK_EXECUTIONS[0]?.id ?? null,
            });
          } else {
            set({ executions: MOCK_EXECUTIONS, projects: MOCK_PROJECTS, selectedExecutionId: MOCK_EXECUTIONS[0]?.id ?? null });
          }
        } catch {
          set({ executions: MOCK_EXECUTIONS, projects: MOCK_PROJECTS });
        } finally {
          set({ isLoading: false });
        }
      },

      selectExecution: (id) => set({ selectedExecutionId: id, activeTab: 'files' }),
      selectProject: (id) => set({ selectedProjectId: id, selectedExecutionId: null }),
      setActiveTab: (tab: 'files' | 'skills' | 'tools' | 'request' | 'response') => set({ activeTab: tab }),
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      saveExecution: async (exec: Execution) => {
        try {
          await tauri.saveExecution(exec);
          await get().loadData();
        } catch (err) {
          console.error('save error', err);
        }
      },

      deleteExecution: async (id: string) => {
        try {
          await tauri.deleteExecution(id);
          set((s) => ({ selectedExecutionId: s.selectedExecutionId === id ? null : s.selectedExecutionId }));
          await get().loadData();
        } catch (err) {
          console.error('delete error', err);
        }
      },

      clearAll: async () => {
        try {
          await tauri.clearAll();
          set({ executions: [], selectedExecutionId: null });
        } catch (err) {
          console.error('clear error', err);
        }
      },

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        document.documentElement.setAttribute('data-theme', resolved);
        set({ theme });
      },
    }),
    {
      name: 'agent-lens-state',
      partialize: (s) => ({
        selectedProjectId: s.selectedProjectId,
        filters: s.filters,
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
      }),
    }
  )
);

// Apply theme on load
const stored = localStorage.getItem('agent-lens-state');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed.state?.theme) {
      const resolved = resolveTheme(parsed.state.theme);
      document.documentElement.setAttribute('data-theme', resolved);
    }
  } catch {}
}

export const useSelectedExecution = () => {
  const { executions, selectedExecutionId } = useAppStore();
  return executions.find((e) => e.id === selectedExecutionId) ?? null;
};

export const useFilteredExecutions = () => {
  const { executions, filters, selectedProjectId } = useAppStore();
  return executions.filter((e) => {
    if (e.project !== selectedProjectId) return false;
    if (filters.status !== 'all' && e.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!e.prompt.toLowerCase().includes(q) && !e.agent.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};
