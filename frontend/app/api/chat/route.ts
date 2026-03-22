import { deepseek } from '@ai-sdk/deepseek';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: deepseek('deepseek-chat'),
    messages,
    system: `你是一个专业的智慧农业助手。询问实时农情时请使用 search_agri。`,
    tools: {
      search_agri: tool({
        description: '搜索农业实时信息',
        parameters: z.object({
          query: z.string(),
        }),
        // 修改点：直接去掉解构，使用完整参数 args
        execute: async (args: { query: string }): Promise<string> => {
          const response = await fetch('https://api.valyu.ai/v1/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VALYU_API_KEY!}`,
            },
            body: JSON.stringify({ query: args.query }),
          });
          const data = await response.json();
          return data.results?.map((r: any) => r.content).join('\n') || '无结果';
        },
      }),
    },
    // 如果这里还报红，说明你当前安装的 ai 库版本确实不支持 maxSteps，请直接删掉此行
   
  });

  // 截图显示你的环境支持这个方法名
  return result.toTextStreamResponse();
}