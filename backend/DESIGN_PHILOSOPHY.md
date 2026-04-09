# 知识库后端模块设计思路总结

## 🎯 核心设计理念

### 1. **MVC 三层架构** - 清晰的职责分离

```
Request
  ↓
┌─────────────────────────────────┐
│ Controller (KnowledgeController) │  ← 请求入口
│ 职责: HTTP 请求处理、参数验证    │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Service (KnowledgeServiceImpl)    │  ← 业务逻辑
│ 职责: 文件管理、PDF 解析、搜索   │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Mapper (KnowledgeFileMapper)     │  ← 数据访问
│ 职责: SQL 操作、数据持久化       │
└────────────┬────────────────────┘
             ↓
        MySQL Database
```

**为什么这样设计？**
- 层与层之间低耦合、高内聚
- 易于单元测试每一层
- 业务逻辑与数据访问分离
- 可以独立修改某一层而不影响其他层

---

## 📊 设计模式运用

### 1. **DTO 数据传输对象模式**

```java
// ❌ 不好的做法：直接返回实体
@GetMapping("/list")
public List<KnowledgeFile> list() {
    return service.listFiles();  // 包含 content（大文本字段）
}

// ✅ 好的做法：使用 DTO
@GetMapping("/list")
public List<KnowledgeFileListDTO> list() {
    return service.listFiles();  // 只返回必要字段
}
```

**好处：**
- 只返回必要数据，减少网络传输
- 防止敏感字段被暴露
- API 契约明确，易于前端适配

### 2. **Repository 模式**

```java
// Service 层通过 Mapper 访问数据
@Service
public class KnowledgeServiceImpl {
    private final KnowledgeFileMapper mapper;  // 依赖注入
    
    public List<KnowledgeFile> listFiles(Long userId) {
        return mapper.selectByUserId(userId);  // 解耦数据访问
    }
}
```

**好处：**
- 数据访问逻辑集中在 Mapper
- 可以轻松切换数据库实现
- 便于编写测试 Mock

### 3. **依赖注入模式**

```java
@Service
@RequiredArgsConstructor  // Lombok 自动生成构造器
public class KnowledgeServiceImpl {
    private final KnowledgeFileMapper mapper;
    
    // Mapper 会被自动注入
}
```

**好处：**
- 减少代码中的 new 语句
- 便于测试时替换依赖
- 遵循 Spring 最佳实践

---

## 🔐 安全性设计

### 1. **用户隔离机制**

```
问题：用户 A 能否删除用户 B 的文件？

解决方案：
┌─────────────────────────┐
│ Controller              │
│ 获取当前用户 ID: userId │
└────────────┬────────────┘
             ↓
┌─────────────────────────────┐
│ Service                     │
│ deleteFile(userId, fileId)  │
│ 检查 user_id == userId      │
└────────────┬────────────────┘
             ↓
┌──────────────────────────────────┐
│ Mapper                           │
│ deleteByIdAndUserId(id, userId)  │
│ WHERE id = ? AND user_id = ?     │
└──────────────────────────────────┘
```

**三层防御：**
1. Controller 层：获取真实用户 ID
2. Service 层：逻辑验证权限
3. Mapper 层：SQL 级别过滤

### 2. **参数验证体系**

```java
// 方法入口处的防御性编程
public KnowledgeFile uploadFile(Long userId, String fileName, byte[] fileData) {
    // 第一道防线：参数非空检查
    if (userId == null) throw new BizException(400, "用户不能为空");
    if (fileName == null || fileName.isEmpty()) throw new BizException(400, "文件名不能为空");
    if (fileData == null || fileData.length == 0) throw new BizException(400, "文件内容不能为空");
    
    // 第二道防线：业务规则检查
    String fileType = getFileType(fileName);
    if (!isValidFileType(fileType)) {
        throw new BizException(400, "不支持的文件类型");
    }
    
    // 第三道防线：大小限制检查
    if (fileData.length > 50 * 1024 * 1024) {
        throw new BizException(400, "文件大小超过 50MB 限制");
    }
}
```

---

## 💾 数据模型设计

### 1. **KnowledgeFile 实体设计**

