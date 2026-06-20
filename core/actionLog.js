const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'data', 'action_logs');
const ALL_LOG_FILE = path.join(LOG_DIR, 'all.jsonl');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function normalizeUsername(playerOrUsername) {
  if (!playerOrUsername) return '';
  if (typeof playerOrUsername === 'string') return playerOrUsername;
  return playerOrUsername.username || playerOrUsername.name || '';
}

function addActionLog(playerOrUsername, type, message, detail = {}) {
  ensureLogDir();

  const username = normalizeUsername(playerOrUsername);
  if (!username || !message) return null;

  const log = {
    username,
    type: type || 'system',
    message,
    detail,
    time: Date.now()
  };

  fs.appendFileSync(ALL_LOG_FILE, JSON.stringify(log) + '\n', 'utf8');
  return log;
}

function getPlayerLogs(username, limit = 100) {
  ensureLogDir();
  if (!fs.existsSync(ALL_LOG_FILE)) return [];

  return fs.readFileSync(ALL_LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(log => log && log.username === username && log.type !== 'combat')
    .slice(-Math.max(1, Number(limit || 100)))
    .reverse();
}

module.exports = {
  addActionLog,
  getPlayerLogs
};
