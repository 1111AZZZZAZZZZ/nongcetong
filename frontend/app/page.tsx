'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, AlertTriangle, CheckCircle2, Wind, Thermometer, Droplets, Sun, Moon, Eye, RefreshCcw } from "lucide-react";
import Link from 'next/link';

// 定义三种主题的类型
type ThemeMode = 'light' | 'dark' | 'eyecare';

// =========================================================================
// 1. 大棚卡片组件 (React.memo 保护)
// =========================================================================
const GreenhouseCard = React.memo(({ node, theme, onClick }: { node: any, theme: ThemeMode, onClick: (node: any) => void }) => {
  const getCardStyle = (type: string) => {
    if (theme === 'dark') {
      if (type === 'danger') return { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', title: 'text-red-400', temp: 'text-red-400', hum: 'text-red-400/80', dot: '#ef4444' };
      if (type === 'warning') return { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', title: 'text-yellow-500', temp: 'text-yellow-400', hum: 'text-yellow-500/80', dot: '#facc15' };
      return { bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255, 255, 255, 0.08)', title: 'text-slate-400', temp: 'text-white', hum: 'text-slate-400', dot: '#34d399' };
    } 
    else if (theme === 'light') {
      if (type === 'danger') return { bg: '#fef2f2', border: '#fca5a5', title: 'text-red-500', temp: 'text-red-700', hum: 'text-red-500', dot: '#ef4444' };
      if (type === 'warning') return { bg: '#fefce8', border: '#fde047', title: 'text-amber-600', temp: 'text-amber-700', hum: 'text-amber-600', dot: '#eab308' };
      return { bg: '#ffffff', border: '#e2e8f0', title: 'text-slate-500', temp: 'text-slate-800', hum: 'text-slate-500', dot: '#22c55e' };
    } 
    else { 
      if (type === 'danger') return { bg: '#FDE7E7', border: '#ECA6A6', title: 'text-[#A83232]', temp: 'text-[#8B1E1E]', hum: 'text-[#A83232]', dot: '#ef4444' };
      if (type === 'warning') return { bg: '#FDF4D9', border: '#E8D48C', title: 'text-[#8C6B16]', temp: 'text-[#70530C]', hum: 'text-[#8C6B16]', dot: '#eab308' };
      return { bg: '#F0F8F2', border: '#C3D8C7', title: 'text-[#4A5D4E]', temp: 'text-[#1A261D]', hum: 'text-[#4A5D4E]', dot: '#22c55e' };
    }
  };

  const style = getCardStyle(node.type);

  return (
    <div
      onClick={() => onClick(node)}
      className="group relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        backdropFilter: theme === 'dark' ? 'blur(12px)' : 'none',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className={`text-[10px] font-black tracking-tighter ${style.title}`}>
          {node.id}
        </span>
        <div 
          className={`w-2 h-2 rounded-full ${node.type === 'danger' ? 'animate-ping' : ''}`}
          style={{ backgroundColor: style.dot, boxShadow: theme === 'dark' ? `0 0 8px ${style.dot}` : 'none' }}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Thermometer className={`w-3 h-3 ${style.title}`} />
          <span className={`text-xl font-black tabular-nums tracking-tight ${style.temp}`}>
            {node.temp.toFixed(1)}<span className="text-[10px] ml-0.5 opacity-60">°C</span>
          </span>
        </div>
        <div className={`flex items-center gap-2 ${style.hum}`}>
          <Droplets className="w-3 h-3" />
          <span className="text-xs font-bold tabular-nums">{node.hum.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
});
GreenhouseCard.displayName = 'GreenhouseCard';


// =========================================================================
// 2. 主页面：大棚监控大盘
// =========================================================================
export default function GlobalDashboard() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    const savedNodes = localStorage.getItem('nongcetong_dashboard_nodes');
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes));
    } else {
      const initialNodes = Array.from({ length: 100 }).map((_, i) => {
        const rand = Math.random();
        let type: 'danger' | 'warning' | 'healthy' = 'healthy';
        let baseTemp, baseHum;

        if (rand > 0.96) {
          type = 'danger'; baseTemp = 36 + Math.random() * 3; baseHum = 82 + Math.random() * 8;
        } else if (rand > 0.90) {
          type = 'warning'; baseTemp = 31 + Math.random() * 2; baseHum = 72 + Math.random() * 5;
        } else {
          type = 'healthy'; baseTemp = 24 + Math.random() * 4; baseHum = 45 + Math.random() * 15;
        }
        return { id: `GH-${(i + 1).toString().padStart(3, '0')}`, type, temp: baseTemp, hum: baseHum };
      });
      setNodes(initialNodes);
      localStorage.setItem('nongcetong_dashboard_nodes', JSON.stringify(initialNodes));
    }
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('nongcetong_dashboard_nodes', JSON.stringify(nodes));
    }
  }, [nodes]);

  const handleResetDashboard = () => {
    localStorage.removeItem('nongcetong_dashboard_nodes');
    window.location.reload(); 
  };

  useEffect(() => {
    if (!hasMounted || nodes.length === 0) return;

    const timer = setInterval(() => {
      setNodes(prev => {
        const targetIndex = Math.floor(Math.random() * 100);
        const newNodes = [...prev];
        const targetNode = newNodes[targetIndex];
        
        const jitter = (Math.random() - 0.5) * 0.4;
        const humJitter = (Math.random() - 0.5) * 2;

        newNodes[targetIndex] = {
          ...targetNode,
          temp: Number((targetNode.temp + jitter).toFixed(1)),
          hum: Number((targetNode.hum + humJitter).toFixed(0))
        };

        return newNodes;
      });
    }, 800); 

    return () => clearInterval(timer);
  }, [hasMounted, nodes.length]);

  // ==== 关键修复点：恢复跳转到决策台 (chat) ====
  const handleCardClick = useCallback((node: any) => {
    // 逻辑：点击卡片进入 /chat 页面，并带上参数以便决策台识别
    router.push(`/chat?id=${node.id}&temp=${node.temp}&hum=${node.hum}`);
  }, [router]);

  const stats = {
    danger: nodes.filter(n => n.type === 'danger').length,
    warning: nodes.filter(n => n.type === 'warning').length,
    healthy: nodes.filter(n => n.type === 'healthy').length
  };

  if (!hasMounted) return null;

  const themes = {
    dark: {
      container: 'bg-[#0B1120] text-slate-200', gridLine: 'rgba(52, 211, 153, 0.08)', headerBorder: 'border-white/10',
      title: 'text-white', subtitle: 'text-[#34d399]/70', logoBg: 'bg-white/5 border-white/10', logoIcon: 'text-[#34d399]',
      btnActive: 'bg-white/10 text-white shadow-md', btnInactive: 'text-slate-500 hover:text-slate-300',
      statHealthy: 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]', statWarning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', statDanger: 'bg-red-500/10 border-red-500/30 text-red-400',
    },
    light: {
      container: 'bg-[#f8fafc] text-slate-800', gridLine: 'rgba(148, 163, 184, 0.15)', headerBorder: 'border-slate-200',
      title: 'text-slate-900', subtitle: 'text-slate-400', logoBg: 'bg-green-100 border-green-200', logoIcon: 'text-green-600',
      btnActive: 'bg-white text-slate-800 shadow-sm border border-slate-200', btnInactive: 'text-slate-400 hover:text-slate-600',
      statHealthy: 'bg-green-50 border-green-200 text-green-700', statWarning: 'bg-amber-50 border-amber-200 text-amber-600', statDanger: 'bg-red-50 border-red-200 text-red-600',
    },
    eyecare: { 
      container: 'bg-[#E1ECE4] text-[#2C3E30]', gridLine: 'rgba(163, 184, 168, 0.25)', headerBorder: 'border-[#C3D8C7]',
      title: 'text-[#1A261D]', subtitle: 'text-[#4A5D4E]', logoBg: 'bg-[#D1E5D5] border-[#A8C4AE]', logoIcon: 'text-[#2C3E30]',
      btnActive: 'bg-[#F0F7F2] text-[#2C3E30] shadow-sm border border-[#C3D8C7]', btnInactive: 'text-[#6C8A73] hover:text-[#2C3E30]',
      statHealthy: 'bg-[#D1E5D5] border-[#A8C4AE] text-[#2C3E30]', statWarning: 'bg-[#FDF4D9] border-[#E8D48C] text-[#8C6B16]', statDanger: 'bg-[#FDE7E7] border-[#ECA6A6] text-[#A83232]',
    }
  };

  const currentTheme = themes[theme];

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 ${currentTheme.container}`}>
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-500" style={{ backgroundImage: `linear-gradient(to right, ${currentTheme.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.gridLine} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="relative z-10 p-6">
        <header className={`mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b pb-6 gap-6 transition-colors duration-500 ${currentTheme.headerBorder}`}>
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors duration-500 ${currentTheme.logoBg}`}>
                <LayoutDashboard className={`w-8 h-8 ${currentTheme.logoIcon}`} />
              </div>
              <h1 className={`text-3xl font-black tracking-tighter italic ${currentTheme.title}`}>农策通</h1>
              <span className={`text-3xl font-light opacity-30 ${currentTheme.title}`}>|</span>
              <h2 className={`text-3xl font-black tracking-tighter ${currentTheme.title}`}>全局指挥中枢</h2>
            </div>
            <p className={`text-[10px] mt-3 font-bold uppercase tracking-[0.2em] ${currentTheme.subtitle}`}>System Status: Monitoring 100 Nodes</p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center p-1 rounded-lg border border-slate-500/20 bg-black/5 dark:bg-white/5 backdrop-blur-md">
              <button 
                onClick={handleResetDashboard} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all text-red-500 hover:bg-red-500/10 mr-1`} 
                title="重新分配所有大棚的故障和温度"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 重新生成
              </button>
              
              <div className="w-[1px] h-4 bg-slate-500/20 mx-1"></div>

              <button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${theme === 'light' ? currentTheme.btnActive : currentTheme.btnInactive}`}><Sun className="w-4 h-4" /> 白天</button>
              <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${theme === 'dark' ? currentTheme.btnActive : currentTheme.btnInactive}`}><Moon className="w-4 h-4" /> 夜间</button>
              <button onClick={() => setTheme('eyecare')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${theme === 'eyecare' ? currentTheme.btnActive : currentTheme.btnInactive}`}><Eye className="w-4 h-4" /> 护眼</button>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* 这里是全局进入数据大盘的按钮，保留 */}
              <Link href="/analytics">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-400 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300 shadow-sm cursor-pointer group">
                  <span className="group-hover:scale-110 transition-transform">📊</span>
                  <span className="text-xs font-black tracking-wider">进入数据大盘</span>
                </button>
              </Link>
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors duration-500 ${currentTheme.statHealthy}`}><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-wider">健康 ({stats.healthy})</span></div>
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors duration-500 ${currentTheme.statWarning}`}><Wind className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-wider">预警 ({stats.warning})</span></div>
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors duration-500 ${currentTheme.statDanger} ${stats.danger > 0 ? 'animate-pulse' : ''}`}><AlertTriangle className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-wider">紧急 ({stats.danger})</span></div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {nodes.map(node => (
            <GreenhouseCard key={node.id} node={node} theme={theme} onClick={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
}