package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.DeviceLog;
import com.nongcetong.nongcetongbackend.entity.DeviceStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DeviceMapper {
    DeviceStatus findByDeviceId(@Param("deviceId") String deviceId);
    void updateStatus(DeviceStatus status);
    void insertLog(DeviceLog log);
    List<DeviceLog> findLogsByDeviceId(@Param("deviceId") String deviceId,
                                       @Param("limit") Integer limit);
}

