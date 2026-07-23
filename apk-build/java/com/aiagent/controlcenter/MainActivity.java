package com.aiagent.controlcenter;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private Process nodeProcess;
    private File prefixDir;
    private File dataDir;
    private Handler mainHandler;
    private StringBuilder debugLog;
    private static final int SERVER_PORT = 3001;
    private static final String BOOTSTRAP_ASSET = "bootstrap-aarch64.zip";
    private static final String SERVER_FILE = "server.cjs";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prefixDir = new File(getFilesDir(), "usr");
        dataDir = new File(getFilesDir(), "app-data");
        mainHandler = new Handler(Looper.getMainLooper());
        debugLog = new StringBuilder();

        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setDatabaseEnabled(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new MyWebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        showLoading();
        Thread t = new Thread(new InitRunnable());
        t.start();
    }

    private void log(String msg) {
        debugLog.append(msg).append("\n");
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
                log("开始初始化...");
                log("filesDir: " + getFilesDir().getAbsolutePath());
                log("prefixDir: " + prefixDir.getAbsolutePath());

                if (!isBootstrapInstalled()) {
                    log("Bootstrap 未安装，开始解压...");
                    installBootstrap();
                    log("Bootstrap 解压完成");
                } else {
                    log("Bootstrap 已安装");
                }

                log("开始修复权限...");
                fixPermissions();
                log("权限修复完成");

                File nodeBin = new File(prefixDir, "bin/node");
                log("node 文件存在: " + nodeBin.exists());
                log("node 可执行: " + nodeBin.canExecute());
                log("node 可读: " + nodeBin.canRead());
                log("node 路径: " + nodeBin.getAbsolutePath());

                copyServerFile();
                log("服务文件已复制");

                startNodeServer();
                log("Node 服务已启动");

                waitForServer();
                log("服务端口已就绪");

                mainHandler.post(new LoadUrlRunnable());
            } catch (Exception e) {
                log("错误: " + e.getMessage());
                String fullError = e.getMessage() + "\n\n--- 调试日志 ---\n" + debugLog.toString();
                mainHandler.post(new ErrorRunnable(fullError));
            }
        }
    }

    private class LoadUrlRunnable implements Runnable {
        @Override
        public void run() {
            webView.loadUrl("http://127.0.0.1:" + SERVER_PORT + "/");
        }
    }

    private class ErrorRunnable implements Runnable {
        private String error;
        ErrorRunnable(String error) { this.error = error; }
        @Override
        public void run() {
            Toast.makeText(MainActivity.this,
                "启动失败: " + error,
                Toast.LENGTH_LONG).show();
            showLoadingError(error);
        }
    }

    private void showLoading() {
        String html = "<html><body style='background:#e0e5ec;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui'>" +
            "<div style='text-align:center;color:#333'>" +
            "<div style='font-size:20px;font-weight:600;margin-bottom:12px'>AI Agent 中控台</div>" +
            "<div style='font-size:14px;color:#666'>正在启动服务，请稍候...</div>" +
            "</div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    private void showLoadingError(String error) {
        String html = "<html><body style='background:#e0e5ec;margin:0;font-family:system-ui;padding:16px'>" +
            "<div style='color:#333'>" +
            "<div style='font-size:20px;font-weight:600;margin-bottom:12px;color:#dc2626'>启动失败</div>" +
            "<div style='font-size:14px;color:#666;white-space:pre-wrap;word-break:break-all'>" + escapeHtml(error) + "</div>" +
            "</div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private boolean isBootstrapInstalled() {
        File nodeBin = new File(prefixDir, "bin/node");
        return nodeBin.exists() && nodeBin.canExecute();
    }

    private void installBootstrap() throws IOException {
        InputStream is = getAssets().open(BOOTSTRAP_ASSET);
        ZipInputStream zis = new ZipInputStream(is);
        ZipEntry entry;

        byte[] buffer = new byte[8192];

        while ((entry = zis.getNextEntry()) != null) {
            String name = entry.getName();
            if (name.equals("SYMLINKS.txt")) {
                continue;
            }

            File outFile = new File(prefixDir, name);
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

        createSymlinks();
    }

    private void fixPermissions() {
        String chmodPath = "/system/bin/chmod";

        File binDir = new File(prefixDir, "bin");
        if (binDir.exists()) {
            try {
                Process p = Runtime.getRuntime().exec(
                    new String[]{chmodPath, "-R", "755", binDir.getAbsolutePath()});
                p.waitFor();
                log("chmod bin 结果: " + p.exitValue());
            } catch (Exception e) {
                log("chmod bin 失败: " + e.getMessage());
            }
        }

        File libDir = new File(prefixDir, "lib");
        if (libDir.exists()) {
            try {
                Process p = Runtime.getRuntime().exec(
                    new String[]{chmodPath, "-R", "755", libDir.getAbsolutePath()});
                p.waitFor();
                log("chmod lib 结果: " + p.exitValue());
            } catch (Exception e) {
                log("chmod lib 失败: " + e.getMessage());
            }
        }

        File tmpDir = new File(prefixDir, "tmp");
        if (!tmpDir.exists()) {
            tmpDir.mkdirs();
        }
        try {
            Process p = Runtime.getRuntime().exec(
                new String[]{chmodPath, "777", tmpDir.getAbsolutePath()});
            p.waitFor();
            log("chmod tmp 结果: " + p.exitValue());
        } catch (Exception e) {
            log("chmod tmp 失败: " + e.getMessage());
        }

        File nodeBin = new File(prefixDir, "bin/node");
        if (nodeBin.exists()) {
            boolean execOk = nodeBin.canExecute();
            log("node canExecute: " + execOk);
            if (!execOk) {
                try {
                    Process p = Runtime.getRuntime().exec(
                        new String[]{chmodPath, "755", nodeBin.getAbsolutePath()});
                    p.waitFor();
                    log("chmod node 结果: " + p.exitValue());
                } catch (Exception e) {
                    log("chmod node 失败: " + e.getMessage());
                }
                log("node canExecute 再次检查: " + nodeBin.canExecute());
            }
        }
    }

    private void createSymlinks() {
        File symlinksFile = new File(prefixDir, "SYMLINKS.txt");
        if (!symlinksFile.exists()) return;

        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(symlinksFile));
            String line;
            while ((line = reader.readLine()) != null) {
                int arrowIdx = line.indexOf("\u2190");
                if (arrowIdx < 0) continue;
                String target = line.substring(0, arrowIdx);
                String source = line.substring(arrowIdx + 1);

                if (target.startsWith("/data/data/com.termux/files/usr/")) {
                    target = target.substring("/data/data/com.termux/files/usr/".length());
                }

                File targetFile = new File(prefixDir, target);
                File sourceFile = new File(prefixDir, source);
                if (!targetFile.exists() && sourceFile.exists()) {
                    try {
                        ProcessBuilder pb = new ProcessBuilder("ln", "-s",
                            sourceFile.getAbsolutePath(), targetFile.getAbsolutePath());
                        pb.start().waitFor();
                    } catch (Exception e) {
                    }
                }
            }
        } catch (IOException e) {
        } finally {
            if (reader != null) {
                try { reader.close(); } catch (IOException e) {}
            }
        }
    }

    private void copyServerFile() throws IOException {
        File serverFile = new File(getFilesDir(), SERVER_FILE);
        if (serverFile.exists()) {
            serverFile.delete();
        }

        InputStream is = getAssets().open(SERVER_FILE);
        FileOutputStream fos = new FileOutputStream(serverFile);
        byte[] buffer = new byte[8192];
        int len;
        while ((len = is.read(buffer)) > 0) {
            fos.write(buffer, 0, len);
        }
        fos.close();
        is.close();
    }

    private void startNodeServer() throws IOException {
        File nodeBin = new File(prefixDir, "bin/node");
        File serverFile = new File(getFilesDir(), SERVER_FILE);

        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        List<String> command = new ArrayList<String>();
        command.add(nodeBin.getAbsolutePath());
        command.add(serverFile.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(command);
        Map<String, String> env = pb.environment();
        env.put("PATH", prefixDir.getAbsolutePath() + "/bin");
        env.put("PREFIX", prefixDir.getAbsolutePath());
        env.put("LD_LIBRARY_PATH", prefixDir.getAbsolutePath() + "/lib");
        env.put("HOME", getFilesDir().getAbsolutePath());
        env.put("TMPDIR", new File(prefixDir, "tmp").getAbsolutePath());
        env.put("DATA_DIR", dataDir.getAbsolutePath());
        env.put("PUBLIC_DIR", "");
        env.put("PORT", String.valueOf(SERVER_PORT));

        pb.directory(getFilesDir());

        try {
            nodeProcess = pb.start();
        } catch (IOException e) {
            String extra = "启动失败详情: " + e.getMessage() +
                "\nnode路径: " + nodeBin.getAbsolutePath() +
                "\nnode存在: " + nodeBin.exists() +
                "\nnode可执行: " + nodeBin.canExecute() +
                "\n工作目录: " + getFilesDir().getAbsolutePath() +
                "\n\n环境变量:" +
                "\nPATH=" + env.get("PATH") +
                "\nLD_LIBRARY_PATH=" + env.get("LD_LIBRARY_PATH");
            throw new IOException(extra, e);
        }

        InputStream stdout = nodeProcess.getInputStream();
        InputStream stderr = nodeProcess.getErrorStream();

        Thread outThread = new Thread(new StreamReader(stdout, false));
        outThread.start();

        Thread errThread = new Thread(new StreamReader(stderr, true));
        errThread.start();
    }

    private class StreamReader implements Runnable {
        private InputStream is;
        private boolean isError;
        StreamReader(InputStream is, boolean isError) {
            this.is = is;
            this.isError = isError;
        }
        @Override
        public void run() {
            try {
                byte[] buf = new byte[1024];
                while (true) {
                    int n = is.read(buf);
                    if (n <= 0) break;
                }
            } catch (IOException e) {}
        }
    }

    private void waitForServer() throws InterruptedException {
        int maxWait = 30;
        for (int i = 0; i < maxWait; i++) {
            try {
                java.net.Socket socket = new java.net.Socket();
                socket.connect(new java.net.InetSocketAddress("127.0.0.1", SERVER_PORT), 500);
                socket.close();
                Thread.sleep(500);
                return;
            } catch (IOException e) {
                Thread.sleep(1000);
            }
        }
        throw new InterruptedException("服务启动超时");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (nodeProcess != null) {
            nodeProcess.destroy();
            try {
                nodeProcess.waitFor();
            } catch (InterruptedException e) {
            }
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
