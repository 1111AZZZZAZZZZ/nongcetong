package com.nongcetong.nongcetongbackend.service;

import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;

import java.util.List;

public interface KnowledgeService {
	KnowledgeFile save(KnowledgeFile file);
	List<KnowledgeFile> listAll();
	KnowledgeFile findById(Long id);
	List<KnowledgeFile> search(String keyword);
	boolean deleteById(Long id);
}
