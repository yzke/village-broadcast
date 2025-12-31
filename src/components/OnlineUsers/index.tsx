import { useEffect, useCallback } from 'react';
import { useOnlineUsersStore } from '../../store';
import { socketService } from '../../services/socket';
import type { OnlineUser } from '../../types';

// ============================================================
// 渲染模式类型（可扩展）
// ============================================================

export type RenderMode = 'avatars' | 'list' | 'count' | 'dots' | 'none' | 'custom';

export interface OnlineUsersConfig {
  mode?: RenderMode;
  maxDisplay?: number; // 最大显示数量
  showRole?: boolean; // 是否显示角色标签
  showActivity?: boolean; // 是否显示活跃状态
  animationEnabled?: boolean; // 是否启用动画
  onUpdate?: (users: OnlineUser[]) => void; // 数据更新回调
}

export interface OnlineUsersProviderProps {
  roomId: string;
  config?: OnlineUsersConfig;
  children?: (data: OnlineUsersRenderData) => React.ReactNode;
}

export interface OnlineUsersRenderData {
  users: OnlineUser[];
  count: number;
  activeCount: number;
  isLoading: boolean;
  refresh: () => void;
}

// ============================================================
// 在线用户 Provider（核心抽象层）
// ============================================================

/**
 * OnlineUsersProvider - 在线用户数据 Provider
 *
 * 这是一个高度抽象的组件，负责：
 * 1. 连接 Socket.io 获取在线用户数据
 * 2. 管理在线用户状态
 * 3. 提供可扩展的渲染接口
 *
 * 使用 render props 模式，允许完全自定义渲染
 *
 * @example
 * <OnlineUsersProvider roomId="live">
 *   {({ users, count }) => <div>{count} 人在线</div>}
 * </OnlineUsersProvider>
 */
export function OnlineUsersProvider({ roomId, config, children }: OnlineUsersProviderProps) {
  const {
    onlineUsers,
    setOnlineUsers,
    addUser,
    removeUser,
    getActiveUsers,
  } = useOnlineUsersStore();

  // 连接到 Socket.io 并监听事件
  useEffect(() => {
    // 监听在线用户列表更新（完整列表）
    const unsubscribeUsers = socketService.onOnlineUsers(({ users }) => {
      // 过滤游客
      const filteredUsers = users.filter((u) => u.role !== 'guest');
      setOnlineUsers(filteredUsers);
      config?.onUpdate?.(filteredUsers);
    });

    // 监听用户上线
    const unsubscribeOnline = socketService.onUserOnline(({ user }) => {
      if (user.role !== 'guest') {
        addUser(user);
        config?.onUpdate?.(onlineUsers);
      }
    });

    // 监听用户下线
    const unsubscribeOffline = socketService.onUserOffline(({ userId }) => {
      removeUser(userId);
      config?.onUpdate?.(onlineUsers);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [roomId]);

  // 心跳机制 - 定期发送活跃状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketService.isConnected) {
        socketService.sendActivity();
      }
    }, 30000); // 每 30 秒发送一次心跳

    return () => clearInterval(interval);
  }, [roomId]);

  // 手动刷新
  const refresh = useCallback(() => {
    socketService.checkStream(roomId);
  }, [roomId]);

  // 计算渲染数据
  const renderData: OnlineUsersRenderData = {
    users: onlineUsers,
    count: onlineUsers.length,
    activeCount: getActiveUsers().length,
    isLoading: false,
    refresh,
  };

  // 渲染 children
  if (children) {
    return <>{children(renderData)}</>;
  }

  return null;
}

// ============================================================
// 内置渲染组件（可扩展）
// ============================================================

export interface OnlineUsersDisplayProps {
  roomId: string;
  config?: OnlineUsersConfig;
}

/**
 * 在线用户显示组件 - 内置多种渲染模式
 */
