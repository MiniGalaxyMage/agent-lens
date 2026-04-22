import { invoke } from '@tauri-apps/api/core';
import type { Execution, ExecutionSummary, ContextFile } from './types';

// Re-export types
export type { Execution, ExecutionSummary, ContextFile };

// Check if we're running inside Tauri
export const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window;

// Projects
export async function getProjects(): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>('get_projects');
}

export async function getProjectsDir(): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>('get_projects_dir');
}

// Executions
export async function getExecutions(opts: {
    project?: string;
    status?: string;
    search?: string;
    limit?: number;
} = {}): Promise<ExecutionSummary[]> {
    if (!isTauri()) return [];
    return invoke<ExecutionSummary[]>('get_executions', {
        project: opts.project || null,
        status: opts.status || null,
        search: opts.search || null,
        limit: opts.limit || null,
    });
}

export async function getExecution(id: string): Promise<Execution> {
    if (!isTauri()) throw new Error('Not in Tauri');
    return invoke<Execution>('get_execution', { id });
}

export async function saveExecution(execution: Execution): Promise<void> {
    if (!isTauri()) return;
    return invoke('save_execution', { execution });
}

export async function deleteExecution(id: string): Promise<void> {
    if (!isTauri()) return;
    return invoke('delete_execution', { id });
}

export async function clearAll(): Promise<void> {
    if (!isTauri()) return;
    return invoke('clear_all');
}

// Context files
export async function getContextFiles(executionId: string): Promise<ContextFile[]> {
    if (!isTauri()) return [];
    return invoke<ContextFile[]>('get_context_files', { executionId });
}

// Vault file operations
export async function readVaultFile(path: string): Promise<string> {
    if (!isTauri()) return '';
    return invoke<string>('read_vault_file', { path });
}

export async function listVaultFiles(dir: string, extensions: string[] = ['*']): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>('list_vault_files', { dir, extensions });
}
