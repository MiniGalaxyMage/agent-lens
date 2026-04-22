import { Code2, BookOpen, Cloud, Wrench, Terminal, Sun } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  active: boolean;
}

const SKILL_ICONS: Record<string, React.ElementType> = {
  'coding-agent': Code2,
  'github': Terminal,
  'gog': Cloud,
  'obsidian': BookOpen,
  'weather': Sun,
  'frontend-design': Wrench,
  'default': Terminal,
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  'coding-agent': 'Delegate coding tasks',
  'github': 'GitHub CLI operations',
  'gog': 'Google Workspace',
  'obsidian': 'Obsidian vault access',
  'weather': 'Weather & forecasts',
  'frontend-design': 'Frontend UI design',
};

export function SkillBadge({ name, active }: SkillBadgeProps) {
  const Icon = SKILL_ICONS[name] ?? SKILL_ICONS['default'];
  const description = SKILL_DESCRIPTIONS[name] ?? 'Skill';

  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-md transition-smooth"
      style={{
        background: active ? 'rgba(0, 212, 170, 0.06)' : 'var(--surface)',
        border: `1px solid ${active ? 'rgba(0, 212, 170, 0.2)' : 'var(--border)'}`,
        opacity: active ? 1 : 0.5,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{
            background: active ? 'rgba(0, 212, 170, 0.12)' : 'var(--surface-elevated)',
          }}
        >
          <Icon size={14} style={{ color: active ? '#00D4AA' : 'var(--text-muted)' }} />
        </div>
        <div>
          <p
            className="text-xs font-medium font-mono"
            style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {name}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {active ? (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(0, 212, 170, 0.12)',
              color: '#00D4AA',
              border: '1px solid rgba(0, 212, 170, 0.25)',
            }}
          >
            active
          </span>
        ) : (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--text-muted)',
            }}
          >
            inactive
          </span>
        )}
      </div>
    </div>
  );
}
