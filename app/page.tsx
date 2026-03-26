'use client';
import { LayoutDashboard, AlertTriangle, CheckCircle2, Wind, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalDashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");

  const [nodes, setNodes] = useState(
    Array.from({ length: 100 }).map((_, i) => ({
      id: `GH-${(i + 1).toString().padStart(3, '0')}`,
      status: 'healthy',
      temp: 25.0,
      hum: 50
    }))
  );

  useEffect(() => {
    setNodes(prev => prev.map((node, i) => {
      const isDanger = [7, 42, 88].includes(i); // 8号是数组下标7
      const isWarning = [12, 34, 76, 91].includes(i);

      let status = 'healthy';
      let temp = 24 + Math.random() * 3;
      let hum = 45 + Math.random() * 10;

      if (isDanger) {
        status = 'danger';
        temp = 35.2 + Math.random() * 2;
        hum = 88;
      } else if (isWarning) {
        status = 'warning';
        temp = 31.5 + Math.random();
        hum = 75;
      }

      return { ...node, status, temp, hum };
    }));

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-CN', { hour12: false }) + ' ' + now.toLocaleDateString('zh-CN'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const healthyCount = nodes.filter(n => n.status === 'healthy').length;
  const warningCount = nodes.filter(n => n.status === 'warning').length;
  const dangerCount = nodes.filter(n => n.status === 'danger').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 animate-in fade-in duration-700">

      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-800 pb-4 gap-4 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-50 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-green-500 uppercase">System Active | {currentTime}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-green-500" />
            农策通 <span className="text-zinc-500 font-light mx-2">|</span> 全局指挥中枢
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Global Greenhouse Matrix · 实时监测节点总数: {nodes.length}</p>
        </div>

        <div className="flex gap-4 text-xs font-bold bg-zinc-900 p-3 rounded-2xl border border-zinc-800 shadow-inner">
          <span className="flex items-center gap-1.5 text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500" /> 健康运行 ({healthyCount})
          </span>
          <span className="flex items-center gap-1.5 text-yellow-500">
            <div className="w-2 h-2 rounded-full bg-yellow-500" /> 预警排查 ({warningCount})
          </span>
          <span className="flex items-center gap-1.5 text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-4 h-4" /> 紧急干预 ({dangerCount})
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 pb-10">
        {nodes.map(node => (
          <div
            key={node.id}
            // 👉 核心修改：截取 GH-008 中的 008 作为 URL 参数传过去
            onClick={() => router.push(`/chat?id=${node.id.replace('GH-', '')}`)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.05] shadow-lg group ${node.status === 'danger' ? 'bg-red-950/40 border-red-500/50 hover:bg-red-900/40 shadow-red-900/20' :
                node.status === 'warning' ? 'bg-yellow-950/30 border-yellow-500/50 hover:bg-yellow-900/30' :
                  'bg-zinc-900/40 border-zinc-800 hover:border-green-500/50 hover:bg-zinc-900/80'
              }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[11px] font-black tracking-wider ${node.status === 'danger' ? 'text-red-400' : 'text-zinc-400 group-hover:text-green-400'}`}>
                {node.id}
              </span>
              {node.status === 'danger' && (
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </div>
              )}
              {node.status === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
              {node.status === 'healthy' && <div className="w-2 h-2 rounded-full bg-green-500/30 group-hover:bg-green-500 transition-colors" />}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">温度</span>
                <span className={`text-lg font-black tabular-nums ${node.status === 'danger' ? 'text-red-400' : 'text-zinc-200'}`}>
                  {node.temp.toFixed(1)}<span className="text-[10px] text-zinc-500 ml-0.5">°C</span>
                </span>
              </div>
              <div className="h-px w-full bg-zinc-800/50" />
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">湿度</span>
                <span className="text-xs text-zinc-400 font-bold tabular-nums">
                  {node.hum.toFixed(0)}<span className="text-[9px] text-zinc-600 ml-0.5">%</span>
                </span>
              </div>
            </div>

            <div className={`mt-3 text-[9px] font-bold text-center py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${node.status === 'danger' ? 'bg-red-500 text-white' :
                node.status === 'warning' ? 'bg-yellow-600 text-zinc-900' :
                  'bg-green-800 text-white'
              }`}>
              {node.status === 'danger' ? '诊断干预' : '查看详情'}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}