import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'convex' | 'concave' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function NeuCard({
  variant = 'convex',
  size = 'md',
  children,
  className,
  ...props
}: NeuCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const variantClasses = {
    convex: 'shadow-neu-convex-sm hover:shadow-neu-convex',
    concave: 'shadow-neu-concave',
    flat: 'shadow-neu-flat',
  };

  const darkVariantClasses = {
    convex: 'dark:shadow-neu-dark-convex',
    concave: 'dark:shadow-neu-dark-concave',
    flat: 'dark:shadow-neu-dark-convex',
  };

  return (
    <div
      className={cn(
        'bg-neu-bg dark:bg-neu-bgDark rounded-2xl transition-all duration-300',
        sizeClasses[size],
        variantClasses[variant],
        darkVariantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
