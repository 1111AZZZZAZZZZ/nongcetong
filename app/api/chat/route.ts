import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. 除了 messages，把前端传过来的环境数据 (envData) 一起解析出来
    const { messages, envData } = await req.json();

    // 2. 提取大棚的真实数据，如果前端还没加载完/没传，给个默认兜底值防止报错
    const temp = envData?.temp ?? '未知';
    const humidity = envData?.humidity ?? '未知';
    const greenhouseId = envData?.id ?? '当前';

    // 3. 动态拼装 System Prompt (系统提示词) - 注入灵魂
    const systemPrompt = `
      你是“农策通”智慧农业系统的 AI 决策中枢专家。
      当前正在监测【${greenhouseId}大棚】。
      
      【实时环境数据】
      - 温度：${temp} ℃
      - 湿度：${humidity} %
      
      【你的任务】
      请严格根据以上真实数据，为用户提供专业的农业评估和建议。
      - 如果温湿度在正常范围内，请说明长势平稳。
      - 如果温度偏高（如超过30℃甚至达到36.5℃）或湿度过高（如达到88%），这属于【紧急危险状态】！你必须立刻发出预警，并强烈建议采取干预措施（如开启温室通风机组、启动滴灌水泵等）。
      绝对不要编造数据，一切判断必须以上述实时数据为准！
    `;

    const result = await streamText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt, // ✅ 核心修复：把带有真实数据的提示词塞给 DeepSeek
      messages,
    });

    // ✅ 修正点：使用 DataStream 响应，前端解析逻辑已兼容
    // ✅ 统一使用 toTextStreamResponse() 兼容性最强
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