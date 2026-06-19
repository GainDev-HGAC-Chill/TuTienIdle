// ============================================
// CORE - HERB GARDEN SERVICE
// Logic trồng/thu hoạch linh dược trong Dược Viên
// ============================================

const HERBS = require('../config/herbs');
const HERB_GARDEN_RULES = require('../config/herbGardenRules');
const caveService = require('./caveService');

function now() {
    return Date.now();
}

function getHerb(herbId) {
    return HERBS.find(item => item.id === herbId) || null;
}

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function getPlotCount(player) {
    caveService.ensureCave(player);
    const gardenLevel = caveService.getBuildingLevel(player.cave, 'herb_garden') || 1;
    const extra = Math.floor(gardenLevel / HERB_GARDEN_RULES.plotEveryGardenLevel);
    return Math.min(HERB_GARDEN_RULES.maxPlots, HERB_GARDEN_RULES.basePlots + extra);
}

function getGrowSpeedBonus(player) {
    const building = caveService.getBuildingConfig('herb_garden');
    const gardenLevel = caveService.getBuildingLevel(player.cave, 'herb_garden') || 1;
    return gardenLevel * (building.effectsPerLevel.growSpeedPercent || 0);
}

function getEffectiveGrowSeconds(player, herb) {
    const bonus = getGrowSpeedBonus(player);
    return Math.max(1, Math.floor(herb.growSeconds / (1 + bonus / 100)));
}

function getPlots(player, currentTime = now()) {
    caveService.ensureCave(player);
    const maxPlots = getPlotCount(player);
    const plots = [];

    for (let i = 0; i < maxPlots; i++) {
        const plot = player.cave.herbPlots[i] || null;
        if (!plot) {
            plots.push({ index: i, empty: true });
            continue;
        }

        const herb = getHerb(plot.herbId);
        const growSeconds = herb ? getEffectiveGrowSeconds(player, herb) : 0;
        const elapsed = Math.floor((currentTime - plot.plantedAt) / 1000);
        const ready = herb ? elapsed >= growSeconds : false;

        plots.push({
            index: i,
            empty: false,
            herbId: plot.herbId,
            herbName: herb?.name || plot.herbId,
            plantedAt: plot.plantedAt,
            growSeconds,
            elapsed,
            ready,
        });
    }

    return plots;
}

function plantHerb(player, plotIndex, herbId, currentTime = now()) {
    caveService.ensureCave(player);

    const maxPlots = getPlotCount(player);
    if (plotIndex < 0 || plotIndex >= maxPlots) {
        return { success: false, reason: 'Ô trồng không tồn tại.' };
    }

    const herb = getHerb(herbId);
    if (!herb) return { success: false, reason: 'Linh dược không tồn tại.' };

    if (player.cave.herbPlots[plotIndex]) {
        return { success: false, reason: 'Ô này đã có linh dược.' };
    }

    player.cave.herbPlots[plotIndex] = {
        herbId,
        plantedAt: currentTime,
    };

    return {
        success: true,
        plotIndex,
        herbId,
        herbName: herb.name,
        growSeconds: getEffectiveGrowSeconds(player, herb),
    };
}

function harvestHerb(player, plotIndex, currentTime = now()) {
    caveService.ensureCave(player);

    const plot = player.cave.herbPlots[plotIndex];
    if (!plot) return { success: false, reason: 'Ô này đang trống.' };

    const herb = getHerb(plot.herbId);
    if (!herb) return { success: false, reason: 'Linh dược không tồn tại.' };

    const growSeconds = getEffectiveGrowSeconds(player, herb);
    const elapsed = Math.floor((currentTime - plot.plantedAt) / 1000);

    if (elapsed < growSeconds) {
        return {
            success: false,
            reason: 'Linh dược chưa chín.',
            remainingSeconds: growSeconds - elapsed,
        };
    }

    const amount = randomInt(herb.yield[0], herb.yield[1]);
    player.cave.herbPlots[plotIndex] = null;

    if (!player.inventory) player.inventory = [];
    const existing = player.inventory.find(item => item.id === herb.id);
    if (existing) existing.amount += amount;
    else player.inventory.push({ id: herb.id, name: herb.name, amount });

    return {
        success: true,
        herbId: herb.id,
        herbName: herb.name,
        amount,
    };
}

module.exports = {
    getHerb,
    getPlotCount,
    getGrowSpeedBonus,
    getEffectiveGrowSeconds,
    getPlots,
    plantHerb,
    harvestHerb,
};
