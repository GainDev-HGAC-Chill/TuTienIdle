// ============================================
//  CORE - SOUL SERVICE
//  Logic đọc/nâng Luyện Hồn
// ============================================

const SOUL_REALMS = require('../config/soulRealms');
const progression = require('./progressionService');

function createDefaultSoulCultivation() {
    return progression.createDefaultProgress();
}

function getSoulInfo(soulCultivation) {
    return progression.getDisplayInfo(SOUL_REALMS, soulCultivation);
}

function getNextSoulInfo(soulCultivation) {
    return progression.getNextProgress(SOUL_REALMS, soulCultivation);
}

function canUpgradeSoul(soulCultivation, mainCultivation) {
    return progression.canUpgrade(SOUL_REALMS, soulCultivation, mainCultivation);
}

function upgradeSoul(soulCultivation, mainCultivation) {
    return progression.applyUpgrade(SOUL_REALMS, soulCultivation, mainCultivation);
}

module.exports = {
    createDefaultSoulCultivation,
    getSoulInfo,
    getNextSoulInfo,
    canUpgradeSoul,
    upgradeSoul,
};
