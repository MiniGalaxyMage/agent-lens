import { useState } from 'react';
import { ChevronDown, ChevronRight, List, AlignLeft } from 'lucide-react';
import { ContextFile } from '../types';

interface FileCardProps {
  file: ContextFile;
  defaultOpen?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function buildTreeOutline(content: string): string[] {
  const lines = content.split('\n');
  const headings: string[] = [];
  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) headings.push(`📄 ${h1[1]}`);
    else if (h2) headings.push(`  ▸ ${h2[1]}`);
    else if (h3) headings.push(`    · ${h3[1]}`);
  }
  return headings.length > 0 ? headings : ['(no headings found)'];
}

function getFileIcon(path: string) {
  if (path.endsWith('.md')) return '📄';
  if (path.endsWith('.java')) return '☕';
  if (path.endsWith('.dart')) return '🎯';
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return '📘';
  if (path.endsWith('.json')) return '📋';
  return '📄';
}

function SimpleMarkdown({ content }: { content: string }) {
  // Very basic markdown rendering without external deps
  const lines = content.split('\n');

  return (
    <div className="code-block space-y-0.5">
      {lines.map((line, i) => {
        if (line.match(/^### /)) {
          return (
            <p key={i} className="font-semibold text-sm" style={{ color: '#7C5CFF' }}>
              {line.replace(/^### /, '')}
            </p>
          );
        }
        if (line.match(/^## /)) {
          return (
            <p key={i} className="font-bold text-sm mt-2" style={{ color: '#00D4AA' }}>
              {line.replace(/^## /, '')}
            </p>
          );
        }
        if (line.match(/^# /)) {
          return (
            <p key={i} className="font-bold text-base mt-2" style={{ color: 'var(--text-primary)' }}>
              {line.replace(/^# /, '')}
            </p>
          );
        }
        if (line.match(/^```/)) {
          return (
            <div key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {line}
            </div>
          );
        }
        if (line.match(/^- /)) {
          return (
            <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-secondary)' }}>›</span> {line.slice(2)}
            </p>
          );
        }
        if (line === '') {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function FileCard({ file, defaultOpen = false }: FileCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [viewMode, setViewMode] = useState<'raw' | 'tree'>('raw');

  const treeLines = viewMode === 'tree' ? buildTreeOutline(file.content) : [];

  return (
    <div
      className="rounded-lg overflow-hidden transition-smooth"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer group transition-smooth"
        onClick={() => setIsOpen((v) => !v)}
        style={{ background: isOpen ? 'var(--surface-elevated)' : 'transparent' }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'var(--surface-elevated)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
          )}
          <span className="text-sm">{getFileIcon(file.path)}</span>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {file.path}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {formatBytes(file.size_bytes)}
          </span>
          {isOpen && (
            <div
              className="flex rounded overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="px-2 py-1 text-[10px] flex items-center gap-1 transition-smooth"
                onClick={() => setViewMode('raw')}
                style={{
                  background: viewMode === 'raw' ? 'rgba(124,92,255,0.2)' : 'transparent',
                  color: viewMode === 'raw' ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <AlignLeft size={10} />
                raw
              </button>
              <button
                className="px-2 py-1 text-[10px] flex items-center gap-1 transition-smooth"
                onClick={() => setViewMode('tree')}
                style={{
                  background: viewMode === 'tree' ? 'rgba(124,92,255,0.2)' : 'transparent',
                  color: viewMode === 'tree' ? 'var(--accent)' : 'var(--text-muted)',
                  borderLeft: '1px solid var(--border)',
                }}
              >
                <List size={10} />
                tree
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div
          className="px-3 py-3 overflow-y-auto"
          style={{
            maxHeight: '320px',
            borderTop: '1px solid var(--border)',
            background: '#0C0C10',
          }}
        >
          {viewMode === 'raw' ? (
            <SimpleMarkdown content={file.content} />
          ) : (
            <div className="space-y-1">
              {treeLines.map((line, i) => (
                <p
                  key={i}
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
