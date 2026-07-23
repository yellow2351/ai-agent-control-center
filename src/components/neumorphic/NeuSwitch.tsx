import React from 'react';
import { cn } from '@/lib/utils';

interface NeuSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function NeuSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: NeuSwitchProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-14 h-7 rounded-full transition-all duration-300',
          'shadow-neu-concave-sm dark:shadow-neu-dark-concave',
          'bg-neu-bg dark:bg-neu-bgDark',
          checked && 'bg-gradient-to-r from-neu-accentLight to-neu-accent'
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-5 h-5 rounded-full transition-all duration-300',
            'shadow-neu-convex-sm dark:shadow-neu-dark-convex',
            'bg-neu-bg dark:bg-neu-bgDark',
            checked ? 'left-8' : 'left-1'
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-neu-text dark:text-neu-textDark">
          {label}
        </span>
      )}
    </label>
  );
}
