package com.nongcetong.nongcetongbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SensorReportDTO {
    @NotBlank(message = "设备ID不能为空")
    private String deviceId;

    @NotBlank(message = "传感器类型不能为空")
    private String type;

    @NotNull(message = "采集值不能为空")
    private BigDecimal value;

    private String unit;
}
