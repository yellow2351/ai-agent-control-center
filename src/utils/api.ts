import type {
  Service,
  SystemResources,
  Character,
  WorldBook,
  Plugin,
  ApiPreset,
  PlatformAdapter,
  ModelInfo,
  GenerationParams,
  AppSettings,
  ApiResponse,
  LogEntry,
} from '@/types';

import {
  mockServices,
  mockSystemResources,
  mockCharacters,
  mockWorldBooks,
  mockSillyTavernPlugins,
  mockApiPresets,
  mockAstrBotPlugins,
  mockAdapters,
  mockModels,
  mockGenerationParams,
  mockSettings,
} from './mockData';

const STORAGE_KEY = 'ai-agent-control-center-data';
const SETTINGS_KEY = 'ai-agent-control-center-settings';

interface LocalData {
  services: Service[];
  characters: Character[];
  worldBooks: WorldBook[];
  sillyTavernPlugins: Plugin[];
  apiPresets: ApiPreset[];
  astrBotPlugins: Plugin[];
  adapters: PlatformAdapter[];
  models: ModelInfo[];
  generationParams: GenerationParams;
  astrBotConfig: any;
}

function loadLocalData(): LocalData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load local data:', e);
  }
  return {
    services: JSON.parse(JSON.stringify(mockServices)),
    characters: JSON.parse(JSON.stringify(mockCharacters)),
    worldBooks: JSON.parse(JSON.stringify(mockWorldBooks)),
    sillyTavernPlugins: JSON.parse(JSON.stringify(mockSillyTavernPlugins)),
    apiPresets: JSON.parse(JSON.stringify(mockApiPresets)),
    astrBotPlugins: JSON.parse(JSON.stringify(mockAstrBotPlugins)),
    adapters: JSON.parse(JSON.stringify(mockAdapters)),
    models: JSON.parse(JSON.stringify(mockModels)),
    generationParams: JSON.parse(JSON.stringify(mockGenerationParams)),
    astrBotConfig: {
      botName: 'AstrBot',
      adminIds: ['admin123'],
      defaultPlatform: 'qqguild',
      enableWebSearch: true,
      maxContextLength: 4096,
    },
  };
}

function saveLocalData(data: LocalData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local data:', e);
  }
}

let localData = loadLocalData();

let apiBase = '';
let useLocal = true;

export function setApiBase(base: string) {
  apiBase = base || '';
  useLocal = !base || base === '';
  localStorage.setItem(SETTINGS_KEY + '-apiBase', base || '');
}

export function getApiBase(): string {
  return apiBase;
}

export function isUsingLocal(): boolean {
  return useLocal;
}

function initApiBase() {
  const saved = localStorage.getItem(SETTINGS_KEY + '-apiBase');
  if (saved) {
    apiBase = saved;
    useLocal = false;
  }
}

