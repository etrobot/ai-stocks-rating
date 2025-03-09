import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, createDataStream } from 'ai';

// 创建OpenAI Compatible客户端，并启用思考内容
const provider = createOpenAICompatible({
  name: 'openai-compatible-provider',
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENROUTER_API_KEY',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.siliconflow.cn/v1',
});

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "有效的messages数组是必需的" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 打印接收到的消息，帮助调试
    console.log("接收到的消息:", JSON.stringify(messages, null, 2));

    const modelName ='deepseek-ai/DeepSeek-R1-Distill-Qwen-14B';
    
    console.log("使用模型:", modelName);
    
    // 确保消息格式正确
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const model = provider(modelName);

    // 使用createDataStream创建数据流
    const dataStream = createDataStream({
      async execute(dataStream) {
        try {
          console.log("开始处理AI响应流");
          const result = await streamText({
            system: '你是一个智能写作助手，输出时用```markdown\n ... \n```包裹正文内容,注意闭合',
            model,
            messages: formattedMessages,
            temperature: 0.7,
            maxTokens: 16384,
            onChunk: (chunk) => {
              console.log("收到数据块:", chunk);
            },
            providerOptions: {
              'openai-compatible-provider': {
                include_reasoning: true
              }
            }
          });
          
          result.mergeIntoDataStream(dataStream, { sendReasoning: true });
          console.log("流处理完成");
        } catch (error) {
          console.error("处理流时出错:", error);
          throw error;
        }
      },
      onError: (error: any) => {
        console.error("数据流处理出错:", error);
        return `处理请求时出错: ${error.message}`;
      },
    });

    return new Response(dataStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("API处理出错:", error);
    return new Response(
      JSON.stringify({
        error: "处理请求时出错",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}