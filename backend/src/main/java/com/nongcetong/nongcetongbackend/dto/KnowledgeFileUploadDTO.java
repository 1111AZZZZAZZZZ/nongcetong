package com.nongcetong.nongcetongbackend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 知识库文件上传 DTO
 */
@Data
public class KnowledgeFileUploadDTO {
    @NotNull(message = "文件不能为空")
    private byte[] fileData;
    
    @NotNull(message = "文件名不能为空")
    private String fileName;
    
    private String fileType;  // PDF, MARKDOWN 等
}
