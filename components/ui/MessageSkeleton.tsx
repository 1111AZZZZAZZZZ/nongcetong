import { Loader2 } from "lucide-react"; // 你已经安装了 lucide-react

export function MessageSkeleton() {
  return (
    <div className="flex w-full mb-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 p-5 bg-slate-50 rounded-2xl rounded-tl-none w-full max-w-2xl border border-slate-100 shadow-sm">
        
        {/* 标题骨架 */}
        <div className="h-5 bg-slate-200/60 rounded-md w-1/3 animate-pulse"></div>
        
        {/* 正文骨架 */}
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-slate-200/60 rounded-md w-full animate-pulse delay-75"></div>
          <div className="h-4 bg-slate-200/60 rounded-md w-11/12 animate-pulse delay-100"></div>
          <div className="h-4 bg-slate-200/60 rounded-md w-4/5 animate-pulse delay-150"></div>
        </div>
        
        {/* 动态提示语，配合你的项目主题 */}
        <div className="text-xs text-emerald-600 mt-4 flex items-center gap-2 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          正在生成农情分析与作物建议...
        </div>
        
      </div>
    </div>
  );
}