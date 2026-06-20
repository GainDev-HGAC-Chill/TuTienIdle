// ============================================
// CORE - SERVER ACTION LOG
// Nhật Ký Đạo Hành ghi ở server, lưu file JSONL.
// Không ghi log combat.
// ============================================

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LOG_DIR = path.join(DATA_DIR, 'action_logs');
const ALL_LOG = path.join(LOG_DIR, 'all.jsonl');
const PLAYER_DATA_FILE = path.join(DATA_DIR, 'players.json');

let lastSnapshot = null;
const lastWriteKey = new Map();

const CATEGORY_LABELS = {
  save: 'Lưu Dữ Liệu',
  cultivation: 'Tu Luyện',
  alchemy: 'Luyện Đan',
  item: 'Vật Phẩm',
  garden: 'Dược Viên',
  cave: 'Động Phủ',
  encounter: 'Kỳ Ngộ',
  resource: 'Tài Nguyên',
  lifespan: 'Thọ Nguyên',
  technique: 'Công Pháp',
  system: 'Thiên Cơ',
};

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}));
  } catch {
    return {};
  }
}

function loadPlayersSnapshot() {
  try {
    if (!fs.existsSync(PLAYER_DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(PLAYER_DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function toComparablePlayer(player) {
  const clone = safeClone(player);

  // Combat không ghi log tổng, chỉ bỏ phần chiến đấu ra khỏi diff.
  delete clone.combatState;
  delete clone.combat;
  delete clone.currentMonster;
  delete clone.autoFight;
  delete clone.currentZone;

  // Các field thời gian/tạm thời dễ thay đổi liên tục.
  delete clone.lastTick;
  delete clone.lastSave;
  delete clone.updatedAt;

  return clone;
}

function getUsername(player, fallback) {
  return String(player?.username || player?.name || fallback || '').trim();
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableJson(value[k])).join(',') + '}';
}

function changed(a, b, key) {
  return stableJson(a?.[key]) !== stableJson(b?.[key]);
}

function chooseCategory(before, after) {
  if (changed(before, after, 'alchemy')) return 'alchemy';
  if (changed(before, after, 'inventory')) return 'item';
  if (changed(before, after, 'cave')) return 'garden';
  if (changed(before, after, 'encounter') || changed(before, after, 'lastFortune') || changed(before, after, 'fortunesEncountered')) return 'encounter';
  if (changed(before, after, 'techniques') || changed(before, after, 'martialSkills')) return 'technique';
  if (changed(before, after, 'lifespan') || changed(before, after, 'lifespanUsed')) return 'lifespan';
  if (changed(before, after, 'cultivation') || changed(before, after, 'body') || changed(before, after, 'soul')) return 'cultivation';
  if (changed(before, after, 'spiritStones') || changed(before, after, 'stones') || changed(before, after, 'gold') || changed(before, after, 'resources')) return 'resource';
  return 'save';
}

function makeText(category) {
  switch (category) {
    case 'alchemy': return 'Đan lô biến động, luyện đan hoặc đan đạo vừa thay đổi.';
    case 'item': return 'Túi trữ vật biến động, vật phẩm vừa thay đổi.';
    case 'garden': return 'Dược viên/động phủ vừa có biến động.';
    case 'encounter': return 'Thiên cơ kỳ ngộ vừa có biến động.';
    case 'technique': return 'Công pháp hoặc vũ kỹ vừa thay đổi.';
    case 'lifespan': return 'Thọ nguyên vừa thay đổi.';
    case 'cultivation': return 'Đạo hạnh tu luyện vừa tăng tiến.';
    case 'resource': return 'Tài nguyên vừa thay đổi.';
    default: return 'Dữ liệu nhân vật vừa thay đổi.';
  }
}

function shouldThrottle(username, category) {
  const key = `${username}:${category}`;
  const now = Date.now();
  const last = lastWriteKey.get(key) || 0;
  const cooldown = category === 'cultivation' ? 10000 : 1200;
  if (now - last < cooldown) return true;
  lastWriteKey.set(key, now);
  return false;
}

function appendJsonl(file, record) {
  ensureDir();
  fs.appendFileSync(file, JSON.stringify(record) + '\n', 'utf8');
}

function writeActionLog(record) {
  const username = String(record.username || '').trim();
  if (!username) return null;

  const category = String(record.category || 'system');
  const row = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    username,
    category,
    categoryLabel: record.categoryLabel || CATEGORY_LABELS[category] || CATEGORY_LABELS.system,
    text: record.text || makeText(category),
    detail: record.detail || '',
    meta: record.meta || {},
  };

  appendJsonl(ALL_LOG, row);
  appendJsonl(path.join(LOG_DIR, `${category}.jsonl`), row);
  appendJsonl(path.join(LOG_DIR, `player_${username}.jsonl`), row);

  return row;
}

function recordPlayerSaveDiff(players) {
  if (!players || typeof players !== 'object') return [];

  if (!lastSnapshot) {
    lastSnapshot = loadPlayersSnapshot();
  }

  const written = [];
  const nextSnapshot = safeClone(players);

  for (const [key, afterRaw] of Object.entries(players)) {
    const username = getUsername(afterRaw, key);
    if (!username) continue;

    const beforeRaw = lastSnapshot?.[key] || lastSnapshot?.[username] || null;
    const before = toComparablePlayer(beforeRaw || {});
    const after = toComparablePlayer(afterRaw || {});

    if (!beforeRaw) {
      // Nhân vật mới.
      if (!shouldThrottle(username, 'system')) {
        written.push(writeActionLog({
          username,
          category: 'system',
          text: 'Đạo hữu nhập thế, hồ sơ tu tiên được tạo.',
        }));
      }
      continue;
    }

    if (stableJson(before) === stableJson(after)) continue;

    const category = chooseCategory(before, after);
    if (category === 'save') continue;
    if (shouldThrottle(username, category)) continue;

    written.push(writeActionLog({
      username,
      category,
      text: makeText(category),
    }));
  }

  lastSnapshot = nextSnapshot;
  return written.filter(Boolean);
}

function readJsonl(file, limit = 50) {
  try {
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
    return lines.slice(-Math.max(1, Number(limit) || 50)).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function readPlayerLogs(username, limit = 50) {
  const safeName = String(username || '').trim();
  if (!safeName) return [];
  const direct = path.join(LOG_DIR, `player_${safeName}.jsonl`);
  let logs = readJsonl(direct, limit);
  if (!logs.length) {
    logs = readJsonl(ALL_LOG, Math.max(200, limit * 4)).filter(row => row.username === safeName);
  }
  return logs.slice(-Math.max(1, Number(limit) || 50)).reverse();
}

module.exports = {
  CATEGORY_LABELS,
  writeActionLog,
  recordPlayerSaveDiff,
  readPlayerLogs,
};
