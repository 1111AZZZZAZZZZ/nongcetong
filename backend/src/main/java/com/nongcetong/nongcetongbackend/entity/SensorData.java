package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SensorData {
    private Long id;
    private String deviceId;
    private String type;
    private BigDecimal value;
    private String unit;
    private LocalDateTime recordedAt;
}
