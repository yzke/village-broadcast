import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Socket.io 服务器
const io = new Server(PORT, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// 房间数据存储（内存）
const rooms = new Map();
// roomId -> { users: Set, danmakuList: [], isLive: boolean }

// 生成房间
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Set(),
      danmakuList: [],
      isLive: false,
      createdAt: Date.now()
    });
  }
  return rooms.get(roomId);
}

// JWT 验证（简化版，实际应该调用 API）
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// 中间件：验证用户身份
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    // 允许游客连接（无 token）
    socket.data.user = {
      id: 'guest-' + socket.id,
      username: 'guest',
      role: 'guest'
    };
    return next();
  }

  const user = await verifyToken(token);

  if (user) {
    socket.data.user = user;
  } else {
    // Token 无效，作为游客处理
    socket.data.user = {
      id: 'guest-' + socket.id,
      username: 'guest',
      role: 'guest'
    };
  }

  next();
});

// 连接处理
io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`用户连接: ${user.username} (${user.role})`);

  // 加入房间
  socket.on('join_room', ({ roomId }) => {
    const room = getRoom(roomId);

    socket.join(roomId);
    room.users.add(socket.id);

    // 发送当前弹幕列表
    socket.emit('danmaku_list', room.danmakuList);

    // 发送在线人数
    io.to(roomId).emit('online_count', { count: room.users.size });

    // 发送直播状态
    socket.emit('stream_status', {
      isLive: room.isLive,
      viewerCount: room.users.size,
      streamName: roomId
    });

    console.log(`${user.username} 加入房间 ${roomId}, 当前在线: ${room.users.size}`);
  });

  // 离开房间
  socket.on('leave_room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);

      // 如果房间为空，清理房间数据
      if (room.users.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('online_count', { count: room.users.size });
      }

      socket.leave(roomId);
      console.log(`${user.username} 离开房间 ${roomId}`);
    }
  });

  // 发送弹幕
  socket.on('send_danmaku', async ({ roomId, text, type, effect }) => {
    const room = getRoom(roomId);

    // 游客不能发送弹幕
    if (user.role === 'guest') {
      socket.emit('error', { message: '游客无法发送弹幕' });
      return;
    }

    // 过滤敏感词（简单示例）
    const filteredText = text.replace(/fuck|shit/gi, '***');

    const danmaku = {
      id: 'dm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      text: filteredText,
      type: type || 'normal',
      effect,
      user: {
        id: user.id,
        nickname: user.nickname || user.username,
        role: user.role
      },
      timestamp: Date.now()
    };

    // 添加到弹幕列表（最多保留 1000 条）
    room.danmakuList.push(danmaku);
    if (room.danmakuList.length > 1000) {
      room.danmakuList.shift();
    }

    // 广播给房间内所有用户
    io.to(roomId).emit('new_danmaku', danmaku);

    console.log(`弹幕: ${user.username} -> ${roomId}: ${filteredText}`);
  });

  // 检查直播状态
  socket.on('check_stream', ({ roomId }) => {
    const room = getRoom(roomId);

    socket.emit('stream_status', {
      isLive: room.isLive,
      viewerCount: room.users.size,
      streamName: roomId
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    // 清理用户所在的所有房间
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);

        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('online_count', { count: room.users.size });
        }
      }
    }
    console.log(`用户断开连接: ${user.username}`);
  });
});

// 设置直播状态（可选，管理员可以通过 API 调用）
export function setLiveStatus(roomId, isLive) {
  const room = getRoom(roomId);
  room.isLive = isLive;

  io.to(roomId).emit('stream_status', {
    isLive: room.isLive,
    viewerCount: room.users.size,
    streamName: roomId
  });
}

// 启动服务器
console.log(`弹幕服务运行在端口 ${PORT}`);
console.log(`CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
