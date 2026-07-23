import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { useUiStore } from '@/store/useUiStore';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

import Dashboard from '@/pages/Dashboard';
import SillyTavern from '@/pages/SillyTavern';
import AstrBot from '@/pages/AstrBot';
import Models from '@/pages/Models';
import QuickActions from '@/pages/QuickActions';
import Settings from '@/pages/Settings';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '仪表盘', subtitle: '所有服务状态概览' },
  '/sillytavern': { title: 'SillyTavern 管理', subtitle: '角色卡、世界书、插件管理' },
  '/astrbot': { title: 'AstrBot 管理', subtitle: '机器人插件、适配器配置' },
  '/models': { title: '模型管理', subtitle: '本地模型加载与参数配置' },
  '/quick-actions': { title: '快捷操作', subtitle: '一键执行常用操作' },
  '/settings': { title: '系统设置', subtitle: '连接配置与个性化设置' },
};

function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, theme } = useUiStore();
  const location = useLocation();

  const getPageInfo = () => {
    for (const [path, info] of Object.entries(pageTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path) && path !== '/') {
        return info;
      }
    }
    return { title: '', subtitle: '' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className={`min-h-screen bg-neu-bg dark:bg-neu-bgDark ${theme}`}>
      <Sidebar />
      <MobileTabBar />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          'md:pl-64 pb-20 md:pb-0',
          sidebarCollapsed && 'md:pl-20'
        )}
      >
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { theme } = useUiStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      useUiStore.getState().setTheme(savedTheme);
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sillytavern" element={<SillyTavern />} />
          <Route path="/sillytavern/characters" element={<SillyTavern />} />
          <Route path="/sillytavern/worldbooks" element={<SillyTavern />} />
          <Route path="/sillytavern/plugins" element={<SillyTavern />} />
          <Route path="/sillytavern/api-presets" element={<SillyTavern />} />
          <Route path="/astrbot" element={<AstrBot />} />
          <Route path="/astrbot/plugins" element={<AstrBot />} />
          <Route path="/astrbot/adapters" element={<AstrBot />} />
          <Route path="/astrbot/config" element={<AstrBot />} />
          <Route path="/models" element={<Models />} />
          <Route path="/quick-actions" element={<QuickActions />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