```java
@Data
public class KnowledgeFile {
    private Long id;           // 主键
    private Long userId;       // 用户 ID（用于隔离）
    
    // 文件基本信息
    private String fileName;   // 原始文件名
    private String filePath;   // 磁盘保存路径
    private Long fileSize;     // 文件大小
    private String fileType;   // 文件类型（PDF/MD/TXT）
    
    // 处理状态
    private String status;     // UPLOADED/PROCESSING/READY/FAILED
    private String errorMessage;  // 失败时的错误信息
    
    // 文本内容（用于搜索）
    private String content;    // 提取的文本内容
    
    // 时间戳
    private LocalDateTime uploadTime;      // 上传时间
    private LocalDateTime processedTime;   // 处理完成时间
    private LocalDateTime updatedAt;       // 更新时间
}
```

**设计考虑：**
- `status` 字段支持异步处理（PROCESSING → READY）
- `content` 字段用于全文搜索
- `userId` 实现数据隔离
- 时间戳用于审计和排序

### 2. **DTO 设计理念**

```java
// 上传 DTO - 接收前端数据
@Data
public class KnowledgeFileUploadDTO {
    @NotNull byte[] fileData;      // 文件二进制
    @NotNull String fileName;      // 文件名
    String fileType;               // 文件类型（可选）
}

// 列表 DTO - 返回给前端（不包含 content）
@Data
public class KnowledgeFileListDTO {
    Long id;                       // 文件 ID
    String fileName;               // 文件名
    String fileType;               // 文件类型
    Long fileSize;                 // 文件大小
    String status;                 // 处理状态
    LocalDateTime uploadTime;      // 上传时间
    LocalDateTime processedTime;   // 处理完成时间
    // ❌ 注意：没有 content 字段！
}

// 搜索结果 DTO - 用于 RAG
@Data
public class KnowledgeSearchResultDTO {
    Long fileId;                   // 文件 ID
    String fileName;               // 文件名
    String matchedContent;         // 匹配的文本片段
    Float relevanceScore;          // 相关性评分
}
```

**设计关键点：**
- 各 DTO 职责单一，不重复
- 只返回必要字段，减少数据传输
- 支持 RAG 的搜索结果格式

---

## 🔄 业务流程设计

### 1. **文件上传流程**

```
用户选择 PDF 文件
    ↓
Controller.upload()
    ├─ 验证文件非空
    ├─ 获取用户 ID
    └─ 调用 Service
        ↓
Service.uploadFile()
    ├─ 参数校验
    │  ├─ 检查 userId、fileName、fileData
    │  ├─ 检查文件类型
    │  └─ 检查文件大小
    ├─ 保存文件到磁盘
    │  ├─ 生成 UUID 唯一文件名
    │  └─ 使用 FileOutputStream 写入
    ├─ 如果是 PDF，立即解析文本
    │  ├─ PDFBox Loader.loadPDF(fileData)
    │  ├─ PDFTextStripper 提取文本
    │  └─ status = "READY"
    ├─ 创建 KnowledgeFile 对象
    ├─ 调用 Mapper 保存到数据库
    └─ 返回 KnowledgeFile
        ↓
Controller 返回 Result<KnowledgeFile>
    ↓
前端展示成功提示
```

**关键设计点：**
- 同步保存文件到磁盘（快速）
- 同步解析 PDF 文本（便于立即搜索）
- 数据库事务保证一致性
- 失败时回滚并清理磁盘文件

### 2. **文件搜索流程**

```
用户输入关键词
    ↓
Controller.search(keyword)
    ├─ 验证 keyword 非空
    ├─ 获取用户 ID
    └─ 调用 Service
        ↓
Service.searchByKeyword(userId, keyword)
    ├─ 调用 Mapper.searchByKeyword()
    │  └─ SQL: SELECT * FROM knowledge_file 
    │           WHERE user_id = ? 
    │           AND status = 'READY'
    │           AND (file_name LIKE ? OR content LIKE ?)
    ├─ 遍历结果，提取匹配的文本片段
    │  ├─ 查找关键词位置
    │  ├─ 提取前后各 50 个字符
    │  └─ 替换换行符为空格
    ├─ 转换为 KnowledgeSearchResultDTO
    └─ 返回结果列表
        ↓
前端显示搜索结果
```

