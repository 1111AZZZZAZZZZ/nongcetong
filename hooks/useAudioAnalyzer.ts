import { useState, useRef, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>(new Array(16).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();

  const stopAnalysis = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setAudioData(new Array(16).fill(0));
  }, []);

  const startAnalysis = useCallback(async () => {
    try {
      stopAnalysis();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyzerRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        const step = Math.floor(bufferLength / 16);
        const points = [];
        for (let i = 0; i < 16; i++) {
          points.push(dataArray[i * step] || 0);
        }
        setAudioData(points);
        requestRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error('麦克风权限被拒绝或音频初始化失败', err);
    }
  }, [stopAnalysis]);

  return { audioData, startAnalysis, stopAnalysis };
};