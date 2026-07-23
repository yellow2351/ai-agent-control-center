export type ServiceType = 'sillytavern' | 'astrbot' | 'kobold' | 'ollama' | 'lmstudio';
export type ServiceStatus = 'running' | 'stopped' | 'error' | 'loading';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  version: string;
  port: number;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  url: string;
  description: string;
}

export interface SystemResources {
  cpu: number;
  memory: number;
  memoryTotal: number;
  memoryUsed: number;
  disk: number;
  diskTotal: string;
  diskUsed: string;
  cpuHistory: { time: string; value: number }[];
  memoryHistory: { time: string; value: number }[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  createdAt: string;
  lastUsed: string;
  creator: string;
  characterBook?: string;
}

export interface WorldBook {
  id: string;
  name: string;
  entries: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isEnabled: boolean;
  type: 'sillytavern' | 'astrbot';
  category: string;
}

export interface ApiPreset {
  id: string;
  name: string;
  type: string;
  source: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

export interface PlatformAdapter {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  botId: string;
  lastMessage: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  parameters: string;
  status: 'loaded' | 'loading' | 'unloaded' | 'error';
  contextLength: number;
  backend: string;
  quantization?: string;
}

export interface GenerationParams {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  repeatPenalty: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface TunnelConfig {
  provider: 'frp' | 'ngrok' | 'cloudflared' | 'none';
  status: 'running' | 'stopped' | 'error';
  url?: string;
  configPath?: string;
}

export interface ConnectionConfig {
  id: string;
  name: string;
  type: ServiceType;
  host: string;
  port: number;
  apiKey?: string;
  isConnected: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  autoRefresh: boolean;
  refreshInterval: number;
  connections: ConnectionConfig[];
  tunnel: TunnelConfig;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
}
