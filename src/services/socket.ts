import { io, Socket } from 'socket.io-client';
import type { SocketEvents, Danmaku, StreamStatus, OnlineUsersData, OnlineUser } from '../types';
import { API_CONFIG } from './api';

// ============================================================
// Socket.io 客户端单例
// ============================================================

class SocketService {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;

  /**
   * 连接到 Socket.io 服务器
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = localStorage.getItem('token');

    this.socket = io(API_CONFIG.SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoom = null;
  }

  /**
   * 加入直播房间
   */
  joinRoom(roomId: string): void {
    if (!this.socket) {
      console.warn('[Socket] Not connected, call connect() first');
      return;
    }

    this.currentRoom = roomId;
    this.socket.emit('join_room', { roomId });
    console.log('[Socket] Joined room:', roomId);
  }

  /**
   * 离开直播房间
   */
  leaveRoom(roomId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave_room', { roomId });
    this.currentRoom = null;
    console.log('[Socket] Left room:', roomId);
  }

  /**
   * 发送弹幕
   */
  sendDanmaku(
    roomId: string,
    text: string,
    type: 'normal' | 'special',
    effect?: SocketEvents['emit']['send_danmaku']['effect']
  ): void {
    if (!this.socket) {
      console.warn('[Socket] Not connected');
      return;
    }

    this.socket.emit('send_danmaku', { roomId, text, type, effect });
  }

  /**
   * 检查直播状态
   */
  checkStream(roomId: string): void {
    if (!this.socket) {
      console.warn('[Socket] Not connected');
      return;
    }

    this.socket.emit('check_stream', { roomId });
  }

  // ============================================================
  // 事件监听器
  // ============================================================

  /**
   * 监听直播状态变更
   */
  onStreamStatus(callback: (status: StreamStatus) => void): () => void {
    this.socket?.on('stream_status', callback);
    return () => this.socket?.off('stream_status', callback);
  }

  /**
   * 监听弹幕列表（加入房间时返回）
   */
  onDanmakuList(callback: (list: Danmaku[]) => void): () => void {
    this.socket?.on('danmaku_list', callback);
    return () => this.socket?.off('danmaku_list', callback);
  }

  /**
   * 监听新弹幕
   */
  onNewDanmaku(callback: (danmaku: Danmaku) => void): () => void {
    this.socket?.on('new_danmaku', callback);
    return () => this.socket?.off('new_danmaku', callback);
  }

  /**
   * 监听在线人数（已废弃，使用 onOnlineUsers）
   */
  onOnlineCount(callback: (count: number) => void): () => void {
    this.socket?.on('online_count', ({ count }) => callback(count));
    return () => this.socket?.off('online_count', callback);
  }

  // ============================================================
  // 在线用户事件监听（可扩展）
  // ============================================================

  /**
   * 监听在线用户列表更新（完整列表）
   */
  onOnlineUsers(callback: (data: OnlineUsersData) => void): () => void {
    this.socket?.on('online_users', callback);
    return () => this.socket?.off('online_users', callback);
  }

  /**
   * 监听用户上线
   */
  onUserOnline(callback: (data: { user: OnlineUser; timestamp: number }) => void): () => void {
    this.socket?.on('user_online', callback);
    return () => this.socket?.off('user_online', callback);
  }

  /**
   * 监听用户下线
   */
  onUserOffline(callback: (data: { userId: string; timestamp: number }) => void): () => void {
    this.socket?.on('user_offline', callback);
    return () => this.socket?.off('user_offline', callback);
  }

  /**
   * 发送活跃状态（心跳）
   */
  sendActivity(): void {
    this.socket?.emit('activity');
  }

  /**
   * 监听错误
   */
  onError(callback: (error: { message: string }) => void): () => void {
    this.socket?.on('error', callback);
    return () => this.socket?.off('error', callback);
  }

  /**
   * 获取当前连接状态
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * 获取当前房间 ID
   */
  get roomId(): string | null {
    return this.currentRoom;
  }
}

// 导出单例
export const socketService = new SocketService();

// 导出类型
export type { SocketEvents };
