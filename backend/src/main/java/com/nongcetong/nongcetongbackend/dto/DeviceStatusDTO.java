package com.nongcetong.nongcetongbackend.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
@Data
@AllArgsConstructor
public class DeviceStatusDTO {
    private String deviceId;
    private String deviceName;
    private String type;
    private String status;
    private Map<String, Object> params;
    private LocalDateTime updatedAt;
}

