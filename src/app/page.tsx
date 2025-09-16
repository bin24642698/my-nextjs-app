'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: '',
    message: ''
  });

  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        setIsContactOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // 阻止背景滚动
  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isContactOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 处理弹窗外部点击关闭的优化逻辑
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMouseDown(true);
      setMouseDownTarget(e.target);
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    // 只有当鼠标按下和松开都在同一个遮罩层元素上时，才关闭弹窗
    if (isMouseDown && e.target === e.currentTarget && e.target === mouseDownTarget) {
      setIsContactOpen(false);
    }
    setIsMouseDown(false);
    setMouseDownTarget(null);
  };

  // 处理鼠标离开遮罩层时重置状态
  const handleOverlayMouseLeave = () => {
    setIsMouseDown(false);
    setMouseDownTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟提交处理
    console.log('表单数据:', formData);
    alert('感谢您的咨询！我们会尽快与您联系。');
    setIsContactOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      inquiryType: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-light" style={{backgroundColor: 'rgba(248, 249, 250, 0.95)'}}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--color-dark)'}}>
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-primary">AI技术服务平台</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-secondary hover:text-primary transition-colors">服务</a>
              <a href="#features" className="text-secondary hover:text-primary transition-colors">特色</a>
              <a href="#about" className="text-secondary hover:text-primary transition-colors">关于</a>
              <button onClick={() => setIsContactOpen(true)} className="btn-primary">联系我们</button>
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button className="text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区块 */}
      <section className="gradient-bg pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              AI驱动的
              <span style={{color: 'var(--color-dark)'}}> 智能服务 </span>
              平台
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              为企业提供专业的人工智能技术服务，助力数字化转型，释放AI潜能，创造无限可能
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#services" className="btn-primary text-lg px-8 py-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                开始体验
              </a>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                </svg>
                了解更多
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 服务特色区块 */}
      <section id="features" className="py-20 bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">核心特色</h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              我们提供全方位的AI技术解决方案，为您的业务赋能
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">智能创新</h3>
              <p className="text-secondary leading-relaxed">
                采用最前沿的AI技术，为您的业务带来创新性的解决方案，提升竞争优势
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">高效稳定</h3>
              <p className="text-secondary leading-relaxed">
                7x24小时稳定运行，高性能处理能力，确保您的业务连续性和可靠性
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-[#f59e0b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">专业服务</h3>
              <p className="text-secondary leading-relaxed">
                专业的技术团队提供一对一服务支持，从需求分析到方案实施全程陪伴
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 服务模块展示 */}
      <section id="services" className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">核心服务</h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              提供多样化的AI服务模块，满足不同业务场景需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">智能对话</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                基于大语言模型的智能对话系统，提供自然流畅的人机交互体验
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>

            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#10b981] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">数据分析</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                强大的数据处理和分析能力，帮助企业洞察业务趋势，优化决策
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>

            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#f59e0b] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">图像识别</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                先进的计算机视觉技术，实现高精度图像识别和内容理解
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>

            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#ef4444] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">语音处理</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                语音识别与合成技术，支持多语言处理，为用户提供便捷的语音交互
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>

            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#8b5cf6] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">自动化流程</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                智能流程自动化解决方案，提升工作效率，降低运营成本
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>

            <div className="card group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#06b6d4] rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-primary">安全防护</h3>
              </div>
              <p className="text-[#64748b] mb-4">
                企业级安全保障，数据加密传输，确保用户信息和业务数据安全
              </p>
              <div className="font-semibold" style={{color: 'var(--color-dark)'}}>了解详情 →</div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-primary border-t border-light py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--color-dark)'}}>
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-primary">AI技术服务平台</span>
              </div>
              <p className="text-secondary mb-4 max-w-md">
                专注于为企业提供专业的人工智能技术服务，助力数字化转型，创造智能未来。
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-secondary transition-colors" style={{'&:hover': {color: 'var(--color-dark)'}}}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-secondary transition-colors" style={{'&:hover': {color: 'var(--color-dark)'}}}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-secondary transition-colors" style={{'&:hover': {color: 'var(--color-dark)'}}}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-primary font-semibold mb-4">服务</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-secondary hover:text-primary transition-colors">智能对话</a></li>
                <li><a href="#" className="text-secondary hover:text-primary transition-colors">数据分析</a></li>
                <li><a href="#" className="text-secondary hover:text-primary transition-colors">图像识别</a></li>
                <li><a href="#" className="text-secondary hover:text-primary transition-colors">语音处理</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-primary font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2">
                <li className="text-secondary">邮箱: contact@ai-platform.com</li>
                <li className="text-secondary">电话: +86 400-123-4567</li>
                <li className="text-secondary">地址: 北京市朝阳区科技园</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-light mt-8 pt-8 text-center">
            <p className="text-secondary">
              © 2025 AI技术服务平台. 版权所有.
            </p>
          </div>
        </div>
      </footer>

      {/* 联系我们弹窗 */}
      {isContactOpen && (
        <div 
          className={`modal-overlay ${isContactOpen ? 'active' : ''}`}
          onMouseDown={handleOverlayMouseDown}
          onMouseUp={handleOverlayMouseUp}
          onMouseLeave={handleOverlayMouseLeave}
        >
          <div 
            className="modal-container"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">联系我们</h2>
              <button 
                className="modal-close" 
                onClick={() => setIsContactOpen(false)}
                aria-label="关闭弹窗"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">姓名 *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">邮箱 *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="请输入您的邮箱"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">电话</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="请输入您的电话号码"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">公司/组织</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="请输入您的公司或组织"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inquiryType" className="form-label">咨询类型 *</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">请选择咨询类型</option>
                    <option value="智能对话">智能对话解决方案</option>
                    <option value="数据分析">数据分析服务</option>
                    <option value="图像识别">图像识别技术</option>
                    <option value="语音处理">语音处理服务</option>
                    <option value="自动化流程">自动化流程优化</option>
                    <option value="安全防护">安全防护方案</option>
                    <option value="其他">其他需求</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">详细需求 *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="请详细描述您的需求，我们将为您提供专业的解决方案..."
                    required
                  />
                </div>

                <button type="submit" className="btn-primary form-submit">
                  提交咨询
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
