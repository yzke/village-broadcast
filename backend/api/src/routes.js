import express from 'express';
import bcrypt from 'bcryptjs';
import { userQueries, streamQueries, generateStreamKey } from './db.js';
import { generateToken, authMiddleware, adminMiddleware } from './middleware.js';

const router = express.Router();

// ==================== 用户认证路由 ====================

// POST /api/auth/login - 用户登录
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  const user = userQueries.findByUsername(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role
      }
    }
  });
});

// POST /api/auth/register - 用户注册
router.post('/auth/register', (req, res) => {
  const { username, password, nickname } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  if (username.length < 3) {
    return res.status(400).json({ success: false, message: '用户名至少 3 个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '密码至少 6 个字符' });
  }

  // 检查用户是否已存在
  const existingUser = userQueries.findByUsername(username);
  if (existingUser) {
    return res.status(409).json({ success: false, message: '用户名已存在' });
  }

  // 创建新用户
  const userId = 'user-' + Date.now();
  const hashedPassword = bcrypt.hashSync(password, 10);

  userQueries.create({
    id: userId,
    username,
    password: hashedPassword,
    nickname,
    role: 'villager'
  });

  const user = userQueries.findById(userId);
  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role
      }
    }
  });
});

// POST /api/auth/logout - 用户登出
router.post('/auth/logout', (req, res) => {
  // JWT 是无状态的，登出主要由客户端处理
  res.json({ success: true, message: '登出成功' });
});

// GET /api/auth/me - 获取当前用户信息
router.get('/auth/me', authMiddleware, (req, res) => {
  const user = userQueries.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      role: user.role
    }
  });
});

// ==================== 直播相关路由 ====================

// GET /api/stream/status - 获取直播状态
router.get('/stream/status', (req, res) => {
  // 这里可以连接 nginx-rtmp 的统计接口获取真实状态
  // 简单实现：检查 HLS 文件是否存在
  const fs = require('fs');
  const hlsPath = process.env.HLS_PATH || '/var/lib/nginx/hls';

  let isLive = false;
  let viewerCount = 0;

  try {
    const files = fs.readdirSync(hlsPath);
    const m3u8Files = files.filter(f => f.endsWith('.m3u8'));
    isLive = m3u8Files.length > 0;
  } catch (err) {
    isLive = false;
  }

  // TODO: 从弹幕服务获取在线人数
  res.json({
    success: true,
    data: {
      isLive,
      viewerCount,
      streamName: 'live',
      startedAt: isLive ? new Date().toISOString() : null
    }
  });
});

// GET /api/stream/config - 获取推流配置（仅管理员）
router.get('/stream/config', authMiddleware, adminMiddleware, (req, res) => {
  const config = streamQueries.getStreamKey();

  res.json({
    success: true,
    data: {
      rtmpUrl: `rtmp://${req.headers.host || '192.168.5.100'}:1935/live`,
      streamKey: config.stream_key,
      hlsUrl: `http://${req.headers.host || '192.168.5.100'}:8030/live/live.m3u8`
    }
  });
});

// POST /api/stream/refresh-key - 刷新推流密钥（仅管理员）
router.post('/stream/refresh-key', authMiddleware, adminMiddleware, (req, res) => {
  const newKey = generateStreamKey();
  streamQueries.updateStreamKey(newKey);

  res.json({
    success: true,
    data: { streamKey: newKey }
  });
});

export default router;
