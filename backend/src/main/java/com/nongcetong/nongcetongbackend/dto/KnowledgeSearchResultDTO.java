package com.nongcetong.nongcetongbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 知识库搜索结果 DTO（用于 RAG）
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeSearchResultDTO {
    private Long fileId;
    private String fileName;
    private String matchedContent;  // 匹配的文本片段
    private Float relevanceScore;   // 相关性评分
    private Integer chunkIndex;     // 文本块索引
}
