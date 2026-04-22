import { useAppStore, useFilteredExecutions } from '../store';
import { TimelineItem } from './TimelineItem';
import { SearchInput } from './SearchInput';
import { ExecutionStatus } from '../types';
import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS: { label: string; value: ExecutionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'Error', value: 'error' },
  { label: 'Running', value: 'running' },
];

export function Timeline() {
  const { selectedExecutionId, filters, setFilters, selectExecution } = useAppStore();
  const executions = useFilteredExecutions();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: '280px',
        minWidth: '240px',
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Executions
          </span>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="p-1 rounded transition-smooth"
            style={{ color: showFilters ? 'var(--accent)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = showFilters ? 'var(--accent)' : 'var(--text-muted)')
            }
            aria-label="Toggle filters"
          >
            <Filter size={14} />
          </button>
        </div>
        <SearchInput
          value={filters.search}
          onChange={(v) => setFilters({ search: v })}
          placeholder="Search executions…"
        />

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            {/* Status filter */}
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
                Status
              </label>
              <div className="flex gap-1 flex-wrap">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ status: opt.value })}
                    className="px-2 py-0.5 rounded text-[11px] transition-smooth"
                    style={{
                      background:
                        filters.status === opt.value
                          ? 'rgba(124, 92, 255, 0.2)'
                          : 'var(--surface-elevated)',
                      color:
                        filters.status === opt.value
                          ? 'var(--accent)'
                          : 'var(--text-secondary)',
                      border: `1px solid ${filters.status === opt.value ? 'rgba(124,92,255,0.4)' : 'var(--border)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      <div
        className="px-4 py-2 flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {executions.length} execution{executions.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <span className="text-[10px]">newest first</span>
          <ChevronDown size={10} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No executions found
            </span>
            {filters.search && (
              <button
                onClick={() => setFilters({ search: '' })}
                className="text-xs underline"
                style={{ color: 'var(--accent)' }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          executions.map((exec) => (
            <TimelineItem
              key={exec.id}
              execution={exec}
              isSelected={exec.id === selectedExecutionId}
              onClick={() => selectExecution(exec.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