export function OnlineUsersDisplay({ roomId, config }: OnlineUsersDisplayProps) {
  const mode = config?.mode || 'avatars';
  const maxDisplay = config?.maxDisplay || 10;
  const showRole = config?.showRole ?? true;
  const showActivity = config?.showActivity ?? true;
  const animationEnabled = config?.animationEnabled ?? true;

  return (
    <OnlineUsersProvider roomId={roomId} config={config}>
      {({ users, count, activeCount }) => {
        // 根据模式渲染
        switch (mode) {
          case 'count':
            return <OnlineUsersCount count={count} activeCount={activeCount} />;

          case 'list':
            return (
              <OnlineUsersList
                users={users.slice(0, maxDisplay)}
                showRole={showRole}
                showActivity={showActivity}
                animationEnabled={animationEnabled}
              />
            );

          case 'dots':
            return <OnlineUsersDots count={Math.min(count, maxDisplay)} />;

          case 'avatars':
          default:
            return (
              <OnlineUserAvatars
                users={users.slice(0, maxDisplay)}
                showRole={showRole}
                showActivity={showActivity}
                animationEnabled={animationEnabled}
                total={count}
              />
            );
        }
      }}
    </OnlineUsersProvider>
  );
}

// ============================================================
// 内置渲染器
// ============================================================

/** 简单计数器 */
function OnlineUsersCount({ count, activeCount }: { count: number; activeCount: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span>{count} 人在线</span>
      </div>
      {activeCount > 0 && (
        <span className="text-xs text-gray-500">({activeCount} 活跃)</span>
      )}
    </div>
  );
}

/** 头像堆叠显示 */
function OnlineUserAvatars({
  users,
  showRole,
  showActivity,
  animationEnabled,
  total,
}: {
  users: OnlineUser[];
  showRole: boolean;
  showActivity: boolean;
  animationEnabled: boolean;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* 头像堆叠 */}
      <div className="flex -space-x-2">
        {users.map((user, index) => (
          <div
            key={user.socketId}
            className={`relative group ${animationEnabled ? 'transition-transform hover:-translate-y-1' : ''}`}
            style={{ zIndex: users.length - index }}
          >
            {/* 头像 */}
            <div className="w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname || user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  {(user.nickname || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 活跃状态指示器 */}
            {showActivity && user.isActive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="font-medium">{user.nickname || user.username}</div>
              {showRole && user.role === 'admin' && (
                <div className="text-amber-400 text-xs">管理员</div>
              )}
              {user.metadata?.danmakuCount && user.metadata.danmakuCount > 0 && (
                <div className="text-gray-400 text-xs">{user.metadata.danmakuCount} 条弹幕</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 剩余人数 */}
      {total > users.length && (
        <span className="text-xs text-gray-500">+{total - users.length}</span>
      )}

      {/* 总数 */}
      <span className="text-sm text-gray-400">({total})</span>
    </div>
  );
}

/** 列表显示 */
function OnlineUsersList({
  users,
  showRole,
  showActivity,
  animationEnabled,
}: {
  users: OnlineUser[];
  showRole: boolean;
  showActivity: boolean;
  animationEnabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {users.map((user) => (
        <div
          key={user.socketId}
          className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full ${
            animationEnabled ? 'transition-all hover:bg-slate-700' : ''
          }`}
        >
          {/* 头像 */}
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                {(user.nickname || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* 昵称 */}
          <span className="text-sm text-gray-300 truncate max-w-[100px]">
            {user.nickname || user.username}
          </span>

          {/* 角色标签 */}
          {showRole && user.role === 'admin' && (
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">管理员</span>
          )}

          {/* 活跃状态 */}
          {showActivity && user.isActive && (
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );
}

/** 圆点显示 */
function OnlineUsersDots({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '2s',
          }}
        />
      ))}
      {count > 20 && <span className="text-xs text-gray-500 ml-2">+{count - 20}</span>}
    </div>
  );
}

// 导出默认组件
export default OnlineUsersProvider;
