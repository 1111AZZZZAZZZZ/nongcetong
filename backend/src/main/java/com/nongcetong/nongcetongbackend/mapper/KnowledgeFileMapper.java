package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 知识库文件 Mapper 接口
 */
@Mapper
public interface KnowledgeFileMapper {
    
    /**
     * 新增知识库文件
     */
    void insert(KnowledgeFile knowledgeFile);
    
    /**
     * 根据 ID 查询
     */
    KnowledgeFile selectById(Long id);
    
    /**
     * 查询当前用户的所有文件
     */
    List<KnowledgeFile> selectByUserId(@Param("userId") Long userId);
    
    /**
     * 根据用户 ID 和文件 ID 查询（确保数据隔离）
     */
    KnowledgeFile selectByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * 按用户 ID 和状态查询
     */
    List<KnowledgeFile> selectByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);
    
    /**
     * 按状态查询（用于后台处理）
     */
    List<KnowledgeFile> selectByStatus(@Param("status") String status);
    
    /**
     * 更新文件信息
     */
    void update(KnowledgeFile knowledgeFile);
    
    /**
     * 删除文件
     */
    void deleteById(Long id);
    
    /**
     * 根据用户 ID 和文件 ID 删除
     */
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    
    /**
     * 关键词搜索文档片段（用于 RAG）
     */
    List<KnowledgeFile> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}
