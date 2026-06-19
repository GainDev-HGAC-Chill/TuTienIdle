/**
 * ENGINE KỲ NGỘ
 * ------------------------------------------------------------
 * Chỉ xử lý roll kỳ ngộ / lựa chọn / outcome.
 * Không chứa dữ liệu kỳ ngộ, không trực tiếp sửa player ngoài apply reward.
 */

const { FORTUNES, FORTUNE_RARITY } = require('../config/fortunes');
const { applyFortuneRewards } = require('./fortuneRewards');

const DEFAULT_FORTUNE_OPTIONS = {
  // Tỷ lệ xuất hiện kỳ ngộ mỗi lần gọi tryRollFortune.
  // Gợi ý:
  // - gọi sau mỗi trận combat: 0.03 -> 3%
  // - gọi mỗi tick tu luyện: 0.005 -> 0.5%
  chance: 0.03,

  // true = kỳ ngộ unique chỉ gặp 1 lần.
  respectUnique: true,
};

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function weightedPick(list, getWeight = item => item.weight) {
  const valid = list.filter(item => number(getWeight(item), 0) > 0);
  const total = valid.reduce((sum, item) => sum + number(getWeight(item), 0), 0);
  if (total <= 0) return null;

  let roll = Math.random() * total;
  for (const item of valid) {
    roll -= number(getWeight(item), 0);
    if (roll <= 0) return item;
  }
  return valid[valid.length - 1] || null;
}

function getRealmOrder(player) {
  if (typeof player.getMainRealmOrder === 'function') return number(player.getMainRealmOrder(player), 1);
  if (player.realmOrder) return number(player.realmOrder, 1);
  if (player.cultivation?.realmOrder) return number(player.cultivation.realmOrder, 1);
  if (typeof player.cultivation?.realmIndex !== 'undefined') return number(player.cultivation.realmIndex, 0) + 1;
  return 1;
}

function ensureFortuneState(player) {
  if (!player.fortune) {
    player.fortune = {
      active: null,
      history: [],
      encountered: {},
      lastRollAt: 0,
    };
  }
  if (!Array.isArray(player.fortune.history)) player.fortune.history = [];
  if (!player.fortune.encountered) player.fortune.encountered = {};
  return player.fortune;
}

function canFortuneAppear(player, fortune, options = DEFAULT_FORTUNE_OPTIONS) {
  const state = ensureFortuneState(player);
  const order = getRealmOrder(player);
  if (fortune.world && fortune.world !== 'Nhân Giới') return false;
  if (number(fortune.minRealmOrder, 1) > order) return false;
  if (number(fortune.maxRealmOrder, 999) < order) return false;
  if (options.respectUnique !== false && fortune.unique && state.encountered[fortune.id]) return false;
  return true;
}

function getAvailableFortunes(player, options = DEFAULT_FORTUNE_OPTIONS) {
  return FORTUNES.filter(fortune => canFortuneAppear(player, fortune, options));
}

function pickFortune(player, options = DEFAULT_FORTUNE_OPTIONS) {
  const available = getAvailableFortunes(player, options);
  return weightedPick(available, fortune => FORTUNE_RARITY[fortune.rarity]?.weight || 1);
}

function makeClientFortune(fortune) {
  if (!fortune) return null;
  return {
    id: fortune.id,
    name: fortune.name,
    world: fortune.world,
    rarity: fortune.rarity,
    rarityName: FORTUNE_RARITY[fortune.rarity]?.name || fortune.rarity,
    rarityColor: FORTUNE_RARITY[fortune.rarity]?.color || '#ffffff',
    type: fortune.type,
    description: fortune.description,
    choices: fortune.choices.map(choice => ({ id: choice.id, label: choice.label })),
  };
}

function tryRollFortune(player, customOptions = {}) {
  const options = { ...DEFAULT_FORTUNE_OPTIONS, ...customOptions };
  const state = ensureFortuneState(player);
  if (state.active) return { success: false, reason: 'fortune_active', fortune: state.active };
  if (Math.random() >= number(options.chance, DEFAULT_FORTUNE_OPTIONS.chance)) {
    state.lastRollAt = Date.now();
    return { success: false, reason: 'miss' };
  }

  const fortune = pickFortune(player, options);
  if (!fortune) return { success: false, reason: 'no_available_fortune' };

  const clientFortune = makeClientFortune(fortune);
  state.active = {
    ...clientFortune,
    startedAt: Date.now(),
  };
  state.lastRollAt = Date.now();

  return { success: true, fortune: state.active };
}

function startFortune(player, fortuneId) {
  const state = ensureFortuneState(player);
  if (state.active) return { success: false, error: 'Đang có kỳ ngộ chưa xử lý.', fortune: state.active };

  const fortune = FORTUNES.find(item => item.id === fortuneId);
  if (!fortune) return { success: false, error: 'Không tìm thấy kỳ ngộ.' };
  if (!canFortuneAppear(player, fortune)) return { success: false, error: 'Cảnh giới hiện tại chưa phù hợp với kỳ ngộ này.' };

  state.active = {
    ...makeClientFortune(fortune),
    startedAt: Date.now(),
  };
  return { success: true, fortune: state.active };
}

function resolveFortuneChoice(player, choiceId) {
  const state = ensureFortuneState(player);
  if (!state.active) return { success: false, error: 'Không có kỳ ngộ đang chờ lựa chọn.' };

  const fortune = FORTUNES.find(item => item.id === state.active.id);
  if (!fortune) {
    state.active = null;
    return { success: false, error: 'Dữ liệu kỳ ngộ không còn tồn tại.' };
  }

  const choice = fortune.choices.find(item => item.id === choiceId);
  if (!choice) return { success: false, error: 'Lựa chọn không hợp lệ.' };

  const outcome = weightedPick(choice.outcomes || [], item => item.weight);
  if (!outcome) return { success: false, error: 'Kỳ ngộ chưa có kết quả.' };

  const rewardResult = applyFortuneRewards(player, outcome.rewards || []);
  const record = {
    fortuneId: fortune.id,
    fortuneName: fortune.name,
    rarity: fortune.rarity,
    choiceId: choice.id,
    choiceLabel: choice.label,
    outcomeText: outcome.text || '',
    rewardText: rewardResult.text,
    at: Date.now(),
  };

  state.encountered[fortune.id] = number(state.encountered[fortune.id], 0) + 1;
  state.history.unshift(record);
  while (state.history.length > 30) state.history.pop();
  state.active = null;

  return {
    success: true,
    result: record,
    rewards: rewardResult.details,
  };
}

function cancelFortune(player) {
  const state = ensureFortuneState(player);
  state.active = null;
  return { success: true };
}

module.exports = {
  DEFAULT_FORTUNE_OPTIONS,
  tryRollFortune,
  startFortune,
  resolveFortuneChoice,
  cancelFortune,
  getAvailableFortunes,
  makeClientFortune,
};
