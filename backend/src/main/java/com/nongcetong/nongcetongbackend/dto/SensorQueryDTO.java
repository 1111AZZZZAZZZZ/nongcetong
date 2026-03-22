package com.nongcetong.nongcetongbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class SensorQueryDTO {
    @NotBlank(message = "设备ID不能为空")
    private String deviceId;

    private String type; // 不传则查全部类型

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endTime;

    private Integer limit = 100; // 默认最多返回100条
}
