import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { login, register } from '../../services/api';
import { useUserStore } from '../../store';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 云纹密码显示的遮罩字符串
  const cloudChar = '≋'; // 波浪虚线符号，类似云纹
  const passwordDisplay = password ? cloudChar.repeat(password.length) : '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const response = await login({ username, password });
        if (response.success && response.data) {
          const { user, token } = response.data;
          setUser(user);
          setToken(token);
          navigate('/live');
        } else {
          setError(response.message || '登录失败');
        }
      } else {
        // 注册
        const response = await register({ username, password, nickname });
        if (response.success && response.data) {
          const { user, token } = response.data;
          setUser(user);
          setToken(token);
          navigate('/live');
        } else {
          setError(response.message || '注册失败');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ed] relative overflow-hidden">
      {/* 水墨晕染背景 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 墨色渐变晕染 */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(45, 45, 45, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 85% 30%, rgba(45, 45, 45, 0.06) 0%, transparent 35%),
            radial-gradient(ellipse at 25% 80%, rgba(45, 45, 45, 0.05) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 70%, rgba(45, 45, 45, 0.07) 0%, transparent 40%)
          `
        }}></div>
        {/* 宣纸纹理 */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(45, 45, 45, 0.02) 1px, rgba(45, 45, 45, 0.02) 2px),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(45, 45, 45, 0.02) 1px, rgba(45, 45, 45, 0.02) 2px)
          `
        }}></div>

        {/* 墨滴晕染动画 */}
        <div className="ink-drop ink-drop-1"></div>
        <div className="ink-drop ink-drop-2"></div>
        <div className="ink-drop ink-drop-3"></div>
        <div className="ink-drop ink-drop-4"></div>

        {/* 云雾飘动层 */}
        <div className="mist-layer mist-1"></div>
        <div className="mist-layer mist-2"></div>
        <div className="mist-layer mist-3"></div>

        {/* 远山层 */}
        <svg className="absolute bottom-0 left-0 w-full h-48 opacity-10 mountain-layer" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 150 Q100 80 200 120 Q300 60 400 100 Q500 40 600 90 Q700 30 800 80 Q900 50 1000 100 L1000 200 L0 200 Z" fill="rgba(45, 45, 45, 0.3)" />
          <path d="M0 170 Q150 100 300 140 Q450 80 600 130 Q750 70 900 120 Q1000 80 1200 140 L1200 200 L0 200 Z" fill="rgba(45, 45, 45, 0.2)" />
        </svg>
      </div>

      {/* 水墨竹影装饰 */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d2d2d" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#4a4a4a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2d2d2d" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* 竹子轮廓 */}
        <g fill="none" stroke="url(#ink-gradient)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M80 0 Q85 100 75 200 Q70 300 80 400" />
          <path d="M85 50 L95 55 M85 100 L98 105 M78 150 L92 155 M80 200 L90 205 M82 250 L95 255 M78 300 L88 305" />
          <path d="M92% 10% Q90% 80% 94% 150% Q89% 220% 93% 300%" />
          <path d="M91% 40% L85% 42% M93% 90% L86% 92% M92% 140% L87% 142% M94% 190% L86% 192% M91% 240% L85% 242%" />
        </g>
      </svg>

      {/* 竹叶飘落动画 */}
      <div className="falling-leaves">
        <div className="leaf leaf-1">🎋</div>
        <div className="leaf leaf-2">🎋</div>
        <div className="leaf leaf-3">🎋</div>
        <div className="leaf leaf-4">🎋</div>
        <div className="leaf leaf-5">🎋</div>
      </div>

      <div className="relative w-full max-w-md px-4 z-10">
        {/* 文牒主体 - 带展开动画 */}
        <motion.div
          className="relative"
          initial={{
            scaleY: 0,
            opacity: 0,
          }}
          animate={{
            scaleY: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1.5,
            ease: [0.6, 0.01, 0.2, 0.02], // 先慢后快，最后突然展开
          }}
        >
          {/* 外层墨色边框 */}
          <div className="absolute inset-0 border-4 border-[#2d2d2d] rounded-lg"></div>
          <div className="absolute inset-1 border-2 border-[#4a4a4a] rounded-lg"></div>

          {/* 四角墨色装饰 */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#2d2d2d] rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#2d2d2d] rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#2d2d2d] rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#2d2d2d] rounded-br-lg"></div>

          {/* 文牒纸张 - 宣纸白 */}
          <div className="relative bg-[#fafafa] shadow-2xl overflow-hidden">
            {/* 宣纸纹理 */}
            <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(45, 45, 45, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(45, 45, 45, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
            {/* 纸张边缘墨色渐变 */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(45, 45, 45, 0.02) 50%, transparent 100%)'
            }}></div>

            {/* 顶部墨色装饰带 */}
            <div className="relative h-12 bg-[#2d2d2d] flex items-center justify-center overflow-hidden">
              {/* 祥云纹样 */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="ink-cloud-border" x="0" y="0" width="60" height="20" patternUnits="userSpaceOnUse">
                    <path d="M10 15 Q15 10 20 12 Q25 8 30 12 Q35 10 40 15 Q35 18 30 16 Q25 20 20 16 Q15 18 10 15Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ink-cloud-border)" />
              </svg>
              <h1 className="relative text-2xl font-bold text-white tracking-[0.3em]" style={{
                fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                入阁文牒
              </h1>
            </div>

            {/* 内容区域 */}
            <div className="relative p-8">
              {/* 右侧朱红印章装饰 - 带发光效果 */}
              <div className="absolute top-4 right-4 w-16 h-16 opacity-30 pointer-events-none seal-glow">
                <svg viewBox="0 0 100 100" className="w-full h-full seal-svg">
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#c41e3a" strokeWidth="3" rx="4" />
                  <rect x="12" y="12" width="76" height="76" fill="none" stroke="#c41e3a" strokeWidth="2" rx="2" />
                  <text x="50" y="40" textAnchor="middle" fill="#c41e3a" fontSize="20" fontWeight="bold" style={{ fontFamily: '"KaiTi", "STKaiti", "楷体", serif' }}>大明</text>
                  <text x="50" y="65" textAnchor="middle" fill="#c41e3a" fontSize="18" fontWeight="bold" style={{ fontFamily: '"KaiTi", "STKaiti", "楷体", serif' }}>内阁</text>
                </svg>
              </div>

              {/* 副标题 */}
              <div className="text-center mb-8 relative">
                <h2 className="text-xl text-[#2d2d2d] mb-2" style={{
                  fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
                  letterSpacing: '0.2em'
                }}>
                  大明内阁放映厅
                </h2>
                <p className="text-sm text-[#6b6b6b]" style={{
                  fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                }}>
                  小阁老，今天咱们抄谁的家?
                </p>
                {/* 底部红线装饰 */}
                <div className="flex justify-center mt-3 gap-1">
                  <div className="w-16 h-0.5 bg-[#c41e3a] opacity-50"></div>
                  <div className="w-2 h-2 rounded-full border border-[#c41e3a] opacity-50"></div>
                  <div className="w-16 h-0.5 bg-[#c41e3a] opacity-50"></div>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-[#f0e6d3] border-l-4 border-[#c41e3a] text-[#5a5a5a] rounded-r text-sm flex items-center gap-2" style={{
                  fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                }}>
                  <svg className="w-5 h-5 flex-shrink-0 text-[#c41e3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-[#2d2d2d] mb-2" style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                  }}>
                    <span className="text-[#c41e3a] mr-1">◆</span>阁员身份
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#d0d0d0] rounded focus:outline-none focus:border-[#4a4a4a] transition-all text-[#2d2d2d] placeholder-[#9a9a9a]"
                      placeholder="阁老您的尊字"
                      required
                      style={{
                        fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                      }}
                    />
                    {/* 右侧装饰 */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c41e3a] opacity-30">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#2d2d2d] mb-2" style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                  }}>
                    <span className="text-[#c41e3a] mr-1">◆</span>入阁暗号
                  </label>
                  <div className="relative">
                    {/* 真实输入框 - 透明 */}
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="absolute inset-0 w-full h-full px-4 py-3 opacity-0 cursor-text z-10"
                      required
                    />
                    {/* 云纹显示层 - 只读 */}
                    <input
                      type="text"
                      value={passwordDisplay}
                      readOnly
                      className="w-full px-4 py-3 bg-white border-2 border-[#d0d0d0] rounded transition-all text-[#2d2d2d] placeholder-[#9a9a9a] pointer-events-none"
                      placeholder="请输入暗号"
                      style={{
                        fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
                        letterSpacing: '0.3em',
                        color: password ? '#4a4a4a' : '#9a9a9a',
                      }}
                    />
                    {/* 右侧锁图标 */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-40">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm text-[#2d2d2d] mb-2" style={{
                      fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                    }}>
                      <span className="text-[#9a9a9a] mr-1">◆</span>别号（可选）
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-[#d0d0d0] rounded focus:outline-none focus:border-[#4a4a4a] transition-all text-[#2d2d2d] placeholder-[#9a9a9a]"
                        placeholder="请输入别号"
                        style={{
                          fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 朱红印章按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 relative overflow-hidden group"
                  style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
                    background: 'linear-gradient(to bottom, #e8474a 0%, #c41e3a 50%, #a01820 100%)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    letterSpacing: '0.2em',
                    boxShadow: '0 4px 12px rgba(196, 30, 58, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    borderRadius: '4px'
                  }}
                >
                  {/* 纹理叠加 */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px)',
                    backgroundSize: '100% 4px'
                  }}></div>
                  {/* 边框内线 */}
                  <div className="absolute inset-1 border border-[#ff6b6b] opacity-30 rounded-sm"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        验核中...
                      </>
                    ) : (
                      <>
                        {isLogin ? '☁️ 验印通关' : '📜 领取文牒'}
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* 切换登录/注册 */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-[#4a4a4a] hover:text-[#2d2d2d] transition-colors text-sm"
                  style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                  }}
                >
                  {isLogin ? '─── 尚无官职？即刻买官 ───' : '─── 已有文牒？回府验印 ───'}
                </button>
              </div>

              {/* 分隔线 */}
              {isLogin && (
                <div className="relative my-6 flex items-center">
                  <div className="flex-1 border-t border-[#d0d0d0]"></div>
                  <div className="px-3 text-xs text-[#9a9a9a]" style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
                  }}>
                    或
                  </div>
                  <div className="flex-1 border-t border-[#d0d0d0]"></div>
                </div>
              )}

              {/* 游客入口 */}
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setUser({
                      id: 'guest',
                      username: 'guest',
                      role: 'guest',
                    });
                    navigate('/live');
                  }}
                  className="w-full py-2.5 bg-white border-2 border-[#d0d0d0] text-[#4a4a4a] hover:bg-[#f5f5f5] hover:border-[#4a4a4a] transition-all flex items-center justify-center gap-2 rounded"
                  style={{
                    fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
                    fontSize: '0.95rem'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  微服私访
                </button>
              )}
            </div>

            {/* 底部墨色装饰带 */}
            <div className="h-10 bg-[#2d2d2d] flex items-center justify-center relative overflow-hidden">
              {/* 祥云纹样 */}
              <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="ink-cloud-border-bottom" x="0" y="0" width="60" height="20" patternUnits="userSpaceOnUse">
                    <path d="M10 15 Q15 10 20 12 Q25 8 30 12 Q35 10 40 15 Q35 18 30 16 Q25 20 20 16 Q15 18 10 15Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ink-cloud-border-bottom)" />
              </svg>
              <p className="relative text-xs text-white tracking-widest" style={{
                fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
              }}>
                ◇ 皇帝不让看 - 咱这也能看◇
              </p>
            </div>
          </div>
        </motion.div>

        {/* 底部落款 */}
        <div className="mt-6 text-center">
          <p className="text-[#6b6b6b] text-sm" style={{
            fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
            letterSpacing: '0.1em'
          }}>
            — 大明内阁 · 有趣灵魂收集处 —
          </p>
          <p className="text-[#9a9a9a] text-xs mt-1" style={{
            fontFamily: '"KaiTi", "STKaiti", "楷体", serif'
          }}>
            Village Broadcast © 2025
          </p>
        </div>
      </div>

      {/* 水墨动画样式 */}
      <style>{`
        /* 墨滴晕染动画 */
        .ink-drop {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45, 45, 45, 0.15) 0%, rgba(45, 45, 45, 0.05) 50%, transparent 70%);
          animation: inkSpread 8s ease-in-out infinite;
        }

        .ink-drop-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .ink-drop-2 {
          width: 250px;
          height: 250px;
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .ink-drop-3 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        .ink-drop-4 {
          width: 280px;
          height: 280px;
          top: 30%;
          right: 30%;
          animation-delay: 6s;
        }

        @keyframes inkSpread {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          80% {
            opacity: 0.2;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        /* 云雾飘动 */
        .mist-layer {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(200, 200, 200, 0.03) 20%,
            rgba(200, 200, 200, 0.05) 50%,
            rgba(200, 200, 200, 0.03) 80%,
            transparent 100%
          );
          animation: mistFloat 20s ease-in-out infinite;
        }

        .mist-1 {
          top: 0;
          animation-delay: 0s;
          opacity: 0.5;
        }

        .mist-2 {
          top: 30%;
          animation-delay: -7s;
          opacity: 0.4;
        }

        .mist-3 {
          top: 60%;
          animation-delay: -14s;
          opacity: 0.3;
        }

        @keyframes mistFloat {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        /* 远山浮动 */
        .mountain-layer {
          animation: mountainFloat 15s ease-in-out infinite;
        }

        @keyframes mountainFloat {
          0%, 100% {
            transform: translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateX(20px);
            opacity: 0.15;
          }
        }

        /* 竹叶飘落 */
        .falling-leaves {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .leaf {
          position: absolute;
          font-size: 1.2rem;
          opacity: 0;
          animation: leafFall linear infinite;
        }

        .leaf-1 {
          top: -10%;
          right: 20%;
          animation-duration: 12s;
          animation-delay: 0s;
        }

        .leaf-2 {
          top: -10%;
          right: 40%;
          animation-duration: 15s;
          animation-delay: 3s;
          animation-timing-function: ease-in-out;
        }

        .leaf-3 {
          top: -10%;
          right: 60%;
          animation-duration: 18s;
          animation-delay: 6s;
        }

        .leaf-4 {
          top: -10%;
          right: 80%;
          animation-duration: 14s;
          animation-delay: 9s;
          animation-timing-function: ease-in-out;
        }

        .leaf-5 {
          top: -10%;
          right: 30%;
          animation-duration: 16s;
          animation-delay: 12s;
        }

        @keyframes leafFall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          30% {
            transform: translateY(30vh) rotate(180deg) translateX(30px);
          }
          60% {
            transform: translateY(60vh) rotate(360deg) translateX(-20px);
            opacity: 0.4;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(110vh) rotate(540deg) translateX(10px);
            opacity: 0;
          }
        }

        /* 印章发光效果 */
        .seal-glow {
          animation: sealPulse 3s ease-in-out infinite;
        }

        .seal-svg {
          filter: drop-shadow(0 0 8px rgba(196, 30, 58, 0.6))
                  drop-shadow(0 0 16px rgba(196, 30, 58, 0.4))
                  drop-shadow(0 0 24px rgba(196, 30, 58, 0.2));
          animation: svgGlow 3s ease-in-out infinite;
        }

        @keyframes sealPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes svgGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(196, 30, 58, 0.6))
                    drop-shadow(0 0 16px rgba(196, 30, 58, 0.4))
                    drop-shadow(0 0 24px rgba(196, 30, 58, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(196, 30, 58, 0.8))
                    drop-shadow(0 0 24px rgba(196, 30, 58, 0.5))
                    drop-shadow(0 0 36px rgba(196, 30, 58, 0.3));
          }
        }
      `}</style>
    </div>
  );
}
