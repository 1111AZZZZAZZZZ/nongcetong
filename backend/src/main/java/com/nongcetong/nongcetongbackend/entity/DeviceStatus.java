package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeviceStatus {
    private Long id;
    private String deviceId;
    private String deviceName;
    private String type;
    private String status;
    private String params; // JSON字符串
    private LocalDateTime updatedAt;
}
