#include <jni.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <dlfcn.h>
#include <android/log.h>

#define APPNAME "NodeBridge"

extern "C" {

JNIEXPORT jint JNICALL
Java_com_aiagent_controlcenter_NodeBridge_startNode(
        JNIEnv* env,
        jclass /* clazz */,
        jobjectArray arguments,
        jstring modulesPath) {

    // 设置 NODE_PATH
    if (modulesPath != NULL) {
        const char* path = env->GetStringUTFChars(modulesPath, 0);
        setenv("NODE_PATH", path, 1);
        env->ReleaseStringUTFChars(modulesPath, path);
    }

    // 获取参数数量
    jsize argc = env->GetArrayLength(arguments);

    // 计算所有参数需要的内存大小
    int totalSize = 0;
    for (int i = 0; i < argc; i++) {
        jstring jstr = (jstring) env->GetObjectArrayElement(arguments, i);
        const char* str = env->GetStringUTFChars(jstr, 0);
        totalSize += strlen(str) + 1;
        env->ReleaseStringUTFChars(jstr, str);
    }

    // 分配连续内存
    char* argsBuffer = (char*) calloc(totalSize, sizeof(char));
    char** argv = (char**) calloc(argc, sizeof(char*));

    // 填充参数
    char* pos = argsBuffer;
    for (int i = 0; i < argc; i++) {
        jstring jstr = (jstring) env->GetObjectArrayElement(arguments, i);
        const char* str = env->GetStringUTFChars(jstr, 0);
        strcpy(pos, str);
        argv[i] = pos;
        pos += strlen(str) + 1;
        env->ReleaseStringUTFChars(jstr, str);
    }

    // 用 dlsym 查找 node::Start 符号
    void* handle = dlopen("libnode.so", RTLD_NOW | RTLD_GLOBAL);
    if (!handle) {
        __android_log_print(ANDROID_LOG_ERROR, APPNAME, "dlopen libnode.so failed: %s", dlerror());
        return -1;
    }

    // 尝试查找 mangled 名称
    typedef int (*NodeStartFunc)(int, char**);
    NodeStartFunc nodeStart = (NodeStartFunc) dlsym(handle, "_ZN4node5StartEiPPc");
    
    if (!nodeStart) {
        __android_log_print(ANDROID_LOG_ERROR, APPNAME, "dlsym node::Start failed: %s", dlerror());
        dlclose(handle);
        return -1;
    }

    __android_log_print(ANDROID_LOG_INFO, APPNAME, "Starting Node.js with %d args", argc);

    // 启动 Node.js
    int result = nodeStart(argc, argv);

    free(argsBuffer);
    free(argv);
    dlclose(handle);

    return result;
}

} // extern "C"
