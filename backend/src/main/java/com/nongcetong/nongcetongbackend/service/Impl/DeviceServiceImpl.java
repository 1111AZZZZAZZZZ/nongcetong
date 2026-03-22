package com.nongcetong.nongcetongbackend.service.Impl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;
import com.nongcetong.nongcetongbackend.dto.DeviceControlDTO;
import com.nongcetong.nongcetongbackend.dto.DeviceStatusDTO;
import com.nongcetong.nongcetongbackend.entity.ChatMessage;
import com.nongcetong.nongcetongbackend.entity.DeviceLog;
import com.nongcetong.nongcetongbackend.entity.DeviceStatus;
import com.nongcetong.nongcetongbackend.exception.BizException;
import com.nongcetong.nongcetongbackend.exception.ErrorCode;
import com.nongcetong.nongcetongbackend.mapper.ChatMessageMapper;
import com.nongcetong.nongcetongbackend.mapper.DeviceMapper;
import com.nongcetong.nongcetongbackend.service.ChatService;
import com.nongcetong.nongcetongbackend.service.DeviceService;
import com.nongcetong.nongcetongbackend.utils.LlmClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;
@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceMapper deviceMapper;
    private final ObjectMapper objectMapper;

    @Override
    public DeviceStatusDTO getStatus(String deviceId) {
        DeviceStatus device = deviceMapper.findByDeviceId(deviceId);
        if (device == null) {
            throw new BizException(ErrorCode.SERVER_ERROR, "设备不存在: " + deviceId);
        }
        Map<String, Object> params = parseParams(device.getParams());
        return new DeviceStatusDTO(
                device.getDeviceId(),
                device.getDeviceName(),
                device.getType(),
                device.getStatus(),
                params,
                device.getUpdatedAt()
        );
    }

    @Override
    public void control(DeviceControlDTO dto, Long userId) {
        DeviceStatus device = deviceMapper.findByDeviceId(dto.getDeviceId());
        if (device == null) {
            throw new BizException(ErrorCode.SERVER_ERROR, "设备不存在: " + dto.getDeviceId());
        }

        // 根据指令更新状态
        switch (dto.getAction()) {
            case "turn_on" -> device.setStatus("on");
            case "turn_off" -> {
                device.setStatus("off");
                dto.setParams(null); // 关闭时清空运行参数
            }
            case "adjust" -> {} // 只更新参数，状态不变
            default -> throw new BizException(ErrorCode.PARAM_ERROR, "不支持的操作: " + dto.getAction());
        }

        // 更新参数
        if (dto.getParams() != null) {
            device.setParams(toJson(dto.getParams()));
        }

        deviceMapper.updateStatus(device);

        // 记录操作日志
        DeviceLog log = new DeviceLog();
        log.setDeviceId(dto.getDeviceId());
        log.setUserId(userId);
        log.setAction(dto.getAction());
        log.setParams(toJson(dto.getParams()));
        deviceMapper.insertLog(log);
    }

    @Override
    public List<DeviceLog> getLogs(String deviceId, Integer limit) {
        return deviceMapper.findLogsByDeviceId(deviceId, limit == null ? 50 : limit);
    }

    private Map<String, Object> parseParams(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }
}
