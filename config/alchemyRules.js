// ============================================
//  CONFIG - ALCHEMY RULES
//  Quy tắc luyện đan
// ============================================

const ALCHEMY_RULES = {
    qualities: [
        {
            id: 'thuong',
            name: 'Thường',
            effectMultiplier: 0.5,
            description: 'Đan thành miễn cưỡng, chỉ đạt 50% tác dụng gốc.',
        },
        {
            id: 'tot',
            name: 'Tốt',
            effectMultiplier: 1,
            description: 'Đan thành ổn định, đạt 100% tác dụng gốc.',
        },
        {
            id: 'cuc_pham',
            name: 'Cực Phẩm',
            effectMultiplier: 2,
            description: 'Đan thành hoàn mỹ, đạt 200% tác dụng gốc.',
        },
    ],

    // Tỷ lệ mặc định nếu luyện đan vừa tầm cảnh giới/luyện đan cấp tương ứng.
    baseQualityRate: {
        thuong: 0.55,
        tot: 0.35,
        cuc_pham: 0.10,
    },

    // Tỷ lệ thành công cơ bản theo loại đan.
    categorySuccessRate: {
        cultivation: 0.72,
        breakthrough: 0.55,
        offensive: 0.78,
        defensive: 0.76,
        attribute: 0.68,
        special: 0.35,
    },

    // Chênh lệch bậc luyện đan ảnh hưởng tỷ lệ.
    // levelDiff = alchemyRank - recipe.requiredAlchemyRank
    successBonusPerRank: 0.06,
    successPenaltyPerRank: 0.10,

    minSuccessRate: 0.05,
    maxSuccessRate: 0.95,

    // Khi thất bại vẫn có thể giữ lại một phần nguyên liệu sau này.
    failReturnMaterialRate: 0,
};

module.exports = ALCHEMY_RULES;
