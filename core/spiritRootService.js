// ============================================
//  CORE - SPIRIT ROOT SERVICE
//  Đọc thuộc tính linh căn, tương sinh/tương khắc, tiến hóa linh căn
// ============================================

const ELEMENT_CONFIG = require('../config/spiritRootElements');
const EVOLUTION_CONFIG = require('../config/spiritRootEvolution');
const ITEM_CONFIG = require('../config/spiritRootItems');
const realmService = require('./realmService');

function getElement(elementId) {
    return ELEMENT_CONFIG.elements.find(item => item.id === elementId) || null;
}

function getEvolution(evolutionId) {
    return EVOLUTION_CONFIG.levels.find(item => item.id === evolutionId) || null;
}

function getItem(itemId) {
    return ITEM_CONFIG.items.find(item => item.id === itemId) || null;
}

function createDefaultSpiritRoot() {
    return {
        element: null,
        evolution: null,
        awakenedAt: null,
        history: [],
    };
}

function getSpiritRootDisplay(spiritRoot) {
    if (!spiritRoot || !spiritRoot.element || !spiritRoot.evolution) {
        return {
            awakened: false,
            displayName: 'Chưa ngộ linh căn',
        };
    }

    const element = getElement(spiritRoot.element);
    const evolution = getEvolution(spiritRoot.evolution);

    if (!element || !evolution) {
        return {
            awakened: false,
            displayName: 'Linh căn không hợp lệ',
        };
    }

    return {
        awakened: true,
        elementId: element.id,
        elementName: element.name,
        evolutionId: evolution.id,
        evolutionName: evolution.name,
        displayName: `${element.name} ${evolution.suffix}`,
        group: element.group,
        tags: element.tags || [],
    };
}

function compareWorldOrder(worldA, worldB) {
    const a = realmService.getWorld(worldA);
    const b = realmService.getWorld(worldB);
    if (!a || !b) return 0;
    return a.order - b.order;
}

function isEvolutionUnlocked(evolutionId, cultivation) {
    const evolution = getEvolution(evolutionId);
    if (!evolution) return false;

    const info = realmService.getCurrentRealmInfo(cultivation);
    if (!info) return false;

    if (compareWorldOrder(info.worldId, evolution.unlockWorld) < 0) {
        return false;
    }

    if (evolution.unlockRealmId && info.realmId !== evolution.unlockRealmId) {
        return false;
    }

    return true;
}

function canUseSpiritRootItem(spiritRoot, itemId, cultivation) {
    const item = getItem(itemId);
    if (!item) {
        return { ok: false, reason: 'Item linh căn không tồn tại.' };
    }

    const targetEvolution = getEvolution(item.targetEvolution);
    if (!targetEvolution) {
        return { ok: false, reason: 'Cấp tiến hóa linh căn không tồn tại.' };
    }

    if (!isEvolutionUnlocked(item.targetEvolution, cultivation)) {
        return {
            ok: false,
            reason: `Chưa đạt điều kiện để mở ${targetEvolution.name}.`,
        };
    }

    if (item.targetEvolution === 'normal') {
        if (spiritRoot?.element) {
            return { ok: false, reason: 'Đã ngộ linh căn rồi.' };
        }
        return { ok: true, item, targetEvolution };
    }

    if (!spiritRoot?.element || !spiritRoot?.evolution) {
        return { ok: false, reason: 'Chưa có linh căn cơ sở.' };
    }

    const currentEvolution = getEvolution(spiritRoot.evolution);
    if (!currentEvolution) {
        return { ok: false, reason: 'Linh căn hiện tại không hợp lệ.' };
    }

    if (targetEvolution.order !== currentEvolution.order + 1) {
        return {
            ok: false,
            reason: 'Chỉ có thể nâng linh căn theo đúng thứ tự.',
        };
    }

    return { ok: true, item, targetEvolution };
}

function getGeneratedRelation(fromElementId, toElementId) {
    return ELEMENT_CONFIG.generates.find(item => item.from === fromElementId && item.to === toElementId) || null;
}

function isTargetMatched(relation, targetElementId) {
    if (relation.to === targetElementId) return true;

    if (relation.targetType === 'group') {
        const target = getElement(targetElementId);
        return target && target.group === relation.to;
    }

    return false;
}

function getCounterRelation(fromElementId, toElementId) {
    return ELEMENT_CONFIG.counters.find(item => item.from === fromElementId && isTargetMatched(item, toElementId)) || null;
}

function getElementBattleModifier(attackerElementId, defenderElementId) {
    if (!attackerElementId || !defenderElementId) {
        return {
            damageMultiplier: 1,
            relation: 'neutral',
        };
    }

    const counter = getCounterRelation(attackerElementId, defenderElementId);
    if (counter) {
        return {
            damageMultiplier: 1 + counter.bonus,
            relation: 'counter',
            note: counter.note,
        };
    }

    const reverseCounter = getCounterRelation(defenderElementId, attackerElementId);
    if (reverseCounter) {
        return {
            damageMultiplier: 1 - reverseCounter.penalty,
            relation: 'countered',
            note: reverseCounter.note,
        };
    }

    const generated = getGeneratedRelation(attackerElementId, defenderElementId);
    if (generated) {
        return {
            damageMultiplier: 1 + generated.bonus,
            relation: 'generate',
            note: generated.note,
        };
    }

    return {
        damageMultiplier: 1,
        relation: 'neutral',
    };
}

module.exports = {
    getElement,
    getEvolution,
    getItem,
    createDefaultSpiritRoot,
    getSpiritRootDisplay,
    isEvolutionUnlocked,
    canUseSpiritRootItem,
    getGeneratedRelation,
    getCounterRelation,
    getElementBattleModifier,
};
