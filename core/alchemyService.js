// ============================================
//  CORE - ALCHEMY SERVICE
//  Luyện đan: nguyên liệu -> đan dược có phẩm chất
// ============================================

const ALCHEMY_RULES = require('../config/alchemyRules');
const HERBS = require('../config/herbs');
const PILL_RECIPES = require('../config/pillRecipes');
const PILLS = require('../config/pills');

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getHerb(herbId) {
    return HERBS.find(item => item.id === herbId) || null;
}

function getPill(pillId) {
    return PILLS.find(item => item.id === pillId) || null;
}

function getRecipe(recipeId) {
    return PILL_RECIPES.find(item => item.id === recipeId) || null;
}

function getRecipeByPillId(pillId) {
    return PILL_RECIPES.find(item => item.pillId === pillId) || null;
}

function getRecipesByRealm(worldId, realmId) {
    return PILL_RECIPES.filter(item => item.world === worldId && item.realm === realmId);
}

function ensureInventory(player) {
    if (!player.inventory) player.inventory = [];
}

function getInventoryAmount(player, itemId) {
    ensureInventory(player);
    const item = player.inventory.find(i => i.id === itemId);
    return item ? item.amount : 0;
}

function addInventoryItem(player, id, name, amount, extra = {}) {
    ensureInventory(player);

    // Đan có phẩm chất khác nhau không stack chung nếu quality khác.
    const quality = extra.quality || null;
    const existing = player.inventory.find(i => i.id === id && (i.quality || null) === quality);

    if (existing) {
        existing.amount += amount;
        return existing;
    }

    const item = { id, name, amount, ...extra };
    player.inventory.push(item);
    return item;
}

function spendInventoryItem(player, id, amount) {
    ensureInventory(player);
    const item = player.inventory.find(i => i.id === id);
    if (!item || item.amount < amount) return false;

    item.amount -= amount;
    if (item.amount <= 0) {
        player.inventory = player.inventory.filter(i => i !== item);
    }
    return true;
}

function hasMaterials(player, recipe) {
    const missing = [];

    for (const material of recipe.materials) {
        const current = getInventoryAmount(player, material.id);
        if (current < material.amount) {
            missing.push({
                id: material.id,
                name: getHerb(material.id)?.name || material.id,
                need: material.amount,
                have: current,
            });
        }
    }

    return {
        ok: missing.length === 0,
        missing,
    };
}

function spendMaterials(player, recipe) {
    const check = hasMaterials(player, recipe);
    if (!check.ok) return false;

    for (const material of recipe.materials) {
        spendInventoryItem(player, material.id, material.amount);
    }

    return true;
}

function getPlayerAlchemyRank(player) {
    return player.alchemy?.rank || 1;
}

function getSuccessRate(recipe, player) {
    const base = ALCHEMY_RULES.categorySuccessRate[recipe.category] || 0.5;
    const alchemyRank = getPlayerAlchemyRank(player);
    const diff = alchemyRank - recipe.requiredAlchemyRank;

    let rate = base;
    if (diff >= 0) {
        rate += diff * ALCHEMY_RULES.successBonusPerRank;
    } else {
        rate += diff * ALCHEMY_RULES.successPenaltyPerRank;
    }

    return clamp(rate, ALCHEMY_RULES.minSuccessRate, ALCHEMY_RULES.maxSuccessRate);
}

function rollQuality(player, recipe) {
    const alchemyRank = getPlayerAlchemyRank(player);
    const diff = alchemyRank - recipe.requiredAlchemyRank;

    let rates = { ...ALCHEMY_RULES.baseQualityRate };

    // Cao hơn yêu cầu thì tăng cơ hội tốt/cực phẩm.
    if (diff > 0) {
        rates.cuc_pham += diff * 0.025;
        rates.tot += diff * 0.035;
        rates.thuong -= diff * 0.060;
    }

    // Thấp hơn yêu cầu thì gần như chỉ ra thường.
    if (diff < 0) {
        rates.cuc_pham += diff * 0.020;
        rates.tot += diff * 0.030;
        rates.thuong -= diff * 0.050;
    }

    rates.cuc_pham = clamp(rates.cuc_pham, 0.01, 0.50);
    rates.tot = clamp(rates.tot, 0.05, 0.75);
    rates.thuong = clamp(rates.thuong, 0.10, 0.90);

    const total = rates.thuong + rates.tot + rates.cuc_pham;
    const r = Math.random() * total;

    if (r < rates.cuc_pham) return getQuality('cuc_pham');
    if (r < rates.cuc_pham + rates.tot) return getQuality('tot');
    return getQuality('thuong');
}

function getQuality(qualityId) {
    return ALCHEMY_RULES.qualities.find(item => item.id === qualityId) || ALCHEMY_RULES.qualities[0];
}

function craftPill(player, recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) {
        return { success: false, reason: 'Không tìm thấy công thức luyện đan.' };
    }

    const pill = getPill(recipe.pillId);
    if (!pill) {
        return { success: false, reason: 'Không tìm thấy đan dược tương ứng.' };
    }

    const materialCheck = hasMaterials(player, recipe);
    if (!materialCheck.ok) {
        return {
            success: false,
            reason: 'Không đủ nguyên liệu.',
            missing: materialCheck.missing,
        };
    }

    spendMaterials(player, recipe);

    const successRate = getSuccessRate(recipe, player);
    const successRoll = Math.random();

    if (successRoll > successRate) {
        return {
            success: false,
            reason: 'Luyện đan thất bại.',
            successRate,
            roll: successRoll,
        };
    }

    const quality = rollQuality(player, recipe);
    const finalPillId = `${pill.id}_${quality.id}`;
    const finalPillName = `${pill.name} [${quality.name}]`;

    const item = addInventoryItem(player, finalPillId, finalPillName, recipe.resultAmount || 1, {
        basePillId: pill.id,
        quality: quality.id,
        qualityName: quality.name,
        effectMultiplier: quality.effectMultiplier,
        category: pill.category,
    });

    return {
        success: true,
        pill: item,
        basePill: pill,
        quality,
        successRate,
        roll: successRoll,
    };
}

function createDefaultAlchemy() {
    return {
        rank: 1,
        exp: 0,
        maxExp: 100,
    };
}

module.exports = {
    getHerb,
    getPill,
    getRecipe,
    getRecipeByPillId,
    getRecipesByRealm,
    getInventoryAmount,
    addInventoryItem,
    hasMaterials,
    spendMaterials,
    getPlayerAlchemyRank,
    getSuccessRate,
    getQuality,
    rollQuality,
    craftPill,
    createDefaultAlchemy,
};
