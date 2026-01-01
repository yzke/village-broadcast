import { useEffect, useRef, useState, useCallback } from 'react';
import { useDanmakuStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatHistoryProps {
  maxDisplay?: number;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}

/**
 * ChatHistory - 弹幕历史记录（栈式瀑布流）
 *
 * 最新弹幕显示在顶部，采用紧凑的栈式布局
 * 智能滚动：只有当用户在顶部附近时才会自动滚动
 */
export function ChatHistory({
  maxDisplay = 100,
  showTimestamp = true,
  autoScroll = true,
}: ChatHistoryProps) {
  const { danmakuList } = useDanmakuStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const firstDanmakuRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(true);
  const prevDanmakuLength = useRef(danmakuList.length);

  // 检测是否靠近顶部（100px 以内）
  const checkIsNearTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    return container.scrollTop < 100;
  }, []);

  // 监听滚动事件，更新 isNearTop 状态
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsNearTop(checkIsNearTop());
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIsNearTop]);

  // 智能自动滚动：只在用户靠近顶部且有新弹幕时滚动到顶部
  useEffect(() => {
    const hasNewDanmaku = danmakuList.length > prevDanmakuLength.current;
    if (autoScroll && hasNewDanmaku && isNearTop) {
      // 滚动到顶部
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevDanmakuLength.current = danmakuList.length;
  }, [danmakuList, autoScroll, isNearTop]);

  // 手动滚动到顶部
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setIsNearTop(true);
  }, []);

  // 只显示最近的 N 条弹幕，并反转顺序（最新在前）
  const displayList = danmakuList.slice(-maxDisplay).reverse();

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
        <div className="px-3 py-2.5 border-b border-slate-700/50">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            弹幕记录
          </h3>
        </div>

        {/* 空状态 */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-700/50 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-xs">暂无弹幕</p>
          <p className="text-gray-600 text-xs mt-1">发送第一条弹幕吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col h-[500px] relative">
      {/* 头部 */}
      <div className="px-3 py-2.5 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            弹幕记录
          </h3>
          <span className="text-xs text-gray-500">{displayList.length} 条</span>
        </div>
      </div>

      {/* 顶部渐变（表示上面是最新的） */}
      <div className="h-3 bg-gradient-to-b from-amber-500/10 to-transparent flex-shrink-0"></div>

      {/* 消息列表（栈式布局，最新在顶部） */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(51 65 85) transparent',
        }}
      >
        {displayList.map((danmaku, index) => (
          <div
            key={danmaku.id}
            ref={index === 0 ? firstDanmakuRef : null}
            className="flex gap-2 animate-in slide-in-from-top-2 duration-300"
            style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
          >
            {/* 头像 - 更小 */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  {danmaku.user.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* 消息内容 */}
            <div className="flex-1 min-w-0">
              {/* 用户名和时间 */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-gray-300">
                  {danmaku.user.nickname}
                </span>
                <span className={`px-1 py-0.5 text-xs rounded-full border ${getRoleStyle(danmaku.user.role)}`}>
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

              {/* 弹幕文本 */}
              <div className="text-gray-200 break-words text-xs leading-relaxed">
                {danmaku.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部渐变 */}
      <div className="h-3 bg-gradient-to-t from-slate-800 to-transparent flex-shrink-0"></div>

      {/* 滚动到顶部按钮（当用户向下滚动时显示） */}
      {!isNearTop && (
        <button
          onClick={scrollToTop}
          className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-full shadow-lg transition-all transform hover:scale-105"
          title="返回最新"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
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
