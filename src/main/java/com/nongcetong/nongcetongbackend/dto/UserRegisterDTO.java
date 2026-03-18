package com.nongcetong.nongcetongbackend.dto;

import lombok.Data;

/**
 * 注册请求DTO
 */
@Data
public class UserRegisterDTO {
    private String username;     // 用户名
    private String password;     // 原始密码
}