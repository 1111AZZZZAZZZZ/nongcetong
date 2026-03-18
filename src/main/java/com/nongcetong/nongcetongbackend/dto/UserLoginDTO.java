package com.nongcetong.nongcetongbackend.dto;

import lombok.Data;

/**
 * 登录请求DTO
 */
@Data
public class UserLoginDTO {
    private String username;     // 用户名
    private String password;     // 原始密码
}