package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 用户实体类（对应数据库user表）
 */
@Data
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
