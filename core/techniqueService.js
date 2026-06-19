// ============================================
//  CORE - TECHNIQUE SERVICE
//  Logic đọc/nâng Công Pháp
// ============================================

const TECHNIQUE_CONFIG = require('../config/techniques');
const BODY_REALMS = require('../config/bodyRealms');
const progression = require('./progressionService');

function getTechnique(techniqueId) {
    return TECHNIQUE_CONFIG.list.find(item => item.id === techniqueId) || null;
}

function createDefaultTechniques() {
  return {
    equipped: {
      cultivation: 'tho_nap_quyet',
      body: 'man_nguu_luyen_the_quyet',
      soul: 'duong_than_quyet',
    },
    learned: {
      tho_nap_quyet: {
        id: 'tho_nap_quyet',
        rank: 1,
        phase: 1,
        exp: 0,
        maxExp: 100,
      },
      man_nguu_luyen_the_quyet: {
        id: 'man_nguu_luyen_the_quyet',
        rank: 1,
        phase: 1,
        exp: 0,
        maxExp: 100,
      },
      duong_than_quyet: {
        id: 'duong_than_quyet',
        rank: 1,
        phase: 1,
        exp: 0,
        maxExp: 100,
      },
    },
  };
}

function getLearnedTechnique(playerTechniques, techniqueId) {
    if (!playerTechniques || !playerTechniques.learned) return null;
    return playerTechniques.learned[techniqueId] || null;
}

function getTechniqueInfo(playerTechniques, techniqueId) {
    const technique = getTechnique(techniqueId);
    const learned = getLearnedTechnique(playerTechniques, techniqueId);

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
        type: technique.type,
        effects: technique.effects,
        description: technique.description,
    };
}

function canUpgradeTechnique(playerTechniques, techniqueId, mainCultivation) {
    const learned = getLearnedTechnique(playerTechniques, techniqueId);
    if (!learned) {
        return { ok: false, reason: 'Chưa học công pháp này.' };
    }

    return progression.canUpgrade(
        {
            id: TECHNIQUE_CONFIG.id,
            name: TECHNIQUE_CONFIG.name,
            phases: TECHNIQUE_CONFIG.phases,
            ranks: BODY_REALMS.ranks,
        },
        learned,
        mainCultivation
    );
}

function upgradeTechnique(playerTechniques, techniqueId, mainCultivation) {
    const learned = getLearnedTechnique(playerTechniques, techniqueId);
    if (!learned) {
        return { success: false, reason: 'Chưa học công pháp này.' };
    }

    const result = progression.applyUpgrade(
        {
            id: TECHNIQUE_CONFIG.id,
            name: TECHNIQUE_CONFIG.name,
            phases: TECHNIQUE_CONFIG.phases,
            ranks: BODY_REALMS.ranks,
        },
        learned,
        mainCultivation
    );

    if (!result.success) return result;

    playerTechniques.learned[techniqueId] = {
        ...learned,
        ...result.progress,
    };

    return {
        success: true,
        technique: playerTechniques.learned[techniqueId],
    };
}

module.exports = {
    getTechnique,
    createDefaultTechniques,
    getLearnedTechnique,
    getTechniqueInfo,
    canUpgradeTechnique,
    upgradeTechnique,
};
