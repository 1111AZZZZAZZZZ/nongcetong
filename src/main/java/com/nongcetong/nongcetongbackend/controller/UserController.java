package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户接口控制器
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 注册接口
     */
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody UserRegisterDTO registerDTO) {
        Map<String, Object> result = new HashMap<>();
        boolean success = userService.register(registerDTO);
        if (success) {
            result.put("code", 200);
            result.put("msg", "注册成功");
        } else {
            result.put("code", 500);
            result.put("msg", "注册失败，用户名已存在");
        }
        return result;
    }

    /**
     * 登录接口
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserLoginDTO loginDTO) {
        Map<String, Object> result = new HashMap<>();
        String token = userService.login(loginDTO);
        if (token != null) {
            result.put("code", 200);
            result.put("msg", "登录成功");
            result.put("token", token); // 返回JWT令牌
        } else {
            result.put("code", 401);
            result.put("msg", "登录失败，用户名或密码错误");
        }
        return result;
    }
}