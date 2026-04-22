import { ExecutionStatus } from '../types';

interface StatusBadgeProps {
  status: ExecutionStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  if (status === 'success') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${textSize} font-medium`}
        style={{
          background: 'rgba(0, 212, 170, 0.12)',
          color: '#00D4AA',
          border: '1px solid rgba(0, 212, 170, 0.25)',
        }}
      >
        <span className={`${dotSize} rounded-full bg-[#00D4AA]`} />
        success
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${textSize} font-medium`}
        style={{
          background: 'rgba(255, 95, 95, 0.12)',
          color: '#FF5F5F',
          border: '1px solid rgba(255, 95, 95, 0.25)',
        }}
      >
        <span className={`${dotSize} rounded-full bg-[#FF5F5F]`} />
        error
      </span>
    );
  }

  // running
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${textSize} font-medium`}
      style={{
        background: 'rgba(255, 176, 32, 0.12)',
        color: '#FFB020',
        border: '1px solid rgba(255, 176, 32, 0.25)',
      }}
    >
      <span className={`${dotSize} rounded-full bg-[#FFB020] animate-pulse-amber`} />
      running
    </span>
  );
}

export function StatusDot({ status }: { status: ExecutionStatus }) {
  if (status === 'success') {
    return <span className="w-2 h-2 rounded-full bg-[#00D4AA] flex-shrink-0" />;
  }
  if (status === 'error') {
    return <span className="w-2 h-2 rounded-full bg-[#FF5F5F] flex-shrink-0" />;
  }
  return <span className="w-2 h-2 rounded-full bg-[#FFB020] flex-shrink-0 animate-pulse-amber" />;
}
