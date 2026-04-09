package com.nongcetong.nongcetongbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 知识库文件列表 DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeFileListDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String status;
    private LocalDateTime uploadTime;
    private LocalDateTime processedTime;
}
