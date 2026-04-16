'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Sparkles, BrainCircuit, ArrowLeft, Table as TableIcon } from 'lucide-react';

interface EnvironmentData {
  date: string;
  temperature: number;
  humidity: number;
  light: number;
}

const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [chartData, setChartData] = useState<EnvironmentData[]>([]);
  const [selectedZone, setSelectedZone] = useState(initialId ? (initialId.startsWith('GH-') ? initialId : `GH-${initialId}`) : 'GH-041');
  const [daysRange, setDaysRange] = useState(30);

  // ================= 核心：三种光度主题同步逻辑 =================
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('nongcetong_theme') || 'light';
    setTheme(savedTheme);

    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('nongcetong_theme') || 'light';
      setTheme(currentTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    const timer = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, []);

  const isDark = theme === 'dark';
  const isEye = theme === 'eyecare';
  
  const colors = {
    text: isDark ? '#94a3b8' : isEye ? '#587262' : '#64748b',
    grid: isDark ? 'rgba(255,255,255,0.05)' : isEye ? 'rgba(88,114,98,0.1)' : '#e2e8f0',
    cardBg: isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100',
    tooltipBg: isDark ? '#1e293b' : isEye ? '#F2EFE9' : '#ffffff',
    tableHeader: isDark ? 'bg-slate-800 text-slate-400' : isEye ? 'bg-[#D1CCBF] text-[#3E3A32]' : 'bg-slate-100 text-slate-500',
    tableBorder: isDark ? 'border-white/5' : isEye ? 'border-[#D1CCBF]' : 'border-slate-200/50',
  };

  useEffect(() => {
    const generateLiveMockData = () => {
      const data: EnvironmentData[] = [];
      const today = new Date();
      const zoneNum = parseInt(selectedZone.replace('GH-', '')) || 1;
      const baseTemp = 20 + (zoneNum % 10);
      const baseHum = 50 + (zoneNum % 30);
      for (let i = daysRange - 1; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - i);
        data.push({
          date: targetDate.toISOString().split('T')[0].slice(5), 
          temperature: Number((baseTemp + Math.random() * 12 - 4).toFixed(1)), // 增加波动范围以便测试标红
          humidity: Number((baseHum + Math.random() * 40 - 15).toFixed(0)),   // 增加波动范围以便测试标红
          light: Math.floor(3000 + (zoneNum * 20) + Math.random() * 3000)
        });
      }
      return data;
    };
    setChartData(generateLiveMockData());
  }, [daysRange, selectedZone]);

  const getComplianceData = () => {
    if (chartData.length === 0) return [];
    return [
      { name: '适宜区间', value: 85 },
      { name: '偏热风险', value: 10 },
      { name: '偏冷风险', value: 5 }
    ];
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 space-y-6 transition-all duration-500 font-sans
      ${isDark ? 'bg-[#0B1120] text-slate-200' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-[#f8fafc] text-slate-800'}
    `}>
      
      {/* 顶部控制栏 */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl shadow-sm gap-4 transition-all duration-500 border
        ${colors.cardBg}
      `}>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => window.history.back()} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-bold
            ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300' : isEye ? 'bg-[#D1CCBF]/50 text-[#587262]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}
          `}>
            <ArrowLeft className="w-4 h-4" /> 返回控制室
          </button>

          <select
            className={`border-none py-2 px-4 rounded-lg font-bold cursor-pointer outline-none transition-all duration-500
              ${isDark ? 'bg-white/10 text-white' : isEye ? 'bg-[#D1CCBF] text-[#3E3A32]' : 'bg-slate-100 text-slate-700'}
            `}
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const id = String(i + 1).padStart(3, '0');
              return <option key={id} value={`GH-${id}`}>监控节点 GH-{id}</option>;
            })}
          </select>

          <div className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest
            ${isDark ? 'bg-emerald-500/10 text-emerald-400' : isEye ? 'bg-[#6D8A78]/20 text-[#587262]' : 'bg-green-100 text-green-700'}
          `}>
            {theme.toUpperCase()} 模式同步中
          </div>
        </div>

        <button onClick={() => {
           const worksheet = XLSX.utils.json_to_sheet(chartData);
           const workbook = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(workbook, worksheet, "历史数据");
           XLSX.writeFile(workbook, `农策通_${selectedZone}_分析报表.xlsx`);
        }} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 active:scale-95">
          <span>📊</span> 导出分析报表
        </button>
      </div>

      {/* AI 数据洞察 */}
      <div className={`p-5 rounded-2xl shadow-sm flex items-start gap-4 animate-in fade-in transition-all duration-500 border
        ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}
      `}>
        <div className="bg-green-600 p-2.5 rounded-xl text-white shrink-0 shadow-md"><BrainCircuit className="w-6 h-6" /></div>
        <div>
          <h3 className={`font-black text-base mb-1 flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : isEye ? 'text-[#587262]' : 'text-green-800'}`}>
            <Sparkles className="w-4 h-4" /> 农策通 AI 深度分析引擎
          </h3>
          <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : isEye ? 'text-[#587262]' : 'text-green-700'}`}>
            当前节点 **{selectedZone}** 数据表明光合效能处于峰值。表格中**红色数值**表示触发了预设的安全阈值告警，请重点关注。
          </p>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col h-[400px] transition-all duration-500 border
          ${colors.cardBg}
        `}>
          <h3 className={`text-sm font-black mb-6 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>🌡️ 温湿度交汇分析 (Real-time)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.text }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: colors.text }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: colors.text }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: colors.tooltipBg, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="temperature" name="温度" stroke="#ef4444" strokeWidth={4} dot={false} isAnimationActive={true} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="湿度" stroke="#3b82f6" strokeWidth={4} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-3xl shadow-sm lg:col-span-1 flex flex-col h-[400px] transition-all duration-500 border
          ${colors.cardBg}
        `}>
          <h3 className={`text-sm font-black mb-6 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>🎯 生长环境达标率</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={getComplianceData()} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                  {getComplianceData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className={`block text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>92%</span>
              <span className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>综合评分</span>
            </div>
          </div>
        </div>
      </div>

      {/* 历史明细表格 */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden transition-all duration-500
        ${isDark ? 'bg-[#111827] border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
      `}>
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50/50'}`}>
          <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEye ? 'text-[#587262]' : 'text-slate-500'}`}>
            <TableIcon size={14}/> 传感器监测明细 (异常标红)
          </h3>
          <span className="text-[10px] font-mono opacity-50">数据节点: {selectedZone}</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] scrollbar-hide">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`sticky top-0 z-10 font-black uppercase tracking-tighter ${colors.tableHeader}`}>
              <tr>
                <th className="p-4">记录日期</th>
                <th className="p-4">均温 (°C)</th>
                <th className="p-4">相对湿度 (%)</th>
                <th className="p-4">光照强度 (Lux)</th>
                <th className="p-4">环境状态判定</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${colors.tableBorder}`}>
              {chartData.map((row, idx) => {
                // 判定逻辑
                const isTempBad = row.temperature > 28 || row.temperature < 18;
                const isHumBad = row.humidity > 80 || row.humidity < 40;
                const isOverallBad = isTempBad || isHumBad;

                return (
                  <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-green-50'}`}>
                    <td className={`p-4 font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.date}</td>
                    {/* 温度标红逻辑 */}
                    <td className={`p-4 font-black ${isTempBad ? 'text-red-500 scale-110 transition-transform' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {row.temperature}
                    </td>
                    {/* 湿度标红逻辑 */}
                    <td className={`p-4 font-black ${isHumBad ? 'text-red-500 scale-110 transition-transform' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {row.humidity}
                    </td>
                    <td className="p-4 font-bold opacity-80">{row.light}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all
                        ${isOverallBad 
                          ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-600 border border-green-500/30'}
                      `}>
                        {isOverallBad ? '环境风险' : '长势优良'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function DataAnalytics() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold font-black">载入传感器历史矩阵...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}