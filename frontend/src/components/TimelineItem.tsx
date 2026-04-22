import { Execution } from '../types';
import { StatusDot } from './StatusBadge';
import { Bot } from 'lucide-react';

interface TimelineItemProps {
  execution: Execution;
  isSelected: boolean;
  onClick: () => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function TimelineItem({ execution, isSelected, onClick }: TimelineItemProps) {
  return (
    <button
      onClick={onClick}
      title={execution.prompt}
      className="w-full text-left px-3 py-2.5 rounded-md transition-smooth group relative"
      style={{
        background: isSelected ? 'rgba(124, 92, 255, 0.12)' : 'transparent',
        borderLeft: isSelected
          ? '2px solid var(--accent)'
          : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--surface-elevated)';
          e.currentTarget.style.borderLeftColor = 'var(--border)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeftColor = 'transparent';
        }
      }}
    >
      {/* Top row: status dot + agent + time */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <StatusDot status={execution.status} />
          <span
            className="text-xs font-semibold"
            style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {execution.agent}
          </span>
          <Bot size={10} style={{ color: 'var(--text-muted)' }} />
        </div>
        <span
          className="text-[10px] font-mono flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatTimestamp(execution.timestamp)}
        </span>
      </div>

      {/* Prompt preview */}
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {truncate(execution.prompt, 70)}
      </p>

      {/* Date tag */}
      <div className="flex items-center justify-between mt-1.5">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {execution.project}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {formatDate(execution.timestamp)}
        </span>
      </div>
    </button>
  );
}
