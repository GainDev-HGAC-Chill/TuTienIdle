/**
 * XỬ LÝ THƯỞNG / PHẠT KỲ NGỘ
 * ------------------------------------------------------------
 * File này chỉ xử lý tác động lên player.
 * Engine roll ra outcome nào thì gọi applyFortuneRewards(player, outcome.rewards).
 */

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function randInt(min, max) {
  const a = Math.floor(number(min, 0));
  const b = Math.floor(number(max, a));
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return low + Math.floor(Math.random() * (high - low + 1));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCurrentNeed(player) {
  if (typeof player.getRealmNeed === 'function') return Math.max(1, number(player.getRealmNeed(player), 100));
  if (player.cultivation && player.cultivation.maxExp) return Math.max(1, number(player.cultivation.maxExp, 100));
  return 100;
}

function addInventoryItem(player, id, amount = 1, extra = {}) {
  if (typeof player.addInventoryItem === 'function') {
    player.addInventoryItem(player, id, amount, extra);
    return;
  }

  if (!Array.isArray(player.inventory)) player.inventory = [];
  const quality = extra.quality || '';
  const existed = player.inventory.find(item => item.id === id && (item.quality || '') === quality);
  if (existed) {
    existed.amount = number(existed.amount, 0) + amount;
    return;
  }

  player.inventory.push({
    id,
    name: extra.name || id,
    amount,
    ...extra,
  });
}

function addLog(player, text) {
  if (typeof player.addLog === 'function') {
    player.addLog(player, text);
    return;
  }

  if (!player.combatState) player.combatState = {};
  if (!Array.isArray(player.combatState.logs)) player.combatState.logs = [];
  const time = new Date().toLocaleTimeString('vi-VN');
  player.combatState.logs.push(`[${time}] ${text}`);
  while (player.combatState.logs.length > 10) player.combatState.logs.shift();
}

function addTemporaryBuff(player, reward) {
  if (!Array.isArray(player.temporaryBuffs)) player.temporaryBuffs = [];
  const durationMs = Math.max(1000, number(reward.durationMs, 60_000));
  const id = reward.id || `buff_${Date.now()}`;
  player.temporaryBuffs = player.temporaryBuffs.filter(item => item.id !== id);
  player.temporaryBuffs.push({
    id,
    name: reward.name || id,
    stat: reward.stat || 'unknown',
    value: number(reward.value, 0),
    until: Date.now() + durationMs,
  });
}

function addTemporaryPenalty(player, reward) {
  if (!Array.isArray(player.temporaryPenalties)) player.temporaryPenalties = [];
  const durationMs = Math.max(1000, number(reward.durationMs, 60_000));
  const id = reward.id || `penalty_${Date.now()}`;
  player.temporaryPenalties = player.temporaryPenalties.filter(item => item.id !== id);
  player.temporaryPenalties.push({
    id,
    name: reward.name || id,
    percent: Math.max(0, number(reward.percent, 0)),
    until: Date.now() + durationMs,
  });
}

function addTechnique(player, reward) {
  if (!player.techniques) player.techniques = { equipped: {}, learned: {} };
  if (!player.techniques.learned) player.techniques.learned = {};
  if (!player.techniques.learned[reward.id]) {
    player.techniques.learned[reward.id] = { id: reward.id, rank: 1, phase: 1, exp: 0, maxExp: 100 };
  }
}

function addMartialSkill(player, reward) {
  if (!player.martialSkills) player.martialSkills = { equipped: {}, learned: {} };
  if (!player.martialSkills.learned) player.martialSkills.learned = {};
  if (!player.martialSkills.learned[reward.id]) {
    player.martialSkills.learned[reward.id] = { id: reward.id, rank: 1, phase: 1, exp: 0, maxExp: 100 };
  }
}

function applyOneReward(player, reward) {
  const type = reward.type;
  const result = { type, text: '' };

  if (type === 'nothing') {
    result.text = 'Không có gì xảy ra.';
    return result;
  }

  if (type === 'tuVi') {
    const amount = 'min' in reward || 'max' in reward ? randInt(reward.min, reward.max) : Math.floor(number(reward.value, 0));
    player.cultivation.exp = number(player.cultivation?.exp, 0) + amount;
    result.text = `Tu vi ${amount >= 0 ? '+' : ''}${amount}`;
    return result;
  }

  if (type === 'tuViPercent') {
    const amount = Math.max(1, Math.floor(getCurrentNeed(player) * number(reward.value, 0)));
    player.cultivation.exp = number(player.cultivation?.exp, 0) + amount;
    result.text = `Tu vi +${amount}`;
    return result;
  }

  if (type === 'stones') {
    const amount = 'min' in reward || 'max' in reward ? randInt(reward.min, reward.max) : Math.floor(number(reward.value, 0));
    player.stones = Math.max(0, number(player.stones, 0) + amount);
    result.text = `Linh thạch ${amount >= 0 ? '+' : ''}${amount}`;
    return result;
  }

  if (type === 'lifespan') {
    const amount = 'min' in reward || 'max' in reward ? randInt(reward.min, reward.max) : Math.floor(number(reward.value, 0));
    player.lifespan = Math.max(1, number(player.lifespan, 100) + amount);
    result.text = `Tuổi thọ ${amount >= 0 ? '+' : ''}${amount}`;
    return result;
  }

  if (type === 'hpPercent') {
    if (!player.combat) player.combat = {};
    const maxHp = Math.max(1, number(player.combat.maxHp, 100));
    const amount = Math.floor(maxHp * number(reward.value, 0) / 100);
    player.combat.hp = Math.max(1, Math.min(maxHp, number(player.combat.hp, maxHp) + amount));
    result.text = `Sinh lực ${amount >= 0 ? '+' : ''}${amount}`;
    return result;
  }

  if (['maxHp', 'atk', 'def'].includes(type)) {
    if (!player.combat) player.combat = {};
    const amount = 'min' in reward || 'max' in reward ? randInt(reward.min, reward.max) : Math.floor(number(reward.value, 0));
    player.combat[type] = Math.max(0, number(player.combat[type], type === 'maxHp' ? 100 : 0) + amount);
    if (type === 'maxHp') player.combat.hp = Math.min(number(player.combat.hp, player.combat.maxHp), player.combat.maxHp);
    const name = type === 'maxHp' ? 'Sinh lực tối đa' : type === 'atk' ? 'Công kích' : 'Phòng ngự';
    result.text = `${name} ${amount >= 0 ? '+' : ''}${amount}`;
    return result;
  }

  if (type === 'crit') {
    if (!player.combat) player.combat = {};
    const amount = 'min' in reward || 'max' in reward ? (number(reward.min, 0) + Math.random() * (number(reward.max, 0) - number(reward.min, 0))) : number(reward.value, 0);
    player.combat.critRate = Math.max(0, number(player.combat.critRate, 0) + amount);
    result.text = `Bạo kích +${(amount * 100).toFixed(2)}%`;
    return result;
  }

  if (type === 'item') {
    const amount = 'min' in reward || 'max' in reward ? randInt(reward.min, reward.max) : Math.max(1, Math.floor(number(reward.amount, 1)));
    addInventoryItem(player, reward.id, amount, { name: reward.name || reward.id, ...(reward.extra || {}) });
    result.text = `${reward.name || reward.id} +${amount}`;
    return result;
  }

  if (type === 'buff') {
    addTemporaryBuff(player, reward);
    result.text = `Nhận hiệu ứng ${reward.name || reward.id}`;
    return result;
  }

  if (type === 'temporaryPenalty' || type === 'debuff') {
    addTemporaryPenalty(player, reward);
    result.text = `Nhận bất lợi ${reward.name || reward.id}`;
    return result;
  }

  if (type === 'technique') {
    addTechnique(player, reward);
    result.text = `Lĩnh ngộ công pháp: ${reward.name || reward.id}`;
    return result;
  }

  if (type === 'martialSkill') {
    addMartialSkill(player, reward);
    result.text = `Lĩnh ngộ vũ kỹ: ${reward.name || reward.id}`;
    return result;
  }

  if (type === 'techniqueExp') {
    const amount = Math.max(1, Math.floor(number(reward.amount, 1)));
    if (!player.techniqueExpBank) player.techniqueExpBank = 0;
    player.techniqueExpBank += amount;
    result.text = `Kinh nghiệm công pháp +${amount}`;
    return result;
  }

  result.text = `Hiệu ứng chưa hỗ trợ: ${type}`;
  return result;
}

function applyFortuneRewards(player, rewards = []) {
  const details = ensureArray(rewards).map(reward => applyOneReward(player, reward));
  const text = details.map(item => item.text).filter(Boolean).join('; ') || 'Không có gì xảy ra.';
  addLog(player, `Kỳ ngộ: ${text}`);
  return { details, text };
}

module.exports = {
  applyFortuneRewards,
};
