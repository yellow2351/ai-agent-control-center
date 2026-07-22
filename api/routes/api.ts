import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

router.get('/services', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.services });
});

router.get('/services/:id', (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: '服务不存在' });
  res.json({ success: true, data: service });
});

router.post('/services/:id/restart', (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: '服务不存在' });
  service.status = 'loading';
  store.addLog(service.name, 'info', '服务正在重启...');
  store.save();
  setTimeout(() => {
    service.status = 'running';
    service.uptime = 0;
    service.cpuUsage = Math.random() * 30 + 5;
    service.memoryUsage = Math.random() * 500 + 200;
    store.addLog(service.name, 'info', '服务重启完成');
    store.save();
  }, 2000);
  res.json({ success: true, message: '服务正在重启' });
});

router.post('/services/:id/stop', (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: '服务不存在' });
  service.status = 'stopped';
  service.cpuUsage = 0;
  service.memoryUsage = 0;
  service.uptime = 0;
  store.addLog(service.name, 'info', '服务已停止');
  store.save();
  res.json({ success: true, message: '服务已停止' });
});

router.post('/services/:id/start', (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: '服务不存在' });
  service.status = 'loading';
  store.addLog(service.name, 'info', '服务正在启动...');
  store.save();
  setTimeout(() => {
    service.status = 'running';
    service.cpuUsage = Math.random() * 30 + 5;
    service.memoryUsage = Math.random() * 500 + 200;
    service.uptime = 0;
    store.addLog(service.name, 'info', '服务启动成功');
    store.save();
  }, 1500);
  res.json({ success: true, message: '服务正在启动' });
});

router.get('/services/:id/logs', (req, res) => {
  const data = store.getData();
  const service = data.services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: '服务不存在' });
  const allLogs = store.getLogs();
  const logs = allLogs.filter((l) => l.service === service.name).slice(0, 50);
  res.json({ success: true, data: { logs } });
});

router.get('/system/resources', (_req, res) => {
  res.json({ success: true, data: store.getSystemResources() });
});

router.get('/sillytavern/characters', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.characters });
});

router.post('/sillytavern/characters', (req, res) => {
  const data = store.getData();
  const newChar = {
    id: 'char-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };
  data.characters.push(newChar);
  store.save();
  res.json({ success: true, data: newChar });
});

router.put('/sillytavern/characters/:id', (req, res) => {
  const data = store.getData();
  const idx = data.characters.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: '角色不存在' });
  data.characters[idx] = { ...data.characters[idx], ...req.body };
  store.save();
  res.json({ success: true, data: data.characters[idx] });
});

router.delete('/sillytavern/characters/:id', (req, res) => {
  const data = store.getData();
  const idx = data.characters.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: '角色不存在' });
  data.characters.splice(idx, 1);
  store.save();
  res.json({ success: true, message: '角色已删除' });
});

router.get('/sillytavern/worldbooks', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.worldBooks });
});

router.get('/sillytavern/plugins', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.sillyTavernPlugins });
});

router.post('/sillytavern/plugins/:id/toggle', (req, res) => {
  const data = store.getData();
  const plugin = data.sillyTavernPlugins.find((p) => p.id === req.params.id);
  if (!plugin) return res.status(404).json({ success: false, error: '插件不存在' });
  plugin.isEnabled = !plugin.isEnabled;
  store.save();
  res.json({ success: true, data: plugin });
});

router.get('/sillytavern/api-presets', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.apiPresets });
});

router.get('/astrbot/plugins', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.astrBotPlugins });
});

router.post('/astrbot/plugins/:id/toggle', (req, res) => {
  const data = store.getData();
  const plugin = data.astrBotPlugins.find((p) => p.id === req.params.id);
  if (!plugin) return res.status(404).json({ success: false, error: '插件不存在' });
  plugin.isEnabled = !plugin.isEnabled;
  store.save();
  res.json({ success: true, data: plugin });
});

router.get('/astrbot/adapters', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.adapters });
});

router.get('/astrbot/config', (_req, res) => {
  const data = store.getData();
  res.json({
    success: true,
    data: {
      botName: 'AstrBot',
      adminIds: [],
      defaultPlatform: '',
      enableWebSearch: false,
      maxContextLength: 4096,
      ...(data.settings as any).astrBotConfig,
    },
  });
});

router.put('/astrbot/config', (req, res) => {
  const data = store.getData();
  (data.settings as any).astrBotConfig = req.body;
  store.save();
  res.json({ success: true, message: '配置已更新', data: req.body });
});

router.get('/models', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.models });
});

router.post('/models/:id/load', (req, res) => {
  const data = store.getData();
  const model = data.models.find((m) => m.id === req.params.id);
  if (!model) return res.status(404).json({ success: false, error: '模型不存在' });
  model.status = 'loading';
  store.save();
  setTimeout(() => {
    model.status = 'loaded';
    store.save();
  }, 3000);
  res.json({ success: true, message: '模型正在加载' });
});

router.post('/models/:id/unload', (req, res) => {
  const data = store.getData();
  const model = data.models.find((m) => m.id === req.params.id);
  if (!model) return res.status(404).json({ success: false, error: '模型不存在' });
  model.status = 'unloaded';
  store.save();
  res.json({ success: true, message: '模型已卸载' });
});

router.get('/models/params', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.generationParams });
});

router.put('/models/params', (req, res) => {
  const data = store.getData();
  Object.assign(data.generationParams, req.body);
  store.save();
  res.json({ success: true, message: '参数已更新', data: data.generationParams });
});

router.post('/models/test', (_req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        response: '这是一条测试回复。模型连接正常，工作状态良好。',
      },
    });
  }, 1000);
});

router.get('/settings', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.settings });
});

router.put('/settings', (req, res) => {
  const data = store.getData();
  Object.assign(data.settings, req.body);
  store.save();
  res.json({ success: true, message: '设置已更新', data: data.settings });
});

router.get('/settings/tunnel', (_req, res) => {
  const data = store.getData();
  res.json({ success: true, data: data.settings.tunnel });
});

router.post('/settings/tunnel/start', (_req, res) => {
  const data = store.getData();
  data.settings.tunnel.status = 'running';
  (data.settings.tunnel as any).url = 'https://random-id.frp.example.com';
  store.save();
  res.json({ success: true, message: '内网穿透已启动' });
});

router.post('/settings/tunnel/stop', (_req, res) => {
  const data = store.getData();
  data.settings.tunnel.status = 'stopped';
  (data.settings.tunnel as any).url = undefined;
  store.save();
  res.json({ success: true, message: '内网穿透已停止' });
});

router.post('/data/reset', (_req, res) => {
  store.reset();
  res.json({ success: true, message: '数据已重置' });
});

router.get('/data/export', (_req, res) => {
  const data = store.getData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="ai-agent-data.json"');
  res.json(data);
});

export default router;
