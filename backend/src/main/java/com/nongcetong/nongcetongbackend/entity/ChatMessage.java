package com.nongcetong.nongcetongbackend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessage {
    private Long id;
    private String sessionId;
    private Long userId;
    private String role; // "user" or "assistant"
    private String content;
    private LocalDateTime createdAt;
}
