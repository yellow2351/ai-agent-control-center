import { useState, useEffect } from 'react';
import {
  Settings,
  Link,
  Globe,
  Palette,
  Shield,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Server,
  Save,
  RotateCcw,
} from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { NeuSwitch } from '@/components/neumorphic/NeuSwitch';
import { NeuTabs } from '@/components/neumorphic/NeuTabs';
import { useUiStore } from '@/store/useUiStore';
import { getServiceTypeLabel } from '@/utils/formatters';
import { setApiBase, getApiBase, isUsingLocal } from '@/utils/api';
import type { ConnectionConfig } from '@/types';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUiStore();
  const [activeTab, setActiveTab] = useState('connections');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const [backendUrl, setBackendUrl] = useState('');
  const [useLocalMode, setUseLocalMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setUseLocalMode(isUsingLocal());
    setBackendUrl(getApiBase());
  }, []);

  const handleSaveBackend = () => {
    if (useLocalMode) {
      setApiBase('');
      setSaveStatus('已切换到本地模式');
    } else {
      setApiBase(backendUrl);
      setSaveStatus('后端地址已保存');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleResetData = () => {
    if (confirm('确定要重置所有本地数据吗？这将恢复到初始状态。')) {
      localStorage.removeItem('ai-agent-control-center-data');
      localStorage.removeItem('ai-agent-control-center-settings-apiBase');
      window.location.reload();
    }
  };

  const [connections, setConnections] = useState<ConnectionConfig[]>([
    {
      id: 'conn-1',
      name: '本地 SillyTavern',
      type: 'sillytavern',
      host: '127.0.0.1',
      port: 8000,
      isConnected: true,
    },
    {
      id: 'conn-2',
      name: '本地 AstrBot',
      type: 'astrbot',
      host: '127.0.0.1',
      port: 6185,
      isConnected: true,
    },
    {
      id: 'conn-3',
      name: '本地 Kobold AI',
      type: 'kobold',
      host: '127.0.0.1',
      port: 5001,
      isConnected: true,
    },
    {
      id: 'conn-4',
      name: '本地 Ollama',
      type: 'ollama',
      host: '127.0.0.1',
      port: 11434,
      isConnected: false,
    },
  ]);

  const [tunnelProvider, setTunnelProvider] = useState<'none' | 'frp' | 'ngrok' | 'cloudflared'>('none');
  const [tunnelStatus, setTunnelStatus] = useState<'running' | 'stopped'>('stopped');
  const [tunnelUrl, setTunnelUrl] = useState('');

  const tabs = [
    { key: 'backend', label: '后端服务', icon: <Server className="w-4 h-4" /> },
    { key: 'connections', label: '平台连接', icon: <Link className="w-4 h-4" /> },
    { key: 'tunnel', label: '内网穿透', icon: <Globe className="w-4 h-4" /> },
    { key: 'appearance', label: '外观设置', icon: <Palette className="w-4 h-4" /> },
    { key: 'security', label: '安全设置', icon: <Shield className="w-4 h-4" /> },
  ];

  const toggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isConnected: !c.isConnected } : c))
    );
  };

  const deleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStartTunnel = () => {
    setTunnelStatus('running');
    setTunnelUrl('https://random-subdomain.frp.example.com');
  };

  const handleStopTunnel = () => {
    setTunnelStatus('stopped');
    setTunnelUrl('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <NeuCard size="sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-neu-text dark:text-neu-textDark">
              系统设置
            </h2>
            <p className="text-sm text-neu-textLight">
              配置连接、外观和安全选项
            </p>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <NeuTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Backend Tab */}
      {activeTab === 'backend' && (
        <div className="space-y-4">
          <NeuCard>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-neu-text dark:text-neu-textDark mb-2">
                  后端服务模式
                </h3>
                <p className="text-sm text-neu-textLight mb-4">
                  选择本地模式（数据保存在本设备）或连接外部后端服务器
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    onClick={() => setUseLocalMode(true)}
                    className={`p-4 rounded-xl transition-all text-left ${
                      useLocalMode
                        ? 'shadow-neu-concave-sm dark:shadow-neu-dark-concave text-neu-accent'
                        : 'shadow-neu-convex-sm dark:shadow-neu-dark-convex text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark'
                    }`}
                  >
                    <p className="font-medium">本地模式</p>
                    <p className="text-xs mt-1 opacity-70">数据保存在本地</p>
                  </button>
                  <button
                    onClick={() => setUseLocalMode(false)}
                    className={`p-4 rounded-xl transition-all text-left ${
                      !useLocalMode
                        ? 'shadow-neu-concave-sm dark:shadow-neu-dark-concave text-neu-accent'
                        : 'shadow-neu-convex-sm dark:shadow-neu-dark-convex text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark'
                    }`}
                  >
                    <p className="font-medium">外部后端</p>
                    <p className="text-xs mt-1 opacity-70">连接远程服务器</p>
                  </button>
                </div>
              </div>

              {!useLocalMode && (
                <div className="pt-4 border-t border-neu-dark/10 dark:border-white/5">
                  <label className="text-sm font-medium text-neu-text dark:text-neu-textDark block mb-2">
                    后端地址
                  </label>
                  <NeuInput
                    label=""
                    placeholder="http://192.168.1.100:3001"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                  />
                  <p className="text-xs text-neu-textLight mt-2">
                    填写后端服务器地址，例如 http://192.168.1.100:3001
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <NeuButton variant="primary" onClick={handleSaveBackend}>
                  <Save className="w-4 h-4" />
                  保存设置
                </NeuButton>
                {saveStatus && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          </NeuCard>

          <NeuCard>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-neu-text dark:text-neu-textDark mb-2">
                  数据管理
                </h3>
                <p className="text-sm text-neu-textLight">
                  本地模式下，所有数据保存在设备本地存储中
                </p>
              </div>
              <div className="flex gap-3">
                <NeuButton variant="danger" onClick={handleResetData}>
                  <RotateCcw className="w-4 h-4" />
                  重置本地数据
                </NeuButton>
              </div>
            </div>
          </NeuCard>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
              平台连接
            </h3>
            <NeuButton variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              添加连接
            </NeuButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => (
              <NeuCard key={conn.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {conn.name}
                      </h4>
                      <p className="text-xs text-neu-textLight">
                        {getServiceTypeLabel(conn.type)}
                      </p>
                    </div>
                    <NeuSwitch checked={conn.isConnected} onChange={() => toggleConnection(conn.id)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-neu-textLight mb-0.5">主机地址</p>
                      <p className="font-medium text-neu-text dark:text-neu-textDark">
                        {conn.host}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neu-textLight mb-0.5">端口</p>
                      <p className="font-medium text-neu-text dark:text-neu-textDark">
                        {conn.port}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-neu-dark/10 dark:border-white/5">
                    <NeuButton size="sm" variant="default">
                      编辑
                    </NeuButton>
                    <NeuButton
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteConnection(conn.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </NeuButton>
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>
      )}

      {/* Tunnel Tab */}
      {activeTab === 'tunnel' && (
        <NeuCard>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-neu-text dark:text-neu-textDark block mb-2">
                内网穿透服务
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['none', 'frp', 'ngrok', 'cloudflared'] as const).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setTunnelProvider(provider)}
                    className={`p-4 rounded-xl transition-all ${
                      tunnelProvider === provider
                        ? 'shadow-neu-concave-sm dark:shadow-neu-dark-concave text-neu-accent'
                        : 'shadow-neu-convex-sm dark:shadow-neu-dark-convex text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark'
                    }`}
                  >
                    <p className="font-medium capitalize">{provider === 'none' ? '未使用' : provider}</p>
                  </button>
                ))}
              </div>
            </div>

            {tunnelProvider !== 'none' && (
              <>
                <div className="space-y-4 pt-4 border-t border-neu-dark/10 dark:border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NeuInput label="服务器地址" placeholder="frp.example.com" />
                    <NeuInput label="端口" type="number" placeholder="7000" />
                    <NeuInput label="Token / 密钥" type="password" placeholder="输入认证密钥" />
                    <NeuInput label="子域名" placeholder="my-bot" />
                  </div>

                  {tunnelStatus === 'running' && tunnelUrl && (
                    <div className="p-4 rounded-xl shadow-neu-concave-sm dark:shadow-neu-dark-concave">
                      <p className="text-xs text-neu-textLight mb-1">访问地址</p>
                      <p className="font-mono text-neu-accent break-all">{tunnelUrl}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    {tunnelStatus === 'running' ? (
                      <NeuButton variant="danger" onClick={handleStopTunnel}>
                        <PowerOff className="w-4 h-4" />
                        停止穿透
                      </NeuButton>
                    ) : (
                      <NeuButton variant="primary" onClick={handleStartTunnel}>
                        <Power className="w-4 h-4" />
                        启动穿透
                      </NeuButton>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </NeuCard>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <NeuCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-neu-text dark:text-neu-textDark">
                  深色模式
                </h4>
                <p className="text-sm text-neu-textLight">切换浅色/深色主题</p>
              </div>
              <NeuSwitch checked={theme === 'dark'} onChange={toggleTheme} />
            </div>

            <div className="pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-neu-text dark:text-neu-textDark">
                    自动刷新
                  </h4>
                  <p className="text-sm text-neu-textLight">自动刷新服务状态</p>
                </div>
                <NeuSwitch checked={autoRefresh} onChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="max-w-xs">
                  <NeuInput
                    label="刷新间隔（秒）"
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <h4 className="font-semibold text-neu-text dark:text-neu-textDark mb-3">
                语言
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md">
                {['简体中文', '繁體中文', 'English', '日本語'].map((lang, idx) => (
                  <button
                    key={lang}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      idx === 0
                        ? 'shadow-neu-concave-sm dark:shadow-neu-dark-concave text-neu-accent'
                        : 'shadow-neu-convex-sm dark:shadow-neu-dark-convex text-neu-textLight hover:text-neu-text dark:hover:text-neu-textDark'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </NeuCard>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <NeuCard>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
                访问密码
              </h4>
              <div className="space-y-4 max-w-md">
                <NeuInput label="当前密码" type="password" placeholder="输入当前密码" />
                <NeuInput label="新密码" type="password" placeholder="输入新密码" />
                <NeuInput label="确认新密码" type="password" placeholder="再次输入新密码" />
                <NeuButton variant="primary">修改密码</NeuButton>
              </div>
            </div>

            <div className="pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neu-text dark:text-neu-textDark">
                    局域网访问
                  </h4>
                  <p className="text-sm text-neu-textLight">允许局域网内设备访问</p>
                </div>
                <NeuSwitch checked={true} onChange={() => {}} />
              </div>
            </div>

            <div className="pt-4 border-t border-neu-dark/10 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neu-text dark:text-neu-textDark">
                    会话超时
                  </h4>
                  <p className="text-sm text-neu-textLight">无操作自动登出时间</p>
                </div>
                <select className="px-4 py-2 rounded-xl bg-neu-bg shadow-neu-concave-sm dark:bg-neu-bgDark dark:shadow-neu-dark-concave text-sm text-neu-text dark:text-neu-textDark outline-none">
                  <option>30 分钟</option>
                  <option>1 小时</option>
                  <option>2 小时</option>
                  <option>永不</option>
                </select>
              </div>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  );
}
