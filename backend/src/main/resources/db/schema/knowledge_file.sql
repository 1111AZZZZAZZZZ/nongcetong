-- 知识库文件表
CREATE TABLE IF NOT EXISTS knowledge_file (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_path VARCHAR(500) NOT NULL COMMENT '文件保存路径',
  file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
  file_type VARCHAR(50) NOT NULL COMMENT '文件类型：PDF, MARKDOWN, TXT',
  status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED' COMMENT '状态：UPLOADED-已上传, PROCESSING-处理中, READY-就绪, FAILED-失败',
  content LONGTEXT COMMENT '文件文本内容',
  error_message VARCHAR(1000) COMMENT '处理失败的错误信息',
  upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  processed_time DATETIME COMMENT '处理完成时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_user_status (user_id, status),
  FULLTEXT INDEX ft_file_name (file_name),
  FULLTEXT INDEX ft_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库文件表';
