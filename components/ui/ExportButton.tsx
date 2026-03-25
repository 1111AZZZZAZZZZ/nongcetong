'use client';
import { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

interface ExportButtonProps {
  ghouseName: string;
  temperature: number | string;
  humidity: number | string;
  aiText: string;
}

export default function ExportButton({ ghouseName, temperature, humidity, aiText }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setShowPreview(true);
    
    try {
      await new Promise(res => setTimeout(res, 800));

      if (!reportRef.current) return;

      const imgData = await htmlToImage.toPng(reportRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const domWidth = reportRef.current.offsetWidth;
      const domHeight = reportRef.current.offsetHeight;
      const pdfHeight = (domHeight * pdfWidth) / domWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`农策通_巡检工单_${ghouseName.split('(')[0]}.pdf`);
      
    } catch (error) {
      console.error("PDF 生成失败", error);
      alert("PDF 导出遇到阻碍，请重试！");
    } finally {
      setShowPreview(false);
      setIsExporting(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold hover:text-blue-600 transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> : <Download className="w-3 h-3" />}
        {isExporting ? '正在生成高清排版...' : '导出为 PDF 报告'}
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
          
          <div className="mb-2 sm:mb-6 text-green-400 text-xs sm:text-sm font-bold flex items-center gap-2 sm:gap-3 animate-pulse px-4 text-center">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
            正在为您进行高清快照截取，请稍候...
          </div>
          
          {/* 👉 核心修改：针对不同尺寸的屏幕设定不同的 CSS Scale 缩放比例，最小缩放到 0.4 以适应 iPhone SE */}
          <div className="transform scale-[0.43] min-[400px]:scale-[0.48] sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-all duration-500 ease-out animate-in zoom-in-90 slide-in-from-bottom-8">
            
            <div 
              ref={reportRef} 
              className="font-sans shadow-2xl" 
              style={{ width: '800px', padding: '48px', backgroundColor: '#ffffff', color: '#000000' }}
            >
              
              <div className="border-b-4 pb-6 mb-8 flex justify-between items-end" style={{ borderColor: '#166534' }}>
                <div>
                  <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: '#14532d' }}>农策通</h1>
                  <p className="text-xl font-bold tracking-widest" style={{ color: '#15803d' }}>SMART AGRI CONTROL · 智能巡检工单</p>
                </div>
                <div className="text-right text-sm font-medium" style={{ color: '#71717a' }}>
                  <p>生成时间: {new Date().toLocaleString('zh-CN')}</p>
                  <p>报告编号: REP-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>

              <div className="flex gap-6 mb-10">
                <div className="flex-1 p-6 rounded-2xl border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <h3 className="font-bold mb-2" style={{ color: '#166534' }}>目标区域</h3>
                  <p className="text-3xl font-black" style={{ color: '#052e16' }}>{ghouseName}</p>
                </div>
                <div className="flex-1 p-6 rounded-2xl border" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                  <h3 className="font-bold mb-2" style={{ color: '#9a3412' }}>环境温度</h3>
                  <p className="text-3xl font-black" style={{ color: '#431407' }}>{Number(temperature).toFixed(1)}°C</p>
                </div>
                <div className="flex-1 p-6 rounded-2xl border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <h3 className="font-bold mb-2" style={{ color: '#1e40af' }}>环境湿度</h3>
                  <p className="text-3xl font-black" style={{ color: '#172554' }}>{Number(humidity).toFixed(0)}%</p>
                </div>
              </div>

              <div className="p-8 rounded-2xl border min-h-[300px]" style={{ backgroundColor: '#fafafa', borderColor: '#e4e4e7' }}>
                <h2 className="text-xl font-black border-l-4 pl-4 mb-6" style={{ color: '#27272a', borderColor: '#16a34a' }}>AI 专家诊断结论与干预策略</h2>
                <div className="text-base leading-relaxed whitespace-pre-wrap font-medium" style={{ color: '#3f3f46' }}>
                  {aiText}
                </div>
              </div>

              <div className="mt-16 pt-8 border-t-2 border-dashed flex justify-between items-center" style={{ borderColor: '#d4d4d8' }}>
                <div className="text-sm font-bold space-y-1" style={{ color: '#71717a' }}>
                  <p>⚠️ 此工单由 农策通云端大模型 自动生成，仅供参考。</p>
                  <p>🛠️ 现场维修及打药操作请严格遵守现代农业安全生产规范。</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs font-bold" style={{ color: '#a1a1aa' }}>
                    <p>维修工请扫码</p>
                    <p>上传现场处置结果</p>
                  </div>
                  <div className="p-2 border rounded-xl shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7' }}>
                    {/* @ts-ignore */}
                    <QRCodeSVG value="https://example.com/agri-submit" size={64} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}