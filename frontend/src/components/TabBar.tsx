import { FileText, Wrench, MessageSquare, Terminal } from 'lucide-react';

type Tab = 'files' | 'skills' | 'request' | 'response';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  counts?: {
    files?: number;
    skills?: number;
  };
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'files', label: 'Files', Icon: FileText },
  { id: 'skills', label: 'Skills', Icon: Wrench },
  { id: 'request', label: 'Request', Icon: MessageSquare },
  { id: 'response', label: 'Response', Icon: Terminal },
];

export function TabBar({ active, onChange, counts }: TabBarProps) {
  return (
    <div
      className="flex items-center gap-1 px-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const count = id === 'files' ? counts?.files : id === 'skills' ? counts?.skills : undefined;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-smooth relative"
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <Icon size={13} />
            {label}
            {count !== undefined && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? 'rgba(124, 92, 255, 0.2)' : 'var(--surface-elevated)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
