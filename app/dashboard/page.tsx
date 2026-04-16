'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // 引入路由
import { User, Lock, Loader2, Zap, EyeOff, Eye, ArrowRight } from "lucide-react";

// ================= 提取组件：智能中枢大图标 =================
const IntelligentHubIcon = () => (
  <svg viewBox="0 0 100 100" className="w-[100px] h-[100px] drop-shadow-[0_0_15px_rgba(167,243,208,0.6)]">
    <defs>
      <linearGradient id="budGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="leafNeon" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ccfbf1" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
    </defs>
    <path d="M 28 85 Q 50 82 72 85" fill="none" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M 50 84 L 50 65" fill="none" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M 48 70 C 15 70 8 45 15 32 C 28 32 42 48 48 70 Z" fill="url(#leafNeon)" opacity="0.95" />
    <path d="M 52 70 C 85 70 92 45 85 32 C 72 32 58 48 52 70 Z" fill="url(#leafNeon)" opacity="0.95" />
    <path d="M 50 18 C 60 30 60 52 50 60 C 40 52 40 30 50 18 Z" fill="url(#budGold)" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter(); // 初始化路由
  const videoRef = useRef<HTMLVideoElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 保证背景视频无损播放
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 模拟 1秒 加载动画，随后立即跳转到仪表盘
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center relative font-sans bg-[#020806] overflow-hidden">

      {/* ================= 全局核心动画引擎 ================= */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes border-spin { 100% { transform: rotate(360deg); } }
        @keyframes circuit-flow { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
        
        .flow-main { stroke-dasharray: 40 260; animation: circuit-flow 2s linear infinite; }
        .flow-fast { stroke-dasharray: 15 150; animation: circuit-flow 1.2s linear infinite; }
        .flow-slow { stroke-dasharray: 25 350; animation: circuit-flow 3s linear infinite; }
        .flow-delay { stroke-dasharray: 10 200; animation: circuit-flow 1.8s linear infinite 0.8s backwards; }
        
        .cyber-button { position: relative; width: 100%; border: none; background: rgba(255, 255, 255, 0.05); cursor: pointer; transition: transform 0.2s; overflow: hidden; border-radius: 12px; }
        .cyber-button::before { content: ''; position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background: conic-gradient(transparent 0deg, transparent 340deg, #fef08a 355deg, #ca8a04 360deg); animation: border-spin 3s linear infinite; z-index: 0; }
        .cyber-button:active { transform: scale(0.98); }
        .cyber-button-inner { position: absolute; inset: 1.5px; background: linear-gradient(90deg, #86efac 0%, #22c55e 100%); color: #064e3b; display: flex; align-items: center; justify-content: center; gap: 8px; z-index: 1; border-radius: 10.5px; }
      `}} />

      {/* 1. 背景视频 */}
      <video ref={videoRef} src="/bg.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.05)] z-[1] pointer-events-none" />

      {/* 2. 核心布局容器 */}
      <div className="relative z-10 w-full max-w-[920px] px-4 flex justify-between items-center h-[550px]">

        {/* ================= 🔗 高密度 PCB 走线层 ================= */}
        <div className="absolute inset-0 z-[5] pointer-events-none hidden md:block">
          <svg width="100%" height="100%" viewBox="0 0 920 550" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="pcb-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g stroke="#34d399" fill="none" opacity="0.3" strokeLinejoin="round" strokeLinecap="round" filter="url(#pcb-glow)">
              <path d="M 330 165 L 50 165" strokeWidth="2" />
              <path d="M 335 150 L 295 150 L 270 125 L 50 125" strokeWidth="1" />
              <path d="M 342 135 L 310 135 L 270 95 L 50 95" strokeWidth="1" />
              <path d="M 355 110 L 330 110 L 270 50 L 50 50" strokeWidth="1" />
              <path d="M 335 180 L 295 180 L 270 205 L 50 205" strokeWidth="1" />
              <path d="M 342 195 L 310 195 L 270 235 L 50 235" strokeWidth="1" />
              <path d="M 355 220 L 330 220 L 270 280 L 50 280" strokeWidth="1" />
              <path d="M 590 165 L 870 165" strokeWidth="2" />
              <path d="M 585 150 L 625 150 L 650 125 L 870 125" strokeWidth="1" />
              <path d="M 578 135 L 610 135 L 650 95 L 870 95" strokeWidth="1" />
              <path d="M 565 110 L 590 110 L 650 50 L 870 50" strokeWidth="1" />
              <path d="M 585 180 L 625 180 L 650 205 L 870 205" strokeWidth="1" />
              <path d="M 578 195 L 610 195 L 650 235 L 870 235" strokeWidth="1" />
              <path d="M 565 220 L 590 220 L 650 280 L 870 280" strokeWidth="1" />
            </g>
            <g stroke="#a7f3d0" fill="none" strokeWidth="1.5" opacity="0.9" strokeLinejoin="round" strokeLinecap="round" filter="url(#pcb-glow)">
              <path d="M 330 165 L 50 165" className="flow-main" strokeWidth="2.5" />
              <path d="M 335 150 L 295 150 L 270 125 L 50 125" className="flow-fast" />
              <path d="M 342 135 L 310 135 L 270 95 L 50 95" className="flow-slow" />
              <path d="M 355 110 L 330 110 L 270 50 L 50 50" className="flow-delay" />
              <path d="M 335 180 L 295 180 L 270 205 L 50 205" className="flow-fast" />
              <path d="M 342 195 L 310 195 L 270 235 L 50 235" className="flow-delay" />
              <path d="M 355 220 L 330 220 L 270 280 L 50 280" className="flow-slow" />
              <path d="M 590 165 L 870 165" className="flow-main" strokeWidth="2.5" />
              <path d="M 585 150 L 625 150 L 650 125 L 870 125" className="flow-fast" />
              <path d="M 578 135 L 610 135 L 650 95 L 870 95" className="flow-slow" />
              <path d="M 565 110 L 590 110 L 650 50 L 870 50" className="flow-delay" />
              <path d="M 585 180 L 625 180 L 650 205 L 870 205" className="flow-fast" />
              <path d="M 578 195 L 610 195 L 650 235 L 870 235" className="flow-delay" />
              <path d="M 565 220 L 590 220 L 650 280 L 870 280" className="flow-slow" />
            </g>
            <g fill="#6ee7b7" opacity="0.8" filter="url(#pcb-glow)">
              <circle cx="330" cy="165" r="3" fill="#fff" />
              <circle cx="335" cy="150" r="1.5" />
              <circle cx="342" cy="135" r="1.5" />
              <circle cx="355" cy="110" r="1.5" />
              <circle cx="335" cy="180" r="1.5" />
              <circle cx="342" cy="195" r="1.5" />
              <circle cx="355" cy="220" r="1.5" />
              <circle cx="590" cy="165" r="3" fill="#fff" />
              <circle cx="585" cy="150" r="1.5" />
              <circle cx="578" cy="135" r="1.5" />
              <circle cx="565" cy="110" r="1.5" />
              <circle cx="585" cy="180" r="1.5" />
              <circle cx="578" cy="195" r="1.5" />
              <circle cx="565" cy="220" r="1.5" />
              <circle cx="50" cy="165" r="2.5" />
              <circle cx="50" cy="125" r="2" />
              <circle cx="50" cy="95" r="2" />
              <circle cx="50" cy="50" r="2" />
              <circle cx="50" cy="205" r="2" />
              <circle cx="50" cy="235" r="2" />
              <circle cx="50" cy="280" r="2" />
              <circle cx="870" cy="165" r="2.5" />
              <circle cx="870" cy="125" r="2" />
              <circle cx="870" cy="95" r="2" />
              <circle cx="870" cy="50" r="2" />
              <circle cx="870" cy="205" r="2" />
              <circle cx="870" cy="235" r="2" />
              <circle cx="870" cy="280" r="2" />
            </g>
          </svg>
        </div>

        {/* ================= 🌿 左侧：农策通模块 ================= */}
        <div className="w-[320px] flex flex-col relative z-20 hidden md:flex">
          <div
            className="w-full rounded-[24px] p-7 border border-slate-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col gap-6"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.25)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-[#34d399]/60 to-transparent"></div>
            <div className="absolute top-0 left-0 w-[2px] h-24 bg-gradient-to-b from-[#34d399]/60 to-transparent"></div>

            <div className="flex items-center justify-between w-full border-b border-white/10 pb-5">
              <div>
                <h1 className="text-[30px] font-bold text-white tracking-wider drop-shadow-md">农策通</h1>
                <p className="text-[13px] text-[#a7f3d0] font-mono tracking-widest mt-0.5 opacity-80">Nongcetong</p>
              </div>

              <div className="relative flex items-center justify-center shrink-0 w-[120px] h-[120px] mr-[-10px]">
                <div className="absolute w-[120px] h-[120px] rounded-full bg-[#6ee7b7]/20 blur-xl animate-[pulse-soft_4s_infinite]"></div>
                <div className="absolute w-[116px] h-[116px] rounded-full border-[2px] border-[#34d399]/30 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                <div className="absolute w-[100px] h-[100px] rounded-full border border-[#a7f3d0]/50 shadow-[0_0_10px_rgba(167,243,208,0.4)] animate-[spin-slow_25s_linear_infinite]"></div>
                <div className="absolute w-[86px] h-[86px] rounded-full border-[1.5px] border-dashed border-[#6ee7b7]/60 shadow-[0_0_8px_rgba(110,231,183,0.5)] animate-[spin-reverse_15s_linear_infinite]"></div>

                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative z-10 border-[1.5px] border-[#a7f3d0] shadow-[0_0_20px_rgba(167,243,208,0.6)]"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(4px)' }}
                >
                  <div className="scale-[0.55] origin-center">
                    <IntelligentHubIcon />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] text-slate-200 leading-[2] text-justify font-light tracking-wide w-full">
              融合多模态大模型与物联网传感技术，通过智能中枢、传感器网络及能源系统自动化管理，更有效地支持和推动农业生产，实现现代农业的高效运转。
            </p>
          </div>
        </div>

        {/* ================= 🔮 智能中枢核心 ================= */}
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
          <div className="mb-6">
            <span className="text-[#a7f3d0] text-[18px] font-bold tracking-[0.4em] drop-shadow-[0_0_12px_rgba(167,243,208,0.9)]">智能中枢</span>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-[260px] h-[260px] rounded-full bg-[#6ee7b7]/10 blur-3xl animate-[pulse-soft_4s_infinite]"></div>
            <div className="absolute w-[210px] h-[210px] rounded-full border-[2px] border-[#a7f3d0]/30 shadow-[0_0_15px_rgba(167,243,208,0.4)] animate-[spin-slow_40s_linear_infinite]"></div>
            <div className="absolute w-[190px] h-[190px] rounded-full border-[2.5px] border-dashed border-[#6ee7b7]/40 shadow-[0_0_10px_rgba(110,231,183,0.3)] animate-[spin-reverse_25s_linear_infinite]"></div>
            <div className="absolute w-[165px] h-[165px] rounded-full border border-[#34d399]/50 shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>

            <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center relative z-10 border-[2px] border-[#a7f3d0] shadow-[0_0_40px_rgba(167,243,208,0.4)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <IntelligentHubIcon />
            </div>
          </div>
        </div>

        {/* ================= 🛡️ 右侧：安全接入系统 ================= */}
        <div className="w-[320px] relative z-20">
          <div
            className="w-full rounded-[24px] p-7 flex flex-col justify-center relative border border-slate-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
            style={{ backgroundColor: 'rgba(32, 45, 65, 0.15)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            <div className="mb-8 mt-1">
              <h2 className="text-[22px] font-bold text-white tracking-widest drop-shadow-md">安全接入系统</h2>
              <p className="text-[11px] text-slate-300 mt-1 font-mono">Secure Access System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7f3d0] transition-colors"><User className="w-[16px] h-[16px]" /></div>
                {/* 🚨去掉了 required，解决拦截问题 */}
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-[46px] border border-slate-500/40 rounded-xl py-2 pl-10 pr-4 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-[#a7f3d0] transition-all" style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }} placeholder="账户" />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7f3d0] transition-colors"><Lock className="w-[16px] h-[16px]" /></div>
                {/* 🚨去掉了 required，解决拦截问题 */}
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[46px] border border-slate-500/40 rounded-xl py-2 pl-10 pr-10 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-[#a7f3d0] transition-all" style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }} placeholder="密码" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <Eye className="w-[16px] h-[16px]" /> : <EyeOff className="w-[16px] h-[16px]" />}
                </button>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex items-center gap-2 text-[12px] text-slate-200 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-400 bg-transparent text-[#a7f3d0]" /> 记住我
                </label>
                <a href="#" className="text-[12px] text-slate-300 hover:text-[#a7f3d0]">忘记密码?</a>
              </div>

              <button type="submit" disabled={isLoading} className="cyber-button mt-2" style={{ height: '48px' }}>
                <div className="cyber-button-inner">
                  {isLoading ? (
                    <span className="font-bold flex items-center gap-2 text-[14px] text-[#064e3b]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#064e3b]" />验证中...
                    </span>
                  ) : (
                    <>
                      <span className="text-[16px] font-extrabold tracking-widest ml-2">登 录</span>
                      <Zap className="w-[16px] h-[16px] text-[#064e3b] fill-current ml-1" />
                      <ArrowRight className="w-[18px] h-[18px] text-[#064e3b] stroke-[2.5]" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-6 text-center pt-3">
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-[12px] text-[#a7f3d0] hover:text-[#ccfbf1]"
              >
                新用户注册?
              </button>
              <p className="text-[10px] text-slate-400 mt-4 font-mono opacity-70">V2.4.0-stable | 内部演示网络</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}