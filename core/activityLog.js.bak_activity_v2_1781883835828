const ACTIVITY_LOG_LIMIT = 80;

const CATEGORY_LABELS = {
  system: 'Thiên Cơ',
  item: 'Vật Phẩm',
  alchemy: 'Luyện Chế',
  fortune: 'Kỳ Ngộ',
  cave: 'Động Phủ',
  cultivation: 'Tu Luyện',
  skill: 'Công Pháp',
};

function ensureActivityLog(player) {
  if (!player) return [];
  if (!Array.isArray(player.activityLog)) player.activityLog = [];
  if (player.activityLog.length > ACTIVITY_LOG_LIMIT) {
    player.activityLog = player.activityLog.slice(-ACTIVITY_LOG_LIMIT);
  }
  return player.activityLog;
}

function addActivityLog(player, category, text, detail = '') {
  if (!player || !text) return null;
  const log = ensureActivityLog(player);
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    category: category || 'system',
    categoryLabel: CATEGORY_LABELS[category] || CATEGORY_LABELS.system,
    text: String(text),
    detail: detail ? String(detail) : '',
  };
  log.push(entry);
  while (log.length > ACTIVITY_LOG_LIMIT) log.shift();
  return entry;
}

function addResultActivityLog(player, category, result, fallbackText = '') {
  if (!result || result.success === false) return null;
  const text = result.message || fallbackText;
  if (!text) return null;
  return addActivityLog(player, category, text, result.detail || '');
}

module.exports = {
  ACTIVITY_LOG_LIMIT,
  ensureActivityLog,
  addActivityLog,
  addResultActivityLog,
};
