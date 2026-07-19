const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { runMigrations } = require('./migrationRunner');

let pool;

function cfg(database) {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    charset: 'utf8mb4',
    multipleStatements: true,
    decimalNumbers: true
  };

  if (database) {
    config.database = database;
  }

  return config;
}

function getDatabaseName() {
  const databaseName = String(process.env.DB_NAME || 'tutien_idle')
    .replace(/[^a-zA-Z0-9_]/g, '');

  if (!databaseName) {
    throw new Error('DB_NAME không hợp lệ.');
  }

  return databaseName;
}

async function initializeDatabase() {
  const databaseName = getDatabaseName();

  const bootstrap = await mysql.createConnection(cfg());
  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await bootstrap.end();
  }

  pool = mysql.createPool(cfg(databaseName));

  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Tạo những bảng hoàn toàn chưa tồn tại.
  await pool.query(schema);

  // CREATE TABLE IF NOT EXISTS không thay đổi bảng cũ.
  // Vì vậy phải chạy migration để bổ sung cột/index còn thiếu.
  await runMigrations(pool, databaseName);

  await pool.query('SELECT 1');
  console.log(`[DAO_MACH] MySQL sẵn sàng: ${databaseName}`);
}

function getPool() {
  if (!pool) {
    throw new Error('MySQL chưa được khởi tạo.');
  }

  return pool;
}

async function transaction(work) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
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
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}

module.exports = {
  initializeDatabase,
  getPool,
  transaction,
  closeDatabase
};
