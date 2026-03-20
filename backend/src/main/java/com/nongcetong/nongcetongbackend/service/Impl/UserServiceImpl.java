package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.entity.User;
import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.exception.BizException;
import com.nongcetong.nongcetongbackend.exception.ErrorCode;
import com.nongcetong.nongcetongbackend.mapper.UserMapper;
import com.nongcetong.nongcetongbackend.service.UserService;
import com.nongcetong.nongcetongbackend.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户业务层实现类
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void register(UserRegisterDTO dto) {
        if (userMapper.findByUsername(dto.getUsername()) != null) {
            throw new BizException(ErrorCode.USER_ALREADY_EXISTS, "用户名已存在");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        userMapper.insert(user);
    }

    @Override
    public String login(UserLoginDTO dto) {
        User user = userMapper.findByUsername(dto.getUsername());
        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BizException(ErrorCode.PASSWORD_ERROR, "用户名或密码错误");
        }
        return jwtTokenProvider.generateToken(user.getId(), user.getUsername());
    }
}
