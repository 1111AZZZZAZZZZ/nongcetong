'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, CheckCircle2, Droplets, Wind, Zap, Activity, ChevronDown, RefreshCcw, LayoutDashboard, MessageSquare, Sun, Thermometer, Droplet, Power, Moon } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 动态引入导出按钮，防止服务端渲染错误
const ExportButton = dynamic(() => import('@/components/ui/ExportButton'), { ssr: false });

const GREENHOUSES = [
  { id: '01', name: '1号大棚 (番茄区)', crop: '番茄', baseTemp: 25, baseHum: 40 },
  { id: '02', name: '2号大棚 (黄瓜区)', crop: '黄瓜', baseTemp: 22, baseHum: 60 },
  { id: '03', name: '3号大棚 (育苗区)', crop: '幼苗', baseTemp: 28, baseHum: 75 },
];

// 组件1：底层执行节点 (长条样式)
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

// 组件2：IoT 指令执行按钮
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

export default function Home() {
  const [activeGhouse, setActiveGhouse] = useState(GREENHOUSES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [myInput, setMyInput] = useState("");
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; command?: string }[]>([
    { id: 'welcome', role: 'assistant', content: '您好！农策通智能中枢已就绪，当前数据链路实时同步中。' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState(26.5);
  const [humidity, setHumidity] = useState(42);
  const [history, setHistory] = useState<{ time: string, temp: number, hum: number }[]>([]);
  const [isListening, setIsListening] = useState(false);

  // 模拟趋势数据
  useEffect(() => {
    const initialHistory = Array.from({ length: 15 }).map((_, i) => ({
      time: `${i}:00`,
      temp: activeGhouse.baseTemp + Math.random() * 2,
      hum: activeGhouse.baseHum + Math.random() * 5
    }));
    setHistory(initialHistory);

    const interval = setInterval(() => {
      const newTemp = Number((activeGhouse.baseTemp + Math.random() * 4 - 2).toFixed(1));
      const newHum = Math.floor(activeGhouse.baseHum + Math.random() * 10 - 5);
      setTemperature(newTemp); setHumidity(newHum);
      setHistory(prev => [...prev, { time: new Date().toLocaleTimeString([], { second: '2-digit' }), temp: newTemp, hum: newHum }].slice(-15));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGhouse]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const onSend = async (text?: string) => {
    const userText = text || myInput;
    if (!userText.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }]);
    setMyInput(""); setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `农业专家。当前${activeGhouse.name}。温${temperature}湿${humidity}。补水发指令:{"cmd": "water", "action": "开启滴灌"}。` },
            ...messages.slice(-2).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText }
          ]
        })
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = "ai-" + Date.now();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }]);
      let accumulated = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        let cleanText = chunk.replace(/0:"/g, '').replace(/"/g, '').replace(/\\n/g, '\n').replace(/\\/g, '');
        if (cleanText) {
          accumulated += cleanText;
          let detectedCmd = "";
          const match = accumulated.match(/\{.*"cmd".*?\}/);
          if (match) detectedCmd = match[0];
          else if (accumulated.includes("灌溉") || accumulated.includes("补水")) detectedCmd = '{"cmd": "water", "action": "开启智能滴灌系统"}';
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated, command: detectedCmd } : m));
        }
      }
    } catch (e) { setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "信号异常。" }]); } finally { setIsLoading(false); }
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-[#f8fafc] text-zinc-900'}`}>

      {/* 顶部导航栏 */}
      <header className="h-14 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-700 animate-pulse" />
          <h1 className="text-base font-black tracking-tight dark:text-green-500 uppercase">农策通 <span className="text-zinc-300 dark:text-zinc-700 font-light mx-1">|</span> <span className="text-[10px] font-bold text-green-800/70 dark:text-green-600 tracking-wider">SMART AGRI CONTROL</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-100 dark:border-green-800 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            <span className="text-[9px] font-black text-green-800 dark:text-green-500">已联网</span>
          </div>
        </div>
      </header>

      {/* 核心分栏布局 (锁定 100% 屏幕高度) */}
      <main className="flex-1 overflow-hidden p-4 grid grid-cols-12 gap-6">

        {/* 👈 左侧分栏：监控大盘 */}
        <section className="col-span-12 md:col-span-5 lg:col-span-4 h-full flex flex-col overflow-hidden">
          <Card className="flex-1 shadow-lg border-none bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-800">
            <div className="bg-green-800 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-5 h-5 opacity-80" />
                <span className="font-bold tracking-tight text-sm">监测大盘</span>
              </div>
              <div className="relative">
                <select
                  value={activeGhouse.id}
                  onChange={(e) => {
                    const s = GREENHOUSES.find(g => g.id === e.target.value);
                    if (s) { setActiveGhouse(s); setMessages([{ id: 'w', role: 'assistant', content: `已同步至 ${s.name}。监控同步中...` }]); }
                  }}
                  className="bg-green-700 text-[10px] font-bold border-none rounded-lg px-3 py-1 outline-none pr-8 appearance-none cursor-pointer"
                >
                  {GREENHOUSES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </div>

            <CardContent className="flex-1 p-5 flex flex-col gap-4 overflow-hidden min-h-0">

              {/* 1. 环境趋势 (高度自适应) */}
              <div className="flex-1 min-h-[140px] flex flex-col space-y-2">
                <div className="flex justify-between items-center px-1 shrink-0">
                  <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Thermometer className="w-3 h-3" /> 环境趋势</h3>
                  <div className="flex gap-3 text-[8px] font-bold">
                    <span className="text-orange-500">● 温度</span>
                    <span className="text-blue-500">● 湿度</span>
                  </div>
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-2 border border-zinc-100 dark:border-zinc-800 shadow-inner overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#e2e8f0"} strokeOpacity={0.6} />
                      <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={0.05} fill="#f97316" isAnimationActive={false} />
                      <Area type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.03} fill="#3b82f6" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. 环境数值面板 (固定紧凑高度) */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className={`p-4 rounded-[1.5rem] border transition-all text-center ${temperature > 28 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-orange-50/30 dark:bg-orange-900/10 border-orange-100/50'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${temperature > 28 ? 'text-red-600' : 'text-orange-600'}`}>当前温度</span>
                  <span className={`text-2xl font-black tabular-nums ${temperature > 28 ? 'text-red-700' : 'text-zinc-800 dark:text-zinc-100'}`}>{temperature.toFixed(1)}°C</span>
                </div>
                <div className={`p-4 rounded-[1.5rem] border transition-all text-center ${humidity < 35 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-100/50'}`}>
                  <span className={`text-[9px] font-black mb-1 block uppercase ${humidity < 35 ? 'text-red-600' : 'text-blue-600'}`}>实时湿度</span>
                  <span className={`text-2xl font-black tabular-nums ${humidity < 35 ? 'text-red-700' : 'text-blue-600 dark:text-blue-400'}`}>{humidity}%</span>
                </div>
              </div>

              {/* 3. 底层执行节点 (长条样式) */}
              <div className="shrink-0 flex flex-col space-y-2 min-h-0">
                <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">物理节点负载</h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-hide">
                  <DeviceStatus name="1号滴灌水泵" icon={Droplet} status={humidity < 45} color="blue" />
                  <DeviceStatus name="温室通风机组" icon={Wind} status={temperature > 26} color="orange" />
                  <DeviceStatus name="Lora 中枢网关" icon={Power} status={true} color="green" />
                  <button className="w-full mt-1 py-2 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[9px] font-bold text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                    系统巡检
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* 👉 右侧分栏：AI 专家决策系统 */}
        <section className="col-span-12 md:col-span-7 lg:col-span-8 h-full flex flex-col overflow-hidden">
          <Card className="flex-1 shadow-lg border-none bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-800 relative">
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl text-green-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold dark:text-zinc-200 tracking-tight">AI 专家决策专家系统</h3>
              </div>
              <button onClick={() => setMessages([{ id: 'w', role: 'assistant', content: '对话已重置。' }])} className="p-2 text-zinc-300 hover:text-green-700 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide bg-zinc-50/20 dark:bg-zinc-950/20 min-h-0">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm text-sm leading-relaxed ${m.role === 'user' ? 'bg-green-800 text-white rounded-tr-none shadow-green-100' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700 rounded-tl-none shadow-zinc-100'}`}>
                    {m.role === 'user' ? m.content : (
                      m.content === "" ? <div className="flex gap-2 py-1"><div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" /></div> :
                        <div className="space-y-4">
                          <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>
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
                  {/* PDF 导出 */}
                  {m.role === 'assistant' && m.content && m.id !== 'welcome' && (
                    <div className="mt-3 ml-3 flex items-center gap-4">
                      <ExportButton messageId={m.id} />
                      <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                      <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5"><Zap className="w-3 h-3 text-orange-400 fill-orange-400" /> AI 诊断完成</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && <div className="pl-6 text-[10px] text-green-600 font-black animate-pulse uppercase"><Zap className="w-3 h-3 inline-block mr-2" /> 云端同步中...</div>}
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-5 scrollbar-hide">
                {["🌱 环境评估", "💧 补水指令", "🌡️ 开启通风"].map(s => (
                  <button key={s} onClick={() => onSend(s)} className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-green-800 hover:text-white dark:text-zinc-400 text-zinc-500 rounded-full text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95 whitespace-nowrap">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 relative">
                <Input placeholder="输入指令..." value={myInput} onChange={e => setMyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} className="rounded-full bg-zinc-100 dark:bg-zinc-800 border-none pl-7 h-14 text-sm focus-visible:ring-1 focus-visible:ring-green-800 dark:text-white shadow-inner" />
                <Button onClick={() => onSend()} className="rounded-full bg-green-800 hover:bg-green-900 w-14 h-14 p-0 shadow-lg active:scale-90 transition-all">
                  <Zap className="w-6 h-6 text-white fill-current" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}