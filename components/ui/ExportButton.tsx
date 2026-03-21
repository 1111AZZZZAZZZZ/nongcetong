'use client';

import { useState } from 'react';
import { Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
// 🌟 核心杀手锏：引入了专门支持 Tailwind v4 颜色的 Pro 版本
import html2canvas from "html2canvas-pro"; 

export default function ExportButton({ messageId }: { messageId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(`message-${messageId}`);
      if (!element) return;

      // 完美兼容现代颜色空间的截图逻辑
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const renderWidth = pdfWidth - 40; 
      const renderHeight = (canvas.height * renderWidth) / canvas.width;

      pdf.setFontSize(14);
      pdf.setTextColor(21, 128, 61);
      pdf.text("智慧农业智能中枢 - 农情分析报告", 20, 30);
      pdf.addImage(imgData, 'JPEG', 20, 50, renderWidth, renderHeight);

      const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
      pdf.save(`1号大棚分析报告_${dateStr}.pdf`);
      
    } catch (error) {
      console.error("PDF 导出失败:", error);
      alert("报告生成失败，请稍后重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className="mt-2 text-xs text-zinc-400 hover:text-green-600 flex items-center gap-1 transition-colors px-1"
      title="将此分析报告导出为PDF"
    >
      {isExporting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3" />
      )}
      {isExporting ? '正在生成文档...' : '导出为 PDF 报告'}
    </button>
  );
}