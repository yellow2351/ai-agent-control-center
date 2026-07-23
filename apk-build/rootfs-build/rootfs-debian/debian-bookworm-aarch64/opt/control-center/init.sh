#!/bin/sh
# AI Agent 中控台 v7.0.0 - 初始化脚本
# 由 proot 启动时执行

export PATH=/usr/local/bin:/usr/bin:/bin
export HOME=/root
export PORT=3001

echo "[Init] AI Agent 中控台 v7.0.0"
echo "[Init] Node.js $(node --version)"

# 启动中控台服务器
cd /opt/control-center
exec node server.js