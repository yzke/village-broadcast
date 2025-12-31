// ============================================================
// 用户相关类型
// ============================================================

export type UserRole = 'guest' | 'villager' | 'admin';

export interface User {
  id: string;
  username: string;
  nickname?: string;
  role: UserRole;
  avatar?: string;
}

// ============================================================
// 在线用户类型（可扩展）
// ============================================================

export interface OnlineUser extends User {
  socketId: string;
  joinedAt: number;
  lastActivity: number;
  isActive: boolean;
  metadata?: {
    danmakuCount?: number;
    watchTime?: number;
    [key: string]: unknown; // 允许扩展
  };
}

export interface OnlineUsersData {
  users: OnlineUser[];
  count: number;
  timestamp: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname?: string;
}

// ============================================================
// 直播相关类型
// ============================================================

export interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  streamName?: string;
  startedAt?: string;
}

export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
}

// ============================================================
// 弹幕相关类型
// ============================================================

export type DanmakuType = 'normal' | 'special';

export interface DanmakuEffect {
  color?: string;
  fontSize?: number;
  speed?: number;
  position?: 'top' | 'bottom' | 'scroll';
  border?: boolean;
  shadow?: boolean;
}

export interface Danmaku {
  id: string;
  text: string;
  type: DanmakuType;
  effect?: DanmakuEffect;
  user: {
    id: string;
    nickname: string;
    role: UserRole;
  };
  timestamp: number;
}

// ============================================================
// Socket.io 事件类型
// ============================================================

export interface SocketEvents {
  // 客户端发送
  emit: {
    join_room: { roomId: string };
    leave_room: { roomId: string };
    send_danmaku: { roomId: string; text: string; type: DanmakuType; effect?: DanmakuEffect };
    check_stream: { roomId: string };
  };

  // 服务端发送
  on: {
    stream_status: StreamStatus;
    danmaku_list: Danmaku[];
    new_danmaku: Danmaku;
    online_count: { count: number };
    error: { message: string };
  };
}

// ============================================================
// API 响应类型
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}
