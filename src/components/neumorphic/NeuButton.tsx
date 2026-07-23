import React from 'react';
import { cn } from '@/lib/utils';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isPressed?: boolean;
  children: React.ReactNode;
}

export function NeuButton({
  variant = 'default',
  size = 'md',
  isPressed = false,
  children,
  className,
  disabled,
  ...props
}: NeuButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    icon: 'w-10 h-10 p-0',
  };

  const variantClasses = {
    default: cn(
      'bg-neu-bg dark:bg-neu-bgDark text-neu-text dark:text-neu-textDark',
      'shadow-neu-convex-sm dark:shadow-neu-dark-convex',
      'hover:shadow-neu-flat',
      'active:shadow-neu-pressed dark:active:shadow-neu-dark-pressed',
      isPressed && 'shadow-neu-pressed dark:shadow-neu-dark-pressed'
    ),
    primary: cn(
      'bg-gradient-to-br from-neu-accentLight to-neu-accent text-white',
      'shadow-neu-convex-sm',
      'hover:from-neu-accent hover:to-neu-accentDark',
      'active:shadow-neu-pressed',
      isPressed && 'shadow-neu-pressed'
    ),
    secondary: cn(
      'bg-neu-bg dark:bg-neu-bgDark text-neu-accent',
      'shadow-neu-convex-sm dark:shadow-neu-dark-convex',
      'hover:shadow-neu-flat',
      'active:shadow-neu-pressed dark:active:shadow-neu-dark-pressed',
      isPressed && 'shadow-neu-pressed dark:shadow-neu-dark-pressed'
    ),
    danger: cn(
      'bg-neu-bg dark:bg-neu-bgDark text-neu-error',
      'shadow-neu-convex-sm dark:shadow-neu-dark-convex',
      'hover:shadow-neu-flat',
      'active:shadow-neu-pressed dark:active:shadow-neu-dark-pressed',
      isPressed && 'shadow-neu-pressed dark:shadow-neu-dark-pressed'
    ),
    ghost: cn(
      'bg-transparent text-neu-text dark:text-neu-textDark',
      'hover:bg-neu-light/30 dark:hover:bg-white/5',
      'shadow-none'
    ),
  };

  return (
    <button
      className={cn(
        'rounded-xl font-medium transition-all duration-200',
        'flex items-center justify-center gap-2',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
