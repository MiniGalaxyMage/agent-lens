import { Execution } from '../types';
import { Settings } from 'lucide-react';

interface ToolsTabProps {
  execution: Execution;
}

const TOOL_COLORS: Record<string, string> = {
  git: '#F05032',
  npm: '#CB3837',
  yarn: '#2C8EBB',
  docker: '#2496ED',
  cargo: '#000',
  rustc: '#000',
  go: '#00ADD8',
  python: '#3776AB',
  node: '#339933',
  tsc: '#3178C6',
  cat: '#6B7280',
  grep: '#CC342D',
  sed: '#6B7280',
  curl: '#073551',
  vim: '#059142',
  nano: '#4E9A06',
  emacs: '#7F5F3F',
  ssh: '#6B7280',
  brew: '#F5F5F5',
};

function ToolBadge({ tool }: { tool: string }) {
  const color = TOOL_COLORS[tool.toLowerCase()] || 'var(--accent)';
  const isDark = ['cargo', 'rustc', 'go', 'python', 'brew'].includes(tool.toLowerCase());

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: isDark ? color : color,
      }}
    >
      <Settings size={11} style={{ color }} />
      {tool}
    </div>
  );
}

export function ToolsTab({ execution }: ToolsTabProps) {
  const tools = execution.tools_used || [];

  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-elevated)' }}
        >
          <Settings size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          No tools detected in this execution
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs">
          Tools are automatically inferred from stdout/stderr
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Detected Tools
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--accent-subtle)',
            color: 'var(--accent)',
          }}
        >
          {tools.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <ToolBadge key={tool} tool={tool} />
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tool detection is based on pattern matching against common CLI tools
          (git, npm, docker, editors, compilers, etc.) in stdout and stderr output.
        </p>
      </div>
    </div>
  );
}
