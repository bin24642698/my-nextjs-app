'use client';

import { useState, useRef, useEffect } from 'react';
import { useSystemPrompt } from '@/hooks/useSystemPrompt';
import { SystemPromptService } from '@/utils/idb/systemPrompts';
import type { SystemPromptSchema } from '@/utils/idb/schema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_WIDTH = 300;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 400;

export default function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-pro' | 'gemini-flash-latest'>('gemini-2.5-pro');
  // 中文说明：是否显示设置面板
  const [showSettings, setShowSettings] = useState(false);
  // 中文说明：保存按钮的"已保存"提示状态
  const [savedIndicator, setSavedIndicator] = useState(false);
  // 中文说明：系统提示词 Hook
  const { prompt: systemPrompt, setPrompt: setSystemPrompt, save: saveSystemPrompt, loading: loadingPrompt, saving: savingPrompt } = useSystemPrompt();
  // 中文说明：提示词库选择器状态
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [promptLibrary, setPromptLibrary] = useState<SystemPromptSchema[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  // 中文说明：保存按钮可用性与文案
  const isSaveDisabled = loadingPrompt || savingPrompt || savedIndicator;
  const saveBtnText = savingPrompt ? '保存中...' : (savedIndicator ? '已保存' : '保存');
  const handleSaveSystemPrompt = async () => {
    if (isSaveDisabled) return;
    try {
      await saveSystemPrompt(systemPrompt);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1000);
    } catch {
      // 中文说明：失败则不展示"已保存"状态
    }
  };

  // 加载提示词库
  const loadPromptLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const prompts = await SystemPromptService.getAll();
      setPromptLibrary(prompts);
    } catch (error) {
      console.error('加载提示词库失败:', error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  // 选择提示词
  const selectPrompt = (prompt: SystemPromptSchema) => {
    setSystemPrompt(prompt.content);
    setShowPromptLibrary(false);
  };

  // 打开提示词库时加载列表
  useEffect(() => {
    if (showPromptLibrary) {
      loadPromptLibrary();
    }
  }, [showPromptLibrary]);
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

  // 从 localStorage 加载保存的宽度，并检测是否为移动端
  useEffect(() => {
    const savedWidth = localStorage.getItem('ai-sidebar-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setSidebarWidth(width);
      }
    }

    // 检测是否为移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
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
      // 纯对话模式：不再自动注入文档内容到上下文
      const contextMessages: Message[] = [];
      // 中文说明：如已设置系统提示词，则将其作为第一条 system 消息注入上下文
      const systemMsg: Message[] = systemPrompt && systemPrompt.trim()
        ? [{ role: 'system', content: systemPrompt.trim(), timestamp: Date.now() }]
        : [];

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...systemMsg, ...contextMessages, ...messages, userMessage],
          stream: false,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 响应失败');
      }

      // 处理非流式响应
      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || '无响应内容';

      // 添加AI响应消息
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      }]);
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

  // 移动端：全屏显示
  if (isMobile) {
    return (
      <>
        {/* 遮罩层（移动端） */}
        <div
          className="ai-chat-overlay"
          onClick={onClose}
        />

        {/* 侧边栏（移动端全屏） */}
        <div
          ref={sidebarRef}
          className="ai-chat-sidebar-mobile"
        >
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
                onClick={() => setShowSettings((s) => !s)}
                className="ai-chat-icon-btn"
                title="系统提示词设置"
              >
                {/* 中文说明：齿轮图标 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09c0 .66.39 1.25 1 1.51.57.26 1.25.17 1.74-.24l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.41.49-.5 1.17-.24 1.74.26.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.39-1.51 1Z" />
                </svg>
              </button>
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

          {/* 设置面板（移动端） */}
          {showSettings && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'grid', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>系统提示词：</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="为 AI 设置上下文规则或身份，例如：你是一个严谨的中文写作助手..."
                className="form-input"
                rows={4}
                style={{ padding: '8px 10px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setShowPromptLibrary(true)}
                  style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--btn-bg, #fff)', cursor: 'pointer' }}
                >
                  从库中选择
                </button>
                <button
                  onClick={handleSaveSystemPrompt}
                  disabled={isSaveDisabled}
                  style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--btn-bg, #fff)', opacity: isSaveDisabled ? 0.6 : 1, cursor: isSaveDisabled ? 'not-allowed' : 'pointer' }}
                >
                  {saveBtnText}
                </button>
              </div>
            </div>
          )}

          {/* 模型选择器 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--secondary-text)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6" />
                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                <path d="M1 12h6m6 0h6" />
                <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
              </svg>
              <span>模型：</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as 'gemini-2.5-pro' | 'gemini-flash-latest')}
                className="form-input"
                style={{ flex: 1, minWidth: 0, padding: '6px 10px', fontSize: '14px' }}
              >
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-flash-latest">Gemini Flash</option>
              </select>
            </label>
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
                      <div className="ai-chat-message-text">{message.content || '...'}</div>
                    ) : (
                      <div className="ai-chat-message-markdown">
                        {message.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                              code: (props: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
                                const { inline, className, children, ...rest } = props;
                                return !inline ? (
                                  <code className={`${className || ''} hljs`} {...rest}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className} {...rest}>
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

  // 桌面端：在同一图层，占据实际空间
  return (
    <>
    <div
      ref={sidebarRef}
      className="ai-chat-sidebar-desktop"
      style={{ width: `${sidebarWidth}px` }}
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
            onClick={() => setShowSettings((s) => !s)}
            className="ai-chat-icon-btn"
            title="系统提示词设置"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09c0 .66.39 1.25 1 1.51.57.26 1.25.17 1.74-.24l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.41.49-.5 1.17-.24 1.74.26.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.39-1.51 1Z" />
            </svg>
          </button>
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

      {/* 设置面板（桌面端） */}
      {showSettings && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'grid', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>系统提示词：</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="为 AI 设置上下文规则或身份，例如：你是一个严谨的中文写作助手..."
            className="form-input"
            rows={4}
            style={{ padding: '8px 10px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <button
              onClick={() => setShowPromptLibrary(true)}
              style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--btn-bg, #fff)', cursor: 'pointer' }}
            >
              从库中选择
            </button>
            <button
              onClick={handleSaveSystemPrompt}
              disabled={isSaveDisabled}
              style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--btn-bg, #fff)', opacity: isSaveDisabled ? 0.6 : 1, cursor: isSaveDisabled ? 'not-allowed' : 'pointer' }}
            >
              {saveBtnText}
            </button>
          </div>
        </div>
      )}

      {/* 模型选择器 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--secondary-text)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6" />
            <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
            <path d="M1 12h6m6 0h6" />
            <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
          </svg>
          <span>模型：</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as 'gemini-2.5-pro' | 'gemini-flash-latest')}
            className="form-input"
            style={{ flex: 1, minWidth: 0, padding: '6px 10px', fontSize: '14px' }}
          >
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-flash-latest">Gemini Flash</option>
          </select>
        </label>
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
                  <div className="ai-chat-message-text">{message.content || '...'}</div>
                ) : (
                  <div className="ai-chat-message-markdown">
                    {message.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        components={{
                          code: (props: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
                            const { inline, className, children, ...rest } = props;
                            return !inline ? (
                              <code className={`${className || ''} hljs`} {...rest}>
                                {children}
                              </code>
                            ) : (
                              <code className={className} {...rest}>
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

    {/* 提示词库弹窗 */}
    {showPromptLibrary && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setShowPromptLibrary(false)}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-light">
            <h2 className="text-xl font-bold text-primary">选择提示词</h2>
            <button
              onClick={() => setShowPromptLibrary(false)}
              className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-light transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loadingLibrary ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary">加载中...</p>
              </div>
            ) : promptLibrary.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-secondary mb-4">还没有保存的提示词</p>
                <p className="text-sm text-muted">点击右上角按钮进入提示词管理页面创建</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {promptLibrary.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="card p-4 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => selectPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary">{prompt.title}</h3>
                      {prompt.category && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{prompt.category}</span>
                      )}
                    </div>
                    {prompt.description && (
                      <p className="text-sm text-secondary mb-2">{prompt.description}</p>
                    )}
                    <p className="text-sm text-muted line-clamp-2">{prompt.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
}
