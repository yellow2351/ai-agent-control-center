import { useEffect, useState } from 'react';
import {
  Cpu,
  Database,
  Play,
  Square,
  RefreshCw,
  Settings,
  Send,
  Thermometer,
  Hash,
  Layers,
  Zap,
} from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuTabs } from '@/components/neumorphic/NeuTabs';
import { NeuProgress } from '@/components/neumorphic/NeuProgress';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { api } from '@/utils/api';
import type { ModelInfo, GenerationParams } from '@/types';

export default function Models() {
  const [activeTab, setActiveTab] = useState('list');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [params, setParams] = useState<GenerationParams | null>(null);
  const [testMessage, setTestMessage] = useState('你好，请做个自我介绍');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([api.getModels(), api.getModelParams()]);
      setModels(m);
      setParams(p);
    } catch (err) {
      console.error('加载数据失败:', err);
    }
    setLoading(false);
  };

  const loadModel = async (id: string) => {
    try {
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'loading' } : m))
      );
      await api.loadModel(id);
      setTimeout(() => {
        setModels((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'loaded' } : m))
        );
      }, 3000);
    } catch (err) {
      console.error('加载模型失败:', err);
    }
  };

  const unloadModel = async (id: string) => {
    try {
      await api.unloadModel(id);
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'unloaded' } : m))
      );
    } catch (err) {
      console.error('卸载模型失败:', err);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResponse('');
    try {
      const res = await api.testModel(testMessage);
      setTestResponse((res as any).response || '');
    } catch (err) {
      console.error('测试失败:', err);
    }
    setTesting(false);
  };

  const tabs = [
    { key: 'list', label: '模型列表', icon: <Database className="w-4 h-4" /> },
    { key: 'params', label: '参数配置', icon: <Settings className="w-4 h-4" /> },
    { key: 'test', label: '测试对话', icon: <Send className="w-4 h-4" /> },
  ];

  const loadedModels = models.filter((m) => m.status === 'loaded');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <NeuCard size="sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neu-text dark:text-neu-textDark">
                模型管理
              </h2>
              <p className="text-sm text-neu-textLight">
                管理 OpenAI 兼容 API 框架的模型
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-neu-textLight">已加载模型</p>
              <p className="font-bold text-gradient">{loadedModels.length}</p>
            </div>
            <NeuButton variant="default" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
              刷新
            </NeuButton>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <NeuTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Model List Tab */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <NeuCard key={model.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400/20 to-indigo-500/20 flex items-center justify-center text-violet-500">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {model.name}
                      </h3>
                      <p className="text-xs text-neu-textLight">
                        {model.backend} · {model.parameters}参数
                      </p>
                    </div>
                  </div>
                  <StatusIndicator status={model.status === 'unloaded' ? 'stopped' : model.status === 'error' ? 'error' : model.status === 'loading' ? 'loading' : 'running'} showLabel />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-neu-textLight mb-1">模型大小</p>
                    <p className="font-medium text-neu-text dark:text-neu-textDark">
                      {model.size}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neu-textLight mb-1">上下文长度</p>
                    <p className="font-medium text-neu-text dark:text-neu-textDark">
                      {(model.contextLength / 1024).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neu-textLight mb-1">量化方式</p>
                    <p className="font-medium text-neu-text dark:text-neu-textDark">
                      {model.quantization || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neu-textLight mb-1">后端框架</p>
                    <p className="font-medium text-neu-text dark:text-neu-textDark">
                      {model.backend}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neu-dark/10 dark:border-white/5">
                  {model.status === 'unloaded' ? (
                    <NeuButton variant="primary" size="sm" onClick={() => loadModel(model.id)}>
                      <Play className="w-4 h-4" />
                      加载模型
                    </NeuButton>
                  ) : model.status === 'loaded' ? (
                    <NeuButton variant="danger" size="sm" onClick={() => unloadModel(model.id)}>
                      <Square className="w-4 h-4" />
                      卸载
                    </NeuButton>
                  ) : (
                    <NeuButton variant="default" size="sm" disabled>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      加载中...
                    </NeuButton>
                  )}
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Params Tab */}
      {activeTab === 'params' && params && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeuCard>
            <div className="space-y-6">
              <h3 className="font-semibold text-neu-text dark:text-neu-textDark flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-neu-accent" />
                采样参数
              </h3>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      Temperature (温度)
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.temperature}
                    </span>
                  </div>
                  <NeuProgress value={params.temperature * 50} size="md" />
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={params.temperature}
                    onChange={(e) =>
                      setParams({ ...params, temperature: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      Top P
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.topP}
                    </span>
                  </div>
                  <NeuProgress value={params.topP * 100} size="md" color="success" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params.topP}
                    onChange={(e) =>
                      setParams({ ...params, topP: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-success"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      Top K
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.topK}
                    </span>
                  </div>
                  <NeuProgress value={(params.topK / 100) * 100} size="md" color="warning" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={params.topK}
                    onChange={(e) =>
                      setParams({ ...params, topK: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-warning"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          <NeuCard>
            <div className="space-y-6">
              <h3 className="font-semibold text-neu-text dark:text-neu-textDark flex items-center gap-2">
                <Hash className="w-5 h-5 text-neu-accent" />
                长度与惩罚
              </h3>

              <div className="space-y-4">
                <NeuInput
                  label="最大 Token 数"
                  type="number"
                  value={params.maxTokens}
                  onChange={(e) =>
                    setParams({ ...params, maxTokens: Number(e.target.value) })
                  }
                />

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      重复惩罚
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.repeatPenalty}
                    </span>
                  </div>
                  <NeuProgress value={((params.repeatPenalty - 1) / 1) * 100} size="md" color="info" />
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={params.repeatPenalty}
                    onChange={(e) =>
                      setParams({ ...params, repeatPenalty: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-info"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      频率惩罚
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.frequencyPenalty}
                    </span>
                  </div>
                  <NeuProgress value={((params.frequencyPenalty + 2) / 4) * 100} size="md" />
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={params.frequencyPenalty}
                    onChange={(e) =>
                      setParams({ ...params, frequencyPenalty: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neu-text dark:text-neu-textDark">
                      存在惩罚
                    </label>
                    <span className="text-sm font-bold text-neu-accent">
                      {params.presencePenalty}
                    </span>
                  </div>
                  <NeuProgress value={((params.presencePenalty + 2) / 4) * 100} size="md" color="success" />
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={params.presencePenalty}
                    onChange={(e) =>
                      setParams({ ...params, presencePenalty: Number(e.target.value) })
                    }
                    className="w-full mt-2 accent-neu-success"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          <div className="lg:col-span-2 flex justify-end gap-3">
            <NeuButton variant="default">重置默认</NeuButton>
            <NeuButton variant="primary">
              <Zap className="w-4 h-4" />
              保存参数
            </NeuButton>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <NeuCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
              模型测试
            </h3>

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
                <NeuButton variant="primary" onClick={handleTest} disabled={testing}>
                  <Send className="w-4 h-4" />
                  发送
                </NeuButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neu-text dark:text-neu-textDark mb-2 block">
                模型回复
              </label>
              <div className="min-h-[150px] p-4 rounded-xl shadow-neu-concave-sm dark:shadow-neu-dark-concave bg-neu-bg dark:bg-neu-bgDark">
                {testing ? (
                  <div className="flex items-center gap-2 text-neu-textLight">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在生成回复...</span>
                  </div>
                ) : testResponse ? (
                  <p className="text-neu-text dark:text-neu-textDark leading-relaxed">
                    {testResponse}
                  </p>
                ) : (
                  <p className="text-neu-textLight text-sm">点击发送按钮测试模型连接</p>
                )}
              </div>
            </div>
          </div>
        </NeuCard>
      )}
    </div>
  );
}
