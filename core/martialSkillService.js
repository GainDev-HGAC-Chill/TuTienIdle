// ============================================
// CORE - MARTIAL SKILL SERVICE
// Học nhiều vũ kỹ, nhưng combat chỉ dùng 1 vũ kỹ active.
// ============================================
const CONFIG = require('../config/martialSkills');

function getAllMartialSkills() {
  return CONFIG.list || [];
}

function getMartialSkillById(id) {
  return getAllMartialSkills().find(item => item.id === id) || null;
}

function makeLearnedItem(config) {
  return {
    ...config,
    rank: config.startRank || 1,
    phase: config.startPhase || 1,
    exp: 0,
    maxExp: 100,
  };
}

function createDefaultMartialSkills() {
  const learned = getAllMartialSkills().map(makeLearnedItem);
  return {
    equipped: {
      active: 'co_ban_kiem_quyet',
    },
    learned,
  };
}

function normalizeMartialSkills(state) {
  const defaults = createDefaultMartialSkills();
  if (!state || typeof state !== 'object') return defaults;

  let learned = [];
  if (Array.isArray(state.learned)) {
    learned = state.learned.map(item => {
      const config = getMartialSkillById(item.id) || item;
      return { ...config, ...item };
    });
  } else if (state.learned && typeof state.learned === 'object') {
    learned = Object.values(state.learned).map(item => {
      const config = getMartialSkillById(item.id) || item;
      return { ...config, ...item };
    });
  }

  for (const item of defaults.learned) {
    if (!learned.some(x => x.id === item.id)) learned.push(item);
  }

  const equipped = { ...(state.equipped || {}) };
  if (!equipped.active && learned.length) equipped.active = defaults.equipped.active;

  return { equipped, learned };
}

function equipMartialSkill(state, martialSkillId) {
  const normalized = normalizeMartialSkills(state);
  const item = normalized.learned.find(x => x.id === martialSkillId);
  if (!item) return { success: false, error: 'Chưa học vũ kỹ này.' };
  normalized.equipped.active = item.id;
  return { success: true, martialSkills: normalized, message: `Đã trang bị ${item.name}.` };
}

function unequipMartialSkill(state, martialSkillId) {
  const normalized = normalizeMartialSkills(state);
  if (normalized.equipped.active === martialSkillId) {
    normalized.equipped.active = null;
  }
  return { success: true, martialSkills: normalized, message: 'Đã tháo vũ kỹ.' };
}

function getEquippedMartialSkill(state) {
  const normalized = normalizeMartialSkills(state);
  const id = normalized.equipped?.active;
  if (!id) return null;
  return normalized.learned.find(x => x.id === id) || getMartialSkillById(id) || null;
}

function getEquippedMartialEffects(state) {
  const item = getEquippedMartialSkill(state);
  const effects = item?.effects || {};
  return {
    name: item?.name || 'Đòn đánh thường',
    damageMultiplier: Math.max(1, Number(effects.damageMultiplier || 1)),
    extraDamage: Math.max(0, Number(effects.extraDamage || 0)),
    defDamageRatio: Math.max(0, Number(effects.defDamageRatio || 0)),
    critBonus: Math.max(0, Number(effects.critBonus || 0)),
    atkBonus: Math.max(0, Number(effects.atkBonus || 0)),
  };
}

module.exports = {
  getAllMartialSkills,
  getMartialSkillById,
  createDefaultMartialSkills,
  normalizeMartialSkills,
  equipMartialSkill,
  unequipMartialSkill,
  getEquippedMartialSkill,
  getEquippedMartialEffects,
};
