package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.dto.DeviceControlDTO;
import com.nongcetong.nongcetongbackend.dto.DeviceStatusDTO;
import com.nongcetong.nongcetongbackend.entity.DeviceLog;

import java.util.List;

public interface DeviceService {
    DeviceStatusDTO getStatus(String deviceId);
    void control(DeviceControlDTO dto, Long userId);
    List<DeviceLog> getLogs(String deviceId, Integer limit);
}

