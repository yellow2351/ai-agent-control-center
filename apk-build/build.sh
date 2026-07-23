#!/bin/bash
set -e

# ============================================================
# AI Agent 中控台 v7.0.0 - 构建脚本
# 架构: proot + Debian rootfs + Node.js + WebView
# 参考 SillyDroid: 内置独立 Linux 运行环境 + WebView 内核
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
JAVA_DIR="$SCRIPT_DIR/java"
ASSETS_DIR="$SCRIPT_DIR/assets"
RES_DIR="$SCRIPT_DIR/res"
MANIFEST="$SCRIPT_DIR/AndroidManifest.xml"
KEYSTORE="$SCRIPT_DIR/release.keystore"
KEY_PASS="password"
KEY_ALIAS="aiagent"

# Android SDK
SDK_DIR="/opt/android-sdk"
BUILD_TOOLS="$SDK_DIR/build-tools/34.0.0"
PLATFORM="$SDK_DIR/platforms/android-34/android.jar"

# 工具
AAPT2="$BUILD_TOOLS/aapt2"
D8="$BUILD_TOOLS/d8"
ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"

# 版本
VERSION="7.1.0"
VERSION_CODE="71"
APK_NAME="app-release-v${VERSION_CODE}.apk"

echo "========================================"
echo " AI Agent 中控台 v${VERSION} 构建"
echo " 架构: Termux Runtime + Node.js + WebView"
echo "========================================"

# 清理
rm -rf "$BUILD_DIR/d8out" "$BUILD_DIR/obj" "$BUILD_DIR/gen"
mkdir -p "$BUILD_DIR/d8out" "$BUILD_DIR/obj" "$BUILD_DIR/gen"

# ============================================================
# Step 1: 编译 Java 源码
# ============================================================
echo ""
echo "[1/5] 编译 Java 源码..."

# 收集所有 Java 文件
find "$JAVA_DIR" -name "*.java" > "$BUILD_DIR/java_sources.txt"

# 编译
javac \
    -source 11 -target 11 \
    -cp "$PLATFORM" \
    -d "$BUILD_DIR/obj" \
    @$BUILD_DIR/java_sources.txt

echo "  -> 编译完成"

# ============================================================
# Step 2: 生成 DEX
# ============================================================
echo ""
echo "[2/5] 生成 DEX..."

$D8 \
    --lib "$PLATFORM" \
    --output "$BUILD_DIR/d8out" \
    $(find "$BUILD_DIR/obj" -name "*.class")

echo "  -> DEX 生成完成"

# ============================================================
# Step 3: 打包 APK (aapt2)
# ============================================================
echo ""
echo "[3/5] 打包 APK..."

# 编译资源
$AAPT2 compile \
    --dir "$RES_DIR" \
    -o "$BUILD_DIR/gen/resources.zip" \
    2>/dev/null || true

# 链接资源 + 生成 base APK
$AAPT2 link \
    -I "$PLATFORM" \
    --manifest "$MANIFEST" \
    --java "$BUILD_DIR/gen" \
    -o "$BUILD_DIR/base.apk" \
    --auto-add-overlay \
    --version-code "$VERSION_CODE" \
    --version-name "$VERSION" \
    2>&1 || {
        # aapt2 link 资源编译失败时，用 aapt 备用
        echo "  -> aapt2 link 失败，尝试 aapt..."
        $BUILD_TOOLS/aapt package \
            -f -M "$MANIFEST" \
            -I "$PLATFORM" \
            -S "$RES_DIR" \
            -F "$BUILD_DIR/base.apk" \
            -J "$BUILD_DIR/gen" \
            --version-code "$VERSION_CODE" \
            --version-name "$VERSION" \
            --auto-add-overlay
    }

echo "  -> 基础 APK 已生成"

# ============================================================
# Step 4: 添加 DEX 和 Assets 到 APK
# ============================================================
echo ""
echo "[4/5] 添加 DEX 和 Assets..."

# 将 classes.dex 添加到 APK
cd "$BUILD_DIR/d8out"
$BUILD_TOOLS/aapt add "$BUILD_DIR/base.apk" classes.dex 2>/dev/null
cd "$SCRIPT_DIR"

# 添加 assets 文件到 APK
echo "  -> 添加 assets 文件..."
$BUILD_TOOLS/aapt add "$BUILD_DIR/base.apk" \
    assets/launcher.html \
    assets/runtime.tar.xz \
    2>/dev/null

# 添加 lib 目录（如果有）
if [ -d "$SCRIPT_DIR/lib" ]; then
    cd "$SCRIPT_DIR"
    $BUILD_TOOLS/aapt add "$BUILD_DIR/base.apk" lib/ 2>/dev/null || true
fi

# 添加 res 中的资源
$BUILD_TOOLS/aapt add "$BUILD_DIR/base.apk" res/ 2>/dev/null || true

echo "  -> DEX 和 Assets 已添加"

# ============================================================
# Step 5: 对齐 + 签名
# ============================================================
echo ""
echo "[5/5] 对齐和签名..."

# 对齐
$ZIPALIGN -p -f 4 "$BUILD_DIR/base.apk" "$BUILD_DIR/unsigned-aligned.apk"

# 签名
$APKSIGNER sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:"$KEY_PASS" \
    --ks-key-alias "$KEY_ALIAS" \
    --key-pass pass:"$KEY_PASS" \
    --out "$BUILD_DIR/$APK_NAME" \
    "$BUILD_DIR/unsigned-aligned.apk"

# 验证
$APKSIGNER verify --verbose "$BUILD_DIR/$APK_NAME"

echo ""
echo "========================================"
echo " 构建成功!"
echo " APK: $BUILD_DIR/$APK_NAME"
echo " 大小: $(du -h "$BUILD_DIR/$APK_NAME" | cut -f1)"
echo "========================================"