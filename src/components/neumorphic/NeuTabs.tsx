import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface NeuTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'default' | 'pills';
}

export function NeuTabs({
  tabs,
  activeKey,
  onChange,
  className,
  variant = 'default',
}: NeuTabsProps) {
  return (
    <div
      className={cn(
        'p-1.5 rounded-xl',
        'shadow-neu-concave-sm dark:shadow-neu-dark-concave',
        'bg-neu-bg dark:bg-neu-bgDark',
        variant === 'default' && 'flex gap-1',
        variant === 'pills' && 'flex flex-wrap gap-2',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'transition-all duration-200',
              isActive
                ? 'shadow-neu-convex-sm dark:shadow-neu-dark-convex text-neu-accent bg-neu-bg dark:bg-neu-bgDark'
                : 'text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark'
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
