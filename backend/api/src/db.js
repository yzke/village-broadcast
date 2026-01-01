import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'broadcast.db');

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

// 初始化数据库
export async function initDatabase() {
  const SQL = await initSqlJs();

  // 尝试加载现有数据库
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('数据库已加载:', dbPath);
  } else {
    db = new SQL.Database();
    console.log('新数据库已创建');
  }

  // 创建表结构
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT DEFAULT NULL,
      role TEXT DEFAULT 'villager' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 添加 avatar 字段（如果不存在）- 用于已存在的数据库
  try {
    db.run('ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL');
    console.log('已添加 avatar 字段');
  } catch (e) {
    // 字段已存在，忽略错误
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS stream_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      stream_key TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建默认推流密钥（如果不存在）
  const streamKeyResult = db.exec('SELECT * FROM stream_config WHERE id = 1');
  if (!streamKeyResult.length || streamKeyResult[0].values.length === 0) {
    const defaultStreamKey = generateStreamKey();
    db.run('INSERT INTO stream_config (id, stream_key) VALUES (1, ?)', [defaultStreamKey]);
    console.log('默认推流密钥已创建:', defaultStreamKey);
    saveDatabase();
  }

  // 创建默认管理员账户（如果不存在）
  const adminResult = db.exec('SELECT * FROM users WHERE username = "admin"');

  if (!adminResult.length || adminResult[0].values.length === 0) {
    const adminId = 'admin-' + Date.now();
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (id, username, password, nickname, role) VALUES (?, ?, ?, ?, ?)', [
      adminId, 'admin', hashedPassword, '管理员', 'admin'
    ]);
    console.log('默认管理员账户已创建 - 用户名: admin, 密码: admin123');
    saveDatabase();
  }
}

// 保存数据库到文件
export function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// 生成随机推流密钥
export function generateStreamKey() {
  return 'sk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// 用户相关操作
export const userQueries = {
  findByUsername: (username) => {
    const result = db.exec('SELECT * FROM users WHERE username = "' + username + '"');
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      const values = result[0].values[0];
      const user = {};
      for (let i = 0; i < columns.length; i++) {
        user[columns[i]] = values[i];
      }
      return user;
    }
    return null;
  },

  findById: (id) => {
    const result = db.exec('SELECT * FROM users WHERE id = "' + id + '"');
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      const values = result[0].values[0];
      const user = {};
      for (let i = 0; i < columns.length; i++) {
        user[columns[i]] = values[i];
      }
      return user;
    }
    return null;
  },

  create: (user) => {
    db.run('INSERT INTO users (id, username, password, nickname, role) VALUES (?, ?, ?, ?, ?)', [
      user.id, user.username, user.password, user.nickname || null, user.role
    ]);
    saveDatabase();
  },

  updateNickname: (id, nickname) => {
    db.run('UPDATE users SET nickname = ? WHERE id = ?', [nickname, id]);
    saveDatabase();
  },

  updateAvatar: (id, avatar) => {
    db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatar, id]);
    saveDatabase();
  },

  updatePassword: (id, hashedPassword) => {
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    saveDatabase();
  }
};

// 推流密钥操作
export const streamQueries = {
  getStreamKey: () => {
    const result = db.exec('SELECT stream_key FROM stream_config WHERE id = 1');
    if (result.length > 0 && result[0].values.length > 0) {
      return { stream_key: result[0].values[0][0] };
    }
    return null;
  },

  updateStreamKey: (newKey) => {
    db.run('UPDATE stream_config SET stream_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [newKey]);
    saveDatabase();
  }
};
