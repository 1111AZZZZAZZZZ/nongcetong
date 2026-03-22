package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.Result;
import com.nongcetong.nongcetongbackend.dto.UserLoginDTO;
import com.nongcetong.nongcetongbackend.dto.UserRegisterDTO;
import com.nongcetong.nongcetongbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户接口控制器
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<String> register(@RequestBody @Valid UserRegisterDTO dto) {
        userService.register(dto);
        return Result.success();
    }

    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody @Valid UserLoginDTO dto) {
        String token = userService.login(dto);
        return Result.success(Map.of("token", token));
    }
}
