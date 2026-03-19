package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;

public interface ChatService {
    ChatResponseDTO chat(ChatRequestDTO dto, Long userId);
}

