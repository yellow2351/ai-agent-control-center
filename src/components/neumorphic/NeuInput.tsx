import React from 'react';
import { cn } from '@/lib/utils';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neu-textLight">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-neu-bg dark:bg-neu-bgDark rounded-xl',
              'shadow-neu-concave-sm dark:shadow-neu-dark-concave',
              'px-4 py-3 outline-none transition-all duration-200',
              'text-neu-text dark:text-neu-textDark placeholder-neu-textLight',
              'focus:shadow-neu-concave dark:focus:shadow-neu-dark-concave',
              icon && 'pl-10',
              error && 'ring-2 ring-neu-error/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-neu-error">{error}</p>}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
