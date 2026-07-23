/**
 * AI Agent 中控台 v7.0.0
 * 运行在 proot Debian 环境中的 Node.js 服务器
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const PORT = process.env.PORT || 3001;
const WWW = path.join(__dirname, 'www');
const START_TIME = Date.now();

// ===== 服务配置 =====
const SERVICES = {
  sillytavern: { name: 'SillyTavern', port: 8000, dir: '/opt/sillytavern', cmd: 'node', args: ['server.js'] },
  astrbot:    { name: 'AstrBot',     port: 6185, dir: '/opt/astrbot',    cmd: 'node', args: ['app.js'] },
};

// ===== MIME 类型 =====
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ===== 工具函数 =====
function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveFile(res, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Content-Length': data.length,
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, '127.0.0.1');
  });
}

// ===== 服务状态 =====
let serviceProcesses = {};

async function getServiceStatus(id) {
  const svc = SERVICES[id];
  if (!svc) return null;
  const running = await checkPort(svc.port);
  return {
    id,
    name: svc.name,
    port: svc.port,
    status: running ? 'running' : 'stopped',
  };
}

function startService(id) {
  const svc = SERVICES[id];
  if (!svc) return false;
  if (serviceProcesses[id]) return true;
  try {
    if (!fs.existsSync(svc.dir)) {
      console.log(`[Service] ${svc.name} 目录不存在: ${svc.dir}`);
      return false;
    }
    const proc = spawn(svc.cmd, svc.args, {
      cwd: svc.dir,
      env: { ...process.env, PORT: String(svc.port) },
      stdio: 'ignore',
      detached: true,
    });
    proc.unref();
    serviceProcesses[id] = proc;
    console.log(`[Service] ${svc.name} 已启动 (PID: ${proc.pid})`);
    return true;
  } catch (e) {
    console.error(`[Service] ${svc.name} 启动失败:`, e.message);
    return false;
  }
}

function stopService(id) {
  const proc = serviceProcesses[id];
  if (proc) {
    try { proc.kill('SIGTERM'); } catch (e) {}
    delete serviceProcesses[id];
    console.log(`[Service] ${SERVICES[id]?.name || id} 已停止`);
    return true;
  }
  return false;
}

// ===== HTTP 服务器 =====
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' });
    return res.end();
  }

  // API 路由
  if (pathname === '/api/health') {
    return json(res, 200, { success: true, message: 'ok', uptime: Math.floor((Date.now() - START_TIME) / 1000) });
  }

  if (pathname === '/api/status') {
    const statuses = {};
    for (const id of Object.keys(SERVICES)) {
      statuses[id] = await getServiceStatus(id);
    }
    return json(res, 200, {
      success: true,
      data: {
        services: statuses,
        platform: 'proot-debian',
        nodeVersion: process.version,
        uptime: Math.floor((Date.now() - START_TIME) / 1000),
        memory: process.memoryUsage(),
      },
    });
  }

  // 服务启动/停止
  const svcMatch = pathname.match(/^\/api\/service\/(\w+)\/(start|stop)$/);
  if (svcMatch && req.method === 'POST') {
    const [, id, action] = svcMatch;
    if (action === 'start') {
      const ok = startService(id);
      return json(res, ok ? 200 : 500, { success: ok, message: ok ? 'started' : 'failed' });
    } else {
      const ok = stopService(id);
      return json(res, 200, { success: ok, message: 'stopped' });
    }
  }

  // 静态文件
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(WWW, pathname);
  serveFile(res, filePath);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[ControlCenter] v7.0.0 已启动 http://127.0.0.1:${PORT}/`);
  console.log(`[ControlCenter] Node.js ${process.version}`);
});