**关键设计点：**
- 使用 MySQL LIKE 查询（支持模糊匹配）
- 使用 FULLTEXT 索引加速搜索
- 提取上下文片段而不是整个文本
- 为前端显示优化的 DTO 格式

---

## 🗄️ 数据库设计

### 1. **表结构优化**

```sql
CREATE TABLE knowledge_file (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,           -- 用户 ID（用于隔离）
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,   -- 磁盘路径
    file_size BIGINT NOT NULL,         -- 文件大小
    file_type VARCHAR(50) NOT NULL,    -- PDF/MARKDOWN/TXT
    status VARCHAR(50) NOT NULL,       -- 处理状态
    content LONGTEXT,                  -- 文本内容（用于搜索）
    error_message VARCHAR(1000),       -- 错误信息
    upload_time DATETIME NOT NULL DEFAULT NOW(),
    processed_time DATETIME,
    updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    
    -- 索引设计
    INDEX idx_user_id (user_id),              -- 查询用户文件
    INDEX idx_status (status),                -- 后台查询待处理文件
    INDEX idx_user_status (user_id, status),  -- 复合查询
    FULLTEXT INDEX ft_content (content)       -- 全文搜索
);
```

**索引设计理由：**
| 索引 | 用途 | 预期查询 |
|------|------|---------|
| `idx_user_id` | 用户文件列表 | `WHERE user_id = ?` |
| `idx_status` | 后台任务查询 | `WHERE status = 'PROCESSING'` |
| `idx_user_status` | 用户文件按状态 | `WHERE user_id = ? AND status = ?` |
| `ft_content` | 全文搜索 | `WHERE content LIKE ?` |

### 2. **状态机设计**

```
┌──────────┐
│ UPLOADED │  ← 文件上传到服务器
└────┬─────┘
     │ 立即开始处理 PDF
     ↓
┌──────────────┐
│ PROCESSING   │  ← 正在解析文本（当前不需要，PDF 同步处理）
└────┬─────────┘
     │ 解析完成
     ↓
┌──────────┐
│ READY    │  ← 可用于搜索
└──────────┘

如果失败：
┌──────────────┐
│ FAILED       │  ← 记录 errorMessage
└──────────────┘
```

**为什么这样设计？**
- 支持异步处理（未来集成消息队列）
- 状态清晰，便于前端显示进度
- 错误追踪有记录

---

## 📋 异常处理策略

### 1. **统一异常体系**

```java
// 自定义业务异常
public class BizException extends RuntimeException {
    private int code;
    private String message;
    
    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }
}

// 使用示例
if (userId == null) {
    throw new BizException(400, "用户不能为空");
}

// 全局异常处理器（GlobalExceptionHandler）
@ExceptionHandler(BizException.class)
public Result<Void> handleBizException(BizException e) {
    return Result.fail(e.getCode(), e.getMessage());
}
```

**好处：**
- 异常分类清晰
- 错误响应格式统一
- 可以统计不同类型的错误

### 2. **日志记录策略**

```java
@Slf4j  // Lombok 自动生成 logger
public class KnowledgeServiceImpl {
    
    public KnowledgeFile uploadFile(...) {
        try {
            // ... 业务逻辑
            
            knowledgeFileMapper.insert(knowledgeFile);
            log.info("知识库文件上传成功: userId={}, fileName={}, fileId={}", 
                     userId, fileName, knowledgeFile.getId());
            
            return knowledgeFile;
        } catch (Exception e) {
            log.error("文件上传失败", e);  // 记录完整堆栈
            throw new BizException(500, "文件上传失败: " + e.getMessage());
        }
    }
}
```

**日志级别使用：**
- `log.info()` - 关键业务操作（成功）
- `log.warn()` - 异常但可恢复的情况
- `log.error()` - 异常且需要处理的情况
- `log.debug()` - 开发调试信息

---

## 🔌 REST API 设计

### 1. **接口设计原则**

