// ============================================
//  CORE - PROGRESSION SERVICE
//  Service chung cho Luyện Thể, Luyện Hồn, Công Pháp, Vũ Kỹ
// ============================================

const realmService = require('./realmService');

function normalizeProgress(progress) {
    return {
        rank: progress?.rank || 1,
        phase: progress?.phase || 1,
        exp: progress?.exp || 0,
        maxExp: progress?.maxExp || 100,
    };
}

function getPhase(config, phaseIndex) {
    const phases = config.phases || [];
    return phases[(phaseIndex || 1) - 1] || phases[0] || null;
}

function getRank(config, rank) {
    return (config.ranks || []).find(item => item.rank === rank) || null;
}

function getMaxRank(config) {
    if (!config.ranks || config.ranks.length === 0) return 1;
    return Math.max(...config.ranks.map(item => item.rank));
}

function getDisplayInfo(config, progress) {
    const current = normalizeProgress(progress);
    const rankInfo = getRank(config, current.rank);
    const phaseInfo = getPhase(config, current.phase);

    if (!rankInfo) {
        return {
            systemId: config.id,
            systemName: config.name,
            rank: current.rank,
            phase: current.phase,
            name: 'Không rõ',
            phaseName: phaseInfo?.name || '',
            displayName: 'Không rõ',
            exp: current.exp,
            maxExp: current.maxExp,
        };
    }

    return {
        systemId: config.id,
        systemName: config.name,
        rank: current.rank,
        phase: current.phase,
        name: rankInfo.name,
        world: rankInfo.world,
        realmId: rankInfo.realmId,
        phaseName: phaseInfo?.name || '',
        displayName: `${rankInfo.name} ${phaseInfo?.name || ''}`.trim(),
        exp: current.exp,
        maxExp: current.maxExp,
    };
}

function getNextProgress(config, progress) {
    const current = normalizeProgress(progress);
    const phaseCount = (config.phases || []).length || 1;
    const maxRank = getMaxRank(config);

    if (current.phase < phaseCount) {
        return {
            type: 'phase',
            rank: current.rank,
            phase: current.phase + 1,
        };
    }

    if (current.rank < maxRank) {
        return {
            type: 'rank',
            rank: current.rank + 1,
            phase: 1,
        };
    }

    return {
        type: 'max',
        message: `Đã đạt cấp tối đa của ${config.name}.`,
    };
}

function canFollowMainRealm(config, progress, cultivation) {
    const current = normalizeProgress(progress);
    const info = realmService.getCurrentRealmInfo(cultivation);
    if (!info) return false;

    const targetRank = getRank(config, current.rank);
    if (!targetRank) return false;

    // Chỉ cho phép rank phụ tối đa bằng cảnh giới chính hiện tại.
    // Ví dụ: cảnh giới chính đang ở Tiên Giới Bán Tiên thì phụ tu được rank 9 trở xuống.
    const currentMainRank = getRankByRealm(config, info.worldId, info.realmId);
    if (!currentMainRank) return false;

    return current.rank <= currentMainRank.rank;
}

function getRankByRealm(config, worldId, realmId) {
    return (config.ranks || []).find(item => item.world === worldId && item.realmId === realmId) || null;
}

function getMaxAllowedRankByCultivation(config, cultivation) {
    const info = realmService.getCurrentRealmInfo(cultivation);
    if (!info) return 1;

    const rankInfo = getRankByRealm(config, info.worldId, info.realmId);
    return rankInfo ? rankInfo.rank : 1;
}

function canUpgrade(config, progress, cultivation) {
    const current = normalizeProgress(progress);
    const next = getNextProgress(config, current);

    if (next.type === 'max') {
        return {
            ok: false,
            reason: next.message,
            next,
        };
    }

    const maxAllowedRank = getMaxAllowedRankByCultivation(config, cultivation);

    if (next.rank > maxAllowedRank) {
        return {
            ok: false,
            reason: `${config.name} không thể vượt quá cảnh giới chính hiện tại.`,
            next,
            maxAllowedRank,
        };
    }

    return {
        ok: true,
        next,
        maxAllowedRank,
    };
}

function applyUpgrade(config, progress, cultivation) {
    const check = canUpgrade(config, progress, cultivation);
    if (!check.ok) {
        return {
            success: false,
            reason: check.reason,
            progress: normalizeProgress(progress),
        };
    }

    return {
        success: true,
        progress: {
            rank: check.next.rank,
            phase: check.next.phase,
            exp: 0,
            maxExp: progress?.maxExp || 100,
        },
    };
}

function createDefaultProgress() {
    return {
        rank: 1,
        phase: 1,
        exp: 0,
        maxExp: 100,
    };
}

module.exports = {
    normalizeProgress,
    getPhase,
    getRank,
    getMaxRank,
    getDisplayInfo,
    getNextProgress,
    canFollowMainRealm,
    getRankByRealm,
    getMaxAllowedRankByCultivation,
    canUpgrade,
    applyUpgrade,
    createDefaultProgress,
};
