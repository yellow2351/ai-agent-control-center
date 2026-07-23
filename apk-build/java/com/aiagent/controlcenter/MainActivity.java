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
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * AI Agent 中控台 - nodejs-mobile 集成版 (v5.0.0)
 *
 * 使用 nodejs-mobile 的 libnode.so 通过 JNI 在 App 进程内启动 Node.js
 * 完全避开 SELinux exec 限制，无需 chmod 权限
 */
public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";
    private static final int SERVER_PORT = 3001;
    private static final String APP_VERSION = "5.0.2";
    private static final String ASSETS_ZIP = "sillytavern.zip";

    private WebView webView;
    private Handler mainHandler;
    private Thread nodeThread;
    private long startTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startTime = System.currentTimeMillis();
        mainHandler = new Handler(Looper.getMainLooper());

        webView = new WebView(this);
        setContentView(webView);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setLoadWithOverviewMode(true);
        ws.setUseWideViewPort(true);
        ws.setCacheMode(WebSettings.LOAD_DEFAULT);
        ws.setDatabaseEnabled(true);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ws.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new MyWebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        showLoading();

        // 在后台线程初始化
        Thread initThread = new Thread(new InitRunnable());
        initThread.start();
    }

    private void showLoading() {
        String html = "<html><body style='background:#e0e5ec;display:flex;align-items:center;" +
            "justify-content:center;height:100vh;margin:0;font-family:system-ui'>" +
            "<div style='text-align:center;color:#333'>" +
            "<div style='font-size:20px;font-weight:600;margin-bottom:12px'>AI Agent 中控台</div>" +
            "<div style='font-size:14px;color:#666'>正在启动服务，请稍候...</div>" +
            "</div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    private void showError(String error) {
        String html = "<html><body style='background:#e0e5ec;margin:0;font-family:system-ui;padding:16px'>" +
            "<div style='color:#333'>" +
            "<div style='font-size:20px;font-weight:600;margin-bottom:12px;color:#dc2626'>启动失败</div>" +
            "<div style='font-size:14px;color:#666;white-space:pre-wrap;word-break:break-all'>" +
            escapeHtml(error) + "</div>" +
            "</div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private class MyWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }
    }

    private class InitRunnable implements Runnable {
        @Override
        public void run() {
            try {
                Log.i(TAG, "=== 初始化开始 ===");

                // 1. 检查 Native 库加载
                if (!NodeBridge.isLoaded()) {
                    throw new RuntimeException("Native libraries (libnode.so / libnode-bridge.so) failed to load");
                }
                Log.i(TAG, "Native libraries loaded OK");

                // 2. 解压 assets
                File projectDir = new File(getFilesDir(), "sillytavern");
                if (!isProjectExtracted(projectDir)) {
                    Log.i(TAG, "解压 assets 到 " + projectDir.getAbsolutePath());
                    extractAssets(ASSETS_ZIP, projectDir);
                    // 写入版本标记
                    File versionFile = new File(projectDir, ".version");
                    FileOutputStream fos = new FileOutputStream(versionFile);
                    fos.write(APP_VERSION.getBytes());
                    fos.close();
                    Log.i(TAG, "解压完成");
                } else {
                    Log.i(TAG, "assets 已是最新版本，跳过解压");
                }

                // 3. 查找启动脚本（wrapper.js 会设置正确的 cwd 和 env）
                File serverJs = new File(projectDir, "wrapper.js");
                if (!serverJs.exists()) {
                    serverJs = new File(projectDir, "server.cjs");
                }
                if (!serverJs.exists()) {
                    throw new RuntimeException("wrapper.js / server.cjs not found in extracted assets");
                }
                Log.i(TAG, "Server script: " + serverJs.getAbsolutePath());

                // 4. 构建启动参数
                final String serverPath = serverJs.getAbsolutePath();
                final String projectPath = projectDir.getAbsolutePath();
                final String nodeModulesPath = new File(projectDir, "node_modules").getAbsolutePath();

                // 5. 启动 Node.js（在独立线程中，因为 node::Start 会阻塞）
                nodeThread = new Thread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String[] args = new String[] {
                                "node",
                                serverPath
                            };

                            Log.i(TAG, "启动 Node.js...");
                            Log.i(TAG, "  args[0] = " + args[0]);
                            Log.i(TAG, "  args[1] = " + args[1]);
                            Log.i(TAG, "  NODE_PATH = " + nodeModulesPath);

                            int exitCode = NodeBridge.startNode(args, nodeModulesPath);
                            Log.w(TAG, "Node.js exited with code: " + exitCode);
                        } catch (Exception e) {
                            Log.e(TAG, "Node.js thread error: " + e.getMessage(), e);
                        }
                    }
                });
                nodeThread.start();

                // 6. 等待服务就绪
                Log.i(TAG, "等待服务端口就绪...");
                boolean ready = waitForPort(SERVER_PORT, 30);
                if (!ready) {
                    throw new RuntimeException("服务启动超时（30秒）");
                }

                long elapsed = System.currentTimeMillis() - startTime;
                Log.i(TAG, "=== 启动完成，耗时 " + elapsed + "ms ===");

                // 7. 加载前端
                mainHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        webView.loadUrl("http://127.0.0.1:" + SERVER_PORT + "/");
                    }
                });

            } catch (final Exception e) {
                Log.e(TAG, "初始化失败", e);
                mainHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this,
                            "启动失败: " + e.getMessage(), Toast.LENGTH_LONG).show();
                        showError(e.getMessage());
                    }
                });
            }
        }
    }

    /**
     * 检查项目是否已经解压且版本匹配
     */
    private boolean isProjectExtracted(File projectDir) {
        if (!projectDir.exists()) return false;
        File versionFile = new File(projectDir, ".version");
        if (!versionFile.exists()) return false;
        try {
            InputStream is = new java.io.FileInputStream(versionFile);
            byte[] buf = new byte[64];
            int n = is.read(buf);
            is.close();
            String version = new String(buf, 0, n).trim();
            return APP_VERSION.equals(version);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 从 assets 解压 zip 文件
     */
    private void extractAssets(String assetName, File destDir) throws IOException {
        if (!destDir.exists()) {
            destDir.mkdirs();
        }

        InputStream is = getAssets().open(assetName);
        ZipInputStream zis = new ZipInputStream(is);
        ZipEntry entry;
        byte[] buffer = new byte[8192];

        while ((entry = zis.getNextEntry()) != null) {
            String name = entry.getName();
            File outFile = new File(destDir, name);

            if (entry.isDirectory()) {
                outFile.mkdirs();
            } else {
                outFile.getParentFile().mkdirs();
                FileOutputStream fos = new FileOutputStream(outFile);
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
            }
            zis.closeEntry();
        }
        zis.close();
        is.close();
    }

    /**
     * 等待端口就绪
     */
    private boolean waitForPort(int port, int maxWaitSeconds) {
        for (int i = 0; i < maxWaitSeconds; i++) {
            try {
                java.net.Socket socket = new java.net.Socket();
                socket.connect(new java.net.InetSocketAddress("127.0.0.1", port), 500);
                socket.close();
                Thread.sleep(300);
                return true;
            } catch (IOException e) {
                // 端口未就绪
            } catch (InterruptedException e) {
                return false;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                return false;
            }
        }
        return false;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (nodeThread != null && nodeThread.isAlive()) {
            // 注意：无法优雅地停止 Node.js 线程，因为它在 native 代码中运行
            nodeThread.interrupt();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
