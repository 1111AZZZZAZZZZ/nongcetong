package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;
import java.util.Date;

/**
 * 用户实体类（对应数据库user表）
 */
@Data
public class User {
    private Long id;             // 主键ID
    private String username;     // 用户名（唯一）
    private String password;     // 加密后的密码
    private String role;         // 角色：user/admin
    private Date createTime;     // 创建时间
}