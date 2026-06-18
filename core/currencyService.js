// ============================================
//  CORE - CURRENCY SERVICE
//  Hàm cộng/trừ tiền tệ, dùng object currencies trong player
// ============================================

const CURRENCY_CONFIG = require('../config/currencies');

function getCurrency(currencyId) {
    for (const group of CURRENCY_CONFIG.groups) {
        const found = group.currencies.find(currency => currency.id === currencyId);
        if (found) {
            return {
                ...found,
                groupId: group.id,
                groupName: group.name,
                world: group.world,
            };
        }
    }
    return null;
}

function ensureCurrencies(player) {
    if (!player.currencies) player.currencies = {};

    for (const group of CURRENCY_CONFIG.groups) {
        for (const currency of group.currencies) {
            if (player.currencies[currency.id] === undefined) {
                player.currencies[currency.id] = 0;
            }
        }
    }
}

function addCurrency(player, currencyId, amount) {
    const currency = getCurrency(currencyId);
    if (!currency) return false;

    ensureCurrencies(player);
    player.currencies[currencyId] += Math.max(0, amount);
    return true;
}

function spendCurrency(player, currencyId, amount) {
    const currency = getCurrency(currencyId);
    if (!currency) return false;

    ensureCurrencies(player);
    if (player.currencies[currencyId] < amount) return false;

    player.currencies[currencyId] -= amount;
    return true;
}

function getWorldCurrencies(worldId) {
    const group = CURRENCY_CONFIG.groups.find(item => item.world === worldId);
    return group ? group.currencies : [];
}

module.exports = {
    getCurrency,
    ensureCurrencies,
    addCurrency,
    spendCurrency,
    getWorldCurrencies,
};
