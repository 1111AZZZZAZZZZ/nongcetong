package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.entity.User;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;

/**
 * 用户业务层接口
 */
public interface UserService {
    void register(UserRegisterDTO dto);
    String login(UserLoginDTO dto);
}
