import React from 'react';
import { cn } from '@/lib/utils';

interface NeuProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NeuProgress({
  value,
  max = 100,
  showLabel = false,
  label,
  color = 'accent',
  size = 'md',
  className,
}: NeuProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    default: 'bg-neu-textLight',
    success: 'bg-neu-success',
    warning: 'bg-neu-warning',
    error: 'bg-neu-error',
    info: 'bg-neu-info',
    accent: 'bg-gradient-to-r from-neu-accentLight to-neu-accent',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-neu-textLight dark:text-neu-textLight">
          <span>{label}</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'shadow-neu-concave-sm dark:shadow-neu-dark-concave',
          'bg-neu-bg dark:bg-neu-bgDark',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
