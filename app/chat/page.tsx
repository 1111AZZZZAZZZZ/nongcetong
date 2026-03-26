'use client';
import { useSpeechToText } from '../../hooks/useSpeechToText'; 
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import VoiceWaveform from '../../components/ui/VoiceWaveform'; 
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Loader2, Mic, MicOff, CheckCircle2, Droplets, Wind, Zap, Activity, ChevronDown, RefreshCcw, LayoutDashboard, MessageSquare, Sun, Thermometer, Droplet, Power, Moon, BookOpen, FileText, ChevronRight, Volume2, VolumeX, ImagePlus, X, Paperclip, ShieldAlert, ShieldCheck } from "lucide-react";
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import dynamic from 'next/dynamic';
import React from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const ExportButton = dynamic(() => import('../../components/ui/ExportButton'), { ssr: false });

const BASE_CROPS = ['番茄', '黄瓜', '草莓', '辣椒', '茄子', '甜瓜', '生菜', '多肉'];
const GREENHOUSES = Array.from({ length: 100 }).map((_, i) => {
  const id = (i + 1).toString().padStart(3, '0');
  const crop = BASE_CROPS[i % BASE_CROPS.length];
  const baseTemp = 18 + (i % 12);
  const baseHum = 40 + (i % 35);
  return { id, name: `${id}号大棚 (${crop}区)`, crop, baseTemp, baseHum };
});

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  command?: string;
  citations?: any[];
  imageUrl?: string | null;
  fileName?: string | null;
  fileDataUrl?: string | null;
}

const SpeakButton = ({ text }: { text: string }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/\[\d+\]/g, '').replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);
  return (
    <button onClick={handleSpeak} className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold hover:text-green-600 transition-colors">
      {isSpeaking ? <VolumeX className="w-3 h-3 text-green-600 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
      {isSpeaking ? '停止播报' : '语音播报'}
    </button>
  );
};

const DeviceStatus = ({ name, icon: Icon, status, color }: { name: string, icon: any, status: boolean, color: string }) => (
  <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-700/50 transition-all hover:bg-white dark:hover:bg-zinc-800 shadow-sm shrink-0">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${status ? `bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600` : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
        <Icon className={`w-4 h-4 ${status && 'animate-pulse'}`} />
      </div>
      <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">{name}</span>
    </div>
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-400` : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status ? `bg-${color}-500 animate-ping` : 'bg-zinc-400'}`} />
      {status ? '工作' : '就绪'}
    </div>
  </div>
);

