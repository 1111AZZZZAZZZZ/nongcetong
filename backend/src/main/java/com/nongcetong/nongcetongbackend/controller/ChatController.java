package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;
import com.nongcetong.nongcetongbackend.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatResponseDTO> send(
            @RequestBody @Valid ChatRequestDTO dto,
            @AuthenticationPrincipal String username,
            HttpServletRequest request) {

        // 从 SecurityContext 取 userId
        Long userId = getUserIdFromContext();
        ChatResponseDTO response = chatService.chat(dto, userId);
        return ResponseEntity.ok(response);
    }

    private Long getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // JWT filter 里存的是 username，这里你可以改成存 userId
        // 建议在 JwtAuthenticationFilter 里把 userId 存到 details 里
        return Long.valueOf(auth.getName());
    }
}

