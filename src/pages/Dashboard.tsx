import { useEffect } from 'react';
import { RotateCcw, Zap, Settings, ExternalLink } from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { ServiceCard } from '@/components/common/ServiceCard';
import { ResourceChart } from '@/components/common/ResourceChart';
import { useServiceStore } from '@/store/useServiceStore';
import { formatBytes } from '@/utils/formatters';

export default function Dashboard() {
  const {
    services,
    systemResources,
    fetchServices,
    fetchSystemResources,
    restartService,
    startService,
    stopService,
  } = useServiceStore();

  useEffect(() => {
    fetchServices();
    fetchSystemResources();

    const interval = setInterval(() => {
      fetchServices();
      fetchSystemResources();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchServices, fetchSystemResources]);

  const runningCount = services.filter((s) => s.status === 'running').length;
  const totalCpu = services.reduce((acc, s) => acc + s.cpuUsage, 0);
  const totalMemory = services.reduce((acc, s) => acc + s.memoryUsage, 0);

  const quickActions = [
    { label: '重启所有服务', icon: RotateCcw, action: () => services.forEach(s => s.status === 'running' && restartService(s.id)), variant: 'default' as const },
    { label: '快捷操作', icon: Zap, action: () => {}, variant: 'primary' as const },
    { label: '系统设置', icon: Settings, action: () => {}, variant: 'default' as const },
    { label: '外网访问', icon: ExternalLink, action: () => {}, variant: 'default' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NeuCard size="sm">
          <div className="text-center">
            <p className="text-xs text-neu-textLight mb-1">运行中服务</p>
            <p className="text-2xl font-bold text-gradient">
              {runningCount}/{services.length}
            </p>
          </div>
        </NeuCard>
        <NeuCard size="sm">
          <div className="text-center">
            <p className="text-xs text-neu-textLight mb-1">总 CPU 占用</p>
            <p className="text-2xl font-bold text-neu-text dark:text-neu-textDark">
              {totalCpu.toFixed(1)}%
            </p>
          </div>
        </NeuCard>
        <NeuCard size="sm">
          <div className="text-center">
            <p className="text-xs text-neu-textLight mb-1">总内存占用</p>
            <p className="text-2xl font-bold text-neu-text dark:text-neu-textDark">
              {formatBytes(totalMemory * 1024 * 1024)}
            </p>
          </div>
        </NeuCard>
        <NeuCard size="sm">
          <div className="text-center">
            <p className="text-xs text-neu-textLight mb-1">磁盘使用</p>
            <p className="text-2xl font-bold text-neu-text dark:text-neu-textDark">
              {systemResources?.disk || 0}%
            </p>
          </div>
        </NeuCard>
      </div>

      {/* Quick Actions */}
      <NeuCard>
        <h2 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
          快捷操作
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <NeuButton
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="h-16"
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm">{action.label}</span>
            </NeuButton>
          ))}
        </div>
      </NeuCard>

      {/* Services Grid */}
      <div>
        <h2 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
          服务状态
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onRestart={restartService}
              onStart={startService}
              onStop={stopService}
            />
          ))}
        </div>
      </div>

      {/* Resource Charts */}
      {systemResources && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResourceChart
            title="CPU 使用率"
            data={systemResources.cpuHistory}
            value={systemResources.cpu}
            color="#6366f1"
            gradientId="cpuGradient"
          />
          <ResourceChart
            title="内存使用率"
            data={systemResources.memoryHistory}
            value={systemResources.memory}
            color="#10b981"
            gradientId="memGradient"
          />
        </div>
      )}

      {/* System Info */}
      <NeuCard>
        <h2 className="font-semibold text-neu-text dark:text-neu-textDark mb-4">
          系统信息
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-neu-textLight text-xs mb-1">操作系统</p>
            <p className="font-medium text-neu-text dark:text-neu-textDark">Android (Termux)</p>
          </div>
          <div>
            <p className="text-neu-textLight text-xs mb-1">总内存</p>
            <p className="font-medium text-neu-text dark:text-neu-textDark">
              {formatBytes((systemResources?.memoryTotal || 0) * 1024 * 1024)}
            </p>
          </div>
          <div>
            <p className="text-neu-textLight text-xs mb-1">磁盘总容量</p>
            <p className="font-medium text-neu-text dark:text-neu-textDark">
              {systemResources?.diskTotal || '--'}
            </p>
          </div>
          <div>
            <p className="text-neu-textLight text-xs mb-1">已用磁盘</p>
            <p className="font-medium text-neu-text dark:text-neu-textDark">
              {systemResources?.diskUsed || '--'}
            </p>
          </div>
        </div>
      </NeuCard>
    </div>
  );
}
