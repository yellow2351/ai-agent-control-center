"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var store_js_1 = require("../data/store.js");
var router = (0, express_1.Router)();
router.get('/services', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.services });
});
router.get('/services/:id', function (req, res) {
    var data = store_js_1.store.getData();
    var service = data.services.find(function (s) { return s.id === req.params.id; });
    if (!service)
        return res.status(404).json({ success: false, error: '服务不存在' });
    res.json({ success: true, data: service });
});
router.post('/services/:id/restart', function (req, res) {
    var data = store_js_1.store.getData();
    var service = data.services.find(function (s) { return s.id === req.params.id; });
    if (!service)
        return res.status(404).json({ success: false, error: '服务不存在' });
    service.status = 'loading';
    store_js_1.store.addLog(service.name, 'info', '服务正在重启...');
    store_js_1.store.save();
    setTimeout(function () {
        service.status = 'running';
        service.uptime = 0;
        service.cpuUsage = Math.random() * 30 + 5;
        service.memoryUsage = Math.random() * 500 + 200;
        store_js_1.store.addLog(service.name, 'info', '服务重启完成');
        store_js_1.store.save();
    }, 2000);
    res.json({ success: true, message: '服务正在重启' });
});
router.post('/services/:id/stop', function (req, res) {
    var data = store_js_1.store.getData();
    var service = data.services.find(function (s) { return s.id === req.params.id; });
    if (!service)
        return res.status(404).json({ success: false, error: '服务不存在' });
    service.status = 'stopped';
    service.cpuUsage = 0;
    service.memoryUsage = 0;
    service.uptime = 0;
    store_js_1.store.addLog(service.name, 'info', '服务已停止');
    store_js_1.store.save();
    res.json({ success: true, message: '服务已停止' });
});
router.post('/services/:id/start', function (req, res) {
    var data = store_js_1.store.getData();
    var service = data.services.find(function (s) { return s.id === req.params.id; });
    if (!service)
        return res.status(404).json({ success: false, error: '服务不存在' });
    service.status = 'loading';
    store_js_1.store.addLog(service.name, 'info', '服务正在启动...');
    store_js_1.store.save();
    setTimeout(function () {
        service.status = 'running';
        service.cpuUsage = Math.random() * 30 + 5;
        service.memoryUsage = Math.random() * 500 + 200;
        service.uptime = 0;
        store_js_1.store.addLog(service.name, 'info', '服务启动成功');
        store_js_1.store.save();
    }, 1500);
    res.json({ success: true, message: '服务正在启动' });
});
router.get('/services/:id/logs', function (req, res) {
    var data = store_js_1.store.getData();
    var service = data.services.find(function (s) { return s.id === req.params.id; });
    if (!service)
        return res.status(404).json({ success: false, error: '服务不存在' });
    var allLogs = store_js_1.store.getLogs();
    var logs = allLogs.filter(function (l) { return l.service === service.name; }).slice(0, 50);
    res.json({ success: true, data: { logs: logs } });
});
router.get('/system/resources', function (_req, res) {
    res.json({ success: true, data: store_js_1.store.getSystemResources() });
});
router.get('/sillytavern/characters', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.characters });
});
router.post('/sillytavern/characters', function (req, res) {
    var data = store_js_1.store.getData();
    var newChar = __assign(__assign({ id: 'char-' + Date.now() }, req.body), { createdAt: new Date().toISOString(), lastUsed: new Date().toISOString() });
    data.characters.push(newChar);
    store_js_1.store.save();
    res.json({ success: true, data: newChar });
});
router.put('/sillytavern/characters/:id', function (req, res) {
    var data = store_js_1.store.getData();
    var idx = data.characters.findIndex(function (c) { return c.id === req.params.id; });
    if (idx === -1)
        return res.status(404).json({ success: false, error: '角色不存在' });
    data.characters[idx] = __assign(__assign({}, data.characters[idx]), req.body);
    store_js_1.store.save();
    res.json({ success: true, data: data.characters[idx] });
});
router.delete('/sillytavern/characters/:id', function (req, res) {
    var data = store_js_1.store.getData();
    var idx = data.characters.findIndex(function (c) { return c.id === req.params.id; });
    if (idx === -1)
        return res.status(404).json({ success: false, error: '角色不存在' });
    data.characters.splice(idx, 1);
    store_js_1.store.save();
    res.json({ success: true, message: '角色已删除' });
});
router.get('/sillytavern/worldbooks', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.worldBooks });
});
router.get('/sillytavern/plugins', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.sillyTavernPlugins });
});
router.post('/sillytavern/plugins/:id/toggle', function (req, res) {
    var data = store_js_1.store.getData();
    var plugin = data.sillyTavernPlugins.find(function (p) { return p.id === req.params.id; });
    if (!plugin)
        return res.status(404).json({ success: false, error: '插件不存在' });
    plugin.isEnabled = !plugin.isEnabled;
    store_js_1.store.save();
    res.json({ success: true, data: plugin });
});
router.get('/sillytavern/api-presets', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.apiPresets });
});
router.get('/astrbot/plugins', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.astrBotPlugins });
});
router.post('/astrbot/plugins/:id/toggle', function (req, res) {
    var data = store_js_1.store.getData();
    var plugin = data.astrBotPlugins.find(function (p) { return p.id === req.params.id; });
    if (!plugin)
        return res.status(404).json({ success: false, error: '插件不存在' });
    plugin.isEnabled = !plugin.isEnabled;
    store_js_1.store.save();
    res.json({ success: true, data: plugin });
});
router.get('/astrbot/adapters', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.adapters });
});
router.get('/astrbot/config', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({
        success: true,
        data: __assign({ botName: 'AstrBot', adminIds: [], defaultPlatform: '', enableWebSearch: false, maxContextLength: 4096 }, data.settings.astrBotConfig),
    });
});
router.put('/astrbot/config', function (req, res) {
    var data = store_js_1.store.getData();
    data.settings.astrBotConfig = req.body;
    store_js_1.store.save();
    res.json({ success: true, message: '配置已更新', data: req.body });
});
router.get('/models', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.models });
});
router.post('/models/:id/load', function (req, res) {
    var data = store_js_1.store.getData();
    var model = data.models.find(function (m) { return m.id === req.params.id; });
    if (!model)
        return res.status(404).json({ success: false, error: '模型不存在' });
    model.status = 'loading';
    store_js_1.store.save();
    setTimeout(function () {
        model.status = 'loaded';
        store_js_1.store.save();
    }, 3000);
    res.json({ success: true, message: '模型正在加载' });
});
router.post('/models/:id/unload', function (req, res) {
    var data = store_js_1.store.getData();
    var model = data.models.find(function (m) { return m.id === req.params.id; });
    if (!model)
        return res.status(404).json({ success: false, error: '模型不存在' });
    model.status = 'unloaded';
    store_js_1.store.save();
    res.json({ success: true, message: '模型已卸载' });
});
router.get('/models/params', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.generationParams });
});
router.put('/models/params', function (req, res) {
    var data = store_js_1.store.getData();
    Object.assign(data.generationParams, req.body);
    store_js_1.store.save();
    res.json({ success: true, message: '参数已更新', data: data.generationParams });
});
router.post('/models/test', function (_req, res) {
    setTimeout(function () {
        res.json({
            success: true,
            data: {
                response: '这是一条测试回复。模型连接正常，工作状态良好。',
            },
        });
    }, 1000);
});
router.get('/settings', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.settings });
});
router.put('/settings', function (req, res) {
    var data = store_js_1.store.getData();
    Object.assign(data.settings, req.body);
    store_js_1.store.save();
    res.json({ success: true, message: '设置已更新', data: data.settings });
});
router.get('/settings/tunnel', function (_req, res) {
    var data = store_js_1.store.getData();
    res.json({ success: true, data: data.settings.tunnel });
});
router.post('/settings/tunnel/start', function (_req, res) {
    var data = store_js_1.store.getData();
    data.settings.tunnel.status = 'running';
    data.settings.tunnel.url = 'https://random-id.frp.example.com';
    store_js_1.store.save();
    res.json({ success: true, message: '内网穿透已启动' });
});
router.post('/settings/tunnel/stop', function (_req, res) {
    var data = store_js_1.store.getData();
    data.settings.tunnel.status = 'stopped';
    data.settings.tunnel.url = undefined;
    store_js_1.store.save();
    res.json({ success: true, message: '内网穿透已停止' });
});
router.post('/data/reset', function (_req, res) {
    store_js_1.store.reset();
    res.json({ success: true, message: '数据已重置' });
});
router.get('/data/export', function (_req, res) {
    var data = store_js_1.store.getData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-agent-data.json"');
    res.json(data);
});
exports.default = router;
