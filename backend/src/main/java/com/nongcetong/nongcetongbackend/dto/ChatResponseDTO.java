package com.nongcetong.nongcetongbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatResponseDTO {
    private String sessionId;
    private String reply;
}

