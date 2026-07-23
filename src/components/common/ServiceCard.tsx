import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, RotateCcw, MessageCircle, Bot, Cpu, Database } from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuProgress } from '@/components/neumorphic/NeuProgress';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import type { Service } from '@/types';
import { formatUptime, getServiceTypeLabel } from '@/utils/formatters';

interface ServiceCardProps {
  service: Service;
  onRestart?: (id: string) => void;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
}

const serviceIcons: Record<string, React.ReactNode> = {
  sillytavern: <MessageCircle className="w-6 h-6" />,
  astrbot: <Bot className="w-6 h-6" />,
  kobold: <Cpu className="w-6 h-6" />,
  ollama: <Database className="w-6 h-6" />,
  lmstudio: <Cpu className="w-6 h-6" />,
};

const servicePagePaths: Record<string, string> = {
  sillytavern: '/sillytavern',
  astrbot: '/astrbot',
  kobold: '/models',
  ollama: '/models',
  lmstudio: '/models',
};

export function ServiceCard({ service, onRestart, onStart, onStop }: ServiceCardProps) {
  const navigate = useNavigate();
  const icon = serviceIcons[service.type] || <Cpu className="w-6 h-6" />;
  const pagePath = servicePagePaths[service.type];

  const handleClick = () => {
    if (pagePath) {
      navigate(pagePath);
    }
  };

  return (
    <NeuCard className="cursor-pointer hover:-translate-y-1 group" onClick={handleClick}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neu-accentLight/20 to-neu-accent/20 flex items-center justify-center text-neu-accent group-hover:from-neu-accentLight/30 group-hover:to-neu-accent/30 transition-all">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                {service.name}
              </h3>
              <p className="text-xs text-neu-textLight">v{service.version}</p>
            </div>
          </div>
          <StatusIndicator status={service.status} showLabel size="sm" />
        </div>

        {/* Description */}
        <p className="text-sm text-neu-textLight line-clamp-1">{service.description}</p>

        {/* Stats */}
        {service.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neu-textLight">CPU</span>
              <span className="font-medium text-neu-text dark:text-neu-textDark">
                {service.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <NeuProgress value={service.cpuUsage} size="sm" color={service.cpuUsage > 80 ? 'warning' : 'accent'} />
            <div className="flex justify-between text-xs pt-1">
              <span className="text-neu-textLight">内存</span>
              <span className="font-medium text-neu-text dark:text-neu-textDark">
                {(service.memoryUsage / 1024).toFixed(1)} GB
              </span>
            </div>
          </div>
        )}

        {/* Uptime */}
        <div className="flex items-center justify-between pt-2 border-t border-neu-dark/10 dark:border-white/5">
          <div>
            <p className="text-xs text-neu-textLight">运行时间</p>
            <p className="text-sm font-medium text-neu-text dark:text-neu-textDark">
              {service.status === 'running' ? formatUptime(service.uptime) : '--'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {service.status === 'running' ? (
              <>
                <NeuButton
                  size="icon"
                  variant="ghost"
                  onClick={() => onRestart?.(service.id)}
                  title="重启"
                >
                  <RotateCcw className="w-4 h-4" />
                </NeuButton>
                <NeuButton
                  size="icon"
                  variant="ghost"
                  onClick={() => onStop?.(service.id)}
                  title="停止"
                >
                  <Square className="w-4 h-4" />
                </NeuButton>
              </>
            ) : (
              <NeuButton
                size="icon"
                variant="ghost"
                onClick={() => onStart?.(service.id)}
                title="启动"
              >
                <Play className="w-4 h-4" />
              </NeuButton>
            )}
          </div>
        </div>
      </div>
    </NeuCard>
  );
}
