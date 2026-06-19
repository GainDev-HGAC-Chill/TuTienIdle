// ============================================
// CORE - TECHNIQUE SERVICE
// Công pháp: mặc định 3 hệ, mỗi hệ trang bị 1 cuốn.
// ============================================
const CONFIG = require('../config/techniques');

function getAllTechniques() {
  return CONFIG.list || [];
}

function getTechniqueById(id) {
  return getAllTechniques().find(item => item.id === id) || null;
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

function createDefaultTechniques() {
  const learned = getAllTechniques().map(makeLearnedItem);
  return {
    equipped: {
      cultivation: 'tho_nap_quyet',
      body: 'man_nguu_luyen_the_quyet',
      soul: 'duong_than_quyet',
    },
    learned,
  };
}

function normalizeTechniques(state) {
  const defaults = createDefaultTechniques();
  if (!state || typeof state !== 'object') return defaults;

  let learned = [];
  if (Array.isArray(state.learned)) {
    learned = state.learned.map(item => {
      const config = getTechniqueById(item.id) || item;
      return { ...config, ...item };
    });
  } else if (state.learned && typeof state.learned === 'object') {
    learned = Object.values(state.learned).map(item => {
      const config = getTechniqueById(item.id) || item;
      return { ...config, ...item };
    });
  }

  for (const item of defaults.learned) {
    if (!learned.some(x => x.id === item.id)) learned.push(item);
  }

  const equipped = { ...(state.equipped || {}) };
  for (const item of learned) {
    const system = item.system || item.type || 'cultivation';
    if (!equipped[system]) equipped[system] = item.id;
  }

  return { equipped, learned };
}

function equipTechnique(state, techniqueId, system) {
  const normalized = normalizeTechniques(state);
  const item = normalized.learned.find(x => x.id === techniqueId);
  if (!item) return { success: false, error: 'Chưa học công pháp này.' };
  const slot = system || item.system || item.type || 'cultivation';
  normalized.equipped[slot] = item.id;
  return { success: true, techniques: normalized, message: `Đã vận chuyển ${item.name}.` };
}

function getEquippedTechniqueEffects(state) {
  const normalized = normalizeTechniques(state);
  const effects = {};
  for (const id of Object.values(normalized.equipped || {})) {
    const item = normalized.learned.find(x => x.id === id) || getTechniqueById(id);
    if (!item || !item.effects) continue;
    for (const [key, value] of Object.entries(item.effects)) {
      effects[key] = (effects[key] || 0) + Number(value || 0);
    }
  }
  return effects;
}

module.exports = {
  getAllTechniques,
  getTechniqueById,
  createDefaultTechniques,
  normalizeTechniques,
  equipTechnique,
  getEquippedTechniqueEffects,
};
