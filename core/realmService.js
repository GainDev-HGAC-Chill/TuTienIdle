// ============================================
//  CORE - REALM SERVICE
//  Hàm đọc cảnh giới từ config, không xử lý game tick ở đây
// ============================================

const REALM_CONFIG = require('../config/realms');

function getWorld(worldId) {
    return REALM_CONFIG.worlds.find(world => world.id === worldId) || null;
}

function getRealm(worldId, realmIndex) {
    const world = getWorld(worldId);
    if (!world || !world.realms[realmIndex]) return null;
    return world.realms[realmIndex];
}

function getCurrentRealmInfo(cultivation) {
    const world = getWorld(cultivation.world);
    if (!world) return null;

    const realm = getRealm(cultivation.world, cultivation.realmIndex);
    if (!realm) return null;

    return {
        worldId: world.id,
        worldName: world.name,
        realmId: realm.id,
        realmName: realm.name,
        realmIndex: cultivation.realmIndex,
        stage: cultivation.stage,
        maxStage: realm.stages,
        stageName: realm.stageName || 'Tầng',
        displayName: `${realm.name} ${cultivation.stage}/${realm.stages}`,
        requiredItem: realm.requiredItem || null,
        note: realm.note || null,
    };
}

function getNextRealmInfo(cultivation) {
    const world = getWorld(cultivation.world);
    if (!world) return null;

    const currentRealm = getRealm(cultivation.world, cultivation.realmIndex);
    if (!currentRealm) return null;

    if (cultivation.stage < currentRealm.stages) {
        return {
            type: 'stage',
            worldId: world.id,
            realmIndex: cultivation.realmIndex,
            stage: cultivation.stage + 1,
        };
    }

    if (cultivation.realmIndex + 1 < world.realms.length) {
        const nextRealm = world.realms[cultivation.realmIndex + 1];
        return {
            type: 'realm',
            worldId: world.id,
            realmIndex: cultivation.realmIndex + 1,
            stage: 1,
            realmId: nextRealm.id,
            realmName: nextRealm.name,
            requiredItem: nextRealm.requiredItem || null,
        };
    }

    const nextWorld = REALM_CONFIG.worlds.find(item => item.order === world.order + 1);
    if (!nextWorld) {
        return {
            type: 'max',
            message: 'Đã đạt cảnh giới cuối cùng hiện tại.',
        };
    }

    return {
        type: 'world',
        worldId: nextWorld.id,
        worldName: nextWorld.name,
        realmIndex: 0,
        stage: 1,
        requireDaoEntry: world.id === 'nguyen_gioi',
    };
}

function createDefaultCultivation() {
    return {
        world: 'nhan_gioi',
        realmIndex: 0,
        stage: 1,
        tuVi: 0,
        maxTuVi: 100,
        daoEntry: null,
    };
}

module.exports = {
    getWorld,
    getRealm,
    getCurrentRealmInfo,
    getNextRealmInfo,
    createDefaultCultivation,
};
