// ============================================
// CONFIG - SKILL RULES
// Quy tắc học/trang bị công pháp, vũ kỹ, thần thông
// ============================================

const SKILL_RULES = {
    types: {
        CULTIVATION: 'cultivation', // Luyện công / công pháp bị động
        MARTIAL: 'martial',         // Vũ kỹ chủ động
        DIVINE: 'divine',           // Thần thông / ultimate
    },

    equipMode: {
        PASSIVE: 'passive',
        ACTIVE: 'active',
        ULTIMATE: 'ultimate',
    },

    slots: {
        cultivation: Infinity, // Công pháp học không giới hạn
        martial: 5,            // Vũ kỹ trang bị 5 ô
        divine: 2,             // Thần thông trang bị 2 ô
    },

    learnRequirement: {
        requireSpiritRoot: true, // Bắt buộc có linh căn cùng hệ mới học được
    },
};

module.exports = SKILL_RULES;
