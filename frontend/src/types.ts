export type ExecutionStatus = 'success' | 'error' | 'running';

export interface ContextFile {
  execution_id?: string;
  path: string;
  content: string;
  size_bytes: number;
}

export interface Execution {
  id: string;
  project: string;
  agent: string;
  timestamp: string;
  status: ExecutionStatus;
  prompt: string;
  context_files: ContextFile[];
  skills_used: string[];
  tools_used: string[];
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface ExecutionSummary {
  id: string;
  project: string;
  agent: string;
  timestamp: string;
  status: ExecutionStatus;
  prompt: string;
}

export interface Project {
  id: string;
  name: string;
  path?: string;
}

export interface FilterState {
  search: string;
  status: ExecutionStatus | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}
