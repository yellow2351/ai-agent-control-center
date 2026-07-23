import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  Bot,
  Cpu,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/useUiStore';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/sillytavern', label: 'SillyTavern', icon: MessageCircle },
  { path: '/astrbot', label: 'AstrBot', icon: Bot },
  { path: '/models', label: '模型管理', icon: Cpu },
  { path: '/quick-actions', label: '快捷操作', icon: Zap },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'bg-neu-bg dark:bg-neu-bgDark',
        'transition-all duration-300 ease-out',
        'hidden md:flex flex-col',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neu-dark/20 dark:border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neu-accentLight to-neu-accent flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-neu-text dark:text-neu-textDark text-sm">
                AI Agent
              </span>
              <span className="text-xs text-neu-textLight">中控台</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'transition-all duration-200 group',
                active
                  ? 'shadow-neu-concave-sm dark:shadow-neu-dark-concave text-neu-accent'
                  : 'text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark',
                sidebarCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', active && 'text-neu-accent')} />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-neu-dark/20 dark:border-white/5">
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark',
            'transition-all duration-200',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium text-sm">收起</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
