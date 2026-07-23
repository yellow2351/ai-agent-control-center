const path = require('path');

// 获取项目目录（wrapper.js 所在目录）
const projectDir = __dirname;

// 切换到项目目录，确保 process.cwd() 正确
process.chdir(projectDir);

// 显式设置数据目录和静态资源目录
process.env.DATA_DIR = path.join(projectDir, 'data');
process.env.PUBLIC_DIR = path.join(projectDir, 'public');

// 启动真实服务器
require('./server.cjs');
