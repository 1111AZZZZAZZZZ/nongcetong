package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.dto.KnowledgeFileListDTO;
import com.nongcetong.nongcetongbackend.dto.KnowledgeSearchResultDTO;
import com.nongcetong.nongcetongbackend.dto.Result;
import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import com.nongcetong.nongcetongbackend.exception.BizException;
import com.nongcetong.nongcetongbackend.service.KnowledgeService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 知识库控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {
    
    private final KnowledgeService knowledgeService;
    
    /**
     * 上传知识库文件
     * POST /api/knowledge/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<KnowledgeFile> upload(@RequestParam("file") MultipartFile file) {
        try {
            // 获取当前登录用户 ID
            Long userId = getCurrentUserId();
            
            if (file.isEmpty()) {
                throw new BizException(400, "上传的文件不能为空");
            }
            
            String fileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();
            
            KnowledgeFile result = knowledgeService.uploadFile(userId, fileName, fileData);
            log.info("用户 {} 上传文件成功: {}", userId, fileName);
            
            return Result.success(result);
        } catch (BizException e) {
            return Result.fail(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return Result.fail(500, "文件上传失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的知识库文件列表
     * GET /api/knowledge/list
     */
    @GetMapping("/list")
    public Result<List<KnowledgeFileListDTO>> list() {
        try {
            Long userId = getCurrentUserId();
            List<KnowledgeFileListDTO> files = knowledgeService.listFiles(userId);
            return Result.success(files);
        } catch (BizException e) {
            return Result.fail(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("获取文件列表失败", e);
            return Result.fail(500, "获取文件列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除知识库文件
     * DELETE /api/knowledge/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            knowledgeService.deleteFile(userId, id);
            log.info("用户 {} 删除文件成功: fileId={}", userId, id);
            return Result.success();
        } catch (BizException e) {
            return Result.fail(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("文件删除失败", e);
            return Result.fail(500, "文件删除失败: " + e.getMessage());
        }
    }
    
    /**
     * 关键词搜索文档片段（用于 RAG）
     * GET /api/knowledge/search?keyword=xxx
     */
    @GetMapping("/search")
    public Result<List<KnowledgeSearchResultDTO>> search(@RequestParam @NotBlank(message = "搜索关键词不能为空") String keyword) {
        try {
            Long userId = getCurrentUserId();
            List<KnowledgeSearchResultDTO> results = knowledgeService.searchByKeyword(userId, keyword);
            log.info("用户 {} 搜索关键词: {}, 结果数: {}", userId, keyword, results.size());
            return Result.success(results);
        } catch (BizException e) {
            return Result.fail(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("关键词搜索失败", e);
            return Result.fail(500, "搜索失败: " + e.getMessage());
        }
    }
    
    /**
     * 辅助方法：获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                // 这里简化处理，实际需要从 JWT Token 或 SecurityContext 中获取用户 ID
                // 可以通过 Authentication 对象获取自定义属性
                log.warn("需要从 JWT Token 中获取用户 ID，当前为临时处理");
                // 临时返回 1，实际应该从 Token 中解析
                return 1L;
            }
        } catch (Exception e) {
            log.error("获取当前用户 ID 失败", e);
        }
        throw new BizException(401, "未授权的访问");
    }
}
