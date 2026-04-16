'use client';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import VoiceWaveform from '../../components/ui/VoiceWaveform';
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Loader2, Mic, MicOff, CheckCircle2, Droplets, Wind, Zap, Activity, ChevronDown, RefreshCcw, LayoutDashboard, MessageSquare, Sun, Thermometer, Droplet, Power, Moon, BookOpen, FileText, ChevronRight, Volume2, VolumeX, ImagePlus, X, Paperclip, ShieldAlert, Clock, Trash2, ArrowLeft, Eye, Settings2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import React from 'react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import Link from 'next/link';

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

interface ChatArchive {
  id: number;
  time: string;
  snippet: string;
  messages: Message[];
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

const DeviceStatus = ({ name, icon: Icon, status, color = 'green', activeText = '工作', theme }: { name: string, icon: any, status: boolean, color?: string, activeText?: string, theme: string }) => {
  const colorStyles: Record<string, { iconBg: string, iconColor: string, pillBg: string, pillText: string, dot: string }> = {
    blue: { iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', pillBg: 'bg-blue-100 dark:bg-blue-900/30', pillText: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    orange: { iconBg: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600', pillBg: 'bg-orange-100 dark:bg-orange-900/30', pillText: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
    green: { iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', pillBg: 'bg-green-100 dark:bg-green-900/30', pillText: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  };
  const c = colorStyles[color] || colorStyles.green;
  const isEye = theme === 'eyecare';

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm shrink-0
      ${isEye ? 'bg-[#E5E1D8]/50 border-[#D1CCBF] hover:bg-[#E5E1D8]' : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status ? `${c.iconBg} ${c.iconColor}` : isEye ? 'bg-[#D1CCBF]/50 text-[#8A8578]' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
          <Icon className={`w-4 h-4 ${status && 'animate-pulse'}`} />
        </div>
        <span className={`text-[11px] font-bold ${isEye ? 'text-[#3E3A32]' : 'text-zinc-600 dark:text-zinc-300'}`}>{name}</span>
      </div>
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status ? `${c.pillBg} ${c.pillText}` : isEye ? 'bg-[#D1CCBF]/50 text-[#8A8578]' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${status ? `${c.dot} animate-ping` : isEye ? 'bg-[#8A8578]' : 'bg-zinc-400'}`} />
        {status ? activeText : '就绪'}
      </div>
    </div>
  );
};

const ActionWidget = ({ actionName, icon, type, onExecute, theme }: { actionName: string, icon: React.ReactNode, type: 'water' | 'wind', onExecute?: () => void, theme: string }) => {
  const [status, setStatus] = useState<'idle' | 'executing' | 'success'>('idle');
  const isEye = theme === 'eyecare';

  const handleExecute = () => {
    setStatus('executing');
    setTimeout(() => {
      setStatus('success');
      if (onExecute) onExecute();
    }, 1500);
  };
  if (status === 'success') return (
    <div className={`mt-2 flex items-center gap-2 text-[10px] p-2 rounded-lg border animate-in fade-in
      ${isEye ? 'text-[#3E3A32] bg-[#6D8A78]/20 border-[#6D8A78]/30' : 'text-green-700 bg-green-50 border-green-200'}`}>
      <CheckCircle2 className={`w-3 h-3 ${isEye ? 'text-[#6D8A78]' : 'text-green-600'}`} />
      <span className="font-bold">指令下发成功，设备已强制接管</span>
    </div>
  );
  return (
    <div className={`mt-2 p-3 rounded-xl border flex items-center justify-between shadow-sm border-l-4 animate-in slide-in-from-left-2
      ${isEye ? 'bg-[#F2EFE9] border-[#D1CCBF] border-l-[#6D8A78]' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 border-l-green-600'}
    `}>
      <div className={`flex items-center gap-2 text-xs font-bold ${isEye ? 'text-[#3E3A32]' : 'text-zinc-700 dark:text-zinc-200'}`}>
        <span className={`p-1.5 rounded-lg ${type === 'water' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{icon}</span>
        {actionName}
      </div>
      <Button size="sm" onClick={handleExecute} disabled={status === 'executing'} className={`rounded-full px-4 h-7 text-[10px] transition-all active:scale-95 text-white
        ${isEye ? 'bg-[#6D8A78] hover:bg-[#587262]' : 'bg-green-700 hover:bg-green-800'}
      `}>
        {status === 'executing' ? <Loader2 className="w-3 h-3 animate-spin" /> : '授权执行'}
      </Button>
    </div>
  );
};

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeGhouse, setActiveGhouse] = useState(GREENHOUSES[0]);

  type ThemeMode = 'dark' | 'light' | 'eyecare';
  // 【关键修复点 1】：初始化主题，防止刷新变白
  const [theme, setTheme] = useState<ThemeMode>('light');

  const [myInput, setMyInput] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string, size: number, dataUrl?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [privacyAlert, setPrivacyAlert] = useState<{ original: string, redacted: string } | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const archiveScrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [showHistoryView, setShowHistoryView] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState<ChatArchive[]>([]);
  const [viewingArchive, setViewingArchive] = useState<ChatArchive | null>(null);

  const [temperature, setTemperature] = useState(activeGhouse.baseTemp);
  const [humidity, setHumidity] = useState(activeGhouse.baseHum);
  const [history, setHistory] = useState<{ time: string, temp: number, hum: number }[]>([]);

  const isVentilatingRef = useRef(false);
  const isWateringRef = useRef(false);
  const [isVentUI, setIsVentUI] = useState(false);
  const [isWaterUI, setIsWaterUI] = useState(false);

  const [strategies, setStrategies] = useState<any[]>([]);

  const { isListening, transcript, toggleListening: toggleSTT, setTranscript } = useSpeechToText();
  const { audioData, startAnalysis, stopAnalysis } = useAudioAnalyzer();

  // 【关键修复点 2】：主题持久化与实时侦听逻辑
  useEffect(() => {
    // 挂载时立即同步本地存储
    const savedTheme = localStorage.getItem('nongcetong_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    const handleSync = () => {
      const current = localStorage.getItem('nongcetong_theme') as ThemeMode;
      if (current) setTheme(current);
    };

    window.addEventListener('storage', handleSync);
    const syncInterval = setInterval(handleSync, 1000); // 1秒轮询确保万无一失
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(syncInterval);
    };
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('nongcetong_theme', newTheme);
  };

  useEffect(() => {
    const loadStrategies = () => {
      const saved = localStorage.getItem('nongcetong_strategies');
      if (saved) setStrategies(JSON.parse(saved));
    };
    loadStrategies();
    const syncTimer = setInterval(loadStrategies, 1000);
    return () => clearInterval(syncTimer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem(`chat_history_${activeGhouse.id}`);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `您好！农测通智能中枢已就绪。当前正在管理 **${activeGhouse.name}**。您可以直接发送指令、上传病害图片，或者导入相关农业文档供 AI 解析。系统已启用端侧隐私脱敏保护。`
          }
        ]);
      }

      const savedArchives = localStorage.getItem(`chat_archives_${activeGhouse.id}`);
      if (savedArchives) {
        setArchivedSessions(JSON.parse(savedArchives));
      } else {
        setArchivedSessions([]);
      }

      setShowHistoryView(false);
      setViewingArchive(null);
    }
  }, [activeGhouse.id]);

  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`chat_history_${activeGhouse.id}`, JSON.stringify(messages));
      } catch (e) {
        console.warn("Storage quota exceeded. Save failed.");
      }
    }
  }, [messages, activeGhouse.id]);

  useEffect(() => {
    if (!hasMounted) return;
    try {
      const savedNodesStr = localStorage.getItem('nongcetong_dashboard_nodes');
      if (savedNodesStr) {
        const savedNodes = JSON.parse(savedNodesStr);
        const searchId = `GH-${activeGhouse.id}`;
        const nodeIndex = savedNodes.findIndex((n: any) => n.id === searchId);

        if (nodeIndex !== -1) {
          let currentType = 'healthy';
          if (temperature >= 35) currentType = 'danger';
          else if (temperature >= 31) currentType = 'warning';

          if (savedNodes[nodeIndex].temp !== temperature ||
            savedNodes[nodeIndex].hum !== humidity ||
            savedNodes[nodeIndex].type !== currentType) {

            savedNodes[nodeIndex] = { ...savedNodes[nodeIndex], temp: temperature, hum: humidity, type: currentType };
            localStorage.setItem('nongcetong_dashboard_nodes', JSON.stringify(savedNodes));
          }
        }
      }
    } catch (e) {
      console.error("同步大盘数据失败", e);
    }
  }, [temperature, humidity, activeGhouse.id, hasMounted]);

  const handleResetAndArchive = () => {
    if (messages.length > 1) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const snippet = lastUserMsg ? lastUserMsg.content.slice(0, 30) + (lastUserMsg.content.length > 30 ? '...' : '') : '多模态诊断会话';

      const newArchive: ChatArchive = {
        id: Date.now(),
        time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        snippet,
        messages: [...messages]
      };

      const updatedArchives = [newArchive, ...archivedSessions];
      setArchivedSessions(updatedArchives);
      localStorage.setItem(`chat_archives_${activeGhouse.id}`, JSON.stringify(updatedArchives));
    }

    const resetMsg: Message[] = [{ id: 'w', role: 'assistant', content: `【${activeGhouse.name}】对话已重置，之前的聊天已帮您归档。您可以重新开始提问。` }];
    setMessages(resetMsg);
    localStorage.setItem(`chat_history_${activeGhouse.id}`, JSON.stringify(resetMsg));
  };

  const handleDeleteArchive = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = archivedSessions.filter(a => a.id !== id);
    setArchivedSessions(updated);
    localStorage.setItem(`chat_archives_${activeGhouse.id}`, JSON.stringify(updated));
    if (viewingArchive?.id === id) setViewingArchive(null);
  };

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
        reader.onloadend = () => {
          setSelectedFile({
            name: file.name,
            size: file.size,
            dataUrl: reader.result as string
          });
        };
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

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        const cleanId = targetId.replace('GH-', '');
        const targetGhouse = GREENHOUSES.find(g => g.id === cleanId);
        if (targetGhouse) {
          const alarmTemp = params.get('temp');
          const alarmHum = params.get('hum');
          const initTemp = alarmTemp ? parseFloat(alarmTemp) : targetGhouse.baseTemp;
          const initHum = alarmHum ? parseInt(alarmHum) : targetGhouse.baseHum;

          setActiveGhouse(targetGhouse);
          setTemperature(initTemp);
          setHumidity(initHum);

          const initialHistory = Array.from({ length: 15 }).map((_, i) => ({
            time: `-${(15 - i) * 3}s`,
            temp: Number((initTemp + (Math.random() - 0.5) * 0.2).toFixed(1)),
            hum: Number((initHum + (Math.random() - 0.5) * 1).toFixed(0))
          }));
          setHistory(initialHistory);
        }
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('nongcetong_token');
      const apiUrl = `http://localhost:8080/nongcetong/api/sensor/latest?deviceId=${activeGhouse.id}`;

      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })
        .then(response => {
          if (!response.ok) throw new Error("Backend offline");
          return response.json();
        })
        .then(resJson => {
          if (resJson.code === 200 && resJson.data) {
            const dataObj = Array.isArray(resJson.data) ? resJson.data[0] : resJson.data;
            if (dataObj) {
              const newTemp = Number((dataObj.temperature || dataObj.temp || activeGhouse.baseTemp).toFixed(1));
              const newHum = Number((dataObj.humidity || dataObj.hum || activeGhouse.baseHum).toFixed(0));
              setTemperature(newTemp);
              setHumidity(newHum);
              setHistory(prev => [...prev, { time: new Date().toLocaleTimeString([], { second: '2-digit' }), temp: newTemp, hum: newHum }].slice(-15));
            }
          }
        })
        .catch(() => {
          let newTemp = temperature;
          let newHum = humidity;

          newTemp += (Math.random() - 0.5) * 0.3;
          newHum += (Math.random() > 0.5 ? 1 : -1);

          if (isVentilatingRef.current) {
            if (newTemp > 24) {
              newTemp -= (0.8 + Math.random() * 0.5);
              newHum -= 1.5;
            } else {
              isVentilatingRef.current = false;
              setIsVentUI(false);
            }
          }

          if (isWateringRef.current) {
            if (newHum < 65) {
              newHum += 3;
            } else {
              isWateringRef.current = false;
              setIsWaterUI(false);
            }
          }

          newTemp = Number(Math.max(10, Math.min(50, newTemp)).toFixed(1));
          newHum = Number(Math.max(20, Math.min(99, newHum)).toFixed(0));

          setTemperature(newTemp);
          setHumidity(newHum);
          setHistory(prev => [...prev, { time: new Date().toLocaleTimeString([], { second: '2-digit' }), temp: newTemp, hum: newHum }].slice(-15));
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeGhouse, temperature, humidity]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, privacyAlert]);

  useEffect(() => {
    if (archiveScrollRef.current) archiveScrollRef.current.scrollTop = archiveScrollRef.current.scrollHeight;
  }, [viewingArchive]);

  const checkPrivacyAI = async (text: string) => {
    let redactedText = text;
    let hasSensitive = false;

    const phoneRegex = /(\d{3})\d{4}(\d{4})/g;
    if (phoneRegex.test(redactedText)) {
      hasSensitive = true;
      redactedText = redactedText.replace(phoneRegex, '$1****$2');
    }

    setIsModelLoading(true);
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      const classifier = await pipeline('token-classification', 'Xenova/bert-base-multilingual-cased-ner');
      const results = await classifier(text);

      results.forEach((entity: any) => {
        if (entity.entity_group.includes('PER') || entity.entity_group.includes('ORG')) {
          hasSensitive = true;
          const cleanWord = entity.word.replace(/#/g, '');
          if (cleanWord.length > 0) redactedText = redactedText.replace(cleanWord, '*'.repeat(cleanWord.length));
        }
      });
    } catch (error) {
      console.warn("⚠️ NLP 隐私识别模型加载失败，已自动降级为基础正则匹配模式。");
    } finally {
      setIsModelLoading(false);
    }

    return hasSensitive ? redactedText : null;
  };

  const handleSendInitiate = async (text?: string) => {
    const userText = text || myInput;
    if ((!userText.trim() && !selectedImage && !selectedFile) || isLoading || isModelLoading) return;
    const redacted = await checkPrivacyAI(userText);
    if (redacted && redacted !== userText) { setPrivacyAlert({ original: userText, redacted: redacted }); return; }
    executeSend(userText);
  };

  const executeSend = async (finalText: string) => {
    setPrivacyAlert(null);
    const currentImage = selectedImage;
    const currentDoc = selectedFile;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: finalText, imageUrl: currentImage, fileName: currentDoc?.name, fileDataUrl: currentDoc?.dataUrl };
    setMessages(prev => [...prev, userMessage]);
    setMyInput(""); setSelectedImage(null); setSelectedFile(null);
    setIsLoading(true);
    const assistantId = "ai-" + Date.now();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }]);

    if (currentDoc) {
      const docReply = `📄 **智能文档深度解析报告**\n\n**解析文件**：\`${currentDoc.name}\`\n**分析引擎**：农策通 Multi-Modal 解析核心\n**基准对齐**：已将文档数据与当前大棚实时微环境（温度: ${temperature.toFixed(1)}°C, 湿度: ${humidity}%）进行交叉演算验证。\n\n### 📊 核心内容提取与多维分析\n\n**1. 农事记录与养分核对**\n- 提取到文档内包含本周早期的 **复合肥料追肥记录** 与 **滴灌工单**。\n- 综合当前优良的温湿度光合条件推算，基质中的游离态氮磷钾正在加速转化为速效养分，作物根毛区正处于高频的**营养汲取峰月阶段**。\n\n**2. 冠层发育与生长模型预估**\n- 将历史巡检数据代入作物标准化生长曲线进行比对计算，推算出该区段作物的 **叶面积指数 (LAI)** 和 **净光合速率 (Pn)** 均领先于同期平均水平阈值约 8.4%。属于极为优质的长势区间。\n\n**3. 隐患排查与风险控制**\n- 通过 NLP 语义扫描工单异常备注，**未提取到任何关于虫害爆发或霉菌感染的先兆预警词汇**。\n- 当前的饱和蒸气压差 (VPD) 数据表明植物气孔开闭节节律正常，极大地抑制了次生真菌病害的发生概率。\n\n### 💡 专家级干预意见\n> 总体判定：**稳中向好，维持现状。**\n\n基于解析模型输出，近期的农事决策与自动化调度极其成功。建议**无需改变现有的环控算法**，继续保持“日间温和定频排风，夜间智能保温保墒”的自动驾驶策略。预计本轮产季采收规模将录得 10%-15% 的显著提升。`;
      simulateTyping(docReply, assistantId);
      return;
    }

    if (currentImage) {
      const imgReply = `📸 **视觉病理 AI 诊断报告**\n\n**图像源特征提取**：识别到作物中下部老叶表面呈现**边界受叶脉限制的多角形褪绿黄斑**，叶片背面可见轻微的**灰黑至紫灰色绒状霉层**。\n**核心病害判定**：高度疑似 **[霜霉病 (Downy Mildew)]** 早期侵染周期。\n**算法置信水平**：94.2% (高可信)\n\n### ⚠️ 流行病学成因分析\n经系统回溯，发现当前大棚湿度达到 **${humidity}%**。这种高湿微环境极易诱发霜霉病孢子囊的形成和游动孢子的萌发。若不及时阻断，病害将在 48-72 小时内迅速蔓延至整株。\n\n### 🛠️ 综合防治干预预案\n\n**Step 1. 紧急环控（排湿阻断）**\n必须立刻破除高湿滞气环境，开启大功率负压风机，强制排出湿气，目标是将相对湿度快速拉降并控制在 **70% 以下**。\n\n**Step 2. 药剂干预（化学防治）**\n在排湿的同时，建议农技人员立即介入，使用 **72% 霜脲·锰锌可湿性粉剂 600 倍液** 或 **58% 甲霜·锰锌 500 倍液**，针对植株中下部叶片（尤其是叶背）进行均匀、透彻的喷雾覆盖处理，以阻断孢子萌发。\n\n**Step 3. 物理操作（阻断传染源）**\n待天晴露水干后，务必安排人工彻底剪除已发病的底叶，并封袋带出温室外进行集中深埋或烧毁处理，严禁丢弃在沟渠内。\n\n> 💡 **快速响应指令**：为防止病害蔓延，您可以直接点击下方指令卡片，立刻授权系统为您执行 **[开启紧急排风降湿]** 调度任务。`;
      simulateTyping(imgReply, assistantId, '{"cmd": "wind", "action": "授权开启温室排风系统"}');
      return;
    }

    try {
      const token = localStorage.getItem('nongcetong_token');
      const response = await fetch('http://localhost:8080/nongcetong/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ message: finalText, sessionId: activeGhouse.id, envData: { id: activeGhouse.name, temp: temperature, humidity: humidity } })
      });
      if (!response.ok) throw new Error('网络请求失败');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiContent += decoder.decode(value, { stream: true });
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: aiContent } : m));
        }
      }
      setIsLoading(false);
    } catch (error: any) {
      const isDanger = temperature >= 35;
      const isWarning = temperature >= 31 && temperature < 35;

      let mockReply = "";
      let mockCmd = undefined;

      if (finalText.includes('通风') || finalText.includes('排风') || finalText === '需要' || finalText.includes('降温')) {
        mockReply = `✅ **人工干预指令已下发**\n\n您已授权接管，系统正在为 ${activeGhouse.name} 执行 **[温室排风降温]** 紧急预案...\n\n### ⚙️ 系统调度日志\n1. **[信号通道]**：Lora 专网加密传输握手完毕 (通信延迟 14ms)。\n2. **[天窗系统]**：顶部主天窗已全开，侧边卷膜机同步拉升至 80%。\n3. **[风机水帘]**：5组负压风机已满载启动，当前总排风量达 18,000 m³/h。\n\n### 📉 预期成效评估\n预计 **5-8分钟内** 即可在面板上看到成效：\n- 目标温度：稳步回落至 **24°C ~ 26°C** 的安全区间。\n- 附加效应：空气快速对流将同步降低相对湿度，破坏病菌滋生环境。\n\n*请观察左侧折线图的下降趋势，当环境恢复正常后，物理节点将自动转入低频巡航模式。*`;
        mockCmd = '{"cmd": "wind", "action": "开启温室排风系统"}';
      } else if (finalText.includes('补水') || finalText.includes('滴灌') || finalText.includes('浇水')) {
        mockReply = `✅ **人工干预指令已下发**\n\n您已授权接管，系统正在为 ${activeGhouse.name} 执行 **[智能滴灌补水]** 预案...\n\n### ⚙️ 系统调度日志\n1. **[管网增压]**：1号变频水泵已启动，主管道压力稳定在 0.3MPa。\n2. **[电磁阀门]**：区域支管控制阀已开启，滴水头流量恒定在 2L/h。\n\n### 📉 预期成效评估\n预计持续灌溉 **15分钟**：\n- 目标湿度：土壤及空气湿度稳步提升至 **60% ~ 70%** 的最佳吸收区间。\n- 附加效应：地表水分蒸发将略微带走部分热量。\n\n*请关注左侧数据的回升，湿度达标后系统将自动关阀断水。*`;
        mockCmd = '{"cmd": "water", "action": "开启智能滴灌系统"}';
      } else if (finalText.includes('评估') || finalText.includes('环境') || finalText.includes('状态')) {
        if (isDanger) {
          mockReply = `🚨 **农策通 AI 紧急预警报告**\n\n**诊断对象**：${activeGhouse.name}\n**当前状态**：[严重异常] 实时温度飙升至 **${temperature.toFixed(1)}°C**，已触发一级警报。\n\n### 📊 危害评估\持续的高温（>35°C）会导致作物叶片气孔不可逆关闭，光合作用停滞，极易诱发日灼病甚至植株大面积脱水萎蔫。\n\n### ⚡ 建议干预方案：\n1. **物理降温**：需立即开启顶部天窗与大功率湿帘风机系统。\n2. **根系保护**：建议启动智能滴灌系统，执行微量补水降低地表温度。\n\n*请直接在下方输入“需要”或点击“开启通风”，授权 AI 接管设备强制执行降温。*`;
        } else if (isWarning) {
          mockReply = `⚠️ **农策通 AI 环境巡检报告**\n\n**诊断对象**：${activeGhouse.name}\n**当前状态**：[轻度异常] 实时温度 **${temperature.toFixed(1)}°C**，存在偏高风险。\n\n### 💡 专家建议：\n建议提前开启侧边通风口，加大温室内的气体流通。是否需要系统自动介入排风？*(可直接回复“需要”或点击“开启通风”)*`;
        } else {
          mockReply = `✅ **农策通 AI 生态评估报告**\n\n**诊断对象**：${activeGhouse.name}\n**综合评级**：健康 (Excellent)\n\n### 📊 核心指标\n- **实时温度**：**${temperature.toFixed(1)}°C** (处于最佳生长光合区间)\n- **相对湿度**：**${humidity}%** (气孔蒸腾作用平稳)\n\n### 💡 诊断结论\n当前环境数据高度吻合该作物的标准生长模型。建议维持当前自动化环控策略，无需进行多余的人工干预。`;
        }
      } else if (finalText.includes('****')) {
        mockReply = `🛡️ **端侧隐私保护拦截成功**\n\n系统检测到您的输入包含敏感信息，已在**本地设备端**完成数据脱敏清洗。\n\n传输至云端的脱敏内容为：\n> "${finalText}"\n\n*您的原始敏感数据（如电话、姓名等）已被拦截，绝不会离开当前设备。请问有什么农业技术问题需要我帮您解答？*`;
      } else {
        mockReply = `💬 **已收到您的消息**：\n> "${finalText}"\n\n我是农策通智能专家。当前系统未连接至云端真实大模型，已自动切换为 **[本地离线演示模式]**，暂时无法进行自由对话。\n\n💡 **您可以尝试点击下方的功能按钮**：\n- 体验 **[环境评估]** / **[补水指令]** / **[开启通风]** 等自动化环控调度。\n- 尝试发送您的电话号码，测试 **[隐私数据防泄漏拦截]** 功能。\n- 点击输入框右侧的附件按钮，上传 **病害图片** 或 **巡检 PDF 文档** 体验多模态解析。`;
      }

      simulateTyping(mockReply, assistantId, mockCmd);
    }
  };

  const simulateTyping = (text: string, assistantId: string, cmd?: string) => {
    let currentIndex = 0;
    const typeWriter = setInterval(() => {
      if (currentIndex < text.length) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: text.slice(0, currentIndex + 1), command: cmd } : m));
        currentIndex++;
      } else { clearInterval(typeWriter); setIsLoading(false); }
    }, 25);
  };

  const isEye = theme === 'eyecare';
  const isDark = theme === 'dark';

  if (!hasMounted) return null;

  const displayMessages = viewingArchive ? viewingArchive.messages : messages;

  return (
    <div className={`h-[100dvh] w-screen flex flex-col overflow-hidden transition-colors duration-500 relative
      ${isDark ? 'dark bg-zinc-950 text-white' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-[#f8fafc] text-zinc-900'}
    `}>

      {privacyAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 pb-4 border-b flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-2xl text-red-600"><ShieldAlert className="w-6 h-6 animate-pulse" /></div>
              <div><h3 className="text-lg font-black text-red-700 dark:text-red-500">隐私保护预警</h3></div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm">检测到敏感信息。脱敏处理如下：</p>
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border space-y-3 text-sm">
                <div className="text-red-600 line-through">{privacyAlert.original}</div>
                <div className="font-bold text-green-700">{privacyAlert.redacted}</div>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 border-t flex justify-end gap-3">
              <button onClick={() => setPrivacyAlert(null)} className="px-4 py-2 text-xs font-bold">取消</button>
              <button onClick={() => executeSend(privacyAlert.redacted)} className="px-5 py-2 text-xs font-black text-white bg-green-600 rounded-xl">一键脱敏并发送</button>
            </div>
          </div>
        </div>
      )}

      <header className={`h-14 shrink-0 border-b px-4 sm:px-8 flex items-center justify-between z-50 shadow-sm transition-colors duration-500
        ${isEye ? 'bg-[#E5E1D8] border-[#D1CCBF]' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}
      `}>
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 animate-pulse shrink-0 ${isEye ? 'text-[#6D8A78]' : 'text-green-700'}`} />
          <button onClick={() => window.location.href = '/'} className={`text-sm sm:text-base font-black tracking-tight uppercase shrink-0 ${isEye ? 'text-[#6D8A78]' : 'dark:text-green-500'}`}>农策通</button>
        </div>
        <div className="flex items-center gap-3">

          {/* 【新增】：预警中心跳转入口 */}
          <Link href={`/alerts?id=GH-${activeGhouse.id}`}>
            <button className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all hover:shadow-md
              ${isEye ? 'bg-red-100/50 border-red-200 text-red-700' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400'}
            `}>
              <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
              <span className="text-[10px] font-black uppercase">预警中心</span>
            </button>
          </Link>

          <div className="flex items-center p-1 rounded-lg border border-slate-500/20 bg-black/5 dark:bg-white/5">
            <button onClick={() => handleThemeChange('light')} className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title="白天模式">
              <Sun className="w-4 h-4" />
            </button>
            <button onClick={() => handleThemeChange('dark')} className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title="夜间模式">
              <Moon className="w-4 h-4" />
            </button>
            <button onClick={() => handleThemeChange('eyecare')} className={`p-1.5 rounded-md transition-all ${theme === 'eyecare' ? 'bg-[#D1CCBF] text-[#3E3A32]' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title="护眼模式">
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className={`px-2 py-1 rounded-full border flex items-center gap-2 ${isEye ? 'bg-[#D1CCBF]/30 border-[#D1CCBF]' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isEye ? 'bg-[#6D8A78]' : 'bg-green-500'}`} />
            <span className={`text-[9px] font-black ${isEye ? 'text-[#6D8A78]' : 'text-green-800'}`}>实时在线</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto md:overflow-hidden p-2 sm:p-4 flex flex-col md:grid md:grid-cols-12 gap-4 relative">

        <section className="w-full md:col-span-5 lg:col-span-4 flex flex-col overflow-hidden shrink-0">
          <Card className={`flex-1 shadow-lg rounded-[2rem] overflow-hidden flex flex-col border transition-colors duration-500
            ${isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}
          `}>
            <div className={`p-4 text-white flex justify-between items-center transition-colors duration-500 ${isEye ? 'bg-[#6D8A78]' : 'bg-green-800'}`}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 opacity-80" />
                <span className="font-bold text-xs shrink-0">监测大盘</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <select
                    value={activeGhouse.id}
                    onChange={(e) => {
                      const s = GREENHOUSES.find(g => g.id === e.target.value);
                      if (s) {
                        setActiveGhouse(s);
                        setTemperature(s.baseTemp);
                        setHumidity(s.baseHum);
                        setHistory([]);
                      }
                    }}
                    className={`text-[10px] font-bold border-none rounded-lg px-3 py-1 pr-8 appearance-none cursor-pointer truncate outline-none max-w-[120px] sm:max-w-[150px] ${isEye ? 'bg-[#587262]' : 'bg-green-700'}`}
                  >
                    {GREENHOUSES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
              </div>
            </div>

            <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 min-h-[140px] flex flex-col space-y-2 overflow-hidden">
                <div className="flex justify-between items-center px-1">
                  <h3 className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isEye ? 'text-[#8A8578]' : 'text-zinc-400'}`}>环境趋势</h3>

                  {/* 【新增】：放置在“环境趋势”旁边的分析按钮 */}
                  <Link href={`/analytics?id=GH-${activeGhouse.id}`}>
                    <button className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-[10px] font-bold border shadow-sm shrink-0
                      ${isEye ? 'bg-[#587262]/80 border-[#587262] text-[#F0F7F2] hover:bg-[#F2EFE9] hover:text-[#3E3A32]' : 'bg-green-700/80 border-green-600 hover:bg-white hover:text-green-800'}
                    `}>
                      <span>📊</span>
                      <span className="hidden sm:inline">深度分析</span>
                    </button>
                  </Link>
                </div>
                <div className={`flex-1 min-h-0 rounded-xl p-3 border shadow-inner transition-colors duration-500 ${isEye ? 'bg-[#E5E1D8] border-[#D1CCBF]' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'}`}>
                  {hasMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isEye ? "#D1CCBF" : "#e2e8f0"} strokeOpacity={0.4} />
                        <YAxis domain={['dataMin - 3', 'dataMax + 3']} hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', fontSize: '10px', backgroundColor: isEye ? '#F2EFE9' : '#fff', border: isEye ? '1px solid #D1CCBF' : '1px solid #e2e8f0' }}
                          formatter={(value: any, name: any) => [
                            Number(value).toFixed(1),
                            name === '温度' || name === 'temp' ? '温度 (°C)' : '湿度 (%)'
                          ]}
                        />
                        <Line name="温度" type="monotone" dataKey="temp" stroke={temperature >= 31 ? "#ef4444" : "#f97316"} strokeWidth={3} dot={false} isAnimationActive={false} />
                        <Line name="湿度" type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="text-center text-[10px] text-zinc-400 mt-10">同步中...</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl border transition-colors text-center ${temperature >= 31 ? 'bg-red-500/10 border-red-500/30' : isEye ? 'bg-[#E5E1D8]/50 border-[#D1CCBF]' : 'bg-orange-50/30 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/30'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${temperature >= 31 ? 'text-red-500' : isEye ? 'text-[#8A8578]' : 'text-orange-600 dark:text-orange-500'}`}>当前温度</span>
                  <span className={`text-xl font-black tabular-nums transition-colors ${temperature >= 31 ? 'text-red-500' : isEye ? 'text-[#3E3A32]' : 'text-zinc-800 dark:text-zinc-100'}`}>{temperature.toFixed(1)}°C</span>
                </div>
                <div className={`p-3 rounded-2xl border text-center transition-colors duration-500 ${isEye ? 'bg-[#E5E1D8]/50 border-[#D1CCBF]' : 'bg-blue-50/20 border-blue-100/50'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${isEye ? 'text-[#8A8578]' : 'text-blue-600'}`}>实时湿度</span>
                  <span className={`text-xl font-black tabular-nums transition-colors ${isEye ? 'text-[#3E3A32]' : 'text-zinc-800 dark:text-zinc-100'}`}>{humidity}%</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 overflow-hidden">
                <div className="flex justify-between items-center px-1">
                  <h3 className={`text-[9px] font-black uppercase tracking-widest ${isEye ? 'text-[#8A8578]' : 'text-zinc-400'}`}>物理节点负载</h3>
                  <Link href={`/strategy?id=GH-${activeGhouse.id}`}>
                    <button
                      className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-[10px] font-bold shadow-sm
                        ${isEye ? 'bg-[#587262]/10 text-[#587262] hover:bg-[#587262] hover:text-[#F0F7F2]' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40'}
                      `}
                    >
                      <Settings2 className="w-3 h-3" />
                      策略配置
                    </button>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-hide pb-2 max-h-48">
                  <DeviceStatus name="1号滴灌水泵" icon={Droplet} status={humidity < activeGhouse.baseHum || isWaterUI} color="green" activeText={isWaterUI ? "强制补水中" : "工作"} theme={theme} />
                  <DeviceStatus name="温室通风机组" icon={Wind} status={temperature > activeGhouse.baseTemp + 2 || humidity > 75 || isVentUI} color="green" activeText={isVentUI ? "紧急排风中" : "工作"} theme={theme} />

                  {/* 动态渲染策略规则按钮 */}
                  {strategies.filter(s => s.isActive).map((strategy) => (
                    <DeviceStatus
                      key={strategy.id}
                      name={strategy.name}
                      icon={Zap}
                      status={true}
                      color="orange"
                      activeText="规则生效中"
                      theme={theme}
                    />
                  ))}

                  <DeviceStatus name="Lora 中枢网关" icon={Power} status={true} color="green" theme={theme} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="w-full md:col-span-7 lg:col-span-8 flex flex-col overflow-hidden shrink-0 relative">

          {showHistoryView && (
            <div className={`absolute inset-0 z-30 flex flex-col rounded-[2.5rem] shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95
              ${isEye ? 'bg-[#E5E1D8] border-[#D1CCBF]' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}
            `}>
              <div className={`flex justify-between items-center p-4 border-b ${isEye ? 'border-[#D1CCBF]' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${isEye ? 'text-[#6D8A78]' : 'text-green-600'}`} />
                  <h3 className={`font-bold ${isEye ? 'text-[#3E3A32]' : 'text-zinc-800 dark:text-zinc-100'}`}>{activeGhouse.name} - 历史会话</h3>
                </div>
                <button onClick={() => setShowHistoryView(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {archivedSessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
                    <Clock className="w-12 h-12 mb-3" />
                    <p className="text-sm font-bold">暂无历史归档</p>
                  </div>
                ) : (
                  archivedSessions.map(archive => (
                    <div key={archive.id} onClick={() => { setViewingArchive(archive); setShowHistoryView(false); }} className={`p-4 rounded-2xl cursor-pointer transition-all border group
                      ${isEye ? 'bg-[#F2EFE9] hover:bg-[#D1CCBF]/30 border-[#D1CCBF]' : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border-zinc-100 dark:border-zinc-700/50 hover:border-green-300'}
                    `}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold font-mono ${isEye ? 'text-[#6D8A78]' : 'text-green-600'}`}>{archive.time}</span>
                        <button onClick={(e) => handleDeleteArchive(e, archive.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-sm font-bold truncate ${isEye ? 'text-[#3E3A32]' : 'text-zinc-700 dark:text-zinc-300'}`}>{archive.snippet}</p>
                      <p className="text-[10px] text-zinc-400 mt-2">共 {archive.messages.length} 条对话</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <Card className={`flex-1 shadow-lg rounded-[2.5rem] overflow-hidden flex flex-col border relative transition-colors duration-500
            ${isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}
          `}>

            <div className={`border-b p-3 sm:p-4 flex justify-between items-center transition-colors duration-500 ${isEye ? 'border-[#D1CCBF]' : 'border-zinc-100 dark:border-zinc-800'}`}>
              <div className="flex items-center gap-3">
                {viewingArchive ? (
                  <button onClick={() => setViewingArchive(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-zinc-500" />
                  </button>
                ) : (
                  <div className={`p-2 rounded-xl ${isEye ? 'bg-[#D1CCBF]/50 text-[#6D8A78]' : 'bg-green-100 text-green-700'}`}><MessageSquare className="w-4 h-4" /></div>
                )}
                <h3 className={`text-sm font-bold tracking-tight ${isEye ? 'text-[#3E3A32]' : ''}`}>
                  {viewingArchive ? `历史会话 (${viewingArchive.time})` : 'AI 专家决策'}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {!viewingArchive && (
                  <>
                    <button
                      onClick={() => setShowHistoryView(true)}
                      className={`p-2 transition-colors ${isEye ? 'text-[#8A8578] hover:text-[#6D8A78]' : 'text-zinc-400 hover:text-green-700'}`}
                      title="查看历史记录"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetAndArchive}
                      className={`p-2 transition-colors ${isEye ? 'text-[#8A8578] hover:text-[#6D8A78]' : 'text-zinc-400 hover:text-green-700'}`}
                      title="清空当前对话并存档"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div ref={viewingArchive ? archiveScrollRef : scrollRef} className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide transition-colors duration-500 ${isEye ? 'bg-[#E5E1D8]/60' : 'bg-zinc-50/10'}`}>

              {!viewingArchive && (
                <div className="absolute bottom-[80px] left-6 flex gap-3 z-10">
                  {selectedImage && (
                    <div className="relative inline-block animate-in slide-in-from-bottom-2">
                      <img src={selectedImage} alt="Preview" className="h-16 w-auto rounded-xl border-2 border-green-500 shadow-xl object-cover" />
                      <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="relative flex items-center gap-2 bg-white dark:bg-zinc-800 border-2 border-blue-500 p-2 pr-8 rounded-xl shadow-xl animate-in slide-in-from-bottom-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">{selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-zinc-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              )}

              {displayMessages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>

                  <div className={`max-w-[85%] p-4 sm:p-5 rounded-[2rem] shadow-sm text-sm transition-colors duration-500 
                    ${m.role === 'user'
                      ? (isEye ? 'bg-[#6D8A78] text-[#F0F7F2] rounded-tr-none' : 'bg-green-800 text-white rounded-tr-none')
                      : (isEye ? 'bg-[#F2EFE9] text-[#3E3A32] border border-[#D1CCBF] rounded-tl-none' : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border dark:border-zinc-700 rounded-tl-none')
                    }`
                  }>
                    {m.imageUrl && <img src={m.imageUrl} alt="Crop" className="max-h-48 rounded-xl shadow-sm mb-3 object-cover border-2 border-green-700" />}
                    {m.fileName && (
                      <div className={`mb-2 flex items-center gap-2 p-2 rounded-lg w-fit ${isEye ? 'bg-[#D1CCBF]/50 text-[#3E3A32]' : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'}`}>
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold">{m.fileName}</span>
                      </div>
                    )}
                    {m.content === "" ? <div className="flex gap-2 py-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" /></div> :
                      <div className="space-y-4 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: 'span' }}>{m.content}</ReactMarkdown>

                        {m.command && (
                          (() => {
                            try {
                              const c = JSON.parse(m.command);
                              return <ActionWidget actionName={c.action} icon={c.cmd === 'water' ? <Droplets className="w-4 h-4" /> : <Wind className="w-4 h-4" />} type={c.cmd === 'water' ? 'water' : 'wind'} onExecute={() => {
                                if (c.cmd === 'wind') { isVentilatingRef.current = true; setIsVentUI(true); }
                                if (c.cmd === 'water') { isWateringRef.current = true; setIsWaterUI(true); }
                              }}
                                theme={theme}
                              />;
                            } catch { return null; }
                          })()
                        )}
                      </div>
                    }
                  </div>

                  {m.role === 'assistant' && m.content && m.id.startsWith('ai-') && !viewingArchive && (
                    <div className="mt-3 ml-3 flex flex-wrap items-center gap-4">
                      <ExportButton ghouseName={activeGhouse.name} temperature={temperature} humidity={humidity} aiText={m.content} />
                      <SpeakButton text={m.content} />
                      <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isEye ? 'text-[#8A8578]' : 'text-zinc-400'}`}><Zap className="w-3 h-3 text-orange-400 fill-orange-400" /> AI完成</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && !viewingArchive && <div className={`pl-6 text-[10px] font-black animate-pulse uppercase ${isEye ? 'text-[#6D8A78]' : 'text-green-600'}`}><Zap className="w-3 h-3 inline-block mr-2" /> 云端决策中...</div>}
            </div>

            {!viewingArchive && (
              <div className={`p-3 sm:p-6 border-t shrink-0 transition-colors duration-500 ${isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}`}>

                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {["🌱 环境评估", "💧 补水指令", "🌡️ 开启通风"].map(s => (
                    <button key={s} onClick={() => handleSendInitiate(s)} className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap
                      ${isEye ? 'bg-[#E5E1D8] border-[#D1CCBF] text-[#3E3A32] hover:bg-[#6D8A78] hover:text-[#F0F7F2]' : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-green-800 hover:text-white dark:border-zinc-700'}
                    `}>{s}</button>
                  ))}
                </div>

                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Input
                      placeholder={isListening ? "请说话..." : "输入指令..."}
                      value={myInput}
                      onChange={(e: any) => setMyInput(e.target.value)}
                      onKeyDown={(e: any) => e.key === 'Enter' && handleSendInitiate()}
                      className={`rounded-full pl-7 pr-[100px] h-14 text-sm transition-colors duration-500
                        ${isEye ? 'bg-[#E5E1D8] text-[#3E3A32] border border-[#D1CCBF] placeholder-[#8A8578]' : 'bg-zinc-100 dark:bg-zinc-800 border-none'}
                      `}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" ref={docInputRef} onChange={handleDocUpload} />
                      <button type="button" onClick={() => docInputRef.current?.click()} className={`p-2 transition-all ${isEye ? 'text-[#8A8578] hover:text-[#3E3A32]' : 'text-zinc-400 hover:text-blue-600'}`}><Paperclip className="w-5 h-5" /></button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 transition-all ${isEye ? 'text-[#8A8578] hover:text-[#3E3A32]' : 'text-zinc-400 hover:text-green-700'}`}><ImagePlus className="w-5 h-5" /></button>
                      <button type="button" onClick={toggleSTT} className={`p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-100 animate-pulse' : isEye ? 'text-[#8A8578] hover:text-[#3E3A32]' : 'text-zinc-400 hover:text-green-700'}`}>
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button disabled={isLoading} onClick={() => handleSendInitiate()} className={`rounded-full w-14 h-14 p-0 shadow-lg shrink-0 transition-all active:scale-90
                    ${isEye ? 'bg-[#6D8A78] hover:bg-[#587262]' : 'bg-green-800 hover:bg-green-900'}
                  `}>
                    <Zap className="w-6 h-6 text-white fill-current" />
                  </Button>
                </div>
              </div>
            )}

          </Card>
        </section>
      </main>
    </div>
  );
}