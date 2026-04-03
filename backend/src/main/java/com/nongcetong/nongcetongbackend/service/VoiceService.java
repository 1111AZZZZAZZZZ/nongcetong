package com.nongcetong.nongcetongbackend.service;

import org.springframework.web.multipart.MultipartFile;

public interface VoiceService {
    /**
     * 接收音频文件，保存并（可选）转发到外部 ASR 服务进行识别，返回识别文本
     */
    String transcribe(MultipartFile file) throws Exception;
}
