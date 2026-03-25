'use client';
import { LayoutDashboard, AlertTriangle, CheckCircle2, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalDashboard() {
  const router = useRouter();
  // 模拟生成 24 个大棚数据，随机设定 2 个为异常状态
  const [nodes, setNodes] = useState(
    Array.from({ length: 24 }).map((_, i) => ({
      id: `GH-${(i + 1).toString().padStart(3, '0')}`,
      status: [7, 14].includes(i) ? 'danger' : (i === 3 ? 'warning' : 'healthy'),
      temp: [7, 14].includes(i) ? 35.2 : 24 + Math.random() * 3,
      hum: [7, 14].includes(i) ? 88 : 45 + Math.random() * 10
    }))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <header className="mb-8 flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-green-500 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8" /> 农策通全局指挥中枢
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Global Greenhouse Matrix · 实时节点数: 24</p>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-4 h-4"/> 健康运行 (21)</span>
          <span className="flex items-center gap-1 text-yellow-500"><Wind className="w-4 h-4"/> 预警排查 (1)</span>
          <span className="flex items-center gap-1 text-red-500 animate-pulse"><AlertTriangle className="w-4 h-4"/> 紧急干预 (2)</span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {nodes.map(node => (
          <div 
            key={node.id} 
            // 点击异常节点，直接跳转到我们之前写好的 AI 诊断页面（根目录）
            onClick={() => router.push('/')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 shadow-lg ${
              node.status === 'danger' ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/40 shadow-red-900/20' : 
              node.status === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50' : 
              'bg-zinc-900 border-zinc-800 hover:border-green-500/30'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-zinc-400">{node.id}</span>
              {node.status === 'danger' && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              {node.status === 'healthy' && <div className="w-2 h-2 rounded-full bg-green-500" />}
            </div>
            <div className="space-y-1">
              <div className={`text-lg font-black ${node.status === 'danger' ? 'text-red-400' : 'text-zinc-200'}`}>
                {node.temp.toFixed(1)}°C
              </div>
              <div className="text-xs text-zinc-500 font-bold">{node.hum.toFixed(0)}% 湿度</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}