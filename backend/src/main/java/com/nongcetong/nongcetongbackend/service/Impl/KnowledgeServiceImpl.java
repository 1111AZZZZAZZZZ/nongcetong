package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.dto.KnowledgeFileListDTO;
import com.nongcetong.nongcetongbackend.dto.KnowledgeSearchResultDTO;
import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import com.nongcetong.nongcetongbackend.exception.BizException;
import com.nongcetong.nongcetongbackend.mapper.KnowledgeFileMapper;
import com.nongcetong.nongcetongbackend.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 知识库业务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeServiceImpl implements KnowledgeService {
    
    private final KnowledgeFileMapper knowledgeFileMapper;
    
    @Value("${knowledge.upload-path:./knowledge-files}")
    private String uploadPath;
    
    /**
     * 上传知识库文件
     */
    @Override
    @Transactional
    public KnowledgeFile uploadFile(Long userId, String fileName, byte[] fileData) {
        if (userId == null) {
            throw new BizException(400, "用户不能为空");
        }
        if (fileName == null || fileName.isEmpty()) {
            throw new BizException(400, "文件名不能为空");
        }
        if (fileData == null || fileData.length == 0) {
            throw new BizException(400, "文件内容不能为空");
        }
        
        // 获取文件类型
        String fileType = getFileType(fileName);
        if (!isValidFileType(fileType)) {
            throw new BizException(400, "不支持的文件类型，仅支持 PDF 和 Markdown");
        }
        
        try {
            // 保存文件到磁盘
            String filePath = saveFileToDisk(fileName, fileData);
            
            // 创建 KnowledgeFile 实体
            KnowledgeFile knowledgeFile = new KnowledgeFile();
            knowledgeFile.setUserId(userId);
            knowledgeFile.setFileName(fileName);
            knowledgeFile.setFilePath(filePath);
            knowledgeFile.setFileSize((long) fileData.length);
            knowledgeFile.setFileType(fileType);
            knowledgeFile.setStatus("PROCESSING");  // 上传后立即开始处理
            knowledgeFile.setUploadTime(LocalDateTime.now());
            knowledgeFile.setUpdatedAt(LocalDateTime.now());
            
            // 如果是 PDF，立即解析文本
            if ("PDF".equals(fileType)) {
                try {
                    String content = extractTextFromPDF(fileData);
                    knowledgeFile.setContent(content);
                    knowledgeFile.setStatus("READY");
                    knowledgeFile.setProcessedTime(LocalDateTime.now());
                } catch (Exception e) {
                    log.error("PDF 解析失败: {}", e.getMessage());
                    knowledgeFile.setStatus("FAILED");
                    knowledgeFile.setErrorMessage("PDF 解析失败: " + e.getMessage());
                }
            }
            
            // 保存到数据库
            knowledgeFileMapper.insert(knowledgeFile);
            log.info("知识库文件上传成功: userId={}, fileName={}, fileId={}", userId, fileName, knowledgeFile.getId());
            
            return knowledgeFile;
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new BizException(500, "文件上传失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的所有知识库文件列表
     */
    @Override
    public List<KnowledgeFileListDTO> listFiles(Long userId) {
        if (userId == null) {
            throw new BizException(400, "用户不能为空");
        }
        
        List<KnowledgeFile> files = knowledgeFileMapper.selectByUserId(userId);
        return files.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 删除知识库文件
     */
    @Override
    @Transactional
    public void deleteFile(Long userId, Long fileId) {
        if (userId == null || fileId == null) {
            throw new BizException(400, "参数不能为空");
        }
        
        // 验证文件所有权
        KnowledgeFile file = knowledgeFileMapper.selectByIdAndUserId(fileId, userId);
        if (file == null) {
            throw new BizException(404, "文件不存在或无权限访问");
        }
        
        try {
            // 删除磁盘上的文件
            if (file.getFilePath() != null) {
                File diskFile = new File(file.getFilePath());
                if (diskFile.exists() && !diskFile.delete()) {
                    log.warn("磁盘文件删除失败: {}", file.getFilePath());
                }
            }
            
            // 删除数据库记录
            knowledgeFileMapper.deleteByIdAndUserId(fileId, userId);
            log.info("知识库文件删除成功: fileId={}", fileId);
        } catch (Exception e) {
            log.error("文件删除失败", e);
            throw new BizException(500, "文件删除失败: " + e.getMessage());
        }
    }
    
    /**
     * 关键词搜索（用于 RAG）
     */
    @Override
    public List<KnowledgeSearchResultDTO> searchByKeyword(Long userId, String keyword) {
        if (userId == null || keyword == null || keyword.isEmpty()) {
            throw new BizException(400, "用户 ID 和关键词不能为空");
        }
        
        // 查询匹配的文件
        List<KnowledgeFile> matchedFiles = knowledgeFileMapper.searchByKeyword(userId, keyword);
        
        // 将结果转换为 DTO
        List<KnowledgeSearchResultDTO> results = new ArrayList<>();
        for (KnowledgeFile file : matchedFiles) {
            KnowledgeSearchResultDTO dto = new KnowledgeSearchResultDTO();
            dto.setFileId(file.getId());
            dto.setFileName(file.getFileName());
            dto.setRelevanceScore(1.0f);  // 简单匹配评分
            
            // 提取匹配的文本片段
            if (file.getContent() != null) {
                String content = file.getContent();
                int index = content.indexOf(keyword);
                if (index >= 0) {
                    int start = Math.max(0, index - 50);
                    int end = Math.min(content.length(), index + keyword.length() + 50);
                    dto.setMatchedContent(content.substring(start, end).replaceAll("\\n", " "));
                }
            }
            
            results.add(dto);
        }
        
        return results;
    }
    
    /**
     * 解析 PDF 文件并提取文本内容
     */
    @Override
    public String extractTextFromPDF(byte[] fileData) throws Exception {
        if (fileData == null || fileData.length == 0) {
            throw new IllegalArgumentException("文件数据不能为空");
        }
        
        StringBuilder textContent = new StringBuilder();
        try {
            PDDocument document = Loader.loadPDF(fileData);
            try {
                if (document.isEncrypted()) {
                    log.warn("PDF 文件已加密，将尝试使用空密码打开");
                }
                
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                textContent.append(text);
                
                log.info("PDF 文本提取成功，长度: {} 字符", textContent.length());
            } finally {
                document.close();
            }
        } catch (IOException e) {
            log.error("PDF 文本提取失败", e);
            throw new Exception("PDF 文本提取失败: " + e.getMessage(), e);
        }
        
        return textContent.toString();
    }
    
    /**
     * 处理待处理的文件（后台任务）
     */
    @Override
    public void processPendingFiles() {
        List<KnowledgeFile> pendingFiles = knowledgeFileMapper.selectByStatus("PROCESSING");
        
        for (KnowledgeFile file : pendingFiles) {
            try {
                // 从磁盘读取文件
                File diskFile = new File(file.getFilePath());
                if (!diskFile.exists()) {
                    file.setStatus("FAILED");
                    file.setErrorMessage("文件不存在于磁盘: " + file.getFilePath());
                    knowledgeFileMapper.update(file);
                    continue;
                }
                
                byte[] fileData = new byte[(int) diskFile.length()];
                try (java.io.FileInputStream fis = new java.io.FileInputStream(diskFile)) {
                    fis.read(fileData);
                }
                
                // 解析文本内容
                String content = extractTextFromPDF(fileData);
                
                file.setContent(content);
                file.setStatus("READY");
                file.setProcessedTime(LocalDateTime.now());
                knowledgeFileMapper.update(file);
                
                log.info("文件处理完成: fileId={}", file.getId());
            } catch (Exception e) {
                log.error("文件处理失败: fileId={}", file.getId(), e);
                file.setStatus("FAILED");
                file.setErrorMessage("处理失败: " + e.getMessage());
                knowledgeFileMapper.update(file);
            }
        }
    }
    
    /**
     * 辅助方法：获取文件类型
     */
    private String getFileType(String fileName) {
        if (fileName == null) {
            return null;
        }
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot == -1) {
            return null;
        }
        return fileName.substring(lastDot + 1).toUpperCase();
    }
    
    /**
     * 辅助方法：验证文件类型
     */
    private boolean isValidFileType(String fileType) {
        return "PDF".equals(fileType) || "MARKDOWN".equals(fileType) || "MD".equals(fileType) || "TXT".equals(fileType);
    }
    
    /**
     * 辅助方法：保存文件到磁盘
     */
    private String saveFileToDisk(String fileName, byte[] fileData) throws IOException {
        // 创建上传目录
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            throw new IOException("无法创建上传目录: " + uploadPath);
        }
        
        // 生成唯一的文件名
        String uniqueFileName = UUID.randomUUID() + "_" + fileName;
        String filePath = uploadPath + File.separator + uniqueFileName;
        
        // 保存文件
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(fileData);
        }
        
        log.info("文件已保存到磁盘: {}", filePath);
        return filePath;
    }
    
    /**
     * 辅助方法：转换为 DTO
     */
    private KnowledgeFileListDTO convertToListDTO(KnowledgeFile file) {
        return new KnowledgeFileListDTO(
                file.getId(),
                file.getFileName(),
                file.getFileType(),
                file.getFileSize(),
                file.getStatus(),
                file.getUploadTime(),
                file.getProcessedTime()
        );
    }
}
