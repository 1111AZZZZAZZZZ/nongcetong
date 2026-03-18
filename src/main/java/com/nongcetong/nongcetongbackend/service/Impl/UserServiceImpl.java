package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.entity.User;
import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.mapper.UserMapper;
import com.nongcetong.nongcetongbackend.service.UserService;
import com.nongcetong.nongcetongbackend.utils.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户业务层实现类
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // 密码加密器
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 注册用户
     */
    @Override
    @Transactional
    public boolean register(UserRegisterDTO registerDTO) {
        // 1. 检查用户名是否已存在
        User existUser = userMapper.selectByUsername(registerDTO.getUsername());
        if (existUser != null) {
            return false; // 用户名已存在
        }

        // 2. 密码加密 + 封装用户对象
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole("user"); // 默认普通用户

        // 3. 插入数据库
        int count = userMapper.insert(user);
        return count > 0;
    }

    /**
     * 用户登录
     */
    @Override
    public String login(UserLoginDTO loginDTO) {
        // 1. 查询用户
        User user = userMapper.selectByUsername(loginDTO.getUsername());
        if (user == null) {
            return null; // 用户不存在
        }

        // 2. 验证密码
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return null; // 密码错误
        }

        // 3. 生成JWT令牌
        return jwtTokenProvider.createToken(user.getUsername(), user.getRole());
    }

    /**
     * 根据用户名查询用户
     */
    @Override
    public User findByUsername(String username) {
        return userMapper.selectByUsername(username);
    }
}