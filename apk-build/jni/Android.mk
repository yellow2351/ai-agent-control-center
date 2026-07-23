LOCAL_PATH := $(call my-dir)

# 根据 ABI 选择正确的 libnode.so
ifeq ($(TARGET_ARCH_ABI),arm64-v8a)
    NODE_SO_PATH := libs/arm64-v8a/libnode.so
else ifeq ($(TARGET_ARCH_ABI),x86_64)
    NODE_SO_PATH := libs/x86_64/libnode.so
else
    NODE_SO_PATH := libs/$(TARGET_ARCH_ABI)/libnode.so
endif

# 预编译的 libnode.so
include $(CLEAR_VARS)
LOCAL_MODULE    := node
LOCAL_SRC_FILES := $(NODE_SO_PATH)
LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/../include
include $(PREBUILT_SHARED_LIBRARY)

# 编译 node-bridge.so
include $(CLEAR_VARS)
LOCAL_MODULE    := node-bridge
LOCAL_SRC_FILES := node-bridge.cpp
LOCAL_LDLIBS    := -llog -landroid
LOCAL_SHARED_LIBRARIES := node
include $(BUILD_SHARED_LIBRARY)
