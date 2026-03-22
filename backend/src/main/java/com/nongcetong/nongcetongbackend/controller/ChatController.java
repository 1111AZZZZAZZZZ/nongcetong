package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;
import com.nongcetong.nongcetongbackend.dto.Result;
import com.nongcetong.nongcetongbackend.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import jakarta.validation.Valid;
import reactor.core.publisher.Flux;


@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public Result<ChatResponseDTO> send(
            @RequestBody @Valid ChatRequestDTO dto,
            @AuthenticationPrincipal String username,
            HttpServletRequest request) {

        // 从 SecurityContext 取 userId
        Long userId = getUserIdFromContext();
        ChatResponseDTO response = chatService.chat(dto, userId);
        return Result.success(chatService.chat(dto, userId));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> stream(
            @RequestParam @NotBlank String message,
            @RequestParam @NotBlank String sessionId) {

        Long userId = getUserIdFromContext();

        ChatRequestDTO dto = new ChatRequestDTO();
        dto.setMessage(message);
        dto.setSessionId(sessionId);

        return chatService.chatStream(dto, userId)
                .map(text -> ServerSentEvent.<String>builder()
                        .event("message")
                        .data(text)
                        .build())
                .concatWith(Flux.just(
                        ServerSentEvent.<String>builder()
                                .event("done")
                                .data("[DONE]")
                                .build()
                ));
    }


    private Long getUserIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // JWT filter 里存的是 username，这里你可以改成存 userId
        // 建议在 JwtAuthenticationFilter 里把 userId 存到 details 里
        return Long.valueOf(auth.getName());
    }
}

