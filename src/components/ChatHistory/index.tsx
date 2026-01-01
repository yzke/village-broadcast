import { useEffect, useRef, useState, useCallback } from 'react';
import { useDanmakuStore } from '../../store';
// import type { Danmaku } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatHistoryProps {
  maxDisplay?: number;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}

/**
 * ChatHistory - 弹幕历史记录（瀑布流聊天框）
 *
 * 显示从登录开始收到的所有弹幕，使用聊天界面样式
 * 智能滚动：只有当用户在底部附近时才会自动滚动
 */
export function ChatHistory({
  maxDisplay = 100,
  showTimestamp = true,
  autoScroll = true,
}: ChatHistoryProps) {
  const { danmakuList } = useDanmakuStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDanmakuRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevDanmakuLength = useRef(danmakuList.length);

  // 检测是否靠近底部（100px 以内）
  const checkIsNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // 监听滚动事件，更新 isNearBottom 状态
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsNearBottom(checkIsNearBottom());
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIsNearBottom]);

  // 智能自动滚动：只在用户靠近底部且有新弹幕时滚动
  useEffect(() => {
    const hasNewDanmaku = danmakuList.length > prevDanmakuLength.current;
    if (autoScroll && hasNewDanmaku && isNearBottom && lastDanmakuRef.current) {
      lastDanmakuRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    prevDanmakuLength.current = danmakuList.length;
  }, [danmakuList, autoScroll, isNearBottom]);

  // 手动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (lastDanmakuRef.current) {
      lastDanmakuRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsNearBottom(true);
    }
  }, []);

  // 只显示最近的 N 条弹幕
  const displayList = danmakuList.slice(-maxDisplay);

  // 获取角色对应的样式
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'villager':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // 获取角色名称
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'villager':
        return '村民';
      default:
        return '游客';
    }
  };

  if (displayList.length === 0) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* 头部 */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            弹幕记录
          </h3>
        </div>

        {/* 空状态 */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">暂无弹幕</p>
          <p className="text-gray-600 text-xs mt-1">发送第一条弹幕吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col h-[500px] relative">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            弹幕记录
          </h3>
          <span className="text-xs text-gray-500">{displayList.length} 条</span>
        </div>
      </div>

      {/* 消息列表（瀑布流） */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(51 65 85) transparent',
        }}
      >
        {displayList.map((danmaku, index) => (
          <div
            key={danmaku.id}
            ref={index === displayList.length - 1 ? lastDanmakuRef : null}
            className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
          >
            {/* 头像 */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  {danmaku.user.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* 消息内容 */}
            <div className="flex-1 min-w-0">
              {/* 用户名和时间 */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-300">
                  {danmaku.user.nickname}
                </span>
                <span className={`px-1.5 py-0.5 text-xs rounded-full border ${getRoleStyle(danmaku.user.role)}`}>
                  {getRoleName(danmaku.user.role)}
                </span>
                {showTimestamp && danmaku.timestamp && (
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(danmaku.timestamp, {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                )}
              </div>

              {/* 弹幕文本（统一样式） */}
              <div className="text-gray-200 break-words">
                {danmaku.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部渐变 */}
      <div className="h-4 bg-gradient-to-t from-slate-800 to-transparent flex-shrink-0"></div>

      {/* 滚动到底部按钮（当用户向上滚动时显示） */}
      {!isNearBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-full shadow-lg transition-all transform hover:scale-105"
          title="回到底部"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>有新消息</span>
        </button>
      )}
    </div>
  );
}

/**
 * 紧凑版弹幕历史（用于侧边栏）
 */
export function CompactChatHistory({ maxDisplay = 50 }: { maxDisplay?: number }) {
  const { danmakuList } = useDanmakuStore();

  const displayList = danmakuList.slice(-maxDisplay);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">弹幕</span>
        <span className="text-xs text-gray-500">{displayList.length}</span>
      </div>

      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {displayList.length === 0 ? (
          <p className="text-center text-gray-600 text-xs py-4">暂无弹幕</p>
        ) : (
          displayList.map((danmaku) => (
            <div key={danmaku.id} className="flex gap-2 text-sm">
              <span className="text-gray-400 flex-shrink-0">
                {danmaku.user.nickname}:
              </span>
              <span className="text-gray-200 break-words">{danmaku.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
