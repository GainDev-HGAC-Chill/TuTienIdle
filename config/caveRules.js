// ============================================
// CONFIG - CAVE RULES
// Quy tắc chung cho Động Phủ
// ============================================

const CAVE_RULES = {
    maxOfflineSeconds: 24 * 60 * 60,

    resourceTypes: {
        aura: 'aura',          // Linh khí / tiên khí / nguyên khí / đạo khí theo cảnh giới
        herbEssence: 'herbEssence',
        alchemyFire: 'alchemyFire',
    },

    // Tên tài nguyên hiển thị theo thế giới hiện tại
    worldResourceNames: {
        nhan_gioi: 'Linh Khí',
        tien_gioi: 'Tiên Khí',
        nguyen_gioi: 'Nguyên Khí',
        dao_gioi: 'Đạo Khí',
        chung_cuc_gioi: 'Chung Cực Khí',
    },

    upgradeCostMultiplier: 1.35,
    maxBuildingLevel: 100,

    buildingUnlockWorld: {
        cave_core: 'nhan_gioi',
        spirit_array: 'nhan_gioi',
        herb_garden: 'nhan_gioi',
        alchemy_room: 'nhan_gioi',
        storage_room: 'nhan_gioi',
        beast_yard: 'tien_gioi',
        artifact_room: 'tien_gioi',
        dao_platform: 'dao_gioi',
    },
};

module.exports = CAVE_RULES;
