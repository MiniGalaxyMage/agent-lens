import { Settings, ChevronDown, Eye, Layers } from 'lucide-react';
import { useAppStore } from '../store';
import { useState, useRef, useEffect } from 'react';

export function TopBar() {
  const { projects, selectedProjectId, selectProject } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 py-0 flex-shrink-0"
      style={{
        height: '48px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo + brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(0,212,170,0.2))',
            border: '1px solid rgba(124,92,255,0.3)',
          }}
        >
          <Eye size={14} style={{ color: '#7C5CFF' }} />
        </div>
        <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Agent Lens
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
          style={{
            background: 'rgba(124,92,255,0.12)',
            color: 'var(--accent)',
            border: '1px solid rgba(124,92,255,0.2)',
          }}
        >
          v0.1
        </span>
      </div>

      {/* Center: Project selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-smooth"
          style={{
            background: dropdownOpen ? 'var(--surface-elevated)' : 'transparent',
            border: `1px solid ${dropdownOpen ? 'var(--accent)' : 'var(--border)'}`,
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.borderColor = 'rgba(124,92,255,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.borderColor = 'var(--border)';
            }
          }}
        >
          <Layers size={12} style={{ color: 'var(--accent)' }} />
          <span>{selectedProject?.name ?? 'Select project'}</span>
          <ChevronDown
            size={12}
            style={{
              color: 'var(--text-muted)',
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: '150ms ease-out',
            }}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute top-full mt-1.5 left-0 z-50 rounded-lg overflow-hidden min-w-[160px]"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  selectProject(project.id);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs transition-smooth flex items-center gap-2"
                style={{
                  background:
                    project.id === selectedProjectId ? 'rgba(124,92,255,0.12)' : 'transparent',
                  color:
                    project.id === selectedProjectId ? 'var(--accent)' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (project.id !== selectedProjectId)
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (project.id !== selectedProjectId)
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      project.id === selectedProjectId ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                />
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {project.path}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: settings */}
      <button
        className="p-2 rounded-md transition-smooth"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--surface-elevated)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Settings"
      >
        <Settings size={16} />
      </button>
    </header>
  );
}
