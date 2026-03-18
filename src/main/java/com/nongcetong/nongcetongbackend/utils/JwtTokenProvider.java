package com.nongcetong.nongcetongbackend.utils;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

/**
 * JWT令牌生成与验证工具类
 */
@Component
public class JwtTokenProvider {

    // 从配置文件读取密钥（推荐）
    @Value("${jwt.secret:nongcetong-ai-secret-key-2026}")
    private String jwtSecret;

    // 令牌过期时间（7天，单位：毫秒）
    @Value("${jwt.expiration:604800000}")
    private long jwtExpiration;

    /**
     * 生成JWT令牌
     */
    public String createToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(username)                // 用户名作为主题
                .claim("role", role)                 // 自定义声明：用户角色
                .setIssuedAt(now)                    // 签发时间
                .setExpiration(expiryDate)           // 过期时间
                .signWith(SignatureAlgorithm.HS512, jwtSecret) // 加密算法+密钥
                .compact();
    }

    /**
     * 从令牌中获取用户名
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * 验证令牌有效性
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException |
                 UnsupportedJwtException | IllegalArgumentException e) {
            return false;
        }
    }
}