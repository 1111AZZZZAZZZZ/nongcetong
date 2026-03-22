package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.dto.ChatRequestDTO;
import com.nongcetong.nongcetongbackend.dto.ChatResponseDTO;
import com.nongcetong.nongcetongbackend.entity.ChatMessage;
import com.nongcetong.nongcetongbackend.mapper.ChatMessageMapper;
import com.nongcetong.nongcetongbackend.service.ChatService;
import com.nongcetong.nongcetongbackend.utils.LlmClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageMapper chatMessageMapper;
    private final LlmClient llmClient;

    @Value("${llm.system-prompt:你是一个农业助手，请用简洁专业的语言回答用户问题。}")
    private String systemPrompt;

    @Override
    public ChatResponseDTO chat(ChatRequestDTO dto, Long userId) {
        // 1. 保存用户消息
        saveMessage(dto.getSessionId(), userId, "user", dto.getMessage());

        // 2. 查询历史消息，拼接上下文
        List<ChatMessage> history = chatMessageMapper.findBySessionId(dto.getSessionId());
        List<Map<String, String>> messages = buildMessages(history);

        // 3. 调用大模型
        String reply = llmClient.chat(messages);

        // 4. 保存模型回复
        saveMessage(dto.getSessionId(), userId, "assistant", reply);

        return new ChatResponseDTO(dto.getSessionId(), reply);
    }
    @Override
    public Flux<String> chatStream(ChatRequestDTO dto, Long userId) {
        // 1. 保存用户消息
        saveMessage(dto.getSessionId(), userId, "user", dto.getMessage());

        // 2. 拼接上下文
        List<ChatMessage> history = chatMessageMapper.findBySessionId(dto.getSessionId());
        List<Map<String, String>> messages = buildMessages(history);

        // 3. 用 StringBuilder 收集完整回复，结束后存库
        StringBuilder fullReply = new StringBuilder();

        return llmClient.chatStream(messages)
                .doOnNext(fullReply::append)
                .doOnComplete(() ->
                        saveMessage(dto.getSessionId(), userId, "assistant", fullReply.toString())
                )
                .doOnError(e ->
                        saveMessage(dto.getSessionId(), userId, "assistant", "[ERROR] " + e.getMessage())
                );
    }


    private List<Map<String, String>> buildMessages(List<ChatMessage> history) {
        List<Map<String, String>> messages = new ArrayList<>();

        // 加入系统提示词
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // 加入历史消息
        for (ChatMessage msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        return messages;
    }

    private void saveMessage(String sessionId, Long userId, String role, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSessionId(sessionId);
        msg.setUserId(userId);
        msg.setRole(role);
        msg.setContent(content);
        chatMessageMapper.insert(msg);
    }
}
