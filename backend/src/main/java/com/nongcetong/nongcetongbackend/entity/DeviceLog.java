package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeviceLog {
    private Long id;
    private String deviceId;
    private Long userId;
    private String action;
    private String params; // JSON字符串
    private LocalDateTime createdAt;
}
