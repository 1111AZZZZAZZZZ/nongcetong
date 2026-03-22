package com.nongcetong.nongcetongbackend.controller;
import com.nongcetong.nongcetongbackend.dto.*;
import com.nongcetong.nongcetongbackend.entity.DeviceLog;
import com.nongcetong.nongcetongbackend.service.ChatService;
import com.nongcetong.nongcetongbackend.service.DeviceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import jakarta.validation.Valid;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/device")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // 查询设备状态
    @GetMapping("/status")
    public Result<DeviceStatusDTO> getStatus(@RequestParam @NotBlank String deviceId) {
        return Result.success(deviceService.getStatus(deviceId));
    }

    // 下发控制指令
    @PostMapping("/control")
    public Result<Void> control(@RequestBody @Valid DeviceControlDTO dto) {
        Long userId = getUserIdFromContext();
        deviceService.control(dto, userId);
        return Result.success();
    }

    // 查询操作日志
    @GetMapping("/log")
    public Result<List<DeviceLog>> getLogs(
            @RequestParam @NotBlank String deviceId,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        return Result.success(deviceService.getLogs(deviceId, limit));
    }

    private Long getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }
}

