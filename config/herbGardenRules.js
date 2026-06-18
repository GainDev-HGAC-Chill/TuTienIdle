// ============================================
// CONFIG - HERB GARDEN RULES
// Quy tắc Dược Viên
// ============================================

const HERB_GARDEN_RULES = {
    basePlots: 3,
    plotEveryGardenLevel: 5,
    maxPlots: 60,

    // Nếu chưa có herbs.js đầy đủ thì dùng danh sách hạt giống test này.
    seedItems: {
        huyet_linh_thao_seed: {
            herbId: 'huyet_linh_thao',
            name: 'Hạt Huyết Linh Thảo',
        },
        tu_duong_hoa_seed: {
            herbId: 'tu_duong_hoa',
            name: 'Hạt Tử Dương Hoa',
        },
        bang_tam_lien_seed: {
            herbId: 'bang_tam_lien',
            name: 'Hạt Băng Tâm Liên',
        },
    },
};

module.exports = HERB_GARDEN_RULES;
