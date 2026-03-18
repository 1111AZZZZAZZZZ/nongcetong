package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

/**
 * 用户数据访问层（DAO）
 */
@Repository
public interface UserMapper {
    // 注册用户
    int insert(User user);

    // 根据用户名查询用户
    User selectByUsername(@Param("username") String username);
}