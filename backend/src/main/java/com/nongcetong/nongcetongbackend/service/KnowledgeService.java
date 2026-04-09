package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.dto.KnowledgeFileListDTO;
import com.nongcetong.nongcetongbackend.dto.KnowledgeSearchResultDTO;
import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;

import java.util.List;

/**
 * 知识库业务层接口
 */
public interface KnowledgeService {
    
    /**
     * 上传知识库文件
     * @param userId 用户 ID
     * @param fileName 文件名
     * @param fileData 文件数据
     * @return 返回 KnowledgeFile 对象
     */
    KnowledgeFile uploadFile(Long userId, String fileName, byte[] fileData);
    
    /**
     * 获取用户的所有知识库文件列表
     * @param userId 用户 ID
     * @return 文件列表
     */
    List<KnowledgeFileListDTO> listFiles(Long userId);
    
    /**
     * 删除知识库文件
     * @param userId 用户 ID
     * @param fileId 文件 ID
     */
    void deleteFile(Long userId, Long fileId);
    
    /**
     * 关键词搜索（用于 RAG）
     * @param userId 用户 ID
     * @param keyword 搜索关键词
     * @return 搜索结果列表
     */
    List<KnowledgeSearchResultDTO> searchByKeyword(Long userId, String keyword);
    
    /**
     * 解析 PDF 文件并提取文本内容
     */
    String extractTextFromPDF(byte[] fileData) throws Exception;
    
    /**
     * 处理待处理的文件（后台任务）
     */
    void processPendingFiles();
}
