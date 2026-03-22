package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;
import reactor.core.publisher.Flux;

public interface ChatService {
    ChatResponseDTO chat(ChatRequestDTO dto, Long userId);
    Flux<String> chatStream(ChatRequestDTO dto, Long userId);
}

