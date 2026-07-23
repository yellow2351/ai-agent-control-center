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
} from '@/types';

function generateHistory(hours: number, baseValue: number, variance: number) {
  const history = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 60 * 60 * 1000);
    const value = Math.min(
      100,
      Math.max(0, baseValue + (Math.random() - 0.5) * variance)
    );
    history.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(value * 10) / 10,
    });
  }
  return history;
}

export const mockServices: Service[] = [
  {
    id: 'sillytavern-1',
    name: 'SillyTavern',
    type: 'sillytavern',
    status: 'running',
    version: '1.12.5',
    port: 8000,
    uptime: 86400 * 3 + 7200,
    cpuUsage: 12.5,
    memoryUsage: 512,
    memoryTotal: 8192,
    url: 'http://localhost:8000',
    description: '前端角色扮演聊天界面',
  },
  {
    id: 'astrbot-1',
    name: 'AstrBot',
    type: 'astrbot',
    status: 'running',
    version: '3.4.2',
    port: 6185,
    uptime: 86400 * 2 + 14400,
    cpuUsage: 8.2,
    memoryUsage: 256,
    memoryTotal: 8192,
    url: 'http://localhost:6185',
    description: '多平台 AI 聊天机器人',
  },
  {
    id: 'kobold-1',
    name: 'Kobold AI',
    type: 'kobold',
    status: 'running',
    version: '2.0.1',
    port: 5001,
    uptime: 3600 * 5,
    cpuUsage: 45.8,
    memoryUsage: 6144,
    memoryTotal: 8192,
    url: 'http://localhost:5001',
    description: '本地大语言模型推理引擎',
  },
  {
    id: 'ollama-1',
    name: 'Ollama',
    type: 'ollama',
    status: 'stopped',
    version: '0.1.38',
    port: 11434,
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    memoryTotal: 8192,
    url: 'http://localhost:11434',
    description: '轻量级本地模型运行框架',
  },
];

export const mockSystemResources: SystemResources = {
  cpu: 28.5,
  memory: 62.3,
  memoryTotal: 8192,
  memoryUsed: 5100,
  disk: 45.2,
  diskTotal: '128 GB',
  diskUsed: '57.8 GB',
  cpuHistory: generateHistory(24, 30, 30),
  memoryHistory: generateHistory(24, 60, 15),
};

export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: '助手小美',
    description: '温柔体贴的智能助手，擅长解答各种问题',
    avatar: '👩‍💼',
    tags: ['助手', '中文', '友好'],
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-03-20T14:20:00Z',
    creator: '官方',
    characterBook: '基础助手设定',
  },
  {
    id: 'char-2',
    name: '编程大师',
    description: '资深程序员，精通多种编程语言',
    avatar: '👨‍💻',
    tags: ['编程', '技术', '代码'],
    createdAt: '2024-02-10T08:15:00Z',
    lastUsed: '2024-03-19T09:45:00Z',
    creator: '社区',
    characterBook: '程序员设定',
  },
  {
    id: 'char-3',
    name: '文学少女',
    description: '热爱文学创作的文艺少女',
    avatar: '📚',
    tags: ['文学', '创作', '文艺'],
    createdAt: '2024-02-20T16:00:00Z',
    lastUsed: '2024-03-15T20:30:00Z',
    creator: '用户',
    characterBook: '文学少女设定',
  },
  {
    id: 'char-4',
    name: '健身教练',
    description: '专业健身指导，制定训练计划',
    avatar: '💪',
    tags: ['健身', '运动', '健康'],
    createdAt: '2024-03-01T12:00:00Z',
    lastUsed: '2024-03-18T07:00:00Z',
    creator: '官方',
  },
];

export const mockWorldBooks: WorldBook[] = [
  {
    id: 'wb-1',
    name: '赛博朋克世界',
    entries: 156,
    description: '高科技低生活的未来都市设定',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'wb-2',
    name: '仙侠世界',
    entries: 203,
    description: '东方玄幻修仙世界观',
    isActive: false,
    createdAt: '2024-02-05T14:30:00Z',
  },
  {
    id: 'wb-3',
    name: '学园都市',
    entries: 89,
    description: '现代校园超能力设定',
    isActive: true,
    createdAt: '2024-02-28T09:15:00Z',
  },
];

