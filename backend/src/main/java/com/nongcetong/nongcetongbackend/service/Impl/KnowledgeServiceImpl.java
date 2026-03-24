package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import com.nongcetong.nongcetongbackend.mapper.KnowledgeFileMapper;
import com.nongcetong.nongcetongbackend.service.KnowledgeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KnowledgeServiceImpl implements KnowledgeService {

	private final KnowledgeFileMapper mapper;

	public KnowledgeServiceImpl(KnowledgeFileMapper mapper) {
		this.mapper = mapper;
	}

	@Override
	public KnowledgeFile save(KnowledgeFile file) {
		mapper.insert(file);
		return file;
	}

	@Override
	public List<KnowledgeFile> listAll() {
		return mapper.findAll();
	}

	@Override
	public KnowledgeFile findById(Long id) {
		return mapper.findById(id);
	}

	@Override
	public List<KnowledgeFile> search(String keyword) {
		return mapper.searchByKeyword(keyword);
	}

	@Override
	public boolean deleteById(Long id) {
		return mapper.deleteById(id) > 0;
	}
}
