import express from 'express';
import fs from 'fs'; // 【修复点1】必须在顶部引入，不能在函数里 require
import bcrypt from 'bcryptjs';
import { userQueries, streamQueries, generateStreamKey } from './db.js';
import { generateToken, authMiddleware, adminMiddleware } from './middleware.js';

const router = express.Router();

// ==================== 用户认证路由 (保持原样) ====================

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
        avatar: user.avatar,
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
        avatar: user.avatar,
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
      avatar: user.avatar,
      role: user.role
    }
  });
});

// ==================== 用户信息管理 (保持原样) ====================

// PUT /api/user/password - 修改密码
router.put('/user/password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '请提供旧密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '新密码至少 6 个字符' });
  }

  const user = userQueries.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  // 验证旧密码
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(401).json({ success: false, message: '旧密码错误' });
  }

  // 更新密码
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  userQueries.updatePassword(user.id, hashedPassword);

  res.json({ success: true, message: '密码修改成功' });
});

// PUT /api/user/profile - 修改用户资料（昵称、头像）
router.put('/user/profile', authMiddleware, (req, res) => {
  const { nickname, avatar } = req.body;

  const user = userQueries.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  // 更新昵称
  if (nickname !== undefined) {
    if (nickname && nickname.length > 50) {
      return res.status(400).json({ success: false, message: '昵称最多 50 个字符' });
    }
    userQueries.updateNickname(user.id, nickname || null);
  }

  // 更新头像
  if (avatar !== undefined) {
    userQueries.updateAvatar(user.id, avatar);
  }

  // 获取更新后的用户信息
  const updatedUser = userQueries.findById(user.id);

  res.json({
    success: true,
    message: '资料更新成功',
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      role: updatedUser.role
    }
  });
});

// ==================== 直播相关路由 (此处已修复) ====================

// GET /api/stream/status - 获取直播状态
router.get('/stream/status', (req, res) => {
  // 【修复点2】修正路径，对应 Nginx 的 hls_path
  const hlsPath = process.env.HLS_PATH || '/tmp/hls';

  let isLive = false;
  let viewerCount = 0;
  
  // 即使没直播，也默认告诉前端名字叫 live，防止前端拿到 null 报错
  let streamName = 'live'; 

  try {
    const config = streamQueries.getStreamKey();
    
    if (config && config.stream_key) {
        // 这是真实的推流文件名 (例如 sk_abc123.m3u8)
        const currentKey = config.stream_key;
        const realFile = `${currentKey}.m3u8`;
        const fullPath = `${hlsPath}/${realFile}`;

        // 检查真实文件是否存在
        if (fs.existsSync(fullPath)) {
            isLive = true;
            
            // 【修复点6】前端写死了只认 live.m3u8
            // 所以我们自动创建一个快捷方式：live.m3u8 -> 真实密钥.m3u8
            const fakeLink = `${hlsPath}/live.m3u8`;
            try {
                // 如果已存在旧的，先删除
                if (fs.existsSync(fakeLink)) {
                    fs.unlinkSync(fakeLink);
                }
                // 创建新的软链接
                fs.symlinkSync(realFile, fakeLink);
            } catch (e) {
                // 忽略创建失败的错误（可能是权限问题），不影响 API 返回
                console.error('创建快捷方式失败:', e.message);
            }
        }
    }
  } catch (err) {
    console.error('检查直播状态出错:', err);
    isLive = false;
  }

  // 返回给前端
  res.json({
    success: true,
    data: {
      isLive,
      viewerCount,
      streamName: 'live', // 这里直接返回 'live'，配合上面的快捷方式
      startedAt: isLive ? new Date().toISOString() : null
    }
  });
});

// GET /api/stream/config - 获取推流配置（仅管理员）
router.get('/stream/config', authMiddleware, adminMiddleware, (req, res) => {
  const config = streamQueries.getStreamKey();

  // 【修复点3】获取纯净 IP（去掉可能存在的端口号）
  const hostHeader = req.headers.host || '47.117.70.135';
  const serverIp = hostHeader.split(':')[0]; 

  res.json({
    success: true,
    data: {
      // 这里的 /live 是 Nginx 里的 application 名字
      rtmpUrl: `rtmp://${serverIp}:1935/live`,
      
      streamKey: config.stream_key,
      
      // 这里的端口是 8030，且文件名统一用 live.m3u8
      hlsUrl: `http://${serverIp}:8030/live/live.m3u8`
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

// 【修复点4】新增：Nginx 推流鉴权回调
router.post('/stream/on-publish', (req, res) => {
    // Nginx 把推流码放在 'name' 里传过来
    const incomingKey = req.body.name;
    const config = streamQueries.getStreamKey();
    
    console.log(`[RTMP鉴权] 尝试推流: ${incomingKey}`);

    if (config && incomingKey === config.stream_key) {
        res.status(200).send('OK');
    } else {
        res.status(403).send('Forbidden');
    }
});

// 防止 Nginx 报错 404 (可选)
router.post('/stream/on-done', (req, res) => {
    res.status(200).send('OK');
});

export default router;
