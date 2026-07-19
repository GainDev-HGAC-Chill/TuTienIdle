const mysql = require('mysql2/promise');
let pool = null;

async function initializeDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tutien_idle',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    charset: 'utf8mb4'
  });
  await pool.query('SELECT 1');
  console.log('[LINH_MACH] Đã kết nối MySQL.');
}
function getPool() {
  if (!pool) throw new Error('MySQL chưa được khởi tạo.');
  return pool;
}
async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}
async function transaction(handler) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
async function closeDatabase() {
  if (pool) await pool.end();
  pool = null;
}
module.exports = { initializeDatabase, getPool, query, transaction, closeDatabase };
