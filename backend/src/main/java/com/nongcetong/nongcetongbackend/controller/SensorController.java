package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.Result;
import com.nongcetong.nongcetongbackend.dto.SensorLatestDTO;
import com.nongcetong.nongcetongbackend.dto.SensorQueryDTO;
import com.nongcetong.nongcetongbackend.dto.SensorReportDTO;
import com.nongcetong.nongcetongbackend.entity.SensorData;
import com.nongcetong.nongcetongbackend.service.SensorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    // 设备上报数据
    @PostMapping("/report")
    public Result<Void> report(@RequestBody @Valid SensorReportDTO dto) {
        sensorService.report(dto);
        return Result.success();
    }

    // 查询历史数据（折线图用）
    @GetMapping("/data")
    public Result<List<SensorData>> queryHistory(@Valid SensorQueryDTO dto) {
        return Result.success(sensorService.queryHistory(dto));
    }

    // 查询各传感器最新值（首页看板用）
    @GetMapping("/latest")
    public Result<List<SensorLatestDTO>> queryLatest(@RequestParam @NotBlank String deviceId) {
        return Result.success(sensorService.queryLatest(deviceId));
    }
}
