import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { getStreamConfig, refreshStreamKey, API_CONFIG } from '../../services/api';

interface StreamConfigData {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
}

type CopiedState = 'rtmp' | 'key' | 'hls' | null;

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const [config, setConfig] = useState<StreamConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<CopiedState>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const response = await getStreamConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      } else {
        setError(response.message || '获取配置失败');
      }
    } catch (err) {
      setError('获取配置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshKey() {
    setRefreshing(true);
    try {
      const response = await refreshStreamKey();
      if (response.success && response.data) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                streamKey: response.data!.streamKey,
              }
            : null
        );
      } else {
        setError(response.message || '刷新失败');
      }
    } catch (err) {
      setError('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  }

  const handleCopy = (text: string, type: CopiedState) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const streamUrl = config ? `${config.rtmpUrl}/${config.streamKey}` : '';
  const hlsUrl = config ? config.hlsUrl : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">管理后台</h1>
              <p className="text-xs text-gray-500">内阁宣传</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={() => navigate('/live')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">返回直播</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="退出登录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {config && (
          <div className="space-y-6">
            {/* 推流配置卡片 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">推流配置</h2>
                    <p className="text-sm text-gray-500">在 OBS 中配置以下信息</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* RTMP 推流地址 */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RTMP 推流地址
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={streamUrl}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-700"
                      />
                      <button
                        onClick={() => handleCopy(streamUrl, 'rtmp')}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        {copied === 'rtmp' ? (
                          <>
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-600">已复制</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 推流密钥 */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      推流密钥
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={config.streamKey}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-700"
                      />
                      <button
                        onClick={() => handleCopy(config.streamKey, 'key')}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        {copied === 'key' ? (
                          <>
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-600">已复制</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>复制</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleRefreshKey}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                      >
                        {refreshing ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>刷新中</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>刷新</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      刷新密钥后，需要重新配置 OBS
                    </p>
                  </div>

                  {/* HLS 播放地址 */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HLS 播放地址
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={hlsUrl}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-700"
                      />
                      <button
                        onClick={() => handleCopy(hlsUrl, 'hls')}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        {copied === 'hls' ? (
                          <>
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-600">已复制</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OBS 配置说明 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">OBS 推流设置</h3>
                </div>
                <ol className="space-y-3">
                  {['打开 OBS Studio', '点击「设置」→「推流」', '服务类型选择「自定义」', '服务器填写 RTMP 推流地址', '串流密钥填写推流密钥', '点击「开始推流」即可开始直播'].map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* 服务器配置信息 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">服务器配置</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">API 服务器</p>
                    <p className="text-sm font-mono text-gray-800 truncate">{API_CONFIG.API_BASE_URL}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">视频服务器</p>
                    <p className="text-sm font-mono text-gray-800 truncate">{API_CONFIG.VIDEO_BASE_URL}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">弹幕服务器</p>
                    <p className="text-sm font-mono text-gray-800 truncate">{API_CONFIG.SOCKET_URL}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
