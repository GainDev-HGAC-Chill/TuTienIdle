const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'data', 'action_logs');
const ALL_LOG_FILE = path.join(LOG_DIR, 'all.jsonl');

const CATEGORY_LABELS = {
  alchemy: 'Luyện Đan',
  pill: 'Đan Dược',
  garden: 'Dược Viên',
  fortune: 'Kỳ Ngộ',
  technique: 'Công Pháp',
  martial: 'Vũ Kỹ',
  cultivation: 'Tu Luyện',
  breakthrough: 'Đột Phá',
  system: 'Thiên Cơ',
};

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function normalizeUsername(playerOrUsername) {
  if (!playerOrUsername) return '';
  if (typeof playerOrUsername === 'string') return playerOrUsername;
  return String(playerOrUsername.username || '');
}

function safeParse(line) {
  try { return JSON.parse(line); } catch (_) { return null; }
}

function addActionLog(playerOrUsername, category, text, detail = '') {
  const username = normalizeUsername(playerOrUsername);
  if (!username) return null;
  if (category === 'combat') return null;

  ensureLogDir();

  const item = {
    at: Date.now(),
    username,
    category: category || 'system',
    categoryLabel: CATEGORY_LABELS[category] || CATEGORY_LABELS.system,
    text: String(text || 'Đạo hành biến động.'),
    detail: detail ? String(detail) : '',
  };

  fs.appendFileSync(ALL_LOG_FILE, JSON.stringify(item) + '\n', 'utf8');
  return item;
}

function getPlayerLogs(username, limit = 80) {
  ensureLogDir();
  if (!fs.existsSync(ALL_LOG_FILE)) return [];

  const name = String(username || '');
  return fs.readFileSync(ALL_LOG_FILE, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(safeParse)
    .filter(item => item && item.username === name && item.category !== 'combat')
    .slice(-Number(limit || 80))
    .reverse();
}

module.exports = {
  addActionLog,
  getPlayerLogs,
};
