import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Puzzle,
  Settings as SettingsIcon,
  Upload,
  Search,
  Trash2,
  Eye,
  Power,
  Clock,
} from 'lucide-react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { NeuTabs } from '@/components/neumorphic/NeuTabs';
import { NeuSwitch } from '@/components/neumorphic/NeuSwitch';
import { api } from '@/utils/api';
import { formatDate } from '@/utils/formatters';
import type { Character, WorldBook, Plugin, ApiPreset } from '@/types';

export default function SillyTavern() {
  const [activeTab, setActiveTab] = useState('characters');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldBooks, setWorldBooks] = useState<WorldBook[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [apiPresets, setApiPresets] = useState<ApiPreset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chars, wbs, pls, presets] = await Promise.all([
        api.getCharacters(),
        api.getWorldBooks(),
        api.getSillyTavernPlugins(),
        api.getApiPresets(),
      ]);
      setCharacters(chars);
      setWorldBooks(wbs);
      setPlugins(pls);
      setApiPresets(presets);
    } catch (err) {
      console.error('加载数据失败:', err);
    }
    setLoading(false);
  };

  const togglePlugin = async (id: string) => {
    try {
      await api.toggleSillyTavernPlugin(id);
      setPlugins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
      );
    } catch (err) {
      console.error('切换插件状态失败:', err);
    }
  };

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: 'characters', label: '角色卡', icon: <Users className="w-4 h-4" /> },
    { key: 'worldbooks', label: '世界书', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'plugins', label: '插件', icon: <Puzzle className="w-4 h-4" /> },
    { key: 'presets', label: 'API 预设', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <NeuCard size="sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neu-text dark:text-neu-textDark">
                SillyTavern 管理
              </h2>
              <p className="text-sm text-neu-textLight">管理角色卡、世界书、插件和 API 配置</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NeuButton variant="primary">
              <Upload className="w-4 h-4" />
              上传
            </NeuButton>
          </div>
        </div>
      </NeuCard>

      {/* Tabs */}
      <NeuTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Characters Tab */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <NeuInput
              placeholder="搜索角色..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCharacters.map((char) => (
              <NeuCard key={char.id} className="hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neu-accentLight/20 to-neu-accent/20 flex items-center justify-center text-3xl">
                      {char.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark truncate">
                        {char.name}
                      </h3>
                      <p className="text-xs text-neu-textLight truncate">{char.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {char.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-neu-accent/10 text-neu-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neu-dark/10 dark:border-white/5">
                    <div className="flex items-center gap-1 text-xs text-neu-textLight">
                      <Clock className="w-3 h-3" />
                      <span>最近使用</span>
                    </div>
                    <div className="flex gap-1">
                      <NeuButton size="icon" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </NeuButton>
                      <NeuButton size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </NeuButton>
                    </div>
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        </div>
      )}

      {/* World Books Tab */}
      {activeTab === 'worldbooks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {worldBooks.map((wb) => (
            <NeuCard key={wb.id} className="hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-500">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {wb.name}
                      </h3>
                      <p className="text-xs text-neu-textLight">{wb.entries} 个词条</p>
                    </div>
                  </div>
                  <NeuSwitch checked={wb.isActive} onChange={() => {}} />
                </div>
                <p className="text-sm text-neu-textLight">{wb.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-neu-dark/10 dark:border-white/5">
                  <span className="text-xs text-neu-textLight">
                    创建于 {formatDate(wb.createdAt)}
                  </span>
                  <NeuButton size="sm" variant="secondary">
                    编辑
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Plugins Tab */}
      {activeTab === 'plugins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map((plugin) => (
            <NeuCard key={plugin.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
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

      {/* API Presets Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          {apiPresets.map((preset) => (
            <NeuCard key={preset.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-500/20 flex items-center justify-center text-blue-500">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
                        {preset.name}
                      </h3>
                      {preset.isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-neu-success/10 text-neu-success">
                          正在使用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neu-textLight">
                      {preset.source} · {preset.model}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-neu-textLight">
                      <span>温度: {preset.temperature}</span>
                      <span>最大Token: {preset.maxTokens}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!preset.isActive && (
                    <NeuButton size="sm" variant="secondary">
                      <Power className="w-4 h-4" />
                      启用
                    </NeuButton>
                  )}
                  <NeuButton size="sm" variant="default">
                    编辑
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}
