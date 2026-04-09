package com.nongcetong.nongcetongbackend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 知识库文件实体类（对应数据库 knowledge_file 表）
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeFile {
    private Long id;
    private Long userId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String fileType;      // PDF, MARKDOWN, TXT
    private String status;        // UPLOADED, PROCESSING, READY, FAILED
    private String content;       // 文本内容
    private String errorMessage;  // 处理失败时的错误信息
    private LocalDateTime uploadTime;
    private LocalDateTime processedTime;
    private LocalDateTime updatedAt;
}
