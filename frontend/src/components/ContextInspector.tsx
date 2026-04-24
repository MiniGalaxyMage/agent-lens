import { useAppStore, useSelectedExecution } from '../store';
import { TabBar } from './TabBar';
import { FileCard } from './FileCard';
import { SkillBadge } from './SkillBadge';
import { ToolsTab } from './ToolsTab';
import { PromptBlock } from './PromptBlock';
import { StatusBadge } from './StatusBadge';
import { Bot, Clock, Hash } from 'lucide-react';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function ContextInspector() {
  const { activeTab, setActiveTab } = useAppStore();
  const execution = useSelectedExecution();

  if (!execution) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center space-y-3">
          <div
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Bot size={22} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Select an execution to inspect
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click any item in the timeline
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg)' }}>
      {/* Execution header */}
      <div
        className="px-5 py-3 flex-shrink-0 flex items-center gap-4 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <Bot size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {execution.agent}
          </span>
        </div>
        <StatusBadge status={execution.status} />
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {formatTimestamp(execution.timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Hash size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {execution.id}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface)' }}>
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          counts={{
            files: execution.context_files.length,
            skills: execution.skills_used.length,
            tools: execution.tools_used.length,
          }}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Context Files
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(124,92,255,0.12)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(124,92,255,0.25)',
                }}
              >
                {execution.context_files.length}
              </span>
            </div>
            {execution.context_files.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No context files recorded
              </p>
            ) : (
              execution.context_files.map((file, i) => (
                <FileCard key={file.path} file={file} defaultOpen={i === 0} />
              ))
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Skills
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(0,212,170,0.12)',
                  color: '#00D4AA',
                  border: '1px solid rgba(0,212,170,0.25)',
                }}
              >
                {execution.skills_used.length} active
              </span>
            </div>
            {execution.skills_used.map((skill) => (
              <SkillBadge
                key={skill}
                name={skill}
                active={execution.skills_used.includes(skill)}
              />
            ))}
          </div>
        )}

        {activeTab === 'tools' && <ToolsTab execution={execution} />}

        {activeTab === 'request' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Prompt
              </span>
            </div>
            <PromptBlock
              content={execution.prompt}
              label="prompt"
              variant="request"
              maxHeight={400}
            />
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Response
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{
                  background:
                    execution.exit_code === 0
                      ? 'rgba(0,212,170,0.12)'
                      : execution.exit_code === -1
                      ? 'rgba(255,176,32,0.12)'
                      : 'rgba(255,95,95,0.12)',
                  color:
                    execution.exit_code === 0
                      ? '#00D4AA'
                      : execution.exit_code === -1
                      ? '#FFB020'
                      : '#FF5F5F',
                  border: `1px solid ${
                    execution.exit_code === 0
                      ? 'rgba(0,212,170,0.25)'
                      : execution.exit_code === -1
                      ? 'rgba(255,176,32,0.25)'
                      : 'rgba(255,95,95,0.25)'
                  }`,
                }}
              >
                exit: {execution.exit_code === -1 ? 'running' : execution.exit_code}
              </span>
            </div>

            {execution.stdout && (
              <PromptBlock
                content={execution.stdout}
                label="stdout"
                variant="response"
                maxHeight={300}
              />
            )}

            {execution.stderr && (
              <PromptBlock
                content={execution.stderr}
                label="stderr"
                variant="error"
                maxHeight={200}
              />
            )}

            {!execution.stdout && !execution.stderr && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No output recorded
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
