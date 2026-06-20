const fs = require('fs');
const path = require('path');

const CATEGORY_LABELS = {
  system: 'Thiên Cơ',
  combat: 'Chiến Đấu',
  alchemy: 'Luyện Đan',
  item: 'Vật Phẩm',
  inventory: 'Túi Đồ',
  cultivation: 'Tu Luyện',
  body: 'Luyện Thể',
  soul: 'Luyện Hồn',
  garden: 'Dược Viên',
  encounter: 'Kỳ Ngộ',
  currency: 'Tài Nguyên',
  lifespan: 'Thọ Nguyên',
  skill: 'Công Pháp',
};

const DEFAULT_LIMIT = 80;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeReadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function cloneSimple(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function getLogDir(dataFile) {
  return path.join(path.dirname(dataFile), 'action_logs');
}

function cleanCategory(category) {
  const raw = String(category || 'system').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  return raw || 'system';
}

function appendLine(file, entry) {
  fs.appendFileSync(file, JSON.stringify(entry) + '\n', 'utf8');
}

function writeEntry(dataFile, entry) {
  const logDir = getLogDir(dataFile);
  ensureDir(logDir);

  const full = {
    id: entry.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at || Date.now(),
    username: String(entry.username || '').trim(),
    category: cleanCategory(entry.category),
    categoryLabel: entry.categoryLabel || CATEGORY_LABELS[cleanCategory(entry.category)] || 'Thiên Cơ',
    text: entry.text || 'Đạo hành biến động.',
    detail: entry.detail || '',
    changes: entry.changes || {},
  };

  if (!full.username) return;
  appendLine(path.join(logDir, 'all.jsonl'), full);
  appendLine(path.join(logDir, `${full.category}.jsonl`), full);
}

function inventoryMap(player) {
  const map = new Map();
  const list = Array.isArray(player?.inventory) ? player.inventory : [];
  for (const item of list) {
    const id = String(item?.id || 'unknown');
    const quality = String(item?.quality || '');
    const key = `${id}::${quality}`;
    const old = map.get(key) || { id, quality, name: item?.name || id, amount: 0, basePillId: item?.basePillId || '' };
    old.amount += num(item?.amount);
    if (item?.name) old.name = item.name;
    if (item?.basePillId) old.basePillId = item.basePillId;
    map.set(key, old);
  }
  return map;
}

function diffInventory(before, after) {
  const a = inventoryMap(before);
  const b = inventoryMap(after);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const gains = [];
  const losses = [];
  for (const key of keys) {
    const oldItem = a.get(key) || { id: key.split('::')[0], name: key.split('::')[0], amount: 0 };
    const newItem = b.get(key) || { id: oldItem.id, name: oldItem.name, amount: 0 };
    const delta = num(newItem.amount) - num(oldItem.amount);
    if (delta > 0) gains.push({ ...newItem, amount: delta });
    if (delta < 0) losses.push({ ...oldItem, amount: Math.abs(delta) });
  }
  return { gains, losses };
}

function isPill(item) {
  const id = String(item?.id || '').toLowerCase();
  const name = String(item?.name || '').toLowerCase();
  return !!item?.basePillId || id.includes('dan') || id.includes('pill') || name.includes('đan') || name.includes('dan');
}

function itemText(items, prefix) {
  if (!items.length) return '';
  return `${prefix} ${items.map(item => `${item.name || item.id} x${item.amount}`).join(', ')}`;
}

function currencyDiff(before, after) {
  const oldCur = before?.currencies || {};
  const newCur = after?.currencies || {};
  const keys = new Set([...Object.keys(oldCur), ...Object.keys(newCur)]);
  const diffs = [];
  for (const key of keys) {
    const delta = num(newCur[key]) - num(oldCur[key]);
    if (delta) diffs.push({ id: key, amount: delta });
  }
  return diffs;
}

function push(entries, username, category, text, detail, changes) {
  entries.push({ username, category, text, detail: detail || '', changes: changes || {} });
}

function buildPlayerEntries(username, before = {}, after = {}) {
  const entries = [];

  if (!before || !before.username) {
    push(entries, username, 'system', 'Đạo hữu nhập thế, hồ sơ được tạo mới.', '', {});
    return entries;
  }

  const oldKills = num(before?.stats?.totalKills);
  const newKills = num(after?.stats?.totalKills);
  const killDelta = newKills - oldKills;
  if (killDelta > 0) {
    push(entries, username, 'combat', `Đã trảm sát ${killDelta} yêu thú.`, `Tổng hạ gục: ${newKills}.`, { totalKills: killDelta });
  }

  const oldEncounterLen = Array.isArray(before?.encounter?.history) ? before.encounter.history.length : 0;
  const newEncounterHistory = Array.isArray(after?.encounter?.history) ? after.encounter.history : [];
  if (newEncounterHistory.length > oldEncounterLen) {
    for (const item of newEncounterHistory.slice(oldEncounterLen)) {
      push(entries, username, 'encounter', `Kỳ ngộ: ${item.name || 'Thiên Cơ Vô Danh'}.`, `Lựa chọn: ${item.choice || 'không rõ'}${item.penalty ? `. ${item.penalty}` : ''}`, { encounter: item });
    }
  }

  const inv = diffInventory(before, after);
  const pillGain = inv.gains.filter(isPill);
  const normalGain = inv.gains.filter(item => !isPill(item));
  const pillLoss = inv.losses.filter(isPill);
  const normalLoss = inv.losses.filter(item => !isPill(item));

  if (pillGain.length) push(entries, username, 'alchemy', 'Luyện chế đan dược thành công.', itemText(pillGain, 'Nhận'), { gains: pillGain });
  if (normalGain.length) push(entries, username, killDelta > 0 ? 'combat' : 'item', killDelta > 0 ? 'Chiến lợi phẩm nhập túi.' : 'Nhận vật phẩm.', itemText(normalGain, 'Nhận'), { gains: normalGain });
  if (pillLoss.length) push(entries, username, 'item', 'Sử dụng hoặc tiêu hao đan dược.', itemText(pillLoss, 'Tiêu hao'), { losses: pillLoss });
  if (normalLoss.length) push(entries, username, 'inventory', 'Tiêu hao vật phẩm.', itemText(normalLoss, 'Tiêu hao'), { losses: normalLoss });

  const curDiffs = currencyDiff(before, after).filter(x => x.amount !== 0);
  if (curDiffs.length) {
    const detail = curDiffs.map(x => `${x.id} ${x.amount > 0 ? '+' : ''}${x.amount}`).join(', ');
    push(entries, username, killDelta > 0 ? 'combat' : 'currency', 'Tài nguyên biến động.', detail, { currencies: curDiffs });
  }

  const oldTuVi = num(before?.cultivation?.tuVi);
  const newTuVi = num(after?.cultivation?.tuVi);
  const tuViDelta = newTuVi - oldTuVi;
  const realmChanged = num(before?.cultivation?.realmIndex) !== num(after?.cultivation?.realmIndex) || num(before?.cultivation?.stage) !== num(after?.cultivation?.stage);
  if (realmChanged) {
    push(entries, username, 'cultivation', 'Cảnh giới biến động.', `Tu vi: ${oldTuVi} → ${newTuVi}.`, { tuVi: tuViDelta });
  } else if (tuViDelta > 0 && killDelta <= 0 && !newEncounterHistory.length) {
    push(entries, username, 'cultivation', `Tu luyện tăng ${tuViDelta} tu vi.`, '', { tuVi: tuViDelta });
  }

  const bodyDelta = num(after?.bodyCultivation?.exp) - num(before?.bodyCultivation?.exp);
  if (bodyDelta > 0) push(entries, username, 'body', `Luyện thể tăng ${bodyDelta} kinh nghiệm.`, '', { bodyExp: bodyDelta });

  const soulDelta = num(after?.soulCultivation?.exp) - num(before?.soulCultivation?.exp);
  if (soulDelta > 0) push(entries, username, 'soul', `Luyện hồn tăng ${soulDelta} kinh nghiệm.`, '', { soulExp: soulDelta });

  const oldLifeMax = num(before?.lifespan?.maxYears);
  const newLifeMax = num(after?.lifespan?.maxYears);
  if (newLifeMax !== oldLifeMax) {
    const delta = newLifeMax - oldLifeMax;
    push(entries, username, 'lifespan', `${delta > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(delta)} năm thọ nguyên tối đa.`, '', { maxYears: delta });
  }

  const oldPlots = Array.isArray(before?.herbPlots) ? before.herbPlots : [];
  const newPlots = Array.isArray(after?.herbPlots) ? after.herbPlots : [];
  for (let i = 0; i < Math.max(oldPlots.length, newPlots.length); i += 1) {
    const o = oldPlots[i] || {};
    const n = newPlots[i] || {};
    if (o.state !== n.state || o.herbId !== n.herbId) {
      if (n.state === 'growing') push(entries, username, 'garden', `Gieo trồng ô dược viên ${i + 1}.`, `Dược liệu: ${n.herbId || 'không rõ'}.`, { plotIndex: i, herbId: n.herbId });
      if ((o.state === 'ready' || o.state === 'growing') && (!n.state || n.state === 'empty')) push(entries, username, 'garden', `Thu hoạch ô dược viên ${i + 1}.`, `Dược liệu: ${o.herbId || 'không rõ'}.`, { plotIndex: i, herbId: o.herbId });
    }
  }

  const oldTech = before?.techniques?.equipped || {};
  const newTech = after?.techniques?.equipped || {};
  for (const slot of new Set([...Object.keys(oldTech), ...Object.keys(newTech)])) {
    if (oldTech[slot] !== newTech[slot]) push(entries, username, 'skill', `Công pháp ${slot} thay đổi.`, `${oldTech[slot] || 'trống'} → ${newTech[slot] || 'trống'}`, { slot, before: oldTech[slot], after: newTech[slot] });
  }
  const oldMartial = before?.martialSkills?.equipped?.active || '';
  const newMartial = after?.martialSkills?.equipped?.active || '';
  if (oldMartial !== newMartial) push(entries, username, 'skill', 'Vũ kỹ xuất chiến thay đổi.', `${oldMartial || 'trống'} → ${newMartial || 'trống'}`, { before: oldMartial, after: newMartial });

  return entries;
}

function logPlayerChanges(dataFile, nextPlayers) {
  const beforePlayers = safeReadJson(dataFile, {});
  const afterPlayers = cloneSimple(nextPlayers || {});
  const usernames = new Set([...Object.keys(beforePlayers || {}), ...Object.keys(afterPlayers || {})]);

  for (const username of usernames) {
    const before = beforePlayers[username];
    const after = afterPlayers[username];
    if (!after) continue;
    const entries = buildPlayerEntries(username, before, after);
    for (const entry of entries) writeEntry(dataFile, entry);
  }
}

function readJsonlTail(file, maxLines = 2000) {
  try {
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, 'utf8').trim();
    if (!raw) return [];
    const lines = raw.split(/\r?\n/).slice(-maxLines);
    return lines.map(line => {
      try { return JSON.parse(line); } catch (err) { return null; }
    }).filter(Boolean);
  } catch (err) {
    return [];
  }
}

function readPlayerLogs(dataFile, username, limit = DEFAULT_LIMIT) {
  const logDir = getLogDir(dataFile);
  const allFile = path.join(logDir, 'all.jsonl');
  const name = String(username || '').trim();
  const max = Math.max(1, Math.min(300, Number(limit || DEFAULT_LIMIT)));
  return readJsonlTail(allFile, Math.max(2000, max * 30))
    .filter(item => item.username === name)
    .slice(-max)
    .reverse();
}

module.exports = {
  CATEGORY_LABELS,
  logPlayerChanges,
  readPlayerLogs,
  writeEntry,
};
