'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportButton({ messageId }: { messageId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. 根据传入的 messageId 精准定位到页面上的那个聊天气泡 DOM
      const element = document.getElementById(`message-${messageId}`);
      if (!element) {
        console.error('未找到报告内容');
        return;
      }

      // 2. 将 DOM 元素转化为高清 Canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提升 2 倍清晰度，防止 PDF 模糊
        useCORS: true, // 允许跨域加载图标/字体
        backgroundColor: '#ffffff', // 统一白色底色，去掉暗黑模式的干扰
         // 给 PDF 四周留点白边，更好看
      });

      // 3. 将 Canvas 转成图片数据
      const imgData = canvas.toDataURL('image/png');
      
      // 4. 初始化 PDF（根据气泡的宽高自适应尺寸）
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width + 40, canvas.height + 40] 
      });

      // 5. 写入图片并触发浏览器下载
      pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
      pdf.save(`农测通_AI诊断报告_${messageId.slice(-6)}.pdf`);
      
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      alert('导出失败，请重试');
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