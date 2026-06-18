// ============================================
// CORE - PILL SERVICE
// Logic đọc và dùng đan dược, hỗ trợ đan có phẩm chất
// ============================================

const PILLS = require('../config/pills');

function getPill(pillId) {
    return PILLS.find(item => item.id === pillId) || null;
}

function getBasePillFromInventoryItem(item) {
    if (!item) return null;
    return getPill(item.basePillId || item.id);
}

function getPillsByWorld(worldId) {
    return PILLS.filter(item => item.world === worldId);
}

function getPillsByRealm(worldId, realmId) {
    return PILLS.filter(item => item.world === worldId && item.realm === realmId);
}

function getPillsByCategory(category) {
    return PILLS.filter(item => item.category === category);
}

function ensurePillState(player) {
    if (!player.activePillBuffs) player.activePillBuffs = [];
    if (!player.breakthroughPillLock) player.breakthroughPillLock = null;
}

function findInventoryItem(player, itemId) {
    if (!player.inventory) player.inventory = [];
    return player.inventory.find(entry => entry.id === itemId) || null;
}

function consumeInventoryItem(player, itemId, amount = 1) {
    if (!player.inventory) player.inventory = [];
    const index = player.inventory.findIndex(entry => entry.id === itemId);
    if (index < 0) return false;

    const item = player.inventory[index];
    if (item.amount < amount) return false;

    item.amount -= amount;
    if (item.amount <= 0) player.inventory.splice(index, 1);
    return true;
}

function scaleEffects(effects, multiplier = 1) {
    const result = {};
    for (const [key, value] of Object.entries(effects || {})) {
        result[key] = typeof value === 'number' ? value * multiplier : value;
    }
    return result;
}

function canUsePill(player, itemId) {
    const item = findInventoryItem(player, itemId);
    if (!item) return { ok: false, reason: 'Không có đan dược trong túi.' };

    const pill = getBasePillFromInventoryItem(item);
    if (!pill) return { ok: false, reason: 'Không tìm thấy dữ liệu đan dược.' };

    ensurePillState(player);

    if (pill.category === 'breakthrough') {
        if (player.breakthroughPillLock && player.breakthroughPillLock.used) {
            return {
                ok: false,
                reason: 'Lần đột phá hiện tại đã dùng đan đột phá. Thất bại hoặc sang cảnh giới mới mới được dùng lại.',
            };
        }
    }

    return { ok: true, pill, item };
}

function applyTimedBuff(player, pill, item) {
    ensurePillState(player);

    const multiplier = item.effectMultiplier || 1;
    const now = Date.now();
    const expireAt = now + (pill.durationSeconds || 0) * 1000;
    const buffId = item.id;
    const existing = player.activePillBuffs.find(buff => buff.buffId === buffId);
    const effects = scaleEffects(pill.effects || {}, multiplier);

    if (existing) {
        existing.expireAt = expireAt;
        existing.effects = effects;
        return;
    }

    player.activePillBuffs.push({
        buffId,
        pillId: pill.id,
        itemId: item.id,
        name: item.name || pill.name,
        category: pill.category,
        quality: item.quality || null,
        qualityName: item.qualityName || null,
        effectMultiplier: multiplier,
        effects,
        startedAt: now,
        expireAt,
    });
}

function usePill(player, itemId) {
    const check = canUsePill(player, itemId);
    if (!check.ok) return { success: false, reason: check.reason };

    const { pill, item } = check;
    if (!consumeInventoryItem(player, itemId, 1)) {
        return { success: false, reason: 'Trừ vật phẩm thất bại.' };
    }

    ensurePillState(player);

    if (pill.category === 'breakthrough') {
        player.breakthroughPillLock = {
            pillId: pill.id,
            itemId: item.id,
            pillName: item.name || pill.name,
            world: pill.world,
            realm: pill.realm,
            daoEntryMethod: pill.daoEntryMethod || null,
            quality: item.quality || null,
            effectMultiplier: item.effectMultiplier || 1,
            used: true,
            usedAt: Date.now(),
        };

        return {
            success: true,
            type: 'breakthrough_lock',
            message: `Đã dùng ${item.name || pill.name}. Lần đột phá này không thể dùng thêm đan đột phá khác.`,
            pill,
            item,
        };
    }

    if (pill.durationSeconds > 0) {
        applyTimedBuff(player, pill, item);
        return {
            success: true,
            type: 'buff',
            message: `Đã dùng ${item.name || pill.name}, hiệu lực ${pill.durationSeconds} giây.`,
            pill,
            item,
        };
    }

    return {
        success: true,
        type: 'instant',
        message: `Đã dùng ${item.name || pill.name}.`,
        pill,
        item,
    };
}

function clearExpiredPillBuffs(player, now = Date.now()) {
    ensurePillState(player);
    player.activePillBuffs = player.activePillBuffs.filter(buff => !buff.expireAt || buff.expireAt > now);
}

function clearBreakthroughPillLock(player) {
    ensurePillState(player);
    player.breakthroughPillLock = null;
}

function onBreakthroughResult(player, success) {
    clearBreakthroughPillLock(player);
    return { success: true, breakthroughSuccess: !!success };
}

function getActivePillEffects(player) {
    ensurePillState(player);
    clearExpiredPillBuffs(player);

    const total = {};
    for (const buff of player.activePillBuffs) {
        for (const [key, value] of Object.entries(buff.effects || {})) {
            if (typeof value === 'number') {
                total[key] = (total[key] || 0) + value;
            }
        }
    }
    return total;
}

module.exports = {
    getPill,
    getPillsByWorld,
    getPillsByRealm,
    getPillsByCategory,
    ensurePillState,
    canUsePill,
    usePill,
    clearExpiredPillBuffs,
    clearBreakthroughPillLock,
    onBreakthroughResult,
    getActivePillEffects,
};
