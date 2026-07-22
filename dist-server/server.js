// api/app.ts
import express from "express";
import cors from "cors";
import path2 from "path";
import dotenv from "dotenv";
import { fileURLToPath as fileURLToPath2 } from "url";

// api/routes/api.ts
import { Router } from "express";

// api/data/store.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
var DATA_FILE = path.join(DATA_DIR, "app-data.json");
var LOGS_FILE = path.join(DATA_DIR, "logs.json");
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
var defaultData = {
  services: [
    {
      id: "sillytavern-1",
      name: "SillyTavern",
      type: "sillytavern",
      status: "stopped",
      version: "1.12.5",
      port: 8e3,
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryTotal: 8192,
      url: "http://127.0.0.1:8000",
      description: "\u524D\u7AEF\u89D2\u8272\u626E\u6F14\u804A\u5929\u754C\u9762"
    },
    {
      id: "astrbot-1",
      name: "AstrBot",
      type: "astrbot",
      status: "stopped",
      version: "3.4.2",
      port: 6185,
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryTotal: 8192,
      url: "http://127.0.0.1:6185",
      description: "\u591A\u5E73\u53F0 AI \u804A\u5929\u673A\u5668\u4EBA"
    },
    {
      id: "kobold-1",
      name: "Kobold AI",
      type: "kobold",
      status: "stopped",
      version: "2.0.1",
      port: 5001,
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryTotal: 8192,
      url: "http://127.0.0.1:5001",
      description: "\u672C\u5730\u5927\u8BED\u8A00\u6A21\u578B\u63A8\u7406\u5F15\u64CE"
    },
    {
      id: "ollama-1",
      name: "Ollama",
      type: "ollama",
      status: "stopped",
      version: "0.1.38",
      port: 11434,
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryTotal: 8192,
      url: "http://127.0.0.1:11434",
      description: "\u8F7B\u91CF\u7EA7\u672C\u5730\u6A21\u578B\u8FD0\u884C\u6846\u67B6"
    }
  ],
  characters: [
    {
      id: "char-1",
      name: "\u52A9\u624B\u5C0F\u7F8E",
      description: "\u6E29\u67D4\u4F53\u8D34\u7684\u667A\u80FD\u52A9\u624B\uFF0C\u64C5\u957F\u89E3\u7B54\u5404\u79CD\u95EE\u9898",
      avatar: "\u{1F469}\u200D\u{1F4BC}",
      tags: ["\u52A9\u624B", "\u4E2D\u6587", "\u53CB\u597D"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastUsed: (/* @__PURE__ */ new Date()).toISOString(),
      creator: "\u5B98\u65B9",
      characterBook: "\u57FA\u7840\u52A9\u624B\u8BBE\u5B9A"
    }
  ],
  worldBooks: [],
  sillyTavernPlugins: [],
  apiPresets: [
    {
      id: "preset-1",
      name: "\u9ED8\u8BA4\u914D\u7F6E",
      type: "kobold",
      source: "KoboldAI",
      model: "",
      temperature: 0.7,
      maxTokens: 4096,
      isActive: true
    }
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
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  settings: {
    theme: "light",
    language: "zh-CN",
    autoRefresh: true,
    refreshInterval: 5e3,
    connections: [],
    tunnel: {
      provider: "none",
      status: "stopped"
    }
  }
};
function generateSystemResources() {
  const cpu = Math.round((Math.random() * 30 + 10) * 10) / 10;
  const memory = Math.round((Math.random() * 20 + 40) * 10) / 10;
  return {
    cpu,
    memory,
    memoryTotal: 8192,
    memoryUsed: Math.round(memory / 100 * 8192),
    disk: 45.2,
    diskTotal: "128 GB",
    diskUsed: "57.8 GB",
    cpuHistory: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: Math.round((Math.random() * 30 + 20) * 10) / 10
    })),
    memoryHistory: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: Math.round((Math.random() * 15 + 50) * 10) / 10
    }))
  };
}
var cachedData = null;
var logsCache = [];
function loadData() {
  if (cachedData) return cachedData;
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      cachedData = JSON.parse(raw);
      return cachedData;
    } catch (e) {
      console.error("Failed to load data file, using defaults:", e);
    }
  }
  cachedData = JSON.parse(JSON.stringify(defaultData));
  saveData();
  return cachedData;
}
function saveData() {
  if (!cachedData) return;
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(cachedData, null, 2), "utf-8");
}
function addLog(service, level, message) {
  const log = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    message,
    service
  };
  logsCache.unshift(log);
  if (logsCache.length > 500) logsCache = logsCache.slice(0, 500);
  ensureDataDir();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logsCache.slice(0, 200), null, 2), "utf-8");
}
function loadLogs() {
  if (logsCache.length > 0) return logsCache;
  if (fs.existsSync(LOGS_FILE)) {
    try {
      logsCache = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
    } catch (e) {
      logsCache = [];
    }
  }
  return logsCache;
}
function resetData() {
  cachedData = JSON.parse(JSON.stringify(defaultData));
  saveData();
  logsCache = [];
  if (fs.existsSync(LOGS_FILE)) fs.unlinkSync(LOGS_FILE);
}
var store = {
  getData: loadData,
  save: saveData,
  addLog,
  getLogs: loadLogs,
  reset: resetData,
  getSystemResources: generateSystemResources
};

