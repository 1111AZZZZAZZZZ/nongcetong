package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.dto.SensorLatestDTO;
import com.nongcetong.nongcetongbackend.dto.SensorQueryDTO;
import com.nongcetong.nongcetongbackend.dto.SensorReportDTO;
import com.nongcetong.nongcetongbackend.entity.SensorData;

import java.util.List;

public interface SensorService {
    void report(SensorReportDTO dto);
    List<SensorData> queryHistory(SensorQueryDTO dto);
    List<SensorLatestDTO> queryLatest(String deviceId);
}

