package com.nongcetong.nongcetongbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 密码加密器（替换原来的 PasswordEncoder）
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 核心安全配置（替换原来的 configure(HttpSecurity)）
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 关闭 CSRF（前后端分离项目通常需要）
                .csrf(csrf -> csrf.disable())
                // 配置请求权限
                .authorizeHttpRequests(auth -> auth
                        // 放行登录/注册接口
                        .requestMatchers("/user/login", "/user/register").permitAll()
                        // 其他请求都需要认证
                        .anyRequest().authenticated()
                );
        // 如果有 JWT 过滤器，在这里添加（把你的 JwtAuthenticationFilter 加进来）
        // http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}