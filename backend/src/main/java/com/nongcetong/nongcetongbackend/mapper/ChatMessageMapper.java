package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMessageMapper {
    void insert(ChatMessage message);
    List<ChatMessage> findBySessionId(@Param("sessionId") String sessionId);
}

