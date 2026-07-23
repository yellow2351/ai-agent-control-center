import React from 'react';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/types';

interface StatusIndicatorProps {
  status: ServiceStatus | 'connected' | 'disconnected';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  running: { color: 'bg-neu-success', label: '运行中', pulse: true },
  stopped: { color: 'bg-neu-textLight', label: '已停止', pulse: false },
  error: { color: 'bg-neu-error', label: '错误', pulse: true },
  loading: { color: 'bg-neu-warning', label: '加载中', pulse: true },
  connected: { color: 'bg-neu-success', label: '已连接', pulse: false },
  disconnected: { color: 'bg-neu-textLight', label: '未连接', pulse: false },
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.stopped;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            sizeClasses[size],
            config.color,
            config.pulse && 'animate-pulse-slow'
          )}
        />
        {config.pulse && (
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-40',
              sizeClasses[size],
              config.color,
              'animate-ping'
            )}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-neu-text dark:text-neu-textDark">
          {config.label}
        </span>
      )}
    </div>
  );
}
