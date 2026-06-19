// ============================================
// CORE - MARTIAL SKILL SERVICE
// Logic đọc/nâng Vũ Kỹ
// ============================================
const MARTIAL_SKILL_CONFIG = require('../config/martialSkills');
const BODY_REALMS = require('../config/bodyRealms');
const progression = require('./progressionService');

function getMartialSkill(skillId) {
  return MARTIAL_SKILL_CONFIG.list.find(item => item.id === skillId) || null;
}

function createProgress(id) {
  return { id, rank: 1, phase: 1, exp: 0, maxExp: 100 };
}

function createDefaultMartialSkills() {
  return {
    equipped: {
      cultivation: 'co_ban_kiem_quyet',
      body: 'man_nguu_quyen',
      soul: 'kinh_than_thu',
    },
    learned: {
      co_ban_kiem_quyet: createProgress('co_ban_kiem_quyet'),
      man_nguu_quyen: createProgress('man_nguu_quyen'),
      kinh_than_thu: createProgress('kinh_than_thu'),
    },
  };
}

function normalizeMartialSkillState(state) {
  const defaults = createDefaultMartialSkills();
  if (!state || typeof state !== 'object') return defaults;
  if (!state.learned) state.learned = {};

  // Chuyển dữ liệu cũ: equipped là array.
  if (Array.isArray(state.equipped)) {
    state.equipped = { cultivation: state.equipped[0] };
  }
  if (!state.equipped || typeof state.equipped !== 'object') state.equipped = {};

  for (const [system, id] of Object.entries(defaults.equipped)) {
    if (!state.equipped[system]) state.equipped[system] = id;
    if (!state.learned[id]) state.learned[id] = createProgress(id);
  }
  return state;
}

function getLearnedMartialSkill(playerSkills, skillId) {
  const state = normalizeMartialSkillState(playerSkills);
  return state.learned[skillId] || null;
}

function getMartialSkillInfo(playerSkills, skillId) {
  const state = normalizeMartialSkillState(playerSkills);
  const skill = getMartialSkill(skillId);
  const learned = getLearnedMartialSkill(state, skillId);
  if (!skill || !learned) return null;

  const progressInfo = progression.getDisplayInfo(
    {
      id: MARTIAL_SKILL_CONFIG.id,
      name: MARTIAL_SKILL_CONFIG.name,
      phases: MARTIAL_SKILL_CONFIG.phases,
      ranks: BODY_REALMS.ranks.map(rank => ({
        ...rank,
        name: `${skill.name} - ${rank.name.replace('Thể', '').trim()}`,
      })),
    },
    learned
  );

  return {
    ...progressInfo,
    id: skill.id,
    name: skill.name,
    grade: skill.grade,
    system: skill.system,
    type: skill.type,
    effects: skill.effects,
    description: skill.description,
  };
}

function getPublicMartialSkills(playerSkills) {
  const state = normalizeMartialSkillState(playerSkills);
  const learned = Object.keys(state.learned)
    .map(id => getMartialSkillInfo(state, id))
    .filter(Boolean);
  return { equipped: state.equipped, learned };
}

function equipMartialSkill(playerSkills, skillId, system) {
  const state = normalizeMartialSkillState(playerSkills);
  const skill = getMartialSkill(skillId);
  if (!skill) return { success: false, reason: 'Vũ kỹ không tồn tại.' };
  if (!state.learned[skillId]) return { success: false, reason: 'Chưa học vũ kỹ này.' };
  const slot = system || skill.system || 'cultivation';
  if (!['cultivation', 'body', 'soul'].includes(slot)) return { success: false, reason: 'Hệ vũ kỹ không hợp lệ.' };
  if (skill.system && skill.system !== slot) return { success: false, reason: 'Vũ kỹ không phù hợp hệ này.' };
  state.equipped[slot] = skillId;
  return { success: true, equipped: state.equipped };
}

function getEquippedMartialEffects(playerSkills) {
  const state = normalizeMartialSkillState(playerSkills);
  const effects = { damageMultiplier: 1, defDamageRatio: 0, critBonus: 0 };
  const used = new Set();
  for (const id of Object.values(state.equipped || {})) {
    if (!id || used.has(id) || !state.learned[id]) continue;
    used.add(id);
    const cfg = getMartialSkill(id);
    if (!cfg) continue;
    const rank = Math.max(1, Number(state.learned[id].rank || 1));
    const rankMul = 1 + (rank - 1) * 0.03;
    const e = cfg.effects || {};
    if (e.damageMultiplier) effects.damageMultiplier += (Number(e.damageMultiplier) - 1) * rankMul;
    if (e.defDamageRatio) effects.defDamageRatio += Number(e.defDamageRatio) * rankMul;
    if (e.critBonus) effects.critBonus += Number(e.critBonus) * rankMul;
  }
  effects.damageMultiplier = Math.max(1, effects.damageMultiplier);
  return effects;
}

function canUpgradeMartialSkill(playerSkills, skillId, mainCultivation) {
  const state = normalizeMartialSkillState(playerSkills);
  const learned = getLearnedMartialSkill(state, skillId);
  if (!learned) return { ok: false, reason: 'Chưa học vũ kỹ này.' };
  return progression.canUpgrade(
    { id: MARTIAL_SKILL_CONFIG.id, name: MARTIAL_SKILL_CONFIG.name, phases: MARTIAL_SKILL_CONFIG.phases, ranks: BODY_REALMS.ranks },
    learned,
    mainCultivation
  );
}

function upgradeMartialSkill(playerSkills, skillId, mainCultivation) {
  const state = normalizeMartialSkillState(playerSkills);
  const learned = getLearnedMartialSkill(state, skillId);
  if (!learned) return { success: false, reason: 'Chưa học vũ kỹ này.' };
  const result = progression.applyUpgrade(
    { id: MARTIAL_SKILL_CONFIG.id, name: MARTIAL_SKILL_CONFIG.name, phases: MARTIAL_SKILL_CONFIG.phases, ranks: BODY_REALMS.ranks },
    learned,
    mainCultivation
  );
  if (!result.success) return result;
  state.learned[skillId] = { ...learned, ...result.progress };
  return { success: true, skill: state.learned[skillId] };
}

module.exports = {
  getMartialSkill,
  createDefaultMartialSkills,
  normalizeMartialSkillState,
  getLearnedMartialSkill,
  getMartialSkillInfo,
  getPublicMartialSkills,
  equipMartialSkill,
  getEquippedMartialEffects,
  canUpgradeMartialSkill,
  upgradeMartialSkill,
};
