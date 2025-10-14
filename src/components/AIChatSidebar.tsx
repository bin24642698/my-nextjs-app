'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent?: string;
}

const MIN_WIDTH = 300;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 400;

export default function AIChatSidebar({ isOpen, onClose, documentContent }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // 从 localStorage 加载保存的宽度
  useEffect(() => {
    const savedWidth = localStorage.getItem('ai-sidebar-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setSidebarWidth(width);
      }
    }
  }, []);

  // 开始拖拽
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // 拖拽过程中调整宽度
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;

      const newWidth = window.innerWidth - e.clientX;

      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // 保存宽度到 localStorage
      localStorage.setItem('ai-sidebar-width', sidebarWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 构建消息上下文（包含文档内容）
      const contextMessages: Message[] = [];

      if (documentContent && messages.length === 0) {
        contextMessages.push({
          role: 'system',
          content: `你是一个写作助手。用户正在编辑以下文档内容：\n\n${documentContent.substring(0, 2000)}${documentContent.length > 2000 ? '...' : ''}`,
          timestamp: Date.now(),
        });
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...contextMessages, ...messages, userMessage],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 响应失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // 添加占位消息
      const assistantMessageId = Date.now();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: assistantMessageId,
      }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  assistantMessage += content;
                  // 更新消息内容
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.timestamp === assistantMessageId
                        ? { ...msg, content: assistantMessage }
                        : msg
                    )
                  );
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后重试。',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层（移动端） */}
      <div
        className="ai-chat-overlay"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div
        ref={sidebarRef}
        className="ai-chat-sidebar"
        style={{
          width: window.innerWidth > 768 ? `${sidebarWidth}px` : '100%',
          maxWidth: window.innerWidth > 768 ? `${MAX_WIDTH}px` : '100%'
        }}
      >
        {/* 拖拽手柄 */}
        <div
          className="ai-chat-resize-handle"
          onMouseDown={startResizing}
          style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
        />
        {/* 头部 */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>AI 写作助手</h3>
          </div>
          <div className="ai-chat-header-actions">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="ai-chat-icon-btn"
                title="清空对话"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="ai-chat-icon-btn"
              title="关闭侧边栏"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="ai-chat-messages">
          {messages.length === 0 ? (
            <div className="ai-chat-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path d="M9 14s1 1 3 1 3-1 3-1" />
              </svg>
              <p>你好！我是 AI 写作助手</p>
              <p className="text-secondary">有什么可以帮助你的吗？</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.timestamp}
                className={`ai-chat-message ${message.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}
              >
                <div className="ai-chat-message-avatar">
                  {message.role === 'user' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6" />
                      <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                      <path d="M1 12h6m6 0h6" />
                      <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
                    </svg>
                  )}
                </div>
                <div className="ai-chat-message-content">
                  {message.role === 'user' ? (
                    // 用户消息显示纯文本
                    <div className="ai-chat-message-text">{message.content || '...'}</div>
                  ) : (
                    // AI 消息渲染 Markdown
                    <div className="ai-chat-message-markdown">
                      {message.content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // 自定义代码块样式
                            code: ({ node, inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return inline ? (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={`${className} hljs`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="ai-chat-message-text">...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="ai-chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息...（Shift + Enter 换行）"
            className="ai-chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="ai-chat-send-btn"
            title="发送消息"
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ai-chat-loading">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
