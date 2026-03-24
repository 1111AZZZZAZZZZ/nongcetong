import { useState, useEffect, useRef } from 'react';

// 扩展全局 Window 接口，解决 TS 找不到 SpeechRecognition 的报错
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  // 使用 useRef 存储 recognition 实例
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // 说完一句自动停止
      recognitionRef.current.interimResults = true; // 开启实时结果返回
      recognitionRef.current.lang = 'zh-CN'; // 设定为中文

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

     recognitionRef.current.onerror = (event: any) => {
  // 👉 屏蔽 no-speech 报错，改为普通日志提示
  if (event.error === 'no-speech') {
    console.log('麦克风未检测到声音，已自动关闭待机。');
  } else {
    // 其他真正的错误用 warn 打印，也不会触发大红屏
    console.warn('语音识别状态提示:', event.error); 
  }
  setIsListening(false);
};
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('当前浏览器不支持 Web Speech API');
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript(''); 
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return { isListening, transcript, toggleListening, setTranscript };
};