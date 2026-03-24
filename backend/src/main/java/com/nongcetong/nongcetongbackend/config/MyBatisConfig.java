package com.nongcetong.nongcetongbackend.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.nongcetong.nongcetongbackend.mapper")
public class MyBatisConfig {
	// empty - using @MapperScan to pick up mapper interfaces
}
