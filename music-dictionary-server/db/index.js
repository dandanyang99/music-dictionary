const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1');
    console.log('数据库连接成功');
  } catch (err) {
    console.error('数据库连接失败：', err);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;