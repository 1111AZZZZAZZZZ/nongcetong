// components/IrrigationControlCard.tsx
export default function IrrigationControlCard({ toolInvocation }: { toolInvocation: any }) {
  const { args, state, result } = toolInvocation;

  // 状态 1：Input available (模型已决定调用，正在执行) [cite: 13]
  if (state === 'call') {
    return (
      <div className="animate-pulse p-4 border rounded-lg bg-blue-50 text-blue-600">
        <span className="loading-spinner mr-2">⚙️</span>
        正在向 {args.greenhouseId} 号大棚下发指令... 
        (设定的时长: {args.durationMinutes} 分钟)
      </div>
    );
  }

  // 状态 2：Output available (执行完成，拿到结果) [cite: 14]
  if (state === 'result') {
    return (
      <div className="p-4 border rounded-lg bg-green-50 border-green-200">
        <div className="flex items-center text-green-700 font-bold mb-2">
          <span>✅ 指令执行成功</span>
        </div>
        <p className="text-sm text-green-600">{result.message}</p>
        <button className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded">
          查看设备状态
        </button>
      </div>
    );
  }

  // 状态 3：Output Error (执行失败的后备UI) [cite: 15]
  return (
    <div className="p-4 border rounded-lg bg-red-50 text-red-600">
      ⚠️ 指令下发失败，请检查网络或重试。
    </div>
  );
}