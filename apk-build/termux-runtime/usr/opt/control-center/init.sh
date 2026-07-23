#!/bin/sh
# AI Agent 中控台 v7.1.0 - 初始化脚本
# 基于 Termux runtime，直接在 Android 上运行 Node.js

export HOME=/root
export PORT=3001
export TMPDIR=/tmp

echo "[Init] AI Agent 中控台 v7.1.0"
echo "[Init] Termux Runtime"
echo "[Init] Node.js $(node --version)"

# 启动中控台服务器
cd /opt/control-center
exec node server.js