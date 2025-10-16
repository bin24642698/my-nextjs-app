import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AI_API_URL = 'http://114.55.8.214:10000/v1';
const AI_API_KEY = 'sk-bTeyYvmFC9TgCceScubbJof60qmym8uHynEZQ1vaMicoXM24';
const AI_MODEL = 'gemini-2.5-pro';

// 不同模型的配置
const MODEL_CONFIGS: Record<string, { maxTokens: number; temperature: number }> = {
  'gemini-2.5-pro': {
    maxTokens: 64000,
    temperature: 0.7,
  },
  'gemini-flash-latest': {
    maxTokens: 64000,
    temperature: 0.7,
  },
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // 默认非流式：如果未显式传入 stream，则按非流式处理
    const { messages, stream = false, model = AI_MODEL } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

    // 获取模型配置，如果没有配置则报错
    const modelConfig = MODEL_CONFIGS[model];
    if (!modelConfig) {
      return NextResponse.json(
        { error: `模型 ${model} 未配置，请在 MODEL_CONFIGS 中添加配置` },
        { status: 400 }
      );
    }

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

    // 非流式响应：提取纯文本后再返回（与前端现有读取逻辑兼容）
    const data = await response.json().catch(() => ({}));

    // 从上游 JSON 中提取纯文本内容的工具函数
    // 说明：优先兼容 OpenAI 风格的 chat/completions 响应，其次兼容部分供应商的 candidates/parts 格式
    const extractPlainText = (payload: any): string => {
      try {
        // 1) OpenAI 兼容：choices[].message.content 文本
        if (payload && Array.isArray(payload.choices) && payload.choices.length > 0) {
          const first = payload.choices[0];
          if (first && first.message && typeof first.message.content === 'string') {
            return first.message.content as string;
          }
          // 有些实现可能返回 choices[].text
          if (typeof first?.text === 'string') {
            return first.text as string;
          }
          // content 可能为数组（部分实现返回分片）
          if (Array.isArray(first?.message?.content)) {
            const parts = first.message.content
              .filter((p: any) => typeof p?.text === 'string' || typeof p === 'string')
              .map((p: any) => (typeof p === 'string' ? p : p.text));
            if (parts.length > 0) return parts.join('');
          }
        }

        // 2) Gemini 风格：candidates[].content.parts[].text
        if (payload && Array.isArray(payload.candidates) && payload.candidates.length > 0) {
          const c0 = payload.candidates[0];
          const parts = c0?.content?.parts;
          if (Array.isArray(parts)) {
            const texts = parts
              .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
              .filter((t: string) => t);
            if (texts.length > 0) return texts.join('\n');
          }
          if (typeof c0?.content === 'string') return c0.content as string;
        }

        // 3) 兜底：如果上游返回了 text 字段
        if (typeof payload?.text === 'string') return payload.text as string;

        // 4) 最后兜底：将对象字符串化，避免返回空串
        return typeof payload === 'string' ? payload : JSON.stringify(payload);
      } catch {
        return typeof payload === 'string' ? payload : JSON.stringify(payload);
      }
    };

    const plainText = extractPlainText(data) ?? '';

    // 与现有前端读取逻辑兼容：保持 choices[0].message.content 结构，仅传递纯文本
    return NextResponse.json({
      choices: [
        {
          message: { content: plainText },
        },
      ],
    });
  } catch (error) {
    console.error('AI 聊天 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
