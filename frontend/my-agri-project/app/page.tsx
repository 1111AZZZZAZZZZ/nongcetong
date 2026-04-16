'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [myInput, setMyInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: '您好！我是智慧农业助手。当前1号大棚温湿度正常（26.5°C / 42%），有什么我可以帮您的？' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    // 从localStorage获取，没有则生成新的
    const storedSessionId = localStorage.getItem('agri-session-id');
    if (storedSessionId) {
      return storedSessionId;
    } else {
      const newSessionId = Date.now().toString();
      localStorage.setItem('agri-session-id', newSessionId);
      return newSessionId;
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送函数：手动处理响应
  const onSend = async () => {
    if (!myInput || !myInput.trim() || isLoading) return;

    const userText = myInput;
    const userMsg = { id: Date.now().toString(), role: 'user', content: userText };
            
    setMessages(prev => [...prev, userMsg]);
    setMyInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/nongcetong/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, sessionId: sessionId }),
      });

      if (!response.ok) throw new Error("API连接失败");

      const data = await response.json();
      const assistantId = (Date.now() + 1).toString();
      
      // 添加助手响应气泡
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: data.data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "AI服务暂时不可用，请稍后再试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-green-800">智慧农业智能中枢</h1>
          <p className="text-zinc-500 italic text-sm font-medium">2026 计算机设计大赛参赛项目</p>
        </div>

        <Card className="shadow-xl border-zinc-200 bg-white overflow-hidden">
          <CardHeader className="border-b bg-green-50/30">
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              1号大棚实时监测
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            {/* 传感器卡片区 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                <p className="text-orange-600 mb-1 font-semibold text-xs">空气温度</p>
                <p className="text-2xl font-bold text-zinc-800">26.5°C</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-blue-600 mb-1 font-semibold text-xs">土壤湿度</p>
                <p className="text-2xl font-bold text-blue-600">42%</p>
              </div>
            </div>

            {/* 对话区 */}
            <div ref={scrollRef} className="h-80 overflow-y-auto border border-zinc-100 rounded-lg bg-zinc-50/50 p-4 space-y-4 text-sm">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm whitespace-pre-wrap ${
                    m.role === 'user' 
                    ? 'bg-green-700 text-white rounded-tr-none' 
                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-[10px] text-green-600 animate-pulse">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  农业大脑分析中...
                </div>
              )}
            </div>

            {/* 输入区 */}
            <div className="flex gap-2 pt-2">
              <Input 
                placeholder="询问农业建议..." 
                value={myInput} 
                onChange={(e) => setMyInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                disabled={isLoading}
                className="bg-white border-zinc-200 rounded-full px-4 focus-visible:ring-green-600"
              />
              <Button 
                onClick={onSend} 
                disabled={isLoading || !myInput.trim()} 
                className="bg-green-700 hover:bg-green-800 text-white rounded-full px-6 transition-transform active:scale-95"
              >
                发送
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}