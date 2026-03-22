package com.nongcetong.nongcetongbackend.exception;

public interface ErrorCode {
    // 用户相关
    int USER_NOT_FOUND = 1001;
    int USER_ALREADY_EXISTS = 1002;
    int PASSWORD_ERROR = 1003;
    int TOKEN_INVALID = 1004;

    // 聊天相关
    int CHAT_ERROR = 2001;

    // 通用
    int PARAM_ERROR = 4000;
    int UNAUTHORIZED = 4001;
    int FORBIDDEN = 4003;
    int SERVER_ERROR = 5000;
}

