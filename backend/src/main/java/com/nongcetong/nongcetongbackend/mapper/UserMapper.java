package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

/**
 * 用户数据访问层（DAO）
 */
@Mapper
public interface UserMapper {
    void insert(User user);
    User findByUsername(String username);
    User findById(Long id);
}