```java
// ✅ 遵循 REST 规范
@PostMapping("/api/knowledge/upload")      // 创建 POST
@GetMapping("/api/knowledge/list")         // 读取 GET
@GetMapping("/api/knowledge/search")       // 查询 GET
@DeleteMapping("/api/knowledge/delete/{id}")  // 删除 DELETE

// ✅ 统一返回格式
{
    "code": 200,
    "message": "success",
    "data": { ... }
}

// ✅ 统一错误响应
{
    "code": 400,
    "message": "用户不能为空",
    "data": null
}
```

### 2. **多部分表单数据处理**

```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Result<KnowledgeFile> upload(@RequestParam("file") MultipartFile file) {
    // MultipartFile 自动处理 multipart/form-data
    String fileName = file.getOriginalFilename();
    byte[] fileData = file.getBytes();
    // ...
}
```

**为什么使用 MultipartFile？**
- Spring 自动处理文件上传
- 自动处理流的打开和关闭
- 可以获取文件名、大小等元数据

---

## 🛠️ 文件处理设计

### 1. **PDF 文本提取**

```java
// 使用 PDFBox 提取文本
PDDocument document = Loader.loadPDF(fileData);  // 从字节数组加载
try {
    if (document.isEncrypted()) {
        log.warn("PDF 文件已加密");
    }
    
    PDFTextStripper stripper = new PDFTextStripper();
    String text = stripper.getText(document);  // 逐页提取文本
    
    return text;  // 保存到数据库
} finally {
    document.close();  // 释放资源
}
```

**为什么选择 PDFBox？**
- 开源、维护活跃
- 纯 Java 实现，跨平台
- 支持 PDF 2.0 标准
- 无需系统依赖

### 2. **文件磁盘管理**

```java
private String saveFileToDisk(String fileName, byte[] fileData) throws IOException {
    // 创建目录
    File uploadDir = new File(uploadPath);
    if (!uploadDir.exists() && !uploadDir.mkdirs()) {
        throw new IOException("无法创建上传目录");
    }
    
    // 生成唯一文件名（防止覆盖）
    String uniqueFileName = UUID.randomUUID() + "_" + fileName;
    String filePath = uploadPath + File.separator + uniqueFileName;
    
    // 写入文件
    try (FileOutputStream fos = new FileOutputStream(filePath)) {
        fos.write(fileData);
    }
    
    return filePath;
}
```

**设计考虑：**
- 使用 UUID 保证文件名唯一
- 保留原始文件名便于识别
- 使用 try-with-resources 自动关闭流
- 异常时不创建空文件

---

## 🚀 性能考虑

### 1. **数据库查询优化**

```sql
-- ❌ 性能差：全表扫描
SELECT * FROM knowledge_file 
WHERE file_name LIKE '%关键词%' OR content LIKE '%关键词%';

-- ✅ 性能好：使用 LIMIT 限制结果
SELECT * FROM knowledge_file 
WHERE user_id = ? AND status = 'READY'
AND (file_name LIKE ? OR content LIKE ?)
LIMIT 50;

-- ✅ 最优：使用 FULLTEXT 索引
SELECT * FROM knowledge_file 
WHERE user_id = ? AND status = 'READY'
AND MATCH(content) AGAINST (? IN BOOLEAN MODE)
LIMIT 50;
```

### 2. **DTO 转换优化**

```java
// 使用 Stream API 进行转换
public List<KnowledgeFileListDTO> listFiles(Long userId) {
    List<KnowledgeFile> files = knowledgeFileMapper.selectByUserId(userId);
    
    return files.stream()
        .map(this::convertToListDTO)  // 只返回必要字段
        .collect(Collectors.toList());
}

private KnowledgeFileListDTO convertToListDTO(KnowledgeFile file) {
    return new KnowledgeFileListDTO(
        file.getId(),
        file.getFileName(),
        // ❌ 不包含 file.getContent()（可能很大）
        file.getFileType(),
        file.getFileSize()
    );
}
```

---

## 🔮 未来扩展设计

### 1. **向量化扩展点**

