知识库与语音模块（本地开发说明）

后端新增了知识库和语音模块接口，快速说明如下：

- 上传文档：POST /api/knowledge/upload (form-data file)
- 列表：GET /api/knowledge/list
- 删除：DELETE /api/knowledge/delete/{id}
- 关键字搜索：GET /api/knowledge/search?q=关键词

上传将把文件保存到后端 `uploads/knowledge` 目录，并尝试解析 PDF 文本（使用 Apache PDFBox），解析结果存入数据库表 `knowledge_file`。

示例建表 SQL 在仓库 `backend/db/init.sql`，请先执行该 SQL 创建表。

语音模块（开发占位）

- 语音转写（占位）：POST /api/voice/transcribe (form-data file)

当前 `/api/voice/transcribe` 返回占位文本，真实环境请接入第三方 ASR 服务（例如科大讯飞、阿里云、百度等），或实现后端代理转发。

注意：请在 `src/main/resources` 创建 `application-dev.properties` 或在 `application.properties` 中配置数据库连接信息。
