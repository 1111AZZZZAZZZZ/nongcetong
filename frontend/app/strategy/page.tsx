'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Zap, Wind, Droplet, ThermometerSun, AlertCircle, Play, Pause, Trash2, Settings2, X } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  type: 'temp' | 'hum' | 'light' | 'sys';
}

export default function AutomationStrategy() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // ================= 核心：主题同步逻辑 =================
  type ThemeMode = 'dark' | 'light' | 'eyecare';
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    // 1. 初始化读取主题
    const savedTheme = localStorage.getItem('nongcetong_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    // 2. 实时侦听 localStorage 变化
    const syncTheme = () => {
      const currentTheme = localStorage.getItem('nongcetong_theme') as ThemeMode;
      if (currentTheme) setTheme(currentTheme);
    };

    window.addEventListener('storage', syncTheme);
    const timer = setInterval(syncTheme, 1000); // 兜底定时器同步

    // 3. 原有的数据加载逻辑
    const savedRules = localStorage.getItem('nongcetong_strategies');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      const defaultRules: Rule[] = [
        { id: 'rule-001', name: '高温热害紧急熔断', trigger: '环境温度', condition: '> 35.0 ℃ 且持续 5 分钟', action: '1.开启全区负压风机 2.展开遮阳网', isActive: true, type: 'temp' },
        { id: 'rule-002', name: '基质极度干燥补水', trigger: '土壤湿度', condition: '< 40% 且当前无降雨', action: '启动 1号、2号变频水泵滴灌 15 分钟', isActive: true, type: 'hum' }
      ];
      setRules(defaultRules);
      localStorage.setItem('nongcetong_strategies', JSON.stringify(defaultRules));
    }
    setHasMounted(true);

    return () => {
      window.removeEventListener('storage', syncTheme);
      clearInterval(timer);
    };
  }, []);

  const isDark = theme === 'dark';
  const isEye = theme === 'eyecare';
  // ====================================================

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('nongcetong_strategies', JSON.stringify(rules));
    }
  }, [rules, hasMounted]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '环境温度',
    condition: '',
    action: '',
    type: 'temp' as 'temp' | 'hum' | 'light'
  });

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, isActive: !rule.isActive } : rule));
  };

  const deleteRule = (id: string) => {
    if(window.confirm('确定要删除这条自动化策略吗？')) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.condition || !newRule.action) return;
    const ruleToAdd: Rule = {
      id: `rule-${Date.now().toString().slice(-4)}`, 
      name: newRule.name,
      trigger: newRule.trigger,
      condition: newRule.condition,
      action: newRule.action,
      isActive: true,
      type: newRule.type as any
    };
    setRules([ruleToAdd, ...rules]);
    setIsModalOpen(false);
    setNewRule({ name: '', trigger: '环境温度', condition: '', action: '', type: 'temp' });
  };

  if (!hasMounted) return null;

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-sans relative transition-colors duration-500
      ${isDark ? 'bg-[#0B1120] text-slate-200' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-slate-50 text-slate-800'}
    `}>
      
      {/* --- 新建规则模态框 (Modal) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left border transition-colors duration-500
            ${isDark ? 'bg-[#111827] border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
          `}>
            <div className="bg-green-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2"><Plus className="w-5 h-5"/> 新建联动策略</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-black uppercase mb-1 block ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>策略名称</label>
                <input 
                  required
                  className={`w-full border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-colors duration-500
                    ${isDark ? 'bg-white/5 text-white' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-slate-100 text-slate-800'}
                  `}
                  placeholder="例如：番茄苗期自动补光"
                  value={newRule.name}
                  onChange={e => setNewRule({...newRule, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-black uppercase mb-1 block ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>监控指标 (IF)</label>
                  <select 
                    className={`w-full border-none rounded-xl p-3 text-sm outline-none cursor-pointer transition-colors duration-500
                      ${isDark ? 'bg-white/5 text-white' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-slate-100 text-slate-800'}
                    `}
                    value={newRule.trigger}
                    onChange={e => {
                      const val = e.target.value;
                      let type: 'temp' | 'hum' | 'light' = 'temp';
                      if (val.includes('湿度')) type = 'hum';
                      if (val.includes('光照')) type = 'light';
                      setNewRule({...newRule, trigger: val, type: type});
                    }}
                  >
                    <option>环境温度</option><option>土壤湿度</option><option>光照强度</option><option>CO2 浓度</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-black uppercase mb-1 block ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>阈值条件</label>
                  <input 
                    required
                    className={`w-full border-none rounded-xl p-3 text-sm outline-none transition-colors duration-500
                      ${isDark ? 'bg-white/5 text-white' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-slate-100 text-slate-800'}
                    `}
                    placeholder="如：> 30℃"
                    value={newRule.condition}
                    onChange={e => setNewRule({...newRule, condition: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-black uppercase mb-1 block ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>执行动作 (THEN)</label>
                <textarea 
                  required
                  className={`w-full border-none rounded-xl p-3 text-sm outline-none h-20 transition-colors duration-500
                    ${isDark ? 'bg-white/5 text-white' : isEye ? 'bg-[#E5E1D8] text-[#3E3A32]' : 'bg-slate-100 text-slate-800'}
                  `}
                  placeholder="如：开启1号离心风机..."
                  value={newRule.action}
                  onChange={e => setNewRule({...newRule, action: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 shadow-lg transition-all active:scale-95">
                确认并存入本地节点
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- 顶部控制栏 --- */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl shadow-sm gap-4 mb-6 transition-colors duration-500 border
        ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
      `}>
        <div className="flex items-center gap-4 text-left">
          <button onClick={() => window.history.back()} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-bold
            ${isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300' : isEye ? 'bg-[#D1CCBF] text-[#587262]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}
          `}>
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <Settings2 className="w-6 h-6 text-green-600" /> 自动化联动策略
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isEye ? 'text-[#587262]' : 'text-slate-400'}`}>
              Rule Engine | {theme.toUpperCase()} MODE
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 ${isEye ? 'bg-[#6D8A78] text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          <Plus className="w-5 h-5" /> 新建策略规则
        </button>
      </div>

      {/* 统计区 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl text-white shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-bold mb-1">生效中策略</p>
              <h2 className="text-4xl font-black">{rules.filter(r => r.isActive).length}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><Zap className="w-6 h-6" /></div>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border transition-colors duration-500 shadow-sm flex flex-col justify-center
          ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
        `}>
          <p className="text-slate-500 text-sm font-bold mb-1">策略持久化状态</p>
          <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>已加密存储</h2>
        </div>
        <div className={`p-5 rounded-2xl border transition-colors duration-500 shadow-sm flex flex-col justify-center items-center
          ${isDark ? 'bg-white/5 border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
        `}>
          <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">网关状态</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className={`font-black text-lg ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>在线</span>
          </div>
        </div>
      </div>

      {/* 列表区 */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden text-left transition-colors duration-500
        ${isDark ? 'bg-[#111827] border-white/10' : isEye ? 'bg-[#F2EFE9] border-[#D1CCBF]' : 'bg-white border-slate-100'}
      `}>
        <div className={`p-5 border-b transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`}>
          <h3 className={`text-base font-black uppercase tracking-widest ${isEye ? 'text-[#587262]' : 'text-slate-800'}`}>规则配置列表</h3>
        </div>
        
        <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
          {rules.map((rule) => (
            <div key={rule.id} className={`p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${!rule.isActive ? 'opacity-40 grayscale' : ''}`}>
              <div className="flex items-start gap-4 flex-1 text-left">
                <div className={`p-3 rounded-xl mt-1 shrink-0 ${
                  rule.type === 'temp' ? 'bg-orange-100 text-orange-600' : 
                  rule.type === 'hum' ? 'bg-blue-100 text-blue-600' : 
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {rule.type === 'temp' && <ThermometerSun className="w-6 h-6" />}
                  {rule.type === 'hum' && <Droplet className="w-6 h-6" />}
                  {rule.type === 'light' && <AlertCircle className="w-6 h-6" />}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{rule.name}</h4>
                    <span className="text-[10px] font-mono bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-md">{rule.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="text-slate-500 font-bold">IF</span>
                    <span className={`px-2 py-1 rounded-md font-bold ${isDark ? 'bg-white/10' : 'bg-slate-100 text-slate-700'}`}>{rule.trigger}</span>
                    <span className="text-red-500 font-black bg-red-500/10 px-2 py-1 rounded-md">{rule.condition}</span>
                    <span className="text-slate-500 font-bold ml-2">THEN</span>
                    <span className={`font-black px-2 py-1 rounded-md border ${isEye ? 'bg-[#6D8A78]/10 text-[#6D8A78] border-[#6D8A78]/20' : 'bg-green-50 text-green-700 border-green-100'}`}>{rule.action}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95
                    ${rule.isActive ? (isEye ? 'bg-[#6D8A78] text-white' : 'bg-green-100 text-green-700') : (isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600')}
                  `}
                >
                  {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {rule.isActive ? 'RUNNING' : 'STOPPED'}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {rules.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="bg-slate-500/10 p-6 rounded-full mb-4 text-slate-500"><Settings2 className="w-12 h-12" /></div>
            <p className="font-black text-slate-500">目前暂无运行策略</p>
          </div>
        )}
      </div>
    </div>
  );
}