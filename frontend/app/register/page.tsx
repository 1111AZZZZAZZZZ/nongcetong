'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowLeft, Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 模拟注册，1秒后跳回登录页
    setTimeout(() => {
      setIsLoading(false);
      router.push('/login'); // 注册成功后返回登录页
    }, 1000);
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center relative font-sans bg-[#020806] overflow-hidden">
      {/* 动画与登录页保持一致 */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes border-spin { 100% { transform: rotate(360deg); } }
        .cyber-button { position: relative; width: 100%; border: none; background: rgba(255, 255, 255, 0.05); cursor: pointer; transition: transform 0.2s; overflow: hidden; border-radius: 12px; }
        .cyber-button::before { content: ''; position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background: conic-gradient(transparent 0deg, transparent 340deg, #fef08a 355deg, #ca8a04 360deg); animation: border-spin 3s linear infinite; z-index: 0; }
        .cyber-button:active { transform: scale(0.98); }
        .cyber-button-inner { position: absolute; inset: 1.5px; background: linear-gradient(90deg, #86efac 0%, #22c55e 100%); color: #064e3b; display: flex; align-items: center; justify-content: center; gap: 8px; z-index: 1; border-radius: 10.5px; }
      `}} />

      {/* 视频背景 */}
      <video ref={videoRef} src="/bg.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.05)] z-[1]" />

      {/* 注册面板 */}
      <div className="relative z-10 w-[380px]">
        <div
          className="w-full rounded-[24px] p-8 flex flex-col justify-center border border-slate-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          style={{ backgroundColor: 'rgba(32, 45, 65, 0.15)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> 返回登录
          </button>

          <div className="mb-8">
            <h2 className="text-[22px] font-bold text-white tracking-widest drop-shadow-md">新节点注册</h2>
            <p className="text-[11px] text-[#34d399] mt-1 font-mono">Node Registration</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7f3d0] transition-colors"><User className="w-[16px] h-[16px]" /></div>
              <input type="text" className="w-full h-[46px] border border-slate-500/40 rounded-xl py-2 pl-10 pr-4 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-[#a7f3d0] transition-all" style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }} placeholder="设置账户名" />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7f3d0] transition-colors"><Mail className="w-[16px] h-[16px]" /></div>
              <input type="email" className="w-full h-[46px] border border-slate-500/40 rounded-xl py-2 pl-10 pr-4 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-[#a7f3d0] transition-all" style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }} placeholder="电子邮箱" />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#a7f3d0] transition-colors"><Lock className="w-[16px] h-[16px]" /></div>
              <input type="password" className="w-full h-[46px] border border-slate-500/40 rounded-xl py-2 pl-10 pr-4 text-[13px] text-white placeholder:text-slate-400 focus:outline-none focus:border-[#a7f3d0] transition-all" style={{ backgroundColor: 'rgba(10, 15, 30, 0.4)' }} placeholder="设置密码" />
            </div>

            <button type="submit" disabled={isLoading} className="cyber-button mt-4" style={{ height: '48px' }}>
              <div className="cyber-button-inner">
                {isLoading ? (
                  <span className="font-bold flex items-center gap-2 text-[14px] text-[#064e3b]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#064e3b]" />注册中...
                  </span>
                ) : (
                  <>
                    <span className="text-[16px] font-extrabold tracking-widest ml-2">注 册</span>
                    <Zap className="w-[16px] h-[16px] text-[#064e3b] fill-current ml-1" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}