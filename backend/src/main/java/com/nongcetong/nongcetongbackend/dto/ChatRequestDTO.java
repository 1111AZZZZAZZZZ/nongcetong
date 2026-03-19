package com.nongcetong.nongcetongbackend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;



@Data
public class ChatRequestDTO {
    @NotBlank(message = "消息不能为空")
    private String message;

    @NotBlank(message = "sessionId不能为空")
    private String sessionId;
}
