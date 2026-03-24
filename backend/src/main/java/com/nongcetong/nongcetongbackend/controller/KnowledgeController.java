package com.nongcetong.nongcetongbackend.controller;

import com.nongcetong.nongcetongbackend.entity.KnowledgeFile;
import com.nongcetong.nongcetongbackend.service.KnowledgeService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

	private final KnowledgeService knowledgeService;

	public KnowledgeController(KnowledgeService knowledgeService) {
		this.knowledgeService = knowledgeService;
	}

	@PostMapping("/upload")
	public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
		if (file == null || file.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "file is empty"));
		}

		String original = StringUtils.cleanPath(file.getOriginalFilename());
		// save file to local storage
		Path uploadDir = Paths.get("uploads/knowledge");
		Files.createDirectories(uploadDir);
		Path target = uploadDir.resolve(System.currentTimeMillis() + "_" + original);
		Files.copy(file.getInputStream(), target);

		// extract text (basic PDF support)
		String text = "";
		String lower = original.toLowerCase();
		if (lower.endsWith(".pdf")) {
			try (PDDocument doc = PDDocument.load(target.toFile())) {
				PDFTextStripper stripper = new PDFTextStripper();
				text = stripper.getText(doc);
			} catch (Exception e) {
				text = ""; // fallback to empty
			}
		} else {
			// try reading as text
			try {
				text = Files.readString(target);
			} catch (Exception e) {
				text = "";
			}
		}

		KnowledgeFile kf = new KnowledgeFile();
		kf.setFilename(original);
		kf.setStoragePath(target.toAbsolutePath().toString());
		kf.setContent(text);
		kf.setCreatedAt(LocalDateTime.now());
		knowledgeService.save(kf);

		Map<String, Object> resp = new HashMap<>();
		resp.put("id", kf.getId());
		resp.put("filename", kf.getFilename());
		return ResponseEntity.ok(resp);
	}

	@GetMapping("/list")
	public ResponseEntity<List<KnowledgeFile>> list() {
		List<KnowledgeFile> list = knowledgeService.listAll();
		return ResponseEntity.ok(list);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") Long id) {
		KnowledgeFile kf = knowledgeService.findById(id);
		if (kf == null) {
			return ResponseEntity.notFound().build();
		}
		// delete file on disk
		try {
			if (kf.getStoragePath() != null) {
				File f = new File(kf.getStoragePath());
				if (f.exists()) f.delete();
			}
		} catch (Exception ignored) {
		}
		boolean ok = knowledgeService.deleteById(id);
		return ResponseEntity.ok(Map.of("deleted", ok));
	}

	@GetMapping("/search")
	public ResponseEntity<List<KnowledgeFile>> search(@RequestParam("q") String q) {
		if (q == null || q.isBlank()) return ResponseEntity.badRequest().build();
		List<KnowledgeFile> results = knowledgeService.search(q);
		return ResponseEntity.ok(results);
	}
}