```java
// 现在：基于关键词搜索
public List<KnowledgeSearchResultDTO> searchByKeyword(Long userId, String keyword) {
    return mapper.searchByKeyword(userId, keyword);
}

// 未来：基于向量相似度搜索
public List<KnowledgeSearchResultDTO> searchByVector(Long userId, String query) {
    // 1. 将查询转换为向量 (使用 Embedding 模型)
    Vector queryVector = embeddingService.embed(query);
    
    // 2. 在向量数据库中查询相似向量 (如 Milvus)
    List<VectorResult> results = vectorDB.search(queryVector, topK=10);
    
    // 3. 转换为 DTO 返回
    return results.stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
}
```

### 2. **异步处理扩展点**

```java
// 现在：同步处理
public KnowledgeFile uploadFile(Long userId, String fileName, byte[] fileData) {
    String content = extractTextFromPDF(fileData);  // 同步阻塞
    // ...
}

// 未来：异步处理
public KnowledgeFile uploadFile(Long userId, String fileName, byte[] fileData) {
    KnowledgeFile file = new KnowledgeFile();
    file.setStatus("PROCESSING");
    mapper.insert(file);
    
    // 发送异步任务到消息队列
    messageQueue.send(new PDFProcessTask(file.getId(), fileData));
    
    return file;
}

// 后台消费者处理
@Async
public void processPendingFiles() {
    PDFProcessTask task = messageQueue.receive();
    String content = extractTextFromPDF(task.getFileData());
    // 更新文件状态和内容
}
```

---

## 📚 总体架构图

```
┌─────────────────────────────────────┐
│         Frontend (React/Vue)         │
│  (上传文件、查看列表、搜索)          │
└────────────────┬────────────────────┘
                 │ HTTP
                 ↓
┌────────────────────────────────────────┐
│    REST API (Spring Web)               │
│  - /api/knowledge/upload (POST)        │
│  - /api/knowledge/list (GET)           │
│  - /api/knowledge/delete (DELETE)      │
│  - /api/knowledge/search (GET)         │
└────────────┬─────────────────────────┘
             │
┌────────────────────────────────────────┐
│    Service Layer                       │
│  - 文件验证与保存                      │
│  - PDF 文本提取 (PDFBox)               │
│  - 关键词搜索                          │
│  - 用户隔离处理                        │
└────────────┬─────────────────────────┘
             │
             ├──────────────────────────┐
             ↓                          ↓
    ┌──────────────┐        ┌──────────────────┐
    │  MyBatis Mapper    │     │  File System     │
    │  (SQL 操作)        │     │  (磁盘存储)      │
    └────────┬─────┘     └──────────────────┘
             ↓
    ┌──────────────┐
    │  MySQL 数据库 │
    │  - 元数据存储 │
    │  - 文本索引   │
    └──────────────┘

扩展方向：
    ┌──────────────────────┐
    │  向量数据库 (Milvus)  │ ← 未来支持语义搜索
    └──────────────────────┘
    
    ┌──────────────────────┐
    │  消息队列 (RabbitMQ)  │ ← 未来支持异步处理
    └──────────────────────┘
```

---

## 🎓 设计总结

| 方面 | 设计决策 | 理由 |
|------|--------|------|
| 架构 | MVC 三层 | 清晰的职责分离，易于维护 |
| 数据访问 | MyBatis | 性能好，支持复杂查询 |
| 安全 | 三层防御 | 用户隔离完善 |
| 文件处理 | 同步 + 磁盘存储 | 快速响应，便于搜索 |
| 搜索 | SQL LIKE + FULLTEXT | 实时性好，支持扩展 |
| API | REST | 标准化，易于集成 |
| 异常处理 | 统一异常体系 | 清晰、可维护、可追踪 |
| 日志 | SLF4J | 标准化，便于分析 |

---

## ✨ 核心设计思想

1. **最小化原则** - 只实现必需功能，为扩展留下空间
2. **用户隔离优先** - 安全是第一考虑
3. **同步优于异步** - 在性能允许的情况下简化复杂度
4. **数据完整性** - 事务管理保证一致性
5. **易于测试** - 依赖注入、分层设计便于单元测试
6. **可观测性** - 完整的日志记录和异常追踪
7. **可扩展性** - 架构设计为未来功能升级留下余地

这样的设计可以保证系统的**稳定性、可维护性、安全性**，同时为未来的**RAG、向量化、异步处理**等功能升级提供了坚实的基础。
