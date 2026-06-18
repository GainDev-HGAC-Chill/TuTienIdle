// ============================================
//  CONFIG - MARTIAL SKILLS
//  Vũ kỹ: có thể thăng cấp theo cảnh giới
// ============================================

const phases = require('./progressionPhases');

const MARTIAL_SKILL_CONFIG = {
    id: 'martial_skill',
    name: 'Vũ Kỹ',
    phases,

    upgradeMode: {
        FOLLOW_REALM: 'follow_realm',
        FIXED_MAX_RANK: 'fixed_max_rank',
    },

    list: [
        {
            id: 'co_ban_kiem_quyet',
            name: 'Cơ Bản Kiếm Quyết',
            grade: 'basic',
            type: 'attack',
            maxRankMode: 'follow_realm',
            startRank: 1,
            startPhase: 1,
            effects: {
                // Chưa chốt chỉ số, để trống để sau này bạn điền.
                atkBonus: 0,
                damageBonus: 0,
            },
            description: 'Vũ kỹ nhập môn, dùng làm mặc định khi tạo nhân vật.',
        },
    ],
};

module.exports = MARTIAL_SKILL_CONFIG;
