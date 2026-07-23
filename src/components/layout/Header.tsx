import React from 'react';
import { Sun, Moon, RefreshCw, Bell } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { NeuButton } from '@/components/neumorphic/NeuButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useUiStore();

  return (
    <header className="sticky top-0 z-30 bg-neu-bg/80 dark:bg-neu-bgDark/80 backdrop-blur-md">
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-neu-text dark:text-neu-textDark">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-neu-textLight">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <NeuButton size="icon" variant="ghost">
            <RefreshCw className="w-4 h-4" />
          </NeuButton>
          <NeuButton size="icon" variant="ghost">
            <Bell className="w-4 h-4" />
          </NeuButton>
          <NeuButton size="icon" variant="ghost" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </NeuButton>
        </div>
      </div>
    </header>
  );
}
