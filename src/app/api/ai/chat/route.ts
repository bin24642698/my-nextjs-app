import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AI_API_URL = 'https://api.zetatechs.com/v1';
const AI_API_KEY = 'sk-98TOlWD0szFSdZeyRAtrmgATIbwwM3tI2WgjcFyGnIMYn4me';
const AI_MODEL = 'gemini-2.5-pro-free';

// 不同模型的配置
const MODEL_CONFIGS: Record<string, { maxTokens: number; temperature: number }> = {
  'gemini-2.5-pro-free': {
    maxTokens: 64000,
    temperature: 0.7,
  },
  // 可以继续添加其他模型配置
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true, model = AI_MODEL } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

    // 获取模型配置，如果没有配置则使用默认值
    const modelConfig = MODEL_CONFIGS[model] || {
      maxTokens: 4096,
      temperature: 0.7,
    };

    // 调用 AI API
    const response = await fetch(`${AI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages as Message[],
        stream: stream,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI API 错误:', errorData);
      return NextResponse.json(
        { error: 'AI 服务响应失败', details: errorData },
        { status: response.status }
      );
    }

    // 如果是流式响应，直接返回流
    if (stream) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 非流式响应
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI 聊天 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
