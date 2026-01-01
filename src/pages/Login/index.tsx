import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 relative overflow-hidden">
      {/* 网络背景特效 */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="currentColor" className="text-amber-400" />
              <path d="M30 0 V60 M0 30 H60" stroke="currentColor" strokeWidth="0.5" className="text-amber-300" strokeOpacity="0.3" />
            </pattern>
            <pattern id="network-grid-2" x="30" y="30" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="2" fill="currentColor" className="text-emerald-400" />
              <path d="M40 0 V80 M0 40 H80" stroke="currentColor" strokeWidth="0.5" className="text-emerald-300" strokeOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-grid)" />
          <rect width="100%" height="100%" fill="url(#network-grid-2)" />
        </svg>

        {/* 漂浮的连接线动画 */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <g className="network-lines">
            <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="currentColor" strokeWidth="1" className="text-amber-500 animate-pulse" style={{ animationDuration: '3s' }} />
            <line x1="25%" y1="35%" x2="40%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-amber-500 animate-pulse" style={{ animationDuration: '4s' }} />
            <line x1="40%" y1="25%" x2="55%" y2="40%" stroke="currentColor" strokeWidth="1" className="text-emerald-500 animate-pulse" style={{ animationDuration: '3.5s' }} />
            <line x1="55%" y1="40%" x2="70%" y2="30%" stroke="currentColor" strokeWidth="1" className="text-emerald-500 animate-pulse" style={{ animationDuration: '4.5s' }} />
            <line x1="70%" y1="30%" x2="85%" y2="45%" stroke="currentColor" strokeWidth="1" className="text-amber-500 animate-pulse" style={{ animationDuration: '3.8s' }} />

            <line x1="15%" y1="60%" x2="30%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-emerald-500 animate-pulse" style={{ animationDuration: '4.2s' }} />
            <line x1="30%" y1="75%" x2="45%" y2="65%" stroke="currentColor" strokeWidth="1" className="text-amber-500 animate-pulse" style={{ animationDuration: '3.3s' }} />
            <line x1="45%" y1="65%" x2="60%" y2="80%" stroke="currentColor" strokeWidth="1" className="text-emerald-500 animate-pulse" style={{ animationDuration: '4.8s' }} />
            <line x1="60%" y1="80%" x2="75%" y2="70%" stroke="currentColor" strokeWidth="1" className="text-amber-500 animate-pulse" style={{ animationDuration: '3.6s' }} />
          </g>

          {/* 漂浮的节点 */}
          <g className="network-nodes">
            <circle cx="10%" cy="20%" r="3" fill="currentColor" className="text-amber-400" style={{ animation: 'float 6s ease-in-out infinite' }} />
            <circle cx="25%" cy="35%" r="4" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 7s ease-in-out infinite 0.5s' }} />
            <circle cx="40%" cy="25%" r="3" fill="currentColor" className="text-amber-400" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
            <circle cx="55%" cy="40%" r="4" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 6.5s ease-in-out infinite 1.5s' }} />
            <circle cx="70%" cy="30%" r="3" fill="currentColor" className="text-amber-400" style={{ animation: 'float 7.5s ease-in-out infinite 2s' }} />
            <circle cx="85%" cy="45%" r="4" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 8.5s ease-in-out infinite 2.5s' }} />

            <circle cx="15%" cy="60%" r="3" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 7s ease-in-out infinite 0.3s' }} />
            <circle cx="30%" cy="75%" r="4" fill="currentColor" className="text-amber-400" style={{ animation: 'float 6.8s ease-in-out infinite 0.8s' }} />
            <circle cx="45%" cy="65%" r="3" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 7.2s ease-in-out infinite 1.3s' }} />
            <circle cx="60%" cy="80%" r="4" fill="currentColor" className="text-amber-400" style={{ animation: 'float 8s ease-in-out infinite 1.8s' }} />
            <circle cx="75%" cy="70%" r="3" fill="currentColor" className="text-emerald-400" style={{ animation: 'float 6.3s ease-in-out infinite 2.3s' }} />
          </g>
        </svg>

        {/* 波浪效果 */}
        <div className="absolute inset-0 opacity-20">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>

      <div className="relative w-full max-w-md px-4 z-10">
        {/* 主卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* 顶部装饰条 */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400"></div>

          <div className="p-8">
            {/* Logo 和标题 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                大明内阁放映厅
              </h1>
              <p className="text-gray-500 mt-1">小阁老，今天要抄谁的家?</p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  阁员者谁
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="官人请输入身份"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入阁暗号
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="请输入密码"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称（可选）
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      placeholder="请输入昵称"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  isLogin ? '进阁' : '买官'
                )}
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
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                {isLogin ? '还没官职？立即买官' : '已有官职？入阁看看'}
              </button>
            </div>

            {/* 分隔线 */}
            {isLogin && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">或</span>
                </div>
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
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                微服私访
              </button>
            )}
          </div>

          {/* 底部装饰 */}
          <div className="px-8 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              别让小阁老知会
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © 2025 Village Broadcast
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
        }

        @keyframes wave {
          0% { transform: translateX(-100%) translateY(0) scaleX(1); }
          50% { transform: translateX(0%) translateY(-20px) scaleX(1.1); }
          100% { transform: translateX(100%) translateY(0) scaleX(1); }
        }

        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
          animation: wave 15s ease-in-out infinite;
        }

        .wave-1 {
          animation-delay: 0s;
          opacity: 0.5;
        }

        .wave-2 {
          animation-delay: 5s;
          opacity: 0.3;
        }

        .wave-3 {
          animation-delay: 10s;
          opacity: 0.4;
        }

        .network-lines line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 3s ease-in-out infinite;
        }

        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
