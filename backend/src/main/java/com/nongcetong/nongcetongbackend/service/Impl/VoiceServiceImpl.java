package com.nongcetong.nongcetongbackend.service.Impl;

import com.nongcetong.nongcetongbackend.service.VoiceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class VoiceServiceImpl implements VoiceService {

    @Value("${asr.proxy.url:}")
    private String asrProxyUrl;

    private final WebClient webClient = WebClient.builder().build();

    @Override
    public String transcribe(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is empty");
        }

        // save to uploads/voice
        Path uploadDir = Paths.get("uploads/voice");
        Files.createDirectories(uploadDir);
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        Path target = uploadDir.resolve(System.currentTimeMillis() + "_" + original);
        try {
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new IOException("failed to save uploaded file", e);
        }

        // If an ASR proxy URL is configured, forward file there as multipart/form-data
        if (asrProxyUrl != null && !asrProxyUrl.isBlank()) {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", target.toFile()).contentType(MediaType.APPLICATION_OCTET_STREAM);
            Mono<String> resp = webClient.post()
                    .uri(asrProxyUrl)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class);
            try {
                // block and return the response body as-is; caller can parse if needed
                return resp.block();
            } catch (Exception e) {
                // forward failure: return a clear message
                return "[asr proxy error] " + e.getMessage();
            }
        }

        // fallback placeholder text
        return "[transcription placeholder] 请配置 asr.proxy.url 以使用真实 ASR 服务";
    }
}
