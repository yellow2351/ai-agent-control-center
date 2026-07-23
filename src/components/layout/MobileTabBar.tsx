import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, Bot, Cpu, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/sillytavern', label: 'ST', icon: MessageCircle },
  { path: '/astrbot', label: 'AB', icon: Bot },
  { path: '/models', label: '模型', icon: Cpu },
  { path: '/quick-actions', label: '快捷', icon: Zap },
  { path: '/settings', label: '设置', icon: Settings },
];

export function MobileTabBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-2 mb-2 rounded-2xl bg-neu-bg dark:bg-neu-bgDark shadow-neu-convex-lg dark:shadow-neu-dark-convex">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200',
                  active
                    ? 'text-neu-accent'
                    : 'text-neu-textLight'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                    active && 'shadow-neu-concave-sm dark:shadow-neu-dark-concave'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
