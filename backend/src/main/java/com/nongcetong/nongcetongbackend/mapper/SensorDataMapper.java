package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.dto.SensorQueryDTO;
import com.nongcetong.nongcetongbackend.entity.SensorData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SensorDataMapper {
    void insert(SensorData sensorData);
    List<SensorData> queryHistory(SensorQueryDTO dto);
    List<SensorData> queryLatest(@Param("deviceId") String deviceId);
}

