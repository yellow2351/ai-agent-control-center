package com.aiagent.controlcenter;

import android.util.Log;

/**
 * nodejs-mobile JNI 桥接封装类
 * 加载 libnode.so 和 libnode-bridge.so，提供启动 Node.js 的接口
 */
public class NodeBridge {
    private static final String TAG = "NodeBridge";
    private static boolean librariesLoaded = false;
    private static String lastError = "";

    static {
        String failedLib = "";
        try {
            failedLib = "libc++_shared.so";
            System.loadLibrary("c++_shared");
            Log.d(TAG, "libc++_shared.so loaded OK");

            failedLib = "libnode.so";
            System.loadLibrary("node");
            Log.d(TAG, "libnode.so loaded OK");

            failedLib = "libnode-bridge.so";
            System.loadLibrary("node-bridge");
            Log.d(TAG, "libnode-bridge.so loaded OK");

            librariesLoaded = true;
            lastError = "";
        } catch (UnsatisfiedLinkError e) {
            lastError = "Failed to load " + failedLib + ": " + e.getMessage();
            Log.e(TAG, lastError, e);
            librariesLoaded = false;
        } catch (Exception e) {
            lastError = "Exception loading " + failedLib + ": " + e.toString();
            Log.e(TAG, lastError, e);
            librariesLoaded = false;
        }
    }

    public static boolean isLoaded() {
        return librariesLoaded;
    }

    public static String getLastError() {
        return lastError;
    }

    /**
     * 启动 Node.js 运行时
     * @param args 命令行参数数组（第一个元素应为 node 可执行路径或脚本路径）
     * @param nodePath NODE_PATH 环境变量值
     * @return Node.js 退出码
     */
    public static native int startNode(String[] args, String nodePath);
}
