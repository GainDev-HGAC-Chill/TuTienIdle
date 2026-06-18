// ============================================
//  CORE - BODY SERVICE
//  Logic đọc/nâng Luyện Thể
// ============================================

const BODY_REALMS = require('../config/bodyRealms');
const progression = require('./progressionService');

function createDefaultBodyCultivation() {
    return progression.createDefaultProgress();
}

function getBodyInfo(bodyCultivation) {
    return progression.getDisplayInfo(BODY_REALMS, bodyCultivation);
}

function getNextBodyInfo(bodyCultivation) {
    return progression.getNextProgress(BODY_REALMS, bodyCultivation);
}

function canUpgradeBody(bodyCultivation, mainCultivation) {
    return progression.canUpgrade(BODY_REALMS, bodyCultivation, mainCultivation);
}

function upgradeBody(bodyCultivation, mainCultivation) {
    return progression.applyUpgrade(BODY_REALMS, bodyCultivation, mainCultivation);
}

module.exports = {
    createDefaultBodyCultivation,
    getBodyInfo,
    getNextBodyInfo,
    canUpgradeBody,
    upgradeBody,
};
