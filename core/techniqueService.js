// ============================================
// CORE - TECHNIQUE SERVICE
// Logic đọc/nâng Công Pháp
// ============================================
const TECHNIQUE_CONFIG = require('../config/techniques');
const BODY_REALMS = require('../config/bodyRealms');
const progression = require('./progressionService');

function getTechnique(techniqueId) {
  return TECHNIQUE_CONFIG.list.find(item => item.id === techniqueId) || null;
}

function createProgress(id) {
  return { id, rank: 1, phase: 1, exp: 0, maxExp: 100 };
}

function createDefaultTechniques() {
  return {
    equipped: {
      cultivation: 'tho_nap_quyet',
      body: 'man_nguu_luyen_the_quyet',
      soul: 'duong_than_quyet',
    },
    learned: {
      tho_nap_quyet: createProgress('tho_nap_quyet'),
      man_nguu_luyen_the_quyet: createProgress('man_nguu_luyen_the_quyet'),
      duong_than_quyet: createProgress('duong_than_quyet'),
    },
  };
}

function normalizeTechniqueState(state) {
  const defaults = createDefaultTechniques();
  if (!state || typeof state !== 'object') return defaults;
  if (!state.learned) state.learned = {};

  // Chuyển dữ liệu cũ: equipped là string.
  if (typeof state.equipped === 'string') {
    state.equipped = { cultivation: state.equipped };
  }
  if (!state.equipped || typeof state.equipped !== 'object') state.equipped = {};

  for (const [system, id] of Object.entries(defaults.equipped)) {
    if (!state.equipped[system]) state.equipped[system] = id;
    if (!state.learned[id]) state.learned[id] = createProgress(id);
  }
  return state;
}

function getLearnedTechnique(playerTechniques, techniqueId) {
  const state = normalizeTechniqueState(playerTechniques);
  return state.learned[techniqueId] || null;
}

function getTechniqueInfo(playerTechniques, techniqueId) {
  const state = normalizeTechniqueState(playerTechniques);
  const technique = getTechnique(techniqueId);
  const learned = getLearnedTechnique(state, techniqueId);
  if (!technique || !learned) return null;

  const progressInfo = progression.getDisplayInfo(
    {
      id: TECHNIQUE_CONFIG.id,
      name: TECHNIQUE_CONFIG.name,
      phases: TECHNIQUE_CONFIG.phases,
      ranks: BODY_REALMS.ranks.map(rank => ({
        ...rank,
        name: `${technique.name} - ${rank.name.replace('Thể', '').trim()}`,
      })),
    },
    learned
  );

  return {
    ...progressInfo,
    id: technique.id,
    name: technique.name,
    grade: technique.grade,
    system: technique.system,
    type: technique.type,
    effects: technique.effects,
    description: technique.description,
  };
}

function getPublicTechniques(playerTechniques) {
  const state = normalizeTechniqueState(playerTechniques);
  const learned = Object.keys(state.learned)
    .map(id => getTechniqueInfo(state, id))
    .filter(Boolean);
  return { equipped: state.equipped, learned };
}

function equipTechnique(playerTechniques, techniqueId, system) {
  const state = normalizeTechniqueState(playerTechniques);
  const technique = getTechnique(techniqueId);
  if (!technique) return { success: false, reason: 'Công pháp không tồn tại.' };
  if (!state.learned[techniqueId]) return { success: false, reason: 'Chưa học công pháp này.' };
  const slot = system || technique.system || 'cultivation';
  if (!['cultivation', 'body', 'soul'].includes(slot)) return { success: false, reason: 'Hệ công pháp không hợp lệ.' };
  if (technique.system && technique.system !== slot) return { success: false, reason: 'Công pháp không phù hợp hệ này.' };
  state.equipped[slot] = techniqueId;
  return { success: true, equipped: state.equipped };
}

function canUpgradeTechnique(playerTechniques, techniqueId, mainCultivation) {
  const state = normalizeTechniqueState(playerTechniques);
  const learned = getLearnedTechnique(state, techniqueId);
  if (!learned) return { ok: false, reason: 'Chưa học công pháp này.' };
  return progression.canUpgrade(
    { id: TECHNIQUE_CONFIG.id, name: TECHNIQUE_CONFIG.name, phases: TECHNIQUE_CONFIG.phases, ranks: BODY_REALMS.ranks },
    learned,
    mainCultivation
  );
}

function upgradeTechnique(playerTechniques, techniqueId, mainCultivation) {
  const state = normalizeTechniqueState(playerTechniques);
  const learned = getLearnedTechnique(state, techniqueId);
  if (!learned) return { success: false, reason: 'Chưa học công pháp này.' };
  const result = progression.applyUpgrade(
    { id: TECHNIQUE_CONFIG.id, name: TECHNIQUE_CONFIG.name, phases: TECHNIQUE_CONFIG.phases, ranks: BODY_REALMS.ranks },
    learned,
    mainCultivation
  );
  if (!result.success) return result;
  state.learned[techniqueId] = { ...learned, ...result.progress };
  return { success: true, technique: state.learned[techniqueId] };
}

module.exports = {
  getTechnique,
  createDefaultTechniques,
  normalizeTechniqueState,
  getLearnedTechnique,
  getTechniqueInfo,
  getPublicTechniques,
  equipTechnique,
  canUpgradeTechnique,
  upgradeTechnique,
};
