package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.entity.User;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;

/**
 * 用户业务层接口
 */
public interface UserService {
    // 注册用户
    boolean register(UserRegisterDTO registerDTO);

    // 用户登录（返回JWT令牌）
    String login(UserLoginDTO loginDTO);

    // 根据用户名查询用户
    User findByUsername(String username);
}