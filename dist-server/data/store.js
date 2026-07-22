"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var DATA_DIR = process.env.DATA_DIR || path_1.default.join(__dirname, '..', '..', 'data');
var DATA_FILE = path_1.default.join(DATA_DIR, 'app-data.json');
var LOGS_FILE = path_1.default.join(DATA_DIR, 'logs.json');
function ensureDataDir() {
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
}
var defaultData = {
    services: [
        {
            id: 'sillytavern-1',
            name: 'SillyTavern',
            type: 'sillytavern',
            status: 'stopped',
            version: '1.12.5',
            port: 8000,
            uptime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            memoryTotal: 8192,
            url: 'http://127.0.0.1:8000',
            description: '前端角色扮演聊天界面',
        },
        {
            id: 'astrbot-1',
            name: 'AstrBot',
            type: 'astrbot',
            status: 'stopped',
            version: '3.4.2',
            port: 6185,
            uptime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            memoryTotal: 8192,
            url: 'http://127.0.0.1:6185',
            description: '多平台 AI 聊天机器人',
        },
        {
            id: 'kobold-1',
            name: 'Kobold AI',
            type: 'kobold',
            status: 'stopped',
            version: '2.0.1',
            port: 5001,
            uptime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            memoryTotal: 8192,
            url: 'http://127.0.0.1:5001',
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
            url: 'http://127.0.0.1:11434',
            description: '轻量级本地模型运行框架',
        },
    ],
    characters: [
        {
            id: 'char-1',
            name: '助手小美',
            description: '温柔体贴的智能助手，擅长解答各种问题',
            avatar: '👩‍💼',
            tags: ['助手', '中文', '友好'],
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            creator: '官方',
            characterBook: '基础助手设定',
        },
    ],
    worldBooks: [],
    sillyTavernPlugins: [],
    apiPresets: [
        {
            id: 'preset-1',
            name: '默认配置',
            type: 'kobold',
            source: 'KoboldAI',
            model: '',
            temperature: 0.7,
            maxTokens: 4096,
            isActive: true,
        },
    ],
    astrBotPlugins: [],
    adapters: [],
    models: [],
    generationParams: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxTokens: 4096,
        repeatPenalty: 1.1,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
    },
    settings: {
        theme: 'light',
        language: 'zh-CN',
        autoRefresh: true,
        refreshInterval: 5000,
        connections: [],
        tunnel: {
            provider: 'none',
            status: 'stopped',
        },
    },
};
function generateSystemResources() {
    var cpu = Math.round((Math.random() * 30 + 10) * 10) / 10;
    var memory = Math.round((Math.random() * 20 + 40) * 10) / 10;
    return {
        cpu: cpu,
        memory: memory,
        memoryTotal: 8192,
        memoryUsed: Math.round((memory / 100) * 8192),
        disk: 45.2,
        diskTotal: '128 GB',
        diskUsed: '57.8 GB',
        cpuHistory: Array.from({ length: 24 }, function (_, i) { return ({
            time: "".concat(String(i).padStart(2, '0'), ":00"),
            value: Math.round((Math.random() * 30 + 20) * 10) / 10,
        }); }),
        memoryHistory: Array.from({ length: 24 }, function (_, i) { return ({
            time: "".concat(String(i).padStart(2, '0'), ":00"),
            value: Math.round((Math.random() * 15 + 50) * 10) / 10,
        }); }),
    };
}
var cachedData = null;
var logsCache = [];
function loadData() {
    if (cachedData)
        return cachedData;
    ensureDataDir();
    if (fs_1.default.existsSync(DATA_FILE)) {
        try {
            var raw = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
            cachedData = JSON.parse(raw);
            return cachedData;
        }
        catch (e) {
            console.error('Failed to load data file, using defaults:', e);
        }
    }
    cachedData = JSON.parse(JSON.stringify(defaultData));
    saveData();
    return cachedData;
}
function saveData() {
    if (!cachedData)
        return;
    ensureDataDir();
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(cachedData, null, 2), 'utf-8');
}
function addLog(service, level, message) {
    var log = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        service: service,
    };
    logsCache.unshift(log);
    if (logsCache.length > 500)
        logsCache = logsCache.slice(0, 500);
    ensureDataDir();
    fs_1.default.writeFileSync(LOGS_FILE, JSON.stringify(logsCache.slice(0, 200), null, 2), 'utf-8');
}
function loadLogs() {
    if (logsCache.length > 0)
        return logsCache;
    if (fs_1.default.existsSync(LOGS_FILE)) {
        try {
            logsCache = JSON.parse(fs_1.default.readFileSync(LOGS_FILE, 'utf-8'));
        }
        catch (e) {
            logsCache = [];
        }
    }
    return logsCache;
}
function resetData() {
    cachedData = JSON.parse(JSON.stringify(defaultData));
    saveData();
    logsCache = [];
    if (fs_1.default.existsSync(LOGS_FILE))
        fs_1.default.unlinkSync(LOGS_FILE);
}
exports.store = {
    getData: loadData,
    save: saveData,
    addLog: addLog,
    getLogs: loadLogs,
    reset: resetData,
    getSystemResources: generateSystemResources,
};
