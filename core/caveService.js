// ============================================
// CORE - CAVE SERVICE
// Logic Động Phủ, công trình, tài nguyên offline
// ============================================

const CAVE_RULES = require('../config/caveRules');
const CAVE_BUILDINGS = require('../config/caveBuildings');

function now() {
    return Date.now();
}

function createDefaultCave() {
    return {
        level: 1,
        resources: {
            aura: 0,
            herbEssence: 0,
            alchemyFire: 0,
        },
        buildings: {
            cave_core: { level: 1 },
            spirit_array: { level: 1 },
            herb_garden: { level: 1 },
            alchemy_room: { level: 1 },
            storage_room: { level: 1 },
        },
        herbPlots: [],
        lastProcessAt: now(),
    };
}

function getBuildingConfig(buildingId) {
    return CAVE_BUILDINGS.find(item => item.id === buildingId) || null;
}

function ensureCave(player) {
    if (!player.cave) player.cave = createDefaultCave();
    if (!player.cave.resources) player.cave.resources = {};
    if (!player.cave.buildings) player.cave.buildings = {};
    if (!player.cave.herbPlots) player.cave.herbPlots = [];
    if (!player.cave.lastProcessAt) player.cave.lastProcessAt = now();

    for (const key of Object.values(CAVE_RULES.resourceTypes)) {
        if (player.cave.resources[key] === undefined) player.cave.resources[key] = 0;
    }
}

function getBuildingLevel(cave, buildingId) {
    return cave?.buildings?.[buildingId]?.level || 0;
}

function getCaveCoreLevel(cave) {
    return getBuildingLevel(cave, 'cave_core') || 1;
}

function getMaxAura(cave) {
    const core = getBuildingConfig('cave_core');
    const coreLevel = getCaveCoreLevel(cave);
    return coreLevel * (core.effectsPerLevel.maxAura || 1000);
}

function getAuraPerSecond(cave) {
    const building = getBuildingConfig('spirit_array');
    const level = getBuildingLevel(cave, 'spirit_array');
    return level * (building.effectsPerLevel.auraPerSecond || 0);
}

function processCave(player, currentTime = now()) {
    ensureCave(player);

    const cave = player.cave;
    const deltaSecondsRaw = Math.floor((currentTime - cave.lastProcessAt) / 1000);
    if (deltaSecondsRaw <= 0) return { processedSeconds: 0, auraGain: 0 };

    const deltaSeconds = Math.min(deltaSecondsRaw, CAVE_RULES.maxOfflineSeconds);
    const auraGain = getAuraPerSecond(cave) * deltaSeconds;
    const maxAura = getMaxAura(cave);

    cave.resources.aura = Math.min(maxAura, cave.resources.aura + auraGain);
    cave.lastProcessAt = currentTime;

    return {
        processedSeconds: deltaSeconds,
        auraGain,
        currentAura: cave.resources.aura,
        maxAura,
    };
}

function getUpgradeCost(buildingId, currentLevel) {
    const config = getBuildingConfig(buildingId);
    if (!config) return null;

    const nextLevel = currentLevel + 1;
    const result = {};

    for (const [currencyId, amount] of Object.entries(config.baseCost || {})) {
        result[currencyId] = Math.ceil(amount * Math.pow(CAVE_RULES.upgradeCostMultiplier, currentLevel - 1));
    }

    return {
        buildingId,
        nextLevel,
        cost: result,
    };
}

function canUpgradeBuilding(player, buildingId) {
    ensureCave(player);

    const config = getBuildingConfig(buildingId);
    if (!config) return { ok: false, reason: 'Không tồn tại công trình.' };

    const level = getBuildingLevel(player.cave, buildingId);
    if (level >= CAVE_RULES.maxBuildingLevel) {
        return { ok: false, reason: 'Công trình đã đạt cấp tối đa.' };
    }

    return {
        ok: true,
        building: config,
        currentLevel: level,
        upgrade: getUpgradeCost(buildingId, Math.max(1, level)),
    };
}

function upgradeBuilding(player, buildingId) {
    const check = canUpgradeBuilding(player, buildingId);
    if (!check.ok) return { success: false, reason: check.reason };

    if (!player.cave.buildings[buildingId]) {
        player.cave.buildings[buildingId] = { level: 0 };
    }

    player.cave.buildings[buildingId].level += 1;

    return {
        success: true,
        buildingId,
        level: player.cave.buildings[buildingId].level,
    };
}

function getAlchemyRoomBonus(cave) {
    const config = getBuildingConfig('alchemy_room');
    const level = getBuildingLevel(cave, 'alchemy_room');

    return {
        successBonusPercent: level * (config.effectsPerLevel.successBonusPercent || 0),
        qualityBonusPercent: level * (config.effectsPerLevel.qualityBonusPercent || 0),
    };
}

module.exports = {
    createDefaultCave,
    ensureCave,
    getBuildingConfig,
    getBuildingLevel,
    getMaxAura,
    getAuraPerSecond,
    processCave,
    getUpgradeCost,
    canUpgradeBuilding,
    upgradeBuilding,
    getAlchemyRoomBonus,
};
