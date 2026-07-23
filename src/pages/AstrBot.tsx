import { useEffect, useState } from 'react';
import {
  Bot,
  Puzzle,
  Plug,
  FileJson,
  Power,
  RefreshCw,
  MessageCircle,
  Send,
} from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuTabs } from '@/components/neumorphic/NeuTabs';
import { NeuSwitch } from '@/components/neumorphic/NeuSwitch';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { api } from '@/utils/api';
import type { Plugin, PlatformAdapter } from '@/types';

export default function AstrBot() {
  const [activeTab, setActiveTab] = useState('plugins');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [adapters, setAdapters] = useState<PlatformAdapter[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pls, adps, cfg] = await Promise.all([
        api.getAstrBotPlugins(),
        api.getAdapters(),
        api.getAstrBotConfig(),
      ]);
      setPlugins(pls);
      setAdapters(adps);
      setConfig(cfg);
    } catch (err) {
      console.error('加载数据失败:', err);
    }
    setLoading(false);
  };

  const togglePlugin = async (id: string) => {
    try {
      await api.toggleAstrBotPlugin(id);
      setPlugins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
      );
    } catch (err) {
      console.error('切换插件状态失败:', err);
    }
  };

  const tabs = [
    { key: 'plugins', label: '插件中心', icon: <Puzzle className="w-4 h-4" /> },
    { key: 'adapters', label: '平台适配器', icon: <Plug className="w-4 h-4" /> },
    { key: 'config', label: '配置编辑', icon: <FileJson className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <NeuCard size="sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neu-text dark:text-neu-textDark">
                AstrBot 管理
              </h2>
              <p className="text-sm text-neu-textLight">管理机器人插件、平台适配器和配置</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NeuButton variant="default">
              <RefreshCw className="w-4 h-4" />
              刷新状态
            </NeuButton>
            <NeuButton variant="primary">
              <Power className="w-4 h-4" />
              重启服务
            </NeuButton>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <NeuTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Plugins Tab */}
      {activeTab === 'plugins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map((plugin) => (
            <NeuCard key={plugin.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center text-cyan-500 shrink-0">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {plugin.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-neu-accent/10 text-neu-accent">
                        {plugin.category}
                      </span>
                    </div>
                    <p className="text-sm text-neu-textLight mt-1">{plugin.description}</p>
                    <p className="text-xs text-neu-textLight mt-2">
                      v{plugin.version} · {plugin.author}
                    </p>
                  </div>
                </div>
                <NeuSwitch
                  checked={plugin.isEnabled}
                  onChange={() => togglePlugin(plugin.id)}
                />
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Adapters Tab */}
      {activeTab === 'adapters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adapters.map((adapter) => (
            <NeuCard key={adapter.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 flex items-center justify-center text-purple-500">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {adapter.name}
                      </h3>
                      <p className="text-xs text-neu-textLight">
                        Bot ID: {adapter.botId}
                      </p>
                    </div>
                  </div>
                  <StatusIndicator status={adapter.status} showLabel />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neu-dark/10 dark:border-white/5">
                  <span className="text-xs text-neu-textLight">
                    最后消息: {adapter.lastMessage}
                  </span>
                  <div className="flex gap-2">
                    {adapter.status === 'disconnected' ? (
                      <NeuButton size="sm" variant="primary">
                        <Plug className="w-4 h-4" />
                        连接
                      </NeuButton>
                    ) : (
                      <NeuButton size="sm" variant="danger">
                        断开
                      </NeuButton>
                    )}
                    <NeuButton size="sm" variant="default">
                      配置
                    </NeuButton>
                  </div>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && config && (
        <NeuCard>
          <div className="space-y-6">
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
              基础配置
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuInput
                label="机器人名称"
                value={config.botName || ''}
                onChange={(e) => setConfig({ ...config, botName: e.target.value })}
              />
              <NeuInput
                label="默认平台"
                value={config.defaultPlatform || ''}
                onChange={(e) => setConfig({ ...config, defaultPlatform: e.target.value })}
              />
              <NeuInput
                label="最大上下文长度"
                type="number"
                value={config.maxContextLength || ''}
                onChange={(e) =>
                  setConfig({ ...config, maxContextLength: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <h4 className="font-medium text-neu-text dark:text-neu-textDark">
                功能开关
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeuSwitch
                  label="启用联网搜索"
                  checked={config.enableWebSearch || false}
                  onChange={(val) => setConfig({ ...config, enableWebSearch: val })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <NeuButton variant="default">重置</NeuButton>
              <NeuButton variant="primary">
                <Send className="w-4 h-4" />
                保存配置
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  );
}
