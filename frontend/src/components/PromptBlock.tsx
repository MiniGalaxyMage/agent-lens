import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PromptBlockProps {
  content: string;
  label?: string;
  variant?: 'request' | 'response' | 'error';
  maxHeight?: number;
}

export function PromptBlock({
  content,
  label,
  variant = 'request',
  maxHeight = 280,
}: PromptBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const borderColor = variant === 'error' ? 'rgba(255,95,95,0.3)' : 'var(--border)';
  const accentColor =
    variant === 'error'
      ? '#FF5F5F'
      : variant === 'response'
      ? '#00D4AA'
      : 'var(--accent)';

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: 'var(--surface-elevated)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {label && (
          <span
            className="text-[11px] font-semibold uppercase tracking-wider font-mono"
            style={{ color: accentColor }}
          >
            {label}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 text-[11px] px-2 py-1 rounded transition-smooth"
          style={{
            background: copied ? 'rgba(0,212,170,0.12)' : 'transparent',
            color: copied ? '#00D4AA' : 'var(--text-muted)',
            border: `1px solid ${copied ? 'rgba(0,212,170,0.25)' : 'transparent'}`,
          }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight, background: 'var(--bg)' }}
      >
        <pre
          className="p-3 text-xs leading-relaxed whitespace-pre-wrap break-words code-block"
          style={{ color: 'var(--text-secondary)', margin: 0 }}
        >
          {content}
        </pre>
      </div>
    </div>
  );
}
