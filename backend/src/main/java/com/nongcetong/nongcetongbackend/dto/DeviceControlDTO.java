package com.nongcetong.nongcetongbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class DeviceControlDTO {
    @NotBlank(message = "设备ID不能为空")
    private String deviceId;

    @NotBlank(message = "操作指令不能为空")
    private String action; // turn_on / turn_off / adjust

    private Map<String, Object> params; // 可选参数，如 {"speed": 3} {"flow": 50}
}

