// ============================================
// CORE - CAVE SERVICE
// Logic Động Phủ, công trình, tài nguyên offline
// Đã sửa: nâng cấp phải đủ tiền và trừ tiền thật.
// ============================================

const CAVE_RULES = require('../config/caveRules');
const CAVE_BUILDINGS = require('../config/caveBuildings');
const REALM_CONFIG = require('../config/realms');
const currencyService = require('./currencyService');

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

  currencyService.ensureCurrencies(player);
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

function getWorldOrder(worldId) {
  const world = REALM_CONFIG.worlds.find(item => item.id === worldId);
  return world ? world.order : 0;
}

function isWorldUnlocked(playerWorldId, requiredWorldId) {
  if (!requiredWorldId) return true;
  return getWorldOrder(playerWorldId) >= getWorldOrder(requiredWorldId);
}

function getUpgradeCost(buildingId, currentLevel) {
  const config = getBuildingConfig(buildingId);
  if (!config) return null;

  const safeLevel = Math.max(0, Number(currentLevel || 0));
  const nextLevel = safeLevel + 1;
  const result = {};

  for (const [currencyId, amount] of Object.entries(config.baseCost || {})) {
    const exponent = Math.max(0, safeLevel - 1);
    result[currencyId] = Math.ceil(amount * Math.pow(CAVE_RULES.upgradeCostMultiplier, exponent));
  }

  return {
    buildingId,
    nextLevel,
    cost: result,
  };
}

function hasCost(player, cost) {
  currencyService.ensureCurrencies(player);

  for (const [currencyId, amount] of Object.entries(cost || {})) {
    if ((player.currencies[currencyId] || 0) < amount) {
      return {
        ok: false,
        reason: `Không đủ ${currencyId}. Cần ${amount}, hiện có ${player.currencies[currencyId] || 0}.`,
        currencyId,
        need: amount,
        current: player.currencies[currencyId] || 0,
      };
    }
  }

  return { ok: true };
}

function spendCost(player, cost) {
  for (const [currencyId, amount] of Object.entries(cost || {})) {
    const ok = currencyService.spendCurrency(player, currencyId, amount);
    if (!ok) return false;
  }
  return true;
}

function canUpgradeBuilding(player, buildingId) {
  ensureCave(player);

  const config = getBuildingConfig(buildingId);
  if (!config) return { ok: false, reason: 'Không tồn tại công trình.' };

  const requiredWorld = CAVE_RULES.buildingUnlockWorld?.[buildingId] || 'nhan_gioi';
  if (!isWorldUnlocked(player.cultivation?.world || 'nhan_gioi', requiredWorld)) {
    return {
      ok: false,
      reason: `Công trình này mở từ ${requiredWorld}.`,
      requiredWorld,
    };
  }

  const level = getBuildingLevel(player.cave, buildingId);

  if (level >= CAVE_RULES.maxBuildingLevel) {
    return { ok: false, reason: 'Công trình đã đạt cấp tối đa.' };
  }

  // Công trình khác không được vượt quá cấp Động Phủ.
  const coreLevel = getCaveCoreLevel(player.cave);
  if (buildingId !== 'cave_core' && level >= coreLevel) {
    return {
      ok: false,
      reason: 'Cấp công trình không được vượt quá cấp Động Phủ.',
      currentLevel: level,
      caveCoreLevel: coreLevel,
    };
  }

  const upgrade = getUpgradeCost(buildingId, level);
  const costCheck = hasCost(player, upgrade.cost);
  if (!costCheck.ok) {
    return {
      ok: false,
      reason: costCheck.reason,
      currentLevel: level,
      upgrade,
      costCheck,
    };
  }

  return {
    ok: true,
    building: config,
    currentLevel: level,
    upgrade,
  };
}

function upgradeBuilding(player, buildingId) {
  const check = canUpgradeBuilding(player, buildingId);
  if (!check.ok) return { success: false, reason: check.reason, check };

  if (!spendCost(player, check.upgrade.cost)) {
    return { success: false, reason: 'Trừ chi phí thất bại.', check };
  }

  if (!player.cave.buildings[buildingId]) {
    player.cave.buildings[buildingId] = { level: 0 };
  }

  player.cave.buildings[buildingId].level += 1;

  if (buildingId === 'cave_core') {
    player.cave.level = player.cave.buildings[buildingId].level;
  }

  return {
    success: true,
    buildingId,
    level: player.cave.buildings[buildingId].level,
    spent: check.upgrade.cost,
    message: `Nâng cấp ${check.building.name} lên cấp ${player.cave.buildings[buildingId].level}.`,
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