initApiBase();

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (useLocal) {
    return localRequest<T>(endpoint, options);
  }

  const res = await fetch(`${apiBase}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data.data || data;
}

async function localRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  await new Promise((r) => setTimeout(r, 200));

  const method = options?.method || 'GET';
  const url = endpoint;
  let body: any = null;
  if (options?.body) {
    try {
      body = JSON.parse(options.body as string);
    } catch (e) {}
  }

  if (url === '/services' && method === 'GET') {
    const services = localData.services.map((s) => {
      if (s.status === 'running') {
        return {
          ...s,
          cpuUsage: Math.min(100, Math.max(0, s.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(100, s.memoryUsage + (Math.random() - 0.5) * 200),
          uptime: s.uptime + 1,
        };
      }
      return s;
    });
    return services as unknown as T;
  }
  if (url.match(/^\/services\/[^/]+$/) && method === 'GET') {
    const id = url.split('/')[2];
    const service = localData.services.find((s) => s.id === id);
    return service as unknown as T;
  }
  if (url.match(/^\/services\/[^/]+\/restart$/) && method === 'POST') {
    const id = url.split('/')[2];
    const service = localData.services.find((s) => s.id === id);
    if (service) {
      service.status = 'loading';
      saveLocalData(localData);
      setTimeout(() => {
        service.status = 'running';
        service.uptime = 0;
        service.cpuUsage = Math.random() * 30 + 5;
        service.memoryUsage = Math.random() * 2000 + 500;
        saveLocalData(localData);
      }, 2000);
    }
    return { success: true, message: '服务正在重启' } as unknown as T;
  }
  if (url.match(/^\/services\/[^/]+\/stop$/) && method === 'POST') {
    const id = url.split('/')[2];
    const service = localData.services.find((s) => s.id === id);
    if (service) {
      service.status = 'stopped';
      service.cpuUsage = 0;
      service.memoryUsage = 0;
      service.uptime = 0;
      saveLocalData(localData);
    }
    return { success: true, message: '服务已停止' } as unknown as T;
  }
  if (url.match(/^\/services\/[^/]+\/start$/) && method === 'POST') {
    const id = url.split('/')[2];
    const service = localData.services.find((s) => s.id === id);
    if (service) {
      service.status = 'loading';
      saveLocalData(localData);
      setTimeout(() => {
        service.status = 'running';
        service.cpuUsage = Math.random() * 30 + 5;
        service.memoryUsage = Math.random() * 2000 + 500;
        service.uptime = 0;
        saveLocalData(localData);
      }, 1500);
    }
    return { success: true, message: '服务正在启动' } as unknown as T;
  }
  if (url.match(/^\/services\/[^/]+\/logs$/) && method === 'GET') {
    const id = url.split('/')[2];
    const service = localData.services.find((s) => s.id === id);
    const logs: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      level: i % 5 === 0 ? 'warn' : i % 7 === 0 ? 'error' : 'info',
      message: `[${service?.name || 'Service'}] 日志消息 ${i + 1} - 系统运行正常`,
      service: service?.name || 'Service',
    }));
    return { logs } as unknown as T;
  }

  if (url === '/system/resources' && method === 'GET') {
    const cpuVal = Math.min(100, Math.max(10, mockSystemResources.cpu + (Math.random() - 0.5) * 15));
    const memVal = Math.max(2000, mockSystemResources.memoryUsed + (Math.random() - 0.5) * 500);
    const res = {
      ...mockSystemResources,
      cpu: cpuVal,
      memoryUsed: memVal,
      memory: (memVal / mockSystemResources.memoryTotal) * 100,
      cpuHistory: [
        ...mockSystemResources.cpuHistory.slice(1),
        { time: new Date().toLocaleTimeString(), value: cpuVal },
      ],
      memoryHistory: [
        ...mockSystemResources.memoryHistory.slice(1),
        { time: new Date().toLocaleTimeString(), value: memVal / mockSystemResources.memoryTotal * 100 },
      ],
    };
    return res as unknown as T;
  }

  if (url === '/sillytavern/characters' && method === 'GET') {
    return localData.characters as unknown as T;
  }
  if (url === '/sillytavern/worldbooks' && method === 'GET') {
    return localData.worldBooks as unknown as T;
  }
  if (url === '/sillytavern/plugins' && method === 'GET') {
    return localData.sillyTavernPlugins as unknown as T;
  }
  if (url.match(/^\/sillytavern\/plugins\/[^/]+\/toggle$/) && method === 'POST') {
    const id = url.split('/')[3];
    const plugin = localData.sillyTavernPlugins.find((p) => p.id === id);
    if (plugin) {
      plugin.isEnabled = !plugin.isEnabled;
      saveLocalData(localData);
    }
    return { success: true, data: plugin } as unknown as T;
  }
  if (url === '/sillytavern/api-presets' && method === 'GET') {
    return localData.apiPresets as unknown as T;
  }

  if (url === '/astrbot/plugins' && method === 'GET') {
    return localData.astrBotPlugins as unknown as T;
  }
  if (url.match(/^\/astrbot\/plugins\/[^/]+\/toggle$/) && method === 'POST') {
    const id = url.split('/')[3];
    const plugin = localData.astrBotPlugins.find((p) => p.id === id);
    if (plugin) {
      plugin.isEnabled = !plugin.isEnabled;
      saveLocalData(localData);
    }
    return { success: true, data: plugin } as unknown as T;
  }
  if (url === '/astrbot/adapters' && method === 'GET') {
    return localData.adapters as unknown as T;
  }
  if (url === '/astrbot/config' && method === 'GET') {
    return localData.astrBotConfig as unknown as T;
  }
  if (url === '/astrbot/config' && method === 'PUT') {
    localData.astrBotConfig = { ...localData.astrBotConfig, ...body };
    saveLocalData(localData);
    return { success: true, message: '配置已更新', data: localData.astrBotConfig } as unknown as T;
  }

  if (url === '/models' && method === 'GET') {
    return localData.models as unknown as T;
  }
  if (url.match(/^\/models\/[^/]+\/load$/) && method === 'POST') {
    const id = url.split('/')[2];
    const model = localData.models.find((m) => m.id === id);
    if (model) {
      model.status = 'loading';
      saveLocalData(localData);
      setTimeout(() => {
        model.status = 'loaded';
        saveLocalData(localData);
      }, 3000);
    }
    return { success: true, message: '模型正在加载' } as unknown as T;
  }
  if (url.match(/^\/models\/[^/]+\/unload$/) && method === 'POST') {
    const id = url.split('/')[2];
    const model = localData.models.find((m) => m.id === id);
    if (model) {
      model.status = 'unloaded';
      saveLocalData(localData);
    }
    return { success: true, message: '模型已卸载' } as unknown as T;
  }
  if (url === '/models/params' && method === 'GET') {
    return localData.generationParams as unknown as T;
  }
  if (url === '/models/params' && method === 'PUT') {
    localData.generationParams = { ...localData.generationParams, ...body };
    saveLocalData(localData);
    return { success: true, message: '参数已更新', data: localData.generationParams } as unknown as T;
  }
  if (url === '/models/test' && method === 'POST') {
    await new Promise((r) => setTimeout(r, 1000));
    return {
      response: '这是一条测试回复。模型连接正常，工作状态良好。',
    } as unknown as T;
  }

  if (url === '/settings' && method === 'GET') {
    return mockSettings as unknown as T;
  }
  if (url === '/settings' && method === 'PUT') {
    const updated = { ...mockSettings, ...body };
    Object.assign(mockSettings, updated);
    return { success: true, message: '设置已更新', data: updated } as unknown as T;
  }
  if (url === '/settings/tunnel' && method === 'GET') {
    return mockSettings.tunnel as unknown as T;
  }
  if (url === '/settings/tunnel/start' && method === 'POST') {
    mockSettings.tunnel.status = 'running';
    mockSettings.tunnel.url = 'https://random-id.frp.example.com';
    return { success: true, message: '内网穿透已启动' } as unknown as T;
  }
  if (url === '/settings/tunnel/stop' && method === 'POST') {
    mockSettings.tunnel.status = 'stopped';
    mockSettings.tunnel.url = undefined;
    return { success: true, message: '内网穿透已停止' } as unknown as T;
  }

  return {} as T;
}

export const api = {
  getServices: () => request<Service[]>('/services'),
  getService: (id: string) => request<Service>(`/services/${id}`),
  restartService: (id: string) =>
    request<ApiResponse>(`/services/${id}/restart`, { method: 'POST' }),
  stopService: (id: string) =>
    request<ApiResponse>(`/services/${id}/stop`, { method: 'POST' }),
  startService: (id: string) =>
    request<ApiResponse>(`/services/${id}/start`, { method: 'POST' }),
  getServiceLogs: (id: string) =>
    request<{ logs: LogEntry[] }>(`/services/${id}/logs`),

  getSystemResources: () =>
    request<SystemResources>('/system/resources'),

  getCharacters: () =>
    request<Character[]>('/sillytavern/characters'),
  getWorldBooks: () =>
    request<WorldBook[]>('/sillytavern/worldbooks'),
  getSillyTavernPlugins: () =>
    request<Plugin[]>('/sillytavern/plugins'),
  toggleSillyTavernPlugin: (id: string) =>
    request<ApiResponse>(`/sillytavern/plugins/${id}/toggle`, { method: 'POST' }),
  getApiPresets: () =>
    request<ApiPreset[]>('/sillytavern/api-presets'),

  getAstrBotPlugins: () =>
    request<Plugin[]>('/astrbot/plugins'),
  toggleAstrBotPlugin: (id: string) =>
    request<ApiResponse>(`/astrbot/plugins/${id}/toggle`, { method: 'POST' }),
  getAdapters: () =>
    request<PlatformAdapter[]>('/astrbot/adapters'),
  getAstrBotConfig: () =>
    request<any>('/astrbot/config'),
  updateAstrBotConfig: (config: any) =>
    request<ApiResponse>('/astrbot/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  getModels: () => request<ModelInfo[]>('/models'),
  loadModel: (id: string) =>
    request<ApiResponse>(`/models/${id}/load`, { method: 'POST' }),
  unloadModel: (id: string) =>
    request<ApiResponse>(`/models/${id}/unload`, { method: 'POST' }),
  getModelParams: () =>
    request<GenerationParams>('/models/params'),
  updateModelParams: (params: Partial<GenerationParams>) =>
    request<ApiResponse>('/models/params', {
      method: 'PUT',
      body: JSON.stringify(params),
    }),
  testModel: (message: string) =>
    request<ApiResponse<{ response: string }>>('/models/test', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getSettings: () => request<AppSettings>('/settings'),
  updateSettings: (settings: Partial<AppSettings>) =>
    request<ApiResponse>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getTunnelStatus: () =>
    request<{ provider: string; status: string; url?: string }>('/settings/tunnel'),
  startTunnel: () =>
    request<ApiResponse>('/settings/tunnel/start', { method: 'POST' }),
  stopTunnel: () =>
    request<ApiResponse>('/settings/tunnel/stop', { method: 'POST' }),
};