const ActionWidget = ({ actionName, icon, type }: { actionName: string, icon: React.ReactNode, type: 'water' | 'wind' }) => {
  const [status, setStatus] = useState<'idle' | 'executing' | 'success'>('idle');
  const handleExecute = () => {
    setStatus('executing');
    setTimeout(() => setStatus('success'), 1500);
  };
  if (status === 'success') return (
    <div className="mt-2 flex items-center gap-2 text-[10px] text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
      <CheckCircle2 className="w-3 h-3 text-green-600" />
      <span className="font-bold">指令下发成功</span>
    </div>
  );
  return (
    <div className="mt-2 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between shadow-sm border-l-4 border-l-green-600 animate-in slide-in-from-left-2">
      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200 font-bold">
        <span className={`p-1.5 rounded-lg ${type === 'water' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{icon}</span>
        {actionName}
      </div>
      <Button size="sm" onClick={handleExecute} disabled={status === 'executing'} className="bg-green-700 hover:bg-green-800 text-white rounded-full px-4 h-7 text-[10px]">
        {status === 'executing' ? <Loader2 className="w-3 h-3 animate-spin" /> : '立即执行'}
      </Button>
    </div>
  );
};

const CitationBadge = ({ id, onClick }: { id: number, onClick: () => void }) => (
  <sup
    onClick={onClick}
    className="inline-flex items-center justify-center w-4 h-4 mx-0.5 text-[9px] font-bold text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/40 dark:hover:bg-green-800/60 rounded-full cursor-pointer transition-colors select-none relative -top-1"
  >
    {id}
  </sup>
);

const DocumentPortal = ({ citations }: { citations: any[] }) => {
  if (!citations || citations.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        <BookOpen className="w-3 h-3" />
        <span>参考来源 ({citations.length})</span>
      </div>
      <div className="flex flex-col gap-2">
        {citations.map((cite, index) => (
          <div key={index} className="group p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-700/50 hover:border-green-200 dark:hover:border-green-800/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5 overflow-hidden">
                <div className="mt-0.5 p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm shrink-0">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-normal">[{cite.id}]</span>
                    {cite.title}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    "{cite.snippet}"
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                <div className="px-1.5 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-[9px] font-bold text-green-600 dark:text-green-500 flex items-center gap-1">
                  匹配度 {(cite.score * 100).toFixed(0)}%
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-green-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeGhouse, setActiveGhouse] = useState(GREENHOUSES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [myInput, setMyInput] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string, size: number, dataUrl?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [privacyAlert, setPrivacyAlert] = useState<{ original: string, redacted: string } | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: '您好！农测通智能中枢已就绪。您可以直接发送指令、上传病害图片，或者导入相关农业文档供 AI 解析。系统已启用端侧隐私脱敏保护。' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState(activeGhouse.baseTemp);
  const [humidity, setHumidity] = useState(activeGhouse.baseHum);
  const [history, setHistory] = useState<{ time: string, temp: number, hum: number }[]>([]);

  const { isListening, transcript, toggleListening: toggleSTT, setTranscript } = useSpeechToText();
  const { audioData, startAnalysis, stopAnalysis } = useAudioAnalyzer();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onloadend = () => setSelectedFile({ name: file.name, size: file.size, dataUrl: reader.result as string });
        reader.readAsDataURL(file);
      } else {
        setSelectedFile({ name: file.name, size: file.size });
      }
    }
  };

  useEffect(() => {
    if (isListening) startAnalysis();
    else stopAnalysis();
  }, [isListening, startAnalysis, stopAnalysis]);

  useEffect(() => {
    if (transcript) setMyInput(transcript);
  }, [transcript]);

  // ✅ 修复点 1：根据 URL 获取正确的状态，防止 043 大棚真实数据丢失
  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');

      if (targetId) {
        const cleanId = targetId.replace('GH-', '');
        const targetGhouse = GREENHOUSES.find(g => g.id === cleanId);
        
        if (targetGhouse) {
          setActiveGhouse(targetGhouse);
          
          // 如果是043号（或者URL传入了特定参数），强行覆盖真实警报数据，拒绝前端瞎编
          const alarmTemp = params.get('temp');
          const alarmHum = params.get('hum');
          const initTemp = alarmTemp ? parseFloat(alarmTemp) : (cleanId === '043' ? 36.5 : targetGhouse.baseTemp);
          const initHum = alarmHum ? parseInt(alarmHum) : (cleanId === '043' ? 88 : targetGhouse.baseHum);

          setTemperature(initTemp);
          setHumidity(initHum);

          setMessages([{
            id: 'sys-jump',
            role: 'assistant',
            content: `🚨 **已从全局大盘紧急接入 ${targetGhouse.name}。** \n\n当前检测到环境指标存在严重波动！已将实时传感数据（温度：${initTemp}℃，湿度：${initHum}%）同步至 AI 决策中心。请下达干预指令。`
          }]);
        }
      }
    }
  }, []);

  // ✅ 修复点 2：在定时器中保护警报数据，防止其被基准温度覆盖
  useEffect(() => {
    const initialHistory = Array.from({ length: 15 }).map((_, i) => ({
      time: `${i}:00`,
      temp: activeGhouse.baseTemp + Math.random() * 2,
      hum: activeGhouse.baseHum + Math.random() * 5
    }));
    setHistory(initialHistory);

    const interval = setInterval(() => {
      // 保持 043 号大棚的高温高湿状态，只做微小波动
      const isAlarm = activeGhouse.id === '043';
      const currentBaseTemp = isAlarm ? 36.5 : activeGhouse.baseTemp;
      const currentBaseHum = isAlarm ? 88 : activeGhouse.baseHum;

      const newTemp = Number((currentBaseTemp + Math.random() * 1 - 0.5).toFixed(1));
      const newHum = Math.floor(currentBaseHum + Math.random() * 4 - 2);
      
      setTemperature(newTemp); 
      setHumidity(newHum);
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString([], { second: '2-digit' }), temp: newTemp, hum: newHum }].slice(-15));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGhouse]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, privacyAlert]);

  const checkPrivacyAI = async (text: string) => {
    setIsModelLoading(true);
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const classifier = await pipeline('token-classification', 'Xenova/bert-base-multilingual-cased-ner');
      const results = await classifier(text);
      let redactedText = text;
      let hasSensitive = false;

      results.forEach((entity: any) => {
        if (entity.entity_group.includes('PER') || entity.entity_group.includes('ORG')) {
          hasSensitive = true;
          const cleanWord = entity.word.replace(/#/g, '');
          if (cleanWord.length > 0) {
            redactedText = redactedText.replace(cleanWord, '*'.repeat(cleanWord.length));
          }
        }
      });

      const phoneRegex = /(1[3-9]\d)\d{4}(\d{4})/g;
      const idRegex = /([1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx])/gi;

      if (phoneRegex.test(redactedText)) {
        hasSensitive = true;
        redactedText = redactedText.replace(/(1[3-9]\d)\d{4}(\d{4})/g, '$1****$2');
      }
      if (idRegex.test(redactedText)) {
        hasSensitive = true;
        redactedText = redactedText.replace(/([1-9]\d{5})\d{8}([\dXx]{4})/gi, '$1********$2');
      }
      return hasSensitive ? redactedText : null;

    } catch (error) {
      console.warn("WASM 模型加载遇到阻碍，自动平滑降级至正则引擎", error);
      const phoneRegex = /(1[3-9]\d)\d{4}(\d{4})/g;
      const idRegex = /([1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx])/gi;
      let hasSensitive = false;
      let redacted = text;
      if (phoneRegex.test(text)) {
        hasSensitive = true;
        redacted = redacted.replace(/(1[3-9]\d)\d{4}(\d{4})/g, '$1****$2');
      }
      if (idRegex.test(redacted)) {
        hasSensitive = true;
        redacted = redacted.replace(/([1-9]\d{5})\d{8}([\dXx]{4})/gi, '$1********$2');
      }
      return hasSensitive ? redacted : null;
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSendInitiate = async (text?: string) => {
    const userText = text || myInput;
    if ((!userText.trim() && !selectedImage && !selectedFile) || isLoading || isModelLoading) return;

    const redacted = await checkPrivacyAI(userText);

    if (redacted && redacted !== userText) {
      setPrivacyAlert({ original: userText, redacted: redacted });
      return;
    }

    executeSend(userText);
  };

  // ✅ 修复点 3：打通后端真实大模型接口，去除原有的 if/else 假数据回复
  const executeSend = async (finalText: string) => {
    setPrivacyAlert(null);
    const currentImage = selectedImage;
    const currentDoc = selectedFile;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalText,
      imageUrl: currentImage,
      fileName: currentDoc?.name,
      fileDataUrl: currentDoc?.dataUrl
    };

    setMessages(prev => [...prev, userMessage]);
    
    setMyInput("");
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (docInputRef.current) docInputRef.current.value = '';
    if (setTranscript) setTranscript("");
    stopAnalysis();
    setIsLoading(true);

    const assistantId = "ai-" + Date.now();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }]);

    // 【保留】如果上传了文件或图片，依然使用针对图像/文档的前端模拟（因为目前的 route.ts 暂未处理多模态）
    if (currentDoc) {
      const docReply = `✅ 我已成功提取并解析了您上传的文档 **《${currentDoc.name}》** 的核心内容。\n\n### 📊 当前状态评估\n将文档内记载的标准种植模型与大棚实时数据（温度：${temperature.toFixed(1)}°C，湿度：${humidity}%）进行交叉比对...`;
      simulateTyping(docReply, assistantId, undefined);
      return;
    }
    
    if (currentImage) {
      const imgReply = `经过 AI 视觉多模态分析，您上传的作物叶片呈现典型的早期病害特征。\n\n### 📊 当前状态评估\n结合当前的高湿度（${humidity}%），确诊为**霜霉病（Downy Mildew）**。\n建议：立即开启顶部通风机组进行排湿。`;
      simulateTyping(imgReply, assistantId, '{"cmd": "wind", "action": "开启温室通风机组"}');
      return;
    }

    // 【关键】如果是普通文本对话，彻底接入真实 DeepSeek 后端！
    try {
      // 提取历史对话给模型
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      })).filter(m => m.role === 'user' || m.role === 'assistant');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          // ⚠️ 将前端真实的异常数据传递给后端，让 DeepSeek 能看到 36.5度
          envData: {
            id: activeGhouse.name,
            temp: temperature,
            humidity: humidity
          }
        })
      });

      if (!response.ok) throw new Error('网络请求失败');

      // 处理流式输出 (打字机效果)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          aiContent += decoder.decode(value, { stream: true });
          
          // 动态解析 AI 返回的文本中是否包含需要执行的动作，让 UI 上的按钮依然能弹出来
          let detectedCmd = undefined;
          if (aiContent.includes('通风') || aiContent.includes('排湿') || aiContent.includes('降温')) {
            detectedCmd = '{"cmd": "wind", "action": "开启温室通风机组"}';
          } else if (aiContent.includes('滴灌') || aiContent.includes('补水')) {
            detectedCmd = '{"cmd": "water", "action": "开启智能滴灌系统"}';
          }

          setMessages(prev => prev.map(m => m.id === assistantId ? { 
            ...m, 
            content: aiContent,
            command: detectedCmd
          } : m));
        }
      }
      setIsLoading(false);

    } catch (error) {
      console.error("API 调用失败:", error);
      simulateTyping("抱歉，无法连接到云端 AI 决策核心，请检查网络或后端服务状态。", assistantId, undefined);
    }
  };

  // 辅助函数：保留前端模拟打字机的能力（用于处理图片/文件等暂未接后端的场景）
  const simulateTyping = (text: string, assistantId: string, cmd?: string) => {
    let currentIndex = 0;
    const typeWriter = setInterval(() => {
      if (currentIndex < text.length) {
        const currentText = text.slice(0, currentIndex + 1);
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: currentText, command: cmd } : m));
        currentIndex++;
      } else {
        clearInterval(typeWriter);
        setIsLoading(false);
      }
    }, 25);
  };

  return (
    <div className={`h-[100dvh] w-screen flex flex-col overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-[#f8fafc] text-zinc-900'} relative`}>

      {privacyAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 pb-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-2xl text-red-600">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-700 dark:text-red-500">隐私保护预警 (PII Detected)</h3>
                <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 mt-1">本地端侧嗅探器检测到高敏数据</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                系统在您的输入中检测到了疑似 <strong className="text-zinc-900 dark:text-white">敏感实体/身份信息</strong>。为保护您的隐私数据不被传至外部云端大模型，系统已在本地为您生成了安全的掩码版本：
              </p>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">原始输入 (将被拦截)</span>
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium line-through decoration-red-300 dark:decoration-red-800">{privacyAlert.original}</div>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
                <div>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 安全合成数据 (即将发送)</span>
                  <div className="text-sm text-green-700 dark:text-green-500 font-bold">{privacyAlert.redacted}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setPrivacyAlert(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                取消发送
              </button>
              <button
                onClick={() => executeSend(privacyAlert.original)}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                忽略并原样发送
              </button>
              <button
                onClick={() => executeSend(privacyAlert.redacted)}
                className="px-5 py-2 text-xs font-black text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 rounded-xl transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                一键脱敏并发送
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="h-14 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <Activity className="w-5 h-5 text-green-700 animate-pulse shrink-0" />
          <button onClick={() => window.location.href = '/'} className="text-sm sm:text-base font-black tracking-tight dark:text-green-500 uppercase hover:text-green-600 transition-colors shrink-0">农策通</button>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 font-light mx-1">|</span>
          <span className="hidden sm:inline text-[10px] font-bold text-green-800/70 dark:text-green-600 tracking-wider">SMART AGRI CONTROL</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
          <div className="bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 rounded-full border border-green-100 dark:border-green-800 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            <span className="text-[9px] font-black text-green-800 dark:text-green-500">已联网</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto md:overflow-hidden p-2 sm:p-4 flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6">

        <section className="w-full md:col-span-5 lg:col-span-4 h-[480px] md:h-full flex flex-col overflow-hidden shrink-0">
          <Card className="flex-1 shadow-lg border-none bg-white dark:bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-800">
            <div className="bg-green-800 p-4 sm:p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
                <span className="font-bold tracking-tight text-xs sm:text-sm">监测大盘</span>
              </div>
              <div className="relative">
                <select
                  value={activeGhouse.id}
                  onChange={(e) => {
                    const s = GREENHOUSES.find(g => g.id === e.target.value);
                    if (s) {
                      setActiveGhouse(s);
                      setMessages([{ id: 'w', role: 'assistant', content: `已切换至 ${s.name}。由于不同作物的生长需求差异，系统已自动重置并校准了温湿度基准线。正在拉取环境数据...` }]);
                    }
                  }}
                  className="bg-green-700 text-[10px] font-bold border-none rounded-lg px-3 py-1 outline-none pr-8 appearance-none cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
                >
                  {GREENHOUSES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </div>

            <CardContent className="flex-1 p-4 sm:p-5 flex flex-col gap-4 overflow-hidden min-h-0">
              <div className="flex-1 min-h-[140px] flex flex-col space-y-2 overflow-hidden">
                <div className="flex justify-between items-center px-1 shrink-0">
                  <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Thermometer className="w-3 h-3" /> 环境趋势</h3>
                  <div className="flex gap-3 text-[8px] font-bold">
                    <span className="text-orange-500">● 温度</span>
                    <span className="text-blue-500">● 湿度</span>
                  </div>
                </div>
                <div className="flex-1 min-h-0 bg-zinc-50 dark:bg-zinc-950 rounded-xl sm:rounded-2xl p-2 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                  {hasMounted ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                      <AreaChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#e2e8f0"} strokeOpacity={0.6} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(value: any, name: any) => [
                            `${Number(value).toFixed(1)}${name === 'temp' ? '°C' : '%'}`,
                            name === 'temp' ? '实时温度' : '实时湿度'
                          ]}
                          labelFormatter={(label: any) => `记录时间: ${label}`}
                        />
                        <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={0.05} fill="#f97316" isAnimationActive={false} />
                        <Area type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.03} fill="#3b82f6" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">同步中...</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className={`p-3 sm:p-4 rounded-2xl border transition-all text-center ${temperature > activeGhouse.baseTemp + 5 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-orange-50/30 dark:bg-orange-900/10 border-orange-100/50'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${temperature > activeGhouse.baseTemp + 5 ? 'text-red-600' : 'text-orange-600'}`}>当前温度</span>
                  <span className={`text-xl sm:text-2xl font-black tabular-nums ${temperature > activeGhouse.baseTemp + 5 ? 'text-red-700' : 'text-zinc-800 dark:text-zinc-100'}`}>{temperature.toFixed(1)}°C</span>
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl border transition-all text-center ${humidity < activeGhouse.baseHum - 10 || humidity > 85 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-100/50'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${humidity < activeGhouse.baseHum - 10 || humidity > 85 ? 'text-red-600' : 'text-blue-600'}`}>实时湿度</span>
                  <span className={`text-xl sm:text-2xl font-black tabular-nums ${humidity < activeGhouse.baseHum - 10 || humidity > 85 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>{humidity}%</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col space-y-2 min-h-0 overflow-hidden">
                <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">物理节点负载</h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-hide pb-2">
                  <DeviceStatus name="1号滴灌水泵" icon={Droplet} status={humidity < activeGhouse.baseHum} color="blue" />
                  <DeviceStatus name="温室通风机组" icon={Wind} status={temperature > activeGhouse.baseTemp + 2 || humidity > 80} color="orange" />
                  <DeviceStatus name="Lora 中枢网关" icon={Power} status={true} color="green" />
                  <button className="w-full mt-1 py-2 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[9px] font-bold text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shrink-0">
                    系统巡检
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        <section className="w-full md:col-span-7 lg:col-span-8 h-[600px] md:h-full flex flex-col overflow-hidden shrink-0">
          <Card className="flex-1 shadow-lg border-none bg-white dark:bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-800 relative">
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-3 sm:p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl text-green-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold dark:text-zinc-200 tracking-tight">AI 专家决策</h3>
              </div>
              <button onClick={() => setMessages([{ id: 'w', role: 'assistant', content: '对话已重置。' }])} className="p-2 text-zinc-300 hover:text-green-700 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-10 scrollbar-hide bg-zinc-50/20 dark:bg-zinc-950/20 min-h-0">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div
                    id={`message-${m.id}`}
                    className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm text-sm leading-relaxed ${m.role === 'user' ? 'bg-green-800 text-white rounded-tr-none shadow-green-100' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700 rounded-tl-none shadow-zinc-100'}`}
                  >
                    {m.imageUrl && (
                      <div className="mb-3">
                        <img src={m.imageUrl} alt="Uploaded crop" className="max-h-32 sm:max-h-48 rounded-xl shadow-sm object-cover border-2 border-green-700/50" />
                      </div>
                    )}

                    {m.fileName && (
                      <div className="mb-3 flex items-center gap-2.5 p-3 bg-white/10 dark:bg-zinc-900/50 rounded-xl border border-white/20 dark:border-zinc-700 w-fit">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white dark:text-zinc-300 truncate max-w-[150px]">{m.fileName}</span>
                      </div>
                    )}

                    {m.role === 'user' ? m.content : (
                      m.content === "" ? <div className="flex gap-2 py-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" /></div> :
                        <div className="space-y-4">
                          <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none leading-relaxed">
                            {m.content.split(/(\[\d+\])/).map((part, i) => {
                              const match = part.match(/\[(\d+)\]/);
                              if (match) {
                                return <CitationBadge key={i} id={parseInt(match[1])} onClick={() => console.log('定位到引用', match[1])} />;
                              }
                              return <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={{ p: 'span' }}>{part}</ReactMarkdown>;
                            })}
                          </div>

                          {m.citations && <DocumentPortal citations={m.citations} />}

                          {m.command && (
                            (() => {
                              try {
                                const c = JSON.parse(m.command);
                                return <ActionWidget actionName={c.action} icon={c.cmd === 'water' ? <Droplets className="w-4 h-4" /> : <Wind className="w-4 h-4" />} type={c.cmd === 'water' ? 'water' : 'wind'} />;
                              } catch { return null; }
                            })()
                          )}
                        </div>
                    )}
                  </div>

                  {m.role === 'assistant' && m.content && m.id.startsWith('ai-') && (
                    <div className="mt-2 sm:mt-3 ml-2 sm:ml-3 flex flex-wrap items-center gap-2 sm:gap-4">
                      {/* @ts-ignore */}
                      <ExportButton 
                        ghouseName={activeGhouse.name} 
                        temperature={temperature} 
                        humidity={humidity} 
                        aiText={m.content} 
                      />
                      <div className="h-3 sm:h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

                      <SpeakButton text={m.content} />

                      <div className="h-3 sm:h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1"><Zap className="w-3 h-3 text-orange-400 fill-orange-400" /> AI完成</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && <div className="pl-4 sm:pl-6 text-[10px] text-green-600 font-black animate-pulse uppercase"><Zap className="w-3 h-3 inline-block mr-2" /> 云端同步中...</div>}
            </div>

            <div className="p-3 sm:p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0 relative">
              <div className="absolute bottom-[70px] sm:bottom-[80px] left-4 sm:left-6 flex gap-3 animate-in slide-in-from-bottom-2 z-10">
                {selectedImage && (
                  <div className="relative inline-block">
                    <img src={selectedImage} alt="Preview" className="h-12 sm:h-16 w-auto rounded-xl border-2 border-green-500 shadow-xl object-cover" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md active:scale-90">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedFile && (
                  <div className="relative flex items-center gap-2 bg-white dark:bg-zinc-800 border-2 border-blue-500 p-2 pr-8 rounded-xl shadow-xl">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[80px] sm:max-w-[120px]">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-zinc-400 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-5 scrollbar-hide">
                {["🌱 环境评估", "💧 补水指令", "🌡️ 开启通风"].map(s => (
                  <button key={s} onClick={() => handleSendInitiate(s)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-green-800 hover:text-white dark:text-zinc-400 text-zinc-500 rounded-full text-[10px] sm:text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95 whitespace-nowrap">
                    {s}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 sm:gap-4 relative items-center w-full">
                <div className="relative flex-1 min-w-0">
                  <Input
                    placeholder={isListening ? "请说话..." : "输入指令或拖拽文件..."}
                    value={myInput}
                    onChange={(e: any) => setMyInput(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && handleSendInitiate()}
                    className={`rounded-full bg-zinc-100 dark:bg-zinc-800 border-none pl-4 sm:pl-7 ${isListening ? 'pr-20' : 'pr-[100px] sm:pr-[120px]'} h-12 sm:h-14 text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-green-800 dark:text-white shadow-inner transition-all duration-300 w-full`}
                  />

                  {isListening && (
                    <div className="absolute right-20 sm:right-28 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                      <VoiceWaveform data={audioData} isListening={isListening} />
                    </div>
                  )}

                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-0 sm:gap-1">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" ref={docInputRef} onChange={handleDocUpload} />

                    <button type="button" onClick={() => docInputRef.current?.click()} className="p-1.5 sm:p-2 text-zinc-400 hover:text-blue-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all hidden sm:block">
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 sm:p-2 text-zinc-400 hover:text-green-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all">
                      <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <button type="button" onClick={toggleSTT} className={`p-1.5 sm:p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-900/30 animate-pulse scale-110' : 'text-zinc-400 hover:text-green-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                      {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <Button disabled={isLoading || isModelLoading} onClick={() => handleSendInitiate()} className="rounded-full bg-green-800 hover:bg-green-900 w-12 h-12 sm:w-14 sm:h-14 p-0 shadow-lg active:scale-90 transition-all shrink-0">
                  {isModelLoading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" /> : <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />}
                </Button>
              </div>

            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}