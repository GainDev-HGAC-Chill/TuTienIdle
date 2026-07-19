const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

let pool;

function cfg(database) {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    charset: 'utf8mb4',
    multipleStatements: true,
    decimalNumbers: true
  };
}

async function initializeDatabase() {
  const dbName = String(process.env.DB_NAME || 'tutien_idle').replace(/[^a-zA-Z0-9_]/g, '');
  const bootstrap = await mysql.createConnection(cfg(undefined));
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();
  pool = mysql.createPool(cfg(dbName));
  const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log(`[DAO_MACH] MySQL sẵn sàng: ${dbName}`);
}

function getPool() {
  if (!pool) throw new Error('MySQL chưa được khởi tạo.');
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
  if (pool) await pool.end();
}

module.exports = { initializeDatabase, getPool, transaction, closeDatabase };
