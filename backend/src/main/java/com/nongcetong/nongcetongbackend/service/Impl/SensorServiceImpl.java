package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.dto.SensorLatestDTO;
import com.nongcetong.nongcetongbackend.dto.SensorQueryDTO;
import com.nongcetong.nongcetongbackend.dto.SensorReportDTO;
import com.nongcetong.nongcetongbackend.entity.SensorData;
import com.nongcetong.nongcetongbackend.mapper.SensorDataMapper;
import com.nongcetong.nongcetongbackend.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SensorServiceImpl implements SensorService {

    private final SensorDataMapper sensorDataMapper;

    @Override
    public void report(SensorReportDTO dto) {
        SensorData data = new SensorData();
        data.setDeviceId(dto.getDeviceId());
        data.setType(dto.getType());
        data.setValue(dto.getValue());
        data.setUnit(dto.getUnit());
        sensorDataMapper.insert(data);
    }

    @Override
    public List<SensorData> queryHistory(SensorQueryDTO dto) {
        return sensorDataMapper.queryHistory(dto);
    }

    @Override
    public List<SensorLatestDTO> queryLatest(String deviceId) {
        List<SensorData> list = sensorDataMapper.queryLatest(deviceId);
        return list.stream()
                .map(s -> new SensorLatestDTO(s.getType(), s.getValue(), s.getUnit(), s.getRecordedAt()))
                .collect(Collectors.toList());
    }
}

