// ============================================
// CONFIG - CAVE BUILDINGS
// Công trình trong Động Phủ
// ============================================

const CAVE_BUILDINGS = [
    {
        id: 'cave_core',
        name: 'Động Phủ',
        type: 'core',
        desc: 'Trung tâm động phủ, cấp càng cao càng mở thêm công trình và giới hạn tài nguyên.',
        baseCost: { so_linh_thach: 100 },
        effectsPerLevel: {
            maxAura: 1000,
            maxStorage: 50,
        },
    },
    {
        id: 'spirit_array',
        name: 'Tụ Linh Trận',
        type: 'resource_generator',
        desc: 'Tự động hấp thu linh khí/tiên khí/nguyên khí theo thời gian, kể cả offline.',
        baseCost: { so_linh_thach: 80 },
        effectsPerLevel: {
            auraPerSecond: 1,
        },
    },
    {
        id: 'herb_garden',
        name: 'Dược Viên',
        type: 'herb_garden',
        desc: 'Trồng linh dược, dùng làm nguyên liệu luyện đan.',
        baseCost: { so_linh_thach: 120 },
        effectsPerLevel: {
            plotEveryLevel: 5,
            growSpeedPercent: 1,
        },
    },
    {
        id: 'alchemy_room',
        name: 'Luyện Đan Phòng',
        type: 'alchemy_bonus',
        desc: 'Tăng tỷ lệ luyện đan thành công và tăng xác suất ra đan tốt/cực phẩm.',
        baseCost: { so_linh_thach: 150 },
        effectsPerLevel: {
            successBonusPercent: 0.5,
            qualityBonusPercent: 0.3,
        },
    },
    {
        id: 'storage_room',
        name: 'Tàng Khố',
        type: 'storage',
        desc: 'Tăng giới hạn chứa linh dược, đan dược và nguyên liệu.',
        baseCost: { so_linh_thach: 100 },
        effectsPerLevel: {
            maxStorage: 100,
        },
    },
    {
        id: 'beast_yard',
        name: 'Linh Thú Viên',
        type: 'beast',
        desc: 'Nuôi linh thú, mở sau khi lên Tiên Giới.',
        baseCost: { so_tien_thach: 100 },
        effectsPerLevel: {
            beastExpBonusPercent: 1,
        },
    },
    {
        id: 'artifact_room',
        name: 'Luyện Khí Phòng',
        type: 'artifact',
        desc: 'Rèn pháp bảo và thần binh, mở sau khi lên Tiên Giới.',
        baseCost: { so_tien_thach: 150 },
        effectsPerLevel: {
            forgeSuccessBonusPercent: 0.5,
        },
    },
    {
        id: 'dao_platform',
        name: 'Ngộ Đạo Đài',
        type: 'dao',
        desc: 'Tăng tốc lĩnh ngộ đạo ý, mở sau khi vào Đạo Giới.',
        baseCost: { so_dao_thach: 100 },
        effectsPerLevel: {
            daoComprehensionBonusPercent: 1,
        },
    },
];

module.exports = CAVE_BUILDINGS;
