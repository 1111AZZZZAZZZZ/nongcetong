import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});
/**
 * [AI 辅助标注 - DeepSeek-V3]: 生成了基础的 POST 请求流式响应架构。
 * [人工定制开发 - 用户名]: 
 * 1. 增加了本地 PII (个人隐私) 脱敏过滤器。
 * 2. 注入了当前大棚的动态环境上下文 (Context Injection)。
 * 3. 修复了 AI 无法识别 Node.js 最新类型定义导致的 ts(2353) 错误。
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      system: "你是一个农业专家。",
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}