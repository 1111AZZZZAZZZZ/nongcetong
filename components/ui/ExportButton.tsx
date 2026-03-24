'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image'; // 👉 换用更强大的现代引擎
import jsPDF from 'jspdf';

export default function ExportButton({ messageId }: { messageId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. 定位 DOM
      const element = document.getElementById(`message-${messageId}`);
      if (!element) {
        console.error('未找到报告内容');
        return;
      } 
      // 2. 使用 html-to-image 完美支持现代 CSS 颜色和样式
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2, // 提升清晰度
        backgroundColor: '#ffffff', // 统一白底
      });

      // 3. 获取气泡的真实尺寸，让 PDF 自适应大小
      const rect = element.getBoundingClientRect();
      
      // 4. 初始化 PDF
      const pdf = new jsPDF({
        orientation: rect.width > rect.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [rect.width + 40, rect.height + 40] 
      });

      // 5. 写入图片并下载
      pdf.addImage(dataUrl, 'PNG', 20, 20, rect.width, rect.height);
      pdf.save(`农测通_AI诊断报告_${messageId.slice(-6)}.pdf`);
      
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      alert('导出失败，请检查控制台报错');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold hover:text-green-600 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      {isExporting ? '生成报告中...' : '导出为 PDF 报告'}
    </button>
  );
}