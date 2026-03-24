import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>(new Array(16).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 👉 使用 useCallback 冻结函数引用
  const startAnalysis = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 唤醒挂起的音频上下文
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 64; 
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const tick = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        
        const normalizedData = Array.from(dataArrayRef.current.slice(0, 16)).map(
          value => value / 255.0
        );
        
        setAudioData(normalizedData);
        animationFrameIdRef.current = requestAnimationFrame(tick);
      };
      tick();

    } catch (err) {
      console.error("无法启动音频分析:", err);
    }
  }, []); // 👈 依赖项为空数组，意味着函数永远不重新创建

  // 👉 使用 useCallback 冻结函数引用
  const stopAnalysis = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // 因为函数被冻结了，这里的 setAudioData 再也不会触发外部的无限循环
    setAudioData(new Array(16).fill(0));
  }, []); // 👈 同样为空数组

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return { audioData, startAnalysis, stopAnalysis };
};