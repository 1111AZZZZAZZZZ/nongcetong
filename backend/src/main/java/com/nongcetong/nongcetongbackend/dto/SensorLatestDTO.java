package com.nongcetong.nongcetongbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SensorLatestDTO {
    private String type;
    private BigDecimal value;
    private String unit;
    private LocalDateTime recordedAt;
}