// api/routes/api.ts
var router = Router();
router.get("/services", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.services });
});
router.get("/services/:id", (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: "\u670D\u52A1\u4E0D\u5B58\u5728" });
  res.json({ success: true, data: service });
});
router.post("/services/:id/restart", (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: "\u670D\u52A1\u4E0D\u5B58\u5728" });
  service.status = "loading";
  store.addLog(service.name, "info", "\u670D\u52A1\u6B63\u5728\u91CD\u542F...");
  store.save();
  setTimeout(() => {
    service.status = "running";
    service.uptime = 0;
    service.cpuUsage = Math.random() * 30 + 5;
    service.memoryUsage = Math.random() * 500 + 200;
    store.addLog(service.name, "info", "\u670D\u52A1\u91CD\u542F\u5B8C\u6210");
    store.save();
  }, 2e3);
  res.json({ success: true, message: "\u670D\u52A1\u6B63\u5728\u91CD\u542F" });
});
router.post("/services/:id/stop", (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: "\u670D\u52A1\u4E0D\u5B58\u5728" });
  service.status = "stopped";
  service.cpuUsage = 0;
  service.memoryUsage = 0;
  service.uptime = 0;
  store.addLog(service.name, "info", "\u670D\u52A1\u5DF2\u505C\u6B62");
  store.save();
  res.json({ success: true, message: "\u670D\u52A1\u5DF2\u505C\u6B62" });
});
router.post("/services/:id/start", (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: "\u670D\u52A1\u4E0D\u5B58\u5728" });
  service.status = "loading";
  store.addLog(service.name, "info", "\u670D\u52A1\u6B63\u5728\u542F\u52A8...");
  store.save();
  setTimeout(() => {
    service.status = "running";
    service.cpuUsage = Math.random() * 30 + 5;
    service.memoryUsage = Math.random() * 500 + 200;
    service.uptime = 0;
    store.addLog(service.name, "info", "\u670D\u52A1\u542F\u52A8\u6210\u529F");
    store.save();
  }, 1500);
  res.json({ success: true, message: "\u670D\u52A1\u6B63\u5728\u542F\u52A8" });
});
router.get("/services/:id/logs", (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: "\u670D\u52A1\u4E0D\u5B58\u5728" });
  const allLogs = store.getLogs();
  const logs = allLogs.filter((l) => l.service === service.name).slice(0, 50);
  res.json({ success: true, data: { logs } });
});
router.get("/system/resources", (_req, res) => {
  res.json({ success: true, data: store.getSystemResources() });
});
router.get("/sillytavern/characters", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.characters });
});
router.post("/sillytavern/characters", (req, res) => {
  const data = store.getData();
  const newChar = {
    id: "char-" + Date.now(),
    ...req.body,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsed: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.characters.push(newChar);
  store.save();
  res.json({ success: true, data: newChar });
});
router.put("/sillytavern/characters/:id", (req, res) => {
  const data = store.getData();
  const idx = data.characters.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "\u89D2\u8272\u4E0D\u5B58\u5728" });
  data.characters[idx] = { ...data.characters[idx], ...req.body };
  store.save();
  res.json({ success: true, data: data.characters[idx] });
});
router.delete("/sillytavern/characters/:id", (req, res) => {
  const data = store.getData();
  const idx = data.characters.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "\u89D2\u8272\u4E0D\u5B58\u5728" });
  data.characters.splice(idx, 1);
  store.save();
  res.json({ success: true, message: "\u89D2\u8272\u5DF2\u5220\u9664" });
});
router.get("/sillytavern/worldbooks", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.worldBooks });
});
router.get("/sillytavern/plugins", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.sillyTavernPlugins });
});
router.post("/sillytavern/plugins/:id/toggle", (req, res) => {
  const data = store.getData();
  const plugin = data.sillyTavernPlugins.find((p) => p.id === req.params.id);
  if (!plugin) return res.status(404).json({ success: false, error: "\u63D2\u4EF6\u4E0D\u5B58\u5728" });
  plugin.isEnabled = !plugin.isEnabled;
  store.save();
  res.json({ success: true, data: plugin });
});
router.get("/sillytavern/api-presets", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.apiPresets });
});
router.get("/astrbot/plugins", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.astrBotPlugins });
});
router.post("/astrbot/plugins/:id/toggle", (req, res) => {
  const data = store.getData();
  const plugin = data.astrBotPlugins.find((p) => p.id === req.params.id);
  if (!plugin) return res.status(404).json({ success: false, error: "\u63D2\u4EF6\u4E0D\u5B58\u5728" });
  plugin.isEnabled = !plugin.isEnabled;
  store.save();
  res.json({ success: true, data: plugin });
});
router.get("/astrbot/adapters", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.adapters });
});
router.get("/astrbot/config", (_req, res) => {
  const data = store.getData();
  res.json({
    success: true,
    data: {
      botName: "AstrBot",
      adminIds: [],
      defaultPlatform: "",
      enableWebSearch: false,
      maxContextLength: 4096,
      ...data.settings.astrBotConfig
    }
  });
});
router.put("/astrbot/config", (req, res) => {
  const data = store.getData();
  data.settings.astrBotConfig = req.body;
  store.save();
  res.json({ success: true, message: "\u914D\u7F6E\u5DF2\u66F4\u65B0", data: req.body });
});
router.get("/models", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.models });
});
router.post("/models/:id/load", (req, res) => {
  const data = store.getData();
  const model = data.models.find((m) => m.id === req.params.id);
  if (!model) return res.status(404).json({ success: false, error: "\u6A21\u578B\u4E0D\u5B58\u5728" });
  model.status = "loading";
  store.save();
  setTimeout(() => {
    model.status = "loaded";
    store.save();
  }, 3e3);
  res.json({ success: true, message: "\u6A21\u578B\u6B63\u5728\u52A0\u8F7D" });
});
router.post("/models/:id/unload", (req, res) => {
  const data = store.getData();
  const model = data.models.find((m) => m.id === req.params.id);
  if (!model) return res.status(404).json({ success: false, error: "\u6A21\u578B\u4E0D\u5B58\u5728" });
  model.status = "unloaded";
  store.save();
  res.json({ success: true, message: "\u6A21\u578B\u5DF2\u5378\u8F7D" });
});
router.get("/models/params", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.generationParams });
});
router.put("/models/params", (req, res) => {
  const data = store.getData();
  Object.assign(data.generationParams, req.body);
  store.save();
  res.json({ success: true, message: "\u53C2\u6570\u5DF2\u66F4\u65B0", data: data.generationParams });
});
router.post("/models/test", (_req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        response: "\u8FD9\u662F\u4E00\u6761\u6D4B\u8BD5\u56DE\u590D\u3002\u6A21\u578B\u8FDE\u63A5\u6B63\u5E38\uFF0C\u5DE5\u4F5C\u72B6\u6001\u826F\u597D\u3002"
      }
    });
  }, 1e3);
});
router.get("/settings", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.settings });
});
router.put("/settings", (req, res) => {
  const data = store.getData();
  Object.assign(data.settings, req.body);
  store.save();
  res.json({ success: true, message: "\u8BBE\u7F6E\u5DF2\u66F4\u65B0", data: data.settings });
});
router.get("/settings/tunnel", (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.settings.tunnel });
});
router.post("/settings/tunnel/start", (_req, res) => {
  const data = store.getData();
  data.settings.tunnel.status = "running";
  data.settings.tunnel.url = "https://random-id.frp.example.com";
  store.save();
  res.json({ success: true, message: "\u5185\u7F51\u7A7F\u900F\u5DF2\u542F\u52A8" });
});
router.post("/settings/tunnel/stop", (_req, res) => {
  const data = store.getData();
  data.settings.tunnel.status = "stopped";
  data.settings.tunnel.url = void 0;
  store.save();
  res.json({ success: true, message: "\u5185\u7F51\u7A7F\u900F\u5DF2\u505C\u6B62" });
});
router.post("/data/reset", (_req, res) => {
  store.reset();
  res.json({ success: true, message: "\u6570\u636E\u5DF2\u91CD\u7F6E" });
});
router.get("/data/export", (_req, res) => {
  const data = store.getData();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="ai-agent-data.json"');
  res.json(data);
});
var api_default = router;

// api/app.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", api_default);
app.use(
  "/api/health",
  (req, res, next) => {
    res.status(200).json({
      success: true,
      message: "ok"
    });
  }
);
app.use((error, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Server internal error"
  });
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API not found"
  });
});
var app_default = app;

// api/server.ts
var PORT = Number(process.env.PORT) || 3001;
var server = app_default.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
var server_default = app_default;
export {
  server_default as default
};
