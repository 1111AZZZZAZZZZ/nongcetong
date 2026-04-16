'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, ShieldAlert, BellRing, X, Activity, Cpu, Database, ChevronRight, Sun, Moon, Eye } from 'lucide-react';

interface AlertLog {
  id: string;
  ghId: string;
  type: 'temperature' | 'humidity' | 'system';
  severity: 'danger' | 'warning';
  content: string;
  time: string;
  status: 'pending' | 'resolved';
  suggestion: string;
  details?: {
    currentValue: string;
    threshold: string;
    nodeId: string;
    protocol: string;
    historyLogs: { time: string; event: string }[];
  };
}

function AlertsContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id') || 'GH-041';
  
  const [filter, setFilter] = useState<'all' | 'danger' | 'warning'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertLog | null>(null);
  
  // ================= 核心：全页面主题同步与持久化逻辑 =================
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 1. 初次挂载：从本地存储读取主题，确保刷新后不重置
    const savedTheme = localStorage.getItem('nongcetong_theme') || 'light';
    setTheme(savedTheme);

    // 2. 实时侦听：如果用户在其他标签页或通过主页按钮修改了主题，这里同步更新
    const syncTheme = () => {
      const currentTheme = localStorage.getItem('nongcetong_theme') || 'light';
      setTheme(currentTheme);
    };

    window.addEventListener('storage', syncTheme);
    
    // 3. 定时检查：兜底逻辑，确保同页面跳转时的状态同步
    const timer = setInterval(syncTheme, 1000);

    return () => {
      window.removeEventListener('storage', syncTheme);
      clearInterval(timer);
    };
  }, []);

  const isDark = theme === 'dark';
  const isEye = theme === 'eyecare';
  // =========================================================

  const mockAlerts: AlertLog[] = [
    {
      id: 'AL-1001',
      ghId: targetId,
      type: 'temperature',
      severity: 'danger',
      content: `实时温度达到 38.4℃，超过一级阈值 (35.0℃)`,
      time: '今天 14:20:05',
      status: 'pending',
      suggestion: '建议立即授权开启 1-5 号负压风机，并启动水帘降温。',
      details: {
        currentValue: "38.4℃",
        threshold: "35.0℃ (一级上限)",
        nodeId: "SN-T-092",
        protocol: "LoRaWAN Class C",
        historyLogs: [
          { time: "14:15:00", event: "温度触发二级预警 (32.1℃)" },
          { time: "14:20:05", event: "触发一级告警，推送实时通知" },
          { time: "14:20:10", event: "AI 决策中心生成紧急降温预案" },
        ]
      }
    },
    {
      id: 'AL-1002',
      ghId: targetId,
      type: 'humidity',
      severity: 'warning',
      content: `相对湿度降至 35%，可能影响作物蒸腾作用`,
      time: '今天 11:45:12',
      status: 'resolved',
      suggestion: '已通过自动化策略触发 1号水泵补水 15 分钟。',
      details: {
        currentValue: "35%",
        threshold: "40% (下限)",
        nodeId: `SN-H-${targetId.split('-')[1]}`,
        protocol: "MQTT / RS485",
        historyLogs: [
          { time: "11:45:12", event: "湿度跌破阈值" },
          { time: "11:45:15", event: "自动化逻辑激活" },
          { time: "12:00:20", event: "补水完成，告警解除" },
        ]
      }
    },
    {
        id: 'AL-1003',
        ghId: targetId,
        type: 'system',
        severity: 'warning',
        content: `Lora 传感器节点信号较弱 (-110dBm)`,
        time: '今天 09:10:33',
        status: 'resolved',
        suggestion: '请检查网关天线方向或更换节点电池。',
        details: {
          currentValue: "-110dBm",
          threshold: "-105dBm",
          nodeId: `GW-LORA-${targetId.split('-')[1]}`,
          protocol: "LoRaWAN v1.1",
          historyLogs: [
            { time: "09:00:00", event: "信号强度开始波动" },
            { time: "09:10:33", event: "触发弱信号告警" },
          ]
        }
    }
  ];

  const filteredAlerts = mockAlerts.filter(a => filter === 'all' ? true : a.severity === filter);

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-sans relative transition-colors duration-500
      ${isDark ? 'bg-[#0B1120] text-slate-200' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-[#f8fafc] text-slate-800'}
    `}>
      
      {/* --- 详情参数弹窗 (Modal) --- */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border transition-colors duration-500
            ${isDark ? 'bg-[#111827] border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
          `}>
            <div className={`p-8 text-white flex justify-between items-start ${selectedAlert.severity === 'danger' ? 'bg-red-600' : 'bg-amber-500'}`}>
              <div>
                <h2 className="text-2xl font-black">{selectedAlert.ghId} 异常诊断</h2>
                <p className="text-sm opacity-90 mt-1 font-bold">告警 ID: #{selectedAlert.id}</p>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-3xl border transition-colors ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#E5E1D8] border-[#D1CCBF]' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-1">实测值</p>
                  <h3 className={`text-3xl font-black ${selectedAlert.severity === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>{selectedAlert.details?.currentValue}</h3>
                </div>
                <div className={`p-5 rounded-3xl border transition-colors ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#E5E1D8] border-[#D1CCBF]' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-1">阈值</p>
                  <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedAlert.details?.threshold}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>
                  <Activity className="w-3.5 h-3.5" /> 自动化执行栈
                </h4>
                <div className="space-y-3">
                  {selectedAlert.details?.historyLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 0 ? 'bg-slate-400' : 'bg-green-500'}`} />
                        {i !== selectedAlert.details!.historyLogs.length - 1 && <div className={`w-0.5 h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">{log.time}</span>
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{log.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setSelectedAlert(null)} className={`w-full font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                确认并关闭分析报表
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 主页面标题栏 --- */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl shadow-sm gap-4 mb-6 transition-colors duration-500 border
        ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
      `}>
        <div className="flex items-center gap-4 text-left">
          <button onClick={() => window.history.back()} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : isEye ? 'hover:bg-[#D1CCBF] text-[#587262]' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <ShieldAlert className="w-6 h-6 text-red-500" /> 告警预警中心
            </h1>
            <p className={`text-xs font-bold uppercase mt-0.5 tracking-tighter ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>
              Node: {targetId} | {theme.toUpperCase()} MODE
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-1 rounded-xl transition-colors ${isDark ? 'bg-black/20' : 'bg-slate-100'}`}>
          {['all', 'danger', 'warning'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all 
              ${filter === f ? (isDark ? 'bg-white/20 text-white' : isEye ? 'bg-[#6D8A78] text-white' : 'bg-white shadow-sm text-slate-800') : (isDark ? 'text-slate-500' : 'text-slate-400')}
            `}>
              {f === 'all' ? '全部' : f === 'danger' ? '紧急' : '预警'}
            </button>
          ))}
        </div>
      </div>

      {/* --- 告警列表 --- */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-500
            ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
          `}>
            <div className="p-6 flex flex-col lg:flex-row gap-6 text-left">
              <div className={`w-1 lg:w-1.5 rounded-full shrink-0 ${alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${alert.severity === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {alert.severity === 'danger' ? '一级告警' : '二级预警'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">#{alert.id}</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>{alert.ghId}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}><Clock className="w-3.5 h-3.5" /><span className="text-[10px] font-black">{alert.time}</span></div>
                </div>

                <h3 className={`text-lg font-black ${isDark ? 'text-white' : isEye ? 'text-[#3E3A32]' : 'text-slate-800'}`}>{alert.content}</h3>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${isDark ? 'bg-blue-500/5 border-blue-500/20' : isEye ? 'bg-[#6D8A78]/10 border-[#6D8A78]/20' : 'bg-blue-50/30 border-blue-100/50'}`}>
                  <BellRing className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span className={`uppercase text-[10px] block mb-1 font-black ${isEye ? 'text-[#6D8A78]' : 'text-blue-600'}`}>AI 协同诊断方案</span>
                    {alert.suggestion}
                  </p>
                </div>
              </div>

              <div className={`flex lg:flex-col justify-between items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase ${alert.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                  {alert.status === 'resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {alert.status === 'resolved' ? '已归档' : '待处理'}
                </div>
                <button 
                  onClick={() => setSelectedAlert(alert)}
                  className={`group flex items-center gap-2 text-xs font-black px-6 py-3 rounded-2xl transition-all active:scale-95
                    ${isDark ? 'bg-white text-black hover:bg-slate-200' : isEye ? 'bg-[#6D8A78] text-white hover:bg-[#587262]' : 'bg-slate-900 text-white hover:bg-slate-800'}
                  `}
                >
                  查看详情参数 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">解密安全审计日志...</div>}>
      <AlertsContent />
    </Suspense>
  );
}