import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      messages,
    });

    // ✅ 修正点：使用 DataStream 响应，前端解析逻辑已兼容// ✅ 统一使用 toTextStreamResponse() 兼容性最强
return result.toTextStreamResponse();
  } catch (error: any) {
  // 这一行会在你 VS Code 终端打印真正的错误详情
  console.error("【后端报错详情】:", error.message || error);
  
  return new Response(JSON.stringify({ 
    error: "API调用失败", 
    details: error.message 
  }), { status: 500 });
}
}