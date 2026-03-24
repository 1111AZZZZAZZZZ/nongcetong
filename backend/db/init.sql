-- SQL to create knowledge_file table used by KnowledgeFileMapper
CREATE TABLE IF NOT EXISTS knowledge_file (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(512) NOT NULL,
  storage_path VARCHAR(1024),
  content LONGTEXT,
  created_at DATETIME
);
