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

/**
 * AI Agent 中控台 v7.0.0
 *
 * 架构参考 SillyDroid：内置独立 Linux 运行环境 + WebView 内核
 * 使用 proot 启动 Debian rootfs，在其中运行 Node.js 控制中心服务器
 * 零 JNI，零 .so 加载，完全避免 Native 库兼容性问题
 */
public class MainActivity extends Activity {
    private static final String TAG = "ControlCenter";
    private static final String APP_VERSION = "7.0.0";
    private static final int SERVER_PORT = 3001;
    private static final int MAX_STARTUP_WAIT = 60; // 最多等 60 秒

    private WebView webView;
    private Handler handler = new Handler(Looper.getMainLooper());
    private boolean prootStarted = false;
    private File appDir;
    private File rootfsDir;
    private File prootBin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "=== AI Agent 中控台 v" + APP_VERSION + " 启动 ===");
        Log.i(TAG, "架构: proot + Debian rootfs + Node.js + WebView");

        // 初始化 WebView
        webView = new WebView(this);
        setContentView(webView);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);
        ws.setAllowContentAccess(true);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error: " + errorCode + " - " + description);
            }
        });

        // 立即加载启动页（轮询等待后端就绪）
        webView.loadUrl("file:///android_asset/launcher.html");

        // 后台启动 proot 环境
        appDir = getFilesDir();
        rootfsDir = new File(appDir, "debian-rootfs");
        prootBin = new File(appDir, "proot");

        new Thread(this::startProotEnvironment).start();
    }

    /**
     * 启动 proot + Debian 环境
     */
    private void startProotEnvironment() {
        try {
            // 1. 解压 rootfs
            if (!isRootfsReady()) {
                Log.i(TAG, "首次启动，解压 rootfs.tar.xz...");
                extractRootfs();
                Log.i(TAG, "rootfs 解压完成");
            } else {
                Log.i(TAG, "rootfs 已就绪，跳过解压");
            }

            // 2. 准备 proot 二进制
            if (!prepareProotBinary()) {
                Log.e(TAG, "proot 二进制准备失败");
                return;
            }

            // 3. 准备 init.sh
            prepareInitScript();

            // 4. 启动 proot
            Log.i(TAG, "启动 proot 环境...");
            startProot();

        } catch (Exception e) {
            Log.e(TAG, "启动 proot 环境失败", e);
        }
    }

    /**
     * 检查 rootfs 是否已解压
     */
    private boolean isRootfsReady() {
        return rootfsDir.exists()
            && new File(rootfsDir, "bin").exists()
            && new File(rootfsDir, "usr/local/bin/node").exists()
            && new File(rootfsDir, "opt/control-center/server.js").exists();
    }

    /**
     * 解压 rootfs.tar.xz 到应用数据目录
     * 使用 tar 命令解压 xz 压缩包（Android 系统自带 tar）
     */
    private void extractRootfs() throws IOException {
        // 复制 rootfs.tar.xz 到内部存储
        File archiveFile = new File(appDir, "rootfs.tar.xz");
        Log.i(TAG, "复制 rootfs.tar.xz 到内部存储...");
        copyAssetToFile("rootfs.tar.xz", archiveFile);

        // 清理旧数据
        if (rootfsDir.exists()) {
            deleteRecursive(rootfsDir);
        }
        rootfsDir.mkdirs();

        // 使用系统 tar 解压
        Log.i(TAG, "解压 rootfs.tar.xz（过程可能需要几分钟）...");
        try {
            Process p = new ProcessBuilder(
                "tar", "-xJf", archiveFile.getAbsolutePath(),
                "-C", rootfsDir.getAbsolutePath()
            ).redirectErrorStream(true).start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                // 静默解压，tar 通常不输出
            }
            int exitCode = p.waitFor();
            Log.i(TAG, "tar 解压完成，exitCode=" + exitCode);

            // 删除压缩包节省空间
            archiveFile.delete();

        } catch (Exception e) {
            Log.e(TAG, "tar 解压失败，尝试备用方案", e);
            // 备用方案：使用 Java 手动解压 xz + tar
            extractRootfsManual(archiveFile);
        }
    }

    /**
     * 备用方案：Java 手动解压（如果系统 tar 不支持 -J）
     */
    private void extractRootfsManual(File archiveFile) throws IOException {
        Log.i(TAG, "使用 Java 解压 rootfs.tar.xz...");
        // 先解压 xz 再用 tar 解包
        try {
            // 先尝试用 xz 解压
            Process p = new ProcessBuilder(
                "xz", "-d", "-k", archiveFile.getAbsolutePath()
            ).directory(appDir).redirectErrorStream(true).start();
            p.waitFor();

            File tarFile = new File(appDir, "rootfs.tar");
            if (tarFile.exists()) {
                Process p2 = new ProcessBuilder(
                    "tar", "-xf", tarFile.getAbsolutePath(),
                    "-C", rootfsDir.getAbsolutePath()
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
     * 准备 proot 二进制文件
     */
    private boolean prepareProotBinary() {
        try {
            if (!prootBin.exists() || prootBin.length() == 0) {
                Log.i(TAG, "复制 proot 二进制...");
                copyAssetToFile("proot-aarch64", prootBin);
            }

            // 设置可执行权限
            prootBin.setExecutable(true, false);
            prootBin.setReadable(true, false);

            Log.i(TAG, "proot 就绪: " + prootBin.getAbsolutePath()
                + " (" + prootBin.length() + " bytes)");
            return true;
        } catch (Exception e) {
            Log.e(TAG, "proot 准备失败", e);
            return false;
        }
    }

    /**
     * 准备 init.sh 启动脚本
     */
    private void prepareInitScript() {
        File initScript = new File(rootfsDir, "opt/control-center/init.sh");
        if (initScript.exists()) {
            initScript.setExecutable(true, false);
            Log.i(TAG, "init.sh 已就绪");
        } else {
            Log.w(TAG, "init.sh 不存在，请检查 rootfs 打包");
        }
    }

    /**
     * 启动 proot 进程
     * proot -r <rootfs> -b /dev -b /proc -b /sys -b /data /opt/control-center/init.sh
     */
    private void startProot() {
        try {
            // 确保 rootfs 中有必要的目录
            ensureDir(new File(rootfsDir, "dev"));
            ensureDir(new File(rootfsDir, "proc"));
            ensureDir(new File(rootfsDir, "sys"));
            ensureDir(new File(rootfsDir, "tmp"));
            ensureDir(new File(rootfsDir, "data"));

            String[] cmd = {
                prootBin.getAbsolutePath(),
                "-r", rootfsDir.getAbsolutePath(),
                "-b", "/dev",
                "-b", "/proc",
                "-b", "/sys",
                "-b", "/data/local/tmp:/tmp",
                "-0",                          // 模拟 root 用户
                "-v", "-1",                    // 静默模式
                "/opt/control-center/init.sh"
            };

            Log.i(TAG, "执行 proot: " + String.join(" ", cmd));

            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.environment().put("PATH", "/usr/local/bin:/usr/bin:/bin");
            pb.environment().put("HOME", "/root");
            pb.environment().put("PORT", String.valueOf(SERVER_PORT));
            pb.environment().put("TMPDIR", "/tmp");
            pb.redirectErrorStream(true);

            Process prootProcess = pb.start();

            // 读取 proot 输出
            new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(prootProcess.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        Log.i(TAG, "[proot] " + line);
                        // 检测到 Node.js 启动成功
                        if (line.contains("已启动") || line.contains("listening")) {
                            prootStarted = true;
                        }
                    }
                } catch (IOException e) {
                    Log.e(TAG, "读取 proot 输出失败", e);
                }
            }).start();

            // 监控 proot 进程
            new Thread(() -> {
                try {
                    int exitCode = prootProcess.waitFor();
                    Log.e(TAG, "proot 进程退出，exitCode=" + exitCode);
                    prootStarted = false;
                } catch (InterruptedException e) {
                    Log.e(TAG, "proot 等待被中断", e);
                }
            }).start();

            Log.i(TAG, "proot 进程已启动");

        } catch (Exception e) {
            Log.e(TAG, "proot 启动失败", e);
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

    /**
     * 确保目录存在
     */
    private void ensureDir(File dir) {
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    /**
     * 递归删除目录
     */
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
        Log.i(TAG, "应用关闭");
        // proot 子进程会随应用进程结束而终止
    }
}