export const mockSillyTavernPlugins: Plugin[] = [
  {
    id: 'st-plugin-1',
    name: 'TTS 语音合成',
    description: '为角色回复添加语音朗读功能',
    version: '2.3.1',
    author: 'SillyTavern',
    isEnabled: true,
    type: 'sillytavern',
    category: '语音',
  },
  {
    id: 'st-plugin-2',
    name: '图像生成',
    description: '集成 Stable Diffusion 生成角色图像',
    version: '1.8.0',
    author: '社区',
    isEnabled: true,
    type: 'sillytavern',
    category: '图像',
  },
  {
    id: 'st-plugin-3',
    name: '翻译插件',
    description: '实时翻译对话内容',
    version: '1.5.2',
    author: '社区',
    isEnabled: false,
    type: 'sillytavern',
    category: '工具',
  },
  {
    id: 'st-plugin-4',
    name: '角色卡管理',
    description: '批量管理和导出角色卡',
    version: '3.0.0',
    author: '官方',
    isEnabled: true,
    type: 'sillytavern',
    category: '管理',
  },
];

export const mockApiPresets: ApiPreset[] = [
  {
    id: 'preset-1',
    name: 'Kobold AI 本地',
    type: 'kobold',
    source: 'KoboldAI',
    model: 'Llama-3-8B',
    temperature: 0.7,
    maxTokens: 4096,
    isActive: true,
  },
  {
    id: 'preset-2',
    name: 'Ollama 本地',
    type: 'openai',
    source: 'OpenAI',
    model: 'qwen:7b',
    temperature: 0.8,
    maxTokens: 2048,
    isActive: false,
  },
  {
    id: 'preset-3',
    name: '创意写作',
    type: 'kobold',
    source: 'KoboldAI',
    model: 'Llama-3-8B',
    temperature: 1.1,
    maxTokens: 8192,
    isActive: false,
  },
];

export const mockAstrBotPlugins: Plugin[] = [
  {
    id: 'ab-plugin-1',
    name: '聊天核心',
    description: '基础 AI 对话功能',
    version: '2.0.0',
    author: 'AstrBot',
    isEnabled: true,
    type: 'astrbot',
    category: '核心',
  },
  {
    id: 'ab-plugin-2',
    name: '图片生成',
    description: 'AI 绘画功能插件',
    version: '1.3.5',
    author: '社区',
    isEnabled: true,
    type: 'astrbot',
    category: '图像',
  },
  {
    id: 'ab-plugin-3',
    name: '音乐搜索',
    description: '搜索和分享音乐',
    version: '1.1.0',
    author: '社区',
    isEnabled: false,
    type: 'astrbot',
    category: '娱乐',
  },
  {
    id: 'ab-plugin-4',
    name: '天气预报',
    description: '查询天气信息',
    version: '1.0.2',
    author: '官方',
    isEnabled: true,
    type: 'astrbot',
    category: '工具',
  },
];

export const mockAdapters: PlatformAdapter[] = [
  {
    id: 'adapter-1',
    name: 'QQ 频道',
    type: 'qqguild',
    status: 'connected',
    botId: '123456789',
    lastMessage: '2分钟前',
  },
  {
    id: 'adapter-2',
    name: '微信公众号',
    type: 'wechat',
    status: 'connected',
    botId: 'wx_abc123',
    lastMessage: '5分钟前',
  },
  {
    id: 'adapter-3',
    name: 'Telegram',
    type: 'telegram',
    status: 'disconnected',
    botId: '-',
    lastMessage: '-',
  },
  {
    id: 'adapter-4',
    name: 'Discord',
    type: 'discord',
    status: 'error',
    botId: 'discord_bot',
    lastMessage: '1小时前',
  },
];

export const mockModels: ModelInfo[] = [
  {
    id: 'model-1',
    name: 'Llama-3-8B-Instruct',
    size: '8B',
    parameters: '80亿',
    status: 'loaded',
    contextLength: 8192,
    backend: 'Kobold AI',
    quantization: 'Q4_K_M',
  },
  {
    id: 'model-2',
    name: 'Qwen2-7B-Instruct',
    size: '7B',
    parameters: '70亿',
    status: 'loaded',
    contextLength: 32768,
    backend: 'Ollama',
    quantization: 'Q4_0',
  },
  {
    id: 'model-3',
    name: 'Mistral-Nemo-12B',
    size: '12B',
    parameters: '120亿',
    status: 'unloaded',
    contextLength: 128000,
    backend: 'Kobold AI',
    quantization: 'Q5_K_M',
  },
  {
    id: 'model-4',
    name: 'Gemma-2-9B',
    size: '9B',
    parameters: '90亿',
    status: 'unloaded',
    contextLength: 8192,
    backend: 'LM Studio',
    quantization: 'Q4_K_M',
  },
];

export const mockGenerationParams: GenerationParams = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 4096,
  repeatPenalty: 1.1,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

export const mockSettings: AppSettings = {
  theme: 'light',
  language: 'zh-CN',
  autoRefresh: true,
  refreshInterval: 5000,
  connections: [
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
  ],
  tunnel: {
    provider: 'none',
    status: 'stopped',
  },
};
