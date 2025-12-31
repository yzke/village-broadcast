import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useStreamStore, useDanmakuStore } from '../../store';
import { socketService } from '../../services/socket';
import { checkStreamAvailable, getHlsUrl } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer';
import DanmakuLayer from '../../components/Danmaku';
import ChatInput from '../../components/ChatInput';
import { OnlineUsersDisplay } from '../../components/OnlineUsers';

const ROOM_ID = 'live';

export default function LivePage() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { isLive, viewerCount, setStreamStatus, resetStream } = useStreamStore();
  const { showDanmaku, toggleDanmaku } = useDanmakuStore();

  const [hlsUrl, setHlsUrl] = useState<string>('');
  const [isCheckingStream, setIsCheckingStream] = useState(true);

  // 检查直播状态
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStream(true);
      const available = await checkStreamAvailable();
      if (available) {
        setHlsUrl(getHlsUrl());
        setStreamStatus({
          isLive: true,
          viewerCount: 0,
          streamName: ROOM_ID,
        });
      } else {
        resetStream();
      }
      setIsCheckingStream(false);
    };

    checkStatus();

    // 定期检查直播状态
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // 连接 Socket.io
  useEffect(() => {
    if (!isLive) return;

    socketService.connect();
    socketService.joinRoom(ROOM_ID);

    // 监听直播状态
    const unsubscribeStatus = socketService.onStreamStatus((status) => {
      setStreamStatus(status);
    });

    // 监听在线人数
    const unsubscribeCount = socketService.onOnlineCount((count) => {
      setStreamStatus({ isLive, viewerCount: count, streamName: ROOM_ID });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeCount();
      socketService.leaveRoom(ROOM_ID);
      socketService.disconnect();
    };
  }, [isLive]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isCheckingStream) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">正在检查直播状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 顶部导航栏 */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">村庄广播</h1>
              <p className="text-xs text-gray-400">Village Broadcast</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 在线用户显示 */}
            <OnlineUsersDisplay
              roomId={ROOM_ID}
              config={{ mode: 'count', showActivity: true }}
            />

            {/* 用户信息 - 可点击进入个人中心 */}
            <button
              onClick={() => user?.role !== 'guest' && navigate('/profile')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
                user?.role !== 'guest' ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer' : 'bg-slate-800 cursor-default'
              }`}
            >
              <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'G'}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-300">{user?.username || '游客'}</span>
              {user?.role === 'admin' && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">管理员</span>
              )}
            </button>

            {/* 管理后台按钮 */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>管理</span>
              </button>
            )}

            {/* 退出按钮 */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="退出登录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {!isLive ? (
          // 暂无直播
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-800 rounded-3xl mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-2">暂无直播</h2>
              <p className="text-gray-500">请等待管理员开始直播</p>
            </div>
          </div>
        ) : (
          // 直播中
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 视频播放区域 */}
            <div className="flex-1 min-w-0">
              {/* 视频容器 */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl shadow-black/50 ring-1 ring-slate-700/50">
                <VideoPlayer hlsUrl={hlsUrl} />
                <DanmakuLayer />

                {/* 直播状态徽章 */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-white">直播中</span>
                </div>

                {/* 观看人数 */}
                {viewerCount > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    <span className="text-sm text-gray-300">{viewerCount}</span>
                  </div>
                )}
              </div>

              {/* 直播控制栏 */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-300">直播中</span>
                  </div>

                  {/* 在线用户头像显示 */}
                  <OnlineUsersDisplay
                    roomId={ROOM_ID}
                    config={{ mode: 'avatars', maxDisplay: 5, showRole: false, showActivity: true }}
                  />
                </div>

                <button
                  onClick={toggleDanmaku}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    showDanmaku
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">{showDanmaku ? '隐藏弹幕' : '显示弹幕'}</span>
                </button>
              </div>
            </div>

            {/* 聊天输入区域 */}
            <div className="w-full lg:w-80">
              <ChatInput roomId={ROOM_ID} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
