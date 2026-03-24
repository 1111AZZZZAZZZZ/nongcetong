package com.nongcetong.nongcetongbackend.mapper;

import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface KnowledgeFileMapper {

	@Insert("INSERT INTO knowledge_file(filename, storage_path, content, created_at) VALUES(#{filename}, #{storagePath}, #{content}, #{createdAt})")
	@Options(useGeneratedKeys = true, keyProperty = "id")
	int insert(KnowledgeFile file);

	@Select("SELECT id, filename, storage_path AS storagePath, content, created_at AS createdAt FROM knowledge_file ORDER BY created_at DESC")
	List<KnowledgeFile> findAll();

	@Select("SELECT id, filename, storage_path AS storagePath, content, created_at AS createdAt FROM knowledge_file WHERE id = #{id}")
	KnowledgeFile findById(@Param("id") Long id);

	@Select("SELECT id, filename, storage_path AS storagePath, content, created_at AS createdAt FROM knowledge_file WHERE content LIKE CONCAT('%',#{keyword},'%') ORDER BY created_at DESC")
	List<KnowledgeFile> searchByKeyword(@Param("keyword") String keyword);

	@Delete("DELETE FROM knowledge_file WHERE id = #{id}")
	int deleteById(@Param("id") Long id);
}
