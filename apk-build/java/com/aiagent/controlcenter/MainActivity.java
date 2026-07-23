package com.aiagent.controlcenter;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;

/**
 * AI Agent 中控台 v7.1.0
 *
 * 架构：魔改 Termux Runtime 直接运行 Node.js，无需 proot
 * 参考 SillyDroid 思路：内置独立 Linux 运行环境 + WebView 内核
 * 零 JNI，零 .so 加载，零 proot 开销
 */
public class MainActivity extends Activity {
    private static final String TAG = "ControlCenter";
    private static final String APP_VERSION = "7.1.0";
    private static final int SERVER_PORT = 3001;

    private WebView webView;
    private File appDir;
    private File runtimeDir;
    private Process nodeProcess;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "=== AI Agent 中控台 v" + APP_VERSION + " 启动 ===");
        Log.i(TAG, "架构: Termux Runtime + Node.js + WebView（零 proot）");

        // 初始化 WebView
        webView = new WebView(this);
        setContentView(webView);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error: " + errorCode + " - " + description);
            }
        });

        // 立即加载启动页
        webView.loadUrl("file:///android_asset/launcher.html");

        // 后台启动 Termux Runtime
        appDir = getFilesDir();
        runtimeDir = new File(appDir, "termux-runtime");

        new Thread(this::startRuntime).start();
    }

    /**
     * 启动 Termux Runtime 环境
     */
    private void startRuntime() {
        try {
            // 1. 解压 runtime
            if (!isRuntimeReady()) {
                Log.i(TAG, "首次启动，解压 runtime.tar.xz...");
                extractRuntime();
                Log.i(TAG, "runtime 解压完成");
            } else {
                Log.i(TAG, "runtime 已就绪，跳过解压");
            }

            // 2. 确保必要目录和权限
            prepareRuntime();

            // 3. 启动 Node.js
            Log.i(TAG, "启动 Node.js 服务器...");
            startNodeServer();

        } catch (Exception e) {
            Log.e(TAG, "启动 Runtime 失败", e);
        }
    }

    /**
     * 检查 runtime 是否已解压
     */
    private boolean isRuntimeReady() {
        return runtimeDir.exists()
            && new File(runtimeDir, "bin/node").exists()
            && new File(runtimeDir, "opt/control-center/server.js").exists();
    }

    /**
     * 解压 runtime.tar.xz
     */
    private void extractRuntime() throws IOException {
        File archiveFile = new File(appDir, "runtime.tar.xz");
        Log.i(TAG, "复制 runtime.tar.xz 到内部存储...");
        copyAssetToFile("runtime.tar.xz", archiveFile);

        // 清理旧数据
        if (runtimeDir.exists()) {
            deleteRecursive(runtimeDir);
        }
        runtimeDir.mkdirs();

        // 使用系统 tar 解压
        Log.i(TAG, "解压 runtime.tar.xz（可能需要几分钟）...");
        try {
            Process p = new ProcessBuilder(
                "tar", "-xJf", archiveFile.getAbsolutePath(),
                "-C", runtimeDir.getAbsolutePath()
            ).redirectErrorStream(true).start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // 静默解压
            }
            int exitCode = p.waitFor();
            Log.i(TAG, "tar 解压完成，exitCode=" + exitCode);

            archiveFile.delete();
        } catch (Exception e) {
            Log.e(TAG, "tar 解压失败，尝试备用方案", e);
            extractRuntimeManual(archiveFile);
        }
    }

    /**
     * 备用解压方案
     */
    private void extractRuntimeManual(File archiveFile) throws IOException {
        try {
            Process p = new ProcessBuilder(
                "xz", "-d", "-k", archiveFile.getAbsolutePath()
            ).directory(appDir).redirectErrorStream(true).start();
            p.waitFor();

            File tarFile = new File(appDir, "runtime.tar");
            if (tarFile.exists()) {
                Process p2 = new ProcessBuilder(
                    "tar", "-xf", tarFile.getAbsolutePath(),
                    "-C", runtimeDir.getAbsolutePath()
                ).redirectErrorStream(true).start();
                p2.waitFor();
                tarFile.delete();
            }
        } catch (Exception e2) {
            Log.e(TAG, "备用解压也失败", e2);
        }
        archiveFile.delete();
    }

    /**
     * 准备 runtime 环境
     */
    private void prepareRuntime() {
        // 确保必要目录
        ensureDir(new File(runtimeDir, "tmp"));
        ensureDir(new File(runtimeDir, "root"));

        // 设置 node 可执行权限
        File nodeBin = new File(runtimeDir, "bin/node");
        if (nodeBin.exists()) {
            nodeBin.setExecutable(true, false);
        }

        // 设置 init.sh 可执行权限
        File initScript = new File(runtimeDir, "opt/control-center/init.sh");
        if (initScript.exists()) {
            initScript.setExecutable(true, false);
        }

        Log.i(TAG, "runtime 环境准备完成");
    }

    /**
     * 直接启动 Node.js 服务器（无需 proot）
     *
     * Termux 的二进制使用 Android 原生 linker (/system/bin/linker64)，
     * 可以直接通过 Runtime.exec() 运行，无需任何虚拟化。
     */
    private void startNodeServer() {
        try {
            String nodePath = new File(runtimeDir, "bin/node").getAbsolutePath();
            String serverPath = new File(runtimeDir, "opt/control-center/server.js").getAbsolutePath();
            String libPath = new File(runtimeDir, "lib").getAbsolutePath();
            String binPath = new File(runtimeDir, "bin").getAbsolutePath();
            String homePath = new File(runtimeDir, "root").getAbsolutePath();
            String tmpPath = new File(runtimeDir, "tmp").getAbsolutePath();

            ProcessBuilder pb = new ProcessBuilder(
                nodePath, serverPath
            );
            pb.directory(runtimeDir);

            // 设置 Termux Runtime 环境变量
            Map<String, String> env = pb.environment();
            env.put("LD_LIBRARY_PATH", libPath);
            env.put("PATH", binPath + ":/system/bin:/system/xbin");
            env.put("HOME", homePath);
            env.put("TMPDIR", tmpPath);
            env.put("PORT", String.valueOf(SERVER_PORT));
            env.put("PREFIX", runtimeDir.getAbsolutePath());
            env.put("TERMUX", "true");
            env.put("TMP", tmpPath);
            env.put("TERM", "xterm-256color");

            pb.redirectErrorStream(true);

            Log.i(TAG, "启动 Node.js: " + nodePath + " " + serverPath);
            Log.i(TAG, "LD_LIBRARY_PATH=" + libPath);

            nodeProcess = pb.start();

            // 读取 Node.js 输出
            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(nodeProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        Log.i(TAG, "[Node] " + line);
                    }
                } catch (IOException e) {
                    Log.e(TAG, "读取 Node.js 输出失败", e);
                }
            }).start();

            // 监控进程
            new Thread(() -> {
                try {
                    int exitCode = nodeProcess.waitFor();
                    Log.e(TAG, "Node.js 进程退出，exitCode=" + exitCode);
                } catch (InterruptedException e) {
                    Log.e(TAG, "Node.js 等待被中断", e);
                }
            }).start();

            Log.i(TAG, "Node.js 进程已启动");

        } catch (Exception e) {
            Log.e(TAG, "Node.js 启动失败", e);
        }
    }

    /**
     * 从 assets 复制文件到内部存储
     */
    private void copyAssetToFile(String assetName, File destFile) throws IOException {
        try (InputStream is = getAssets().open(assetName);
             OutputStream os = new FileOutputStream(destFile)) {
            byte[] buf = new byte[65536];
            int len;
            while ((len = is.read(buf)) > 0) {
                os.write(buf, 0, len);
            }
        }
    }

    private void ensureDir(File dir) {
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    private void deleteRecursive(File file) {
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursive(child);
                }
            }
        }
        file.delete();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (nodeProcess != null) {
            nodeProcess.destroy();
        }
        Log.i(TAG, "应用关闭");
    }
}