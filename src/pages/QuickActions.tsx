import { useState } from 'react';
import {
  Zap,
  RotateCcw,
  Play,
  Square,
  Send,
  RefreshCw,
  Terminal,
  FileText,
} from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuTabs } from '@/components/neumorphic/NeuTabs';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { useServiceStore } from '@/store/useServiceStore';
import { getServiceTypeLabel } from '@/utils/formatters';

export default function QuickActions() {
  const { services, restartService, startService, stopService, logs, fetchLogs } =
    useServiceStore();
  const [activeTab, setActiveTab] = useState('actions');
  const [selectedService, setSelectedService] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState('');

  const runningServices = services.filter((s) => s.status === 'running');

  const handleViewLogs = async (serviceId: string) => {
    setSelectedService(serviceId);
    await fetchLogs(serviceId);
    setActiveTab('logs');
  };

  const tabs = [
    { key: 'actions', label: '快捷操作', icon: <Zap className="w-4 h-4" /> },
    { key: 'logs', label: '服务日志', icon: <Terminal className="w-4 h-4" /> },
    { key: 'test', label: '快速测试', icon: <Send className="w-4 h-4" /> },
  ];

  const quickActions = [
    {
      label: '重启所有服务',
      icon: RotateCcw,
      variant: 'primary' as const,
      action: () => runningServices.forEach((s) => restartService(s.id)),
    },
    {
      label: '启动全部',
      icon: Play,
      variant: 'default' as const,
      action: () => services.forEach((s) => s.status === 'stopped' && startService(s.id)),
    },
    {
      label: '停止全部',
      icon: Square,
      variant: 'danger' as const,
      action: () => runningServices.forEach((s) => stopService(s.id)),
    },
    {
      label: '刷新状态',
      icon: RefreshCw,
      variant: 'default' as const,
      action: () => useServiceStore.getState().fetchServices(),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <NeuCard size="sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-neu-text dark:text-neu-textDark">
              快捷操作
            </h2>
            <p className="text-sm text-neu-textLight">
              快速执行常用操作，提升管理效率
            </p>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <NeuTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Quick Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Global Actions */}
          <NeuCard>
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
              全局操作
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, idx) => (
                <NeuButton
                  key={idx}
                  variant={action.variant}
                  onClick={action.action}
                  className="h-20 flex-col"
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm">{action.label}</span>
                </NeuButton>
              ))}
            </div>
          </NeuCard>

          {/* Per Service Actions */}
          <NeuCard>
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
              单服务操作
            </h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neu-bg shadow-neu-concave-sm dark:bg-neu-bgDark dark:shadow-neu-dark-concave"
                >
                  <div>
                    <p className="font-medium text-neu-text dark:text-neu-textDark">
                      {service.name}
                    </p>
                    <p className="text-xs text-neu-textLight">
                      {getServiceTypeLabel(service.type)} · 端口 {service.port}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <NeuButton
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewLogs(service.id)}
                      title="查看日志"
                    >
                      <FileText className="w-4 h-4" />
                    </NeuButton>
                    {service.status === 'running' ? (
                      <>
                        <NeuButton
                          size="icon"
                          variant="ghost"
                          onClick={() => restartService(service.id)}
                          title="重启"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </NeuButton>
                        <NeuButton
                          size="icon"
                          variant="ghost"
                          onClick={() => stopService(service.id)}
                          title="停止"
                        >
                          <Square className="w-4 h-4" />
                        </NeuButton>
                      </>
                    ) : (
                      <NeuButton
                        size="icon"
                        variant="ghost"
                        onClick={() => startService(service.id)}
                        title="启动"
                      >
                        <Play className="w-4 h-4" />
                      </NeuButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <NeuCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                服务日志
              </h3>
              <select
                value={selectedService}
                onChange={(e) => e.target.value && handleViewLogs(e.target.value)}
                className="px-3 py-2 rounded-xl bg-neu-bg shadow-neu-concave-sm dark:bg-neu-bgDark dark:shadow-neu-dark-concave text-sm text-neu-text dark:text-neu-textDark outline-none"
              >
                <option value="">选择服务</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-80 overflow-y-auto rounded-xl shadow-neu-concave-sm dark:shadow-neu-dark-concave p-4 bg-neu-bg dark:bg-neu-bgDark font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="mb-1 flex gap-2">
                    <span className="text-neu-textLight">
                      {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                    </span>
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-neu-error'
                          : log.level === 'warn'
                          ? 'text-neu-warning'
                          : 'text-neu-success'
                      }
                    >
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-neu-text dark:text-neu-textDark">
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neu-textLight">请选择一个服务查看日志</p>
              )}
            </div>
          </div>
        </NeuCard>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <NeuCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
              快速发送测试消息
            </h3>

            <div className="space-y-3">
              <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                目标服务
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-neu-bg shadow-neu-concave-sm dark:bg-neu-bgDark dark:shadow-neu-dark-concave text-neu-text dark:text-neu-textDark outline-none"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">选择服务</option>
                {runningServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                测试消息
              </label>
              <div className="flex gap-2">
                <NeuInput
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="输入测试消息..."
                  className="flex-1"
                />
                <NeuButton variant="primary" onClick={() => setTestResult('测试消息已发送！模型回复：这是一条测试回复。')}>
                  <Send className="w-4 h-4" />
                  发送
                </NeuButton>
              </div>
            </div>

            {testResult && (
              <div className="p-4 rounded-xl shadow-neu-concave-sm dark:shadow-neu-dark-concave bg-neu-bg dark:bg-neu-bgDark">
                <p className="text-sm text-neu-textLight mb-2">回复结果：</p>
                <p className="text-neu-text dark:text-neu-textDark">{testResult}</p>
              </div>
            )}
          </div>
        </NeuCard>
      )}
    </div>
  );
}
