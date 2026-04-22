import './index.css';
import { TopBar } from './components/TopBar';
import { Timeline } from './components/Timeline';
import { ContextInspector } from './components/ContextInspector';
import { useAppStore } from './store';

function App() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}
    >
      {/* Top bar */}
      <TopBar />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Timeline sidebar */}
        {!sidebarCollapsed && <Timeline />}

        {/* Toggle sidebar button */}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Show timeline' : 'Hide timeline'}
          className="flex-shrink-0 flex items-center justify-center transition-smooth"
          style={{
            width: '16px',
            background: 'transparent',
            borderRight: '1px solid var(--border)',
            borderLeft: sidebarCollapsed ? 'none' : '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-elevated)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="6" height="20" viewBox="0 0 6 20" fill="none">
            <circle cx="3" cy="5" r="1.5" fill="currentColor" />
            <circle cx="3" cy="10" r="1.5" fill="currentColor" />
            <circle cx="3" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {/* Context inspector (main panel) */}
        <ContextInspector />
      </div>
    </div>
  );
}

export default App;
